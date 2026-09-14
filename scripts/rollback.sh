#!/usr/bin/env bash
# Roll the `v3/latest` alias back (or forward) to a pinned version.
#
#   scripts/rollback.sh 3.0.0
#
# Re-syncs s3://insites-style-guide/v3/<version>/ onto v3/latest/ (deleting files the pinned version does
# not have), bumps dist/version-cache.txt so every instance's browsers fetch the loader again, invalidates,
# and verifies the edge serves the pinned build. Pinned folders are never touched.
#
# Every instance on the v6 shell loads v3/latest, so this changes what every instance runs within minutes.
# Requires: aws sso login --profile insites
set -euo pipefail

VERSION="${1:-}"
[[ "$VERSION" =~ ^3\.[0-9]+\.[0-9]+$ ]] || { echo "usage: scripts/rollback.sh <3.x.y>"; exit 2; }

PROFILE=insites
BUCKET=insites-style-guide
DIST_ID=E35G635O6GR2HY

aws s3 ls "s3://$BUCKET/v3/$VERSION/insites.esm.js" --profile "$PROFILE" >/dev/null 2>&1 || { echo "v3/$VERSION is not published"; exit 1; }

echo "== identity =="; aws sts get-caller-identity --profile "$PROFILE" --output text
echo "== v3/latest <- v3/$VERSION =="
aws s3 sync "s3://$BUCKET/v3/$VERSION/" "s3://$BUCKET/v3/latest/" --profile "$PROFILE" --delete \
  --cache-control "public, max-age=300" --only-show-errors

echo "== cache-buster stamp =="
STAMP=$(date +%s)
printf '%s' "$STAMP" > /tmp/version-cache.txt
aws s3 cp /tmp/version-cache.txt "s3://$BUCKET/dist/version-cache.txt" --profile "$PROFILE" \
  --content-type text/plain --cache-control "no-cache" --only-show-errors

echo "== invalidate =="
INV=$(aws cloudfront create-invalidation --distribution-id "$DIST_ID" --profile "$PROFILE" \
  --paths "/v3/latest/*" "/dist/version-cache.txt" --query 'Invalidation.Id' --output text)
aws cloudfront wait invalidation-completed --distribution-id "$DIST_ID" --id "$INV" --profile "$PROFILE"

echo "== verify edge =="
PIN_SHA=$(curl -s "https://components.insites.io/v3/$VERSION/insites.esm.js?x=$STAMP" | shasum -a 256 | cut -d' ' -f1)
LATEST_SHA=$(curl -s "https://components.insites.io/v3/latest/insites.esm.js?x=$STAMP" | shasum -a 256 | cut -d' ' -f1)
[[ "$PIN_SHA" == "$LATEST_SHA" ]] && echo "v3/latest now serves v3/$VERSION (stamp $STAMP)" || { echo "edge mismatch: latest $LATEST_SHA vs pinned $PIN_SHA"; exit 1; }
