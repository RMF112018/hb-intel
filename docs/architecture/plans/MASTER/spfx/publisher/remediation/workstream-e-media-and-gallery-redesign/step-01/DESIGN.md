# Workstream E · Step 01 — Media and gallery authoring interaction model (DESIGN)

Target-state design for the Article Publisher's media and gallery authoring flow. No production code changes in this step; this is the spec the remaining workstream-E steps implement against.

## 1. Current state (repo truth)

**Surface:** `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx#GalleryPanel` (currently ~L1867–2013).

**Shape:** A raw CRUD row editor. Clicking "Add image" appends a `PublisherMediaRow` with `MediaRole: 'gallery'`, blank `Title`, blank `ImageAsset` (URL), blank `AltText`, optional `Caption`, optional `GalleryGroup`, and a `FeaturedInGallery` checkbox. Each row renders six form fields, a role chooser, the featured toggle, and `Move up` / `Move down` / `Remove` buttons. `SortOrder` is re-stamped from index on reorder.

**Tenant schema (`publisherContracts.PublisherMediaRow`, `HB Article Media` §C):** `ArticleId`, `MediaId`, `Title`, `MediaRole` (`gallery | supporting | hero | secondary`), `ImageAsset` (URL, required), `AltText` (required), `Caption?`, `SortOrder?`, `GalleryGroup?`, `FeaturedInGallery?`.

**Downstream consumers:**
- `pageCompositor.composeGallery` filters to `MediaRole === 'gallery'`, sorts by `SortOrder` with an `ImageAsset` tiebreaker, and passes `{ imageUrl, altText, caption }` to the gallery control.
- Hero and secondary images are authored on the Hero / Secondary-image tabs today, not via this panel. The panel nominally supports those `MediaRole`s but publishing them here is effectively unused — the hero slot reads `article.HeroPrimaryImage` / `HeroPrimaryImageAltText`, the secondary slot reads `article.SecondaryImage` / `SecondaryImageAltText`.
- `validationEngine` Rule 14 asserts every `MediaRole === 'gallery'` row has `AltText`. Rule 16 warns when `MediaRole === 'secondary'` exists but the shell has no secondary slot.

**Problems with the current surface:**
- **No thumbnail.** Authors paste a URL and hope. A typo ships a broken image on the published page.
- **Admin-console density.** Six labelled inputs per row plus a role chooser plus a toggle plus three action buttons — the opposite of "editorial".
- **Weak a11y guidance.** `AltText` is required by validation but the field's placeholder is generic (`Describe the image in a sentence`). No character awareness, no "decorative image" affordance, no hint that screen-reader users depend on it.
- **Role confusion.** The chooser offers all four roles even though only `gallery` is authored in practice here. Authors can pick `hero` / `secondary` and think they've set the hero image, but the hero lives on a different tab.
- **Featured flag is per-row with no invariant.** Any number of images can be featured; `pageCompositor` has no special behaviour for `FeaturedInGallery`, so the flag ships data with no render consequence — fake affordance.
- **`GalleryGroup` is free text** with no authoring UX around grouping. The data flows through to `buildTeamViewerPersonList`-adjacent groupers but has no presence on the gallery render path today.
- **`Title` is internal only** — never rendered. It is required by tenant schema but has no editorial meaning.

## 2. Benchmarks

- **Workstream D composer pattern** — `TeamPanel` + `TeamMemberComposer` established a governed interaction model for "roster of structured items with a right-side composer flyout". Reuse verbatim: chip-stack canvas + `HbcKudosComposerFlyout` + pure invariants module + character-aware `Field` primitive.
- **`HbcEmptyState`** — editorial empty state already used across the Publisher.
- **Step-03 `Field`** — helper copy + live character counter announced via `aria-live`. Same semantics fit alt text (soft 125) and caption (soft 140).
- **Paste sanitiser pattern** — workstream-c step-05 established pure, SPFx-safe, string-based sanitisation. The same pattern applies if we later accept pasted image URLs with query-string noise.

## 3. Target state — interaction model

### Entry surface (replaces the inline row editor)

The `GalleryPanel` body becomes a **gallery canvas**:

1. **Empty state.** A premium `HbcEmptyState` plus a single primary CTA — `+ Add image` — that opens the image-composer flyout. No visible columns, no phantom rows.
2. **Populated state.** A responsive **thumbnail grid** (chip-stack-equivalent for images): each tile is ~180px wide, shows the rendered thumbnail from `ImageAsset`, an editorial caption preview, a role badge (only when the role is not the default), and a featured badge when set. Each tile:
   - Click / `Enter` / `Space` opens the image composer in edit mode.
   - Keyboard-reorder via `Alt+ArrowLeft` / `Alt+ArrowRight` / `Alt+ArrowUp` / `Alt+ArrowDown` when focused (grid-aware). Pointer `Up` / `Down` buttons remain as a secondary affordance.
   - A small `★` button toggles `FeaturedInGallery` inline (mirror of the teammate composer's featured toggle) — enforces a **mutually-exclusive featured-image invariant** so the downstream render has a single "hero-of-the-gallery" pick to use.
3. **Add button** at the end of the grid — `+ Add image`.
4. **Broken-image handling.** When the tile's `<img>` fails to load, render a warning card with the image title + a "Replace image" action that opens the composer pre-seeded on that row. A tile in error state shows `role="alert"` messaging inline.

### Image composer flyout (the governed pattern)

A right-side slide-over flyout, reusing `HbcKudosComposerFlyout`:

| Zone | Content |
| --- | --- |
| **Header** | `Add image` / `Edit image`. Subtitle: `Add supporting visuals that render on the published page — alt text is required so every reader gets the same story.` |
| **Image URL** | A governed `Field` + URL input with real-time thumbnail preview pane beside it. `https://` only (other schemes rejected inline). Empty state for the preview is a neutral aspect-ratio placeholder. Loading / error states are wired explicitly. |
| **Role selector** | Two-option `ChooserGroup` — **Gallery image** (default) and **Supporting image**. `hero` and `secondary` are **removed** from this surface (they are authored on their dedicated tabs). |
| **Alt text** | `Field` with required indicator, soft 125-char guidance counter. Helper copy: "Describe what is visible and why it matters. Skip the phrase 'image of…'. Required unless the image is purely decorative." |
| **Decorative checkbox** | When checked, the alt-text input is disabled and emits `AltText=""` (empty string for tenant-required column) with a separate `data-decorative` signalling — *or* we keep alt-text required always (safer default) and drop the decorative affordance. **Decision: keep alt-text always required.** The governing doctrine favours accessibility-first over expressive nuance for publisher content. The decorative affordance is deferred as a later enhancement. |
| **Caption** | `Field` with soft 140-char counter, helper: "Optional. Editorial line rendered under the image." |
| **Live preview** | A right-pane card showing the composed tile: thumbnail + caption + role badge + featured badge, updated in real time. |
| **Primary action** | `Save image` — disabled until URL + alt text are both present. |
| **Secondary action** | `Cancel` / `Remove image` (edit mode). |

States: **idle** (URL blank), **editing** (URL entered; thumbnail loading or ready), **invalid** (non-https URL, or alt-text blank), **error** (thumbnail failed to load), **success** is implicit — save closes the flyout.

### Removed from the author surface
- **`Title`** (internal only; auto-populate at save from the URL's last path segment if blank, or from AltText — keeps tenant required column satisfied without author friction).
- **`MediaRole` values `hero` / `secondary`** — authored elsewhere; not exposed here.
- **`GalleryGroup`** free-text — no UX around grouping today; preserve verbatim on edit for legacy rows, do not surface.
- **Six-input row grid** — replaced entirely.

### Kept (editorial)
- **Image URL** (with thumbnail preview).
- **Role** (gallery vs supporting only).
- **Alt text** (always required).
- **Caption** (optional, counter-aware).
- **Featured** (mutually exclusive, inline toggle).

### System-managed (no UI)
- `MediaId`, `ArticleId`, `SortOrder` (re-stamped from grid order).
- `Title` (derived from URL last segment or AltText at save; preserved on edit for legacy rows).
- `GalleryGroup` (preserved on edit; not authored).

## 4. Data mapping

`PublisherMediaRow` fields at save:

| Field | Source |
| --- | --- |
| `MediaId` | Kept on edit; generated (`m-${timestamp}-${rand}`) on add. |
| `ArticleId` | From composer context. |
| `MediaRole` | Composer chooser — `gallery` (default) or `supporting`. |
| `ImageAsset` | Composer URL input (validated `https://` only). |
| `AltText` | Composer alt-text input (always required). |
| `Caption` | Composer caption input (optional). |
| `SortOrder` | Re-stamped from grid position at write time. |
| `FeaturedInGallery` | Composer-scoped + chip-toggle; mutually-exclusive across all rows via a pure `applyFeaturedGalleryInvariant` helper. |
| `GalleryGroup` | Carry-over on edit; not authored. |
| `Title` | On add, derived from `new URL(ImageAsset).pathname` last segment, falling back to the first 60 chars of `AltText`. Preserved on edit. |

No schema change. No migration. `media.replaceAllForArticle` remains the write seam.

## 5. Primitive reuse vs. new work

Reuse verbatim:
- `HbcKudosComposerFlyout`, `HbcEmptyState`, Publisher `Field`, `ChooserGroup` — already used across the Publisher.
- Pattern from `teamComposer/teamInvariants.ts`: a `mediaInvariants.ts` mirrors `applyFeaturedInvariant` for gallery-featured exclusivity plus `restampSortOrder` (the name could be reused from teamInvariants if we generalise, but we keep module-local helpers to preserve package boundary clarity).
- Pattern from `teamComposer/hydrateTeamMember.ts`: a `mediaComposer/buildMediaRow.ts` encapsulates add / edit / legacy-preservation rules.

New work for later steps:
- `MediaComposer.tsx` — the flyout.
- `GalleryCanvas.tsx` — the thumbnail grid + keyboard reorder.
- `mediaInvariants.ts` — pure helpers + tests.
- Tile thumbnail + broken-image error state.
- Validation engine alignment: Rule 14 already asserts gallery-row alt text; extend the soft 125 char guidance as a warning (non-blocking) once the composer enforces it.

## 6. Accessibility + keyboard

- Tile buttons are real `<button>` elements; `<ol>` wrapper announces the reorder affordance via `aria-label`.
- `Alt+Arrow` keyboard reorder; pointer buttons retained.
- `aria-pressed` on the featured star toggle; person-scoped (here: image-scoped) `aria-label`s on every action button.
- Thumbnail images carry `alt={row.AltText}` in the composer preview so the author sees what the screen reader will announce; on the hosted page, the existing gallery-control render path continues to consume `altText` via `pageCompositor.composeGallery`.
- Broken-image tile uses `role="alert"` for the error-state messaging.

## 7. Lifecycle safety

- Publish / republish / archive / withdraw unchanged.
- `media.replaceAllForArticle` remains the only write seam.
- `pageCompositor.composeGallery` continues to filter by `MediaRole === 'gallery'` and sort by `SortOrder`. No contract changes required here; the redesign only narrows what the UI authors, not the persisted schema.
- `validationEngine` Rule 14 (gallery alt text required) continues to fire; the composer additionally prevents save without alt text, closing the hole from the UI side.

## 8. Sequencing — steps 02 – 05

- **Step 02** — Build `MediaComposer` + thumbnail preview, add `mediaInvariants.ts` + tests, wire URL validation (https-only) and alt-text guidance counter. Replace the `GalleryPanel` inline grid with a minimum viable thumbnail stack + composer invocation.
- **Step 03** — Thumbnail grid refinement: responsive tile layout, keyboard reorder (grid-aware Alt+Arrows), inline featured star, broken-image fallback state.
- **Step 04** — Persistence + preview + gallery contract hardening: integration tests proving composer-produced rows round-trip through `mapMediaRowToListFields` and `composeGallery`; extend validation with a soft alt-text length warning matching the composer guidance; Title auto-derivation behaviour locked with tests.
- **Step 05** — Full behavioural scrub, remove dead code, workstream README + closure, hosted SPFx vetting.

## 9. Scope cuts (explicit)

- **Decorative-image affordance** — deferred. The publisher content is not decorative in practice; alt text is always required.
- **Upload / file-picker** — out of scope. Authors paste https URLs pointing at the tenant image library or approved CDN.
- **`hero` / `secondary` role selection in this panel** — out of scope (authored elsewhere).
- **`GalleryGroup` authoring** — preserved as data-through; not surfaced until product validates the authoring need.
- **Pointer drag-and-drop reorder** — deliberately deferred in favour of keyboard + button reorder (same trade-off as Workstream D Step 03).

## 10. Files touched by this step

- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-e-media-and-gallery-redesign/step-01/DESIGN.md` (this file — the design deliverable).
- No source, no manifest, no tests. No version bump.

## 11. Definition of completion for this step

- Target interaction model for media / gallery authoring is defined and grounded in repo truth ✔
- Thumbnail treatment, role selection, alt-text guidance, caption guidance, featured behaviour, and ordering behaviour specified ✔
- Reuse plan anchored on workstream-c Field + workstream-d composer pattern ✔
- Tenant schema and lifecycle contracts preserved ✔
- Accessibility + keyboard contract specified ✔
- Explicit scope cuts documented ✔
- Step 02–05 sequencing defined ✔
