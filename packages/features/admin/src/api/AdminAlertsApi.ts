import type { IAdminAlert } from '../types/IAdminAlert.js';

/**
 * API client for admin alert retrieval and acknowledgment.
 *
 * @design D-02, SF17-T03
 */
export class AdminAlertsApi {
  async listActive(): Promise<IAdminAlert[]> {
    return [];
  }

  async acknowledge(_alertId: string, _acknowledgedBy: string): Promise<void> {
    // Persistence implementation deferred to SF17-T05
  }

  async listHistory(_range?: {
    from: string;
    to: string;
  }): Promise<IAdminAlert[]> {
    return [];
  }
}
