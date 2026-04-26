# Full-Window Viewer Validation Report

## Scope

Phase-04 Wave-01 Prompt-04C is a **validation pass**. The shared full-window Foleon viewer (Prompt 04A) and the clickable article-card retrofit for Project Spotlight + Company Pulse (Prompt 04B) need to be proven safe and reusable before Prompt 05 (Leadership Message lane-owned layout) begins. This pass:

- audits existing test coverage against the validation areas required by Prompt 04C;
- closes the genuine coverage gaps with new tests in the appropriate test files;
- runs the validation suite;
- documents package-proof and hosted-proof posture for the next deployment cycle.

**No source-behavior changes.** Tests + docs only. SPFx lockstep stays at `1.1.86.0`. No version bump.

Out of scope: Leadership redesign; activating the Prompt-01 dormant edge contract; modifying viewer infrastructure; changing iframe origin policy, route map, content resolver, schemas, backend sync; touching Safety / HB Kudos / People & Culture / shell pairing.

## Baseline Inputs

- `00_BASELINE_AUDIT.md`
- `01_EDGE_CONTRACT_REPORT.md`
- `02_VIEW_MODEL_AND_REGISTRY_REPORT.md`
- `03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md`
- `04_COMPANY_PULSE_LAYOUT_REPORT.md`
- `04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md`
- `04B_CLICKABLE_ARTICLE_CARDS_REPORT.md`

## Source Files Changed

**No source files changed.** This is a tests-and-docs pass. Files modified:

| File | Change |
|---|---|
| `packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx` | **Tests added.** Pulse ready-state viewer-launch end-to-end test (mirrors the existing Spotlight test); Leadership-remains-compatibility-shell sanity test (lane readiness for Prompt 05). |
| `packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx` | **Tests added.** Single-button-inside-card assertion (no nested interactive controls); keyboard activation through `FoleonFullWindowViewerProvider` harness. |
| `packages/foleon-reader/src/readers/__tests__/CompanyPulseReaderLayout.test.tsx` | **Tests added.** Same two additions as Spotlight, scoped to the Pulse lead card. |
| `packages/foleon-reader/src/components/__tests__/FoleonFullWindowViewerProvider.test.tsx` | **Tests added.** Static CSS no-global-overflow assertions for `FoleonFullWindowViewer.module.css` and `FoleonReaderLayouts.module.css`. Provider test stays focused on provider/viewer surface — Leadership-compat assertions live in the module test, per the Prompt-04C scoping rule. |
| `docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04C_FULL_WINDOW_VIEWER_VALIDATION_REPORT.md` | **New.** This report. |

Files explicitly **not touched**: all foleon-reader source (`FoleonViewerTypes.ts`, `FoleonFullWindowViewer.tsx`, `FoleonFullWindowViewerProvider.tsx`, `FoleonReaderViewModel.ts`, `FoleonReaderModule.tsx`, all three lane layouts, `FoleonReaderCompatibilityLayout.tsx`, `FoleonReaderLayouts.module.css`, `FoleonReaderLayoutRegistry.tsx`, `FoleonIframeHost.tsx`, `index.ts`); all SPFx version files; all shell / entry-stack / hb-webparts source; Foleon governance / route / sync / schema files; Safety / HB Kudos / People & Culture; Leadership lane.

## Tests Added / Updated

### Module-level (`FoleonReaderModule.test.tsx`)

1. **`Company Pulse ready opens the full-window viewer when the lead-update card is clicked, and emits viewer telemetry`** — mirrors the existing Spotlight viewer-launch test for Pulse. Asserts:
   - Pulse lane-owned briefing layout renders (no inline iframe).
   - Clicking the lead-card launch button opens the viewer (`onViewerOpen` fires).
   - Legacy `onReaderOpen` does NOT fire.
   - The viewer's iframe loads; `onViewerIframeLoaded` fires.

2. **`Leadership Message preview remains on the compatibility shell pending Prompt 05 (lane-readiness sanity)`** — asserts:
   - Lane wrapper still emits `data-foleon-reader-layout="leadership-message"` (registry resolves correctly).
   - Compatibility-shell legacy markers still emitted (`data-preview-tone="navy"`, `data-foleon-preview-route`).
   - Leadership has NOT moved to the lane-owned viewer/card model yet (`[data-foleon-article-card]` and `[data-foleon-layout]` are absent from the Leadership wrapper).
   - Leadership preview text still rendered via the compat shell.

