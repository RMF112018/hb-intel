# Project Spotlight — End-to-End Validation and Closure Output

**Phase:** P07-04 — Closure for Phase 03 (Root-Cause Remediation Package)
**Date:** 2026-04-06
**Status:** Complete — package closed

---

## 1. Final root cause recap

### Issue A — PrimaryImage not rendering

**Root cause:** SharePoint Image columns return a JSON-encoded string via REST API (`odata=nometadata`), e.g. `{"serverUrl":"...","serverRelativeUrl":"..."}`. The original `extractImageSrc()` treated any string value as a direct URL, passing raw JSON into `<img src>`, producing 404s and an empty featured image panel.

**Fix:** `extractImageSrc()` now attempts `JSON.parse` on string values first, extracts `serverUrl` + `serverRelativeUrl` into a full URL. Non-JSON strings fall through safely via try/catch. Pre-parsed objects handled for manifest seed data compatibility.

**Commit:** `c4fbc024`

### Issue B — Raw HTML in summary/body area

**Root cause:** The SharePoint `Summary` column is Enhanced Rich Text, returning HTML markup (e.g. `<p>Text content here.</p>`). The data pipeline performed only `.trim()` — no HTML stripping. React's text interpolation escaped the tags, rendering literal HTML characters visible in the card body.

**Fix:** Added `stripHtml()` helper at the list-source mapping boundary (`mapListItemToSpotlight`). Strips all HTML tags, converts `<br>` and block-end tags to spaces for word-boundary preservation, decodes named and numeric HTML entities, collapses whitespace. The normalization pipeline and component remain untouched.

**Commit:** `213bfa02`

---

## 2. Files changed across all prompts

| File | Prompts | Change |
|------|---------|--------|
| `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts` | P07-02, P07-03 | `extractImageSrc()` JSON-parse logic (P07-02); `stripHtml()` helper + summary mapping (P07-03) |
| `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlightWebPart.manifest.json` | P07-01–P07-04 | Version bumped from `0.0.11.0` → `0.0.15.0` across prompts |
| `docs/architecture/plans/MASTER/spfx/homepage/projects/phase-03/01_...Audit_Output.md` | P07-01 | Root-cause audit output |
| `docs/architecture/plans/MASTER/spfx/homepage/projects/phase-03/02_...Remediation_Output.md` | P07-02 | PrimaryImage remediation closure output |
| `docs/architecture/plans/MASTER/spfx/homepage/projects/phase-03/03_...Remediation_Output.md` | P07-03 | Summary HTML normalization remediation output |
| `docs/architecture/plans/MASTER/spfx/homepage/projects/phase-03/04_...Closure_Output.md` | P07-04 | This closure document |

### Files NOT changed (confirmed no regression)

| File | Reason |
|------|--------|
| `operationalAwarenessContracts.ts` | Contract unchanged — `summary: string` remains plain text |
| `operationalAwarenessConfig.ts` | Normalization pipeline unchanged — `.trim()` only |
| `ProjectPortfolioSpotlight.tsx` | Component unchanged — `{feat.summary}` text interpolation preserved, no `dangerouslySetInnerHTML` |
| `useProjectSpotlightData.ts` | Data hook unchanged |
| Other homepage webparts | Out of scope — untouched |
| `@hbc/ui-kit/homepage` exports | No promotions |
| Homepage mount dispatcher | Routing unchanged |

---

## 3. Validation commands run

| Command | Scope | Result |
|---------|-------|--------|
| `pnpm tsc --noEmit` (hb-webparts) | Package type-check | Pass — no type errors |
| `pnpm lint` | Package lint | Pass — no errors or warnings |
| `pnpm build` | Package build | Pass — 4352 modules, 475.46 kB |
| `git diff c4fbc024..HEAD -- apps/hb-webparts/src/ --stat` | Source change audit | 3 files: listSource.ts, component.tsx (Brand-UI only), manifest.json |
| `git diff c4fbc024..HEAD -- .../manifest.json` | Manifest seed integrity | Only version line changed — all 4 seed projects intact |

