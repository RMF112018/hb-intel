# SF05-T02 — TypeScript Contracts: `@hbc/step-wizard`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 (visited tracking), D-02 (monotonic/terminal statuses), D-03 (validation), D-05 (allowReopen), D-07 (onAllCompleteFired), D-08 (dueDate resolver)
**Estimated Effort:** 0.25 sprint-weeks
**Wave:** 1

---

## Objective

Define every TypeScript interface, type, and constant the package depends on. All contracts must be stable before the state machine and hooks begin implementation.

---

## 3-Line Plan

1. Write `src/types/IStepWizard.ts` — all interfaces, type aliases, and hook return types.
2. Write `src/state/draftPayload.ts` — draft schema with `visitedStepIds`, `onAllCompleteFired`, and monotonic merge utilities.
3. Export through barrels; verify `typecheck` passes with zero errors.

---

## `src/types/IStepWizard.ts`

```typescript
import type { IBicOwner } from '@hbc/bic-next-move';

// ─── Primitive Types ─────────────────────────────────────────────────────────

export type StepStatus =
  | 'not-started'
  | 'in-progress'
  | 'complete'
  | 'blocked'
  | 'skipped';

export type StepOrderMode = 'sequential' | 'parallel' | 'sequential-with-jumps';

// ─── Step Definition ─────────────────────────────────────────────────────────

export interface IStep<T> {
  /** Unique stable key — must not change across wizard remounts. */
  stepId: string;
  /** Display label shown in sidebar and progress bar. */
  label: string;
  /** Optional icon key from @hbc/ui-kit icon set. */
  icon?: string;
  /** Whether this step is required for overall completion. (D-03) */
  required: boolean;
  /** For sequential and sequential-with-jumps mode: 1-based display order. */
  order?: number;
  /**
   * Resolves the BIC owner for this step. When present, step-level BIC
   * entries are registered for actionable steps only. (D-04)
   * Return null → step renders with ⚠️ Unassigned badge (SF02 D-04).
   */
  resolveAssignee?: (item: T) => IBicOwner | null;
  /** Resolves whether this step is currently blocked by an external condition. */
  resolveIsBlocked?: (item: T) => boolean;
  /** Blocking reason shown in the sidebar tooltip when blocked. */
  resolveBlockedReason?: (item: T) => string | null;
  /**
   * Synchronous validation. Returns null when valid; error string when invalid.
   * Runs on step blur (passive indicator) and on Next/Complete (hard gate for
   * required steps). Must remain pure and synchronous. (D-03)
   */
  validate?: (item: T) => string | null;
  /**
   * Optional due date resolver. When provided, useStepWizard polls every 60s
   * and fires an 'immediate'-tier notification when past due. (D-08)
   */
  dueDate?: (item: T) => string | null;
  /** Called when this step is marked complete. May be async. */
  onComplete?: (item: T) => void | Promise<void>;
}

// ─── Wizard Config ────────────────────────────────────────────────────────────

export interface IStepWizardConfig<T> {
  /** Human-readable title for the wizard. */
  title: string;
  steps: IStep<T>[];
  orderMode: StepOrderMode;
  /**
   * Whether completed steps can be explicitly reopened. (D-05)
   * Reopen sets status back to 'in-progress' and resets onAllCompleteFired.
   */
  allowReopen?: boolean;
  /** Whether required steps can be force-completed despite validation failure. */
  allowForceComplete?: boolean;
  /**
   * Called when all required steps are complete.
   * Fires at most once per completion cycle — guarded by onAllCompleteFired. (D-07)
   * Resets when a step is reopened.
   */
  onAllComplete?: (item: T) => void | Promise<void>;
  /**
   * Unique key for @hbc/session-state draft persistence.
   * Can be a static string or a function of the item (for per-record uniqueness).
   */
  draftKey?: string | ((item: T) => string);
}

// ─── Runtime State ────────────────────────────────────────────────────────────

export interface IStepRuntimeEntry {
  stepId: string;
  label: string;
  icon?: string;
  required: boolean;
  order?: number;
  status: StepStatus;
  /** ISO timestamp when step reached 'complete' status. Null otherwise. */
  completedAt: string | null;
  /** Resolved assignee at current render time. */
  assignee: IBicOwner | null;
  /** Resolved validation error at current render time. Null when valid. */
  validationError: string | null;
  /** Whether this step is currently overdue. (D-08) */
  isOverdue: boolean;
  /**
   * In sequential-with-jumps: true when this step has been visited at least once.
   * Always true in sequential and parallel modes (not tracked). (D-01)
   */
  isVisited: boolean;
  /**
   * In sequential-with-jumps: true when this step is unlocked (visited or
   * immediately next to unlock). Always true in parallel mode. (D-01)
   */
  isUnlocked: boolean;
}

export interface IStepWizardState {
  steps: IStepRuntimeEntry[];
  /** stepId of the currently active step. Null when wizard is complete. */
  activeStepId: string | null;
  completedCount: number;
  requiredCount: number;
  isComplete: boolean;
  percentComplete: number;
  /** Whether onAllComplete has already fired this cycle. (D-07) */
  onAllCompleteFired: boolean;
}

// ─── Hook Return Types ────────────────────────────────────────────────────────

export interface IUseStepWizardReturn {
  state: IStepWizardState;
  /** Advance from current step to next (sequential/sequential-with-jumps). */
  advance: () => void;
  /** Navigate to a specific step. Blocked for unvisited steps in s-w-j mode. (D-01) */
  goTo: (stepId: string) => void;
  /** Mark a step complete. Runs validation first if validate() present. */
  markComplete: (stepId: string, force?: boolean) => Promise<void>;
  /** Mark a step blocked with an optional reason. */
  markBlocked: (stepId: string, reason?: string) => void;
  /**
   * Reopen a completed step. Only available when config.allowReopen = true.
   * Resets status to 'in-progress' and resets onAllCompleteFired. (D-05, D-07)
   */
  reopenStep: (stepId: string) => void;
  /** Current validation error for a given stepId. Null when valid or unvalidated. */
  getValidationError: (stepId: string) => string | null;
}

export interface IUseStepProgressReturn {
  completedCount: number;
  requiredCount: number;
  percentComplete: number;
  isComplete: boolean;
  /** True when the draft was saved more than staleThresholdMs ago. */
  isStale: boolean;
}
```

