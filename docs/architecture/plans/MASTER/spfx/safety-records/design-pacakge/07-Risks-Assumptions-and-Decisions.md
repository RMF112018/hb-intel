# 07 — Risks, Assumptions, and Decisions

## Governing decisions

1. Release 1 is upload-first.
2. The workbook is governed, not arbitrary.
3. The parser recalculates scores.
4. Safety site hosts the UX.
5. HBCentral hosts the authoritative structured safety lists.
6. Each inspection event is preserved independently.
7. Weekly project score is derived from inspection events.

## Key risks

### Template drift
If coordinators modify workbook structure, parser reliability will degrade.

### Permission complexity
Because uploads originate on Safety and structured writes occur on HBCentral, service permissions must be deliberate.

### Scoring drift
The current workbook includes displayed rows that are excluded from some summary formulas. This must be governed by version and scoring mode.

### Duplicate submissions
Users may re-upload the same workbook after connectivity recovery or uncertainty.

## Assumptions

- coordinators will continue to use Excel in the field in Release 1
- project identity can be resolved using HBCentral registries
- HBCentral is the right long-term data home for structured safety records
- managers want both inspection-level detail and project-week rollups

## Recommendation

Proceed with this structure and treat the checklist workbook as a governed contract artifact until a future native offline-first capture product is ready.
