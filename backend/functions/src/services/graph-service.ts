import { DefaultAzureCredential } from '@azure/identity';

/**
 * P9-04: Authority type for identity objects.
 * Drives source-of-authority routing in the hybrid identity control lane.
 */
export type IdentityAuthorityType = 'ad-ds' | 'entra' | 'unknown';

/**
 * P9-04: Graph user profile for hybrid identity operations.
 */
export interface IGraphUserProfile {
  readonly id: string;
  readonly displayName: string;
  readonly userPrincipalName: string;
  readonly mail: string | null;
  readonly jobTitle: string | null;
  readonly department: string | null;
  readonly accountEnabled: boolean;
  readonly onPremisesSyncEnabled: boolean | null;
  readonly onPremisesLastSyncDateTime: string | null;
  readonly onPremisesSamAccountName: string | null;
  readonly authorityType: IdentityAuthorityType;
}

/**
 * P9-04: Graph group profile for hybrid identity operations.
 */
export interface IGraphGroupProfile {
  readonly id: string;
  readonly displayName: string;
  readonly description: string | null;
  readonly securityEnabled: boolean;
  readonly mailEnabled: boolean;
  readonly onPremisesSyncEnabled: boolean | null;
  readonly onPremisesLastSyncDateTime: string | null;
  readonly authorityType: IdentityAuthorityType;
}

/**
 * P9-04: Organization sync metadata.
 */
export interface IOrganizationSyncInfo {
  readonly onPremisesLastSyncDateTime: string | null;
  readonly onPremisesSyncEnabled: boolean | null;
}

/**
 * W0-G1-T02 + P9-04: Microsoft Graph service interface.
 *
 * Provisioning-era methods (group lifecycle, site access) remain unchanged.
 * Phase 9 adds cloud-side identity visibility, user read/search, sync-status,
 * and cloud-only user/group lifecycle methods.
 *
 * Pattern: interface + real + mock in one file.
 */
export interface IGraphService {
  // ── Provisioning-era methods (unchanged) ──────────────────────────────────

  createSecurityGroup(displayName: string, description: string): Promise<string>;
  addGroupMembers(groupId: string, memberUpns: string[]): Promise<void>;
  getGroupByDisplayName(displayName: string): Promise<string | null>;
  deleteSecurityGroup(groupId: string): Promise<void>;
  grantSiteAccess(siteId: string, appId: string, role?: 'read' | 'write' | 'fullcontrol'): Promise<void>;

  // ── P9-04: User read / search / sync-status ──────────────────────────────

  /** Look up a user by UPN or object ID. Returns null if not found. */
  getUser(userIdentifier: string): Promise<IGraphUserProfile | null>;

  /** Search users by display name prefix (top N results). */
  searchUsers(query: string, top?: number): Promise<readonly IGraphUserProfile[]>;

  // ── P9-04: Group read / search / sync-status ─────────────────────────────

  /** Get a group by object ID. Returns null if not found. */
  getGroup(groupId: string): Promise<IGraphGroupProfile | null>;

  /** Search groups by display name prefix (top N results). */
  searchGroups(query: string, top?: number): Promise<readonly IGraphGroupProfile[]>;

  /** List members of a group (UPNs). */
  getGroupMembers(groupId: string): Promise<readonly string[]>;

  // ── P9-04: Sync visibility ────────────────────────────────────────────────

  /** Get organization-level sync metadata. */
  getOrganizationSyncInfo(): Promise<IOrganizationSyncInfo>;

  // ── P9-04: Cloud-only user lifecycle ──────────────────────────────────────

  /** Create a cloud-only user. Returns the new user's object ID. */
  createCloudUser(properties: ICloudUserCreateRequest): Promise<string>;

  /** Update properties of a cloud-only user. */
  updateCloudUser(userId: string, properties: ICloudUserUpdateRequest): Promise<void>;

  /** Set accountEnabled to true or false for a cloud-only user. */
  setCloudUserAccountEnabled(userId: string, enabled: boolean): Promise<void>;

  /** Delete a cloud-only user (moves to soft-delete). */
  deleteCloudUser(userId: string): Promise<void>;

  // ── P9-04: Cloud-only group membership mutations ─────────────────────────

