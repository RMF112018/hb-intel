import { describe, it, expect } from 'vitest';
import { PROVISIONING_NOTIFICATION_REGISTRATIONS } from './notification-registrations.js';
import { PROVISIONING_NOTIFICATION_TEMPLATES } from './notification-templates.ts';

describe('PROVISIONING_NOTIFICATION_REGISTRATIONS', () => {
  it('has exactly 15 registrations', () => {
    expect(PROVISIONING_NOTIFICATION_REGISTRATIONS).toHaveLength(15);
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
    // G1-T03 baseline (8)
    expect(types).toContain('provisioning.request-submitted');
    expect(types).toContain('provisioning.clarification-requested');
    expect(types).toContain('provisioning.ready-to-provision');
    expect(types).toContain('provisioning.started');
    expect(types).toContain('provisioning.first-failure');
    expect(types).toContain('provisioning.second-failure-escalated');
    expect(types).toContain('provisioning.completed');
    expect(types).toContain('provisioning.recovery-resolved');
    // G3-T04 additions (7)
    expect(types).toContain('provisioning.clarification-responded');
    expect(types).toContain('provisioning.request-approved');
    expect(types).toContain('provisioning.step-completed');
    expect(types).toContain('provisioning.handoff-received');
    expect(types).toContain('provisioning.handoff-acknowledged');
    expect(types).toContain('provisioning.handoff-rejected');
    expect(types).toContain('provisioning.site-access-ready');
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

  it('request-submitted is immediate and not overridable (T04 reclassification)', () => {
    const reg = PROVISIONING_NOTIFICATION_REGISTRATIONS.find(
      (r) => r.eventType === 'provisioning.request-submitted'
    )!;
    expect(reg.defaultTier).toBe('immediate');
    expect(reg.tierOverridable).toBe(false);
    expect(reg.channels).toContain('email');
    expect(reg.channels).toContain('push');
    expect(reg.channels).toContain('in-app');
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

  it('completed is watch tier with in-app and email channels (T04 channel update)', () => {
    const reg = PROVISIONING_NOTIFICATION_REGISTRATIONS.find(
      (r) => r.eventType === 'provisioning.completed'
    )!;
    expect(reg.defaultTier).toBe('watch');
    expect(reg.channels).toContain('in-app');
    expect(reg.channels).toContain('email');
    expect(reg.channels).not.toContain('push');
  });

  it('clarification-responded is immediate and not overridable', () => {
    const reg = PROVISIONING_NOTIFICATION_REGISTRATIONS.find(
      (r) => r.eventType === 'provisioning.clarification-responded'
    )!;
    expect(reg.defaultTier).toBe('immediate');
    expect(reg.tierOverridable).toBe(false);
    expect(reg.channels).toContain('push');
    expect(reg.channels).toContain('email');
    expect(reg.channels).toContain('in-app');
  });

  it('handoff-received is immediate and not overridable', () => {
    const reg = PROVISIONING_NOTIFICATION_REGISTRATIONS.find(
      (r) => r.eventType === 'provisioning.handoff-received'
    )!;
    expect(reg.defaultTier).toBe('immediate');
    expect(reg.tierOverridable).toBe(false);
    expect(reg.channels).toContain('push');
    expect(reg.channels).toContain('email');
    expect(reg.channels).toContain('in-app');
  });

  it('handoff-rejected is immediate and not overridable', () => {
    const reg = PROVISIONING_NOTIFICATION_REGISTRATIONS.find(
      (r) => r.eventType === 'provisioning.handoff-rejected'
    )!;
    expect(reg.defaultTier).toBe('immediate');
    expect(reg.tierOverridable).toBe(false);
    expect(reg.channels).toContain('push');
    expect(reg.channels).toContain('email');
    expect(reg.channels).toContain('in-app');
  });

  it('G3-D8 classification: all non-overridable events must be immediate tier', () => {
    for (const reg of PROVISIONING_NOTIFICATION_REGISTRATIONS) {
      if (!reg.tierOverridable) {
        expect(reg.defaultTier).toBe('immediate');
      }
    }
  });

  it('G3-D8 classification: all overridable events must not be immediate tier', () => {
    for (const reg of PROVISIONING_NOTIFICATION_REGISTRATIONS) {
      if (reg.tierOverridable) {
        expect(reg.defaultTier).not.toBe('immediate');
      }
    }
  });

  it('every registration eventType has a matching key in PROVISIONING_NOTIFICATION_TEMPLATES', () => {
    const templateKeys = Object.keys(PROVISIONING_NOTIFICATION_TEMPLATES);
    for (const reg of PROVISIONING_NOTIFICATION_REGISTRATIONS) {
      expect(templateKeys).toContain(reg.eventType);
    }
  });
});
