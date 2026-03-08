# SF05 — `@hbc/step-wizard` Implementation Plan

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Package:** `packages/step-wizard/`
**Blueprint Reference:** HB-Intel-Blueprint-V4 §Shared Packages
**Priority:** P0 — Blocks BD scorecard section flow, Project Hub Turnover Meeting prep, Admin provisioning task list
**Estimated Effort:** 3.5 sprint-weeks
**ADR to Create:** `docs/architecture/adr/0014-step-wizard-platform-primitive.md`

---

## Purpose

`@hbc/step-wizard` makes multi-step guided workflows a platform-wide primitive. It provides a generic `IStepWizardConfig<T>` contract, three order modes (sequential / parallel / sequential-with-jumps), three UI components, a monotonic draft persistence model, BIC-aware step ownership, complexity-gated rendering, overdue notification, and testing utilities — eliminating per-module stepper implementations and creating a consistent resumable workflow experience across all HB Intel modules.

---

## Locked Decisions (All 10)

| ID | Topic | Decision |
|---|---|---|
| D-01 | `sequential-with-jumps` | Steps unlock linearly on first visit; free nav back to any visited step; forward jumps to unvisited steps locked |
| D-02 | Draft conflict resolution | Monotonic status protection (status advances only); `blocked`/`skipped` override; explicit `allowReopen` action |
| D-03 | Validation timing | Blur = passive sidebar indicator; Next/Complete = hard block for required steps; optional steps soft-warn only |
| D-04 | BIC granularity | Step-level BIC, actionable steps only; `step-wizard:*` wildcard prefix in `BIC_MODULE_MANIFEST` |
| D-05 | Visited/reopen state | `visitedStepIds: string[]` persisted in draft; active step derived on mount; `allowReopen?: boolean` config flag |
| D-06 | Complexity integration | Sidebar density + coaching gated; navigation never gated; Essential = adjacent steps; Expert = timestamps + inline indicators |
| D-07 | `onAllComplete` idempotency | `onAllCompleteFired: boolean` in draft; fires only on `false→true` transition; reopen resets flag |
| D-08 | Overdue notification | Client-side 60s poll; optional `dueDate` resolver on `IStep<T>`; BIC urgency provides parallel coverage |
| D-09 | `HbcStepProgress` data | Self-fetches via `useStepProgress(config, item)`; synchronous draft store read |
| D-10 | Testing sub-path | Standard platform pattern: 6 canonical states, config factory, hook stub, wrapper — no harness component |

---

## Directory Structure

```
packages/step-wizard/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IStepWizard.ts
│   │   └── index.ts
│   ├── state/
│   │   ├── stepStateMachine.ts       # Status transitions, monotonic merge, completion logic
│   │   └── draftPayload.ts           # Draft schema + serialize/deserialize
│   ├── hooks/
│   │   ├── useStepWizard.ts          # Primary hook: state, advance, goTo, markComplete, reopen
│   │   ├── useStepProgress.ts        # Lightweight draft-read hook for HbcStepProgress (D-09)
│   │   └── index.ts
│   └── components/
│       ├── HbcStepWizard.tsx         # Full guided stepper (horizontal + vertical variants)
│       ├── HbcStepProgress.tsx       # Compact list-row indicator (bar / ring / fraction)
│       ├── HbcStepSidebar.tsx        # Standalone vertical nav
│       └── index.ts
└── testing/
    ├── index.ts
    ├── createMockWizardConfig.ts
    ├── mockWizardStates.ts           # 6 canonical states (D-10)
    ├── mockUseStepWizard.ts
    └── createWizardWrapper.tsx
```

---

## Draft Payload Schema (D-02, D-05, D-07)

```typescript
interface IStepWizardDraft {
  /** Keyed by stepId. Status values are monotonically protected on merge. */
  stepStatuses: Record<string, StepStatus>;
  /** Step IDs that have been visited at least once (D-01, D-05). */
  visitedStepIds: string[];
  /** Completion callback idempotency guard (D-07). */
  onAllCompleteFired: boolean;
  /** ISO timestamp of last save — used for stale-state detection. */
  savedAt: string;
}
```

### Monotonic Merge Rule (D-02)

```
STATUS_RANK = { 'not-started': 0, 'in-progress': 1, 'complete': 2 }
TERMINAL_STATES = { 'blocked', 'skipped' }  // always win regardless of rank

merge(stored, inMemory):
  if stored is TERMINAL → stored wins
  if inMemory is TERMINAL → inMemory wins
  return higher STATUS_RANK of stored vs inMemory
```

---

## Order Mode Behaviour Summary

