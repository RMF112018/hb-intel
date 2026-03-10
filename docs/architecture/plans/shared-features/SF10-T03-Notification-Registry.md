# SF10-T03 — NotificationRegistry: `@hbc/notification-intelligence`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-10-Shared-Feature-Notification-Intelligence.md`
**Decisions Applied:** D-05 (registry singleton pattern — additive, no deregistration), D-09 (Phase 1 static tiers)
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T02 (TypeScript contracts in place)

> **Doc Classification:** Canonical Normative Plan — SF10-T03 registry task; sub-plan of `SF10-Notification-Intelligence.md`.

---

## Objective

Implement `src/registry/NotificationRegistry.ts` — the platform singleton through which all HB Intel packages register their notification event types. The registry stores `INotificationRegistration` entries, validates for duplicate event type keys, and exposes read-only query methods (`getAll`, `getByEventType`, `getByModule`). Every other package imports and calls `NotificationRegistry.register([])` at initialization time.

---

## 3-Line Plan

1. Implement `NotificationRegistry` as a plain TypeScript module singleton (not a class) with a private `Map<string, INotificationRegistration>` store.
2. Implement `register()`, `getAll()`, `getByEventType()`, and `getByModule()` methods; `register()` throws on duplicate event type keys.
3. Write unit tests covering: successful registration, duplicate key error, `getAll` ordering, `getByEventType` miss, `getByModule` filtering.

---

## `src/registry/NotificationRegistry.ts`

```typescript
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
 * @see docs/architecture/adr/0096-notification-intelligence-tiered-model.md
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
```

---

## Registration Pattern (Consumer Reference)

Every HB Intel package that generates notifications registers its event types in its own `index.ts` or initialization file:

```typescript
// packages/bic-next-move/src/index.ts
import { NotificationRegistry } from '@hbc/notification-intelligence';

NotificationRegistry.register([
  {
    eventType: 'bic.transfer',
    defaultTier: 'immediate',
    description: 'You have been assigned ownership of an item (Ball In Court)',
    tierOverridable: false, // accountability primitive — cannot downgrade
    channels: ['push', 'email', 'in-app'],
  },
  {
    eventType: 'bic.overdue',
    defaultTier: 'immediate',
    description: 'An item assigned to you is overdue',
    tierOverridable: false,
    channels: ['push', 'email', 'in-app'],
  },
  {
    eventType: 'bic.escalated',
    defaultTier: 'immediate',
    description: 'An overdue item has been escalated to your manager',
    tierOverridable: true,
    channels: ['push', 'email', 'in-app'],
  },
]);
```

```typescript
// packages/versioned-record/src/index.ts
import { NotificationRegistry } from '@hbc/notification-intelligence';

NotificationRegistry.register([
  {
    eventType: 'version.created',
    defaultTier: 'digest',
    description: 'A new version of a record you follow was created',
    tierOverridable: true,
    channels: ['digest-email', 'in-app'],
  },
]);
```

---

## Unit Tests: `src/registry/NotificationRegistry.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationRegistry } from './NotificationRegistry';

