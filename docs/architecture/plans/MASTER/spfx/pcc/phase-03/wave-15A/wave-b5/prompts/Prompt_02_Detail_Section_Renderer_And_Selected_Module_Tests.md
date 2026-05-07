# Prompt 02 — Detail Section Renderer and Selected Module Tests

## Role

You are the local code agent working in the `hb-intel` repository. You are implementing a controlled Project Readiness remediation for the PCC SPFx application.

## Non-negotiable agent instructions

- Do not re-read files that are still within your current context or memory.
- Do not touch unrelated dirty files.
- Do not edit `package.json`, `pnpm-lock.yaml`, package-solution files, or manifests.
- Do not modify `PccBentoGrid`, `PccDashboardCard`, or `footprints.ts` unless a blocking validation failure proves this remediation cannot be completed otherwise. If that happens, stop and report the exact evidence before editing primitives.
- Preserve bento direct-child behavior: every rendered `[data-pcc-card]` must have `parentElement === [data-pcc-bento-grid]`.
- Do not nest `PccDashboardCard` inside another `PccDashboardCard`.
- Do not introduce live writes, uploads, syncs, approvals, external launches, mutations, or API side effects.
- Preserve read-only/source-confidence/HBI/source-of-record boundary language.
- Keep all implementation within the Project Readiness surface and its tests unless this prompt explicitly names another file.

## Objective

Wire all embedded module detail groups behind selected Project Readiness sections. The selected detail group must render as direct bento children, and all non-selected groups must be absent from the DOM.

## Required context

Prompt 01 should already have introduced:

- `PccProjectReadinessSectionId`;
- `PccProjectReadinessModuleIndexCard`;
- default command-only rendering;
- `PccProjectReadinessDensityContract.test.tsx`.

Do not re-read those files if they are already in your active context.

## Primary files

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessDetailSectionRenderer.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx
```

## Implementation requirements

### 1. Add detail renderer

Create `PccProjectReadinessDetailSectionRenderer`.

It should accept:

```ts
selectedSection: PccProjectReadinessSectionId
lifecycleViewModel
permitInspectionViewModel
responsibilityMatrixViewModel
constraintsLogViewModel
buyoutLogViewModel
procoreViewModel
unifiedLifecycleStateOrProps // leave for Prompt 03 if not yet ready
```

For `selectedSection === 'command'`, render `null`.

For other sections, render only the selected detail group:

```tsx
'lifecycle-readiness' -> <LifecycleReadinessRegions viewModel={...} />
'permits-inspections' -> <PccPermitInspectionControlCenterRegions viewModel={...} />
'responsibility-matrix' -> <PccResponsibilityMatrixRegions viewModel={...} />
'constraints' -> <PccConstraintsLogRegions viewModel={...} />
'buyout' -> <PccBuyoutLogRegions viewModel={...} />
'procore-source-confidence' -> <PccProjectReadinessProcoreSourceConfidenceCard viewModel={...} />
'unified-lifecycle' -> temporary placeholder or current component only if safe; Prompt 03 will finalize
```

Use fragments, not wrapper sections that would break direct-child assertions.

### 2. Selected detail mode layout

When selected section is not `command`, render:

```text
Project Readiness hero/context card
Module index card
Selected detail renderer
```

Do not render all default command cards plus selected detail.

### 3. Tests for each selected section

Add tests that:

- click each local drill-down control;
- assert the selected section renders;
- assert non-selected section markers do not render;
- assert all cards are direct children;
- assert no card nesting;
- assert exactly one active surface marker remains.

Minimum section marker checks:

```text
lifecycle-readiness -> data-pcc-readiness-section="lifecycle-readiness-center"
permits-inspections -> data-pcc-readiness-section="permit-inspection-control-center"
responsibility-matrix -> data-pcc-readiness-section="responsibility-matrix"
constraints -> data-pcc-readiness-section="constraints-log"
buyout -> data-pcc-readiness-section="buyout-log"
procore-source-confidence -> data-pcc-card-id="procore-source-confidence"
```

If Unified Lifecycle is not finalized until Prompt 03, add a pending/placeholder test only if it does not weaken the suite. Prefer to defer Unified Lifecycle detail assertions to Prompt 03.

### 4. Preserve local-only controls

The module index controls are the only allowed enabled buttons. All other workflow buttons remain disabled or absent.

## Validation

Run:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test -- PccProjectReadinessSurface
pnpm --filter @hbc/project-control-center test -- PccProjectReadinessDensityContract
pnpm exec prettier --check apps/project-control-center/src/surfaces/projectReadiness apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx
git diff --check
git status --short
```

## Closeout response

Return:

```text
Files changed:
Selected sections implemented:
Default card count:
Selected detail direct-child result:
Validation:
Known residual risks:
```
