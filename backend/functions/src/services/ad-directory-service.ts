/**
 * P9-04: AD DS / on-prem identity execution boundary.
 *
 * This service defines the interface and mock for Active Directory Domain
 * Services operations that are authoritative for synced user lifecycle and
 * AD-synced group membership.
 *
 * The real implementation (LDAPS connector) will be wired in Prompt-05+ once
 * the connection registry provides UI-managed credentials. The mock provides
 * deterministic in-memory behavior for tests and local development.
 *
 * Pattern: matches graph-service.ts (interface + real + mock in one file).
 */

import {
  ADDSConnectivityError,
  ADDSAuthenticationError,
  ADDSPermissionError,
  IdentityNotFoundError,
  IdentityConflictError,
} from './hybrid-identity-errors.js';

// ─── Types ─────────────────────────────────────────────────────────────────────

/** AD DS user properties for create / update operations. */
export interface IADDSUserProperties {
  readonly samAccountName: string;
  readonly userPrincipalName: string;
  readonly displayName: string;
  readonly givenName?: string;
  readonly surname?: string;
  readonly department?: string;
  readonly title?: string;
  readonly mail?: string;
  /** Target OU distinguished name for create operations. */
  readonly targetOu?: string;
}

/** AD DS user record returned by read operations. */
export interface IADDSUserRecord {
  readonly distinguishedName: string;
  readonly samAccountName: string;
  readonly userPrincipalName: string;
  readonly displayName: string;
  readonly givenName: string | null;
  readonly surname: string | null;
  readonly department: string | null;
  readonly title: string | null;
  readonly mail: string | null;
  readonly enabled: boolean;
  readonly whenCreated: string | null;
  readonly whenChanged: string | null;
}

/** AD DS group record returned by read operations. */
export interface IADDSGroupRecord {
  readonly distinguishedName: string;
  readonly samAccountName: string;
  readonly displayName: string;
  readonly description: string | null;
  readonly members: readonly string[];
}

/** Connection config resolved from the connection registry at execution time. */
export interface IADDSConnectionConfig {
  readonly endpoint: string;
  readonly port: number;
  readonly useLdaps: boolean;
  readonly baseDn: string;
  readonly serviceAccountDn: string;
  readonly credential: string;
  readonly authMethod: 'password' | 'certificate';
}

// ─── Interface ─────────────────────────────────────────────────────────────────

/**
 * P9-04: AD DS adapter service interface.
 *
 * Each method is a platform-specific execution adapter — not a workflow
 * orchestrator or UI-state manager. Methods normalize AD DS operations into
 * typed requests/responses with explicit error handling.
 */
export interface IADDirectoryService {
  // ── User operations ───────────────────────────────────────────────────────

  /** Look up a user by sAMAccountName or UPN. Returns null if not found. */
  getUser(identifier: string): Promise<IADDSUserRecord | null>;

  /** Search users by display name prefix (top N results under base DN). */
  searchUsers(query: string, top?: number): Promise<readonly IADDSUserRecord[]>;

  /** Create a new user in the specified OU. */
  createUser(properties: IADDSUserProperties): Promise<IADDSUserRecord>;

  /** Update properties of an existing user. */
  updateUser(distinguishedName: string, properties: Partial<IADDSUserProperties>): Promise<void>;

  /** Enable or disable a user account. */
  setAccountEnabled(distinguishedName: string, enabled: boolean): Promise<void>;

  /** Delete a user from AD DS. */
  deleteUser(distinguishedName: string): Promise<void>;

  // ── Group operations ──────────────────────────────────────────────────────

  /** Look up a group by sAMAccountName or display name. Returns null if not found. */
  getGroup(identifier: string): Promise<IADDSGroupRecord | null>;

  /** Search groups by display name prefix. */
  searchGroups(query: string, top?: number): Promise<readonly IADDSGroupRecord[]>;

  /** Create a new security group in the specified OU. */
  createGroup(samAccountName: string, displayName: string, description: string, targetOu: string): Promise<IADDSGroupRecord>;

  /** Add members to a group by distinguished name. */
  addGroupMembers(groupDn: string, memberDns: string[]): Promise<void>;

  /** Remove members from a group by distinguished name. */
  removeGroupMembers(groupDn: string, memberDns: string[]): Promise<void>;

