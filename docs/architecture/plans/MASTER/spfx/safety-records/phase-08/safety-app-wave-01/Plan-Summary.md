# Plan Summary — Wave 01

## Objective

Make the Safety app truthfully bound to the current backend, role-aware, aligned with the backend/parser contract, and supportable for controlled production use.

## Critical path

1. Lock route/auth contract authority into frontend UI and tests.
2. Harden runtime config/deploy binding so hosted app cannot silently point to the wrong backend or API audience.
3. Align upload validation and parser-authority copy to backend rules.
4. Add production support telemetry and close collapsed state/error gaps.
