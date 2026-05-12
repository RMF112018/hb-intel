# Phase 08 Prompt 10C — Document Control Explorer Shell and Ready-Path Composition

## Role

You are implementing **Phase 08 Prompt 10C** in the `RMF112018/hb-intel` repo.

Prompt 10B has already established the typed Documents-surface Explorer model foundation:

- source-root vocabulary and metadata;
- Project Record `ComDir` tree fixture;
- Procore category directory nodes;
- unified source-root registry;
- pure helper seams;
- pure module-focus mapping for later Prompt 10D consumption.

Prompt 10C renders that model foundation into the **Documents ready path**. It is a **shell / composition / root-source experience** prompt, not a deep-navigation or router prompt.

---

## Objective

Replace the current Documents ready-path lane-card dashboard composition with an **Explorer-first shell** that:

- renders as the primary ready-path Documents experience;
- uses the Prompt 10B model/registry as the source of truth;
- presents a Documents-local source rail;
- loads initially to `Document Control Home`;
- supports **root-level source selection only** so the source rail is honest and usable;
- renders source-context framing, root-level breadcrumbs, and source-root content panes;
- preserves read-only / launch-only / no-writeback authority posture;
- preserves shell-owned active-panel semantics and bento direct-child invariants;
- leaves deep folder drill-down, breadcrumb traversal, mounted per-source path retention, router/module focus threading, and Procore linked-record content to later prompts.

---

## Governing Context

### 1. Prompt 10A repo-truth gate

Prompt 10A confirmed that the current runtime repo truth is compatible with the Explorer target architecture and that the Prompt 10 implementation chain may proceed.

### 2. Prompt 10B model foundation

Prompt 10B committed the Documents-local Explorer model foundation. Prompt 10C must consume those artifacts rather than recreating or bypassing them.

Expected Prompt 10B source seams include:

```text
apps/project-control-center/src/surfaces/documents/documentExplorerModel.ts
apps/project-control-center/src/surfaces/documents/documentExplorerProjectRecordTree.ts
apps/project-control-center/src/surfaces/documents/documentExplorerProcoreCategories.ts
apps/project-control-center/src/surfaces/documents/documentExplorerSourceRoots.ts
apps/project-control-center/src/surfaces/documents/documentExplorerHelpers.ts
apps/project-control-center/src/surfaces/documents/documentExplorerModuleFocus.ts
```

### 3. Target architecture

