# Prompt 05 — Final Monday Verification and Evidence Package

You are acting as a senior release-readiness, validation, and repo-truth sign-off reviewer for HB Intel.

## Objective

Perform the final Monday-critical verification pass for the provisioning saga and the involved SPFx Estimating, Accounting, and Admin surfaces after Prompts 02 through 04 have completed.

Your job is to determine whether the implementation is materially ready for the Monday commitment, based on code, tests, and focused execution evidence.

## Important instruction

Do not re-read files that are still within your current context or memory.
Reuse active context when available.
Only inspect additional files when necessary to verify a claim or close an uncertainty.

## Scope boundary

Only verify the Monday-critical path:
- provisioning saga continuity
- SPFx Estimating saga entry / response surface
- SPFx Accounting controller review / approval surface
- SPFx Admin recovery / oversight surface
- validated deficiency closure
- test evidence sufficiency

## Required verification steps

### 1. Re-validate the originally validated deficiencies
For each deficiency from Prompt 01 that was fixed in Prompts 02 / 03:
- verify the code changes are present
- verify the intended corrected behavior exists
- verify there is protective test coverage

### 2. Re-run the focused validation suite
Run the focused commands needed to verify:
- backend tests for the provisioning saga critical path
- SPFx surface tests for Estimating / Accounting / Admin
- any relevant combined continuity tests created in Prompt 04

### 3. Assess remaining risk honestly
Classify remaining issues as:
- `Blocker`
- `High`
- `Medium`
- `Low`

Be explicit about whether each one threatens the Monday commitment.

## Required outputs

### 1. Final deficiency closure table
Columns:
- deficiency ID
- validated in Prompt 01
- fixed
- test coverage present
- status
- notes

### 2. Monday readiness verdict
One of:
- `Ready for Monday`
- `Ready for Monday with known low-risk limitations`
- `Not ready for Monday`

### 3. Evidence summary
Include:
- files changed across remediation
- test files changed
- commands run
- pass / fail results
- any failing or skipped scenarios

### 4. Residual-risk register
Only include real remaining risks.
Do not pad the list.

### 5. Recommended next actions
Split into:
- `Must do before Monday`
- `Can wait until after Monday`

## Guardrails

- Do not overclaim readiness.
- Do not ignore partially fixed defects.
- Do not treat untested behavior as proven.
- Keep the verdict tied to the Monday-critical delivery path only.