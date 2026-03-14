import { describe, it, expect } from 'vitest';
import { PROVISIONING_NOTIFICATION_TEMPLATES } from './notification-templates.ts';

describe('PROVISIONING_NOTIFICATION_TEMPLATES', () => {
  it('has exactly 8 template functions', () => {
    expect(Object.keys(PROVISIONING_NOTIFICATION_TEMPLATES)).toHaveLength(8);
  });

  it('each template returns subject, body, actionUrl, and actionLabel', () => {
    // Call each with sample args and verify shape
    const results = [
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.request-submitted']('Proj', 'req-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.clarification-requested']('Proj', 'note', 'req-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.ready-to-provision']('Proj', 'req-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.started']('25-001', 'Proj', 'req-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.first-failure']('25-001', 'Proj'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.second-failure-escalated']('25-001', 'Proj'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.completed']('25-001', 'Proj', 'https://site'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.recovery-resolved']('25-001', 'Proj', 'https://site'),
    ];

    for (const result of results) {
      expect(typeof result.subject).toBe('string');
      expect(typeof result.body).toBe('string');
      expect(typeof result.actionUrl).toBe('string');
      expect(typeof result.actionLabel).toBe('string');
      expect(result.subject.length).toBeGreaterThan(0);
      expect(result.body.length).toBeGreaterThan(0);
    }
  });

  it('request-submitted interpolates projectName and requestId', () => {
    const result = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.request-submitted']('Alpha Project', 'req-42');
    expect(result.subject).toContain('Alpha Project');
    expect(result.actionUrl).toContain('req-42');
  });

  it('clarification-requested interpolates projectName and note', () => {
    const result = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.clarification-requested'](
      'Beta Project', 'Need more info', 'req-55'
    );
    expect(result.subject).toContain('Beta Project');
    expect(result.body).toContain('Need more info');
    expect(result.actionUrl).toContain('req-55');
  });

  it('started interpolates projectNumber and projectName', () => {
    const result = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.started']('25-001-01', 'Gamma', 'req-7');
    expect(result.subject).toContain('25-001-01');
    expect(result.subject).toContain('Gamma');
    expect(result.body).toContain('25-001-01');
  });

  it('completed includes siteUrl as actionUrl', () => {
    const result = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.completed'](
      '25-002', 'Delta', 'https://hbc.sharepoint.com/sites/delta'
    );
    expect(result.actionUrl).toBe('https://hbc.sharepoint.com/sites/delta');
    expect(result.subject).toContain('25-002');
  });

  it('recovery-resolved includes siteUrl as actionUrl', () => {
    const result = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.recovery-resolved'](
      '25-003', 'Epsilon', 'https://hbc.sharepoint.com/sites/epsilon'
    );
    expect(result.actionUrl).toBe('https://hbc.sharepoint.com/sites/epsilon');
    expect(result.body).toContain('successfully recovered');
  });

  it('first-failure and second-failure-escalated point to admin dashboard', () => {
    const f1 = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.first-failure']('25-004', 'Zeta');
    const f2 = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.second-failure-escalated']('25-004', 'Zeta');
    expect(f1.actionUrl).toContain('/admin');
    expect(f2.actionUrl).toContain('/admin');
    expect(f2.subject).toContain('ESCALATION');
  });
});
