/**
 * Domain DTOs for Safety Field Excellence.
 *
 * These types are publish-payload DTOs owned by `@hbc/features-safety`.
 * They are NOT a fork of the SPFx component contract — Prompt 05 owns the
 * final adapter/mapping from these DTOs into the homepage SPFx
 * `SafetyFieldExcellenceConfig` consumer contract.
 *
 * This file must not depend on `apps/hb-webparts`, React, or SPFx.
 */

import type {
  FindingSeverity,
  SafetyFinding,
  SafetyInspectionEvent,
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
} from '../domain/types.js';

// -- Locked Wave 01 vocabularies -----------------------------------------

export type SafetyExcellenceEligibilityStatus =
  | 'eligible'
  | 'ineligible'
  | 'low-confidence'
  | 'needs-review';

export type SafetyActivityEvidenceStatus = 'proven' | 'inferred' | 'missing';

export type SafetyExcellencePublishRecommendation =
  | 'primary'
  | 'secondary'
  | 'monitor'
  | 'do-not-publish';

/**
 * Reference type for downstream prompts. The publish state machine itself
 * is implemented in Prompt 04; this domain package only references the
 * vocabulary so types stay aligned.
 */
export type SafetyFieldExcellencePublishStatus =
  | 'draft'
  | 'pending-review'
  | 'approved'
  | 'published'
  | 'archived'
  | 'suppressed';

// -- Activity evidence ---------------------------------------------------

export type SafetyActivityEvidenceSource =
  | 'manual'
  | 'daily-log'
  | 'project-stage'
  | 'inspection-density'
  | 'none';

export interface SafetyActivityEvidence {
  readonly status: SafetyActivityEvidenceStatus;
  readonly activeTradeCount?: number;
  readonly estimatedManpower?: number;
  readonly projectStage?: string;
  readonly source: SafetyActivityEvidenceSource;
  readonly notes?: string;
}

// -- Candidate input + score ---------------------------------------------

export interface SafetyExcellenceCandidateInput {
  readonly reportingPeriod: SafetyReportingPeriod;
  readonly projectWeek: SafetyProjectWeekRecord;
  readonly inspections: ReadonlyArray<SafetyInspectionEvent>;
  readonly findings: ReadonlyArray<SafetyFinding>;
  readonly priorProjectWeeks: ReadonlyArray<SafetyProjectWeekRecord>;
  readonly priorInspections: ReadonlyArray<SafetyInspectionEvent>;
  readonly priorFindings: ReadonlyArray<SafetyFinding>;
  readonly activityEvidence?: SafetyActivityEvidence;
  readonly generatedAt?: string;
  readonly generatorVersion?: string;
}

export interface SafetyExcellenceCandidateScore {
  readonly eligibilityStatus: SafetyExcellenceEligibilityStatus;
  readonly exclusionReasons: ReadonlyArray<string>;
  readonly compositeScore: number;
  readonly safetyPerformanceScore: number;
  readonly consistencyTrendScore: number;
  readonly activityExposureScore: number;
  readonly correctiveActionScore: number;
  readonly dataQualityScore: number;
  readonly inspectionCountWindow: number;
  readonly inspectionCountRolling: number;
  readonly averageInspectionScoreWindow: number | null;
  readonly averageInspectionScoreRolling: number | null;
  readonly inspectionTrendPct: number | null;
  readonly highestRiskFindingLevel: FindingSeverity | null;
  readonly highSeverityFindingCount: number;
  readonly mediumSeverityFindingCount: number;
  readonly openFindingCount: number;
  readonly agedOpenFindingCount: number;
  readonly repeatFindingCount: number;
  readonly activityEvidenceStatus: SafetyActivityEvidenceStatus;
  readonly activityEvidenceJson: string;
  readonly reasonSummary: string;
  readonly sourceInspectionIds: ReadonlyArray<string>;
  readonly sourceFindingIds: ReadonlyArray<string>;
  readonly generatedAt: string;
  readonly generatorVersion: string;
  readonly publishRecommendation: SafetyExcellencePublishRecommendation;
}

// -- Homepage publish-payload DTOs ---------------------------------------
//
// These DTOs are produced by the excellence domain and persisted into
// `Safety Field Excellence Weekly Highlights.HomepagePayloadJson` (Prompt 04).
// Prompt 05 owns the SPFx adapter that maps them onto the
// `SafetyFieldExcellenceConfig` consumer contract.

export type SafetyExcellenceUrgency = 'routine' | 'attention' | 'urgent';

export type SafetyExcellenceStatusVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'critical'
  | 'neutral';

