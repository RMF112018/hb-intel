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
}

/**
 * W0-G1-T02: Real Graph service scaffold — requires Group.ReadWrite.All consent (G2 / T05).
 * All methods throw until real Graph API integration is implemented.
 */
export class GraphService implements IGraphService {
  private readonly _credential = new DefaultAzureCredential();

  async createSecurityGroup(_displayName: string, _description: string): Promise<string> {
    void this._credential;
    throw new Error(
      'GraphService.createSecurityGroup is a G2 scaffold — real Graph API calls pending T05 Group.ReadWrite.All confirmation'
    );
  }

  async addGroupMembers(_groupId: string, _memberUpns: string[]): Promise<void> {
    throw new Error(
      'GraphService.addGroupMembers is a G2 scaffold — real Graph API calls pending T05 Group.ReadWrite.All confirmation'
    );
  }

  async getGroupByDisplayName(_displayName: string): Promise<string | null> {
    throw new Error(
      'GraphService.getGroupByDisplayName is a G2 scaffold — real Graph API calls pending T05 Group.ReadWrite.All confirmation'
    );
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
}
