# Homepage Hosted Breakpoint + Packaging Evidence Appendix

Canonical evidence appendix for the flagship hero + entry-stack hosted sign-off required by:

- [`homepage-uiux-audit-checklist.md`](./homepage-uiux-audit-checklist.md) §13 Host-runtime resilience and §14 Validation and closure
- [`homepage-uiux-audit-scorecard.md`](./homepage-uiux-audit-scorecard.md) "Evidence-backed closure" and "Credible compact and hosted behavior"
- [`docs/how-to/verify-hb-intel-homepage-sppkg.md`](../../how-to/verify-hb-intel-homepage-sppkg.md) packaging authority + DOM marker verification
- [`docs/architecture/plans/MASTER/spfx/hero/phase-03/wave-03/Prompt-02-Hosted-Breakpoint-And-Packaging-Proof.md`](../../architecture/plans/MASTER/spfx/hero/phase-03/wave-03/Prompt-02-Hosted-Breakpoint-And-Packaging-Proof.md) canonical breakpoint matrix

This appendix records explicit proof that the flagship hero and the entry stack (hero → launcher band → shell) survive real SharePoint hosting and packaging truth across the audited seven-viewport matrix. Paired with the readability appendix at [`homepage-uiux-audit-evidence.md`](./homepage-uiux-audit-evidence.md), which covers daypart × device readability, this appendix covers hosted behavior and packaging integrity.

## 1. Approved breakpoint matrix

Matches the canonical phase-03/wave-03 proof plan verbatim.

| #   | Viewport     | DPR | Class                  | Expected hero layout mode           | Expected launcher behavior                         |
|-----|--------------|-----|------------------------|-------------------------------------|----------------------------------------------------|
| 1   | 2560 × 1440  | 1   | Ultra-wide desktop     | `premium-wide`                      | Full launcher visible-count                        |
| 2   | 1920 × 1080  | 1   | Standard desktop       | `premium-wide`                      | Full launcher visible-count                        |
| 3   | 1512 × 982   | 2   | Retina laptop          | `premium-wide` or `compact-mid` per resolver | Full or trimmed per overlay doctrine §7.3 |
| 4   | 1366 × 768   | 1   | Legacy laptop          | `compact-mid`                       | Trimmed launcher visible-count                     |
| 5   | 834 × 1210   | 2   | Tablet portrait        | `compact-mid`                       | Tablet launcher device-class                       |
| 6   | 440 × 956    | 3   | Large phone            | `compact-short-height`              | Phone launcher device-class                        |
| 7   | 402 × 872    | 3   | Small phone            | `compact-short-height`              | Phone launcher device-class                        |

Evidence matrix: **7 hosted states**. Screenshots live in [`./evidence/hosted-breakpoints/`](./evidence/hosted-breakpoints/) as `{index}-{viewport}-dpr{n}.png` (e.g. `01-2560x1440-dpr1.png`, `06-440x956-dpr3.png`).

## 2. Hosted page and packaging identity

Source-of-truth identifiers, pulled verbatim from the `hb-homepage` solution authority.

| Field                             | Value                                                 | Source                                                                                         |
|-----------------------------------|-------------------------------------------------------|------------------------------------------------------------------------------------------------|
| Solution name                     | `hb-intel-homepage`                                   | `apps/hb-homepage/config/package-solution.json`                                                |
| Solution id                       | `b7d3f8a1-4c62-4e9b-a851-2d6f0e3c7a49`                | same                                                                                           |
| Solution version                  | `1.1.67.0`                                            | same                                                                                           |
| Feature id                        | `c4e91f7d-8a23-4b56-9d0e-1f3c5a7b2d84`                | same                                                                                           |
| Feature version                   | `1.1.67.0`                                            | same                                                                                           |
| HbHomepageWebPart id              | `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf`                | `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`                     |
| HbHomepageWebPart manifest version| `1.1.67.0`                                            | same                                                                                           |
| `supportsFullBleed`               | `true`                                                | same                                                                                           |
| Preconfigured entry title         | "HB Homepage"                                         | same (preconfiguredEntries[0].title.default)                                                   |