---

## `src/state/draftPayload.ts`

```typescript
import type { StepStatus } from '../types/IStepWizard';

// ─── Draft Schema (D-02, D-05, D-07) ─────────────────────────────────────────

export interface IStepWizardDraft {
  /** Keyed by stepId. Monotonically protected on merge. (D-02) */
  stepStatuses: Record<string, StepStatus>;
  /** ISO timestamps of step completion. Null entries for incomplete steps. */
  completedAts: Record<string, string | null>;
  /** Steps visited at least once (sequential-with-jumps only). (D-01, D-05) */
  visitedStepIds: string[];
  /** Idempotency guard for onAllComplete callback. (D-07) */
  onAllCompleteFired: boolean;
  /** ISO timestamp of last draft save. */
  savedAt: string;
}

// ─── Status Rank for Monotonic Merge (D-02) ──────────────────────────────────

/**
 * Numeric rank for monotonic comparison.
 * Higher rank always wins on conflict.
 * Terminal states (blocked, skipped) are handled separately — they always win.
 */
export const STATUS_RANK: Record<StepStatus, number> = {
  'not-started': 0,
  'in-progress': 1,
  'complete': 2,
  'blocked': 99,  // terminal — handled by isTerminalStatus check
  'skipped': 99,  // terminal — handled by isTerminalStatus check
};

export const TERMINAL_STATUSES: ReadonlySet<StepStatus> = new Set(['blocked', 'skipped']);

export function isTerminalStatus(status: StepStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

/**
 * Monotonic merge of two step statuses. (D-02)
 *
 * Rules (in priority order):
 * 1. If either is terminal (blocked/skipped) → terminal wins; stored beats inMemory on tie
 * 2. Otherwise → higher STATUS_RANK wins
 * 3. On equal rank → stored wins (prefer persisted state)
 */
export function mergeStepStatus(
  stored: StepStatus,
  inMemory: StepStatus
): StepStatus {
  const storedTerminal = isTerminalStatus(stored);
  const inMemoryTerminal = isTerminalStatus(inMemory);

  if (storedTerminal && inMemoryTerminal) return stored; // both terminal — stored wins
  if (storedTerminal) return stored;
  if (inMemoryTerminal) return inMemory;

  // Neither terminal — higher rank wins
  return STATUS_RANK[stored] >= STATUS_RANK[inMemory] ? stored : inMemory;
}

/**
 * Merges a persisted draft into the current in-memory state.
 * For each stepId in the draft:
 *   - Apply mergeStepStatus (monotonic, D-02)
 *   - Merge visitedStepIds (union — never remove visited entries)
 *   - Preserve onAllCompleteFired (D-07): true wins over false
 */
export function mergeDraft(
  inMemoryStatuses: Record<string, StepStatus>,
  storedDraft: IStepWizardDraft
): {
  mergedStatuses: Record<string, StepStatus>;
  mergedCompletedAts: Record<string, string | null>;
  mergedVisitedIds: string[];
  onAllCompleteFired: boolean;
} {
  const mergedStatuses: Record<string, StepStatus> = { ...inMemoryStatuses };
  const mergedCompletedAts: Record<string, string | null> = {
    ...storedDraft.completedAts,
  };

  for (const [stepId, storedStatus] of Object.entries(storedDraft.stepStatuses)) {
    const current = mergedStatuses[stepId] ?? 'not-started';
    mergedStatuses[stepId] = mergeStepStatus(storedStatus, current);
  }

  // visitedStepIds: union — never remove
  const mergedVisitedSet = new Set([
    ...storedDraft.visitedStepIds,
    // inMemory visited state passed separately if needed
  ]);

  return {
    mergedStatuses,
    mergedCompletedAts,
    mergedVisitedIds: [...mergedVisitedSet],
    // D-07: true wins — if fired in stored draft, honour it
    onAllCompleteFired: storedDraft.onAllCompleteFired,
  };
}

// ─── Draft Key Resolution ─────────────────────────────────────────────────────

export function resolveDraftKey<T>(
  config: { draftKey?: string | ((item: T) => string) },
  item: T
): string | null {
  if (!config.draftKey) return null;
  if (typeof config.draftKey === 'function') return config.draftKey(item);
  return config.draftKey;
}

// ─── Completion Predicate ─────────────────────────────────────────────────────

export function computeIsComplete(
  steps: Array<{ stepId: string; required: boolean }>,
  statuses: Record<string, StepStatus>
): boolean {
  return steps
    .filter((s) => s.required)
    .every((s) => statuses[s.stepId] === 'complete' || statuses[s.stepId] === 'skipped');
}

export function computePercentComplete(
  steps: Array<{ stepId: string; required: boolean }>,
  statuses: Record<string, StepStatus>
): number {
  const required = steps.filter((s) => s.required);
  if (required.length === 0) return 100;
  const completed = required.filter(
    (s) => statuses[s.stepId] === 'complete' || statuses[s.stepId] === 'skipped'
  ).length;
  return Math.round((completed / required.length) * 100);
}

// ─── sequential-with-jumps Unlock Logic (D-01) ───────────────────────────────

/**
 * Resolves which steps are unlocked in sequential-with-jumps mode.
 * A step is unlocked if:
 *   (a) it has been visited (in visitedStepIds), OR
 *   (b) it is the immediately next step after the last visited step in order.
 *
 * In sequential and parallel modes, all steps are always unlocked.
 */
export function resolveUnlockedSteps(
  steps: Array<{ stepId: string; order?: number }>,
  visitedStepIds: string[],
  orderMode: string
): Set<string> {
  if (orderMode !== 'sequential-with-jumps') {
    return new Set(steps.map((s) => s.stepId));
  }

  const visitedSet = new Set(visitedStepIds);
  const ordered = [...steps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const unlocked = new Set<string>();

  for (let i = 0; i < ordered.length; i++) {
    const step = ordered[i];
    if (visitedSet.has(step.stepId)) {
      unlocked.add(step.stepId);
      // The next unvisited step is also unlocked (forward unlock)
      if (i + 1 < ordered.length && !visitedSet.has(ordered[i + 1].stepId)) {
        unlocked.add(ordered[i + 1].stepId);
      }
    }
  }

  // Always unlock the first step
  if (ordered.length > 0) unlocked.add(ordered[0].stepId);

  return unlocked;
}
```

---

## Verification Commands

```bash
pnpm --filter @hbc/step-wizard typecheck
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF05-T02 completed: 2026-03-09
- Added @hbc/bic-next-move workspace dependency (package.json, tsconfig.json paths, vitest.config.ts alias)
- Wrote src/types/IStepWizard.ts — all interfaces verbatim from spec (StepStatus, StepOrderMode, IStep<T>, IStepWizardConfig<T>, IStepRuntimeEntry, IStepWizardState, IUseStepWizardReturn, IUseStepProgressReturn)
- Wrote src/state/draftPayload.ts — draft schema + monotonic merge utilities verbatim from spec (IStepWizardDraft, STATUS_RANK, TERMINAL_STATUSES, isTerminalStatus, mergeStepStatus, mergeDraft, resolveDraftKey, computeIsComplete, computePercentComplete, resolveUnlockedSteps)
- Barrels already correct (no changes needed)
- Verification: typecheck ✅ zero errors, build ✅ dist/ output
Next: SF05-T03 (State Machine)
-->