  /** Remove members from a group by UPN. Silently skips non-members. */
  removeGroupMembers(groupId: string, memberUpns: string[]): Promise<void>;
}

/** Properties for creating a cloud-only user via Graph. */
export interface ICloudUserCreateRequest {
  readonly displayName: string;
  readonly userPrincipalName: string;
  readonly mailNickname: string;
  readonly accountEnabled: boolean;
  readonly passwordProfile: {
    readonly password: string;
    readonly forceChangePasswordNextSignIn: boolean;
  };
  readonly jobTitle?: string;
  readonly department?: string;
}

/** Properties for updating a cloud-only user via Graph. */
export interface ICloudUserUpdateRequest {
  readonly displayName?: string;
  readonly jobTitle?: string;
  readonly department?: string;
  readonly mail?: string;
}

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';

/**
 * Permission-gate error thrown when Group.ReadWrite.All has not been
 * confirmed by IT. This is an operational prerequisite, not a code defect.
 */
export class GraphPermissionNotConfirmedError extends Error {
  constructor(operation: string) {
    super(
      `[GraphService] ${operation}: Group.ReadWrite.All permission not confirmed. ` +
      'Set GRAPH_GROUP_PERMISSION_CONFIRMED=true in environment settings after IT grants the permission. ' +
      'See IT-Department-Setup-Guide.md §8.4 for the approval process.'
    );
    this.name = 'GraphPermissionNotConfirmedError';
  }
}

/** P9-04: Derive authority type from sync-enabled flag. */
function resolveAuthorityType(onPremisesSyncEnabled: boolean | null | undefined): IdentityAuthorityType {
  if (onPremisesSyncEnabled === true) return 'ad-ds';
  if (onPremisesSyncEnabled === false) return 'entra';
  return 'unknown';
}

/** P9-04: Select fields for user queries. */
const USER_SELECT = 'id,displayName,userPrincipalName,mail,jobTitle,department,accountEnabled,onPremisesSyncEnabled,onPremisesLastSyncDateTime,onPremisesSamAccountName';
/** P9-04: Select fields for group queries. */
const GROUP_SELECT = 'id,displayName,description,securityEnabled,mailEnabled,onPremisesSyncEnabled,onPremisesLastSyncDateTime';

/**
 * W0-G1-T02 + P9-04: Real Graph service — Microsoft Graph API integration.
 *
 * Provisioning-era methods remain gated behind GRAPH_GROUP_PERMISSION_CONFIRMED.
 * Phase 9 identity methods share the same gate until the connection registry
 * migration is complete (Prompt-05+).
 */
export class GraphService implements IGraphService {
  private readonly credential = new DefaultAzureCredential();

  private assertPermissionConfirmed(operation: string): void {
    if (process.env.GRAPH_GROUP_PERMISSION_CONFIRMED !== 'true') {
      throw new GraphPermissionNotConfirmedError(operation);
    }
  }

  private async getAccessToken(): Promise<string> {
    const tokenResponse = await this.credential.getToken(GRAPH_SCOPE);
    return tokenResponse.token;
  }

