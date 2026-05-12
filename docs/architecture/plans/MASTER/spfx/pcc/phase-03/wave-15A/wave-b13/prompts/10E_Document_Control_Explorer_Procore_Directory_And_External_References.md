# Phase 08 Prompt 10E — Document Control Explorer Procore Directory and External References

## Role

You are implementing **Phase 08 Prompt 10E** in the `RMF112018/hb-intel` repo.

Prompt 10E executes **after Prompt 10D**. Prompts 10B–10D should already have established:

- the typed Documents Explorer model foundation;
- the Explorer ready-path shell;
- root/source rail behavior;
- Project Record drill-down and breadcrumb traversal;
- one-click cross-source switching;
- mounted per-source path retention;
- Documents-specific `activeModuleId` focus behavior where the 10D router seam required it.

Prompt 10E fills in the **Procore governed directory detail experience** and restores **Document Crunch / Adobe Sign external references** inside the Explorer without distorting the source rail or reintroducing legacy lane-card composition.

---

## Objective

Implement a professional, deterministic, read-only / launch-only **Procore linked-record directory experience** inside the Document Control Explorer, and add a compact, grounded **External References** section for:

```text
Document Crunch
Adobe Sign
```

The implementation must:

- build on the post-10D Explorer navigation contract rather than bypassing it;
- extend the existing typed Explorer model consistently;
- reuse existing Document Control read-model external-system entries where available;
- avoid fake executable external links;
- preserve no-writeback / no-sync / no-mirror posture;
- preserve the four-root source rail:
  - Document Control Home
  - Project Record
  - My Project Files
  - Procore.

---

## Governing Context

### 1. Prompt sequence dependency

Prompt 10E must run only after Prompt 10D has been implemented and committed.

Before editing, verify that the current repo contains the effective Prompt 10D outcomes:

- Procore category rows are navigable, or the actual post-10D equivalent exists;
- breadcrumb traversal exists for nested Explorer locations;
- one-click source switching still works from nested states;
- mounted per-source path retention exists;
- any `activeModuleId` focus threading required by 10D is in place.

If Prompt 10D has not been executed, stop and report. Do not implement 10E on a post-10C-only repo.

### 2. Current repo foundation from 10B / 10C

Prompt 10B established:

```text
apps/project-control-center/src/surfaces/documents/documentExplorerModel.ts
apps/project-control-center/src/surfaces/documents/documentExplorerProcoreCategories.ts
apps/project-control-center/src/surfaces/documents/documentExplorerSourceRoots.ts
apps/project-control-center/src/surfaces/documents/documentExplorerHelpers.ts
apps/project-control-center/src/surfaces/documents/documentExplorerModuleFocus.ts
```

Relevant current contracts include:

- `DocumentExplorerNodeKind` includes `linked-record`;
- `IDocumentExplorerNode` includes optional `linkedRecordRef`;
- `IDocumentExplorerLinkedRecordRef` exists as the Prompt 10E extension seam;
- Procore categories already exist as stable category nodes with kebab-case path segments;
- `procore-documents` module focus was designed to resolve to Procore category path `['documents']`.

Prompt 10C established:

- the Explorer shell;
- Home pane;
- source rail;
- Procore root/category pane;
- stable `data-pcc-doc-explorer-*` test markers;
- current shell tests that intentionally keep Document Crunch / Adobe Sign out of the source rail and, pre-10E, out of the Home pane.

### 3. Existing external-system read-model source truth

The current Document Control read model already distinguishes external-system entries in the `external-systems` lane, including:

- Procore;
- Document Crunch;
- Adobe Sign.

Do not invent a parallel runtime external-reference source if the needed metadata can be derived from the existing Document Control view-model/read-model posture.

The prompt-authorized implementation may introduce a **Documents-local adapter** that maps the existing external-system entries into Explorer-specific presentation rows.

### 4. Agent context discipline

Do **not** re-read files that are still within current context or memory unless:

- local drift is suspected;
- exact edit locations must be verified;
- a validation failure requires renewed inspection.

Inspect narrowly. Do not perform broad repo archaeology.

---

## Critical Parallel-Work Rule

Project Home work may be occurring in parallel.

Do not:

- edit Project Home files;
- revert or normalize parallel Project Home WIP;
- stage unrelated drift;
- reformat shared files outside the Documents-specific edit region;
- weaken Project Home tests.

If a shared file contains parallel Project Home drift, preserve it and classify it in closeout. Prompt 10E should remain Documents-surface-local unless a narrowly required test update or Documents-specific shared seam is already authorized by prior Prompt 10D repo truth.

---

## Required Repo-Truth Preflight

Before edits:

1. Run:

   ```bash
   git status --short
   git rev-parse --abbrev-ref HEAD
   git rev-parse HEAD
   md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
   ```

2. Record:
   - branch;
   - starting HEAD;
   - working-tree posture;
   - lockfile md5.

3. Confirm Prompt 10D is present and green enough to proceed:
   - post-10D Explorer category navigation exists;
   - breadcrumb traversal exists;
   - source switching after nested navigation exists;
   - mounted per-source path retention exists;
   - any router/module focus seam from 10D is present if it was needed.

4. Re-read only the current post-10D versions of the files Prompt 10E will modify or depend upon, especially:
   - `PccDocumentControlExplorerShell.tsx`;
   - its CSS module;
   - post-10D Explorer tests;
   - Procore category model file;
   - Document Control read-model/content seam.

5. Classify local drift before editing.

6. If Documents Explorer files have unexpected operator-owned drift, stop and report instead of overwriting it.

---

## Locked Product Contract

## 1. Source rail must not change

The source rail remains exactly:

```text
Document Control Home
Project Record
My Project Files
Procore
```

Do **not** add:

```text
Document Crunch
Adobe Sign
```

as source-rail roots.

Prompt 10E must preserve one-click source switching behavior established in 10D.

---

## 2. Procore category directory remains locked

The Procore source root must continue to expose exactly these categories:

```text
Documents
Drawings
Specifications
RFIs
Submittals
Change Orders
Commitments
Change Events
Inspections
Observations
Punch List
```

Preserve the existing deterministic Procore category ids/path segments:

```text
documents
drawings
specifications
rfis
submittals
change-orders
commitments
change-events
inspections
observations
punch-list
```

Do not regress the `procore-documents → ['documents']` path semantics established for 10D module focus.

---

## 3. Procore linked-record fixture posture

Implement deterministic, professional, **fixture-backed Explorer linked-record rows** for the Procore category panes.

### Required implementation posture

Preferred implementation:

```text
apps/project-control-center/src/surfaces/documents/documentExplorerProcoreLinkedRecords.ts
```

or an equivalently named Documents-local file.

Use it to define deterministic linked-record children for the locked Procore categories. These records must:

- be typed as Explorer nodes;
- use `nodeKind: 'linked-record'`;
- preserve `sourceId: 'procore'`;
- use stable node ids;
- carry `parentId` targeting the category node;
- carry stable relative path segments under the selected category;
- carry `posture: 'launch-only'`;
- populate `linkedRecordRef.recordKind` consistently.

### Model extension rule

If the current `IDocumentExplorerLinkedRecordRef` shape is insufficient for the exact professional rendering you need, a **narrow, additive extension** is allowed, but only if:

- it remains Documents-Explorer-specific;
- it is fully typed and tested;
- it does not invent live transactional state;
- it does not add dependencies;
- it does not disturb Project Record or My Project Files tree semantics.

Do not widen the model speculatively.

### Linked-record copy discipline

Linked-record display labels may use professional record-style names such as:

```text
RFI 014 — Courtyard Drainage Clarification
Submittal 061000-03 — Rough Carpentry Product Data
Change Event 022 — East Lobby Finish Revision
```

These are governed preview/read-only record labels, not live transactional status.

Do **not** invent:
- approval states;
- dollar values;
- open/closed state;
- timestamps;
- assignees;
- due dates;
- execution status;
unless a post-10D repo artifact already provides a grounded deterministic fixture and the prompt scope explicitly permits reuse.

---

## 4. Procore category-pane rendering

When the user navigates into a Procore category after Prompt 10D:

- render that category’s linked-record rows;
- preserve breadcrumb traversal created in 10D;
- preserve one-click source switching;
- preserve mounted-path retention behavior;
- display source/system posture copy that makes the following clear:
  - Procore is the source system;
  - PCC does not mirror, sync, or write back;
  - rows are governed reference entries within the Explorer.

### Row interaction posture

Linked-record rows are **reference rows**, not live external links.

By default, do **not** render live `<a href^="http">` links in the Documents Explorer.

If the repo already contains a safe, genuinely executable external-launch convention that is used for the Documents Explorer without violating current contract tests, the agent may reuse that exact convention. Otherwise:

- do not invent a new external-link runtime;
- do not emit live external anchors;
- if a launch-like control is included, use the existing `PccDisabledAffordance` component with visible product-grade reason copy.

The current repo already provides:

```text
apps/project-control-center/src/ui/PccDisabledAffordance.tsx
```

Prefer reusing that component for honest inert launch controls over ad hoc disabled buttons.

### Preferred non-executable launch cue

