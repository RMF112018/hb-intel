# PCC Team & Access Direct-Child Remediation Package

## Objective

Implement the highest-ROI PCC Phase 3 / Wave 15A UI/UX remediation identified from the combined Playwright evidence and current repo-truth audit:

> Fix the Team & Access read-model wrapper so every rendered `PccDashboardCard` remains a direct child of `PccBentoGrid` across fixture, preview, loading, and error render paths.

This package is intended for the local code agent, not for a fresh ChatGPT audit session.

## Why This Remediation Is First

The live breakpoint evidence run at:

```text
docs/architecture/evidence/pcc-live/20260507-134047/breakpoints-1778175676324/
```

reported:

```text
Surface/viewport pairs: 64
Screenshot count: 64
Card measurement count: 936
Warning count: 144
Mode mismatch count: 0
Horizontal overflow count: 0
Clipped card count: 89
Direct-child issue count: 32
```

The direct-child issue count maps cleanly to Team & Access:

```text
Team & Access cards: 4
Viewport count: 8
4 × 8 = 32 direct-child failures
```

Repo-truth indicates the fixture/default Team & Access path is already correct because `PccTeamAccessLaneShell` returns a `Fragment` of `PccDashboardCard` children. The read-model preview path wraps that shell in:

```tsx
<div data-pcc-team-access-read-model-content="preview">
  <PccTeamAccessLaneShell ... />
</div>
```

That wrapper breaks the `PccBentoGrid` direct-child invariant when the read-model path is active.

## Package Contents

```text
README.md
prompts/Prompt_01_Team_Access_Direct_Child_Remediation.md
supporting/Evidence_And_Repo_Truth_Findings.md
supporting/Acceptance_Criteria_And_Validation.md
```

## Implementation Posture

- Runtime code changes should be minimal.
- Do not redesign the Team & Access surface.
- Do not modify the shared bento grid/card primitives unless tests prove the Team & Access wrapper fix is insufficient.
- Do not suppress Playwright warnings.
- Do not change evidence artifacts.
- Do not modify unrelated surfaces.
- Preserve read-only / preview / no-mutation posture.
- Preserve active surface panel ownership: exactly one `data-pcc-active-surface-panel="team-and-access"` marker.

## Primary Files Expected to Change

Likely:

```text
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessReadModelContent.tsx
apps/project-control-center/src/tests/PccTeamAccessSurface.layout.test.tsx
```

Possible only if required by existing helper/test style:

```text
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
```

## Validation Commands

Run targeted validation first, then broader validation:

```bash
pnpm exec vitest run apps/project-control-center/src/tests/PccTeamAccessSurface.layout.test.tsx
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
pnpm --filter @hbc/project-control-center build
```

If the live environment is available after implementation, rerun the breakpoint evidence spec:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
```

Expected live evidence result after remediation:

```text
Direct-child issue count: 0
Team & Access measuredContainerHeight: no longer 8
Mode mismatch count: 0
Horizontal overflow count: 0
```