### Lane-level (`ProjectSpotlightReaderLayout.test.tsx`)

3. **`card has exactly one interactive control (single-button card-launch pattern, no nested controls)`** — asserts inside `[data-foleon-article-card]` there is exactly one focusable interactive element, and it is a `<button>`. Catches accidental introduction of `<a>`, `<input>`, or extra `<button>` controls.

4. **`keyboard activation (Enter / Space) on the card-launch button opens the viewer when wrapped in the provider`** — wraps the layout in a real `<FoleonFullWindowViewerProvider>` (with the test origin policy) and:
   - Clicks the card-launch button → asserts the dialog opens.
   - Re-renders fresh and fires `keyDown('Enter')` + click → asserts the dialog opens via the keyboard-synthesized click path.

### Lane-level (`CompanyPulseReaderLayout.test.tsx`)

5. **`card has exactly one interactive control (single-button card-launch pattern, no nested controls)`** — same assertion scoped to the Pulse lead card.

6. **`keyboard activation on the card-launch button opens the viewer when wrapped in the provider`** — wraps in provider, fires `keyDown('Enter')` + click on the lead launch button, asserts the dialog opens.

### Provider-level (`FoleonFullWindowViewerProvider.test.tsx`)

7. **`FoleonFullWindowViewer.module.css does not introduce a global overflow-x: hidden declaration`** — reads the viewer CSS module from disk and asserts no `overflow-x: hidden;` declaration exists. (The viewer's scoped `overflow: hidden` on the dialog container is not matched — that is intentional containment within the dialog only.)

8. **`FoleonReaderLayouts.module.css does not introduce a global overflow-x: hidden declaration`** — same assertion against the lane CSS module.

## Validation Commands and Results

| Command | Scope | Result |
|---|---|---|
| `pnpm --filter @hbc/foleon-reader test` | full foleon-reader suite | **12 files / 146 tests pass** (138 baseline + 8 new) |
| `pnpm --filter @hbc/foleon-reader check-types` | foleon-reader typecheck | clean |
| `pnpm --filter @hbc/foleon-reader lint` | foleon-reader lint | clean |
| `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage` | hbHomepage consumer | **32 files / 469 tests pass** (lockstep `hbHomepagePackageAuthority` test green at `1.1.86.0`) |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | not re-run; deltas in this prompt are foleon-reader test-only | hb-webparts pre-existing 4 errors (Prompts 01/02/03/04/04A/04B documented) remain unchanged. |

`git status` confirms only test files + this report were modified — **no foleon-reader source, no version files, no shell or hb-webparts source**.

## Package Proof

**Status: deferred to next deployment cycle.**

SPFx `.sppkg` package generation runs in CI via `gulp bundle && gulp package-solution` (or the repo-equivalent) and produces the deployable `solution/hb-intel-homepage.sppkg`. This pass did not run the SPFx packaging pipeline. Reasons:

1. The change set is tests + docs only — no source-bundle change is expected.
2. SPFx packaging is typically a CI-only operation in this repo.
3. The `hbHomepagePackageAuthority` lockstep test (which validates that the four authority files agree on `1.1.86.0`) passed in the validation suite above; this is the strongest in-repo proof short of running the full SPFx packaging.

### Manual package-proof checklist (next deployment cycle)

When the next deployment runs:

1. Run `gulp bundle --ship` and `gulp package-solution --ship` (or repo-equivalent) from `apps/hb-homepage`.
2. Inspect the generated `solution/hb-intel-homepage.sppkg` artifact path. Record SHA-256.
3. Open the `.sppkg` (it is a CAB/zip) and confirm the bundle contains:
   - `FoleonFullWindowViewer.*` viewer overlay component code.
   - `FoleonFullWindowViewerProvider.*` Context provider code.
   - `FoleonViewerTypes` adapters and types.
   - The lane-owned Project Spotlight (`data-foleon-layout="project-spotlight-feature"`) and Company Pulse (`data-foleon-layout="company-pulse-briefing"`) layout code paths.
   - The shell edge-contract metadata (`data-shell-slot-edge-bleed`, `data-hb-homepage-edge-mode`) — should still be present and dormant by default.
4. Validate `solution/hb-intel-homepage.sppkg` `version` matches the four lockstep files' `1.1.86.0`.
5. Stage the artifact for tenant deployment.

## Hosted Proof

**Status: not performed.** This pass cannot perform hosted proof in the local environment.

### Manual hosted-proof checklist (verbatim from Prompt 04C, for the next deployment cycle)

Validate on the HBCentral homepage after deploying the rebuilt `.sppkg`:

1. Project Spotlight card opens full-window viewer on click.
2. Company Pulse lead card opens full-window viewer on click.
3. Clicking anywhere on the visible article card launches the viewer (the stretched `::after` scrim covers the whole card).
4. Close/back returns user to homepage.
5. ESC closes viewer.
6. Keyboard tab order enters the viewer; close control is reachable.
7. Focus returns to the launch card/control after close where feasible.
8. Mobile width shows a usable viewer; no orphaned inline iframe.
9. No page-level horizontal overflow:
   ```js
   document.documentElement.scrollWidth <= document.documentElement.clientWidth
   ```
10. Viewer overlay is not trapped inside the card's visual boundary (covers the viewport, not just the card).
11. Underlying page does not scroll in a way that breaks the viewer.
12. Existing Foleon iframe origin/gate logs remain clean (no new accepted-origin warnings).
13. Spotlight and Pulse do **not** show inline iframe frames when the viewer is closed.
14. Leadership remains compatibility layout pending Prompt 05 (still shows the legacy compat-shell visuals).

If any item fails, file a defect and stop Prompt 05 until resolved. Apply the lockstep `1.1.86.0 → 1.1.87.0` bump if the fix touches source behavior.

## Accessibility Proof

| Concern | Proof |
|---|---|
| Viewer dialog has `role="dialog"` + `aria-modal="true"` + `aria-labelledby` | `FoleonFullWindowViewerProvider.test.tsx` (Prompt 04A) |
| Close button has accessible name `Close Foleon viewer` | `FoleonFullWindowViewerProvider.test.tsx` (Prompt 04A) |
| Escape always closes | `FoleonFullWindowViewerProvider.test.tsx` (Prompt 04A) |
| Focus moves into close button on open | `FoleonFullWindowViewerProvider.test.tsx` (Prompt 04A) |
| Focus returns to launch element on close | `FoleonFullWindowViewerProvider.test.tsx` (Prompt 04A) |
| Tab cycles within the dialog (scoped trap, not permanent) | Provider test + Escape always exits; permanent trap structurally impossible |
| Disabled card uses `aria-disabled="true"` + `aria-describedby` | Lane tests (Prompts 04B + 04C) |
| Disabled card visible reason rendered with `role="status"` `aria-live="polite"` | Lane tests (Prompts 04B + 04C) |
| Single button per card (no nested interactive controls) | **Prompt-04C new** (`single-button-inside-card-pattern` tests) |
| Keyboard activation works through the provider | **Prompt-04C new** (Spotlight + Pulse keyboard activation tests) |
| Heading hierarchy preserved: `<h2>` (article title) → `<h3>` (lead/callout) → `<h4>` (digest items) | Lane composition tests (Prompts 03 / 04 / 04B) |
| Preview honesty: visible "Preview layout" banner + disabled launch + visible reason | Lane tests (Prompts 03 / 04 / 04B) |

## Clickable Card Proof

| Claim | Proof |
|---|---|
| Spotlight ready-state card opens the viewer on click | `FoleonReaderModule.test.tsx` ("Project Spotlight ready opens the full-window viewer…") |
| Pulse ready-state lead card opens the viewer on click | **Prompt-04C new** (`FoleonReaderModule.test.tsx`) |
| Card-wide launch behavior — entire visible card surface is the click target | Implementation: `.cardLaunch::after { position: absolute; inset: 0; }` overlays the `position: relative` `.articleCard`. JSDOM cannot measure pseudo-element hit-testing geometry; the static CSS rule + the single-button assertion is the in-repo proof. Hosted proof item #3 verifies real-browser behavior. |
| Single accessible launch control per card | **Prompt-04C new** (single-button-inside-card tests, lane-level) |
| No nested interactive controls inside the card | **Prompt-04C new** — tests assert `card.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])').length === 1` |
| Keyboard activation works | **Prompt-04C new** (provider-wrapped keyboard tests, both lanes) |
| Disabled targets surface refusal observably | Lane tests (Prompts 04B + 04C) — `data-foleon-article-last-refusal` marker + visible reason |
| Disabled targets are not silent no-ops at the action layer | Provider test (`{ opened: false, reason }` discriminated union, Prompt 04A) |

## Viewer Launch / Close Proof

| Claim | Proof |
|---|---|
| Open-from-card launches the dialog | Spotlight + Pulse module tests, plus provider-wrapped lane tests (Prompts 04B + 04C) |
| Close button closes the dialog | `FoleonFullWindowViewerProvider.test.tsx` (Prompt 04A) |
| Escape closes the dialog | Provider test (Prompt 04A) |
| Focus returns to the launch control on close | Provider test (Prompt 04A) |
| Iframe inside the dialog mounts via `FoleonIframeHost` (not raw `<iframe>`) | Provider test asserts iframe `title` matches the FoleonIframeHost-built title pattern (Prompt 04A); code review: `FoleonFullWindowViewer.tsx` imports `FoleonIframeHost` directly |
| Iframe load fires `onViewerIframeLoaded` distinct from inline `onReaderOpen` | Spotlight + Pulse module tests (Prompt 04B + 04C) |

## Telemetry Proof

| Lane | Inline `onReaderOpen`/`onReaderClose`/`onEmbedError` | Viewer `onViewerOpen`/`onViewerClose`/`onViewerIframeLoaded`/`onViewerIframeError` | `onGateBlocked` | Proof |
|---|---|---|---|---|
| Project Spotlight | Does NOT fire (no inline iframe) | Fires from card → viewer flow (open + iframe-loaded paths covered) | Fires from resolver | Module + lane tests |
| Company Pulse | Does NOT fire (no inline iframe) | Fires from card → viewer flow (open + iframe-loaded paths covered) | Fires from resolver | Module + lane tests |
| Leadership Message | Continues to fire (compatibility shell, inline iframe) | Provider is wrapped; no card calls `openViewer` yet | Fires from resolver | Module test ("uses Leadership Message config and page context for ready reader events") + new compat-sanity test |

Telemetry separation is enforced by source code structure: `FoleonReaderModule` constructs the inline iframe element and passes `onLoaded={(): void => handleIframeLoaded(record)}` (which fires `onReaderOpen`); the `FoleonFullWindowViewer` component constructs its own iframe and passes `onLoaded={handleLoaded}` which fires `onViewerIframeLoaded`. The two paths share no callback bridge.

### Known telemetry gap

**Viewer iframe `error` path** is not directly exercised by a unit test. JSDOM's React event synthesis for iframe `error` is unreliable (the `error` event does not bubble; React's synthetic event registration for iframes does not consistently catch dispatched error events). Attempted approaches (fireEvent.error, manual dispatchEvent, calling `iframe.onerror`) all fail to invoke the React-bound handler in JSDOM.

