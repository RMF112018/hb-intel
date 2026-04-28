/**
 * PCC repair-request read model.
 *
 * Phase 3 / Wave 1 / Prompt 05. Read-model only. No automatic repair
 * execution and no tenant mutation. Repair execution is owned by IT/Admin
 * operations outside the PCC shared-model boundary.
 */

import type { PccProjectId } from './types.js';
import type { PccPersona } from './PccUserRoles.js';
import type { SiteHealthSeverity } from './SiteHealth.js';

export const REPAIR_REQUEST_STATES = [
  'requested',
  'triage',
  'in-progress',
  'completed',
  'rejected',
  'cancelled',
] as const;

export type RepairRequestState = (typeof REPAIR_REQUEST_STATES)[number];

/**
 * Only IT/Admin personas can own repair execution per the contract.
 */
export const REPAIR_REQUEST_OWNER_PERSONAS = ['pcc-admin', 'it-admin'] as const;

export type RepairRequestOwnerPersona =
  (typeof REPAIR_REQUEST_OWNER_PERSONAS)[number];

export interface IRepairRequest {
  id: string;
  projectId: PccProjectId;
  /** Binds to a Site Health check when applicable. */
  siteHealthCheckId?: string;
  requestedByUpn: string;
  requestedByPersona?: PccPersona;
  /** ISO 8601 UTC. */
  requestedAtUtc: string;
  severity: SiteHealthSeverity;
  summary: string;
  /** Short non-PII summary of the supporting evidence. */
  evidenceSummary?: string;
  ownerPersona: RepairRequestOwnerPersona;
  state: RepairRequestState;
  /** ISO 8601 UTC when a decision was recorded. */
  decidedAtUtc?: string;
  decisionByUpn?: string;
  decisionNote?: string;
}
