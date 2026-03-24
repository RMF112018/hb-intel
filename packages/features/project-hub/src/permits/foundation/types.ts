/**
 * P3-E7-T01 Permits Module foundation TypeScript contracts.
 * Product shape, thread model, authority, compliance health doctrine.
 */

import type {
  ComplianceHealthSignalType,
  DerivedHealthTier,
  PermitAuthorityAction,
  PermitAuthorityRole,
  PermitRecordType,
  PermitThreadRelationship,
} from './enums.js';

// ── Permit Thread Model (§4) ────────────────────────────────────────

/** Thread node representing a permit's position within a regulatory package. */
export interface IPermitThreadNode {
  /** Null if this IS the thread root. */
  readonly threadRootPermitId: string | null;
  /** Immediate parent; null if root. */
  readonly parentPermitId: string | null;
  readonly threadRelationshipType: PermitThreadRelationship;
}

// ── Authority Model (§7) ────────────────────────────────────────────

/** Role-based access rule for a specific record type. */
export interface IPermitAuthorityRule {
  readonly role: PermitAuthorityRole;
  readonly recordType: PermitRecordType;
  readonly allowedActions: readonly PermitAuthorityAction[];
}

/** Immutable field declaration for a record type. */
export interface IPermitImmutableFieldDeclaration {
  readonly recordType: PermitRecordType;
  readonly fieldNames: readonly string[];
}

// ── Compliance Health Doctrine (§8) ─────────────────────────────────

/** A compliance health signal contributing to derived health tier. */
export interface IComplianceHealthSignal {
  readonly signalType: ComplianceHealthSignalType;
  readonly description: string;
  readonly contributesToTier: DerivedHealthTier;
}

/** Result of compliance health derivation. */
export interface IComplianceHealthResult {
  readonly tier: DerivedHealthTier;
  readonly activeSignals: readonly ComplianceHealthSignalType[];
}

// ── Shared Package Requirements (§6) ────────────────────────────────

/** Required shared package for Permits module operation. */
export interface IPermitSharedPackageRequirement {
  readonly packageName: string;
  readonly role: string;
}

// ── Cross-Contract Positioning (§5) ─────────────────────────────────

/** Cross-contract reference from Permits to other Phase 3 deliverables. */
export interface IPermitCrossContractRef {
  readonly contract: string;
  readonly section: string;
  readonly relationship: string;
}

// ── Locked Decisions ────────────────────────────────────────────────

/** A locked architectural decision that must not be revisited without explicit approval. */
export interface ILockedDecision {
  readonly decisionId: number;
  readonly description: string;
}