describe('NotificationRegistry', () => {
  beforeEach(() => {
    NotificationRegistry._clearForTesting();
  });

  describe('register()', () => {
    it('registers a valid event type', () => {
      NotificationRegistry.register([
        {
          eventType: 'test.event',
          defaultTier: 'watch',
          description: 'Test event',
          tierOverridable: true,
          channels: ['in-app'],
        },
      ]);
      expect(NotificationRegistry.size()).toBe(1);
    });

    it('registers multiple event types in one call', () => {
      NotificationRegistry.register([
        { eventType: 'a.one', defaultTier: 'immediate', description: 'A1', tierOverridable: false, channels: ['in-app'] },
        { eventType: 'a.two', defaultTier: 'watch', description: 'A2', tierOverridable: true, channels: ['in-app'] },
      ]);
      expect(NotificationRegistry.size()).toBe(2);
    });

    it('throws on duplicate event type key', () => {
      NotificationRegistry.register([
        { eventType: 'dup.event', defaultTier: 'watch', description: 'First', tierOverridable: true, channels: ['in-app'] },
      ]);
      expect(() =>
        NotificationRegistry.register([
          { eventType: 'dup.event', defaultTier: 'digest', description: 'Second', tierOverridable: true, channels: ['in-app'] },
        ])
      ).toThrow('duplicate event type "dup.event"');
    });

    it('throws on invalid defaultTier', () => {
      expect(() =>
        NotificationRegistry.register([
          // @ts-expect-error: testing invalid tier
          { eventType: 'bad.tier', defaultTier: 'urgent', description: 'X', tierOverridable: true, channels: ['in-app'] },
        ])
      ).toThrow('invalid defaultTier');
    });

    it('throws on empty channels array', () => {
      expect(() =>
        NotificationRegistry.register([
          { eventType: 'no.channels', defaultTier: 'watch', description: 'X', tierOverridable: true, channels: [] },
        ])
      ).toThrow('channels must be a non-empty array');
    });

    it('freezes the registered object (immutable after registration)', () => {
      NotificationRegistry.register([
        { eventType: 'frozen.event', defaultTier: 'watch', description: 'F', tierOverridable: true, channels: ['in-app'] },
      ]);
      const reg = NotificationRegistry.getByEventType('frozen.event')!;
      expect(Object.isFrozen(reg)).toBe(true);
    });
  });

  describe('getAll()', () => {
    it('returns registrations in insertion order', () => {
      NotificationRegistry.register([
        { eventType: 'x.first', defaultTier: 'watch', description: '', tierOverridable: true, channels: ['in-app'] },
        { eventType: 'x.second', defaultTier: 'digest', description: '', tierOverridable: true, channels: ['in-app'] },
      ]);
      const all = NotificationRegistry.getAll();
      expect(all[0].eventType).toBe('x.first');
      expect(all[1].eventType).toBe('x.second');
    });
  });

  describe('getByEventType()', () => {
    it('returns the registration for a known event type', () => {
      NotificationRegistry.register([
        { eventType: 'known.event', defaultTier: 'immediate', description: 'Known', tierOverridable: false, channels: ['push', 'in-app'] },
      ]);
      const reg = NotificationRegistry.getByEventType('known.event');
      expect(reg?.defaultTier).toBe('immediate');
    });

    it('returns undefined for an unknown event type', () => {
      expect(NotificationRegistry.getByEventType('unknown.event')).toBeUndefined();
    });
  });

  describe('getByModule()', () => {
    it('returns only registrations for the given module prefix', () => {
      NotificationRegistry.register([
        { eventType: 'bic.transfer', defaultTier: 'immediate', description: '', tierOverridable: false, channels: ['in-app'] },
        { eventType: 'bic.overdue', defaultTier: 'immediate', description: '', tierOverridable: false, channels: ['in-app'] },
        { eventType: 'ack.request', defaultTier: 'immediate', description: '', tierOverridable: false, channels: ['in-app'] },
      ]);
      const bicRegs = NotificationRegistry.getByModule('bic');
      expect(bicRegs).toHaveLength(2);
      expect(bicRegs.every((r) => r.eventType.startsWith('bic.'))).toBe(true);
    });
  });
});
```

---

## Verification Commands

```bash
# Run registry unit tests
pnpm --filter @hbc/notification-intelligence test

# Confirm registry module exports
node -e "
const { NotificationRegistry } = require('./packages/notification-intelligence/dist/registry/NotificationRegistry.js');
console.log('register:', typeof NotificationRegistry.register);
console.log('getAll:', typeof NotificationRegistry.getAll);
console.log('getByEventType:', typeof NotificationRegistry.getByEventType);
console.log('getByModule:', typeof NotificationRegistry.getByModule);
"

# Type-check
pnpm --filter @hbc/notification-intelligence check-types
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
SF10-T03 completed: 2026-03-10
- NotificationRegistry singleton implemented in src/registry/NotificationRegistry.ts
- Private Map store, register() with validation (duplicate/tier/channels), Object.freeze on insert
- getAll(), getByEventType(), getByModule(), size(), _clearForTesting() implemented
- ADR reference corrected from 0096 to ADR-0099 per SF10 master plan
- Unit tests: 10 tests passing (register success/multiple/duplicate/invalidTier/emptyChannels/frozen, getAll ordering, getByEventType hit/miss, getByModule filtering)
- Verification: test ✓, check-types ✓, build ✓
Next: SF10-T04 (API Layer)
-->
