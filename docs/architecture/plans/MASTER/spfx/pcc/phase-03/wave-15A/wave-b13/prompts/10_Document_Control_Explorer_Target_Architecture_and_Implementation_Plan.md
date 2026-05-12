# Phase 08 Prompt 10 — Document Control Explorer Target Architecture and Implementation Plan

## 1. Objective

Replace the prior Phase 08 Prompt 10 card-enhancement direction with a focused implementation plan that turns the `documents` primary tab into a **Document Control Explorer**:

> A familiar, Windows File Explorer-inspired project file-access surface that lets end users quickly locate and access project files and file-like records across SharePoint Project Record, project-scoped My Project Files / OneDrive, and Procore deep-link directories, while preserving PCC’s read-only / launch-only / no-writeback posture.

This plan is not a CSS-only polish pass. It is a **surface-level UX and interaction re-architecture** of Document Control.

---

## 2. Current Repo Truth to Preserve and Evolve

The local code agent must verify current repo truth before editing, but the package was authored against the following known conditions:

### 2.1 Current Documents surface pattern
The Documents surface currently behaves as a bento/card composition:
- state card;
- Project Record lane card;
- My Project Files lane card;
- External Platforms lane card;
- permissions / guardrails card;
- reviews / approvals card.

This is the current implementation baseline, not the desired end state.

### 2.2 Current eight-tab model
The primary tab runtime model remains:

```text
project-home
core-tools
documents
estimating-preconstruction
startup-closeout
project-controls
cost-time
systems-administration
```

### 2.3 Current router seam
`PccSurfaceRouter` currently passes `activeModuleId` into Phase 05 dashboard surfaces, but not into `PccDocumentsSurface`. Prompt 10 may make a narrow Documents-specific router pass-through so the explorer can respond to Document Control child-module focus.

### 2.4 Current navigation registry
The Document Control primary tab already exposes child modules including:
- `primary-documents`
- `document-control-center`
- `drawing-model-center`
- `sharepoint-project-record`
- `my-project-files`
- `procore-documents`
- `document-crunch`
- `adobe-sign`

Prompt 10 should use those existing module IDs rather than inventing replacements.

---

## 3. Parallel Project Home Work Constraint

Work on Project Home may occur in parallel during Prompt 10 execution.

### 3.1 Mandatory handling
The local code agent must:
- treat Project Home changes as parallel/operator-owned drift unless proven otherwise;
- never revert or overwrite unrelated Project Home edits;
- not edit `apps/project-control-center/src/surfaces/projectHome/` for Prompt 10;
- not re-order or re-choreograph Project Home bento cards;
- avoid touching Project Home tests/evidence except if a narrowly scoped shared router/type change causes a direct test update;
- preserve any parallel Project Home edits present in shared files.

### 3.2 Shared-file discipline
If Prompt 10 needs to edit a shared file that also carries Project Home drift:
- apply only the smallest documents-specific additive change;
- do not normalize, reformat, or opportunistically “clean up” surrounding Project Home code;
- document the preservation decision in closeout.

---

## 4. Product Architecture Decision

### 4.1 Documents ready path becomes explorer-first
The ready-path Documents surface must no longer read as “a dashboard of document-related cards.”

It should read as:
- a project file browser;
- a cross-source access point;
- a shallow-learning-curve surface that matches a familiar enterprise mental model.

### 4.2 Windows Explorer-inspired, not a literal clone
Use the Windows File Explorer interaction model:
- left navigation rail;
- persistent source roots;
- breadcrumbs;
- main content pane;
- folder / file / record rows;
- clear selected states.

Do not create a literal operating-system replica. Use PCC tokens, spacing, typography, and accessibility conventions.

---

## 5. Authorized In-Surface Source Rail

### 5.1 Sidebar guardrail clarification
Prior PCC architecture prohibits a **global application sidebar**. Prompt 10 explicitly authorizes a **Documents-local source rail** inside the Document Control explorer.

This source rail:
- is not a PCC shell sidebar;
- does not alter global tab navigation;
- does not persist outside the Documents surface;
- exists only to support explorer source switching.

### 5.2 Locked source rail roots
The root rail must expose:

```text
Document Control Home
Project Record
My Project Files
Procore
```

