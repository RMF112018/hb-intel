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
 */

import type { PccSiteUrl } from './types.js';

export const SITE_HEALTH_SEVERITIES = [
  'Info',
  'Warning',
  'Blocking',
  'Security Risk',
  'Repair Required',
] as const;

export type SiteHealthSeverity = (typeof SITE_HEALTH_SEVERITIES)[number];

export type SiteHealthCheckState = 'pass' | 'fail' | 'warning' | 'not-run';

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
}
