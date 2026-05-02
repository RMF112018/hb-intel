# Wave 12 Required Fields, Statuses, Scoring, and State Contracts

This reference translates Wave 12 documentation posture into implementation expectations. Local code must inspect existing PCC model vocabulary and reuse repo-standard types wherever appropriate.

## Module Identity

```text
Official module name: Constraints Log
User-facing subtitle: Make-Ready Constraint & Risk Exposure Center
Module id: constraints-log
Preferred governance posture: Project Readiness
```

## Boundary Definitions

- Risk = uncertain future event or condition.
- Constraint = known blocker to planned work.
- Issue = active problem.
- Delay exposure = potential or actual schedule-impact condition requiring review.
- Change exposure = potential or actual scope/cost/contract impact requiring review.

## Workbook-Derived Seed Categories

From `default_constraints_log_seed_structure.json`, use workbook sections as taxonomy / seed categories only:

- Permits — Open / Closed
- AHJ Coordination — Open / Closed
- Design Development — Open / Closed
- Utility Service Providers — Open / Closed
- Hedrick Brothers Internal Coordination Items — Open / Closed
- Construction Progress — Open / Closed
- Placeholder / New Section templates
- Change Tracking source context
- Delay Log source context

No workbook row becomes an active default runtime constraint. Project-specific verification is required for activation.

## Workbook Field Vocabulary

Workbook source fields include:

```text
No #
DESCRIPTION
DATE IDENTIFIED
STATUS
DAYS ELAPSED
REFERENCE
RESPONSIBLE
B.I.C
DUE
COMPLETION DATE
COMMENTS
```

Implementation should normalize these into repo-consistent field names, likely including:

- id / itemNumber;
- title / description;
- type: risk | constraint | issue | delay-exposure | change-exposure;
- sourceCategory;
- dateIdentified;
- status/state;
- daysElapsed / agingDays;
- responsibleParty;
- ballInCourt / currentActionOwner;
- needByDate;
- promisedDate;
- dueDate;
- deliveredDate / completionDate;
- references / evidenceLinks;
- comments / history;
- sourceLineage;
- confidence / sourceHealth.

## Impact Dimensions

Implement impact scores across the documented dimensions:

- schedule;
- cost;
- safety;
- quality;
- contract/compliance;
- client/owner impact;
- logistics/access;
- reputation/executive visibility.

Governing impact rule:

```text
governingImpactScore = max(impactDimensionScores)
```

## Risk Matrix

Risk scoring:

```text
riskScore = likelihood * governingImpactScore
```

Likelihood scale:

1. rare
2. unlikely
3. possible
4. likely
5. almost-certain

Impact scale:

1. negligible
2. minor
3. moderate
4. major
5. severe

Risk state machine:

```text
draft -> identified -> assessed -> response-planned -> monitoring -> triggered -> converted | closed | retired
```

Implementation must convert this into an explicit allowed-transition map with tests.

## Constraint Exposure Matrix

Constraint exposure scoring:

```text
constraintExposureScore = urgency * governingImpactScore
```

Urgency scale:

1. watchlist
2. near-term
3. active-planning-pressure
4. imminent-blocker
5. critical-blocker

Constraint state machine:

```text
draft -> identified -> accepted -> action-planned -> in-progress | awaiting-external-party | at-risk | overdue -> resolved-pending-validation -> resolved
```

Implementation must convert this into an explicit allowed-transition map with tests.

## Severity Bands

- `low`: 1–4
- `moderate`: 5–9
- `high`: 10–14
- `very-high`: 15–19
- `critical`: 20–25

## Severity Override Rules

Overrides may raise severity, never reduce it. Required override scenarios:

- regulatory/permitting deadline jeopardy;
- contractual milestone exposure with immediate delivery risk;
- multi-path dependency block affecting multiple crews/trades;
- repeated unresolved escalation beyond defined SLA window;
- executive-directed escalation due to cross-project impact;
- explicit safety exposure requiring immediate command attention.

## Required Fixture Coverage

Fixtures must be deterministic and include:

- at least one risk in every severity band;
- at least one constraint in every severity band;
- initial vs residual risk deltas;
- overdue constraints;
- due-within-window constraints;
- converted risk to active issue/constraint path;
- critical path / look-ahead exposure reference;
- safety-driven severity override;
- regulatory/permitting severity override;
- contractual milestone override;
- awaiting-external-party blocker;
- missing owner / ball-in-court gap;
- Document Control evidence-link reference only;
- Priority Actions candidate reference only;
- Project Readiness source-lineage reference;
- Wave 9 lifecycle readiness reference;
- Wave 10 permit/inspection reference;
- Wave 11 responsibility reference;
- Wave 14 approvals/checkpoints reference only;
- external-system launcher/reference only.
