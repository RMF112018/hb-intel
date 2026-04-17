# 01 — Authority and Repo-Truth Lock

## 1. Objective

Add `hb-homepage` as a new first-class composed homepage orchestrator webpart in `apps/hb-webparts`. The orchestrator renders five public homepage modules inside a single shell:

- CompanyPulse
- LeadershipMessage
- ProjectPortfolioSpotlight
- PeopleCulturePublic
- HbKudos

`hbSignatureHero` remains independent and is not orchestrated by `hb-homepage`.

Phase 01 is additive. Existing standalone public webparts and their manifest/runtime mappings remain operational throughout.

## 2. Governing authority

| Source | Role |
|--------|------|
| `CLAUDE.md` | Repository operating brief and locked invariants |
| `docs/architecture/blueprint/package-relationship-map.md` | Package ownership and dependency direction |
| `docs/architecture/blueprint/current-state-map.md` | Present-truth repo state |
| `docs/architecture/plans/MASTER/spfx/home-wrapper/phase-01/README.md` | Phase 01 locked initiative, scope, and execution rules |
| `docs/architecture/plans/MASTER/spfx/home-wrapper/Repo-Truth-and-Research-Findings.md` | Research-grounded constraints |
| `docs/architecture/plans/MASTER/spfx/home-wrapper/Executive-Audit-Summary.md` | Audit posture and upgraded package rationale |

## 3. Files and seams audited

### Runtime dispatch

- `apps/hb-webparts/src/mount.tsx` — central GUID-keyed dispatcher and token/context provider

### Homepage shared layer

