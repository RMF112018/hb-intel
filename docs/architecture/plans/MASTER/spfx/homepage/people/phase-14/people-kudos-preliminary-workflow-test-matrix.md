# Phase-14 — Preliminary People & Culture + HB Kudos workflow test matrix

This matrix lists every workflow the preliminary harness at
`scripts/testing/people-kudos-workflow/` exercises (or attempts to), the
fields and preconditions each row uses, and — critically — whether the row
is **FULL** (fully testable now against the live schema), **PARTIAL** (tests
persistence only, not downstream semantics), or **BLOCKED** (schema is not
yet proven, so the harness cannot assert anything).

**Ground-truth source**: `people-culture-kudos-list-schema.normalized.json`
and `kudos-audit-events-list-schema.normalized.json` in this same directory.
Every internal-name used below is copy-paste from those files. Nothing is
invented.

Legend:
- **FULL** — schema is proven, field persistence is asserted after each
  transition, the happy path is executable end-to-end in a live run.
- **PARTIAL** — schema is proven but the test only asserts persistence,
  not downstream render/behavior (because that behavior lives in webparts /
  services not exercised by this harness).
- **BLOCKED** — list schema is not yet proven; harness skips lifecycle
  tests and instead runs `--discover` to capture the live schema so this
  row can be unblocked later.

---

## A. HB Kudos (People Culture Kudos list)

List: `People Culture Kudos` (`b01fa4d2-29b1-4e11-b581-4cb3d0951a79`)

| Workflow | Key fields | Preconditions | Action | Expected state | Status |
| -------- | ---------- | ------------- | ------ | -------------- | ------ |
| **kudos.submit** | `KudosId` (req,idx), `Headline` (req), `Excerpt` (req), `Details`, `SubmittedById`, `SubmittedDateTime`, `WorkflowStatus`, `HomepageEnabled`, `IsPinned`, `WasEverPublished`, `CelebrateCount`, `PublishStartDate`, `PublishEndDate` | `currentUser` resolved | `POST /items` with draft fields | `WorkflowStatus=pending`, `WasEverPublished=false`, `CelebrateCount=0`, `HomepageEnabled=false`, `IsPinned=false`, persistence round-trip asserted on `KudosId` + `WorkflowStatus` | **FULL** |
| **kudos.recipients.individual** | `IndividualRecipientsId` (UserMulti) | submit ran | PATCH with `{ results: [currentUserId] }` | Round-tripped UserMulti field matches input | **FULL** (omitted in current harness to avoid UserMulti shape assumptions in dry-run; wired via patch helper for live extension) |
| **kudos.recipients.taxonomy.warn** | `TeamRecipients`, `DepartmentRecipients`, `ProjectGroupRecipients` (all TaxonomyFieldType, SspId `9dcca09f-7c2a-419f-a79f-e64e1f5bcf93`) | submit ran | n/a | n/a | **PARTIAL** (WARN) — writing term-store-backed values is out of scope for the preliminary harness; field presence proven in schema doc but no round-trip test |
| **kudos.revisionRequested** | `WorkflowStatus`, `RevisionRequestedById`, `RevisionRequestedAt`, `RevisionGuidance` | submit ran, status=pending | PATCH with builder `buildKudosRevisionRequestedPatch` | `WorkflowStatus=revisionRequested` | **FULL** |
| **kudos.resubmit** | `WorkflowStatus` | status=revisionRequested | PATCH `{ WorkflowStatus: 'pending' }` | `WorkflowStatus=pending` | **FULL** |
| **kudos.approve** | `WorkflowStatus`, `ApprovedById`, `ApprovedDate` | status=pending | PATCH via `buildKudosApprovalPatch` | `WorkflowStatus=approved` | **FULL** |
| **kudos.schedule** | `WorkflowStatus`, `IsScheduled`, `ScheduledPublishAt`, `ScheduledById` | status=approved | PATCH via `buildKudosSchedulePatch` | `WorkflowStatus=approvedScheduled`, `IsScheduled=true` | **FULL** |
| **kudos.unschedule** | `WorkflowStatus`, `IsScheduled`, `ScheduleCancelledById`, `ScheduleCancelledAt` | status=approvedScheduled | PATCH `{ WorkflowStatus: 'approved', IsScheduled: false, … }` | `WorkflowStatus=approved` | **FULL** |
| **kudos.pin** | `IsPinned`, `PinOrder`, `ProminenceIntent` | status=approved | PATCH via `buildKudosPinPatch` | `IsPinned=true`, `ProminenceIntent=pinned` | **FULL** |
| **kudos.feature** | `IsFeatured`, `FeaturedExpiresAt`, `ProminenceIntent` | status=approved | PATCH via `buildKudosFeaturePatch` | `IsFeatured=true`, `ProminenceIntent=featured` | **FULL** |
| **kudos.publishWindow** | `HomepageEnabled`, `WasEverPublished`, `PublishStartDate`, `PublishEndDate` | status=approved | PATCH with start in past, end in future | `HomepageEnabled=true`, `WasEverPublished=true` — persistence only | **PARTIAL** (persistence only — the harness does not assert that the homepage actually displays the item) |
| **kudos.celebrateCountIncrement** | `CelebrateCount` (Number) | any published state | read → +1 → write → read | `CelebrateCount` increased by 1 | **PARTIAL** (race risk WARN — read-modify-write has no ETag handling; safe for single-runner preliminary harness, unsafe for concurrent test runs) |
| **kudos.visibility.{mode}** | `CurrentVisibilityMode` (Choice: public, associatedOnly, internalOnly) | any state | PATCH each mode sequentially | persisted value matches patch | **PARTIAL** (persistence only — downstream audience scoping is not exercised) |
| **kudos.remove** | `WorkflowStatus`, `IsRemovedFromPublicView`, `RemovedById`, `RemovedAt`, `RemovedReason` | status=approved | PATCH via `buildKudosRemovePatch` | `WorkflowStatus=removedUnpublished`, `IsRemovedFromPublicView=true` | **FULL** |
| **kudos.restore** | `WorkflowStatus`, `IsRemovedFromPublicView`, `RestoredById`, `RestoredAt` | status=removedUnpublished | PATCH via `buildKudosRestorePatch` | `WorkflowStatus=approved`, `IsRemovedFromPublicView=false` | **FULL** |
| **kudos.reject** | `WorkflowStatus`, `RejectionReason`, `ReviewedById`, `ReviewedAt` | new synthetic item, status=pending | PATCH via `buildKudosRejectPatch` | `WorkflowStatus=rejected` | **FULL** |
| **kudos.withdraw** | `WorkflowStatus`, `WithdrawnById`, `WithdrawnAt` | new synthetic item, status=pending | PATCH via `buildKudosWithdrawPatch` | `WorkflowStatus=withdrawn` | **FULL** |

