# Prompt-02 — White-Glove Domain Model and Package Template Baseline

## Objective

Define the canonical white-glove domain model, package-template model, run taxonomy, and governance boundaries.

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

- Prompt-01 outputs
- `Admin-SPFx-IT-Control-Center-White-Glove-Implementation-Summary-Plan.md`
- current shared models under `@hbc/models`
- current provisioning model references under `docs/reference/models/`

## Required repo / code / docs targets

Update these targets where appropriate:

- `docs/reference/white-glove/`
- `docs/architecture/plans/MASTER/spfx/admin/white-glove/`
- shared model packages if appropriate:
  - `packages/models/` or current `@hbc/models` location
- `packages/features/admin/`
- `backend/functions/` contracts area if present

## Work to perform

1. Define canonical models for:
   - employee device package type
   - package template
   - package template version
   - package launch request
   - package run
   - child device run
   - device platform type
   - checkpoint type
   - evidence item
   - connector snapshot
   - readiness snapshot
   - package failure classification
2. Preserve all six required employee package families exactly.
3. Define per-platform operational differences:
   - Windows desktop / laptop
   - macOS laptop
   - iPhone
   - iPad
4. Define which template attributes are:
   - code-defined baseline
   - governed live-admin-maintained
   - derived at run time
5. Define run statuses and allowed transitions.
6. Define checkpoint taxonomy:
   - connector readiness
   - technician-prep
   - enrollment-blocked
   - package-confirmation
   - downstream-standardization
   - recovery-required
7. Define evidence taxonomy:
   - enrollment evidence
   - assignment evidence
   - software-bundle evidence
   - validation evidence
   - operator action evidence

## Acceptance criteria

- Canonical domain and run model docs exist.
- All six employee package families are preserved.
- Windows, macOS, iPhone, and iPad are explicitly differentiated.
- Code-defined vs live-governed template boundaries are explicit.
- Status and checkpoint transitions are concrete enough for backend and UI implementation.

## Documentation updates required

- Add a white-glove models reference doc.
- Update or extend shared model references if new shared types are added.
- Cross-link back to the architecture baseline and implementation summary.

## Completion condition

Stop after the canonical model and package-template baseline are complete and no unresolved ownership ambiguity remains.
