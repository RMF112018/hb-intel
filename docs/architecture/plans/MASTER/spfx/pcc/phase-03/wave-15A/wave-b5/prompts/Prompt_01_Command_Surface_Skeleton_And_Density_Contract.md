# Prompt 01 — Command Surface Skeleton and Default Density Contract

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

Create the command/detail skeleton for Project Readiness and make the default surface command-first. The default view must render no embedded module detail groups and must target no more than 12 cards.

## Required repo check

Run:

```bash
git status --short
```

Record pre-existing changes. Do not touch unrelated files.

## Primary files

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.module.css
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx
```

Recommended new files:

```text
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessSectionTypes.ts
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessModuleIndexCard.tsx
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessModuleIndexViewModel.ts
```

## Implementation requirements

### 1. Add section ID contract

Create:

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

Default selected section is `'command'`.

### 2. Add module index card

Create `PccProjectReadinessModuleIndexCard`.

It must:

- render as a `PccDashboardCard`;
- use explicit `tier` and `region`;
- contain local `button type="button"` controls only;
- include a button for command overview and each detail section;
- mark each control with `data-pcc-readiness-drilldown-control="<section-id>"`;
- mark selected state with `data-pcc-readiness-drilldown-state="selected"`;
- use `aria-pressed`;
- use copy that clearly communicates view selection, such as `View details`;
- avoid workflow/action copy.

### 3. Default command-only rendering

Refactor the fixture/no-client path so the default view renders:

- Project readiness hero/context card.
- Native command-critical readiness cards.
- Module index card.

It must not render these embedded groups by default:

```text
LifecycleReadinessRegions
PccPermitInspectionControlCenterRegions
PccResponsibilityMatrixRegions
PccConstraintsLogRegions
PccBuyoutLogRegions
PccProjectReadinessProcoreSourceConfidenceCard
PccProjectReadinessUnifiedLifecycleSection
```

### 4. Preserve active marker

Exactly one card must carry:

```text
data-pcc-active-surface-panel="project-readiness"
```

Keep it on the hero/context card.

### 5. Density test

Add `PccProjectReadinessDensityContract.test.tsx`.

Test:

- default Project Readiness card count is `<= 12`;
- default Project Readiness contains zero embedded module section markers:
  - `data-pcc-readiness-section="lifecycle-readiness-center"`;
  - `data-pcc-readiness-section="permit-inspection-control-center"`;
  - `data-pcc-readiness-section="responsibility-matrix"`;
  - `data-pcc-readiness-section="constraints-log"`;
  - `data-pcc-readiness-section="buyout-log"`;
- exactly one active surface marker exists;
- no `[data-pcc-card] [data-pcc-card]` nesting exists;
- every default card is a direct child of `[data-pcc-bento-grid]`;
- enabled buttons, if any, must all have `data-pcc-readiness-drilldown-control`.

## Validation

Run targeted validation:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test -- PccProjectReadinessSurface
pnpm --filter @hbc/project-control-center test -- PccProjectReadinessDensityContract
pnpm exec prettier --check apps/project-control-center/src/surfaces/projectReadiness apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx
git diff --check
git status --short
```

Use equivalent repo scripts if the exact filter/script names differ. Do not edit package scripts.

## Closeout response

Return:

```text
Files changed:
Validation:
Default Project Readiness card count:
Embedded section markers absent by default:
Known residual risks:
```
