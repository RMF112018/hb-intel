# Prompt 01 — Primitive Contract Instrumentation and Visual Tier Hardening

## Objective

Remediate the shared `PccDashboardCard` primitive so the PCC card contract is explicit, testable, and visually stronger.

This prompt must not migrate every surface yet. It prepares the primitive for the following surface-wide prompts.

## Context

The current `PccDashboardCard` already supports `tier`, `region`, `headingLevel`, `density`, `ariaDescribedBy`, and `dataActiveSurfacePanel`.

The gap is that tests cannot currently distinguish:

- explicit tier from `hierarchy` fallback;
- explicit region from resolved fallback;
- explicit heading level from resolved default.

The current card styling also remains too subtle; hosted screenshots still read too much like a thin-border white-card grid.

## Files To Inspect

Read only as needed. Do not re-read files still in current context unless exact edit context is required.

```text
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccDashboardCard.module.css
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccBentoGrid.module.css
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/layout/useBentoRowSpan.ts
apps/project-control-center/src/layout/useBentoRowSpan.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
```

## Required Changes

### 1. Add card contract source instrumentation

Update `PccDashboardCard.tsx` to emit:

```tsx
data-pcc-card-tier-source="explicit" | "hierarchy" | "default"
data-pcc-card-region-source="explicit" | "resolved"
data-pcc-heading-level="2" | "3" | "4"
```

Required behavior:

- `tierSource = "explicit"` when `tier` prop is provided.
- `tierSource = "hierarchy"` when no `tier` prop is provided but `hierarchy !== "standard"`.
- `tierSource = "default"` when neither explicit tier nor non-standard hierarchy is provided.
- `regionSource = "explicit"` when `region` prop is provided.
- `regionSource = "resolved"` when region is inferred.
- `data-pcc-heading-level` equals the final resolved heading level.

Do not remove existing markers.

### 2. Preserve public API compatibility

Do not remove:

- `hierarchy`
- `tier`
- `region`
- `density`
- `headingLevel`
- `dataActiveSurfacePanel`

Do not break current callers.

### 3. Strengthen visual hierarchy

Update `PccDashboardCard.module.css` to make tier and region distinctions materially visible.

Target behavior:

- Tier 1 command cards should read as route-leading command cards.
- Tier 2 operational cards should read as active workbench cards.
- Tier 3 reference cards should be calmer and subordinate.
- State cards should be clearly stateful and not visually broken.
- Deferred cards should be visibly non-operational.
- Detail and rail regions should have distinguishable layout rhythm where practical.

Constraints:

- Use existing `--pcc-*` tokens.
- Avoid hardcoded colors where tokens exist.
- Keep contrast credible.
- Do not hide content.
- Do not use `grid-auto-flow: dense`.
- Do not change bento grid mechanics unless a test exposes a primitive defect.

### 4. Add focused primitive tests

Add or update tests to cover:

- explicit tier source;
- hierarchy fallback tier source;
- default tier source;
- explicit region source;
- resolved region source;
- heading level marker;
- direct bento child behavior remains intact;
- no dense grid behavior remains intact;
- row-span tests still pass.

Recommended new file:

```text
apps/project-control-center/src/layout/PccDashboardCard.contract.test.tsx
```

Use existing test conventions if a better nearby test file exists.

## Non-Goals

Do not migrate all surface cards in this prompt.

Do not modify read-model data.

Do not introduce new route behavior.

Do not introduce new backend routes or integrations.

## Validation

Run:

```bash
git status --short
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test -- PccDashboardCard
pnpm --filter @hbc/project-control-center test -- useBentoRowSpan
pnpm exec prettier --check apps/project-control-center/src/layout
git diff --check
```

If package names differ, inspect package scripts and use the closest equivalent.

## Deliverables

- Updated `PccDashboardCard.tsx`.
- Updated `PccDashboardCard.module.css`.
- New or updated primitive contract test.
- Validation output.

## Closeout Response Required From Agent

Return:

```text
Prompt 01 completed.

Files changed:
- <path>
- <path>

Validation:
- <command>: <result>
- <command>: <result>

Notes:
- <any intentional deviation or risk>
```
