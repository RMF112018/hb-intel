# Closure — TargetSiteUrl back-sync to HB Articles (Phase-05 Prompt-02)

## Gap closed
After Phase-04 Prompt-09, `HB Articles.TargetSiteUrl` is tenant-optional and the orchestrator derives the canonical destination URL for the **binding row** when the author left the article column blank. The master-article back-sync, however, spread `...context.article` without re-stamping `TargetSiteUrl`, so a blank article column stayed blank while the binding carried the authoritative derived URL. The two rows could disagree on the destination URL after a successful publish.

## Fix
`apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- In the post-publish back-sync block, `updatedArticle.TargetSiteUrl` is now stamped to `bindingRow.TargetSiteUrl`. The binding row was computed a few lines earlier as `context.article.TargetSiteUrl ?? resolveDestinationSiteUrl(destination) ?? ''`, so the master row picks up the same authoritative string the binding row holds — no additional derivation, no second chance to disagree.

Applies to all successful publish decisions that reach the back-sync block (`create`, `inPlaceUpdate`, `regenerate`). Preview returns earlier and never writes, so it remains read-only.

## Existing authored-TargetSiteUrl behavior
When the author supplied a value (Phase-04 validation already pins it to the canonical destination path), the binding row keeps the authored string and the master row is re-stamped with the same string. No behavior change for valid authored values — the back-sync reinforces the single-writer contract rather than picking a different URL.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.test.ts` — new targeted proof
- `apps/hb-webparts/config/package-solution.json` — version bump
- `docs/architecture/plans/MASTER/spfx/publisher/closure/02-closure-targetsiteurl-backsync.md` — this doc

## Proof
- **New test** (`publishOrchestrator.test.ts` → "back-syncs the authoritative TargetSiteUrl onto HB Articles after successful publish"): article fixture leaves `TargetSiteUrl` undefined; after `run({ mode: 'create' })` the binding row carries the canonical projectSpotlight URL AND `articlesUpsert` is called with `TargetSiteUrl === bindingRow.TargetSiteUrl`. Pins the single authoritative-URL invariant.
- Preview path is unchanged: the `req.mode === 'preview'` branch short-circuits before any repository write, so preview stays read-only.

## No-regression
- `pnpm exec vitest run publishOrchestrator` — 15 passing + 2 pre-existing baseline failures (unchanged); new test passes.
- `pnpm exec tsc --noEmit` — clean.

## Out of scope (per prompt constraint)
Archive / withdraw drift is covered by Phase-05 Prompt-03 and is deliberately not touched here.
