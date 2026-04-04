/**
 * HbcEvidenceSummaryBar — Phase 11 evidence capture status
 */

export interface EvidenceSummary {
  readonly runId: string;
  readonly actionKey: string;
  readonly riskLevel: string;
  readonly controlsSatisfied: readonly string[];
  readonly controlsSkipped: readonly string[];
  readonly previewCaptured: boolean;
  readonly confirmationCaptured: boolean;
  readonly validationCaptured: boolean;
  readonly recoveryCaptured: boolean;
  readonly evidenceRefCount: number;
  readonly completedAt: string;
}

export interface HbcEvidenceSummaryBarProps {
  /** Evidence summary for a safety-controlled action */
  summary: EvidenceSummary;
  /** Additional CSS class */
  className?: string;
}