If a launch affordance is rendered for category panes or linked-record rows, use `PccDisabledAffordance` and product-safe copy such as:

```text
Label: Open in Procore
Reason: Direct launch is not available from this Document Control view.
Next step: Use the configured Procore project source when external launch access is enabled.
```

Refine wording only if repo copy conventions point to a better production-grade equivalent. Do not use developer copy.

---

## 5. External References section on Document Control Home

Add a compact **External References** section to the Document Control Home pane for:

```text
Document Crunch
Adobe Sign
```

### Required placement

Place the section inside the existing Home pane or the post-10D equivalent Home-state composition.

It must:

- stay inside the Explorer shell;
- not become a separate bento card;
- not become a source-rail root;
- not displace the three primary Home destinations;
- read as a compact secondary explorer-compatible reference section.

### Required data source

Prefer deriving the external-reference rows from the existing Document Control view model / external-system lane entries:

```text
viewModel.lanes['external-systems'].entries
```

or the post-10D equivalent Documents-local read-model seam.

If a small Documents-local adapter improves readability and testability, add one, e.g.:

```text
documentExplorerExternalReferences.ts
```

The adapter should map existing external-system entries to a compact Explorer-specific display model.

Do not create a disconnected static external-reference dataset if the needed facts already exist in the current read-model/view-model posture.

### Required system treatment

Render:

- Document Crunch;
- Adobe Sign.

For each reference:
- show the display name;
- show concise authority/launch-only copy;
- show configured/available posture only if grounded in the existing read model;
- never imply writeback;
- never imply live synchronization.

The existing read model may distinguish enabled/disabled source entries. Preserve that distinction product-safely without exposing implementation language.

### Launch posture

By default:
- do not render live `http(s)` anchors;
- do not trust `example.invalid` fixture URL templates as executable runtime links;
- if launch-like controls are shown, use `PccDisabledAffordance` with reason copy.

Suggested product-safe reason copy may distinguish:
- a source that is registered for project reference but not directly launchable from this view;
- a source that is not active for the project context.

Do not use user-facing words such as:

```text
TODO
TBD
mock
fixture
placeholder
not implemented
developer
prompt
repo
```

---

## 6. Read-model wiring posture

Current post-10C shell composition may not receive the Document Control view model directly.

Prompt 10E may make the **smallest Documents-local prop/API change** needed to supply external-reference data into the Explorer shell.

Preferred flow:

```text
useDocumentControlReadModel(...)
  → result.viewModel
  → Documents-local external reference adapter
  → PccDocumentControlExplorerShell props
  → Home pane External References section
```

No-client fallback may pass an empty reference set or omit the section, whichever is more repo-consistent and produces the clearest safe UX.

Do not:
- introduce a new API call;
- modify backend providers;
- modify packages/models unless a strictly required existing type import makes that unavoidable;
- reintroduce legacy external-systems lane-card rendering.

---

## 7. Preserve post-10D navigation behavior

Prompt 10E must not regress Prompt 10D behavior.

Required preservation checks:

- Procore category navigation still opens category panes;
- one-click source switching still works from a Procore category pane;
- switching away and back preserves the mounted Procore path/category if 10D implemented that behavior;
- breadcrumb navigation remains correct;
- module-focus mapping to `Procore > Documents` still resolves.

If the current post-10D implementation exposes a path resolver seam for Procore children, integrate linked-record children through that seam. Do not create a second parallel navigation system inside the shell.

---

## 8. Accessibility and false-affordance contract

At minimum:

- External References section has a meaningful heading or accessible label;
- linked-record rows use semantic list/row structure appropriate to the actual interaction;
- any disabled affordance exposes reason copy through the existing `PccDisabledAffordance` semantics;
- no live link appears where execution is not real;
- current source-rail semantics remain intact;
- current breadcrumb semantics remain intact.

Do not overstate interaction with clickable-looking rows that do nothing.

---

## Expected File Scope

Likely additions/edits may include:

```text
apps/project-control-center/src/surfaces/documents/documentExplorerProcoreLinkedRecords.ts
apps/project-control-center/src/surfaces/documents/documentExplorerExternalReferences.ts
apps/project-control-center/src/surfaces/documents/documentExplorerProcoreCategories.ts
apps/project-control-center/src/surfaces/documents/documentExplorerModel.ts
apps/project-control-center/src/surfaces/documents/PccDocumentControlExplorerShell.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlExplorerShell.module.css
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/tests/PccDocumentControlExplorerShell.test.tsx
apps/project-control-center/src/tests/*Document*Explorer*.test.tsx
apps/project-control-center/src/tests/*Documents*.test.tsx
```

Actual post-10D filenames may differ. Inspect current repo truth and use the smallest compatible edit set.

