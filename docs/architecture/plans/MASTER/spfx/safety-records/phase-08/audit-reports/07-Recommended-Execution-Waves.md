# Recommended Execution Waves

Date: 2026-04-24

## Wave 01 — Production blockers

Objective: make the hosted Safety app truthfully bound, role-aware, contract-aligned, and supportable enough for controlled production pilot.

Prompts:

1. `Prompt-01-Route-Auth-Contract-Authority.md`
2. `Prompt-02-Runtime-Config-Deploy-Governance.md`
3. `Prompt-03-Upload-Preview-Contract-Validation.md`
4. `Prompt-04-State-Error-Support-Telemetry.md`

Expected closure:

- Route/action/role matrix reflected in UI behavior and tests.
- Runtime config fails closed with independent backend origin authority.
- Upload validation matches backend/parser semantics.
- Support payloads and telemetry cover preview, commit, replay, and read failures.

## Wave 02 — Structural hardening

Objective: reduce long-term maintenance risk and bring replay, telemetry, release verification, and adapter boundaries to production standard.

Prompts:

1. `Prompt-01-Replay-Preview-Supersede-UX.md`
2. `Prompt-02-Legacy-SharePoint-Adapter-Seam-Cleanup.md`
3. `Prompt-03-Client-Telemetry-Correlation.md`
4. `Prompt-04-Release-Verification-And-Readiness-Probes.md`

Expected closure:

- Replay/supersede has governed operator confirmation.
- Legacy REST ingestion helpers cannot be accidentally used.
- Frontend telemetry correlates with backend logs.
- Packaging/release verification proves live app → intended backend → intended API audience → route availability.