Use the Prompt 10 Explorer target architecture as the governing product direction:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/prompts/10_Document_Control_Explorer_Target_Architecture_and_Implementation_Plan.md
```

### 4. Known later-prompt boundary

Prompt 10C must **not** consume or wire the `activeModuleId` module-focus contract yet. Prompt 10D owns:

- router pass-through into `PccDocumentsSurface`;
- module-focus activation;
- nested folder/category drill-down;
- breadcrumb back/up traversal;
- one-click source switching from arbitrary nested depth;
- per-source mounted path retention.

Prompt 10C may implement only the minimal **root-level source selection** needed to make the source rail truthful and to render each source-root state.

---

## Critical Parallel-Work Rule

Project Home work may be occurring in parallel, including Prompt `09A`–`09E` follow-on work.

Do **not**:

- edit Project Home files;
- revert or normalize Project Home WIP;
- stage unrelated Project Home drift;
- reformat broad files unrelated to the Documents shell work;
- weaken Project Home tests.

If shared-file drift exists, preserve it and classify it in closeout. Prompt 10C should remain within Documents-surface runtime/CSS/tests unless a strictly necessary Documents-owned test update requires otherwise.

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
   - current branch;
   - starting HEAD;
   - working-tree posture;
   - lockfile md5.

3. Confirm Prompt 10B artifacts are present and importable:
   - `DOCUMENT_EXPLORER_SOURCE_ROOTS`;
   - `DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP`;
   - `DOCUMENT_CONTROL_HOME_ROOT_NODE`;
   - `PROJECT_RECORD_TREE_ROOT`;
   - `PROCORE_SOURCE_ROOT_NODE`;
   - Procore category directory nodes.

4. Confirm current Documents ready-path repo truth is still the legacy lane-card composition:
   - `PccDocumentsSurface.tsx` no-client fallback renders state card + lane/permissions/reviews composition;
   - `PccDocumentControlReadModelContent.tsx` preview branches render lane/permissions/reviews composition;
   - loading/error branches are state-card-only.

5. Classify any local drift before editing.

6. If the Documents-surface render files have unexpected operator-owned drift, stop and report rather than overwriting it.

---

## Current Repo-Truth Anchors to Preserve / Evolve

### 1. Current Documents render structure

The current implementation still renders:

- `PccDocumentControlStateCard`;
- three `PccDocumentControlLaneCard` instances;
- `PccDocumentControlPermissionsCard`;
- `PccDocumentControlReviewsCard`.

Prompt 10C changes the **ready-path surface composition**, but it must not delete the legacy component files. Prompt 10F owns deeper legacy reconciliation and dead-render cleanup.

### 2. Loading/error state posture

Preserve the current state-card-only posture for:

- read-model `loading`;
- read-model `error`.

### 3. Preview/degraded state posture

For preview branches that currently prepend a state card based on `resolveDocumentControlStateKind(...)`, preserve that state card cue and render the Explorer shell after it.

This means the Preview/ready composition becomes:

```text
[optional state card when current source-status cue requires it]
+
[one Explorer full-width direct bento child]
```

The old lane / permissions / reviews cards no longer remain visible as ready-path page sections.

### 4. No-client fallback posture

When no `readModelClient` is supplied, preserve the source-unavailable state card posture and render the Explorer shell as the Documents-local preview shell rather than returning to the legacy lane-card dashboard.

The fallback branch becomes:

```text
[source-unavailable state card]
+
[one Explorer full-width direct bento child]
```

### 5. Shell-owned active-panel marker

Do **not** use `dataActiveSurfacePanel` on any card.  
Do **not** emit `data-pcc-active-surface-panel="documents"` from the Explorer shell.

The shell `<main role="tabpanel">` remains the sole active-panel owner.

---

## Locked Prompt 10C Interaction Boundary

### Root-level source selection is authorized

Prompt 10C may implement minimal local React state for the active Explorer source id:

```text
home
project-record
my-project-files
procore
```

Required behavior:

- initial active source = `home`;
- source-rail controls switch between the four root states;
- active source state is visually and semantically discernible;
- source switching is **root-level only**.

### Not authorized in Prompt 10C

Do **not** implement:

- Project Record folder drill-down;
- Procore category navigation;
- breadcrumb click/back/up traversal;
- per-source path memory;
- mounted path retention;
- `activeModuleId` router pass-through;
- `PccSurfaceRouter.tsx` edits;
- `resolveExplorerFocusTarget(...)` consumption;
- launch behavior;
- linked-record preview rows;
- Document Crunch / Adobe Sign external-reference section beyond leaving space for Prompt 10E only if that space is non-affordant and clearly non-final.

Prompt 10D owns navigation state and router threading. Prompt 10E owns Procore detail rows and external-reference content.

---

## Required UI Composition

## 1. New Explorer shell component

Create a Documents-local Explorer composition component, preferably:

```text
apps/project-control-center/src/surfaces/documents/PccDocumentControlExplorerShell.tsx
```

or an equivalently named Documents-local shell component.

It should own:

- root-level active source state;
- source rail;
- shell header / source-context header;
- breadcrumb band;
- content pane;
- root-level source content rendering.

## 2. Single direct bento child wrapper

Render the Explorer shell inside a single full-width `PccDashboardCard` direct child of `PccBentoGrid`.

Preferred contract:

```tsx
<PccDashboardCard
  footprint="full"
  tier="tier1"
  region="operational"
  ariaLabel="Document Control Explorer"
>
  <PccDocumentControlExplorerShell />
