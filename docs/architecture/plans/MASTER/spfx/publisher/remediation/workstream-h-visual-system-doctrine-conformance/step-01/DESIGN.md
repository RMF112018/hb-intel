# Workstream H · Step 01 — Audit and doctrine-replace the admin-chrome visual language (DESIGN)

Design-only step. Audits the Publisher's current visual language against the SPFx Governing Standard + Homepage Overlay doctrine and specifies the premium editorial language Steps 02–05 will implement.

## 1. Current state — audit

### Inventory (CSS modules touched by workstreams A–G)
- `article-publisher.module.css` — the workspace shell, sections, fields, chips, row/card, readiness rail blocks, action buttons. ~900 lines.
- `storyBodyEditor/storyBodyEditor.module.css` (workstream C).
- `teamComposer/teamComposer.module.css`, `teamPanel.module.css` (workstream D).
- `mediaComposer/mediaComposer.module.css`, `galleryPanel.module.css` (workstream E).
- `previewSurface/articlePreview.module.css`, `readinessSurface/publishReadiness.module.css` (workstream F).
- `draftQueue/draftQueue.module.css` (workstream G).

### Token reference (doctrine source of truth)
- `packages/ui-kit/src/theme/tokens.ts`:
  `HBC_PRIMARY_BLUE` (#004B87), `HBC_BRAND_ACTION` (#337AAB) + hover/pressed ramp, `HBC_ACCENT_ORANGE` (#F37021), `HBC_PRESENTATION_BLUE` (#225391) + RGB, `HBC_SURFACE_LIGHT` + `HBC_SURFACE_FIELD` + `HBC_SURFACE_PRESENTATION`, `HBC_STATUS_RAMP_GREEN` / `_RED` / `_AMBER` / `_INFO` / `_GRAY`, `HBC_DANGER_HOVER` / `_PRESSED`.
- `packages/ui-kit/src/theme/radii.ts`: `HBC_RADIUS_NONE | SM (2) | MD (4) | LG | XL | PILL`.
- `packages/ui-kit/src/theme/elevation.ts`: `elevationLevel1 | 2 | 3`, `elevationHero`, `elevationEditorial`.
- `packages/ui-kit/src/theme/typography.ts`: `display*`, `body`, `bodySmall`, `label`.
- `packages/ui-kit/src/theme/animations.ts`: `TRANSITION_FAST`, `TRANSITION_DRAMATIC`.

### Admin-chrome tells — what doctrine says is wrong

| # | Tell | Files | Why it's admin-chrome |
| --- | --- | --- | --- |
| 1 | Raw `#e3e3e6` / `#e3e6ed` border on every card / chip / section | `article-publisher.module.css` (workspace, sections, rowCard), every composer / queue / preview module | Doctrine separates chrome from content via elevation + surface tokens, not 1px neutral borders. Flat grey borders read as a form admin screen. |
| 2 | `#1f1f1f` / `#4a4a4f` / `#7a7a82` slate text everywhere, `#225391` used inconsistently as the only blue | Every module | `HBC_PRIMARY_BLUE` is #004B87; Publisher currently uses `#225391` (which is `HBC_PRESENTATION_BLUE`, the editorial canvas accent) as both CTA colour and link colour. Editorial surfaces should pick one authoritative blue for editorial text/highlights and reserve CTA colour for `HBC_BRAND_ACTION`. |
| 3 | Hard-coded radii mixing 2 / 3 / 4 / 6 / 8 / 10 / 999 | Every module | Token set is `NONE | SM | MD | LG | XL | PILL`. No consumer reaches for the tokens; every card / chip / button picks its own radius. |
| 4 | Hard-coded spacing: raw px values 2 / 4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 | Every module | Publisher doesn't use `HBC_SPACE_*` tokens; the scale drifts row-by-row and composer-by-composer. |
| 5 | Segoe UI stack declared inline in every module | `articlePreview.module.css`, `article-publisher.module.css` | Doctrine wants the host-font inheritance; declaring the stack locally both re-declares and forks silently. |
| 6 | Transition declarations ad-hoc: `150ms ease`, `100ms linear`, none at all | `teamPanel.module.css`, `galleryPanel.module.css`, `draftQueue.module.css` | `TRANSITION_FAST` (150ms) and `TRANSITION_DRAMATIC` exist for exactly this; Publisher doesn't consume them. |
| 7 | Buttons duplicated across modules (`.primaryBtn`, `.btn`, `.dangerBtn`, `.addBtn`, `.actionBtn`, `.iconBtn`) with drifting colours | `article-publisher.module.css`, `draftQueue.module.css`, `teamPanel.module.css`, `galleryPanel.module.css`, `mediaComposer.module.css` | No shared button language. The draft-queue "+ Add teammate" doesn't match the Publisher "Start new draft" doesn't match the composer "Save teammate" primary action. |
| 8 | Field chrome duplicated: every composer re-declares `.input`, `.textarea`, `.field`, `.fieldLabel`, `.fieldHelper`, `.fieldCount` with slightly different borders / paddings / colours | `teamComposer`, `mediaComposer`, and the top-level `Field` in `article-publisher.module.css` | A governed shared `EditorialField` pattern would eliminate six duplicates. |
| 9 | Chip grammar duplicated: featured / ready / todo / blocked / warn / info chips defined six times with drifting colours | `teamPanel`, `galleryPanel`, `draftQueue`, `mediaComposer`, `publishReadiness`, `article-publisher` | A single `EditorialChip` with a `variant` prop eliminates the drift. |
| 10 | Machine-identifier `code` blocks overflow inline on the readiness rail | `publishReadiness.module.css` | Operators read these; authors should not see them. Already behind a `<details>` (step F-03); chrome inherits default `font-family: monospace` instead of a consistent editorial mono. |
| 11 | Focus rings declared per-surface (`outline: 2px solid #225391`) instead of inheriting from a governed pattern | Every focusable button | Nine different files declare the same outline; doctrine would centralise. |
| 12 | No elevation anywhere — workspace, rail, canvas, composer all sit on flat white with a 1px border | Every module | `elevationLevel1` / `elevationLevel2` exist for exactly the workspace-shell / flyout hierarchy. Flat borders read as admin; subtle elevation reads as product. |

### Summary

The Publisher has converged on a shared *structural* grammar (composer folders, canvas sections, readiness rail) but its *visual* grammar is still admin-chrome: flat grey borders, drifting radii, drifting spacing, unbranded buttons, duplicated chip/field/focus styles, no elevation. The shared `@hbc/ui-kit` token set exists and is used elsewhere in the monorepo (`HbcKudosComposerFlyout`, `HbcPeoplePicker`, Homepage surfaces) — the Publisher simply hasn't adopted it.

## 2. Target state — premium editorial language

### Core principles
- **Tokens, not magic numbers.** Every radius, spacing, colour, transition, elevation references the exported tokens in `@hbc/ui-kit/theme/*`.
- **Fewer surfaces, more elevation.** Flat grey borders on every card become a deliberate two-tier hierarchy: the workspace is flat; the sections, composers, chips, and flyouts carry `elevationLevel1` over a `HBC_SURFACE_LIGHT.surface-1` background.
- **One button language.** A shared local `PublisherButton` primitive with three variants — `primary` (brand-action ramp), `secondary` (neutral ghost), `danger` (danger ramp). Every action button — Save draft, Publish, Add teammate, Remove image, Move up — consumes the same primitive.
- **One chip language.** A shared local `EditorialChip` with variants — `success` (green status ramp), `warn` (amber status ramp), `danger` (red status ramp), `info` (info status ramp), `neutral`, `featured` (brand-accent presentation). Replaces six duplicated chip styles across workstreams.
- **One field language.** The Publisher's existing local `Field` primitive (workstream C) becomes the canonical local field pattern; the composer-folder duplicates are removed and the composers import the Publisher-scoped `Field` (or a small export thereof under `sharedChrome/`).
- **Authoritative blue roles.** `HBC_BRAND_ACTION` (#337AAB) drives CTAs. `HBC_PRESENTATION_BLUE` (#225391) drives editorial highlights — matched text, preview callout bars, focus rings. `HBC_PRIMARY_BLUE` (#004B87) drives hover/pressed for CTAs.
- **Focus one-liner.** A single `.focusable` mixin (CSS-module `:focus-visible` rule) replaces the nine per-surface declarations.
- **Typography from the host.** Remove the inline `'Segoe UI', system-ui, -apple-system, sans-serif` declarations; inherit from the host. Heading hierarchy: preview `<h1>` in `display*` sizes; section `<h2>` in `body-large`; label in `label` type.
- **Motion.** Every transition uses `TRANSITION_FAST` (150ms ease) unless a specific motion moment wants `TRANSITION_DRAMATIC`. `prefers-reduced-motion` is honoured via `@media (prefers-reduced-motion: reduce)` disabling non-essential transitions.

### Zone-by-zone treatment

| Zone | Before | After |
| --- | --- | --- |
| Workspace shell | flat `#f7f7f8` bg with 1px rails | `HBC_SURFACE_LIGHT.surface-2` bg; rail + canvas + readiness each on `HBC_SURFACE_LIGHT.surface-1` with `elevationLevel1` |
| Canvas sections | flat white card with 1px `#e3e3e6` border | section headers on the canvas directly (no card); subsections floating with `elevationLevel1` when they carry a composer-adjacent artefact (e.g. promotion summary) |
| Draft rail | flat white card with 1px border | `HBC_SURFACE_LIGHT.surface-1`, `elevationLevel1`, search input with `HBC_BRAND_ACTION` focus ring |
| Readiness rail | Mixed: grey card for summary, grey card for blocking, ochre card for warnings, grey card for actions | Each block on `HBC_SURFACE_LIGHT.surface-1` with `elevationLevel1`; primary-action block gets `elevationLevel2` to anchor the eye |
| Composer flyout | Already uses `HbcKudosComposerFlyout` (governed) | Keep; Publisher-body styles inside the flyout collapse to the shared `Field` + `EditorialChip` |
| Chips (featured / ready / todo / blocked / role / age) | six drifting implementations | one local `EditorialChip` primitive with a `variant` prop |
| Buttons (primary / secondary / danger / link / icon) | five-plus drifting implementations | one local `PublisherButton` primitive with three variants + an icon-only sibling |
| Typography | Segoe declared inline everywhere | Inherit host; only heading sizes + weights declared locally, from `typography.ts` scale |

### Density + spacing
- Row padding: `HBC_SPACE_SM` vertical / `HBC_SPACE_MD` horizontal.
- Card padding: `HBC_SPACE_MD` all sides; composer flyout body retains its current `HBC_SPACE_LG`.
- Gap within a section: `HBC_SPACE_SM`; gap between sections: `HBC_SPACE_LG`.
- No ad-hoc 6px or 10px values.

### Accessibility
- Single `:focus-visible` treatment — `outline: 2px solid var(--hbc-focus, HBC_PRESENTATION_BLUE); outline-offset: 2px; border-radius: inherit`.
- Colour-plus-text on every chip (already held after workstream G, but the central `EditorialChip` enforces it).
- High-contrast mode checked against `forced-colors: active` — chips should lose their tinted background in favour of a system-paired `ButtonFace` + `ButtonText` treatment.

## 3. Primitive reuse vs. new work

- **Reuse, not duplicate:** `@hbc/ui-kit` tokens + `HbcKudosComposerFlyout` + `HbcPeoplePicker` + `HbcEmptyState` + `HbcSpinner` continue to carry the shared-UI load.
- **New local primitives (Publisher-scoped, under a new `sharedChrome/` folder):**
  - `PublisherButton.tsx` + `publisherButton.module.css` — three variants + icon-only.
  - `EditorialChip.tsx` + `editorialChip.module.css` — six variants.
  - `tokens.module.css` — a single CSS-module file exporting the Publisher's token subset as `:root {}` custom properties (so every composer CSS module can `var(--hbc-brand-action)` rather than copy hex).
- No new shared `@hbc/ui-kit` primitive. The Publisher-scoped primitives eliminate in-Publisher drift without disturbing consumer surfaces elsewhere (Kudos, People, Homepage) that already consume the tokens directly.

## 4. Sequencing — steps 02 – 05

- **Step 02 — Foundations.** Add `sharedChrome/tokens.module.css` + `PublisherButton` + `EditorialChip`. No surface change yet; these primitives are exported and covered by tests.
- **Step 03 — Editorial migration.** Replace every button, chip, field-focus, and radius in the Publisher modules with the new primitives + tokens. Remove the inline `Segoe UI` declarations and the duplicated chip/button styles. This is the visible change.
- **Step 04 — Elevation + surface hierarchy.** Apply the two-tier elevation story to the workspace shell, rails, canvas sections, and composer bodies. Replace flat grey borders with `elevationLevel1` over surface-1.
- **Step 05 — Full scrub + hosted vetting.** Workstream README, before/after screens documented, high-contrast + reduced-motion + zoom verified.

## 5. Scope cuts (explicit)

- **No new shared `@hbc/ui-kit` primitive.** `PublisherButton` + `EditorialChip` live local to the Publisher. If a second consumer materialises (Kudos button drift, for instance), the primitive can be promoted as a discrete future workstream.
- **No typography-scale rework.** The Publisher continues to use the existing `typography.ts` scale; this workstream does not introduce new type sizes.
- **No dark-mode.** Doctrine doesn't require it for the Publisher in the current phase.
- **No iconography overhaul.** The star / kebab / arrow / × icons stay as-is for this workstream.

## 6. Lifecycle safety

- No schema change.
- No adapter, orchestrator, or write-seam change.
- All changes are CSS + local primitive composition.
- Pre-existing behaviour tests (231 across the Publisher) should continue to pass with zero adjustments; visual regression is caught by the Step 05 hosted-vetting walkthrough, not by the unit suite.

## 7. Files touched by this step

- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-h-visual-system-doctrine-conformance/step-01/DESIGN.md` (this file).
- No source, no manifest, no tests. No version bump.

## 8. Definition of completion for this step

- Publisher's existing visual language audited against doctrine ✔
- Admin-chrome tells enumerated with files ✔
- Target editorial language specified (tokens, zone-by-zone, button grammar, chip grammar, field grammar, density, focus, motion, a11y) ✔
- Primitive-reuse plan anchored on `@hbc/ui-kit` tokens + new Publisher-local primitives ✔
- Explicit scope cuts + Step 02–05 sequencing ✔