**Cutover rule.** The hosted validation page contains exactly one instance of HbHomepageWebPart (`e0a11c44-…`) in full-width mode. No standalone HbSignatureHero (`28acd6a7-…`) and no standalone PriorityActionsRail instance are permitted. Presence of either on the page is an automatic closure failure per the verify-sppkg runbook.

## 3. Packaged-truth proof

Artifacts generated by `npx tsx tools/build-spfx-package.ts --domain hb-homepage`, regeneratable on demand.

| Artifact                                              | SHA-256                                                              |
|-------------------------------------------------------|----------------------------------------------------------------------|
| `dist/sppkg/hb-intel-homepage.sppkg`                  | `54087b954b2d719fc732bb9c74179ddb4ab96753f4b4a0e7566a27370f505408`   |
| `dist/sppkg/hb-intel-homepage-effectiveness-proof.json` | `a5fa362ff530dd00f1e5f583a580d4ff4ecf0d5a52a926cbffad242210316e70` |
| `dist/sppkg/hb-homepage-package-truth-proof.json`     | `334f58ae95b330ca1f360005d3aa44504d82e38b17c49d2d7f669694c1b3fa94`   |
| `dist/sppkg/hb-homepage-shim-proof.json`              | `804d333cc06060928acb469f77847181f3a2c33bce6bc3bbbb46afeb0f9b18e4`   |

**Effectiveness proof key assertions** (from `hb-intel-homepage-effectiveness-proof.json`, packagingRunId `2026-04-21T09:14:19.747Z-d18daf60`):

- `versionAuthorityAligned` — **pass**. `solution.version`, `features[0].version`, and webpart manifest version all match at `1.1.67.0`.
- `flagshipMarkersPresent` — **pass**. All five distinctive launcher/entry-stack runtime markers found in the packaged bundle:
  - `homepage-launcher` surface id
  - `data-hb-homepage-entry-stack` wrapper root marker
  - `data-hbc-homepage-launcher-version`
  - `data-hbc-homepage-launcher-device-class`
  - `data-hbc-homepage-launcher`
- `homepageBannerAssetsPresent` — **pass**. All four canonical hero banners are shipped in `ClientSideAssets/` with recorded SHA-256 and sizes (`banner_home_7_morning.png`, `banner_home_7_mid-day.png`, `banner_home_7_evening.png`, `banner_home_7_night.png`).
- Packaged app bundle: `ClientSideAssets/hb-homepage-app-8303b7bd.js` (2,411,673 bytes, sha256 `8303b7bd…c4bf`).
- Packaged shim entry for the HbHomepageWebPart id: `shell-entry-e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf-6ccb2757.js` (13,101 bytes).

**Package authority test.** `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepagePackageAuthority.test.ts` enforces that `solution.version === features[0].version === webpart manifest version` and that duplicate homepage manifest copies plus launcher runtime version constant remain in lockstep. The build-time orchestrator (`tools/build-spfx-package.ts`) refuses to emit `.sppkg` when these diverge. All gates pass at `1.1.67.0` in the current artifact set.

Reviewers regenerate and diff with:

```bash
npx tsx tools/build-spfx-package.ts --domain hb-homepage
shasum -a 256 dist/sppkg/hb-intel-homepage.sppkg dist/sppkg/hb-intel-homepage-effectiveness-proof.json dist/sppkg/hb-homepage-package-truth-proof.json dist/sppkg/hb-homepage-shim-proof.json
```

## 4. Per-breakpoint capture table

> **Status: hosted capture session required.** Rows below are the evidence template. Do not mark a row `Pass` without a real PNG in `./evidence/hosted-breakpoints/` and the measured numbers read from the live DOM.

