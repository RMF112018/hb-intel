# Prompt 04 — Header A11y and Responsive Semantics v2

## Mandatory Efficiency Directive

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Role

You are the local code agent executing **Prompt 04 — Header A11y and Responsive Semantics** for PCC Phase 03 / Wave 15A wave-b8.

This prompt is a **verification-first accessibility and responsive-semantics hardening pass**. It is not a broad visual redesign, not a CSS polish sprint, not a shell recomposition prompt, and not a duplicate-card-removal prompt.

The expected outcome is likely one of:

1. no runtime source changes and no test changes, with a complete verification report; or
2. small targeted test hardening only; or
3. a narrowly justified `PccProjectHeroBand` / command-search / CSS correction if current repo truth proves an actual a11y/responsive defect.

---

## Objective

Confirm and, only if necessary, minimally harden the conditional command header so it remains:

- accessible;
- compact;
- responsive across the eight PCC responsive modes;
- clear about source, authority, read-only, no-writeback, and preview boundaries;
- free of false enabled command affordances;
- compatible with SharePoint-hosted SPFx page canvas constraints.

Do not introduce new header behavior. Do not change metadata content unless a test failure proves current copy is inaccessible or misleading.

---

## Current Baseline to Respect

Prompt 02 landed:

```text
0a018601591a2915b7b12a89f0fb05fcd82f28bb
feat(pcc): add no-execution and launch-context shell hero cues
```

Prompt 03 landed:

```text
6b5da69d0227449c262ac0ca61150b72881de22b
test(pcc): tighten hero-band and shell metadata assertions
```

Prompt 03 verified and/or hardened:

- ordered summary ID and cue ID matching in the all-eight-surface metadata switching test;
- no interactive descendants inside the read-only cue zone;
- command-search preview slot has no `input`, `button`, `a`, `select`, `textarea`, `[tabindex="0"]`, or `[role="button"]`;
- zero runtime source changes;
- zero CSS changes;
- zero schema/package/manifest/lockfile changes.

Prompt 04 must not reopen issues already closed by Prompt 03 unless current repo truth has drifted.

---

## Required First Actions

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log -1 --oneline
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git merge-base --is-ancestor 6b5da69d0227449c262ac0ca61150b72881de22b HEAD; echo "p03_ancestor=$?"
```

Stop and report drift if:

- working tree is dirty in Prompt 04 target files;
- branch is not `main`;
- Prompt 03 commit `6b5da69d0227449c262ac0ca61150b72881de22b` is not reachable from `HEAD`;
- `PccProjectHeroBand` no longer renders summary/cue/read-only zones;
- shell active panel no longer uses `main[role="tabpanel"][data-pcc-active-surface-panel]`;
- tab `aria-controls` / panel `aria-labelledby` wiring is missing or broken;
- command-search preview now contains focusable or interactive descendants;
- `apps/project-control-center/config/package-solution.json` is missing;
- package, lockfile, manifest, or package-solution files have unapproved drift.

Non-blocking unrelated source drift should be classified and reported, not silently ignored.

---

## Files to Inspect

Inspect only what is needed to verify a11y/responsive semantics and identify narrow gaps:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccCommandSearch.module.css
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/projectShellViewModel.test.ts
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/config/package-solution.json
```

Do not inspect or edit duplicate/header-card source files unless a drift condition directly requires boundary confirmation. If inspected, do not modify.

---

## Verification Requirements Before Any Edit

Before editing, produce an internal verification finding for each category below.

### 1. Hero region and label

Verify:

- hero root has a stable marker such as `[data-pcc-project-hero-band]`;
- hero root has `role="region"` or equivalent semantic region;
- accessible label is clear and not misleading;
- primary and secondary titles remain visible text;
- heading hierarchy remains logical and does not skip into fake command headings.

### 2. Metadata zones

Verify:

- `[data-pcc-hero-surface-summary]` exists;
- `[data-pcc-hero-summary-item]` items render visible label + value text;
- `[data-pcc-hero-surface-cues]` exists;
- `[data-pcc-hero-surface-cue]` items render visible label + value text;
- `[data-pcc-hero-read-only-cue]` exists and is visible text;
- summary/cue/read-only zones have no interactive descendants.

### 3. Command-search preview

Verify:

- command-search preview remains preview-only;
- no `input`, `button`, `a`, `select`, `textarea`, `[tabindex="0"]`, or `[role="button"]`;
- visible copy communicates unavailable/preview posture;
- compact/icon variant does not imply a usable command control without reason copy.

### 4. Tab / tabpanel semantics

Verify:

- tabs use `role="tab"`;
- tablist uses `role="tablist"`;
- each tab has an ID following the expected shell convention;
- each tab has `aria-controls` pointing to the shell panel;
- shell panel is `main[role="tabpanel"]`;
- shell panel `aria-labelledby` points to the active tab;
- `data-pcc-active-surface-panel` remains on shell main.

### 5. Responsive semantics

Verify the eight supported modes:

```text
phone
tabletPortrait
tabletLandscape
smallLaptop
standardLaptop
largeLaptop
desktop
ultrawide
```

For each mode, verify or confirm existing tests already verify:

- hero root renders with `data-pcc-mode`;
- hero density is `compact` for phone/tabletPortrait/tabletLandscape/smallLaptop;
- hero density is `comfortable` for standardLaptop/largeLaptop/desktop/ultrawide;
- tablist renders and remains visible;
- summary zone renders;
- cue zone renders;
- read-only cue renders;
- command-search renders its expected compact/expanded preview variant;
- no mode-specific marker suggests horizontal overflow, hidden nav, or clipped authority cue.

Do not add visual pixel assertions unless there is a concrete testable defect.

### 6. SharePoint host-fit

Verify from code/CSS:

- no full viewport-height assumption that would conflict with SharePoint page canvas;
- no attempt to hide SharePoint chrome;
- no permanent PCC sidebar introduced;
- no reliance on SharePoint-generated CSS class names;
- no fixed-position overlay that would fight SPFx page layout;
- no package/manifest/page-host changes.

---

## Authorized Source Changes

### Default expectation

No runtime source or CSS changes are expected.

### Runtime/CSS changes are allowed only for verified defects

