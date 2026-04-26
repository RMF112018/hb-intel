# Phase 02 — Prompt 04: Weekly Timer, Highlight Publish Workflow, and Current Published Backend Endpoint

You are working in a fresh local code-agent session inside the live `RMF112018/hb-intel` repository.

Use `main` as authoritative repo truth unless the operator explicitly tells you to work from a feature branch.

## Objective

Implement the backend weekly timer and Safety leadership publish workflow for dynamic Safety Field Excellence.

This wave must turn the generated candidate score records from Wave 03 into governed, approved, published weekly highlight artifacts stored in:

```text
Safety Field Excellence Weekly Highlights
```

It must also add a backend read endpoint for the currently published homepage-safe artifact so Prompt 05 can build the SPFx homepage adapter against a stable backend contract.

This must use the **existing backend Function App currently used by the Safety application**.

Do not create a second backend application.

---

## Current Progress Baseline

### Wave 01 completed — schema and provisioning foundation

Wave 01 added:

- `Safety Field Excellence Candidate Scores`
- `Safety Field Excellence Weekly Highlights`
- descriptors and GUID overlay keys:
  - `SafetyFieldExcellenceCandidateScores`
  - `SafetyFieldExcellenceWeeklyHighlights`
- `SpFieldDefinition.indexed?: boolean`
- indexed-column propagation through Safety provisioning
- create-time and repair-time `Indexed: true` handling
- canonical choice vocabularies:
  - `EligibilityStatus`: `eligible`, `ineligible`, `low-confidence`, `needs-review`
  - `ActivityEvidenceStatus`: `proven`, `inferred`, `missing`
  - `PublishRecommendation`: `primary`, `secondary`, `monitor`, `do-not-publish`
  - `PublishStatus`: `draft`, `pending-review`, `approved`, `published`, `archived`, `suppressed`

### Wave 02 completed — pure excellence domain package

Wave 02 added:

```text
packages/features/safety/src/excellence/
```

Known behavior:

- `generateCandidateScore(...)` or equivalent top-level orchestrator exists.
- `rankCandidates(...)` or equivalent deterministic ranking helper exists.
- Homepage-safe publish payload DTOs exist.
- Preview payload DTOs exist.
- The domain owns:
  - score-scale conversion
  - inspection filtering
  - low-activity perfect-score suppression
  - activity inference
  - corrective-action confidence handling
  - multi-signal narrative gate
  - ranking logic

Backend must not re-implement those rules.

### Wave 03 completed — backend rollup APIs

Wave 03 commit `80baa631c` added backend rollup APIs and services.

Known Wave 03 outcomes:

- Routes added:
  - `POST /api/safety-field-excellence/rollup/dry-run`
  - `POST /api/safety-field-excellence/rollup/generate`
  - `GET /api/safety-field-excellence/reporting-periods/{id}/candidates`
- Auth added:
  - `excellence-rollup-read`: `HBIntelSafetyReviewer`, `HBIntelSafetyAdmin`, plus existing global override/workload paths
  - `excellence-rollup-generate`: `HBIntelSafetyAdmin`, plus existing global override/workload paths
- `SafetyFieldExcellenceGraphRepository` exists.
- `SafetyFieldExcellenceRollupService` exists.
- `safety-field-excellence-telemetry.ts` exists.
- `safety-field-excellence-query-contracts.ts` exists.
- `SharePointService` / `MockSharePointService` include thin delegations:
  - `runSafetyFieldExcellenceRollup(...)`
  - `listSafetyFieldExcellenceCandidates(...)`
- Candidate score records are persisted idempotently using:
  - `ReportingPeriodIdLookupId`
  - `ProjectWeekRecordIdLookupId`
  - `ProjectNumber`
  - `GeneratorVersion`
- Candidate identity collisions fail closed with `CANDIDATE_IDENTITY_COLLISION`.
- Graph query truncation surfaces as `PARTIAL_DATA_BLOCKED`.
- `RawChecklistJson` is not selected, returned, or persisted.
- Backend consumes Wave 02 `generateCandidateScore` and `rankCandidates` without re-implementing scoring.
- No timer, approval/publish workflow, homepage-current endpoint, homepage adapter, SPFx runtime code, or manifest changes were made.