</PccDashboardCard>
```

You may refine the exact title/eyebrow posture if repo conventions require it, but do **not** reintroduce a duplicate top-level page-title/header card or a visible `HB Document Control Center` replacement heading.

The Explorer shell itself should carry its internal context heading.

## 3. Source rail

Render a Documents-local source rail based on Prompt 10B model vocabulary/metadata, not duplicated inline arrays.

Use the locked four source roots:

```text
Document Control Home
Project Record
My Project Files
Procore
```

Requirements:

- source rail is within the Explorer shell, not a global shell/sidebar;
- controls are keyboard accessible;
- active item has visible selected-state semantics;
- use stable `data-*` markers for testability;
- each control changes the active root source state;
- do not add Document Crunch / Adobe Sign / Drawing & Model Center as rail roots.

Suggested stable markers:

```text
data-pcc-doc-explorer="true"
data-pcc-doc-explorer-source-rail="true"
data-pcc-doc-explorer-source-id="<source-id>"
data-pcc-doc-explorer-source-selected="true|false"
```

Use repo-consistent attribute naming if a better pattern already exists, but keep the marker contract stable and explicit.

## 4. Source/context header

Render active-source framing using `DOCUMENT_EXPLORER_SOURCE_ROOTS[activeSourceId]` so the shell reuses the Prompt 10B metadata contract.

The source/context header should display:

- active source label;
- summary/context copy;
- authority cue / source posture;
- source posture chip or equivalent concise indicator.

Do not write parallel hardcoded authority copy that duplicates the 10B metadata source.

## 5. Breadcrumb band — root-state only

Render a semantic breadcrumb region for root-level states.

Minimum breadcrumb posture:

- Home active:
  ```text
  Document Control Home
  ```
- Any non-home source active:
  ```text
  Document Control Home / <Active Source Label>
  ```

The breadcrumb band is **display-only** in Prompt 10C. Do not make prior segments interactive yet. Prompt 10D owns breadcrumb traversal.

Use meaningful semantics without implying false navigation.

Suggested stable markers:

```text
data-pcc-doc-explorer-breadcrumbs="true"
data-pcc-doc-explorer-breadcrumb="<segment-node-id-or-source-id>"
data-pcc-doc-explorer-breadcrumb-current="true|false"
```

## 6. Home content pane

When `home` is active, render a polished Document Control Home pane that:

- restates the Explorer purpose in concise end-user language;
- shows the three primary destinations:
  - Project Record;
  - My Project Files;
  - Procore;
- uses Explorer-native destination rows/tiles rather than separate dashboard cards;
- may allow destination tiles to switch the active root source, but only if they reuse the same root-level selection behavior and do not create a second competing navigation pattern;
- does **not** introduce Document Crunch / Adobe Sign launch rows yet.

If destination tiles are clickable, they must be truthful and switch the active root source. If they are not clickable, do not style them as active controls.

## 7. Project Record root pane

When `project-record` is active:

- render the root-level folders from the Prompt 10B Project Record tree;
- use the current `PROJECT_RECORD_TREE_ROOT.children` or `DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP['project-record']` source of truth;
- render folder rows as **non-drilldown rows** in Prompt 10C;
- do not add buttons or links that imply nested folder traversal until Prompt 10D.

Rows should communicate that deeper navigation is part of the Explorer structure without fabricating interaction.

## 8. My Project Files root pane

When `my-project-files` is active:

- render the project-scoped source-root posture only;
- reuse guardrail/authority copy from Prompt 10B metadata;
- do not fabricate nested OneDrive folders or file rows;
- do not imply access to the full OneDrive root.

## 9. Procore root pane

When `procore` is active:

- render the Prompt 10B category directory nodes from the Procore source root;
- render categories as non-drilldown rows in Prompt 10C;
- do not render linked-record rows;
- do not render launch affordances or external URLs;
- preserve launch-only/deep-link posture copy from model metadata.

## 10. Styling / responsive baseline

Use a dedicated Documents-local Explorer CSS module unless repo truth strongly favors another nearby CSS location. Preferred:

```text
apps/project-control-center/src/surfaces/documents/PccDocumentControlExplorerShell.module.css
```

Minimum responsive posture:

- desktop / laptop: source rail and main pane read as a two-region Explorer shell;
- constrained widths: shell remains readable, source rail may stack or compress inside the card;
- no horizontal clipping;
- no raw colors; use existing PCC tokens;
- no dependency additions.

Prompt 10G will perform final responsive and accessibility acceptance, but Prompt 10C must not knowingly introduce avoidable layout debt.

---

## Ready-Path Integration Requirements

## 1. `PccDocumentsSurface.tsx`

Update the no-client fallback path from:

```text
state card + lane cards + permissions + reviews
```

to:

```text
state card + Explorer shell card
```

Do not delete old legacy component files in Prompt 10C.

## 2. `PccDocumentControlReadModelContent.tsx`

Preserve:

- unconditional hook invocation;
- loading/error state-card-only branches;
- current state-kind resolution behavior.

Replace the preview branch composition from:

```text
optional state card + lane cards + permissions + reviews
```

to:

```text
optional state card + Explorer shell card
```

Do not change the read-model hook contract unless strictly necessary for compilation. Prompt 10C is render composition work, not read-model architecture work.

---

## Testing Requirements

Update existing Documents surface tests intentionally. Do not merely delete coverage.

## A. New Explorer ready-path assertions

Add/update tests proving:

1. Documents ready path renders the Explorer shell.
2. Exactly one Explorer direct-child card exists on the available preview ready path.
3. Source rail renders exactly the four locked roots from the Prompt 10B vocabulary.
4. Initial selected source is `Document Control Home`.
5. Root-level source selection works:
   - selecting `Project Record` renders Project Record root folders;
   - selecting `My Project Files` renders project-scoped guardrail posture;
   - selecting `Procore` renders the locked category rows.
6. Breadcrumb band renders:
   - one-segment home state;
   - two-segment source-root state.
7. Project Record folder rows are rendered but not wired for drill-down in Prompt 10C.
8. Procore category rows are rendered but not wired for linked-record or launch behavior in Prompt 10C.

## B. Legacy ready-path replacement assertions

Retarget existing surface tests so they verify:

9. Lane cards no longer render on the normal available ready path.
10. Permissions card no longer renders on the normal available ready path.
11. Reviews card no longer renders on the normal available ready path.
12. The old `HB Document Control Center` duplicate title remains absent.

Do not remove lower-level model/hook guardrail tests that still prove My Project Files filtering and degraded-state posture.

## C. State-branch assertions

Preserve or update tests proving:

13. Loading branch remains state-card only.
14. Error branch remains state-card only.
15. No-client fallback renders:
    - source-unavailable state card;
    - Explorer shell card.
16. Backend-unavailable/source-unavailable preview branches preserve their state card cue and render the Explorer shell card rather than the old lane-card dashboard.

## D. Bento / shell contract assertions

Add/update tests proving:

17. Every rendered card remains a direct DOM child of `[data-pcc-bento-grid]`.
18. Available preview ready path renders a single Explorer direct-child card.
19. Preview branches with a state cue render exactly:
    - state card;
    - Explorer card.
20. Zero card-level `[data-pcc-active-surface-panel="documents"]` markers exist inside the bento path.

## E. False-affordance assertions

Add/update tests proving:

21. No live external `http(s)` anchors are introduced.
22. Prompt 10C does not render Document Crunch / Adobe Sign launch links.
23. Folder/category rows do not masquerade as executable deep navigation controls before Prompt 10D/10E.

Use stable data-level assertions and semantic roles. Do not test CSS module class names as behavior contracts.

---

## Known Parallel Validation Condition

Prompt 10B closeout recorded that the full workspace:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
```