Authorized files, only if a concrete defect is found:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccCommandSearch.module.css
```

Allowed reasons:

- missing or misleading region label;
- missing visible read-only/source/authority boundary text;
- summary/cue/read-only zones not screen-reader-visible;
- false interactive affordance in command-search preview;
- compact-mode responsive defect traceable to current CSS;
- clipped/hidden authority cue caused by current hero CSS;
- focusability/interactivity accidentally introduced.

Not allowed:

- general visual redesign;
- changing metadata content for polish;
- changing the hero layout hierarchy without a defect;
- changing tabs/shell/bento primitives;
- adding new metadata fields;
- adding command behavior.

If no verified defect exists, do not edit runtime or CSS files.

---

## Authorized Test Changes

Test changes are allowed if they close verified coverage gaps.

Expected candidate files:

```text
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
```

Add or update tests only if existing coverage is missing.

### Test coverage to confirm or add

1. Hero region has expected role and accessible label.
2. Hero root exposes expected `data-pcc-mode` and density markers across all eight responsive modes.
3. Compact modes render summary, cue, read-only, and command-search preview zones.
4. Comfortable modes render summary, cue, read-only, and command-search preview zones.
5. Summary/cue/read-only zones have no interactive descendants.
6. Command-search preview has no interactive/focusable descendants.
7. Tablist/tab/tabpanel semantics still pass for all eight surfaces.
8. Ordered summary/cue ID lists still match metadata after tab switching.
9. No test expects duplicate/header-card removal.

Prefer extending existing tests over adding new files.

---

## Specific Recommended Test Hardening

Perform these only if not already covered:

### A. Responsive metadata zones per mode

In `PccProjectHeroBand.test.tsx` or `PccShell.responsive.test.tsx`, add one compact looped test over all eight responsive modes proving:

- `[data-pcc-project-hero-band]` has matching `data-pcc-mode`;
- `[data-pcc-hero-surface-summary]` exists;
- `[data-pcc-hero-surface-cues]` exists;
- `[data-pcc-hero-read-only-cue]` exists;
- `[data-pcc-hero-command-search]` exists;
- density marker matches expected compact/comfortable classification.

Do not duplicate an existing test if it already asserts those items.

### B. Hero region accessible label

If not already covered, add one test asserting:

- hero root has `role="region"`;
- accessible label / `aria-label` contains `Project` or `Control Center` and is not empty.

### C. Compact command-search variant

If not already covered, assert compact modes render the icon/compact command-search preview and comfortable modes render expanded preview.

Prompt 03 may already cover this. Do not duplicate if covered.

---

## Explicitly Prohibited

Do **not**:

- remove, demote, rename, reorder, or modify duplicate/header cards;
- edit Project Home card/surface files;
- add Project Home facts/counts to shell metadata;
- add Site Health `Overall`, last-run, warning, or failing-check metrics to shell metadata;
- add `surfaceSubtitle`, `surfaceStatusFacts`, `surfaceCommandSummary`, `surfaceCommandActions`, or any new metadata field;
- implement module launcher behavior;
- implement command routing;
- introduce active module state;
- introduce live fetches, tenant reads, Graph/PnP/Procore calls, or external sync;
- make command-search interactive;
- alter bento composition or bento/layout primitives;
- hide SharePoint chrome or depend on SharePoint-generated CSS class names;
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

## Optional Live Evidence

Only if Playwright/live evidence files or selectors are touched:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

Do not run live evidence for test-only unit/integration hardening unless requested.

---

## Commit Guidance

Do not commit automatically unless the user separately authorizes a commit after reviewing validation.

If no files change, do not commit.

If files change, provide the full Prompt 04 completion report and include a proposed commit summary/description for user approval.

---

## Required Completion Response

```markdown
## Prompt 04 Complete

## Files Changed
- State `None` if no changes were required.

## Accessibility Hardening Summary
- Hero region/label:
- Heading hierarchy:
- Summary/cue/read-only semantics:
- Command-search semantics:
- Tab/tabpanel semantics:

## Responsive Hardening Summary
| Mode | Hero Marker | Density | Summary Zone | Cue Zone | Read-Only Cue | Command Search | Result |
|---|---|---|---|---|---|---|---|
| phone | ... | ... | ... | ... | ... | ... | ... |
| tabletPortrait | ... | ... | ... | ... | ... | ... | ... |
| tabletLandscape | ... | ... | ... | ... | ... | ... | ... |
| smallLaptop | ... | ... | ... | ... | ... | ... | ... |
| standardLaptop | ... | ... | ... | ... | ... | ... | ... |
| largeLaptop | ... | ... | ... | ... | ... | ... | ... |
| desktop | ... | ... | ... | ... | ... | ... | ... |
| ultrawide | ... | ... | ... | ... | ... | ... | ... |

## SharePoint Host-Fit Audit
- Full-height assumptions:
- SharePoint chrome:
- Permanent sidebar:
- SharePoint-generated CSS class dependency:
- SPFx page-canvas compatibility:

## False Affordance Audit
- Command-search preview:
- Summary/cue/read-only zones:
- Any enabled-looking controls introduced:

## Tests Added or Updated
- State `None` if no tests changed.
- If tests changed, list exact files and assertions.

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

## Follow-Up Notes for Prompt 05
- Identify only remaining Phase 03 follow-ups.
- Reconfirm duplicate/header-card removal remains Phase 04.
```
