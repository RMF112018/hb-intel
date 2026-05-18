# Prompt 10 | Parity Harness, Telemetry, and Operator Evidence

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

Prove the projection subsystem matches the current My Projects semantics and provide operator-quality evidence for cutover readiness.

## Required Package Inputs

Review:
- `08_Telemetry_Observability_And_Operational_Runbooks.md`
- `10_Validation_Acceptance_And_Test_Matrix.md`
- `resources/App_Insights_KQL_Query_Pack.md`

## Locked Implementation Requirements

1. Build or complete fixture parity harness comparing:
   - legacy aggregation output,
   - projection engine output,
   - projection-backed read envelope.
2. Cover representative cases:
   - projects-only,
   - merged explicit match,
   - merged unique projectNumber/year fallback,
   - legacy-only,
   - missing launch URL warnings,
   - invalid Procore token,
   - Projects role fallback path,
   - soft-deactivation/reactivation behavior.
3. Confirm telemetry event names/properties align across:
   - notification ingress,
   - queue worker,
   - delta pull,
   - projection recompute,
   - subscription renewal,
   - projection read.
4. Produce docs/evidence updates if repo conventions support evidence artifacts.
5. Ensure KQL pack names match final committed telemetry names or update KQL resource accordingly.

## Expected Validations

- Full scoped backend test suite for new subsystem.
- Typecheck backend.
- If reasonable, targeted frontend/tests to prove no contract drift.

## Do Not Do Yet

- Do not perform production cutover.