- `apps/hb-webparts/src/homepage/` — contracts, data hooks, helpers, shared primitives, models, tests
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx` — design-authority composition (non-production)

### Target webpart entries and manifests

| Module | Entry | Manifest |
|--------|-------|----------|
| CompanyPulse | `src/webparts/companyPulse/CompanyPulse.tsx` | `CompanyPulseWebPart.manifest.json` |
| LeadershipMessage | `src/webparts/leadershipMessage/LeadershipMessage.tsx` | `LeadershipMessageWebPart.manifest.json` |
| ProjectPortfolioSpotlight | `src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx` | `ProjectPortfolioSpotlightWebPart.manifest.json` |
| PeopleCulturePublic | `src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx` | `PeopleCulturePublicWebPart.manifest.json` |
| HbKudos | `src/webparts/hbKudos/HbKudos.tsx` | `HbKudosWebPart.manifest.json` |

### Split-runtime companion manifests (non-scope, audited for boundary protection)

- `src/webparts/peopleCultureCompanion/` — HR companion for People & Culture
- `src/webparts/hbKudosCompanion/` — HR companion for HB Kudos
- `src/webparts/hbKudos/kudosRuntimeContract.ts` — authoritative split-ownership map

### Packaging and dependency

- `apps/hb-webparts/package.json` — workspace deps: `@hbc/sharepoint-platform`, `@hbc/ui-kit`; React 18.3.1; SPFx 1.20 shell deps; Vite 6.0.0
- `packages/ui-kit/package.json` — centralized premium stack (motion, lucide-react, cva, clsx, Radix, Fluent UI v9, Griffel)
- `tools/build-spfx-package.ts` — custom Vite→SPFx packaging pipeline

### Shared homepage surfaces (ui-kit)

- `packages/ui-kit/src/homepage.ts` — barrel exporting 9 surface families, shared primitives, design tokens, premium re-exports

## 4. Current mount/runtime truth

`mount.tsx` is a mature, sensitive dispatcher with the following characteristics:

- **Dispatch model:** `WEBPART_RENDERERS` is a `Record<string, (props) => ReactNode>` keyed by webpart GUID. Currently 16 registered entries.
- **Theme wrapping:** All webparts render inside `HbcThemeProvider` (forced light theme).
- **Token provision:** `createApiTokenProvider(spfxContext, 'https://graph.microsoft.com')` creates `getGraphToken`; `getApiToken` is conditionally created for PnpOps legacy mode.
- **Context injection:** Each renderer receives `config` (webpart properties), `identity` (displayName, email from SPFx pageContext), `assetBaseUrl`, `siteUrl`, `pageUrl`, `getApiToken`, `getGraphToken`.
- **Global API:** `globalThis.__hbIntel_hbWebparts = { mount, unmount }` — the SPFx shell calls this from per-webpart entry shims.
- **Kudos list host override:** `kudosListHostUrl` property stored via `storeKudosListHostUrl` with HBCentral fallback.
- **Error boundary:** Invalid or missing webpartId triggers fallback rendering.

### Registered webpart GUIDs (authoritative)

| GUID | Module |
|------|--------|
| `0b53f651-fd92-4f7f-a9da-f7797017f5eb` | CompanyPulse |
| `e8fa8a84-a48a-41d2-85a6-b7c7df70aeca` | LeadershipMessage |
| `8370ab0c-b6df-4db0-82f1-24b54750f508` | ProjectPortfolioSpotlight |
| `89ca5ff3-21f4-4b23-a953-4b7306ea1029` | SafetyFieldExcellence |
| `e39d9662-34c4-43e6-9425-5770f62da626` | PeopleCulturePublic |
| `7c3f8e24-5a9b-4c1d-b63e-8f2a194d5c7e` | PeopleCultureCompanion |
| `f14e59a3-4d6b-43b2-952e-ba02dea11dad` | HbKudos |
| `a8c5d9e2-7f14-4b3a-9c82-1e6f5d8a4b97` | HbKudosCompanion |
| `46bfde64-f0cb-4f62-9f6b-a466f8fadc1f` | PersonalizedWelcomeHeader |
| `28acd6a7-2582-4d8a-86d4-b52bfbeb375c` | HbSignatureHero |
| `39762a4d-c7fd-44a6-a11e-4f8de9f5778d` | HbHeroBanner |
| `23d22f2d-7a15-4031-ab64-2454898bfd44` | HbHeroBannerAdmin |
| `b3f07190-79cf-437d-a1d6-ecbf3f77e616` | PriorityActionsRail |
| `cb7060f5-b852-4600-b912-a5f6f7221ce2` | ToolLauncherWorkHub |
| `11d72b36-a92f-4e2d-9918-75df2cb0d11e` | SmartSearchWayfinding |
| `9e2dd84a-a121-4fb3-a964-f43a94abf9fd` | PnpOps |

### Split-runtime boundaries

**People & Culture split:**
- PeopleCulturePublic owns: featured cards, supporting rows (announcements, celebrations, culture events)
- PeopleCultureCompanion owns: overview, intake, approvals, content family workspaces, lifecycle management
- Shared: list config via `usePeopleCultureData`, profile photo resolver pattern
- Contract: `peopleCultureSplitContracts.ts` defines three content families; legacy merged model supported via `legacyAdapter.ts`

**HB Kudos split:**
- HbKudos (public) owns: featured spotlight, recent stream, archive, article reader, composer, celebrate action, photo hydration, safe-zone sentinel
- HbKudosCompanion owns: governance queue, patch planning, approval dispatch, bulk approve, role resolution, detail panel with audit
- Shared: CSS modules, governance primitives, variants, role resolver helper, list config
- Contract: `kudosRuntimeContract.ts` is the single authoritative source for ownership map

## 5. Current packaging truth

`tools/build-spfx-package.ts` implements a custom 5-step pipeline:

1. **Vite build** — produces IIFE bundle at `apps/hb-webparts/dist/hb-webparts-app.js`
2. **Asset copy** — Vite output (bundle + CSS) copied to `tools/spfx-shell/assets/`
3. **Manifest/config generation** — domain-specific `package-solution.json` written to `tools/spfx-shell/config/`; feature `componentIds` enumerate all target webpart GUIDs
4. **gulp bundle --ship** — compiles shell webpart; CopyWebpackPlugin places Vite bundle into webpack output
5. **gulp package-solution --ship** — produces `.sppkg` archive

### Multi-manifest mode (hb-webparts domain)

- `packagingModel: 'multi'`, `freshBuildRequired: true`
- For each webpart manifest: clones compiled shell JS, patches AMD `define()` from neutral shell ID to target webpart's `entryModuleId`, generates versioned `shell-entry-{manifestId}-{hash}.js`
- Per-webpart manifest clones merge compiled base with source title/entries/properties
- Each manifest's `loaderConfig.scriptResources` points to its unique shim file

### Content hashing

- SHA-256 (first 8 chars): `hb-webparts-app.js` → `hb-webparts-app-{hash}.js`; `app.css` → `app-{hash}.css`

### Verification artifacts

- `hb-webparts-shim-proof.json` records critical runtime fingerprints and manifest linkage
- Post-packaging verification confirms byte-for-byte match of source bundle inside `.sppkg`

### Excluded manifests

- `535f5a17-fc49-40ea-ac16-5d68895884f7` — retired legacy HbWebpartsWebPart
- `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` — retired merged People & Culture seam (superseded by split model)

## 6. Target-module maturity assessment

### Thin surface consumers (mature, low integration burden)

**CompanyPulse** — Newsroom surface adapter. Consumes `HbcNewsroomSurface` from `@hbc/ui-kit/homepage`. Owns: SharePoint list binding, config normalization, loading/error states. Surface owns: all presentation grammar. Pattern: config → list fetch → schema adapter → shared surface render.

**LeadershipMessage** — Editorial surface adapter. Consumes `HbcEditorialSurface` from `@hbc/ui-kit/homepage`. Same thin-consumer pattern as CompanyPulse.

**ProjectPortfolioSpotlight** — Spotlight surface adapter. Consumes `HbcProjectSpotlightSurface` from `@hbc/ui-kit/homepage`. Same thin-consumer pattern. Includes team detail panel and secondary rail.

### Split-runtime modules (mature, higher integration burden)

**PeopleCulturePublic** — Public surface of the People & Culture split. Owns featured cards and supporting rows across three content families (announcement, celebrationMilestone, cultureProgramEvent). Uses `usePeopleCultureData` for list config and `createSharePointUserPhotoResolver` / `createGraphPersonPhotoFn` for profile photos. Legacy merged model bridge still supported. Does not own recognition (HB Kudos).

**HbKudos** — Public surface of the HB Kudos split. Most complex target module. Owns featured spotlight, recent stream, archive, article reader, composer, celebrate action. Requires `kudosListHostUrl` override capability, governance writer integration, and explicit split-ownership contract with HbKudosCompanion. Shares CSS modules, governance primitives, and role resolver with companion.

## 7. Integration-effort ranking

| Module | Effort | Rationale |
|--------|--------|-----------|
| CompanyPulse | **Low** | Thin surface consumer. No cross-webpart data deps. Config-in, surface-out. Shell only needs to mount and pass context. |
| LeadershipMessage | **Low** | Same thin-consumer pattern as CompanyPulse. Identical integration shape. |
| ProjectPortfolioSpotlight | **Low** | Same thin-consumer pattern. Includes detail panel but it is self-contained. |
| PeopleCulturePublic | **Medium** | Split-runtime module. Requires profile photo resolver injection. Must preserve split boundary with PeopleCultureCompanion. Legacy bridge adapter must remain functional. |
| HbKudos | **High** | Split-runtime module with governance seam. Requires `kudosListHostUrl` override passthrough, governance writer integration, safe-zone sentinel, and explicit split-ownership contract protection. Most cross-cutting data and context dependencies among the target modules. |

## 8. Additive safety lock

Phase 01 operates under the following additive safety rules:

- `hb-homepage` is added as a **new** webpart registration in `mount.tsx` and a **new** manifest
- Existing standalone public webpart registrations (CompanyPulse, LeadershipMessage, ProjectPortfolioSpotlight, PeopleCulturePublic, HbKudos) and their manifests **remain operational**
- Existing companion webpart registrations (PeopleCultureCompanion, HbKudosCompanion) are **not touched**
- No existing GUID-to-renderer mapping in `WEBPART_RENDERERS` is removed or reassigned
- No existing manifest is deleted, hidden, or modified unless the specific prompt explicitly requires and proves it
- No packaging exclusion is added for any currently active webpart
- The `build-spfx-package.ts` pipeline gains a new manifest entry; it does not lose any existing ones

## 9. hbSignatureHero independence lock

`hbSignatureHero` (GUID `28acd6a7-2582-4d8a-86d4-b52bfbeb375c`) remains an independent, standalone webpart throughout Phase 01 and is **not** orchestrated, embedded, or composed inside `hb-homepage`.

Rationale: The signature hero is the flagship identity surface with its own full-bleed layout requirements, animation system, and brand-tier rendering. Embedding it inside a composed shell would compromise its full-width behavior and independent lifecycle.

## 10. Next-step boundary — Prompt 02

Prompt 02 must lock the following before architecture and implementation begin:

- **SharePoint host reality:** full-width placement rules, communication-site requirement for true full-width validation, workbench validation limitations
- **SPFx compatibility boundaries:** the repo's React 18 / Vite custom runtime model versus SPFx 1.20's official React 17 / Node 18 compatibility matrix; what must be preserved versus what must not be "normalized"
- **Dependency posture:** reuse from `@hbc/ui-kit/homepage` first; do not duplicate-install doctrine-mandated packages into `apps/hb-webparts` unless Phase 01 proves direct package-level access is actually required
- **Accessibility and motion obligations:** reduced-motion handling as hard implementation burden, keyboard/focus proof, sparse/partial-config behavior

No architecture, implementation, or manifest changes occur until Prompt 02 locks these constraints.
