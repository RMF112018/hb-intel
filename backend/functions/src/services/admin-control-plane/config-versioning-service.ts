/**
 * Config Versioning Service — Phase 10 version/history/diff backbone.
 *
 * Provides structured version history, specific-version retrieval,
 * and diff generation on top of the IConfigOverrideStore (P10-04).
 *
 * This service does NOT own persistence — it delegates to the store.
 * It adds higher-level query and diff capabilities that API and UI
 * layers consume without reconstructing versions from raw audit logs.
 *
 * @module admin-control-plane/services
 */

import type {
  IConfigAuditEvent,
  IConfigOverrideRecord,
  IConfigOverrideWriteRequest,
  IConfigOverrideRevertRequest,
  IAdminActorContext,
  IConfigVersionSummary,
  IConfigVersionDiff,
  IConfigVersionHistory,
  ConfigOverrideStatus,
} from '@hbc/models/admin-control-plane';
import type { IConfigOverrideStore } from './config-override-store.js';

// ─── Service Interface ──────────────────────────────────────────────────────────

/**
 * Versioning service for live config overrides.
 *
 * Wraps the config override store with structured version history,
 * diff generation, and version retrieval capabilities.
 */
export interface IConfigVersioningService {
  /** Publish a new override value (delegates to store with concurrency check). */
  publish(request: IConfigOverrideWriteRequest, actor: IAdminActorContext): Promise<IConfigOverrideRecord>;

  /** Revert an override to code default (delegates to store with concurrency check). */
  revert(request: IConfigOverrideRevertRequest, actor: IAdminActorContext): Promise<IConfigOverrideRecord>;

  /** Get the current override state. */
  getCurrent(key: string): Promise<IConfigOverrideRecord | null>;

  /** Get a specific version's snapshot from audit history. */
  getVersion(key: string, version: number): Promise<IConfigVersionSummary | null>;

  /** Get structured version history for a config item, newest first. */
  getVersionHistory(key: string): Promise<IConfigVersionHistory | null>;

  /** Compute a diff between two versions (or between code default and a version). */
  diffVersions(key: string, fromVersion: number | null, toVersion: number): Promise<IConfigVersionDiff | null>;
}

// ─── Implementation ─────────────────────────────────────────────────────────────

/**
 * Default implementation backed by an IConfigOverrideStore.
 */
export class ConfigVersioningService implements IConfigVersioningService {
  constructor(private readonly store: IConfigOverrideStore) {}

  async publish(request: IConfigOverrideWriteRequest, actor: IAdminActorContext): Promise<IConfigOverrideRecord> {
    return this.store.putOverride(request, actor);
  }

  async revert(request: IConfigOverrideRevertRequest, actor: IAdminActorContext): Promise<IConfigOverrideRecord> {
    return this.store.revertOverride(request, actor);
  }

  async getCurrent(key: string): Promise<IConfigOverrideRecord | null> {
    return this.store.getOverride(key);
  }

  async getVersion(key: string, version: number): Promise<IConfigVersionSummary | null> {
    const history = await this.store.getHistory(key);
    const event = history.find(e => e.newVersion === version);
    if (!event) return null;
    return auditEventToVersionSummary(key, event);
  }

  async getVersionHistory(key: string): Promise<IConfigVersionHistory | null> {
    const history = await this.store.getHistory(key);
    if (history.length === 0) return null;

    const versions = history.map(e => auditEventToVersionSummary(key, e));
    const latest = versions[0]; // history is newest-first from store

    return {
      key,
      currentVersion: latest.version,
      currentStatus: latest.status,
      versions,
      total: versions.length,
    };
  }

  async diffVersions(key: string, fromVersion: number | null, toVersion: number): Promise<IConfigVersionDiff | null> {
    const history = await this.store.getHistory(key);
    if (history.length === 0) return null;

    const toEvent = history.find(e => e.newVersion === toVersion);
    if (!toEvent) return null;

    let fromValue: unknown = null;

    if (fromVersion !== null) {
      const fromEvent = history.find(e => e.newVersion === fromVersion);
      if (!fromEvent) return null;
      fromValue = fromEvent.newValue;
    }
    // fromVersion === null means "compare against code default" — fromValue stays null

    const toValue = toEvent.newValue;
    const unchanged = stableEquals(fromValue, toValue);

    return {
      key,
      fromVersion,
      toVersion,
      fromValue,
      toValue,
      unchanged,
      summary: buildDiffSummary(fromVersion, toVersion, fromValue, toValue, unchanged, toEvent.eventType),
      actor: toEvent.actor,
      timestamp: toEvent.timestamp,
      reason: toEvent.reason,
    };
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function auditEventToVersionSummary(key: string, event: IConfigAuditEvent): IConfigVersionSummary {
  const status: ConfigOverrideStatus = event.eventType === 'reverted' ? 'reverted' : 'published';
  return {
    key,
    version: event.newVersion,
    value: event.newValue,
    status,
    eventType: event.eventType,
    actor: event.actor,
    timestamp: event.timestamp,
    reason: event.reason,
  };
}

/**
 * Stable equality check using JSON serialization.
 *
 * Handles primitives, arrays, and plain objects. Sufficient for config values
 * which are always JSON-serializable (strings, numbers, booleans, arrays, objects).
 */
export function stableEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a === undefined || b === undefined) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Build a human-readable diff summary.
 */
export function buildDiffSummary(
  fromVersion: number | null,
  toVersion: number,
  fromValue: unknown,
  toValue: unknown,
  unchanged: boolean,
  eventType: string,
): string {
  if (unchanged) {
    return `Version ${toVersion}: no value change`;
  }

  const fromLabel = fromVersion === null ? 'code default' : `version ${fromVersion}`;
  const action = eventType === 'reverted' ? 'reverted to code default' : 'updated';

  if (typeof fromValue === 'string' && typeof toValue === 'string') {
    return `Version ${toVersion}: ${action} from ${fromLabel} ("${truncate(fromValue)}" → "${truncate(toValue as string)}")`;
  }

  return `Version ${toVersion}: ${action} from ${fromLabel}`;
}

function truncate(value: string, maxLen = 40): string {
  return value.length > maxLen ? value.slice(0, maxLen) + '…' : value;
}
