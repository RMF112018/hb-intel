# 12 — UX Wireframes and Interaction Model

## Scope

This document defines developer-ready UX specifications and workflow behavior boundaries for External Systems Launch Pad in Wave 15.

## Standards Inheritance

This feature inherits existing repository SPFx/UI-kit doctrine and standards and does not define a separate UX doctrine.

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Surface-Quality-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Breakpoint-and-Container-Fit-Standard.md`
- `docs/reference/ui-kit/patterns/SPFx-Command-Center-Dashboard-Patterns.md`
- `docs/reference/ui-kit/patterns/SPFx-Widget-and-Bento-Layout-Patterns.md`
- `docs/reference/ui-kit/standards/SPFx-State-Model-Standard.md`

## Deliverable Boundary

- Developer-ready UX specs/wireframes only.
- Not final pixel-perfect visual design.
- Not runtime implementation.
- Not a new UX doctrine.

## Screen Inventory

1. Launch Pad Home.
2. Project Launch Links.
3. Add/Edit Project Link Drawer.
4. Custom Link Review Queue.
5. External System Registry.
6. Mapping and Source Health.
7. Mapping Review Detail.
8. Audit History.
9. HBI Source-Lineage Panel.

Canonical screen specs are stored in:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/`

## Workflow Behavior Boundary Lock

Add/edit/review/approve/archive are documented as UX and future-command behavior only.

Prompt 05/05R do not authorize:

- runtime command endpoints,
- SharePoint writes,
- external-system writes,
- tenant mutations,
- package or lockfile edits,
- manifest/version bump.

## Degraded-State Treatment

`external_system_degraded_state_matrix.json` is used as UX-state input and architecture boundary context only. It is not runtime degraded-state implementation guidance in Prompt 05/05R.
