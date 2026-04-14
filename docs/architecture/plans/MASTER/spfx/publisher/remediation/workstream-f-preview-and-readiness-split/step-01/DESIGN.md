# Workstream F · Step 01 — Preview and publish-readiness information architecture (DESIGN)

Target-state design for the split between **Article Preview** and **Publish Readiness** in the Article Publisher. No production code changes land in this step; this is the spec the remaining workstream-F steps implement against.

## 1. Current state (repo truth)

Today a single `PreviewPanel` surface in `ArticlePublisher.tsx` renders **everything** about a draft's publish-time posture:

- Drift banner (hard/soft template / shell / version drift).
- Validation findings (errors + warnings, interleaved, full `category` + `field` + `message` + `actionHint`).
- Decision on publish (`action`, `reason`, `regenerationCause`, notes).
- Composed-page structural listing (every control, slot, visibility, etc.).

A second, narrower surface — the **readiness rail** (`styles.readinessRail`) — renders alongside it and carries:
- A prose `readinessSummary` (from `composeReadinessSummary`).
- Blocking-issues list.
- Warnings list.
- Primary actions (publish, save draft, preview).
- Workflow transitions.
- Destructive actions (archive, withdraw).
- Last-action status banner.

The two surfaces overlap heavily (validation errors appear in both), rail + preview together expose every internal field name and machine category (`category: 'invalid-shell-compatibility'`, `field: 'existingBinding.PageShellVersion'`), and drift is communicated in three different voices on the same page.

### Problems
- **Two competing information hierarchies.** Authors cannot tell which surface is the source of truth; operators cannot find the technical detail quickly without reading prose.
- **Visual preview is buried.** The Preview tab is labelled "Preview" but 80 % of the surface is validation + decision prose, not a visual representation of the article.
- **Technical drift leaks into the author voice.** "Shell version drift detected" is meaningful to operators but noise for editorial authors.
- **Readiness and preview don't share a model.** They render the same findings twice with different formatting.
- **No visual story.** The current "Preview" is a plain ordered list of composed-page controls; no one looks at it and sees the article they're about to publish.

## 2. Target state — two surfaces, one model, clear roles

### Article Preview — author-facing visual preview
What the published page will look like.

Contains:
- **Headline** (`Title`) in the hosted typography.
- **Subhead** + **Summary excerpt** rendered as the homepage card will render them.
- **Hero** preview (image + alt text visible as a tooltip/helper; eyebrow, category label, theme variant applied).
- **Story body** rendered from the TipTap HTML with the hosted body styles.
- **Pull-out callout / Pull quote** rendered inline.
- **Teammate roster** — the chip-stack preview, sourced via `buildTeamViewerPersonList`.
- **Gallery grid** — sourced via the same `composeGallery` output the publish pipeline uses (preview-publish parity).
- **Card-level preview pane** — what the homepage roll-up will see (excerpt + hero thumbnail + date).
- Purely editorial signals: character counts, featured badges, readiness banner ("Gallery is ready", "2 teammates · 1 featured").

Does **not** contain:
- Validation error text with `category` / `field` / `message` / `actionHint` triple.
- Drift banners mentioning `PageShellVersion`, `RenderVersion`, `PageTemplateKey`.
- Decision trace (`action: 'create'` vs `'update'`).
- Composed-page structural control listing.

Posture: **editorial, not diagnostic.** The preview is what the author will publish; if something is blocking publish, the Publish Readiness surface says so — the preview does not re-narrate it.

### Publish Readiness — operator-facing readiness surface
Whether it can publish, and what will happen if the author clicks publish.

Contains:
- **Readiness summary** — the prose from `composeReadinessSummary` (first-person-plural, authorial; "Your article is ready to publish", "We found 2 things to look at").
- **Blocking issues** — validation errors grouped by category, with `field` codes surfaced in a monospace detail view but collapsed by default.
- **Suggestions** — validation warnings; non-blocking.
- **What will happen on publish** — the `decision` summary in plain English (`"Create a new page at https://…/sites/ProjectSpotlight/…"` or `"Update the existing page (PageId, PageUrl preserved)"` or `"Regenerate a new page (PageTemplateKey changed)"`).
- **Drift & versioning** — the two drift banners in operator voice, collapsible "Technical drift" expander showing the exact `PageShellVersion` / `RenderVersion` / `PageTemplateKey` diff when open. Not visible by default.
- **Primary actions** — Publish, Save draft, Preview-in-new-tab.
- **Workflow transitions** — kept as-is.
- **Destructive actions** — archive, withdraw. Kept as-is.
- **Last action** — unchanged status banner.

Posture: **diagnostic, but author-safe by default.** Internal field names and categories are hidden behind an "Technical details" disclosure; the surface reads as a confident go/no-go signal with actionable next steps.

## 3. Shared model (canonical source)

Both surfaces derive from the same `PreviewOutcome` (the workstream-C step-04 pipeline output). No new data source.

- **Preview** reads: `composedPage`, `resolution.article`, `resolution.teamMembers`, `resolution.media`.
- **Readiness** reads: `validation` (errors, warnings, categories), `decision`, `drift`, `resolution.existingBinding`.

