# Clickable Foleon Article Cards Report

## Scope

Phase-04 Wave-01 Prompt-04B retrofits the **Project Spotlight** feature surface and the **Company Pulse** lead update so their ready-state article cards open the shared full-window viewer (Prompt 04A) when clicked. Inline iframe rendering is removed from these two lane layouts; the viewer is now their only iframe path. Leadership Message remains on the compatibility shell with its inline iframe path unchanged — pending Prompt 05.

Out of scope: Leadership redesign; activating the Prompt-01 dormant edge contract; touching Foleon iframe origin policy, route map, content resolver, schemas, backend sync, Safety / HB Kudos / People & Culture, or shell pairing; modifying Prompt-04A viewer infrastructure.

## Baseline Inputs

- `00_BASELINE_AUDIT.md`
- `01_EDGE_CONTRACT_REPORT.md`
- `02_VIEW_MODEL_AND_REGISTRY_REPORT.md`
- `03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md`
- `04_COMPANY_PULSE_LAYOUT_REPORT.md`
- `04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md`

The Prompt-04A viewer infrastructure (provider, hook, viewer component, target adapters, structured `FoleonViewerOpenResult`) is consumed by this prompt without modification.

## Source Files Changed

| File | Change |
|---|---|
| `packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx` | **Rewritten interaction layer.** Article card pattern (Inclusive Components / Heydon Pickering): a `<button>` wraps the title; a transparent `::after` pseudo-element overlays the entire card to capture clicks across the visible card area. Inline iframe and mobile-gate rendering removed. "Open full archive" action moved to a footer block outside the article card so the launch button does not nest inside another interactive surface. Disabled state uses `aria-disabled="true"` + `aria-describedby` pointing to a visible `role="status"` reason; the click handler suppresses activation and surfaces the structured refusal as a DOM marker. |
| `packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx` | **Rewritten interaction layer.** Same pattern applied to the lead update card; the lead becomes the lane's article card. Header (eyebrow / cadence / title / summary) and category chips remain outside the card — only the lead is interactive. Empty-digest explanatory state preserved. "Open full archive" footer action lives outside the lead card. Inline iframe rendering removed. |
| `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css` | Adds `.articleCard`, `.cardLaunch`, `.cardLaunch::after` (stretched scrim), `.cardLaunch:focus-visible::after` (focus ring across the card), `.disabledReason`, `.articleFooter`, `.briefingFooter`. The footer classes carry `position: relative; z-index: 2;` so the archive button remains clickable above the card-launch pseudo-element. |
| `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts` | Synced. |
| `packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx` | Existing Spotlight ready-iframe test rewritten to: click the card-launch button → `onViewerOpen` fires → viewer iframe loads → `onViewerIframeLoaded` fires. The legacy inline `onReaderOpen` callback is asserted **not** to fire for Spotlight. Mobile lazy-mount test rewritten to use the same card-launch flow (no more legacy "Reader ready" inline-iframe gate for this lane). `renderModule` helper extended to thread the four viewer telemetry callbacks. Leadership ready test (`'uses Leadership Message config and page context for ready reader events'`) is unchanged — Leadership still mounts inline iframe via the compatibility shell. |
| `packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx` | Replaces the old "renders the iframe inside .iframeFrame…" rule with a new invariant: **never renders an inline iframe, even when iframeSurface is provided**. Adds article-card markers test, preview-disabled test (aria-disabled + aria-describedby + visible reason), preview-click no-op test (records `data-foleon-article-last-refusal="preview-only"`), and ready-disabled test (`embed-not-allowed` reason + DOM marker). |
| `packages/foleon-reader/src/readers/__tests__/CompanyPulseReaderLayout.test.tsx` | Same suite for the Pulse lead card. |
| `apps/hb-homepage/config/package-solution.json` | Bump solution + feature versions `1.1.85.0` → `1.1.86.0`. |
| `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump web-part version `1.1.85.0` → `1.1.86.0`. |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump runtime-copy version `1.1.85.0` → `1.1.86.0`. |
| `packages/homepage-launcher/src/constants.ts` | Bump `HOMEPAGE_LAUNCHER_VERSION` `'1.1.85.0'` → `'1.1.86.0'`. |

Files explicitly **not touched**: `LeadershipMessageReaderLayout.tsx`, `FoleonReaderCompatibilityLayout.tsx`, `FoleonReaderModule.tsx`, `FoleonReaderLayoutRegistry.tsx`, `FoleonReaderViewModel.ts`, `FoleonViewerTypes.ts`, `FoleonFullWindowViewer.tsx`, `FoleonFullWindowViewerProvider.tsx`, `FoleonIframeHost.tsx`, `index.ts` (no public-export changes), all shell / entry-stack code, the Prompt-01 dormant edge contract, `apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx`, Foleon governance / route / sync / schema files, Safety / HB Kudos / People & Culture.

## Project Spotlight Interaction

Composition (ready, enabled):

```
<div data-foleon-reader-layout="project-spotlight"
     data-foleon-reader-lane="projectSpotlight"
     data-foleon-reader-state="ready"
     data-foleon-layout="project-spotlight-feature">
  <article class="featureSurface" aria-labelledby={titleElementId}>
    <div class="articleCard"
         data-foleon-article-card
         data-foleon-article-lane="projectSpotlight"
         data-foleon-viewer-target-id={target.id}
         data-foleon-article-state="enabled">
      <header class="mediaBanner">…
        <h2 id={titleElementId}>
          <button class="cardLaunch" onClick={launch}>{record.title}</button>
        </h2>
        <p>{summary}</p>
      </header>
      <ul class="ribbon">[freshness, audience, archive group, cadence]</ul>
      <section class="callout">[Why this project matters]</section>
      <dl class="projectFacts">[client, location, market, team, milestone]</dl>
    </div>
    <div class="articleFooter">
      <HbcButton variant="secondary">Open full archive</HbcButton>
    </div>
  </article>
