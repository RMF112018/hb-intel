/**
 * P9.1-06: Apple MDM (APNs + Intune MDM) enrollment and supervised state.
 *
 * Manages Apple device enrollment status, supervised state detection,
 * and MDM profile assignment. Critical for iOS/iPadOS devices that
 * require supervised enrollment for full management capabilities.
 *
 * @module device-management/apple
 */

import type { IConnectionRegistryService } from '../../connection-registry-service.js';
import type { AppleDevicePlatform } from './apple-ade-service.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AppleMdmEnrollmentState =
  | 'not-enrolled'
  | 'enrolled'
  | 'pending'
  | 'error'
  | 'unknown';

export type SupervisedState =
  | 'supervised'
  | 'unsupervised'
  | 'unknown';

export interface IAppleMdmDeviceStatus {
  readonly serialNumber: string;
  readonly platform: AppleDevicePlatform;
  readonly enrollmentState: AppleMdmEnrollmentState;
  readonly supervisedState: SupervisedState;
  readonly mdmProfileId: string | null;
  readonly mdmProfileName: string | null;
  readonly lastCheckIn: string | null;
  readonly complianceState: 'compliant' | 'non-compliant' | 'not-evaluated' | 'unknown';
}

export interface IApnReadinessResult {
  readonly ready: boolean;
  readonly connectorConfigured: boolean;
  readonly connectorHealthy: boolean;
  readonly error: string | null;
}

// ─── Interface ──────────────────────────────────────────────────────────────

export interface IAppleMdmService {
  /** Check if the APNs connector is configured and healthy. */
  checkApnReadiness(): Promise<IApnReadinessResult>;

  /** Get device enrollment status with platform differentiation. */
  getDeviceEnrollmentStatus(serialNumber: string, platform: AppleDevicePlatform): Promise<IAppleMdmDeviceStatus>;

  /** Get the supervised state of a device (critical for iOS/iPadOS). */
  getSupervisedState(serialNumber: string): Promise<SupervisedState>;

  /** Get the MDM profile assigned to a device. */
  getDeviceMdmProfile(serialNumber: string): Promise<string | null>;

  /** Normalize a raw Apple MDM status for SPFx display. */
  normalizeAppleMdmStatus(rawStatus: string): AppleMdmEnrollmentState;
}

// ─── Implementation ─────────────────────────────────────────────────────────

export class AppleMdmService implements IAppleMdmService {
  constructor(private readonly connectionRegistry: IConnectionRegistryService) {}

  async checkApnReadiness(): Promise<IApnReadinessResult> {
    try {
      const conn = await this.connectionRegistry.getConnectionByClass('apple-apns');
      if (!conn) {
        return { ready: false, connectorConfigured: false, connectorHealthy: false, error: 'APNs connector not configured' };
      }
      const healthy = conn.healthStatus === 'healthy';
      return {
        ready: healthy,
        connectorConfigured: true,
        connectorHealthy: healthy,
        error: healthy ? null : `APNs connector health: ${conn.healthStatus}`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'APNs readiness check failed';
      return { ready: false, connectorConfigured: false, connectorHealthy: false, error: message };
    }
  }

  async getDeviceEnrollmentStatus(serialNumber: string, platform: AppleDevicePlatform): Promise<IAppleMdmDeviceStatus> {
    // Stub: returns not-enrolled. Real impl will query Intune MDM API.
    return {
      serialNumber,
      platform,
      enrollmentState: 'not-enrolled',
      supervisedState: 'unknown',
      mdmProfileId: null,
      mdmProfileName: null,
      lastCheckIn: null,
      complianceState: 'not-evaluated',
    };
  }

  async getSupervisedState(_serialNumber: string): Promise<SupervisedState> {
    // Stub: unknown. Real impl will query Intune MDM for supervised flag.
    return 'unknown';
  }

  async getDeviceMdmProfile(_serialNumber: string): Promise<string | null> {
    // Stub: null. Real impl will query Intune MDM.
    return null;
  }

  normalizeAppleMdmStatus(rawStatus: string): AppleMdmEnrollmentState {
    const lower = rawStatus.toLowerCase();
    if (lower === 'enrolled' || lower === 'managed') return 'enrolled';
    if (lower === 'pending' || lower === 'enrolling') return 'pending';
    if (lower === 'error' || lower === 'failed') return 'error';
    if (lower === 'not enrolled' || lower === 'not-enrolled' || lower === 'notenrolled') return 'not-enrolled';
    return 'unknown';
  }
}

// ─── Mock ───────────────────────────────────────────────────────────────────

export class MockAppleMdmService implements IAppleMdmService {
  async checkApnReadiness(): Promise<IApnReadinessResult> {
    return { ready: true, connectorConfigured: true, connectorHealthy: true, error: null };
  }

  async getDeviceEnrollmentStatus(serialNumber: string, platform: AppleDevicePlatform): Promise<IAppleMdmDeviceStatus> {
    return {
      serialNumber,
      platform,
      enrollmentState: 'enrolled',
      supervisedState: (platform === 'iphone' || platform === 'ipad') ? 'supervised' : 'unsupervised',
      mdmProfileId: 'mock-mdm-profile-1',
      mdmProfileName: 'HB Intel MDM Profile',
      lastCheckIn: new Date().toISOString(),
      complianceState: 'compliant',
    };
  }

  async getSupervisedState(_serialNumber: string): Promise<SupervisedState> {
    return 'supervised';
  }

  async getDeviceMdmProfile(_serialNumber: string): Promise<string | null> {
    return 'HB Intel MDM Profile';
  }

  normalizeAppleMdmStatus(rawStatus: string): AppleMdmEnrollmentState {
    return new AppleMdmService(null as never).normalizeAppleMdmStatus(rawStatus);
  }
}
