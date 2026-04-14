# Workstream H · Step 03b — Closure

## Objective
Extend the Step-03 chip/button migration into the Publisher shell — the draft-rail header, rail error-retry affordance, the readiness rail's primary / workflow / destructive action groups. The most visible remaining admin-chrome in the Publisher was the rail's `.primaryBtn` / `.btn` / `.dangerBtn` / `.linkBtn` classes; they now route through `PublisherButton`.

## What changed

### `ArticlePublisher.tsx`
- **Left-rail header** — the `Start new draft` button → `<PublisherButton variant="primary" size="sm">`. Copy tightened to `+ New draft` to match the `+ Add teammate` / `+ Add image` grammar the composer panels already use.
- **Rail error-retry** — the `Try again` link-button → `<PublisherButton size="sm">`.
- **Readiness rail — primary actions** — `Publish`, `Republish`, `Save draft`, `Recompose preview` all migrate. `Publish` is `variant="primary"`; the rest are default `secondary`. The `publishDisabledReason` tooltip hookup is preserved; `aria-pressed` / disabled semantics flow through the primitive.
- **Readiness rail — workflow transitions** — Every non-destructive state transition (`Send for review`, `Approve`, `Mark as published`, `Return to draft`, etc.) → `<PublisherButton>`.
- **Readiness rail — destructive actions** — `Archive` and `Withdraw` transitions → `<PublisherButton variant="danger">`.

### What did NOT change
- CSS module definitions for `.primaryBtn` / `.btn` / `.dangerBtn` / `.linkBtn` remain in `article-publisher.module.css`; they're no longer applied by `ArticlePublisher.tsx` but may still be referenced by other in-Publisher callsites. Step 04 (elevation + surface hierarchy) removes dead class declarations wholesale.
- No orchestrator / adapter / write-seam change. `handleCreateNew` / `handleSave` / `handlePublishAction` / `handleTransition` / `reloadGroups` / `unsupportedDestinationLoaded` / `publishDisabledReason` all wired through the new buttons exactly as before.

## Doctrine alignment
- **One button language — end-to-end.** Every Publisher-surface action button (rail CTA, rail error retry, readiness primary actions, workflow transitions, destructive transitions, chip stack actions, gallery tile actions, featured-toggle stars) now routes through `PublisherButton`.
- **Focus ring unified.** The rail buttons inherit the governed `HBC_PRESENTATION_BLUE` `:focus-visible` outline; bespoke per-surface focus CSS is no longer consulted here.
- **Motion.** Hover / pressed transitions now flow through `var(--hb-transition-fast)`, which collapses to 0ms under `prefers-reduced-motion: reduce`.
- **Disabled tooltip fix.** The Step-04 workstream-F `publishDisabledReason` copy now flows through the `title` prop on the primitive, so authors get the same consolidated explanation regardless of which disabled branch fires.

## Lifecycle safety
- No schema change.
- No adapter, orchestrator, write-seam change.
- `aria-disabled` / `aria-pressed` / `aria-label` / `title` / focus order all preserved by the primitive's pass-through.

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run sharedChrome ArticlePublisher draftQueue teamComposer mediaComposer readinessSurface previewSurface` — **248/248 pass** across 22 files.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` — `PublisherButton` import; rail + readiness primary / workflow / destructive action migrations.
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-h-visual-system-doctrine-conformance/step-03b/CLOSURE.md` (this file)

## Remaining / follow-on
- **Step 04 — Elevation + surface hierarchy.** Apply the two-tier elevation story; drop dead button / chip / badge class declarations from every Publisher module CSS file now that no callsite applies them.
- **Step 05 — Full scrub + workstream README + hosted SPFx / high-contrast / reduced-motion / zoom vetting.**

No blockers.
