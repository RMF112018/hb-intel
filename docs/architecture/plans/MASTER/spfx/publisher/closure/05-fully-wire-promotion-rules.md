# Prompt-05 Closure: Fully Wire Promotion Rules

## Chosen design
Promotion rules are now resolved as an explicit policy (`selectPromotionPolicy`) with deterministic scope precedence:
`destination > homepage > global`.

The authoring surface applies this policy to `IsFeatured`/`IsPinned` for:
1. new draft creation,
2. destination/content-type context changes,
3. save-time lock enforcement when `ManualOverrideAllowed=false`.

No new promotion toggles were introduced; lock behavior is enforced through policy application plus an operator-visible lock notice.

## Before / After
Before:
- New draft seeding was hard-coded (`projectSpotlight + monthlySpotlight`) instead of draft-derived context.
- Selector behavior implied broader policy but only resolved destination-scope and defaults API.
- Manual override semantics were narrative-heavy and not operationally closed.

After:
- Draft seeding and re-seeding use the draft's real `(Destination, ArticleContentType)`.
- Policy includes lock metadata and matched scope/source (`matchedScope`, `sourceRuleId`, `isLocked`).
- Homepage/global scopes are explicit deterministic fallbacks.
- Save path enforces locked defaults even without UI toggles.
- UI shows explicit lock notice when a rule enforces featured/pinned values.

## Changed surfaces
- `apps/hb-webparts/src/homepage/data/publisherAdapter/promotionRuleSelector.ts`
  - added `selectPromotionPolicy` and typed policy result.
  - made scope fallback deterministic and explicit.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - removed hard-coded promotion seed context.
  - added policy application helper and lock-aware save enforcement.
  - added rule-lock status notice in metadata panel.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/promotionRules.test.ts`
  - extended for scope fallback + lock policy assertions.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx` (new)
  - added pure wiring tests for seed/re-resolve/lock behavior.

## Test evidence mapped to required proofs
1. Rule selection by destination/content type:
   - `promotionRules.test.ts` (exact match, wildcard fallback, destination match filtering).
2. Manual override behavior is operationally enforced or explicitly omitted:
   - `promotionRules.test.ts` (`isLocked` when `ManualOverrideAllowed=false`).
   - `ArticlePublisher.test.tsx` save-path `enforceLockOnly` behavior.
3. Draft creation not hard-coded:
   - `ArticlePublisher.test.tsx` seeding from actual draft context.
4. Destination/content-type change re-evaluates policy:
   - `ArticlePublisher.test.tsx` re-resolution case.
5. Scope handling explicit:
   - `promotionRules.test.ts` homepage/global fallback assertions.
