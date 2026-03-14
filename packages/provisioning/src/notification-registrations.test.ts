import { describe, it, expect } from 'vitest';
import { PROVISIONING_NOTIFICATION_REGISTRATIONS } from './notification-registrations.js';

describe('PROVISIONING_NOTIFICATION_REGISTRATIONS', () => {
  it('has exactly 8 registrations', () => {
    expect(PROVISIONING_NOTIFICATION_REGISTRATIONS).toHaveLength(8);
  });

  it('has no duplicate eventTypes', () => {
    const eventTypes = PROVISIONING_NOTIFICATION_REGISTRATIONS.map((r) => r.eventType);
    expect(new Set(eventTypes).size).toBe(eventTypes.length);
  });

  it('all eventTypes are namespaced under provisioning.*', () => {
    for (const reg of PROVISIONING_NOTIFICATION_REGISTRATIONS) {
      expect(reg.eventType).toMatch(/^provisioning\./);
    }
  });

  it('contains expected event types', () => {
    const types = PROVISIONING_NOTIFICATION_REGISTRATIONS.map((r) => r.eventType);
    expect(types).toContain('provisioning.request-submitted');
    expect(types).toContain('provisioning.clarification-requested');
    expect(types).toContain('provisioning.ready-to-provision');
    expect(types).toContain('provisioning.started');
    expect(types).toContain('provisioning.first-failure');
    expect(types).toContain('provisioning.second-failure-escalated');
    expect(types).toContain('provisioning.completed');
    expect(types).toContain('provisioning.recovery-resolved');
  });

  it('each registration has valid tier and channel values', () => {
    const validTiers = ['immediate', 'watch', 'digest'];
    const validChannels = ['in-app', 'email', 'push', 'digest-email'];

    for (const reg of PROVISIONING_NOTIFICATION_REGISTRATIONS) {
      expect(validTiers).toContain(reg.defaultTier);
      expect(typeof reg.tierOverridable).toBe('boolean');
      expect(reg.channels.length).toBeGreaterThan(0);
      for (const ch of reg.channels) {
        expect(validChannels).toContain(ch);
      }
    }
  });

  it('clarification-requested is immediate and not overridable', () => {
    const reg = PROVISIONING_NOTIFICATION_REGISTRATIONS.find(
      (r) => r.eventType === 'provisioning.clarification-requested'
    )!;
    expect(reg.defaultTier).toBe('immediate');
    expect(reg.tierOverridable).toBe(false);
    expect(reg.channels).toContain('email');
    expect(reg.channels).toContain('push');
  });

  it('request-submitted is watch tier and overridable', () => {
    const reg = PROVISIONING_NOTIFICATION_REGISTRATIONS.find(
      (r) => r.eventType === 'provisioning.request-submitted'
    )!;
    expect(reg.defaultTier).toBe('watch');
    expect(reg.tierOverridable).toBe(true);
  });

  it('completed is watch tier with in-app and push channels', () => {
    const reg = PROVISIONING_NOTIFICATION_REGISTRATIONS.find(
      (r) => r.eventType === 'provisioning.completed'
    )!;
    expect(reg.defaultTier).toBe('watch');
    expect(reg.channels).toContain('in-app');
    expect(reg.channels).toContain('push');
  });
});
