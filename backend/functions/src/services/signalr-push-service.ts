import type { IProvisioningProgressEvent } from '@hbc/models';
import { createHmac } from 'crypto';

const HUB_NAME = 'provisioning';
const ADMIN_GROUP = 'provisioning-admin';

export interface ISignalRPushService {
  pushProvisioningProgress(event: IProvisioningProgressEvent): Promise<void>;
  addConnectionToGroup(connectionId: string, projectId: string, isAdmin: boolean): Promise<void>;
  closeGroup(projectId: string): Promise<void>;
}

/**
 * D-PH6-07: Production SignalR adapter that delivers provisioning events to
 * per-project and admin groups and manages group lifecycle via data-plane REST API.
 */
export class RealSignalRPushService implements ISignalRPushService {
  private readonly endpoint: string;
  private readonly accessKey: string;
  private readonly hubName = HUB_NAME;

  constructor() {
    const connStr = process.env.AzureSignalRConnectionString;
    if (!connStr) {
      throw new Error('AzureSignalRConnectionString is required');
    }

    const endpointMatch = connStr.match(/Endpoint=([^;]+)/);
    const accessKeyMatch = connStr.match(/AccessKey=([^;]+)/);
    this.endpoint = endpointMatch?.[1] ?? '';
    this.accessKey = accessKeyMatch?.[1] ?? '';

    if (!this.endpoint || !this.accessKey) {
      throw new Error('AzureSignalRConnectionString must include Endpoint and AccessKey');
    }
  }

  async pushProvisioningProgress(event: IProvisioningProgressEvent): Promise<void> {
    const projectGroup = `provisioning-${event.projectId}`;

    // Project members receive project-scoped progress.
    await this.sendToGroup(projectGroup, 'provisioningProgress', event);

    // Admin group receives all provisioning activity across projects.
    await this.sendToGroup(ADMIN_GROUP, 'provisioningProgress', event);
  }

  async addConnectionToGroup(connectionId: string, projectId: string, isAdmin: boolean): Promise<void> {
    await this.callManagementApi(
      `groups/provisioning-${projectId}/connections/${encodeURIComponent(connectionId)}`,
      'PUT'
    );

    if (isAdmin) {
      await this.callManagementApi(
        `groups/${ADMIN_GROUP}/connections/${encodeURIComponent(connectionId)}`,
        'PUT'
      );
    }
  }

  async closeGroup(projectId: string): Promise<void> {
    // Terminal cleanup removes all members from the project group while preserving
    // active SignalR connections for other groups/hubs.
    await this.callManagementApi(`groups/provisioning-${projectId}`, 'DELETE');
  }

  private async sendToGroup(group: string, event: string, data: unknown): Promise<void> {
    await this.callManagementApi(`groups/${group}`, 'POST', {
      target: event,
      arguments: [data],
    });
  }

  private async callManagementApi(path: string, method: string, body?: unknown): Promise<void> {
    const normalizedEndpoint = this.endpoint.endsWith('/') ? this.endpoint.slice(0, -1) : this.endpoint;
    const url = `${normalizedEndpoint}/api/v1/hubs/${this.hubName}/${path}`;
    const token = this.generateAccessToken(url);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`SignalR Management API error: ${response.status} ${await response.text()}`);
    }
  }

  private generateAccessToken(audience: string): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = { aud: audience, exp: now + 3600, iat: now };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', this.accessKey)
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }
}

/**
 * P4-03: No-op implementation used when AzureSignalRConnectionString is not configured.
 * Logs push events for debugging but does not connect to any SignalR service.
 * This prevents startup failures when SignalR is not yet provisioned.
 */
export class NoOpSignalRPushService implements ISignalRPushService {
  constructor() {
    console.warn('[SignalR] AzureSignalRConnectionString not configured — real-time push is disabled. Provisioning progress events will be logged only.');
  }

  async pushProvisioningProgress(event: IProvisioningProgressEvent): Promise<void> {
    console.log(`[SignalR:NoOp] pushProvisioningProgress for ${event.projectId} step ${event.stepNumber} → ${event.status}`);
  }

  async addConnectionToGroup(_connectionId: string, _projectId: string, _isAdmin: boolean): Promise<void> {
    // No-op: no SignalR service to manage groups
  }

  async closeGroup(_projectId: string): Promise<void> {
    // No-op: no SignalR service to close groups
  }
}

/**
 * D-PH6-07 compatibility alias retained for test utilities.
 * @deprecated Use RealSignalRPushService or NoOpSignalRPushService directly.
 */
export class MockSignalRPushService extends NoOpSignalRPushService {}
