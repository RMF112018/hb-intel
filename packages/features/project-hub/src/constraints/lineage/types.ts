/**
 * P3-E6-T05 Cross-Ledger Lineage TypeScript contracts.
 * Lineage records, cross-ledger links, spawn seed data, and related-items registrations.
 */

import type { ConstraintsRelationshipType, LedgerType, RelatedItemObjectType, SpawnAction } from './enums.js';

// ── Lineage Record (§5.4) — Immutable ──────────────────────────────

/** Immutable record created for every spawn action. Never modified after creation. */
export interface ILineageRecord {
  /** UUID; primary key; immutable. */
  readonly lineageId: string;
  /** FK to project; immutable. */
  readonly projectId: string;
  /** Spawn action type; immutable. */
  readonly spawnAction: SpawnAction;
  /** Parent record's ledger type; immutable. */
  readonly parentLedger: LedgerType;
  /** FK to parent record's primary key; immutable. */
  readonly parentRecordId: string;
  /** Human-readable number of parent (e.g., RISK-003, CON-007); immutable. */
  readonly parentRecordNumber: string;
  /** Child record's ledger type; immutable. */
  readonly childLedger: LedgerType;
  /** FK to spawned record's primary key; immutable. */
  readonly childRecordId: string;
  /** Human-readable number of spawned record; immutable. */
  readonly childRecordNumber: string;
  /** Timestamp of spawn action; immutable. */
  readonly spawnedAt: string;
  /** User ID who triggered spawn; immutable. */
  readonly spawnedBy: string;
  /** List of field names seeded from parent; immutable snapshot. */
  readonly inheritedFields: readonly string[];
  /** Snapshot of inherited field values at spawn time; immutable. */
  readonly inheritedValues: Readonly<Record<string, unknown>>;
}

// ── Cross-Ledger Link (§5.3) ────────────────────────────────────────

/** Bidirectional peer link between Delay and Change Event records. */
export interface ICrossLedgerLink {
  readonly linkId: string;
  readonly projectId: string;
  readonly sourceRecordId: string;
  readonly sourceLedger: LedgerType;
  readonly targetRecordId: string;
  readonly targetLedger: LedgerType;
  readonly linkedAt: string;
  readonly linkedBy: string;
}

// ── Spawn Seed Data ─────────────────────────────────────────────────

/** Configuration for a spawn path defining which fields are inherited. */
export interface ISpawnPathConfig {
  readonly spawnAction: SpawnAction;
  readonly parentLedger: LedgerType;
  readonly childLedger: LedgerType;
  readonly inheritedFields: readonly string[];
}

/** Result of extracting spawn seed data from a parent record. */
export interface ISpawnSeedResult {
  readonly inheritedFields: readonly string[];
  readonly inheritedValues: Readonly<Record<string, unknown>>;
}

/** Result of a spawn eligibility check. */
export interface ISpawnEligibilityResult {
  readonly eligible: boolean;
  readonly reasons: readonly string[];
}

// ── Related Items Registration (§5.7) ───────────────────────────────

/** Object type registration for @hbc/related-items. */
export interface IRelatedItemRegistration {
  readonly objectType: RelatedItemObjectType;
  readonly ledgerType: LedgerType;
  readonly displayName: string;
}

/** Mapping of which relationship types apply to which object types. */
export interface IRelationshipTypeMapping {
  readonly relationshipType: ConstraintsRelationshipType;
  readonly applicableTo: readonly RelatedItemObjectType[];
}
