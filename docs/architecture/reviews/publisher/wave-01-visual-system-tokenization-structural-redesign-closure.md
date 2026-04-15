# Publisher Wave-01 — Visual system, tokenization & surface-language closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-14/Prompt-07-Structural-redesign-visual-system-tokenization-and-surface-language.md`
**Scope:** `sharedChrome/tokens.module.css`, `article-publisher.module.css` (+ `.d.ts`), `sharedChrome/imageAssetField.module.css`, `sharedChrome/exceptionalNotice.module.css`.
**Manifest:** hb-publisher Feature 1.0.0.34.

## What surface families were structurally redesigned

The biggest timid-admin-card offender left in the Publisher was the shared `disclosureSection`. Every panel that uses progressive disclosure consumed it: Hero (advanced hero options), Team (layout options), Story (editorial flourishes), Metadata (editorial metadata), Promotion (policy details), ProjectPicker (system identifiers), ImageAssetField (asset URL footer). In its prior form it was a fully-bordered 1 px rectangle over `surface-1` that read as an enterprise admin card.

It has been structurally redesigned as an **accent-rail editorial tile**:

- `border-left: 2px solid var(--hb-border-strong)` is the only persistent chrome.
- `background: var(--hb-surface-tile)` on the closed state (tinted), flipping to `var(--hb-surface-1)` on `[open]`.
- `border-left-color` intensifies to `var(--hb-color-presentation-blue)` when the disclosure is open, so the author can see at a glance which optional tiles they've expanded.
- `border-radius: 0 var(--hb-radius-md) var(--hb-radius-md) 0` truncates the corners on the rail edge only.
- Interior rhythm tightened (`10px 14px` summary, `14px 14px 14px` body) to match the new tile metric.
- `transition` on border-color + background through the existing `--hb-transition-fast` token (reduced-motion safe at `0ms linear`).

This single seam change upgrades every DisclosureSection consumer at once — Prompt-06's new "Promotion policy details" disclosure and all six prior panels inherit the new authored tile family.

## What token adoption gaps were closed

In `sharedChrome/tokens.module.css`:

- **`--hb-space-xxl: 48px`** — formalises the canvas outer rhythm the Wave-01 shell already needed; the `.canvas` rule stopped falling back to the var() fallback.
- **`--hb-color-focus-ring: #337AAB`** — promotes what was previously a hard-coded var() fallback into a first-class token aligned with `--hb-color-brand-action`. Every `:focus-visible` rule across `article-publisher.module.css`, `imageAssetField.module.css`, and `exceptionalNotice.module.css` now consumes the token directly (literal `#337aab` fallbacks removed).
- **`--hb-font-mono: ui-monospace, SFMono-Regular, Menlo, "Segoe UI Mono", Consolas, monospace`** — formalises the operator/details mono stack that multiple new surfaces (ExceptionalNotice details body, ImageAssetField asset-URL disclosure input, ProjectPicker system-identifiers details) were already pointing at.
- **Surface-family aliases** — `--hb-surface-plane: var(--hb-surface-0)`, `--hb-surface-rail: transparent`, `--hb-surface-tile: var(--hb-surface-2)` — aliasing existing palette entries so authored callsites read as **intent** rather than **numbered palette entry**. The new disclosure tile consumes `--hb-surface-tile`.

## What stale CSS residue was removed

- `.sectionIndex` and `.sectionIndexLink` in `article-publisher.module.css` were retained as `display: none` stubs in Prompt-01 to absorb any lingering imports. No TSX callsite has referenced them since that closure; they've been deleted outright along with their entries in `article-publisher.module.css.d.ts`. The editorial spine (`workspace/EditorialSpine.tsx`) is now the only section-navigation surface.
- Six redundant `var(--hb-color-focus-ring, #337aab)` fallback-pair literals eliminated across the three CSS modules listed above.

## What local exceptions remain and why

- `var(--hb-…, <fallback>)` **value pairs** elsewhere in `article-publisher.module.css` are retained intentionally. They defend against tokens.module.css failing to load in isolation (test harnesses, storybook-style renders) without reintroducing raw hex as the primary source of truth.
- `rgba(16, 24, 40, …)` shadow literals inside `--hb-elevation-1` / `--hb-elevation-2` definitions in `tokens.module.css` are kept as the canonical elevation recipe; they are the **source** of those tokens, not callsite drift.
- `previewSurface/`, `draftQueue/`, `teamComposer/`, `mediaComposer/`, `readinessSurface/`, `storyBodyEditor/` CSS modules were **not touched**. They already consume the token seam correctly and would have been churn-only changes; the prompt explicitly warned against a repo-wide design-system exercise.
- `@hbc/ui-kit` was **not touched**. The `sharedChrome/` seam remains the Publisher's feature-local authoring surface and is the correct home for Wave-01 visual consolidation.

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing; 6 failures all pre-existing in `publisherAdapter/__tests__/publisherEndToEnd.test.ts`, unrelated to this change.
- Light-theme safe: every rule in the touched CSS either consumes a token or retains a hard-coded fallback only as a `var()` fallback. No new SharePoint-host colour dependencies.
- Manifest bumped: `config/package-solution.json` 1.0.0.33 → 1.0.0.34.
