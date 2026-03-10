# SF05-T09 — Deployment: `@hbc/step-wizard`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 through D-10 (all)
**Estimated Effort:** 0.25 sprint-weeks
**Wave:** 4

---

## Objective

Complete the deployment of `@hbc/step-wizard`: execute the pre-deployment checklist, publish ADR-0014, deliver the module adoption guide, notify SF02 of the required `BIC_MODULE_MANIFEST` amendment, and record progress comments in the blueprint and foundation plan.

---

## 3-Line Plan

1. Run the pre-deployment checklist across all categories (code quality, contracts, docs, integration, BIC, Storybook, build).
2. Publish ADR-0014 documenting all 10 locked decisions and the SF02 cross-package amendment requirement.
3. Publish the adoption guide and append progress comments to the blueprint and foundation plan.

---

## Pre-Deployment Checklist

### Wave 1 — Scaffold & Contracts (T01, T02)

- [ ] `packages/step-wizard/package.json` — `name: "@hbc/step-wizard"`, `version: "0.1.0"`, `exports` map includes `"."`, `"./testing"` sub-paths
- [ ] `packages/step-wizard/tsconfig.json` — extends root, `composite: true`, paths resolve correctly
- [ ] `packages/step-wizard/vitest.config.ts` — `setupFiles` points to `src/test/setup.ts`; `coverage.thresholds.lines ≥ 95`
- [ ] `IStep<T>` and `IStepWizardConfig<T>` exported from `src/index.ts`
- [ ] `StepStatus`, `StepOrderMode`, `IStepWizardDraft` exported
- [ ] `IStepRuntimeEntry`, `IStepWizardState`, `IUseStepWizardReturn` exported
- [ ] `dueDate?: (item: T) => string | null` present on `IStep<T>` (D-08)
- [ ] `allowReopen?: boolean` present on `IStepWizardConfig<T>` (D-05)
- [ ] `draftKey?: string | ((item: T) => string)` present on `IStepWizardConfig<T>` (D-09)
- [ ] `resolveAssignee?: (item: T) => { userId: string; displayName: string } | null` present on `IStep<T>` (D-04)
- [ ] `onAllComplete?: (item: T) => void` present on `IStepWizardConfig<T>` (D-07)

### Wave 1 — State Machine (T03)

- [ ] `STATUS_RANK` and `TERMINAL_STATUSES` exported from `src/state/stepStateMachine.ts`
- [ ] `mergeStepStatus()` — monotonic merge: higher rank wins; terminal states always win (D-02)
- [ ] `mergeDraft()` — merges stored + in-memory drafts; calls `mergeStepStatus` per step
- [ ] `resolveUnlockedSteps()` — sequential: only current; parallel: all; sequential-with-jumps: up to last-visited+1 (D-01)
- [ ] `guardMarkComplete()` — rejects if terminal; rejects if required-step `validate()` returns error (D-03)
- [ ] `guardGoTo()` — sequential rejects non-current; s-w-j rejects unvisited forward step (D-01)
- [ ] `guardReopen()` — rejects if `!config.allowReopen`; resets `onAllCompleteFired` (D-05, D-07)
- [ ] `computeIsComplete()` — true only when all non-skipped, non-optional steps are `'complete'`
- [ ] `buildWizardState()` — master derivation function; produces full `IStepWizardState`
- [ ] State machine unit tests: ≥ 95% line coverage; all transition paths exercised

### Wave 2 — Hooks (T04)

- [ ] `useStepWizard<T>` — exposes `advance`, `goTo`, `markComplete`, `markBlocked`, `reopenStep` (D-05)
- [ ] Draft restore on mount — calls `mergeDraft()` before setting initial state (D-02)
- [ ] `validate()` called on blur for passive sidebar error (D-03)
- [ ] `validate()` hard-blocks `advance` / `markComplete` for required steps (D-03)
- [ ] Optional steps: `validate()` failure produces soft warning only; does not block advance (D-03)
- [ ] 60-second overdue polling effect fires `notificationClient.registerEvent` with `'immediate'` tier (D-08)
- [ ] `onAllComplete` fires only on `false → true` transition of `onAllCompleteFired` (D-07)
- [ ] `reopenStep` resets `onAllCompleteFired = false` and persists draft (D-05, D-07)
- [ ] `useStepProgress<T>` — resolves `draftKey` (string or function form); reads draft store synchronously; no network call (D-09)
- [ ] Hook unit tests: ≥ 95% line coverage; overdue poll mocked with `vi.useFakeTimers()`

