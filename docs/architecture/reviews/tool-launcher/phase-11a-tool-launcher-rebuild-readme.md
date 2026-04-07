# Phase 11A — Tool Launcher Rebuild Implementation Brief

## Purpose of Phase 11A

Phase 11A is a **documentation and governance phase** that examines the Tool Launcher / Work Hub webpart against current repo truth and the governing SPFx doctrine, then produces the implementation brief that will govern Phases 11B–11H of the rebuild workstream.

This phase does not implement runtime code changes, create visual mocks, or modify unrelated surfaces.

Phase mapping:
- Phase 11A (this phase) = prior Phase 00 — blueprint / implementation brief
- Phase 11B = prior Phase 01 — composition re-architecture
- Phase 11C = prior Phase 02 — premium design foundations
- Phase 11D = prior Phase 03 — command surface and discovery
- Phase 11E = prior Phase 04 — featured stage rebuild
- Phase 11F = prior Phase 05 — utility and support surface
- Phase 11G = prior Phase 06 — overlay and inventory surface
- Phase 11H = prior Phase 07 — hardening and production readiness

---

## Repo-Truth Assessment

### Component inventory

The Tool Launcher implementation spans **14 component/utility files** under `apps/hb-webparts/src/webparts/toolLauncherWorkHub/` and **4 data pipeline files** under `apps/hb-webparts/src/homepage/data/` plus `apps/hb-webparts/src/homepage/webparts/toolLauncherContracts.ts`.

#### Component files

| File | Lines | Purpose |
|------|-------|---------|
| `ToolLauncherWorkHub.tsx` | ~155 | Root orchestrator — bridges live SharePoint data to composition shell |
| `LauncherCompositionShell.tsx` | ~117 | Responsive grid layout via inline style factories |
| `LauncherCommandBand.tsx` | ~368 | Search surface + action toolbar with inline suggestions |
| `LauncherFlagshipStage.tsx` | ~53 | Featured platforms grid (Tier 1 cards) |
| `LauncherFlagshipCard.tsx` | ~224 | Premium card with spring motion, 5-step logo cascade |
| `LauncherWorkflowShelves.tsx` | ~89 | Secondary groupings by workflow pattern |
| `LauncherShelfCard.tsx` | ~156 | Medium-weight horizontal card (Tier 2) |
| `LauncherUtilityRail.tsx` | ~304 | Support/status surface — notices, help, access, contacts |
| `LauncherAllPlatformsOverlay.tsx` | ~266 | Full inventory modal with search |
| `LauncherIndexRow.tsx` | ~164 | Compact inventory row (Tier 3) |
| `launcherIconResolution.ts` | ~114 | Icon/tint mapping for categories and platforms |
| `launcherAssetResolution.ts` | ~160 | 5-step logo resolution cascade with inline manifest |
| `launcherSearch.ts` | ~113 | Pre-computed search contract and filtering |
| `index.ts` | ~5 | Public exports |

#### Data pipeline files

| File | Lines | Purpose |
|------|-------|---------|
| `toolLauncherContracts.ts` | ~182 | 3-layer type system: raw SharePoint → normalized → presentation |
| `toolLauncherNormalization.ts` | ~414 | Normalization, audience filtering, presentation derivation |
| `toolLauncherListSource.ts` | ~178 | SharePoint REST fetcher with field mapping |
| `useToolLauncherData.ts` | ~75 | React hook with 5-minute cache and abort handling |

#### Mount seam

`apps/hb-webparts/src/mount.tsx` registers the Tool Launcher under GUID `cb7060f5-b852-4600-b912-a5f6f7221ce2` and injects SPFx context for site URL resolution.

### Architecture summary

The launcher follows a 4-region composition model:

1. **Command band** — identity, search with inline suggestions, action buttons
2. **Flagship stage** — featured platforms in auto-fill grid (Tier 1 cards)
3. **Workflow shelves** — secondary platforms grouped by workflow pattern (Tier 2 cards)
4. **Utility rail** — notices, help URLs, access requests, support contacts

A separate **All Platforms overlay** provides full inventory search (Tier 3 compact rows).

Data flows unidirectionally: `useToolLauncherData()` → `deriveToolLauncherPresentation()` → props through component tree. State is minimal (search query, overlay toggle, responsive tier).

### Current ui-kit usage

The launcher uses very little from `@hbc/ui-kit`:
- `motion` / `AnimatePresence` from Framer Motion (via ui-kit/homepage)
- Lucide icons (`Search`, `ExternalLink`, `AlertCircle`, `AlertTriangle`, `Info`, `Link2`, `Users`, etc.)
- `HbcLauncherSurface` for legacy fallback path only
- `LauncherTileTint` type

