# Prompt 04 — My Projects Multi-Platform Launch Expansion | Frontend Multi-Platform Launch UX

## Objective

Update the My Projects frontend from a two-destination launch menu to a four-destination multi-platform launch menu while preserving the current flagship tile/browser composition and accessibility posture.

This prompt owns the UI only.

---

## Mandatory working rules

1. Do not re-read files that remain available in your current context or working memory unless exact lines are needed or source changed.
2. Work from the Prompt 03 repo state.
3. Do not regress current tile-grid, browser, menu-concurrency, escape-dismissal, or focus behavior.
4. Use production-ready user-facing copy only.
5. Keep launch menu order locked:
   1. SharePoint
   2. Procore
   3. BuildingConnected
   4. Document Crunch
6. Available destinations must remain anchors; unavailable destinations remain disabled menu items.
7. Do not introduce a second launch interaction pattern.

---

## Required files to update

At minimum inspect and likely touch:

- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.module.css`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`

Inspect, but change only if necessary:
- `ProjectPortfolioTile.tsx`
- `ProjectPortfolioBrowser.tsx`
- presentation/filter helpers.

---

## Required UI changes

### 1. Masthead support copy

Replace existing dual-platform copy with:

```text
Open assigned projects across SharePoint, Procore, BuildingConnected, and Document Crunch.
```

### 2. Launch menu options

Expand `ProjectLaunchMenu` to render four options in exact order:

1. SharePoint
2. Procore
3. BuildingConnected
4. Document Crunch

Use read-model actions:
- `row.buildingConnectedAction`
- `row.documentCrunchAction`

### 3. Unavailable/invalid aria labels

Use meaningful unavailable copy.

Recommended:

- BuildingConnected empty:
  - `BuildingConnected unavailable for this project.`
- BuildingConnected invalid:
  - `BuildingConnected unavailable due to an invalid launch URL.`
- Document Crunch empty:
  - `Document Crunch unavailable for this project.`
- Document Crunch invalid:
  - `Document Crunch unavailable due to an invalid launch URL.`

### 4. Consolidated unavailable hint

Replace current platform-specific unavailable hint fragments with one consolidated scalable hint that derives the missing launch destinations from the current item set.

Recommended exact prefix:

```text
Some assigned projects do not currently have launch destinations for:
```

Append a comma-separated platform list.

Examples:
- `Some assigned projects do not currently have launch destinations for: SharePoint, BuildingConnected.`
- `Some assigned projects do not currently have launch destinations for: Document Crunch.`

### 5. CSS posture

Inspect `ProjectLaunchMenu.module.css`.

Only adjust styles if the four-option menu needs:
- width increase,
- spacing improvement,
- overflow posture adjustment.

Do not redesign unrelated surfaces.

---

## Required tests

Update frontend tests to cover:

- four menu options exist in correct order,
- available BuildingConnected link opens as safe external anchor,
- available Document Crunch link opens as safe external anchor,
- unavailable BuildingConnected renders disabled button,
- unavailable Document Crunch renders disabled button,
- invalid warnings affect aria-label copy where available,
- updated masthead copy,
- consolidated hint,
- current single-open-menu behavior remains intact,
- browser/tile composition remains intact.

---

## Required validation

Run:
- My Projects card/menu tests,
- any affected browser/tile tests,
- relevant My Dashboard package typecheck if present,
- Prettier.

---

## Required closeout

Return exactly:

# Prompt 04 Closeout — Frontend Multi-Platform Launch UX

## 1. Executive Verdict
State whether the UI now exposes all four launch destinations.

## 2. Files Changed
Path + summary + reason.

## 3. UX Behavior Implemented
List:
- menu options,
- copy changes,
- consolidated hint behavior.

## 4. Accessibility Preservation
State what focus/menu/ARIA behavior was preserved.

## 5. Test Results
Exact commands and outcomes.

## 6. Remaining Work for Prompt 05
State the fixture/test/doc hardening left.
