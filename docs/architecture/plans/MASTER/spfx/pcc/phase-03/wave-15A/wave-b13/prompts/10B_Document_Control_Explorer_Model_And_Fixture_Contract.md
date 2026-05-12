# Phase 08 Prompt 10B — Document Control Explorer Model and Fixture Contract

## Role

You are implementing **Phase 08 Prompt 10B** in the `RMF112018/hb-intel` repo.

This prompt establishes the **typed, deterministic, Documents-surface Explorer domain model and fixture contract** that later Prompts **10C–10G** will render and interact with.

Prompt 10B is **model / fixture / path-helper only**.  
Do **not** build or partially build the Explorer UI shell in this prompt.

---

## Objective

Create the Documents-surface Explorer data/model foundation for:

- `Document Control Home`
- `Project Record`
- `My Project Files`
- `Procore`

and translate the supplied **Project Record** folder-reference package into a typed, read-only/no-writeback runtime fixture contract that later prompts can render predictably.

The result of Prompt 10B should give later prompts a stable source/node/path model, deterministic Project Record tree, bounded My Project Files posture, Procore category directory model, and pure helper contracts without changing the Documents ready-path UI yet.

---

## Governing Context

### 1. Prompt 10A verdict

Prompt 10A established that current runtime repo truth is compatible with the Explorer target architecture and that Prompt 10B may proceed.

Before editing, reconfirm that the local repo still matches the Prompt 10A posture or classify any newer drift.

### 2. Governing target architecture