### 5.3 One-click source switching invariant
From any selected source and any current folder depth:
- every source root remains visible and directly selectable from the source rail on desktop/laptop layouts;
- switching sources must not require breadcrumb backtracking;
- switching sources must update the main pane immediately.

Example acceptance scenario:
1. User navigates to `Project Record > 20_Construction > Schedule > ...`.
2. User clicks `Procore` in the source rail.
3. Main pane immediately changes to the Procore directory root.

---

## 6. First-Load Experience

### 6.1 Locked first-load behavior
The Documents surface loads to a **Document Control Home** state on initial entry.

The Home state should:
- preserve the explorer shell layout;
- show the source rail;
- show a concise statement of purpose;
- show root destinations in a folder-like or explorer-native presentation;
- explain, briefly, the distinction between Project Record, My Project Files, and Procore launch/deep-link access;
- surface lightweight source posture cues;
- avoid card-dashboard composition.

### 6.2 Path retention scope
Prompt 10 shall retain the last viewed path per source **while the explorer instance remains mounted**.

This means:
- if the user switches from a deep Project Record folder to Procore and back, the prior Project Record path should restore while that explorer instance is still alive;
- Prompt 10 shall **not** introduce browser storage, cross-session persistence, or shell-level persistence.

---

## 7. Main Pane Structure

The main pane must include:

1. **Source/context header**
   - active source name;
   - source posture / read-only / launch-only cue;
   - optional small source system badge.

2. **Breadcrumb path**
   - `Document Control Home`
   - source root
   - nested folder path where applicable.

3. **Content list region**
   - folder rows;
   - file rows where deterministic fixture rows exist;
   - linked-record rows for Procore categories/items;
   - governed empty/degraded states.

4. **Contextual note region only when needed**
   - My Project Files guardrail copy;
   - Procore launch-only/no-writeback copy;
   - source unavailable/degraded copy.

Do not add:
- live search fields;
- sort controls;
- view toggle buttons;
- upload/edit/delete/rename/move actions;
- fake “open” controls where no real behavior exists.

---

## 8. Source-Specific Information Architecture

### 8.1 Document Control Home
Home is the neutral landing state. It may show:
- the four primary destinations;
- a short “What lives here?” explanation;
- a compact external references area for `Document Crunch` and `Adobe Sign`.

Home must not become a card-dashboard regression.

### 8.2 Project Record — SharePoint project-site drive
Project Record uses the supporting fixture files derived from the uploaded directory archive:

```text
reference/10_Project_Record_Fixture_Summary.md
reference/10_Project_Record_Fixture_Folder_Paths.json
```

Implementation requirements:
- translate the support JSON into the repo’s typed fixture/model approach;
- do not add the uploaded ZIP archive to runtime source;
- ignore archive noise such as `__MACOSX/` and `.DS_Store`;
- preserve folder labels unless a future prompt explicitly authorizes label normalization;
- support the full represented depth;
- present this source as **read-only / no SharePoint writeback**.

### 8.3 My Project Files — project-scoped OneDrive only
The existing hard-no posture remains:
- no full OneDrive root;
- no other-project folder browsing;
- no broad personal drive exposure.

The explorer may show:
- a single project-scoped working-file root;
- deterministic preview folders/items only if grounded in existing fixture posture;
- clear warning copy that these are working files and not the formal project record unless submitted via governed downstream process.

### 8.4 Procore — deep-link directory
Procore appears as a primary source root.

Selecting Procore should show a deterministic directory of governed categories:

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

Each category should behave as a directory node in the explorer model.

Within Prompt 10:
- linked-record rows may be fixture-backed to demonstrate the access model;
- the posture remains launch-only / deep-link visibility only;
- no Procore sync, no mirror, no writeback.

### 8.5 Document Crunch and Adobe Sign
These remain launch-only external references, but are **not** primary source rail roots in Prompt 10.

Recommended placement:
- compact external references section on Document Control Home;
- visible authority copy: PCC opens or references the source, does not write back.

---

## 9. Explorer Domain Model

Prompt 10 should introduce or evolve a typed explorer model sufficient to represent:

### 9.1 Source roots
Examples:
- `home`
- `project-record`
- `my-project-files`
- `procore`

### 9.2 Node kinds
At minimum:
- home;
- source-root;
- folder;
- category;
- linked-record;
- empty/degraded state pseudo-entry only if represented explicitly and tested.

