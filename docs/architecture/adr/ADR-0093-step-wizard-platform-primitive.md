# ADR-0093 — Step Wizard as Platform Primitive (`@hbc/step-wizard`)

**Status:** Accepted
**Date:** 2026-03-09
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
