# Phase 08 Prompt 09A — Project Home Document Control Feed Contract, Fixtures, and Additive Read-Model Seam

## Role
Act as the implementation owner for **Phase 08 Prompt 09A** in the `hb-intel` repo. Execute the work, validate it, and return a concise but complete closeout.

This is a **contract / fixture / read-model preparation prompt only**. It establishes the deterministic Project Home Document Control feed data seam that Prompt 09B will render. It must **not** force an early `PccDocumentControlCard` UI migration.

---

## Baseline / Preflight

Before editing:

1. Confirm the actual current local branch and HEAD.
2. Confirm the PCC package / feature / manifest posture is intentionally aligned at **`1.0.0.222`** unless newer operator-approved local drift is already present.
3. Confirm `pnpm-lock.yaml` MD5 before edits.
4. Capture `git status --short`.
5. If operator-owned WIP exists, preserve it and report it; do not wipe or normalize it.
6. Confirm current repo truth for the existing Project Home Document Control seam before changing it:
   - `PccDocumentControlCard` still renders the existing source-lane body and accepts source-array data;
   - `PccProjectHomeViewModel.documentControl` still carries document-control source arrays;
   - `PccProjectHomeReadModelContent` still passes that source-array slot into `PccDocumentControlCard`.

Do **not** re-read files still within current context or memory unless local drift is suspected or an exact edit location is required.

---

## Parallel Document Control Surface Safety — Mandatory

There is active parallel work occurring on the **dedicated Document Control surface**. Prompt 09A must not disrupt that work.

Rules:

- Do **not** edit files under:
  ```text
  apps/project-control-center/src/surfaces/documents/
  ```
- Shared files such as:
  ```text
  packages/models/src/pcc/DocumentControl.ts
  packages/models/src/pcc/PccReadModels.ts
  packages/models/src/pcc/fixtures/**
  apps/project-control-center/src/api/pccFixtureReadModelClient.ts
  backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
  apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts
  apps/project-control-center/src/surfaces/projectHome/projectHomeAdapter.ts
  ```
  may be changed when needed for this prompt.
- Re-open only the shared files you will edit immediately before patching.
- Preserve all existing fields and behavior used by the dedicated Documents surface. This prompt is additive.
- Do **not** remove or reshape:
  - `sources`
  - Wave 7 lane vocabulary
  - source registry
  - source health
  - review states
  - review types
  - hard-no rules
  - role-action availability
  - action catalog
  - review-queue data
- If a shared-file conflict or drift is detected, merge additively and record the drift in closeout rather than reverting concurrent work.
- Do not edit or weaken dedicated Documents surface tests. A compile-only import adjustment outside the dedicated Documents surface test contract is permitted only if independently required and explicitly documented; no Documents surface expectation changes are authorized.

---

## Objective

Add the **Project Home Document Control recent-item feed contract** and deterministic fixture/read-model support **without changing the Project Home card UI yet**.

The later UI prompt will use this contract to render:

- `My Recent Files`
- `Latest Changes`

The new feed is **Project Home summary data only**. It does **not** replace:

- the dedicated Documents surface source-registry model;
- the existing Project Home `documentControl` source-array slot used by the current card body;
- the Project Home source-lane UI until Prompt 09B explicitly performs that migration.

---

## Product Decisions — Closed

1. Scope is limited to the Project Home `PccDocumentControlCard` follow-on.
2. The feed includes only:
   - SharePoint
   - OneDrive
   - Procore
3. The feed is preview-only in this phase.
4. **Future deep-link behavior must be documented explicitly**:
   - unique SharePoint item paths, OneDrive item paths, and Procore record deep-link paths are intentionally deferred;
   - actual row-level deep-link execution lands only after those paths are established and authorized in a later phase;
   - this prompt may model future deep-link posture metadata, but it must not add runtime launch behavior.
5. `Latest Changes` is project-wide **but target-architecture permission-filtered for the authenticated viewer**. MVP fixtures model that posture deterministically; no live permission filtering lands here.
6. Sorting is deterministic:
   - `My Recent Files`: most recent `accessedAtUtc` first; top 5.
   - `Latest Changes`: most recent `changedAtUtc` first; top 5.
   - timestamps must be fixed UTC fixture values.