  private async graphFetch(path: string, init?: RequestInit): Promise<Response> {
    const token = await this.getAccessToken();
    const response = await fetch(`${GRAPH_BASE}${path}`, {
      ...init,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
    return response;
  }

  // ── Provisioning-era methods (unchanged) ──────────────────────────────────

  async createSecurityGroup(displayName: string, description: string): Promise<string> {
    this.assertPermissionConfirmed('createSecurityGroup');

    const mailNickname = displayName.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    const response = await this.graphFetch('/groups', {
      method: 'POST',
      body: JSON.stringify({
        displayName,
        description,
        mailEnabled: false,
        mailNickname,
        securityEnabled: true,
        groupTypes: [],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[GraphService] createSecurityGroup failed (${response.status}): ${body}`);
    }

    const result = await response.json() as { id: string };
    return result.id;
  }

  async addGroupMembers(groupId: string, memberUpns: string[]): Promise<void> {
    this.assertPermissionConfirmed('addGroupMembers');

    for (const upn of memberUpns) {
      const userResponse = await this.graphFetch(`/users/${encodeURIComponent(upn)}?$select=id`);
      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          console.warn(`[GraphService] User not found: ${upn} — skipping`);
          continue;
        }
        throw new Error(`[GraphService] Failed to resolve user ${upn} (${userResponse.status})`);
      }
      const user = await userResponse.json() as { id: string };

      const addResponse = await this.graphFetch(`/groups/${groupId}/members/$ref`, {
        method: 'POST',
        body: JSON.stringify({
          '@odata.id': `${GRAPH_BASE}/directoryObjects/${user.id}`,
        }),
      });

      if (!addResponse.ok && addResponse.status !== 409) {
        throw new Error(
          `[GraphService] Failed to add ${upn} to group ${groupId} (${addResponse.status})`
        );
      }
    }
  }

  async getGroupByDisplayName(displayName: string): Promise<string | null> {
    this.assertPermissionConfirmed('getGroupByDisplayName');

    const filter = encodeURIComponent(`displayName eq '${displayName}'`);
    const response = await this.graphFetch(`/groups?$filter=${filter}&$select=id`);

    if (!response.ok) {
      throw new Error(`[GraphService] getGroupByDisplayName failed (${response.status})`);
    }

    const result = await response.json() as { value: Array<{ id: string }> };
    return result.value.length > 0 ? result.value[0].id : null;
  }

  async deleteSecurityGroup(groupId: string): Promise<void> {
    this.assertPermissionConfirmed('deleteSecurityGroup');

    const response = await this.graphFetch(`/groups/${groupId}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 404) {
      const body = await response.text();
      throw new Error(`[GraphService] deleteSecurityGroup failed (${response.status}): ${body}`);
    }
  }

  async grantSiteAccess(
    siteId: string,
    appId: string,
    role: 'read' | 'write' | 'fullcontrol' = 'write',
  ): Promise<void> {
    this.assertPermissionConfirmed('grantSiteAccess');

    const response = await this.graphFetch(`/sites/${siteId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({
        roles: [role],
        grantedToIdentities: [
          {
            application: {
              id: appId,
              displayName: 'HB Intel Provisioning Function',
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `[GraphService] grantSiteAccess failed for site ${siteId} (${response.status}): ${body}`
      );
    }
  }

  // ── P9-04: User read / search ─────────────────────────────────────────────

  async getUser(userIdentifier: string): Promise<IGraphUserProfile | null> {
    this.assertPermissionConfirmed('getUser');

    const response = await this.graphFetch(
      `/users/${encodeURIComponent(userIdentifier)}?$select=${USER_SELECT}`
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`[GraphService] getUser failed (${response.status})`);
    }

    const raw = await response.json() as Record<string, unknown>;
    return mapRawToUserProfile(raw);
  }

  async searchUsers(query: string, top = 25): Promise<readonly IGraphUserProfile[]> {
    this.assertPermissionConfirmed('searchUsers');

    const filter = encodeURIComponent(`startsWith(displayName,'${query}') or startsWith(userPrincipalName,'${query}')`);
    const response = await this.graphFetch(
      `/users?$filter=${filter}&$select=${USER_SELECT}&$top=${top}&$orderby=displayName`
    );
    if (!response.ok) {
      throw new Error(`[GraphService] searchUsers failed (${response.status})`);
    }

    const result = await response.json() as { value: Array<Record<string, unknown>> };
    return result.value.map(mapRawToUserProfile);
  }

  // ── P9-04: Group read / search ────────────────────────────────────────────

  async getGroup(groupId: string): Promise<IGraphGroupProfile | null> {
    this.assertPermissionConfirmed('getGroup');

    const response = await this.graphFetch(`/groups/${groupId}?$select=${GROUP_SELECT}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`[GraphService] getGroup failed (${response.status})`);
    }

    const raw = await response.json() as Record<string, unknown>;
    return mapRawToGroupProfile(raw);
  }

  async searchGroups(query: string, top = 25): Promise<readonly IGraphGroupProfile[]> {
    this.assertPermissionConfirmed('searchGroups');

    const filter = encodeURIComponent(`startsWith(displayName,'${query}')`);
    const response = await this.graphFetch(
      `/groups?$filter=${filter}&$select=${GROUP_SELECT}&$top=${top}&$orderby=displayName`
    );
    if (!response.ok) {
      throw new Error(`[GraphService] searchGroups failed (${response.status})`);
    }

    const result = await response.json() as { value: Array<Record<string, unknown>> };
    return result.value.map(mapRawToGroupProfile);
  }

  async getGroupMembers(groupId: string): Promise<readonly string[]> {
    this.assertPermissionConfirmed('getGroupMembers');

    const response = await this.graphFetch(
      `/groups/${groupId}/members?$select=userPrincipalName&$top=999`
    );
    if (!response.ok) {
      throw new Error(`[GraphService] getGroupMembers failed (${response.status})`);
    }

    const result = await response.json() as { value: Array<{ userPrincipalName?: string }> };
    return result.value
      .map((m) => m.userPrincipalName)
      .filter((upn): upn is string => !!upn);
  }

  // ── P9-04: Sync visibility ────────────────────────────────────────────────

  async getOrganizationSyncInfo(): Promise<IOrganizationSyncInfo> {
    this.assertPermissionConfirmed('getOrganizationSyncInfo');

    const response = await this.graphFetch(
      '/organization?$select=onPremisesLastSyncDateTime,onPremisesSyncEnabled'
    );
    if (!response.ok) {
      throw new Error(`[GraphService] getOrganizationSyncInfo failed (${response.status})`);
    }

    const result = await response.json() as { value: Array<Record<string, unknown>> };
    const org = result.value[0] ?? {};
    return {
      onPremisesLastSyncDateTime: (org.onPremisesLastSyncDateTime as string) ?? null,
      onPremisesSyncEnabled: (org.onPremisesSyncEnabled as boolean) ?? null,
    };
  }

  // ── P9-04: Cloud-only user lifecycle ──────────────────────────────────────

  async createCloudUser(properties: ICloudUserCreateRequest): Promise<string> {
    this.assertPermissionConfirmed('createCloudUser');

    const response = await this.graphFetch('/users', {
      method: 'POST',
      body: JSON.stringify(properties),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[GraphService] createCloudUser failed (${response.status}): ${body}`);
    }

    const result = await response.json() as { id: string };
    return result.id;
  }

  async updateCloudUser(userId: string, properties: ICloudUserUpdateRequest): Promise<void> {
    this.assertPermissionConfirmed('updateCloudUser');

    const response = await this.graphFetch(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(properties),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[GraphService] updateCloudUser failed (${response.status}): ${body}`);
    }
  }

  async setCloudUserAccountEnabled(userId: string, enabled: boolean): Promise<void> {
    this.assertPermissionConfirmed('setCloudUserAccountEnabled');

    const response = await this.graphFetch(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ accountEnabled: enabled }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[GraphService] setCloudUserAccountEnabled failed (${response.status}): ${body}`);
    }
  }

  async deleteCloudUser(userId: string): Promise<void> {
    this.assertPermissionConfirmed('deleteCloudUser');

    const response = await this.graphFetch(`/users/${userId}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 404) {
      const body = await response.text();
      throw new Error(`[GraphService] deleteCloudUser failed (${response.status}): ${body}`);
    }
  }

  // ── P9-04: Cloud-only group membership mutations ──────────────────────────

  async removeGroupMembers(groupId: string, memberUpns: string[]): Promise<void> {
    this.assertPermissionConfirmed('removeGroupMembers');

    for (const upn of memberUpns) {
      const userResponse = await this.graphFetch(`/users/${encodeURIComponent(upn)}?$select=id`);
      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          console.warn(`[GraphService] User not found: ${upn} — skipping removal`);
          continue;
        }
        throw new Error(`[GraphService] Failed to resolve user ${upn} (${userResponse.status})`);
      }
      const user = await userResponse.json() as { id: string };

      const removeResponse = await this.graphFetch(`/groups/${groupId}/members/${user.id}/$ref`, {
        method: 'DELETE',
      });

      // 404 = not a member — idempotent
      if (!removeResponse.ok && removeResponse.status !== 404) {
        throw new Error(
          `[GraphService] Failed to remove ${upn} from group ${groupId} (${removeResponse.status})`
        );
      }
    }
  }
}

/** Map raw Graph API response to typed user profile. */
function mapRawToUserProfile(raw: Record<string, unknown>): IGraphUserProfile {
  const syncEnabled = raw.onPremisesSyncEnabled as boolean | null ?? null;
  return {
    id: raw.id as string,
    displayName: raw.displayName as string,
    userPrincipalName: raw.userPrincipalName as string,
    mail: (raw.mail as string) ?? null,
    jobTitle: (raw.jobTitle as string) ?? null,
    department: (raw.department as string) ?? null,
    accountEnabled: (raw.accountEnabled as boolean) ?? true,
    onPremisesSyncEnabled: syncEnabled,
    onPremisesLastSyncDateTime: (raw.onPremisesLastSyncDateTime as string) ?? null,
    onPremisesSamAccountName: (raw.onPremisesSamAccountName as string) ?? null,
    authorityType: resolveAuthorityType(syncEnabled),
  };
}

/** Map raw Graph API response to typed group profile. */
function mapRawToGroupProfile(raw: Record<string, unknown>): IGraphGroupProfile {
  const syncEnabled = raw.onPremisesSyncEnabled as boolean | null ?? null;
  return {
    id: raw.id as string,
    displayName: raw.displayName as string,
    description: (raw.description as string) ?? null,
    securityEnabled: (raw.securityEnabled as boolean) ?? false,
    mailEnabled: (raw.mailEnabled as boolean) ?? false,
    onPremisesSyncEnabled: syncEnabled,
    onPremisesLastSyncDateTime: (raw.onPremisesLastSyncDateTime as string) ?? null,
    authorityType: resolveAuthorityType(syncEnabled),
  };
}

/**
 * W0-G1-T02 + P9-04: Functional in-memory mock for tests and local mock mode.
 * Supports both provisioning-era and Phase 9 identity methods.
 */
export class MockGraphService implements IGraphService {
  private readonly groups = new Map<string, { id: string; displayName: string; description: string; members: Set<string>; syncEnabled: boolean | null }>();
  private readonly users = new Map<string, IGraphUserProfile>();
  private nextId = 1;
  private readonly siteGrants = new Map<string, { appId: string; role: string }>();

