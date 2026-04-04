/**
 * P9.1-05: Microsoft Intune enrollment and assignment service.
 *
 * Handles Intune device enrollment status, compliance policy assignment,
 * configuration profile assignment, and status normalization.
 * Backend-only — SPFx never calls Intune directly.
 *
 * Phase 9.1 provides stub implementations. Real Graph/Intune API calls
 * will be added when the adapter is connected to live connectors.
 *
 * @module device-management/microsoft
 */

import type { IConnectionRegistryService } from '../../connection-registry-service.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export type IntuneEnrollmentState =
  | 'not-enrolled'
  | 'enrolled'
  | 'pending'
  | 'error'
  | 'unknown';

export type IntuneComplianceState =
  | 'compliant'
  | 'non-compliant'
  | 'not-evaluated'
  | 'unknown';

export interface IIntuneDeviceStatus {
  readonly deviceId: string | null;
  readonly serialNumber: string;
  readonly enrollmentState: IntuneEnrollmentState;
  readonly complianceState: IntuneComplianceState;
  readonly managedDeviceName: string | null;
  readonly lastSyncDateTime: string | null;
}

export interface IIntuneReadinessResult {
  readonly ready: boolean;
  readonly connectorConfigured: boolean;
  readonly connectorHealthy: boolean;
  readonly error: string | null;
}

export interface IIntunePolicyAssignmentResult {
  readonly success: boolean;
  readonly policyId: string;
  readonly deviceId: string;
  readonly error: string | null;
}

// ─── Interface ──────────────────────────────────────────────────────────────

export interface IMicrosoftIntuneService {
  /** Check if the Intune connector is configured and healthy. */
  checkIntuneReadiness(): Promise<IIntuneReadinessResult>;

  /** Get the enrollment status of a device by serial number. */
  getDeviceEnrollmentStatus(serialNumber: string): Promise<IIntuneDeviceStatus>;

  /** Assign a compliance policy to a device. */
  assignCompliancePolicy(deviceId: string, policyId: string): Promise<IIntunePolicyAssignmentResult>;

  /** Assign a configuration profile to a device. */
  assignConfigurationProfile(deviceId: string, profileId: string): Promise<IIntunePolicyAssignmentResult>;

  /** Get the current compliance state of a device. */
  getDeviceComplianceState(deviceId: string): Promise<IntuneComplianceState>;

  /** Normalize a raw Intune status for SPFx display. */
  normalizeIntuneStatus(rawStatus: string): IntuneEnrollmentState;
}

// ─── Implementation ─────────────────────────────────────────────────────────

export class MicrosoftIntuneService implements IMicrosoftIntuneService {
  constructor(private readonly connectionRegistry: IConnectionRegistryService) {}

  async checkIntuneReadiness(): Promise<IIntuneReadinessResult> {
    try {
      const conn = await this.connectionRegistry.getConnectionByClass('microsoft-intune');
      if (!conn) {
        return { ready: false, connectorConfigured: false, connectorHealthy: false, error: 'Intune connector not configured' };
      }
      return {
        ready: conn.healthStatus === 'healthy',
        connectorConfigured: true,
        connectorHealthy: conn.healthStatus === 'healthy',
        error: conn.healthStatus !== 'healthy' ? `Intune connector health: ${conn.healthStatus}` : null,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Intune readiness check failed';
      return { ready: false, connectorConfigured: false, connectorHealthy: false, error: message };
    }
  }

  async getDeviceEnrollmentStatus(serialNumber: string): Promise<IIntuneDeviceStatus> {
    // Stub: returns not-enrolled. Real impl will query Graph/Intune API.
    return {
      deviceId: null,
      serialNumber,
      enrollmentState: 'not-enrolled',
      complianceState: 'not-evaluated',
      managedDeviceName: null,
      lastSyncDateTime: null,
    };
  }

  async assignCompliancePolicy(deviceId: string, policyId: string): Promise<IIntunePolicyAssignmentResult> {
    // Stub: succeeds. Real impl will call Intune API.
    return { success: true, policyId, deviceId, error: null };
  }

  async assignConfigurationProfile(deviceId: string, profileId: string): Promise<IIntunePolicyAssignmentResult> {
    // Stub: succeeds. Real impl will call Intune API.
    return { success: true, policyId: profileId, deviceId, error: null };
  }

  async getDeviceComplianceState(_deviceId: string): Promise<IntuneComplianceState> {
    // Stub: not evaluated. Real impl will query Intune API.
    return 'not-evaluated';
  }

  normalizeIntuneStatus(rawStatus: string): IntuneEnrollmentState {
    const lower = rawStatus.toLowerCase();
    if (lower === 'enrolled' || lower === 'managed') return 'enrolled';
    if (lower === 'pending' || lower === 'enrolling') return 'pending';
    if (lower === 'error' || lower === 'failed') return 'error';
    if (lower === 'notenrolled' || lower === 'not enrolled' || lower === 'not-enrolled') return 'not-enrolled';
    return 'unknown';
  }
}

// ─── Mock ───────────────────────────────────────────────────────────────────

export class MockMicrosoftIntuneService implements IMicrosoftIntuneService {
  async checkIntuneReadiness(): Promise<IIntuneReadinessResult> {
    return { ready: true, connectorConfigured: true, connectorHealthy: true, error: null };
  }

  async getDeviceEnrollmentStatus(serialNumber: string): Promise<IIntuneDeviceStatus> {
    return {
      deviceId: `mock-device-${serialNumber}`,
      serialNumber,
      enrollmentState: 'enrolled',
      complianceState: 'compliant',
      managedDeviceName: `MOCK-${serialNumber}`,
      lastSyncDateTime: new Date().toISOString(),
    };
  }

  async assignCompliancePolicy(deviceId: string, policyId: string): Promise<IIntunePolicyAssignmentResult> {
    return { success: true, policyId, deviceId, error: null };
  }

  async assignConfigurationProfile(deviceId: string, profileId: string): Promise<IIntunePolicyAssignmentResult> {
    return { success: true, policyId: profileId, deviceId, error: null };
  }

  async getDeviceComplianceState(_deviceId: string): Promise<IntuneComplianceState> {
    return 'compliant';
  }

  normalizeIntuneStatus(rawStatus: string): IntuneEnrollmentState {
    return new MicrosoftIntuneService(null as never).normalizeIntuneStatus(rawStatus);
  }
}
