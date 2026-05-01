# Wave 9 Implementation Strategy

## Recommended Prompt Sequence

1. Gate, repo-truth audit, and Wave 8 dependency verification.
2. Shared lifecycle-readiness models and deterministic fixtures.
3. Backend mock-provider and GET-only read-model route extension.
4. SPFx fixture client parity and router seam.
5. Project Lifecycle Readiness Center command surface.
6. Item detail, evidence, risk, ownership, and degraded states.
7. Readiness signals for Priority Actions and Approvals posture, with no execution.
8. Closeout, validation, and Wave 10 handoff.

## Implementation Shape

### Shared models

Create or extend model files under `packages/models/src/pcc/` for lifecycle readiness vocabulary. Keep the module pure TypeScript. Avoid SPFx, backend, Graph, PnP, Procore, Sage, Outlook, and runtime imports.

### Fixtures

Add deterministic fixture data that samples the canonical 157-item library without manually duplicating all 157 items unless the prompt explicitly approves it. Preferred pattern:

- include representative startup, safety, and closeout fixture slices;
- include counts and source-library metadata referencing the canonical JSON/CSV;
- preserve exact source traceability fields for sampled items;
- add tests that verify family counts, source links, and model invariants.

If repo truth already includes generated JSON/CSV import patterns, use them only if no dependency/lockfile churn is required.

### Backend

Extend the existing PCC read-model mock-provider route family only if Wave 8/Wave 9 scope authorizes it. Keep all routes GET-only and envelope-based. Update exact route-count tests.

### SPFx

Keep SPFx fixture-default. Add Project Lifecycle Readiness Center UI under the existing `project-readiness` surface unless repo truth has introduced a Wave 8 shell that should be consumed. Use progressive disclosure rather than a giant checklist table.

### UI regions

- Readiness hero
- Lifecycle gate map
- My readiness actions
- Family/domain cards
- Blockers and exceptions
- Evidence readiness
- Future Closeout Exposure
- Item detail drawer/panel
- Source traceability view
- Degraded/source-health state panel

## Gate Policy

If Wave 8 framework work is absent, the local agent must stop. Do not allow Wave 9 to create ad hoc framework models, app-local taxonomies, or duplicate source-of-truth concepts already defined by Wave 8.
