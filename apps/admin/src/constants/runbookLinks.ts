/**
 * G6-T05: Runbook link registry for embedded admin guidance.
 *
 * Wave 0: relative doc paths stored as constants. In production SPFx context,
 * these resolve to SharePoint doc library URLs — that mapping is a deployment
 * concern handled at the app shell level.
 */

const RUNBOOK_BASE = 'docs/maintenance';

export const RUNBOOK_LINKS = {
  /** Manual retry procedure for failed provisioning runs. */
  RETRY_PROCEDURE: `${RUNBOOK_BASE}/provisioning-runbook.md#how-to-manually-retry-a-failed-provisioning-run`,
  /** Escalation steps when retry ceiling is reached or manual intervention needed. */
  ESCALATION_PROCEDURE: `${RUNBOOK_BASE}/provisioning-runbook.md#how-to-escalate-a-stuck-run`,
  /** Step 5 manual re-run instructions for deferred timer failures. */
  STEP_5_MANUAL: `${RUNBOOK_BASE}/provisioning-runbook.md#how-to-re-run-step-5-manually`,
  /** Alert threshold definitions and monitoring configuration. */
  ALERT_THRESHOLDS: `${RUNBOOK_BASE}/provisioning-runbook.md#alert-thresholds`,
  /** KQL query templates for Application Insights diagnostics. */
  KQL_QUERIES: `${RUNBOOK_BASE}/provisioning-observability-runbook.md#application-insights-query-reference-card`,
  /** Stuck provisioning alert rule definition and thresholds. */
  STUCK_ALERT_RULE: `${RUNBOOK_BASE}/provisioning-observability-runbook.md#alert-rule-1-stuck-provisioning-run-30m`,
} as const;
