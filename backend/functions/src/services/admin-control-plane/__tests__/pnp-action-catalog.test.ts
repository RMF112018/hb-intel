import { describe, expect, it } from 'vitest';
import {
  getPnpActionDescriptor,
  normalizePnpActionKey,
  PNP_ACTION_CATALOG,
  toActionMetadata,
} from '../pnp-action-catalog.js';

describe('pnp-action-catalog', () => {
  it('normalizes Prompt-00 alias keys to canonical keys', () => {
    expect(
      normalizePnpActionKey('sharepoint:pnp:list-schema-export'),
    ).toBe('sharepoint-control:extraction:list-schema');
  });

  it('returns descriptor for canonical keys', () => {
    const descriptor = getPnpActionDescriptor(
      'sharepoint-control:extraction:site-template',
    );
    expect(descriptor?.requiredInput).toBe('site-only');
  });

  it('builds metadata output for all v1 actions', () => {
    const metadata = toActionMetadata(true, null);
    expect(metadata).toHaveLength(PNP_ACTION_CATALOG.length);
    expect(
      metadata.some(
        (entry) =>
          entry.actionKey === 'sharepoint-control:extraction:site-inventory',
      ),
    ).toBe(true);
    expect(
      metadata.some(
        (entry) =>
          entry.actionKey === 'sharepoint-control:extraction:library-folder-tree',
      ),
    ).toBe(true);
    expect(
      metadata.some(
        (entry) =>
          entry.actionKey === 'sharepoint-control:extraction:site-groups-summary',
      ),
    ).toBe(true);
    expect(
      metadata.some(
        (entry) =>
          entry.actionKey === 'sharepoint-control:extraction:page-webpart-inventory',
      ),
    ).toBe(true);
  });

  it('normalizes Prompt-04 alias keys to canonical keys', () => {
    expect(
      normalizePnpActionKey('sharepoint:pnp:library-folder-tree-export'),
    ).toBe('sharepoint-control:extraction:library-folder-tree');
    expect(
      normalizePnpActionKey('sharepoint:pnp:site-groups-summary-export'),
    ).toBe('sharepoint-control:extraction:site-groups-summary');
    expect(
      normalizePnpActionKey('sharepoint:pnp:page-webpart-inventory-export'),
    ).toBe('sharepoint-control:extraction:page-webpart-inventory');
  });
});
