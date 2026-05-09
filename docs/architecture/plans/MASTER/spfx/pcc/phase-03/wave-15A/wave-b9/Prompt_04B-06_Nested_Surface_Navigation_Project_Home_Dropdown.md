# Prompt 04B-06 — Nested Surface Navigation: Project Home Dropdown Consolidation

## Objective

Refactor the PCC shell surface navigation so selected secondary/supporting surfaces are accessible through a dropdown under the existing **Project Home** tab.

The tab row should become more compact and hierarchy-aware while preserving direct navigation to Project Home.

Primary target:

```text
Top-level navigation:
Project Home ▾ | Documents | Project Readiness | Approvals

Nested under Project Home:
Team
External Platforms
Settings
Site Health
```

Required behavior:

```text
Hover Project Home  → expose dropdown
Click Project Home  → navigate/select Project Home
Click child item    → navigate/select that child surface
Keyboard support    → preserve accessible navigation and activation
```

This prompt is a **navigation consolidation prompt**. It is not a bento composition prompt, not a hero copy prompt, not a surface-runtime prompt, not a routing prompt, and not a live integration prompt.

---

## Product Direction

The current horizontal tab row gives all eight surfaces equal visual weight. That overstates supporting surfaces and crowds the shell navigation.

The intended hierarchy is:

```text
Primary top-level surfaces:
- Project Home
- Documents
- Project Readiness
- Approvals

Supporting / related project-home surfaces:
- Team
- External Platforms
- Settings
- Site Health
```

`Team`, `External Platforms`, `Settings`, and `Site Health` should remain fully accessible, but they should no longer consume top-level tab-row space.

Project Home becomes a parent navigation item with two behaviors:

1. direct-click target for the Project Home surface;
2. dropdown parent for supporting surfaces.

---

## Current Baseline

Expected recent runtime baseline includes Prompt 04B-03 commit:

```text
836f0ee8113ceb9517242fc87b17d9b5426151db
```

Known state after Prompt 04B-03:

- PCC shell order is:
  ```text
  Tabs → Hero → Bento
  ```
- Hero internal order is:
  ```text
  identity → facts → heroHighlights → governanceMicrocopy
  ```
- Prompt 04B-02 hero content model remains in place:
  - `heroHighlights`
  - `governanceMicrocopy`
  - legacy governance metadata retained for tests
- Project Home starts with Priority Actions.
- Current shell-only / compatibility-card split remains unchanged.
- Existing `PccHorizontalTabs` already exposes `data-pcc-horizontal-tabs`.
- Current tab/tabpanel semantics are implemented through:
  - `role="tablist"`
  - `role="tab"`
  - `aria-selected`
  - `aria-controls="pcc-active-surface-panel"`
  - shell `<main role="tabpanel">`

A package/version-only deployment bump may exist. Treat it as acceptable only if it is already reviewed and contains no unreviewed runtime/source/test drift beyond package/version files.

---

## Common Local-Agent Directive

You are operating inside the local `hb-intel` repo.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

Use current repo truth. Do not rely on prompt history where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, tab/tabpanel accessibility, shell-owned active-panel semantics, bento direct-child invariants, package/lockfile/manifest safety, and the existing `PccBentoGrid` / `PccDashboardCard` contracts.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

Do not implement URL routing, Next/router routing, command routing, active module state, live integrations, writeback, tenant mutations, external API calls, or broad redesign.

---

## Strict Scope

This prompt may edit navigation model, navigation component, navigation styling, and associated tests only.