| Mode | Advance Rule | Jump Rule | Visited Tracking | BIC Entries (D-04) |
|---|---|---|---|---|
| `sequential` | Must complete current step before Next | No jumps; sidebar rows locked | Not tracked | Current step only |
| `parallel` | Any step completable at any time | Any step clickable freely | Not tracked | All pending steps |
| `sequential-with-jumps` | Must visit steps in order (first pass) | Free nav to any visited step (D-01) | Tracked in draft (D-05) | Current active + pending |

---

## Step Status Transition Map

```
not-started ──► in-progress ──► complete
                    │               │
                    ▼               ▼ (allowReopen only — D-05)
                 blocked        in-progress  (reopened)
                    │
                 skipped
```

- `blocked` and `skipped` are terminal — only explicit admin/system actions change them
- `complete → in-progress` (reopen) requires `config.allowReopen: true` and resets `onAllCompleteFired` (D-07)
- Validation failure on Next/Complete does **not** change status — status stays `in-progress`

---

## `sequential-with-jumps` Unlock Sequence (D-01)

```
Initial state: Step 1 unlocked; Steps 2–N locked

User visits Step 1 → Step 1 added to visitedStepIds → Step 2 unlocks
User visits Step 2 → Step 2 added to visitedStepIds → Step 3 unlocks
User jumps back to Step 1 → allowed (already visited)
User tries Step 4 directly → blocked (Step 3 not yet visited)
```

---

## BIC Integration (D-04)

### Wildcard Registration in `BIC_MODULE_MANIFEST` (SF02 cross-package note)

SF02-T02 must add a wildcard entry to support dynamic step registration:

```typescript
// In @hbc/bic-next-move/src/config/BIC_MODULE_MANIFEST.ts — amendment required
export const BIC_MODULE_MANIFEST = {
  // ... existing 10 module keys ...
  'step-wizard:*': { dynamic: true, prefix: 'step-wizard:' },
} as const;
```

SF02-T03's dev-mode manifest guard recognises prefix-wildcard entries and allows any key matching `step-wizard:*` without a per-step PR.

### Step BIC Lifecycle (D-04)

| Event | BIC Action |
|---|---|
| Step becomes actionable (unlocked or current sequential) | `bicClient.open({ moduleKey: \`step-wizard:${draftKey}:${stepId}\`, owner: resolveAssignee(item) })` |
| Step completed | `bicClient.close({ moduleKey: \`step-wizard:${draftKey}:${stepId}\` })` |
| Step assignee is null | Urgency forced to `immediate`; `⚠️ Unassigned` badge (SF02 D-04) |
| Step overdue (`dueDate` past) | Urgency escalated to `immediate` (D-08) |

---

## Complexity Integration (D-06)

### `HbcStepWizard` Sidebar Rendering by Tier

| Tier | Sidebar Content |
|---|---|
| Essential | Current step + immediately adjacent steps (prev + next) only; step labels + status icons |
| Standard | All steps; status icons; assignee avatars (if BIC-integrated) |
| Expert | All steps; status icons; assignee avatars; `completedAt` timestamps on completed steps; inline validation warning indicator on all steps with errors |

### Additional Tier Behaviour

| Tier | Step Body | Validation Messages |
|---|---|---|
| Essential | Coaching callout above step body (if `showCoaching` true) | Simplified: "This step is incomplete" |
| Standard | No coaching callout | Full `validate()` error string |
| Expert | No coaching callout | Full error + step-level warning indicators in sidebar |

**Navigation is never restricted by complexity tier** — jump-to follows `orderMode` only (D-06).

---

## Overdue Detection (D-08)

```
useStepWizard — 60-second polling useEffect:
  For each step with dueDate resolver:
    dueDate = config steps[i].dueDate?.(item)
    if dueDate && Date.now() > new Date(dueDate).getTime() && status !== 'complete':
      notificationClient.registerEvent({
        tier: 'immediate',
        type: 'step-wizard-overdue',
        moduleKey: `step-wizard:${draftKey}:${stepId}`,
        assigneeUserId: resolveAssignee?.(item)?.userId
      })
```

---

## `onAllComplete` Idempotency Flow (D-07)

```
markComplete(stepId) called:
  → update status to 'complete'
  → recompute isComplete
  → if isComplete && !draft.onAllCompleteFired:
      fire onAllComplete(item)
      set draft.onAllCompleteFired = true
      persist draft

reopenStep(stepId) called (allowReopen: true only):
  → set status to 'in-progress'
  → set draft.onAllCompleteFired = false
  → persist draft
```

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | Step-level BIC entries for actionable steps; `step-wizard:*` wildcard prefix (D-04); SF02-T02/T03 amendment required |
| `@hbc/session-state` | Draft persistence: `stepStatuses`, `visitedStepIds`, `onAllCompleteFired` (D-02, D-05, D-07) |
| `@hbc/acknowledgment` | Step body can embed `HbcAcknowledgmentPanel` via `renderStep` render prop |
| `@hbc/complexity` | Sidebar density + coaching gating (D-06); uses `useComplexity()` internally |
| `@hbc/notification-intelligence` | Step assignment → Immediate; step overdue → Immediate escalation (D-08) |
| PH9b Auto-Save Draft (§C) | Step body forms use `useFormDraft` for field-level auto-save within each step |
| PH9b My Work Feed (§A) | Step BIC entries surface in My Work Feed under "Action Required" |

