# Prompt 05 — Cross-Surface Tests, Accessibility, and Bento Invariants

## Objective

Add comprehensive cross-surface tests that enforce the remediated card tier contract across the entire current PCC route set.

This prompt closes the test gap. It must prove that the source changes from Prompts 01–04 cannot regress silently.

## Context

After Prompts 01–04, every card should have explicit `tier` and `region`, and the primitive should expose source markers.

This prompt should add or finalize tests that enforce:

- explicit classification;
- active panel ownership;
- command/state route posture;
- no deferred/reference/state card appearing operational by fallback;
- direct bento child invariant;
- heading and accessibility basics;
- no dense grid behavior;
- no live link regressions.

## Files To Inspect

```text
apps/project-control-center/src/tests/
apps/project-control-center/src/layout/
apps/project-control-center/src/shell/
apps/project-control-center/src/surfaces/
```

Use targeted reads. Do not re-read files still in current context unless exact edit context is required.

## Required Test Files

Preferred final test set:

```text
apps/project-control-center/src/layout/PccDashboardCard.contract.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessCardContract.test.tsx
```

If the repo already has better naming or consolidated test conventions, use those, but preserve this coverage.

## Required Shared Test Helpers

Create small helpers inside the test file or an internal test utility if one already exists.

Suggested helpers:

```ts
function getBentoGrid(container: HTMLElement): HTMLElement
function getCards(container: HTMLElement): HTMLElement[]
function expectAllCardsDirectChildrenOfGrid(container: HTMLElement): void
function expectAllCardsExplicitlyClassified(container: HTMLElement): void
function expectExactlyOneActivePanel(container: HTMLElement, surfaceId: string): HTMLElement
function expectRouteCommandCard(card: HTMLElement): void
function expectRouteStateCard(card: HTMLElement): void
```

Avoid over-engineering. Keep helpers local unless reused across several test files.

## Required Route Matrix

Test these surface ids:

```ts
const SURFACE_IDS = [
  'project-home',
  'team-and-access',
  'documents',
  'project-readiness',
  'approvals',
  'external-systems',
  'control-center-settings',
  'site-health',
] as const;
```

## Required Assertions Per Route

For each route in ready/fixture rendering:

1. A bento grid exists.
2. Every immediate child of the bento grid is `[data-pcc-card]`.
3. Every card has:
   - `data-pcc-card-tier-source="explicit"`;
   - `data-pcc-card-region-source="explicit"`;
   - non-empty `data-pcc-footprint`;
   - non-zero numeric `data-pcc-column-span`;
   - non-zero numeric `data-pcc-row-span`.
4. Exactly one active panel exists.
5. The active panel value matches the route.
6. The active panel card is:
   - `data-pcc-card-tier="tier1"`;
   - `data-pcc-card-region="command"`;
   - `data-pcc-heading-level="2"`;
   - explicit tier and region source.
7. No card has:
   - `data-pcc-card-tier-source="default"`;
   - `data-pcc-card-region-source="resolved"`.

## Required State/Deferred/Reference Assertions

Add named tests that locate specific cards or stable body markers and assert target classification.

At minimum:

- Project Home Missing Configurations: `state/state`.
- Team restricted Access Manager actions: `state/state`.
- Documents External Systems lane: `tier3/deferred`.
- Approvals Policy: `tier3/reference`.
- Approvals Decision History seam: `tier3/deferred`.
- Approvals Lineage seam: `tier3/deferred`.
- Approvals HBI Boundary: `tier3/reference`.
- External Systems Audit History: `tier3/reference`.
- External Systems HBI Lineage: `tier3/reference`.
- Settings Items Needing Setup: `state/state`.
- Site Health Repair Requests: classification per final implementation.
- Project Readiness Blockers: not Tier 1 unless intentionally documented.

## Accessibility Assertions

Add assertions:

- All titled cards have `aria-labelledby`.
- Active command card heading level is 2.
- State error renders `role="alert"` where error is present.
- Loading state renders `aria-busy` where loading is present.
- Disabled affordances include reason text where the shared component is used.

Do not attempt full screen-reader testing in unit tests.

## Interaction / Launch Guard Assertions

Preserve and extend:

- no `grid-auto-flow: dense`;
- no live `http(s)` anchors in preview-only route areas;
- disabled controls remain disabled or `aria-disabled`.

## Handling Async Read-Model Paths

For tests that render `PccApp` with `createPccFixtureReadModelClient()`:

- wait for a stable title or marker before asserting;
- avoid arbitrary timers;
- use `findByText`, `findByRole`, or `waitFor` with stable selectors.

## Validation

Run:

```bash
git status --short
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test -- PccDashboardCard.contract
pnpm --filter @hbc/project-control-center test -- PccSurfaceCommandCardContract
pnpm --filter @hbc/project-control-center test -- PccCardTierContract
pnpm --filter @hbc/project-control-center test -- PccProjectReadinessCardContract
pnpm --filter @hbc/project-control-center test
pnpm exec prettier --check apps/project-control-center/src/layout apps/project-control-center/src/surfaces apps/project-control-center/src/tests
git diff --check
```

## Deliverables

- Complete test coverage for the card classification contract.
- Passing full project-control-center tests.
- Validation output.

## Closeout Response Required From Agent

Return:

```text
Prompt 05 completed.

Tests added/updated:
- <path>
- <path>

Coverage added:
- explicit tier/region source
- active-panel route command ownership
- direct bento child invariant
- state/deferred/reference classification
- accessibility smoke assertions
- no dense grid / no live launch regressions

Validation:
- <command>: <result>

Notes:
- <any intentional deviation or risk>
```
