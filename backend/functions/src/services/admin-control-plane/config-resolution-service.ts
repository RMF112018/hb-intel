/**
 * Config Resolution Service — Phase 10 effective-config resolution engine.
 *
 * Computes effective configuration values by applying the precedence order
 * from P10-02 §5:
 *   1. Infrastructure-controlled (process.env) — always wins
 *   2. Live admin-maintained override (published) — from override store
 *   3. Code default — from catalog registry
 *
 * Secret items are excluded from resolution results.
 * Every resolved item carries full provenance (source, version, actor).
 *
 * @module admin-control-plane/services
 */

import type {
  IResolvedConfigItem,
  IConfigSnapshot,
} from '@hbc/models/admin-control-plane';
import type { IConfigOverrideStore } from './config-override-store.js';
import type { IConfigSnapshotStore } from './config-snapshot-store.js';

// ─── Catalog Entry (minimal for resolution) ─────────────────────────────────────

/**
 * Minimal catalog entry shape needed by the resolution engine.
 *
 * The full IConfigCatalogEntry from P10-03 has many more fields,
 * but the resolution engine only needs these to apply precedence.
 */
export interface IResolvableCatalogEntry {
  readonly key: string;
  readonly domain: string;
  readonly defaultValue: unknown;
  readonly liveEditable: boolean;
  readonly secret: boolean;
  readonly infrastructureControlled: boolean;
}

// ─── Environment Reader ─────────────────────────────────────────────────────────

/**
 * Abstraction for reading environment/infrastructure values.
 * Defaults to process.env in production; injectable for testing.
 */
export type EnvReader = (key: string) => string | undefined;

export const processEnvReader: EnvReader = (key: string) => process.env[key];

// ─── Service Interface ──────────────────────────────────────────────────────────

/**
 * Resolution engine for effective configuration values.
 */
export interface IConfigResolutionService {
  /** Resolve a single config item with full provenance. Returns null if key not in catalog. */
  resolveItem(key: string): Promise<IResolvedConfigItem | null>;

  /** Resolve all config items, optionally filtered by domain. Excludes secrets. */
  resolveAll(domain?: string): Promise<readonly IResolvedConfigItem[]>;

  /** Capture an immutable snapshot of current effective config. */
  captureSnapshot(domain?: string): Promise<IConfigSnapshot>;

  /** Retrieve a previously captured snapshot by ID. */
  getSnapshot(snapshotId: string): Promise<IConfigSnapshot | null>;
}

// ─── Implementation ─────────────────────────────────────────────────────────────

export class ConfigResolutionService implements IConfigResolutionService {
  private readonly catalogMap: ReadonlyMap<string, IResolvableCatalogEntry>;

  constructor(
    private readonly catalog: readonly IResolvableCatalogEntry[],
    private readonly overrideStore: IConfigOverrideStore,
    private readonly snapshotStore: IConfigSnapshotStore,
    private readonly readEnv: EnvReader = processEnvReader,
  ) {
    this.catalogMap = new Map(catalog.map(e => [e.key, e]));
  }

  async resolveItem(key: string): Promise<IResolvedConfigItem | null> {
    const entry = this.catalogMap.get(key);
    if (!entry) return null;
    if (entry.secret) return null; // Secrets never resolved through this engine

    return this.resolveEntry(entry);
  }

  async resolveAll(domain?: string): Promise<readonly IResolvedConfigItem[]> {
    let entries = [...this.catalogMap.values()];
    if (domain) {
      entries = entries.filter(e => e.domain === domain);
    }
    // Exclude secrets
    entries = entries.filter(e => !e.secret);

    const results: IResolvedConfigItem[] = [];
    for (const entry of entries) {
      results.push(await this.resolveEntry(entry));
    }
    return results;
  }

  async captureSnapshot(domain?: string): Promise<IConfigSnapshot> {
    const resolved = await this.resolveAll(domain);
    const now = new Date().toISOString();

    const snapshot: IConfigSnapshot = {
      snapshotId: crypto.randomUUID(),
      resolvedAt: now,
      versionMap: Object.fromEntries(
        resolved
          .filter(r => r.version !== null)
          .map(r => [r.key, r.version as number]),
      ),
      effectiveValues: Object.fromEntries(
        resolved.map(r => [r.key, r.effectiveValue]),
      ),
      sourceMap: Object.fromEntries(
        resolved.map(r => [r.key, r.source]),
      ),
    };

    await this.snapshotStore.saveSnapshot(snapshot);
    return snapshot;
  }

  async getSnapshot(snapshotId: string): Promise<IConfigSnapshot | null> {
    return this.snapshotStore.getSnapshot(snapshotId);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private async resolveEntry(entry: IResolvableCatalogEntry): Promise<IResolvedConfigItem> {
    // Priority 1: Infrastructure-controlled — env var always wins
    if (entry.infrastructureControlled) {
      const envValue = this.readEnv(entry.key);
      return {
        key: entry.key,
        effectiveValue: envValue ?? entry.defaultValue,
        source: envValue !== undefined ? 'infrastructure' : 'code-default',
        version: null,
        lastChangedBy: null,
        lastChangedAt: null,
        publishedAt: null,
        codeDefault: entry.defaultValue,
        validationStatus: 'unchecked',
      };
    }

    // Priority 2: Live override (published)
    if (entry.liveEditable) {
      const override = await this.overrideStore.getOverride(entry.key);
      if (override && override.status === 'published') {
        return {
          key: entry.key,
          effectiveValue: override.value,
          source: 'live-override',
          version: override.version,
          lastChangedBy: override.lastModifiedBy,
          lastChangedAt: override.lastModifiedAt,
          publishedAt: override.lastModifiedAt,
          codeDefault: entry.defaultValue,
          validationStatus: 'valid', // Override passed validation at write time
        };
      }
    }

    // Priority 3: Code default
    return {
      key: entry.key,
      effectiveValue: entry.defaultValue,
      source: 'code-default',
      version: null,
      lastChangedBy: null,
      lastChangedAt: null,
      publishedAt: null,
      codeDefault: entry.defaultValue,
      validationStatus: 'valid',
    };
  }
}
