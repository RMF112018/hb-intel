# SF15-T08 — Testing Strategy Implementation Plan

## Context

T01–T07 are complete. The `@hbc/ai-assist` package has 14 test files with 169 passing tests and 7 testing barrel exports. SF15-T08 requires completing the testing strategy: expanding shared test utilities, adding the missing HbcAiGovernancePortal test, creating Storybook stories for all 6 components, adding notification routing test stubs, and creating a Playwright E2E scenario placeholder.

---

## Step 1 — New Testing Helpers (3 new files + barrel update)

### `packages/ai-assist/testing/createMockInvokeContext.ts` (new)
- Factory returning `IAiActionInvokeContext` with `Partial` overrides
- Defaults: `userId: 'user-001'`, `role: 'admin'`, `recordType: 'scorecard'`, `recordId: 'rec-001'`, `complexity: 'standard'`

### `packages/ai-assist/testing/createMockExecutor.ts` (new)
- Factory returning mock `IAiActionExecutor` with configurable response/delay/error
- Accepts `Partial<{ response: string; delayMs: number; shouldReject: boolean; rejectError: Error }>`
- Returns `{ execute(payload, signal): Promise<string> }`

### `packages/ai-assist/testing/createMockGovernancePolicy.ts` (new)
- Factory returning `IAiAssistPolicy` with `Partial` overrides
- Defaults: `disableActions: []`, `rateLimitPerHourByRole: { admin: 100 }`, `requireApprovalActions: []`

### `packages/ai-assist/testing/index.ts` (edit)
- Add 3 new re-exports: `createMockInvokeContext`, `createMockExecutor`, `createMockGovernancePolicy`

---

## Step 2 — HbcAiGovernancePortal Test

### `packages/ai-assist/src/components/HbcAiGovernancePortal.test.tsx` (new)
- ~4 tests matching the HbcAiResultPanel.test.tsx pattern:
  1. renders without crashing (returns null)
  2. has displayName 'HbcAiGovernancePortal'
  3. accepts className prop (no crash)
  4. conforms to FC<HbcAiGovernancePortalProps> type

---

## Step 3 — Storybook Infrastructure

### `packages/ai-assist/.storybook/main.ts` (new)
- Copy pattern from `packages/smart-empty-state/.storybook/main.ts`
- Framework: `@storybook/react-vite`, addons: essentials + a11y
- Stories glob: `'../src/**/*.stories.@(ts|tsx)'`

### `packages/ai-assist/.storybook/preview.ts` (new)
- Copy pattern from `packages/smart-empty-state/.storybook/preview.tsx`
- Parameters: `controls: { expanded: true }`, `layout: 'centered'`

### `packages/ai-assist/package.json` (edit)
- Add devDependencies: `@storybook/react-vite: ^8.6.0`, `@storybook/addon-essentials: ^8.6.0`, `@storybook/addon-a11y: ^8.6.0`, `storybook: ^8.6.0`
- Add script: `"storybook": "storybook dev -p 6007"`

---

## Step 4 — Storybook Stories (6 files)

All use CSF3 Meta/StoryObj pattern with testing barrel factories for prop data.

### `packages/ai-assist/src/components/HbcAiActionMenu.stories.tsx` (new)
- Stories: Default (3 actions seeded), EmptyActions, SingleAction, WithApprovalRequired, WithBlockedAction, RoleFiltered
- Uses `seedReferenceIntegrations()` in decorators for realistic action data

### `packages/ai-assist/src/components/HbcAiSmartInsertOverlay.stories.tsx` (new)
- Stories: TextResult, BulletListResult, StructuredObjectWithMappings, PerFieldAccept, ApplyAll, HighConfidence, LowConfidence, Loading, EmptyResult
- Uses `createMockAiActionResult()` and `createMockSmartInsertResult()` for props

### `packages/ai-assist/src/components/HbcAiTrustMeter.stories.tsx` (new)
- Stories: EssentialTier, StandardTier, ExpertTier, HighConfidence, MediumConfidence, LowConfidence, WithCitedSources, WithTokenUsage
- Exercises all 3 trust tiers × 3 confidence levels

### `packages/ai-assist/src/components/HbcAiLoadingState.stories.tsx` (new)
- Stories: Preparing, Streaming, WithStreamedContent, ExpertWithTokenUsage, WithCancel, Cancelled

