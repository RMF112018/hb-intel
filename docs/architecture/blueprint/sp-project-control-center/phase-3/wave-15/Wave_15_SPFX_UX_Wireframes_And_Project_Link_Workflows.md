# 12 — UX Wireframes and Interaction Model

## Standards Inheritance

This document inherits existing repository SPFx/UI-kit standards. It does not create a separate UX doctrine for External Systems Launch Pad.

Primary standards references:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Surface-Quality-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Breakpoint-and-Container-Fit-Standard.md`
- `docs/reference/ui-kit/patterns/SPFx-Command-Center-Dashboard-Patterns.md`
- `docs/reference/ui-kit/patterns/SPFx-Widget-and-Bento-Layout-Patterns.md`
- `docs/reference/ui-kit/standards/SPFx-State-Model-Standard.md`

## Screen Inventory

1. Launch Pad Home.
2. Project Launch Links.
3. Add/Edit Project Link Drawer.
4. Custom Link Review Queue.
5. External System Registry.
6. Mapping & Source Health.
7. Mapping Review Detail.
8. Audit History.
9. HBI Source-Lineage Assistant Panel.

Wireframe markdown files are in `docs/wireframes/`.

## Workflow Authorization Boundary

Add/edit/review/approve/archive are UX and future-command behavior only in Prompt 05 documentation.

Prompt 05 does not authorize runtime command endpoints, SharePoint writes, external-system writes, tenant changes, package/lockfile changes, or manifest/version bump.
