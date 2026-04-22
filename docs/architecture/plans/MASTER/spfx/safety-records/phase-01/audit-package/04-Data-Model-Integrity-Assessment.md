# 04-Data-Model-Integrity-Assessment

## Overall Assessment

The intended domain model is directionally good:

- inspection event is first-class
- project-week is derived
- raw parsed evidence is preserved
- findings are child records

However, the current SharePoint data contract is **not** actually aligned with real SharePoint lookup semantics, and that is a critical blocker.

## Positive Model Decisions

### Inspection-event-first design
This is correct. `SafetyInspectionEvent` is the right primary durable record for Release 1.

### Raw + derived persistence
Retaining `rawChecklistJson` on the inspection event is a good choice. It supports:

- future rescoring
- parser migration
- auditability
- defect investigation

### Separate findings list
This is appropriate and not overengineered for Release 1.

### Derived project-week list
Keeping a project-week rollup list is also reasonable so long as it remains derived and repairable.

## Critical Contract Defect

## SharePoint Lookup fields vs string business IDs

### Repo-truth mismatch
The domain model uses string IDs for core entities:

- `SafetyReportingPeriod.id`
- `SafetyProjectWeekRecord.id`
- `SafetyInspectionEvent.id`
- `SafetyFinding.id`
- `SafetyIngestionRun.id`

The field schema defines relationship fields as SharePoint **Lookup** fields:

- `SafetyProjectWeekRecords.ReportingPeriodId`
- `SafetyInspectionEvents.ProjectWeekRecordId`
- `SafetyInspectionEvents.ReportingPeriodId`
- `SafetyFindings.InspectionEventId`
- `SafetyFindings.ProjectWeekRecordId`

`runIngestionPipeline.ts` populates those relationship fields using string business IDs such as:

- `context.reportingPeriodId`
- `projectWeek.id`
- `inspectionEventId`

### Why this is wrong
Real SharePoint lookup columns expect **numeric list item IDs** of the target list items, not arbitrary string business keys.

### Consequence
Even if a SharePoint repository file were restored, the current domain/list contract still would not safely support the declared lookup-based persistence model without an additional item-ID mapping layer.

### Severity
**P0**

## Weekly Derivation Integrity Defect

The unit test for `computeProjectWeekRollup()` correctly encodes the seeded `92.2% + 93.3%` pattern as a weekly average.

But the live ingestion path does not feed the rollup with all weekly inspections, only same-date inspections.

That means the data model is only partially preserved in unit isolation and is not preserved in the end-to-end ingest path.

### Severity
**P1**

## Reporting-Period Modeling Weakness

The ingestion-run model does not durably carry reporting-period identity, and the pipeline does not validate that the inspection date belongs to the selected reporting period.

That weakens:

- audit reconstruction
- replay targeting
- weekly reporting integrity

### Severity
**P1**

## Reference Source Modeling Weakness

The README says project resolution is authoritative against:

- `Projects`
- `Legacy Project Fallback Registry`

But the safety package does not expose those reference source bindings with the same explicit descriptor model used for the five custom safety lists.

That is an underdeveloped backend contract for a load-bearing resolution dependency.

### Severity
**P1**

## What Does Not Need More Architecture Right Now

These parts are sufficient in principle for Release 1 once the blocking defects are fixed:

- one inspection-events list
- one findings list
- one project-week list
- one reporting-period list
- one ingestion-runs list
- raw parsed JSON stored on the inspection event

A separate raw-answer child list is **not required now**. The JSON payload is sufficient for Release 1 if it remains durable and parsable.

## Conclusion

The domain model is promising, but the actual SharePoint persistence contract is not yet viable. The most important repair is to separate business identifiers from SharePoint item identifiers and make the relationship fields truthful to the real storage engine.

## Required Remediation Direction

1. Add explicit numeric SharePoint item-ID handling for all lookup-backed relationships.
2. Keep business IDs if desired, but store them separately from SharePoint item IDs.
3. Repair weekly derivation so project-week records truly remain derived from weekly inspection events.
4. Add durable reporting-period identity to ingestion runs and commit artifacts.
