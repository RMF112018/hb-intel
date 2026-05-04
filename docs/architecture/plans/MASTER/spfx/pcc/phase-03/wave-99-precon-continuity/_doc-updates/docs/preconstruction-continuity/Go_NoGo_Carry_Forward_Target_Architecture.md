# Go / No-Go Carry-Forward Target Architecture

## Purpose

Go / No-Go Carry-Forward preserves final pursuit-decision context for downstream project users after a GO decision. It is a source-owned upstream BD / Pursuit governance workflow with a PCC read-only carry-forward projection.

## Closed Decisions

- Go / No-Go is not a standalone PCC MVP module.
- PCC does not own the source decision workflow.
- PCC displays a carry-forward projection only after GO.
- PCC does not project NO-GO records into active project PCC unless a future archive/reference policy allows a redacted future-reference view.
- Final GO decision fields are immutable in PCC.
- PCC projection can be superseded only by a newer source-backed projection.
- Sensitive scorecard, strategy, executive, margin, client, and committee fields require classification.

## Unified Lifecycle Alignment

| Lifecycle Contract | Go / No-Go Carry-Forward Behavior |
|---|---|
| Lifecycle Spine | creates `pursuit-decision-finalized` and `go-carry-forward-projected` events |
| Project Memory | creates restricted/summary-safe decision rationale and assumption memory records |
| Role/Stage Lenses | executive, estimating, preconstruction, operations, and future-reference lenses see different redaction levels |
| Traceability | links decision rationale and assumptions to kickoff, readiness, operations outcomes, lessons |
| HBI | may answer only from citation-eligible projected records; restricted comments trigger refusal or masked output |
| Audit | sensitive record view, source link launch, HBI query, redaction, and carry-forward acceptance are auditable |

## Target PCC Display

### Project Home

Display summary-safe:

- decision: GO;
- decision date;
- decision owner / committee reference;
- score band or score posture;
- high-level why-we-pursued summary;
- source-lineage chip;
- sensitive-content indicator when restricted details exist.

### Executive Oversight

Display more complete, permission-filtered:

- committee score details;
- executive override indicator;
- strategic rationale;
- client/market/relationship sensitivity;
- margin/fee/staffing assumptions if permitted;
- source links and audit posture.

### Project Readiness

Display:

- carry-forward present/missing;
- kickoff needed;
- high-risk assumptions needing validation;
- source evidence present/missing;
- priority-action candidates.

### Project Memory

Display:

- accepted carry-forward decision summary;
- assumptions;
- differentiators;
- risk flags;
- strategy notes if permitted;
- supersession history.

## State Machine

```text
source-draft -> source-under-review -> source-final-go -> projected-to-pcc -> accepted-carry-forward -> superseded | archived
source-draft -> source-final-no-go -> archived-source-only
```

## Required Fields

- `carryForwardId`
- `projectId`
- `sourceDecisionId`
- `sourceSystem`
- `decision`
- `decisionDate`
- `scoreSummary`
- `scoreBand`
- `whyPursuedSummary`
- `winStrategySummary`
- `differentiators`
- `assumptions`
- `riskFlags`
- `executiveOverride`
- `sourceLineage`
- `evidenceLinks`
- `securityClassification`
- `redactionLevel`
- `hbiEligibility`
- `auditEvents`
- `traceabilityEdges`

## Forbidden Behaviors

- source scorecard mutation;
- manual overwrite of final source decision;
- legal/accounting/profit guarantee language;
- exposure of restricted comments to unauthorized personas;
- automatic project creation;
- automatic staffing commitment;
- external-system writeback.
