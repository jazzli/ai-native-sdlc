#!/usr/bin/env bash
# The weekly falsifier watch, as the Ordomata agent host runs it.
#
# One command, so the host's timer is one line and what the watch does is
# reviewed here, in git, rather than typed into a unit file. It follows the
# host's own rule -- one task, one branch, one worktree, one process -- by
# delegating to agent-run rather than invoking claude itself, and it passes
# the host's Ordomata coding-worker gate the way any other Claude launch
# there must: host/gate.py builds the Run Card and review for this exact
# launch, and agent-run re-validates them before it creates anything.
#
# The watch never writes to the repository, so its worktree and branch exist
# only to satisfy that rule. Both are removed afterwards; the run's record is
# the issue it filed and the journal of the unit that ran it.
set -euo pipefail

REPO="${WATCH_REPO:-$HOME/src/ai-native-sdlc}"
ORDOMATA_SRC="${ORDOMATA_SRC:-$HOME/src/ordomata}"
ART="${WATCH_ARTIFACTS:-$HOME/.local/state/ai-native-sdlc-watch}/$(date -u +%F)"
SLUG="falsifier-watch-$(date -u +%F)"
PROMPT="$REPO/watch/falsifier-watch.prompt.md"
CONTEXT="$REPO/watch/routine.md"

git -C "$REPO" pull -q --ff-only

cleanup() {
  agent-run clean "$SLUG" >/dev/null 2>&1 || true
  git -C "$REPO" branch -D "task/$SLUG" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Capacity, classification, Run Card, review -- outside the checkout, which
# must stay clean. The card decides the model and effort; agent-run requires
# both and compares them literally against the card.
eval "$(python3 "$REPO/watch/host/gate.py" "$ORDOMATA_SRC" "$ART" "$REPO" "$SLUG" "$PROMPT" "$CONTEXT")"

# --fg keeps the run inside this unit, so the timer's service is what systemd
# tracks and journals. Autonomy comes from the card ("full": a headless run
# cannot answer permission prompts, and the watch needs Bash for gh and
# WebFetch for primaries). The prompt forbids writes; the branch is
# disposable; main is protected. That is the bound, stated in watch/routine.md.
ORDOMATA_ALLOW_SUBSCRIPTION_RUNS=1 \
ORDOMATA_SRC="$ORDOMATA_SRC" \
ORDOMATA_ROOT="$ORDOMATA_SRC" \
ORDOMATA_RUN_CARD="$ART/run-card.json" \
ORDOMATA_REVIEW="$ART/review.json" \
ORDOMATA_CAPACITY_EVIDENCE="$ART/capacity.json" \
ORDOMATA_TASK_PROMPT="$PROMPT" \
ORDOMATA_TASK_CONTEXT="$CONTEXT" \
agent-run claude "$SLUG" --repo "$REPO" --autonomy "$AUTONOMY" \
  --model "$MODEL" --effort "$EFFORT" --fg "$(cat "$PROMPT")"
