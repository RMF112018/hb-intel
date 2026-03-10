/**
 * Mock for @hbc/notification-intelligence (SF-10 — Deferred Scope).
 * No-op implementation — notification side-effects are not under test.
 * NotificationRegistry and NotificationApi exports satisfy tsc resolution
 * via tsconfig path mapping; runtime mocks are in src/test/setup.ts.
 */

export function useNotificationClient() {
  return {
    registerEvent: () => {},
  };
}

export const NotificationRegistry = { register: (..._args: unknown[]) => {} };
export const NotificationApi = { send: async (..._args: unknown[]) => {} };
