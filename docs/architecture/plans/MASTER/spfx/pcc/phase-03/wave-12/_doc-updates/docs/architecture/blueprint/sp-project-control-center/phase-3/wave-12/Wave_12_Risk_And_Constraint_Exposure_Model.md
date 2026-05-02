# Wave 12 Risk and Constraint Exposure Model

## Purpose

This document defines the build-ready risk and constraint scoring, lifecycle, state transition, data model, validation, and acceptance contract for the Constraints Log module.

## Risk Scoring

### Likelihood

| Score | Label | Definition |
|---:|---|---|
| 1 | Rare | Not expected to occur; less than 10% likelihood. |
| 2 | Unlikely | Could occur, but not expected; 10–30% likelihood. |
| 3 | Possible | Plausible under current conditions; 31–60% likelihood. |
| 4 | Likely | Expected unless action is taken; 61–80% likelihood. |
| 5 | Almost Certain | Expected or already trending toward occurrence; greater than 80% likelihood. |

### Impact

| Score | Label | Definition |
|---:|---|---|
| 1 | Insignificant | Minimal impact; absorbed within normal project management. |
| 2 | Minor | Localized impact; manageable without milestone, budget, safety, quality, or client exposure. |
| 3 | Moderate | Meaningful project impact; may affect float, rework, cost, client confidence, or coordination. |
| 4 | Major | Significant exposure; may affect milestone, cost, safety, quality, compliance, or owner commitments. |
| 5 | Severe | Critical exposure; may affect contractual milestone, life safety, regulatory compliance, major cost, or executive/client relationship. |

### Impact Dimensions

- schedule
- cost
- safety
- quality
- contractCompliance
- clientOwnerImpact
- logisticsAccess
- reputationExecutiveVisibility

### Governing Impact

```text
governingImpactScore = max(all impact dimension scores)
```

### Initial Risk Score

```text
initialRiskScore = likelihoodScore × governingImpactScore
```

### Residual Risk Score

```text
residualRiskScore = residualLikelihoodScore × residualGoverningImpactScore
```

### Bands

| Score | Band | Required posture |
|---:|---|---|
| 1–4 | Low | Monitor through normal review. |
| 5–9 | Moderate | Owner and response plan required. |
| 10–16 | High | Owner, mitigation, due date, review cadence, and PX visibility required. |
| 17–25 | Critical | Immediate escalation, PX review, executive visibility, response plan, and Priority Action candidate required. |

### Severity Overrides

- Safety impact = 5: Critical.
- Safety impact = 4: cannot be lower than High.
- Contract/compliance impact = 5: Critical.
- Linked contractual milestone at risk and likelihood ≥ 3: cannot be lower than High.
- Executive/client impact = 5 and likelihood ≥ 3: Critical.
- Residual High/Critical after mitigation: escalation owner and review cadence required.

## Constraint Exposure Scoring

Constraints use urgency × impact, not likelihood × impact.

### Urgency

| Score | Label | Definition |
|---:|---|---|
| 1 | Future | Need-by date is more than 30 calendar days away. |
| 2 | Upcoming | Need-by date is 15–30 calendar days away. |
| 3 | Near-term | Need-by date is 8–14 calendar days away. |
| 4 | Immediate | Need-by date is 1–7 calendar days away, or linked work is in the active lookahead window. |
| 5 | Overdue / blocking now | Need-by date has passed, linked work is current-week work, or float is zero/negative. |

### Score

```text
constraintExposureScore = urgencyScore × governingImpactScore
```

### Overrides

- Overdue and linked to current-week work: Critical.
- Critical-path exposure and urgency ≥ 4: Critical.
- Safety impact ≥ 4: cannot be lower than High.
- Contractual milestone exposure and urgency ≥ 4: Critical.
- Converted to delay/change event: cannot be lower than High until linked item closes.
- No owner assigned and urgency ≥ 3: cannot be lower than High.

## State Machines

### Constraint Statuses

- draft
- identified
- accepted
- action-planned
- in-progress
- awaiting-external-party
- at-risk
- overdue
- resolved-pending-validation
- resolved
- deferred
- not-applicable
- converted-to-issue
- converted-to-delay-event
- converted-to-change-event

### Constraint Transitions

| From | Allowed transitions |
|---|---|
| draft | identified, deferred, not-applicable |
| identified | accepted, deferred, not-applicable |
| accepted | action-planned, awaiting-external-party, at-risk |
| action-planned | in-progress, awaiting-external-party, at-risk |
| in-progress | resolved-pending-validation, at-risk, overdue, awaiting-external-party |
| awaiting-external-party | in-progress, at-risk, overdue |
| at-risk | in-progress, overdue, converted-to-issue, converted-to-delay-event, converted-to-change-event |
| overdue | in-progress, resolved-pending-validation, converted-to-issue, converted-to-delay-event, converted-to-change-event |
| resolved-pending-validation | resolved, in-progress |
| resolved | in-progress only by PM/PX/Superintendent reopen action |
| deferred | identified |
| not-applicable | identified by PM/PX |
| converted states | resolved, linked-only |

### Risk Statuses

- draft
- identified
- assessed
- response-planned
- monitoring
- triggered
- converted-to-constraint
- closed
- deferred
- retired

