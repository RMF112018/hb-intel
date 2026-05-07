# Prompt 03 — Read-Model Parity and Unified Lifecycle Refactor

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

Preserve read-model behavior while preventing Unified Lifecycle cards from rendering in the default command overview. Keep all hooks unconditional and make Unified Lifecycle render only when selected.

## Required context

Prompts 01 and 02 should have already introduced command/detail selection and selected detail rendering. Do not re-read files still in your current context.

## Primary files

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessUnifiedLifecycleSection.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessDetailSectionRenderer.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx
```

## Implementation requirements

### 1. Preserve unconditional hooks

In `ReadModelContent`, keep all current read-model hooks unconditional:

- `useProjectReadinessReadModel`
- `useLifecycleReadinessReadModel`
- `usePermitInspectionControlCenterReadModel`
- `useResponsibilityMatrixReadModel`
- `useConstraintsLogReadModel`
- `useBuyoutLogReadModel`
- `useProcoreSurfaceReadModel`
- Unified Lifecycle hook/state resolution

Do not call hooks inside selected-section branches.

### 2. Refactor Unified Lifecycle rendering

Current `PccProjectReadinessUnifiedLifecycleSection` calls `useUnifiedLifecycleReadModel` and directly renders three cards.

Refactor safely using one of these approaches:

#### Preferred

Split into:

```ts
useProjectReadinessUnifiedLifecycleState(...)
PccProjectReadinessUnifiedLifecycleCards(...)
```

- Hook/state is called unconditionally in `ReadModelContent`.
- Cards render only when `selectedSection === 'unified-lifecycle'`.

#### Acceptable

Keep `PccProjectReadinessUnifiedLifecycleSection` but render it only from selected detail path if its hook call is not conditional in a way that violates React hook rules. This usually requires moving the hook call up, so the preferred approach is safer.

### 3. Unified Lifecycle detail tests

Add tests that:

- default command overview does not render `Lifecycle Timeline`, `Project Memory`, or `Related Records` from Unified Lifecycle;
- selecting `unified-lifecycle` renders those three cards;
- Unified Lifecycle loading/error states are localized and do not block Project Readiness hero/module index;
- cards remain direct bento children.

### 4. Read-model parity tests

Add or update tests with a mock read-model client to prove:

- read-model hooks/calls still occur in read-model path;
- approvals fetch failure still degrades without failing primary readiness;
- Unified Lifecycle failure does not prevent default command rendering;
- default read-model path still has card count <= 12.

Do not overfit to exact hook internals if stable call-count assertions are already brittle. Use visible behavior and mock client method calls where appropriate.

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
Unified Lifecycle refactor approach:
Read-model parity evidence:
Default command card count:
Validation:
Known residual risks:
```
