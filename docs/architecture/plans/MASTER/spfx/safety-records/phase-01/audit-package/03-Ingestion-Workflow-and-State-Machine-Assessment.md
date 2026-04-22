# 03-Ingestion-Workflow-and-State-Machine-Assessment

## Overall Assessment

The state-machine intent is clear and reasonably structured, but the implementation has several material operational defects.

The biggest issues are:

- weekly rollup derivation is scoped incorrectly,
- reporting-period correctness is not enforced,
- retry/replay is not operationally complete,
- and the audit/run model is too thin for durable review support.

## Seams Inspected

- `packages/features/safety/src/ingestion/runIngestionPipeline.ts`
- `packages/features/safety/src/ports/ISafetyInspectionRepository.ts`
- `packages/features/safety/src/adapters/mock/MockSafetyInspectionRepository.ts`
- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/pages/ReviewQueuePage.tsx`

## Positive Findings

### State ordering
The pipeline is easy to follow:

- validate
- parse
- resolve project
- duplicate check
- score
- extract findings
- ensure project-week record
- persist commit
- write terminal run

### Terminal audit rows
Every terminal outcome in the pipeline does call `recordIngestionRun()`.

That is good discipline.

### Duplicate branching
The distinction between:

- high-confidence duplicate → review-required
- near-duplicate → committed but flagged

is directionally reasonable.

## Defects

## 1. Weekly rollup is derived from same-date inspections, not same-week inspections

### Repo-truth behavior
For rollup, the pipeline calls:

`findRecentInspectionsForProject(projectNumber, inspectionDate)`

and then adds the current inspection.

The mock adapter implements that function by filtering on **projectNumber + inspectionDate** only.

### Why this is wrong
A **project-week** rollup must aggregate all inspections in the reporting week, not just inspections on the exact same day.

### Operational symptom
If a project receives two inspections in the same reporting week on different dates, the rollup:

- undercounts `inspectionCount`
- undercalculates `averageInspectionScore`
- misrepresents weekly status

### Severity
**P1**

---

## 2. Reporting-period correctness is not enforced

### Repo-truth behavior
`UploadPage.tsx` lets the user choose a reporting period and passes its `id` into the ingestion context.

`runIngestionPipeline.ts` uses that `reportingPeriodId`, but it never verifies that the parsed workbook `inspectionDate` actually falls inside that reporting period.

### Why this is wrong
A user can select one reporting period while uploading a workbook with a date in another week. The pipeline will still commit the inspection under the selected period.

### Operational symptom
Wrong weekly attribution, incorrect dashboards, and bad audit history.

### Severity
**P2**

---

## 3. Retry/replay is not operationally complete

### Repo-truth behavior
The interface exposes `retryIngestion(ingestionRunId)`.

The mock implementation throws:
`source workbook is not retained; re-upload required.`

The review queue page is read-only and does not expose a retry/resolve action.

The hosted SharePoint repository seam that should make retry possible was not retrievable at the declared package path.

### Why this is wrong
The design intent explicitly relies on source-workbook retention and retryability. The current repo does not prove an operational replay loop.

### Severity
**P1**

---

## 4. Ingestion-run audit rows are too thin for good review operations

### Repo-truth behavior
`SafetyIngestionRun` stores:

- upload file name
- checksum
- statuses
- error summary
- committed IDs JSON

It does **not** store:

- `reportingPeriodId`
- resolved or attempted project number
- original project-site text
- project-source classification
- durable review status / resolution note / resolved-by metadata

### Why this matters
The review queue can only show project context when a committed inspection event already exists. For unresolved project or invalid template cases, the run row does not carry enough context to support efficient review.

### Severity
**P1**

---

## 5. Parse failures are terminally flattened into invalid-template

### Repo-truth behavior
Parser exceptions become:

- `parseStatus: failed`
- `errorClass: parse-error`
- `terminalStatus: invalid-template`

### Why this matters
Operational support cannot cleanly separate:

- template drift
- parser bug
- malformed workbook content
- unsupported data shape

### Severity
**P2**

## Partial-Failure Assessment

The current interface only exposes one atomic `persistCommit()` call. That is cleaner than manually writing multiple lists in the pipeline, but because the real SharePoint adapter seam is absent, the audit could not prove:

- transactional behavior
- write ordering
- compensation on partial child-write failure
- whether ingestion-run rows are still recorded if HBCentral writes partially succeed

## Conclusion

The state machine is conceptually organized, but the operational implementation is incomplete and currently not reliable enough for production use.

## Required Remediation Direction

1. Add a true week-scoped inspection query for rollup derivation.
2. Validate workbook inspection date against the selected reporting period before commit.
3. Implement durable retry/replay against retained source uploads.
4. Expand ingestion-run schema to preserve reporting-period and project review context.
5. Split parser/data failure terminal semantics from invalid-template.
