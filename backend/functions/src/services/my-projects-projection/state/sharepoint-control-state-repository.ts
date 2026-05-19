import type { SourceListKind } from '../projection-types.js';
import { MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES } from '../storage-list-descriptor.js';
import { SharePointStateStore } from './sharepoint-state-store.js';

export type ProjectionLeaseRowKey =
  | `Lease:Sync:${SourceListKind}`
  | 'Lease:Rebuild:Global'
  | 'Lease:DriftAudit:Global'
  | 'Lease:Purge:Global';

export type LeaseAcquireOutcome =
  | { readonly acquired: true; readonly expiresAtUtc: string }
  | { readonly acquired: false; readonly reason: 'active'; readonly currentOwner: string; readonly expiresAtUtc: string }
  | { readonly acquired: false; readonly reason: 'race-conflict' };

function controlTypeFromRowKey(rowKey: ProjectionLeaseRowKey): string {
  if (rowKey.startsWith('Lease:Sync:')) return 'sync-lease';
  if (rowKey.includes('Rebuild')) return 'rebuild-lease';
  if (rowKey.includes('DriftAudit')) return 'audit-lease';
  return 'purge-lease';
}

export class SharePointProjectionControlStateRepository {
  private readonly store: SharePointStateStore;
  private readonly listTitle = MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES.controlState;

  constructor(store: SharePointStateStore) {
    this.store = store;
  }

  private async getRow(rowKey: ProjectionLeaseRowKey): Promise<{ id: number; fields: Record<string, unknown> } | null> {
    return this.store.getByTextField({
      listTitle: this.listTitle,
      field: 'ControlKey',
      value: rowKey,
      select: ['ControlKey', 'Owner', 'State', 'ExpiresAtUtc', 'AcquiredAtUtc', 'UpdatedAtUtc'],
    });
  }

  async tryAcquire(args: { rowKey: ProjectionLeaseRowKey; leaseType: 'sync' | 'rebuild' | 'audit' | 'purge'; leaseOwner: string; ttlMinutes: number; sourceListKind?: SourceListKind; now: Date; }): Promise<LeaseAcquireOutcome> {
    if (args.ttlMinutes <= 0 || !Number.isFinite(args.ttlMinutes)) throw new RangeError('ttlMinutes must be positive');
    if (!args.leaseOwner) throw new RangeError('leaseOwner must be non-empty');
    const existing = await this.getRow(args.rowKey);
    const nowIso = args.now.toISOString();
    const expiresAtUtc = new Date(args.now.getTime() + args.ttlMinutes * 60_000).toISOString();
    if (!existing) {
      await this.store.add({
        listTitle: this.listTitle,
        fields: {
          Title: args.rowKey,
          ControlKey: args.rowKey,
          ControlType: controlTypeFromRowKey(args.rowKey),
          Owner: args.leaseOwner,
          AcquiredAtUtc: nowIso,
          ExpiresAtUtc: expiresAtUtc,
          State: 'active',
          UpdatedAtUtc: nowIso,
        },
      });
      return { acquired: true, expiresAtUtc };
    }
    const currentOwner = String(existing.fields.Owner ?? '');
    const currentExpires = String(existing.fields.ExpiresAtUtc ?? '');
    const state = String(existing.fields.State ?? 'released');
    const expiresMs = Date.parse(currentExpires);
    const isExpired = !Number.isFinite(expiresMs) || args.now.getTime() >= expiresMs || state !== 'active';
    if (!isExpired && currentOwner !== args.leaseOwner) {
      return { acquired: false, reason: 'active', currentOwner, expiresAtUtc: currentExpires };
    }
    await this.store.update({
      listTitle: this.listTitle,
      itemId: existing.id,
      fields: {
        Owner: args.leaseOwner,
        AcquiredAtUtc: nowIso,
        ExpiresAtUtc: expiresAtUtc,
        State: 'active',
        UpdatedAtUtc: nowIso,
      },
    });
    return { acquired: true, expiresAtUtc };
  }

  async renew(args: { rowKey: ProjectionLeaseRowKey; leaseOwner: string; ttlMinutes: number; now: Date; }): Promise<{ renewed: boolean; expiresAtUtc?: string }> {
    const existing = await this.getRow(args.rowKey);
    if (!existing) return { renewed: false };
    if (String(existing.fields.Owner ?? '') !== args.leaseOwner) return { renewed: false };
    const expiresAtUtc = new Date(args.now.getTime() + args.ttlMinutes * 60_000).toISOString();
    await this.store.update({
      listTitle: this.listTitle,
      itemId: existing.id,
      fields: { ExpiresAtUtc: expiresAtUtc, UpdatedAtUtc: args.now.toISOString(), State: 'active' },
    });
    return { renewed: true, expiresAtUtc };
  }

  async release(args: { rowKey: ProjectionLeaseRowKey; leaseOwner: string; }): Promise<{ released: boolean }> {
    const existing = await this.getRow(args.rowKey);
    if (!existing) return { released: false };
    if (String(existing.fields.Owner ?? '') !== args.leaseOwner) return { released: false };
    await this.store.update({
      listTitle: this.listTitle,
      itemId: existing.id,
      fields: { State: 'released', UpdatedAtUtc: new Date().toISOString(), Owner: null, ExpiresAtUtc: null, AcquiredAtUtc: null },
    });
    return { released: true };
  }
}
