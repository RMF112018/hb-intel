import type { INotificationRegistration } from '../src/types';

/** Factory for mock notification registration entries */
export function createMockNotificationRegistration(
  overrides?: Partial<INotificationRegistration>,
): INotificationRegistration {
  return {
    eventType: 'test.event',
    defaultTier: 'watch',
    description: 'Test event notification',
    tierOverridable: true,
    channels: ['in-app'],
    ...overrides,
  };
}