Expected runtime/style files:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
```

Edit `surfaceHeaderMetadata.ts` or `projectShellViewModel.ts` only if tests require model/type awareness of parent/child navigation. Do **not** change hero copy, highlight copy, governance copy, or project facts.

Expected test files:

```text
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
```

Potential model/test files if the surface list or tab model is centralized:

```text
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/**
apps/project-control-center/src/tests/projectShellViewModel.test.ts
```

Do not edit:

```text
apps/project-control-center/src/surfaces/**
apps/project-control-center/src/layout/**
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
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

If surface runtime, hero band, package, manifest, lockfile, docs, or Playwright changes appear necessary, stop and report.

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

Hard stop if the working tree is dirty in shell navigation, shared tests, packages/models PCC files, package, manifest, or lockfile files unless the user has explicitly identified those files as intentional and in-scope.

---

## Required Reads

Inspect current files before editing:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
packages/models/src/pcc/PccMvpSurfaces.ts
```

Only inspect additional model files if the current surface order/navigation model is not fully defined in `PccMvpSurfaces.ts` or imported model helpers.

---

## Required Searches

Run and classify results:

```bash
rg -n "PccHorizontalTabs|data-pcc-horizontal-tabs|role=\"tablist\"|role=\"tab\"|aria-selected|aria-controls|onSelectSurface|PCC_MVP_SURFACE_IDS|PCC_MVP_SURFACES" apps/project-control-center/src packages/models/src/pcc
rg -n "project-home|team-and-access|external-systems|control-center-settings|site-health|documents|project-readiness|approvals" apps/project-control-center/src/shell apps/project-control-center/src/tests packages/models/src/pcc
rg -n "ArrowRight|ArrowLeft|Home|End|Enter|Space|keyboard|hover|mouseEnter|pointer|tablist|tabpanel" apps/project-control-center/src/tests apps/project-control-center/src/shell
rg -n "SURFACES_WITH_COMPATIBILITY_CARD|SURFACES_WITH_SHELL_ONLY_PANEL|data-pcc-active-surface-panel|direct child|bento" apps/project-control-center/src/tests
rg -n "data-pcc-project-hero-band|data-pcc-hero-highlights|data-pcc-hero-facts|data-pcc-hero-governance-microcopy" apps/project-control-center/src/tests
```

Classify each relevant result as:

```text
NAVIGATION MODEL
TOP-LEVEL TAB CONTRACT
NESTED MENU CANDIDATE
KEYBOARD CONTRACT
ACTIVE-PANEL CONTRACT
BENTO INVARIANT CONTRACT
HERO CONTRACT
HISTORICAL COMMENT ONLY
```

---

## Required Design Decision

Before editing, decide and report the minimal implementation path.

### Preferred Path A — Extend `PccHorizontalTabs` with a typed nested navigation model

Introduce a small typed navigation structure local to the shell/navigation layer or in the existing PCC model file if that is where surface order belongs.

Example target model:

```ts
interface IPccSurfaceNavItem {
  readonly id: PccMvpSurfaceId;
  readonly children?: readonly PccMvpSurfaceId[];
}
```

Target hierarchy:

```ts
const PCC_SURFACE_NAV_ITEMS = [
  {
    id: 'project-home',
    children: [
      'team-and-access',
      'external-systems',
      'control-center-settings',
      'site-health',
    ],
  },
  { id: 'documents' },
  { id: 'project-readiness' },
  { id: 'approvals' },
] as const;
```

Use current display names from `PCC_MVP_SURFACES`.

This is preferred because it keeps the full `PCC_MVP_SURFACE_IDS` list intact for data/model/test coverage, while allowing the visible navigation to be hierarchical.

### Acceptable Path B — Local hierarchy inside `PccHorizontalTabs`

If model package changes are too broad, define the hierarchy in `PccHorizontalTabs.tsx` using existing `PccMvpSurfaceId` types.

This is acceptable only if:

- existing tests remain exhaustive over all eight surfaces;
- surface metadata coverage still uses `PCC_MVP_SURFACE_IDS`;
- navigation tests prove all eight surfaces remain reachable.

### Prohibited Path

Do not remove `Team`, `External Platforms`, `Settings`, or `Site Health` from the application surface model.

Do not hide them permanently.

Do not make Project Home click open only the dropdown; clicking Project Home must still select `project-home`.

Do not replace tab semantics with a generic non-semantic nav bar unless the agent proves the existing `role="tablist"` pattern is invalid for nested navigation and proposes an accessible alternative.

Do not use hover-only access. Hover may open the menu, but keyboard and click/focus access must also work.

---

## Target Visible Navigation

Top-level row:

```text
Project Home ▾ | Documents | Project Readiness | Approvals
```

Dropdown under Project Home:

```text
Team
External Platforms
Settings
Site Health
```

Expected behavior:

| User action | Expected result |
|---|---|
| Click Project Home | Selects/navigates to Project Home |
| Hover Project Home | Opens child dropdown |
| Focus Project Home + ArrowDown | Opens child dropdown and focuses first child, or exposes the child menu in an accessible way |
| Click Team | Selects Team & Access surface |
| Click External Platforms | Selects External Platforms surface |
| Click Settings | Selects Control Center Settings surface |
| Click Site Health | Selects Site Health surface |
| Escape while dropdown open | Closes dropdown and returns focus to Project Home |
| Mouse leave / blur outside | Closes dropdown without changing active surface |
| Active child surface | Project Home parent shows parent-active state; child item shows active state in dropdown |

---

## Accessibility Requirements

The current tab/tabpanel pattern must remain valid.

Preferred semantics:

- top-level visible surface items that select panels remain `role="tab"`;
- Project Home parent tab remains the actual `project-home` tab;
- dropdown child items that select panels must also have a clear accessible relationship to the same active panel.

Before implementation, decide whether child items should be:

### Option 1 — Child items are still tabs

Use `role="tab"` for child items and include them in the roving tab system, even though visually nested.

Requirements:

```text
role="tab"
aria-selected={activeSurfaceId === childId}
aria-controls="pcc-active-surface-panel"
id="pcc-tab-${childId}"
```

Pros:
- preserves tab/tabpanel semantics for all eight surfaces;
- existing `aria-labelledby="pcc-tab-${activeSurfaceId}"` continues to work.

Cons:
- nested tabs inside a dropdown must be carefully handled with keyboard navigation.

### Option 2 — Child items are menuitems that update the active tabpanel

Use a `menu` / `menuitem` pattern inside the dropdown, but still ensure the active tabpanel is labelled correctly when a child is active.

If this option is selected, the implementation must preserve or create an offscreen/stable tab label element for `aria-labelledby="pcc-tab-${childId}"`, or update tabpanel labelling in an equally accessible way.

Pros:
- aligns with dropdown menu expectations.

Cons:
- more complex because the active tabpanel has historically been labelled by a tab id.

Preferred: **Option 1 unless repo truth proves it creates invalid or brittle semantics.**

Do not implement an inaccessible hover-only menu.

---

## Keyboard Requirements

Preserve existing keyboard behavior for top-level tabs:

```text
ArrowRight / ArrowLeft
Home / End
Enter / Space activation
```

Add dropdown keyboard behavior:

```text
ArrowDown on Project Home opens dropdown
Escape closes dropdown
Tab / Shift+Tab do not trap focus
Enter / Space on Project Home still activates Project Home when dropdown is not open
Enter / Space on a child item activates that child surface
ArrowDown / ArrowUp within the dropdown moves among child items if roving focus is implemented
```

Do not break existing navigation tests for top-level tab arrowing.

If full child-menu roving focus is too large for this prompt, implement at least:

- hover opens dropdown;
- focus on Project Home can expose the dropdown;
- Escape closes dropdown;
- child items are reachable by tab key and clickable;
- child item click selects the child surface;
- direct Project Home click selects Project Home.

Report any deferred keyboard enhancement explicitly.

---

## Active-State Requirements

When active surface is `project-home`:

- Project Home top-level tab has `aria-selected="true"`;
- dropdown child items are not active.

When active surface is a child of Project Home:

```text
team-and-access
external-systems
control-center-settings
site-health
```

Expected:

- Project Home parent visually indicates parent-active / child-active state;
- child item visually indicates active state in dropdown;
- active tabpanel remains labelled by the active child surface, not generically by Project Home, unless an accessible alternative is implemented and tested.

Add data markers if needed:

```text
data-pcc-parent-active="true"
data-pcc-nav-child-active="true"
data-pcc-surface-nav-parent="project-home"
data-pcc-surface-nav-child="<surface-id>"
```

Use data markers for tests; do not rely on CSS class names.

---

## Responsive Requirements

The consolidated tab row should improve—not worsen—responsive behavior.

Requirements:

- top-level tab row remains compact across all eight responsive modes;
- dropdown remains usable on phone/tablet/laptop/desktop;
- no horizontal overflow introduced;
- no fixed/sticky overlay introduced;
- no SharePoint chrome hiding;
- no reliance on SharePoint-generated classes;
- dropdown is positioned relative to the Project Home parent and remains within viewport as much as practical;
- if hover is not available on touch, tapping/focusing Project Home or the dropdown trigger must expose the child menu without preventing direct Project Home selection.

Because direct click on Project Home must navigate to Project Home, consider a separate visual caret/dropdown trigger inside the Project Home tab **only if needed** for touch support. If added, it must not look like a separate primary tab and must be accessible.

---

## Implementation Requirements

### 1. Preserve full surface availability

All eight surfaces must remain reachable through UI and tests:

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

### 2. Preserve selected-surface behavior

Selecting any surface must still update:

```text
activeSurfaceId
hero selected surface title/copy/highlights
main[role="tabpanel"]
bento content
active surface marker
```

### 3. Preserve shell and hero order from Prompt 04B-03

Do not move the hero or bento grid.

Target remains:

```text
Tabs
Hero
Bento grid
```

### 4. Preserve hero content from Prompt 04B-02

Do not change:

```text
heroHighlights
governanceMicrocopy
project facts
surface title/descriptions
command search
```

### 5. Preserve bento composition

Do not modify any files under:

```text
apps/project-control-center/src/surfaces/**
```

### 6. Avoid routing

This is selection/state navigation inside the PCC shell, not URL routing.

Do not add route paths, query strings, browser history, Next router calls, or SharePoint navigation links.

---

## Test Requirements

Update or add tests to prove the new navigation hierarchy and preserve existing contracts.

### 1. Top-level navigation shape

Assert visible top-level tab row includes:

```text
Project Home
Documents
Project Readiness
Approvals
```

Assert top-level row no longer directly exposes as peer top-level tabs:

```text
Team & Access
External Platforms
Control Center Settings
Site Health
```

They should be found inside the Project Home dropdown, not as top-level peer tabs.

### 2. Project Home direct click

Assert clicking Project Home selects Project Home and renders Project Home hero/bento.

### 3. Dropdown hover/focus behavior

Assert hovering Project Home exposes dropdown child items:

```text
Team & Access
External Platforms
Control Center Settings
Site Health
```

If testing-library hover support is already used, use it. Otherwise use `fireEvent.mouseEnter`.

Also assert the dropdown closes on mouse leave or Escape.

### 4. Child selection behavior

Assert clicking each child item selects the correct surface:

```text
Team & Access → activeSurfaceId team-and-access
External Platforms → activeSurfaceId external-systems
Control Center Settings → activeSurfaceId control-center-settings
Site Health → activeSurfaceId site-health
```

For each child, assert:

- shell hero secondary title changes correctly;
- `main[role="tabpanel"]` has `data-pcc-active-surface-panel="<child-id>"`;
- child item has active marker when dropdown is open;
- Project Home parent has parent-active marker.

### 5. Keyboard behavior

At minimum assert:

- Project Home remains activatable by Enter/Space;
- ArrowDown on Project Home opens dropdown or exposes children;
- Escape closes dropdown;
- child items can be focused and activated by Enter/Space.

Preserve existing tests for:

```text
ArrowLeft / ArrowRight
Home / End
Enter / Space activation
```

If top-level arrowing now traverses only visible top-level tabs, assert that behavior explicitly.

### 6. Tab/tabpanel ARIA

Preserve or update tests for:

```text
role="tablist"
role="tab"
aria-selected
aria-controls="pcc-active-surface-panel"
main[role="tabpanel"]
aria-labelledby
```

If child items are `role="tab"`, verify each child has the correct id:

```text
pcc-tab-team-and-access
pcc-tab-external-systems
pcc-tab-control-center-settings
pcc-tab-site-health
```

If child items are `menuitem`, verify the active tabpanel labelling remains accessible for child surfaces.

### 7. Responsive coverage

Update existing eight-mode tests to assert:

- tab row renders once at every mode;
- Project Home dropdown mechanism is present at every mode;
- no top-level duplicate child tabs appear at every mode;
- active child selection works in at least one standard mode;
- no bento/direct-child invariant tests are weakened.

### 8. Test files likely affected

```text
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
```

---

## Required Verification Matrix

Before and after editing, produce:

| Area | Current behavior | Target behavior | Files changed | Test coverage |
|---|---|---|---|---|
| Top-level nav shape | 8 peer tabs | 4 top-level tabs + Project Home dropdown | | |
| Project Home click | selects Project Home | unchanged | | |
| Project Home hover | no dropdown | shows child surfaces | | |
| Child selection | child surfaces top-level | child surfaces selectable from dropdown | | |
| Keyboard access | flat tab model | top-level + dropdown keyboard support | | |
| Active state | each tab selected directly | parent-active + child-active for nested surfaces | | |
| Tabpanel labelling | active tab id | preserved or accessible alternative | | |
| Responsive behavior | flat row | nested compact row | | |
| Bento composition | unchanged | unchanged | | |

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

Because this changes visible navigation behavior across PCC surfaces, closeout must mark hosted runtime evidence as operator-pending if not run.

---

## Hard Stops

Stop and report if:

- nested navigation cannot preserve accessible tab/tabpanel semantics;
- Project Home click would no longer select Project Home;
- child surfaces become unreachable without hover;
- keyboard access would be weaker than current flat tabs;
- child active surfaces cannot label the active tabpanel accessibly;
- responsive dropdown behavior requires broad shell redesign;
- surface runtime files need edits;
- hero content or bento composition would need edits;
- package, manifest, lockfile, docs, or Playwright files would change;
- tests require deleting coverage without equivalent replacement.

---

## Closeout Report Requirements

Report:

- files changed;
- implementation path selected;
- top-level navigation before/after;
- nested children under Project Home;
- Project Home direct-click behavior;
- hover/focus/dropdown behavior;
- keyboard behavior;
- active-state behavior for child surfaces;
- tab/tabpanel ARIA preservation;
- responsive behavior;
- tests changed;
- validation results;
- lockfile hash before/after;
- package/manifest status;
- hosted runtime evidence status;
- follow-up prompts still required.

Commit summary draft:

```text
refactor(pcc): nest supporting surfaces under Project Home
```

Commit body should state:

- consolidated Team, External Platforms, Settings, and Site Health under the Project Home dropdown;
- preserved direct Project Home selection on click;
- preserved all eight surface selections;
- preserved tab/tabpanel ARIA or documented accessible alternative;
- preserved Prompt 4B-03 Tabs → Hero → Bento shell order;
- preserved 4B-02 hero content model;
- preserved bento composition;
- added/updated navigation and responsive tests;
- did not change package/manifest/lockfile;
- hosted/runtime evidence operator-pending if not run.
