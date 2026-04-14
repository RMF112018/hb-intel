# Workstream H · Step 02 — Closure

## Objective
Land the token-led visual foundations the Publisher's composer + panel modules will migrate onto in Step 03. Introduce Publisher-scoped `PublisherButton` and `EditorialChip` primitives and a CSS-module that publishes the `@hbc/ui-kit` token subset as `var(--hb-*)` custom properties.

## What changed

### New `sharedChrome/` module (foundations only — no migration yet)
`apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/`

- `tokens.module.css` — a single CSS-module that declares `:root { --hb-* }` for the Publisher's token surface: brand / editorial blues, surface tints, text ramps, status ramps (success / warn / danger / info / featured / neutral), spacing (`xs` → `xl` mirrored from `HBC_SPACE_*`), radii (`sm` → `pill`/`full` mirrored from `HBC_RADIUS_*`), two-tier elevation (`--hb-elevation-1`, `--hb-elevation-2`), and a motion token (`--hb-transition-fast`) that collapses to `0ms` under `prefers-reduced-motion: reduce`. Values mirror the TypeScript tokens in `packages/ui-kit/src/theme/*.ts` verbatim.
- `PublisherButton.tsx` + `publisherButton.module.css` + `.d.ts` — one button primitive with three variants (`primary` on the `HBC_BRAND_ACTION` ramp, `secondary` neutral-ghost, `danger` on the danger ramp), two sizes (`md` / `sm`), optional `iconOnly` round mode, `pressed` state that maps to `aria-pressed` + featured-amber styling. Focus ring uses `HBC_PRESENTATION_BLUE`. Forwards refs. `type` defaults to `'button'` so callers can't accidentally submit a form.
- `EditorialChip.tsx` + `editorialChip.module.css` + `.d.ts` — one chip primitive with six variants (`success` / `warn` / `danger` / `info` / `neutral` / `featured`). Every variant is colour + text, never colour-only. Honours `forced-colors: active` by swapping to `ButtonText` / `ButtonFace` / `ButtonBorder`. Forwards refs.
- `index.ts` — barrel re-exporting both components + their types.

### Tests
- `publisherButton.test.tsx` — 8 RTL tests covering default variant, primary / danger variants, iconOnly, pressed → aria-pressed, onClick + disabled, ref forwarding, custom `type` override.
- `editorialChip.test.tsx` — 9 RTL tests covering default neutral variant, all five coloured variants (via `it.each`), small size, aria-label + title pass-through, ref forwarding.
- Both test files adopt `afterEach(cleanup)` so parallel-rendered instances in `it.each` / rerender cases don't collide — aligned with repo convention.

## Doctrine alignment
- **Tokens, not magic numbers.** The Publisher can now reach for `var(--hb-space-sm)` / `var(--hb-color-brand-action)` / `var(--hb-radius-pill)` etc. from any module. Step 03 migrates consumers; Step 02 delivers the surface.
- **One button language, one chip language.** The six+ duplicated button and chip styles currently scattered across `article-publisher.module.css`, `teamPanel.module.css`, `galleryPanel.module.css`, `draftQueue.module.css`, `mediaComposer.module.css`, and `publishReadiness.module.css` will all collapse onto `PublisherButton` + `EditorialChip` in Step 03.
- **No new shared `@hbc/ui-kit` primitive.** Both primitives live local to the Publisher, consistent with the design: if Kudos or another surface needs the same treatment later, promotion is a discrete future ticket.
- **Accessibility-first.** Focus ring is centralised; forced-colors honoured at the chip level; pressed/aria-pressed mapped explicitly; colour + text on every chip.
- **Motion honours reduced-motion.** The `--hb-transition-fast` variable collapses to 0ms under `prefers-reduced-motion: reduce`; once consumers migrate in Step 03, the whole surface respects the user preference with one variable.

## Lifecycle safety
- No schema change.
- No adapter / orchestrator / write-seam change.
- No existing Publisher module migrated yet; every existing CSS module and component continues to render exactly as before. Step 02 is purely additive.
- `sharedChrome/` is Publisher-scoped; nothing is exported to `@hbc/ui-kit` or consumed by any other app.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run sharedChrome` — 17/17 pass across 2 new files.
- Full targeted sweep `pnpm vitest run sharedChrome draftQueue ArticlePublisher teamComposer mediaComposer previewSurface readinessSurface` — 248/248 pass across 22 files (17 new + 231 existing).

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/tokens.module.css` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/tokens.module.css.d.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/PublisherButton.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/publisherButton.module.css` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/publisherButton.module.css.d.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/publisherButton.test.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/EditorialChip.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/editorialChip.module.css` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/editorialChip.module.css.d.ts` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/editorialChip.test.tsx` (new)
- `apps/hb-webparts/src/webparts/articlePublisher/sharedChrome/index.ts` (new)
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-h-visual-system-doctrine-conformance/step-02/CLOSURE.md` (this file)

## Remaining / follow-on (per Step 01 design)
- **Step 03 — Editorial migration.** Replace the duplicated button / chip styles across the Publisher modules with `PublisherButton` + `EditorialChip`. Remove the inline Segoe UI declarations; adopt `var(--hb-*)` throughout.
- **Step 04 — Elevation + surface hierarchy.** Apply the two-tier elevation story to the workspace shell + rails + canvas sections + composer bodies.
- **Step 05 — Full scrub + hosted SPFx vetting + high-contrast + reduced-motion + zoom verification.**

No blockers.
