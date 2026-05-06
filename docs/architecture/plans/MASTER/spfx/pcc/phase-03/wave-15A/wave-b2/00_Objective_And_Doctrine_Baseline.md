# 00 — Objective and Doctrine Baseline

## Objective

Remediate the Project Control Center shared shell, hero, command affordance, and tab rail to move the surface toward flagship / premium UI-kit grade while preserving the current Phase 3 preview posture and avoiding live operational scope.

## Current Problem Statement

The current shared shell is directionally improved after the prior thin-shell remediation, but the visible outcome remains below flagship grade:

- the hero is flat, vanilla, and weakly hierarchical;
- the project facts are not visually grouped;
- the hero does not read as a distinct command-surface header;
- the tab rail blends into the hero instead of reading as a refined navigation layer;
- selected tab contrast is weak;
- tab icons are misleading or not worth the semantic cost;
- command search looks available but is intentionally non-functional in preview;
- the shell still uses reference placeholder identity instead of the same sample profile used by Project Home.

## Governing Doctrine Expectations

The implementation must align with the repository doctrine under:

```text
docs/reference/ui-kit/doctrine/
docs/reference/ui-kit/standards/
docs/reference/ui-kit/patterns/
```

Critical doctrine obligations:

- Respect SharePoint host chrome; do not duplicate SharePoint shell controls.
- Own the page canvas with premium, productized composition.
- Avoid generic enterprise card-grid posture as the dominant premium answer.
- Use branded tokens and UI-kit primitives where available.
- Maintain container-aware breakpoint behavior.
- Preserve keyboard and accessibility quality.
- Treat hard-stop failures as blockers even if the numeric score improves.
- Do not claim final 56/56 without evidence-backed scoring.

## Scope Inclusions

Allowed scope:

- PCC shared shell visual structure.
- PCC hero information architecture and styling.
- PCC tab rail label taxonomy, styling, active state, focus state, and animation.
- PCC disabled command affordance treatment.
- Tests for shell, hero, tab rail, command affordance, responsive behavior, and a11y semantics.
- README and Wave 15A evidence/closeout documentation.

Likely source files:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/preview/projectPlaceholder.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.module.css
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/src/tests/**/*.test.tsx
apps/project-control-center/README.md
```

## Scope Exclusions

Do not introduce:

- live search;
- command palette execution;
- live tenant writes;
- Graph / PnP / SharePoint REST calls;
- Procore / Document Crunch / Adobe Sign runtime calls;
- approval/workflow execution;
- backend route changes;
- package, manifest, or SPPKG changes;
- dependency installs;
- `pnpm-lock.yaml` drift.

## Product Decisions Already Locked

- Hero primary title: `Project Control Center`.
- Hero secondary title: active surface name.
- Do not show project number in hero.
- Mandatory facts: location, estimated value, scheduled completion, project stage.
- Excluded facts: client, project status, source confidence, last updated.
- Tab label: `External Platforms`.
- Page title: `External Platforms Launch Pad`.
- Remove tab rail icons for now.
- Use branded UI-kit colors/tokens.
- Command search remains a disabled preview affordance.

## Definition of Success

The remediated shell succeeds when:

- the hero reads as a distinct premium PCC command surface;
- the hero has clear first/second/third read hierarchy;
- the tab rail is visually distinct, animated, accessible, and text-only;
- active tab selection is obvious without relying on icons;
- the disabled command affordance no longer misleads users;
- the shell uses the same canonical preview project identity as Project Home;
- the implementation has meaningful unit tests and hosted evidence;
- the closeout documents residual limitations honestly.
