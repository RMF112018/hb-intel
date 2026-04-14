# Prompt-01 Closure: Resolve Stale Template Lifecycle

## Chosen implementation
Ordinary authoring and publish-context flows now treat `TemplateKey` as system-managed. Resolution always runs from current article discriminators (`Destination`, `ArticleContentType`, spotlight/stage/subject), and stale persisted keys no longer act as implicit override.

Explicit override semantics still exist in the base resolver API, but ordinary publisher lifecycle paths intentionally call the system-managed resolver path that omits `TemplateKey`.

## Before / After
Before:
1. Ordinary save behavior allowed sticky non-empty `TemplateKey` values to survive discriminator changes.
2. Context-building could accept stale persisted keys and bypass applicability in preview/publish decisions.
3. Authoring UI implied editable override behavior in ordinary flow.

After:
1. Save always re-resolves template from current discriminators and stamps the resolved key.
2. Publish resolution context uses the same system-managed resolver path and ignores persisted key as override.
3. If no active template applies, context resolution blocks with `templateResolutionFailed`.
4. Metadata UI shows a read-only resolved template posture and no ordinary override promise.

## Changed files
- `apps/hb-webparts/src/homepage/data/publisherAdapter/templateResolver.ts`
  - Added `resolveTemplateSystemManaged` helper that forces applicability-first resolution.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishResolutionContext.ts`
  - Switched context resolution to `resolveTemplateSystemManaged`.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - Save path now always re-resolves template from discriminators.
  - Added `resolveTemplateKeySystemManaged` helper.
  - Updated metadata posture to read-only resolved template display.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/templateResolver.test.ts`
  - Added stale-key bypass prevention test for system-managed resolution.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishResolutionContext.test.ts`
  - Added parity/blocking tests for stale-key ignore and no-match failure.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx`
  - Added save-lifecycle seam test for system-managed template key re-resolution.

## Proof mapping
1. Ordinary resolution ignores stale key and applies current discriminators:
   - `templateResolver.test.ts` system-managed stale-key test.
2. Save lifecycle re-resolves and updates template key:
   - `ArticlePublisher.test.tsx` `resolveTemplateKeySystemManaged` test.
3. Preview/publish parity uses same resolution strategy:
   - `publishResolutionContext.test.ts` stale-key ignore test.
4. No-match template blocks lifecycle path:
   - `publishResolutionContext.test.ts` `templateResolutionFailed` test.
5. No ordinary stale-key bypass path remains:
   - Combined resolver + context tests assert non-`adminOverride` selection under stale-key input.
