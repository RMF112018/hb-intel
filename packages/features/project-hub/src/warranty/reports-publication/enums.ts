/**
 * P3-E14-T10 Stage 8 Project Warranty Module reports-publication enumerations.
 * Activity events, health metrics, work queue rules, reports, telemetry.
 */

// -- Activity Event Key (T09 §3.2) — 24 events
export type WarrantyActivityEventKey =
  | 'warranty.coverage.registered' | 'warranty.coverage.voided' | 'warranty.coverage.expired'
  | 'warranty.intake.logged' | 'warranty.case.opened' | 'warranty.case.coverage-decision-made'
  | 'warranty.case.assigned' | 'warranty.case.reassigned'
  | 'warranty.acknowledgment.recorded' | 'warranty.acknowledgment.disputed' | 'warranty.acknowledgment.dispute-resolved'
  | 'warranty.case.awaiting-owner' | 'warranty.case.awaiting-owner-resolved'
  | 'warranty.case.visit-scheduled' | 'warranty.case.visit-completed'
  | 'warranty.case.corrected' | 'warranty.case.verification-failed' | 'warranty.case.verified'
  | 'warranty.case.resolved' | 'warranty.case.closed' | 'warranty.case.reopened' | 'warranty.case.voided'
  | 'warranty.backcharge.advisory-published'
  | 'warranty.communication.logged';

// -- Health Metric Key (T09 §4) — 16 metrics (6 leading + 5 lagging + 5 recurring)
export type WarrantyHealthMetricKey =
  // Leading
  | 'warranty.coverage.expiringSoon30d' | 'warranty.coverage.expiringSoon7d'
  | 'warranty.case.acknowledgmentPendingRate' | 'warranty.case.ownerUpdateOverdue'
  | 'warranty.case.slaWarningCount' | 'warranty.case.disputeOpenCount'
  // Lagging
  | 'warranty.case.slaComplianceRate' | 'warranty.case.avgDaysToClose'
  | 'warranty.case.reopenRate' | 'warranty.case.verificationFailureRate' | 'warranty.case.backChargeAdvisoryRate'
  // Recurring failure
  | 'warranty.signal.coverageExpiredWithOpenCases' | 'warranty.signal.subcontractorRepeatFailure'
  | 'warranty.signal.slaBreachAcceleration' | 'warranty.signal.ownerEscalationRisk' | 'warranty.signal.disputeCluster';

// -- Work Queue Rule ID (T09 §5.2) — 20 rules
export type WarrantyWorkQueueRuleId =
  | 'WQ-WAR-01' | 'WQ-WAR-02' | 'WQ-WAR-03' | 'WQ-WAR-04' | 'WQ-WAR-05'
  | 'WQ-WAR-06' | 'WQ-WAR-07' | 'WQ-WAR-08' | 'WQ-WAR-09' | 'WQ-WAR-10'
  | 'WQ-WAR-11' | 'WQ-WAR-12' | 'WQ-WAR-13' | 'WQ-WAR-14' | 'WQ-WAR-15'
  | 'WQ-WAR-16' | 'WQ-WAR-17' | 'WQ-WAR-18' | 'WQ-WAR-19' | 'WQ-WAR-20';

// -- Work Queue Priority (T09 §5.2)
export type WarrantyWorkQueuePriority = 'Advisory' | 'Normal' | 'Warning' | 'Elevated' | 'Critical';

// -- Report Designation Key (T09 §6.2) — 8 reports
export type WarrantyReportDesignationKey =
  | 'WarrantyPostureSummary' | 'SlaComplianceReport' | 'CoverageExpirationStatus'
  | 'OwnerExperienceRiskReport' | 'SubcontractorWarrantyBurdenReport'
  | 'DenialNotCoveredTrendReport' | 'BackChargeAdvisoryLog' | 'VerificationQualityReport';

// -- Health Band (T09 §4.5) — 4 bands
export type WarrantyHealthBand = 'Green' | 'Yellow' | 'Orange' | 'Red';

// -- Telemetry Event Key (T09 §7) — 30 events
export type WarrantyTelemetryEventKey =
  // Surface engagement (4)
  | 'warranty_coverage_registry_viewed' | 'warranty_case_workspace_viewed'
  | 'warranty_canvas_tile_viewed' | 'warranty_launch_to_pwa_escalation'
  // Case management (10)
  | 'warranty_case_created' | 'warranty_case_assigned' | 'warranty_acknowledgment_recorded'
  | 'warranty_scope_dispute_opened' | 'warranty_scope_dispute_resolved'
  | 'warranty_case_corrected' | 'warranty_verification_failed' | 'warranty_case_closed'
  | 'warranty_case_reopened' | 'warranty_case_voided'
  // Coverage registry (4)
  | 'warranty_coverage_registered' | 'warranty_coverage_expiration_viewed'
  | 'warranty_turnover_linkage_followed' | 'warranty_commissioning_linkage_followed'
  // Communications (3)
  | 'warranty_intake_logged' | 'warranty_communication_event_logged' | 'warranty_owner_status_summary_viewed'
  // Mold-breaker UX (9)
  | 'warranty_next_move_action_taken' | 'warranty_next_move_dismissed'
  | 'warranty_complexity_dial_changed' | 'warranty_permission_explainer_viewed'
  | 'warranty_hbi_suggestion_accepted' | 'warranty_hbi_suggestion_dismissed'
  | 'warranty_saved_view_system_view_used' | 'warranty_related_items_turnover_followed'
  | 'warranty_spfx_to_pwa_roundtrip_completed';