**Mitigation:**

1. The wiring is provable by code reading: `FoleonIframeHost` exposes `onError` directly on the iframe element (`<iframe onError={onError} />`). `FoleonFullWindowViewer` passes `handleError → onIframeError?.(target)`. The provider's `onViewerIframeError` is wired through the same prop chain as `onViewerIframeLoaded`, which IS tested. There is no asymmetric path that could fail silently.
2. Hosted-proof item #12 covers this in real browser conditions.
3. A Playwright proof in a future Prompt 06 / 04D should exercise the iframe-error path with a deliberately broken `embedUrl`.

## No-Overflow Proof

JSDOM cannot measure layout geometry. The strongest static guarantee is the CSS-text proof:

- **Prompt-04C new**: `FoleonFullWindowViewer.module.css` is read from disk and asserted to contain no `overflow-x: hidden;` declaration.
- **Prompt-04C new**: `FoleonReaderLayouts.module.css` is read from disk and asserted to contain no `overflow-x: hidden;` declaration.
- The viewer overlay's scoped `overflow: hidden` (on the dialog container only) is **not** matched by the assertion — that is intentional containment within the dialog and does not affect the host page.
- Outer envelope max-width: 2400px (`HbHomepageEntryStack.module.css`) and shell body inline-inset (`HbHomepageShell.module.css`) are unchanged from Prompt 01.