### `packages/ai-assist/src/components/HbcAiResultPanel.stories.tsx` (new)
- Stories: TextResult, BulletListResult, StructuredObject, WithClassName, Loading

### `packages/ai-assist/src/components/HbcAiGovernancePortal.stories.tsx` (new)
- Stories: Scaffold (renders null), WithClassName
- Placeholder — documents future implementation surface

---

## Step 5 — Notification Routing Test Stubs

### `packages/ai-assist/src/reference/notificationRouting.test.ts` (new)
- `describe('Notification routing contracts (future @hbc/notification-intelligence)')`
- 5 `it.todo()` stubs documenting the expected contracts:
  - sends inline completion badge to invoker on success
  - sends targeted digest card to stakeholders
  - sends governance alert to admins for low-confidence results
  - sends governance alert to admins for policy violation events
  - routes based on invoker/stakeholder/admin audience segmentation

---

## Step 6 — Playwright E2E Scenario Placeholder

### `packages/ai-assist/e2e/summarize-scorecard-flow.spec.ts` (new)
- Uses `test.fixme()` (Playwright) wrapping the full scenario:
  - invoke summarize-scorecard from toolbar menu
  - displays inline streaming in Smart Insert overlay
  - accept individual field mapping
  - Apply All commits with ai-assisted snapshot tag
  - audit record created with correct metadata
  - notification sent to invoker and stakeholders
- Annotated: requires dev-harness running with reference executor

---

## Step 7 — Documentation Updates

### `docs/architecture/plans/shared-features/SF15-T08-Testing-Strategy.md` (edit)
- Append `<!-- IMPLEMENTATION PROGRESS -->` comment with date and file list

### `docs/architecture/plans/shared-features/SF15-AI-Assist.md` (edit)
- Mark T08 row: `✅ completed 2026-03-11`

---

## Files Summary

| # | File | Action |
|---|------|--------|
| 1 | `packages/ai-assist/testing/createMockInvokeContext.ts` | New |
| 2 | `packages/ai-assist/testing/createMockExecutor.ts` | New |
| 3 | `packages/ai-assist/testing/createMockGovernancePolicy.ts` | New |
| 4 | `packages/ai-assist/testing/index.ts` | Edit — add 3 exports |
| 5 | `packages/ai-assist/src/components/HbcAiGovernancePortal.test.tsx` | New |
| 6 | `packages/ai-assist/.storybook/main.ts` | New |
| 7 | `packages/ai-assist/.storybook/preview.ts` | New |
| 8 | `packages/ai-assist/package.json` | Edit — storybook deps + script |
| 9 | `packages/ai-assist/src/components/HbcAiActionMenu.stories.tsx` | New |
| 10 | `packages/ai-assist/src/components/HbcAiSmartInsertOverlay.stories.tsx` | New |
| 11 | `packages/ai-assist/src/components/HbcAiTrustMeter.stories.tsx` | New |
| 12 | `packages/ai-assist/src/components/HbcAiLoadingState.stories.tsx` | New |
| 13 | `packages/ai-assist/src/components/HbcAiResultPanel.stories.tsx` | New |
| 14 | `packages/ai-assist/src/components/HbcAiGovernancePortal.stories.tsx` | New |
| 15 | `packages/ai-assist/src/reference/notificationRouting.test.ts` | New |
| 16 | `packages/ai-assist/e2e/summarize-scorecard-flow.spec.ts` | New |
| 17 | `docs/.../SF15-T08-Testing-Strategy.md` | Edit — progress comment |
| 18 | `docs/.../SF15-AI-Assist.md` | Edit — mark T08 complete |

---

## Execution Order

1. Step 1 (testing helpers) — no dependencies
2. Step 2 (governance portal test) — no dependencies
3. Step 3 (storybook infra) — needed before Step 4
4. Step 4 (story files) — depends on Step 3
5. Steps 5+6 (notification stubs + playwright) — independent
6. Step 7 (docs) — after all implementation

Steps 1, 2, 3 can be parallelized. Steps 5 and 6 can be parallelized.

---

## Verification

```bash
pnpm --filter @hbc/ai-assist check-types    # zero TS errors
pnpm --filter @hbc/ai-assist build          # clean build
pnpm --filter @hbc/ai-assist test           # all tests pass (169 existing + ~4 new + 5 todo stubs)
pnpm --filter @hbc/ai-assist lint           # zero errors
```

Storybook manual check: `cd packages/ai-assist && pnpm storybook` — confirm 6 component story files render.
