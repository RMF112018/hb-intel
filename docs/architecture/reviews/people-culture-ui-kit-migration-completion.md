# People & Culture UI-Kit Migration Completion

> Wave 01 follow-on. Named-consumer migration of `PeopleCultureMerged`
> from a local 652-line composition into a shared `@hbc/ui-kit/homepage`
> surface family + composer primitives + avatar stack primitive.
>
> Authority basis: `docs/architecture/plans/MASTER/ui-kit/wave-01/UI-System-Reconciliation-Execution-Note.md`,
> `docs/architecture/reviews/ui-system-refactor-audit-findings-validation.md`,
> `docs/reference/ui-kit/UI-System-Layer-Model.md`,
> `docs/reference/ui-kit/Presentation-Lane-Standard.md`.

## 1. Objective completed

Move the durable presentation grammar of the People & Culture homepage webpart out of the local consumer and into governed shared layers, while keeping data orchestration, SharePoint list wiring, normalization, validation, and submission local. The result improves the named-consumer migration status of `PeopleCultureMerged` from "local — should likely migrate" to **cleanly migrated**, restores layer discipline, and aligns the warm-celebratory section with the governed presentation-lane token system without sacrificing its premium authored character.

The work was scoped to People & Culture only. No other webparts, surfaces, or audit findings were touched.

## 2. Shared UI ownership decisions

The migration ships **one cohesive surface family + a sibling composer group + one new homepage primitive**. This was deliberately chosen over (a) flattening into `HbcEditorialSurface` (which would have collapsed the warm-celebratory grammar into a generic editorial register) and (b) exploding the kit into many micro-components (which would have fractured the cohesive zone identity).

### Foundations (Layer 1)

No new tokens introduced. All warm-celebratory styling routes through existing governed presentation-lane tokens:

- `HBC_PRESENTATION_BLUE` / `HBC_PRESENTATION_ORANGE` for the hero gradient
- `HBC_SURFACE_PRESENTATION.warmTint` / `warmBorder` / `editorialBorder` for spotlight backgrounds and rail dividers (semantic role)
- `elevationEditorial` for card lift in the spotlight composition
- `displayLg` / `heading2` / `body` / `bodySmall` / `label` for typography
- `HBC_SPACE_*` and `HBC_RADIUS_*` for spacing and radii
- `useHomepageReducedMotion` for accessible motion gating

The hero gradient `#E57E46 → #D4693A → #225391` is preserved as a derived gradient inside the surface CSS module. The intermediate `#D4693A` stop is treated as a tween between the two governed brand-token endpoints rather than a new exported token.

### Primitives (Layer 2)

**`HbcAvatarStack`** — new shared homepage primitive.
Overlapping initials-fallback avatar cluster with size variants (`xs|sm|md|lg|xl`), max + overflow modes (`count|inline-text|none`), and an optional ring decoration for the hero treatment. Used by `HbcPeopleCultureSurface` (kudos spotlight, recent recognition list, recognition rail, celebrations chips) and `HbcKudosComposer*` (preview cluster). Co-located CSS module + Storybook story.

### Surface families (Layer 3)

**`HbcPeopleCultureSurface`** — new presentation-lane surface family.
Cohesive section combining a gradient hero band, kudos spotlight + recognition rail layout, and a sparse-state invite. Internally chooses spotlight-mode vs sparse-mode based on the view-model. Accepts a typed `PeopleCultureSurfaceModel` decoupled from any consumer's SharePoint contracts, plus `onGiveKudos`, `viewAllHref`, and `celebrateHref` slot props. Single `index.tsx` + co-located CSS module + Storybook story (Default, Sparse, Mobile). Naming follows the `Hbc<SemanticName>Surface` convention used by Phase 17-03 surface families.