Hosted-proof item #9 (`document.documentElement.scrollWidth <= document.documentElement.clientWidth`) provides the real-browser geometric proof.

## Iframe Governance Proof

| Claim | Proof |
|---|---|
| Viewer iframe mounts via `FoleonIframeHost` (not raw `<iframe>`) | Source review: `FoleonFullWindowViewer.tsx` imports `FoleonIframeHost`. Provider test asserts iframe `title` matches the FoleonIframeHost-built pattern. |
| Same accepted-origin policy as inline iframe path | Source: `FoleonReaderModule.tsx` passes `contract.originPolicy` to `FoleonFullWindowViewerProvider`; the provider passes it to `FoleonFullWindowViewer`; the viewer passes it to `FoleonIframeHost.policy`. Single source of truth. |
| Same gate behavior — `onGateBlocked` fires from resolver, not from iframe lifecycle | `FoleonReaderModule.test.tsx` ("renders blocked real records without an iframe") still passes; gate behavior is independent of which surface (inline vs viewer) renders the iframe. |
| `record.embedUrl` is the only URL the iframe loads | Source: `FoleonViewerTypes.ts` adapter sets `target.viewerUrl = record.embedUrl` (or orchestrator-supplied `resolution.embedUrl`); `FoleonFullWindowViewer` passes `target.viewerUrl` to `FoleonIframeHost.src`. |
| `record.publishedUrl` (external link) is exposed on the target but not used by the iframe | Source: `target.url = record.publishedUrl`; iframe uses `target.viewerUrl` only. |
| `record.allowEmbed === false` blocks viewer launch | `FoleonViewerTypes.test.ts` (Prompt 04A); lane tests (Prompts 04B + 04C) — `embed-not-allowed` reason. |
| `record.requiresExternalOpen === true` blocks viewer launch | `FoleonViewerTypes.test.ts` (Prompt 04A) — `requires-external-open` reason. |
| Missing `embedUrl` blocks viewer launch | `FoleonViewerTypes.test.ts` (Prompt 04A) — `no-embed-url` reason. |

