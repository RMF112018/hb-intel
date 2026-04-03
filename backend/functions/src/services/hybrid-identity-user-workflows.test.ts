import { describe, it, expect, beforeEach } from 'vitest';
import {
  executeUserSearch,
  executeUserRead,
  executeUserCreateADDS,
  executeUserCreateCloud,
  executeUserUpdateADDS,
  executeUserUpdateCloud,
  executeUserToggleADDS,
  executeUserToggleCloud,
  executeUserDeleteADDS,
  executeUserDeleteCloud,
} from './hybrid-identity-user-workflows.js';
import { MockGraphService } from './graph-service.js';
import type { IGraphUserProfile } from './graph-service.js';
import { MockADDirectoryService } from './ad-directory-service.js';
import { MockConnectionRegistryService } from './connection-registry-service.js';
import type { IAdminControlPlaneServiceContainer } from '../hosts/admin-control-plane/service-factory.js';

// ─── Test fixtures ─────────────────────────────────────────────────────────────

const ACTOR = { upn: 'admin@hb.com', oid: 'oid-001', displayName: 'Admin User' };

const MOCK_AD_USER: IGraphUserProfile = {
  id: 'user-001',
  displayName: 'Jane Doe',
  userPrincipalName: 'jane.doe@hb.com',
  mail: 'jane.doe@hb.com',
  jobTitle: 'Estimator',
  department: 'Estimating',
  accountEnabled: true,
  onPremisesSyncEnabled: true,
  onPremisesLastSyncDateTime: '2026-04-01T12:00:00Z',
  onPremisesSamAccountName: 'jane.doe',
  authorityType: 'ad-ds',
};

function createMockServices(): IAdminControlPlaneServiceContainer {
  const graph = new MockGraphService();
  const adDirectory = new MockADDirectoryService();
  const connectionRegistry = new MockConnectionRegistryService();

  return {
    graph,
    adDirectory,
    connectionRegistry,
    // Stub remaining services — not used by user workflows directly
    tableStorage: {} as never,
    managedIdentity: {} as never,
    runService: {} as never,
    adapterRegistry: {} as never,
    configService: {} as never,
    auditService: {} as never,
    evidenceService: {} as never,
    preflightService: {} as never,
    actorContextResolver: {} as never,
    bindingService: {} as never,
  };
}

async function setupHealthyConnectors(services: IAdminControlPlaneServiceContainer) {
  await services.connectionRegistry.upsertConnection('graph-1', {
    connectorClass: 'graph-identity',
    displayName: 'Graph',
    config: {},
  }, 'setup');
  await services.connectionRegistry.testConnection('graph-1', 'setup');

  await services.connectionRegistry.upsertConnection('ads-1', {
    connectorClass: 'ad-ds',
    displayName: 'AD DS',
    config: {},
  }, 'setup');
  await services.connectionRegistry.testConnection('ads-1', 'setup');
}

// ─── U-01: Search users ────────────────────────────────────────────────────────

describe('executeUserSearch', () => {
  it('returns matching users on success', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);
    (services.graph as MockGraphService).seedUser(MOCK_AD_USER);

    const { result, audit } = await executeUserSearch(
      { query: 'Jane', actor: ACTOR, correlationId: 'corr-001' },
      services,
    );

    expect(result.success).toBe(true);
    expect(result.actionId).toBe('user:search');
    expect(result.authorityUsed).toBe('visibility');
    expect((result.data as { count: number }).count).toBe(1);
    expect(audit.success).toBe(true);
    expect(audit.connectorUsed).toBe('graph-identity');
  });

  it('fails when graph connector is not configured', async () => {
    const services = createMockServices();
    // No connectors configured

    const { result } = await executeUserSearch(
      { query: 'Jane', actor: ACTOR, correlationId: 'corr-002' },
      services,
    );

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('CONNECTION_NOT_CONFIGURED');
  });
});

// ─── U-02: Read user ───────────────────────────────────────────────────────────

describe('executeUserRead', () => {
  it('returns user profile on success', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);
    (services.graph as MockGraphService).seedUser(MOCK_AD_USER);

    const { result } = await executeUserRead(
      { userIdentifier: 'jane.doe@hb.com', actor: ACTOR, correlationId: 'corr-003' },
      services,
    );

    expect(result.success).toBe(true);
    expect((result.data as { user: IGraphUserProfile }).user.displayName).toBe('Jane Doe');
  });

  it('returns NOT_FOUND for unknown user', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);

    const { result } = await executeUserRead(
      { userIdentifier: 'unknown@hb.com', actor: ACTOR, correlationId: 'corr-004' },
      services,
    );

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('NOT_FOUND');
  });

  it('fails validation for empty identifier', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);

    const { result } = await executeUserRead(
      { userIdentifier: '', actor: ACTOR, correlationId: 'corr-005' },
      services,
    );

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('VALIDATION');
  });
});