The `PreviewOutcome` shape is **not changed**. What changes is how it is rendered.

## 4. Interaction model

Layout:

```
┌────────────────────────────────┬─────────────────────┐
│          Article Preview       │  Publish Readiness  │
│  (hero + body + cards + grid)  │  (summary, issues,  │
│                                │   actions, drift)   │
└────────────────────────────────┴─────────────────────┘
```

- **Desktop (≥ 1280px):** the three-column Publisher shell (draft rail | authoring canvas | readiness rail) stays. The Preview surface is a dedicated section inside the authoring canvas — the existing "Preview" section is rebuilt to be editorial-visual rather than diagnostic. The readiness rail on the right remains the Publish Readiness surface.
- **Tablet / narrow:** the readiness rail collapses below the canvas (existing behaviour). Nothing changes here — the split is conceptual, not layout-restructuring.

Disclosure:
- Readiness has a single collapsible "Technical details" section that reveals the machine-readable findings (`category`, `field`, raw drift numbers). Collapsed by default. Keyboard accessible via native `<details>`/`<summary>` — no custom widget.

## 5. Primitive reuse

- `HbcEmptyState` for empty-preview + no-content states.
- `HbcSpinner` for loading states (already used).
- Preview composition sources from `pageCompositor.composeBanner` / `composeBody` / `composeTeam` / `composeGallery` — same pipeline the publisher writes. Ensures preview-publish parity.
- For the teammate chip preview inside Article Preview, reuse `buildTeamViewerPersonList` and `HbcPeoplePicker`'s initials/avatar fallback styling patterns via the existing team-composer chip visual language.
- Gallery preview reuses the `GalleryPanel` tile visual language (thumbnail + caption) but in a read-only mode.
- Readiness summary prose reuses `composeReadinessSummary` (already centralised).

No new ui-kit primitive required. New Publisher-scoped components go under a `previewSurface/` (editorial visual preview) + `readinessSurface/` (operator-facing readiness) folder pair, mirroring the `teamComposer/` and `mediaComposer/` patterns.

## 6. Accessibility contract

- Preview surface: pure-visual representation; every image carries `alt={row.AltText}`; headline / subhead / summary use real heading levels; card preview is a `<section>` with `aria-label`.
- Readiness surface: the summary banner uses `aria-live="polite"`; problem-level (can't publish) uses `role="alert"`; technical-details `<details>` is keyboard-expandable; findings list items retain their existing `category` / `message` / `actionHint` shape but the `category` is rendered as a discreet badge rather than the primary line.

## 7. Lifecycle + contract safety

- `PreviewOutcome` shape unchanged; `previewBuilder` unchanged; `publishOrchestrator` unchanged; `validationEngine` unchanged; `composeReadinessSummary` unchanged.
- Preview-publish parity is preserved because both surfaces read from the same `composeProjectSpotlightPage` output.
- No new write seam, no new dependency, no schema change.

## 8. Sequencing — steps 02 – 05

- **Step 02 — Redesign the Article Preview surface.** Rebuild `PreviewPanel` into an editorial visual preview: hero + headline + subhead + summary + body + callout/pull-quote + teammate chips + gallery grid + card-level preview. Extract into `previewSurface/ArticlePreview.tsx`. Drop validation / decision / drift from this surface.
- **Step 03 — Redesign the Publish Readiness surface.** Consolidate the readiness-rail blocks into a `readinessSurface/PublishReadiness.tsx` component with: readiness summary, blocking issues (author voice + collapsible field codes), suggestions, "what will happen on publish" plain-English decision, collapsible "Technical drift" disclosure, primary + workflow + destructive actions, last-action banner. Remove the duplicated validation rendering now hosted by the Article Preview.
- **Step 04 — Rewire consumers + integration tests.** `ArticlePublisher.tsx` imports the new components; delete the inline `PreviewPanel` implementation; add round-trip tests proving the two surfaces read disjoint slices of `PreviewOutcome` and do not duplicate information.
- **Step 05 — Full behavioural scrub, workstream README, hosted SPFx vetting.**

## 9. Scope cuts (explicit)

- **No hosted-page iframe / real-time SharePoint Pages render.** The Article Preview renders using tenant typography + layout in a sandboxed composition; it does not attempt to embed the live SharePoint host page. That is a hosted-vetting concern for a later phase.
- **No author-level re-authoring inside Preview.** Clicks in the preview do not open editors; authors return to the authoring canvas sections to make changes. The Preview is a viewer.
- **No operator-facing diff tool** beyond the existing drift banners + the new collapsible technical-details disclosure. A full publish-diff view is out of scope.

## 10. Files touched by this step

- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-f-preview-and-readiness-split/step-01/DESIGN.md` (this file).
- No source, no manifest, no tests. No version bump.

## 11. Definition of completion for this step

- Target split between Article Preview and Publish Readiness defined ✔
- What belongs in each surface enumerated, with explicit inclusions and exclusions ✔
- Disclosure model for technical detail specified ✔
- Reusable primitives and compositor parity preserved ✔
- Accessibility contract specified ✔
- Lifecycle + contract safety preserved ✔
- Step 02–05 sequencing defined ✔
