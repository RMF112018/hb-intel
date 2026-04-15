# Wave 01 — Publisher preview / readiness / authoring trust-loop closure

**Scope:** phase-12 / Prompt-04 — close the preview / readiness /
authoring trust loop so authors can understand what is blocking them,
what will happen on publish, and where to go next with less scanning
and less mental stitching.

**Status:** closed.

## Author-confidence problem solved

Before: the Publisher already had the right seams — preview surface,
homepage-card preview, readiness summary, blocking list, warnings
list, publish-gating, and a diagnostics disclosure — but authors had
to mentally stitch them together. Blockers didn't tell authors where
in the canvas to fix the issue; the "what happens on publish"
narrative only lived inside a collapsible technical-details block,
visually separated from the Publish button; the preview surface had
no indication that blockers existed even when publish would fail.

After: the same seams now compose into a single trust loop — every
blocker names its fix location, the publish intent shows up as a
scannable chip next to the readiness summary, and the preview surface
itself echoes the block-count so authors don't have to cross-check
the rail to know whether the preview is "the publishable state."

## Mapping changes introduced

### 1. Publish-intent derivation in the readiness controller

New controller output `publishIntent`, derived inside
`useReadinessController` from the same `PreviewOutcome` it already
consumes. Paired with a pure `describePublishIntent()` that maps the
intent to `{ tone, label, detail }` so the shell and (future)
diagnostics surfaces agree on language.

Intent variants cover every reproducible state:

- `noDraft` — no draft picked
- `pending` — preview not yet built
- `blocked` — validation errors prevent publish
- `createPage` — will create a new destination page
- `updateInPlace` — existing page updated, PageId/URL preserved
- `regeneratePage` — new PageId/URL replace current binding, with
  optional cause string
- `noChange` — current binding already matches

The helper is exported from `controllers/index.ts` as
`derivePublishIntent`, `describePublishIntent`, and the
`PublishIntent` type so future readiness surfaces reuse the same
classification without recomputing from the raw `PreviewOutcome`.

### 2. Publish-intent cue in the readiness summary

`ArticlePublisher.tsx` now renders a `PublishIntentCue` directly
beneath the readiness summary sentence. The cue is an
`EditorialChip` (governed `sharedChrome/` primitive) plus a one-line
detail string. Tones map to the shared status ramp:

- blocked → `danger`
- regeneratePage → `warn`
- updateInPlace → `success`
- createPage → `info`
- noChange / pending → `neutral`

Publish intent is now legible at-a-glance without opening the
"Technical details" disclosure.

### 3. Fix-next anchors on blocking/warning issues

New pure helper `controllers/findingAnchor.ts` maps a
`ValidationFinding.field` dotted path (e.g., `Title`,
`HeroPrimaryImage`, `media[0].AltText`, `team[2].DisplayName`,
`PageTemplateKey`) to the correct canvas section anchor (`Identity`,
`Hero`, `Story`, `Media`, `Team`, `Promotion`, `Destination
binding`). Unknown fields degrade silently — the issue renders without
a "Go to" link rather than routing the author to a wrong section.

`ArticlePublisher.tsx` now renders each blocker and warning through
a shared `ValidationIssueItem` helper that:

- surfaces the existing `actionHint` inline when the validation
  finding provides one (it already does for many categories),
- appends a `Go to {Section} →` anchor link when the field maps.

The blocking block heading was promoted from
`{N} blocking issue{s}` to `{N} blocking issue{s} — fix next` so the
section reads as actionable guidance, not a passive count.

Anchor links target the same `#section-<id>` ids already present on
the canvas sections (introduced in Phase-12 Prompt-01), so the
existing `scroll-margin-top` and sticky section navigator continue
to work with no further changes.

### 4. Trust bridge in the preview surface

`ArticlePreview.tsx` now renders a compact editorial notice at the
top of the preview when the current outcome carries validation
errors or warnings — e.g.

> Preview shows the current draft — 2 blocking issues still to fix.
> See the Readiness rail.

This binds the two surfaces visually: the author cannot look at the
preview and infer "this is publish-ready" when the rail says
otherwise. The notice uses existing status-ramp tokens
(`--hb-status-danger-*` for errors, `--hb-status-warn-*` for
warnings). When the preview is clean, nothing renders — the preview
remains editorial.

## States exercised

- **Healthy draft, no blockers, bound page** → readiness summary
  "binding is healthy"; intent chip `updateInPlace` / success;
  publish enabled; no trust-bridge notice on preview.
- **Draft with blockers** → readiness heading reads
  `{N} blocking issue{s} — fix next`; every issue with a known
  field carries a `Go to {Section} →` anchor; intent chip
  `Publish blocked — {N} issue{s}` / danger; publish disabled; preview
  carries the red trust-bridge notice.
- **Draft with warnings only** → warnings block still renders with
  fix-next anchors when field maps; intent chip unchanged from the
  publish path; preview carries the amber trust-bridge notice.
- **Bound page that will update in place** → intent chip
  `Will update in place` / success; detail "PageId and URL are
  preserved." Matches existing diagnostics language.
- **Bound page that will regenerate** (reproducible via
  `preview.decision.action === 'regenerate'` in the pure helper and
  exercised in `composeReadinessSummary` + `derivePublishIntent` unit
  paths) → intent chip `Will regenerate the page` / warn with cause
  detail when present.

Plus the zero-state:

- **No draft selected** → intent cue does not render (returns null),
  readiness rail shows the pre-existing "Pick a draft to see
  readiness." empty state.

## Controller seams preserved

- `useReadinessController` remains a pure derivation hook over
  `articleDraft` / `binding` / `preview` / `promotionPolicy`. The
  new `publishIntent` computation is colocated here because it
  already consumes the same inputs.
- `usePreviewController` unchanged — preview composition is still
  owned by the data adapter; the UI only consumes `PreviewOutcome`.
- Shell component `ArticlePublisher.tsx` remains the composition root.
  The new `PublishIntentCue` and `ValidationIssueItem` helpers are
  private inline functions that compose shell-owned classes plus
  already-threaded controller outputs; moving them to
  `sharedChrome/` would have required threading the module CSS map
  in, which adds more coupling than it saves.

## Bounded residual edge cases

- `sectionAnchorForFindingField` covers the current validation
  surface but is intentionally conservative: unknown fields render
  without a "Go to" link rather than routing the author to the wrong
  section. When the validation engine adds new field paths, the
  mapping should be updated — the map is a single switch in a pure
  module.
- The trust-bridge notice lives inside `ArticlePreview.tsx` so it
  also degrades gracefully when the outcome itself is not ok (no
  preview is rendered at all; the empty-state handles that path).
- The existing `PublishReadinessDiagnostics` "Technical details"
  disclosure was intentionally left as-is. Its purpose is operator
  drill-down (version drift numbers, raw finding categories); now
  that publish intent is visible in the primary flow, the
  diagnostics block legitimately remains secondary rather than being
  promoted into the editorial reading order.

## Proof of closure

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — pass.
- Full `@hbc/spfx-hb-publisher` test suite — 564/570 pass; same 6
  pre-existing `publisherEndToEnd` orchestrator failures, unrelated
  to this trust-loop work and not regressed.
- New shell classes (`publishIntentCue`, `publishIntentDetail`,
  `readinessIssueHint`, `readinessIssueAnchor`) reflected in the
  `article-publisher.module.css.d.ts` surface.
- New preview classes (`trustBridgeBlocking`, `trustBridgeWarn`)
  reflected in `articlePreview.module.css.d.ts`.
- No new runtime dependency.
- Controller boundaries preserved; no backend preview composition or
  publish orchestration rewritten.