### Risk Transitions

| From | Allowed transitions |
|---|---|
| draft | identified, deferred |
| identified | assessed, deferred |
| assessed | response-planned, monitoring, closed |
| response-planned | monitoring, triggered, closed |
| monitoring | triggered, assessed, closed, retired |
| triggered | converted-to-constraint, closed |
| converted-to-constraint | monitoring, closed |
| closed | monitoring only by PM/PX reopen action |
| deferred | identified |
| retired | reopened only by PM/PX |

## Data Model Interfaces

```ts
export interface ConstraintItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: ConstraintCategory;
  subcategory?: string;
  sourceType: ConstraintSourceType;
  status: ConstraintStatus;
  dateIdentified: string;
  needByDate: string;
  promisedResolutionDate?: string;
  forecastResolutionDate?: string;
  actualResolutionDate?: string;
  lastUpdatedDate: string;
  responsibleCompanyId?: string;
  responsibleCompanyName?: string;
  responsiblePersonId?: string;
  responsiblePersonName?: string;
  ballInCourtRole?: PccPersona;
  ballInCourtPersonId?: string;
  escalationOwnerId?: string;
  linkedScheduleActivityIds: string[];
  linkedLookaheadWeek?: string;
  linkedMilestoneIds: string[];
  linkedLocationIds: string[];
  linkedTradeIds: string[];
  linkedWorkPackageIds: string[];
  urgencyScore: 1 | 2 | 3 | 4 | 5;
  impactScores: ImpactScores;
  governingImpactScore: 1 | 2 | 3 | 4 | 5;
  exposureScore: number;
  exposureBand: ExposureBand;
  criticalPathExposure: boolean;
  floatDaysRemaining?: number;
  evidenceLinks: EvidenceReference[];
  relatedRiskIds: string[];
  relatedIssueIds: string[];
  relatedDelayEventIds: string[];
  relatedChangeEventIds: string[];
  relatedPermitIds: string[];
  relatedInspectionIds: string[];
  relatedRfiIds: string[];
  relatedSubmittalIds: string[];
  rootCauseCategory?: RootCauseCategory;
  rootCause?: string;
  varianceReason?: string;
  repeatConstraint: boolean;
  lessonsLearnedNote?: string;
  comments: CommentRecord[];
  auditEvents: AuditEvent[];
  sourceTraceability: SourceTraceability;
}
```

```ts
export interface RiskItem {
  id: string;
  projectId: string;
  title: string;
  riskStatement: string;
  cause: string;
  event: string;
  consequence: string;
  category: RiskCategory;
  status: RiskStatus;
  dateIdentified: string;
  reviewDate: string;
  triggerCondition: string;
  ownerPersonId: string;
  ownerPersonName: string;
  ownerCompanyId?: string;
  escalationOwnerId?: string;
  likelihoodScore: 1 | 2 | 3 | 4 | 5;
  impactScores: ImpactScores;
  governingImpactScore: 1 | 2 | 3 | 4 | 5;
  initialRiskScore: number;
  initialRiskBand: ExposureBand;
  responseStrategy: RiskResponseStrategy;
  responsePlan: string;
  responseOwnerId: string;
  responseDueDate: string;
  residualLikelihoodScore: 1 | 2 | 3 | 4 | 5;
  residualImpactScores: ImpactScores;
  residualGoverningImpactScore: 1 | 2 | 3 | 4 | 5;
  residualRiskScore: number;
  residualRiskBand: ExposureBand;
  linkedConstraintIds: string[];
  convertedConstraintId?: string;
  evidenceLinks: EvidenceReference[];
  comments: CommentRecord[];
  auditEvents: AuditEvent[];
  sourceTraceability: SourceTraceability;
}
```

## Read Model Contract

```text
GET /api/pcc/projects/{projectId}/constraints-log
```

```ts
export interface ConstraintsLogReadModel {
  projectId: string;
  generatedAt: string;
  sourceStatus: PccSourceStatus;
  mode: 'fixture' | 'backend' | 'degraded';
  summary: ConstraintsLogSummary;
  constraints: ConstraintItem[];
  risks: RiskItem[];
  matrixConfig: RiskMatrixConfig;
  savedViews: SavedViewDefinition[];
  priorityActionCandidates: PriorityActionCandidate[];
  rootCauseSummary: RootCauseSummary;
  integrationReferences: IntegrationReference[];
  warnings: PccReadModelWarning[];
}
```

## Fixture Requirements

- At least 20 constraints.
- At least 15 risks.
- At least 5 High constraints.
- At least 3 Critical constraints.
- At least 3 residual High/Critical risks.
- At least 3 overdue constraints.
- At least 5 due-in-7-days constraints.
- At least 5 linked schedule activity examples.
- At least 5 evidence reference examples.
- At least 3 risks converted to constraints.
- At least 2 constraints linked to delay exposure.
- At least 2 constraints linked to change exposure.
- At least 1 safety-driven severity override.
- At least 1 contractual milestone override.
- At least 1 external-party blocker.
- At least 1 no-owner exception.
- At least 1 resolved item with lessons learned.
- At least 1 stale risk review.