Treat these outcomes as the baseline for this prompt.

---

## Core Rule for This Wave

Prompt 04 must **consume Wave 03 rollup/candidate services**.

Do not duplicate candidate generation or scoring.

The publish workflow should operate on persisted candidate score records and the Wave 02 homepage-safe payload DTOs.

Prompt 04 owns:

- weekly timer trigger
- draft highlight creation
- approval
- override
- publish
- suppress
- rollback
- current published backend read endpoint

Prompt 04 does **not** own:

- SPFx homepage dynamic adapter
- homepage UI rendering
- UI/UX remediation
- browser runtime proof
- package/manifests for SPFx
- raw Safety list aggregation in browser

---

## Scope

Add or update backend files such as:

```text
backend/functions/src/functions/scheduled/safety-field-excellence-weekly-rollup.ts
backend/functions/src/functions/adminApi/safety-field-excellence-routes.ts
backend/functions/src/services/safety-field-excellence-publish-service.ts
backend/functions/src/services/safety-field-excellence-graph-repository.ts
backend/functions/src/services/safety-field-excellence-rollup-service.ts
backend/functions/src/services/safety-field-excellence-telemetry.ts
backend/functions/src/services/sharepoint-service.ts
backend/functions/src/services/safety-field-excellence-query-contracts.ts
backend/functions/src/test/** or existing backend test area
```

Use actual repo conventions where they differ.

---

## Files to Inspect First

Do not re-read files still within your current context or memory.

Inspect:

```text
backend/functions/src/functions/adminApi/safety-field-excellence-routes.ts
backend/functions/src/services/safety-field-excellence-graph-repository.ts
backend/functions/src/services/safety-field-excellence-rollup-service.ts
backend/functions/src/services/safety-field-excellence-telemetry.ts
backend/functions/src/services/safety-field-excellence-query-contracts.ts
backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts
backend/functions/src/services/sharepoint-service.ts
backend/functions/src/services/safety-ingestion-application-service.ts
backend/functions/src/services/safety-ingestion-graph-repository.ts
backend/functions/src/services/safety-ingestion-graph-data-plane.ts
backend/functions/src/middleware/auth.ts
backend/functions/src/middleware/authorization.ts
backend/functions/src/middleware/request-id.ts
packages/features/safety/src/excellence/
packages/features/safety/src/domain/types.ts
packages/features/safety/src/lists/descriptors.ts
packages/features/safety/src/lists/fieldSchema.ts
docs/architecture/plans/MASTER/spfx/safety-public/dynamic-safety-field-excellence-cutover-plan.md
docs/reference/sharepoint/list-schemas/hbcentral/lists/safety-field-excellence-candidate-scores.md
docs/reference/sharepoint/list-schemas/hbcentral/lists/safety-field-excellence-weekly-highlights.md
```

---

## Required Routes

Add the publish/admin routes:

```text
GET  /api/safety-field-excellence/highlights/{id}
POST /api/safety-field-excellence/highlights/{id}/approve
POST /api/safety-field-excellence/highlights/{id}/override
POST /api/safety-field-excellence/highlights/{id}/publish
POST /api/safety-field-excellence/highlights/{id}/suppress
POST /api/safety-field-excellence/highlights/{id}/rollback
```

Add the backend current-published read route for Prompt 05:

```text
GET /api/safety-field-excellence/homepage/current
```

Do not implement the SPFx client that calls this endpoint. Prompt 05 owns that.

---

## Required Timer Trigger

Add a scheduled timer function:

```text
backend/functions/src/functions/scheduled/safety-field-excellence-weekly-rollup.ts
```

Use app setting:

```text
SAFETY_FIELD_EXCELLENCE_WEEKLY_ROLLUP_SCHEDULE
```

Recommended default if repo pattern allows a fallback:

```text
0 0 6 * * 1
```

Meaning: Monday at 6:00 AM in the configured Function App timezone.

### Important production rule

Do not use `RunOnStartup: true` in production.

If a local/test-only manual invocation path is needed, add a separate protected admin route or test helper, not production `RunOnStartup`.

