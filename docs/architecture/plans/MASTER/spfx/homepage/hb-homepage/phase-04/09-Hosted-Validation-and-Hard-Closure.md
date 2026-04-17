# 09 — Hosted Validation and Hard Closure

## 1. Implementation summary

Phase 01 added `hb-homepage` as a new first-class composed homepage orchestrator webpart in `apps/hb-webparts`. The shell renders five public homepage modules in fixed zone order:

1. CompanyPulse (newsroom)
2. LeadershipMessage (editorial)
3. ProjectPortfolioSpotlight (operational)
4. PeopleCulturePublic (people & culture)
5. HbKudos (recognition)

The implementation is additive. All existing standalone public webparts remain operational with unchanged manifests and runtime mappings.

## 2. Files changed across the initiative

### New files (all under `apps/hb-webparts/src/webparts/hbHomepage/`)

| File | Purpose |
|------|---------|
| `HbHomepage.tsx` | Root entry component |
| `HbHomepageShell.tsx` | Shell composition (zone ordering, layout, context distribution) |
| `HbHomepageShell.module.css` | Responsive layout with reduced-motion support |
| `HbHomepageShell.module.css.d.ts` | CSS module type declaration |
| `hbHomepageContract.ts` | Webpart GUID constant, props interfaces |
| `ZoneErrorBoundary.tsx` | Per-zone React error boundary |
| `HbHomepageWebPart.manifest.json` | Adjacent SPFx manifest |
| `zones/CompanyPulseZone.tsx` | CompanyPulse zone wrapper |
| `zones/LeadershipMessageZone.tsx` | LeadershipMessage zone wrapper |
| `zones/ProjectPortfolioSpotlightZone.tsx` | ProjectPortfolioSpotlight zone wrapper |
| `zones/PeopleCulturePublicZone.tsx` | PeopleCulturePublic zone wrapper |
| `zones/HbKudosZone.tsx` | HbKudos zone wrapper |

### Modified files

| File | Change |
|------|--------|
| `apps/hb-webparts/src/mount.tsx` | Added `HbHomepage` import and `HB_HOMEPAGE_WEBPART_ID` renderer entry |

### Documentation artifacts

| File | Prompt |
|------|--------|
| `phase-01/01-Authority-and-Repo-Truth-Lock.md` | Prompt 01 |
| `phase-01/02-Host-Reality-Compatibility-and-Dependency-Lock.md` | Prompt 02 |
| `phase-01/03-Architecture-and-Shell-Embedded-Contract.md` | Prompt 03 |
| `phase-02/04-Create-HB-Homepage-Host-and-Manifest.md` | Prompt 04 |
| `phase-02/05-Embed-Pulse-Leadership-Spotlight.md` | Prompt 05 |
| `phase-03/06-Embed-People-Culture-Public.md` | Prompt 06 |
| `phase-03/07-Embed-HB-Kudos.md` | Prompt 07 |
| `phase-04/08-Mount-Runtime-Manifest-and-Packaging-Integration.md` | Prompt 08 |
| `phase-04/09-Hosted-Validation-and-Hard-Closure.md` | Prompt 09 |

## 3. Final runtime architecture

```
mount.tsx
  └── WEBPART_RENDERERS[e0a11c44-...]
        └── HbHomepage (root entry)
              └── HbHomepageShell (composition layout)
                    ├── CompanyPulseZone → CompanyPulse → HbcNewsroomSurface
                    ├── LeadershipMessageZone → LeadershipMessage → HbcEditorialSurface
                    ├── ProjectPortfolioSpotlightZone → ProjectPortfolioSpotlight → HbcProjectSpotlightSurface
                    ├── PeopleCulturePublicZone → PeopleCulturePublic → PeopleCulturePublicSurface
                    └── HbKudosZone → HbKudos → PublicKudosSurface + composer/feed/reader
```

Context flows: mount.tsx extracts SPFx context (identity, tokens, siteUrl, config) → HbHomepageShell → per-zone wrappers → existing module components with their standard props.

## 4. Final packaging posture

- **Manifest:** `HbHomepageWebPart.manifest.json` at `src/webparts/hbHomepage/` (adjacent, auto-discovered by pipeline)
- **GUID:** `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf`
- **supportsFullBleed:** `true`
- **Pipeline impact:** No changes to `build-spfx-package.ts`. The existing multi-manifest pipeline discovers, shim-generates, and packages the new manifest automatically alongside all existing webpart manifests.
- **No existing webpart removed from packaging.**

## 5. Build verification evidence

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | Clean pass |
| `pnpm --filter @hbc/spfx-hb-webparts build` | Success: `hb-webparts-app.js` 1,014 KB, CSS 153 KB |
| Lint (new files) | No new lint issues |
| Lint (pre-existing) | 4 pre-existing errors in unrelated files (useHostSafeLayout.ts, useCompanionRole.ts, pnpOps files) |

## 6. Proof: absorbed modules render through hb-homepage

Each module is composed in `HbHomepageShell.tsx` in fixed zone order:

- **CompanyPulse** — receives `config.companyPulse` + `activeAudience`, delegates to `HbcNewsroomSurface`
- **LeadershipMessage** — receives `config.leadershipMessage`, delegates to `HbcEditorialSurface`
- **ProjectPortfolioSpotlight** — receives `config.projectPortfolioSpotlight` + `activeAudience`, delegates to `HbcProjectSpotlightSurface`
- **PeopleCulturePublic** — receives `config.peopleCulturePublic` + `identity` + `profilePhotoResolver`, preserves split-runtime boundary
- **HbKudos** — receives `config.hbKudos` + `identity` + `getGraphToken`, preserves split-runtime contract

All modules render through their existing component interfaces. No module source files were modified.

## 7. Proof: hbSignatureHero remains independent

- `hbSignatureHero` (GUID `28acd6a7-2582-4d8a-86d4-b52bfbeb375c`) is not imported, referenced, or composed inside `hbHomepage`.
- Its standalone mount.tsx registration is unchanged.
- Its manifest is unchanged.
- The `hb-homepage` shell renders only the post-hero operating layer.

## 8. Proof: shell layout ownership is real

- The shell owns vertical rhythm between zones via CSS flex gap (responsive: 2rem → 2.5rem → 3rem at breakpoints)
- Each zone is wrapped in `<section aria-label="...">` by the shell (shell-owned accessibility)
- Each zone is wrapped in `ZoneErrorBoundary` (shell-owned fault isolation)
- Individual module failures are contained — one zone's error does not bring down the shell
- `prefers-reduced-motion: reduce` is honored at shell level via CSS

## 9. Closure statement

**Phase 01 is closed.** The `hb-homepage` composed homepage orchestrator webpart is implemented, mounted, and packaged within `apps/hb-webparts`.

All five target modules render through the shell. `hbSignatureHero` remains independent. All existing standalone public webparts remain operational. No existing manifests, runtime mappings, or packaging behaviors were removed or broken.

### External / environmental constraints not solvable by this package

1. **Communication-site hosted validation:** Full-width rendering behavior (`supportsFullBleed: true`) can only be proven on a deployed SharePoint communication site. Workbench and local dev validate component rendering and mount behavior but not full-width host placement. This requires access to a SharePoint communication site with an app catalog.

2. **Tenant deployment:** Actual `.sppkg` deployment and app-catalog upload require tenant-specific credentials and permissions not available in the local development environment.

3. **Live data validation:** Authored content (list items, configuration payloads) from the real SharePoint tenant are needed to validate the full composition with production data shapes.