export interface SafetyExcellenceCtaLink {
  readonly label: string;
  readonly href: string;
  readonly openInNewTab?: boolean;
}

export interface SafetyExcellenceStatusSignal {
  readonly label: string;
  readonly variant?: SafetyExcellenceStatusVariant;
}

export interface SafetyExcellenceFreshness {
  readonly source?: 'curated' | 'live';
  readonly updatedAt?: string;
  readonly expiresAt?: string;
}

export interface SafetyExcellenceContextMetadata {
  readonly region?: string;
  readonly site?: string;
  readonly project?: string;
  readonly scope?: string;
  readonly owner?: string;
}

export interface SafetyExcellenceTopLineSummary {
  readonly statusLabel: string;
  readonly statusVariant?: SafetyExcellenceStatusVariant;
  readonly summaryText: string;
  readonly lastUpdatedLabel?: string;
}

export interface SafetyExcellencePrimarySpotlight {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly urgency?: SafetyExcellenceUrgency;
  readonly context?: SafetyExcellenceContextMetadata;
  readonly compactSummary?: string;
  readonly metadata?: string;
  readonly indicator?: SafetyExcellenceStatusSignal;
  readonly freshness?: SafetyExcellenceFreshness;
  readonly cta?: SafetyExcellenceCtaLink;
}

export interface SafetyExcellenceSecondarySignal {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly urgency?: SafetyExcellenceUrgency;
  readonly context?: SafetyExcellenceContextMetadata;
  readonly compactSummary?: string;
  readonly metadata?: string;
  readonly indicator?: SafetyExcellenceStatusSignal;
  readonly freshness?: SafetyExcellenceFreshness;
  readonly cta?: SafetyExcellenceCtaLink;
  readonly order?: number;
}

export type SafetyExcellenceDataConfidence = 'high' | 'medium' | 'low';

export interface SafetyFieldExcellenceHomepagePayload {
  readonly heading: string;
  readonly topLineSummary: SafetyExcellenceTopLineSummary;
  readonly primarySpotlight?: SafetyExcellencePrimarySpotlight;
  readonly secondarySignals: ReadonlyArray<SafetyExcellenceSecondarySignal>;
  readonly sectionCta?: SafetyExcellenceCtaLink;
  readonly dataConfidence: SafetyExcellenceDataConfidence;
  readonly degradedNotice?: string;
  readonly periodLabel?: string;
  readonly weekStartDate?: string;
  readonly weekEndDate?: string;
  readonly isPreview: false;
}

export interface SafetyFieldExcellencePreviewPayload {
  readonly heading: string;
  readonly topLineSummary: SafetyExcellenceTopLineSummary;
  readonly primarySpotlight?: SafetyExcellencePrimarySpotlight;
  readonly secondarySignals: ReadonlyArray<SafetyExcellenceSecondarySignal>;
  readonly sectionCta?: SafetyExcellenceCtaLink;
  readonly dataConfidence: SafetyExcellenceDataConfidence;
  readonly isPreview: true;
}

/**
 * Discriminated union convenience for callers that hold either shape.
 */
export type SafetyFieldExcellencePublishedPayloadDraft =
  | SafetyFieldExcellenceHomepagePayload
  | SafetyFieldExcellencePreviewPayload;

// -- Reason codes --------------------------------------------------------

export const EXCELLENCE_REASON_CODES = {
  PROJECT_NOT_RESOLVED: 'project-not-resolved',
  NO_CURRENT_INSPECTIONS: 'no-current-inspections',
  UNRESOLVED_HIGH_SEVERITY_FINDING: 'unresolved-high-severity-finding',
  AGED_OPEN_FINDINGS: 'aged-open-findings',
  REPEAT_FINDING_PRESSURE: 'repeat-finding-pressure',
  DATA_QUALITY_LOW: 'data-quality-low',
  ACTIVITY_EVIDENCE_MISSING: 'activity-evidence-missing',
  ACTIVITY_EVIDENCE_INFERRED_ONLY: 'activity-evidence-inferred-only',
  PERFECT_SCORE_INSUFFICIENT_ACTIVITY: 'perfect-score-insufficient-activity-evidence',
  SINGLE_SIGNAL_NARRATIVE: 'single-signal-narrative',
  REVIEW_REQUIRED_INSPECTIONS: 'review-required-inspections',
} as const;

export type ExcellenceReasonCode =
  (typeof EXCELLENCE_REASON_CODES)[keyof typeof EXCELLENCE_REASON_CODES];

export const EXCELLENCE_GENERATOR_VERSION = 'safety-excellence-scoring/0.1';