### 9.3 Main-pane row data
Rows should support:
- stable node id;
- display label;
- source id;
- node kind;
- parent path;
- child availability;
- read-only / launch-only posture;
- optional linked-record metadata;
- optional disabled / unavailable reason.

### 9.4 Path helpers
The code should provide deterministic helpers for:
- current path resolution;
- child node retrieval;
- breadcrumb segments;
- source-root reset;
- restoration of last mounted-path per source.

---

## 10. Interaction Contract

### 10.1 Required interactions
- Select source root from source rail.
- Select folder row to drill down.
- Select breadcrumb segment to move up.
- Select Procore category to open its governed directory view.
- Switch sources with one click regardless of current depth.

### 10.2 Not authorized
Prompt 10 does not authorize:
- live SharePoint / Graph / OneDrive browsing calls;
- live Procore record lookup;
- data writes;
- downloads;
- uploads;
- approval actions;
- source-system mutations;
- external-system sync or mirroring;
- search/sort/view controls unless expressly implemented as deterministic and real, which Prompt 10 does not require.

---

## 11. Navigation Module Focus Mapping

Prompt 10 may update the Documents surface to react to existing Document Control module selection.

Recommended mapping:

| Active module id | Explorer response |
|---|---|
| `primary-documents` | Open `Document Control Home` or `Project Record` home, using whichever produces the cleaner final UX during implementation; package preference is **Document Control Home**. |
| `document-control-center` | Open `Document Control Home`. |
| `sharepoint-project-record` | Open `Project Record` root. |
| `my-project-files` | Open `My Project Files` root. |
| `procore-documents` | Open `Procore > Documents`. |
| `document-crunch` | Keep launch-only reference posture; do not convert into explorer root. |
| `adobe-sign` | Keep launch-only reference posture; do not convert into explorer root. |
| `drawing-model-center` | Preserve deferred posture; do not fabricate explorer behavior. |

Prompt 10 should make this mapping deterministic if `activeModuleId` is threaded to `PccDocumentsSurface`.

---

## 12. Ready-Path Composition and Legacy Card Reconciliation

### 12.1 Loading/error state
The existing whole-surface state card pattern may remain for:
- loading;
- error;
- catastrophic source-unavailable branches where the explorer cannot responsibly render.

### 12.2 Ready-path state
On the ready path:
- the explorer shell becomes the primary Documents composition;
- the prior three lane cards should no longer dominate the surface;
- the permissions / guardrails card and reviews / approvals card should not remain as competing ready-path page sections.

### 12.3 Guardrail migration
Preserve only essential user-facing guardrail content inside the explorer where it adds direct browsing value:
- My Project Files warning;
- SharePoint read-only / no-writeback cue;
- Procore launch-only / no-writeback cue;
- source unavailable / degraded cue.

Do not preserve bulky admin/reference vocabularies on the primary ready path merely because they currently render.

### 12.4 Underlying model/code preservation
If current view-model exports, messages, or test utilities remain useful:
- keep them when doing so avoids unnecessary churn;
- remove only dead ready-path render plumbing after tests are intentionally updated;
- do not delete behavior used by other surfaces without proof.

---

## 13. Bento / Layout Contract

### 13.1 Direct-child invariant
Do not break the bento direct-child invariant.

### 13.2 Preferred composition
Prompt 10 should render the explorer as a **single full-width direct bento child** or an equivalently compliant direct-child surface unit using existing layout primitives.

The preferred implementation is:
- one full-width explorer container on the ready path;
- optional separate direct-child whole-surface state unit only for loading/error branches;
- not a series of lane cards.

### 13.3 Existing primitives
Use the existing card/grid layout primitives where they preserve PCC integration and evidence selectors, but visually the explorer should read as a file browser rather than as “one more dashboard card.”

---

## 14. Responsive Behavior

### 14.1 Desktop / laptop
- persistent in-surface source rail;
- full breadcrumb + content list;
- one-click source switching always visible.

### 14.2 Tablet landscape / constrained laptop
- preserve source rail if feasible;
- reduce rail width and simplify metadata density;
- no horizontal clipping.

