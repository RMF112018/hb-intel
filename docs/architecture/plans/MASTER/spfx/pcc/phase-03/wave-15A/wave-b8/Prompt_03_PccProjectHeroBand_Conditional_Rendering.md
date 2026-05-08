# Prompt 03 — PccProjectHeroBand Conditional Rendering v2

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Role

You are the local code agent executing **Prompt 03 — PccProjectHeroBand Conditional Rendering** for PCC Phase 03 / Wave 15A wave-b8.

This prompt is a **conditional-rendering verification and targeted hardening pass**. It is not a redesign prompt and does not authorize Project Home command-summary extraction, duplicate-card removal, command routing, active module state, new metadata fields, or package/manifest/lockfile changes.

---

## Objective

Verify and, only if repo truth proves a gap, minimally harden `PccProjectHeroBand` so the shell command header visibly and semantically changes by active surface using the existing metadata model:

- `surfaceSummaryItems`
- `surfaceCues`
- `readOnlyCue`

After Prompt 02, the header metadata and all-eight-surface switching tests should already exist. This prompt must first prove what is already implemented before editing. If the existing implementation already satisfies the rendering objective, make no runtime source changes and limit work to any missing targeted tests or documentation-free verification.

---

## Current Baseline to Respect

Prompt 02 landed commit:

```text
0a018601591a2915b7b12a89f0fb05fcd82f28bb
feat(pcc): add no-execution and launch-context shell hero cues
```

Prompt 02 added:

- `project-readiness.surfaceCues[]` → `no-execution`
- `external-systems.surfaceCues[]` → `launch-context`
- targeted cue-lock tests;
- cue/summary ID uniqueness tests;
- one compact all-eight-surface metadata switching integration test in `PccShell.responsive.test.tsx`.

Prompt 02 did **not** change schema, rendering, duplicate cards, package files, manifests, or lockfile.

---

## Required First Actions

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log -1 --oneline
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Confirm current HEAD includes Prompt 02 commit `0a018601591a2915b7b12a89f0fb05fcd82f28bb` or a later commit that contains the same source/test changes.

Stop and report drift if:

- working tree is dirty in Prompt 03 target files;
- branch is not `main`;
- Prompt 02 cue additions are absent;
- `PccProjectHeroBand.tsx` no longer renders `viewModel.surfaceSummaryItems`, `viewModel.surfaceCues`, or `viewModel.readOnlyCue`;
- shell tabpanel ownership has drifted away from `main[role="tabpanel"][data-pcc-active-surface-panel]`;
- `apps/project-control-center/config/package-solution.json` is missing;
- package/lockfile/manifest files show unapproved drift.

---

## Files to Inspect

Inspect only the files required to prove current rendering truth and identify narrowly scoped gaps:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/projectShellViewModel.test.ts
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/config/package-solution.json
```

Do not inspect duplicate/header-card sources unless you detect unexpected Project Home or surface-specific content gaps that require boundary confirmation. If inspected, do not edit them.

---

## Rendering Verification Requirements

Before making any edit, verify whether `PccProjectHeroBand.tsx` already renders:

- `primaryTitle`;
- active surface secondary title;
- compact surface description;
- project facts;
- surface summary item zone;
- surface cue zone;
- read-only cue;
- command-search preview;
- stable data markers for summary/cue/read-only zones.

If all are already rendered from `IPccShellHeroViewModel`, no runtime edit to `PccProjectHeroBand.tsx` is authorized.

---

## Authorized Source Changes

### Default expectation

No runtime source changes are expected.

### Runtime source changes are allowed only if a verified gap exists

You may edit only these files, and only with a narrow justification:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
```

Allowed reasons:

- a required summary/cue/read-only zone is missing;
- a required stable marker is missing;
- a summary/cue/read-only zone has interactive descendants;
- compact layout has a clear overflow/collapse defect visible from CSS/repo truth;
- accessible region semantics are missing or regressed.

Not allowed:

- new metadata fields;
- new command actions;
- new Project Home command-summary fields;
- new active module state;
- live/fixture-derived counts;
- command search interactivity;
- duplicate-card changes.

If no verified gap exists, do not edit runtime source files.

---

## Authorized Test Changes

Test changes are allowed if they close verified coverage gaps.

Expected candidate files:

```text
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/projectShellViewModel.test.ts
```

### Required test review

Confirm whether current tests already prove:

1. Summary item IDs differ by active surface.
2. Cue IDs differ by active surface.
3. The all-eight-surface metadata switching integration test exists.
4. `project-readiness` renders the `no-execution` cue.
5. `external-systems` renders the `launch-context` cue.
6. Summary/cue/read-only zones have no interactive descendants.
7. Command search remains preview-only with no `input`, `button`, `a`, `role="button"`, or `tabindex="0"`.
8. Shell tab/tabpanel accessibility remains intact.

### Required test additions if missing

If not already covered, add focused tests only. Do not rewrite suites.

Minimum acceptable additions:

- A test proving at least four ordered surface transitions update both summary IDs and cue IDs:
  - `project-home` → `documents`
  - `documents` → `approvals`
  - `approvals` → `external-systems`
  - `external-systems` → `site-health`
- A test proving no interactive descendants exist inside:
  - `[data-pcc-hero-surface-summary]`
  - `[data-pcc-hero-surface-cues]`
  - `[data-pcc-hero-read-only-cue]`
- A test proving command search remains preview-only and non-focusable if not already covered.

If the Prompt 02 all-eight-surface test already proves stronger coverage than the ordered transition requirement, do not duplicate it. Instead, add only missing assertions to that test or document no test edit needed.

---

## Project Home Boundary

Do **not** absorb Project Home command-summary counts in Prompt 03.

The following remain Phase 04-retained unless a later approved prompt explicitly changes the boundary:

- high-priority action count;
- pending approvals count;
- blocking setup gaps count;
- client fact;
- Project Home status/type pills;
- `PccProjectIntelligenceCard` composition.

Allowed in Prompt 03:

- Verify that existing header metadata already carries source/HBI/read-only posture.
- Verify that Project Home facts already rendered in the shell remain limited to existing hero facts.
- Document that `PccProjectIntelligenceCard` remains untouched.

Not allowed in Prompt 03:

- moving counts from `PccProjectIntelligenceCard` into the shell header;
- adding `surfaceStatusFacts`, `surfaceCommandSummary`, trend seams, or future health fields;
- editing Project Home surface/card files.

---

## Surface Behavior Verification

Prompt 03 must verify the command header behavior for all eight MVP surfaces:

```text
project-home
team-and-access
documents
project-readiness
approvals
external-systems
control-center-settings
site-health
```

For each surface, confirm:

- secondary title matches the active surface display name;
- summary item IDs match `PCC_SHELL_SURFACE_HEADER_METADATA[surface].surfaceSummaryItems`;
- cue IDs match `PCC_SHELL_SURFACE_HEADER_METADATA[surface].surfaceCues`;
- read-only cue matches `PCC_SHELL_SURFACE_HEADER_METADATA[surface].readOnlyCue`;
- no enabled command/control is introduced.

---

## Command Search Requirement

`PccCommandSearch` remains preview-only.

It must render no:

```text
input
button
a
role="button"
tabindex="0"
```

Visible copy must continue to communicate preview/unavailable posture.

No change to `PccCommandSearch.tsx` is authorized unless current repo truth proves the preview-only posture regressed.

---

## Accessibility and Responsive Requirements

Verify and preserve:

- `PccProjectHeroBand` remains a labelled `role="region"` or equivalent accessible region.
- Shell tabs continue to use `role="tablist"` / `role="tab"`.
- Shell panel remains `main[role="tabpanel"]`.
- Tab `aria-controls` points to the shell panel ID.
- Shell panel `aria-labelledby` points to the active tab ID.
- Summary/cue/read-only copy is visible text, not color-only.
- Compact modes remain readable from CSS contract.
- No fake enabled controls are introduced.

CSS edits are allowed only for proven overflow/collapse defects. Do not use this prompt for general visual redesign.

---

## Explicitly Prohibited

Do **not**:

- remove, demote, rename, reorder, or modify duplicate/header cards;
- edit Project Home card/surface files;
- add Project Home facts/counts to shell metadata;
- add Site Health `Overall` or last-run metrics to shell metadata;
- add `surfaceSubtitle`, `surfaceStatusFacts`, `surfaceCommandSummary`, `surfaceCommandActions`, or any new metadata field;
- change metadata interfaces unless a compile failure proves a narrow correction is required;
- implement module launcher behavior;
- implement command routing;
- introduce active module state;
- introduce live fetches, tenant reads, Graph/PnP/Procore calls, or external sync;
- make command search interactive;
- alter bento composition or layout primitives;
- edit package files, lockfile, SPFx package-solution, or manifests;
- run broad `prettier --write` over the repo.

---

## Validation Required

Run in this order:

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

If no files changed, run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If formatting fails on changed files, make surgical formatting corrections only to changed files, then re-run:

```bash
pnpm exec prettier --check <changed-files>
pnpm --filter @hbc/spfx-project-control-center test
git diff --check
```

---

## Commit Guidance

Do not commit automatically unless the user separately authorizes a commit after reviewing validation.

If no files change, do not commit.

If files change, provide the full Prompt 03 completion report and include a proposed commit summary/description for user approval.

---

## Required Completion Response

```markdown
## Prompt 03 Complete

## Files Changed
- State `None` if no changes were required.

## Conditional Header Rendering Summary
- Confirm whether existing rendering already satisfied the objective.
- If changed, describe exactly what changed.

## Surface-by-Surface Header Behavior
| Surface | Secondary Title | Summary IDs | Cue IDs | Read-Only Cue | Result |
|---|---|---|---|---|---|
| project-home | ... | ... | ... | ... | ... |
| team-and-access | ... | ... | ... | ... | ... |
| documents | ... | ... | ... | ... | ... |
| project-readiness | ... | ... | ... | ... | ... |
| approvals | ... | ... | ... | ... | ... |
| external-systems | ... | ... | ... | ... | ... |
| control-center-settings | ... | ... | ... | ... | ... |
| site-health | ... | ... | ... | ... | ... |

## Project Home Content Extraction Audit
- Confirm no Project Home facts/counts were moved.
- Confirm `PccProjectIntelligenceCard` remains untouched.
- Confirm source/HBI posture is represented through existing header metadata only.

## Command Search / False Affordance Audit
- Confirm no interactive command-search controls.
- Confirm no enabled command affordances were introduced.

## Accessibility and Responsive Audit
- Shell region/tab/tabpanel status:
- Summary/cue/read-only zone status:
- Compact mode/CSS status:

## Tests Added or Updated
- State `None` if no tests changed.
- If tests changed, list exact test files and assertions.

## Validation Results
- `git status --short` before:
- `md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml` before:
- `check-types`:
- `test`:
- `prettier --check <changed-files>` if applicable:
- `git diff --check` if applicable:
- lockfile hash after:
- `git status --short` after:

## Package / Lockfile / Manifest Audit
- Confirm unchanged:
  - `package.json`
  - `apps/project-control-center/package.json`
  - `pnpm-lock.yaml`
  - `apps/project-control-center/config/package-solution.json`
  - SPFx manifests

## Follow-Up Notes for Prompt 04
- Identify only remaining Phase 03 follow-ups.
- Reconfirm duplicate/header-card removal remains Phase 04.
```
