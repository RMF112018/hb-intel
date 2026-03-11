import type { IAdminAlert } from '../src/types/IAdminAlert.js';

/**
 * Factory for creating mock admin alerts in tests.
 */
export function createMockAdminAlert(overrides?: Partial<IAdminAlert>): IAdminAlert {
  return {
    alertId: 'alert-001',
    category: 'provisioning-failure',
    severity: 'medium',
    title: 'Mock Admin Alert',
    description: 'A mock alert for testing purposes',
    affectedEntityType: 'system',
    affectedEntityId: 'system-001',
    occurredAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}