Do **not** edit:

- Project Home files;
- shell/router files unless a truly Documents-specific post-10D seam requires a test-only follow-up already implied by 10D;
- dependency manifests;
- package/manifests/versions;
- `pnpm-lock.yaml`;
- backend providers unless repo truth proves Prompt 10D already created a narrowly expected seam and Prompt 10E cannot proceed without a hard stop.

If a backend/model-package mutation appears necessary, stop and report instead of silently expanding scope.

---

## Tests Required

Update/add tests that prove all of the following.

### A. Procore category and linked-record behavior

1. Procore root still renders the locked 11-category directory.
2. Selecting a Procore category opens the category pane using the post-10D navigation contract.
3. The selected category pane renders deterministic linked-record rows.
4. Linked-record rows are typed/rendered as governed `linked-record` entries, not folders/categories.
5. Category breadcrumbs remain correct after entering a Procore category.
6. One-click source switching remains intact from a Procore category pane.
7. Switching away and back preserves the mounted Procore path/category if that behavior was established in 10D.
8. `procore-documents` module focus still resolves to the Procore Documents category if Prompt 10D implemented that mapping.

### B. Procore posture and false-affordance behavior

9. Procore launch-only / no-writeback copy renders in the relevant category context.
10. No live external `http(s)` anchors are introduced in the Documents Explorer unless an already-approved, truly executable repo convention exists and the test suite is intentionally updated to reflect it.
11. If launch-like controls are rendered, they use `PccDisabledAffordance` or the repo’s existing equivalent, and visible reason copy is present.
12. No fabricated live status, dollar exposure, due-date, or approval-state copy appears in linked-record fixtures unless already grounded in repo truth and explicitly permitted.

### C. External References on Home

13. Document Control Home renders a compact External References section.
14. Document Crunch and Adobe Sign render in that section.
15. They do not appear as source-rail roots.
16. They do not appear as Procore linked-record rows.
17. Any configured/enabled or inactive/deferred posture is grounded in the existing Document Control read model and rendered with product-safe copy.
18. Any launch-like controls are honest and carry reason copy if non-executable.
19. Existing tests that previously asserted Document Crunch / Adobe Sign were absent from Home are deliberately retargeted rather than deleted without replacement.

### D. Existing shell contract preservation

20. Explorer direct-child bento invariant remains green.
21. Zero card-level `[data-pcc-active-surface-panel="documents"]` markers remain inside the bento path.
22. Source rail root count/order remains unchanged.
23. Project Record and My Project Files behavior from prior prompts remains intact.
24. No legacy lane-card dashboard composition is reintroduced.

Use stable data attributes and semantic selectors. Do not test CSS module class names as behavioral contracts.

---

## Validation Required

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml

pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test

pnpm exec prettier --check <changed-files>
git diff --check

md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If focused reruns are needed during implementation, they may be used in addition to the full package test command above. Do not invent a new test runner pattern.

---

## Closeout Requirements

Use the repository closeout template if that remains the package standard.

Include:

- starting and ending HEAD;
- current branch;
- working-tree drift classification;
- Project Home parallel-work preservation note;
- whether Prompt 10D preconditions were verified before editing;
- files changed;
- Procore linked-record fixture/model summary;
- whether any narrow `linkedRecordRef` model extension was needed and why;
- how Procore category nodes gained governed child/linked-record behavior;
- how the Explorer shell renders linked-record category panes;
- External References section placement and read-model derivation;
- whether Document Crunch / Adobe Sign launch controls are executable or intentionally inert;
- false-affordance review;
- no-live-anchor posture result;
- tests added/updated;
- validation results;
- lockfile md5 before/after;
- explicit readiness verdict for Prompt 10F.

---

## Hard Stops

Stop and report before proceeding if Prompt 10E would require:

- executing before Prompt 10D exists in repo truth;
- changing the four-root source rail contract;
- adding Document Crunch or Adobe Sign as source rail roots;
- creating a second, parallel Procore navigation system that bypasses the post-10D Explorer path model;
- breaking breadcrumb/path retention/source-switching behavior established in 10D;
- inventing live external URLs or executable launch behavior not already supported safely by repo truth;
- trusting `example.invalid` URLs as real executable links;
- reintroducing old lane-card ready-path composition;
- moving `data-pcc-active-surface-panel` off shell ownership;
- breaking bento direct-child invariants;
- adding dependencies;
- mutating package/manifest versions;
- changing `pnpm-lock.yaml`;
- editing Project Home files or overwriting parallel operator-owned work;
- requiring backend/provider or shared package-model expansion beyond the narrow Documents-local scope described above.
