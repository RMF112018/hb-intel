# 06 — Workbook Parsing Target Assessment

## Executive conclusion

The uploaded workbook materially improves the parser contract and should now be treated as a governed parser authority, not as a best-effort convenience.

The backend code already leans in this direction:
- parser contract markers are defined in code
- parser-meta and named ranges are preferred before legacy fallback
- template validation checks parser markers when present
- metadata extraction falls back to visible cells only when markers are absent

## What the uploaded workbook actually contains

### Sheets
- `ScoreCard`
- `ScoringWeights`
- `ParserMeta`

### Important reality check
The uploaded workbook’s `ParserMeta` sheet is **visible**, not hidden.

If field users should not interact with parser scaffolding, that should be corrected in the template itself. It does not break parsing, but it contradicts the stated design intent.

### Named ranges present
The workbook contains parser-relevant named ranges including:
- `InspectionDateCell`
- `InspectionNumberCell`
- `ProjectSiteCell`
- `TotalYesCell`
- `TotalNoCell`
- `TotalNACell`
- `SafetyScoreCell`
- `KeyFindingsLines`
- `KeyFindingsVisualBlock`
- `ParserTemplateVersion`
- `ParserContractVersion`
- `ParserInspectionDateRaw`
- `ParserInspectionNumberRaw`
- `ParserProjectSiteRaw`
- `ParserReportingWeekStart`
- `ParserReportingWeekEnd`
- `ParserReportingPeriodLabel`
- `ParserKeyFindingsNormalized`

### Parser markers present
The workbook contains:
- `TemplateVersion = SafetyChecklist_v1`
- `ParserContractVersion = parse-first-2026-04`

These values match the accepted marker sets defined in code.

### Data validation present
The workbook contains:
- date validation on `ScoreCard!B3`
- whole-number validation on `ScoreCard!E3`
- list validation on the yes/no/na response matrix

### ParserMeta field shape present
The workbook contains parser fields for:
- inspection date raw
- inspection number raw
- project/site raw
- totals
- safety score
- reporting week start
- reporting week end
- reporting period label
- normalized key findings

## Backend parser posture in repo truth

### Marker detection
`resolveContractMarkers()` recognizes markers when:
- `ParserMeta` exists
- or parser marker named ranges exist

### Metadata extraction precedence
The code currently resolves parser-critical metadata in this order:
1. parser-meta
2. named range
3. legacy visible-cell fallback (only when markers are absent)
4. none

That is the correct overall direction.

### Template validation behavior
The validator:
- enforces required sheets
- validates parser markers when present
- validates date and inspection number
- validates reporting-period derivation completeness
- requires a key findings seam when markers are present

### Preview authority behavior
Preview logic already prefers parser-derived values for inspection date and inspection number when the source is `parser-meta` or `named-range`, and treats client context as advisory or legacy fallback.

## Recommended parser authority model

## 1. Template identity
The backend should require:
- accepted `TemplateVersion`
- accepted `ParserContractVersion`

When parser markers are present and invalid, the backend should reject the workbook as incompatible.

## 2. Field authority
When parser markers are present:
- inspection date → parser authority
- inspection number → parser authority
- project/site text → parser authority
- key findings → parser authority
- reporting-week start/end/label → parser authority when present

Client-supplied context should:
- be accepted as supplemental intake metadata
- not override parser authority on marked templates
- be surfaced as mismatch warnings when different

## 3. Legacy fallback
Legacy visible-sheet fallback should remain only for:
- older unmarked templates
- compatibility handling during transition

It should not remain co-equal with parser-meta on marked templates.

## 4. Reporting-period derivation
The backend should do both:
- validate client-selected reporting period against the authoritative parsed/derived inspection date
- expose the workbook-derived reporting-week metadata in preview so operators can see expected period alignment

Longer term, the backend should reduce dependence on a blindly supplied `reportingPeriodId` by:
- deriving expected week/period from parser authority
- resolving and validating the period server-side
- clearly surfacing mismatch or ambiguity

## 5. Key findings extraction
The backend should treat key findings as a first-class parse target:
- prefer `ParserMeta` normalized key findings if robustly available
- otherwise prefer `KeyFindingsLines`
- otherwise use legacy fallback only for unmarked templates

Because the uploaded workbook uses `TEXTJOIN` in `ParserMeta!B14`, non-Excel tooling should be watched carefully. The current code smartly prefers line-based named ranges before legacy fallback, which reduces reliance on formula evaluation.

## Recommended invalid-template diagnostics

When incompatible:
- `TEMPLATE_INCOMPATIBLE`
- include:
  - detected template version
  - detected parser contract version
  - missing/invalid marker names
  - missing required seam (for example key findings seam)

When invalid metadata:
- `TEMPLATE_VALIDATION_FAILED`
- `PARSE_FAILED`
- `REPORTING_PERIOD_MISMATCH`
- `PROJECT_UNRESOLVED`

Diagnostics should remain structured and operator-readable.

