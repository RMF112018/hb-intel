# Prompt 13 | Projection Read Cutover, Production Monitoring, and Rollback

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

Execute the controlled production read-path cutover from legacy page-load aggregation to projection-backed reads, then monitor and document rollback readiness.

## Required Package Inputs

Review:
- `runbooks/Runbook_04_Seed_Cutover_And_Rollback.md`
- `runbooks/Runbook_05_Production_Monitoring.md`
- `07_Seed_Migration_Cutover_And_Rollback_Plan.md`

## Preconditions

Do not proceed unless Prompt 12 has proven live:
- subscription creation,
- delta seed checkpoints,
- webhook validation,
- queue/delta/projection sync.

## Required Work

1. Run final seed/rebuild if required by cutover checklist.
2. Run parity/freshness precheck.
3. Switch configuration:
   - `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=projection`
4. Validate My Dashboard live behavior and backend route telemetry.
5. Monitor Service Bus queue, DLQ, subscription state, and freshness telemetry during the defined cutover window.
6. Keep rollback step ready:
   - set read mode back to `legacy` if needed.
7. Document the cutover evidence and outcome precisely.

## Required Closeout

Return:
- cutover succeeded / rolled back / blocked,
- live read-path evidence,
- monitoring observations,
- whether weekly repair timer should remain disabled or can be considered later.
