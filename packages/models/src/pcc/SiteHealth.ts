/**
 * PCC Site Health summary types.
 *
 * Severity values are taken verbatim from
 * `Standard_Project_Site_Template_Contract.md` §19.3, which freezes the
 * five-value severity vocabulary used across drift detection, repair tiers,
 * and operator behavior.
 *
 * Wave 1 surfaces these as a read-model summary only. No drift scanner,
 * repair runner, Graph/PnP call, or backend persistence is implied.
 *
 * Phase 3 / Wave 1 / Prompt 05 adds a richer per-check shape, drift
 * indicators, repair-tier vocabulary, and project-anchored optional fields
 * on the summary. All extensions are additive — visibility model only; no
 * scanner, runner, repair executor, Graph/PnP, or backend persistence.
 */

import type { PccProjectId, PccSiteUrl } from './types.js';

export const SITE_HEALTH_SEVERITIES = [
  'Info',
  'Warning',
  'Blocking',
  'Security Risk',
  'Repair Required',
] as const;

export type SiteHealthSeverity = (typeof SITE_HEALTH_SEVERITIES)[number];

export type SiteHealthCheckState = 'pass' | 'fail' | 'warning' | 'not-run';

/**
 * Repair tier mapping per contract §19A. `T4` = manual / no auto-repair.
 */
export const REPAIR_TIERS = ['T1', 'T2', 'T3', 'T4'] as const;
export type SiteHealthRepairTier = (typeof REPAIR_TIERS)[number];

export interface ISiteHealthCheck {
  id: string;
  title: string;
  state: SiteHealthCheckState;
  severity: SiteHealthSeverity;
  /** ISO 8601 UTC of the most recent run, when known. */
  lastCheckedUtc?: string;
  /** Short non-PII detail surfaced to operators. */
  detail?: string;
  /** Whether automated repair is offered for this check. */
  repairAvailable: boolean;
  /** Repair tier per contract §19A. `T4` = manual / no auto-repair in MVP. */
  repairTier?: SiteHealthRepairTier;
}

export interface IDriftIndicator {
  /** Stable drift key, e.g. `permission-inheritance:02_Contracts_and_Compliance`. */
  key: string;
  /** Expected value or state, when known. */
  expected?: string;
  /** Actual observed value or state, when known. */
  actual?: string;
  severity: SiteHealthSeverity;
  /** Short non-PII detail. */
  detail?: string;
}

export interface ISiteHealthSummary {
  siteUrl: PccSiteUrl;
  /** Most recent run timestamp, ISO 8601 UTC. */
  lastRunUtc?: string;
  /** Highest-severity finding across the most recent run. */
  overallSeverity: SiteHealthSeverity;
  failingChecks: number;
  warningChecks: number;
  /** Whether at least one finding has an automated repair available. */
  repairAvailable: boolean;
  /** Provisioning/run identifier when known. */
  runId?: string;
  /**
   * Phase 3 / Wave 1 / Prompt 05 additions. All optional to keep the
   * Prompt 02 minimal shape backward-compatible.
   */
  projectId?: PccProjectId;
  checks?: readonly ISiteHealthCheck[];
  driftIndicators?: readonly IDriftIndicator[];
  /** True when at least one finding is eligible for a repair-request workflow. */
  repairRequestAvailable?: boolean;
}