  /** Delete a group from AD DS. */
  deleteGroup(distinguishedName: string): Promise<void>;

  // ── Connection health ─────────────────────────────────────────────────────

  /** Test the connection to AD DS. Returns true if successful. */
  testConnection(): Promise<boolean>;
}

// ─── Stub real implementation ──────────────────────────────────────────────────

/**
 * P9-04: Stub real AD DS service.
 *
 * All methods throw ADDSConnectivityError until the connection registry and
 * LDAPS connector are wired in Prompt-05+. This ensures the service factory
 * can instantiate the real service without runtime errors at startup, while
 * making it clear that the connector is not yet functional.
 */
export class ADDirectoryService implements IADDirectoryService {
  async getUser(_identifier: string): Promise<IADDSUserRecord | null> {
    throw new ADDSConnectivityError('getUser', 'AD DS connector not yet implemented. Awaiting Prompt-05 connection registry wiring.');
  }
  async searchUsers(_query: string, _top?: number): Promise<readonly IADDSUserRecord[]> {
    throw new ADDSConnectivityError('searchUsers', 'AD DS connector not yet implemented.');
  }
  async createUser(_properties: IADDSUserProperties): Promise<IADDSUserRecord> {
    throw new ADDSConnectivityError('createUser', 'AD DS connector not yet implemented.');
  }
  async updateUser(_dn: string, _properties: Partial<IADDSUserProperties>): Promise<void> {
    throw new ADDSConnectivityError('updateUser', 'AD DS connector not yet implemented.');
  }
  async setAccountEnabled(_dn: string, _enabled: boolean): Promise<void> {
    throw new ADDSConnectivityError('setAccountEnabled', 'AD DS connector not yet implemented.');
  }
  async deleteUser(_dn: string): Promise<void> {
    throw new ADDSConnectivityError('deleteUser', 'AD DS connector not yet implemented.');
  }
  async getGroup(_identifier: string): Promise<IADDSGroupRecord | null> {
    throw new ADDSConnectivityError('getGroup', 'AD DS connector not yet implemented.');
  }
  async searchGroups(_query: string, _top?: number): Promise<readonly IADDSGroupRecord[]> {
    throw new ADDSConnectivityError('searchGroups', 'AD DS connector not yet implemented.');
  }
  async createGroup(_sam: string, _name: string, _desc: string, _ou: string): Promise<IADDSGroupRecord> {
    throw new ADDSConnectivityError('createGroup', 'AD DS connector not yet implemented.');
  }
  async addGroupMembers(_groupDn: string, _memberDns: string[]): Promise<void> {
    throw new ADDSConnectivityError('addGroupMembers', 'AD DS connector not yet implemented.');
  }
  async removeGroupMembers(_groupDn: string, _memberDns: string[]): Promise<void> {
    throw new ADDSConnectivityError('removeGroupMembers', 'AD DS connector not yet implemented.');
  }
  async deleteGroup(_dn: string): Promise<void> {
    throw new ADDSConnectivityError('deleteGroup', 'AD DS connector not yet implemented.');
  }
  async testConnection(): Promise<boolean> {
    throw new ADDSConnectivityError('testConnection', 'AD DS connector not yet implemented.');
  }
}

// ─── Mock ──────────────────────────────────────────────────────────────────────

/**
 * P9-04: In-memory mock AD DS service for tests and local mock mode.
 */
interface IMutableGroupEntry {
  distinguishedName: string;
  samAccountName: string;
  displayName: string;
  description: string | null;
  members: Set<string>;
}

export class MockADDirectoryService implements IADDirectoryService {
  private readonly users = new Map<string, IADDSUserRecord>();
  private readonly groups = new Map<string, IMutableGroupEntry>();
  private nextId = 1;

  /** Seed a mock user for testing. */
  seedUser(record: IADDSUserRecord): void {
    this.users.set(record.distinguishedName, record);
    this.users.set(record.samAccountName, record);
    this.users.set(record.userPrincipalName, record);
  }

  async getUser(identifier: string): Promise<IADDSUserRecord | null> {
    return this.users.get(identifier) ?? null;
  }

  async searchUsers(query: string, top = 25): Promise<readonly IADDSUserRecord[]> {
    const lowerQuery = query.toLowerCase();
    return [...new Set(this.users.values())]
      .filter((u) => u.displayName.toLowerCase().startsWith(lowerQuery))
      .slice(0, top);
  }

