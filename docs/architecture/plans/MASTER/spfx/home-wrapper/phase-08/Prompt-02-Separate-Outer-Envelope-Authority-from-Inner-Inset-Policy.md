# Prompt 02 — Separate Outer Envelope Authority from Inner Inset Policy

## Objective
Clarify the layout model so the homepage runtime uses one shared outer fit contract while still allowing intentional region-specific inset behavior inside that contract.

## Why this work exists
The attached package was directionally right to call for stronger alignment between the wrapper-owned actions strip and the shell below it. It was weaker where it risked implying that identical gutters are the goal.

They are not.

The real requirement is:
- one outer fit authority
- then deliberate inner inset policy by region where justified

The live repo comments already suggest the actions strip is intentionally narrower than the shell modules below it. Preserve that design intent **if** it can be expressed inside a clean shared fit model.

## Governing authority
Use:
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Files / seams to inspect first
- `HbHomepageEntryStack.module.css`
- `HbHomepageShell.module.css`
- any shared token / CSS variable / fit utility introduced in Prompt 01

## Current weakness in nuanced terms
The current implementation and the attached package both blur two different concepts:
- the outer page-canvas fit contract
- the inner visual inset pattern for a specific strip or module band

That creates remediation risk. A local code agent could “unify” the seams in a way that technically removes duplication but also erases deliberate compositional intent.

## Intended future state
After this prompt is complete:
- the code explicitly distinguishes outer fit authority from inner region styling
- the actions region may remain a narrower strip if justified
- the shell may retain different internal padding than the actions strip if justified
- those differences no longer create fit ambiguity

## What must change
1. Document and implement the outer-vs-inner distinction in code.
2. Make shared outer contract values obvious.
3. Make region-specific insets intentional and readable.
4. Remove accidental or ambiguous duplication that pretends to be styling but is really outer-envelope control.

## Done means
Done means the code agent can answer, unambiguously:
- what controls outer fit,
- what controls inner actions-strip insets,
- what controls shell-body insets,
- and why those are different responsibilities.

## Prohibitions
- Do not collapse everything into identical padding unless the code genuinely requires it.
- Do not leave hidden dual authority in place.
- Do not drift into visual redesign beyond what the fit model requires.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Provide:
1. the final outer contract
2. the final inner inset policy by region
3. explanation of why this is more correct than both the prior repo state and the attached package framing
