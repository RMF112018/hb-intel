/**
 * P9.1-06: Apple Business Manager device assignment and readiness.
 *
 * Manages ABM device assignment lookup, server token validation,
 * and MDM server assignment status. Backend-only — SPFx never calls
 * ABM directly.
 *
 * @module device-management/apple
 */

import type { IConnectionRegistryService } from '../../connection-registry-service.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AbmAssignmentState =
  | 'assigned'
  | 'not-assigned'
  | 'pending'
  | 'removed'
  | 'unknown';

export interface IAbmDeviceAssignment {
  readonly serialNumber: string;
  readonly assignmentState: AbmAssignmentState;
  readonly assignedMdmServer: string | null;
  readonly assignedMdmServerId: string | null;
  readonly profileAssignedDate: string | null;
  readonly deviceModel: string | null;
  readonly color: string | null;
}

export interface IAbmReadinessResult {
  readonly ready: boolean;
  readonly connectorConfigured: boolean;
  readonly connectorHealthy: boolean;
  readonly tokenValid: boolean;
  readonly error: string | null;
}

export interface IAbmTokenValidationResult {
  readonly valid: boolean;
  readonly expiresAt: string | null;
  readonly error: string | null;
}

// ─── Interface ──────────────────────────────────────────────────────────────

export interface IAppleAbmService {
  /** Check if the ABM connector is configured and healthy. */
  checkAbmReadiness(): Promise<IAbmReadinessResult>;

  /** Look up a device's ABM assignment by serial number. */
  getDeviceAssignment(serialNumber: string): Promise<IAbmDeviceAssignment>;

  /** Validate the ABM server token. */
  validateAbmToken(): Promise<IAbmTokenValidationResult>;

  /** Get the MDM server assignment profile for a device. */
  getAssignmentProfile(serialNumber: string): Promise<string | null>;

  /** Normalize a raw ABM status for SPFx display. */
  normalizeAbmStatus(rawStatus: string): AbmAssignmentState;
}

// ─── Implementation ─────────────────────────────────────────────────────────

export class AppleAbmService implements IAppleAbmService {
  constructor(private readonly connectionRegistry: IConnectionRegistryService) {}

  async checkAbmReadiness(): Promise<IAbmReadinessResult> {
    try {
      const conn = await this.connectionRegistry.getConnectionByClass('apple-abm');
      if (!conn) {
        return { ready: false, connectorConfigured: false, connectorHealthy: false, tokenValid: false, error: 'ABM connector not configured' };
      }
      const healthy = conn.healthStatus === 'healthy';
      return {
        ready: healthy,
        connectorConfigured: true,
        connectorHealthy: healthy,
        tokenValid: healthy, // Stub: assume token is valid if connector is healthy
        error: healthy ? null : `ABM connector health: ${conn.healthStatus}`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ABM readiness check failed';
      return { ready: false, connectorConfigured: false, connectorHealthy: false, tokenValid: false, error: message };
    }
  }

  async getDeviceAssignment(serialNumber: string): Promise<IAbmDeviceAssignment> {
    // Stub: returns not-assigned. Real impl will query ABM API.
    return {
      serialNumber,
      assignmentState: 'not-assigned',
      assignedMdmServer: null,
      assignedMdmServerId: null,
      profileAssignedDate: null,
      deviceModel: null,
      color: null,
    };
  }

  async validateAbmToken(): Promise<IAbmTokenValidationResult> {
    // Stub: token valid. Real impl will validate the server token expiry.
    return { valid: true, expiresAt: null, error: null };
  }

  async getAssignmentProfile(serialNumber: string): Promise<string | null> {
    const assignment = await this.getDeviceAssignment(serialNumber);
    return assignment.assignedMdmServer;
  }

  normalizeAbmStatus(rawStatus: string): AbmAssignmentState {
    const lower = rawStatus.toLowerCase();
    if (lower === 'assigned' || lower === 'active') return 'assigned';
    if (lower === 'pending' || lower === 'assigning') return 'pending';
    if (lower === 'removed' || lower === 'disowned') return 'removed';
    if (lower === 'not assigned' || lower === 'not-assigned' || lower === 'notassigned') return 'not-assigned';
    return 'unknown';
  }
}

// ─── Mock ───────────────────────────────────────────────────────────────────

export class MockAppleAbmService implements IAppleAbmService {
  async checkAbmReadiness(): Promise<IAbmReadinessResult> {
    return { ready: true, connectorConfigured: true, connectorHealthy: true, tokenValid: true, error: null };
  }

  async getDeviceAssignment(serialNumber: string): Promise<IAbmDeviceAssignment> {
    return {
      serialNumber,
      assignmentState: 'assigned',
      assignedMdmServer: 'HB Intel Intune MDM',
      assignedMdmServerId: 'mock-mdm-server-1',
      profileAssignedDate: new Date().toISOString(),
      deviceModel: 'iPhone 15 Pro',
      color: 'Natural Titanium',
    };
  }

  async validateAbmToken(): Promise<IAbmTokenValidationResult> {
    return { valid: true, expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(), error: null };
  }

  async getAssignmentProfile(_serialNumber: string): Promise<string | null> {
    return 'HB Intel Intune MDM';
  }

  normalizeAbmStatus(rawStatus: string): AbmAssignmentState {
    return new AppleAbmService(null as never).normalizeAbmStatus(rawStatus);
  }
}
