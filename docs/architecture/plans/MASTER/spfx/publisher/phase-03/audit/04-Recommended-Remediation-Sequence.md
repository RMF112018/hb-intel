# 04 — Recommended Remediation Sequence

## Recommended sequence
Do the work in the following order.

## Wave 1 — Workflow and publish-lifecycle closure
### Objective
Make “published” mean exactly one thing across article state, destination page, binding, history, and UI.

### Scope
1. Remove manual direct transition to `published`.
2. Make successful publish the only path that sets `WorkflowState='published'`.
3. Append workflow-history rows for publish and republish.
4. Reconcile `PublishedDateUtc` semantics.
5. Align preview/UI drift messaging with actual republish policy.
6. Define whether shell-version drift should regenerate or update in place, then make policy, preview, and UI all agree.

### Exit criteria
- No UI path can mark article published without page/binding lifecycle.
- Publish success updates article state and history.
- Republish behavior is consistently explained and implemented.

## Wave 2 — Team-member schema realignment
### Objective
Make `HB Article Team Members` a real tenant-aligned seam.

### Scope
1. Replace string-based `PersonPrincipal` assumptions with correct SharePoint User-field handling.
2. Add/write required `Title`.
3. Remove or relocate non-schema fields:
   - `JobTitle`
   - `PhotoUrl`
   - `ResumeRichText`
   - `ResumeDocumentUrl`
   - `IncludeInViewer`
4. Rework TeamPanel, row mapper, writer, TeamViewer adapter, and validation rules together.

### Exit criteria
- Team rows can be created, read, and rendered from the real tenant list shape.
- Team Viewer no longer depends on fields that do not exist in tenant schema.

## Wave 3 — Media schema realignment
### Objective
Make `HB Article Media` save/load/render correctly.

### Scope
1. Replace `ImageAssetUrl` with tenant field `ImageAsset`.
2. Add/write required `Title`.
3. Verify gallery composer and preview use the same field.
4. Decide whether `FeaturedInGallery` and `GalleryGroup` should be operationally supported now or explicitly ignored.

### Exit criteria
- Media rows round-trip correctly through SharePoint.
- Gallery preview and publish consume the same tenant-aligned media contract.

## Wave 4 — Archive / withdraw lifecycle hardening
### Objective
Make archive and withdraw reliable visibility-control actions.

### Scope
1. Decide expected destination-page behavior on archive/withdraw:
   - unpublish
   - demote to draft
   - remove
   - or hosted admin action with enforced follow-up
2. Implement destination-page action accordingly.
3. Verify binding semantics and history semantics after archive/withdraw.

### Exit criteria
- Archived/withdrawn articles do not remain unintentionally live.

## Wave 5 — Non-transactional child-write hardening
### Objective
Reduce data-loss risk on child-list writes.

### Scope
1. Replace destructive delete-all/recreate-all behavior with keyed upsert semantics.
2. Add failure handling and partial-write protection.
3. Add explicit regression tests for partial failure.

### Exit criteria
- Failed child save cannot silently wipe team/media rows.

## Wave 6 — Descriptor and contract cleanup
### Objective
Remove stale schema assumptions from developer-facing runtime metadata.

### Scope
1. Rewrite `publisherListDescriptors.ts` `mvpFields` arrays from tenant truth.
2. Remove obsolete aliases and comments that no longer match runtime.
3. Add descriptor-drift tests.

### Exit criteria
- Descriptor metadata matches tenant schema and no longer carries misleading legacy fields.

## Best packaging approach for follow-on prompts
**Recommended:** one tightly bounded remediation package for only the highest-priority category first: workflow + publish lifecycle.

### Why
The current biggest risk is not cosmetic or peripheral; it is state corruption and false publish status. Fixing child-record seams first without fixing lifecycle closure would still leave the app operationally untrustworthy.

## Suggested next package structure
- `README.md`
- `00-Plan-Summary.md`
- `01-Prompt-Close-publish-workflow-source-of-truth.md`
- `02-Prompt-Route-published-state-through-orchestrator-only.md`
- `03-Prompt-Append-publish-and-republish-history.md`
- `04-Prompt-Reconcile-drift-policy-preview-and-UI-copy.md`
- `05-Prompt-Add-regression-tests-for-publish-lifecycle.md`
