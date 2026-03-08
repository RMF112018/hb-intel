// ─────────────────────────────────────────────────────────────────────────────
// Core ownership model types
// ─────────────────────────────────────────────────────────────────────────────

export type BicOwnershipModel = 'direct-assignee' | 'workflow-state-derived';

export type BicUrgencyTier = 'immediate' | 'watch' | 'upcoming';

export type BicComplexityVariant = 'essential' | 'standard' | 'expert';

// ─────────────────────────────────────────────────────────────────────────────
// Owner identity
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicOwner {
  /** Azure AD user object ID */
  userId: string;
  displayName: string;
  /** Role title within the context of this item (e.g. "BD Manager", "Estimating Coordinator") */
  role: string;
  /** Optional group context shown in Expert mode (e.g. "Estimating Department") */
  groupContext?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transfer history (D-08)
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicTransfer {
  fromOwner: IBicOwner | null;
  toOwner: IBicOwner;
  /** ISO 8601 timestamp of the transfer */
  transferredAt: string;
  /** Plain-language action that triggered the transfer (e.g. "Submitted for Director Review") */
  action: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-config urgency threshold overrides (D-01)
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicUrgencyThresholds {
  /**
   * Number of business days before due date at which urgency transitions from
   * 'upcoming' to 'watch'. Defaults to BIC_DEFAULT_WATCH_THRESHOLD_DAYS (3).
   */
  watchThresholdDays?: number;
  /**
   * Number of business days before due date at which urgency transitions to
   * 'immediate'. When omitted, 'immediate' is triggered only by overdue/due-today.
   * Use this for items where "2 days away" is already critical (e.g. bid deadlines).
   */
  immediateThresholdDays?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration contract — one instance per item type (generic on T)
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicNextMoveConfig<T> {
  /** Which ownership model this item type uses */
  ownershipModel: BicOwnershipModel;

  /**
   * For workflow-state-derived: computes current owner from item state.
   * For direct-assignee: returns the assignee field.
   * Return null for unowned items — renders ⚠️ Unassigned (D-04).
   */
  resolveCurrentOwner: (item: T) => IBicOwner | null;

  /** Plain-language description of what the current owner needs to do */
  resolveExpectedAction: (item: T) => string;

  /** ISO 8601 due date for the current owner's action. Null = no due date. */
  resolveDueDate: (item: T) => string | null;

  /** Returns true if the item cannot advance due to a blocking condition */
  resolveIsBlocked: (item: T) => boolean;

  /** Plain-language reason the item is blocked. Null when not blocked. */
  resolveBlockedReason: (item: T) => string | null;

  /** Previous owner before the current BIC transfer. Null for new items. */
  resolvePreviousOwner: (item: T) => IBicOwner | null;

  /** Next owner after current owner completes their action. Null when unknown. */
  resolveNextOwner: (item: T) => IBicOwner | null;

  /** Escalation rule: who is notified if action is not taken by due date */
  resolveEscalationOwner: (item: T) => IBicOwner | null;

  /**
   * Optional: returns full ownership transfer history for Expert mode display (D-08).
   * When absent, HbcBicDetail omits the "Full Ownership History" section entirely.
   * Implement only if your module's data layer stores transfer events.
   */
  resolveTransferHistory?: (item: T) => IBicTransfer[];

  /**
   * Optional urgency threshold overrides for this item type (D-01).
   * When absent, platform defaults apply (watch < 3 business days, immediate = overdue/today).
   */
  urgencyThresholds?: IBicUrgencyThresholds;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolved state — output of useBicNextMove hook
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicNextMoveState {
  currentOwner: IBicOwner | null;
  expectedAction: string;
  dueDate: string | null;
  /** True when dueDate is in the past relative to current date */
  isOverdue: boolean;
  isBlocked: boolean;
  blockedReason: string | null;
  previousOwner: IBicOwner | null;
  nextOwner: IBicOwner | null;
  escalationOwner: IBicOwner | null;
  /**
   * Transfer history resolved from config.resolveTransferHistory (D-08).
   * Empty array when resolver is absent or returns no transfers.
   */
  transferHistory: IBicTransfer[];
  /**
   * Computed urgency tier based on dueDate, thresholds, and blocked/unassigned state (D-01, D-04).
   * Forced to 'immediate' when currentOwner is null (D-04).
   */
  urgencyTier: BicUrgencyTier;
}

// ─────────────────────────────────────────────────────────────────────────────
// Module registry types (D-02)
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicRegisteredItem {
  /** Globally unique item identifier, e.g. "bd-scorecard::a1b2c3" */
  itemKey: string;
  /** The module registry key this item belongs to, e.g. "bd-scorecard" */
  moduleKey: string;
  /** Human-readable label for the module (used in dev-mode warnings) */
  moduleLabel: string;
  /** The resolved BIC state for this item */
  state: IBicNextMoveState;
  /**
   * Navigation href for the item's detail page.
   * Used by My Work Feed and Project Canvas to deep-link.
   */
  href: string;
  /** Display title of the item, e.g. "Highline Towers – Go/No-Go Scorecard" */
  title: string;
}

export interface IBicModuleRegistration {
  /** Must match a key in BIC_MODULE_MANIFEST */
  key: string;
  /** Human-readable label for the module, used in dev-mode warnings */
  label: string;
  /**
   * Async function that fetches all items for the given userId where that user
   * is the current BIC owner. Must return IBicRegisteredItem[].
   */
  queryFn: (userId: string) => Promise<IBicRegisteredItem[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// useBicMyItems return type (D-06, D-07)
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicMyItemsResult {
  /** All items across all registered modules where user is current owner */
  items: IBicRegisteredItem[];
  /** Modules that failed to load — partial results, not a full failure */
  failedModules: string[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}
