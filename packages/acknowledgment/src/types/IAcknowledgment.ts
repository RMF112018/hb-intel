import type { AckContextType } from '../config/contextTypes';

// ─── Primitive Types ────────────────────────────────────────────────────────

export type AcknowledgmentMode = 'single' | 'parallel' | 'sequential';

export type AcknowledgmentStatus =
  | 'pending'
  | 'acknowledged'
  | 'declined'
  | 'bypassed';

// ─── Party ──────────────────────────────────────────────────────────────────

export interface IAcknowledgmentParty {
  userId: string;
  displayName: string;
  role: string;
  /** Order matters only for sequential mode. 1-indexed. */
  order?: number;
  /** Whether this party's acknowledgment is required for isComplete to be true. */
  required: boolean;
}

// ─── Config ─────────────────────────────────────────────────────────────────

export interface IAcknowledgmentConfig<T> {
  /** Contextual label shown in the UI (e.g., "Turnover Meeting Sign-Off"). */
  label: string;

  /** Mode determines rendering and completion logic. */
  mode: AcknowledgmentMode;

  /**
   * Typed context identifier. Use ACK_CONTEXT_TYPES values to ensure
   * consistent audit trail keys. (D-08)
   */
  contextType: AckContextType;

  /** Resolves the list of parties who must acknowledge. */
  resolveParties: (item: T) => IAcknowledgmentParty[];

  /** Message shown to each acknowledging party at the moment of sign-off.
   *  Preserved verbatim in the audit trail. */
  resolvePromptMessage: (item: T, party: IAcknowledgmentParty) => string;

  /**
   * Whether the user must type a confirmation phrase before submitting.
   * Defaults to false. (D-03)
   */
  requireConfirmationPhrase?: boolean;

  /**
   * The phrase the user must type. Defaults to "I CONFIRM". (D-03)
   * Add a JSDoc note on the config to encourage consistent phrasing.
   */
  confirmationPhrase?: string;

  /**
   * Whether declining is allowed. Shows a decline path with a required reason.
   * Defaults to false.
   */
  allowDecline?: boolean;

  /**
   * Optional list of predefined decline reason categories. (D-04)
   * If absent: free-text textarea (min 10 chars).
   * If provided: radio button list + optional elaboration field.
   */
  declineReasons?: string[];

  /**
   * Called when all required parties have acknowledged.
   * Fires client-side for UI effects only (D-06).
   * Server-side completion triggers (BIC, notifications) are handled
   * by the Azure Function.
   */
  onAllAcknowledged?: (item: T, trail: IAcknowledgmentEvent[]) => void;
}

// ─── Event ──────────────────────────────────────────────────────────────────

export interface IAcknowledgmentEvent {
  partyUserId: string;
  partyDisplayName: string;
  status: AcknowledgmentStatus;
  /** ISO 8601. Client timestamp for offline-queued events (D-02). */
  acknowledgedAt: string | null;
  declineReason?: string;
  /** Selected category from declineReasons[] if configured (D-04). */
  declineCategory?: string;
  /** IP address for audit-grade trails. Present when server captures it. */
  ipAddress?: string;
  /** True when bypassSequentialOrder was used (D-01). */
  isBypass?: boolean;
  /** UPN of the AcknowledgmentAdmin who authorised the bypass (D-01). */
  bypassedBy?: string;
  /** True when this event is pending offline sync (D-02). */
  isPendingSync?: boolean;
}

// ─── State ──────────────────────────────────────────────────────────────────

export interface IAcknowledgmentState {
  config: IAcknowledgmentConfig<unknown>;
  events: IAcknowledgmentEvent[];
  /** True when all required parties have acknowledged. */
  isComplete: boolean;
  /** In sequential mode: the party whose turn it currently is. Null when complete. */
  currentSequentialParty: IAcknowledgmentParty | null;
  /** Aggregate status for display. */
  overallStatus: AcknowledgmentStatus | 'partial';
}

// ─── API Request / Response ──────────────────────────────────────────────────

export interface ISubmitAcknowledgmentRequest {
  contextType: AckContextType;
  contextId: string;
  partyUserId: string;
  status: Extract<AcknowledgmentStatus, 'acknowledged' | 'declined'>;
  declineReason?: string;
  declineCategory?: string;
  /** Client-side ISO timestamp (D-02). */
  acknowledgedAt: string;
  /**
   * Requires AcknowledgmentAdmin role on the Azure Function (D-01).
   * Bypasses sequential order enforcement for the submitting party.
   */
  bypassSequentialOrder?: boolean;
}

export interface ISubmitAcknowledgmentResponse {
  event: IAcknowledgmentEvent;
  updatedState: IAcknowledgmentState;
  /** True when this submission completed all required parties. */
  isComplete: boolean;
}

// ─── Hook Return Types ───────────────────────────────────────────────────────

export interface IUseAcknowledgmentReturn {
  state: IAcknowledgmentState | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Submit an acknowledgment or decline for the current user. */
  submit: (params: ISubmitAcknowledgmentParams) => Promise<void>;
  isSubmitting: boolean;
}

export interface ISubmitAcknowledgmentParams {
  status: Extract<AcknowledgmentStatus, 'acknowledged' | 'declined'>;
  declineReason?: string;
  declineCategory?: string;
  bypassSequentialOrder?: boolean;
}

export interface IUseAcknowledgmentGateReturn {
  /** True when the current user is an eligible, pending acknowledging party. */
  canAcknowledge: boolean;
  /**
   * In sequential mode: true only when it is this user's turn.
   * In parallel mode: true when this user is a required party and has not yet acknowledged.
   * In single mode: true when this user is the single required party.
   */
  isCurrentTurn: boolean;
  /** The current user's party record, if they are a listed party. */
  party: IAcknowledgmentParty | null;
}

// ─── Re-export contextType for convenience ───────────────────────────────────

export type { AckContextType } from '../config/contextTypes';
