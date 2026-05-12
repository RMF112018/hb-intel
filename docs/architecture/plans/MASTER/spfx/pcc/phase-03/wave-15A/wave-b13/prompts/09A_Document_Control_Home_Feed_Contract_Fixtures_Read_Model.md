# Phase 08 Prompt 09A — Project Home Document Control Feed Contract, Fixtures, and Read-Model Seam

## Role
Act as the implementation owner for Phase 08 Prompt 09A in the `hb-intel` repo. Execute the work, validate it, and return a concise but complete closeout.

## Baseline / Preflight
Before editing:
1. Confirm the actual current local branch and HEAD.
2. Confirm the PCC package / feature / manifest posture is intentionally aligned at **`1.0.0.222`** unless newer operator-approved local drift is already present.
3. Confirm `pnpm-lock.yaml` MD5 before edits.
4. Capture `git status --short`.
5. If operator-owned WIP exists, preserve it and report it; do not wipe or normalize it.

Do **not** re-read files still within current context or memory unless local drift is suspected or an exact edit location is required.

## Parallel Document Control Surface Safety — Mandatory
There is active parallel work occurring on the **dedicated Document Control surface**. Prompt 09A must not disrupt that work.

Rules:
- Do **not** edit files under `apps/project-control-center/src/surfaces/documents/`.
- Shared files such as `packages/models/src/pcc/DocumentControl.ts`, `packages/models/src/pcc/PccReadModels.ts`, the fixture client, or the backend mock provider may be changed in parallel. Re-open only the shared files you will edit immediately before patching.
- Preserve all existing fields and behavior used by the dedicated Documents surface. This prompt is additive.
- Do not remove or reshape `sources`, Wave 7 lane vocabulary, source registry, source health, review states, review types, hard-no rules, role-action availability, action catalog, or review-queue data.
- If a shared-file conflict or drift is detected, merge additively and record the drift in closeout rather than reverting concurrent work.

## Objective
Add the **Project Home Document Control recent-item feed contract** and deterministic fixture/read-model support without changing the Project Home card UI yet.

The later UI prompt will use this contract to render:
- `My Recent Files`
- `Latest Changes`

The new feed is **Project Home summary data only**. It does **not** replace the dedicated Documents surface source-registry model.

## Product Decisions — Closed
1. Scope is limited to the Project Home `PccDocumentControlCard` follow-on.
2. The feed includes only:
   - SharePoint
   - OneDrive
   - Procore
3. The feed is preview-only in this phase.
4. **Future deep-link behavior must be documented explicitly**:
   - unique source paths / item paths / Procore record deep-link paths are intentionally deferred;
   - actual row-level deep-link execution lands only after those paths are established and authorized in a later phase;
   - this prompt may model future deep-link posture metadata, but it must not add runtime launch behavior.
5. `Latest Changes` is project-wide **but target-architecture permission-filtered for the authenticated viewer**. MVP fixtures model that posture deterministically; no live permission filtering lands here.
6. Sorting is deterministic:
   - `My Recent Files`: most recent `accessedAtUtc` first; top 5.
   - `Latest Changes`: most recent `changedAtUtc` first; top 5.
   - timestamps must be fixed UTC fixture values.

## Repo-Truth Anchors
As of the prior reviewed baseline:
- `PccDocumentControlCard` currently consumes `sources?: readonly IDocumentControlSource[]`.
- `PccProjectHomeViewModel.documentControl` currently carries document-control source arrays.
- `PccDocumentControlReadModel` currently exposes `sources` and Wave 7 doctrine fields, but no Project Home recent-item feed.
- Both the SPFx fixture client and backend mock provider assemble document-control read-model envelopes.

Inspect local repo truth before editing and adapt exact line references if drift exists.

## Required Implementation

### 1. Extend Document Control domain vocabulary additively
Add domain types/constants for a Project Home feed. Prefer keeping them in the existing Document Control model surface unless local repo organization clearly dictates a more appropriate adjacent model file.

Required conceptual types:
```ts
DocumentControlHomeFeedMode =
  | 'my-recent-files'
  | 'latest-changes';

DocumentControlHomeFeedSource =
  | 'sharepoint'
  | 'onedrive'
  | 'procore';

DocumentControlHomeFeedItemKind =
  | 'file'
  | 'drawing'
  | 'specification'
  | 'rfi'
  | 'submittal'
  | 'change-order'
  | 'commitment'
  | 'change-event'
  | 'inspection'
  | 'observation'
  | 'punch-list';

DocumentControlHomeFeedChangeKind =
  | 'added'
  | 'updated';
```

Use typed readonly interfaces for:
- base feed item metadata;
- recent item (`accessedAtUtc`);
- latest-change item (`changedAtUtc` + `changeKind`);
- aggregate home feed (`myRecentFiles`, `latestChanges`).

