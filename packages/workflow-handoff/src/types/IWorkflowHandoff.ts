// ─────────────────────────────────────────────────────────────────────────────
// Re-export IBicOwner from @hbc/bic-next-move for sender/recipient identity.
// ─────────────────────────────────────────────────────────────────────────────
export type { IBicOwner } from '@hbc/bic-next-move';
import type { IBicOwner } from '@hbc/bic-next-move';

// ─────────────────────────────────────────────────────────────────────────────
// State machine (D-02)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Linear 5-state handoff lifecycle (D-02).
 *
 * draft        — Package assembled by sender; not yet transmitted
 * sent         — Transmitted; Immediate notification fired to recipient; BIC → recipient (D-05)
 * received     — Recipient has opened the package (first view); no BIC change
 * acknowledged — Recipient confirmed; destination record created via config.onAcknowledged
 * rejected     — Recipient rejected; BIC returned to sender via config.onRejected; terminal state
 *
 * Note: acknowledged and rejected are terminal — a rejected package cannot be re-acknowledged.
 * Sender must create a new handoff package after addressing rejection (D-07).
 */
export type HandoffStatus =
  | 'draft'
  | 'sent'
  | 'received'
  | 'acknowledged'
  | 'rejected';

// ─────────────────────────────────────────────────────────────────────────────
// Document reference in a handoff package (D-06: links only, not copies)
// ─────────────────────────────────────────────────────────────────────────────

export interface IHandoffDocument {
  documentId: string;
  fileName: string;
  /**
   * SharePoint URL at time of package assembly.
   * HandoffApi checks @hbc/sharepoint-docs URL migration map on retrieval (D-06).
   */
  sharepointUrl: string;
  /**
   * Document category for display grouping in HbcHandoffReceiver.
   * Examples: 'RFP', 'Bid Documents', 'Scope', 'Owner Correspondence'
   */
  category: string;
  /** File size in bytes — for display only; not enforced */
  fileSizeBytes?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Structured context note attached to a handoff package
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Note categories define the visual treatment in HbcHandoffReceiver.
 * 'Key Decision' → blue; 'Open Item' → amber; 'Risk' → red; 'General' → grey
 */
export type HandoffNoteCategory = 'Key Decision' | 'Open Item' | 'Risk' | 'General';

export interface IHandoffContextNote {
  noteId: string;
  category: HandoffNoteCategory;
  body: string;
  /** Author of this note — typically the sender or a contributor */
  author: IBicOwner;
  /** ISO 8601 */
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core handoff package — generic over source and destination record types (D-09)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `IHandoffPackage<TSource, TDest>` is the structured handoff envelope.
 *
 * TSource — The source record type (e.g., IGoNoGoScorecard)
 * TDest   — The destination record type (e.g., IEstimatingPursuit)
 *
 * The package captures:
 * - A snapshot of the source record at send time (D-04: frozen at assembly)
 * - Mapped fields pre-populating the destination record (D-04)
 * - Document links from the source context (D-06)
 * - Structured context notes (key decisions, open items, risks)
 * - Sender and recipient identity (D-05)
 * - Full lifecycle status (D-02)
 */
export interface IHandoffPackage<TSource, TDest> {
  handoffId: string;

  /** Source module identifier (e.g., 'business-development') */
  sourceModule: string;
  /** Source record type (e.g., 'bd-scorecard') */
  sourceRecordType: string;
  /** Source record unique identifier */
  sourceRecordId: string;

  /** Destination module identifier (e.g., 'estimating') */
  destinationModule: string;
  /** Destination record type (e.g., 'estimating-pursuit') */
  destinationRecordType: string;

  /**
   * Full snapshot of the source record at the moment the handoff was assembled (D-04).
   * Frozen at send — changes to the source record after sending are not reflected here.
   * Serialized to JSON for storage (D-01); deserialized on retrieval.
   */
  sourceSnapshot: TSource;

  /**
   * Pre-populated fields for the destination record (D-04).
   * Produced by `config.mapSourceToDestination(sourceRecord)` at assembly time.
   * Frozen at send — the recipient's `onAcknowledged` callback uses these to create
   * the destination record without re-running the mapper.
   */
  destinationSeedData: Partial<TDest>;