  async createUser(properties: IADDSUserProperties): Promise<IADDSUserRecord> {
    if (this.users.has(properties.samAccountName)) {
      throw new IdentityConflictError('createUser', `User ${properties.samAccountName} already exists`);
    }
    const dn = `CN=${properties.displayName},${properties.targetOu ?? 'OU=Users,DC=mock,DC=local'}`;
    const record: IADDSUserRecord = {
      distinguishedName: dn,
      samAccountName: properties.samAccountName,
      userPrincipalName: properties.userPrincipalName,
      displayName: properties.displayName,
      givenName: properties.givenName ?? null,
      surname: properties.surname ?? null,
      department: properties.department ?? null,
      title: properties.title ?? null,
      mail: properties.mail ?? null,
      enabled: true,
      whenCreated: new Date().toISOString(),
      whenChanged: new Date().toISOString(),
    };
    this.users.set(dn, record);
    this.users.set(properties.samAccountName, record);
    this.users.set(properties.userPrincipalName, record);
    return record;
  }

  async updateUser(distinguishedName: string, properties: Partial<IADDSUserProperties>): Promise<void> {
    const user = this.users.get(distinguishedName);
    if (!user) throw new IdentityNotFoundError('user', distinguishedName);
    const updated = { ...user, ...properties, whenChanged: new Date().toISOString() };
    this.users.set(distinguishedName, updated);
    this.users.set(user.samAccountName, updated);
    this.users.set(user.userPrincipalName, updated);
  }

  async setAccountEnabled(distinguishedName: string, enabled: boolean): Promise<void> {
    const user = this.users.get(distinguishedName);
    if (!user) throw new IdentityNotFoundError('user', distinguishedName);
    const updated = { ...user, enabled, whenChanged: new Date().toISOString() };
    this.users.set(distinguishedName, updated);
    this.users.set(user.samAccountName, updated);
    this.users.set(user.userPrincipalName, updated);
  }

  async deleteUser(distinguishedName: string): Promise<void> {
    const user = this.users.get(distinguishedName);
    if (!user) throw new IdentityNotFoundError('user', distinguishedName);
    this.users.delete(distinguishedName);
    this.users.delete(user.samAccountName);
    this.users.delete(user.userPrincipalName);
  }

  async getGroup(identifier: string): Promise<IADDSGroupRecord | null> {
    const entry = this.groups.get(identifier);
    if (!entry) return null;
    return { ...entry, members: [...entry.members] };
  }

  async searchGroups(query: string, top = 25): Promise<readonly IADDSGroupRecord[]> {
    const lowerQuery = query.toLowerCase();
    return [...this.groups.values()]
      .filter((g) => g.displayName.toLowerCase().startsWith(lowerQuery))
      .slice(0, top)
      .map((g) => ({ ...g, members: [...g.members] }));
  }

  async createGroup(samAccountName: string, displayName: string, description: string, targetOu: string): Promise<IADDSGroupRecord> {
    if (this.groups.has(samAccountName)) {
      throw new IdentityConflictError('createGroup', `Group ${samAccountName} already exists`);
    }
    const dn = `CN=${displayName},${targetOu}`;
    const entry = { distinguishedName: dn, samAccountName, displayName, description, members: new Set<string>() };
    this.groups.set(samAccountName, entry);
    this.groups.set(dn, entry);
    return { ...entry, members: [] };
  }

  async addGroupMembers(groupDn: string, memberDns: string[]): Promise<void> {
    const group = this.groups.get(groupDn);
    if (!group) throw new IdentityNotFoundError('group', groupDn);
    for (const dn of memberDns) group.members.add(dn);
  }

  async removeGroupMembers(groupDn: string, memberDns: string[]): Promise<void> {
    const group = this.groups.get(groupDn);
    if (!group) throw new IdentityNotFoundError('group', groupDn);
    for (const dn of memberDns) group.members.delete(dn);
  }

  async deleteGroup(distinguishedName: string): Promise<void> {
    const group = this.groups.get(distinguishedName);
    if (!group) throw new IdentityNotFoundError('group', distinguishedName);
    this.groups.delete(distinguishedName);
    this.groups.delete(group.samAccountName);
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
}