was blocked by pre-existing syntax errors in parallel Project Home WIP, outside Prompt 10B scope.

Prompt 10C must still run the required validation command. If the same parallel Project Home WIP error remains:

- do not edit Project Home files;
- capture the exact failure;
- confirm whether any Prompt 10C-owned Documents files appear in the diagnostics;
- proceed only with a clearly qualified validation result if the failure remains external to Prompt 10C scope.

If the Project Home WIP has since been resolved, require full green validation.

---

## Required Validation

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

If a focused test rerun is needed during implementation, it may be used in addition to the full package test command above. Do not invent a new test runner pattern.

---

## Expected File Scope

Likely additions/edits:

```text
apps/project-control-center/src/surfaces/documents/PccDocumentControlExplorerShell.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlExplorerShell.module.css
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
apps/project-control-center/src/tests/*Document*Explorer*.test.tsx
```

Use repo naming conventions if a nearby test split is cleaner.

Do **not** edit:

- Project Home files;
- router/shell files;
- Prompt 10B Explorer model files except for a strictly necessary import/type correction caused by 10C composition;
- package/manifest versions;
- dependencies;
- `pnpm-lock.yaml`.

---

## Closeout Requirements

Use the repository closeout template if that remains the current package standard.

Include:

- starting and ending HEAD;
- current branch;
- local drift classification;
- parallel Project Home drift classification;
- files changed;
- Explorer shell component summary;
- ready-path composition change summary:
  - available preview path;
  - degraded preview/state-cue path;
  - no-client fallback path;
  - loading/error state-card-only preservation;
- source-rail/root-selection summary;
- root-pane rendering summary for:
  - Home;
  - Project Record;
  - My Project Files;
  - Procore;
- tests added/updated;
- validation results;
- any external Project Home typecheck blocker still present;
- lockfile md5 before/after;
- explicit note that:
  - folder drill-down remains deferred to 10D;
  - router/module focus remains deferred to 10D;
  - Procore linked-record rows and external references remain deferred to 10E;
- readiness verdict for Prompt 10D.

---

## Hard Stops

Stop and report before proceeding if Prompt 10C would require:

- editing Project Home files;
- editing router/shell files;
- consuming `resolveExplorerFocusTarget(...)` or wiring `activeModuleId`;
- implementing nested folder/category drill-down;
- implementing breadcrumb traversal;
- implementing path-memory/per-source retention;
- introducing Procore linked-record rows or launch behavior;
- adding Document Crunch / Adobe Sign launch rows;
- reintroducing a duplicate top-level Documents header card;
- moving `data-pcc-active-surface-panel` off shell ownership;
- breaking bento direct-child invariants;
- adding dependencies;
- mutating package/manifest versions;
- changing `pnpm-lock.yaml`;
- overwriting parallel operator-owned work.
