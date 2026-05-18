# Prompt 14 | Stage-Three Admin UI Controls

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

Implement the later-stage UI control surface for authorized operators to inspect and trigger projection subsystem administration. This prompt is not MVP-cutover blocking.

## Required Package Inputs

Review:
- `08_Telemetry_Observability_And_Operational_Runbooks.md`
- `runbooks/Runbook_05_Production_Monitoring.md`
- existing admin/UI conventions in the repo.

## Locked Scope

Build an operator-facing admin UI that may include:
1. current projection subsystem health,
2. source subscription status,
3. last successful sync per source list,
4. last seed/rebuild run summary,
5. drift audit trigger,
6. manual rebuild trigger,
7. operator-safe warnings and status explanations.

## Guardrails

- Do not expose secrets, tokens, or raw assertion material.
- Use existing admin authorization posture.
- UI calls backend admin endpoints; it does not reach Table Storage or Graph directly.
- This UI is staged after backend stability and must not alter the core production read path.

## Expected Validations

- UI tests / route client tests as appropriate.
- Authorization posture validated.
- Typecheck/build lanes relevant to edited app surfaces.
