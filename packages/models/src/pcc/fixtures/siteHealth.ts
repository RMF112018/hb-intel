/**
 * PCC fixture — sample Site Health summary, checks, drift indicators,
 * and repair requests.
 *
 * Deterministic, non-secret. Covers all four `SiteHealthCheckState` values
 * (`pass`, `warning`, `fail`, `not-run`) and all six `RepairRequestState`
 * values. Phase 3 / Wave 1 / Prompt 06.
 */

import type {
  IDriftIndicator,
  ISiteHealthCheck,
  ISiteHealthSummary,
} from '../SiteHealth.js';
import type { IRepairRequest } from '../RepairRequests.js';
import type { PccProjectId, PccSiteUrl } from '../types.js';

const projectId = 'fixture-pcc-project-001' as PccProjectId;
const siteUrl = 'https://example.invalid/sites/pcc-001' as PccSiteUrl;

export const SAMPLE_SITE_HEALTH_CHECKS: readonly ISiteHealthCheck[] = [
  {
    id: 'fixture-sh-001',
    title: 'Required template version recorded',
    state: 'pass',
    severity: 'Info',
    lastCheckedUtc: '2026-04-26T06:00:00Z',
    repairAvailable: false,
  },
  {
    id: 'fixture-sh-002',
    title: 'Sync health within tolerance',
    state: 'warning',
    severity: 'Warning',
    lastCheckedUtc: '2026-04-26T06:00:00Z',
    detail: 'syncHealth window degraded over last 24h; auto-retry in progress.',
    repairAvailable: true,
    repairTier: 'T1',
  },
  {
    id: 'fixture-sh-003',
    title: 'Permission inheritance on contracts library',
    state: 'fail',
    severity: 'Security Risk',
    lastCheckedUtc: '2026-04-26T06:00:00Z',
    detail: 'Inheritance break detected on 02_Contracts_and_Compliance.',
    repairAvailable: true,
    repairTier: 'T2',
  },
  {
    id: 'fixture-sh-004',
    title: 'Procore mapping resolved',
    state: 'not-run',
    severity: 'Info',
    repairAvailable: false,
  },
];

export const SAMPLE_DRIFT_INDICATORS: readonly IDriftIndicator[] = [
  {
    key: 'permission-inheritance:02_Contracts_and_Compliance',
    expected: 'inherited',
    actual: 'broken',
    severity: 'Security Risk',
    detail: 'Inheritance break detected on sensitive library.',
  },
  {
    key: 'integration:procore.syncHealth',
    severity: 'Warning',
    detail: 'syncHealth degraded over last 24h.',
  },
];

export const SAMPLE_SITE_HEALTH_SUMMARY: ISiteHealthSummary = {
  siteUrl,
  projectId,
  lastRunUtc: '2026-04-26T06:00:00Z',
  overallSeverity: 'Security Risk',
  failingChecks: 1,
  warningChecks: 1,
  repairAvailable: true,
  repairRequestAvailable: true,
  runId: 'fixture-shrun-001',
  checks: SAMPLE_SITE_HEALTH_CHECKS,
  driftIndicators: SAMPLE_DRIFT_INDICATORS,
};

export const SAMPLE_REPAIR_REQUESTS: readonly IRepairRequest[] = [
  {
    id: 'fixture-rr-001',
    projectId,
    siteHealthCheckId: 'fixture-sh-003',
    requestedByUpn: 'pm-sample@example.com',
    requestedByPersona: 'project-manager',
    requestedAtUtc: '2026-04-26T07:00:00Z',
    severity: 'Security Risk',
    summary: 'Restore permission inheritance on 02_Contracts_and_Compliance.',
    evidenceSummary: 'M365 audit log entry id 12345.',
    ownerPersona: 'it-admin',
    state: 'requested',
  },
  {
    id: 'fixture-rr-002',
    projectId,
    requestedByUpn: 'admin-sample@example.com',
    requestedByPersona: 'pcc-admin',
    requestedAtUtc: '2026-04-26T08:00:00Z',
    severity: 'Repair Required',
    summary: 'Triage missing required permission group.',
    ownerPersona: 'it-admin',
    state: 'triage',
  },
  {
    id: 'fixture-rr-003',
    projectId,
    requestedByUpn: 'admin-sample@example.com',
    requestedByPersona: 'pcc-admin',
    requestedAtUtc: '2026-04-25T08:00:00Z',
    severity: 'Repair Required',
    summary: 'Reapply missing global read-only group.',
    ownerPersona: 'it-admin',
    state: 'in-progress',
  },
  {
    id: 'fixture-rr-004',
    projectId,
    requestedByUpn: 'admin-sample@example.com',
    requestedByPersona: 'pcc-admin',
    requestedAtUtc: '2026-04-24T08:00:00Z',
    severity: 'Warning',
    summary: 'Recreate missing default view on Project Profile list.',
    ownerPersona: 'pcc-admin',
    state: 'completed',
    decidedAtUtc: '2026-04-24T16:00:00Z',
    decisionByUpn: 'admin-sample@example.com',
    decisionNote: 'Default view restored automatically.',
  },
  {
    id: 'fixture-rr-005',
    projectId,
    requestedByUpn: 'pm-sample@example.com',
    requestedByPersona: 'project-manager',
    requestedAtUtc: '2026-04-23T08:00:00Z',
    severity: 'Warning',
    summary: 'Cosmetic page title typo on Project Home.',
    ownerPersona: 'pcc-admin',
    state: 'rejected',
    decidedAtUtc: '2026-04-23T11:00:00Z',
    decisionByUpn: 'admin-sample@example.com',
    decisionNote: 'Out of scope for repair flow; deferred to copy review.',
  },
  {
    id: 'fixture-rr-006',
    projectId,
    requestedByUpn: 'pm-sample@example.com',
    requestedByPersona: 'project-manager',
    requestedAtUtc: '2026-04-22T08:00:00Z',
    severity: 'Info',
    summary: 'Duplicate request — superseded by ticket fixture-rr-001.',
    ownerPersona: 'pcc-admin',
    state: 'cancelled',
  },
];
