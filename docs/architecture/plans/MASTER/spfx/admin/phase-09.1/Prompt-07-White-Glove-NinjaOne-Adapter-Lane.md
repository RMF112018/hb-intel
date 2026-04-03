# Prompt-07 — White-Glove NinjaOne Adapter Lane

## Objective

Implement the NinjaOne execution lane for post-enrollment standardization, software bundles, scripts, validation, and remediation hooks.

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

- Prompt-01 through Prompt-06 outputs
- connector registry baseline
- package-template and standards model
- run / audit / evidence contracts

## Required repo / code / docs targets

Update these targets where appropriate:

- `backend/functions/src/services/device-management/ninjaone/`
- `backend/functions/src/functions/white-glove/`
- `docs/reference/white-glove/`
- `docs/how-to/developer/` if needed

## Work to perform

1. Implement NinjaOne connector and API client boundaries.
2. Support:
   - connectivity validation
   - package metadata push
   - policy-bundle assignment
   - software-bundle trigger
   - script / automation trigger
   - validation / completion-state normalization
3. Model NinjaOne as a downstream standardization and validation lane, not the device-enrollment authority.
4. Support package-template mapping to:
   - policy bundles
   - software bundles
   - script bundles
   - validation bundles
5. Capture evidence for:
   - policy / software assignment
   - script invocation
   - validation result
   - remediation attempt
6. Add meaningful retry and repair semantics for post-enrollment standardization failures.
7. Add automated tests with mock and failure scenarios.

## Acceptance criteria

- NinjaOne adapter services exist with clean boundaries.
- Package-template to NinjaOne-standard mapping is concrete.
- Evidence and normalized result contracts are implemented.
- NinjaOne is clearly treated as downstream standardization, not enrollment authority.
- Tests cover success, connection failure, and partial completion scenarios.

## Documentation updates required

- Update white-glove NinjaOne reference docs.
- Document which tasks are delegated to NinjaOne.
- Document how NinjaOne results are normalized for SPFx and audit records.

## Completion condition

Stop after the NinjaOne lane is testable, documented, and integrated into the generalized run model.
