# 02 — Workflow Logic Assessment

## 1. Repo ownership and entry points
The Article Publisher implementation is real and discoverable in the repo.

### Proven entry-path ownership
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`

### Verdict
The web part bootstrapping path is internally consistent.

The problem is **not** that the Article Publisher web part is missing.  
The problem is that the implementation under that shell is wired to the wrong data model.

---

## Rebranding alignment note
The app identity has been rebranded to **Article Publisher**, but the rebranding report explicitly states that no functional or workflow changes were made. Accordingly, the workflow defects below still stand; only the app-facing file and symbol references have been updated to the new `articlePublisher` surface.

## 2. Workflow state machine
### Observed implementation
`workflowStateMachine.ts` defines:
- `draft -> inReview | archived | withdrawn`
- `inReview -> approved | draft | withdrawn`
- `approved -> scheduled | published | draft | withdrawn`
- `scheduled -> published | approved | withdrawn`
- `published -> archived | withdrawn`
- `archived -> withdrawn`
- `withdrawn -> terminal`

### Tenant-schema reality
The tenant history schema uses states:
- `draft`
- `review`
- `approved`
- `scheduled`
- `published`
- `archived`
- `withdrawn`

### Critical mismatch
The code uses `inReview`; the tenant uses `review`.

### Additional structural mismatch
The code also generates history actions:
- `transition`
- `publish`
- `archive`
- `withdraw`
- `approvalDecision`

But the tenant workflow-history list does not expose an `Action` field.

### Verdict
**Workflow state machine is not trustworthy relative to tenant schema**

---

## 3. UI transition behavior
### Observed implementation
In `ArticlePublisher.tsx`, `handleTransition()`:
1. checks `canTransition()`
2. updates the post row
3. appends one workflow-history row
4. reloads list + selected record

### Missing tenant-aligned side effects
- No page-binding status update for archive/withdraw
- No destination-page cleanup logic
- No publishing-error logging
- No promotion-rule interaction
- No tenant-aligned page-sync state handling

### Verdict
**Transition behavior is incomplete**

The current transitions are UI-level state changes backed by the wrong record model, not a complete operational lifecycle.

---

## 4. Preview behavior
### Observed implementation
Preview calls the shared resolution pipeline and page compositor, then returns a structured page preview without writing tenant data.

### What is good
- Preview and publish share a common resolution/context pattern.
- Structural composition is separated from writing.

### What is wrong
Preview depends on:
- wrong template-registry schema,
- wrong master-record schema,
- wrong binding schema,
- wrong enum model.

### Verdict
**Preview is architecturally structured, but schema-invalid**

---

## 5. Publish behavior
### Observed implementation
Publish orchestration:
1. build resolution context
2. compose page
3. validate
4. decide republish action
5. call page-shell publish service
6. write binding row

### Good structural qualities
- centralized orchestrator
- decision policy separated from authoring UI
- page creation abstracted behind a service
- binding write abstracted behind a seam

### Critical problems
#### A. Resolution is built on the wrong schema
The resolver and context builder assume:
- wrong master-list shape,
- wrong template-registry shape,
- wrong page-binding shape,
- wrong child-row shape.

#### B. Publish path does not fully update the master article row
No tenant-aligned master-record write was found after successful publish to persist:
- published page URL/ID,
- page-template key,
- sync status,
- last sync / render metadata in `HB Articles`.

#### C. History is not appended around publish orchestration
The explicit transition handler writes history during state changes, but the orchestrator itself does not own a tenant-aligned publish-history flow.

#### D. Error logging is not implemented
The publishing-errors append path is intentionally unimplemented.

#### E. Archive / withdraw are not publish-pipeline operations
No full archive or withdrawal pipeline was found.

### Verdict
**Publish / republish behavior is only partially implemented and not tenant-aligned**

---

## 6. Does “publish” actually publish the page?
### Observed implementation
`pageCreationService.ts`:
- ensures a page exists,
- patches `CanvasContent1`,
- explicitly states it does not publish from that service.

`pageShellService.ts` simply composes and delegates to `createOrUpdate()`.

### Conclusion
The current “publish” path appears to create or update the page canvas, but not necessarily perform the final modern-page publish action required to make the page live.

### Verdict
**Likely hosted defect**

Even if upstream data wiring were corrected, the final page-publish step still requires proof or remediation.

---

## 7. Template resolution and drift handling
### Observed implementation
The resolver and validator implement:
- deterministic template selection,
- specificity tie-breaks,
- version tie-breaks,
- required field-set enforcement,
- shell compatibility checks,
- drift/regeneration handling.

### Problem
These behaviors are built against a template registry schema the tenant does not actually have.

### Verdict
**Well-structured but pointed at the wrong registry model**

---

## 8. Destination-page / binding drift handling
### Observed implementation
The publish pipeline writes to a modeled `Project Spotlight Page Bindings` list and uses decision logic for:
- create
- in-place update
- regenerate
- blocked
- no-op

### Tenant-schema reality
The tenant binding model is different:
- `HB Article Destination Pages`
- `ArticleId`
- `PageTemplateKey`
- `PublishStatus`
- `SyncStatus`
- `RenderVersion`
- `LastSyncDateUtc`
- `LastSyncMessage`

### Verdict
**Binding-drift logic is not wired to the tenant’s actual page-binding contract**

---

## 9. Promotion-rule behavior
No promotion-rule repository, resolver, or publish-stage consumer was found.

### Verdict
**Missing**

---

## 10. Hosted behavior implications
If the hosted page at `Marketing-New/SitePages/Article-Publisher.aspx` is running this main-branch implementation, the most likely outcomes are:

1. **Initial data load failures**
   - repository reads target non-existent `Project Spotlight *` lists rather than `HB Article*` lists.

2. **Save failures**
   - writes target wrong list titles and wrong fields.

3. **Workflow inconsistencies**
   - UI exposes `inReview`, but tenant workflow history expects `review`.

4. **Template-resolution failures**
   - resolver looks for incompatible registry fields such as `TemplateStatus` and `TemplateVersion`.

5. **Republish / drift decisions cannot be trusted**
   - binding model does not match tenant schema.

6. **No authoritative error-log records**
   - publishing-errors append is unimplemented.

7. **Promotion defaults / homepage / destination-rollup behavior absent**
   - promotion-rules list is unwired.

8. **Possible false-positive “publish succeeded” cases**
   - even if a page record were created or updated, final publish semantics are not proven.

---

## Final workflow verdict
The workflow / preview / publish architecture has some solid structural decomposition, but the actual live wiring is not operationally sound because the underlying schema contract is wrong.

This implementation should be treated as:
- **shell present**
- **workflow conceptually scaffolded**
- **tenant wiring invalid**
- **not ready for hosted production use**
