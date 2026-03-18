import { DefaultAzureCredential } from '@azure/identity';

/**
 * W0-G1-T02: Microsoft Graph service interface for Entra ID group management.
 * Pattern: matches msal-obo-service.ts (interface + real + mock in one file).
 * Traceability: docs/reference/provisioning/entra-id-group-model.md
 */
export interface IGraphService {
  /**
   * Creates a new Entra ID security group.
   * Returns the group object ID.
   */
  createSecurityGroup(displayName: string, description: string): Promise<string>;

  /**
   * Adds members to an existing Entra ID security group by UPN.
   * Silently skips UPNs that are already members.
   */
  addGroupMembers(groupId: string, memberUpns: string[]): Promise<void>;

  /**
   * Finds an Entra ID group by its exact display name.
   * Returns the group object ID, or null if not found.
   */
  getGroupByDisplayName(displayName: string): Promise<string | null>;

  /**
   * Grants the specified application (Managed Identity) per-site access
   * to a SharePoint site using the Sites.Selected permission model.
   *
   * This is the automation extension point for future saga Step 0.
   * Currently called manually via tools/grant-site-access.sh; can be
   * wired into provisioning automation when Option A1 is approved.
   *
   * @param siteId - SharePoint site ID (GUID)
   * @param appId - Managed Identity application (client) ID
   * @param role - Permission role: 'read', 'write', or 'fullcontrol' (default: 'write')
   */
  grantSiteAccess(siteId: string, appId: string, role?: 'read' | 'write' | 'fullcontrol'): Promise<void>;
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

/**
 * W0-G1-T02: Real Graph service — Microsoft Graph API integration for
 * Entra ID security group lifecycle (create, populate, lookup).
 *
 * All operations are gated behind GRAPH_GROUP_PERMISSION_CONFIRMED env var.
 * When not set to 'true', operations throw GraphPermissionNotConfirmedError
 * with a clear IT setup guide reference.
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
      // Resolve UPN to user directory object ID
      const userResponse = await this.graphFetch(`/users/${encodeURIComponent(upn)}?$select=id`);
      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          console.warn(`[GraphService] User not found: ${upn} — skipping`);
          continue;
        }
        throw new Error(`[GraphService] Failed to resolve user ${upn} (${userResponse.status})`);
      }
      const user = await userResponse.json() as { id: string };

      // Add user as member (409 = already a member — idempotent)
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
}

/**
 * W0-G1-T02: Functional in-memory mock for tests and local mock mode.
 * Groups are stored in a Map keyed by display name → { id, members }.
 */
export class MockGraphService implements IGraphService {
  private readonly groups = new Map<string, { id: string; members: Set<string> }>();
  private nextId = 1;

  async createSecurityGroup(displayName: string, _description: string): Promise<string> {
    const id = `mock-group-${this.nextId++}`;
    this.groups.set(displayName, { id, members: new Set() });
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

  private readonly siteGrants = new Map<string, { appId: string; role: string }>();

  async grantSiteAccess(siteId: string, appId: string, role: 'read' | 'write' | 'fullcontrol' = 'write'): Promise<void> {
    this.siteGrants.set(siteId, { appId, role });
    console.log(`[MockGraph] Granted ${role} access to app ${appId} on site ${siteId}`);
  }
}
