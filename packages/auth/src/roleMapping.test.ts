import { describe, expect, it } from 'vitest';
import type { AdapterIdentityPayload } from './types.js';
import { mapIdentityToAppRoles } from './roleMapping.js';

function createIdentity(overrides?: Partial<AdapterIdentityPayload>): AdapterIdentityPayload {
  return {
    user: {
      type: 'internal',
      id: 'user-1',
      displayName: 'Test User',
      email: 'test@hbintel.local',
      roles: [
        {
          id: 'role-member',
          name: 'Member',
          grants: ['project:view'],
          source: 'manual',
        },
      ],
    },
    providerIdentityRef: 'test@hbintel.local',
    runtimeMode: 'pwa-msal',
    rawContext: {
      provider: 'pwa-msal',
      payload: {},
    },
    ...overrides,
  };
}

describe('mapIdentityToAppRoles', () => {
  it('keeps existing app role names by default', () => {
    const roles = mapIdentityToAppRoles(createIdentity());
    expect(roles).toEqual(['Member']);
  });

  it('maps SPFx site-admin hint to Administrator', () => {
    const roles = mapIdentityToAppRoles(
      createIdentity({
        runtimeMode: 'spfx-context',
        rawContext: {
          provider: 'spfx-context',
          payload: {
            isSiteAdmin: true,
          },
        },
      }),
    );

    expect(roles).toEqual(['Administrator', 'Member']);
  });

  it('adds default role when identity has no existing roles', () => {
    const roles = mapIdentityToAppRoles(
      createIdentity({
        user: {
          type: 'internal',
          id: 'user-2',
          displayName: 'No Role User',
          email: 'norole@hbintel.local',
          roles: [],
        },
      }),
    );

    expect(roles).toEqual(['Member']);
  });
});
