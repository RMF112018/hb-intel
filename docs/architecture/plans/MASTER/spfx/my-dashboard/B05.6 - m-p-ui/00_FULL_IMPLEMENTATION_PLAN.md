# 00 — Full Implementation Plan  
## My Dashboard → My Projects Flagship UI/UX Rebuild

---

## 1. Objective

Transform the working **My Projects** module into a premium, benchmark-grade personal portfolio launcher that meets the quality posture established by the SPFx UI doctrine, homepage-quality checklist, and flagship scorecard standard.

The final module must:

- provide immediate project-access value;
- reduce vertical bloat;
- materially improve project-item composition;
- make project name and number easy to scan;
- preserve SharePoint and Procore launch behavior;
- replace persistent dual-button rows with a cleaner action menu model;
- replace infinite inline expansion with a professional full-portfolio browser;
- include search by project name and project number;
- handle realistic nested widths, handheld states, and short-height states;
- close with test evidence and hosted proof.

---

## 2. Design problem being solved

The current module works, but the resting experience is still below flagship quality because:

1. The KPI strip consumes vertical space without meaningful end-user value.
2. The `Launch List` wrapper reads as scaffolding rather than productized UI.
3. Each project row is too tall because it permanently reserves space for two large buttons.
4. Project source/provenance pills are visually prominent despite low user value.
5. The project number is too disconnected from the project name, reducing scan efficiency.
6. Project item content clusters in the top-left, creating poor spatial balance.
7. Inline full-list disclosure can over-expand the card and distort adjacent bento layout.
8. Existing tests currently lock several of these weak decisions into place.

---

## 3. Final target state

### 3.1 Card-level target state

The My Projects card becomes:

- **Eyebrow:** `My Portfolio`
- **Title:** `My Projects`
- **Description:** `Open assigned projects in SharePoint or Procore.`
- **No KPI strip**
- **No Launch List label**
- **Refined state notice** only when degraded/partial state requires it
- **Compact project tile grid**
- **View all projects** opens a dedicated portfolio browser overlay when item count exceeds the mode-specific visible count

### 3.2 Project tile target state

Each project tile must contain:

1. **Identity block**
   - project name — primary
   - project number — near-primary, directly adjacent to the name

2. **Supporting context**
   - project stage, when present
   - one primary role chip by default
   - `+N` role overflow trigger for additional roles

3. **Action affordance**
   - single `Open` trigger
   - opens SharePoint / Procore destination menu
   - unavailable options remain truthful and non-linking

4. **Removed**
   - visible `Legacy Folder`, `Site + Legacy`, and `Project Site` source pills

### 3.3 Full portfolio browser target state

When the project list exceeds the visible resting-state count:

- Render a `View all projects` control.
- Open a **responsive modal portfolio browser overlay**.
- Desktop/tablet landscape: right-side drawer/panel presentation.
- Tablet portrait/phone/short-height: full-screen modal sheet.
- Include:
  - search input;
  - immediate filtering by project name and project number;
  - all project tiles/rows with the same launch action capability;
  - no-results state;
  - close control;
  - focus management and Escape handling.

### 3.4 Display sort target state

Use a **UI presentation sort** for rendered project order:

1. `projectName` alphabetical, case-insensitive;
2. `projectNumber` ascending;
3. `recordKey` ascending.

Do not modify backend provider sorting in this effort. The UI may derive the display sequence from the already returned items.

---

## 4. Architecture approach

### 4.1 Keep the card shell thin

`MyProjectsHomeCard.tsx` should become an orchestrator rather than a monolithic render sink. It should own:

- data loading;
- state selection;
- presentation sort;
- visible/full list branching;
- browser-open state;
- high-level composition.

### 4.2 Introduce focused local primitives

Create the following module-local components:

- `ProjectPortfolioTile.tsx`
- `ProjectLaunchMenu.tsx`
- `ProjectPortfolioBrowser.tsx`

Create the following support helper:

- `myProjectPortfolioPresentation.ts`

Suggested tests:

- `ProjectLaunchMenu.test.tsx`
- `ProjectPortfolioBrowser.test.tsx`
- `myProjectPortfolioPresentation.test.ts`
- update `MyProjectsHomeCard.test.tsx`

### 4.3 Styling ownership

Use local CSS modules:

- `ProjectPortfolioTile.module.css`
- `ProjectLaunchMenu.module.css`
- `ProjectPortfolioBrowser.module.css`

Retain `MyProjectsHomeCard.module.css` for card-level composition, state notices, grid wrapper, and high-level spacing.

---

## 5. Locked user-facing copy

### Card

| Region | Final copy |
|---|---|
| Eyebrow | `My Portfolio` |
| Title | `My Projects` |
| Description | `Open assigned projects in SharePoint or Procore.` |
| Overflow CTA | `View all projects` |
| Browser title | `All My Projects` |
| Search placeholder | `Search by project name or number` |
| Search empty | `No projects match your search.` |

