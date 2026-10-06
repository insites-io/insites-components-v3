#!/usr/bin/env bash
# Publish the built bundle to the admin CDN as a PINNED version only (TW#26796432, audit P1 item 1).
#
#   scripts/publish.sh 3.4.0          # pinned: s3://insites-style-guide/v3/3.4.0/, immutable
#   scripts/promote.sh 3.4.0          # later, once tested: move the v3/latest alias to it
#
# Until 23 Sep 2026 this script wrote the pinned folder AND v3/latest in one go, so a bundle reached every
# instance the moment it was tested nowhere. Now a publish is invisible until promoted. Test the pinned
# build on staging first with ?insites_component_version=v3/<version> on any admin URL; modules that pin
# the bundle with SRI (insites_core insites_admin/insites_components.liquid) pick a new version up only
# when their pin and hashes are bumped, and v3/latest is a rollback alias for instances not yet pinned.
#
# What it does, in order:
#   1. refuses to run unless the build is fresh (components/www/build/insites.esm.js exists) and the
#      version matches components/package.json;
#   2. syncs the build, the CSS and the icon font to s3://insites-style-guide/v3/<version>/ (never re-published);
#   3. verifies the edge serves the pinned build and prints the four SRI hashes the module pins need.
#
# Never publish to v2/*: that line is frozen for Combinate and old client websites and takes backports in
# insites-components-v2 only.
#
# Requires: aws sso login --profile insites  (Styleguide account 959727866136)
set -euo pipefail

VERSION="${1:-}"
[[ "$VERSION" =~ ^3\.[0-9]+\.[0-9]+$ ]] || { echo "usage: scripts/publish.sh <3.x.y>"; exit 2; }

PROFILE=insites
BUCKET=insites-style-guide
DIST_ID=E35G635O6GR2HY
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$ROOT/components/www/build"
CSS="$ROOT/components/www/assets/insites/css"
# The icon font. css/insites-font-icons.css resolves ../fonts/icons/insites-font-icon.{eot,ttf,woff,svg}
# from the same prefix, so a publish that ships the CSS without fonts/ renders every icon glyph as a box
# (found 11 Sep 2026: v3/3.0.0, v3/3.1.0 and v3/latest had no fonts/ at all — TW#26711229).
FONTS="$ROOT/components/www/assets/insites/fonts"
[[ -f "$FONTS/icons/insites-font-icon.woff" ]] || { echo "no icon font at $FONTS/icons — the CSS would 404 its glyphs"; exit 1; }
PKG_VERSION=$(node -e "process.stdout.write(require('$ROOT/components/package.json').version)")

[[ -f "$BUILD/insites.esm.js" ]] || { echo "no build at $BUILD — run npm run build in components/ first"; exit 1; }
[[ "$PKG_VERSION" == "$VERSION" ]] || { echo "components/package.json says $PKG_VERSION, not $VERSION — bump it first"; exit 1; }
if aws s3 ls "s3://$BUCKET/v3/$VERSION/insites.esm.js" --profile "$PROFILE" >/dev/null 2>&1; then
  echo "v3/$VERSION is already published; pinned versions are immutable. Bump the version."; exit 1
fi

echo "== identity =="; aws sts get-caller-identity --profile "$PROFILE" --output text

sync_to() {
  local prefix="$1"
  aws s3 sync "$BUILD/" "s3://$BUCKET/$prefix/" --profile "$PROFILE" --exclude "*.map" --exclude "*.log" \
    --cache-control "public, max-age=300" --only-show-errors
  aws s3 sync "$CSS/" "s3://$BUCKET/$prefix/css/" --profile "$PROFILE" --exclude "*.log" \
    --cache-control "public, max-age=300" --only-show-errors
  aws s3 sync "$FONTS/" "s3://$BUCKET/$prefix/fonts/" --profile "$PROFILE" \
    --cache-control "public, max-age=31536000, immutable" --only-show-errors
}

echo "== pinned: v3/$VERSION =="; sync_to "v3/$VERSION"

echo "== invalidate the pinned prefix (first publish only, so a stale negative cache cannot mask it) =="
INV=$(aws cloudfront create-invalidation --distribution-id "$DIST_ID" --profile "$PROFILE" \
  --paths "/v3/$VERSION/*" --query 'Invalidation.Id' --output text)
echo "invalidation $INV; waiting..."
aws cloudfront wait invalidation-completed --distribution-id "$DIST_ID" --id "$INV" --profile "$PROFILE"

echo "== verify edge =="
LOCAL_SHA=$(shasum -a 256 "$BUILD/insites.esm.js" | cut -d' ' -f1)
EDGE_SHA=$(curl -s "https://components.insites.io/v3/$VERSION/insites.esm.js" | shasum -a 256 | cut -d' ' -f1)
[[ "$EDGE_SHA" == "$LOCAL_SHA" ]] && echo "v3/$VERSION/insites.esm.js matches the local build" || { echo "v3/$VERSION/insites.esm.js differs from the local build"; exit 1; }

echo "== SRI hashes for the module pins (insites_core insites_admin/insites_components.liquid and friends) =="
for f in insites.js insites.esm.js css/insites.css css/insites-font-icons.css; do
  printf '  %-28s sha384-%s\n' "$f" "$(curl -s "https://components.insites.io/v3/$VERSION/$f" | openssl dgst -sha384 -binary | openssl base64 -A)"
done
echo "published v3/$VERSION (pinned). v3/latest is unchanged: test with ?insites_component_version=v3/$VERSION, then scripts/promote.sh $VERSION"
