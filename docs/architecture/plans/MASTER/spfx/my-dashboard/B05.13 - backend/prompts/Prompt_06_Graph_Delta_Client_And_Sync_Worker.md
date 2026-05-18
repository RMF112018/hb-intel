# Prompt 06 | Graph Delta Client and Sync Worker

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

Implement changed-item retrieval and queue worker processing:
- Graph listItem delta client,
- delta checkpoint persistence,
- Service Bus queue-trigger worker,
- lease-controlled one-drain-at-a-time processing per source list.

## Required Package Inputs

Review:
- `05_Subscription_Delta_Queue_State_Design.md`
- `06_Projection_Recompute_Algorithm.md`
- `resources/Azure_Table_State_Entities.json`
- `resources/Service_Bus_Message_Contract.json`

## Locked Implementation Requirements

1. Implement Graph delta seed path using `token=latest` for both source lists.
2. Implement delta drain path following stored delta links through all pages until final `@odata.deltaLink`.
3. Handle delete tombstones explicitly.
4. Handle `410 Gone` by marking source state `resync-required`; do not silently advance to unsafe state.
5. Queue-trigger worker must:
   - parse source-kind wake-up message,
   - acquire source lease,
   - drain delta,
   - call projection-slice recompute service via interface seam,
   - persist advanced delta link only after successful processing,
   - release lease.
6. Emit telemetry for delta start/success/failure/resync-required and queue worker start/success/failure.

## Expected Validations

- Delta client tests:
  - latest checkpoint,
  - single-page delta,
  - multi-page nextLink,
  - delete tombstone,
  - 410 resync-required.
- Worker tests:
  - lease contention,
  - success path,
  - processing failure retains safe cursor posture.
- Typecheck backend.

## Do Not Do Yet

- Do not implement final projection semantics in this prompt beyond an interface seam/fake service.
- Do not claim live Graph proof.