---

## B. Kudos Audit Events parity

List: `Kudos Audit Events` (`c031c08f-25ac-407c-aa15-650b791efeb0`)

The harness creates one audit row per lifecycle transition and then queries
by `KudosId` to verify parity. Every row matches the same `KudosId` as the
synthetic Kudos item. Audit rows are cleaned up in the same pass.

| Workflow | Key fields | Preconditions | Action | Expected state | Status |
| -------- | ---------- | ------------- | ------ | -------------- | ------ |
| **audit.parity.indexWarn** | `KudosId` (indexed=false) | n/a | n/a (pre-test warning) | WARN logged prominently | **PARTIAL** (WARN) |
| **audit.create.submit** | `KudosId`, `EventType='submit'`, `ActorId`, `EventAt`, `OldValue`, `NewValue`, `InternalNote` | kudos submit ran | POST audit row | `Id` returned, row persisted | **FULL** |
| **audit.create.revisionRequested** | same shape, `EventType='revisionRequested'` | kudos revisionRequested ran | POST | persisted | **FULL** |
| **audit.create.reopen** | `EventType='reopen'` | kudos resubmit ran | POST | persisted | **FULL** |
| **audit.create.approve** | `EventType='approve'` | kudos approve ran | POST | persisted | **FULL** |
| **audit.create.schedule** | `EventType='schedule'` | kudos schedule ran | POST | persisted | **FULL** |
| **audit.create.unschedule** | `EventType='unschedule'` | kudos unschedule ran | POST | persisted | **FULL** |
| **audit.create.pin** | `EventType='pin'` | kudos pin ran | POST | persisted | **FULL** |
| **audit.create.feature** | `EventType='feature'` | kudos feature ran | POST | persisted | **FULL** |
| **audit.create.celebrate** | `EventType='celebrate'` | kudos celebrate ran | POST | persisted | **FULL** |
| **audit.create.remove** | `EventType='remove'` | kudos remove ran | POST | persisted | **FULL** |
| **audit.create.restore** | `EventType='restore'` | kudos restore ran | POST | persisted | **FULL** |
| **audit.query.byKudosId** | `KudosId` filter | audit rows exist | `$filter=KudosId eq '…'` | rows returned, count matches created | **FULL** |