Everything else — cards, layout shell, search UI, overlays, responsive system, design tokens, motion gating — is built locally with inline styles.

---

## Reusable Seams

The following seams are architecturally sound, well-typed, and should be **preserved** through the rebuild:

### Data pipeline
- **`toolLauncherContracts.ts`** — The 3-layer type system (raw → normalized → presentation) is clean, well-separated, and properly typed. Preserve as the domain contract.
- **`toolLauncherNormalization.ts`** — Normalization logic handles nullable SharePoint fields, notice expiry, audience filtering, and presentation derivation correctly. The `deriveToolLauncherPresentation()` master function is a strong seam.
- **`toolLauncherListSource.ts`** — SharePoint REST fetcher with field mapping is production-tested. The `SP_FIELDS` mapping correctly handles SharePoint's generic internal names.
- **`useToolLauncherData.ts`** — Caching hook with 5-minute TTL, abort handling, and proper SPFx context detection. Clean contract.

### Search contract
- **`launcherSearch.ts`** — Pre-computed searchable records with stable `useMemo` integration. Case-insensitive substring matching across name, aliases, descriptor, category, workflow shelf, and support owner. Solid utility.

### Icon and asset resolution
- **`launcherIconResolution.ts`** — Category and platform icon mapping. May need extension for new categories but the pattern is sound.
- **`launcherAssetResolution.ts`** — 5-step logo resolution cascade (record asset → manifest light/dark → manifest icon → platform icon → monogram). The inline manifest (9 known platforms) is a maintenance concern but the cascade logic is correct. Later phases should consider externalizing the manifest.

### Mount seam
- **`mount.tsx`** — GUID registration, SPFx context injection, site URL storage. Standard and correct. No changes needed.

### Useful data model concepts
- 3-tier card hierarchy (flagship / shelf / index) — the concept of differentiated density tiers is correct even though the current visual execution is weak
- Notice priority ordering (critical → warning → info → success → neutral)
- Support action categorization (help / access / contacts)
- Audience-filtered visibility with no-restriction fallthrough
- Workflow shelf grouping as an organizing principle

---

## Transitional / Replaceable Seams

The following are transitional implementations that should **not** constrain the rebuild surface:

### Composition shell
- **`LauncherCompositionShell.tsx`** — Inline style factories (`getShellStyle()`, `getBodyStyle()`) parameterized by responsive tier. No CVA, no class composition, no reusable layout primitives. This is a transitional layout that should be replaced with a CVA-driven composition shell using `clsx`.

### Card components
- **`LauncherFlagshipCard.tsx`** — Functional but reads as a safe enterprise card. 56px logo container, name, descriptor, CTA row — arranged in a generic vertical card layout with inline styles. The spring motion (scale 1.015/0.985) is a positive signal but the visual language remains generic Fluent-feeling.
- **`LauncherShelfCard.tsx`** — 40px horizontal row card with no motion, no CVA, inline styles. Indistinguishable from a generic enterprise tile row.
- **`LauncherIndexRow.tsx`** — Compact row used in the overlay. Functional but visually undifferentiated.

### Command band
- **`LauncherCommandBand.tsx`** — The largest single component (~368 lines). Custom search UI with suggestion dropdown, keyboard navigation, and responsive adaptation. Does not use `@floating-ui/react` for suggestion positioning. Does not use CVA for variant composition. All inline styles. The search UX concept is correct but the implementation should be rebuilt with the approved premium stack.

### Utility rail
- **`LauncherUtilityRail.tsx`** — 4-section support surface (notices, help, access, contacts) with tone-based styling via inline style dictionaries. Priority ordering and section suppression logic is reusable, but the visual treatment is passive and under-scaled. Inline styles prevent premium scaling.

### Overlay
- **`LauncherAllPlatformsOverlay.tsx`** — Modal overlay with search, category-grouped results, and motion transitions. Does not use `@floating-ui/react`. Custom backdrop + fixed positioning instead. The interaction model (overlay with embedded search) is a reasonable pattern, but the implementation should be rebuilt.

### Inline style system
- **All components** use `React.CSSProperties` dictionaries with hardcoded values. Local tokens (`HP_SPACE`, `HP_RADIUS`, `HP_BORDER`, `HP_MOTION`) provide some consistency, but the overall approach prevents premium variant composition, makes responsive adaptation procedural rather than declarative, and is incompatible with the CVA + clsx stack required by doctrine.

### Legacy fallback
- **`HbcLauncherSurface`** — Used as a fallback when live SharePoint data is unavailable. This path duplicates tile rendering logic and does not use the new card hierarchy. Should be deprecated or converted to use the same rebuilt surface with static data.

