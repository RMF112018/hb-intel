# Prompt-02 Closure: Scope Out Milestone Path Honestly

## Chosen path
Option B (scope out): `milestoneSpotlight` remains **legacy read-compatible only** and is not a live authoring/publish path in this sprint.

## Why this is operationally sound
- The compatibility enum/type surface still includes `milestoneSpotlight`, so existing tenant rows deserialize safely.
- Live authoring is anchored to operational content-type values that exclude milestone.
- Legacy rows that already carry `milestoneSpotlight` are explicitly surfaced as legacy and guided toward operational remediation.
- Validation/writer behavior remains aligned with the scoped posture (no hidden milestone-only validation/write branch pretending end-to-end support).

## Changed surfaces
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - Added explicit helper seam for content-type options and legacy milestone notice.
  - Metadata panel now consumes those helpers to keep the live-authoring contract deterministic.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx`
  - Added milestone posture tests proving ordinary live options exclude milestone and legacy rows surface remediation-only behavior.

## Existing aligned authorities (no behavior reversal required)
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
  - compatibility tuple includes milestone; operational tuple excludes milestone.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`
  - milestone required-field set remains intentionally out of active operational enforcement.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
  - milestone-specific article fields remain intentionally non-emitted in current operational writer path.

## Proof mapping
1. Enum contract proof:
   - `publisherEnums.test.ts` keeps compatibility inclusion + operational exclusion assertions.
2. UI behavior proof:
   - `ArticlePublisher.test.tsx` milestone posture suite verifies ordinary exclusion and legacy remediation path.
3. No false-promise seam:
   - `validationEngine.test.ts` milestone out-of-scope test + writer contract comments/behavior keep milestone unsupported in live operational flow.
