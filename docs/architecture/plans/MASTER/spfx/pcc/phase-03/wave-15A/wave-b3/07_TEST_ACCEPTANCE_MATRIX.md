# 07 — Test Acceptance Matrix

## Objective

Define exact tests required for Prompt 02 closeout.

## Primitive Tests

Create or update:

```text
apps/project-control-center/src/layout/PccDashboardCard.test.tsx
apps/project-control-center/src/layout/footprints.test.ts
apps/project-control-center/src/layout/useBentoRowSpan.test.tsx
```

### `PccDashboardCard.test.tsx`

Required assertions:

1. Default card resolves:
   - `data-pcc-card-tier='tier2'`
   - `data-pcc-card-region='operational'`
2. `hierarchy='primary'` with no explicit tier resolves:
   - `data-pcc-card-tier='tier1'`
   - `data-pcc-card-region='command'`
3. `hierarchy='supporting'` with no explicit tier resolves:
   - `data-pcc-card-tier='tier3'`
   - `data-pcc-card-region='reference'`
4. Explicit `tier` overrides hierarchy.
5. Explicit `region` overrides tier default.
6. `headingLevel={2}` renders `h2`.
7. Tier 1 default heading renders `h2`.
8. Tier 2 default heading renders `h3`.
9. Card with title uses `aria-labelledby`.
10. Card without title and with `ariaLabel` uses `aria-label`.
11. Existing data markers remain present.

### `footprints.test.ts`

Required assertions:

1. footprint union has eight values.
2. every responsive mode has all eight footprints.
3. no footprint span exceeds mode column count.
4. phone maps all footprints to one column.
5. `rail` is narrower than `detail` at desktop, largeLaptop, ultrawide.
6. `detail` is wider than `standard` at desktop, largeLaptop, ultrawide.
7. min inline size map is exhaustive.
8. `resolveFootprintColumnSpan` handles `rail` and `detail`.

### `useBentoRowSpan.test.tsx`

Preserve current collapse-resistance tests. Add no regression if necessary; do not weaken.

## Route Surface Tests

Create or update route-level tests:

```text
apps/project-control-center/src/tests/PccSurfaceCardContract.test.tsx
```

Use route-aware helpers to render each surface inside `PccBentoGrid` / `PccShell` as existing tests already do.

For each route:

- Project Home
- Team & Access
- Documents
- Project Readiness
- Approvals
- External Systems
- Control Center Settings
- Site Health

Required assertions:

1. Exactly one card has `data-pcc-card-tier='tier1'` in ready state.
2. Exactly one card has `data-pcc-card-region='command'` in ready state.
3. The Tier 1 command card has the route's `data-pcc-active-surface-panel`.
4. Every card has `data-pcc-card-tier`.
5. Every card has `data-pcc-card-region`.
6. Every card remains a direct child of `[data-pcc-bento-grid]`.
7. Deferred cards are never Tier 1.
8. State cards are never Tier 1 except route-level loading/error replacement cards.
9. First card in ready-state DOM order is the Tier 1 command card.
10. Command card heading is `h2`.

## Surface-Specific Tests

### Project Home

- Project Intelligence is Tier 1 command and active panel owner.
- Priority Actions is Tier 2 operational.
- Team Snapshot uses `rail` footprint and rail region.
- Ask HBI uses detail region when read-model path is active.

### Documents

- Header is Tier 1 command.
- Project Record is Tier 2 operational.
- External Systems lane is Tier 3 deferred.
- Permissions & Guardrails is Tier 3 detail.

### Approvals

- Home is Tier 1 command.
- Queue, My Approvals, Escalation, Admin Verification are Tier 2 operational.
- Decision History and Lineage seams are Tier 3 deferred.

### External Systems

- Header is Tier 1 command.
- Project Links and Review Queue are Tier 2 detail.
- Registry/source/audit/HBI/Procore are Tier 3 reference/deferred.

### Site Health

- Overview is Tier 1 command.
- Checks and Drift are Tier 2 operational.
- Repair Requests and Procore sync/repair are Tier 3 deferred.

## Validation Commands

Required:

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
