# Prompt-01 — White-Glove Repo Truth and Architecture Baseline

## Objective

Create the repo-truth and architecture baseline for the white-glove device deployment domain before any broad code spread.

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

- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md`
- `Admin-SPFx-IT-Control-Center-White-Glove-Implementation-Summary-Plan.md`
- `admin-spfx-white-glove-gap-map.md`
- current repo truth under:
  - `apps/admin/`
  - `packages/features/admin/`
  - `packages/provisioning/`
  - `backend/functions/`
  - existing admin / provisioning docs under `docs/architecture/plans/MASTER/spfx/admin/` and `docs/architecture/reviews/`

## Required repo / code / docs targets

Update these targets where appropriate:

- `docs/architecture/plans/MASTER/spfx/admin/white-glove/`
- `docs/architecture/reviews/`
- any authoritative admin architecture / boundary docs that should be amended instead of duplicated

## Work to perform

1. Create a white-glove architecture baseline document that:
   - defines what belongs in SPFx
   - defines what belongs in backend control plane
   - defines what adapters must own
   - defines what platform-native systems own
   - defines what NinjaOne owns and does not own
2. Create a boundary matrix covering:
   - connector setup
   - readiness validation
   - package launch
   - run orchestration
   - checkpoints
   - retries / compensation / repair
   - evidence
   - run history and audit
3. Create a repo-truth reuse map listing:
   - existing files / packages / services to reuse
   - files that must be extended
   - areas that require new build-out
4. Create a no-go list preventing:
   - privileged SPFx execution
   - flattened device workflows
   - connector handling without governance
   - duplicate admin architecture docs

## Acceptance criteria

- A new authoritative white-glove architecture baseline exists.
- A concrete boundary matrix exists.
- The baseline explicitly preserves the operator-console / privileged-backend split.
- Existing reusable foundations are named, not ignored.
- No implementation work is started until the boundary doc and reuse map are complete.

## Documentation updates required

- Add links from the new baseline to the admin end-state plan.
- Add a review note or audit note under `docs/architecture/reviews/` summarizing the baseline decision set.
- Update any existing admin plan index / README that should point to the new white-glove baseline.

## Completion condition

Stop after the baseline docs and reuse map are complete, cross-linked, and internally consistent.
