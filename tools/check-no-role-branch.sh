#!/usr/bin/env bash
# G4-T06-002: Verify no hardcoded role === checks in app source files.
# Exits non-zero if any matches found (excluding test files and type definitions).
set -euo pipefail

matches=$(grep -r 'role ===' apps/estimating/src apps/accounting/src apps/admin/src apps/project-hub/src \
  --include='*.tsx' --include='*.ts' \
  | grep -v '\.test\.' \
  | grep -v 'types' \
  || true)

if [ -n "$matches" ]; then
  echo "ERROR: Found hardcoded role === checks:"
  echo "$matches"
  exit 1
fi

echo "OK: No hardcoded role === checks found."
exit 0