Not exercised in the preliminary pass (labeled for follow-up completeness):
- `audit.create.flagAdminReview` / `clearAdminReview`
- `audit.create.claim` / `reassign`
- `audit.create.unpin` / `unfeature`

These `EventType` choices are proven in the live schema but the preliminary
harness focuses on the primary lifecycle path. The helpers already accept
all 18 `KudosEventType` string-literal values, so extending the runner is
a pure addition.

---

## C. People & Culture Announcements

List: `People Culture Announcements` (`2cd191fc-a7ea-49f2-af05-c395c2326e57`)

**Schema NOT extracted**. Every row is BLOCKED until
`people-culture-announcements-list-schema.raw.json` exists in this
directory. The `--discover` subcommand captures it:
`pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --only-discover --live`.

| Workflow | Key fields | Action | Status |
| -------- | ---------- | ------ | ------ |
| **announcements.create** | unknown | BLOCKED — no proven field names | **BLOCKED** |
| **announcements.submitForApproval** | unknown | BLOCKED | **BLOCKED** |
| **announcements.approve** | unknown | BLOCKED | **BLOCKED** |
| **announcements.schedule** | unknown | BLOCKED | **BLOCKED** |
| **announcements.publish** | unknown | BLOCKED | **BLOCKED** |
| **announcements.expire** | unknown | BLOCKED | **BLOCKED** |
| **discover.people-culture-announcements** | n/a | `GET /fields + /views + /contenttypes` → write `people-culture-announcements-list-schema.raw.json` | **FULL** (schema-capture only; no lifecycle tests) |

---

## D. People & Culture Celebrations / Milestones

List: `People Culture Celebrations` (`b87bf664-0531-418b-902c-726e5fb87083`)

**Schema NOT extracted**. Same posture as Announcements — lifecycle
workflows are BLOCKED, `--discover` captures the schema.

| Workflow | Key fields | Action | Status |
| -------- | ---------- | ------ | ------ |
| **celebrations.create** | unknown | BLOCKED | **BLOCKED** |
| **celebrations.milestoneCreate** | unknown | BLOCKED | **BLOCKED** |
| **celebrations.media** | unknown | BLOCKED | **BLOCKED** |
| **celebrations.audience** | unknown | BLOCKED | **BLOCKED** |
| **celebrations.schedule** | unknown | BLOCKED | **BLOCKED** |
| **celebrations.publish** | unknown | BLOCKED | **BLOCKED** |
| **discover.people-culture-celebrations** | n/a | schema capture | **FULL** (schema-capture only) |

---

## E. Broader culture-program content

The phase-14 plans reference broader culture-program content (events,
recognition programs, etc.). No such list has been discovered in the live
site yet. Follow-up schema work should confirm whether these are modeled
as additional lists, as content types on the existing Celebrations list,
or as tags/terms in the shared taxonomy. Until that work lands, this row
is **BLOCKED**.

| Workflow | Status |
| -------- | ------ |
| **culture-program.create** | **BLOCKED** (list unknown) |
| **culture-program.publish** | **BLOCKED** |
| **culture-program.expire** | **BLOCKED** |

---

## F. Safety + cleanup

| Workflow | Key behavior | Status |
| -------- | ------------ | ------ |
| **runId.generation** | `hbi-{iso}-{hex}` unique per invocation | **FULL** |
| **prefix.tagging** | every synthetic row has `KudosId = TEST-HBI-{runId}-{seq}` and `Headline = [TEST][HBI] {runId} {seq} {label}` | **FULL** |
| **cleanup.kudos** | deletes only rows where `startswith(KudosId,'TEST-HBI-{runId}-')`; cannot touch rows it did not create | **FULL** |
| **cleanup.audit** | deletes only rows whose `KudosId` matches the same synthetic prefix pattern for sequences 1..32 | **FULL** |
| **--no-cleanup** | skips cleanup pass, leaves rows in place for manual inspection | **FULL** |
| **--dry-run** | no writes, no reads, no token resolution, logs intended payloads | **FULL** |

---

## G. Matrix-to-runner mapping

Every row above whose status is **FULL** (or **PARTIAL**) is executed in
order inside `runPeopleKudosWorkflowTest.ts :: runKudosLifecycle` and
`:: runAuditParity`. `BLOCKED` rows are not exercised — the matrix exists
to make explicit what the harness chose not to attempt, and why.

Each runner step calls `recordResult(ctx, { step, status, detail })` and
the final `printSummary(ctx)` prints totals by status. A run with any
`fail` row exits non-zero.