  // ── Provisioning-era methods ──────────────────────────────────────────────

  async createSecurityGroup(displayName: string, _description: string): Promise<string> {
    const id = `mock-group-${this.nextId++}`;
    this.groups.set(displayName, { id, displayName, description: _description, members: new Set(), syncEnabled: false });
    console.log(`[MockGraph] Created security group "${displayName}" → ${id}`);
    return id;
  }

  async addGroupMembers(groupId: string, memberUpns: string[]): Promise<void> {
    const entry = [...this.groups.values()].find((g) => g.id === groupId);
    if (!entry) {
      throw new Error(`[MockGraph] Group ${groupId} not found`);
    }
    for (const upn of memberUpns) {
      entry.members.add(upn);
    }
    console.log(`[MockGraph] Added ${memberUpns.length} members to group ${groupId}`);
  }

  async getGroupByDisplayName(displayName: string): Promise<string | null> {
    const entry = this.groups.get(displayName);
    return entry?.id ?? null;
  }

  async deleteSecurityGroup(groupId: string): Promise<void> {
    const entry = [...this.groups.entries()].find(([, g]) => g.id === groupId);
    if (entry) {
      this.groups.delete(entry[0]);
      console.log(`[MockGraph] Deleted security group ${groupId}`);
    }
  }

