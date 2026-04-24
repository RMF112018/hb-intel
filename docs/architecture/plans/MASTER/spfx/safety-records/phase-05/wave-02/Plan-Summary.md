# Plan Summary — Wave 02

## Objective
Rebuild the Safety upload/review experience so it matches the backend’s actual preview, commit, and replay model.

## What this wave must achieve
1. Upload must become preview-first rather than direct-commit
2. preview diagnostics must be operator-usable and honest
3. terminal outcomes and review entries must preserve support value
4. async progress/error semantics must be accessible and truthful

## Dependency
This wave assumes Wave 01 has already delivered:
- a typed backend client,
- explicit production binding,
- preserved backend failure semantics.
