import type { IProvisioningProgressEvent } from '@hbc/models';

export interface ISignalRPushService {
  pushProvisioningProgress(event: IProvisioningProgressEvent): Promise<void>;
}

export class MockSignalRPushService implements ISignalRPushService {
  async pushProvisioningProgress(event: IProvisioningProgressEvent): Promise<void> {
    // D-PH6-02 package boundary/event keying: group is provisioning-${projectId}.
    const groupName = `provisioning-${event.projectId}`;
    console.log(
      `[MockSignalR] Group=${groupName} ${event.correlationId} step ${event.stepNumber} (${event.stepName}) -> ${event.status} [overall: ${event.overallStatus}]`
    );
  }
}
