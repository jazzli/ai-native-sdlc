#!/bin/sh
# Post-deploy verification against the live site.
#
# The build tests assert over site/dist. Nothing asserted over what GitHub
# Pages actually serves, so every property that only exists after publication
# — base-path resolution, the redirect stubs, agreement between the manifest
# and the two artifacts generated beside it — was verified by hand or not at
# all. Adopters fetch these URLs on a schedule; a broken one is their problem
# before it is ours.
#
# Publication cannot be gated: deploy-pages publishes, then this runs. So this
# is detection, not prevention. It fails loudly and the run goes red.
#
# Usage: scripts/verify-deploy.sh [base-url]
set -eu
BASE=${1:-${BASE:-https://jazzli.github.io/ai-native-sdlc}}
fail=0
note() { printf '  %-58s %s\n' "$1" "$2"; }
bad() { note "$1" "FAIL — $2"; fail=1; }

# Pages serves the new commit a moment after deploy-pages returns.
i=0
while [ $i -lt 10 ]; do
  curl -fsS "$BASE/positions.json" >/dev/null 2>&1 && break
  i=$((i + 1)); sleep 6
done

json=$(curl -fsS "$BASE/positions.json") || { echo "positions.json unreachable"; exit 1; }
digest=$(curl -fsS "$BASE/positions.digest.txt" | tr -d '\n\r ')
alias_digest=$(curl -fsS "$BASE/positions.digest" | tr -d '\n\r ')
# Pages types by extension with no override available, so the content type is
# a property of publication that no build test can see. The drift check reads
# this with curl and is indifferent, but a browser downloads octet-stream
# rather than showing it and some clients refuse it outright.
ctype=$(curl -s -o /dev/null -w '%{content_type}' "$BASE/positions.digest.txt")
lock=$(curl -fsS "$BASE/starter/sdlc-upstream.json")

manifest_digest=$(printf '%s' "$json" | python3 -c 'import json,sys;print(json.load(sys.stdin)["digest"])')
lock_digest=$(printf '%s' "$lock" | python3 -c 'import json,sys;print(json.load(sys.stdin)["digest"])')

# The drift check every adopter runs compares these two strings. If they ever
# disagree, every downstream check reports drift that did not happen.
[ "$digest" = "$manifest_digest" ] \
  && note "positions.digest.txt == manifest digest" "ok ($digest)" \
  || bad "positions.digest.txt == manifest digest" "$digest vs $manifest_digest"

# The retained alias must never drift from the canonical endpoint: adopters
# who wired the original URL compare against the same string.
[ "$alias_digest" = "$digest" ] \
  && note "positions.digest alias agrees" "ok" \
  || bad "positions.digest alias agrees" "$alias_digest vs $digest"

case "$ctype" in
  text/plain*) note "positions.digest.txt content type" "ok ($ctype)" ;;
  *) bad "positions.digest.txt content type" "$ctype, expected text/plain" ;;
esac

# A starter downloaded today must not report drift the moment it is wired up.
[ "$lock_digest" = "$manifest_digest" ] \
  && note "starter lockfile == manifest digest" "ok" \
  || bad "starter lockfile == manifest digest" "$lock_digest vs $manifest_digest"

for p in / /adopt/ /protocol/ /sources/ /changelog/ /llms.txt /playbook.md \
         /starter/sdlc-policy.md /check-policy.mjs /capabilities.md \
         /capabilities.json /changelog.xml; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$p")
  [ "$code" = 200 ] && note "GET $p" "200" || bad "GET $p" "$code"
done

# Every published position and question, at the URL the manifest advertises,
# plus its markdown. An adopter maps by id and reads `url`; both must resolve.
#
# The manifest carries absolute production URLs, so they are re-anchored on
# $BASE via its own `site` field. Without that this loop checks production
# whatever base it was given — which is right in CI and silently wrong
# everywhere else, and cannot be tested at all.
paths=$(printf '%s' "$json" | python3 -c '
import json,sys
m=json.load(sys.stdin)
root=m["site"].rstrip("/")
for p in m["positions"]:
    for k in ("url","markdown"):
        print(p[k][len(root):] if p[k].startswith(root) else p[k])
')
missing=0
for u in $paths; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$u")
  [ "$code" = 200 ] || { bad "GET $u" "$code"; missing=$((missing + 1)); }
done
[ "$missing" = 0 ] && note "every manifest url and markdown resolves" "ok ($(echo "$paths" | wc -w | tr -d ' ') checked)"

# A status change moves a note between sections; the vacated URL must redirect
# rather than 404. Check one in each direction.
for pair in "questions/does-sdd-reduce-rework:positions" \
            "positions/agent-era-observability:questions"; do
  stale=${pair%%:*}; want=${pair##*:}
  body=$(curl -fsS "$BASE/$stale/" 2>/dev/null || true)
  echo "$body" | grep -q 'http-equiv="refresh"' && echo "$body" | grep -q "/$want/" \
    && note "stale /$stale/ redirects" "ok" \
    || bad "stale /$stale/ redirects" "no refresh to /$want/"
done

# Adopters fetch the checker and run it. A truncated or half-deployed copy
# would fail at their end, not ours, so confirm it is whole enough to parse.
checker=$(curl -fsS "$BASE/check-policy.mjs" 2>/dev/null || true)
if printf '%s' "$checker" | grep -q 'export function checkPolicy'; then
  note "check-policy.mjs is complete" "ok"
else
  bad "check-policy.mjs is complete" "missing its entry point"
fi

[ "$fail" = 0 ] && echo "deploy verified" || echo "deploy verification FAILED"
exit $fail