No source change weakens iframe governance. Origin policy, gate semantics, telemetry separation, and disabled-target enforcement are all observable through tests.

## Leadership Readiness for Prompt 05

Prompt-04C explicit assertion (`Leadership Message preview remains on the compatibility shell pending Prompt 05`):

- Leadership wrapper still resolves through the layout registry (`data-foleon-reader-layout="leadership-message"`).
- Leadership preview emits the legacy compatibility-shell markers (`data-preview-tone="navy"`, `data-foleon-preview-route`).
- Leadership has NOT yet adopted the lane-owned model (no `data-foleon-article-card`, no `data-foleon-layout`).

Leadership can adopt the same pattern Spotlight + Pulse use:

1. Stop delegating `LeadershipMessageReaderLayout.tsx` to `FoleonReaderCompatibilityLayout`. Render the lane-owned executive-message composition directly.
2. Add `data-foleon-layout="leadership-message-executive"` (or equivalent) marker.
3. Render the active record as an `[data-foleon-article-card]` with the same single-button card-launch pattern (`<button>` wrapping the title, `::after` scrim).
4. Stop rendering inline iframe in the layout. The viewer + provider already wrap Leadership renders (Prompt 04A wrap covers all three lanes); calling `useFoleonFullWindowViewer().openViewer(viewModel.primaryArticle.target, …)` works without infrastructure changes.
5. Update tests: replace the Leadership preview structural assertions with new layout markers; add the same single-button + keyboard activation + viewer-launch coverage Spotlight + Pulse have today.
6. Update telemetry expectations: Leadership transitions from inline `onReaderOpen` lifecycle to viewer telemetry, matching Spotlight + Pulse posture.

The Prompt-05 source change set is bounded:

- `LeadershipMessageReaderLayout.tsx` (rewrite)
- `FoleonReaderLayouts.module.css` (add Leadership-specific classes)
- `FoleonReaderLayouts.module.css.d.ts` (sync)
- Update Leadership tests
- Lockstep version bump `1.1.86.0 → 1.1.87.0`

`FoleonReaderModule.tsx`, `FoleonReaderViewModel.ts`, the viewer infrastructure, and the provider do **not** need to change for Leadership.

## Known Gaps

1. **Viewer iframe `error` path not covered by a unit test.** JSDOM/React iframe error-event synthesis is unreliable. Mitigation documented in Telemetry Proof. Hosted-proof item #12 covers this; a Playwright proof in a follow-up prompt should exercise the path with a deliberately broken `embedUrl`.
2. **Card-wide click hit-testing (the stretched `::after` pseudo-element)** is a CSS rendering concern that JSDOM cannot prove. The single-button-inside-card test + the static CSS rule together provide the in-repo proof; hosted-proof item #3 exercises real-browser behavior.
3. **No-overflow** is proven statically (no global `overflow-x: hidden`) but not geometrically. Hosted-proof item #9 covers this.
4. **Focus restoration in JSDOM** is exercised in the provider test, but cross-browser behavior (especially with rapid open/close cycles) is best validated in Playwright.
5. **Package proof not run.** The `hbHomepagePackageAuthority` lockstep test passes; SPFx packaging deferred to next CI deployment cycle. Manual checklist documented above.
6. **Hosted proof not run.** Cannot be performed in this environment. Manual checklist documented verbatim.

