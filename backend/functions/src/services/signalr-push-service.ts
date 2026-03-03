import type { IProvisioningProgressEvent } from '@hbc/models';

export interface ISignalRPushService {
  pushProvisioningProgress(event: IProvisioningProgressEvent): Promise<void>;
}

export class MockSignalRPushService implements ISignalRPushService {
  async pushProvisioningProgress(event: IProvisioningProgressEvent): Promise<void> {
    console.log(
      `[MockSignalR] Push: ${event.projectCode} step ${event.stepNumber} (${event.stepName}) → ${event.status} [overall: ${event.overallStatus}]`
    );
  }
}
