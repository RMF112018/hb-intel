/**
 * P9.1-05: Windows Autopilot registration and pre-provisioning service.
 *
 * Handles Autopilot device registration, deployment profile assignment,
 * profile status tracking, and technician-assisted pre-provisioning
 * as a first-class checkpoint-capable flow.
 *
 * Phase 9.1 provides stub implementations. Real Graph/Intune Autopilot
 * API calls will be added when the adapter is connected to live connectors.
 *
 * @module device-management/microsoft
 */

import type { IConnectionRegistryService } from '../../connection-registry-service.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AutopilotRegistrationState =
  | 'not-registered'
  | 'registered'
  | 'pending'
  | 'error'
  | 'unknown';

export type AutopilotProfileAssignmentState =
  | 'not-assigned'
  | 'assigned'
  | 'pending'
  | 'failed'
  | 'unknown';

export interface IAutopilotDevice {
  readonly autopilotDeviceId: string | null;
  readonly serialNumber: string;
  readonly registrationState: AutopilotRegistrationState;
  readonly profileAssignmentState: AutopilotProfileAssignmentState;
  readonly assignedProfileId: string | null;
  readonly assignedProfileName: string | null;
  readonly groupTag: string | null;
  readonly purchaseOrderId: string | null;
}

export interface IAutopilotReadinessResult {
  readonly ready: boolean;
  readonly connectorConfigured: boolean;
  readonly connectorHealthy: boolean;
  readonly error: string | null;
}

export interface IAutopilotRegistrationResult {
  readonly success: boolean;
  readonly autopilotDeviceId: string | null;
  readonly serialNumber: string;
  readonly error: string | null;
}

export interface IAutopilotProfileAssignmentResult {
  readonly success: boolean;
  readonly profileId: string;
  readonly deviceId: string;
  readonly error: string | null;
}

/**
 * Technician pre-provisioning context.
 *
 * The technician must physically interact with the device to complete
 * pre-provisioning. This is modeled as an external-event-wait checkpoint.
 */
export interface ITechnicianPreProvisioningContext {
  readonly deviceRunId: string;
  readonly serialNumber: string;
  readonly instructions: string;
  readonly expectedOutcome: string;
}

// ─── Interface ──────────────────────────────────────────────────────────────

export interface IMicrosoftAutopilotService {
  /** Check if the Autopilot connector is configured and healthy. */
  checkAutopilotReadiness(): Promise<IAutopilotReadinessResult>;

  /** Look up a device in Autopilot by serial number. */
  getAutopilotDevice(serialNumber: string): Promise<IAutopilotDevice>;

  /** Register a device with Autopilot. */
  registerAutopilotDevice(serialNumber: string, hardwareHash: string): Promise<IAutopilotRegistrationResult>;

  /** Assign a deployment profile to an Autopilot device. */
  assignAutopilotProfile(deviceId: string, profileId: string): Promise<IAutopilotProfileAssignmentResult>;

  /** Get the profile assignment status for a device. */
  getAutopilotProfileStatus(deviceId: string): Promise<AutopilotProfileAssignmentState>;

  /**
   * Build the technician pre-provisioning context for a device run.
   *
   * Returns the information needed to create a checkpoint that pauses
   * execution until the technician completes physical pre-provisioning.
   */
  buildTechnicianPreProvisioningContext(
    deviceRunId: string,
    serialNumber: string,
  ): ITechnicianPreProvisioningContext;

  /** Normalize a raw Autopilot status for SPFx display. */
  normalizeAutopilotStatus(rawStatus: string): AutopilotRegistrationState;
}

// ─── Implementation ─────────────────────────────────────────────────────────

export class MicrosoftAutopilotService implements IMicrosoftAutopilotService {
  constructor(private readonly connectionRegistry: IConnectionRegistryService) {}

