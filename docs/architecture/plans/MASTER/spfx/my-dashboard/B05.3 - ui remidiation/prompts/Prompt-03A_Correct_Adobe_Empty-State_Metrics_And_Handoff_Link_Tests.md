# Prompt 03A — Correct Adobe Sign Available-Empty Metrics and Harden SourceOpenUrl Handoff Tests

## Mandatory operating instruction

**Do not re-read files that are still within your current context or memory unless needed to confirm drift, dependencies, or uncertainty after changes.**

---

# Starting repo posture

Execute this as a surgical correction patch immediately after:

- **Prompt 03 commit:** `eecab3eaa266c837c9d0c4bf7182061569e28699`
- Branch posture: `main`

Prompt 03 materially completed the Adobe Sign one-card consolidation:

- `AdobeSignActionQueueCard.tsx` now owns the complete Adobe queue state matrix.
- The OAuth Connect CTA is reachable from the live shell again.
- Retired fragmented Adobe Sign components and focused-route artifacts were deleted.
- Full My Dashboard tests passed at Prompt 03 closeout.

A post-commit audit found **three narrow issues** that must be corrected before Prompt 04 proceeds:

1. The `available-empty` Adobe state still renders the metrics block, contrary to the locked target posture.
2. The positive `sourceOpenUrl` handoff-anchor test does not assert that at least one anchor exists.
3. The negative no-URL handoff-anchor test does not actually prove the no-synthesized-URL rule.

This prompt must correct only those issues.

---

# Objective

Apply a focused Prompt 03A patch that:

1. **Removes the metrics block from the Adobe Sign `available-empty` state** so the ready-empty state remains compact and matches the locked state matrix.
2. **Strengthens the positive handoff-link test** so it proves that one or more `Open in Adobe Sign` anchors render when the read-model contains policy-approved `sourceOpenUrl` values.
3. **Replaces the ineffective negative handoff-link test** with a truthful populated-items fixture where all `sourceOpenUrl` fields are absent, then asserts that no handoff anchors render.

Do not broaden this patch beyond those three corrections.

---

# Repo truth to preserve

## Implemented Prompt 03 behavior that must remain unchanged

Do not disturb:

- the consolidated `AdobeSignActionQueueCard` architecture,
- its nine locked state-marker values,
- Connect CTA gating and state machine,
- shell OAuth wiring,
- item list rendering,
- state copy library,
- selector structure,
- source-status precedence behavior,
- retired Adobe component deletions,
- focused-envelope deletions.

The correction is intentionally small.

---

# Files to inspect

At minimum inspect:

- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx`

Only inspect additional files if necessary to confirm fixture shape or TypeScript typing.

Reference fixture source only if needed:

- `packages/models/src/myWork/fixtures/myWorkHomeReadModels.ts`
- `packages/models/src/myWork/fixtures/adobeSignActionQueueReadModels.ts`

Do not edit model fixtures unless repo truth proves that is absolutely required. It should not be required.

---

# Required implementation

## 1. Remove metrics from the `available-empty` Adobe state

### Current issue

In:

- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx`

the `showMetrics` condition currently includes:

```ts
stateMarker === 'available-empty'
```

This violates the locked Prompt 03 target posture:

- `available-empty`
  - Ready badge
  - zero-state body
  - **metrics omitted**
  - no item list

### Required correction

Update `showMetrics` so metrics render only when:

```ts
stateMarker === 'partial' ||
stateMarker === 'available-items'
```

The metrics block must not render for:

```ts
stateMarker === 'available-empty'
```

Do not alter the zero-state body copy or the `data-my-work-empty-queue` marker.

---

## 2. Harden the available-empty state test

### Current issue

The available-empty test title correctly says:

> Ready badge + zero-state body + no metrics + no items

but the test does not assert metrics are absent.

### Required correction

In:

- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx`

update the `available + zero items` test to explicitly assert:

```ts
expect(
  container.querySelector('[data-adobe-sign-action-queue-metrics]')
).toBeNull();
```

Retain existing assertions for:

- `data-adobe-sign-action-queue-state="available-empty"`
- Ready badge
- zero-state copy
- `data-my-work-empty-queue`
- no agreement list

---

## 3. Harden the positive row-level Adobe Sign handoff-anchor test

### Current issue

The positive test currently:

- selects all anchors with `data-adobe-sign-item-open-action="start"`,
- loops over them,
- but never proves that at least one anchor exists.

A regression that rendered zero anchors would still pass.

### Required correction

In the test:

> `renders an Open in Adobe Sign anchor when item.sourceOpenUrl is present`

add a positive existence assertion before iterating:

```ts
expect(anchors.length).toBeGreaterThan(0);
```

Then keep the existing assertions that every rendered anchor has:

- tag name `A`
- `target="_blank"`
- `rel="noopener noreferrer"`
- truthy `href`
- text containing `Open in Adobe Sign`

### Optional strengthening, acceptable if clean

If the fixture truth is already obvious in the file context, it is acceptable to assert that at least one rendered anchor `href` matches a known fixture URL. This is optional. The required correction is the positive nonzero anchor count assertion.

---

## 4. Replace the ineffective no-URL handoff test with a real no-URL populated scenario

### Current issue

The current negative test uses `MY_WORK_HOME_PARTIAL`, but the partial projection can contain items that already carry `sourceOpenUrl`. The current assertion only checks that any rendered anchors have truthy `href`; it does **not** prove that anchors are absent when URLs are absent.

### Required correction

Replace the existing test:

> `renders no anchor when no item exposes sourceOpenUrl (no synthesized URLs)`

with a real no-URL populated-items scenario.

### Required fixture construction

Build an inline cloned home envelope from `MY_WORK_HOME_AVAILABLE` where:

- the Adobe preview list remains populated,
- every preview item has `sourceOpenUrl` removed or explicitly omitted,
- summary and availability posture remain unchanged.

Recommended approach:

```ts
const noOpenUrlEnvelope: MyWorkReadModelEnvelope<MyWorkHomeReadModel> = {
  ...MY_WORK_HOME_AVAILABLE,
  data: {
    ...MY_WORK_HOME_AVAILABLE.data,
    adobeSignActionQueue: {
      ...MY_WORK_HOME_AVAILABLE.data.adobeSignActionQueue,
      previewItems: MY_WORK_HOME_AVAILABLE.data.adobeSignActionQueue.previewItems.map(
        ({ sourceOpenUrl: _sourceOpenUrl, ...item }) => item,
      ),
    },
  },
};
```

Adapt typing if needed, but preserve the same intent.

### Required assertions

Render the consolidated card with:

- `readinessVariant: 'ready'`
- `homeEnvelope: noOpenUrlEnvelope`

Then assert:

1. The populated item list still renders:

```ts
expect(
  container.querySelectorAll('[data-my-work-agreement-item]').length
).toBeGreaterThan(0);
```

2. No Adobe handoff anchor renders:

```ts
expect(
  container.querySelector('[data-adobe-sign-item-open-action="start"]')
).toBeNull();
```

This test must prove Guardrail #5:

> No synthesized URLs. Handoff anchors render only when truthful `sourceOpenUrl` exists in the read-model.

---

# Expected files changed

Expected changes should be limited to:

1. `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx`
2. `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx`

No other files should change unless required by formatting or an unavoidable type import in the test file.

---

# Explicit non-goals

Do not:

- modify My Work shell OAuth wiring,
- modify My Work home surface composition,
- modify source-status selectors,
- modify the view-model selector file,
- modify model fixtures,
- modify My Projects,
- modify Work Summary,
- modify Source Readiness,
- modify bento composition,
- delete additional files,
- update docs or README,
- bump SPFx package version,
- broaden Prompt 03A into Prompt 04 or Prompt 05 scope.

---

# Required validation

Run in this order:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test --run AdobeSignActionQueueCard
pnpm --filter @hbc/spfx-my-dashboard test
pnpm exec prettier --check \
  apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx \
  apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.test.tsx
```

If Prettier reformats either file:

1. Apply formatting.
2. Rerun:
   - targeted card tests,
   - check-types,
   - full app test suite if TypeScript source changed.
3. Confirm final Prettier check is clean.

Do not use `npx` fallbacks for `pnpm exec`.

---

# Acceptance criteria

Prompt 03A passes only if all of the following are true:

## UI behavior

- `available-empty` Adobe state renders:
  - Ready badge,
  - zero-state body,
  - no metrics block,
  - no agreement list.
- `partial` and `available-items` continue to render metrics.
- Row-level `Open in Adobe Sign` anchors still render when truthful `sourceOpenUrl` values exist.
- No row-level handoff anchor renders when populated items omit `sourceOpenUrl`.

## Tests

- The available-empty test explicitly proves metrics absence.
- The positive handoff-anchor test explicitly proves at least one anchor renders.
- The negative handoff-anchor test explicitly proves no anchor renders for a populated no-URL scenario.
- All updated tests pass.
- Full My Dashboard test suite passes.

## Scope discipline

- No broad refactor outside the two expected files.
- No changes to Prompt 04 / Prompt 05 / Prompt 06 scope.
- No docs/version changes.

---

# Closeout format

Return a concise closeout with:

1. **Implementation Decision** — PASS / PARTIAL / BLOCKED
2. **Prompt Objective**
3. **Repo Truth Confirmed Before Edit**
4. **Files Changed**
5. **Corrections Delivered**
6. **Tests Added / Updated**
7. **Validation Performed**
8. **Residual Risks or Follow-Ups**
9. **Git Position**
   - `git log --oneline -3`
   - `git rev-parse HEAD`

The closeout should explicitly confirm whether Prompt 03 is now fully complete and whether Prompt 04 may proceed.
