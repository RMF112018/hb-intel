# PCC Permission Redaction Resolution Algorithm

## Purpose

Define deterministic access, redaction, and refusal behavior for Project Memory, traceability, cross-project knowledge, warranty trace, and HBI.

## Algorithm

1. Resolve authenticated user.
2. Resolve project access.
3. Resolve source-system access.
4. Resolve persona.
5. Resolve requested lens.
6. Resolve record security classification.
7. Resolve cross-project authorization.
8. Apply reuse blockers.
9. Apply redaction level.
10. Evaluate HBI evidence threshold.
11. Return one of: `full`, `summary-safe`, `masked`, `withheld`, `refusal`, `degraded`.

## Mandatory Rules

- Missing project access returns no data.
- Missing source-system access cannot be bypassed through PCC summaries.
- Privileged records are withheld from HBI and normal surfaces unless the user is in the legal/admin named audience.
- Cross-project output is blocked unless future-pursuit/executive/admin authorization exists.
- Warranty responsibility conclusions are blocked when evidence is insufficient.
- If HBI has only withheld citations, it must refuse.

## Reference JSON

Use `reference/permission_redaction_resolution_algorithm.json` as machine-readable source.