  async checkAutopilotReadiness(): Promise<IAutopilotReadinessResult> {
    try {
      const conn = await this.connectionRegistry.getConnectionByClass('microsoft-autopilot');
      if (!conn) {
        return { ready: false, connectorConfigured: false, connectorHealthy: false, error: 'Autopilot connector not configured' };
      }
      return {
        ready: conn.healthStatus === 'healthy',
        connectorConfigured: true,
        connectorHealthy: conn.healthStatus === 'healthy',
        error: conn.healthStatus !== 'healthy' ? `Autopilot connector health: ${conn.healthStatus}` : null,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Autopilot readiness check failed';
      return { ready: false, connectorConfigured: false, connectorHealthy: false, error: message };
    }
  }

  async getAutopilotDevice(serialNumber: string): Promise<IAutopilotDevice> {
    // Stub: returns not-registered. Real impl will query Intune/Graph API.
    return {
      autopilotDeviceId: null,
      serialNumber,
      registrationState: 'not-registered',
      profileAssignmentState: 'not-assigned',
      assignedProfileId: null,
      assignedProfileName: null,
      groupTag: null,
      purchaseOrderId: null,
    };
  }

  async registerAutopilotDevice(serialNumber: string, _hardwareHash: string): Promise<IAutopilotRegistrationResult> {
    // Stub: succeeds. Real impl will call Intune/Graph Autopilot API.
    return {
      success: true,
      autopilotDeviceId: `autopilot-${serialNumber}`,
      serialNumber,
      error: null,
    };
  }

  async assignAutopilotProfile(deviceId: string, profileId: string): Promise<IAutopilotProfileAssignmentResult> {
    // Stub: succeeds. Real impl will call Intune/Graph API.
    return { success: true, profileId, deviceId, error: null };
  }

  async getAutopilotProfileStatus(_deviceId: string): Promise<AutopilotProfileAssignmentState> {
    // Stub: not-assigned. Real impl will query Intune/Graph API.
    return 'not-assigned';
  }

  buildTechnicianPreProvisioningContext(
    deviceRunId: string,
    serialNumber: string,
  ): ITechnicianPreProvisioningContext {
    return {
      deviceRunId,
      serialNumber,
      instructions: [
        `1. Power on the device (serial: ${serialNumber}).`,
        '2. Connect to the network (Ethernet recommended for Autopilot).',
        '3. Wait for the Autopilot deployment profile to apply.',
        '4. Complete the OOBE (Out-of-Box Experience) pre-provisioning flow.',
        '5. Verify the device reaches the enrollment status page (ESP).',
        '6. Once ESP completes or stabilizes, approve this checkpoint.',
      ].join('\n'),
      expectedOutcome: 'Device is enrolled in Intune with the Autopilot profile applied, ready for NinjaOne standardization.',
    };
  }

  normalizeAutopilotStatus(rawStatus: string): AutopilotRegistrationState {
    const lower = rawStatus.toLowerCase();
    if (lower === 'registered' || lower === 'assigned') return 'registered';
    if (lower === 'pending' || lower === 'registering') return 'pending';
    if (lower === 'error' || lower === 'failed') return 'error';
    if (lower === 'notregistered' || lower === 'not registered' || lower === 'not-registered') return 'not-registered';
    return 'unknown';
  }
}

// ─── Mock ───────────────────────────────────────────────────────────────────

export class MockMicrosoftAutopilotService implements IMicrosoftAutopilotService {
  async checkAutopilotReadiness(): Promise<IAutopilotReadinessResult> {
    return { ready: true, connectorConfigured: true, connectorHealthy: true, error: null };
  }

  async getAutopilotDevice(serialNumber: string): Promise<IAutopilotDevice> {
    return {
      autopilotDeviceId: `mock-ap-${serialNumber}`,
      serialNumber,
      registrationState: 'registered',
      profileAssignmentState: 'assigned',
      assignedProfileId: 'mock-profile-1',
      assignedProfileName: 'White-Glove Deployment Profile',
      groupTag: 'wg-deploy',
      purchaseOrderId: null,
    };
  }

  async registerAutopilotDevice(serialNumber: string, _hardwareHash: string): Promise<IAutopilotRegistrationResult> {
    return { success: true, autopilotDeviceId: `mock-ap-${serialNumber}`, serialNumber, error: null };
  }

  async assignAutopilotProfile(deviceId: string, profileId: string): Promise<IAutopilotProfileAssignmentResult> {
    return { success: true, profileId, deviceId, error: null };
  }

  async getAutopilotProfileStatus(_deviceId: string): Promise<AutopilotProfileAssignmentState> {
    return 'assigned';
  }

  buildTechnicianPreProvisioningContext(deviceRunId: string, serialNumber: string): ITechnicianPreProvisioningContext {
    return new MicrosoftAutopilotService(null as never).buildTechnicianPreProvisioningContext(deviceRunId, serialNumber);
  }

  normalizeAutopilotStatus(rawStatus: string): AutopilotRegistrationState {
    return new MicrosoftAutopilotService(null as never).normalizeAutopilotStatus(rawStatus);
  }
}
