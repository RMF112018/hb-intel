# Prompt 11 | Deployment Runbooks and Pre-Permission Staging

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

Prepare the repo for deployment and operator execution before `Sites.Read.All` live permission validation occurs.

## Required Package Inputs

Review:
- `runbooks/Runbook_01_Azure_Portal_Provisioning.md`
- `runbooks/Runbook_02_Pre_Permission_Implementation_Work.md`
- `resources/Environment_Settings_Matrix.md`
- `resources/Implementation_Sequence_Checklist.md`

## Locked Implementation Requirements

1. Update or add implementation docs/runbooks in repo location consistent with current project conventions.
2. Finalize environment-variable reference documentation.
3. Add or update operator validation docs for:
   - Azure resource readiness,
   - required RBAC,
   - pending `Sites.Read.All` validation gate.
4. Ensure code paths degrade honestly when Graph live validation cannot yet complete.
5. Ensure deployment does not accidentally cut read mode to `projection` before parity/live validation.

## Expected Validations

- Docs lint/style if repo has standards.
- Typecheck/tests if docs references code-generated constants or scripts.

## Required Closeout

Produce a status statement:

```text
Ready for infrastructure provisioning and post-permission live Graph validation.
Not yet production-cutover ready until Prompt 12 and Prompt 13 complete.
```