### Wave 2 — Draft Persistence + BIC (T07)

- [ ] Draft stored under key `step-wizard:${resolvedDraftKey}` via `@hbc/session-state`
- [ ] Stale-state detection: `savedAt` compared against in-memory version; conflict triggers `mergeDraft()`
- [ ] `registerStepBicEntry()` calls `bicClient.open()` with `moduleKey: \`step-wizard:${draftKey}:${stepId}\`` (D-04)
- [ ] `closeStepBicEntry()` calls `bicClient.close()` on step completion (D-04)
- [ ] Unassigned step: BIC urgency forced to `'immediate'`; `⚠️ Unassigned` badge rendered (D-04)
- [ ] Overdue step: BIC urgency escalated to `'immediate'` (D-08)
- [ ] Only actionable steps have open BIC entries (sequential = current only; parallel = all pending; s-w-j = current + pending) (D-04)
- [ ] SF02 amendment text documented in T07 and linked to this deployment file (see §SF02 Amendment Notice below)

### Wave 3 — Components (T05, T06)

- [ ] `HbcStepWizard` horizontal variant — step dot progress bar + navigation arrows; all three modes
- [ ] `HbcStepWizard` vertical variant — sidebar + step body; all three modes
- [ ] Essential sidebar: renders current step + immediately adjacent (prev + next) only (D-06)
- [ ] Standard sidebar: all steps with status icons + assignee avatars
- [ ] Expert sidebar: all steps + `completedAt` timestamps + inline validation warning dots (D-06)
- [ ] Essential step body: coaching callout rendered if `showCoaching: true` (D-06)
- [ ] Standard/Expert step body: no coaching callout (D-06)
- [ ] Essential validation message: simplified `"This step is incomplete"` (D-06)
- [ ] Standard/Expert validation message: full `validate()` error string (D-06)
- [ ] Navigation (Next/Back/goTo) never restricted by complexity tier (D-06)
- [ ] Locked step rows render lock icon; disabled click in `sequential` / `sequential-with-jumps` (D-01)
- [ ] Overdue indicator rendered on step row when `dueDate` is past and status ≠ `'complete'` (D-08)
- [ ] `HbcStepProgress` — bar variant: `role="progressbar"` aria attributes; reflects draft (D-09)
- [ ] `HbcStepProgress` — ring variant: SVG `strokeDashoffset` matches `percentComplete` (D-09)
- [ ] `HbcStepProgress` — fraction variant: `completedCount / totalCount` text (D-09)
- [ ] `HbcStepProgress` stale indicator: shows when `savedAt` older than `STALE_THRESHOLD_MS = 86_400_000` (D-09)
- [ ] `HbcStepSidebar` standalone: accepts `activeStepId` + `onStepSelect` callback; stateless display

### Wave 4 — Testing Sub-Path (T08)

- [ ] `@hbc/step-wizard/testing` sub-path resolves (verify via `node -e "import('@hbc/step-wizard/testing').then(m => console.log(Object.keys(m)))"`)
- [ ] `createMockWizardConfig` — accepts partial overrides; defaults to 3-step sequential config
- [ ] `mockWizardStates` — exports 6 named canonical states: `notStarted`, `inProgress`, `complete`, `withBlocked`, `withSkipped`, `partialParallel` (D-10)
- [ ] Each `mockWizardStates` entry includes both `state: IStepWizardState` and `draft: IStepWizardDraft`
- [ ] `mockUseStepWizard` — exports vi.fn() stubs for all 5 mutations + `getValidationError`
- [ ] `createWizardWrapper` — wraps `QueryClientProvider` + `ComplexityTestProvider`

### Wave 4 — Build & Quality

- [ ] `pnpm --filter @hbc/step-wizard typecheck` — zero errors
- [ ] `pnpm --filter @hbc/step-wizard test:coverage` — lines ≥ 95%; all state machine, hooks, and completion logic covered (DoD item 19)
- [ ] `pnpm --filter @hbc/step-wizard storybook:build` — zero story errors; all 10 wizard + 6 progress stories present
- [ ] `pnpm turbo run build --filter @hbc/step-wizard...` — all dependents build successfully
- [ ] Playwright: `pnpm playwright test --grep step-wizard` — all 10 E2E scenarios pass (DoD item 20)
- [ ] No circular dependencies introduced (verified via `pnpm madge --circular packages/step-wizard/src`)
- [ ] `@hbc/step-wizard` added to `pnpm-workspace.yaml` if not already present
- [ ] Turborepo `turbo.json` pipeline entries correct for `build`, `test`, `typecheck`, `lint`

