# Phase 03 — Homepage People & Culture Rebuild

## Objective

Rebuild the homepage People & Culture webpart around the approved product model and the corrected shared primitives. The result should look intentional, premium, rail-aware, and clearly superior to the current three-box stacked composition.

---

## Operating Instructions

You are working in the live repo for `RMF112018/hb-intel`.

Use repo truth from `main` as authoritative.

Do not re-read files that are already in your active context or memory unless you need to verify drift or resolve uncertainty.

Do not perform timid cosmetic cleanup in place of the structural objective of this phase.

Do not broaden the scope beyond this phase except for small adjacent changes that are directly required to keep the implementation coherent and compiling.

---

## In Scope


- `apps/hb-webparts/src/webparts/peopleCulture/`
- supporting homepage-local helpers only where directly needed
- deprecation or removal of superseded implementation paths if Phase 00 required it
- rail-mode and wide-mode implementation if both were approved


---

## Out of Scope


- final real backend/data integration beyond current configuration contracts
- packaging/deployment proof
- unrelated homepage module work


---

## Required Inputs

At minimum, use and reconcile the following where relevant:

- `apps/hb-webparts/src/webparts/peopleCulture/`
- `packages/ui-kit/`
- `apps/hb-webparts/src/homepage/`
- current People & Culture homepage placement and routing seams
- the SPFx UI doctrine governing standard
- the current People & Culture remediation package summary

---

## Required Tasks


1. Implement the rebuilt surface exactly against the product blueprint from Phase 01.
2. Replace the current visual rhythm that reads as stacked subsections.
3. Ensure the top focal moment is obvious.
4. Ensure sparse-data layouts still look premium rather than unfinished.
5. Reduce or eliminate large dead empty boxes in homepage usage.
6. Replace weak placeholder-grade layout decisions with credible homepage composition.
7. Remove or deprecate superseded markup/components where appropriate.
8. Keep authoring and config resilience intact.
9. Preserve host-safe responsive behavior across narrow and wider placements.


---

## Required Deliverables


- rebuilt homepage People & Culture implementation
- removal or formal deprecation of obsolete implementation path(s), if approved
- concise implementation note summarizing what changed architecturally


---

## Validation Requirements


- the rebuilt surface is clearly stronger at homepage zoomed-out viewing
- it no longer reads like three stacked admin sections
- sparse states remain intentional
- the code is cleaner and more directionally coherent than the current split implementation


---

## Completion Standard


Mark this phase complete only when the rendered surface reads as one coherent People & Culture product and not as a stitched-together set of subsections.
