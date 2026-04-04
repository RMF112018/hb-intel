/**
 * P9-04: Connection Registry Service.
 *
 * Governs UI-managed connector configurations for hybrid identity.
 * Stores connection metadata and health state. Sensitive values (passwords,
 * certificate references) are stored securely and never returned in API responses.
 *
 * Phase 9 minimum viable: In-memory mock for tests; Table Storage-backed
 * implementation will be wired in Prompt-05 when the API endpoints are added.
 *
 * Pattern: interface + real stub + mock in one file (matches graph-service.ts).
 */

import { ConnectionNotConfiguredError, ConnectionUnhealthyError } from './hybrid-identity-errors.js';

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Connector class identifier. */
export type ConnectorClass =
  | 'ad-ds'
  | 'graph-identity'
  | 'microsoft-intune'
  | 'microsoft-autopilot'
  | 'apple-abm'
  | 'apple-ade'
  | 'apple-apns'
  | 'ninjaone-api';

/** Connection health status. */
export type ConnectionHealthStatus = 'healthy' | 'unhealthy' | 'untested';

/** Types of changes tracked in connector change history. */
export type ConnectionChangeType = 'created' | 'updated' | 'policy-changed' | 'credential-rotated';

/** A single entry in the connector change history. */
export interface IConnectionChangeEntry {
  readonly version: number;
  readonly changedAt: string;
  readonly changedBy: string;
  readonly changeType: ConnectionChangeType;
  readonly summary: string;
}

/** Policy toggles governing connector behavior. */
export interface IConnectorPolicyToggles {
  readonly enabled: boolean;
  readonly dryRunOnly: boolean;
  readonly productionLaunchAllowed: boolean;
  readonly highRiskCheckpointRequired: boolean;
}

/** Default policy toggles for newly created connectors. */
const DEFAULT_POLICY_TOGGLES: IConnectorPolicyToggles = {
  enabled: true,
  dryRunOnly: true,
  productionLaunchAllowed: false,
  highRiskCheckpointRequired: true,
};

/** Maximum number of change history entries retained per connector. */
const MAX_CHANGE_HISTORY = 50;

/** Stored connection record (sensitive fields redacted in API responses). */
export interface IConnectionRecord {
  readonly connectorId: string;
  readonly connectorClass: ConnectorClass;
  readonly displayName: string;
  readonly config: Record<string, unknown>;
  readonly hasCredential: boolean;
  readonly healthStatus: ConnectionHealthStatus;
  readonly configVersion: number;
  readonly policyToggles: IConnectorPolicyToggles;
  readonly changeHistory: readonly IConnectionChangeEntry[];
  readonly lastTestedAt: string | null;
  readonly lastTestResult: 'success' | 'failure' | null;
  readonly lastTestError: string | null;
  readonly lastTestedBy: string | null;
  readonly lastSuccessfulTestAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
}

/** Mutable internal storage entry (writable for test-result updates). */
interface IConnectionStorageEntry {
  connectorId: string;
  connectorClass: ConnectorClass;
  displayName: string;
  config: Record<string, unknown>;
  credential: string | null;
  hasCredential: boolean;
  healthStatus: ConnectionHealthStatus;
  configVersion: number;
  policyToggles: IConnectorPolicyToggles;
  changeHistory: IConnectionChangeEntry[];
  lastTestedAt: string | null;
  lastTestResult: 'success' | 'failure' | null;
  lastTestError: string | null;
  lastTestedBy: string | null;
  lastSuccessfulTestAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/** Input for creating or updating a connection. */
export interface IConnectionUpsertRequest {
  readonly connectorClass: ConnectorClass;
  readonly displayName: string;
  readonly config: Record<string, unknown>;
  readonly credential?: string;
  readonly policyToggles?: Partial<IConnectorPolicyToggles>;
}

/** Result of a connection test. */
export interface IConnectionTestResult {
  readonly success: boolean;
  readonly error: string | null;
  readonly testedAt: string;
}

// ─── Interface ─────────────────────────────────────────────────────────────────

/**
 * P9-04: Connection registry service interface.
 *
 * Manages connector configurations with secure credential handling.
 * Credentials are write-only — the service stores them but never returns
 * them in API responses (hasCredential flag indicates presence).
 */
export interface IConnectionRegistryService {
  /** Get a connection by ID. Returns null if not found. */
  getConnection(connectorId: string): Promise<IConnectionRecord | null>;