| #   | Viewport × DPR   | Screenshot                   | Hero layout mode | Hero height (px) | Launcher visible count | First-lane first-view | Pass/Fail |
|-----|------------------|------------------------------|------------------|------------------|------------------------|-----------------------|-----------|
| 1   | 2560×1440 dpr1   | `01-2560x1440-dpr1.png`      | _pending_        | _pending_        | _pending_              | _pending_             | _pending_ |
| 2   | 1920×1080 dpr1   | `02-1920x1080-dpr1.png`      | _pending_        | _pending_        | _pending_              | _pending_             | _pending_ |
| 3   | 1512×982 dpr2    | `03-1512x982-dpr2.png`       | _pending_        | _pending_        | _pending_              | _pending_             | _pending_ |
| 4   | 1366×768 dpr1    | `04-1366x768-dpr1.png`       | _pending_        | _pending_        | _pending_              | _pending_             | _pending_ |
| 5   | 834×1210 dpr2    | `05-834x1210-dpr2.png`       | _pending_        | _pending_        | _pending_              | _pending_             | _pending_ |
| 6   | 440×956 dpr3     | `06-440x956-dpr3.png`        | _pending_        | _pending_        | _pending_              | _pending_             | _pending_ |
| 7   | 402×872 dpr3     | `07-402x872-dpr3.png`        | _pending_        | _pending_        | _pending_              | _pending_             | _pending_ |

Hero height is read from `data-hbc-hero-height-budget-min` / `…-max` on the hero `<section>`. Hero layout mode is read from `data-hbc-hero-layout-mode`. Launcher visible count is the count of rendered launcher tiles in the `data-hbc-homepage-launcher` region. First-lane first-view = the header of the first shell lane after the launcher is at least partially visible above the fold at native viewport height (no scroll).

## 5. Behavior notes (required prose)

Each sub-section requires ≥ 2 sentences tied to real captured runtime, not theory.

### 5.1 Hero height behavior

_pending capture session_ — Describe how the hero height budget transitions across `premium-wide` → `compact-mid` → `compact-short-height`. Call out any banding, jank, or discontinuity at the 1512×982 dpr2 boundary where the mode resolver can swing. Note whether `data-hbc-hero-height-budget-min/max` stays within policy at every viewport.

### 5.2 Launcher behavior

_pending capture session_ — Describe launcher device-class binding per UI Doctrine Homepage Overlay §7.1–§7.4. Confirm `resolveLauncherDeviceClass()` picks the expected class at each viewport, visible-count trims correctly, and the launcher does not collide with SharePoint host chrome (command bar, comments pane, right rail). Confirm `HBC_HOMEPAGE_LAUNCHER_VISIBLE_COUNT` matches the rendered tile count.

### 5.3 First-lane first-view behavior

_pending capture session_ — Describe whether the entry stack leaves enough room for the first shell lane (Company Pulse) header to be at least partially visible above the native-viewport fold at each breakpoint. Call out any breakpoint where the launcher + hero consume the full viewport and push the first lane entirely below the fold; that is a first-view contract failure.

### 5.4 Handheld + tablet compact-state behavior

_pending capture session_ — Describe touch-target sizes, safe-area handling, scroll-start position, and any CTA truncation at 402×872 dpr3, 440×956 dpr3, and 834×1210 dpr2. Confirm greeting, tagline, and logo all remain readable in compact-short-height (cross-reference the readability appendix), and that no primary action is hidden under host chrome.

## 6. DOM marker readouts

For each captured breakpoint, paste the observed marker values before closure. Template:

```
[breakpoint N — viewport dpr]:
  data-hb-homepage-entry-stack: root                          // required present
  data-hb-homepage-entry-stack-region="hero": present          // required
  data-hb-homepage-entry-stack-region="launcher": present      // required
  data-hbc-homepage-launcher-device-class:                      // desktop | tablet | phone
  data-hbc-homepage-launcher-version:                           // per overlay doctrine
  data-hbc-priority-rail-context="homepage-flagship": absent    // MUST be absent (cutover rule)
  data-hbc-hero-layout-mode:
  data-hbc-hero-banner-file:
  data-hbc-hero-height-budget-min:
  data-hbc-hero-height-budget-max:
  data-hbc-hero-width:
```

