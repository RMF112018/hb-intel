# Phase 7 Prompt Package — Project Setup Frontend/Backend Production Alignment

## Purpose
This package contains the ordered Phase 7 implementation prompts needed to address the frontend/backend production-alignment issues identified in the latest audit of the HB Intel Project Setup SPFx package, backend Azure Functions host, and SharePoint `Projects` list contract.

## Primary Objective
Bring the Project Setup solution from a UI-review / partially aligned state to a production-aligned state by:
- removing baked-in UI-review assumptions from the shipped SPFx surface,
- standardizing the production auth and API-calling contract,
- restoring frontend ↔ backend route parity,
- hardening the Entra token validation model,
- tightening managed identity / CORS / connected-service posture,
- and proving the final package against repo truth with a staging-oriented validation pass.

## Required cumulative report
Throughout all prompts, update this report after each prompt is completed:

`docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md`

If the file does not exist, create it in Prompt 1.

Each prompt execution must append or refresh the report with:
- scope completed,
- files changed,
- repo-truth evidence,
- remaining gaps,
- risks introduced or retired,
- and explicit closure statements for each task in that prompt.

## Execution order
Run the prompts in this exact order:
1. `Prompt-1_Phase-7_Contract-Freeze-and-Execution-Plan.md`
2. `Prompt-2_Phase-7_Production-Mode-and-Frontend-API-Contract.md`
3. `Prompt-3_Phase-7_Route-Parity-and-Users-Me-Endoints.md`
4. `Prompt-4_Phase-7_Auth-Token-Contract-Hardening.md`
5. `Prompt-5_Phase-7_SPFx-API-Calling-Pattern-and-Auth-Transport.md`
6. `Prompt-6_Phase-7_Managed-Identity-CORS-and-Service-Posture.md`
7. `Prompt-7_Phase-7_End-to-End-Validation-and-Report-Reconciliation.md`

## Important working rules for every prompt
- Treat the live repo as the source of truth.
- Do not assume prior docs are correct unless confirmed by current repo truth.
- Do not re-read files already in the agent’s active context unless needed to verify a contradiction, confirm drift, or collect exact evidence.
- Preserve the current production intent of the Project Setup app as a standalone SPFx package unless repo truth clearly requires a different boundary.
- Do not introduce broad unrelated refactors.
- Keep changes tightly scoped to the issues defined in the prompt.
- Prefer incremental, reviewable commits by concern area.
- Update the cumulative Phase 7 report at the end of each prompt.

## Success standard for the full package
By the end of Prompt 7, the repo should provide evidence that:
- the Project Setup frontend is not artificially locked into UI-review mode,
- the frontend API contract is explicit and production-appropriate,
- route parity exists for all frontend-required backend calls,
- backend token validation is internally consistent and Microsoft-guidance-aligned,
- frontend auth transport matches backend expectations,
- connected Azure / SharePoint posture is documented and appropriately gated,
- and a final repo-truth reconciliation confirms what is done, deferred, or still unresolved.
