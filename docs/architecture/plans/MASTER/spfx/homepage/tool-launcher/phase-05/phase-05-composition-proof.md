# Phase 05 — Composition Proof

## 1. Workflow Shelf Structure

### How shelves render in the launcher

The workflow shelves occupy the bottom region of the `LauncherCompositionShell`, below the body area (flagship stage + utility rail).

```
LauncherCompositionShell
  ├─ Command band (LauncherCommandBand)
  ├─ Body (2fr / 1fr grid)
  │   ├─ Flagship stage (LauncherFlagshipStage → LauncherFlagshipCard)
  │   └─ Utility rail (LauncherUtilityRail)
  └─ Workflow shelves (LauncherWorkflowShelves → LauncherShelfCard)
```

Each shelf renders as:
- **Heading row** — shelf name (uppercase, 0.78rem, muted) + platform count badge (0.62rem, gray)
- **Card grid** — responsive `auto-fill minmax(180px, 1fr)` with 8px gap
- **Per card** — `LauncherShelfCard` with 40px logo container, platform name, optional descriptor, whole-card `<a>` link

Shelves are separated by the composition shell's `workflowShelves` region gap (16px between the body and shelves, 12px between individual shelves).

### 3-tier visual hierarchy

| Tier | Component | Logo | Layout | Typography | Motion | Grid min |
|------|-----------|------|--------|-----------|--------|----------|
| **Flagship** | `LauncherFlagshipCard` | 56px container | Column | 0.92rem / 650 | Spring (motion.a) | 240px |
| **Shelf** | `LauncherShelfCard` | 40px container | Row | 0.8rem / 600 | CSS transition | 180px |
| **Rail** | `LauncherUtilityRail` sections | — | Stacked | 0.72–0.78rem | None | — |

## 2. Utility-Zone Fit Assessment

### Homepage sequence (top to bottom)

| Zone | Surface | Launcher region |
|------|---------|----------------|
| Zone 1 | Signature Hero | — (above launcher) |
| Zone 2 | Priority Actions Rail | — (sibling in Utility zone) |
| Zone 2 | **Tool Launcher / Work Hub** | All regions below |
| | → Command band | "Work Hub" title, search placeholder, action buttons |
| | → Flagship stage (left ~65%) | Featured platform cards with motion |
| | → Utility rail (right ~35%) | Support & Status sections |
| | → Workflow shelves (full width) | Secondary platform groupings |
| Zone 3 | Discovery | — (below launcher) |
| Zone 4 | Communications | — |
| Zone 5 | Operational | — |

### Hierarchy assessment

- **Shelves do not overshadow the flagship stage** — 8 structural differentiators (layout direction, logo size, typography, border, padding, motion, CTA, grid density) ensure shelves read as secondary inventory
- **Shelves do not compete with the utility rail** — shelves are platform cards; the rail is support metadata. Different content types prevent visual confusion
- **Shelves do not compete with the Signature Hero** — the launcher's outer container (subtle border, card-radius, semi-transparent background) keeps it clearly subordinate to the hero
- **No faux shell behavior** — no navigation, breadcrumbs, or sidebar elements in the shelf area
- **No grouped-tile regression** — shelf cards are individually rendered `LauncherShelfCard` instances with logo resolution, not `HbcLauncherSurface` icon tiles

## 3. Remaining Visual Debt

| Debt | Phase | Description |
|------|-------|-------------|
| All-platforms overlay/drawer | Phase 06 | "All Platforms" button in command band is disabled; unshelved/unfeatured platforms need a browsable index |
| Responsive shelf layout | Phase 07 | Desktop-only grid; tablet/mobile breakpoints not implemented |
| Advanced search | Phase 08 | No search within or across shelves |
| Real logo asset deployment | Ops | Manifest logo paths not yet deployed to HBCentral |
| Shelf sort order field | Future | Shelves sort alphabetically; editorial sort order would require a list-level field |
| Shelf description/subtitle | Future | No shelf-level description metadata |
| Show more / collapse toggle | Future | Large shelves render all platforms; no overflow control |
| Shelf-level notice aggregation | Future | Notices in utility rail only; no per-shelf maintenance indicator |
| Favorites / recently-used | Future | No persistence model; not in shelf scope |
| Dark logo variants | Future | `preferDark` parameter exists but unused on light surfaces |

## 4. Risks to Watch

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Shelf cards approaching flagship visual weight** | Medium | 8 structural differentiators prevent this. Adding column layout, CTA rows, or motion to shelf cards would collapse hierarchy. |
| **Too many shelves creating scroll fatigue** | Medium | Currently 4 expected shelves (People & Payroll, Field & Operations, Training & Compliance, Finance & Admin). Adding more shelf values in the list should be monitored for page length impact. |
| **Logo asset sparsity** | Low | All cards (flagship and shelf) currently render with Lucide fallback icons. Until SVG assets are deployed, the visual distinction relies on structural differences rather than brand imagery. |
| **Unshelved platforms invisible** | Medium | Platforms without `workflowShelf` don't appear in shelves or (if not featured) in the flagship stage. Phase 06 all-platforms overlay addresses this. |
| **Bundle size** | Low | 500 KB (up from 475 KB at Phase 01 start). 25 KB growth across 5 phases — proportional to new components. |

## 5. Recommended Next Phase Handoff

### Phase 06 — Overlay Contract and Launcher Index Model

Phase 06 should pick up the all-platforms overlay from here by:

1. **Implementing the "All Platforms" command band action** — wire the `onAllPlatforms` callback in `LauncherCommandBand` to open an overlay/drawer showing the complete platform inventory
2. **Using `presentation.platformIndex`** — the index is already derived by `derivePlatformIndex()` with category-based grouping. The overlay should consume this directly.
3. **Including unshelved platforms** — platforms without `workflowShelf` appear in the platform index under their `category` (or "Other"). The overlay is their primary discovery path.
4. **Supporting search within the overlay** — the overlay should allow filtering by platform name, aliases, and keywords (fields already normalized)
5. **Preserving the shell structure** — the overlay should be rendered as a child of the launcher composition, not as a separate route or page

### Entry conditions for Phase 06

- Phase 05 validation checklist complete (20/20)
- `apps/hb-webparts` builds cleanly
- All 3 launcher card tiers implemented (flagship, shelf, rail sections)
- Workflow shelves rendering from live normalized data with ordering and suppression proven
- `presentation.platformIndex` already available from normalization layer
