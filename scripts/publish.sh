#!/usr/bin/env bash
# Publish the built bundle to the admin CDN as a pinned version AND as the `v3/latest` alias.
#
#   scripts/publish.sh 3.1.0
#
# What it does, in order:
#   1. refuses to run unless the build is fresh (components/www/build/insites.esm.js exists) and the
#      version matches components/package.json;
#   2. syncs the build and the CSS to  s3://insites-style-guide/v3/<version>/   (pinned, immutable: never re-published);
#   3. syncs the same files to          s3://insites-style-guide/v3/latest/     (the alias every instance loads);
#   4. writes a fresh epoch to dist/version-cache.txt, which the insites_core layouts append as ?updated= to
#      every bundle URL, so browsers stop serving the previous loader from cache;
#   5. invalidates /v3/latest/* and the stamp on CloudFront and waits;
#   6. verifies the edge serves the new stamp and the new CSS.
#
# Rollback is scripts/rollback.sh <version>: it re-syncs a pinned folder onto latest. Never publish to v2/*:
# that line is frozen for Combinate and old client websites and takes backports in insites-components-v2 only.
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
}

echo "== pinned: v3/$VERSION =="; sync_to "v3/$VERSION"
echo "== alias:  v3/latest =="; sync_to "v3/latest"

echo "== cache-buster stamp =="
STAMP=$(date +%s)
printf '%s' "$STAMP" > /tmp/version-cache.txt
aws s3 cp /tmp/version-cache.txt "s3://$BUCKET/dist/version-cache.txt" --profile "$PROFILE" \
  --content-type text/plain --cache-control "no-cache" --only-show-errors
echo "dist/version-cache.txt -> $STAMP"

echo "== invalidate =="
INV=$(aws cloudfront create-invalidation --distribution-id "$DIST_ID" --profile "$PROFILE" \
  --paths "/v3/latest/*" "/dist/version-cache.txt" --query 'Invalidation.Id' --output text)
echo "invalidation $INV; waiting..."
aws cloudfront wait invalidation-completed --distribution-id "$DIST_ID" --id "$INV" --profile "$PROFILE"

echo "== verify edge =="
EDGE_STAMP=$(curl -s "https://components.insites.io/dist/version-cache.txt")
[[ "$EDGE_STAMP" == "$STAMP" ]] && echo "stamp at edge: $EDGE_STAMP (ok)" || { echo "stamp at edge is $EDGE_STAMP, expected $STAMP"; exit 1; }
LOCAL_SHA=$(shasum -a 256 "$BUILD/insites.esm.js" | cut -d' ' -f1)
for p in "v3/$VERSION" "v3/latest"; do
  EDGE_SHA=$(curl -s "https://components.insites.io/$p/insites.esm.js?x=$STAMP" | shasum -a 256 | cut -d' ' -f1)
  [[ "$EDGE_SHA" == "$LOCAL_SHA" ]] && echo "$p/insites.esm.js matches the local build" || { echo "$p/insites.esm.js differs from the local build"; exit 1; }
done
echo "published v3/$VERSION and v3/latest. Now: cd module-v6-crm/pos && insites-cli deploy staging (only if the module changed too)"