**`HbcKudosComposerFlyout` + `HbcKudosComposerForm` + `HbcKudosComposerPreview`** — sibling presentation primitives.
Pure-presentation kudos submission flow. The flyout owns focus trap, escape-to-close, body scroll lock, and motion choreography (right-side sheet on desktop, full-screen sheet on mobile). The form owns label/input grid, warm focus treatment, and validation-error display. The preview mirrors the spotlight visual register and reacts to draft state. State, validation logic, and submission all live in the consumer's `useKudosComposer` hook.

The shared `KudosComposerDraft` and `KudosComposerValidationErrors` types are also exported from `@hbc/ui-kit/homepage`. The local hook re-exports them as type aliases so existing webpart imports keep working.

### Consumers (Layer 4)

**`PeopleCultureMerged`** — now a thin consumer.
Fetches list data via `usePeopleCultureData`, falls back to manifest config, normalizes via `normalizePeopleCultureMergedConfig`, adapts the SharePoint-shaped output to the surface view-model with a tiny local mapper, and wires `useKudosComposer` actions to the shared flyout/form/preview. The composer footer is the only remaining local inline-styled element, kept local because it is consumer-state-coupled and small.

### What stayed local

- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts` — SharePoint list fetch, cache, abort
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts` — draft state, validation, status machine, submit lifecycle (now re-exports the shared draft/error types)
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts` — SharePoint REST POST, ensureUser, payload shaping
- `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts` — `normalizePeopleCultureMergedConfig` and the SharePoint-shaped contracts
- `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts` — sparse-state authoring messages
- `apps/hb-webparts/src/homepage/helpers/identity.ts` — identity wiring
- `PeopleCultureWebPart.manifest.json` GUID `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` and the `mount.tsx` registration

## 3. Changes implemented

### Files created (10)

| File | Purpose |
|---|---|
| `packages/ui-kit/src/HbcAvatarStack/index.tsx` | Avatar cluster primitive |
| `packages/ui-kit/src/HbcAvatarStack/avatar-stack.module.css` | Primitive styles |
| `packages/ui-kit/src/HbcAvatarStack/avatar-stack.module.css.d.ts` | CSS module ambient types |
| `packages/ui-kit/src/HbcAvatarStack/HbcAvatarStack.stories.tsx` | Storybook proof |
| `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx` | Surface family component, view-model contract, sub-components |
| `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css` | Surface family styles (hero, spotlight, rail, sparse) |
| `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css.d.ts` | CSS module ambient types |
| `packages/ui-kit/src/HbcPeopleCultureSurface/HbcPeopleCultureSurface.stories.tsx` | Default, Sparse, Mobile stories |
| `packages/ui-kit/src/HbcKudosComposer/index.tsx` | Flyout + Form + Preview presentation primitives |
| `packages/ui-kit/src/HbcKudosComposer/kudos-composer.module.css` | Composer styles |
| `packages/ui-kit/src/HbcKudosComposer/kudos-composer.module.css.d.ts` | CSS module ambient types |
| `packages/ui-kit/src/HbcKudosComposer/HbcKudosComposer.stories.tsx` | Editing, errors, preview stories |
| `docs/architecture/reviews/people-culture-ui-kit-migration-completion.md` | This report |

### Files modified (8)

| File | Change |
|---|---|
| `packages/ui-kit/src/homepage.ts` | Re-export `HbcPeopleCultureSurface`, `HbcKudosComposerFlyout/Form/Preview`, `HbcAvatarStack`, view-model types, draft types. Add `'people-culture'` to `HomepageSurfaceClass`. Add new entries to `HomepagePrimitiveName` union and `HBC_HOMEPAGE_SURFACE_FAMILIES` metadata. |
| `packages/ui-kit/src/HbcHomepageSurfaceCard/index.tsx` | Add `'people-culture'` surface-class entry to keep `HbcHomepageSurfaceCard` exhaustive against the widened `HomepageSurfaceClass` union. Warm cream backdrop + warm border accent + `elevationEditorial`. |
| `packages/ui-kit/src/index.ts` | Bump version comment 2.5.5 → 2.5.7 (root barrel does not list surface families directly). |
| `packages/ui-kit/package.json` | Bump `version` 2.5.6 → 2.5.7 (patch). |
| `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx` | Refactor from 652-line local composition to ~280-line thin consumer that adapts the normalized output to the surface view-model and wires the kudos composer state hook to the shared flyout/form/preview. All inline `HB`/`P` palettes, hero/spotlight/rail/sparse helper functions, motion helpers, `GiveKudosButton`, and local `Avatar` component removed. |
| `apps/hb-webparts/src/homepage/data/useKudosComposer.ts` | Re-export `KudosComposerDraft` and `KudosComposerValidationErrors` from `@hbc/ui-kit/homepage` as type aliases. No behavioral change. |
| `apps/hb-webparts/config/package-solution.json` | Bump SPFx 4-part version 1.0.0.105 → 1.0.0.106 in both `solution.version` and `features[0].version`. |
| `docs/architecture/plans/MASTER/ui-kit/wave-01/UI-System-Reconciliation-Execution-Note.md` | Update PeopleCultureMerged row to "Cleanly migrated (W01 follow-on)". Update migration summary from 4/9 (44%) → 5/9 (56%). Update visual-proof status table. |
| `docs/architecture/reviews/ui-system-refactor-audit-findings-validation.md` | Append section 10 closure update describing the People & Culture migration and revising the recommended next move. |

### Files deleted (3)

| File | Reason |
|---|---|
| `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerFlyout.tsx` | Replaced by `HbcKudosComposerFlyout` |
| `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerForm.tsx` | Replaced by `HbcKudosComposerForm` |
| `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerPreview.tsx` | Replaced by `HbcKudosComposerPreview` |

## 4. Named consumer impact

**`PeopleCultureMerged` (named consumer):**
Status changes from `Local — should likely migrate` → **`Cleanly migrated to HbcPeopleCultureSurface + HbcKudosComposer*`**.
The webpart still owns its GUID `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`, its `mount.tsx` registration, its data path, its submission flow, and its sparse-state messaging — but its visual grammar now lives in the shared layer.

**Other named consumers:**
No other webparts were touched. The migration count moves from 4/9 (44%) cleanly migrated to **5/9 (56%)**.

The remaining "still entirely local" set narrows to `{HbSignatureHero, ProjectPortfolioSpotlight}`. `HbSignatureHero` remains the lowest-risk next migration target; `ProjectPortfolioSpotlight` is larger and image-led and will require more design judgment.

## 5. Verification performed

### Commands run

```bash
pnpm --filter @hbc/ui-kit check-types          # ✅ pass
pnpm --filter @hbc/ui-kit lint                 # 1 pre-existing error (HbcInput/__tests__/useVoiceDictation.test.ts — Function-as-type), unchanged from main
pnpm --filter @hbc/ui-kit build                # ✅ pass
pnpm --filter @hbc/ui-kit test                 # 3 pre-existing failed test files (HbcKpiCard, HbcBanner, HbcHeader), unchanged from main; new components have no tests yet — only Storybook stories
pnpm --filter @hbc/spfx-hb-webparts check-types # ✅ pass
pnpm --filter @hbc/spfx-hb-webparts lint        # ✅ pass — homepage import-discipline rules satisfied
pnpm --filter @hbc/spfx-hb-webparts build       # ✅ pass — bundle 569.94 KB / 202.99 KB gzip
pnpm vitest run src/homepage/__tests__/peopleCultureMerged.test.ts        # ✅ 40/40 pass
pnpm vitest run src/homepage/__tests__/communicationsWebparts.test.tsx \
                src/homepage/__tests__/authoringGovernance.test.ts        # ✅ 17/17 pass
