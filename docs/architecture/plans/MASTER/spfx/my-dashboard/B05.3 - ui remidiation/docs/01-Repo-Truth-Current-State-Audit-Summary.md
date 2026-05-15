# 01 — Repo-Truth Current-State Audit Summary

## Audit Scope Captured in This Package

This package was authored from repo-truth inspection of the My Dashboard runtime architecture and the rendered screenshots supplied on 2026-05-15. The package assumes current `main` may have moved by the time the local agent executes it, so **Prompt 00** requires drift verification before edits.

## Primary Repo Truth Findings

### 1. App Mount and Shell Ownership

`MyDashboardApp.tsx` mounts:

- `MyWorkReadModelClientProvider`
- `MyWorkShell`

This makes the shell the dominant UI/posture owner.

### 2. Shell Holds Active Surface + Module State

`MyWorkShell.tsx` establishes:

- active primary surface state;
- active module state;
- `viewState: 'home' | 'focused-module'`;
- a command surface containing navigation and hero;
- bento-grid composition for the active panel.

### 3. Visible Tab + Module Dropdown Navigation Is Deliberate

`MyWorkPrimaryNavigation.tsx` renders:

- a `role="tablist"` root;
- a primary "My Work Home" tab;
- a launcher toggle button;
- a dropdown module menu;
- per-module state labels and summaries.

The rendered dropdown is not incidental; it is core to the present product model.

### 4. Focused Adobe Routing Is Deliberate

`MyWorkSurfaceRouter.tsx` branches:

- default → `MyWorkHomeSurface`
- Adobe module ID → `AdobeSignActionQueueModuleSurface`

This creates a route-like focused module experience inside My Dashboard.

### 5. Hero Is a High-Salience Runtime Telemetry Layer

`MyWorkHeroBand.tsx` + `myWorkHeroViewModel.ts` compose:

- identity titles;
- long description;
- four highlights;
- governance microcopy.

Home highlights include:
- actionable items;
- connected sources;
- source health;
- last refreshed.

Focused Adobe highlights include:
- queue state;
- pending items;
- last refreshed;
- action system.

### 6. Home Surface Fragments State Based on Readiness Variant

`MyWorkHomeSurface.tsx` currently renders:

**Ready variant**
- `MyProjectsHomeCard`
- `WorkSummaryCard`
- `AdobeSignActionQueueHomeCard`

**Non-ready variant**
- `MyProjectsHomeCard`
- `WorkSummaryCard`
- `AdobeSignQueueStateCard`
- `SourceReadinessCard`

The non-ready path is especially responsible for the "developer first" feel.

### 7. Adobe Sign Is Split Across Several UI Components

Current Adobe-related UI components include:

- `AdobeSignActionQueueHomeCard.tsx`
- `AdobeSignQueueStateCard.tsx`
- `AdobeSignActionQueueModuleSurface.tsx`
- `AdobeSignConnectionGuidanceCard.tsx`
- `AdobeSignQueueSummaryCard.tsx`
- `AdobeSignAgreementActionListCard.tsx`

These components collectively express one module, but the end user experiences them as fragmented surfaces.

### 8. My Projects Is Explicitly Full Width

`MyProjectsHomeCard.tsx` renders:

- `footprint="full"`

The footprint resolves to:
- 12 columns on large laptop / desktop / ultrawide;
- 10 columns on standard laptop.

This matches the screenshots where My Projects dominates the page.

### 9. Grid Primitives Are Strong Enough; Choreography Is the Problem

`MyWorkBentoGrid.tsx`, `MyWorkCard.tsx`, and `myWorkFootprints.ts` provide:

- responsive column system;
- card footprint model;
- span overrides;
- reusable card wrapper.

The package therefore **does not** require replacing the grid system. It requires recomposing content and adjusting spans.

### 10. Source-State Copy Is Well-Defined but Overexposed

`myWorkCardViewModel.ts` contains a closed source-status mapping for:

- available;
- partial;
- configuration-required;
- authorization-required;
- principal-unresolved;
- source-unavailable;
- backend-unavailable.

This mapping should be preserved as a truth source, but the UI should present it inside module cards, not across the page as separate surfaces.

## Direct Architectural Cause of the Current UI Posture

The current interface feels like a developer-first validation environment because the architecture visible to the user is organized around:

1. shell navigation;
2. route focus;
3. status narration;
4. card fragmentation;
5. oversized empty-state footprints.

The implementation package resets those choices without discarding the sound underlying technical boundaries.