  /** Documents resolved by `config.resolveDocuments` at assembly time (D-06) */
  documents: IHandoffDocument[];

  /** Structured context notes added by the sender */
  contextNotes: IHandoffContextNote[];

  /** The user transmitting this handoff package */
  sender: IBicOwner;

  /**
   * The user who must acknowledge or reject this package (D-05).
   * Resolved by `config.resolveRecipient` at assembly time.
   * Sender may override in Composer Step 3 when `resolveRecipient` returns null.
   */
  recipient: IBicOwner;

  /** Current lifecycle state (D-02) */
  status: HandoffStatus;

  /** ISO 8601 — set when HandoffApi.send() is called */
  sentAt: string | null;

  /** ISO 8601 — set when HandoffApi.acknowledge() is called */
  acknowledgedAt: string | null;

  /** ISO 8601 — set when HandoffApi.reject() is called */
  rejectedAt: string | null;

  /** Required rejection reason — set by recipient (D-07) */
  rejectionReason: string | null;

  /**
   * ID of the destination record created by `config.onAcknowledged`.
   * Null until acknowledgment completes. Enables the sender to navigate
   * directly to the newly created destination record.
   */
  createdDestinationRecordId: string | null;

  /** ISO 8601 — package assembly timestamp */
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration contract — one instance per handoff route (D-03, D-04, D-06)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `IHandoffConfig<TSource, TDest>` defines the behavior of a specific handoff route.
 *
 * One config per route (e.g., one for BD→Estimating, one for Estimating→ProjectHub).
 * Consuming modules create their config in their own package and pass it to the
 * `HbcHandoffComposer` and `HbcHandoffReceiver` components.
 *
 * The consuming module is responsible for registering the `destinationRecordType`
 * in the handoff module registry if the route requires My Work Feed integration.
 */
export interface IHandoffConfig<TSource, TDest> {
  /** Source module identifier (e.g., 'business-development') */
  sourceModule: string;
  /** Source record type (e.g., 'bd-scorecard') */
  sourceRecordType: string;
  /** Destination module identifier (e.g., 'estimating') */
  destinationModule: string;
  /** Destination record type (e.g., 'estimating-pursuit') */
  destinationRecordType: string;

  /**
   * Maps source record fields to destination record pre-population (D-04).
   * Called at package assembly time. Must be a pure synchronous function.
   * The result is frozen into destinationSeedData at send time.
   */
  mapSourceToDestination: (source: TSource) => Partial<TDest>;

  /**
   * Resolves which documents to include in the handoff package (D-06).
   * Called asynchronously at package assembly time (Composer Step 2).
   * Returns resolved IHandoffDocument[] with current SharePoint URLs.
   */
  resolveDocuments: (source: TSource) => Promise<IHandoffDocument[]>;

  /**
   * Resolves the intended recipient from the source record (D-05).
   * Return null if the recipient cannot be automatically determined —
   * Composer Step 3 will require the sender to select a recipient manually.
   */
  resolveRecipient: (source: TSource) => IBicOwner | null;

  /**
   * Pre-flight validation (D-03).
   * Returns null if the source record is ready for handoff.
   * Returns a human-readable error string if there is a blocking condition.
   * Must be synchronous — called in Composer Step 1.
   *
   * @example
   * validateReadiness: (scorecard) => {
   *   if (scorecard.workflowStage !== 'director-approved') return 'Scorecard must be director-approved first.';
   *   return null;
   * }
   */
  validateReadiness: (source: TSource) => string | null;

  /**
   * Called when the recipient acknowledges the handoff (D-05).
   * Responsible for:
   * 1. Creating the destination record (using pkg.destinationSeedData)
   * 2. Creating a versioned-record snapshot of the source at this moment
   * 3. Updating the createdDestinationRecordId (via HandoffApi internal update)
   *
   * Any error thrown here returns the package to 'sent' status and surfaces
   * the error message to the recipient.
   */
  onAcknowledged: (pkg: IHandoffPackage<TSource, TDest>) => Promise<{ destinationRecordId: string }>;

