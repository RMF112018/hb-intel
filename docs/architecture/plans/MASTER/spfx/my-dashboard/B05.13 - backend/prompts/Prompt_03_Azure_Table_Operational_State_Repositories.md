# Prompt 03 | Azure Table Operational State Repositories

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

Implement the durable operational state layer using Azure Table Storage with the package-defined tables:

- `MyProjectsProjectionSubscriptions`
- `MyProjectsProjectionDeltaState`
- `MyProjectsProjectionLeases`
- `MyProjectsProjectionRuns`

## Required Package Inputs

Review:
- `02_Azure_Infrastructure_Specification.md`
- `05_Subscription_Delta_Queue_State_Design.md`
- `resources/Azure_Table_State_Entities.json`
- `resources/Environment_Settings_Matrix.md`

## Locked Implementation Requirements

1. Use `@azure/data-tables`, which is already present in repo truth unless that has changed.
2. Use managed identity compatible credential construction, not connection-string secrets.
3. Implement repositories/services for:
   - subscription entities,
   - delta state entities,
   - lease entities,
   - run ledger entities.
4. Use deterministic `PartitionKey` / `RowKey` patterns from the package.
5. Support optimistic concurrency / ETag-aware writes where state advancement must be guarded.
6. Implement lease acquisition / lease expiry / lease release semantics for one active sync worker per source list.
7. Keep state entities sanitized; do not store JWTs, raw assertions, bearer tokens, or webhook secret material.

## Expected Validations

- Unit tests for entity mapping.
- Unit tests for optimistic write conflict behavior using fakes/mocks.
- Unit tests for lease acquire/deny/expire/release.
- Typecheck backend.

## Do Not Do Yet

- No live storage account validation unless Bobby explicitly requests it.
- No Graph subscription implementation in this prompt.