Suggested structure:
```ts
interface IPccDocumentControlHomeFeedBaseItem {
  readonly id: string;
  readonly title: string;
  readonly source: DocumentControlHomeFeedSource;
  readonly kind: DocumentControlHomeFeedItemKind;
  readonly contextLabel: string;
  readonly deepLinkPosture: 'preview-only' | 'future-deep-link';
  readonly permissionPosture: 'viewer-authorized-preview';
}

interface IPccDocumentControlRecentFeedItem
  extends IPccDocumentControlHomeFeedBaseItem {
  readonly accessedAtUtc: string;
}

interface IPccDocumentControlLatestChangeFeedItem
  extends IPccDocumentControlHomeFeedBaseItem {
  readonly changedAtUtc: string;
  readonly changeKind: DocumentControlHomeFeedChangeKind;
}

interface IPccDocumentControlHomeFeed {
  readonly myRecentFiles: readonly IPccDocumentControlRecentFeedItem[];
  readonly latestChanges: readonly IPccDocumentControlLatestChangeFeedItem[];
}
```

You may refine names to match repo conventions, but the semantic contract above must be preserved.

### 2. Add explicit future deep-link documentation
Add durable code-level documentation near the feed contract and/or fixture constants:
- row-level deep links are not executable in this phase;
- later phases will map SharePoint / OneDrive / Procore item-specific paths only after canonical path resolution and authorization gates are approved;
- this Prompt 09 work intentionally provides summary metadata and card UI posture only.

This must be **developer-facing documentation**, not new end-user UI copy.

### 3. Extend `PccDocumentControlReadModel` additively
Add:
```ts
readonly homeFeed?: IPccDocumentControlHomeFeed;
```
or an equivalent additive optional property.

Why optional:
- preserve compatibility for parallel Documents surface work;
- preserve current consumers that do not need homepage feed data;
- allow adapter-level safe-empty fallback.

Do not make current Documents-surface render paths depend on this field.

### 4. Add canonical deterministic fixtures
Add:
- `SAMPLE_PCC_DOCUMENT_CONTROL_HOME_FEED`
- `EMPTY_PCC_DOCUMENT_CONTROL_HOME_FEED`

or repo-consistent equivalents.

Fixture requirements:
- exactly 5 `myRecentFiles` items;
- exactly 5 `latestChanges` items;
- sorted descending by their respective timestamp;
- sources represented across SharePoint, OneDrive, and Procore;
- Procore items must support the explicitly approved MVP tool universe:
  - Documents
  - Drawings
  - Specifications
  - RFIs
  - Submittals
  - Change Orders
  - Commitments
  - Change Events
  - Inspections
  - Observations
  - Punch List
  Not every tool must appear in the top five preview items, but fixture comments/docs should make clear the card model is intended to support this full universe.
- all fixture items use `deepLinkPosture: 'preview-only'` in this phase.
- permission posture indicates viewer-authorized preview intent.

### 5. Update SPFx fixture read-model client parity
In the fixture client document-control read-model assembly:
- known project → include sample home feed;
- unknown project → include empty home feed;
- backend-unavailable simulator → include empty home feed.

Do not disturb existing Wave 7 document-control source registry or review-queue samples.

### 6. Update backend mock read-model provider parity
Apply the same known / unknown / backend-unavailable feed behavior in the backend mock provider.

The SPFx fixture client and backend mock provider must not drift on the new homepage feed posture.

### 7. Update Project Home adapter/view-model seam
Retarget the Project Home document-control slot from source-array summary data to feed-summary data.

Required posture:
- `projectHomeViewModel.ts`: document-control slot type becomes the home feed summary type.
- `projectHomeAdapter.ts`: map from `docs?.homeFeed ?? EMPTY_*_HOME_FEED`.
- Keep card state derivation driven by the existing document-control envelope source status.
- Do not alter the dedicated Documents surface read-model content or its view-model files.

### 8. Exports
Update model exports only where required to make the new contract available through the existing `@hbc/models/pcc` import seam.

## Tests
Add/update tests to lock:
1. Feed vocabulary and fixture cardinality.
2. Feed timestamps are deterministic and ordered newest-first.
3. Fixture sources are only SharePoint / OneDrive / Procore.
4. Empty feed exists and is used in degraded/unknown branches.
5. `PccDocumentControlReadModel` carries the optional homepage feed without disturbing existing fields.
6. Project Home adapter maps feed data rather than source arrays.
7. SPFx fixture client and backend mock provider remain in parity for feed presence and cardinality.
8. No dedicated Documents surface test expectations are changed by this prompt.

Use existing repo test locations and naming patterns. Do not invent an unrelated parallel test architecture.

## Out of Scope / Hard Stops
- No UI change to `PccDocumentControlCard` yet.
- No edit to `apps/project-control-center/src/surfaces/documents/`.
- No live Graph, SharePoint REST, PnP, Procore, or deep-link execution.
- No anchors, hrefs, buttons, or launch affordances for feed rows.
- No package/manifest/version bump unless operator has already established a separate intentional bump in current WIP.
- No lockfile mutation.
- No dependency additions.
- No changes to bento choreography in this prompt.
- No raw colors, no visual CSS changes.

## Validation
Run at minimum:
```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <all prompt-touched files>
git diff --check
```

Record lockfile MD5 before/after.

## Closeout Format
Return:
1. Verdict: PASS / BLOCKED
2. Baseline HEAD and ending HEAD
3. Version posture observed
4. Files changed
5. Feed contract summary
6. Parallel Document Control surface safety statement
7. Validation results
8. Lockfile MD5 before/after
9. Commit summary and description if committed
10. Residual risks / follow-up notes
