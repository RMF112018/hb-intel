# Prompt-03 — White-Glove Connector Registry and Governed Configuration Foundation

## Objective

Build the secure connector registry and governed configuration foundation required for UI-driven service setup and validation.

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

- Prompt-01 and Prompt-02 outputs
- current service-factory and config-validation patterns in `backend/functions/`
- current admin system settings patterns in `apps/admin/`
- any config registry docs already in `docs/reference/configuration/`

## Required repo / code / docs targets

Update these targets where appropriate:

- `backend/functions/src/services/`
- `backend/functions/src/utils/`
- `backend/functions/src/functions/`
- `apps/admin/src/pages/`
- `packages/features/admin/src/`
- `docs/reference/configuration/`
- `docs/architecture/plans/MASTER/spfx/admin/white-glove/`

## Work to perform

1. Implement or scaffold a governed connector registry for:
   - Microsoft Entra / Graph
   - Intune / Autopilot dependencies
   - Apple Business Manager / Apple enrollment dependencies
   - APNs / Apple MDM dependencies
   - NinjaOne API / OAuth
2. Define and implement connector record types including:
   - connector name
   - connector class
   - environment
   - non-secret metadata
   - secret reference strategy
   - validation state
   - last validation result
   - last validated timestamp
   - configuration version
3. Implement secure backend resolution of secrets and connector settings.
4. Implement connector test / validation execution boundaries in the backend.
5. Implement governed configuration versioning and change attribution.
6. Preserve UI-driven setup: no code edit should be needed for routine IT-side connector setup.
7. Add policy toggles for:
   - connector enabled / disabled
   - dry-run only
   - production launch allowed
   - high-risk action checkpoint required

## Acceptance criteria

- A backend connector registry exists or is cleanly scaffolded with durable contracts.
- Secret handling is backend-resolved and not exposed to SPFx.
- Connector validation is backend-executed and consumable by SPFx.
- Versioned governed configuration exists for connector settings.
- The design supports UI-driven setup without direct code changes by IT.

## Documentation updates required

- Add or update authoritative configuration docs.
- Document what data is stored directly vs referenced securely.
- Document how connector versions and validation history are represented.

## Completion condition

Stop after connector governance, validation contracts, and secure resolution foundations are in place.
