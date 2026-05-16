# Prompt 04 — Add Backend Stage-Duration Telemetry for Home and Project Links

## Role

Act as a senior Azure Functions observability engineer and backend performance diagnostician working in `RMF112018/hb-intel`.

## Objective

Add privacy-safe backend stage-duration telemetry that is sufficient to distinguish where My Dashboard backend time is being spent.

This prompt must not change read-model semantics or outbound dependency behavior. It adds timing observability only.

## Governing Package Files

Read:
- `04_Observability_And_Telemetry_Plan.md`
- `03_Validation_Matrix_And_Acceptance_Criteria.md`
- `06_Exact_File_Level_Targets.md`

Do **not** re-read files that remain within current context or memory unless needed.

## Primary Files to Inspect / Edit

### Adobe path
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-principal-resolver.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-token-service.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-runtime-diagnostics.ts`

### Project Links path
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-runtime-diagnostics.ts`

Touch route wiring only if diagnostics types require it.

## Required Adobe Timing

Add `durationMs` to existing safe telemetry event payloads where the stage currently emits a result event:

- `adobeSign.read.principalResolution.result`
- `adobeSign.read.tokenAcquisition.result`
- `adobeSign.read.refresh.result`
- `adobeSign.read.search.result`
- `adobeSign.read.actionQueue.result`

### Implementation discipline
- Measure wall-clock stage duration locally.
- Preserve existing status/reason/result-stage fields.
- Do not leak any sensitive values.

## Required Project Links Timing

Add safe summary events:

### Event
```text
myProjectLinks.read.sources.result
```

Fields:
```text
projectsDurationMs
registryDurationMs
projectsStatus
registryStatus
projectsRowCount
registryRowCount
projectsBounded
registryBounded
```

### Event
```text
myProjectLinks.read.reconcile.result
```

Fields:
```text
durationMs
matchedItemCount
sourceStatus
```

Optional safe summary counts may be included if already naturally available from existing summary builders and useful to the audit.

## Required Tests

Add/update tests to verify:
- events contain `durationMs`,
- existing event semantics still hold,
- new project-links events are emitted with safe expected fields,
- no sensitive payload is present.

## Prohibited

Do not:
- change route behavior,
- change caching behavior,
- alter Graph or Adobe request shapes,
- add raw vendor responses,
- add actor/project/agreement values to telemetry,
- recommend infrastructure changes in code comments.

## Validation

Run:

```bash
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions check-types
```

## Required Closeout Format

### Summary
### Events Enhanced
### Events Added
### Files Modified
### Tests / Validation
### Query Notes for App Insights
### Commit Recommendation
