# Phase 11A — Tool Launcher Rebuild Change Boundaries

## Purpose

This document defines what the Tool Launcher rebuild workstream (Phases 11B–11H) is allowed to change, what must be preserved, what is explicitly out of scope, and what package/runtime/authoring constraints cannot be violated.

---

## What later phases are allowed to change

### Visual components (full replacement authorized)
- `LauncherCompositionShell.tsx` — replace with CVA-driven composition shell
- `LauncherCommandBand.tsx` — replace with premium search/command surface
- `LauncherFlagshipStage.tsx` — replace with premium featured stage
- `LauncherFlagshipCard.tsx` — replace with CVA-driven flagship card
- `LauncherWorkflowShelves.tsx` — replace with premium shelf layout
- `LauncherShelfCard.tsx` — replace with CVA-driven shelf card
- `LauncherUtilityRail.tsx` — replace with premium support/status surface
- `LauncherAllPlatformsOverlay.tsx` — replace with @floating-ui-driven overlay
- `LauncherIndexRow.tsx` — replace with deliberate compact row
- All inline style dictionaries in component files

### Style system
- Replace inline `React.CSSProperties` dictionaries with CVA variants + clsx
- Introduce CSS modules or Tailwind-equivalent class composition if needed
- Extend or supplement existing `HP_*` design tokens where launcher-specific tokens are justified

### Icon and asset resolution (extension authorized, replacement cautious)
- `launcherIconResolution.ts` — may extend icon maps and tint maps for new categories
- `launcherAssetResolution.ts` — may externalize the inline asset manifest; logo cascade logic should be preserved

### Search UX (rebuild authorized)
- `launcherSearch.ts` — search contract and matching logic may be extended but the pre-computed searchable record pattern should be preserved
- Search UI may be rebuilt with `@floating-ui/react` and `@radix-ui/react-scroll-area`

### Root orchestrator (modification authorized)
- `ToolLauncherWorkHub.tsx` — may be restructured to work with new composition shell, but the data flow pattern (hook → derive → props) should be preserved

---

## What later phases should preserve

### Data pipeline (preserve entirely)
- `toolLauncherContracts.ts` — 3-layer type system
- `toolLauncherNormalization.ts` — normalization logic, audience filtering, presentation derivation functions
- `toolLauncherListSource.ts` — SharePoint REST fetcher, `SP_FIELDS` mapping, `fetchToolLauncherListItems()`
- `useToolLauncherData.ts` — caching hook, abort handling, SPFx context detection

Changes to these files should be additive (new fields, new derivation functions) rather than structural.

### Mount seam
- `mount.tsx` — GUID registration, SPFx context injection, site URL storage
- Do not change the webpart GUID
- Do not change the site URL storage mechanism

### Data flow pattern
- Unidirectional: hook → normalize → derive presentation → props → render
- No introduction of state management libraries (Redux, Zustand, etc.) for the launcher domain
- `useMemo` stability for searchable records should be preserved

### Composition concepts
- 4-region composition model (command band, flagship stage, workflow shelves, utility rail)
- 3-tier card density hierarchy (flagship / shelf / index)
- Overlay as the full-inventory surface
- These are the right structural decisions — the rebuild replaces how they render, not what they are

### Search contract
- Pre-computed `SearchablePlatform` records
- Case-insensitive substring matching
- Multi-field search (name, aliases, descriptor, category, workflow shelf, support owner)
- The search algorithm may be improved but not removed or simplified

### Notice and support model
- Notice priority ordering (critical → warning → info → success → neutral)
- Support action categorization (help / access / contacts)
- Notice auto-expiry logic
- Per-section suppression when empty

### Audience filtering
- `filterByAudience()` with no-restriction fallthrough
- Applied before presentation derivation

---

## What is explicitly out of scope

### Other homepage webparts
- The rebuild workstream applies only to `toolLauncherWorkHub/`
- Do not modify HbSignatureHero, CompanyPulse, ProjectSpotlight, PeopleCulture, SafetyFieldExcellence, LeadershipMessage, SmartSearchWayfinding, or PriorityActions webparts
- Do not modify homepage shared composition shells or helpers unless required for launcher-specific changes

### Shell extension work
- Do not create or modify shell extensions, application customizers, or placeholder rendering
- Shell extension work belongs to a separate workstream

### SharePoint list schema
- Do not modify the "Tool Launcher Contents" list schema, column definitions, or internal field names
- List governance changes (if needed) are a separate administrative action, not a code change

### Package structure
- Do not move the launcher out of `apps/hb-webparts`
- Do not create a new package for launcher components
- Do not modify workspace-level package relationships

### Data layer restructuring
- Do not restructure the normalization pipeline
- Do not change the SharePoint REST API query pattern
- Do not introduce GraphQL, CAML, or alternative query mechanisms

---

## Package/runtime/authoring constraints that cannot be violated

### Import discipline — BINDING
- Homepage webparts must import from `@hbc/ui-kit/homepage` as primary UI entry point
- Broad `@hbc/ui-kit` and `@hbc/ui-kit/app-shell` imports are prohibited
- Supplementary imports from `@hbc/ui-kit/theme` (tokens) and `@hbc/ui-kit/icons` (icons) are allowed

### SharePoint host safety — BINDING
- Components must render safely in SharePoint edit mode
- Components must not suppress or fight SharePoint host chrome
- Components must not use unsupported SharePoint DOM manipulation
- Components must handle section movement without breaking

### Authoring resilience — BINDING
- Every state of the launcher must render safely when:
  - minimally configured
  - partially configured
  - data is loading
  - data fetch fails
  - list returns zero items
  - audience filtering excludes all items
  - featured platforms are absent
  - workflow shelves are absent
  - notices are absent

### Manifest adjacency — BINDING
- The Tool Launcher webpart manifest must remain adjacent to its entry
- Manifest correctness must survive packaging into `.sppkg`

### Accessibility — BINDING
- WCAG 2.1 AA minimum contrast (4.5:1 text, 3:1 interactive)
- Visible keyboard focus indicators
- `prefers-reduced-motion` support
- No hover-only critical information
- Keyboard-navigable search and suggestions

---

## Where `@hbc/ui-kit` should be extended vs bypassed vs wrapped

### Extend (promote to ui-kit/homepage when reuse is justified)
- Launcher card primitives that prove broadly useful across homepage surfaces
- Premium search input primitive if applicable beyond the launcher
- Premium overlay/modal primitive if applicable beyond the launcher

### Use directly (already in ui-kit)
- Motion (`motion/react` via ui-kit/homepage)
- Icons (Lucide set via ui-kit/homepage)
- Design tokens (`@hbc/ui-kit/theme`)

### Build locally (launcher-specific, not yet reusable)
- Launcher composition shell — specific to the 4-region launcher layout
- Launcher card variants — specific density and treatment per tier
- Launcher command band — launcher-specific search and action UI
- Launcher utility rail — launcher-specific support/status surface
- Launcher overlay — launcher-specific full-inventory surface

### Do not bypass
- Do not bypass `@hbc/ui-kit/homepage` entry point for importing shared primitives
- Do not create duplicate reusable visual primitives that should live in ui-kit
- Do not install premium stack packages independently if they are already re-exported through ui-kit/homepage

### Promotion rule
Promote local launcher components to `@hbc/ui-kit` only when:
- reuse beyond the launcher is justified by a second consumer
- the pattern is aligned with the shared premium design language
- the component is stable and has been validated in the launcher context first
