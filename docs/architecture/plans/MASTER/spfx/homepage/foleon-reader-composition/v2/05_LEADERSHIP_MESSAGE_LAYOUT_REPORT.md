# Leadership Message Reader Layout Report

## Scope

Phase-04 Wave-01 Prompt-05 replaces the **Leadership Message** body with a lane-owned **executive message / letter** composition and migrates Leadership to the same clickable-card → full-window viewer model used by Project Spotlight (Prompt 03 / 04B) and Company Pulse (Prompt 04 / 04B). After this prompt, all three governed Foleon lanes share the same launch model.

In addition, this prompt closes the homepage-error-state implication left open by Prompt 04C: with no governed Foleon lane firing inline `onEmbedError` anymore, the homepage occupant-error path is rewired to `onViewerIframeError` so iframe failures continue to surface to the homepage shell regardless of which surface (inline or viewer) hosted the iframe.

Out of scope: shell edge contract behavior (still dormant); Foleon iframe origin policy / route map / content resolver / schemas / backend sync; Safety / HB Kudos / People & Culture; shell pairing; row placement; Spotlight / Pulse layouts (touched only for shared-type forwarding).

## Baseline Inputs

- `00_BASELINE_AUDIT.md`
- `01_EDGE_CONTRACT_REPORT.md`
- `02_VIEW_MODEL_AND_REGISTRY_REPORT.md`
- `03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md`
- `04_COMPANY_PULSE_LAYOUT_REPORT.md`
- `04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md`
- `04B_CLICKABLE_ARTICLE_CARDS_REPORT.md`
- `04C_FULL_WINDOW_VIEWER_VALIDATION_REPORT.md`

The Prompt-04A viewer infrastructure is reused verbatim. The Prompt-04B card-launch pattern (single button + `::after` scrim + `aria-disabled` + `aria-describedby` + structured refusal handling) is reused verbatim. No viewer or provider source changes.

## Source Files Changed