### 14.3 Tablet portrait / phone
- source rail may become a compact source-picker or controlled in-surface drawer/panel;
- the main content list remains primary;
- source switching must remain discoverable and accessible;
- do not create a global PCC sidebar.

---

## 15. Accessibility Contract

### 15.1 Source rail
Use semantic navigation/button behavior unless a true ARIA tree implementation is fully justified and tested.

Preferred Prompt 10 approach:
- navigation landmark or labeled region;
- buttons for source roots;
- visible selected state;
- `aria-current` or equivalent selected-state semantics where appropriate.

### 15.2 Breadcrumbs
- use accessible breadcrumb semantics;
- current segment must not imply false navigation;
- prior segments must be keyboard accessible.

### 15.3 Main list
Use a semantic structure that matches final interaction:
- table-like if metadata columns are truly presented;
- list/grid if the UI is explorer-row based without full column semantics.

Do not choose semantics that overstate interaction.

### 15.4 Disabled / launch-only posture
Every disabled, preview-only, or launch-only item must expose understandable reason copy.

---

## 16. Testing and Evidence Acceptance

Required tests should cover:
- explorer shell renders on Documents ready path;
- old lane-card dashboard is not the primary ready-path experience;
- source rail roots render;
- Project Record fixture root renders;
- breadcrumb updates during folder traversal;
- source switching remains one click away after deep folder navigation;
- My Project Files guardrail renders;
- Procore category directory renders;
- Procore launch-only/no-writeback copy renders;
- Document Crunch / Adobe Sign stay as launch-only external references, not source roots;
- `activeModuleId` mapping focuses the expected explorer source where implemented;
- shell-owned active-panel marker remains untouched;
- bento direct-child invariant remains green;
- no full OneDrive root exposure.

Screenshot/evidence acceptance should show at minimum:
1. Document Control Home.
2. Project Record at root.
3. Project Record several folders deep with source rail still visible.
4. One-click switch to Procore root.
5. My Project Files guardrail state.
6. Tablet or constrained layout check if Prompt 10G scope includes screenshot evidence.

---

## 17. Implementation Prompt Map

### Prompt 10A
Repo-truth gate, drift classification, no runtime edits.

### Prompt 10B
Explorer model, fixture contract, Project Record directory tree, typed source/node/path helpers.

### Prompt 10C
Explorer shell components, ready-path replacement, Home state, root rail, breadcrumbs, main-pane framing.

### Prompt 10D
Navigation state, folder drill-down, one-click source switching, mounted-path retention, `activeModuleId` docs-specific router pass-through and module focus mapping.

### Prompt 10E
Procore category directory, linked-record preview posture, Document Crunch / Adobe Sign external references.

### Prompt 10F
Retire/reconcile old ready-path lane/permissions/reviews card composition, migrate essential guardrail copy, update tests and docs.

### Prompt 10G
Accessibility, responsive acceptance, screenshot/evidence validation, final closeout.

---

## 18. Validation Contract

Unless a prompt narrows the validation by design, implementation prompts should run:

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

Prompts that produce no runtime edits may limit validation to drift/reporting commands as specified.

---

## 19. Hard Stops

Stop and report before proceeding if implementation would require:
- reintroducing a global PCC sidebar;
- moving `data-pcc-active-surface-panel` off shell `main[role="tabpanel"]`;
- breaking direct-child bento invariants;
- adding dependencies;
- adding writeback, sync, or mirror behavior;
- exposing the full OneDrive root;
- fabricating live search/actions;
- overwriting parallel Project Home work;
- making broad unrelated shell/nav refactors beyond the narrow Documents router seam.

---

## 20. Completion Definition

Prompt 10 is complete when:
1. The Documents surface reads as a coherent explorer, not a lane-card dashboard.
2. The source rail provides one-click access to Home, Project Record, My Project Files, and Procore.
3. Deep Project Record traversal works against the supplied fixture hierarchy.
4. Cross-source switching remains one click away at deep folder depth.
5. My Project Files guardrail posture remains preserved.
6. Procore presents a governed deep-link directory model with no writeback implication.
7. Document Crunch and Adobe Sign remain launch-only external references, not root rail destinations.
8. The old ready-path card composition is reconciled or retired in a way that matches this plan.
9. Tests and evidence demonstrate the new UX contract.
10. Parallel Project Home work remains undisturbed.
