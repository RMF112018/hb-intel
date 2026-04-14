# 02 — Workflow Logic Assessment

## Overall verdict
The workflow state machine is **formally coherent** at the enum/transition-table level, but the implementation is **operationally inconsistent** because publish-side behavior is split across:
- direct manual state transitions in `ArticlePublisher.tsx`
- publish/republish orchestration in `publishOrchestrator.ts`
- archive/withdraw lifecycle helper in `publishOrchestrator.ts`

Those three paths do not produce one consistent lifecycle.

## 1. Allowed states
Tenant-aligned state set:
- `draft`
- `review`
- `approved`
- `scheduled`
- `published`
- `archived`
- `withdrawn`

This matches tenant schema.

## 2. Transition table
Defined in `workflowStateMachine.ts`:

- `draft` → `review | archived | withdrawn`
- `review` → `approved | draft | withdrawn`
- `approved` → `scheduled | published | draft | withdrawn`
- `scheduled` → `published | approved | withdrawn`
- `published` → `archived | withdrawn`
- `archived` → `withdrawn`
- `withdrawn` → terminal

### Table-level observations
- No illegal enum values are used.
- No unreachable states inside the pure table.
- No reactivation path exists from `archived` or `withdrawn`.
- `draft → archived` is allowed, which may be acceptable but is operationally strong.
- `approved → published` is allowed directly, bypassing `scheduled`.

## 3. Publish path

### What happens today
`ArticlePublisher.tsx` “Publish” button calls:
- `handlePublishAction('create')`
- which calls `publishOrchestrator.run({ articleId, mode:'create' })`

`publishOrchestrator.ts` then:
1. builds resolution context
2. composes page
3. validates context
4. decides republish action
5. creates/updates page
6. performs SharePoint live publish lifecycle
7. upserts destination-page binding
8. back-syncs master article page metadata

### What it does **not** do
It does **not**:
- move the article workflow state to `published`
- append a workflow-history row for publish success
- enforce a single authoritative publish transition model

### Resulting defect
A successful publish can leave the article in `approved`, while the live page and destination-page binding exist.

That is an operationally material inconsistency between:
- master workflow state
- destination page state
- binding state
- history trail

## 4. Manual transition to `published`

### What happens today
From the action row, `ArticlePublisher.tsx` can expose `→ published` as a direct workflow transition.
That path:
- updates `HB Articles.WorkflowState`
- updates `UpdatedDateUtc`
- stamps `PublishedDateUtc`
- appends workflow history

It does **not**:
- create/update a destination page
- upsert destination-page binding
- run publish validation
- log publishing errors
- back-sync authoritative page metadata

### Severity
This is the single highest-risk lifecycle defect in the app.

### Why it is dangerous
It creates a false-positive published state:
- article says published
- workflow history says published
- no durable proof exists that the destination page was created or updated

## 5. Republish path

### What happens today
Republish runs through `publishOrchestrator.run({ mode:'republish' })`.

### Decision policy
`republishPolicy.ts` returns:
- `create`
- `inPlaceUpdate`
- `regenerate`
- `blocked`
- `noOp`

### Actual regeneration rules
- `templateKeyDrift` → `regenerate`
- `shellVersionDrift` → `inPlaceUpdate`
- `templateVersionDrift` → `inPlaceUpdate`
- `binding.PublishStatus === 'error'` → `inPlaceUpdate`
- archived/withdrawn article → `blocked`

### Internal inconsistency
The preview UI drift chip in `ArticlePublisher.tsx` says:
- `⚠ drift — will regenerate`

But the actual policy only regenerates on **template key drift**.
Shell-version drift does **not** regenerate.

This means the UI promise is stronger than the real policy.

## 6. Preview path
Preview uses the same resolution + composition + validation seam via:
- `buildPublisherPreview`
- `buildPublishResolutionContext`
- `composeProjectSpotlightPage`
- `validatePublishContext`
- `decideRepublishAction`

This is a strength. Preview and publish do share the same core read/compose logic.

## 7. Archive path

### What happens today
Archive is handled by `publishOrchestrator.archive()`.

It:
1. verifies transition allowed
2. updates article:
   - `WorkflowState='archived'`
   - `UpdatedDateUtc=now`
   - `ArchiveDateUtc=now`
   - `IncludeInDestinationLanding=false`
   - `IncludeInHomepageFeed=false`
   - `IncludeInArchive=true`
   - `SuppressFromRollups=true`
3. best-effort updates existing binding:
   - `PublishStatus='draft'`
   - `SyncStatus='pending'`
   - `LastSyncMessage='Article archived; binding marked draft.'`
4. appends workflow history

### What it does not do
It does **not** remove or unpublish the live destination page.

### Implication
Archive can be recorded in the control-plane data model while the page remains publicly visible.

## 8. Withdraw path

### What happens today
Withdraw is handled by `publishOrchestrator.withdraw()`.

It:
1. verifies transition allowed
2. updates article:
   - `WorkflowState='withdrawn'`
   - `UpdatedDateUtc=now`
   - `IncludeInDestinationLanding=false`
   - `IncludeInHomepageFeed=false`
   - `SuppressFromRollups=true`
3. best-effort updates binding:
   - `PublishStatus='draft'`
   - `SyncStatus='pending'`
   - `LastSyncMessage='Article withdrawn; binding marked draft.'`
4. appends workflow history

### What it does not do
It does **not** remove/unpublish the live destination page.

### Implication
Withdraw is not a trustworthy take-down path.

## 9. History recording assessment

### Recorded today
- manual transitions through `handleTransition`
- archive
- withdraw

### Missing today
- publish success
- republish success
- regeneration events
- blocked republish attempts
- no-op republish decisions (optional but useful)

### Verdict
Workflow history is not a complete lifecycle ledger.

## 10. Error logging assessment

### Strength
`publishOrchestrator.ts` writes `HB Article Publishing Errors` on:
- resolution failure
- composition failure
- validation failure
- policy failure
- page publish failure
- binding write failure
- article sync failure

### Weakness
- Archive/withdraw failures are classified through the same error mechanism with semantically coarse operation mapping.
- Error logging is best-effort only.

## 11. State/binding drift handling

### Strengths
- Existing binding is loaded during resolution.
- Republish policy can detect:
   - template key drift
   - shell version drift
   - template version drift
- Validation engine surfaces binding drift warnings.

### Weaknesses
- Shell drift warning says in-place update, while preview UI suggests regeneration.
- Manual `published` transition can produce article state with no binding.
- Publish can produce binding/page without article state closure.

## Final workflow verdict
The state machine table itself is not the main problem.
The problem is that **the app has two different ways to “become published,” and only one of them actually publishes a page.**

That makes the overall workflow logic **not operationally sound**.
