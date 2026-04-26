# 01 — Current Repo Truth and Target State

## Repo-Truth Files to Inspect First

Do not rely on memory or older plans. Inspect current `main` before implementation.

### Homepage Safety Field Excellence

- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceConsumerModel.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx`
- `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `packages/ui-kit/src/HbcSafetyHomepageSurface/index.tsx`

### Safety Data and Backend

- `apps/safety/**`
- `packages/features/safety/src/domain/types.ts`
- `packages/features/safety/src/lists/descriptors.ts`
- `packages/features/safety/src/lists/fieldSchema.ts`
- `packages/features/safety/src/ports/ISafetyInspectionRepository.ts`
- `packages/features/safety/src/hooks/queries.ts`
- `packages/features/safety/src/scoring/projectWeekRollup.ts`
- `packages/features/safety/src/scoring/scoringEngine.ts`
- `packages/features/safety/src/scoring/findingExtraction.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/services/safety-ingestion-application-service.ts`
- `backend/functions/src/services/safety-ingestion-graph-repository.ts`
- `backend/functions/src/config/safety-record-keeping-list-definitions.ts`

### UI Doctrine and Acceptance

- `docs/reference/ui-kit/doctrine/**`
- `docs/reference/spfx-surfaces/benchmark/**`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Current Homepage Surface Role

The current Safety Field Excellence implementation should be treated as a presentation and normalization surface, not as a dynamic data product. Preserve its good seams:

- component owns rendering state
- shell zone owns placement
- `HbcSafetyHomepageSurface` owns visual language
- normalizer owns config shaping/stale labels
- consumer model maps normalized config to UI props
- shell render mode controls standard/compact/minimal behavior

Do not collapse backend/data logic into these render components.

## Target Runtime Data Rule

The homepage should consume exactly one published, bounded, frontend-safe artifact:

```text
Published Safety Field Excellence Weekly Highlight
```

It should not directly compute from:

- Safety Inspection Events
- Safety Findings
- Safety Project Week Records
- Safety Ingestion Runs
- uploaded workbook JSON

Those sources belong to the backend rollup and approval pipeline.

## Target Homepage Data Contract

The published artifact should map into the existing `SafetyFieldExcellenceConfig` shape to preserve current UI compatibility.

```ts
interface SafetyFieldExcellencePublishedHomepagePayload {
  reportingPeriodId: string;
  reportingPeriodSpItemId: number;
  weekStartDate: string;
  weekEndDate: string;
  periodLabel: string;
  publishStatus: "published";
  publishedAt: string;
  freshUntil: string;
  dataConfidence: "high" | "medium" | "low";
  sourceHighlightItemId: number;
  sourceCandidateIds: string[];
  homepagePayload: SafetyFieldExcellenceConfig;
}
```

## Source Mode Contract

Add a source-mode contract without changing default behavior:

```ts
export type SafetyFieldExcellenceSourceMode =
  | "curated-only"
  | "dynamic-preview"
  | "dynamic-with-curated-fallback"
  | "dynamic-only";
```

## Cutover Non-Goal

Do not build a full safety dashboard inside the homepage. The homepage surface is a summary/recognition layer with CTA into the Safety app or record detail.
