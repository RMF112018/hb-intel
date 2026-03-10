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