### Preserve existing state-copy semantics, but upgrade presentation

The existing text for loading, empty, partial, source-unavailable, backend-unavailable, principal-unresolved, and bounded-source states should remain truthful. Visual presentation should be upgraded, but copy should not be casually rewritten unless a prompt explicitly identifies a small clarity improvement and tests are updated accordingly.

---

## 6. Action model

### 6.1 Resting tile

Each tile includes one `Open` trigger.

### 6.2 Menu contents

Menu must contain:

- SharePoint action:
  - label comes from `row.sharePointAction.label`
  - available => anchor
  - unavailable => disabled/non-linking option with explanation

- Procore action:
  - label `Open Procore` when available
  - unavailable => disabled/non-linking option with explanation

### 6.3 Menu behavior

- Only one launch menu open at a time within the card/browser context.
- `Enter` / `Space` opens menu.
- `ArrowDown` / `ArrowUp` navigates menu options.
- `Escape` closes menu and restores focus to trigger.
- Outside click closes menu.
- Focus-visible states are explicit and premium.
- Menu positions with `@floating-ui/react`.

---

## 7. Premium-stack implementation decisions

Add and use the following dependencies in `apps/my-dashboard/package.json` if not already available to this package:

- `@floating-ui/react` — anchored action menus
- `@radix-ui/react-tooltip` — compact unavailable-action explanations
- `@radix-ui/react-separator` — refined menu/browser rhythm
- `@radix-ui/react-scroll-area` — full portfolio browser list treatment
- `class-variance-authority` — tile/menu/state variants
- `clsx` — class composition
- `lucide-react` — menu, search, launch, close icons where useful
- `motion` — subtle premium transitions and reduced-motion-aware animations

Do not add `@radix-ui/react-slot` solely for symbolic stack adoption in this module.

---

## 8. Responsive and shell-fit contract

### Resting card visible counts

| Mode | Visible project count |
|---|---:|
| phone | 3 |
| tabletPortrait | 4 |
| tabletLandscape | 4 |
| smallLaptop | 4 |
| standardLaptop | 6 |
| largeLaptop | 6 |
| desktop | 6 |
| ultrawide | 6 |

### Grid contract

| Mode | Resting card grid |
|---|---|
| phone | 1 column |
| tabletPortrait | 1 column |
| tabletLandscape | conditional 2-column only if stable; otherwise 1 |
| smallLaptop | conditional 2-column only if stable; otherwise 1 |
| standardLaptop | 2 columns |
| largeLaptop | 2 columns |
| desktop | 2 columns |
| ultrawide | 2 columns |

Use container-aware/nested-mode behavior available from the current bento context rather than relying only on viewport media queries.

---

## 9. Existing semantics to preserve

- Existing read-model source statuses and banner semantics.
- Existing unavailable-link honesty.
- Existing role display labels and priority order.
- Existing home-surface card order and spans.
- Existing SharePoint Site vs Folder distinction in action labels.
- Existing actor/project assignment behavior and backend runtime.

---

## 10. File change plan

### Existing files likely modified

- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.module.css`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.test.tsx`
- `apps/my-dashboard/package.json`
- workspace lockfile if dependency resolution requires it

### New files expected

- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioTile.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioTile.module.css`
- `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.module.css`
- `apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.test.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.tsx`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.module.css`
- `apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.test.tsx`
- `apps/my-dashboard/src/modules/myProjects/myProjectPortfolioPresentation.ts`
- `apps/my-dashboard/src/modules/myProjects/myProjectPortfolioPresentation.test.ts`

---

## 11. Validation baseline

At minimum, the final implementation must pass:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard lint
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
```

Prompt-specific validations may run narrower tests first, but the final closeout must execute the full module package validation set above.

---

## 12. Hosted evidence baseline

Capture before closure:

- standard laptop hosted view;
- desktop hosted view;
- tablet landscape hosted view;
- tablet portrait hosted view;
- phone portrait hosted view;
- phone landscape or short-height constrained view;
- normal view and SharePoint edit-mode view where practical;
- open project launch menu evidence;
- open full portfolio browser evidence;
- search result and no-result evidence.

---

## 13. Acceptance criteria

The work is closed only when:

1. The card no longer renders KPI tiles.
2. The card no longer renders `Launch List`.
3. The eyebrow reads `My Portfolio`.
4. Source/provenance pills are removed from project tiles.
5. Project name and project number form a clear paired scan block.
6. Supporting content is spatially balanced and no longer concentrated in one top-left cluster.
7. Persistent dual-button rails are replaced by an explicit Open menu.
8. Full-project overflow uses a modal portfolio browser, not inline card expansion.
9. Search filters by project name and project number.
10. UI display order is recognition-first.
11. Loading/empty/degraded states remain truthful and visually upgraded.
12. Tests enforce the new DOM/interaction contract.
13. Build/lint/type/test commands pass.
14. Hosted evidence is captured.