---

## Timer Behavior

The timer must:

1. Resolve the target reporting period explicitly through existing backend/Safety patterns.
2. Call the Wave 03 rollup/generate service or equivalent service method.
3. Generate/update candidate records.
4. Rank candidates using the persisted candidates or Wave 02 ranking helper through existing service seams.
5. Create or update a draft weekly highlight record in `Safety Field Excellence Weekly Highlights`.
6. Set `PublishStatus` to `pending-review` or `draft` based on the intended review state.
7. Never set `PublishStatus` to `published`.
8. Emit telemetry.
9. Be idempotent for the same reporting period + selection method version.
10. Never publish to the homepage without Safety leadership approval.

Recommended timer output state:

```text
pending-review
```

because the timer has completed automated generation and is awaiting Safety leadership action.

---

## Publish Status Vocabulary

Use Wave 01 values exactly:

```ts
type SafetyFieldExcellencePublishStatus =
  | "draft"
  | "pending-review"
  | "approved"
  | "published"
  | "archived"
  | "suppressed";
```

Do not introduce:

- `pending-approval`
- `review`
- `live`
- `unpublished`
- `rolled-back`

Use `archived` for previously published items superseded by a new publish.

Use `suppressed` for items intentionally withheld from homepage.

---

## Auth Requirements

Extend Safety route authorization narrowly if required.

Recommended actions:

```ts
type SafetyRouteAction =
  | existing actions
  | "excellence-highlight-read"
  | "excellence-highlight-approve"
  | "excellence-highlight-publish";
```

Recommended role behavior:

### Read / current published

`excellence-highlight-read`

- `HBIntelSafetyReviewer`
- `HBIntelSafetyAdmin`
- existing global override
- existing workload automation path if current `authorizeSafetyRoute` permits app-only automation

The homepage current endpoint may eventually need a broader read posture, but in Prompt 04 keep it aligned with current protected Safety route patterns. Prompt 05 may refine frontend token usage.

### Approve / override / suppress / rollback

`excellence-highlight-approve`

- `HBIntelSafetyAdmin`
- existing global override
- workload automation only if explicitly justified by existing backend automation pattern

Do not let `HBIntelSafetyReviewer` approve, override, suppress, or rollback.

### Publish

`excellence-highlight-publish`

- `HBIntelSafetyAdmin`
- existing global override
- workload automation only if explicitly justified by existing backend automation pattern

Publishing is a public-homepage-impacting action. Keep it strict.

Do not weaken existing auth.

Do not introduce anonymous write access.

---

## Publish Service Ownership

Add a service such as:

```text
backend/functions/src/services/safety-field-excellence-publish-service.ts
```

The publish service owns:

- highlight draft creation/update
- candidate selection from persisted candidates
- selected candidate validation
- override validation
- approval metadata
- frozen homepage payload generation
- publish/suppress/rollback state transitions
- archival of prior published highlight
- current-published read semantics
- diagnostics and telemetry coordination

The publish service must not:

- query raw inspections/findings directly
- calculate candidate scores
- duplicate Wave 02 scoring/ranking logic
- create SPFx-specific payloads beyond backend/domain homepage-safe DTOs
- expose raw checklist JSON

---

## Repository Requirements

Extend `SafetyFieldExcellenceGraphRepository` or add a closely scoped repository companion.

Minimum methods:

```ts
interface ISafetyFieldExcellencePublishRepository {
  getCandidateScoreByItemId(input: {
    itemId: number;
  }): Promise<PersistedSafetyFieldExcellenceCandidate | null>;

  listCandidateScores(input: {
    reportingPeriodId: string;
    reportingPeriodSpItemId?: number;
    generatorVersion?: string;
    eligibilityStatus?: string;
    publishRecommendation?: string;
    top?: number;
  }): Promise<ReadonlyArray<PersistedSafetyFieldExcellenceCandidate>>;

  upsertDraftWeeklyHighlight(input: {
    reportingPeriod: SafetyReportingPeriod;
    selectedCandidates: SafetyFieldExcellenceHighlightSelection;
    homepagePayload: SafetyFieldExcellenceHomepagePayload | SafetyFieldExcellencePreviewPayload;
    selectionMethodVersion: string;
    dataConfidence: "high" | "medium" | "low";
    dataQualityNotes?: string;
  }): Promise<PersistedSafetyFieldExcellenceWeeklyHighlight>;

  getWeeklyHighlightByItemId(input: {
    itemId: number;
  }): Promise<PersistedSafetyFieldExcellenceWeeklyHighlight | null>;

  updateWeeklyHighlightState(input: {
    itemId: number;
    expectedEtag?: string;
    fields: Record<string, unknown>;
  }): Promise<PersistedSafetyFieldExcellenceWeeklyHighlight>;

  listCurrentPublishedHighlights(input: {
    now: string;
    includeStale?: boolean;
  }): Promise<ReadonlyArray<PersistedSafetyFieldExcellenceWeeklyHighlight>>;

  archivePriorPublishedHighlights(input: {
    reportingPeriodId: string;
    excludingItemId: number;
    now: string;
  }): Promise<ReadonlyArray<number>>;
}
```

Use actual repo types/names where Wave 03 already defined equivalents.

---

## Weekly Highlight Field Mapping

Map to Wave 01 fields exactly.

| Backend value | Weekly Highlights field |
|---|---|
| title | `Title` |
| reporting period lookup | `ReportingPeriodId` / `ReportingPeriodIdLookupId` |
| week start | `WeekStartDate` |
| week end | `WeekEndDate` |
| period label | `PeriodLabel` |
| publish status | `PublishStatus` |
| primary candidate lookup | `PrimaryCandidateId` / `PrimaryCandidateIdLookupId` |
| secondary candidate IDs | `SecondaryCandidateIdsJson` |
| frozen homepage payload | `HomepagePayloadJson` |
| source candidate cohort | `SourceCandidateIdsJson` |
| selector/scoring version | `SelectionMethodVersion` |
| data confidence | `DataConfidence` |
| data quality notes | `DataQualityNotes` |
| editorial override flag | `EditorialOverrideApplied` |
| override reason | `OverrideReason` |
| approver | `ApprovedBy` |
| approval timestamp | `ApprovedAt` |
| published timestamp | `PublishedAt` |
| freshness expiry | `FreshUntil` |
| rollback pointer | `RollbackFromItemId` |

`RollbackFromItemId` is a Number containing the prior Weekly Highlight SharePoint item ID. It is not a lookup.

---

## Draft Highlight Creation Rules

After candidate generation, the timer or manual draft-generation path should:

1. Load candidate scores for the reporting period.
2. Rank candidates using Wave 02 ranking helper if needed, or consume already-ranked service output from Wave 03.
3. Select:
   - one primary candidate if eligible and recommended as `primary`
   - secondary candidates where recommended as `secondary`
   - monitor candidates may be included in source cohort but should not become primary by default
4. Build homepage-safe payload using Wave 02 DTO helpers where available.
5. Create or update a weekly highlight with:
   - `PublishStatus = "pending-review"` or `"draft"`
   - `HomepagePayloadJson` populated with draft preview/publish payload
   - `SourceCandidateIdsJson` populated
   - `PrimaryCandidateId` set only if selected candidate is valid
   - `SecondaryCandidateIdsJson` populated with candidate item IDs
   - `DataConfidence` derived from selected candidate(s)
   - `FreshUntil` set according to weekly freshness rules

If no valid primary candidate exists:

- create a draft/pending-review highlight with preview or insufficient-data payload
- do not fabricate a winner
- set `DataConfidence = "low"`
- add `DataQualityNotes`
- keep `PublishStatus = "pending-review"` unless policy says `suppressed`

---

## Approval Rules

`POST /api/safety-field-excellence/highlights/{id}/approve`

Must:

- require strict Safety admin/global override auth
- load highlight
- validate current status is `draft` or `pending-review`
- validate candidate references still exist
- set:
  - `PublishStatus = "approved"`
  - `ApprovedBy`
  - `ApprovedAt`
- preserve `HomepagePayloadJson`
- not publish to homepage
- emit telemetry

Do not allow `approved` if:

- selected primary candidate is hard-excluded / `do-not-publish`, unless an override route was used with reason
- `HomepagePayloadJson` is missing or invalid
- source candidate IDs are missing

---

## Override Rules

`POST /api/safety-field-excellence/highlights/{id}/override`

Must:

- require strict Safety admin/global override auth
- require a non-empty `overrideReason`
- allow explicit primary and secondary candidate selection
- validate selected candidates exist
- prevent silent override of hard-excluded candidates
- if a hard-excluded or `do-not-publish` candidate is selected:
  - require stronger explicit reason text
  - set `EditorialOverrideApplied = true`
  - store `OverrideReason`
  - include diagnostic/telemetry
- rebuild/freeze `HomepagePayloadJson` from the selected candidates
- set `PublishStatus` to `approved` or `pending-review` based on request semantics; prefer `approved` only if the route explicitly approves

Suggested request:

```ts
interface OverrideHighlightRequest {
  readonly primaryCandidateItemId: number;
  readonly secondaryCandidateItemIds?: ReadonlyArray<number>;
  readonly overrideReason: string;
  readonly approve?: boolean;
}
```

---

## Publish Rules

`POST /api/safety-field-excellence/highlights/{id}/publish`

Must:

- require strict Safety admin/global override auth
- load highlight
- validate status is `approved`
- validate `HomepagePayloadJson` exists and is homepage-safe
- archive previous `published` highlights for the same reporting period or current-homepage scope as appropriate
- set:
  - `PublishStatus = "published"`
  - `PublishedAt`
  - `FreshUntil` if not already set
- preserve approval metadata
- return the published highlight
- emit telemetry

Do not publish:

- `draft`
- `pending-review`
- `suppressed`
- missing payload
- missing approval
- invalid candidate selection
- stale/expired payload unless explicitly republished with new `FreshUntil`

---

## Suppress Rules

`POST /api/safety-field-excellence/highlights/{id}/suppress`

Must:

- require strict Safety admin/global override auth
- require optional but recommended reason
- set:
  - `PublishStatus = "suppressed"`
  - `OverrideReason` or `DataQualityNotes` with suppression reason
- prevent current-published endpoint from returning the item
- emit telemetry

Suppression should be allowed from:

- `draft`
- `pending-review`
- `approved`
- `published`

If suppressing a published item, current-published endpoint should either:

- return no published item / 204 / empty state response, or
- return the next valid published item if business rules allow fallback

Choose one explicit behavior and test it.

Recommended v1: suppression removes the item from current-published response and does not auto-promote older content unless explicitly rolled back.

---

## Rollback Rules

`POST /api/safety-field-excellence/highlights/{id}/rollback`

Purpose: restore a previously published/archived highlight or mark a replacement relationship.

Must:

- require strict Safety admin/global override auth
- require target prior item ID or derive from `RollbackFromItemId`
- validate prior item exists and has valid `HomepagePayloadJson`
- set target prior item to `published`
- archive/suppress the current item as appropriate
- set `RollbackFromItemId` on the current/replacement item where useful
- emit telemetry

Keep rollback simple and deterministic. Do not build a full version-control system.

---

## Current Published Endpoint

`GET /api/safety-field-excellence/homepage/current`

Purpose: backend support for Prompt 05 homepage adapter.

Must:

- be read-only
- return only a published homepage-safe artifact
- not expose raw candidate internals beyond approved public-safe metadata
- not expose raw checklist JSON
- not expose sensitive finding text
- include:
  - highlight item ID
  - reporting period ID
  - period label
  - week start/end
  - publish status
  - published at
  - fresh until
  - stale indicator
  - data confidence
  - homepage payload JSON
  - source candidate IDs if safe
- handle no published data cleanly

Recommended response behavior:

- `200` with artifact when a published item exists
- `204` or `200` with `state: "no-published-highlight"` when none exists
- `200` with `isStale: true` when only stale content is available and `includeStale=true`
- never `500` for ordinary no-content/no-published state

Prompt 05 will decide how to render this as dynamic, curated fallback, preview fallback, stale, or error state.

---

## Highlight Payload Rules

Use Wave 02 domain DTOs where possible.

The published payload must be:

- JSON-safe
- homepage-safe
- compact enough for SPFx
- free of raw checklist JSON
- free of sensitive employee performance details
- explicit about preview/insufficient-data state when no candidate qualifies
- stable after publish

`HomepagePayloadJson` must be frozen at approval/publish time. The homepage should not reconstruct candidate logic.

---

## Data Confidence Rules

Use:

```ts
type DataConfidence = "high" | "medium" | "low";
```

Suggested derivation:

- `high`: primary candidate eligible, proven activity evidence, acceptable data quality, no review-required status
- `medium`: eligible/secondary with some inferred evidence or modest data-quality limitation
- `low`: no valid primary, missing activity evidence, low-confidence candidate, insufficient data, or preview fallback

Do not fabricate high confidence when corrective-action date fields are missing and the selected story depends on corrective-action timing.

---

## Freshness Rules

Set `FreshUntil` for published highlights.

Recommended v1:

- `FreshUntil = PublishedAt + 7 days`

or, if reporting-period semantics are stronger:

- `FreshUntil = WeekEndDate + configured grace window`

Pick one and document it.

The current-published endpoint must return `isStale`.

---

## Query Rules

Use Graph-only backend data access consistent with existing Safety backend posture.

Required:

- bounded queries
- selected fields only
- indexed filters where available:
  - `ReportingPeriodId`
  - `PublishStatus`
  - `WeekStartDate`
  - `WeekEndDate`
  - `FreshUntil`
  - candidate fields required by Wave 03
- paging handled backend-side
- query truncation/incomplete paging fails closed or surfaces high-severity diagnostics
- no raw workbook/checklist data selected

---

## Diagnostics

Use bounded diagnostics.

Suggested codes:

- `HIGHLIGHT_NOT_FOUND`
- `HIGHLIGHT_INVALID_STATUS`
- `HIGHLIGHT_PAYLOAD_MISSING`
- `HIGHLIGHT_PAYLOAD_INVALID`
- `CANDIDATE_NOT_FOUND`
- `CANDIDATE_NOT_APPROVABLE`
- `OVERRIDE_REASON_REQUIRED`
- `PUBLISH_APPROVAL_REQUIRED`
- `PUBLISH_NO_VALID_PRIMARY`
- `CURRENT_HIGHLIGHT_NOT_FOUND`
- `SUPPRESS_REASON_RECORDED`
- `ROLLBACK_TARGET_NOT_FOUND`
- `ROLLBACK_TARGET_INVALID`
- `WEEKLY_ROLLUP_DRAFT_FAILED`
- `WEEKLY_HIGHLIGHT_WRITE_FAILED`
- `PARTIAL_DATA_BLOCKED`

Diagnostics must not leak secrets, token details, raw checklist JSON, or sensitive finding text.

---

## Telemetry

Extend or reuse `safety-field-excellence-telemetry.ts`.

Emit events for:

- timer start
- timer complete
- timer failed
- draft highlight created
- draft highlight updated
- approval
- override
- publish
- suppress
- rollback
- current-published read
- no-published-current state
- stale current state
- route failures

Include:

- request ID / correlation ID where available
- reporting period
- highlight item ID
- candidate count
- primary candidate ID
- publish status
- data confidence
- duration
- failure diagnostic code

Do not log raw checklist JSON or sensitive finding text.

---

## SharePointService Façade

Add thin façade methods only if the current route pattern benefits from them.

Examples:

```ts
createSafetyFieldExcellenceDraftHighlight(...)
getSafetyFieldExcellenceHighlight(...)
approveSafetyFieldExcellenceHighlight(...)
overrideSafetyFieldExcellenceHighlight(...)
publishSafetyFieldExcellenceHighlight(...)
suppressSafetyFieldExcellenceHighlight(...)
rollbackSafetyFieldExcellenceHighlight(...)
getCurrentSafetyFieldExcellenceHomepageHighlight(...)
```

Keep `SharePointService` thin.

Do not put workflow logic inside the façade.

---

## Required Tests

Add backend tests with mocked repository/service data.

### Timer tests

