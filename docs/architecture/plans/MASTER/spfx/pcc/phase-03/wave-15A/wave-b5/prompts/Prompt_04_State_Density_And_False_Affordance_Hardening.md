# Prompt 04 — State Density and False-Affordance Hardening

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

Harden loading, error, degraded/source-state, and false-affordance behavior after the command/detail refactor. Loading/error must not render the expanded fixture/module wall, and enabled controls must be limited to local view selection.

## Primary files

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessModuleIndexCard.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx
```

## Implementation requirements

### 1. Loading state

When Project Readiness view model is loading:

- render hero/context loading card;
- render module index if safe and meaningful, or a compact loading skeleton card;
- do not render `FixtureScaffoldRegions` as a full default replacement;
- do not render embedded module groups.

### 2. Error state

When Project Readiness view model is error:

- render hero/context error card;
- render compact source/error state copy;
- do not render embedded module groups;
- do not render the full fixture scaffold.

### 3. Source unavailable / degraded state

For non-available source states, preserve safe preview-shaped data from the adapter, but do not use source degradation as a reason to render the embedded module wall.

### 4. False-affordance hardening

Revise old tests that asserted all Project Readiness buttons are disabled.

New rule:

- enabled buttons are allowed only when they have `data-pcc-readiness-drilldown-control`;
- no enabled drill-down button may have workflow-like labels;
- all non-drilldown buttons must be disabled or `aria-disabled="true"`.

Add a forbidden-label test:

```ts
const forbiddenEnabledLabel =
  /^(submit|approve|upload|run|execute|sync|write\s*back|writeback|complete\s*checklist|launch|create|modify|delete|save)$/i;
```

### 5. Accessibility

Ensure drill-down controls:

- are keyboard-accessible;
- have selected state via `aria-pressed` or tab semantics;
- use non-color-only selected indication;
- have clear text labels.

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
Loading/error density behavior:
False-affordance rule implemented:
Enabled drill-down control count:
Validation:
Known residual risks:
```