---

## Doctrine Interpretation

The SPFx Governing Standard and Homepage Overlay are the controlling doctrine for this assessment. The following doctrine positions directly apply:

### §4.1 — Default Fluent visual language is prohibited as the premium answer
The current launcher's card components produce generic Fluent-shaped cards with thin borders, modest padding, and safe enterprise hover states. This is the dominant visual language of the launcher surface. The doctrine explicitly prohibits this as the flagship answer.

### §4.2 — Design-safety-zone outcomes are prohibited
The launcher currently produces:
- thin-border white-card grids as the dominant surface language
- timid hierarchy between featured and non-featured platforms
- small polite modules with consistent but undifferentiated density
- subtle hover states presented as the premium interaction model

All of these are explicitly prohibited outcomes under the binding doctrine.

### §4.3 — Structural rebuild is preferred over decorative refinement
The doctrine explicitly states: "Do not preserve a weak system simply because it is already compiling." The launcher's composition model, card primitives, command surface, and utility rail are all structurally constrained by their inline-style, non-CVA architecture. Decorative polish (changing colors, adjusting spacing) would not produce a premium result.

### §5.1–5.2 — Approved premium stack must be used
The launcher uses only `motion` and `lucide-react` from the approved stack. It does not use:
- `@floating-ui/react` for search suggestions or overlays
- `@radix-ui/react-tooltip` for icon clarification
- `@radix-ui/react-separator` for hierarchy and rhythm
- `@radix-ui/react-scroll-area` for polished overflow
- `class-variance-authority` for variant systems
- `clsx` for class composition

The doctrine requires deliberate use of the approved stack where justified. A launcher/work hub surface is precisely the kind of premium command surface where most of these packages are justified.

### Homepage Overlay §3.2 — Import discipline
Homepage webparts must import from `@hbc/ui-kit/homepage` as primary entry point. The current launcher imports icons and motion through this path correctly. This should be preserved.

### Homepage Overlay §5.3 — Pseudo-icons are prohibited
The launcher's monogram fallback (first letter as pseudo-icon) is a last-resort fallback in the logo cascade and is acceptable as a final fallback. However, if monograms are appearing frequently in production, the asset manifest or icon map should be expanded.

---

## Why the Current Launcher Underperforms

Grounded in repo truth and doctrine:

1. **Visual language is generic enterprise card-grid.** The 3-tier card system produces functionally different but visually similar cards — all thin-bordered, white-background, modest-padding rectangles. This is the exact outcome doctrine §4.2 prohibits.

2. **No serious variant system.** Without CVA, every visual variation is a one-off inline style dictionary. There is no compositional variant system for card density, tone, emphasis, or state. This prevents the kind of serious surface differentiation the doctrine requires.

3. **Command surface lacks premium discovery UX.** The search suggestion dropdown is a basic absolutely-positioned div with inline styles. No `@floating-ui/react` anchoring, no `@radix-ui/react-scroll-area` for polished overflow, no premium transitions. For a flagship launcher, this should be a signature interaction.

4. **Utility rail is passive.** The support/status surface reads as a secondary information dump rather than an active operational surface. Notice priority ordering is implemented in data but not strongly expressed visually.

5. **Inline style architecture blocks premium scaling.** Every component defines its own style dictionaries. Responsive adaptation is procedural (tier-conditional factories). Motion gating is manual. This architecture makes it impossible to implement the coordinated, variant-driven surface language the doctrine demands.

6. **Featured stage lacks visual authority.** Featured platforms are distinguished only by `isFeatured=true` and a slightly larger card size (240px vs 180px min-width). There is no visual authority gap — the featured stage does not command the page the way a flagship launcher should.

7. **No zone-specific visual differentiation.** The command band, flagship stage, workflow shelves, and utility rail all share the same visual density and treatment. The doctrine expects deliberate zone differentiation.

---

## Rebuild Posture

**The Tool Launcher is a structural rebuild candidate.** This conclusion is grounded in:

- the binding doctrine positions that explicitly prohibit the current visual outcome
- the inline style architecture that prevents premium variant composition
- the minimal premium stack adoption that leaves most approved packages unused
- the generic card-grid hierarchy that reads as safe enterprise UI rather than a flagship launcher

The rebuild should:

1. **Preserve the data pipeline entirely** — contracts, normalization, list source, hook, search contract
2. **Preserve the 4-region composition concept** — command band, flagship stage, workflow shelves, utility rail
3. **Preserve the 3-tier card density concept** — flagship / shelf / index differentiation
4. **Replace all visual components** — composition shell, card components, command band, utility rail, overlay
5. **Replace the inline style system** — with CVA variants + clsx class composition
6. **Adopt the full approved premium stack** — @floating-ui, @radix-ui/*, CVA, clsx, motion (already present), lucide (already present)
7. **Create launcher-specific primitives** — purpose-built for the launcher surface, promoted to ui-kit only when reuse is justified

---

## Downstream Phase Sequence

### Phase 11B — Composition Re-Architecture
- Replace `LauncherCompositionShell` with CVA-driven composition shell
- Establish the variant system and class composition patterns
- Define zone-specific visual differentiation
- Set responsive tier foundations with CVA

### Phase 11C — Premium Design Foundations
- Replace card primitives with CVA-driven launcher card family
- Implement flagship card with premium visual authority
- Implement shelf card with deliberate secondary treatment
- Establish launcher design tokens (if beyond existing HP_* tokens)

### Phase 11D — Command Surface and Discovery
- Rebuild command band with `@floating-ui/react` for search suggestions
- Implement `@radix-ui/react-scroll-area` for polished suggestion overflow
- Add `@radix-ui/react-tooltip` for compact icon clarification
- Create premium search interaction with refined motion

### Phase 11E — Featured Stage Rebuild
- Rebuild flagship stage with premium visual authority
- Create clear hierarchy gap between featured and non-featured
- Implement premium CTA behavior
- Add `@radix-ui/react-separator` for stage rhythm

### Phase 11F — Utility and Support Surface
- Rebuild utility rail with premium notice treatment
- Make urgency visually forceful, not passive
- Improve support action density and clarity
- Add premium interaction states

### Phase 11G — Overlay and Inventory Surface
- Rebuild all-platforms overlay with `@floating-ui/react`
- Implement `@radix-ui/react-scroll-area` for inventory scroll
- Rebuild index row with deliberate compact treatment
- Add premium search within overlay

### Phase 11H — Hardening and Production Readiness
- Authoring mode QA
- Partial-data resilience verification
- Accessibility audit
- Performance audit
- Clean build verification
- Legacy fallback path decision (deprecate or modernize `HbcLauncherSurface`)

---

## Validation Philosophy

Later phases must satisfy validation at three levels:

### 1. Functional parity
Every rebuild phase must preserve:
- live SharePoint list data sourcing
- audience-filtered platform visibility
- search/discovery across all platforms
- notice display with priority ordering
- support action surfacing
- external link launching
- keyboard accessibility for search and navigation
- responsive layout across desktop/tablet/mobile tiers

### 2. Doctrine compliance
Every rebuild phase must produce surfaces that:
- do not read as generic enterprise card-grids
- use the approved premium stack deliberately
- express visible hierarchy differentiation between zones
- use CVA variants for surface composition
- respect `prefers-reduced-motion`
- maintain `@hbc/ui-kit/homepage` import discipline

### 3. Host safety
Every rebuild phase must verify:
- SharePoint edit-mode compatibility
- section movement safety
- partial-configuration resilience
- empty-state behavior
- clean `.sppkg` build output

---

## Risks / Constraints

1. **SharePoint host rendering constraints.** The launcher renders inside a SharePoint page canvas. Premium stack packages must not fight the host or degrade authoring mode. Each phase should verify edit-mode behavior.

2. **Asset manifest scalability.** The inline asset manifest in `launcherAssetResolution.ts` covers only 9 known platforms. As the platform list grows, this should be externalized to the SharePoint list or a separate managed manifest. This is not a rebuild blocker but should be addressed in Phase 11H.

3. **Legacy fallback path.** The `HbcLauncherSurface` fallback in `mount.tsx` creates a parallel rendering path. Phase 11H must decide whether to modernize this path or deprecate it.

4. **Logo preference field.** The `LauncherLogoPreference` type is parsed and stored but never consulted during resolution. Later phases should either use it or remove it.

5. **Platform key governance.** Some records may lack explicit `PlatformKey` values, falling back to slugified names. Phase 11H should enforce key presence in list governance.

---

## Exit Criteria for Phase 11A

Phase 11A is complete when:

- [x] The repo-truth assessment accurately reflects the current launcher implementation
- [x] Reusable seams are identified and grounded in specific file paths
- [x] Transitional seams are identified with specific weakness descriptions
- [x] The doctrine interpretation references binding provisions by section number
- [x] The underperformance analysis is grounded in repo truth, not speculation
- [x] The rebuild posture is stated as structural rebuild with clear justification
- [x] The downstream phase sequence is defined with clear scope boundaries
- [x] The validation philosophy covers functional parity, doctrine compliance, and host safety
- [x] Change boundaries are documented in a separate deliverable
- [x] A validation checklist for later phases is documented in a separate deliverable
