# People & Culture Webpart — Remediation Package Summary

## Objective

Remediate the People & Culture webpart by replacing the current underperforming presentation architecture with a premium, rail-first, host-aware SharePoint surface, while adding only the `@hbc/ui-kit` primitives that are genuinely required to support that result.

---

## Why This Package Exists

The current implementation has real effort in it, but it is still underperforming because:

- the product model is split between a simple editorial surface and a merged three-region surface
- the current right-rail rendering reads as stacked boxed subsections rather than one coherent culture experience
- sparse demo data causes the empty Kudos region to dominate the live content
- CTA and participation affordances are still too placeholder-driven
- `@hbc/ui-kit` does not yet appear to offer a first-class recognition / celebration homepage surface family

This package resolves those issues in a phased order.

---

## Phase Map

### Phase 00 — Repo Truth Freeze and Product Decision
Lock the authoritative architecture, decide what survives, decide what is deprecated, and prevent more polishing of an unclear product model.

### Phase 01 — Information Architecture and Surface Blueprint
Define the new homepage behavior, hierarchy, region priority, suppression rules, rail mode, wide mode, and state matrix.

### Phase 02 — UI Kit Recognition Primitive Additions
Add the narrowly required shared primitives for recognition / celebration / praise surfaces so the homepage implementation does not devolve into ad hoc styling.

### Phase 03 — Homepage People & Culture Rebuild
Implement the rebuilt surface in the webpart using the approved architecture and new/shared primitives.

### Phase 04 — Interaction and Destination Wiring
Replace placeholder CTA behavior and fake participation cues with real routing and real interaction contracts.

### Phase 05 — States, Sparse Data, and Authoring Hardening
Ensure the surface is credible with very low content density, partial configuration, and edit-mode / responsive stress cases.

### Phase 06 — Build, Package, and SharePoint Validation
Run the clean build, produce the updated `hb-webparts.sppkg`, and prove the deployed output matches the intended remediation.

---

## Non-Negotiables

- Respect SharePoint host constraints.
- Preserve authoring safety.
- Do not keep both People & Culture implementations alive without explicit justification.
- Do not ship placeholder CTA destinations in the final result.
- Do not accept a surface that still looks optional or easy to overlook at zoomed-out homepage viewing.
- Do not solve this by adding more generic boxes.

---

## Required Completion Evidence Per Phase

Each phase should produce:

- a concise completion note
- changed file list
- validation summary
- unresolved questions, if any
- explicit statement of whether the next phase may proceed

---

## Preferred Final Product Posture

The homepage webpart should become:

- rail-first
- premium but host-aware
- emotionally warm without kitsch
- participation-oriented, not just informational
- visually distinct from general editorial surfaces
- robust in sparse, empty, and partial-data states
- wired to real destinations and flows