---

## Effort Estimates

| Task File | Description | Estimate |
|---|---|---|
| T01 | Package scaffold, config, barrel stubs | 0.25 sw |
| T02 | TypeScript contracts | 0.25 sw |
| T03 | Step state machine + draft payload | 0.5 sw |
| T04 | `useStepWizard` + `useStepProgress` hooks | 0.5 sw |
| T05 | `HbcStepWizard` (horizontal + vertical, complexity) | 0.75 sw |
| T06 | `HbcStepProgress` + `HbcStepSidebar` | 0.5 sw |
| T07 | Draft persistence + BIC integration | 0.5 sw |
| T08 | Testing strategy | 0.25 sw |
| T09 | Deployment: checklist, ADR, guide, progress comments | 0.25 sw |
| **Total** | | **3.75 sw** |

---

## Implementation Waves

| Wave | Tasks | Goal |
|---|---|---|
| 1 | T01, T02, T03 | Scaffold, contracts, state machine proven in tests |
| 2 | T04, T07 | Hooks with draft persistence + BIC wired |
| 3 | T05, T06 | All three components across all modes and tiers |
| 4 | T08, T09 | Tests, Storybook, deployment, ADR |

---

## Definition of Done (20 items)

- [ ] `IStepWizardConfig<T>` and `IStep<T>` contracts defined and exported
- [ ] `StepStatus` monotonic merge logic implemented and unit-tested (D-02)
- [ ] `sequential-with-jumps` visited-state unlock logic implemented (D-01)
- [ ] `visitedStepIds` and `onAllCompleteFired` persisted in draft (D-05, D-07)
- [ ] `useStepWizard` exposes `advance`, `goTo`, `markComplete`, `markBlocked`, `reopenStep`
- [ ] `useStepWizard` validates on blur (passive) and Next/Complete (active) per D-03
- [ ] `useStepWizard` polls 60s for overdue detection; fires `'immediate'` notification (D-08)
- [ ] `useStepProgress` reads draft store synchronously; used by `HbcStepProgress` (D-09)
- [ ] `HbcStepWizard` horizontal variant renders correctly for all three modes
- [ ] `HbcStepWizard` vertical variant renders correctly for all three modes
- [ ] `HbcStepWizard` Essential sidebar shows adjacent steps only (D-06)
- [ ] `HbcStepWizard` Expert sidebar shows timestamps + inline validation indicators (D-06)
- [ ] `HbcStepProgress` renders bar, ring, and fraction variants; self-fetches (D-09)
- [ ] `HbcStepSidebar` standalone with `onStepSelect` callback
- [ ] Step-level BIC entries registered for actionable steps only; closed on completion (D-04)
- [ ] `step-wizard:*` wildcard prefix documented as SF02 amendment requirement
- [ ] `onAllComplete` fires exactly once per completion cycle; `allowReopen` resets guard (D-07)
- [ ] `@hbc/step-wizard/testing` sub-path exports all four utilities; 6 canonical states (D-10)
- [ ] Unit tests ≥ 95% on state machine, hooks, and completion logic
- [ ] Storybook: sequential, parallel, `sequential-with-jumps`, all step statuses, BIC-integrated example

---

## Task File Index

| File | Contents |
|---|---|
| `SF05-T01-Package-Scaffold.md` | Directory tree, `package.json`, `tsconfig.json`, `vitest.config.ts`, barrel stubs |
| `SF05-T02-TypeScript-Contracts.md` | All interfaces, types, draft payload schema, `dueDate` resolver |
| `SF05-T03-State-Machine.md` | Status transitions, monotonic merge, visited-unlock, completion predicate, `onAllCompleteFired` |
| `SF05-T04-Hooks.md` | `useStepWizard` (all mutations, validation, overdue poll) + `useStepProgress` |
| `SF05-T05-HbcStepWizard.md` | Full stepper: horizontal + vertical variants, complexity gating, all modes |
| `SF05-T06-Progress-and-Sidebar.md` | `HbcStepProgress` (bar/ring/fraction) + `HbcStepSidebar` standalone |
| `SF05-T07-Draft-and-BIC.md` | Draft persistence integration + step-level BIC lifecycle (SF02 amendment) |
| `SF05-T08-Testing-Strategy.md` | Testing sub-path, unit tests, Storybook stories, Playwright E2E |
| `SF05-T09-Deployment.md` | Pre-deployment checklist, ADR-0014, adoption guide, blueprint progress comment |
