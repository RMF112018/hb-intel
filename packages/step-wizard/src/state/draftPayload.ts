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
