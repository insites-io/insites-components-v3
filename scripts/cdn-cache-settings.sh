#!/usr/bin/env bash
# One-off CloudFront change for components.insites.io (TW#26896897). Dry run by default; --apply to change it.
#
#   scripts/cdn-cache-settings.sh            # print the config diff, change nothing
#   scripts/cdn-cache-settings.sh --apply    # apply it, wait for the deploy, verify the edge
#
# Two changes, both so a failed component download can recover inside the page:
#   1. A /v3/* cache behaviour, cloned from the default one, that puts the query string in the cache key.
#      The bundle retries a failed chunk at <chunk>.entry.js?retry=<n>; today CloudFront ignores the query
#      string, so the retry gets the same edge copy that just failed. The default behaviour (v2, dist/,
#      tools/, used by Combinate and older client websites) is left alone: some of its objects carry no
#      Cache-Control and lean on the default TTL.
#   2. Error responses (403, 404, 500, 502, 503, 504) are not cached at the edge (ErrorCachingMinTTL 0), so
#      one bad origin response is not replayed to every viewer for the default 10 seconds.
#
# Re-running after --apply is a no-op. Requires jq and: aws sso login --profile insites
set -euo pipefail

PROFILE=insites
DIST_ID=E35G635O6GR2HY
PATTERN="/v3/*"
POLICY_NAME="components-v3-query-string-key"
ERROR_CODES=(403 404 500 502 503 504)
APPLY=false
[[ "${1:-}" == "--apply" ]] && APPLY=true

WORK=$(mktemp -d); trap 'rm -rf "$WORK"' EXIT
aws cloudfront get-distribution-config --id "$DIST_ID" --profile "$PROFILE" > "$WORK/current.json"
ETAG=$(jq -r .ETag "$WORK/current.json")
jq .DistributionConfig "$WORK/current.json" > "$WORK/before.json"

if jq -e --arg p "$PATTERN" '(.CacheBehaviors.Items // []) | any(.PathPattern == $p)' "$WORK/before.json" >/dev/null; then
  echo "a $PATTERN behaviour already exists; only the error caching is checked"
  BEHAVIOUR_EXISTS=true
else
  BEHAVIOUR_EXISTS=false
fi

DEFAULT_POLICY=$(jq -r '.DefaultCacheBehavior.CachePolicyId // ""' "$WORK/before.json")
NEW_POLICY_ID="<created on --apply>"
if [[ "$BEHAVIOUR_EXISTS" == false && -n "$DEFAULT_POLICY" ]]; then
  # The default behaviour uses a cache policy: clone it with every query string in the key.
  aws cloudfront get-cache-policy --id "$DEFAULT_POLICY" --profile "$PROFILE" \
    | jq --arg n "$POLICY_NAME" '.CachePolicy.CachePolicyConfig
        | .Name = $n
        | .Comment = "components.insites.io /v3/*: default key plus query strings (TW#26896897)"
        | .ParametersInCacheKeyAndForwardedToOrigin.QueryStringsConfig = {QueryStringBehavior: "all"}' \
    > "$WORK/policy.json"
  echo "== default behaviour cache policy $DEFAULT_POLICY, cloned as $POLICY_NAME with query strings in the key =="
  jq -c '.ParametersInCacheKeyAndForwardedToOrigin' "$WORK/policy.json"
  if [[ "$APPLY" == true ]]; then
    EXISTING=$(aws cloudfront list-cache-policies --type custom --profile "$PROFILE" \
      | jq -r --arg n "$POLICY_NAME" '.CachePolicyList.Items[]? | select(.CachePolicy.CachePolicyConfig.Name == $n) | .CachePolicy.Id')
    NEW_POLICY_ID=${EXISTING:-$(aws cloudfront create-cache-policy --cache-policy-config "file://$WORK/policy.json" \
      --profile "$PROFILE" --query 'CachePolicy.Id' --output text)}
    echo "cache policy $NEW_POLICY_ID"
  fi
fi

jq --arg p "$PATTERN" --arg pid "$NEW_POLICY_ID" --argjson exists "$BEHAVIOUR_EXISTS" \
   --argjson codes "$(printf '%s\n' "${ERROR_CODES[@]}" | jq -s .)" '
  (if $exists then . else
    (.DefaultCacheBehavior + {PathPattern: $p}
      | if (.CachePolicyId // "") != "" then .CachePolicyId = $pid
        else .ForwardedValues.QueryString = true
           | .ForwardedValues.QueryStringCacheKeys = {Quantity: 0} end) as $b
    # Appended, not prepended: CloudFront takes the first matching pattern, so any narrower behaviour that
    # already exists keeps applying. Read the dry-run diff for a broader pattern listed earlier.
    | .CacheBehaviors.Items = ((.CacheBehaviors.Items // []) + [$b])
    | .CacheBehaviors.Quantity = (.CacheBehaviors.Items | length)
  end)
  | ((.CustomErrorResponses.Items // []) | map({key: (.ErrorCode | tostring), value: .}) | from_entries) as $have
  | .CustomErrorResponses.Items = ([$codes[] | tostring] + ($have | keys) | unique
      | map(($have[.] // {ErrorCode: (. | tonumber), ResponsePagePath: "", ResponseCode: ""}) + (if (. | tonumber) as $c | $codes | index($c) then {ErrorCachingMinTTL: 0} else {} end)))
  | .CustomErrorResponses.Quantity = (.CustomErrorResponses.Items | length)
' "$WORK/before.json" > "$WORK/after.json"

echo "== distribution config diff =="
if diff <(jq -S . "$WORK/before.json") <(jq -S . "$WORK/after.json"); then
  echo "no change needed"; exit 0
fi

if [[ "$APPLY" != true ]]; then
  echo "dry run: nothing changed. Re-run with --apply."; exit 0
fi

aws cloudfront update-distribution --id "$DIST_ID" --if-match "$ETAG" \
  --distribution-config "file://$WORK/after.json" --profile "$PROFILE" --query 'Distribution.Status' --output text
echo "waiting for the distribution to deploy (several minutes)..."
aws cloudfront wait distribution-deployed --id "$DIST_ID" --profile "$PROFILE"

echo "== verify: the plain URL hits the edge and a new query string misses it =="
CHUNK=$(curl -s https://components.insites.io/v3/latest/insites.esm.js | grep -o 'p-[0-9a-f]*\.js' | head -1 || true)
[[ -n "$CHUNK" ]] || { echo "could not find a chunk name in v3/latest/insites.esm.js"; exit 1; }
xcache() { curl -s -o /dev/null -D - "$1" | tr -d '\r' | grep -i '^x-cache' || echo "x-cache: (none)"; }
BASE="https://components.insites.io/v3/latest/$CHUNK"
xcache "$BASE" >/dev/null
PLAIN=$(xcache "$BASE")
FRESH=$(xcache "$BASE?retry=verify$RANDOM$RANDOM")
echo "plain: $PLAIN"; echo "fresh query: $FRESH"
[[ "$PLAIN" == *Hit* ]] || { echo "the plain URL did not hit the edge twice in a row; cannot judge the cache key, check by hand"; exit 1; }
[[ "$FRESH" == *Miss* ]] && echo "query string is in the /v3/* cache key" || { echo "a new query string hit the edge: the query string is not in the cache key"; exit 1; }
