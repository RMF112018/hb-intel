# Prompt 08 | Initial Seed, Full Rebuild, Admin Endpoints, and CLI

## Working Context

You are working in the `RMF112018/hb-intel` repository on the **My Dashboard | My Projects Incremental Projection** implementation package dated **2026-05-17**.

Read and obey the package's locked decisions. Do **not** reopen architecture choices that are closed in:
- `00_Closed_Decision_Register.md`
- `01_Target_Architecture.md`
- `02_Azure_Infrastructure_Specification.md`
- the prompt-specific package files referenced below.

Do not re-read files that are still clearly present in your current context or memory; only re-open a file when verification of exact current contents is required.

## Required First Response

Return:
1. a concise execution plan,
2. the exact repo seams you will inspect or edit,
3. the validation lanes you expect to run,
4. any true blocking contradiction with repo truth.

Do **not** make edits until Bobby approves the plan, unless Bobby explicitly instructs you to proceed immediately.

---
## Objective

Implement the controlled operator paths required to populate, repair, and operate the projection store:
- initial seed / full rebuild,
- manual drift audit trigger where scoped,
- admin HTTP endpoints,
- CLI scripts,
- run ledger integration.

## Required Package Inputs

Review:
- `07_Seed_Migration_Cutover_And_Rollback_Plan.md`
- `08_Telemetry_Observability_And_Operational_Runbooks.md`
- `runbooks/Runbook_04_Seed_Cutover_And_Rollback.md`

## Locked Implementation Requirements

1. Implement full seed/full rebuild path that:
   - reads source Projects + Legacy Registry current state,
   - reuses locked projection semantics,
   - writes the complete `My Projects Registry` projection state,
   - soft-deactivates stale registry rows not produced in the rebuild,
   - records a `ProjectionBatchId` / run ledger entry.
2. Implement admin POST endpoint(s) protected by existing admin authorization conventions.
3. Implement CLI operator script(s) for seed/rebuild invocation and status output.
4. Support dry-run or preview mode if package design requires it; if not, document why endpoint/CLI split is sufficient.
5. Telemetry must report run start/success/failure and counts inserted/updated/deactivated/reactivated.
6. Manual rebuild controls are stage one/ two functionality; later UI control belongs in Prompt 14.

## Expected Validations

- Endpoint tests for admin authorization and execution path.
- CLI parsing/report formatting tests.
- Full rebuild fixture tests.
- Typecheck backend.

## Do Not Do Yet

- Do not set projection read mode to `projection`.
- Do not claim live Graph subscription/delta proof if permission is still pending.