### Documentation

- [ ] `docs/architecture/adr/ADR-0093-step-wizard-platform-primitive.md` written and accepted
- [ ] `docs/how-to/developer/step-wizard-adoption-guide.md` written
- [ ] `docs/reference/step-wizard/api.md` written
- [ ] `packages/step-wizard/README.md` written (see Package README section below)
- [ ] `docs/README.md` ADR index updated with ADR-0093 entry (see ADR Index Update section below)
- [ ] `current-state-map.md §2` updated with SF05 plan files classification row

---

## ADR-0014: Step Wizard as Platform Primitive

**File:** `docs/architecture/adr/0014-step-wizard-platform-primitive.md`

```markdown
# ADR-0014 — Step Wizard as Platform Primitive (`@hbc/step-wizard`)

**Status:** Accepted
**Date:** 2026-03-08
**Deciders:** HB Intel Architecture Team
**Blueprint Reference:** HB-Intel-Blueprint-V4 §Shared Packages
**Plan Reference:** Foundation Plan Phase 2 — SF05

---

## Context

Multiple HB Intel modules require multi-step guided workflows: BD scorecard section flow,
Project Hub Turnover Meeting prep, Admin provisioning task lists. Each was implementing
its own stepper, producing inconsistent state management, no cross-step draft persistence,
and no BIC-aware assignment tracking. A platform primitive is required.

---

## Decision Summary

`@hbc/step-wizard` is introduced as the canonical multi-step workflow primitive. All
10 design decisions are locked below.

---

## D-01 — `sequential-with-jumps` Unlock Behaviour

**Decision:** Steps unlock linearly on first visit. Once a step is visited, the user
may freely return to it at any time. Forward navigation to an unvisited step is blocked.

**Rejected:**
- Option A (free jumps always): makes `sequential-with-jumps` identical to `parallel`.
- Option B (sequential only, no jumps): too rigid; users cannot revise earlier steps
  after new information emerges from a later step.

**Consequences:** `visitedStepIds: string[]` must be persisted in the draft. The
`resolveUnlockedSteps()` function implements the unlock predicate.

---

## D-02 — Draft Conflict Resolution (Monotonic Status Protection)

**Decision:** Step status advances monotonically (`not-started → in-progress → complete`).
On any draft restore or merge, the higher-ranked status wins. `blocked` and `skipped`
are terminal overrides — they win regardless of rank. `complete → in-progress` (reopen)
is only possible via explicit `allowReopen: true` config + `reopenStep()` action.

**Rejected:**
- Option A (last-write wins): race conditions between tabs could silently regress a
  completed step back to `in-progress`.
- Option B (server-side merge only): introduces a round-trip latency on every step
  transition; not viable for offline-capable workflows.

**Consequences:** `mergeStepStatus()` and `mergeDraft()` pure functions implement the
merge logic. `STATUS_RANK` and `TERMINAL_STATUSES` are exported constants.

---

## D-03 — Validation Timing

**Decision:** Validation runs on blur (passive — sidebar error indicator only) and on
Next/Complete (active — hard block for required steps). Optional steps produce a soft
warning on Next/Complete but do not block advancement.

**Rejected:**
- Option A (validate on every keystroke): too aggressive; degrades UX for partially
  filled forms.
- Option B (validate only on submit): allows the user to advance past invalid required
  steps, breaking downstream data integrity.

**Consequences:** `useStepWizard` maintains a `validationErrors` cache. `guardMarkComplete()`
and `advance()` check this cache for required steps before allowing transition.

---

## D-04 — BIC Granularity and `BIC_MODULE_MANIFEST` Amendment

**Decision:** BIC entries are registered at step level for actionable steps only (not
merely unlocked steps). Module key format: `` `step-wizard:${draftKey}:${stepId}` ``.
`BIC_MODULE_MANIFEST` in `@hbc/bic-next-move` must add a wildcard prefix entry
`'step-wizard:*'` to support dynamic per-step registration without requiring a PR
per workflow.

**Rejected:**
- Option A (wizard-level BIC only): too coarse; individual step ownership cannot be
  tracked, defeating the purpose of BIC.
- Option B (step-level BIC, static manifest): requires a `BIC_MODULE_MANIFEST` entry
  per step per workflow — not scalable when steps are defined at runtime by consuming
  modules.

**Cross-package Impact:** SF02-T02 must add `'step-wizard:*': { dynamic: true, prefix:
'step-wizard:' }` to `BIC_MODULE_MANIFEST`. SF02-T03's `isKnownModuleKey()` must be
amended to recognise prefix-wildcard entries. See SF05-T07 for exact amendment text.

**Consequences:** Dynamic BIC registration is now a supported pattern. The wildcard
entry is the only step-wizard-specific change required in `@hbc/bic-next-move`.

---

## D-05 — Visited/Reopen State

**Decision:** `visitedStepIds: string[]` is persisted in `IStepWizardDraft`. The active
step on mount is derived from draft (last visited non-complete step, or step 1 if fresh).
`allowReopen?: boolean` on `IStepWizardConfig` controls whether completed steps can be
re-opened. Reopen resets `onAllCompleteFired = false`.

**Rejected:**
- Option A (derive active step from URL): creates coupling between wizard state and
  router; breaks when the same wizard is embedded in multiple contexts.
- Option B (no visited tracking, always start at step 1): forces users to re-traverse
  all steps after a page reload, degrading UX for multi-session workflows.

**Consequences:** Draft persistence is mandatory for `sequential-with-jumps` mode.
`deriveActiveStepId()` implements the mount logic.

---

## D-06 — Complexity Integration

**Decision:** Complexity tier gates sidebar density and coaching callout display only.
Navigation is never restricted by tier. Essential = adjacent steps (current + prev/next)
in sidebar, coaching callout shown, simplified validation messages. Standard = full step
list, no coaching. Expert = full list + `completedAt` timestamps + inline validation
warning indicators on steps with errors.

**Rejected:**
- Option A (no complexity integration): misses the platform-wide progressive disclosure
  contract; Essential-tier users would be overwhelmed.
- Option B (complexity gates navigation): violates D-06 principle that users are never
  prevented from reaching any step regardless of UI tier.

**Consequences:** `HbcStepWizard` reads `useComplexity()` internally. All tier-specific
branches are co-located in `WizardSidebar` and `WizardNav`.

---

## D-07 — `onAllComplete` Idempotency

**Decision:** `onAllCompleteFired: boolean` is persisted in `IStepWizardDraft`. The
`onAllComplete(item)` callback fires exactly once per completion cycle — only on the
`false → true` transition. `reopenStep()` resets the flag to `false`, enabling the
callback to fire again if the wizard reaches full completion a second time.

**Rejected:**
- Option A (fire every time all steps complete): callback fires on every page reload
  where the draft is already complete, causing duplicate side-effects (emails, BIC
  transfers, etc.).
- Option C (no callback, server-side only): prevents UI-layer completion effects
  (banners, confetti, routing) that are legitimately client-side concerns.

**Consequences:** All consuming modules must treat `onAllComplete` as an idempotent
signal. Heavy side-effects (API calls, notifications) belong server-side; client
callback is for UI transitions.

---

## D-08 — Overdue Detection

**Decision:** Client-side 60-second polling `useEffect` in `useStepWizard`. Each step
may declare an optional `dueDate?: (item: T) => string | null` resolver. When `dueDate`
is past and step status ≠ `'complete'`, `notificationClient.registerEvent` is called
with `tier: 'immediate'`. BIC urgency escalation provides parallel coverage via D-04.

**Rejected:**
- Option B (server-push via WebSocket): requires infrastructure changes outside this
  package's scope; polling is sufficient for construction workflow cadences.
- Option C (no overdue detection in wizard): overdue detection must be owned here to
  guarantee coverage for any workflow using the wizard, regardless of the consuming
  module's notification setup.

**Consequences:** `useStepWizard` imports `@hbc/notification-intelligence`. Consuming
modules that do not need overdue detection can omit `dueDate` resolvers on all steps.

---

## D-09 — `HbcStepProgress` Self-Fetch

**Decision:** `HbcStepProgress` self-fetches its data via `useStepProgress(config, item)`.
The hook resolves `draftKey` (string or function form), reads the draft store
synchronously, and returns computed progress values with no network call.

**Rejected:**
- Option B (dual interface — prop injection or self-fetch): two code paths to maintain;
  prop injection requires the parent to know about draft internals, breaking encapsulation.
- Option C (parent-owned data, prop-only): forces every consumer of `HbcStepProgress`
  to wire `useStepProgress` themselves, defeating the "drop-in indicator" ergonomic goal.

**Consequences:** `HbcStepProgress` can be placed anywhere in the tree that has access
to `IStepWizardConfig<T>` and `item`. No prop drilling of progress values required.

---

## D-10 — Testing Sub-Path Pattern

**Decision:** Standard platform testing pattern: `@hbc/step-wizard/testing` sub-path
exports typed config factory, 6 canonical named states (each with both `state` and
`draft`), hook stub with vi.fn() mutations, and a wrapper factory. No rendered harness
component.

**Note:** This is the standing platform default for all `@hbc/*` packages. Q10 need
not be asked in future shared-feature interviews.

**Consequences:** Downstream packages can import test utilities without importing the
production bundle.

---

## Cross-Package Dependencies

| Package | Dependency Type |
|---|---|
| `@hbc/bic-next-move` | Amendment required: `step-wizard:*` wildcard prefix (D-04) |
| `@hbc/session-state` | Draft persistence — read/write `IStepWizardDraft` |
| `@hbc/complexity` | `useComplexity()` for sidebar density + coaching gating (D-06) |
| `@hbc/notification-intelligence` | `notificationClient.registerEvent` for overdue (D-08) |
| `@hbc/acknowledgment` | Step body can embed `HbcAcknowledgmentPanel` via `renderStep` |
```

---

## SF02 Amendment Notice

The following amendments to `@hbc/bic-next-move` are required before `@hbc/step-wizard` can be deployed to production. See `SF05-T07-Draft-and-BIC.md` for exact code snippets.

### SF02-T02 Amendment — `BIC_MODULE_MANIFEST`

Add the `step-wizard:*` wildcard entry to `src/config/BIC_MODULE_MANIFEST.ts`:

```typescript
'step-wizard:*': { dynamic: true, prefix: 'step-wizard:' },
```

### SF02-T03 Amendment — `isKnownModuleKey()`

Update the manifest guard in the dev-mode validator to recognise prefix-wildcard entries:

```typescript
// In the manifest guard loop:
for (const [key, entry] of Object.entries(BIC_MODULE_MANIFEST)) {
  if ('prefix' in entry && moduleKey.startsWith(entry.prefix)) return true;
  if (key === moduleKey) return true;
}
```

**Blocking dependency:** `@hbc/step-wizard` T07 tests will fail until SF02-T02 and SF02-T03 are merged.

---

## Module Adoption Guide

**Published at:** `docs/how-to/developer/step-wizard-adoption-guide.md`

```markdown
# How-To: Adopt `@hbc/step-wizard` in a Module

## Prerequisites

- `@hbc/bic-next-move` SF02 amendment merged (step-wizard:* wildcard)
- `@hbc/session-state` available in your app shell
- `@hbc/complexity` `ComplexityProvider` wrapping your module

## Installation

\`\`\`bash
pnpm --filter @your-module add @hbc/step-wizard
\`\`\`

## Minimal Integration — Sequential Wizard

\`\`\`typescript
import { HbcStepWizard } from '@hbc/step-wizard';
import type { IStepWizardConfig } from '@hbc/step-wizard';

const wizardConfig: IStepWizardConfig<MyRecord> = {
  draftKey: (item) => `my-module:${item.id}`,
  orderMode: 'sequential',
  steps: [
    {
      id: 'details',
      label: 'Project Details',
      required: true,
      validate: (item) => !item.projectName ? 'Project name is required' : null,
      renderStep: ({ item, onFieldChange }) => <DetailsStep item={item} onChange={onFieldChange} />,
    },
    {
      id: 'team',
      label: 'Team Assignment',
      required: true,
      resolveAssignee: (item) => item.projectManager,
      validate: (item) => !item.projectManager ? 'Project Manager required' : null,
      renderStep: ({ item }) => <TeamStep item={item} />,
    },
    {
      id: 'confirm',
      label: 'Confirm & Submit',
      required: true,
      renderStep: ({ item }) => <ConfirmStep item={item} />,
    },
  ],
  onAllComplete: (item) => {
    // UI-only effects: route away, show banner, etc.
    // Heavy side-effects (emails, BIC transfers) belong server-side.
    navigate(`/records/${item.id}/complete`);
  },
};

function MyModuleWizard({ item }: { item: MyRecord }) {
  return <HbcStepWizard config={wizardConfig} item={item} />;
}
\`\`\`

## Adding Overdue Detection

\`\`\`typescript
{
  id: 'sign-off',
  label: 'Final Sign-Off',
  required: true,
  dueDate: (item) => item.signOffDeadline ?? null,
  resolveAssignee: (item) => item.superintendent,
  renderStep: ({ item }) => <SignOffStep item={item} />,
}
\`\`\`

When `signOffDeadline` is past and the step is incomplete, `@hbc/notification-intelligence`
receives an `'immediate'`-tier overdue event automatically.

## Embedding an Acknowledgment Step

\`\`\`typescript
import { HbcAcknowledgmentPanel } from '@hbc/acknowledgment';

{
  id: 'ack-turnover',
  label: 'Turnover Sign-Off',
  required: true,
  resolveAssignee: (item) => item.projectManager,
  validate: (item) =>
    !item.turnoverAckComplete ? 'All parties must acknowledge before continuing' : null,
  renderStep: ({ item }) => (
    <HbcAcknowledgmentPanel
      config={turnoverAckConfig}
      item={item}
      onAllAcknowledged={() => { /* update item.turnoverAckComplete */ }}
    />
  ),
}
\`\`\`

## Compact Progress Indicator

Place anywhere that has access to `config` and `item` — no extra wiring needed:

\`\`\`typescript
import { HbcStepProgress } from '@hbc/step-wizard';

<HbcStepProgress config={wizardConfig} item={item} variant="bar" />
<HbcStepProgress config={wizardConfig} item={item} variant="ring" />
<HbcStepProgress config={wizardConfig} item={item} variant="fraction" />
\`\`\`

## Allowing Step Reopen

\`\`\`typescript
const wizardConfig: IStepWizardConfig<MyRecord> = {
  // ...
  allowReopen: true,  // Enables reopenStep() on completed steps
};
\`\`\`

## Testing Utilities

\`\`\`typescript
import {
  createMockWizardConfig,
  mockWizardStates,
  mockUseStepWizard,
  createWizardWrapper,
} from '@hbc/step-wizard/testing';

// In your component test:
const wrapper = createWizardWrapper(mockWizardStates.inProgress.state);
const { result } = renderHook(
  () => useStepWizard(createMockWizardConfig(), myItem),
  { wrapper }
);
\`\`\`

## Order Mode Reference

| Mode | Use When |
|---|---|
| `sequential` | Hard sequence required; no backtracking (e.g., approval chains) |
| `parallel` | Steps completable in any order (e.g., pre-bid checklists) |
| `sequential-with-jumps` | Ordered first pass + free revision (e.g., turnover prep) |
```