  /** Get a connection by connector class (e.g., 'ad-ds'). Returns null if not configured. */
  getConnectionByClass(connectorClass: ConnectorClass): Promise<IConnectionRecord | null>;

  /** List all configured connections. */
  listConnections(): Promise<readonly IConnectionRecord[]>;

  /** Create or update a connection. Returns the connection record (credential redacted). */
  upsertConnection(connectorId: string, request: IConnectionUpsertRequest, actor: string): Promise<IConnectionRecord>;

  /** Delete a connection. */
  deleteConnection(connectorId: string): Promise<void>;

  /** Test a connection. Updates health metadata. */
  testConnection(connectorId: string, actor: string): Promise<IConnectionTestResult>;

  /** Resolve the stored credential for a connector (backend-only, never exposed to API). */
  resolveCredential(connectorId: string): Promise<string | null>;

  /** Assert a connector is configured and healthy. Throws if not. */
  assertHealthy(connectorClass: ConnectorClass): Promise<IConnectionRecord>;

  /** Get the change history for a connector. Returns empty array if not found. */
  getConnectionHistory(connectorId: string): Promise<readonly IConnectionChangeEntry[]>;

  /** Update policy toggles for a connector. Returns the updated record. */
  updatePolicyToggles(connectorId: string, toggles: Partial<IConnectorPolicyToggles>, actor: string): Promise<IConnectionRecord>;
}

// ─── Stub real implementation ──────────────────────────────────────────────────

/**
 * P9-04: Stub real connection registry.
 *
 * Will be backed by Azure Table Storage in Prompt-05+.
 * Currently delegates to in-memory storage so the service factory can wire it.
 */
export class ConnectionRegistryService implements IConnectionRegistryService {
  private readonly store = new Map<string, IConnectionStorageEntry>();

  async getConnection(connectorId: string): Promise<IConnectionRecord | null> {
    const entry = this.store.get(connectorId);
    return entry ? redact(entry) : null;
  }

  async getConnectionByClass(connectorClass: ConnectorClass): Promise<IConnectionRecord | null> {
    const entry = [...this.store.values()].find((c) => c.connectorClass === connectorClass);
    return entry ? redact(entry) : null;
  }

  async listConnections(): Promise<readonly IConnectionRecord[]> {
    return [...this.store.values()].map(redact);
  }

  async upsertConnection(connectorId: string, request: IConnectionUpsertRequest, actor: string): Promise<IConnectionRecord> {
    const now = new Date().toISOString();
    const existing = this.store.get(connectorId);
    const isCreate = !existing;
    const previousVersion = existing?.configVersion ?? 0;
    const nextVersion = previousVersion + 1;
    const credentialRotated = !isCreate && !!request.credential && existing?.hasCredential;

    const changeType: ConnectionChangeType = isCreate
      ? 'created'
      : credentialRotated
        ? 'credential-rotated'
        : 'updated';
    const summary = isCreate
      ? `Connector ${request.displayName} created (class: ${request.connectorClass})`
      : credentialRotated
        ? `Credential rotated for ${request.displayName}`
        : `Configuration updated for ${request.displayName}`;

    const previousHistory = existing?.changeHistory ?? [];
    const newHistoryEntry: IConnectionChangeEntry = {
      version: nextVersion,
      changedAt: now,
      changedBy: actor,
      changeType,
      summary,
    };
    const changeHistory = [newHistoryEntry, ...previousHistory].slice(0, MAX_CHANGE_HISTORY);

    const mergedToggles: IConnectorPolicyToggles = {
      ...(existing?.policyToggles ?? DEFAULT_POLICY_TOGGLES),
      ...(request.policyToggles ?? {}),
    };

    const entry: IConnectionStorageEntry = {
      connectorId,
      connectorClass: request.connectorClass,
      displayName: request.displayName,
      config: request.config,
      credential: request.credential ?? existing?.credential ?? null,
      hasCredential: !!(request.credential ?? existing?.credential),
      healthStatus: 'untested',
      configVersion: nextVersion,
      policyToggles: mergedToggles,
      changeHistory,
      lastTestedAt: existing?.lastTestedAt ?? null,
      lastTestResult: existing?.lastTestResult ?? null,
      lastTestError: existing?.lastTestError ?? null,
      lastTestedBy: existing?.lastTestedBy ?? null,
      lastSuccessfulTestAt: existing?.lastSuccessfulTestAt ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      createdBy: existing?.createdBy ?? actor,
      updatedBy: actor,
    };
    this.store.set(connectorId, entry);
    return redact(entry);
  }

