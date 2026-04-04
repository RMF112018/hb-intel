/**
 * Admin Control Plane — Configuration Governance DTOs.
 *
 * Types for the Phase 10 hybrid source-of-truth configuration governance model.
 * These types define the contract between the admin operator console and the
 * privileged backend for live admin-maintained config overrides.
 *
 * Design: Catalog definitions (schema, validation, domain classification) remain
 * code-defined. This module defines only the *stored override* and *version/audit*
 * types for the live config store layer.
 *
 * @module admin-control-plane
 */

import type { IAdminActorContext } from './IAdminRun.js';

// ─── Config Override Records ────────────────────────────────────────────────────

/**
 * Source attribution for a resolved config value.
 */
export type ConfigValueSource = 'code-default' | 'live-override' | 'infrastructure';

/**
 * A stored live override for a single config item.
 *
 * Represents the published (or draft) value maintained by an admin through the
 * operator console. Only non-secret, live-editable items may have override records.
 */
export interface IConfigOverrideRecord {
  /** Config item key — must match a catalog entry with liveEditable: true. */
  readonly key: string;

  /** Taxonomy domain (e.g., 'access-control', 'rollout'). */
  readonly domain: string;

  /** Current published value. Null if the override has been reverted to code default. */
  readonly value: unknown;

  /** Monotonically increasing version number. Starts at 1 on first publish. */
  readonly version: number;

  /** Whether this override is currently published (effective) or reverted. */
  readonly status: ConfigOverrideStatus;

  /** Actor who last modified this override. */
  readonly lastModifiedBy: IAdminActorContext;

  /** ISO 8601 timestamp of last modification. */
  readonly lastModifiedAt: string;

  /** ISO 8601 timestamp of initial creation. */
  readonly createdAt: string;

  /** Operator-provided reason for the last change. */
  readonly reason: string;
}

/**
 * Status of a config override record.
 */
export type ConfigOverrideStatus = 'published' | 'reverted';

// ─── Config Audit Events ────────────────────────────────────────────────────────

/**
 * Event types for config override audit records.
 */
export type ConfigAuditEventType = 'created' | 'updated' | 'published' | 'reverted';

/**
 * Audit record for a config override change.
 *
 * Append-only — never modified or deleted after creation.
 */
export interface IConfigAuditEvent {
  /** Unique event identifier. */
  readonly eventId: string;

  /** Type of change. */
  readonly eventType: ConfigAuditEventType;

  /** Config item key. */
  readonly configKey: string;

  /** Taxonomy domain. */
  readonly domain: string;

  /** Value before the change. Null for 'created' events. */
  readonly previousValue: unknown;

  /** Value after the change. Null for 'reverted' events (falls back to code default). */
  readonly newValue: unknown;

  /** Version before the change. Null for 'created' events. */
  readonly previousVersion: number | null;

  /** Version after the change. */
  readonly newVersion: number;

  /** Actor who made the change. */
  readonly actor: IAdminActorContext;

  /** ISO 8601 timestamp. */
  readonly timestamp: string;

  /** Operator-provided reason for the change. */
  readonly reason: string;
}

// ─── Config Snapshot ────────────────────────────────────────────────────────────

/**
 * A point-in-time snapshot of effective config used by a downstream run.
 */
export interface IConfigSnapshot {
  /** Unique snapshot identifier. */
  readonly snapshotId: string;

  /** ISO 8601 timestamp when the snapshot was captured. */
  readonly resolvedAt: string;

  /** Map of config key → version ID for all live-override items resolved at snapshot time. */
  readonly versionMap: Record<string, number>;

  /** Map of config key → effective value at snapshot time. */
  readonly effectiveValues: Record<string, unknown>;

  /** Map of config key → source attribution. */
  readonly sourceMap: Record<string, ConfigValueSource>;
}

// ─── Write Request DTOs ─────────────────────────────────────────────────────────

/**
 * Request to create or update a live config override.
 */
export interface IConfigOverrideWriteRequest {
  /** Config item key. */
  readonly key: string;

  /** Taxonomy domain. */
  readonly domain: string;

  /** The new value to publish. */
  readonly value: unknown;

  /** Operator-provided reason. */
  readonly reason: string;

  /**
   * Expected current version for optimistic concurrency.
   * Null for first-time creation. If the stored version doesn't match,
   * the write is rejected to prevent stale overwrites.
   */
  readonly expectedVersion: number | null;
}

/**
 * Request to revert a live config override to code default.
 */
export interface IConfigOverrideRevertRequest {
  /** Config item key. */
  readonly key: string;

  /** Operator-provided reason for reverting. */
  readonly reason: string;

  /** Expected current version for optimistic concurrency. */
  readonly expectedVersion: number;
}

// ─── Resolution Engine Types ────────────────────────────────────────────────────

/**
 * Validation status for a resolved config value.
 */
export type ConfigValidationStatus = 'valid' | 'invalid' | 'unchecked';

/**
 * A fully resolved config item with provenance.
 *
 * Returned by the resolution engine for each config item. Contains the
 * effective value, its source, version metadata, and the code default
 * for comparison.
 */
export interface IResolvedConfigItem {
  /** Config item key. */
  readonly key: string;

  /** The effective value after applying precedence rules. */
  readonly effectiveValue: unknown;

  /** Where the effective value came from. */
  readonly source: ConfigValueSource;

  /** Version ID of the live override, or null if code-default/infrastructure. */
  readonly version: number | null;

  /** Actor who last changed the live override, or null. */
  readonly lastChangedBy: IAdminActorContext | null;

  /** ISO 8601 timestamp of last live override change, or null. */
  readonly lastChangedAt: string | null;

  /** ISO 8601 timestamp when the live override was published, or null. */
  readonly publishedAt: string | null;

  /** The code-defined default value (always included for comparison). */
  readonly codeDefault: unknown;

  /** Validation status of the effective value against catalog rules. */
  readonly validationStatus: ConfigValidationStatus;
}