// ─── U-03: Create user (AD DS) ─────────────────────────────────────────────────

describe('executeUserCreateADDS', () => {
  it('creates user and returns sync-pending state', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);

    const { result, audit } = await executeUserCreateADDS({
      samAccountName: 'jane.doe',
      userPrincipalName: 'jane.doe@corp.hb.com',
      displayName: 'Jane Doe',
      targetOu: 'OU=Users,DC=corp,DC=hb,DC=com',
      actor: ACTOR,
      correlationId: 'corr-006',
    }, services);

    expect(result.success).toBe(true);
    expect(result.authorityUsed).toBe('ad-ds');
    expect(result.syncState?.syncPending).toBe(true);
    expect(audit.connectorUsed).toBe('ad-ds');
    expect(audit.syncState?.syncPending).toBe(true);
  });

  it('fails validation for invalid sAMAccountName', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);

    const { result } = await executeUserCreateADDS({
      samAccountName: 'invalid@name!',
      userPrincipalName: 'test@corp.hb.com',
      displayName: 'Test',
      targetOu: 'OU=Users,DC=corp,DC=hb,DC=com',
      actor: ACTOR,
      correlationId: 'corr-007',
    }, services);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('VALIDATION');
  });

  it('fails when AD DS connector is not healthy', async () => {
    const services = createMockServices();
    // Only configure graph, not AD DS
    await services.connectionRegistry.upsertConnection('graph-1', { connectorClass: 'graph-identity', displayName: 'Graph', config: {} }, 'setup');
    await services.connectionRegistry.testConnection('graph-1', 'setup');

    const { result } = await executeUserCreateADDS({
      samAccountName: 'jane.doe',
      userPrincipalName: 'jane.doe@corp.hb.com',
      displayName: 'Jane Doe',
      targetOu: 'OU=Users,DC=corp,DC=hb,DC=com',
      actor: ACTOR,
      correlationId: 'corr-008',
    }, services);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('CONNECTION_NOT_CONFIGURED');
  });
});

// ─── U-04: Create cloud-only user ──────────────────────────────────────────────

describe('executeUserCreateCloud', () => {
  it('creates cloud user and returns user ID', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);

    const { result } = await executeUserCreateCloud({
      displayName: 'Cloud User',
      userPrincipalName: 'cloud@hb.com',
      mailNickname: 'cloud',
      password: 'P@ss1234!',
      forceChangePassword: true,
      actor: ACTOR,
      correlationId: 'corr-009',
    }, services);

    expect(result.success).toBe(true);
    expect(result.authorityUsed).toBe('entra');
    expect((result.data as { userId: string }).userId).toBeTruthy();
    expect(result.syncState).toBeUndefined();
  });
});

// ─── U-05: Update user (AD DS) ─────────────────────────────────────────────────

describe('executeUserUpdateADDS', () => {
  it('updates properties and returns sync-pending', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);
    await (services.adDirectory as MockADDirectoryService).createUser({
      samAccountName: 'jane',
      userPrincipalName: 'jane@corp.hb.com',
      displayName: 'Jane',
      targetOu: 'OU=Users,DC=corp',
    });
    const user = await services.adDirectory.getUser('jane');

    const { result } = await executeUserUpdateADDS({
      distinguishedName: user!.distinguishedName,
      properties: { department: 'Engineering' },
      actor: ACTOR,
      correlationId: 'corr-010',
    }, services);

    expect(result.success).toBe(true);
    expect(result.syncState?.syncPending).toBe(true);
  });

  it('fails validation for disallowed property', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);

    const { result } = await executeUserUpdateADDS({
      distinguishedName: 'CN=Jane,OU=Users,DC=corp',
      properties: { password: 'nope' },
      actor: ACTOR,
      correlationId: 'corr-011',
    }, services);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('VALIDATION');
  });
});

// ─── U-06: Update cloud-only user ──────────────────────────────────────────────