  async deleteConnection(connectorId: string): Promise<void> {
    this.store.delete(connectorId);
  }

  async testConnection(connectorId: string, actor: string): Promise<IConnectionTestResult> {
    const entry = this.store.get(connectorId);
    if (!entry) throw new ConnectionNotConfiguredError(connectorId);

    // Stub: always succeeds. Real impl will attempt actual connection.
    const now = new Date().toISOString();
    const result: IConnectionTestResult = { success: true, error: null, testedAt: now };

    entry.healthStatus = 'healthy';
    entry.lastTestedAt = now;
    entry.lastTestResult = 'success';
    entry.lastTestError = null;
    entry.lastTestedBy = actor;
    entry.lastSuccessfulTestAt = now;

    return result;
  }

  async resolveCredential(connectorId: string): Promise<string | null> {
    return this.store.get(connectorId)?.credential ?? null;
  }

  async getConnectionHistory(connectorId: string): Promise<readonly IConnectionChangeEntry[]> {
    return this.store.get(connectorId)?.changeHistory ?? [];
  }

  async updatePolicyToggles(connectorId: string, toggles: Partial<IConnectorPolicyToggles>, actor: string): Promise<IConnectionRecord> {
    const entry = this.store.get(connectorId);
    if (!entry) throw new ConnectionNotConfiguredError(connectorId);

    const now = new Date().toISOString();
    const nextVersion = entry.configVersion + 1;

    const changedKeys = Object.keys(toggles).filter(
      (k) => toggles[k as keyof IConnectorPolicyToggles] !== entry.policyToggles[k as keyof IConnectorPolicyToggles],
    );
    const summary = changedKeys.length > 0
      ? `Policy toggles updated: ${changedKeys.join(', ')}`
      : 'Policy toggles updated (no effective change)';

    const newHistoryEntry: IConnectionChangeEntry = {
      version: nextVersion,
      changedAt: now,
      changedBy: actor,
      changeType: 'policy-changed',
      summary,
    };
    entry.changeHistory = [newHistoryEntry, ...entry.changeHistory].slice(0, MAX_CHANGE_HISTORY);
    entry.policyToggles = { ...entry.policyToggles, ...toggles };
    entry.configVersion = nextVersion;
    entry.updatedAt = now;
    entry.updatedBy = actor;

    return redact(entry);
  }

  async assertHealthy(connectorClass: ConnectorClass): Promise<IConnectionRecord> {
    const entry = [...this.store.values()].find((c) => c.connectorClass === connectorClass);
    if (!entry) throw new ConnectionNotConfiguredError(connectorClass);
    if (entry.healthStatus !== 'healthy') {
      throw new ConnectionUnhealthyError(connectorClass, entry.lastTestError ?? undefined);
    }
    return redact(entry);
  }
}

// ─── Mock ──────────────────────────────────────────────────────────────────────

/**
 * P9-04: In-memory mock connection registry for tests.
 * Identical behavior to ConnectionRegistryService (which is also in-memory
 * for now), but exists as a separate class for the real/mock factory pattern.
 */
export class MockConnectionRegistryService extends ConnectionRegistryService {}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Strip the raw credential from the record before returning to callers. */
function redact(entry: IConnectionStorageEntry): IConnectionRecord {
  const { credential: _credential, ...safe } = entry;
  return safe;
}
