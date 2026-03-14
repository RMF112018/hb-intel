import { describe, it, expect } from 'vitest';
import { PROVISIONING_NOTIFICATION_TEMPLATES } from './notification-templates.ts';

describe('PROVISIONING_NOTIFICATION_TEMPLATES', () => {
  it('has exactly 15 template functions', () => {
    expect(Object.keys(PROVISIONING_NOTIFICATION_TEMPLATES)).toHaveLength(15);
  });

  it('each template returns subject, body, actionUrl, and actionLabel', () => {
    const results = [
      // G1-T03 baseline (8)
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.request-submitted']('Proj', 'req-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.clarification-requested']('Proj', 'note', 'req-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.ready-to-provision']('Proj', 'req-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.started']('25-001', 'Proj', 'req-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.first-failure']('25-001', 'Proj'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.second-failure-escalated']('25-001', 'Proj'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.completed']('25-001', 'Proj', 'https://site'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.recovery-resolved']('25-001', 'Proj', 'https://site'),
      // G3-T04 additions (7)
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.clarification-responded']('Proj', 'Jane', 'req-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.request-approved']('Proj', 'req-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.step-completed']('25-001', 'Proj', 'Permissions', 'req-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.handoff-received']('Proj', 'Jane', 'hoff-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.handoff-acknowledged']('Proj', 'Bob', 'hoff-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.handoff-rejected']('Proj', 'Bob', 'Wrong scope', 'hoff-1'),
      PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.site-access-ready']('25-001', 'Proj', 'https://site'),
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

  // ─── G3-T04 template tests ──────────────────────────────────────────────

  it('clarification-responded interpolates projectName, requesterName, and requestId', () => {
    const result = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.clarification-responded'](
      'Omega Project', 'Jane Smith', 'req-99'
    );
    expect(result.subject).toContain('Omega Project');
    expect(result.body).toContain('Jane Smith');
    expect(result.actionUrl).toContain('req-99');
  });

  it('request-approved interpolates projectName and requestId', () => {
    const result = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.request-approved'](
      'Sigma Project', 'req-77'
    );
    expect(result.subject).toContain('Sigma Project');
    expect(result.actionUrl).toContain('req-77');
  });

  it('step-completed interpolates projectNumber, projectName, stepName, and requestId', () => {
    const result = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.step-completed'](
      '25-010', 'Tau Project', 'Site Creation', 'req-88'
    );
    expect(result.subject).toContain('25-010');
    expect(result.subject).toContain('Tau Project');
    expect(result.body).toContain('Site Creation');
    expect(result.actionUrl).toContain('req-88');
  });

  it('handoff-received interpolates projectName, senderName, and handoffId', () => {
    const result = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.handoff-received'](
      'Phi Project', 'Alice', 'hoff-42'
    );
    expect(result.subject).toContain('Phi Project');
    expect(result.body).toContain('Alice');
    expect(result.actionUrl).toContain('hoff-42');
  });

  it('handoff-acknowledged interpolates projectName, recipientName, and handoffId', () => {
    const result = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.handoff-acknowledged'](
      'Chi Project', 'Bob', 'hoff-43'
    );
    expect(result.subject).toContain('Chi Project');
    expect(result.body).toContain('Bob');
    expect(result.actionUrl).toContain('hoff-43');
  });

  it('handoff-rejected interpolates projectName, recipientName, reason, and handoffId', () => {
    const result = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.handoff-rejected'](
      'Psi Project', 'Carol', 'Incorrect assignment', 'hoff-44'
    );
    expect(result.subject).toContain('Psi Project');
    expect(result.body).toContain('Carol');
    expect(result.body).toContain('Incorrect assignment');
    expect(result.actionUrl).toContain('hoff-44');
  });

  it('site-access-ready uses siteUrl as actionUrl', () => {
    const result = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.site-access-ready'](
      '25-015', 'Kappa Project', 'https://hbc.sharepoint.com/sites/kappa'
    );
    expect(result.actionUrl).toBe('https://hbc.sharepoint.com/sites/kappa');
    expect(result.subject).toContain('25-015');
    expect(result.subject).toContain('Kappa Project');
  });
});
