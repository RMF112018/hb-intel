# Prompt-09 — Operator Safety, Preview, Audit, and History UX

## Objective

Finish the operator-facing execution experience for Phase 9 by adding the risk-aware preview, result, and audit/history behavior needed to make Entra actions usable and defensible.

## Important execution rules

- Do not re-read files still in active context unless needed.
- Use the risk taxonomy from Prompt-03 as the controlling design input.
- Add enough safety UX for Phase 9 to be serious and operable, but do not drift into full Phase 11 maturity work.
- Keep the UI backed by real backend evidence/results.

## Scope

Complete the operator-facing experience for the approved Entra workflows, including:
- risk display,
- preview/impact summaries where phase-appropriate,
- explicit destructive confirmations where required,
- result states,
- history/audit browsing hooks or views,
- clear failure guidance.

## Required implementation outcomes

### A. Risk-aware execution UX
Each action surface must reflect:
- the action name,
- the target,
- the risk tier,
- destructive or non-destructive status,
- and any checkpoint/confirmation requirement.

### B. Preview or impact summary behavior
For actions designated as preview-worthy by the action catalog, show a usable pre-execution summary before submission.

### C. Result and failure UX
Operators must receive clear result/failure states, including actionable backend error messages when safe to surface.

### D. Audit/history visibility
Expose the phase-appropriate audit/history information now available for Entra actions. This can be:
- a dedicated page,
- a pane,
- a section within the Entra lane,
depending on the repo’s current admin-shell pattern.

### E. No-go behavior
Do not add fake history/audit UI if the underlying evidence is not real.
Do not hide risky/destructive identity operations behind casual-looking buttons.

## Documentation requirement

Update phase docs if implementation reveals a material UX or evidence-model clarification.

## Validation

Run focused frontend/backend tests as needed for:
- preview handling
- confirmation handling
- result rendering
- error rendering
- audit/history data flow

## Completion condition

Stop when the Entra lane has a risk-aware operator experience backed by real workflow results and phase-appropriate audit/history visibility.
