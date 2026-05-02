# Wave 12 Risk and Constraint Exposure Model

Date: 2026-05-02
Wave: 12
Module: `Constraints Log` (`Make-Ready Constraint & Risk Exposure Center`)

## Objective

Define the scoring, severity, state, and validation model for embedded risk and constraint exposure posture used by Wave 12 governance workflows.

## Boundary Terms

- Risk: uncertain future event or condition.
- Constraint: known blocker to planned work.
- Issue: active problem.
- Delay exposure: potential or actual schedule-impact condition requiring review.
- Change exposure: potential or actual scope/cost/contract impact condition requiring review.

## Impact Dimensions

Impact scoring is evaluated across these dimensions:

- Schedule
- Cost
- Safety
- Quality
- Contract/Compliance
- Client/Owner Impact
- Logistics/Access
- Reputation/Executive Visibility

### Governing Impact Rule

`governingImpactScore = max(impactDimensionScores)`

The highest scored impact dimension governs overall impact for risk and constraint severity calculations.

## 5x5 Risk Matrix

Risk score = `Likelihood (1-5) x Governing Impact (1-5)`.

| Impact \ Likelihood | 1 Rare | 2 Unlikely | 3 Possible | 4 Likely | 5 Almost Certain |
| ------------------- | -----: | ---------: | ---------: | -------: | ---------------: |
| 1 Negligible        |      1 |          2 |          3 |        4 |                5 |
| 2 Minor             |      2 |          4 |          6 |        8 |               10 |
| 3 Moderate          |      3 |          6 |          9 |       12 |               15 |
| 4 Major             |      4 |          8 |         12 |       16 |               20 |
| 5 Severe            |      5 |         10 |         15 |       20 |               25 |

## Likelihood Scale (1-5)

1. Rare: highly improbable in current execution window.
2. Unlikely: possible but not expected under current controls.
3. Possible: credible occurrence path exists.
4. Likely: expected under current conditions without intervention.
5. Almost Certain: near-inevitable without immediate intervention.

## Impact Scale (1-5)

1. Negligible: minimal operational impact.
2. Minor: localized impact with low recovery cost/time.
3. Moderate: material impact to planned work sequencing.
4. Major: significant project disruption or milestone threat.
5. Severe: critical impact with broad schedule/cost/contract exposure.

## Initial and Residual Risk Scoring

- Initial risk score: pre-mitigation likelihood x governing impact.
- Residual risk score: post-mitigation likelihood x governing impact.
- Residual score cannot be marked lower without documented mitigation rationale.
- Score history should preserve both initial and residual posture for trend review.

## Constraint Exposure Scoring

Constraint exposure score = `Urgency (1-5) x Governing Impact (1-5)`.

Urgency scale:

1. Watchlist: no immediate execution threat.
2. Near-term: upcoming window pressure.
3. Active planning pressure: sequencing risk is material.
4. Imminent blocker: near-certain disruption without intervention.
5. Critical blocker: active obstruction to planned work.

## Severity Bands

- 1-4: Low
- 5-9: Moderate
- 10-14: High
- 15-19: Very High
- 20-25: Critical

## Severity Override Rules

Overrides may raise band/severity when any of the following apply:

- Regulatory/permitting deadline jeopardy.
- Contractual milestone exposure with immediate delivery risk.
- Multi-path dependency block affecting multiple crews/trades.
- Repeated unresolved escalation beyond defined SLA window.
- Executive-directed escalation due to cross-project impact.
- Explicit safety exposure requiring immediate command attention.

Overrides do not reduce severity bands; reductions require updated base scoring and mitigation evidence.

## Required Actions by Severity

- Low: assign owner, monitor on cadence, maintain notes.
- Moderate: assign owner + due date, add mitigation action, weekly review.
- High: escalate to Priority Actions, define mitigation plan, twice-weekly review.
- Very High: leadership review, immediate unblock plan, daily tracking until stabilized.
- Critical: executive escalation, immediate response plan, active blocker management with daily command review.

## Risk State Machine

`draft -> identified -> assessed -> response-planned -> monitoring -> triggered -> converted | closed | retired`

State intent:

- `draft`: initial capture before formal intake.
- `identified`: recognized as a candidate uncertain future event/condition.
- `assessed`: likelihood/impact scored.
- `response-planned`: mitigation/contingency defined.
- `monitoring`: active tracking cadence established.
- `triggered`: event has occurred or become active.
- `converted`: converted into active issue/constraint handling path.
- `closed`: resolved and no further action required.
- `retired`: no longer relevant due to project/context change.

## Constraint State Machine

`draft -> identified -> accepted -> action-planned -> in-progress | awaiting-external-party | at-risk | overdue -> resolved-pending-validation -> resolved`

State intent:

