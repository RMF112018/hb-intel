# Prompt 09 | Projection-Backed Read Model Provider and Cutover Flag

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

Implement the production read-path replacement behind a configuration flag while preserving the public My Projects backend route and frontend contract.

## Required Package Inputs

Review:
- `01_Target_Architecture.md`
- `04_Backend_Service_Design.md`
- `07_Seed_Migration_Cutover_And_Rollback_Plan.md`
- current My Work read-model provider resolver.

## Locked Implementation Requirements

1. Implement projection-backed `getMyProjectLinks(...)` provider that:
   - derives actor from existing auth context,
   - queries `My Projects Registry` by `UserUpn` and active status,
   - maps helper rows into existing `MyProjectLinksReadModel` envelope,
   - recomputes summary counts from helper rows at read time,
   - computes projection freshness diagnostics.
2. Add read-mode switch:
   - `legacy`: current aggregation provider.
   - `projection`: projection-backed provider.
3. Keep route path unchanged:
   - `GET /api/my-work/me/project-links`
4. Do **not** implement automatic request-time fallback from projection read back to full source aggregation. Rollback is an operator config action.
5. Preserve current frontend compatibility; no unnecessary SPFx change should be required.
6. Emit projection read telemetry.

## Expected Validations

- Provider tests for active rows, empty rows, actor normalization, freshness diagnostics.
- Resolver tests for legacy/projection mode selection.
- Route agreement tests preserving envelope shape.
- Typecheck backend.

## Do Not Do Yet

- Do not flip production config to projection mode in code defaults.
