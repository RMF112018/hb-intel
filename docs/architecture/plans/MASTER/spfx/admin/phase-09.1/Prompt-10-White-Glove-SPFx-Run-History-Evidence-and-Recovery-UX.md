# Prompt-10 — White-Glove SPFx Run History, Evidence, and Recovery UX

## Objective

Build the Admin SPFx run-history, device-run detail, evidence, and guided recovery experience for white-glove package runs.

## Important execution rules

- Do **not** re-read files that are already in your current context or memory unless necessary.
- Treat current repo truth as authoritative before making changes.
- Preserve the **Admin SPFx operator console / privileged backend** boundary.
- Do **not** push privileged execution into SPFx.
- Do **not** flatten Windows, macOS, iPhone, and iPad into one generic device workflow.
- Do **not** force Microsoft, Apple, and NinjaOne into one generic adapter.
- Use platform-native ownership honestly.
- Update existing authoritative docs instead of creating duplicate guidance unless this prompt explicitly requires a new authoritative doc.
- Keep acceptance criteria visible and verifiable.

## Inputs

Use the following as primary inputs:

- Prompt-01 through Prompt-09 outputs
- generalized run / audit / evidence contracts
- existing provisioning oversight UX patterns
- admin-intelligence patterns where applicable

## Required repo / code / docs targets

Update these targets where appropriate:

- `apps/admin/src/pages/`
- `apps/admin/src/hooks/`
- `packages/features/admin/src/white-glove/`
- any shared admin table / detail / badge components that should be reused or extended
- white-glove docs under `docs/architecture/plans/MASTER/spfx/admin/white-glove/`

## Work to perform

1. Build package run-history views.
2. Build device-run drill-down views.
3. Show:
   - parent package status
   - child device statuses
   - connector snapshot summary
   - checkpoint history
   - evidence summary
   - operator action history
4. Build guided recovery UX for:
   - retry
   - repair
   - resume after checkpoint
   - blocked dependency guidance
5. Reuse strong patterns from existing provisioning oversight where appropriate.
6. Keep recovery actions permission-gated and clearly attributable.
7. Use normalized backend data; do not let SPFx infer unsafe recovery logic locally.

## Acceptance criteria

- Operators can review parent package and child device runs.
- Evidence and checkpoint history are visible.
- Recovery actions are clearly guided, permission-gated, and attributable.
- Existing provisioning-oversight strengths are reused where appropriate.
- No unsafe recovery logic is implemented directly in SPFx.

## Documentation updates required

- Update white-glove run-history and recovery docs.
- Document what evidence is shown inline vs what is linked / summarized.

## Completion condition

Stop after the white-glove history, evidence, and recovery surfaces are wired end-to-end to the backend run spine.
