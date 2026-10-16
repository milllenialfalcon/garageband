#!/usr/bin/env bash
# Merge a reviewed ticket PR into its sprint branch. The only way agents merge.
#   bash sprint/scripts/gb-merge.sh <pr-number> [--repo owner/name]
#
# Refuses unless: the PR's base branch is sprint/*, its checks are green, it has a
# review verdict comment "VERDICT: APPROVE" posted by a reviewer task, and the head
# branch is a ticket branch (t/...). Squash-merges and deletes the ticket branch.
set -euo pipefail
pr="${1:?usage: gb-merge.sh <pr-number> [--repo owner/name]}"; shift || true
repo_args=()
if [ "${1:-}" = "--repo" ]; then repo_args=(--repo "${2:?}"); fi

info="$(gh pr view "$pr" "${repo_args[@]}" --json baseRefName,headRefName,state,isDraft,mergeable,title,comments,url)"
base="$(jq -r .baseRefName <<<"$info")"; head="$(jq -r .headRefName <<<"$info")"
state="$(jq -r .state <<<"$info")"; url="$(jq -r .url <<<"$info")"

fail() { echo "gb-merge: refused for $url: $1" >&2; exit 1; }
[ "$state" = "OPEN" ] || fail "PR is $state"
[[ "$base" == sprint/* ]] || fail "base is '$base'. Agents only merge into sprint/* branches; main is the founder's."
[[ "$head" == t/* ]] || fail "head '$head' is not a ticket branch (t/...)"
[ "$(jq -r .isDraft <<<"$info")" = "false" ] || gh pr ready "$pr" "${repo_args[@]}" >/dev/null
# The most recent verdict comment must be APPROVE (a later REQUEST CHANGES wins over an earlier approval).
last="$(jq -r '[.comments[].body | capture("(?m)^VERDICT: (?<v>APPROVE|REQUEST CHANGES)") | .v] | last // "none"' <<<"$info")"
[ "$last" = "APPROVE" ] || fail "latest review verdict is '$last', not APPROVE"

# Checks: every required/visible check must have passed (no pending, no failures).
if ! checks="$(gh pr checks "$pr" "${repo_args[@]}" --json name,bucket 2>/dev/null)"; then
  fail "could not read checks (no CI on this repo yet?)"
fi
[ "$(jq 'length' <<<"$checks")" -gt 0 ] || fail "no CI checks ran"
bad="$(jq -r '[.[] | select(.bucket != "pass" and .bucket != "skipping")] | map(.name + "=" + .bucket) | join(", ")' <<<"$checks")"
[ -z "$bad" ] || fail "checks not green: $bad"

gh pr merge "$pr" "${repo_args[@]}" --squash --delete-branch
echo "gb-merge: merged $url into $base"