Presence of `data-hbc-priority-rail-context="homepage-flagship"` anywhere on the hosted page means the cutover rule is broken and the whole appendix fails until remediated.

## 7. Packaged-result-matches-source confirmation

Per the scorecard hard-stop failure "Weak packaged result that does not match source intent," this section links source → packaging → runtime for each breakpoint.

**Source intent.** HbHomepageWebPart preconfiguredEntries define a "Composed homepage orchestrator surface rendering Company Pulse, Leadership Message, Project Portfolio Spotlight, Safety Field Excellence, People & Culture Public, and HB Kudos in a governed shell with entry-stack contract and preset-driven layout." The entry stack is implemented in `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx` (hero + launcher) and `HbHomepageShell.tsx` (zone ordering).

**Packaging truth.** §3 above confirms the `.sppkg` ships the app bundle, the shim entry for `e0a11c44-…`, and the four canonical hero banners — matching the declared runtime paths in `criticalRuntimePaths` of the effectiveness proof.

**Runtime truth.** §6 readouts per breakpoint must show the entry-stack wrapper marker, both region markers, the launcher markers, and the expected hero layout mode. Any missing marker at any breakpoint is a source/runtime mismatch.

| Breakpoint | Source intent covered | Packaging truth | Runtime markers | Verdict |
|------------|-----------------------|-----------------|-----------------|---------|
| 1 2560×1440 dpr1 | entry-stack + zones | §3 pass         | _pending_       | _pending_ |
| 2 1920×1080 dpr1 | entry-stack + zones | §3 pass         | _pending_       | _pending_ |
| 3 1512×982 dpr2  | entry-stack + zones | §3 pass         | _pending_       | _pending_ |
| 4 1366×768 dpr1  | entry-stack + zones | §3 pass         | _pending_       | _pending_ |
| 5 834×1210 dpr2  | entry-stack + zones | §3 pass         | _pending_       | _pending_ |
| 6 440×956 dpr3   | entry-stack + zones | §3 pass         | _pending_       | _pending_ |
| 7 402×872 dpr3   | entry-stack + zones | §3 pass         | _pending_       | _pending_ |

## 8. Capture procedure (for the human running the session)

1. Deploy `dist/sppkg/hb-intel-homepage.sppkg` (sha256 `54087b95…5408`) to the tenant app catalog. Confirm the catalog shows `1.1.67.0`.
2. Open the canonical hosted homepage page (the page referenced in [`docs/how-to/verify-hb-intel-homepage-sppkg.md`](../../how-to/verify-hb-intel-homepage-sppkg.md)). Confirm only one HbHomepageWebPart instance is present; no standalone HbSignatureHero or PriorityActionsRail.
3. In Chrome DevTools, set device emulation to each viewport × DPR in §1 exactly. Do not rely on zoom. Hard reload between viewports.
4. Before capturing, open the Elements panel and confirm the markers in §6 template. Copy the readout block into §6.
5. Capture a full-viewport PNG (no scroll; just the native above-the-fold view). Save with the prescribed filename in `./evidence/hosted-breakpoints/`.
6. Record the measured numbers into §4. Write the §5 prose at capture time, not after the fact.
7. For §7, mark each row Pass only when packaging §3 is pass AND §6 runtime markers are all present AND §5 prose contains no regressions.

## 9. Closure gate

Appendix is **not closed** until:

- Every `_pending_` in §4 has a measured number.
- Every row in §4 links to a real PNG in `./evidence/hosted-breakpoints/`.
- Every §6 readout block is populated per breakpoint.
- Every §7 row is Pass.
- Every §5 prose sub-section is real capture-time description, not placeholder.
- §3 hashes still match the artifacts on disk at closure time (regenerate + re-hash to confirm).

If any breakpoint fails and is accepted as an explicit exception instead of remediated, add an "Accepted exceptions" sub-section with rationale and a linked ADR or audit decision.
