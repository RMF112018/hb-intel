#!/usr/bin/env bash
# Active Claude Code hook: block accidental mutation of the canonical docs plan library.
#
# Intended hook event: PreToolUse
# Recommended target path in repo: .claude/hooks/plan-library-guard.sh
#
# Why this exists:
# - docs/architecture/plans/** is the canonical repository plan library.
# - Claude working plans, scratch plans, and draft planning artifacts belong under .claude/plans/**.
# - Writes to the canonical plan library should happen only when explicitly authorized.
#
# Explicit override:
#   HB_ALLOW_CANONICAL_PLAN_LIBRARY_WRITE=1 <claude command>
#
# Exit codes:
#   0 = allow
#   2 = block tool call and surface stderr to Claude/user

set -euo pipefail

REPO_PLAN_PREFIX="docs/architecture/plans/"
ALLOW_ENV="${HB_ALLOW_CANONICAL_PLAN_LIBRARY_WRITE:-${ALLOW_CANONICAL_PLAN_LIBRARY_WRITE:-0}}"

STDIN_PAYLOAD=""
if ! [ -t 0 ]; then
  STDIN_PAYLOAD="$(cat || true)"
fi

ARG_PAYLOAD="$*"
PAYLOAD="${STDIN_PAYLOAD}
${ARG_PAYLOAD}"

if [[ "$PAYLOAD" != *"$REPO_PLAN_PREFIX"* ]]; then
  exit 0
fi

if [[ "$ALLOW_ENV" == "1" || "$ALLOW_ENV" == "true" || "$ALLOW_ENV" == "yes" ]]; then
  cat >&2 <<'MSG'
plan-library guard notice:
- Canonical docs plan-library path detected.
- Override environment variable is set, so this tool call is allowed.
MSG
  exit 0
fi

TOOL_NAME="$(printf '%s' "$STDIN_PAYLOAD" | python3 -c 'import json,sys
try:
    data=json.load(sys.stdin)
    print(data.get("tool_name") or data.get("tool") or "")
except Exception:
    print("")
' 2>/dev/null || true)"

case "$TOOL_NAME" in
  Read|Grep|Glob|LS|Task)
    exit 0
    ;;
esac

if [[ "$TOOL_NAME" == "Bash" || "$PAYLOAD" == *'"tool_name":"Bash"'* || "$PAYLOAD" == *'"tool_name": "Bash"'* ]]; then
  COMMAND_TEXT="$(printf '%s' "$STDIN_PAYLOAD" | python3 -c 'import json,sys
try:
    data=json.load(sys.stdin)
    ti=data.get("tool_input") or {}
    if isinstance(ti, dict):
        print(ti.get("command") or "")
    else:
        print("")
except Exception:
    print("")
' 2>/dev/null || true)"
  [[ -z "$COMMAND_TEXT" ]] && COMMAND_TEXT="$PAYLOAD"

  if printf '%s' "$COMMAND_TEXT" | grep -Eq "^[[:space:]]*(git diff|git status|git log|git show|grep|rg|find|ls|cat|sed -n|awk|wc|head|tail)\b"; then
    exit 0
  fi

  if printf '%s' "$COMMAND_TEXT" | grep -Eq "\b(touch|mkdir|rm|rmdir|mv|cp|tee|cat[[:space:]].*>|sed[[:space:]].*-i|perl[[:space:]].*-pi|python|python3|node|tsx|pnpm|npm|yarn|git[[:space:]]+add|git[[:space:]]+commit|git[[:space:]]+checkout|git[[:space:]]+restore|git[[:space:]]+reset)\b"; then
    cat >&2 <<MSG
Blocked by plan-library guard:
- A mutating Bash command references \`$REPO_PLAN_PREFIX**\`.
- Working plans belong under \`.claude/plans/**\` unless the user explicitly authorized a canonical docs-plan update.

To proceed only when explicitly authorized, rerun with:
  HB_ALLOW_CANONICAL_PLAN_LIBRARY_WRITE=1

Tool: Bash
MSG
    exit 2
  fi

  cat >&2 <<MSG
Blocked by plan-library guard:
- A Bash command references \`$REPO_PLAN_PREFIX**\`, but it was not recognized as read-only.
- This guard blocks conservatively.

To proceed only when explicitly authorized, rerun with:
  HB_ALLOW_CANONICAL_PLAN_LIBRARY_WRITE=1

Tool: Bash
MSG
  exit 2
fi

case "$TOOL_NAME" in
  Write|Edit|MultiEdit|NotebookEdit)
    cat >&2 <<MSG
Blocked by plan-library guard:
- Tool \`$TOOL_NAME\` targets or references \`$REPO_PLAN_PREFIX**\`.
- \`docs/architecture/plans/**\` is the canonical repository plan library.
- Claude working plans and draft planning artifacts must stay in \`.claude/plans/**\` unless the user explicitly requested a canonical docs-plan create/update.

To proceed only when explicitly authorized, rerun with:
  HB_ALLOW_CANONICAL_PLAN_LIBRARY_WRITE=1
MSG
    exit 2
    ;;
esac

cat >&2 <<MSG
Blocked by plan-library guard:
- Canonical docs plan-library path detected: \`$REPO_PLAN_PREFIX**\`.
- Tool could not be proven read-only: \`${TOOL_NAME:-unknown}\`.
- This guard blocks conservatively.

Authorized canonical writes require:
  HB_ALLOW_CANONICAL_PLAN_LIBRARY_WRITE=1
MSG
exit 2
