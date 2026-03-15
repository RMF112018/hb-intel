#!/usr/bin/env bash
# Example hook guard for keeping Claude working plans out of the canonical docs plan library.
# This script is intentionally conservative and should be adapted to the exact Claude Code hook payload.

set -euo pipefail

PAYLOAD="${1:-}"

# Fast exit when no docs plan path is involved.
if [[ "$PAYLOAD" != *"docs/architecture/plans/"* ]]; then
  exit 0
fi

cat <<'MSG' >&2
Blocked by plan-library guard:
- `docs/architecture/plans/**` is the canonical repository plan library.
- Claude working plans and draft planning artifacts should stay in `.claude/plans/**` unless the user explicitly requested a canonical docs-plan create/update.
- Re-run only when the task explicitly calls for a canonical plan file in the docs library.
MSG

exit 2