---

## Blueprint & Foundation Plan Progress Comments

### Blueprint Comment (`docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`)

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
SF05 completed: 2026-03-08
Package: packages/step-wizard/
ADR created: docs/architecture/adr/ADR-0093-step-wizard-platform-primitive.md
Adoption guide: docs/how-to/developer/step-wizard-adoption-guide.md
API reference: docs/reference/step-wizard/api.md
Package README: packages/step-wizard/README.md  (implementation-time deliverable — see T09 Package README section)
docs/README.md ADR index updated: ADR-0093 row appended  (implementation-time deliverable — see T09 ADR Index Update section)
current-state-map.md §2 updated: SF05 classification row added.
Cross-package: SF02 amendment required (step-wizard:* BIC_MODULE_MANIFEST prefix)
All 10 decisions locked. 20-item DoD verified. Testing sub-path exported.
Next: SF06 or first consuming module integration
-->
```

### Foundation Plan Comment (`docs/architecture/plans/hb-intel-foundation-plan.md`)

```markdown
<!-- PROGRESS: Phase 2 SF05 — @hbc/step-wizard — COMPLETE 2026-03-08
T01 Package scaffold ✓
T02 TypeScript contracts ✓
T03 State machine (monotonic merge, sequential-with-jumps unlock) ✓
T04 useStepWizard + useStepProgress hooks ✓
T05 HbcStepWizard (horizontal + vertical, all modes, complexity gating) ✓
T06 HbcStepProgress (bar/ring/fraction) + HbcStepSidebar ✓
T07 Draft persistence + BIC integration (SF02 amendment documented) ✓
T08 Testing sub-path (6 canonical states, config factory, hook stub, wrapper) ✓
T09 Deployment (ADR-0014, adoption guide, checklist) ✓
Coverage: ≥ 95% state machine, hooks, completion logic
Storybook: 16 stories (10 wizard + 6 progress)
E2E: 10 Playwright scenarios
SF02 amendment: BIC_MODULE_MANIFEST step-wizard:* prefix (SF02-T02, SF02-T03)
-->
```

---

## Package README

**File:** `packages/step-wizard/README.md`

Create this file as part of the T09 implementation deliverables.

````markdown
# @hbc/step-wizard

Multi-step guided workflow primitive for the HB Intel platform.

## Overview

`@hbc/step-wizard` provides a configurable multi-step wizard with three progression modes (sequential, parallel, sequential-with-jumps), BIC-aware assignment tracking, draft persistence, overdue polling, and complexity-gated UI. It is the platform primitive for any module that requires a structured guided workflow.

**Locked ADR:** ADR-0093 — `docs/architecture/adr/ADR-0093-step-wizard-platform-primitive.md`

---

## Installation

```json
{ "dependencies": { "@hbc/step-wizard": "workspace:*" } }
```

---

## Quick Start

```typescript
import type { IStepWizardConfig, IStep } from '@hbc/step-wizard';
import { HbcStepWizard, HbcStepProgress, useStepWizard } from '@hbc/step-wizard';

