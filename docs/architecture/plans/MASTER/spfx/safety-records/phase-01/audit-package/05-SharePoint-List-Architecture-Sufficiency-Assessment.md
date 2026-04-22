# 05-SharePoint-List-Architecture-Sufficiency-Assessment

## Overall Assessment

The current list architecture is **not yet sufficient for the implemented backend logic**.

The five custom lists are a sensible core, but several important concerns are either missing or underdeveloped in the durable storage model.

## Current Core List Set

Structured safety lists currently modeled:

- `Safety Reporting Periods`
- `Safety Project Week Records`
- `Safety Inspection Events`
- `Safety Findings`
- `Safety Ingestion Runs`

Supporting source/location assumptions:

- `Safety Checklist Uploads` library on `/sites/Safety`
- `Projects` on `/sites/HBCentral`
- `Legacy Project Fallback Registry` on `/sites/HBCentral`

## Classification of Architecture Findings

## Critical missing architecture

### 1. No viable SharePoint item-ID contract for lookup-backed relationships
The field schema uses Lookup fields, but the domain contract uses string business IDs and the pipeline writes those strings as if they were lookup parents.

**Why this is critical:** real SharePoint persistence cannot safely honor the schema without a separate item-ID model.

**Act now:** Yes.

---

## Major underdeveloped architecture

### 2. `Safety Ingestion Runs` does not durably carry reporting-period identity
`IngestionRunFilter` supports `reportingPeriodId`, but the run record model and field schema do not store it.

**Why this matters:** reporting-period-scoped audit, review queue filtering, and replay targeting are all weak or impossible.

**Act now:** Yes.

### 3. `Safety Ingestion Runs` does not durably carry enough project-resolution context
For unresolved or invalid uploads, the run model does not preserve enough context to review the workbook efficiently:

- attempted project-site text
- resolved/attempted project number
- project source classification
- review disposition

**Why this matters:** review queue becomes thin exactly when human review is needed most.

**Act now:** Yes.

### 4. Reference source lists are not first-class descriptor citizens in the package
`Projects` and `Legacy Project Fallback Registry` are essential to project resolution, but they are not modeled in the same explicit descriptor layer as the custom safety lists.

**Why this matters:** one of the most important backend dependencies is structurally implicit.

**Act now:** Yes.

### 5. Retry/replay architecture is not durably represented
The design intent depends on retained source workbooks and retryable ingestion, but the current durable model does not show a complete replay lifecycle with resolution metadata.

**Why this matters:** review-required and commit-failed states are not operationally complete.

**Act now:** Yes.

---

## Moderate structural weakness

### 6. Upload-library traceability is present but thin
The architecture does preserve source-upload item IDs and URLs on inspection events and ingestion runs, which is good. But there is no demonstrated durable metadata contract on the upload-library item itself for:

- reporting period
- checksum
- run status
- latest run ID
- retry lineage

**Why this matters:** supportability and replay diagnostics are weaker than they should be.

**Act now:** Yes, but after the blocking write contract is fixed.

### 7. Parse failures are not durably distinct from template failures
The run schema has `ParseStatus`, but terminal status still flattens parser/data anomalies into `invalid-template`.

**Why this matters:** operational triage is weaker.

**Act now:** Yes, but not before the core persistence seam is restored.

---

## Low-priority worthwhile improvement

### 8. Review workflow metadata could be richer
Useful later additions could include:

- review assignee
- review disposition
- reviewed at / reviewed by
- replay notes
- override reason

This is worthwhile once the core replay path exists.

**Act now:** Later.

---

## Beneficial but not necessary

### 9. Separate exception/review list
A separate `Safety Ingestion Exceptions` list could eventually help if review volume becomes high. It is not required for Release 1 if `Safety Ingestion Runs` is strengthened enough.

**Act now:** No.

## Where no additional architecture is warranted

The following do **not** require extra lists right now:

- a separate raw checklist response child list
- a separate scoring breakdown list
- a separate weekly summary list

The existing event + findings + project-week structure is sufficient once the blocking ID and replay issues are corrected.

## Act Now vs Later vs Not At All

### Act now
- Repair lookup/item-ID contract
- add reporting-period identity to ingestion runs
- add project-resolution context to ingestion runs
- model reference source list bindings explicitly
- implement durable replay architecture

### Later
- richer review metadata
- upload-library item status metadata
- optional exception management surface

### Not required now
- separate raw-answer list
- separate score-breakdown list
- separate project-week summary child list

## Conclusion

The current list architecture is a solid starting core, but it is still missing several operationally necessary pieces. The most important distinction is this:

- the system does **not** need a lot more lists,
- but it **does** need a more truthful contract between the domain model and SharePoint storage, especially for lookups, ingestion auditing, and replay.
