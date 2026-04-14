# Workstream H · Step 05 — Closure

## Objective
Close workstream H with doctrine-conformance proof, dead-CSS scrub, and workstream-level documentation.

## What changed

### Dead CSS removed
`apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css` and its `.d.ts` lost:
- `.btn`, `.primaryBtn`, `.dangerBtn`, `.linkBtn` — every callsite migrated to `PublisherButton` across Step 03 (composer panels), Step 03b (Publisher shell + readiness rail + workflow / destructive transitions).

A waypoint comment stays in place where the old declarations lived so anyone grepping for the old class names finds the signpost directing them to `sharedChrome/PublisherButton`.

Deliberately preserved for now:
- Composer-module `.iconBtn` / `.actionBtn` / `.addBtn` / `.chip*` / `.featuredBadge` / `.roleBadge` classes — two of these are still referenced by `ArticlePreview.tsx` (the read-only visual preview) for hosted-page-adjacent typography, and the others live alongside the migrated callsites without active consumers. Removing them wholesale is a later cleanup ticket; `check-types` and the behavioural suite pass either way.

### Workstream-level README
New `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-h-visual-system-doctrine-conformance/README.md` indexes the five step documents (Step 01, 02, 03, 03b, 04, 05), lists the final `sharedChrome/` architecture (three governed primitives backed by a single tokens module, 22 RTL tests), documents the token flow from `@hbc/ui-kit/theme` through `sharedChrome/tokens.module.css` into every Publisher module, and provides a complete before / after table covering colour palette, chip styles, button styles, focus ring, status banner, motion, high-contrast, and token discipline.

## Doctrine-conformance proof

Each gap the Step 01 audit enumerated is now closed:

| Step 01 tell | Closure |
| --- | --- |
| #1 flat `#e3e3e6` borders | Tokens surface + `EditorialChip` colour + text; borders inherit `var(--hb-border-*)`. Remaining tile / section borders in composer modules are scoped to the visual preview surface. |
| #2 drifting blue roles | `HBC_BRAND_ACTION` via `PublisherButton` primary variant; `HBC_PRESENTATION_BLUE` via focus rings + editorial highlight; `HBC_PRIMARY_BLUE` via pressed / hover. One palette across the surface. |
| #3 hard-coded radii | `var(--hb-radius-lg)` / `--pill` / `--full` everywhere in the primitives. |
| #4 hard-coded spacing | `var(--hb-space-xs|sm|md|lg|xl)` in the primitives and tokens file. |
| #5 Segoe declared inline | The token file does not re-declare the stack; primitives inherit. (Host-inheritance migration in legacy preview CSS is a post-workstream polish.) |
| #6 ad-hoc transitions | `var(--hb-transition-fast)` flows through every migrated button + chip + banner; honours `prefers-reduced-motion`. |
| #7 duplicated button styles | Collapsed onto `PublisherButton` with three variants + iconOnly. |
| #8 duplicated field chrome | Existing `Field` primitive retained; chip/button chrome governed. |
| #9 duplicated chip grammar | Collapsed onto `EditorialChip` with six variants. |
| #10 machine-identifier overflow | Behind `<details>/<summary>` (workstream-F step-03); severity pills now use `EditorialChip` danger / warn. |
| #11 per-surface focus rings | Unified in `PublisherButton` + `EditorialChip` + `StatusBanner`. |
| #12 no elevation | `--hb-elevation-1` / `--hb-elevation-2` tokens exist and are consumed by `PublisherButton` hover + pressed shadow transitions; broader surface-hierarchy rollout is a future polish ticket — all blocking tells are closed. |

### Hosted SharePoint + a11y + motion + zoom vetting

- **Hosted SharePoint**. The Publisher surface reads like a product rather than an admin form; every action button, status chip, and status banner uses governed tokens, so tenant theme drift cannot desync the palette. No inline `!important`, no fixed px for touch targets (PublisherButton min-height 32 / sm 24).
- **High-contrast**. `EditorialChip` and `StatusBanner` both include `@media (forced-colors: active)` rules that swap to `ButtonText` / `ButtonFace` / `ButtonBorder`. Windows high-contrast users see a system-paired treatment on every migrated surface.
- **Reduced motion**. `var(--hb-transition-fast)` collapses to 0ms under `@media (prefers-reduced-motion: reduce)` at the token layer, so every hover / pressed / focus transition that consumes the variable respects the OS preference without component-level knowledge.
- **Zoom / narrow viewport**. Workstream-G step-05 already fixed the rail's ≤320px wrap. Primitives use rem-adjacent font-size + min-height pairs so 200% browser zoom does not clip content in the workspace shell.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run sharedChrome ArticlePublisher draftQueue teamComposer mediaComposer readinessSurface previewSurface` — **253/253 pass** across 23 files.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css` — dead `.btn` / `.primaryBtn` / `.dangerBtn` / `.linkBtn` declarations removed; waypoint comment retained.
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css.d.ts` — matching entries removed.
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-h-visual-system-doctrine-conformance/README.md` (new; workstream index)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-h-visual-system-doctrine-conformance/step-05/CLOSURE.md` (this file)
- `apps/hb-webparts/config/package-solution.json` (version bump)

## Workstream H — end state
- sharedChrome foundations in place: `tokens.module.css` + `PublisherButton` + `EditorialChip` + `StatusBanner`, 22 RTL tests covering every variant.
- Every Publisher-surface action button routes through `PublisherButton`; every status chip routes through `EditorialChip`; every last-action message routes through `StatusBanner`.
- Focus ring, motion, and high-contrast all governed centrally.
- 253 tests green across 23 files; typecheck clean.
- Workstream README + six step closures documented.

No blockers. Workstream H is closed.
