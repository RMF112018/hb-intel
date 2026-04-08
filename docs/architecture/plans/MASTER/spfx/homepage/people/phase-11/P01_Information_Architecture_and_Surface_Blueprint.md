# Phase 01 — Information Architecture and Surface Blueprint

## Objective

Define the rebuilt homepage People & Culture experience at the product and composition level before writing the final implementation. The output of this phase should make the later rebuild obvious rather than exploratory.

---

## Operating Instructions

You are working in the live repo for `RMF112018/hb-intel`.

Use repo truth from `main` as authoritative.

Do not re-read files that are already in your active context or memory unless you need to verify drift or resolve uncertainty.

Do not perform timid cosmetic cleanup in place of the structural objective of this phase.

Do not broaden the scope beyond this phase except for small adjacent changes that are directly required to keep the implementation coherent and compiling.

---

## In Scope


- homepage People & Culture hierarchy model
- rail-mode composition
- wide-mode composition if Phase 00 concludes both modes are required
- region priority and suppression rules
- sparse-state strategy
- relationship between homepage summary surface and deeper destination/archive pages
- CTA map and participation-entry map
- state matrix for empty / sparse / healthy / loading / invalid / edit-mode states


---

## Out of Scope


- implementation of shared primitives
- final TSX rebuild
- build/package generation


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


1. Define the new focal sequence for the homepage surface.
2. Decide what content must be primary, what must be secondary, and what must collapse or disappear when data is sparse.
3. Define how announcements, kudos, and celebrations should coexist without feeling like three stacked admin modules.
4. Specify rail-mode layout behavior in enough detail that the final UI build can proceed without inventing the product mid-flight.
5. If dual-mode is required, specify the wide-mode variant and the differences from rail mode.
6. Produce a CTA map that distinguishes homepage prompts from deeper destination/archive pages.
7. Define a state matrix covering:
   - no data
   - one live item only
   - one announcement + no kudos
   - one kudos + no announcement
   - celebrations only
   - invalid config
   - edit mode
   - narrow responsive stress
8. Define explicit suppression rules so empty regions do not dominate the homepage.


---

## Required Deliverables


- one markdown blueprint describing the new homepage composition
- one state matrix
- one CTA / destination map
- one content-priority and suppression-rules note


---

## Validation Requirements


- a later implementation agent could rebuild the surface without guessing the product model
- the outputs clearly explain how the surface should behave with very sparse data
- the new composition avoids the current stacked-box failure mode


---

## Completion Standard


Mark this phase complete only when the final composition, state behavior, and CTA posture are clear enough that the build phase can focus on implementation quality rather than product discovery.