  async grantSiteAccess(siteId: string, appId: string, role: 'read' | 'write' | 'fullcontrol' = 'write'): Promise<void> {
    this.siteGrants.set(siteId, { appId, role });
    console.log(`[MockGraph] Granted ${role} access to app ${appId} on site ${siteId}`);
  }

  // ── P9-04: User read / search ─────────────────────────────────────────────

  /** Seed a mock user for testing. */
  seedUser(profile: IGraphUserProfile): void {
    this.users.set(profile.userPrincipalName, profile);
    this.users.set(profile.id, profile);
  }

  /** Seed a mock group with sync-enabled flag for testing. */
  seedGroup(id: string, displayName: string, syncEnabled: boolean, members: string[] = []): void {
    this.groups.set(displayName, {
      id,
      displayName,
      description: '',
      members: new Set(members),
      syncEnabled,
    });
  }

  async getUser(userIdentifier: string): Promise<IGraphUserProfile | null> {
    return this.users.get(userIdentifier) ?? null;
  }

  async searchUsers(query: string, top = 25): Promise<readonly IGraphUserProfile[]> {
    const lowerQuery = query.toLowerCase();
    return [...new Set(this.users.values())]
      .filter((u) =>
        u.displayName.toLowerCase().startsWith(lowerQuery) ||
        u.userPrincipalName.toLowerCase().startsWith(lowerQuery)
      )
      .slice(0, top);
  }

