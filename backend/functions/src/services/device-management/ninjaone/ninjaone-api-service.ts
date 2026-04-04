/**
 * P9.1-07: NinjaOne API connectivity and readiness service.
 *
 * Manages OAuth/API connection validation, organization access verification,
 * and connector health checks for NinjaOne post-enrollment operations.
 *
 * NinjaOne is a downstream standardization system, NOT an enrollment authority.
 *
 * @module device-management/ninjaone
 */

import type { IConnectionRegistryService } from '../../connection-registry-service.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface INinjaOneReadinessResult {
  readonly ready: boolean;
  readonly connectorConfigured: boolean;
  readonly connectorHealthy: boolean;
  readonly apiAccessible: boolean;
  readonly error: string | null;
}

export interface INinjaOneOrganization {
  readonly organizationId: string;
  readonly organizationName: string;
  readonly deviceCount: number | null;
}

export interface INinjaOneApiValidationResult {
  readonly success: boolean;
  readonly latencyMs: number | null;
  readonly error: string | null;
}

// ─── Interface ──────────────────────────────────────────────────────────────

export interface INinjaOneApiService {
  /** Check if the NinjaOne connector is configured and healthy. */
  checkNinjaOneReadiness(): Promise<INinjaOneReadinessResult>;

  /** Validate API connectivity (OAuth token exchange + test call). */
  validateApiConnection(): Promise<INinjaOneApiValidationResult>;

  /** Get the organization the connector is configured for. */
  getOrganization(): Promise<INinjaOneOrganization | null>;
}

// ─── Implementation ─────────────────────────────────────────────────────────

export class NinjaOneApiService implements INinjaOneApiService {
  constructor(private readonly connectionRegistry: IConnectionRegistryService) {}

  async checkNinjaOneReadiness(): Promise<INinjaOneReadinessResult> {
    try {
      const conn = await this.connectionRegistry.getConnectionByClass('ninjaone-api');
      if (!conn) {
        return { ready: false, connectorConfigured: false, connectorHealthy: false, apiAccessible: false, error: 'NinjaOne connector not configured' };
      }
      const healthy = conn.healthStatus === 'healthy';
      return {
        ready: healthy,
        connectorConfigured: true,
        connectorHealthy: healthy,
        apiAccessible: healthy,
        error: healthy ? null : `NinjaOne connector health: ${conn.healthStatus}`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'NinjaOne readiness check failed';
      return { ready: false, connectorConfigured: false, connectorHealthy: false, apiAccessible: false, error: message };
    }
  }

  async validateApiConnection(): Promise<INinjaOneApiValidationResult> {
    // Stub: succeeds. Real impl will attempt OAuth token exchange + test API call.
    return { success: true, latencyMs: null, error: null };
  }

  async getOrganization(): Promise<INinjaOneOrganization | null> {
    // Stub: returns null. Real impl will query NinjaOne API.
    return null;
  }
}

// ─── Mock ───────────────────────────────────────────────────────────────────

export class MockNinjaOneApiService implements INinjaOneApiService {
  async checkNinjaOneReadiness(): Promise<INinjaOneReadinessResult> {
    return { ready: true, connectorConfigured: true, connectorHealthy: true, apiAccessible: true, error: null };
  }

  async validateApiConnection(): Promise<INinjaOneApiValidationResult> {
    return { success: true, latencyMs: 42, error: null };
  }

  async getOrganization(): Promise<INinjaOneOrganization | null> {
    return { organizationId: 'mock-org-1', organizationName: 'HB Caldwell', deviceCount: 150 };
  }
}
