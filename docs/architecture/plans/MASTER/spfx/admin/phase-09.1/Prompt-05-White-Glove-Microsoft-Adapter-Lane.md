# Prompt-05 — White-Glove Microsoft Adapter Lane

## Objective

Implement the Microsoft execution lane for Entra, Intune, and Windows Autopilot dependencies used by the white-glove feature.

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

- Prompt-01 through Prompt-04 outputs
- current Graph service baseline
- current managed identity and service-factory patterns
- current configuration and connector registry baseline
- package-template model and run model docs

## Required repo / code / docs targets

Update these targets where appropriate:

- `backend/functions/src/services/device-management/microsoft/`
- `backend/functions/src/functions/white-glove/`
- `apps/admin/` only for any contract wiring needed after backend endpoints are added
- `docs/reference/white-glove/`
- `docs/how-to/developer/` if an internal developer-facing setup note is needed

## Work to perform

1. Split Microsoft responsibilities into clean adapters or services for:
   - identity / group resolution where needed
   - Intune enrollment and assignment dependencies
   - Windows Autopilot registration / assignment / status dependencies
   - readiness probes
2. Do not overload the existing Graph group service with unrelated device-management logic.
3. Implement backend commands and validations for:
   - package launch preflight
   - Windows device readiness
   - Autopilot profile dependency checks
   - group / profile / assignment dependency checks
   - status normalization for SPFx display
4. Model technician-assisted pre-provisioning as a first-class checkpoint-capable flow.
5. Add evidence capture for:
   - registration / assignment outcome
   - profile / group mapping used
   - normalized downstream status
6. Preserve platform-native ownership and avoid pretending custom code is the enrollment authority.
7. Add automated tests for success, blocked, misconfigured, and partial-failure paths.

## Acceptance criteria

- Microsoft adapter services exist and are cleanly separated by concern.
- White-glove backend can validate Microsoft readiness and launch Microsoft-side work safely.
- Technician-assisted Windows flow is modeled explicitly.
- Statuses and failures normalize into backend contracts usable by SPFx.
- Tests cover happy path and meaningful failure classes.

## Documentation updates required

- Update white-glove Microsoft reference docs.
- Document required connector metadata and readiness checks.
- Document what Microsoft owns vs what HB Intel orchestration owns.

## Completion condition

Stop after the Microsoft backend lane is testable, documented, and integrated into the generalized run model.