## Recommended preview/validation response contract

Before final commit, preview should explicitly return:
- template validity
- detected template version
- detected parser contract version
- parser marker state
- metadata authority by field
- parsed inspection date
- parsed inspection number
- parsed project/site text
- reporting period resolution and date-in-range result
- project resolution result
- duplicate classification
- normalized key findings preview
- blocking errors
- warnings

The current preview implementation is already close to this and should be treated as the canonical pre-commit truth surface.

## Workbook governance actions recommended

1. Hide `ParserMeta`.
2. Preserve all named ranges and markers.
3. Keep date and whole-number validation.
4. Freeze the parser marker values as governed contract values.
5. Document a workbook regression checklist so future edits do not silently break parser authority.

## Primary sources consulted

### Official platform guidance
- Azure Functions Node.js v4 programming model: https://learn.microsoft.com/en-us/azure/azure-functions/functions-node-upgrade-v4
- Azure Functions deployment technologies: https://learn.microsoft.com/en-us/azure/azure-functions/functions-deployment-technologies
- Zip deployment for Azure Functions: https://learn.microsoft.com/en-us/azure/azure-functions/deployment-zip-push
- Run Functions from a package: https://learn.microsoft.com/en-us/azure/azure-functions/run-functions-from-deployment-package
- Azure Functions app settings reference: https://learn.microsoft.com/en-us/azure/azure-functions/functions-app-settings
- Manage function app settings / CORS: https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings
- Azure Functions best practices: https://learn.microsoft.com/en-us/azure/azure-functions/functions-best-practices
- Improve Azure Functions performance and reliability: https://learn.microsoft.com/en-us/azure/azure-functions/performance-reliability
- Monitor executions in Azure Functions: https://learn.microsoft.com/en-us/azure/azure-functions/functions-monitoring
- Application Insights logs in Azure Functions: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-functions/monitoring/functions-monitoring-appinsightslogs
- Managed identities for App Service and Azure Functions: https://learn.microsoft.com/en-us/azure/app-service/overview-managed-identity
- Managed identities developer guidance: https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview-for-developers
- Microsoft Graph throttling guidance: https://learn.microsoft.com/en-us/graph/throttling
- Microsoft Graph Selected permissions overview: https://learn.microsoft.com/en-us/graph/permissions-selected-overview
- Microsoft Graph permissions reference: https://learn.microsoft.com/en-us/graph/permissions-reference
- Microsoft Graph create site permission: https://learn.microsoft.com/en-us/graph/api/site-post-permissions
- Microsoft Graph list item resource: https://learn.microsoft.com/en-us/graph/api/resources/listitem
- Microsoft Graph get list item: https://learn.microsoft.com/en-us/graph/api/listitem-get
- Microsoft Graph create list item: https://learn.microsoft.com/graph/api/listitem-create
- Microsoft Graph update list item: https://learn.microsoft.com/en-us/graph/api/listitem-update
- Microsoft Graph create list: https://learn.microsoft.com/en-us/graph/api/list-create

### Repo truth inspected
- `backend/functions/README.md`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/README.md
- `backend/functions/package.json`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/package.json
- `backend/functions/host.json`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/host.json
- `backend/functions/src/index.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/index.ts
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts
- `backend/functions/src/functions/health/index.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/functions/health/index.ts
- `backend/functions/src/functions/health/ready.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/functions/health/ready.ts
- `backend/functions/src/services/sharepoint-service.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/sharepoint-service.ts
- `backend/functions/src/services/safety-ingestion-application-service.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/safety-ingestion-application-service.ts
- `backend/functions/src/services/safety-ingestion-graph-data-plane.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/safety-ingestion-graph-data-plane.ts
- `backend/functions/src/services/safety-ingestion-graph-repository.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/safety-ingestion-graph-repository.ts
- `backend/functions/src/services/__tests__/safety-ingestion-cutover-guard.test.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/services/__tests__/safety-ingestion-cutover-guard.test.ts
- `backend/functions/src/utils/validate-config.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/utils/validate-config.ts
- `backend/functions/src/middleware/auth.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/middleware/auth.ts
- `backend/functions/src/middleware/authorization.ts`: https://github.com/RMF112018/hb-intel/blob/main/backend/functions/src/middleware/authorization.ts
- `scripts/package-functions-artifact.ts`: https://github.com/RMF112018/hb-intel/blob/main/scripts/package-functions-artifact.ts
- `packages/features/safety/src/domain/templateContract.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/domain/templateContract.ts
- `packages/features/safety/src/parser/contractWorkbookAccess.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/contractWorkbookAccess.ts
- `packages/features/safety/src/parser/extractMetadata.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/extractMetadata.ts
- `packages/features/safety/src/parser/parseChecklist.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/parseChecklist.ts
- `packages/features/safety/src/parser/validateTemplate.ts`: https://github.com/RMF112018/hb-intel/blob/main/packages/features/safety/src/parser/validateTemplate.ts
