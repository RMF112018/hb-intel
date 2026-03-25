# P1-F7-T01: BambooHR Connector Scope and Business Role

## Scope

- BambooHR is the Wave 1 workforce identity backbone and staffing backbone.
- `v1` focuses on employee directory, employee detail, and workforce-change signals needed for identity, assignment, and staffing-aligned published read models.

## Downstream Role

- The connector supports workforce identity publication, staffing visibility, and project-assignment context.
- It does not permit direct HR-system reads from feature packages.

## Out of Scope

- No writeback into BambooHR in `v1`.
- No broad HR domain expansion beyond workforce identity and staffing backbone concerns.
