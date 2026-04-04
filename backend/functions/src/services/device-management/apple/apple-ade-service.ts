/**
 * P9.1-06: Apple Automated Device Enrollment service.
 *
 * Manages ADE device lookup, enrollment profile assignment,
 * and platform-specific posture validation for iPhone, iPad,
 * and macOS. Explicitly differentiates between the three platforms.
 *
 * @module device-management/apple
 */

import type { IConnectionRegistryService } from '../../connection-registry-service.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AppleDevicePlatform = 'iphone' | 'ipad' | 'macos';

export type AdeEnrollmentState =
  | 'not-enrolled'
  | 'enrolled'
  | 'pending'
  | 'error'
  | 'unknown';

export interface IAdeDevice {
  readonly serialNumber: string;
  readonly platform: AppleDevicePlatform;
  readonly enrollmentState: AdeEnrollmentState;
  readonly enrollmentProfileId: string | null;
  readonly enrollmentProfileName: string | null;
  readonly assignedToMdm: boolean;
  readonly deviceModel: string | null;
}

export interface IAdeReadinessResult {
  readonly ready: boolean;
  readonly connectorConfigured: boolean;
  readonly connectorHealthy: boolean;
  readonly error: string | null;
}

/**
 * Assignment posture validation result.
 *
 * Validates that a device is correctly assigned for its platform.
 * iPhone and iPad require supervised enrollment; macOS has different
 * management requirements.
 */
export interface IAdePostureValidation {
  readonly valid: boolean;
  readonly serialNumber: string;
  readonly platform: AppleDevicePlatform;
  readonly issues: readonly string[];
}

// ─── Interface ──────────────────────────────────────────────────────────────

export interface IAppleAdeService {
  /** Check if the ADE connector is configured and healthy. */
  checkAdeReadiness(): Promise<IAdeReadinessResult>;

  /** Look up a device in ADE by serial number. */
  getAdeDevice(serialNumber: string): Promise<IAdeDevice>;

  /** Get the enrollment profile assigned to a device. */
  getAdeEnrollmentProfile(serialNumber: string): Promise<string | null>;

  /**
   * Validate ADE assignment posture for a specific platform.
   *
   * iPhone and iPad require:
   * - ADE assignment to correct MDM server
   * - Supervised enrollment profile
   * - Valid ABM assignment
   *
   * macOS requires:
   * - ADE assignment to correct MDM server
   * - Enrollment profile (supervision optional for macOS)
   */
  validateAdeAssignmentPosture(serialNumber: string, platform: AppleDevicePlatform): Promise<IAdePostureValidation>;

  /** Normalize a raw ADE status for SPFx display. */
  normalizeAdeStatus(rawStatus: string): AdeEnrollmentState;
}

// ─── Implementation ─────────────────────────────────────────────────────────

export class AppleAdeService implements IAppleAdeService {
  constructor(private readonly connectionRegistry: IConnectionRegistryService) {}

  async checkAdeReadiness(): Promise<IAdeReadinessResult> {
    try {
      const conn = await this.connectionRegistry.getConnectionByClass('apple-ade');
      if (!conn) {
        return { ready: false, connectorConfigured: false, connectorHealthy: false, error: 'ADE connector not configured' };
      }
      const healthy = conn.healthStatus === 'healthy';
      return {
        ready: healthy,
        connectorConfigured: true,
        connectorHealthy: healthy,
        error: healthy ? null : `ADE connector health: ${conn.healthStatus}`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ADE readiness check failed';
      return { ready: false, connectorConfigured: false, connectorHealthy: false, error: message };
    }
  }

  async getAdeDevice(serialNumber: string): Promise<IAdeDevice> {
    // Stub: returns not-enrolled. Real impl will query ADE/Intune API.
    return {
      serialNumber,
      platform: 'iphone',
      enrollmentState: 'not-enrolled',
      enrollmentProfileId: null,
      enrollmentProfileName: null,
      assignedToMdm: false,
      deviceModel: null,
    };
  }

  async getAdeEnrollmentProfile(serialNumber: string): Promise<string | null> {
    const device = await this.getAdeDevice(serialNumber);
    return device.enrollmentProfileName;
  }

  async validateAdeAssignmentPosture(serialNumber: string, platform: AppleDevicePlatform): Promise<IAdePostureValidation> {
    const device = await this.getAdeDevice(serialNumber);
    const issues: string[] = [];

    if (!device.assignedToMdm) {
      issues.push('Device is not assigned to an MDM server in ADE');
    }

    if (!device.enrollmentProfileId) {
      issues.push('No enrollment profile assigned');
    }

    // Platform-specific validations
    if (platform === 'iphone' || platform === 'ipad') {
      // iPhone and iPad require supervised enrollment for white-glove
      if (device.enrollmentState === 'not-enrolled') {
        issues.push(`${platform === 'iphone' ? 'iPhone' : 'iPad'} requires ADE enrollment with supervised profile`);
      }
    } else if (platform === 'macos') {
      // macOS has different enrollment requirements
      if (device.enrollmentState === 'not-enrolled') {
        issues.push('macOS device requires ADE enrollment profile assignment');
      }
    }

    return {
      valid: issues.length === 0,
      serialNumber,
      platform,
      issues,
    };
  }

  normalizeAdeStatus(rawStatus: string): AdeEnrollmentState {
    const lower = rawStatus.toLowerCase();
    if (lower === 'enrolled' || lower === 'managed') return 'enrolled';
    if (lower === 'pending' || lower === 'enrolling') return 'pending';
    if (lower === 'error' || lower === 'failed') return 'error';
    if (lower === 'not enrolled' || lower === 'not-enrolled' || lower === 'notenrolled') return 'not-enrolled';
    return 'unknown';
  }
}

// ─── Mock ───────────────────────────────────────────────────────────────────

export class MockAppleAdeService implements IAppleAdeService {
  async checkAdeReadiness(): Promise<IAdeReadinessResult> {
    return { ready: true, connectorConfigured: true, connectorHealthy: true, error: null };
  }

  async getAdeDevice(serialNumber: string): Promise<IAdeDevice> {
    return {
      serialNumber,
      platform: 'iphone',
      enrollmentState: 'enrolled',
      enrollmentProfileId: 'mock-profile-1',
      enrollmentProfileName: 'HB Intel Supervised Profile',
      assignedToMdm: true,
      deviceModel: 'iPhone 15 Pro',
    };
  }

  async getAdeEnrollmentProfile(_serialNumber: string): Promise<string | null> {
    return 'HB Intel Supervised Profile';
  }

  async validateAdeAssignmentPosture(serialNumber: string, platform: AppleDevicePlatform): Promise<IAdePostureValidation> {
    return { valid: true, serialNumber, platform, issues: [] };
  }

  normalizeAdeStatus(rawStatus: string): AdeEnrollmentState {
    return new AppleAdeService(null as never).normalizeAdeStatus(rawStatus);
  }
}