describe('executeUserUpdateCloud', () => {
  it('updates cloud user properties', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);
    const userId = await (services.graph as MockGraphService).createCloudUser({
      displayName: 'Cloud User',
      userPrincipalName: 'cloud@hb.com',
      mailNickname: 'cloud',
      accountEnabled: true,
      passwordProfile: { password: 'P@ss1234!', forceChangePasswordNextSignIn: true },
    });

    const { result } = await executeUserUpdateCloud({
      userId,
      properties: { jobTitle: 'Manager' },
      actor: ACTOR,
      correlationId: 'corr-012',
    }, services);

    expect(result.success).toBe(true);
  });
});

// ─── U-07/U-09: Toggle AD DS ───────────────────────────────────────────────────

describe('executeUserToggleADDS', () => {
  it('disables AD DS user', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);
    const created = await (services.adDirectory as MockADDirectoryService).createUser({
      samAccountName: 'jane',
      userPrincipalName: 'jane@corp.hb.com',
      displayName: 'Jane',
    });

    const { result } = await executeUserToggleADDS({
      distinguishedName: created.distinguishedName,
      enabled: false,
      actor: ACTOR,
      correlationId: 'corr-013',
    }, services);

    expect(result.success).toBe(true);
    expect(result.actionId).toBe('user:disable-adds');
    expect(result.syncState?.syncPending).toBe(true);
  });

  it('enables AD DS user', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);
    const created = await (services.adDirectory as MockADDirectoryService).createUser({
      samAccountName: 'jane',
      userPrincipalName: 'jane@corp.hb.com',
      displayName: 'Jane',
    });

    const { result } = await executeUserToggleADDS({
      distinguishedName: created.distinguishedName,
      enabled: true,
      actor: ACTOR,
      correlationId: 'corr-014',
    }, services);

    expect(result.success).toBe(true);
    expect(result.actionId).toBe('user:enable-adds');
  });
});

// ─── U-08/U-10: Toggle cloud ───────────────────────────────────────────────────

describe('executeUserToggleCloud', () => {
  it('disables cloud user', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);
    const userId = await (services.graph as MockGraphService).createCloudUser({
      displayName: 'Cloud', userPrincipalName: 'cloud@hb.com', mailNickname: 'cloud',
      accountEnabled: true, passwordProfile: { password: 'P@ss!', forceChangePasswordNextSignIn: true },
    });

    const { result } = await executeUserToggleCloud({
      userId, enabled: false, actor: ACTOR, correlationId: 'corr-015',
    }, services);

    expect(result.success).toBe(true);
    expect(result.actionId).toBe('user:disable-cloud');
  });
});

// ─── U-11: Delete user (AD DS) ─────────────────────────────────────────────────

describe('executeUserDeleteADDS', () => {
  it('deletes AD DS user with confirmation token', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);
    const created = await (services.adDirectory as MockADDirectoryService).createUser({
      samAccountName: 'jane',
      userPrincipalName: 'jane@corp.hb.com',
      displayName: 'Jane',
    });

    const { result, audit } = await executeUserDeleteADDS({
      distinguishedName: created.distinguishedName,
      confirmationToken: 'CONFIRM-DELETE',
      actor: ACTOR,
      correlationId: 'corr-016',
    }, services);

    expect(result.success).toBe(true);
    expect(result.syncState?.syncPending).toBe(true);
    expect(audit.evidenceSummary).toContain('deleted from AD DS');
  });

  it('fails without confirmation token', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);

    const { result } = await executeUserDeleteADDS({
      distinguishedName: 'CN=Jane,OU=Users,DC=corp',
      confirmationToken: '',
      actor: ACTOR,
      correlationId: 'corr-017',
    }, services);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('VALIDATION');
  });
});

// ─── U-12: Delete cloud-only user ──────────────────────────────────────────────

describe('executeUserDeleteCloud', () => {
  it('deletes cloud user with confirmation token', async () => {
    const services = createMockServices();
    await setupHealthyConnectors(services);
    const userId = await (services.graph as MockGraphService).createCloudUser({
      displayName: 'Cloud', userPrincipalName: 'cloud@hb.com', mailNickname: 'cloud',
      accountEnabled: true, passwordProfile: { password: 'P@ss!', forceChangePasswordNextSignIn: true },
    });

    const { result, audit } = await executeUserDeleteCloud({
      userId, confirmationToken: 'CONFIRM-DELETE', actor: ACTOR, correlationId: 'corr-018',
    }, services);

    expect(result.success).toBe(true);
    expect(audit.evidenceSummary).toContain('soft-delete');
  });
});
