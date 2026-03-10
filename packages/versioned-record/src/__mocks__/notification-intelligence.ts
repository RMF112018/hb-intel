/**
 * Mock for @hbc/notification-intelligence (SF-10 — Deferred Scope).
 * No-op implementation — notification side-effects are not under test.
 */

export function useNotificationClient() {
  return {
    registerEvent: () => {},
  };
}
