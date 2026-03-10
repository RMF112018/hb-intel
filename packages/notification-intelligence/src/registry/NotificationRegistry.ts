/**
 * NotificationRegistry — SF10-T03
 * Platform singleton for notification event type registration.
 *
 * All HB Intel packages register their event types here at initialization:
 *
 *   import { NotificationRegistry } from '@hbc/notification-intelligence';
 *   NotificationRegistry.register([{ eventType: 'bic.transfer', ... }]);
 *
 * Design decisions:
 *   D-05: Module singleton (not a class) — callers import the same instance
 *   D-05: Additive only — no deregistration (event types are permanent once declared)
 *   D-09: Phase 1 static — defaultTier is used as-is; no adaptive algorithm in Phase 1
 *
 * @see docs/architecture/adr/0099-notification-intelligence-tiered-model.md
 */

import type { INotificationRegistration } from '../types/INotification';

// Private store: eventType → registration record
const _registry = new Map<string, INotificationRegistration>();

/**
 * Register one or more notification event types.
 * Called once per package at initialization time.
 *
 * @throws {Error} If an eventType key is already registered by another package.
 */
function register(registrations: INotificationRegistration[]): void {
  for (const reg of registrations) {
    if (_registry.has(reg.eventType)) {
      const existing = _registry.get(reg.eventType)!;
      throw new Error(
        `NotificationRegistry: duplicate event type "${reg.eventType}". ` +
          `Already registered by module context. ` +
          `Event types are permanent once declared (D-05). ` +
          `Existing registration: ${JSON.stringify(existing)}`
      );
    }

    // Validate required fields
    if (!reg.eventType || typeof reg.eventType !== 'string') {
      throw new Error('NotificationRegistry: eventType must be a non-empty string.');
    }
    if (!['immediate', 'watch', 'digest'].includes(reg.defaultTier)) {
      throw new Error(
        `NotificationRegistry: invalid defaultTier "${reg.defaultTier}" for eventType "${reg.eventType}".`
      );
    }
    if (!Array.isArray(reg.channels) || reg.channels.length === 0) {
      throw new Error(
        `NotificationRegistry: channels must be a non-empty array for eventType "${reg.eventType}".`
      );
    }

    _registry.set(reg.eventType, Object.freeze({ ...reg }));
  }
}

/**
 * Returns all registered event types in insertion order.
 */
function getAll(): INotificationRegistration[] {
  return Array.from(_registry.values());
}

/**
 * Returns the registration for a specific event type, or undefined if not found.
 */
function getByEventType(eventType: string): INotificationRegistration | undefined {
  return _registry.get(eventType);
}

/**
 * Returns all registrations whose eventType starts with `<module>.`
 * Convention: event types are namespaced as `<module>.<action>` (e.g., `bic.transfer`).
 *
 * @param module The module prefix, e.g. 'bic', 'handoff', 'ack'.
 */
function getByModule(module: string): INotificationRegistration[] {
  const prefix = `${module}.`;
  return Array.from(_registry.values()).filter((r) =>
    r.eventType.startsWith(prefix)
  );
}

/**
 * Returns the number of registered event types.
 */
function size(): number {
  return _registry.size;
}

/**
 * Clears all registrations.
 * FOR TESTING ONLY — do not call in production code.
 * @internal
 */
function _clearForTesting(): void {
  _registry.clear();
}

export const NotificationRegistry = {
  register,
  getAll,
  getByEventType,
  getByModule,
  size,
  _clearForTesting,
} as const;