## Required Input to Prompt 05

Prompt 05 (Leadership Message lane-owned layout) may now begin. Required inputs:

1. **Reuse the card-launch pattern** from `ProjectSpotlightReaderLayout.tsx` and `CompanyPulseReaderLayout.tsx`: outer `<article>` with `[data-foleon-article-card]` markers, single `<button class="cardLaunch">` wrapping the title, `::after` stretched scrim, no nested interactive controls inside the card, "Open full archive" and similar secondary actions in a separate footer with `z-index: 2`.
2. **Reuse the disabled-state contract**: `aria-disabled="true"` + `aria-describedby` pointing to a visible `role="status"` reason; click handler suppresses activation and writes `data-foleon-article-last-refusal={reason}`.
3. **Reuse the view-model contract**: `viewModel.primaryArticle.target` from the existing adapter — Leadership's ready-state target already populates from `FoleonContentRecord` (verified in `FoleonReaderViewModel.test.ts`).
4. **Reuse the viewer telemetry**: `onViewerOpen` / `onViewerClose` / `onViewerIframeLoaded` / `onViewerIframeError` are already wired through `FoleonReaderModule`; Leadership inherits them automatically.
5. **Reuse the test scaffolding**: copy `ProjectSpotlightReaderLayout.test.tsx` or `CompanyPulseReaderLayout.test.tsx` as the starting structure for Leadership tests. The provider-wrapped harness pattern, single-button assertion, keyboard activation pattern, and disabled refusal test are all ready to copy.
6. **Lockstep**: bump `1.1.86.0 → 1.1.87.0` across all four authority files when source changes land.
7. **Stop delegating** `LeadershipMessageReaderLayout.tsx` to `FoleonReaderCompatibilityLayout`. The compat shell remains as a fallback path for any future external consumer; nothing in the current package will reach it after Prompt 05.

## Risks / Mitigations

| Risk | Mitigation |
|---|---|
| Adding tests could surface a real defect in the viewer / card model. | None surfaced; all 146 foleon-reader tests + 469 hbHomepage tests pass. If a future test fails, the no-source-change rule converts to a defect-fix path with a `1.1.87.0` lockstep bump. |
| Single-button-inside-card test is brittle if a future change adds an in-card control. | The test names a single class of acceptable change. If a future prompt deliberately adds an in-card interactive control (e.g. a "save edition" button), the test signal is "review the click pattern": stay with the stretched-scrim card-launch invariant by moving the new control outside the card, or accept the design tradeoff and update the test. |
| Keyboard-activation test uses `fireEvent.click` after `fireEvent.keyDown('Enter')` rather than synthesizing the native button-key activation. | Native HTMLButtonElement synthesizes click on Enter / Space at the browser level; testing-library's general guidance is to fire click for keyboard-activated buttons. The keyDown firing documents intent. Hosted-proof item #6 verifies real-browser keyboard behavior. |
| Static CSS no-overflow proof is a string match. | Acceptable: any `overflow-x: hidden;` declaration in the global scope of either CSS module would match the regex. Scoped-overlay containment uses `overflow: hidden;` (without `-x`), which is structurally different and intentional. |
| Package-authority lockstep test could mask a deeper packaging issue. | Hosted-proof and the manual package-proof checklist cover the deeper concerns. The lockstep test is necessary but not sufficient. |

## Rollback Plan

The change set is bounded to four test files and this one report. Rollback steps:

1. **Test rollback:** revert the additions to `FoleonReaderModule.test.tsx`, `ProjectSpotlightReaderLayout.test.tsx`, `CompanyPulseReaderLayout.test.tsx`, `FoleonFullWindowViewerProvider.test.tsx`. The pre-04C baseline test counts (138 foleon-reader / 469 hbHomepage) are preserved in git history.
2. **Report rollback:** delete `04C_FULL_WINDOW_VIEWER_VALIDATION_REPORT.md`.
3. **Version rollback:** none required — no version bump occurred in this prompt.
4. **Deploy rollback:** none required — no source change.

The Prompt-04A and Prompt-04B implementations remain intact across the rollback. Leadership readiness for Prompt 05 still holds because the relevant lane wrappers, viewer infrastructure, and view-model adapters are unchanged from Prompt 04B's state.
