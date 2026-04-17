# 03 — Architecture and Shell/Embedded Contract

## 1. Role of hb-homepage

`hb-homepage` is a new first-class SPFx webpart that composes five public homepage modules into a single orchestrated surface. It is a **layout-owning composition shell**, not a feature re-implementation. The shell owns zone ordering, outer spacing, responsive rhythm, and sparse/error treatment. Each embedded module retains full ownership of its internal product logic, data, and presentation through existing shared surfaces.

## 2. Additive coexistence model

During Phase 01:

- `hb-homepage` is **added** as a new webpart alongside all existing standalone public webparts.
- Existing standalone webpart registrations, manifests, and runtime mappings are **not removed**.
- Both `hb-homepage` and the standalone modules can coexist in the same `.sppkg` and in the same runtime.
- Page authors can choose to place `hb-homepage` as a single composed surface or continue using individual standalone webparts.
- No decommissioning of standalone webparts occurs in Phase 01.

## 3. Independent hero versus composed operating layer

`hbSignatureHero` (GUID `28acd6a7-2582-4d8a-86d4-b52bfbeb375c`) is the flagship identity surface. It remains an **independent webpart** and is **not** rendered inside `hb-homepage`.

Rationale:
- The hero has full-bleed layout requirements that differ from the composed module stack.
- It has its own animation system and brand-tier rendering.
- It is placed in a separate full-width section on the page, above `hb-homepage`.

`hb-homepage` owns only the **post-hero operating layer**: communications, operational awareness, people & culture, and recognition zones.

## 4. Shell responsibilities

### Zone ordering

The shell renders embedded modules in this fixed order:

| Position | Zone | Module |
|----------|------|--------|
| 1 | Communications — Newsroom | CompanyPulse |
| 2 | Communications — Editorial | LeadershipMessage |
| 3 | Operational — Spotlight | ProjectPortfolioSpotlight |
| 4 | People & Culture — Public | PeopleCulturePublic |
| 5 | Recognition — Public | HbKudos |

### Outer spacing and layout

- The shell owns the vertical rhythm between zones (gap/spacing between module sections).
- Each zone is wrapped in a section shell with appropriate aria labeling.
- The shell uses `@hbc/ui-kit/homepage` spacing tokens for consistent rhythm.

### Responsive behavior

- The shell container adapts to available width.
- With `supportsFullBleed: true`, the shell renders edge-to-edge on communication sites.
- In standard-width placements, the shell renders within the column constraints.
- Internal zone layout remains module-owned.

### Sparse, loading, and error treatment

- **Loading:** The shell renders a loading state while any module data is pending. Each module handles its own internal loading independently.
- **Empty/sparse:** If a module has no content, it renders its own empty state. The shell does not collapse or hide modules — it maintains layout integrity.
- **Error:** If a module throws, the shell catches it via an error boundary per zone and renders a graceful fallback. One module's failure does not bring down the entire shell.
- **Invalid configuration:** The shell renders safely with partial or missing configuration. All props are optional.

### Host-safe behavior

- The shell does not assume full-width is available. It renders acceptably at any width.
- The shell does not generate scroll traps or overflow.
- The shell does not interfere with SharePoint chrome or navigation.

### Reduced-motion behavior

- Any shell-level transitions (zone reveal, mount animations) must respect `prefers-reduced-motion: reduce`.
- The shell imports motion utilities from `@hbc/ui-kit/homepage` re-exports, not directly.

## 5. Embedded-module responsibilities

### What modules keep owning

- Internal configuration normalization (config → view model)
- Internal data fetching (list hooks, API calls)
- Internal presentation through shared `@hbc/ui-kit/homepage` surfaces
- Internal empty/loading/error states
- Internal interaction handling (panels, dialogs, composers)
- Internal accessibility (focus management, aria attributes within the module)

### What modules stop owning

- Page-level zone placement (now shell-owned)
- Outer section spacing and rhythm (now shell-owned)
- Page-level section aria labeling (now shell-owned)

### Module contract

Each embedded module is rendered as a React component receiving its existing props interface. The shell passes:

- `config` — webpart configuration object (from shell's own preconfigured entries or runtime config)
- `identity` — `{ displayName, email }` from SPFx pageContext (for modules that need it)
- `assetBaseUrl` — asset resolution base URL
- `getGraphToken` — async Graph token provider (for modules that need it)
- Module-specific props as needed (e.g., `kudosListHostUrl` for HbKudos, `profilePhotoResolver` for PeopleCulturePublic)

## 6. Folder and file structure

```
apps/hb-webparts/src/webparts/hbHomepage/
├── HbHomepage.tsx                          # Root component
├── HbHomepageWebPart.manifest.json         # Adjacent manifest
├── HbHomepageShell.tsx                     # Shell composition layout
├── HbHomepageShell.module.css              # Shell layout styles
├── hbHomepageContract.ts                   # Module registry and shell types
└── zones/
    ├── CompanyPulseZone.tsx                # Zone wrapper for CompanyPulse
    ├── LeadershipMessageZone.tsx           # Zone wrapper for LeadershipMessage
    ├── ProjectPortfolioSpotlightZone.tsx   # Zone wrapper for ProjectPortfolioSpotlight
    ├── PeopleCulturePublicZone.tsx         # Zone wrapper for PeopleCulturePublic
    └── HbKudosZone.tsx                     # Zone wrapper for HbKudos
```

### File roles

- **HbHomepage.tsx** — Root entry point matching existing webpart component pattern. Receives `HbHomepageProps` and delegates to `HbHomepageShell`.
- **HbHomepageWebPart.manifest.json** — Adjacent SPFx manifest with new GUID, `supportsFullBleed: true`, `hiddenFromToolbox: false`.
- **HbHomepageShell.tsx** — Owns zone ordering, outer spacing, error boundaries per zone, responsive container, reduced-motion-aware transitions.
- **HbHomepageShell.module.css** — Shell layout styles (zone gaps, section spacing, responsive breakpoints).
- **hbHomepageContract.ts** — Type definitions for shell config, zone registration, and embedded module props contracts.
- **zones/*.tsx** — Thin zone wrappers that extract per-module config from shell config, apply section aria labeling, and render the target module inside an error boundary.

## 7. Shell configuration contract

```typescript
interface HbHomepageConfig {
  companyPulse?: Partial<CompanyPulseConfig>;
  leadershipMessage?: Partial<LeadershipMessageConfig>;
  projectPortfolioSpotlight?: Partial<ProjectPortfolioSpotlightConfig>;
  peopleCulturePublic?: Partial<PeopleCulturePublicConfig>;
  hbKudos?: Partial<HbKudosConfig>;
  activeAudience?: string;
}

interface HbHomepageProps {
  config?: Partial<HbHomepageConfig>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
  siteUrl?: string;
  getGraphToken?: () => Promise<string>;
  getApiToken?: () => Promise<string>;
  kudosListHostUrl?: string;
}
```

All fields are optional. The shell renders safely with any subset of configuration.

## 8. Embedded module registration contract

Modules are statically composed in `HbHomepageShell.tsx` in fixed zone order. There is no dynamic registry or plugin system — the module set is known at compile time.

Each zone wrapper:
1. Extracts its module's config slice from the shell config
2. Wraps the module in a React error boundary
3. Wraps the module in an `<section>` with zone-appropriate aria label
4. Renders the existing module component with its standard props interface

## 9. Shared context and helper seams

### From mount.tsx → hb-homepage

The shell receives the same `WebPartRendererContext` that all webparts receive from `mount.tsx`:
- `config`, `identity`, `assetBaseUrl`, `siteUrl`, `pageUrl`, `getApiToken`, `getGraphToken`

### Shell → embedded modules

The shell distributes context to each zone:
- **All modules:** `config` slice, `identity`, `assetBaseUrl`
- **PeopleCulturePublic:** additionally `profilePhotoResolver` (constructed from `siteUrl` and `getGraphToken`)
- **HbKudos:** additionally `getGraphToken`, `identity`, `kudosListHostUrl` (from shell config or HBCentral fallback)

### No new shared seams

Phase 01 does not introduce new shared packages, new shared hooks, or new shared context providers. The shell composes existing module components with their existing props.

## 10. Migration order

| Prompt | Modules | Rationale |
|--------|---------|-----------|
| 05 | CompanyPulse, LeadershipMessage, ProjectPortfolioSpotlight | Lowest risk. Thin surface consumers with identical integration shape. No cross-module data deps. |
| 06 | PeopleCulturePublic | Medium risk. Split-runtime boundary. Profile photo resolver injection. Legacy bridge adapter. |
| 07 | HbKudos | Highest risk. Split-runtime contract. Governance writer. People search. Composer. Multi-panel state. |

## 11. Acceptance criteria for Prompts 04–09

### Prompt 04 (Host creation)
- `hbHomepage/` folder exists with all foundational files
- Manifest has new GUID, `supportsFullBleed: true`, correct group/title
- Shell renders placeholder content with zone structure
- Shell handles loading/empty/error states
- Compiles cleanly

### Prompt 05 (Embed Pulse/Leadership/Spotlight)
- Three modules render inside shell zones
- Shell owns outer spacing; modules own internal presentation
- Module internals not re-authored
- Existing standalone manifests/registrations untouched
- Compiles cleanly

### Prompt 06 (Embed PeopleCulturePublic)
- Module renders inside shell
- People/Kudos split boundary preserved
- Profile photo resolver passed correctly
- Legacy bridge adapter still functional
- Compiles cleanly

### Prompt 07 (Embed HbKudos)
- Module renders inside shell
- Split-runtime contract preserved
- `kudosListHostUrl` passed through
- Governance writer, composer, article reader functional
- No companion scope widening
- Compiles cleanly

### Prompt 08 (Mount/packaging)
- `hb-homepage` registered in `mount.tsx` with new GUID
- Manifest adjacency correct
- `build-spfx-package.ts` processes new manifest
- Shell-entry shim generated
- All existing webpart packaging intact
- Build succeeds; `.sppkg` contains new component

### Prompt 09 (Closure)
- Build/package proof
- Runtime registration proof
- All 5 modules render through shell
- `hbSignatureHero` independent
- Shell layout ownership demonstrated
- Hard closure statement with only external/environmental constraints remaining
