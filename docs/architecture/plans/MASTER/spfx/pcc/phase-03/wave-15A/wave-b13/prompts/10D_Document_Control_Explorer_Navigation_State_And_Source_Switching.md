# Phase 08 Prompt 10D — Document Control Explorer Navigation State and Source Switching

## Role

You are implementing **Phase 08 Prompt 10D** in the `RMF112018/hb-intel` repo.

The explorer model and shell should already exist from Prompts 10B and 10C. This prompt implements the navigation behavior that makes the explorer useful.

---

## Objective

Implement:

- folder drill-down;
- breadcrumb path traversal;
- one-click cross-source switching regardless of current depth;
- per-source last-path retention while the explorer instance remains mounted;
- Documents-specific `activeModuleId` focus mapping via a narrow router seam if required.

---

## Critical Parallel-Work Rule

Project Home work may be occurring in parallel.

The only shared-file change anticipated in this prompt is a narrowly scoped Documents-specific router/threading update if needed.

If `PccSurfaceRouter.tsx` or related shared files contain parallel Project Home edits:
- preserve them;
- add only the smallest documents-specific change;
- do not reformat or rewrite unrelated Project Home logic;
- document the preservation in closeout.

---

## Required Preflight

1. Record current branch, HEAD, git status, lockfile md5.
2. Confirm Prompts 10B and 10C are present and green.
3. Classify drift, especially any Project Home drift in shared files.
4. Proceed only when the router/surface seam can be changed without overwriting parallel work.

---

## Required Interaction Contract

### 1. Folder drill-down
From Project Record:
- selecting a folder row updates the current path;
- main pane refreshes to show children of that folder;
- breadcrumb reflects the new path.

### 2. Breadcrumb traversal
- previous breadcrumb segments are interactive;
- clicking a prior segment returns to that folder/source/home level;
- current breadcrumb segment is presented as current, not falsely actionable.

### 3. One-click source switching invariant
From any nested folder path:
- the source rail remains visible on desktop/laptop layouts;
- clicking another source root updates the main pane in one action;
- no “back to top” step is required.

### 4. Mounted per-source path retention
While the explorer instance remains mounted:
- retain the last visited path for each source;
- switching away from a source and back restores the last viewed path for that source;
- do not introduce browser storage or cross-session persistence in Prompt 10.

### 5. Source home behavior
Selecting:
- `Document Control Home` returns to home state;
- `Project Record` restores last Project Record path if available, otherwise its root;
- `My Project Files` restores last working-file path if available, otherwise its root;
- `Procore` restores last Procore path/category if available, otherwise Procore root.

---

## Active Module Focus Mapping

If repo truth still shows that `activeModuleId` is not passed to `PccDocumentsSurface`, update the narrow router seam so Documents can respond to existing document-related module selections.

Recommended deterministic mapping:

| Module | Explorer focus |
|---|---|
| `primary-documents` | `Document Control Home` |
| `document-control-center` | `Document Control Home` |
| `sharepoint-project-record` | `Project Record` root |
| `my-project-files` | `My Project Files` root |
| `procore-documents` | `Procore > Documents` |
| `document-crunch` | no new root; keep launch-only external reference posture |
| `adobe-sign` | no new root; keep launch-only external reference posture |
| `drawing-model-center` | no fabricated explorer focus; preserve deferred posture |

Rules:
- do not redesign the tab/module registry in this prompt;
- consume existing module ids;
- do not affect Project Home `onSelectModule` behavior.

---

## My Project Files Safety

Navigation must not weaken:
- no full OneDrive root exposure;
- no cross-project folder browsing;
- current project-specific working-file boundary.

---

## Tests Required

Add/update tests that prove:

1. Project Record folder row selection drills down.
2. Breadcrumb updates on drill-down.
3. Breadcrumb parent segment navigates upward.
4. User can navigate several folders deep, then select Procore from source rail in one click.
5. Switching back to Project Record restores its last mounted path.
6. Selecting Document Control Home resets to home.
7. Module mapping drives the expected initial explorer focus where `activeModuleId` is passed.
8. Project Home behavior is unaffected by the router change.

Do not write brittle tests against class names.

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
- files changed;
- whether `PccSurfaceRouter.tsx` required an additive Documents-specific seam update;
- how parallel Project Home changes were preserved;
- tests added/updated;
- validation results;
- lockfile md5 before/after;
- readiness for Prompt 10E.
