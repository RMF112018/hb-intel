# Prompt-04 Closure: Close/Remove Live `milestoneSpotlight` Branch

## Chosen design
Option B was implemented: `milestoneSpotlight` is preserved for tenant-schema and legacy-row read compatibility, but removed from live operational authoring choices.

## Before / After flow
Before:
1. Compatibility enum (`ARTICLE_CONTENT_TYPE_VALUES`) was used directly by live authoring controls.
2. The UI could still present `milestoneSpotlight` as a normal selectable content type.
3. Validation/writer layers already omitted milestone execution, creating an implied but non-functional branch.

After:
1. Compatibility enum remains unchanged for mapper/read safety.
2. A distinct operational enum (`ARTICLE_CONTENT_TYPE_OPERATIONAL_VALUES`) is used by live authoring controls.
3. `milestoneSpotlight` is excluded from operational choices.
4. When a legacy milestone row is loaded, the UI shows a legacy-only notice and keeps a constrained remediation path.
5. Validation/writer commentary now explicitly states milestone is legacy read-compatible only until an executor exists.

## Changed surfaces
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
  - Added operational content-type tuple excluding `milestoneSpotlight`.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - Metadata content-type select now uses operational tuple.
  - Added explicit legacy notice when loaded row is `milestoneSpotlight`.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
  - Updated milestone-write omission commentary to explicit legacy-only posture.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
  - Updated milestone required-set commentary to explicit legacy-only posture.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.test.ts` (new)
  - Added compatibility-vs-operational tuple contract tests.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherArticleRow.test.ts`
  - Added legacy-read test for rows with `ArticleContentType='milestoneSpotlight'`.

## Test evidence mapped to required proofs
1. Compatibility tuple still includes milestone:
   - `publisherEnums.test.ts` (`ARTICLE_CONTENT_TYPE_VALUES` contains `milestoneSpotlight`).
2. Operational UI contract excludes milestone:
   - `publisherEnums.test.ts` (`ARTICLE_CONTENT_TYPE_OPERATIONAL_VALUES` excludes `milestoneSpotlight`).
3. Legacy rows remain readable:
   - `publisherArticleRow.test.ts` milestone row round-trip read assertion.
4. Live flow cannot newly target milestone through authoring controls:
   - `ArticlePublisher.tsx` metadata select bound to `ARTICLE_CONTENT_TYPE_OPERATIONAL_VALUES`.
5. No implied live milestone executor branch:
   - `publisherWriters.ts` and `validationEngine.ts` now explicitly document legacy-only milestone posture.

