# 03 - Findings Register

## P0

### P0-1 — Team-member user field is not closed end to end
**Files**
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts`
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

**Issue**
The tenant schema requires `HB Article Team Members.PersonPrincipal` as a SharePoint User field. The authoring surface builds team-member rows with a string principal only. The writer persists `PersonPrincipalId`, but no user-resolution seam was found before save.

**Why it is wrong**
The list requires a real User-field value. A raw string principal is not enough, and `PersonPrincipalId: null` does not satisfy the tenant requirement.

**Likely runtime / hosted symptom**
- Team member save fails
- Team member rows save incompletely
- Team Viewer renders no people or stale people
- Existing rows may fail to rehydrate in edit mode

**Recommended fix direction**
Add a real people-picker + ensure-user resolution flow. Persist a validated `PersonPrincipalId` before save, and explicitly `$select/$expand` the user field on read.

---

### P0-2 — Republish “in-place update” does not actually guarantee same-page updates
**Files**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCreationService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCompositor.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`

**Issue**
The policy layer says `inPlaceUpdate` preserves `PageId` and `PageUrl`, but the page-creation layer resolves the target page by `FileName` / page name, not by the existing binding’s `PageId`.

**Why it is wrong**
A republish path cannot promise same-page mutation if it does not target the already bound page identity.

**Likely runtime / hosted symptom**
- Duplicate pages when slug/page name changes
- Binding suddenly points at a different page
- Old page remains stale/live
- Hosted behavior appears inconsistent with preview/policy messaging

**Recommended fix direction**
For `inPlaceUpdate`, target the existing bound page by `PageId` or otherwise hard-bind to the existing page identity. Treat page-name drift as an explicit rename or regeneration path.

---

### P0-3 — Regeneration path lacks real supersession / prior-binding preservation
**Files**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`

**Issue**
The policy/comments describe regeneration as creating a new page and superseding the prior binding, but the actual binding writer upserts one binding row by `ArticleId`.

**Why it is wrong**
There is no durable regeneration lineage if the old binding row is overwritten in place.

**Likely runtime / hosted symptom**
- No audit trail of prior page identity
- Inability to distinguish regeneration from normal sync
- Stale prior page can remain without durable binding history
- Ops/debug confusion around what page is canonical

**Recommended fix direction**
Either:
1. redesign the binding model to preserve prior binding rows and explicit supersession, or
2. formally adopt a one-row binding model and remove all logic/comments that imply archived prior bindings.

---

## P1

### P1-1 — Scheduled workflow is operationally stranded
**Files**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`

**Issue**
The workflow allows `approved -> scheduled`, but Publish is only enabled from `approved`, and no scheduled publish executor was found.

**Why it is wrong**
A workflow branch exists without an execution path.

**Likely runtime / hosted symptom**
Operators can move an article into `scheduled` but cannot actually complete publication through the current UI.

**Recommended fix direction**
Implement scheduled publish fulfillment or remove/suspend the scheduled branch until a real executor exists.

---

### P1-2 — New article creation hard-wires a monthly template override
**Files**
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/templateResolver.ts`

**Issue**
New article creation seeds `TemplateKey='ps-inprogress-monthly-v1'`. The resolver treats non-empty `TemplateKey` as an override.

**Why it is wrong**
This bypasses template selection logic for new content and effectively hard-codes the monthly template.

**Likely runtime / hosted symptom**
- Milestone or project-update templates are unreachable for new rows
- Registry behavior appears inconsistent with actual runtime

**Recommended fix direction**
Default `TemplateKey` to blank and let the resolver select from the registry, or expose a controlled template-selection UI.

---

### P1-3 — Milestone path is not fully implemented
**Files**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`

**Issue**
The validation engine requires `MilestoneLabel` and `MilestoneDateUtc` for milestone-required field sets, but the UI does not expose them and the article writer does not persist them.

**Why it is wrong**
A template-driven required path exists without authoring or persistence support.

**Likely runtime / hosted symptom**
Milestone-oriented articles cannot successfully complete validation/publish.

**Recommended fix direction**
Add milestone authoring controls and write mapping, or remove milestone template support from the current sprint scope.

---

### P1-4 — Workflow-history append failure is logged under the wrong stage
**Files**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`

**Issue**
When `workflowHistory.append` fails after publish/republish, the publishing error is recorded as `articleSync` instead of `historyAppend`.

**Why it is wrong**
It misidentifies the failing subsystem.

**Likely runtime / hosted symptom**
Ops/debugging teams lose accurate failure-stage visibility in `HB Article Publishing Errors`.

**Recommended fix direction**
Record the correct failure stage and keep error titles/stage mapping consistent.

---

## P2

### P2-1 — Team-member list descriptor drifts from tenant schema
**Files**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts`
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

**Issue**
The descriptor MVP fields include `PersonPrincipalId`, while the tenant field/internal name is `PersonPrincipal`.

**Why it is wrong**
Descriptors are supposed to reflect the list contract, not the transport-specific REST payload alias.

**Likely runtime / hosted symptom**
Schema enforcement/tests can validate the wrong thing and miss user-field drift.

**Recommended fix direction**
Make descriptors reflect tenant field names. Keep transport-specific payload mapping inside the writer only.

---

### P2-2 — App policy is stricter than tenant schema on `TargetSiteUrl`
**Files**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

**Issue**
The tenant `HB Articles.TargetSiteUrl` field is optional in schema, but the app treats it as effectively required for current-sprint publishing.

**Why it is wrong**
It creates policy/schema divergence unless intentionally documented.

**Likely runtime / hosted symptom**
Articles can be valid at the list level but blocked by the app.

**Recommended fix direction**
Either document this as an app-level invariant or derive the destination URL from destination/template instead of making the author carry it.

---

### P2-3 — Multi-destination schema exists, but implementation is still single-destination
**Files**
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/xmlShellManifest.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`

**Issue**
Schema/enums include `companyPulse`, but runtime behavior is hard-locked to Project Spotlight.

**Why it is wrong**
The implementation surface appears broader than the actual working behavior.

**Likely runtime / hosted symptom**
Confusion in UI, contracts, or future operator expectations.

**Recommended fix direction**
Hide unsupported destinations in the UI until the destination strategy layer is actually implemented.

---

### P2-4 — Team-member read path is probably under-specified for SharePoint user-field hydration
**Files**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

**Issue**
Repository reads do not explicitly request `$select/$expand` for the `PersonPrincipal` user field, while the mapper expects either a flattened or expanded value.

**Why it is wrong**
SharePoint user fields are not reliably hydrated in useful shape without explicit select/expand control.

**Likely runtime / hosted symptom**
Existing team-member rows fail to load cleanly in the editor or preview.

**Recommended fix direction**
Explicitly select and expand the user field and normalize the returned shape.

---

## P3

### P3-1 — Comment/policy language overstates guarantees the code does not yet enforce
**Files**
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCreationService.ts`

**Issue**
Several comments describe stable in-place republish identity and superseded prior bindings as if fully implemented.

**Consequence**
Future developers and reviewers can over-trust the current state.

**Recommended fix direction**
Bring comments back to exact repo truth until the lower-level behavior is actually implemented.
