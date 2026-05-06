# 10 — Implementation Sequence

## Objective

Provide an ordered plan that minimizes regression risk and token waste.

## Phase 0 — Repo Truth and Baseline

1. Run:
   ```bash
   git status --short
   git rev-parse HEAD
   md5 pnpm-lock.yaml
   ```
2. Inspect only the specific files needed for Prompt 02.
3. Do not re-read files already visible in the current agent context unless verifying drift.

## Phase 1 — Primitive API

Files:

```text
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccDashboardCard.module.css
apps/project-control-center/src/layout/PccDashboardCard.test.tsx
```

Tasks:

1. Add exported `PccCardTier`.
2. Add exported `PccCardRegion`.
3. Extend props.
4. Add resolution helpers.
5. Add heading/ARIA implementation.
6. Add data markers.
7. Preserve legacy markers.

Validation:

```bash
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center test -- PccDashboardCard
```

## Phase 2 — Visual Tier CSS

Files:

```text
apps/project-control-center/src/layout/PccDashboardCard.module.css
```

Tasks:

1. Add tier selectors.
2. Add region selectors.
3. Remove global dashed full-footprint styling.
4. Add state/deferred styling.
5. Keep token discipline.

Validation:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccDashboardCard
```

## Phase 3 — Footprint Expansion

Files:

```text
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/layout/footprints.test.ts
```

Tasks:

1. Add `rail`.
2. Add `detail`.
3. Update all span maps.
4. Update min span maps.
5. Update min inline size maps.
6. Add exhaustive tests.

Validation:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- footprints
```

## Phase 4 — Project Home Migration

Files:

```text
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/tests/PccProjectHome*.test.tsx
```

Tasks:

1. Apply explicit tier/region/heading to every Project Home card.
2. Convert Team Snapshot and Project Lens to rail footprint.
3. Convert Lifecycle Timeline / Ask HBI / Related Records to detail footprint as specified.
4. Preserve read-model and fixture paths.
5. Add tests.

## Phase 5 — Documents, Site Health, Settings

Files:

```text
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/surfaces/siteHealth/**
apps/project-control-center/src/surfaces/controlCenterSettings/**
```

Tasks:

1. Apply matrix targets.
2. Convert detail/reference/deferred cards.
3. Preserve inert behavior and no live links.
4. Add route tests.

## Phase 6 — Approvals and External Systems

Files:

```text
apps/project-control-center/src/surfaces/approvals/**
apps/project-control-center/src/surfaces/externalSystems/**
```

Tasks:

1. Apply matrix targets.
2. Mark deferred seams.
3. Mark review/detail workbenches.
4. Preserve drawers/detail panels and inert actions.
5. Add tests.

## Phase 7 — Team & Access and Project Readiness

Files:

```text
apps/project-control-center/src/surfaces/teamAccess/**
apps/project-control-center/src/surfaces/projectReadiness/**
apps/project-control-center/src/surfaces/responsibilityMatrix/**
apps/project-control-center/src/surfaces/constraintsLog/**
apps/project-control-center/src/surfaces/buyoutLog/**
```

Tasks:

1. Apply matrix targets.
2. Be careful with large Project Readiness file; use targeted edits.
3. Preserve loading/error active panel ownership.
4. Mark submodule cards as detail/reference/deferred as specified.
5. Add route tests.

## Phase 8 — Cross-Route Contract Tests

Files:

```text
apps/project-control-center/src/tests/PccSurfaceCardContract.test.tsx
```

Tasks:

1. Add route inventory helper.
2. Assert exact single Tier 1 command card per route.
3. Assert all cards have tier/region.
4. Assert direct-child bento invariant.
5. Assert headings.

## Phase 9 — Final Validation and Closeout

Run:

```bash
git status --short
git rev-parse HEAD
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed files>
git diff --check
```

Create closeout:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-02/PROMPT_02_CLOSEOUT.md
```

Closeout must include:

- summary
- exact files changed
- test output
- lockfile hash
- surface inventory
- risk/residual notes
- screenshot evidence status
