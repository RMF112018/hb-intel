import { describe, expect, it } from 'vitest';
import { buildConnectivityBarViewModel } from './HbcConnectivityBar.js';

describe('buildConnectivityBarViewModel', () => {
  it('maps unified shell-status variants to rail rendering model', () => {
    const model = buildConnectivityBarViewModel({
      detectedStatus: 'online',
      shellStatus: {
        kind: 'error-failure',
        message: 'Shell startup encountered an error.',
        actions: ['retry', 'learn-more'],
        degradedSectionLabels: [],
      },
    });

    expect(model.status).toBe('offline');
    expect(model.showExpandedRail).toBe(true);
    expect(model.actions).toEqual(['retry', 'learn-more']);
  });

  it('keeps legacy connectivity-only path when shell status is absent', () => {
    const model = buildConnectivityBarViewModel({
      detectedStatus: 'online',
      statusOverride: 'syncing',
    });

    expect(model.status).toBe('syncing');
    expect(model.showExpandedRail).toBe(false);
    expect(model.message).toBe('Syncing data');
  });
});
