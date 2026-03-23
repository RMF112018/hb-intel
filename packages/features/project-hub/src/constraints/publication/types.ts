/**
 * P3-E6-T06 Publication, Review, and Governance TypeScript contracts.
 */

import type {
  GovernedTaxonomyArea,
  ConstraintsPublicationAction,
  ConstraintsPublicationRole,
  ReviewPackageStatus,
  StateConsumptionMode,
} from './enums.js';
import type { LedgerType } from '../lineage/enums.js';

// ── Ledger Record Snapshot (§6.2) ───────────────────────────────────

/** Immutable snapshot of a single ledger record at point of publication. */
export interface ILedgerRecordSnapshot {
  readonly snapshotId: string;
  readonly projectId: string;
  readonly ledgerType: LedgerType;
  readonly recordId: string;
  readonly recordNumber: string;
  readonly snapshotData: Readonly<Record<string, unknown>>;
  readonly publishedAt: string;
  readonly publishedBy: string;
  /** Set when a newer snapshot supersedes this one. */
  readonly supersededAt: string | null;
  readonly supersededBy: string | null;
}

// ── Review Package (§6.3) ───────────────────────────────────────────

/** Multi-ledger review package for cadence-based executive review. */
export interface IReviewPackage {
  readonly reviewPackageId: string;
  readonly projectId: string;
  /** System-generated; format RP-[###]. */
  readonly packageNumber: string;
  /** Human-readable label (e.g., "March 2026 Monthly Review"). */
  readonly reviewPeriod: string;
  /** Which ledgers are in scope. */
  readonly ledgersIncluded: readonly LedgerType[];
  /** Serialized snapshot of records from included ledgers. */
  readonly snapshotData: Readonly<Record<string, unknown>>;
  readonly publishedAt: string;
  readonly publishedBy: string;
  readonly status: ReviewPackageStatus;
}

// ── Publication Authority (§6.4) ────────────────────────────────────

/** Authority rule mapping actions to allowed roles. */
export interface IPublicationAuthorityRule {
  readonly action: ConstraintsPublicationAction;
  readonly allowedRoles: readonly ConstraintsPublicationRole[];
}

// ── State Consumption (§6.1) ────────────────────────────────────────

/** Maps a consumer surface to its state consumption mode. */
export interface IStateConsumptionRule {
  readonly consumer: string;
  readonly stateMode: StateConsumptionMode;
  readonly rationale: string;
}

// ── BIC Team Registry (§6.7) ────────────────────────────────────────

/** Entry in the governed BIC team registry (shared across all four ledgers). */
export interface IBicTeamEntry {
  readonly teamCode: string;
  readonly displayName: string;
  readonly responsibilityArea: string;
}

// ── Governance Configuration Framework (§6.6) ──────────────────────

/** Description of a governed taxonomy area. */
export interface IGovernedTaxonomyDescriptor {
  readonly area: GovernedTaxonomyArea;
  readonly description: string;
  /** Which T-file section defines the initial values. */
  readonly sourceReference: string;
}

/** Description of a locked structural element (not configurable). */
export interface ILockedStructuralElement {
  readonly element: string;
  readonly description: string;
}
