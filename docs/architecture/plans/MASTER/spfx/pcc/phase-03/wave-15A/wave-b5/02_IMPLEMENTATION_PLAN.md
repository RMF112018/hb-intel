# Implementation Plan — Project Readiness Command Surface Remediation

## Objective

Convert Project Readiness from a default-expanded 62-card anthology into a command-first surface with intentional drill-down detail sections.

The implementation must preserve current data contracts, current module capability, read-only/source boundaries, bento direct-child behavior, and evidence traceability.

## Current-state problem

The default Project Readiness route currently renders:

```text
Native Project Readiness cards
+ Lifecycle Readiness cards
+ Permit/Inspection cards
+ Responsibility Matrix cards
+ Constraints Log cards
+ Buyout Log cards
+ Procore Source Confidence card
+ Unified Lifecycle cards
```

This produces 62 card summaries in live evidence and extreme vertical height at multiple breakpoints.

## Target-state model

### Section ID type

Introduce a local type in the Project Readiness surface area:

```ts
export type PccProjectReadinessSectionId =
  | 'command'
  | 'lifecycle-readiness'
  | 'permits-inspections'
  | 'responsibility-matrix'
  | 'constraints'
  | 'buyout'
  | 'procore-source-confidence'
  | 'unified-lifecycle';
```

Default selected section: `'command'`.

### Default command overview

Default command mode renders no more than 12 cards:

1. Hero / Project readiness context card.
2. Blockers and exceptions.
3. Lifecycle gate summary.
4. Domain posture summary.
5. Ownership and accountability.
6. Evidence and source health.
7. Priority Actions eligibility.
8. Module drill-down index.
9. Optional read-only/source boundary note only if required.

The initial pass may reuse existing card components, but the default overview should not render embedded module region groups.

### Selected detail mode

Selected module mode renders:

```text
Hero / compact Project Readiness context
Module drill-down index
Selected detail cards only
```

Example:

```text
selectedSection = 'permits-inspections'
- Hero
- Module drill-down index
- PccPermitInspectionControlCenterRegions
```

All non-selected detail region groups must be absent from DOM.

## Required file changes

### Primary files

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.module.css
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
```

### Recommended new files

```text
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessSectionTypes.ts
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessModuleIndexCard.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessDetailSectionRenderer.tsx
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessModuleIndexViewModel.ts
apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx
```

Optional if it keeps `PccProjectReadinessSurface.tsx` from becoming too large:

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessCommandRegions.tsx
```

## Implementation sequence

### Phase 1 — Section state and module index

- Add `PccProjectReadinessSectionId`.
- Add `useState<PccProjectReadinessSectionId>('command')` inside the surface/default rendering layer.
- Add `PccProjectReadinessModuleIndexCard`.
- Module index must render one local view-selection control for each detail section plus command overview.
- Mark controls with `data-pcc-readiness-drilldown-control`.
- Ensure all enabled controls are local-only and not action-like.

### Phase 2 — Default command-only render

- Refactor fixture path so default mode renders only native command overview cards and module index.
- Remove embedded module groups from default mode.
- Keep exactly one active-surface marker on the hero/context card.
- Keep all command cards as direct bento children.

### Phase 3 — Selected detail renderer

- Add `PccProjectReadinessDetailSectionRenderer`.
- Given selected section and resolved view-models, render only the selected module group.
- Do not render anything for `selectedSection === 'command'`.
- Ensure every returned card is a direct child of the bento grid. Use fragments, not wrappers.

### Phase 4 — Read-model path parity

- Keep all current hooks unconditional in `ReadModelContent`.
- Use selected section state only after all hooks have run.
- Preserve approvals degradation behavior.
- Refactor Unified Lifecycle hook/card behavior only enough to avoid rendering Unified Lifecycle by default.

### Phase 5 — Loading/error/source-state density

- Replace full fixture scaffold during loading/error with command-only loading/error scaffolds.
- Do not render embedded module groups during loading/error.
- Preserve `PccSurfaceContextHeader` and posture copy.

### Phase 6 — Test hardening

Add/update tests for:

- default Project Readiness card count `<= 12`;
- no non-selected embedded module sections in default DOM;
- selected detail sections render only selected module;
- direct-child invariant remains true;
- drill-down controls are the only enabled buttons;
- executable labels remain absent;
- read-model hooks are unconditional;
- Unified Lifecycle is non-gating and not default-rendered.

## CSS guidance

Use existing CSS module conventions. Add compact classes only in:

```text
PccProjectReadinessSurface.module.css
```

Recommended classes:

```css
.moduleIndexGrid
.moduleIndexItem
.moduleIndexItemSelected
.moduleIndexMeta
.moduleIndexStatusRow
.sectionContext
.sectionContextMeta
.commandBoundaryNote
```

Do not introduce global styles.

## Accessibility requirements

- Controls must be keyboard reachable.
- Use `aria-pressed` or tab semantics.
- Selected module state must be perceivable without relying only on color.
- The selected detail card group should have an accessible heading/label.
- Do not create hover-only meaning.
- Do not add live anchors to external systems.

## Validation commands

At minimum:

```bash
git status --short
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test -- PccProjectReadinessSurface
pnpm --filter @hbc/project-control-center test -- PccProjectReadinessDensityContract
pnpm --filter @hbc/project-control-center test -- PccCardTierContract
pnpm exec prettier --check apps/project-control-center/src/surfaces/projectReadiness apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx apps/project-control-center/src/tests/PccCardTierContract.test.tsx
git diff --check
git status --short
```

If package scripts differ, inspect existing `package.json` scripts and use the repo’s established equivalent commands. Do not edit `package.json`.
