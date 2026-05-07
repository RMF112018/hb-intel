# Acceptance Criteria and Validation

## Functional Acceptance Criteria

The remediation is complete when:

1. `PccTeamAccessReadModelContent` no longer returns wrapper `<div>` elements as direct children of `PccBentoGrid`.
2. Read-model preview state renders `PccTeamAccessLaneShell` directly.
3. Read-model loading state renders a direct `PccDashboardCard`.
4. Read-model error state renders a direct `PccDashboardCard`.
5. Every `PccDashboardCard` rendered by Team & Access is a direct child of `[data-pcc-bento-grid]`.
6. Exactly one Team & Access active panel marker exists in every render state:

```text
[data-pcc-active-surface-panel="team-and-access"]
```

7. Existing Team & Access lane semantics remain unchanged:
   - Team Viewer lane
   - Permission Request lane
   - Access Manager lane
   - disabled-affordance reason contract
   - no card-in-card pattern

## Required Test Coverage

Update or extend:

```text
apps/project-control-center/src/tests/PccTeamAccessSurface.layout.test.tsx
```

Required test cases:

### Fixture/default path

Existing tests must continue passing.

### Read-model preview path

Mock the read-model client so the hook resolves successfully. Assert:

- grid exists
- Team Viewer card parent is the grid
- Permission Request card parent is the grid
- Access Manager card parent is the grid
- no Team & Access lane card is nested inside another card
- exactly one active panel marker exists

### Read-model loading path

Use a pending client promise or equivalent test setup. Assert:

- loading state card renders
- loading state card parent is the grid
- exactly one active panel marker exists

### Read-model error path

Use a rejecting client. Assert:

- error state card renders
- error state card parent is the grid
- exactly one active panel marker exists

## Validation Commands

Targeted:

```bash
pnpm exec vitest run apps/project-control-center/src/tests/PccTeamAccessSurface.layout.test.tsx
```

Broader:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
pnpm --filter @hbc/project-control-center build
```

If package filter name differs, inspect repo package metadata and use the correct workspace target.

Optional live evidence rerun:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
```

## Expected Evidence Improvement

After live rerun:

```text
Direct-child issue count: 0
Team & Access measuredContainerHeight: no longer 8
Mode mismatch count: 0
Horizontal overflow count: 0
```

## Do Not Claim

Do not claim:

- final Phase 4 readiness
- final 100-point scorecard pass
- hard-stop clearance
- full clipped-card remediation
- Project Readiness density remediation

This prompt remediates the Team & Access direct-child defect only.
