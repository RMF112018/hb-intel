# 03 — Findings Register

## P0 — Direct workflow transition to `published` bypasses page publish and binding creation

### Files
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`

### Issue
The UI exposes `→ published` as a manual workflow transition. That path updates article state and history without running publish orchestration.

### Why it is wrong
`published` should represent a completed publish lifecycle, not just a Choice-field update.

### Likely symptom
- article marked published
- no destination page exists or page is stale
- no destination-page binding exists or is current

### Fix direction
Remove manual transition to `published` from the generic transition action row. Make publish orchestration the only path that can produce `WorkflowState='published'`.

---

## P1 — Publish / republish does not update workflow state or append publish-side workflow history

### Files
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`

### Issue
Successful publish/republish updates page + binding + article page metadata, but does not update `WorkflowState` or append workflow history.

### Why it is wrong
The publish lifecycle is not fully closed in the control-plane data model.

### Likely symptom
- live page exists while article remains `approved`
- audit trail missing actual publish actions
- operators cannot trust state/history alone

### Fix direction
On successful publish:
- set `WorkflowState='published'`
- set `PublishedDateUtc` consistently
- append a publish history row
On successful republish:
- append a republish history row at minimum

---

## P1 — `HB Article Team Members` contract/mapper/writer do not match tenant schema

### Files
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`

### Issue
The implementation uses non-schema fields and the wrong type for `PersonPrincipal`, while omitting required field `Title`.

### Why it is wrong
The code contract is not tenant-aligned, so read/write behavior is not trustworthy.

### Likely symptom
- team-member save failures
- tenant rows ignored or misread
- Team Viewer empty / blocked / inconsistent

### Fix direction
Realign the entire team-member seam to actual tenant fields:
- correct `PersonPrincipal` handling for SharePoint User field
- add/write required `Title`
- remove non-schema fields or move them to a different data source
- update TeamPanel, mapper, writer, and TeamViewer adapter together

---

## P1 — `HB Article Media` contract/mapper/writer use wrong internal field and omit required `Title`

### Files
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCompositor.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`

### Issue
The code uses `ImageAssetUrl`, but tenant schema uses `ImageAsset`. It also omits required `Title`.

### Why it is wrong
This is a direct internal-name mismatch against the tenant list.

### Likely symptom
- gallery rows fail to save
- gallery rows fail to read
- gallery validation blocks publish unexpectedly
- gallery renders empty even when tenant rows exist

### Fix direction
Realign the full media seam to tenant schema:
- rename contract usage to tenant `ImageAsset`
- write required `Title`
- verify gallery composer, preview, and UI panel all use the same field

---

## P1 — Archive / withdraw does not take down the live destination page

### Files
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`

### Issue
Archive/withdraw updates article and binding state only. The destination page itself is left live.

### Why it is wrong
The operating model implies archive/withdraw are lifecycle actions with visibility implications.

### Likely symptom
- article/control-plane says archived or withdrawn
- destination page remains publicly visible

### Fix direction
Add an explicit destination-page visibility action on archive/withdraw:
- unpublish
- move to draft
- remove from site pages
- or clearly document and automate the expected hosted action

---

## P2 — Descriptor `mvpFields` are materially drifted from tenant schema

### Files
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts`

### Issue
Several `mvpFields` arrays still contain obsolete pre-tenant-audit field names.

### Why it is wrong
Any validation, diagnostics, or future developer work built on these descriptors will be misled.

### Likely symptom
- false confidence in schema alignment
- bad future tests
- drift between docs and runtime assumptions

### Fix direction
Rewrite `mvpFields` arrays strictly from tenant schema authority.

---

## P2 — UI drift banner promises regeneration more broadly than policy actually does

### Files
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`

### Issue
The UI shows “drift — will regenerate” when shell drift exists, but republish policy performs in-place update on shell drift.

### Why it is wrong
The UI explanation is not faithful to actual runtime behavior.

### Likely symptom
Operator confusion during republish.

### Fix direction
Either:
- change the policy to regenerate on shell drift, or
- change the UI text to reflect actual in-place update behavior

---

## P2 — Child replace-all writes are destructive and non-transactional

### Files
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`

### Issue
Team/media replace-all deletes all existing child rows first, then recreates them.

### Why it is wrong
A mid-write failure can leave the article with zero child rows.

### Likely symptom
Partial save causes data loss.

### Fix direction
Use keyed upsert/merge semantics, or stage writes and only remove superseded rows after successful insert/update completion.

---

## P3 — Archive / withdraw error logging uses coarse mode semantics

### Files
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`

### Issue
Lifecycle helper records some archive/withdraw failures through generic mode mapping that is semantically coarse.

### Why it is wrong
Operational diagnostics become less precise.

### Likely symptom
Error register is usable but less helpful than it should be.

### Fix direction
Introduce explicit lifecycle operation classification for archive/withdraw failures.
