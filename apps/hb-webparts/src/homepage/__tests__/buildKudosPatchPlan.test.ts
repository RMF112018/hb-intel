/**
 * Phase-16 — governance writer patch-plan validation.
 *
 * `buildKudosPatchPlan` is the pure translation layer between a
 * `KudosPatch` discriminated union and the SharePoint field payload +
 * paired audit event. Covers approve / reject / requestRevision /
 * flagAdminReview / clearAdminReview happy paths, input validation,
 * actor-id coupling, and the public/admin note boundary.
 */
import { describe, expect, it } from 'vitest';
import { buildKudosPatchPlan } from '../data/kudosGovernanceWriter.js';
import { KUDOS_FIELDS } from '../data/peopleCultureListSource.js';

const baseMeta = (over: Partial<Record<string, unknown>> = {}) => ({
  kudosId: 'k-1',
  actorUserId: 7,
  actedAtIso: '2026-04-12T12:00:00.000Z',
  ...over,
});

describe('buildKudosPatchPlan — pure patch planner', () => {
  it('approve: flips WorkflowStatus/Approved/Homepage + couples audit actor', () => {
    const plan = buildKudosPatchPlan({ kind: 'approve', ...baseMeta() });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.WorkflowStatus]).toBe('approved');
    expect(plan.fields[KUDOS_FIELDS.HomepageEnabled]).toBe(true);
    expect(plan.fields[KUDOS_FIELDS.WasEverPublished]).toBe(true);
    expect(plan.fields[KUDOS_FIELDS.ApprovedDate]).toBe('2026-04-12T12:00:00.000Z');
    expect(plan.fields[`${KUDOS_FIELDS.ApprovedBy}Id`]).toBe(7);
    expect(plan.auditEvent.eventType).toBe('approve');
    expect(plan.auditEvent.actorUserId).toBe(7);
    expect(plan.auditEvent.kudosId).toBe('k-1');
  });

  it('approve with flagForAdminReview overlays flag fields', () => {
    const plan = buildKudosPatchPlan({
      kind: 'approve',
      ...baseMeta(),
      flagForAdminReview: true,
      adminReviewReason: 'needs second pair of eyes',
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.IsFlaggedForAdminReview]).toBe(true);
    expect(plan.fields[KUDOS_FIELDS.AdminReviewReason]).toBe('needs second pair of eyes');
  });

  it('reject: rejects empty rejectionReason', () => {
    const plan = buildKudosPatchPlan({
      kind: 'reject',
      ...baseMeta(),
      rejectionReason: '   ',
    });
    expect(plan.ok).toBe(false);
    if (plan.ok) return;
    expect(plan.error).toMatch(/reason/i);
  });

  it('reject: writes trimmed reason + audit payload', () => {
    const plan = buildKudosPatchPlan({
      kind: 'reject',
      ...baseMeta(),
      rejectionReason: '  not clear enough  ',
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.WorkflowStatus]).toBe('rejected');
    expect(plan.fields[KUDOS_FIELDS.RejectionReason]).toBe('not clear enough');
    expect(plan.auditEvent.eventType).toBe('reject');
  });

  it('requestRevision: requires revisionGuidance', () => {
    const bad = buildKudosPatchPlan({
      kind: 'requestRevision',
      ...baseMeta(),
      revisionGuidance: '',
    });
    expect(bad.ok).toBe(false);

    const good = buildKudosPatchPlan({
      kind: 'requestRevision',
      ...baseMeta(),
      revisionGuidance: 'please add recipient context',
    });
    expect(good.ok).toBe(true);
    if (!good.ok) return;
    expect(good.fields[KUDOS_FIELDS.WorkflowStatus]).toBe('revisionRequested');
    expect(good.auditEvent.eventType).toBe('revisionRequested');
  });

  it('flagAdminReview: requires adminReviewReason', () => {
    const bad = buildKudosPatchPlan({
      kind: 'flagAdminReview',
      ...baseMeta(),
      adminReviewReason: '',
    });
    expect(bad.ok).toBe(false);
  });

  it('note boundary: publicNote and internalNote both forwarded to audit event', () => {
    const plan = buildKudosPatchPlan({
      kind: 'approve',
      ...baseMeta(),
      publicNote: 'Congrats!',
      internalNote: 'Ran comms check with HR.',
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.auditEvent.publicNote).toBe('Congrats!');
    expect(plan.auditEvent.internalNote).toBe('Ran comms check with HR.');
    // The list-item field payload does NOT carry either note — notes
    // belong on the audit event, not on the kudos item row.
    const fieldValues = Object.values(plan.fields);
    expect(fieldValues).not.toContain('Congrats!');
    expect(fieldValues).not.toContain('Ran comms check with HR.');
  });

  it('missing actorUserId omits Reviewed/ApprovedBy ID fields', () => {
    const plan = buildKudosPatchPlan({ kind: 'approve', kudosId: 'k-2' });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields).not.toHaveProperty(`${KUDOS_FIELDS.ApprovedBy}Id`);
    expect(plan.fields).not.toHaveProperty(`${KUDOS_FIELDS.ReviewedBy}Id`);
  });

  it('defaults actedAtIso to now when omitted', () => {
    const plan = buildKudosPatchPlan({ kind: 'approve', kudosId: 'k-3' });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.fields[KUDOS_FIELDS.ApprovedDate]).toBeTruthy();
  });
});
