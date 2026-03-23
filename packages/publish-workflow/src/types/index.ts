/**
 * SF25-T01 — Publish Workflow TypeScript Contract Stubs.
 *
 * Publication state machine, readiness/approval rules, supersession,
 * revocation, and receipt traceability.
 *
 * Governing: SF25-T01, SF25 Master Plan L-01/L-03/L-04/L-06
 */

// ── Publication Status ───────────────────────────────────────────────────

export type PublicationStatus =
  | 'draft'
  | 'ready-for-review'
  | 'in-review'
  | 'approved'
  | 'published'
  | 'superseded'
  | 'revoked'
  | 'failed';

// ── Readiness / Approval / Supersession / Revocation ─────────────────────

export interface IReadinessState {
  isReady: boolean;
  blockingReasons: string[];
  warningReasons: string[];
  checkedAtIso: string;
}

export interface IApprovalState {
  status: 'pending' | 'approved' | 'rejected' | 'not-required';
  approverUpn: string | null;
  approverName: string | null;
  decidedAtIso: string | null;
  reason: string | null;
}

export interface ISupersessionState {
  supersededByRecordId: string | null;
  supersededAtIso: string | null;
  reason: string | null;
}

export interface IRevocationState {
  revokedByUpn: string | null;
  revokedAtIso: string | null;
  reason: string | null;
}

// ── Core Interfaces ──────────────────────────────────────────────────────

export interface IPublicationRecord {
  publicationId: string;
  moduleKey: string;
  recordId: string;
  projectId: string;
  status: PublicationStatus;
  readiness: IReadinessState;
  approval: IApprovalState;
  supersession: ISupersessionState;
  revocation: IRevocationState;
  receipt: IPublicationReceipt | null;
  createdAtIso: string;
  updatedAtIso: string;
  authorUpn: string;
}

export interface IPublicationReceipt {
  receiptId: string;
  publishedAtIso: string;
  artifactUrl: string | null;
  versionNumber: number;
  frozen: boolean;
}

export interface IReadinessRule {
  ruleId: string;
  label: string;
  evaluate: (record: IPublicationRecord) => { pass: boolean; message: string };
}

export interface IApprovalRule {
  ruleId: string;
  label: string;
  required: boolean;
  approverRole: string;
}

// ── Constants ────────────────────────────────────────────────────────────

export const PUBLICATION_STATUSES: readonly PublicationStatus[] = [
  'draft', 'ready-for-review', 'in-review', 'approved', 'published', 'superseded', 'revoked', 'failed',
] as const;
