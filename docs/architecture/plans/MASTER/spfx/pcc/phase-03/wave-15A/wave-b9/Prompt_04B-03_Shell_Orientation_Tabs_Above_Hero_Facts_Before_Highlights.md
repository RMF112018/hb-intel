# Prompt 04B-03 — Shell Orientation Remediation: Tabs Above Hero and Hero Facts Before Highlights

## Objective

Rearrange the PCC shell layout so the selected-surface navigation row becomes the first PCC shell component, followed by the shell hero, followed by the active surface bento grid.

Also reorder the internal hero sections so the project facts row appears before the production highlights / governance microcopy band.

This prompt is a **layout/orientation remediation prompt**. It is not a copy rewrite, not a bento composition prompt, not a duplicate-card removal prompt, and not a data/model integration prompt.

Primary target:

```text
Current shell order:
Hero
Tabs
Bento grid

Target shell order:
Tabs
Hero
Bento grid
```

Primary hero-internal target:

```text
Current hero internal order after surface title:
Hero highlights / governance microcopy
Project facts

Target hero internal order after surface title:
Project facts
Hero highlights / governance microcopy
```

Using the current Project Home example, the target internal hero order is:

```text
Client / Location / Estimated Value / Scheduled Completion / Project Stage
Priority Actions / Approvals / Setup Gaps
Read-only preview / Review blocking signals...
```

---

## Product Direction

The tabs are the user’s primary orientation control. They should appear first in the PCC shell, immediately under the SharePoint page chrome / page command area, before the hero content that changes based on the selected tab.

The hero then explains the currently selected tab and gives project context and selected-surface highlights.

The bento grid then provides the operational content for the selected tab.

Ownership model after this prompt:

```text
Native SharePoint chrome = persistent project/site identity
PCC tab row = primary PCC surface navigation
PCC hero = selected tab context, project facts, production highlights, reminders, governance microcopy
PCC bento grid = active surface operational content
```

---

## Current Baseline

Expected recent runtime baseline includes Prompt 04B-02 commit:

```text
50b0ff4203b986c91d6a195c55a5d93628d6371a
```

Known state after 04B-02:

- The visible hero scaffold labels were replaced:
  - `MODE / SOURCE / AUTHORITY`
  - `FOCUS / BOUNDARY / POSTURE / HBI`
  - long primary read-only cue
- The shell hero now renders:
  - typed `heroHighlights`;
  - typed `governanceMicrocopy`;
  - existing project facts row including Client;
  - command search preview;
  - selected-surface identity.
- Legacy `surfaceSummaryItems`, `surfaceCues`, and `readOnlyCue` remain in metadata for governance-contract tests.
- Project Home bento starts with Priority Actions after Prompt 04B-01.
- Bento composition is unchanged by Prompt 04B-02.
- Current visible shell order still appears to be:
  - hero first;
  - tab row second;
  - active surface bento third.
- Current hero internal order appears to be:
  - highlights / governance microcopy first;
  - project facts second.

A package/version-only deployment bump may exist. Treat it as acceptable only if it is already reviewed and contains no unreviewed runtime/source/test drift beyond package/version files.

---

## Common Local-Agent Directive

You are operating inside the local `hb-intel` repo.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

Use current repo truth. Do not rely on prompt history where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, tab/tabpanel accessibility, shell-owned active-panel semantics, bento direct-child invariants, package/lockfile/manifest safety, and the existing `PccBentoGrid` / `PccDashboardCard` contracts.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

Do not implement Phase 05 module launcher, URL routing, command routing, active module state, live integrations, writeback, tenant mutations, external API calls, or broad redesign.

---

## Strict Scope

This prompt may edit only files required to change shell/hero layout order and associated tests.

