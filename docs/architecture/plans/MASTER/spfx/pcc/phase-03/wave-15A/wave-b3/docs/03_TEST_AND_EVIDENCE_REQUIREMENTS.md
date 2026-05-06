# 03 — Test and Evidence Requirements

## Objective

Define the automated tests and evidence required to close the card tier contract issue.

## Required New Test File

Create a focused test file such as:

```text
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
```

If the repo already has a better location, use the existing convention.

## Required Test Coverage

### 1. Primitive instrumentation

Render representative `PccDashboardCard` cases inside `PccBentoGrid` and assert:

- explicit tier emits `data-pcc-card-tier-source="explicit"`;
- legacy hierarchy fallback emits `data-pcc-card-tier-source="hierarchy"`;
- default fallback emits `data-pcc-card-tier-source="default"`;
- explicit region emits `data-pcc-card-region-source="explicit"`;
- resolved region emits `data-pcc-card-region-source="resolved"`;
- explicit heading level emits `data-pcc-heading-level`.

### 2. All route surfaces render exactly one active panel

For each route:

- `project-home`
- `team-and-access`
- `documents`
- `project-readiness`
- `approvals`
- `external-systems`
- `control-center-settings`
- `site-health`

Assert:

```ts
expect(container.querySelectorAll('[data-pcc-active-surface-panel]')).toHaveLength(1);
expect(activePanel.getAttribute('data-pcc-active-surface-panel')).toBe(surfaceId);
```

### 3. Active panel carrier classification

For each route, get:

```ts
const activePanel = container.querySelector(`[data-pcc-active-surface-panel="${surfaceId}"]`);
const card = activePanel?.closest('[data-pcc-card]');
```

Assert:

- the active panel is on the card itself or inside a card;
- the active panel card is direct or nested appropriately inside the card;
- the card emits `data-pcc-card-tier-source="explicit"`;
- the card emits `data-pcc-card-region-source="explicit"`;
- ready route cards are `tier1/command`;
- loading/error replacements, if directly rendered in route tests, are `state/state`.

### 4. Every bento direct child is a card

For each route:

```ts
const grid = container.querySelector('[data-pcc-bento-grid]');
for (const child of Array.from(grid.children)) {
  expect(child).toHaveAttribute('data-pcc-card');
}
```

Allow no wrappers between bento grid and cards.

### 5. No default classification on route cards

For each route:

```ts
expect(container.querySelectorAll('[data-pcc-card-tier-source="default"]')).toHaveLength(0);
expect(container.querySelectorAll('[data-pcc-card-region-source="resolved"]')).toHaveLength(0);
```

If the agent finds a narrowly justified exception, it must:

- document the exception in the closeout;
- add a test that scopes and names the exception;
- avoid broad weakening of this assertion.

Default recommendation: no exceptions.

### 6. Deferred/reference/state cards are not operational

For cards that contain state/deferred/reference body markers, assert non-operational classification.

Recommended tests:

- Approvals decision-history seam card: `region="deferred"`.
- Approvals lineage seam card: `region="deferred"`.
- Approvals HBI boundary card: `region="reference"`.
- External Systems HBI lineage/audit/source health cards: `region="reference"` unless active operational content is proven.
- Settings missing setup card: `tier="state"`, `region="state"`.
- Team restricted access-manager card: `tier="state"`, `region="state"`.
- Project Home Missing Configurations: `tier="state"`, `region="state"`.

### 7. No dense grid

Retain and/or extend the test asserting that the bento grid does not use `grid-auto-flow: dense`.

### 8. Row-span collapse resistance

Keep existing `useBentoRowSpan` tests passing. Do not weaken them.

### 9. Accessibility smoke tests

Add focused assertions:

- route command cards have `data-pcc-heading-level="2"`;
- titled cards have `aria-labelledby`;
- error states still render `role="alert"` through `PccPreviewState`;
- loading states still render `aria-busy`.

### 10. No live launch links / no mutation paths

Retain and extend existing tests as needed:

- no live `http(s)` anchors in preview-only routes;
- inert controls remain disabled or reason-backed;
- no new live handler introduced for launch/write actions.

## Suggested Test Harness Strategy

Use a helper to render each route inside the same shell/bento context.

Possible approaches:

1. Render `PccApp` and select tabs using accessible tab controls.
2. Render `PccBentoGrid` with `PccSurfaceRouter activeSurfaceId={surfaceId}`.
3. Render direct surface components inside `PccBentoGrid`.

Preferred approach:

- Use direct surface rendering for deterministic fixture/no-client route tests.
- Use `PccSurfaceRouter` where active route wiring matters.
- Use `PccApp` only where shell/tab integration is specifically under test.

Avoid brittle text-only tests where stable `data-pcc-*` markers exist.

## Required Validation Commands

At minimum:

```bash
git status --short
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test -- PccCardTierContract
pnpm --filter @hbc/project-control-center test
pnpm exec prettier --check \
  apps/project-control-center/src/layout \
  apps/project-control-center/src/surfaces \
  apps/project-control-center/src/tests
git diff --check
```

If the workspace uses different package names, inspect `package.json` and adapt without reducing coverage.

## Hosted Evidence Requirements

Automated tests are required for this remediation. Hosted screenshots are required for final UI doctrine closeout.

Capture or document as remaining follow-up:

- desktop edit mode;
- desktop view mode;
- standard laptop;
- small laptop;
- tablet landscape;
- tablet portrait;
- phone portrait;
- phone landscape / short-height;
- ultrawide;
- high zoom / constrained window.

If hosted evidence cannot be captured in the local code-agent environment, the closeout must state that source/test closure is complete and hosted evidence remains pending for human validation.
