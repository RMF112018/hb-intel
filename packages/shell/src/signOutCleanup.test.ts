import { describe, expect, it } from 'vitest';
import { runShellSignOutCleanup } from './signOutCleanup.js';

describe('runShellSignOutCleanup', () => {
  it('runs cleanup phases in required order', async () => {
    const sequence: string[] = [];

    await runShellSignOutCleanup(
      {
        clearAuthSession: () => {
          sequence.push('auth');
        },
        clearRedirectMemory: () => {
          sequence.push('redirect');
        },
        clearShellBootstrapState: () => {
          sequence.push('bootstrap');
        },
        clearEnvironmentArtifacts: () => {
          sequence.push('env');
        },
        clearFeatureCachesByTier: (tier) => {
          sequence.push(`cache:${tier}`);
        },
      },
      ['strict', 'preserve-session'],
    );

    expect(sequence).toEqual([
      'auth',
      'redirect',
      'bootstrap',
      'env',
      'cache:strict',
      'cache:preserve-session',
    ]);
  });
});
