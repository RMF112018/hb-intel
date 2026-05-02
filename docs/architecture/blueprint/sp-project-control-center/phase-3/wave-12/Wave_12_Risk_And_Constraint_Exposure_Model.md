# Wave 12 Risk and Constraint Exposure Model

Date: 2026-05-02
Wave: 12
Module: `Constraints Log` (`Make-Ready Constraint & Risk Exposure Center`)

## Objective

Define the scoring and severity model for embedded risk and constraint exposure posture used by Wave 12 governance workflows.

## Boundary Terms

- Risk: uncertain future event or condition.
- Constraint: known blocker to planned work.
- Issue: active problem.
- Delay exposure: potential or actual schedule-impact condition requiring review.
- Change exposure: potential or actual scope/cost/contract impact condition requiring review.

## 5x5 Risk Matrix

Risk score = `Likelihood (1-5) x Impact (1-5)`.

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

- Initial risk score: pre-mitigation likelihood x impact.
- Residual risk score: post-mitigation likelihood x impact.
- Residual score cannot be marked lower without documented mitigation rationale.
- Score history should preserve both initial and residual posture for trend review.

## Constraint Exposure Scoring

Constraint severity score = `Urgency (1-5) x Impact (1-5)`.

Urgency scale:

1. Watchlist: no immediate execution threat.
2. Near-term: upcoming window pressure.
3. Active planning pressure: sequencing risk is material.
4. Imminent blocker: near-certain disruption without intervention.
5. Critical blocker: active obstruction to planned work.

Impact scale reuses the 1-5 impact definition above.

## Severity Bands

- 1-4: Low
- 5-9: Moderate
- 10-14: High
- 15-19: Very High
- 20-25: Critical

## Severity Overrides

Overrides may raise band/severity when any of the following apply:

- Regulatory/permitting deadline jeopardy.
- Contractual milestone exposure with immediate delivery risk.
- Multi-path dependency block affecting multiple crews/trades.
- Repeated unresolved escalation beyond defined SLA window.
- Executive-directed escalation due to cross-project impact.

Overrides do not reduce severity bands; reductions require updated base scoring and mitigation evidence.

## Required Actions by Severity

- Low: assign owner, monitor on cadence, maintain notes.
- Moderate: assign owner + due date, add mitigation action, weekly review.
- High: escalate to Priority Actions, define mitigation plan, twice-weekly review.
- Very High: leadership review, immediate unblock plan, daily tracking until stabilized.
- Critical: executive escalation, immediate response plan, active blocker management with daily command review.

## Exposure Type Handling

- Delay exposure flags schedule-impact conditions for review and planning intervention.
- Change exposure flags scope/cost/contract impact conditions for review and coordination.
- Exposure flags guide governance workflow and prioritization only; they do not create legal/claim determinations.

## Guardrails

- No automated legal, claim, entitlement, compensability, delay-damages, or forensic schedule conclusions.
- No external-system writeback or runtime mutation behavior is defined by this model.
- Scoring supports project-controls prioritization and review posture only.