| File | Change |
|---|---|
| `packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx` | **Rewritten.** Lane-owned executive message / letter composition. Stops delegating to `FoleonReaderCompatibilityLayout`. Renders eyebrow + cadence ("Executive update") + preview label → title (wrapped by the card-launch button) → byline / role line (record-backed when available; honest fallback otherwise) → optional pull quote → message body → context notes → footer with archive action. Outer wrapper carries `data-foleon-reader-layout="leadership-message"`, `data-foleon-reader-lane="leadershipMessage"`, `data-foleon-reader-state`, and the new `data-foleon-layout="leadership-message"` marker. Does NOT emit legacy `data-preview-tone` or `data-foleon-preview-route`. No inline iframe rendering. |
| `packages/foleon-reader/src/readers/FoleonReaderViewModel.ts` | Adds `FoleonReaderLeadershipMessage` type (byline / role / pullQuote / messageBody / contextNotes / isPlaceholder) and the optional `leadershipMessage?` field on the view model. Adapters populate it only when `lane === 'leadershipMessage'`. Preview = labeled sample copy. Ready = sourced ONLY from `FoleonContentRecord` (byline / role intentionally `undefined` because the schema does not carry them; messageBody from `record.summary` with honest fallback when missing; pullQuote derived as the first sentence of `record.summary` up to ~180 chars; contextNotes from `record.primaryAudience` and `record.archiveGroup`). Helper functions `deriveLeadershipPullQuote` and `deriveLeadershipContextNotes` colocated in the same file. |
| `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css` | Adds executive-surface classes (`.executiveSurface`, `.executiveHeader`, `.executiveEyebrowRow`, `.executiveEyebrow`, `.executiveCadence`, `.executivePreviewLabel`, `.executiveBylineRow`, `.executiveByline`, `.executiveRole`, `.executiveBylineAbsent`, `.executiveTitle`, `.executivePullQuote`, `.executiveBody`, `.executiveContextNotes`, `.executiveContextNoteItem`, `.executiveContextNoteLabel`, `.executiveContextNoteValue`, `.executiveFooter`, `.executiveArchiveNote`, `.executiveWarning`). Reuses the existing `.articleCard`, `.cardLaunch`, `.disabledReason` classes from Prompts 04B/04C. No outer card border. Edge-bleed-ready outer surface. Internal safe area via `padding-inline: clamp(...)`. |
| `packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts` | Synced. |
| `packages/foleon-reader/src/FoleonEmbeddedReaderLane.tsx` | Adds the four optional viewer telemetry props (`onViewerOpen`, `onViewerClose`, `onViewerIframeLoaded`, `onViewerIframeError`) to `FoleonEmbeddedReaderLaneProps`. Forwarded to per-lane wrappers via `{...props}` spread. |
| `packages/foleon-reader/src/readers/ProjectSpotlightReader.tsx` | Adds matching forwarding for the four viewer telemetry props. **No behavior change** — strictly plumbing required to thread Leadership's viewer telemetry through the same dispatcher Spotlight + Pulse already use. |
| `packages/foleon-reader/src/readers/CompanyPulseReader.tsx` | Same plumbing addition. |
| `packages/foleon-reader/src/readers/LeadershipMessageReader.tsx` | Same plumbing addition. |
| `apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx` | **Wires `onViewerIframeError` to the same occupant error-status handler previously served by inline `onEmbedError`** (sets `kind: 'error'` with reason `'viewer-iframe-error'`). Once Spotlight + Pulse + Leadership all run on the viewer model, no governed Foleon lane fires inline `onEmbedError` for ready iframes; this rewire keeps the homepage shell surfacing iframe failures regardless of which surface hosted the iframe. |
| `packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts` | Adds Leadership adapter tests: preview populates `leadershipMessage` with sample-labeled placeholders + `isPlaceholder: true`; ready derives only from record fields with byline / role left undefined when the schema does not carry them; ready uses an honest fallback for `messageBody` when `record.summary` is missing; Spotlight + Pulse leave `leadershipMessage` undefined. |
| `packages/foleon-reader/src/readers/__tests__/LeadershipMessageReaderLayout.test.tsx` | **New.** Lane-specific test suite covering the new lane-owned layout markers, absence of legacy compatibility-shell markers, preview/ready parity, no inline iframe, single-button-inside-card invariant, click + keyboard activation through the provider, disabled-card refusal, and sibling-lane non-interference. |
| `packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx` | Updates Leadership tests for the migration: preview test rewritten to assert lane-owned layout markers + absence of legacy markers; ready test rewritten to assert the viewer-launch flow (click → `onViewerOpen` → viewer iframe loads → `onViewerIframeLoaded`) instead of the inline iframe lifecycle; lane-readiness sanity test updated to confirm Leadership has migrated; three-lane composition test updated to reflect Leadership's lane-owned markers. |
| `packages/foleon-reader/src/readers/__tests__/ProjectSpotlightReaderLayout.test.tsx` | Sibling-lane test updated: Leadership no longer carries compatibility-shell markers in the multi-lane render. |
| `packages/foleon-reader/src/readers/__tests__/CompanyPulseReaderLayout.test.tsx` | Same sibling-lane test update. |
| `apps/hb-homepage/config/package-solution.json` | Bump solution + feature versions `1.1.86.0` → `1.1.87.0`. |
| `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump web-part version `1.1.86.0` → `1.1.87.0`. |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | Bump runtime-copy version `1.1.86.0` → `1.1.87.0`. |
| `packages/homepage-launcher/src/constants.ts` | Bump `HOMEPAGE_LAUNCHER_VERSION` `'1.1.86.0'` → `'1.1.87.0'`. |

Files explicitly **not touched**: `ProjectSpotlightReaderLayout.tsx`, `CompanyPulseReaderLayout.tsx`, `FoleonReaderCompatibilityLayout.tsx` (now an orphan, kept for any future external consumer), `FoleonReaderModule.tsx`, `FoleonReaderLayoutRegistry.tsx`, `FoleonViewerTypes.ts`, `FoleonFullWindowViewer.tsx`, `FoleonFullWindowViewerProvider.tsx`, `FoleonIframeHost.tsx`, `index.ts` (no public-export changes), all shell / entry-stack code, the Prompt-01 dormant edge contract, Foleon governance / route / sync / schema files, Safety / HB Kudos / People & Culture.

## Viewer Contract Consumed

The Leadership layout consumes the existing Prompt-04A infrastructure unchanged:

- `useFoleonFullWindowViewer()` hook for `openViewer(target, launchElement)` + `closeViewer()`.
- `FoleonFullWindowViewerProvider` (already wraps Leadership renders inside `FoleonReaderModule`).
- `FoleonViewerTarget` model from `FoleonViewerTypes.ts` (sourced from `viewModel.primaryArticle.target`, populated by the existing adapter for Leadership ready records).
- `FoleonViewerOpenResult` discriminated union — `{ opened: false, reason }` refusals are surfaced via `data-foleon-article-last-refusal`.
- `FoleonIframeHost` for the iframe inside the dialog (origin policy, sandbox, lifecycle).
- Distinct viewer telemetry: `onViewerOpen`, `onViewerClose`, `onViewerIframeLoaded`, `onViewerIframeError`.

No new viewer overlay, focus management, ESC-to-close, or accepted-origin logic was added in this prompt.

## Layout Implemented

```
<div data-foleon-reader-layout="leadership-message"
     data-foleon-reader-lane="leadershipMessage"
     data-foleon-reader-state="preview|ready"
     data-foleon-layout="leadership-message">
  <article class="executiveSurface" aria-labelledby={titleElementId}>
    <div class="articleCard"
         data-foleon-article-card
         data-foleon-article-lane="leadershipMessage"
         data-foleon-viewer-target-id={target.id}
         data-foleon-article-state="enabled|disabled|preview">
      <header class="executiveHeader">
        <div class="executiveEyebrowRow">
          <p class="executiveEyebrow">Leadership Message Reader</p>
          <span class="executiveCadence">Executive update</span>
          {preview && <span class="executivePreviewLabel">Preview layout</span>}
        </div>
        <h2 class="executiveTitle">
          <button class="cardLaunch" onClick={launch}>{title}</button>
        </h2>
        {summary && <p class="executiveBody">{summary}</p>}
      </header>
      <div class="executiveBylineRow">
        {/* byline + role from record, OR honest fallback when absent */}
      </div>
      {pullQuote && <blockquote class="executivePullQuote">{pullQuote}</blockquote>}
      {messageBody && <p class="executiveBody">{messageBody}</p>}
      {contextNotes && <ul class="executiveContextNotes" aria-label="Leadership Message context">…</ul>}
      {disabled && <p id={reasonId} class="disabledReason" role="status" aria-live="polite">…</p>}
    </div>
    <div class="executiveFooter">
      <HbcButton variant="secondary" onClick={archive}>Open full archive</HbcButton>
    </div>
  </article>
