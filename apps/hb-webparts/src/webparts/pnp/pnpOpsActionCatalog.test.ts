import { describe, expect, it } from 'vitest';
import { resolvePnpActionCatalog } from './pnpOpsActionCatalog.js';

describe('resolvePnpActionCatalog', () => {
  it('uses fallback when backend metadata is missing', () => {
    const result = resolvePnpActionCatalog(null);
    expect(result.actions.length).toBe(4);
    expect(result.usedFallback).toBe(true);
    expect(result.warning).toContain('locked v1 PnP catalog');
  });

  it('maps backend metadata for known Prompt-01 keys', () => {
    const result = resolvePnpActionCatalog([
      {
        actionKey: 'sharepoint-control:extraction:list-schema',
        label: 'List Schema (Live)',
        description: 'Backend registered list schema extractor.',
        riskLevel: 'read-only',
        executionMode: 'advisory',
        supportsPreview: true,
        available: true,
        unavailableReason: null,
      },
    ]);

    expect(result.usedFallback).toBe(false);
    const listSchema = result.actions.find((action) => action.key === 'sharepoint-control:extraction:list-schema');
    expect(listSchema?.label).toBe('List Schema (Live)');
    expect(listSchema?.description).toContain('Backend registered list schema extractor.');
  });
});
