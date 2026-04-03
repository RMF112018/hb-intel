# Prompt-11 — White-Glove Package Standards and Governance UX

## Objective

Build the Admin SPFx governance surfaces for package templates, standards bundles, governed overrides, and version traceability.

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

- Prompt-01 through Prompt-10 outputs
- package-template model
- governed connector / config registry foundation
- current system settings and approval-authority UX patterns

## Required repo / code / docs targets

Update these targets where appropriate:

- `apps/admin/src/pages/`
- `packages/features/admin/src/white-glove/`
- governed config backend endpoints and services
- docs under `docs/reference/configuration/` and `docs/architecture/plans/MASTER/spfx/admin/white-glove/`

## Work to perform

1. Build package-template governance UX.
2. Support:
   - package template browse / detail
   - version history
   - governed edits
   - code-baseline vs live-override visibility
   - standards bundle mapping
   - validation before save
3. Make it clear which fields are:
   - locked in code
   - live-governed
   - derived
4. Show change attribution and effective-version traceability.
5. Keep destructive or high-risk template changes behind appropriate operator safety patterns.
6. Do not create a disconnected second source of truth.

## Acceptance criteria

- Package governance UX exists and is operationally clear.
- Baseline vs override visibility is explicit.
- Version history and attribution are visible.
- Save flows validate package integrity before persistence.
- Governance does not create a second unmanaged source of truth.

## Documentation updates required

- Update package governance and configuration docs.
- Document effective-version and traceability behavior clearly.

## Completion condition

Stop after package-template and standards-governance UX are complete and wired to governed backend services.