</div>
```

- **Card is the launch surface.** The card-launch `<button>` wraps the article title and uses a transparent `::after` pseudo-element (`position: absolute; inset: 0;`) over the card's `position: relative` parent. Clicks anywhere in the card area trigger the button.
- **No nested interactive controls inside the card.** "Open full archive" lives in `.articleFooter` (z-index 2 above the card-launch scrim).
- **Keyboard.** Enter / Space activate the button — same as any native button. Focus-visible draws a ring across the entire card via `.cardLaunch:focus-visible::after`.
- **Disabled.** When `target.canOpen === false` (preview, no embed URL, embed disallowed, or external-open required), the launch button uses `aria-disabled="true"` + `aria-describedby={reasonId}`. The visible reason renders inside the card with `role="status"` `aria-live="polite"`. The click handler suppresses activation and writes `data-foleon-article-last-refusal={reason}` so the refusal is observable.
- **Click → openViewer.** On a successful click: `viewer.openViewer(target, event.currentTarget)` is invoked; the Prompt-04A provider returns `{ opened: true, target }` and renders the dialog. If the call returns `{ opened: false, reason }` defensively, the same `data-foleon-article-last-refusal` marker is written.

## Company Pulse Interaction

The lead update card (not the entire briefing surface) is the article card:

```
<div data-foleon-reader-layout="company-pulse"
     data-foleon-reader-lane="companyPulse"
     data-foleon-reader-state="ready"
     data-foleon-layout="company-pulse-briefing">
  <article class="briefingSurface">
    <header class="briefingHeader">…</header>
    <ul class="categoryChips">[News, Events, Recognition, Operations]</ul>
    <section class="briefingLead articleCard"
             data-foleon-article-card
             data-foleon-article-lane="companyPulse"
             data-foleon-viewer-target-id={target.id}
             data-foleon-article-state="enabled">
      <p class="leadKicker">Latest update · {freshness} · {dateline}</p>
      <h3>
        <button class="cardLaunch" onClick={launch}>{lead.title}</button>
      </h3>
      <p>{lead.body}</p>
    </section>
    <div data-foleon-pulse-digest-state="empty">[More updates → archive]</div>
    <div class="briefingFooter">
      <HbcButton variant="secondary">Open full archive</HbcButton>
    </div>
  </article>
