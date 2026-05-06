# 07 — Test and Screenshot Evidence Plan

## Objective

Define the test/evidence burden for Wave D.

## Required Test Coverage

### Primitive Tests

- `PccDashboardCard` emits tier/region/density/footprint markers.
- Tier mapping preserves existing `hierarchy` behavior or updates it with explicit migration tests.
- Heading level contract renders valid heading elements.
- `PccBentoGrid` spans remain deterministic across all responsive modes.
- `useBentoRowSpan` does not regress below the documented floor.
- `PccBentoGrid` still avoids `grid-auto-flow: dense` unless doctrine changes.

### Surface Tests

For every routed surface:

- one and only one `[data-pcc-active-surface-panel="<surface>"]`;
- at least one `[data-pcc-card-tier="tier1"]` and exactly one in ready state;
- Tier 1 appears before Tier 2/Tier 3 in DOM order;
- operational and reference regions are present where expected;
- no surface introduces extra DOM wrappers that break direct-child card layout;
- loading/error states render valid tier/state markers;
- External Systems drawer is excluded from bento direct-child expectations.

### Responsive Tests

- Render key surfaces with `forceMode` values: `wideDesktop`, `standardDesktop`, `tabletLandscape`, `tabletPortrait`, `phone`.
- Assert Team & Access cards do not resolve into prohibited narrow spans in tablet/SharePoint modes.
- Assert `data-pcc-column-span` and `data-pcc-row-span` remain nonzero and above required floors.

### Accessibility Tests

- Heading hierarchy is testable and consistent.
- Disabled affordances expose reasons.
- Focusable controls have visible labels.
- No action-looking control is clickable when it is supposed to be inert.

## Required Validation Commands

```bash
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed files>
```

## Screenshot Evidence

The screenshot index must include:

| Field | Required? |
| --- | --- |
| Surface route/id | Yes |
| Mode/viewport/container width | Yes |
| Before or after | Yes |
| File path | Yes |
| Acceptance criteria checked | Yes |
| Known residual issue | Yes, if present |
| Reviewer/operator | Yes |
| Timestamp | Yes |

## Closeout Evidence

Prompt 06 must include:

- exact files changed;
- exact tests run and results;
- screenshot matrix completion;
- tenant evidence status;
- lockfile MD5 before/after;
- residual issues;
- scorecard impact by category;
- explicit statement that final 56/56 is not claimed unless final validation evidence exists.