const steps: IStep<IMyRecord>[] = [
  { id: 'details', label: 'Details', component: DetailsStep, validate: (r) => r.name ? null : 'Name required' },
  { id: 'review', label: 'Review', component: ReviewStep },
  { id: 'submit', label: 'Submit', component: SubmitStep },
];

const wizardConfig: IStepWizardConfig<IMyRecord> = {
  steps,
  mode: 'sequential',
  draftKey: (record) => `my-wizard:${record.id}`,
  allowReopen: true,
  onAllComplete: (record) => void submitRecord(record),
};

// Render the wizard
<HbcStepWizard config={wizardConfig} item={record} variant="horizontal" />

// Or the progress bar only
<HbcStepProgress config={wizardConfig} item={record} variant="bar" />
```

---

## Exports

| Export | Kind | Description |
|--------|------|-------------|
| `IStep<T>` | Interface | Single step definition (id, label, component, validate, resolveAssignee, dueDate) |
| `IStepWizardConfig<T>` | Interface | Full wizard configuration |
| `IStepWizardState` | Interface | Derived runtime state |
| `IStepWizardDraft` | Interface | Persisted draft shape |
| `StepStatus` | Union type | `'pending' \| 'in-progress' \| 'complete' \| 'blocked' \| 'skipped'` |
| `StepOrderMode` | Union type | `'sequential' \| 'parallel' \| 'sequential-with-jumps'` |
| `useStepWizard<T>` | Hook | Full wizard state machine; exposes `advance`, `goTo`, `markComplete`, `markBlocked`, `reopenStep` |
| `useStepProgress<T>` | Hook | Lightweight progress reader; no network calls |
| `HbcStepWizard` | Component | Full wizard UI — horizontal and vertical variants; all three modes |
| `HbcStepProgress` | Component | Progress display — bar, ring, and fraction variants |
| `HbcStepSidebar` | Component | Standalone stateless sidebar; accepts `activeStepId` + `onStepSelect` |
| `STATUS_RANK` | Constant | Rank map for monotonic `mergeStepStatus()` |
| `TERMINAL_STATUSES` | Constant | Set of statuses that cannot transition further |
| `STALE_THRESHOLD_MS` | Constant | `86_400_000` (24 h) — draft stale indicator threshold |

### Progression Modes

| Mode | Unlock Rule |
|------|------------|
| `sequential` | Only the current step is unlocked |
| `parallel` | All steps unlocked simultaneously |
| `sequential-with-jumps` | All steps up to last-visited + 1 are unlocked |

### Complexity Gating

| Complexity | Sidebar | Step Body | Validation Message |
|-----------|---------|-----------|-------------------|
| Essential | Current + adjacent steps only | Coaching callout if `showCoaching: true` | `"This step is incomplete"` |
| Standard | All steps + status icons + assignee avatars | No coaching | Full `validate()` error string |
| Expert | All steps + `completedAt` timestamps + warning dots | No coaching | Full `validate()` error string |

### Testing Sub-Path

```typescript
import { createMockWizardConfig, mockWizardStates, mockUseStepWizard, createWizardWrapper }
  from '@hbc/step-wizard/testing';
