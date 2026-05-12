# Phase 08 Prompt 10C — Document Control Explorer Shell and Ready-Path Composition

## Role

You are implementing **Phase 08 Prompt 10C** in the `RMF112018/hb-intel` repo.

Prompt 10B should already have established the explorer source/model/fixture contract. This prompt renders that contract into the Documents surface.

---

## Objective

Replace the ready-path Documents lane-card composition with an explorer-first shell that includes:

- persistent in-surface source rail;
- Document Control Home landing state;
- source/context header;
- breadcrumb region;
- main content pane;
- project source posture messaging;
- read-only/no-writeback visual treatment.

This prompt establishes the Explorer UI shell and ready-path surface composition. It does not need to finish all advanced interactions or Procore detail rendering; those are handled in later prompts.

---

## Critical Parallel-Work Rule

Project Home work may be occurring in parallel.

Do not:
- edit Project Home files;
- re-run a broad refactor that formats Project Home code;
- revert Project Home drift;
- weaken Project Home tests.

If a shared file contains Project Home drift, preserve it. Prompt 10C should primarily stay within Documents-surface files.

---

## Required Preflight

1. Record current branch, HEAD, `git status --short`, and lockfile md5.
2. Confirm Prompt 10B artifacts are present and green.
3. Classify any current drift, including Project Home drift.
4. Proceed only if the Documents source is safe to edit without overwriting operator-owned work.

---

## Locked UI Architecture

### 1. Explorer ready path
The Documents ready path must read as a **file explorer browser**, not as a stack of document cards.

### 2. Source rail
Render an in-surface source rail with these roots:

```text
Document Control Home
Project Record
My Project Files
Procore
```

This is authorized Documents-local navigation, not a global PCC sidebar.

### 3. Home main pane
When the surface first renders, show `Document Control Home`:
- concise end-user purpose copy;
- root destinations presented in an explorer-native manner;
- lightweight source posture notes;
- optional compact external-reference placeholder area may be reserved for Prompt 10E, but do not prematurely render launch-only details if they are not implemented yet.

### 4. Source/context header
The main pane should identify:
- active source;
- source-system badge or equivalent concise label;
- authority posture:
  - Project Record: read-only SharePoint reference;
  - My Project Files: project-scoped working files;
  - Procore: launch-only/deep-link posture.

### 5. Breadcrumb region
Render an accessible breadcrumb band capable of showing:
- home;
- selected source;
- deeper segments later.

Prompt 10C can render root-level breadcrumb states; full drill-down behavior arrives in Prompt 10D.

### 6. Main content pane
Render folder/category/list rows using the Prompt 10B model:
- Project Record root-level folders;
- My Project Files root posture;
- Procore root/category posture may be partial until 10E, but the shell must support it cleanly.

### 7. Ready-path replacement
On the normal ready path:
- render the explorer as the primary Documents composition;
- do **not** leave the old three lane cards as the main user experience beside or above it.

It is acceptable for Prompt 10F to perform deeper dead-render cleanup, but Prompt 10C must establish the explorer as the user-visible ready path.

### 8. Loading/error branches
Preserve responsible whole-surface loading/error handling. The existing state-card pattern may remain for full-surface loading/error branches if that remains the cleanest repo-aligned posture.

---

## Layout / Bento Contract

Preserve:
- shell-owned active-panel marker;
- bento direct-child invariant;
- no global sidebar.

Preferred composition:
- one full-width explorer-ready-path unit as a direct bento child;
- no multi-card Documents dashboard regression.

Use existing layout primitives where they preserve app consistency, but visually the Documents ready path must read as an explorer, not as a standard dashboard card grid.

---

## Accessibility Baseline

At minimum:
- source rail is a labeled navigation/list region with keyboard-accessible source buttons;
- active source has visible selected-state semantics;
- breadcrumb region is screen-reader meaningful;
- main-pane rows have appropriate button/list semantics and do not overstate unavailable behavior.

Prompt 10G performs final accessibility tightening, but Prompt 10C must not introduce obvious accessibility debt.

---

## Expected File Scope

Likely:
```text
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/tests/*Document*
apps/project-control-center/src/tests/*Documents*
```

Do not edit:
- Project Home surface files;
- dependency manifests;
- package version files.

---

## Tests Required

Add/update tests for:
1. Explorer shell renders on Documents ready path.
2. Source rail renders exactly the four locked roots.
3. Initial selected source is Document Control Home.
4. Project Record root folders render from model/fixture contract.
5. Breadcrumb band renders in home and source-root state.
6. Old lane-card composition is no longer the primary ready-path experience.
7. Shell-owned active-panel marker remains unchanged.
8. Bento direct-child invariant remains green.

Avoid tests that assert fragile CSS classes.

---

## Required Validation

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

---

## Closeout Requirements

Include:
- starting/ending HEAD;
- drift classification;
- Project Home parallel-work preservation note;
- files changed;
- screenshots generated or deferred reason;
- tests/validation results;
- lockfile md5 before/after;
- readiness for Prompt 10D.