```

### Bundle delta

| Metric | Baseline (main) | After migration | Delta |
|---|---:|---:|---:|
| spfx-hb-webparts JS | 575.05 KB | 569.94 KB | **−5.11 KB** |
| spfx-hb-webparts JS (gzip) | 204.10 KB | 202.99 KB | **−1.11 KB** |
| spfx-hb-webparts CSS | — | 45.53 KB | — |
| spfx-hb-webparts CSS (gzip) | — | 8.63 KB | — |

The bundle is **smaller** post-migration. Inline-style duplication eliminated by moving the visual grammar into a shared CSS module more than offset the new ui-kit re-exports the consumer pulls in.

### Pre-existing failures explicitly separated from new failures

Pre-existing failures were confirmed by `git stash` + re-running the same suites against main, then restoring. All failures present after the migration are also present without the migration:

- `@hbc/ui-kit` lint: 1 pre-existing error in `src/HbcInput/hooks/__tests__/useVoiceDictation.test.ts:61:34` (`Function` type usage). Not introduced by this change.
- `@hbc/ui-kit` test: 3 pre-existing failed test files (`HbcKpiCard`, `HbcBanner`, `HbcHeader`) — none reference People & Culture or any new component. Not introduced by this change.
- `@hbc/spfx-hb-webparts` test: 7 pre-existing failed test files (`bundleBudget`, `compositionPreview`, `discoveryWebpart`, `interactiveStates`, `motionAndAccessibility`, `operationalAwarenessWebparts`, `utilityWebparts`). The bundle-budget tests fail because the bundle has long been over the 400 KB JS / 10 KB CSS hard budgets — confirmed pre-existing on main. None reference People & Culture. Not introduced by this change.
- The People & Culture-specific tests (40 in `peopleCultureMerged.test.ts` + 17 in `communicationsWebparts.test.tsx` and `authoringGovernance.test.ts` = **57 tests**) all pass.

### Visual proof

- `HbcAvatarStack.stories.tsx` — Default, Sizes (xs–xl), HeroWithRing, HeroWithSecondary, OverflowCount, OverflowText
- `HbcPeopleCultureSurface.stories.tsx` — Default (full model), Sparse (no featured kudos), Mobile (constrained width)
- `HbcKudosComposer.stories.tsx` — FlyoutEditing (full draft, footer wired), FormWithErrors, PreviewEmpty, PreviewFilled

## 6. Remaining gaps

| Gap | Notes |
|---|---|
| Per-component unit tests for the new ui-kit primitives | Storybook stories cover visual proof; no Vitest unit tests added for `HbcPeopleCultureSurface`, `HbcKudosComposer*`, or `HbcAvatarStack`. Other Phase 17-03 surface families also ship without unit tests, so this matches existing convention. Optional follow-up. |
| Consumer-level visual proof (live SPFx workbench screenshots) | Storybook stories prove the surface family in isolation. Live SPFx workbench before/after screenshots remain a wave-wide gap (also true for the previously-migrated consumers) and require an SPFx runtime environment. |
| Bundle budget test still failing | The 400 KB hard budget was already exceeded before this migration. This migration *reduced* the bundle by 5 KB but did not bring it under budget. Bundle budget remediation is its own scoped task. |
| Pre-existing `useVoiceDictation.test.ts` Function-type lint error | Not in scope. |
| Pre-existing test failures in `HbcKpiCard`, `HbcBanner`, `HbcHeader`, and the 7 spfx-hb-webparts test files | Not in scope. Confirmed unrelated to this migration via stash baseline. |

There are no remaining structural gaps in the People & Culture migration itself.

## 7. Final repo-truth posture for People & Culture

**Cleanly migrated.**

The named consumer `PeopleCultureMerged` now delegates 100% of its durable presentation grammar to `@hbc/ui-kit/homepage` shared layers (`HbcPeopleCultureSurface`, `HbcKudosComposerFlyout`, `HbcKudosComposerForm`, `HbcKudosComposerPreview`, `HbcAvatarStack`). The webpart's responsibilities are now data fetching, normalization, view-model adaptation, kudos composer state, and SharePoint submission — exactly the consumer-layer concerns that should remain local. Homepage import discipline is preserved; the webpart consumes only `@hbc/ui-kit/homepage`. Cross-package type-checks, build, and the People & Culture test suite all pass.