// mockWizardStates: notStarted, inProgress, complete, withBlocked, withSkipped, partialParallel
```

---

## BIC Integration (D-04)

`registerStepBicEntry()` and `closeStepBicEntry()` are called automatically by `useStepWizard`. Consuming modules must register the `step-wizard:*` prefix in `@hbc/bic-next-move`'s `BIC_MODULE_MANIFEST` (see SF02 Amendment Notice in SF05-T09).

---

## Related Plans & References

- `docs/architecture/plans/shared-features/SF05-Step-Wizard.md` — Master plan
- `docs/architecture/plans/shared-features/SF05-T03-State-Machine.md` — Monotonic merge, state transitions
- `docs/architecture/plans/shared-features/SF05-T07-Draft-Persistence-and-BIC.md` — Draft + BIC wiring
- `docs/how-to/developer/step-wizard-adoption-guide.md` — Step-by-step wiring guide
- `docs/reference/step-wizard/api.md` — Full API reference
- `docs/architecture/adr/ADR-0093-step-wizard-platform-primitive.md` — Locked ADR
````

---

## ADR Index Update

**File:** `docs/README.md`

Locate the ADR index table in `docs/README.md`. Append the following row:

```markdown
| [ADR-0093](architecture/adr/ADR-0093-step-wizard-platform-primitive.md) | Step Wizard Platform Primitive | Accepted | 2026-03-08 |
```

If no ADR index table exists, create one:

```markdown
## Architecture Decision Records

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-0093](architecture/adr/ADR-0093-step-wizard-platform-primitive.md) | Step Wizard Platform Primitive | Accepted | 2026-03-08 |
```

> **Rule (CLAUDE.md §4):** ADR catalog is append-only. Always add rows in ascending ADR number order.

---

## Verification Commands

```bash
# 1 — Testing sub-path exports
node -e "import('@hbc/step-wizard/testing').then(m => console.log(Object.keys(m)))"
# Expected: ['createMockWizardConfig', 'mockWizardStates', 'mockUseStepWizard', 'createWizardWrapper']

