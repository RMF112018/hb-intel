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
# Important behavior:
# - Write/Edit/MultiEdit/NotebookEdit are blocked only when their actual target path is
#   docs/architecture/plans/**.
# - A scratch plan under .claude/plans/** may mention docs/architecture/plans/** in its
#   content without being blocked.
# - Bash commands are still evaluated conservatively because arbitrary shell syntax does
#   not expose a reliable structured target path.
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

if [[ "$ALLOW_ENV" == "1" || "$ALLOW_ENV" == "true" || "$ALLOW_ENV" == "yes" ]]; then
  # Only print the override notice if the canonical path is actually involved.
  if [[ "$PAYLOAD" == *"$REPO_PLAN_PREFIX"* ]]; then
    cat >&2 <<'MSG'
plan-library guard notice:
- Canonical docs plan-library path detected.
- Override environment variable is set, so this tool call is allowed.
MSG
  fi
  exit 0
fi

TOOL_NAME="$(printf '%s' "$STDIN_PAYLOAD" | python3 -c 'import json,sys
try:
    data=json.load(sys.stdin)
    print(data.get("tool_name") or data.get("tool") or "")
except Exception:
    print("")
' 2>/dev/null || true)"

# Extract structured target paths from Claude Code tool payloads.
# This intentionally does not inspect Write.content / Edit.new_string / MultiEdit.edits text.
TARGET_PATHS="$(printf '%s' "$STDIN_PAYLOAD" | python3 -c 'import json,sys
try:
    data=json.load(sys.stdin)
except Exception:
    sys.exit(0)

tool_input = data.get("tool_input") or data.get("input") or {}
if not isinstance(tool_input, dict):
    sys.exit(0)

paths = []

def add(value):
    if isinstance(value, str) and value.strip():
        paths.append(value.strip())

# Common Claude Code file target fields.
for key in ("file_path", "path", "notebook_path"):
    add(tool_input.get(key))

# Some tools may use plural or nested target fields.
targets = tool_input.get("target_paths") or tool_input.get("paths")
if isinstance(targets, list):
    for item in targets:
        add(item)

for path in paths:
    print(path)
' 2>/dev/null || true)"

canonical_target_detected() {
  local path_value normalized
  while IFS= read -r path_value; do
    [[ -z "$path_value" ]] && continue

    # Normalize common absolute/repo-relative forms enough for prefix comparison.
    normalized="${path_value#./}"
    normalized="${normalized#/}"
    if [[ "$normalized" == *"/$REPO_PLAN_PREFIX"* || "$normalized" == "$REPO_PLAN_PREFIX"* ]]; then
      return 0
    fi
  done <<< "$TARGET_PATHS"

  return 1
}

case "$TOOL_NAME" in
  Read|Grep|Glob|LS|Task)
    exit 0
    ;;
esac

case "$TOOL_NAME" in
  Write|Edit|MultiEdit|NotebookEdit)
    if canonical_target_detected; then
      cat >&2 <<MSG
Blocked by plan-library guard:
- Tool \`$TOOL_NAME\` targets \`$REPO_PLAN_PREFIX**\`.
- \`docs/architecture/plans/**\` is the canonical repository plan library.
- Claude working plans and draft planning artifacts must stay in \`.claude/plans/**\` unless the user explicitly requested a canonical docs-plan create/update.

To proceed only when explicitly authorized, rerun with:
  HB_ALLOW_CANONICAL_PLAN_LIBRARY_WRITE=1
MSG
      exit 2
    fi

    # If the write target is not canonical, allow it even when the file content mentions
    # docs/architecture/plans/**. This prevents scratch plans from omitting useful path
    # references merely to satisfy the hook.
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

  if [[ "$COMMAND_TEXT" != *"$REPO_PLAN_PREFIX"* ]]; then
    exit 0
  fi

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
- This guard blocks conservatively because arbitrary shell commands do not expose a reliable structured write target.

To proceed only when explicitly authorized, rerun with:
  HB_ALLOW_CANONICAL_PLAN_LIBRARY_WRITE=1

Tool: Bash
MSG
  exit 2
fi

# Unknown tools are allowed unless they both mention the canonical plan library and
# expose no structured target path. This avoids blocking harmless tool calls while
# keeping a conservative posture for future mutating tools.
if [[ "$PAYLOAD" == *"$REPO_PLAN_PREFIX"* ]]; then
  cat >&2 <<MSG
Blocked by plan-library guard:
- Canonical docs plan-library path detected: \`$REPO_PLAN_PREFIX**\`.
- Tool could not be proven read-only or safely target-scoped: \`${TOOL_NAME:-unknown}\`.
- This guard blocks conservatively for unknown tools.

Authorized canonical writes require:
  HB_ALLOW_CANONICAL_PLAN_LIBRARY_WRITE=1
MSG
  exit 2
fi

exit 0