- timer invokes rollup/generate service
- timer creates or updates pending-review highlight
- timer does not publish
- timer is idempotent for same reporting period/selection version
- timer emits failure diagnostic when rollup generate fails

### Publish service tests

- creates draft highlight from generated candidates
- no valid primary creates preview/insufficient-data draft, not fake winner
- approve route sets `approved`, `ApprovedBy`, `ApprovedAt`
- approve fails for invalid status
- override requires reason
- override can select valid candidate and records reason
- hard-excluded candidate override requires explicit reason and sets `EditorialOverrideApplied`
- publish requires approved status
- publish archives prior published highlight
- publish sets `PublishedAt` and `FreshUntil`
- suppress removes item from current-published result
- rollback restores valid prior item or fails closed

### Current endpoint tests

- returns published current artifact
- returns no-published state when none exists
- marks stale content as stale
- does not return suppressed item
- does not expose raw checklist JSON
- does not expose unapproved draft/pending-review data

### Auth tests

If current harness supports it:

- reviewer can read/get highlights
- reviewer cannot approve/publish/suppress/rollback
- Safety admin can approve/publish/suppress/rollback
- global override remains intact
- unauthenticated/unauthorized denied

### Cross-impact tests

- existing Wave 03 routes still pass
- existing Safety ingestion tests remain green
- `@hbc/functions check-types` clean
- `@hbc/features-safety check-types` clean
- `@hbc/features-safety test` clean

---

## Validation

Run the smallest credible set first, then broaden.

Suggested commands, adjusted to actual repo scripts:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/features-safety check-types
pnpm --filter @hbc/features-safety test
```

If scripts differ, inspect package scripts and use repo-correct commands.

Do not claim tests passed unless they actually passed.

Also run grep checks:

```bash
grep -R "RawChecklistJson" backend/functions/src/services/safety-field-excellence* backend/functions/src/functions/adminApi/safety-field-excellence* || true
grep -R "runOnStartup\|RunOnStartup" backend/functions/src/functions/scheduled/safety-field-excellence* || true
```

Interpret grep results carefully. `RawChecklistJson` should not appear in route responses, write payloads, or select sets. `RunOnStartup` should not be enabled for production timer config.

---

## Required Closure Report

Return:

```md
# Phase 02 — Prompt 04 Closure Report

## Summary

## Files Inspected

## Files Changed

## Timer Trigger Added

Include schedule setting and confirmation that production RunOnStartup is not enabled.

## Routes Added

List:
- GET highlight
- approve
- override
- publish
- suppress
- rollback
- homepage current

For each route, state auth posture.

## Publish Workflow Summary

Explain state transitions:
- draft / pending-review
- approved
- published
- archived
- suppressed
- rollback

## Repository / Query Contract

Explain:
- lists queried
- indexed filters used
- selected fields
- paging behavior
- no raw checklist JSON guarantee

## Candidate Consumption

Confirm workflow consumes Wave 03 persisted candidates and Wave 02 DTO/payload helpers. Confirm no scoring reimplementation.

## Current Published Endpoint Contract

Include example response shape and no-data behavior.

## Diagnostics and Telemetry

## Validation Results

Include exact commands and pass/fail results.

## Out of Scope Confirmed

Confirm no homepage SPFx adapter, no SPFx runtime changes, no UI/UX remediation, no manifest changes, no Safety ingestion behavior changes, and no auth weakening.

## Risks / Follow-Up Items

## Prompt 05 Readiness

State whether Prompt 05 can now build the SPFx dynamic adapter against:
- GET /api/safety-field-excellence/homepage/current
- published payload shape
- stale/no-data behavior
- auth/token requirements
```

---

## Commit Guidance

If the wave closes cleanly, use a commit title similar to:

```text
hb-intel-safety phase-02 wave 04: add safety field excellence publish workflow
```

Commit body should mention:

- weekly timer trigger
- draft highlight creation
- approval / override / publish / suppress / rollback routes
- current-published backend endpoint for homepage adapter
- existing Safety backend Function App reused
- Wave 03 candidate records consumed
- Wave 02 payload DTOs consumed
- no scoring reimplementation
- no SPFx adapter/runtime changes
- no manifest changes
- validation commands
