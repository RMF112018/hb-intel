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
