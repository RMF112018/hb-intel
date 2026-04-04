/**
 * P9.1-05: Microsoft identity and group resolution for device deployment.
 *
 * Resolves employee identity and device group assignments in Entra ID
 * for white-glove device deployment. Delegates to IGraphService for
 * actual Graph API calls — does not duplicate Graph logic.
 *
 * @module device-management/microsoft
 */

import type { IGraphService, IGraphUserProfile } from '../../graph-service.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface IIdentityReadinessResult {
  readonly ready: boolean;
  readonly employeeFound: boolean;
  readonly accountEnabled: boolean;
  readonly error: string | null;
}

export interface IDeviceGroupResult {
  readonly groupId: string;
  readonly groupName: string;
  readonly created: boolean;
}

// ─── Interface ──────────────────────────────────────────────────────────────

export interface IMicrosoftIdentityService {
  /** Resolve an employee's Entra identity for device assignment. */
  resolveEmployeeIdentity(upn: string): Promise<IGraphUserProfile | null>;

  /** Find or create a device deployment group. */
  resolveDeviceGroup(groupName: string): Promise<IDeviceGroupResult>;

  /** Add a device object to an Entra group. */
  addDeviceToGroup(groupId: string, deviceObjectId: string): Promise<void>;

  /** Validate that an employee identity is ready for device deployment. */
  validateIdentityReadiness(employeeUpn: string): Promise<IIdentityReadinessResult>;
}

// ─── Implementation ─────────────────────────────────────────────────────────

export class MicrosoftIdentityService implements IMicrosoftIdentityService {
  constructor(private readonly graph: IGraphService) {}

  async resolveEmployeeIdentity(upn: string): Promise<IGraphUserProfile | null> {
    return this.graph.getUser(upn);
  }

  async resolveDeviceGroup(groupName: string): Promise<IDeviceGroupResult> {
    const existingId = await this.graph.getGroupByDisplayName(groupName);
    if (existingId) {
      return { groupId: existingId, groupName, created: false };
    }
    const createdId = await this.graph.createSecurityGroup(
      groupName,
      `White-glove device deployment group: ${groupName}`,
    );
    return { groupId: createdId, groupName, created: true };
  }

  async addDeviceToGroup(groupId: string, deviceObjectId: string): Promise<void> {
    await this.graph.addGroupMembers(groupId, [deviceObjectId]);
  }

  async validateIdentityReadiness(employeeUpn: string): Promise<IIdentityReadinessResult> {
    try {
      const user = await this.graph.getUser(employeeUpn);
      if (!user) {
        return { ready: false, employeeFound: false, accountEnabled: false, error: `Employee ${employeeUpn} not found in Entra ID` };
      }
      if (!user.accountEnabled) {
        return { ready: false, employeeFound: true, accountEnabled: false, error: `Employee ${employeeUpn} account is disabled` };
      }
      return { ready: true, employeeFound: true, accountEnabled: true, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Identity readiness check failed';
      return { ready: false, employeeFound: false, accountEnabled: false, error: message };
    }
  }
}

// ─── Mock ───────────────────────────────────────────────────────────────────

export class MockMicrosoftIdentityService implements IMicrosoftIdentityService {
  private readonly users = new Map<string, IGraphUserProfile>();
  private readonly groups = new Map<string, { id: string; displayName: string }>();

  async resolveEmployeeIdentity(upn: string): Promise<IGraphUserProfile | null> {
    return this.users.get(upn) ?? null;
  }

  async resolveDeviceGroup(groupName: string): Promise<IDeviceGroupResult> {
    const existing = this.groups.get(groupName);
    if (existing) return { groupId: existing.id, groupName: existing.displayName, created: false };
    const id = `mock-group-${crypto.randomUUID()}`;
    this.groups.set(groupName, { id, displayName: groupName });
    return { groupId: id, groupName, created: true };
  }

  async addDeviceToGroup(_groupId: string, _deviceObjectId: string): Promise<void> {
    // No-op in mock
  }

  async validateIdentityReadiness(_employeeUpn: string): Promise<IIdentityReadinessResult> {
    return { ready: true, employeeFound: true, accountEnabled: true, error: null };
  }
}