</div>
```

- The lead card uses both `.briefingLead` (briefing-specific styling: tinted lead surface, border, shadow) and `.articleCard` (interaction-pattern positioning).
- Header / chips / digest empty state / footer remain non-interactive context above and below the lead card.
- Click / keyboard / disabled / refusal semantics are identical to Spotlight — same `<CardLaunchButton>` shape.
- **Ready-state secondary digest stays empty.** Phase-04 Wave-01 Prompt-04 confirmed the registry only carries one active record per lane; previous editions live in the archive. The "Open full archive" footer action is the honest path to them. No fabricated entries.

## Viewer Target Mapping

Unchanged from Prompt 04A. Both layouts read `viewModel.primaryArticle.target` and pass it to `useFoleonFullWindowViewer().openViewer(target, event.currentTarget)`. The provider validates `target.canOpen` and uses `target.viewerUrl` (sourced from `record.embedUrl` via the Prompt-04A adapter) under the same origin policy as the inline iframe path.

Telemetry per lane:

| Lane | Inline `onReaderOpen` / `onReaderClose` / `onEmbedError` | Viewer `onViewerOpen` / `onViewerClose` / `onViewerIframeLoaded` / `onViewerIframeError` |
|---|---|---|
| Project Spotlight | **No longer fires** (no inline iframe in this lane) | Fires from card → viewer flow |
| Company Pulse | **No longer fires** | Fires from card → viewer flow |
| Leadership Message | Continues to fire (compatibility shell, inline iframe) | Provider is wrapped but no card calls `openViewer` yet |

`onGateBlocked` is unaffected for all lanes — it fires from the resolution path (record blocked at gate), not from iframe lifecycle.

### Telemetry consumer audit

`apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx` is the only homepage consumer of the inline lifecycle callbacks. Audit:

- `onReaderOpen` / `onReaderClose` / `onOpenArchive` — currently no-op `useCallback(() => undefined)`. Spotlight + Pulse losing these signals has zero observable consumer impact.
- `onEmbedError` — currently sets occupant status to `error`. After 04B, this only fires for Leadership inline-iframe errors. Spotlight + Pulse iframe errors will surface via the new viewer telemetry (`onViewerIframeError`), which the consumer does not yet subscribe to. Acceptable transitional gap — viewer iframe errors today will not propagate to occupant content state, but the existing `onGateBlocked` path still fires for record-level blocking (the most common failure source).
- `onGateBlocked` — unchanged; fires for all three lanes from the resolver.
- `onStatusChange` — unchanged; fires for all three lanes from the orchestrator state machine.
- `apps/hb-intel-foleon/...` — separate standalone Foleon SPA with its own copies of `FoleonReaderModule`. Not affected by the package's lane layout changes.

If a future prompt wants viewer-side iframe-error telemetry surfaced as occupant content state, `FoleonHomepageLaneHost.tsx` can subscribe to `onViewerIframeError` without touching the provider. Recorded as a follow-up (Prompt 04C / 06).

## Inline Iframe Posture

Spotlight + Pulse: **inline iframe removed**. Layouts no longer render the orchestrator-supplied `iframeSurface` prop, even when `viewModel.iframe?.visible === true`. The orchestrator continues to construct the React element (because Leadership's compat shell still consumes it), but unmounted React elements do not load network resources. There is no double iframe.

Leadership: **inline iframe retained**. The compatibility shell still mounts the iframe via `FoleonIframeHost` for ready Leadership records. Telemetry semantics for Leadership are unchanged.

## Preview Behavior

- Spotlight + Pulse preview cards always carry `target.canOpen === false` with `target.disabledReason === 'preview-only'`.
- The launch button is `aria-disabled="true"` and visually inert.
- The visible "Preview layout" banner remains in the header.
- A visible disabled-reason explanation appears inside the card, referenced by `aria-describedby`.
- Click is a no-op; the structured refusal is recorded as `data-foleon-article-last-refusal="preview-only"` on the button.
- No live iframe is mounted, no Foleon network request occurs, no telemetry callbacks fire.

## Ready Behavior

- Spotlight + Pulse ready cards derive their `target` from `FoleonContentRecord` via the Prompt-04A adapter — no invented data.
- When `target.canOpen === true` (embedUrl present, allowEmbed, !requiresExternalOpen), the launch button is enabled and clicking it opens the viewer.
- When `target.canOpen === false` (e.g. `allowEmbed=false`), the card is disabled with the matching reason (`embed-not-allowed`, `no-embed-url`, `requires-external-open`) and the click handler suppresses activation while recording the refusal.

## Accessibility

- **Semantic button.** A real `<button type="button">` carries the launch behavior. No `<div onClick>`, no role-only patterns.
- **Stretched scrim.** The transparent `::after` pseudo-element handles whole-card hit-testing without polluting the accessibility tree (the pseudo-element is part of the button, not a separate element).
- **No nested interactive controls inside the card.** "Open full archive" lives in a footer outside the card with `z-index: 2` above the scrim so it remains clickable independently.
- **Focus-visible ring.** `.cardLaunch:focus-visible::after { outline: ... }` draws a visible ring across the full card on keyboard focus.
- **Heading inside button.** The launch button is wrapped by an `<h2>` (Spotlight) / `<h3>` (Pulse). This keeps heading hierarchy intact while the button provides the click target — assistive tech announces "heading level 2, button: <title>". Standard practice (W3C / Inclusive Components).
- **Disabled semantics.** `aria-disabled="true"` + `aria-describedby` so screen readers announce the disabled reason. The reason element uses `role="status"` `aria-live="polite"` for the visual + assistive-tech parity. (Choice of `aria-disabled` over the native `disabled` attribute preserves focus so users can read the reason.)
- **Refusal observability.** Disabled clicks record `data-foleon-article-last-refusal={reason}` for diagnostics and future telemetry hooks.
- **Heading hierarchy preserved.** Spotlight: `<h2>` (article title) → `<h3>` (callout heading). Pulse: `<h2>` (briefing title) → `<h3>` (lead title) → `<h4>` (digest items, when populated in preview).
- **Preview honesty preserved.** "Preview layout" banner + disabled launch + visible reason copy + `aria-describedby` linkage.

## Tests Added / Updated

**Updated** `FoleonReaderModule.test.tsx`:

- Spotlight ready iframe-load test rewritten as a viewer-launch test: click the card-launch button → `onViewerOpen` fires → iframe inside the viewer loads → `onViewerIframeLoaded` fires. Asserts `onReaderOpen` does NOT fire for Spotlight (the inline lifecycle no longer applies to this lane).
- Spotlight mobile lazy-mount test rewritten: confirms no inline iframe at any breakpoint, no legacy "Reader ready" gate, viewer opens via card click.
- `renderModule` helper extends `callbacks` with `onViewerOpen`, `onViewerClose`, `onViewerIframeLoaded`, `onViewerIframeError`.
- Leadership ready test unchanged.
- Three-lane composition test unchanged (already uses per-lane scoping from Prompt 04).

**Updated** `ProjectSpotlightReaderLayout.test.tsx` and `CompanyPulseReaderLayout.test.tsx`:

- Old "renders the iframe inside .iframeFrame …" rule replaced with **never renders an inline iframe, even when iframeSurface is provided**.
- New: article-card markers (`data-foleon-article-card`, `data-foleon-article-lane`, `data-foleon-article-state`, `data-foleon-viewer-target-id`).
- New: card-launch button uses the article title as its accessible name.
- New: preview state ⇒ `aria-disabled="true"` + `aria-describedby` ⇒ reason element exists and contains "preview only".
- New: clicking a disabled (preview) card is a no-op and writes `data-foleon-article-last-refusal="preview-only"`.
- New: ready record with `allowEmbed=false` ⇒ disabled state with reason "disallows in-line embedding"; click writes `data-foleon-article-last-refusal="embed-not-allowed"`.
- Existing layout-marker / preview-label / project-facts (Spotlight) / digest-empty (Pulse) tests continue to pass unchanged.

## Validation Commands and Results

| Command | Scope | Result |
|---|---|---|
| `pnpm --filter @hbc/foleon-reader test` | full foleon-reader suite | **12 files / 138 tests pass** |
| `pnpm --filter @hbc/foleon-reader check-types` | foleon-reader typecheck | clean |
| `pnpm --filter @hbc/foleon-reader lint` | foleon-reader lint | clean |
| `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage` | hbHomepage consumer (incl. lockstep + edge contract integration) | **32 files / 469 tests pass** |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | not re-run; deltas to this prompt are foleon-reader-side, not hb-webparts source | hb-webparts pre-existing 4 errors (Prompts 01/02/03/04/04A documented) remain unchanged. |

## Version / Package Impact

`hb-intel-homepage` SPFx solution + web-part + launcher-constant + runtime-copy manifest advanced together to `1.1.86.0`. `hbHomepagePackageAuthority.test.ts` lockstep green at `1.1.86.0`.

DOM rendered by Spotlight + Pulse changes visibly: the article card is now a launch surface; inline iframe is gone. Leadership rendering unchanged.

## Known Follow-Up Work

- **Prompt 04C** — Validate the full-window viewer + clickable-card interaction. Playwright coverage for: card click → viewer opens; keyboard activation; disabled-card refusal copy; viewer iframe load/error/close; mobile breakpoints; focus-return on close; `overflow-x` containment.
- **Prompt 05** — Leadership Message lane-owned layout using the viewer contract from day one (no compatibility-shell intermediate).
- **Optional consumer hookup** — `FoleonHomepageLaneHost.tsx` could subscribe to `onViewerIframeError` to surface viewer iframe failures as occupant content state. Currently a transitional gap.

## Risks / Mitigations

| Risk | Mitigation |
|---|---|
| Card-launch pattern (button + stretched `::after`) blocks text selection on the card. | Acceptable tradeoff — the card is a launch surface, not a reading surface. Detailed reading happens in the viewer, where text selection works normally. Standard W3C / Inclusive Components pattern. |
| `onReaderOpen` no longer fires for Spotlight + Pulse — could surprise telemetry consumers. | Audited: the homepage consumer (`FoleonHomepageLaneHost.tsx`) treats `onReaderOpen` as a no-op. No real consumer impact. Leadership keeps the inline lifecycle. Documented above in "Telemetry consumer audit". |
| Disabled card click is a UI no-op. | The structured refusal IS observed via `data-foleon-article-last-refusal` and the visible reason copy with `role="status"`. Not silent. |
| Pulse lead card uses both `.briefingLead` (visual) and `.articleCard` (interaction) classes. | Both classes are namespaced and additive. Tested. |
| Spotlight "Open full archive" footer button could end up under the card scrim. | `.articleFooter` is `position: relative; z-index: 2;` to remain above the scrim. Same for `.briefingFooter`. |
| Inline iframe React element is constructed by the orchestrator but never mounted for Spotlight + Pulse. | Wasted React element construction is negligible. The element does not cause a network load until mounted. Leadership still consumes it. |
| Future a11y review may prefer a different focus-restoration source. | The Prompt-04A provider already restores focus to the `event.currentTarget` (the launch button) on close. Behavior is testable; tests pass. |

## Rollback Plan

The change set is bounded to two layout files, the lane CSS module, two test files, the module test, four version files. Rollback steps:

1. **Source rollback:** revert `ProjectSpotlightReaderLayout.tsx` and `CompanyPulseReaderLayout.tsx` to their Prompt-04 / Prompt-04A forms (the inline iframe-rendering version). Revert the `FoleonReaderLayouts.module.css` additions (`.articleCard`, `.cardLaunch`, etc.) and the matching `.d.ts` entries. Revert the test updates.
2. **Test rollback:** the lane test files revert to the iframe-rendering assertions; the module test reverts to inline-iframe-mount assertions.
3. **Version rollback:** revert all four version files to `1.1.85.0`.
4. **Deploy rollback:** redeploy the prior `.sppkg` (solution `1.1.85.0`).

The Prompt-04A viewer infrastructure remains intact across the rollback — provider, hook, types, and viewer component continue to exist and work; they're simply unused by Spotlight + Pulse if rolled back. Leadership behavior is unaffected.
