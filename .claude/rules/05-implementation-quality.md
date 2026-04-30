# 05 — Implementation Quality

## Primary Rule

Make the smallest correct change that satisfies the approved scope.

## Implementation Discipline

- Inspect touched area first.
- Preserve public contracts unless breakage is explicitly authorized.
- Preserve package/runtime boundaries.
- Avoid unrelated formatting churn.
- Avoid adjacent cleanup unless explicitly authorized.
- Preserve loading, error, empty, preview, fallback, and unauthorized states when applicable.
- Add or update tests when behavior changes.
- Update docs only when behavior, ownership, commands, boundaries, or public expectations change.

## Incomplete Work

Do not leave unapproved placeholders, “not implemented” throws, or scaffold-only behavior unless the repo’s stub approval convention is used and the governing prompt permits it.
