# Prompt-06 — White-Glove Apple Adapter Lane

## Objective

Implement the Apple execution lane for ABM, ADE, Apple enrollment readiness, and Intune-managed Apple device support.

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

- Prompt-01 through Prompt-05 outputs
- connector registry baseline
- package-template and run model docs
- white-glove architecture baseline

## Required repo / code / docs targets

Update these targets where appropriate:

- `backend/functions/src/services/device-management/apple/`
- `backend/functions/src/functions/white-glove/`
- `docs/reference/white-glove/`
- `docs/how-to/developer/` if needed for internal admin/developer setup documentation

## Work to perform

1. Implement clean Apple-side service boundaries for:
   - ABM / ADE readiness metadata
   - token and assignment-state validation
   - iPhone / iPad enrollment dependency checks
   - macOS enrollment dependency checks
2. Explicitly differentiate:
   - iPhone workflow
   - iPad workflow
   - macOS workflow
3. Model Apple-specific readiness and failure cases:
   - missing assignment
   - token invalid / missing
   - APNs dependency failure
   - unsupported source / assignment posture
   - not-ready-for-automated-enrollment
4. Add normalized evidence capture for:
   - device assignment readiness
   - enrollment-profile mapping
   - platform-specific status outcomes
5. Preserve platform-native ownership; do not treat Apple enrollment as generic MDM plumbing.
6. Ensure the backend surface can drive checkpoints and operator guidance clearly.
7. Add automated tests for Apple-specific success and failure modes.

## Acceptance criteria

- Apple adapters exist with explicit platform differentiation.
- Apple-specific readiness failures are normalized and visible.
- iPhone, iPad, and macOS are not collapsed into one flow.
- Evidence and status contracts support SPFx consumption.
- Tests cover meaningful Apple-specific conditions.

## Documentation updates required

- Update white-glove Apple reference docs.
- Document token, assignment, and readiness concepts clearly.
- Document what the operator should see vs what the backend evaluates.

## Completion condition

Stop after the Apple backend lane is testable, documented, and integrated into the generalized run model.