  /**
   * Called when the recipient rejects the handoff (D-07).
   * Responsible for:
   * 1. Returning the source record to its pre-handoff workflow stage
   * 2. Clearing the outbound handoff reference on the source record
   * 3. Triggering BIC return to sender (via the consuming module's BIC config)
   */
  onRejected: (pkg: IHandoffPackage<TSource, TDest>) => Promise<void>;

  /**
   * Human-readable label for this handoff route.
   * Used in HbcHandoffReceiver header and My Work Feed items.
   * Example: 'BD Win → Estimating Pursuit'
   */
  routeLabel: string;

  /**
   * Short description of what happens when the recipient acknowledges.
   * Used in HbcHandoffReceiver "What happens next" section.
   * Example: 'An Estimating Pursuit will be created and pre-populated with the data below.'
   */
  acknowledgeDescription: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-flight validation result (D-03)
// ─────────────────────────────────────────────────────────────────────────────

export interface IPreflightResult {
  /** True when all blocking conditions pass */
  isReady: boolean;
  /** Human-readable message from validateReadiness(); null when isReady=true */
  blockingReason: string | null;
  /**
   * Individual readiness checks surfaced in Composer Step 1.
   * Each entry has a label and pass/fail state.
   */
  checks: IPreflightCheck[];
}

export interface IPreflightCheck {
  label: string;
  passed: boolean;
  /** Optional detail shown on hover/expand */
  detail?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook return types
// ─────────────────────────────────────────────────────────────────────────────

export interface IUsePrepareHandoffResult<TSource, TDest> {
  /** The assembled package — null until assembly is complete */
  package: Omit<IHandoffPackage<TSource, TDest>, 'handoffId' | 'status' | 'sentAt' | 'acknowledgedAt' | 'rejectedAt' | 'rejectionReason' | 'createdDestinationRecordId' | 'createdAt'> | null;
  /** Pre-flight validation result (D-03) */
  preflight: IPreflightResult | null;
  isAssembling: boolean;
  isError: boolean;
  /** Trigger re-assembly (e.g. after documents are edited) */
  reassemble: () => void;
}

export interface IUseHandoffInboxResult<TSource = unknown, TDest = unknown> {
  /** Pending handoff packages where currentUser is the recipient */
  pending: IHandoffPackage<TSource, TDest>[];
  /** Total pending count for badge display */
  pendingCount: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export interface IUseHandoffStatusResult<TSource = unknown, TDest = unknown> {
  package: IHandoffPackage<TSource, TDest> | null;
  status: HandoffStatus | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw SharePoint list item shape (D-01)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Raw list item from HBC_HandoffPackages SharePoint list.
 * Consumers never interact with this type directly — mapped by HandoffApi.
 */
export interface IRawHandoffListItem {
  Id: number;
  HandoffId: string;
  SourceModule: string;
  SourceRecordType: string;
  SourceRecordId: string;
  DestinationModule: string;
  DestinationRecordType: string;
  /** JSON-serialized TSource snapshot (D-01: inline if <255KB; see HandoffApi for overflow) */
  SourceSnapshotJson: string;
  /** Overflow file URL when SourceSnapshotJson exceeds 255KB (D-01) */
  SourceSnapshotFileUrl: string | null;
  /** JSON-serialized Partial<TDest> */
  DestinationSeedDataJson: string;
  /** JSON-serialized IHandoffDocument[] */
  DocumentsJson: string;
  /** JSON-serialized IHandoffContextNote[] */
  ContextNotesJson: string;
  SenderUserId: string;
  SenderDisplayName: string;
  SenderRole: string;
  RecipientUserId: string;
  RecipientDisplayName: string;
  RecipientRole: string;
  Status: HandoffStatus;
  SentAt: string | null;
  AcknowledgedAt: string | null;
  RejectedAt: string | null;
  RejectionReason: string | null;
  CreatedDestinationRecordId: string | null;
  CreatedAt: string;
}
