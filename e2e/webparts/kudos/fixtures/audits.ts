/**
 * Deterministic audit-event sequences (matrix axis A + D coverage).
 *
 * Each sequence returns the audit events in chronological order with
 * timestamps derived from the clock anchor. Actors use USERS fixtures
 * so role-gating is provable from the timeline alone.
 */
import { at } from '../helpers/kudosClock';
import { seedAudit, type SeededAuditEvent } from '../helpers/kudosSeed';
import { USERS } from './users';

type Seq = (kudosId: string) => SeededAuditEvent[];

export const AUDIT_SEQUENCES = {
  submitApprove: ((kudosId) => [
    seedAudit(kudosId, 'submit', { actorId: USERS.submitter.id, atIso: at(-120) }),
    seedAudit(kudosId, 'approve', { actorId: USERS.admin.id, atIso: at(-60) }),
  ]) as Seq,

  submitRevisionResubmitApprove: ((kudosId) => [
    seedAudit(kudosId, 'submit', { actorId: USERS.submitter.id, atIso: at(-240) }),
    seedAudit(kudosId, 'requestRevision', { actorId: USERS.admin.id, atIso: at(-180) }),
    seedAudit(kudosId, 'resubmit', { actorId: USERS.submitter.id, atIso: at(-120) }),
    seedAudit(kudosId, 'approve', { actorId: USERS.admin.id, atIso: at(-60) }),
  ]) as Seq,

  submitReject: ((kudosId) => [
    seedAudit(kudosId, 'submit', { actorId: USERS.submitter.id, atIso: at(-120) }),
    seedAudit(kudosId, 'reject', { actorId: USERS.admin.id, atIso: at(-60) }),
  ]) as Seq,

  submitWithdraw: ((kudosId) => [
    seedAudit(kudosId, 'submit', { actorId: USERS.submitter.id, atIso: at(-120) }),
    seedAudit(kudosId, 'withdraw', { actorId: USERS.submitter.id, atIso: at(-60) }),
  ]) as Seq,

  approveScheduleUnschedule: ((kudosId) => [
    seedAudit(kudosId, 'approve', { actorId: USERS.admin.id, atIso: at(-180) }),
    seedAudit(kudosId, 'schedule', { actorId: USERS.admin.id, atIso: at(-120) }),
    seedAudit(kudosId, 'unschedule', { actorId: USERS.admin.id, atIso: at(-60) }),
  ]) as Seq,

  approvePinUnpin: ((kudosId) => [
    seedAudit(kudosId, 'approve', { actorId: USERS.admin.id, atIso: at(-180) }),
    seedAudit(kudosId, 'pin', { actorId: USERS.admin.id, atIso: at(-120) }),
    seedAudit(kudosId, 'unpin', { actorId: USERS.admin.id, atIso: at(-60) }),
  ]) as Seq,

  approveFeatureUnfeature: ((kudosId) => [
    seedAudit(kudosId, 'approve', { actorId: USERS.admin.id, atIso: at(-180) }),
    seedAudit(kudosId, 'feature', { actorId: USERS.admin.id, atIso: at(-120) }),
    seedAudit(kudosId, 'unfeature', { actorId: USERS.admin.id, atIso: at(-60) }),
  ]) as Seq,

  approveRemoveRestore: ((kudosId) => [
    seedAudit(kudosId, 'approve', { actorId: USERS.admin.id, atIso: at(-180) }),
    seedAudit(kudosId, 'remove', { actorId: USERS.admin.id, atIso: at(-120) }),
    seedAudit(kudosId, 'restore', { actorId: USERS.admin.id, atIso: at(-60) }),
  ]) as Seq,

  claimReassign: ((kudosId) => [
    seedAudit(kudosId, 'claim', { actorId: USERS.admin.id, atIso: at(-120) }),
    seedAudit(kudosId, 'reassign', { actorId: USERS.admin.id, atIso: at(-60) }),
  ]) as Seq,

  flagClear: ((kudosId) => [
    seedAudit(kudosId, 'flagAdminReview', { actorId: USERS.reviewer.id, atIso: at(-120) }),
    seedAudit(kudosId, 'clearAdminReview', { actorId: USERS.admin.id, atIso: at(-60) }),
  ]) as Seq,

  celebrateIncrements: ((kudosId) => [
    seedAudit(kudosId, 'celebrate', { actorId: USERS.recipient.id, atIso: at(-30) }),
    seedAudit(kudosId, 'celebrate', { actorId: USERS.unrelated.id, atIso: at(-20) }),
    seedAudit(kudosId, 'celebrate', { actorId: USERS.reviewer.id, atIso: at(-10) }),
  ]) as Seq,

  reopen: ((kudosId) => [
    seedAudit(kudosId, 'reject', { actorId: USERS.admin.id, atIso: at(-120) }),
    seedAudit(kudosId, 'reopen', { actorId: USERS.admin.id, atIso: at(-60) }),
  ]) as Seq,

  updateContent: ((kudosId) => [
    seedAudit(kudosId, 'approve', { actorId: USERS.admin.id, atIso: at(-120) }),
    seedAudit(kudosId, 'updateContent', { actorId: USERS.admin.id, atIso: at(-60) }),
  ]) as Seq,
} as const;

export type AuditSequenceKey = keyof typeof AUDIT_SEQUENCES;
