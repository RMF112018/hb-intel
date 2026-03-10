import type { INotificationPreferences } from '../src/types';

/** Factory for mock notification preferences */
export function createMockNotificationPreferences(
  overrides?: Partial<INotificationPreferences>,
): INotificationPreferences {
  return {
    userId: 'user-001',
    tierOverrides: {},
    pushEnabled: false,
    digestDay: 0,
    digestHour: 8,
    ...overrides,
  };
}
