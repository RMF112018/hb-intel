# Phase 04 — Interaction and Destination Wiring

## Objective

Replace placeholder interactions with real destinations and real participation behavior so the rebuilt People & Culture surface operates like a product rather than a mock shell.

---

## Operating Instructions

You are working in the live repo for `RMF112018/hb-intel`.

Use repo truth from `main` as authoritative.

Do not re-read files that are already in your active context or memory unless you need to verify drift or resolve uncertainty.

Do not perform timid cosmetic cleanup in place of the structural objective of this phase.

Do not broaden the scope beyond this phase except for small adjacent changes that are directly required to keep the implementation coherent and compiling.

---

## In Scope


- CTA destination wiring for homepage actions
- any People & Culture / Kudos destination-page routing or linking required to complete the experience
- real behavior contract for recognition participation affordances such as Give Kudos / Celebrate
- compact UX refinements necessary to support the interaction model


---

## Out of Scope


- full backend workflow automation unless already present and directly ready to wire
- unrelated route refactors
- visual redesign unrelated to the interaction contract


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


1. Replace all placeholder hash-based CTA destinations that remain in the People & Culture flow.
2. Ensure every surfaced CTA has a real target or a clearly governed temporary fallback path.
3. Decide what `Celebrate` actually does in the current implementation horizon and wire it accordingly.
4. Ensure the homepage surface, archive/destination surface, and participation entry points are coherent.
5. Ensure link labeling and hierarchy reflect real outcomes for the user.
6. Document any intentionally deferred interaction that cannot be fully completed in this phase.


---

## Required Deliverables


- updated CTA and route wiring
- any supporting page/destination integration changes
- concise interaction contract note for homepage participation behavior


---

## Validation Requirements


- no high-visibility CTA remains a placeholder hash route
- homepage actions lead to real destinations
- the participation affordances no longer feel fake or decorative


---

## Completion Standard


Mark this phase complete only when the homepage People & Culture surface can be meaningfully used, not just viewed.
