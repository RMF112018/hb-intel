# Prompt-08 — White-Glove SPFx Connections, Readiness, and Health UX

## Objective

Build the Admin SPFx UX for connector configuration, validation, readiness, and environment health.

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

- Prompt-01 through Prompt-07 outputs
- existing admin routing and page-shell patterns
- existing system settings and admin-intelligence components
- connector registry and validation APIs

## Required repo / code / docs targets

Update these targets where appropriate:

- `apps/admin/src/router/`
- `apps/admin/src/pages/`
- `apps/admin/src/hooks/`
- `packages/features/admin/src/white-glove/`
- `packages/features/admin/README.md`
- `docs/architecture/plans/MASTER/spfx/admin/white-glove/`

## Work to perform

1. Add white-glove navigation / routes to the admin shell.
2. Build connector configuration pages or sections for:
   - Microsoft
   - Apple
   - NinjaOne
3. Build validation / test actions that call backend validation endpoints.
4. Show:
   - connector health
   - last successful validation
   - current configuration version
   - blocked / degraded / ready state
   - supportable error messaging
5. Build a readiness page that summarizes:
   - connector status
   - package-template completeness
   - required standards bundle completeness
   - run-store and audit-store availability
6. Use existing admin shell, banner, table, status badge, modal, and page-shell patterns where appropriate.
7. Do not expose secrets in SPFx.
8. Preserve permission gating and operator-console boundaries.

## Acceptance criteria

- Admin routes for white-glove connections and readiness exist.
- Operators can configure and validate required connector inputs through the UI.
- Health and readiness status are clearly visible.
- No privileged execution logic is moved into SPFx.
- UI uses established admin patterns and permission controls.

## Documentation updates required

- Update feature-package README or adoption docs if new reusable white-glove UI primitives are added.
- Add a page-level UX reference doc or update existing admin white-glove plan docs with screenshots / state descriptions if appropriate.

## Completion condition

Stop after connector setup, validation, readiness, and health UX are implemented and wired to backend validation surfaces.
