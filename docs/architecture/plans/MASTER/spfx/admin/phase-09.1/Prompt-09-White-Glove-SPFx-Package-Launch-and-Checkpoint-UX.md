# Prompt-09 — White-Glove SPFx Package Launch and Checkpoint UX

## Objective

Build the Admin SPFx workflow for employee lookup, package selection, target-device intake, preflight validation, launch confirmation, and checkpoint visibility.

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

- Prompt-01 through Prompt-08 outputs
- package-template model
- run model
- connector readiness APIs
- current admin page and modal patterns

## Required repo / code / docs targets

Update these targets where appropriate:

- `apps/admin/src/pages/`
- `apps/admin/src/hooks/`
- `packages/features/admin/src/white-glove/`
- route definitions and page-shell composition locations
- white-glove docs under `docs/architecture/plans/MASTER/spfx/admin/white-glove/`

## Work to perform

1. Build the package-launch workflow including:
   - employee identity lookup
   - package-type selection
   - platform-specific device intake
   - preflight validation summary
   - operator confirmation before run launch
2. Preserve the six package families exactly.
3. Build platform-specific intake UX for:
   - Windows desktop / laptop
   - macOS laptop
   - iPhone
   - iPad
4. Show blocked and warning conditions before launch.
5. Show checkpoint expectations before launch so the operator understands where technician or dependency pauses may occur.
6. Launch backend package runs through typed backend contracts only.
7. Keep the UX operational, not decorative; optimize for clear operator decision support.

## Acceptance criteria

- A complete launch workflow exists in SPFx.
- Employee lookup, package selection, and platform-specific intake are functional.
- Preflight validation and checkpoint expectations are visible before launch.
- Launch triggers backend package runs only through typed API boundaries.
- The UX does not flatten package or device differences.

## Documentation updates required

- Update white-glove UX docs and package-launch flow docs.
- Document required fields and validation behaviors for each platform/device type.

## Completion condition

Stop after package launch and checkpoint visibility UX are complete and wired to backend launch contracts.
