# Closure — Promotion-rule override behavior contract (Phase-05 Prompt-05)

## Contract mismatch closed
`promotionRuleSelector.ts` and the article-publisher mount comment both described "manual-override gating" — i.e. the authoring UI locking `IsFeatured` / `IsPinned` toggles when a matching rule sets `ManualOverrideAllowed=false`. The publisher UI exposes no such toggles today:
- `ArticlePublisher.tsx` seeds `IsFeatured` / `IsPinned` on new drafts from `selectPromotionDefaults` (real behavior),
- but there is no checkbox / switch in the editor for either field, and no call to `disabled={!manualOverrideAllowed}`.

So the "editor locks the toggle" promise was a narrative-only guarantee that the code could not enforce. Closes Phase-05 Prompt-05 by narrowing the narrative to match the actual behavior.

## Chosen direction
**Narrow the narrative.** Exposing + enforcing the toggles is a larger UX change (out of bounded prompt scope) and the tenant-curated rules are already being applied via default seeding. The selector keeps `manualOverrideAllowed` on `PromotionDefaults` so a future editor can bind toggle state to it without an API change.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/promotionRuleSelector.ts` — module header rewritten to separate "Implemented behavior" (default seeding) from "NOT enforced in the editor" (manual-override gating). `selectPromotionDefaults` JSDoc similarly narrowed.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` — the promotion-rules `useEffect` comment no longer claims the editor gates override; points at the selector's scope boundary and explains how to re-enable gating when toggles land.
- `apps/hb-webparts/config/package-solution.json` — version bump.
- `docs/architecture/plans/MASTER/spfx/publisher/closure/05-closure-promotion-rule-behavior.md` — this doc.

No runtime behavior change. No list contract change. No selector API change.

## Consistency proof
- Selector comment: seeding is implemented; manual-override gating is explicitly marked as NOT enforced.
- Editor comment: seeding is implemented; no toggles exist; manual-override gating is not enforced.
- Docs: this closure doc is the authoritative summary; no other doc claims gating is enforced.

## Re-enable path (recorded so the trail is obvious)
When `IsFeatured` / `IsPinned` toggles land in the editor:
1. Track `promotionDefaults` (already in state).
2. Pass `defaults.manualOverrideAllowed` into the toggles' `disabled` prop.
3. Move the "not enforced" bullet back into "Implemented behavior" in `promotionRuleSelector.ts`.
4. Mirror in the `ArticlePublisher.tsx` comment.
5. Add a targeted UI test.

## Verification
- `pnpm exec tsc --noEmit` — clean.
- `pnpm exec vitest run promotionRule` — 7/7 pass (selector tests unchanged).