Use the current Prompt 10 target plan as the governing Explorer architecture:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/prompts/10_Document_Control_Explorer_Target_Architecture_and_Implementation_Plan.md
```

Prompt 10B implements only the **model / fixture / helper foundation** portion of that architecture.

### 3. Agent context discipline

Do **not** re-read files that are still within current context or memory unless:

- local drift is suspected;
- exact current edit locations must be verified;
- a validation failure requires renewed inspection.

Inspect narrowly. Do not perform broad repo archaeology.

---

## Critical Parallel-Work Rule

Project Home work may be occurring in parallel, including Phase 08 Prompt `09A`–`09E` follow-on work.

Do not:

- edit Project Home files;
- revert Project Home work;
- normalize surrounding shared-file code unrelated to Prompt 10B;
- stage unrelated drift;
- use unrelated Project Home WIP as a reason to stop unless it directly blocks this Documents-only model/fixture task.

If shared files show parallel Project Home drift, preserve them and proceed around them unless they directly block Prompt 10B. Record the classification in closeout.

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

3. Reconfirm the Prompt 10A handoff:
   - Explorer target plan remains governing;
   - the authoritative Project Record directory remains present at `docs/reference/example/ComDir/`;
   - `10B` remains the next implementation prompt.

4. Classify any local drift before editing.

5. If a new blocking conflict exists in the Documents-surface model scope, stop and report rather than guessing.

---

## Authoritative Project Record Directory Input — Design-Time Only

Use the repository directory below as the **authoritative Project Record folder-structure source**:

```text
docs/reference/example/ComDir/
```

This path contains the proposed directory hierarchy in unzipped repository form. Prompt 10B must inspect the directory tree directly and translate its folder structure into the repo’s preferred **source-local typed fixture/model implementation** under the Documents-surface runtime source tree.

### Hard rules

Do **not**:

- treat a ZIP archive as the source of truth;
- treat previously generated summary/JSON helper artifacts as the governing source if they disagree with `docs/reference/example/ComDir/`;
- import, traverse, or read `docs/reference/example/ComDir/` at runtime from PCC application source;
- copy unrelated file contents into runtime source merely because they exist beneath the directory reference.

`docs/reference/example/ComDir/` is a **design-time repo reference directory**, not a runtime data dependency.

---

## Required Product Contract

## 1. Explorer source roots

Represent exactly these Explorer source roots:

```text
home
project-record
my-project-files
procore
```

These are Documents-surface Explorer roots, not global navigation tabs.

Do **not** add `document-crunch`, `adobe-sign`, or `drawing-model-center` as source roots in Prompt 10B.

- `Document Crunch` and `Adobe Sign` remain external-reference work for Prompt **10E**.
- `drawing-model-center` remains deferred and must not receive fabricated Explorer behavior.

---

## 2. Explorer node and row vocabulary

Create a typed Explorer model sufficient to represent:

- home destination rows;
- source-root rows;
- Project Record folder nodes;
- My Project Files project-scoped root posture;
- Procore category directory nodes;
- future Procore linked-record node support where type-level support is useful;
- degraded / disabled / unavailable reason copy where model metadata requires it.

### Required node-kind coverage

At minimum, the model must be able to distinguish:

```text
home
source-root
folder
category
linked-record
```

`linked-record` support may exist at the type/model level in Prompt 10B, but **Prompt 10B must not populate Procore linked-record preview fixture rows**. Those fixture rows and their UX posture are Prompt **10E** scope.

### Required node/row data posture

Use repo-consistent naming, but the typed contract must support the semantic equivalent of:

- stable node id;
- display label;
- source id;
- node kind;
- parent path / parent id;
- child availability;
- read-only / launch-only / preview posture;
- optional disabled or unavailable reason;
- optional linked-record metadata hook for future Prompt 10E use.

Use immutable / readonly types where consistent with current repo conventions.

---

## 3. Project Record fixture contract

The Project Record reference package is not a toy sample. It represents a deterministic folder hierarchy with:

- `233` directory paths including the source root;
- `232` relative paths beneath the source root;
- maximum relative folder depth of `5`;
- the locked top-level sections:
  - `00_Project_Admin`
  - `10_Preconstruction`
  - `20_Construction`
  - `30_Financials`
  - `40_Closeout`
  - `50_3rd_Party`
  - `60_Media`.

Prompt 10B must preserve that full represented hierarchy.

### Required normalization rules

The typed Project Record fixture must:

- use `docs/reference/example/ComDir/` as the design-time source of truth;
- traverse folder structure recursively;
- ignore non-directory file contents unless a future prompt expressly authorizes file-row modeling;
- ignore filesystem/archive noise if present, including `.DS_Store`, AppleDouble sidecars, or other non-directory artifacts;
- preserve folder labels exactly as supplied;
- remain deterministic;
- support navigation through **all represented nesting levels**;
- represent the Project Record source as **read-only / no SharePoint writeback**.

### Directory root handling — locked

The directory root:

```text
docs/reference/example/ComDir/
```

is a design-time source anchor, **not** an additional visible first-level Explorer folder beneath `Project Record`.

The later Explorer UI should open `Project Record` directly to the seven locked top-level folders above, not to a redundant intermediate row named `ComDir`.

Implement the model/tree accordingly.

### Deterministic ordering

Preserve deterministic ordering.

Preferred posture:

- top-level `Project Record` children follow the locked top-level order stated in this prompt;
- nested sibling ordering should be deterministic and derived from a deliberate rule applied during translation of `docs/reference/example/ComDir/`, not from incidental filesystem enumeration, object-key iteration, or locale-sensitive runtime sorting.

Document the chosen deterministic ordering rule in code comments or closeout where helpful.

---

## 4. My Project Files safety boundary

Preserve the existing My Project Files hard-no posture:

- no full OneDrive root exposure;
- no browsing folders mapped to other projects;
- project-specific working-file context only;
- no broad personal-drive abstraction.

Do not delete, weaken, bypass, or duplicate around the existing Documents read-model safety posture merely because a new Explorer model is introduced.

### Prompt 10B scope limit

Unless repo truth already exposes a safe, deterministic nested My Project Files preview tree, Prompt 10B should model:

- the project-scoped My Project Files Explorer source/root;
- guardrail metadata required for later rendering;
- no invented nested OneDrive directory hierarchy;
- no invented file rows.

Do not fabricate a broader My Project Files tree in this prompt.

---

## 5. Procore directory model boundary

Create deterministic model support for the locked Procore category directory:

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

Prompt 10B should:

- define stable category identifiers;
- define category directory nodes or equivalent typed model entries;
- make the directory structure deterministic for later rendering;
- preserve Procore posture as launch-only / deep-link visibility only.

### Scope boundary with Prompt 10E

Prompt 10B must **not** implement:

- Procore linked-record preview rows;
- launch affordances;
- external-reference UI;
- fake deep links.

Prompt **10E** owns the governed Procore category-pane preview rows and external-reference treatment for Document Crunch / Adobe Sign.

---

## 6. Pure path-helper contract

Implement deterministic, side-effect-free helpers/types sufficient for later prompts to:

- resolve a source root;
- retrieve child nodes for a current path/node;
- produce breadcrumb segments;
- navigate to a parent path/node;
- validate whether a child path exists;
- normalize or resolve Project Record relative paths consistently;
- support later in-memory path retention without introducing persistence now.

Do not implement mounted state retention in Prompt 10B. Prompt **10D** owns interactive navigation state and per-source last-path retention.

---

## 7. Pure module-focus mapping contract for later Prompt 10D use

Prompt 10D will thread `activeModuleId` into `PccDocumentsSurface` and apply deterministic module focus behavior.

Prompt 10B should prepare a **pure, Documents-local, side-effect-free mapping helper or model contract** that Prompt 10D can consume, without touching shell/router/runtime UI wiring.

Use the Prompt 10D deterministic mapping:

| Document module id | Explorer focus target |
|---|---|
| `primary-documents` | `Document Control Home` |
| `document-control-center` | `Document Control Home` |
| `sharepoint-project-record` | `Project Record` root |
| `my-project-files` | `My Project Files` root |
| `procore-documents` | `Procore > Documents` |
| `document-crunch` | no Explorer source-root focus; preserve external-reference posture |
| `adobe-sign` | no Explorer source-root focus; preserve external-reference posture |
| `drawing-model-center` | no fabricated Explorer focus; preserve deferred posture |

### Hard boundary

Do **not**:

- pass `activeModuleId` into `PccDocumentsSurface`;
- edit `PccSurfaceRouter.tsx`;
- implement navigation state;
- alter Project Home `onSelectModule`.

Those are Prompt **10D** concerns.

---

## Expected File Scope

Use existing Documents-surface conventions where possible.

### Preferred Prompt 10B source scope

New files may be added under:

```text
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/tests/
```

Preferred implementation shape:

- Explorer model/types file;
- Project Record typed fixture/tree builder file;
- focused pure helper utility file if separation improves clarity;
- focused tests.

### Render-component boundary

Prompt 10B should not modify ready-path render components such as:

```text
apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlLaneCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlPermissionsCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlReviewsCard.tsx
```

If an export-only or type-import adjustment becomes strictly necessary, keep it narrow and explain it in closeout. Do not change rendered Documents composition in Prompt 10B.

### Do not touch

- Project Home files;
- router/shell files;
- package/manifest versions;
- dependencies;
- lockfile;
- runtime imports from the package `reference/` artifacts.

If you conclude a shared package-level model mutation is truly required, stop and report rather than expanding scope silently.

---

## Tests Required

Add or update focused tests that verify all of the following.

### A. Explorer vocabulary

1. Source-root vocabulary is deterministic and exactly:
   ```text
   home
   project-record
   my-project-files
   procore
   ```

2. Node-kind vocabulary supports the required Explorer contract.

### B. Project Record fixture completeness and normalization

3. Project Record root children are exactly the seven locked top-level sections derived from the proposed `ComDir` structure:
   - `00_Project_Admin`
   - `10_Preconstruction`
   - `20_Construction`
   - `30_Financials`
   - `40_Closeout`
   - `50_3rd_Party`
   - `60_Media`

4. The design-time source root:
   ```text
   docs/reference/example/ComDir/
   ```
   is not represented as an extra visible first-level folder beneath `Project Record`.

5. The typed Project Record fixture preserves the full hierarchy discovered under `docs/reference/example/ComDir/`. The implementation must:
   - calculate the directory count from the on-disk source tree during prompt execution;
   - calculate relative directory count beneath the source root;
   - calculate maximum relative folder depth;
   - lock those verified figures into the resulting test/closeout posture rather than relying on stale prior ZIP-summary assumptions.

6. Fixture transformation excludes non-directory/source noise:
   - no `.DS_Store`;
   - no AppleDouble sidecar path artifacts;
   - no unrelated non-directory file content represented as folder nodes.

7. Deep path traversal works for representative nested fixture paths verified from `docs/reference/example/ComDir/`, including at least one deepest-level path found in the actual directory tree.

8. Folder labels remain preserved as supplied.

### C. My Project Files safety

9. My Project Files model never represents:
   - a full OneDrive root;
   - another project’s folder;
   - a fabricated broader personal-drive hierarchy.

10. If the model includes a My Project Files source root, it is explicitly project-scoped and guardrail-compatible.

### D. Procore contract

11. Procore category set matches the locked list exactly.

12. Stable Procore category ids/path targets are deterministic.

13. Prompt 10B does not introduce Procore linked-record preview fixture rows that belong to Prompt 10E.

### E. Helper behavior

14. Child retrieval, breadcrumb creation, parent navigation, and path validation are deterministic.

15. Pure module-focus mapping helper/contract matches the locked Prompt 10D mapping and does not require router edits.

Use stable data-level assertions. Do not overfit tests to incidental implementation details or CSS.

---

## Acceptance Criteria

Prompt 10B is complete when:

- the Explorer source/model contract exists;
- the Project Record directory hierarchy from `docs/reference/example/ComDir/` is fully translated into repo source as a typed, deterministic implementation reference;
- Project Record root normalization is correct and does not expose the `ComDir` source-root folder as an unnecessary first-level Explorer folder;
- full fixture completeness is proven by tests using counts/depth verified from the actual source directory;
- path helpers support later UI rendering and 10D navigation behavior;
- pure module-focus mapping support exists for later 10D consumption;
- My Project Files safety is preserved without invented breadth;
- Procore categories exist as deterministic directory model entries only;
- no UI shell, source rail, breadcrumb rendering, or interactive navigation was prematurely built;
- no writeback/source mutation behavior was introduced;
- Project Home parallel work remains untouched.

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

If the repo has a prompt-local focused test command available for the new Explorer model tests, it may be run in addition to the full package test command above. Do not invent a new test runner pattern.

---

## Closeout Requirements

Use the repository closeout template if that is the current package standard.

Include:

- starting and ending HEAD;
- current branch;
- local drift classification;
- parallel Project Home drift classification;
- files changed;
- model/types/helpers added;
- Project Record `ComDir` directory translation summary;
- fixture completeness confirmation derived from `docs/reference/example/ComDir/`:
  - total directory count;
  - relative directory count beneath source root;
  - max depth;
  - excluded non-directory/source noise;
- root normalization confirmation:
  - `ComDir` used only as design-time source anchor;
  - not rendered/modelled as an extra visible Project Record first-level folder;
- My Project Files safety preservation note;
- Procore category-only model scope confirmation;
- module-focus pure mapping summary;
- tests added/updated;
- validation results;
- lockfile md5 before/after;
- Prompt 10C readiness verdict.

---

## Hard Stops

Stop and report before proceeding if Prompt 10B would require:

- editing Project Home files;
- editing router/shell files;
- runtime imports from `docs/reference/example/ComDir/` or any package/reference planning artifacts;
- exposing a full OneDrive root or other-project My Project Files folders;
- fabricating Procore linked-record rows or launch behavior reserved for Prompt 10E;
- changing Documents ready-path rendering;
- adding dependencies;
- mutating package/manifest versions;
- changing `pnpm-lock.yaml`;
- overwriting parallel operator-owned work.
