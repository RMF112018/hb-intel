/**
 * Admin Control Plane — Configuration Versioning and Diff DTOs.
 *
 * Types for the Phase 10 version history, diff generation, and
 * structured version retrieval capabilities.
 *
 * Builds on IConfigGovernance.ts (P10-04) which defines the core
 * override record and audit event types.
 *
 * @module admin-control-plane
 */

import type { IAdminActorContext } from './IAdminRun.js';
import type { ConfigOverrideStatus, ConfigAuditEventType } from './IConfigGovernance.js';

// ─── Version Summary ────────────────────────────────────────────────────────────

/**
 * A structured summary of a single config version.
 *
 * Derived from audit events but presented as a first-class version record
 * so consumers (API and UI) don't need to reconstruct versions from raw logs.
 */
export interface IConfigVersionSummary {
  /** Config item key. */
  readonly key: string;

  /** Version number. */
  readonly version: number;

  /** The value at this version. Null if this version represents a revert. */
  readonly value: unknown;

  /** Override status at this version. */
  readonly status: ConfigOverrideStatus;

  /** How this version was created. */
  readonly eventType: ConfigAuditEventType;

  /** Actor who created this version. */
  readonly actor: IAdminActorContext;

  /** ISO 8601 timestamp when this version was created. */
  readonly timestamp: string;

  /** Operator-provided reason. */
  readonly reason: string;
}

// ─── Diff ───────────────────────────────────────────────────────────────────────

/**
 * A structured diff between two config versions.
 *
 * Designed to be stable and usable by both API responses and UI rendering.
 */
export interface IConfigVersionDiff {
  /** Config item key. */
  readonly key: string;

  /** Source version number (the "before" state). Null if comparing against code default. */
  readonly fromVersion: number | null;

  /** Target version number (the "after" state). */
  readonly toVersion: number;

  /** Value at the source version. */
  readonly fromValue: unknown;

  /** Value at the target version. */
  readonly toValue: unknown;

  /** Whether the values are identical. */
  readonly unchanged: boolean;

  /** Human-readable summary of the change. */
  readonly summary: string;

  /** Actor who created the target version. */
  readonly actor: IAdminActorContext;

  /** Timestamp of the target version. */
  readonly timestamp: string;

  /** Reason for the target version. */
  readonly reason: string;
}

// ─── Version History Response ───────────────────────────────────────────────────

/**
 * Paginated version history for a config item.
 */
export interface IConfigVersionHistory {
  /** Config item key. */
  readonly key: string;

  /** Current (latest) version number. */
  readonly currentVersion: number;

  /** Current status. */
  readonly currentStatus: ConfigOverrideStatus;

  /** Ordered list of versions, newest first. */
  readonly versions: readonly IConfigVersionSummary[];

  /** Total number of versions. */
  readonly total: number;
}
