# Prompt 00 | Repo Truth Revalidation and Scope Lock

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

Revalidate the current repo truth against the implementation package and produce an implementation-scope lock for the full My Projects projection program.

## Required Package Inputs

Review:
- `README.md`
- `00_Closed_Decision_Register.md`
- `01_Target_Architecture.md`
- `resources/Repo_Truth_Seam_Map.md`
- `resources/Implementation_Sequence_Checklist.md`

## Required Audit Focus

Confirm the current truth of:
1. My Projects frontend read path.
2. Backend project-links route and provider resolver composition.
3. Current full-list Projects + Legacy Registry aggregation provider.
4. Current Graph list client and federated token lane.
5. Current role/list schema docs and provisioning patterns.
6. Existing timer/admin/manual-run patterns worth reusing.
7. Current dependency state:
   - `@azure/data-tables` already present,
   - `@azure/service-bus` not yet present unless repo has changed.

## Required Output After Audit

Produce a short repo-truth scope lock containing:
- what matches the package,
- what drifted since package generation,
- whether implementation can continue without changing the target architecture,
- exact files likely to be touched across Prompts 01–14.

## Stop Condition

Stop after the audit/plan response. No edits in this prompt unless Bobby authorizes continuation.