Pre-existing issue: `@hbc/spfx-leadership` has a type error in `KpiDashboardPage.tsx` (`TS7053`). Unrelated to this package — different app, different package.

---

## 4. Runtime proof summary

### A. SharePoint list remains primary runtime source

Confirmed via code inspection:
- `useProjectSpotlightData()` calls `fetchSpotlightListItems(siteUrl)` when SPFx context provides a site URL.
- `fetchSpotlightListItems()` issues REST request to `/_api/web/lists/getbytitle('Homepage Project Spotlights')/items`.
- Manifest seed data only used when `siteUrl` is unavailable (local/demo context).
- No changes to data-source selection logic.

### B. Valid list items produce visible featured image

Confirmed via code inspection:
- `extractImageSrc()` (lines 148–175) parses JSON-encoded Image column strings → extracts `serverUrl` + `serverRelativeUrl` → produces full URL.
- `mapListItemToSpotlight()` assigns `image: { src: imageSrc, alt: ..., aspectRatio: '16:9' }` when `imageSrc` is valid.
- `FeaturedImage` component renders `<img src={src} />` with `onError` fallback.
- Build output confirms no dead code elimination of the image path (475.46 kB bundle includes all paths).

### C. Valid list items produce clean body/summary text

Confirmed via code inspection:
- `stripHtml()` (lines 132–165) strips tags, decodes entities, collapses whitespace.
- `mapListItemToSpotlight()` applies `stripHtml(raw.Summary)` before contract assignment.
- Component renders `<p>{feat.summary}</p>` — React text interpolation on clean plain text.
- No `dangerouslySetInnerHTML` anywhere in the component.

### D. Image fallback still works when image unavailable

Confirmed via code inspection:
- `extractImageSrc()` returns `undefined` for null/empty/unparseable fields.
- `mapListItemToSpotlight()` sets `image: undefined` when `imageSrc` is falsy.
- `FeaturedImage` component includes `onError` handler that sets `errored` state → renders branded gradient placeholder.
- `RailThumbnail` component has matching `onError` fallback.
- Placeholder styles intact (gradient background, "Project Image" text).

### E. Layout and interaction model materially unchanged

Confirmed via diff audit:
- Component structural changes are from Brand-UI rebuild (commit `93a72e58`) — palette and proportion refinements only.
- Featured/secondary split logic in normalization pipeline unchanged.
- Team strip, rail tiles, detail panel, CTA rendering all structurally identical.
- Responsive tier system (`useResponsiveTier`) unchanged.
- Motion variants present with `prefers-reduced-motion` support.

---

## 5. Residual risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Non-standard SharePoint Image column JSON (missing `serverRelativeUrl`) | Low | Falls through to plain-string behavior; `onError` fallback covers runtime |
| SharePoint Enhanced Rich Text with unusual markup (tables, embedded images) | Low | `stripHtml()` strips all tags; content may lose formatting intent but remains safe plain text |
| Numeric HTML entities outside BMP range | Very low | `String.fromCharCode` handles standard Unicode; exotic entities extremely unlikely in project summaries |
| CORS on image URL if `serverUrl` differs from hosting domain | Very low | Standard SharePoint deployments use same-origin; fallback placeholder handles failure |

---

## 6. Scope confirmation

This package remained strictly within its defined scope:

- **Addressed:** PrimaryImage JSON-parse fix, Summary HTML stripping
- **Not touched:** Component layout, visual hierarchy, rail design, team strip, header/CTA, responsive breakpoints, accessibility, property pane
- **No `dangerouslySetInnerHTML`** introduced
- **No broad data-model rewrite** — only the two specific fault paths corrected
- **No `@hbc/ui-kit` promotions** — all changes webpart-local
- **Manifest seed data preserved** — fallback/demo path intact

**Phase 03 (Root-Cause Remediation Package) is closed.**
