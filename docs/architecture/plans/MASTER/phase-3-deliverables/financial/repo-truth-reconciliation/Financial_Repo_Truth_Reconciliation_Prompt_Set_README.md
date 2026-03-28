# Financial Repo-Truth Reconciliation Prompt Set

This prompt set addresses **A. Repo-truth reconciliation tasks** for the Financial module.

## Included prompts

1. `01_Financial_Repo_Truth_Reconciliation_Sweep.md`
   - proves present-state Financial posture
   - corrects repo-truth drift
   - updates governing docs to align with actual implementation evidence

2. `02_Financial_Production_Readiness_Maturity_Model.md`
   - creates a canonical Financial production-readiness maturity model
   - normalizes H1 and related readiness language

3. `03_Financial_Repo_Truth_Reconciliation_Validation.md`
   - validates cross-file consistency
   - eliminates remaining overclaim / underclaim issues
   - creates a closure note for future implementation work

## Recommended run order

Run the prompts in numerical order.
Do not skip Prompt 01.
Prompt 02 depends on reconciled present-state truth.
Prompt 03 depends on completion of Prompts 01 and 02.

## Expected result

At the end of this prompt set, the repo should:
- accurately describe the Financial module’s current maturity
- distinguish current-state truth from target-state doctrine
- contain a reusable Financial maturity model
- provide a reliable documentation baseline for subsequent implementation prompts
