import { describe, expect, it } from 'vitest';
import { buildFoleonProvisioningPlan } from '../provisioningPlan.js';

describe('buildFoleonProvisioningPlan', () => {
  const plan = buildFoleonProvisioningPlan({
    now: new Date('2026-04-24T00:00:00Z'),
  });

  it('declares itself a dry-run for the HBCentral site', () => {
    expect(plan.status).toBe('dry-run');
    expect(plan.site).toBe('https://hedrickbrotherscom.sharepoint.com/sites/HBCentral');
    expect(plan.generatedAt).toBe('2026-04-24T00:00:00.000Z');
  });

  it('emits plans for all three MVP lists in provisioning order', () => {
    expect(plan.lists.map((l) => l.internalName)).toEqual([
      'HB_FoleonContentRegistry',
      'HB_FoleonHomepagePlacements',
      'HB_FoleonInteractionEvents',
    ]);
  });

  it('enables versioning on business lists and disables on the events list', () => {
    const byName = new Map(plan.lists.map((l) => [l.internalName, l]));
    expect(byName.get('HB_FoleonContentRegistry')?.versioning).toBe(true);
    expect(byName.get('HB_FoleonHomepagePlacements')?.versioning).toBe(true);
    expect(byName.get('HB_FoleonInteractionEvents')?.versioning).toBe(false);
  });

  it('emits the indexed-field count consistent with the fields array', () => {
    for (const list of plan.lists) {
      const indexedFromFields = list.fields.filter((f) => f.indexed).length;
      expect(list.indexedFieldCount).toBe(indexedFromFields);
    }
  });

  it('captures the lookup binding from placements → content registry', () => {
    const placements = plan.lists.find((l) => l.internalName === 'HB_FoleonHomepagePlacements');
    const lookup = placements?.fields.find((f) => f.internalName === 'ContentLookup');
    expect(lookup?.lookupTarget).toBe('HB_FoleonContentRegistry');
  });

  it('never embeds raw preview URLs or credentials', () => {
    const serialized = JSON.stringify(plan);
    expect(serialized).not.toContain('/preview/');
    expect(serialized).not.toContain('9y5ovw5h3q9ky9');
    expect(serialized).not.toContain('client_secret');
    expect(serialized).not.toContain('access_token');
  });
});
