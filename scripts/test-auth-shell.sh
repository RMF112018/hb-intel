#!/usr/bin/env bash
# scripts/test-auth-shell.sh
# D-PH5C-05: Fallback test script for @hbc/auth and @hbc/shell
# Version: 1.0
# Last Updated: 2026-03-07
# Usage: bash scripts/test-auth-shell.sh [--coverage]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INCLUDE_COVERAGE=false

if [[ "$1" == "--coverage" ]]; then
  INCLUDE_COVERAGE=true
fi

echo "=========================================="
echo "HB Intel Auth & Shell Test Suite"
echo "Fallback Script v1.0"
echo "=========================================="
echo ""

# Test @hbc/auth
echo "Testing @hbc/auth package..."
cd "$PROJECT_ROOT"
if [[ "$INCLUDE_COVERAGE" == "true" ]]; then
  pnpm --filter @hbc/auth run test:coverage || {
    echo "ERROR: @hbc/auth tests failed"
    exit 1
  }
else
  pnpm --filter @hbc/auth run test || {
    echo "ERROR: @hbc/auth tests failed"
    exit 1
  }
fi
echo "@hbc/auth tests passed ✓"
echo ""

# Test @hbc/shell
echo "Testing @hbc/shell package..."
cd "$PROJECT_ROOT"
if [[ "$INCLUDE_COVERAGE" == "true" ]]; then
  pnpm --filter @hbc/shell run test:coverage || {
    echo "ERROR: @hbc/shell tests failed"
    exit 1
  }
else
  pnpm --filter @hbc/shell run test || {
    echo "ERROR: @hbc/shell tests failed"
    exit 1
  }
fi
echo "@hbc/shell tests passed ✓"
echo ""

echo "=========================================="
echo "All tests passed successfully!"
echo "=========================================="
exit 0
