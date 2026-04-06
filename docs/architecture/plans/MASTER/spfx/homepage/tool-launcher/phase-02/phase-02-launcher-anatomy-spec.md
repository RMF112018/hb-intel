# Phase 02 — Launcher Anatomy and Desktop Skeleton Spec

## 1. Current-State Anatomy Gap

**What the existing shape was doing (Phase 01):**
The live-data path bridged all `LauncherPlatformRecord[]` into a flat `LauncherGroup[]` structure for `HbcLauncherSurface`: featured platforms as one group, workflow shelves as subsequent groups, unshelved platforms as a catch-all. No structural hierarchy — every group rendered identically in the same tile grid. No command band, no utility rail, no visual distinction between featured and secondary platforms.

**What the desktop skeleton needs:**
A 4-region composition where each region has distinct visual weight, data dependencies, and suppression rules:
1. **Command band** — lightweight product identity and utility actions (top)
2. **Flagship stage** — featured platforms at greater visual weight (primary body, ~65%)
3. **Utility rail** — notices, support, access metadata (secondary body, ~35%)
4. **Workflow shelves** — categorized platform groups (below body)

## 2. Region Model

### Region 1: Command Band

| Attribute | Value |
|-----------|-------|
| **Purpose** | Give the launcher a product identity ("Work Hub") and provide entry points for All Platforms, Favorites, Need Help, and future search |
| **Position** | Top of the launcher, full width |
| **Visual weight** | Lightweight — subtle background, compact height (40px min), small text |
| **Suppressible** | Yes — launcher renders without it if omitted |
| **Empty/partial fallback** | Renders title always; utility actions are optional text labels |

### Region 2: Flagship Stage

| Attribute | Value |
|-----------|-------|
| **Purpose** | Feature the most important daily-use platforms with prominent launch cards |
| **Position** | Primary body area, left ~65% when utility rail is present; full width when rail is absent |
| **Visual weight** | Highest within the launcher — larger cards with icon containers, name, and descriptor |
| **Suppressible** | Technically yes, but a launcher with no flagship platforms degrades to shelves-only |
| **Empty/partial fallback** | If no platforms have `isFeatured: true`, the stage is omitted and the body layout collapses to shelves |

### Region 3: Utility Rail

| Attribute | Value |
|-----------|-------|
| **Purpose** | Surface platform notices (outage, maintenance, info), and eventually support/access/favorites |
| **Position** | Secondary body area, right ~35%; suppressed if no content |
| **Visual weight** | Quieter than flagship — subtle border, smaller text, informational tone |
| **Suppressible** | Yes — the body grid collapses to a single-column flagship stage when rail is absent |
| **Empty/partial fallback** | If no active notices exist, the rail is not rendered; body grid becomes single-column |

### Region 4: Workflow Shelves

| Attribute | Value |
|-----------|-------|
| **Purpose** | Organize non-featured platforms by work pattern (People & Payroll, Field & Operations, etc.) |
| **Position** | Below the body area, full width |
| **Visual weight** | Secondary — smaller tiles, category headings, existing `HbcLauncherSurface` grid |
| **Suppressible** | Yes — launcher renders without shelves if all platforms are featured or unshelved |
| **Empty/partial fallback** | If no platforms have `workflowShelf` assigned, shelves section is omitted |

## 3. Required Data per Region

| Region | Data dependency | Source |
|--------|----------------|--------|
| **Command band** | None — static content + future search/action bindings | Component-local |
| **Flagship stage** | `presentation.featuredStage.platforms` — platforms where `isFeatured: true`, sorted by `featuredSortOrder` | `deriveToolLauncherPresentation()` |
| **Utility rail** | `presentation.noticesSummary.activeNotices` — platforms with unexpired notices | `deriveToolLauncherPresentation()` |
| **Workflow shelves** | `presentation.workflowShelves` — platforms grouped by `workflowShelf` field | `deriveToolLauncherPresentation()` |

All data flows through the Phase 01 normalized `LauncherPlatformRecord[]` → `LauncherPresentationModel`. No region depends on raw SharePoint fields.

## 4. Structural Coding Plan

### `LauncherCompositionShell.tsx` (new)

**Location:** `apps/hb-webparts/src/webparts/toolLauncherWorkHub/LauncherCompositionShell.tsx`

**Responsibility:** Desktop layout grid with 4 named region slots. Owns spacing, grid template, and region suppression logic. Accepts `ReactNode` children for each region.

**Key decisions:**
- Body uses CSS Grid `2fr 1fr` when utility rail is present; collapses to `1fr` when absent
- Each region wrapped in a `data-launcher-region` attributed div for testability
- Utility rail rendered as `<aside>` for semantic correctness
- Shell wrapped in `role="region"` with `aria-label` for landmark navigation

### `ToolLauncherWorkHub.tsx` (updated)

**Responsibility:** Data orchestration and region rendering. Calls `deriveToolLauncherPresentation()` once, slices the model into region-specific renders, and passes them to the shell.

**Region renderers:**
- `renderCommandBand()` — static title + placeholder action labels
- `renderFlagshipStage()` — featured platforms as prominent `<a>` cards with icon containers
- `renderUtilityRail()` — notices summary; returns null if no active notices
- `renderWorkflowShelves()` — workflow shelf groups using `HbcLauncherSurface` per shelf

**Config fallback:** Still uses the flat `HbcLauncherSurface` bridge for non-SPFx environments.

## 5. Guardrails

| Must not | Reason |
|----------|--------|
| Regress to equal-weight grouped tile grid for live-data path | The flat bridge is preserved only for the config fallback. Live data uses the 4-region shell. |
| Build fake shell chrome (nav bars, sidebars, footers) | The command band is a lightweight product identity bar inside the webpart, not shell chrome. |
| Let the launcher become a second hero | The flagship stage uses restrained card sizes and subtle backgrounds, clearly subordinate to the Signature Hero zone above. |
| Couple regions to raw SharePoint field names | All regions consume the `LauncherPresentationModel` derived from normalized records. |
| Move business-specific rendering into `@hbc/ui-kit` | The composition shell and region renderers are local to `apps/hb-webparts`. `HbcLauncherSurface` is reused only for workflow shelf tiles. |
| Over-polish individual cards in this prompt | This is the composition skeleton. Card refinement is for Phase 03 (flagship card primitive). |
| Break the config fallback path | Non-SPFx environments still render through the flat `HbcLauncherSurface` bridge. |