</div>
```

## Interaction Model

Identical to Spotlight + Pulse:

- The card-launch `<button>` wraps the article title. A transparent `::after` pseudo-element (`position: absolute; inset: 0;`) overlays the `position: relative` `.articleCard` so clicks anywhere on the visible card area trigger the button. **Single interactive control** inside the card; the "Open full archive" footer button lives outside the card with `z-index: 2` above the scrim.
- Click handler invokes `useFoleonFullWindowViewer().openViewer(target, event.currentTarget)` and surfaces refusals via `data-foleon-article-last-refusal={reason}`.
- Disabled state uses `aria-disabled="true"` + `aria-describedby` pointing to a visible `role="status"` reason; click handler suppresses activation.
- Keyboard: native button activation (Enter / Space → click) opens the viewer.
- Focus restoration: the Prompt-04A provider returns focus to `event.currentTarget` (the launch button) when the dialog closes.

## Preview Behavior

- `target.canOpen === false`, `target.disabledReason === 'preview-only'`.
- The launch button is `aria-disabled="true"` and visually inert.
- The visible "Preview layout" banner sits in the header.
- A visible disabled-reason explanation appears inside the card, referenced by `aria-describedby`.
- Click is a no-op; the structured refusal is recorded as `data-foleon-article-last-refusal="preview-only"` on the button.
- No live iframe is mounted; no Foleon network request occurs; no telemetry callbacks fire.
- Sample copy includes byline ("Sample executive byline"), role ("Sample role"), pull quote, message body, and context notes — all clearly labeled as sample.

## Ready-State Data Honesty

The ready adapter sources every field that appears in the executive composition **only** from `FoleonContentRecord`. The current schema does not carry `byline`, `role`, `portraitUrl`, or `signature` fields, so:

| Layout field | Source / fallback |
|---|---|
| Title | `record.title` |
| Card-launch accessible name | `record.title` |
| Body summary (header) | `record.summary` (or omitted when missing) |
| Byline | `undefined` (no schema source) → layout shows `"Executive byline not provided."` |
| Role | `undefined` (no schema source) → omitted |
| Pull quote | First sentence of `record.summary` up to ~180 chars (or `undefined` when summary missing) |
| Message body | `record.summary` (or honest fallback `"Editorial summary for this Leadership Message has not been provided."`) |
| Context notes | `[ Audience: record.primaryAudience ?? 'Companywide', Archive group: record.archiveGroup ?? 'Archive coming soon' ]` |
| Viewer target URL | `record.embedUrl` (via Prompt-04A adapter) |
| External link | `record.publishedUrl` |

The adapter **never** invents executive identity in ready state. If the schema is later extended to carry byline / role / portrait, the adapter switches to those fields without changing the layout. Recorded as a follow-up.

## Accessibility

- Outer `<article>` has `aria-labelledby={titleElementId}` pointing to the `<h2>` title.
- The card-launch `<button>` is inside the `<h2>` (Inclusive Components / Heydon pattern). Heading hierarchy preserved: `<h2>` is the article title; the message body and pull quote do not introduce additional headings.
- Disabled state uses `aria-disabled="true"` + `aria-describedby={reasonId}`. Reason copy carries `role="status"` `aria-live="polite"` so screen readers announce it.
- Refusal observability: `data-foleon-article-last-refusal={reason}` is written on the button after a disabled click.
- Context notes list has `aria-label="Leadership Message context"`.
- Pull quote uses `<blockquote>` for semantic clarity.
- Footer archive button is outside the card with `z-index: 2`, so it remains independently focusable and clickable above the card-launch scrim.
- Focus return on viewer close is handled by the Prompt-04A provider.

## Tests Added / Updated

**New** `LeadershipMessageReaderLayout.test.tsx`:

- Emits `data-foleon-layout="leadership-message"` alongside Prompt-02 lane markers.
- Does NOT emit Spotlight or Pulse layout markers.
- Does NOT render the legacy three-card support skeleton or tone markers.
- Preview and ready states share the same `data-foleon-layout` marker; only `data-foleon-reader-state` differs.
- Preview state retains a visible "Preview layout" label.
- Ready state shows the honest "Executive byline not provided." fallback when the schema lacks byline.
- Ready state's pull quote = first sentence of `record.summary`; message body = full `record.summary`.
- Honest fallback for the message body when the record has no summary.
- Never renders an inline iframe, even when `iframeSurface` is provided.
- Article card markers are stable (`[data-foleon-article-card]`, `data-foleon-article-lane="leadershipMessage"`, `data-foleon-viewer-target-id`, `data-foleon-article-state`).
- Preview-state launch is `aria-disabled="true"` + `aria-describedby`.
- Disabled click writes `data-foleon-article-last-refusal="preview-only"`.
- `embed-not-allowed` ready record produces `data-foleon-article-state="disabled"` + refusal marker.
- Single-button-inside-card invariant.
- Provider-wrapped click test: card-launch click opens the viewer dialog.
- Provider-wrapped keyboard activation test: `keyDown('Enter')` + click opens the viewer dialog.
- Sibling-lane non-interference: rendering Spotlight + Pulse + Leadership together yields three lane-owned markers and zero legacy compat-shell markers.

**Updated** `FoleonReaderViewModel.test.ts` — adds Leadership adapter assertions (described above).

**Updated** `FoleonReaderModule.test.tsx`:

- Leadership preview test rewritten to assert lane-owned markers + absence of legacy markers.
- Leadership ready test rewritten as a viewer-launch flow (click card → `onViewerOpen` → viewer iframe loads → `onViewerIframeLoaded` → legacy `onReaderOpen` does NOT fire).
- Lane-readiness sanity test updated: Leadership has migrated; assert lane-owned markers, absence of compat-shell markers, presence of `[data-foleon-article-card]`.
- Three-lane composition test updated to reflect Leadership's lane-owned markers.

**Updated** `ProjectSpotlightReaderLayout.test.tsx` and `CompanyPulseReaderLayout.test.tsx` sibling-lane tests — Leadership no longer carries compatibility-shell markers in the multi-lane render; updated to assert Leadership's lane-owned markers instead.

## Validation Commands and Results

| Command | Scope | Result |
|---|---|---|
| `pnpm --filter @hbc/foleon-reader test` | full foleon-reader suite | **13 files / 167 tests pass** (146 baseline + 21 new + updated) |
| `pnpm --filter @hbc/foleon-reader check-types` | foleon-reader typecheck | clean |
| `pnpm --filter @hbc/foleon-reader lint` | foleon-reader lint | clean |
| `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage` | hbHomepage consumer | **32 files / 469 tests pass** (lockstep `hbHomepagePackageAuthority` test green at `1.1.87.0`) |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | not re-run; deltas in this prompt are foleon-reader-side and a single new optional callback wired in `FoleonHomepageLaneHost.tsx` | hb-webparts pre-existing 4 errors (Prompts 01–04C documented) remain unchanged. The new `onViewerIframeError={handleViewerIframeError}` prop is type-safe via the extended `FoleonEmbeddedReaderLaneProps`. |

## Package / Versioning Impact

`hb-intel-homepage` SPFx solution + web-part + launcher-constant + runtime-copy manifest advanced together to `1.1.87.0`. `hbHomepagePackageAuthority.test.ts` lockstep green at `1.1.87.0`.

DOM rendered by Leadership Message changes visibly: the lane-owned executive composition replaces the legacy compat-shell preview/ready chrome. Spotlight + Pulse rendering unchanged.

The homepage consumer (`FoleonHomepageLaneHost.tsx`) now subscribes to `onViewerIframeError` and forwards iframe failures to the same occupant error-status path previously served by `onEmbedError`. No new accepted-origin or gate behavior was introduced.

## Known Follow-Up Work

- **Prompt 06** — validate all three lane-owned layouts together (Spotlight + Pulse + Leadership) under the shared full-window viewer; add Playwright / browser visual-regression coverage; run hosted proof on a tenant; document the tenant rollout runbook.
- **Schema extension (optional)** — extend `FoleonContentRecord` to carry `executiveByline`, `executiveRole`, and a small portrait reference (or join from People & Culture) so the executive layout can show real byline / role / portrait data instead of the honest `"Executive byline not provided."` fallback.
- **Compatibility-shell cleanup** — `FoleonReaderCompatibilityLayout.tsx` and the standalone `FoleonReaderPreview.tsx` are no longer reached by any lane in the package. A future cleanup prompt can remove them once it is confirmed that no external consumer depends on them.
- **Telemetry consumer expansion** — `FoleonHomepageLaneHost.tsx` now subscribes to `onViewerIframeError` only; `onViewerOpen` / `onViewerClose` / `onViewerIframeLoaded` could be wired to richer occupant content state (e.g. a `'reader-open'` kind) in a follow-up if desired.

## Rollback Plan

The change set is bounded to:

- One layout file (`LeadershipMessageReaderLayout.tsx`) + lane CSS additions + `.d.ts`.
- View-model field additions + adapter logic.
- Three per-lane wrapper plumbing additions + the lane dispatcher's prop interface.
- One homepage consumer wiring (`onViewerIframeError`).
- Five test files updated/added.
- Four version files.

Rollback steps:

1. **Source rollback:** revert `LeadershipMessageReaderLayout.tsx` to its Prompt-04C form (delegating to `FoleonReaderCompatibilityLayout`); revert the four optional viewer telemetry props on `FoleonEmbeddedReaderLaneProps` and the three per-lane wrappers; revert the `onViewerIframeError` wiring in `FoleonHomepageLaneHost.tsx`; revert the `leadershipMessage` view-model field + helpers; revert the executive CSS classes + `.d.ts` additions.
2. **Test rollback:** delete `LeadershipMessageReaderLayout.test.tsx`; revert the additive `FoleonReaderViewModel.test.ts` block; revert the Leadership-specific updates in `FoleonReaderModule.test.tsx`, `ProjectSpotlightReaderLayout.test.tsx`, and `CompanyPulseReaderLayout.test.tsx`.
3. **Version rollback:** revert all four version files to `1.1.86.0`.
4. **Deploy rollback:** redeploy the prior `.sppkg` (solution `1.1.86.0`).

Compatibility shell + standalone preview component remain in the package across the rollback because they were not modified or removed in this prompt. Spotlight + Pulse behavior is preserved across the rollback because their layouts and the viewer infrastructure are untouched.
