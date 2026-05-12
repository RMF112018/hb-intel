# Phase 08 Prompt 10B — Document Control Explorer Model and Fixture Contract

## Role

You are implementing **Phase 08 Prompt 10B** in the `RMF112018/hb-intel` repo.

This prompt establishes the typed explorer domain model and deterministic fixture contract that later prompts will render.

---

## Objective

Create the Documents-surface explorer data/model foundation for:

- `Document Control Home`
- `Project Record`
- `My Project Files`
- `Procore`

and incorporate the supplied Project Record folder hierarchy into a typed, read-only preview fixture contract.

Do **not** build the full UI shell in this prompt. This prompt is model/fixture/path-helper focused.

---

## Critical Parallel-Work Rule

Project Home work may be occurring in parallel.

Do not edit, revert, stage, or normalize unrelated Project Home files. If shared files show parallel Project Home drift, preserve them and proceed around them unless they directly block this Documents-only model work.

---

## Required Repo-Truth Preflight

Before edits:
1. Run `git status --short`.
2. Record starting HEAD.
3. Record lockfile md5.
4. Reconfirm Prompt 10A verdict or redo the narrow verification if 10A results are not in current context.
5. Classify any local drift.

---

## Package Support Inputs

Use the operator-supplied package support files:

```text
supporting/10_Project_Record_Fixture_Summary.md
supporting/10_Project_Record_Fixture_Folder_Paths.json
```

Translate the support JSON into the repo’s preferred typed fixture/model implementation. Do not add the raw uploaded ZIP archive to runtime source.

---

## Required Product Contract

### 1. Source roots
Represent these explorer sources:

```text
home
project-record
my-project-files
procore
```

### 2. Node / row capabilities
Create a typed explorer model sufficient to represent:

- home destination rows;
- source roots;
- Project Record folders;
- My Project Files project-scoped folder content;
- Procore category directories;
- Procore linked-record preview rows where the model requires row support;
- degraded / disabled reason copy where needed.

### 3. Project Record fixture
The typed Project Record fixture must:
- include the supplied directory paths;
- ignore `__MACOSX/` and `.DS_Store`;
- preserve folder names;
- support navigation through all represented nesting levels;
- remain deterministic;
- represent a read-only/no-writeback source.

### 4. My Project Files safety
Preserve existing My Project Files safety posture:
- no full OneDrive root;
- no browsing folders mapped to other projects;
- project-specific working-file context only.

Do not delete or weaken the existing hard-no logic merely because the new explorer model is introduced.

### 5. Procore category directory
Create deterministic model support for:

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

This prompt may define model entries and stable identifiers for these categories. Detailed UI rendering and launch/reference content arrive in Prompt 10E.

### 6. Path helper contract
Implement deterministic helper functions/types sufficient for later prompts to:
- resolve root source state;
- retrieve child nodes for a current path;
- produce breadcrumb segments;
- navigate to parent path;
- validate whether a child path exists;
- map supported Document Control module IDs to explorer focus targets where that mapping is naturally model-owned.

Do not implement shell/router module pass-through in this prompt unless a narrowly scoped type needs to be prepared.

---

## Expected File Scope

Use existing Documents-surface conventions where possible. New files may be added under:

```text
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/tests/
```

Preferred structure:
- model/types file;
- fixture/tree builder file;
- focused helper utility file if separation improves clarity;
- tests.

Do not touch:
- Project Home files;
- package/manifest versions;
- dependencies;
- lockfile.

---

## Tests Required

Add or update focused tests that verify:

1. The source-root vocabulary is deterministic.
2. The Project Record fixture includes the expected top-level sections:
   - `00_Project_Admin`
   - `10_Preconstruction`
   - `20_Construction`
   - `30_Financials`
   - `40_Closeout`
   - `50_3rd_Party`
   - `60_Media`.
3. Fixture transformation excludes archive noise.
4. Deep path traversal works for representative nested folder paths.
5. My Project Files model never represents the full OneDrive root.
6. Procore category set matches the locked list.
7. Breadcrumb/path helpers are stable and deterministic.

Use stable data-level assertions; do not overfit tests to incidental implementation details.

---

## Acceptance Criteria

Prompt 10B is complete when:
- the explorer source/model contract exists;
- the Project Record folder hierarchy has a typed implementation reference in repo source;
- path helpers support later UI rendering;
- no UI shell has been prematurely overbuilt;
- no writeback/source mutation behavior was introduced;
- Project Home parallel work remains untouched.

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

Use the repository closeout template if that is the current package standard. Include:
- starting and ending HEAD;
- local drift classification;
- parallel Project Home drift classification;
- files changed;
- model/types/helpers added;
- tests added/updated;
- lockfile md5 before/after;
- validation results;
- prompt 10C readiness verdict.
