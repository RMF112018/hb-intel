# Prompt 07 | My Projects Domain Extraction and Projection Slice Engine

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

Extract or reuse the current My Projects domain semantics and implement the projection slice engine that writes `My Projects Registry` rows incrementally.

## Required Package Inputs

Review:
- `06_Projection_Recompute_Algorithm.md`
- `03_SharePoint_My_Projects_Registry_Schema.md`
- current `my-project-links-read-model-provider.ts` implementation.

## Locked Semantic Requirements

Preserve exactly:
1. Projects/merged assignment inclusion comes from Projects-side roles.
2. Registry legacy-only inclusion comes from Registry role arrays.
3. Explicit merge by `MatchedProjectListItemId` precedes fallback matching.
4. Fallback merge by project number + year applies only when uniquely resolvable.
5. Projects stage precedes Registry stage when merged.
6. SharePoint launch precedence remains:
   - Projects site URL first for merged rows,
   - Registry folder fallback only when no Projects site URL exists.
7. Procore/BuildingConnected/Document Crunch validation and unavailable warnings match existing behavior.
8. ProjectionKey = deterministic hash of normalized UPN + RecordKey.
9. Obsolete rows are soft-deactivated, not physically deleted during normal recompute.
10. Reactivation restores a previously inactive row when the same projection key becomes valid again.

## Required Implementation

1. Extract pure domain transformation helpers away from request-only provider if needed.
2. Implement registry writer/repository for helper-list rows.
3. Implement recompute by changed Projects slice.
4. Implement recompute by changed Registry slice.
5. Implement deletion recovery behavior:
   - Projects deletion may produce legacy-only rows from remaining Registry source.
   - Registry deletion may produce projects-only rows from remaining Projects source.
6. Implement soft-deactivation, reactivation, and 90-day retention metadata.

## Expected Validations

- Unit parity tests against existing reconciliation fixtures.
- Slice tests for Projects update / Registry update / delete recovery.
- Projection writer tests using fake Graph list adapter.
- Typecheck backend.

## Do Not Do Yet

- Do not cut over runtime read route yet.