- `draft`: preliminary blocker capture.
- `identified`: known blocker recognized.
- `accepted`: validated as an active constraint.
- `action-planned`: owner and mitigation steps defined.
- `in-progress`: mitigation is actively being executed.
- `awaiting-external-party`: blocked by outside response/dependency.
- `at-risk`: mitigation path is slipping or insufficient.
- `overdue`: planned resolution window has passed.
- `resolved-pending-validation`: mitigation completed, awaiting confirmation.
- `resolved`: verified as no longer blocking planned work.

## TypeScript-Ready Interface Sketches (Documentation Only)

These sketches are non-runtime documentation aids and do not create implementation contracts until a later source-code wave.

```ts
export interface ImpactScores {
  schedule: 1 | 2 | 3 | 4 | 5;
  cost: 1 | 2 | 3 | 4 | 5;
  safety: 1 | 2 | 3 | 4 | 5;
  quality: 1 | 2 | 3 | 4 | 5;
  contractCompliance: 1 | 2 | 3 | 4 | 5;
  clientOwnerImpact: 1 | 2 | 3 | 4 | 5;
  logisticsAccess: 1 | 2 | 3 | 4 | 5;
  reputationExecutiveVisibility: 1 | 2 | 3 | 4 | 5;
}

export interface ExposureBand {
  key: 'low' | 'moderate' | 'high' | 'very-high' | 'critical';
  minScoreInclusive: number;
  maxScoreInclusive: number;
  requiredAction: string;
}

export interface SeverityOverrideRule {
  code: string;
  label: string;
  triggerDescription: string;
  minBandAfterOverride: ExposureBand['key'];
}

export interface RiskItem {
  id: string;
  state:
    | 'draft'
    | 'identified'
    | 'assessed'
    | 'response-planned'
    | 'monitoring'
    | 'triggered'
    | 'converted'
    | 'closed'
    | 'retired';
  likelihood: 1 | 2 | 3 | 4 | 5;
  impactScores: ImpactScores;
  governingImpactScore: 1 | 2 | 3 | 4 | 5;
  initialRiskScore: number;
  residualRiskScore?: number;
  exposureBand: ExposureBand['key'];
  appliedOverrideCodes?: string[];
}

export interface ConstraintExposureScore {
  urgency: 1 | 2 | 3 | 4 | 5;
  governingImpactScore: 1 | 2 | 3 | 4 | 5;
  exposureScore: number;
  exposureBand: ExposureBand['key'];
  appliedOverrideCodes?: string[];
}

export interface ConstraintItem {
  id: string;
  state:
    | 'draft'
    | 'identified'
    | 'accepted'
    | 'action-planned'
    | 'in-progress'
    | 'awaiting-external-party'
    | 'at-risk'
    | 'overdue'
    | 'resolved-pending-validation'
    | 'resolved';
  impactScores: ImpactScores;
  exposure: ConstraintExposureScore;
}

export interface RiskMatrixConfig {
  likelihoodScale: readonly string[];
  impactScale: readonly string[];
  bands: readonly ExposureBand[];
  overrideRules: readonly SeverityOverrideRule[];
}
```

## Read-Model Contract Expectations (Documentation Only)

- Posture assumes future GET-only read-model consumption for Wave 12 exposure summaries and item collections.
- Envelope expectations align with existing PCC read-model conventions: response envelope + source status semantics.
- Degraded-state behavior must return stable shape with reduced/empty project data, not contract-breaking payloads.
- Unknown-project behavior should return deterministic degraded/not-found posture per read-model conventions.
- No write-route assumption is authorized by this documentation wave.

## Fixture Requirements (Documentation Only)

Fixture coverage should include representative records for:

- Risks across all severity bands.
- Constraints across all severity bands.
- Initial and residual risk deltas.
- Overdue constraints.
- Converted risks (risk -> active issue/constraint path).
- Critical-path exposure scenarios.
- Safety-driven override scenarios.
- Contractual milestone override scenarios.
- Awaiting-external-party blockers.

## Validation and Test Requirements (Documentation Only)

Validation/test requirements for later implementation waves:

- Scoring calculations for risk and constraint exposure.
- Governing impact rule correctness (`max` impact dimension).
- Severity band mapping correctness.
- Override application behavior (raise-only semantics).
- State transition validity for both state machines.
- Degraded read-model behavior and unknown-project behavior.
- Fixture determinism and repeatability.
- Guard tests ensuring no prohibited runtime/external integration imports are introduced by model-only waves.

## Alignment and Guardrails

- Governing docs place Wave 12 under Project Readiness.
- Current source model maps `constraints-log` to `risk-issues-decision`.
- This document records alignment posture only and does not authorize source edits.
- JSON references in `wave-12/reference/` are documentation configuration references only, not runtime schemas/contracts or package-consumed artifacts.
- No automated legal, claim, entitlement, compensability, delay-damages, or forensic schedule conclusions.
- No external-system writeback or runtime mutation behavior is defined by this model.
- This model does not authorize runtime implementation in this documentation wave.
