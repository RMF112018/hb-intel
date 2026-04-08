# Phase 05 — States, Sparse Data, and Authoring Hardening

## Objective

Make the rebuilt surface production-safe under low-content, partial-config, invalid-config, edit-mode, and responsive stress conditions without sacrificing the premium result.

---

## Operating Instructions

You are working in the live repo for `RMF112018/hb-intel`.

Use repo truth from `main` as authoritative.

Do not re-read files that are already in your active context or memory unless you need to verify drift or resolve uncertainty.

Do not perform timid cosmetic cleanup in place of the structural objective of this phase.

Do not broaden the scope beyond this phase except for small adjacent changes that are directly required to keep the implementation coherent and compiling.

---

## In Scope


- loading, empty, invalid, and sparse-state behavior
- edit-mode readability
- responsive degradation
- authoring safety
- content suppression/fallback rules
- avatar/media fallback behavior
- small polish directly tied to state resilience


---

## Out of Scope


- major new architectural changes that should have been decided earlier
- packaging/deployment work except light local verification


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


1. Test the rebuilt surface against the full state matrix defined in Phase 01.
2. Refine the UI so one-item and zero-item states still look intentional.
3. Ensure empty or missing Kudos does not collapse the module into a large dead area.
4. Ensure missing media/avatar cases remain visually credible.
5. Ensure edit mode remains readable and stable.
6. Ensure the surface remains effective at narrow widths and at zoomed-out homepage viewing.
7. Remove any awkward state-specific layout artifacts introduced during the rebuild.


---

## Required Deliverables


- hardened state behavior in the People & Culture implementation
- any necessary fallback helpers/styles
- concise hardening note documenting the tested states and resulting behavior


---

## Validation Requirements


- sparse and empty states do not visually dominate the homepage
- invalid or partial data falls back gracefully
- edit mode and responsive behavior remain credible
- the premium character survives imperfect content conditions


---

## Completion Standard


Mark this phase complete only when the rebuilt surface feels intentional with both rich content and very sparse content.