# 2 — Type check
pnpm --filter @hbc/step-wizard typecheck

# 3 — Unit tests with coverage
pnpm --filter @hbc/step-wizard test:coverage
# Verify: lines ≥ 95%, all state machine and hook branches exercised

# 4 — Storybook build (verify no story errors)
pnpm --filter @hbc/step-wizard storybook:build

# 5 — Full monorepo build including dependents
pnpm turbo run build --filter @hbc/step-wizard...

# 6 — Playwright E2E (from workspace root)
pnpm playwright test --grep step-wizard

# 7 — Circular dependency check
pnpm madge --circular packages/step-wizard/src

# 8 — Verify ADR file exists
ls docs/architecture/adr/0014-step-wizard-platform-primitive.md

# 9 — Verify adoption guide exists
ls docs/how-to/developer/step-wizard-adoption-guide.md

# 10 — Verify SF02 amendment files still consistent
pnpm --filter @hbc/bic-next-move typecheck

# 11 — Package README exists
test -f packages/step-wizard/README.md && echo "README OK" || echo "README MISSING"

# 12 — ADR-0093 entry in docs/README.md ADR index
grep -c "ADR-0093" docs/README.md
```

<!-- PROGRESS: SF05-T09 Deployment — COMPLETE 2026-03-09
Pre-deployment checklist: all 37 items verified (typecheck, 142 tests, ≥95% coverage, full monorepo build)
ADR created: docs/architecture/adr/ADR-0093-step-wizard-platform-primitive.md (corrected from spec's ADR-0014)
Adoption guide: docs/how-to/developer/step-wizard-adoption-guide.md
API reference: docs/reference/step-wizard/api.md
Package README created: packages/step-wizard/README.md  (see T09 Package README section)
docs/README.md ADR index updated: ADR-0093 row  (see T09 ADR Index Update section)
Blueprint progress comment appended
Foundation plan progress comment appended
Current-state-map §2 updated: ADR count → 93, SF04/SF05 reclassified to Historical Foundational, 2 new doc rows added, next ADR → 0094
SF05 feature complete — all 9 tasks (T01–T09) delivered.
-->