  // ── P9-04: Group read / search ────────────────────────────────────────────

  async getGroup(groupId: string): Promise<IGraphGroupProfile | null> {
    const entry = [...this.groups.values()].find((g) => g.id === groupId);
    if (!entry) return null;
    return {
      id: entry.id,
      displayName: entry.displayName,
      description: entry.description,
      securityEnabled: true,
      mailEnabled: false,
      onPremisesSyncEnabled: entry.syncEnabled,
      onPremisesLastSyncDateTime: null,
      authorityType: resolveAuthorityType(entry.syncEnabled),
    };
  }

  async searchGroups(query: string, top = 25): Promise<readonly IGraphGroupProfile[]> {
    const lowerQuery = query.toLowerCase();
    return [...this.groups.values()]
      .filter((g) => g.displayName.toLowerCase().startsWith(lowerQuery))
      .slice(0, top)
      .map((g) => ({
        id: g.id,
        displayName: g.displayName,
        description: g.description,
        securityEnabled: true,
        mailEnabled: false,
        onPremisesSyncEnabled: g.syncEnabled,
        onPremisesLastSyncDateTime: null,
        authorityType: resolveAuthorityType(g.syncEnabled),
      }));
  }

  async getGroupMembers(groupId: string): Promise<readonly string[]> {
    const entry = [...this.groups.values()].find((g) => g.id === groupId);
    if (!entry) throw new Error(`[MockGraph] Group ${groupId} not found`);
    return [...entry.members];
  }

  // ── P9-04: Sync visibility ────────────────────────────────────────────────

  async getOrganizationSyncInfo(): Promise<IOrganizationSyncInfo> {
    return {
      onPremisesLastSyncDateTime: new Date().toISOString(),
      onPremisesSyncEnabled: true,
    };
  }

  // ── P9-04: Cloud-only user lifecycle ──────────────────────────────────────

  async createCloudUser(properties: ICloudUserCreateRequest): Promise<string> {
    const id = `mock-user-${this.nextId++}`;
    const profile: IGraphUserProfile = {
      id,
      displayName: properties.displayName,
      userPrincipalName: properties.userPrincipalName,
      mail: null,
      jobTitle: properties.jobTitle ?? null,
      department: properties.department ?? null,
      accountEnabled: properties.accountEnabled,
      onPremisesSyncEnabled: false,
      onPremisesLastSyncDateTime: null,
      onPremisesSamAccountName: null,
      authorityType: 'entra',
    };
    this.users.set(properties.userPrincipalName, profile);
    this.users.set(id, profile);
    return id;
  }

  async updateCloudUser(userId: string, properties: ICloudUserUpdateRequest): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error(`[MockGraph] User ${userId} not found`);
    const updated = { ...user, ...properties };
    this.users.set(userId, updated);
    this.users.set(user.userPrincipalName, updated);
  }

  async setCloudUserAccountEnabled(userId: string, enabled: boolean): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error(`[MockGraph] User ${userId} not found`);
    const updated = { ...user, accountEnabled: enabled };
    this.users.set(userId, updated);
    this.users.set(user.userPrincipalName, updated);
  }

  async deleteCloudUser(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.delete(userId);
      this.users.delete(user.userPrincipalName);
    }
  }

  // ── P9-04: Cloud-only group membership mutations ──────────────────────────

  async removeGroupMembers(groupId: string, memberUpns: string[]): Promise<void> {
    const entry = [...this.groups.values()].find((g) => g.id === groupId);
    if (!entry) throw new Error(`[MockGraph] Group ${groupId} not found`);
    for (const upn of memberUpns) {
      entry.members.delete(upn);
    }
  }
}
