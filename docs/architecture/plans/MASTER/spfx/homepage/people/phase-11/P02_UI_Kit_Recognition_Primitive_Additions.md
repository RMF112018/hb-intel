# Phase 02 — UI Kit Recognition Primitive Additions

## Objective

Add the minimum justified set of shared homepage primitives needed to support a premium People & Culture surface, rather than forcing the rebuilt webpart to rely on ad hoc inline styling or misfit editorial primitives.

---

## Operating Instructions

You are working in the live repo for `RMF112018/hb-intel`.

Use repo truth from `main` as authoritative.

Do not re-read files that are already in your active context or memory unless you need to verify drift or resolve uncertainty.

Do not perform timid cosmetic cleanup in place of the structural objective of this phase.

Do not broaden the scope beyond this phase except for small adjacent changes that are directly required to keep the implementation coherent and compiling.

---

## In Scope


- narrowly targeted additions or extensions in `packages/ui-kit/`
- homepage entrypoint exports needed for the rebuilt People & Culture surface
- shared styles/variants for recognition, praise, celebration, and compact cultural moments where justified
- documentation/comments needed so the new primitives are clearly governed


---

## Out of Scope


- full package-wide `@hbc/ui-kit` redesign
- unrelated webpart refactors
- homepage shell changes outside what is directly required by the new People & Culture primitives


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


1. Review the outputs of Phase 01 and determine which parts should become shared primitives versus stay local to the People & Culture implementation.
2. Add only the primitives or variants that are clearly reusable and justified.
3. Prefer a coherent surface family over a bag of unrelated helper components.
4. Ensure the new primitives support the required hierarchy, warmth, density, and host-safe polish.
5. Ensure imports remain governed through `@hbc/ui-kit/homepage` where appropriate.
6. Avoid bloating the shared kit with highly specific one-off logic unless no cleaner boundary exists.
7. Add concise inline documentation or package-level notes for the new primitives.


---

## Required Deliverables


- shared primitive implementation files
- any supporting style modules/variants
- updated homepage entrypoint exports
- concise documentation note identifying the purpose and intended usage of the new primitive family


---

## Validation Requirements


- the new primitives compile cleanly
- the primitives map directly to the architecture defined in Phase 01
- the primitives reduce, rather than increase, ad hoc styling pressure in the webpart
- the additions are narrow, purposeful, and governed


---

## Completion Standard


Mark this phase complete only when the rebuilt People & Culture webpart can reasonably be implemented on top of the new/shared primitives without falling back to a patchwork of generic cards and inline hover mutations.
