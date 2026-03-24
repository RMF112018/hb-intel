/**
 * P3-E8-T09 Publication contract types.
 * Composite scorecard, PER projection, spine events, work queue, related items,
 * reports, handoffs, next-move prompts.
 */

import type { IncidentType, SSSPStatus } from '../records/enums.js';
import type { InspectionScoreBand, InspectionTrendDirection } from '../inspection/enums.js';
import type { ReadinessDecision } from '../readiness/enums.js';
import type {
  SafetyPosture,
  SafetyActivityEventType,
  SafetyRelationshipType,
  SafetyReportType,
} from './enums.js';

// -- Composite Safety Scorecard (§2.1) --------------------------------------

export interface ISafetyCompositeScorecard {
  readonly projectId: string;
  readonly computedAt: string;

  readonly inspectionTrend: {
    readonly latestNormalizedScore: number | null;
    readonly trendDirection: InspectionTrendDirection;
    readonly windowWeeks: number;
    readonly inspectionCount: number;
    readonly latestInspectionDate: string | null;
  };

  readonly correctiveActions: {
    readonly openCount: number;
    readonly overdueCount: number;
    readonly criticalOpenCount: number;
    readonly averageDaysOpen: number | null;
    readonly majorOverdueCount: number;
  };

  readonly readiness: {
    readonly projectDecision: ReadinessDecision;
    readonly subcontractorsNotReady: number;
    readonly activitiesWithHardBlockers: number;
    readonly activeProjectBlockers: number;
    readonly activeExceptions: number;
  };

  readonly blockers: {
    readonly hardBlockersActive: number;
    readonly softBlockersActive: number;
    readonly exceptionsActive: number;
    readonly overridesActive: number;
  };

  readonly compliance: {
    readonly ssspStatus: SSSPStatus;
    readonly inspectionCurrentWeekComplete: boolean;
    readonly subcontractorsWithMissingSubmissions: number;
    readonly certificationsExpiringSoon: number;
    readonly certificationsExpired: number;
    readonly orientationCompletionRate: number | null;
  };

  readonly overallPosture: SafetyPosture;
}

// -- PER Projection (§2.3) — Sanitized ------------------------------------

export interface ISafetyScorecardPERProjection {
  readonly projectId: string;
  readonly computedAt: string;

  readonly overallPosture: SafetyPosture;
  readonly inspectionScoreBand: InspectionScoreBand | null;
  readonly trendDirection: InspectionTrendDirection;
  readonly openCorrectiveActionCount: number;
  readonly overdueCorrectiveActionCount: number;
  readonly projectReadinessDecision: ReadinessDecision;
  readonly activeBlockerCount: number;
  readonly incidentCountThisMonth: number;
  readonly incidentTypeSummary: Readonly<Partial<Record<IncidentType, number>>>;
  readonly ssspApproved: boolean;
}

// -- Activity Spine Event (§3) ----------------------------------------------

export interface ISafetyActivityEvent {
  readonly eventType: SafetyActivityEventType;
  readonly projectId: string;
  readonly actorId: string | null;
  readonly timestamp: string;
  readonly summary: string;
  readonly visibility: string;
}

// -- Work Queue Rule (§4) --------------------------------------------------

export interface ISafetyWorkQueueRule {
  readonly ruleId: string;
  readonly trigger: string;
  readonly itemTitle: string;
  readonly priority: string;
  readonly assignees: string;
  readonly resolutionTrigger: string;
}

// -- Related Items (§5) ----------------------------------------------------

export interface ISafetyRelatedItemDeclaration {
  readonly recordA: string;
  readonly relationshipType: SafetyRelationshipType;
  readonly recordB: string;
}

// -- Reports (§6) ----------------------------------------------------------

export interface ISafetyReportDefinition {
  readonly reportType: SafetyReportType;
  readonly description: string;
  readonly audience: string;
  readonly privacyEnforced: boolean;
}

// -- Workflow Handoff (§7) --------------------------------------------------

export interface ISafetyHandoffScenario {
  readonly scenario: string;
  readonly fromRole: string;
  readonly toRole: string;
  readonly reason: string;
}

// -- BIC Next-Move Prompt (§8) ----------------------------------------------

export interface ISafetyNextMovePrompt {
  readonly context: string;
  readonly promptText: string;
  readonly condition: string;
}