Expected runtime/style files:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
```

Only edit `PccHorizontalTabs` files if required to preserve spacing, host-fit, focus order, or responsive layout after moving the tab row.

Expected test files:

```text
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
```

Do not edit:

```text
apps/project-control-center/src/surfaces/**
apps/project-control-center/src/layout/**
apps/project-control-center/src/preview/projectShellViewModel.ts
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
e2e/pcc-live/**
playwright.pcc-live.config.ts
docs/**
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
package.json
apps/project-control-center/package.json
pnpm-lock.yaml
```

If metadata, view-model, surface runtime, package, manifest, or lockfile changes appear necessary, stop and report.

---

## Required Baseline Commands

Run and record before editing:

```bash
git status --short
git branch --show-current
git log -1 --pretty='%H %s'
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Inspect and record current package posture:

```text
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
```

Hard stop if the working tree is dirty in shell, shared tests, package, manifest, or lockfile files unless the user has explicitly identified those files as intentional and in-scope.

---

## Required Reads

Inspect current files before editing:

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
```

---

## Required Searches

Run and classify results:

```bash
rg -n "PccProjectHeroBand|PccHorizontalTabs|pcc-active-surface-panel|data-pcc-project-hero-band|data-pcc-horizontal-tabs|role=\"tablist\"|role=\"tabpanel\"" apps/project-control-center/src/shell apps/project-control-center/src/tests
rg -n "data-pcc-hero-facts|data-pcc-hero-highlights|data-pcc-hero-governance-microcopy|grid-template-areas|facts|highlights|microcopy" apps/project-control-center/src/shell apps/project-control-center/src/tests
rg -n "hero before|tabs before|tab row|surface tabs|PccShell.*hero|PccShell.*tabs|data-pcc-active-surface-panel" apps/project-control-center/src/tests
rg -n "SURFACES_WITH_COMPATIBILITY_CARD|SURFACES_WITH_SHELL_ONLY_PANEL|direct child|bento" apps/project-control-center/src/tests
```

Classify each relevant result as:

```text
SHELL ORDER CONTRACT
HERO INTERNAL ORDER CONTRACT
A11Y / TAB CONTRACT
BENTO INVARIANT CONTRACT
RESPONSIVE CONTRACT
HISTORICAL COMMENT ONLY
```

---

## Required Design Decision

Before editing, determine and report the minimal implementation path.

### Preferred Path A — Reorder existing components in `PccShell`

Move the existing tab row render block above the existing `PccProjectHeroBand` render block.

Target DOM order within the PCC shell:

```text
PccHorizontalTabs / tablist
PccProjectHeroBand / hero region
main role="tabpanel" / active surface bento content
```

This should be a composition-order change, not a semantic rewrite.

### Hero-internal Path

In `PccProjectHeroBand`, reorder the existing render sections after the surface identity row so the facts `<dl data-pcc-hero-facts>` renders before:

```text
[data-pcc-hero-highlights]
[data-pcc-hero-governance-microcopy]
```

Target hero section order:

```text
Identity / selected surface title / description / command search
Project facts row
Production highlights row
Governance microcopy row
```

If command search currently sits in the identity row at the right, preserve that placement unless current responsive behavior proves it must be moved.

### Prohibited Path

Do not introduce a second tab row.

Do not duplicate the hero.

Do not move the bento grid above the hero.

Do not change hero copy, metadata, highlight values, governance microcopy values, project facts, command search copy, or surface labels.

Do not change active-surface state ownership.

---

## Required Shell-Level Outcome

After this prompt, the visible PCC shell order must be:

```text
Tabs
Hero
Bento grid
```

The tab row must remain:

- keyboard accessible;
- visually clear;
- horizontally scrollable or responsive as currently supported;
- not sticky or fixed unless it already was;
- not dependent on SharePoint generated classes;
- not placed inside the active surface `main[role="tabpanel"]`.

The active surface `main` must remain:

```text
id="pcc-active-surface-panel"
role="tabpanel"
aria-labelledby="pcc-tab-${activeSurfaceId}"
data-pcc-active-surface-panel="${activeSurfaceId}"
```

Each tab must preserve:

```text
role="tab"
aria-selected
aria-controls="pcc-active-surface-panel"
id="pcc-tab-${surfaceId}"
```

---

## Required Hero-Internal Outcome

After this prompt, the hero content order must be:

```text
Identity / title / description / command search
Project facts
Production highlights
Governance microcopy
```

For the current Project Home example, the visible order should be:

```text
Client | Location | Estimated Value | Scheduled Completion | Project Stage
Priority Actions | Approvals | Setup Gaps
Read-only preview | Review blocking signals before the next coordination meeting.
```

The facts row remains global for now unless a later prompt changes surface-specific fact behavior.

Do not change the content of:

```text
Client
Location
Estimated Value
Scheduled Completion
Project Stage
heroHighlights
governanceMicrocopy
Command Search — Preview
```

This prompt changes order only.

---

## Responsive Requirements

Verify the new shell order and hero-internal order across all eight PCC responsive modes:

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

Responsive behavior should remain host-fit:

- no `100vh` / full-viewport assumptions;
- no fixed/sticky overlays introduced;
- no SharePoint chrome hiding;
- no permanent sidebar assumptions;
- no dependency on SharePoint-generated CSS class names;
- no horizontal overflow caused by moving tabs above hero;
- command search still switches between supported compact/expanded variants as already tested.

If moving tabs above the hero causes compact-mode crowding, adjust only spacing/wrapping in shell/tab CSS. Do not redesign the hero or bento cards.

---

## Accessibility Requirements

The visual reorder must preserve or improve reading/focus order:

```text
tablist -> selected surface hero region -> active tabpanel
```

Required accessibility checks:

- `PccHorizontalTabs` remains a `role="tablist"`.
- Each tab remains keyboard navigable per existing behavior.
- Active tab state remains visible and exposed through `aria-selected`.
- Shell hero remains `role="region"` with accessible label.
- Active surface `main` remains `role="tabpanel"` and is labelled by the active tab.
- No new interactive descendants are introduced inside the hero highlights/facts/microcopy zones.
- Command search remains preview-only and inert.

---

## Required Tests

Update or add tests to prove the new order without weakening existing contracts.

### Shell DOM order

Add a test asserting DOM/source order within the shell:

```text
[data-pcc-horizontal-tabs] appears before [data-pcc-project-hero-band]
[data-pcc-project-hero-band] appears before #pcc-active-surface-panel
```

If `PccHorizontalTabs` does not currently expose a stable marker, add one such as:

```text
data-pcc-horizontal-tabs=""
```

to the tablist wrapper or component root, and use it in tests.

Do not rely on CSS class names for this assertion.

### Hero internal DOM order

Add a test asserting:

```text
[data-pcc-hero-facts] appears before [data-pcc-hero-highlights]
[data-pcc-hero-highlights] appears before [data-pcc-hero-governance-microcopy]
```

Use DOM `compareDocumentPosition` or an existing helper. Do not rely on visual screenshot matching.

### Existing contract preservation

Update existing tests only as required by the new ordering.

Preserve or update assertions for:

- selected tab switching changes hero title/highlights;
- command search preview inertness;
- hero facts still render Client and project facts;
- hero highlights still render production copy;
- governance microcopy still renders;
- tab/tabpanel aria wiring remains intact;
- direct-child bento invariants remain intact;
- shell-only / compatibility-card split remains unchanged.

### Responsive order coverage

Extend the existing eight-mode shell responsive test, or add a sibling `it.each(PCC_RESPONSIVE_MODES)` test, to assert:

```text
tabs before hero before tabpanel
facts before highlights before microcopy
```

at each mode if this can be done without excessive duplication.

If full eight-mode DOM-order testing is too noisy, at minimum:

- assert order once in a standard mode;
- assert zone presence across all eight modes;
- explain why full order assertion is not duplicated across modes.

### Test files likely affected

```text
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
```

Only update other test files if validation proves they assume the old order.

---

## Implementation Requirements

### 1. Keep changes structural and minimal

Use existing components. Do not create new shell primitives unless current structure makes the change unsafe.

### 2. Preserve data markers

Do not remove existing test markers from:

```text
[data-pcc-project-hero-band]
[data-pcc-hero-facts]
[data-pcc-hero-highlights]
[data-pcc-hero-governance-microcopy]
[data-pcc-hero-command-search]
[data-pcc-active-surface-panel]
```

Add a stable tab-row marker if needed:

```text
[data-pcc-horizontal-tabs]
```

### 3. Preserve copy

Do not change text content or metadata values.

### 4. Preserve bento composition

No changes to any surface bento composition.

### 5. Avoid package/doc drift

Do not update docs, package, manifest, lockfile, or Playwright files in this prompt.

---

## Required Verification Matrix

Before and after editing, produce:

| Area | Current order | Target order | Files changed | Test coverage |
|---|---|---|---|---|
| Shell components | Hero -> Tabs -> Bento | Tabs -> Hero -> Bento | | |
| Hero internal sections | Highlights -> Microcopy -> Facts | Facts -> Highlights -> Microcopy | | |
| Tab/tabpanel a11y | Existing | Preserved | | |
| Command search | Existing | Preserved | | |
| Bento composition | Existing | Unchanged | | |
| Responsive modes | Existing | Preserved | | |

---

## Validation

Run after edits:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed source/test files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do not use Jest-only flags such as:

```bash
--runInBand
```

Do not run hosted Playwright unless explicitly authorized by the user.

Because this changes visible shell layout and tab/hero order, closeout must mark hosted runtime evidence as operator-pending if not run.

---

## Hard Stops

Stop and report if:

- moving the tab row above the hero breaks tab/tabpanel aria semantics;
- the tab row must be placed inside `main[role="tabpanel"]` to work;
- responsive layout requires broad redesign beyond spacing/wrapping;
- the hero internal order cannot be changed without rewriting the metadata/view-model seam;
- bento composition would need to change;
- existing shell-only / compatibility-card classifications would need to change;
- command search would become interactive or visually enabled;
- package, manifest, lockfile, docs, or Playwright files would change;
- tests require deleting coverage without replacement.

---

## Closeout Report Requirements

Report:

- files changed;
- shell order before/after;
- hero internal order before/after;
- whether a new tab-row marker was added;
- tab/tabpanel accessibility preservation;
- command-search preservation;
- responsive mode validation;
- tests changed;
- validation results;
- lockfile hash before/after;
- package/manifest status;
- hosted runtime evidence status;
- follow-up prompts still required.

Commit summary draft:

```text
refactor(pcc): place tabs above hero and facts before highlights
```

Commit body should state:

- moved the PCC tab row above the shell hero;
- reordered hero sections so project facts render before hero highlights/governance microcopy;
- preserved hero copy, project facts, highlights, microcopy, command search, tab/tabpanel semantics, and bento composition;
- added or updated tests for DOM order and responsive preservation;
- did not change package/manifest/lockfile;
- hosted/runtime evidence operator-pending if not run.