7. The home-feed item vocabulary is a **Project Home summary-feed vocabulary only**. It must not:
   - redefine the dedicated Document Control Explorer contract;
   - create a new Procore domain contract;
   - introduce cross-prompt coupling with Prompt 10 Documents-surface work.
8. Any `permissionPosture` metadata added in this prompt is **display/read-model posture metadata only**. It is not:
   - a runtime authorization check;
   - a user entitlement assertion;
   - a security enforcement mechanism.

---

## Repo-Truth Anchors

As of the current repo-truth baseline, confirm before editing:

- `PccDocumentControlCard` consumes:
  ```ts
  sources?: readonly IDocumentControlSource[]
  ```
  and renders the existing Project Home source-lane summary body.
- `PccProjectHomeViewModel.documentControl` carries:
  ```ts
  readonly IDocumentControlSource[]
  ```
- `PccProjectHomeReadModelContent` passes:
  ```ts
  sources={viewModel?.documentControl.data}
  ```
  into `PccDocumentControlCard`.
- `PccDocumentControlReadModel` exposes:
  - `sources`
  - Wave 7 doctrine fields
  - no Project Home recent-item home feed yet.
- Both the SPFx fixture client and backend mock provider assemble document-control read-model envelopes.

If local repo truth differs, classify the drift precisely and proceed only when the Prompt 09A additive objective remains safe.

---

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

Suggested semantic structure:

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

Add durable developer-facing documentation near the feed contract and/or fixture constants:

- row-level deep links are not executable in this phase;
- later phases will map SharePoint / OneDrive / Procore item-specific paths only after canonical path resolution and authorization gates are approved;
- this Prompt 09 work intentionally provides summary metadata and future card UI posture only.

This must be **developer-facing documentation**, not new end-user UI copy.

### 3. Extend `PccDocumentControlReadModel` additively

Add:

```ts
readonly homeFeed?: IPccDocumentControlHomeFeed;
```

or an equivalent additive optional property.

Why optional:

- preserve compatibility for parallel Documents surface work;
- preserve current consumers that do not need Project Home feed data;
- allow adapter-level safe-empty fallback.

Do **not** make current Documents-surface render paths depend on this field.

### 4. Add canonical deterministic fixtures in the existing shared fixture architecture

Add:

- `SAMPLE_PCC_DOCUMENT_CONTROL_HOME_FEED`
- `EMPTY_PCC_DOCUMENT_CONTROL_HOME_FEED`

or repo-consistent equivalents.

Place them in the existing shared `@hbc/models/pcc` fixture structure and export them through the existing fixture barrel pattern. Do **not** create SPFx-local duplicate feed arrays as the canonical source.

Fixture requirements:

- exactly 5 `myRecentFiles` items;
- exactly 5 `latestChanges` items;
- sorted descending by their respective timestamp;
- sources represented across SharePoint, OneDrive, and Procore;
- Procore items must support the explicitly approved MVP summary-feed item universe:
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
- Not every Procore item kind must appear in the top-five preview arrays, but fixture comments/docs should make clear the **Project Home summary-feed model** is intended to support this full universe.
- all fixture items use:
  ```ts
  deepLinkPosture: 'preview-only'
  ```
  in this phase.
- `permissionPosture` indicates viewer-authorized preview **intent only** and must be documented as non-enforcing display/read-model metadata.

### 5. Update SPFx fixture read-model client parity

In the fixture client document-control read-model assembly:

- known project → include sample home feed;
- unknown project → include empty home feed;
- backend-unavailable simulator → include empty home feed.

Do not disturb existing Wave 7 document-control source registry or review-queue samples.

### 6. Update backend mock read-model provider parity

Apply the same known / unknown / backend-unavailable feed behavior in the backend mock provider.

The SPFx fixture client and backend mock provider must not drift on the new Project Home feed posture.

### 7. Add an **additive Project Home feed seam** without retargeting the existing rendered card slot yet

This is the key repo-truth correction for Prompt 09A.

Current runtime truth still uses the existing Project Home document-control slot to feed the existing source-lane UI body:

```ts
PccProjectHomeReadModelContent
  -> viewModel?.documentControl.data
  -> PccDocumentControlCard.sources
```

Therefore Prompt 09A must **not** retarget or repurpose the existing `documentControl` slot yet. Doing so would force an early card UI migration or break type safety.

Required posture:

- Preserve:
  ```ts
  readonly documentControl: IPccProjectHomeViewModelSlot<readonly IDocumentControlSource[]>;
  ```
- Add a new additive slot for Prompt 09B to consume, using a repo-consistent name such as:
  ```ts
  readonly documentControlHomeFeed: IPccProjectHomeViewModelSlot<IPccDocumentControlHomeFeed>;
  ```
  or another clearly equivalent, explicit name.
- In `projectHomeAdapter.ts`:
  - preserve the existing source-array mapping:
    ```ts
    documentControl: slot(docStatus, docs?.sources ?? [])
    ```
  - add the new feed mapping:
    ```ts
    documentControlHomeFeed: slot(
      docStatus,
      docs?.homeFeed ?? EMPTY_PCC_DOCUMENT_CONTROL_HOME_FEED
    )
    ```
- Keep state derivation driven by the existing document-control envelope source status.
- Do **not** change `PccDocumentControlCard` props or body in this prompt.
- Do **not** change `PccProjectHomeReadModelContent` wiring to `PccDocumentControlCard.sources` in this prompt.
- Prompt 09B will perform the explicit UI migration from source-lane body to home-feed tabs and then consume the new feed slot.

### 8. Exports

Update model exports only where required to make the new contract and fixture available through the existing `@hbc/models/pcc` import seam.

Use current repo export conventions. Do not create ad hoc cross-package import paths.

---

## Tests

Add/update tests to lock:

1. Feed vocabulary and fixture cardinality.
2. Feed timestamps are deterministic and ordered newest-first.
3. Fixture sources are only SharePoint / OneDrive / Procore.
4. Empty feed exists and is used in degraded/unknown branches.
5. `PccDocumentControlReadModel` carries the optional homepage feed without disturbing existing fields.
6. Project Home adapter exposes the new **additive feed slot** while preserving the existing source-array `documentControl` slot unchanged.
7. SPFx fixture client and backend mock provider remain in parity for feed presence and cardinality.
8. No dedicated Documents surface test expectations are changed by this prompt.
9. The current `PccProjectHomeReadModelContent -> PccDocumentControlCard.sources` wiring remains intact in Prompt 09A, with no premature feed UI migration.

Use existing repo test locations and naming patterns. Do not invent an unrelated parallel test architecture.

---

## Out of Scope / Hard Stops

- No UI change to `PccDocumentControlCard` yet.
- No edit to:
  ```text
  apps/project-control-center/src/surfaces/documents/
  ```
- No change to `PccProjectHomeReadModelContent` feed rendering yet.
- No live Graph, SharePoint REST, PnP, Procore, or deep-link execution.
- No anchors, hrefs, buttons, or launch affordances for feed rows.
- No package/manifest/version bump unless operator has already established a separate intentional bump in current WIP.
- No lockfile mutation.
- No dependency additions.
- No changes to bento choreography in this prompt.
- No visual CSS changes.
- No raw colors.

---

## Validation

Run at minimum:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml

pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test

pnpm exec prettier --check <all prompt-touched files>
git diff --check

md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If backend provider tests are in the normal package test path for the changed backend fixture/provider seam, run the targeted repo-standard backend test command required by current repo practice and record it. Do not invent a new test command.

---

## Closeout Format

Return:

1. Verdict: PASS / BLOCKED
2. Baseline HEAD and ending HEAD
3. Version posture observed
4. Files changed
5. Feed contract summary
6. Additive Project Home feed seam summary:
   - existing `documentControl` source-array slot preserved;
   - new feed slot added for Prompt 09B consumption;
   - no card/UI retargeting occurred in Prompt 09A
7. Parallel Document Control surface safety statement
8. Validation results
9. Lockfile MD5 before/after
10. Commit summary and description if committed
11. Residual risks / follow-up notes
12. Prompt 09B readiness verdict
