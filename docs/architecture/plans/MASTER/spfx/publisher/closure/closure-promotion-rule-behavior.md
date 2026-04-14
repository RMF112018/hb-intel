# Prompt-03 Closure: Rework Promotion Rule Defaults and Gating

## Final enforcement model
Promotion rules are now represented honestly for the current sprint surface:
- policy is resolved from the article draft's actual `(Destination, ArticleContentType)` context,
- `IsFeatured` / `IsPinned` are re-applied when discriminator context changes,
- `ManualOverrideAllowed=false` is enforced through save-time normalization,
- direct feature/pin toggle controls remain out of scope and are explicitly called out as not present.

## Before / After
Before:
1. Promotion behavior was partially wired but comments implied a future toggle-gating model without clearly separating what is and is not active today.
2. Lock semantics were easy to misread as toggle-level behavior in the current editor.

After:
1. Selector/editor comments and lock messaging explicitly describe the active model: policy re-application plus save-time normalization.
2. UI status text states there are no direct `IsFeatured` / `IsPinned` toggles in this sprint, removing false override-control promises.
3. Tests prove deterministic policy seeding/re-seeding and verify lock messaging reflects the true UX contract.

## Changed files
- `apps/hb-webparts/src/homepage/data/publisherAdapter/promotionRuleSelector.ts`
  - Updated contract comments to distinguish deferred toggle-level gating from implemented save-time normalization.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - Added `promotionLockStatusText` helper and used it in metadata lock status rendering.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx`
  - Added lock-status messaging assertion to prevent regressions toward false UX claims.

## Proof mapping
1. Defaults derive from actual discriminator values and re-resolve on change:
   - `ArticlePublisher.test.tsx` `applyPromotionPolicyToDraft` suite.
2. `ManualOverrideAllowed=false` lock normalization is active:
   - `ArticlePublisher.test.tsx` `enforces lock semantics on save-path application`.
3. No false claim of toggle-level override controls:
   - `ArticlePublisher.test.tsx` `promotionLockStatusText` test + updated selector/editor comments.
