# Prompt 01 — Span Override Foundation

## Role

You are my PCC Phase 06 local implementation agent for the `RMF112018/hb-intel` repo.

You are implementing focused Phase 06 work for:

```text
PCC Phase 06 — Span Overrides, Intentional Dashboard Choreography, and Project-Specific Analytics Preview System
```

## Objective

Add typed dashboard-specific span override support to `PccDashboardCard` and the layout contract without changing global footprint defaults.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless they have changed, your context is stale, or validation requires it.
- Do not install dependencies.
- Do not add `echarts-for-react`.
- Do not run broad repo scans when targeted reads are sufficient.
- Do not introduce live integrations, writeback, approval execution, source mutation, or random render-time data.
- Do not render developer/internal copy in the UI.
- Preserve PCC read-only / preview / no-writeback posture.
- Keep every bento card as a direct child of `[data-pcc-bento-grid]`.
- Do not use `grid-auto-flow: dense` as the primary layout fix.
- Preserve shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`.
- Do not reintroduce `Project Intelligence` as a Project Home bento card.
- Use production-grade, end-user-facing copy only.

## Scope

Implement the foundational span override capability.

## Required Files

Modify:

```text
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/footprints.ts
```

Create:

```text
apps/project-control-center/src/layout/PccDashboardCard.spanOverrides.test.tsx
```

If composition types are needed now, also create:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
apps/project-control-center/src/layout/pccDashboardComposition.test.ts
```

## Implementation Requirements

### 1. Add type

In the appropriate layout type file:

```ts
export type PccCardSpanOverrides = Partial<Record<PccResponsiveMode, number>>;
```

### 2. Add prop

Add to `PccDashboardCardProps`:

```ts
spanOverrides?: PccCardSpanOverrides;
```

### 3. Resolve span

Implement a helper that:

1. gets base span from `resolveFootprintColumnSpan(mode, footprint)`;
2. checks `spanOverrides?.[mode]`;
3. clamps override to `1..columns`;
4. returns:
   - resolved span;
   - source: `footprint` or `override`;
   - override mode marker when applicable.

Use `columns` from `usePccBentoContext()`.

### 4. Preserve min inline size

Keep existing `FOOTPRINT_MIN_INLINE_SIZE_PX[mode][footprint]` behavior.

### 5. Emit markers

Add:

```text
data-pcc-span-source
data-pcc-span-override-mode
```

Continue emitting:

```text
data-pcc-column-span
data-pcc-footprint
data-pcc-mode
```

### 6. Version bump

Because this prompt introduces runtime source changes for Phase 06, bump both:

```text
apps/project-control-center/config/package-solution.json
  solution.version
  solution.features[0].version
```

from `1.0.0.215` to `1.0.0.216`, unless the repo already shows a later user-approved version.

Do not bump again in later prompts unless user instructs it.

## Tests

Create tests proving:

- no override = footprint span and `data-pcc-span-source="footprint"`;
- valid override = override span and `data-pcc-span-source="override"`;
- override clamps above active columns;
- override clamps below `1`;
- mode-specific override only affects matching mode;
- min inline size remains from footprint;
- no `grid-auto-flow: dense`.

## Acceptance

- Global footprint constants are not changed for dashboard-specific needs.
- Existing card tests still pass.
- New tests pass.
- No dependency install performed.

## Required Validation

Run the narrowest validation needed during implementation, then at closeout run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

If Playwright evidence is in scope for this prompt, also run the requested Playwright commands.

## Closeout Report

Report:

- files changed;
- dependency/package/lockfile changes observed;
- validation commands and results;
- whether SPFx solution/feature version changed;
- risks or follow-up items;
- confirmation that you did not install dependencies;
- confirmation that `echarts-for-react` was not added.
