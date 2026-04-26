# 00 — Master Implementation Prompt

You are working as a local code agent inside the `RMF112018/hb-intel` repository.

## Mission

Implement the Safety Field Excellence dynamic cutover development package.

The current `hb-intel-homepage` Safety Field Excellence app is curated/config-driven. The desired target state is a dynamic, weekly, governed Safety Field Excellence surface powered by the existing Safety backend Function App and the structured data created by the `hb-intel-safety` application.

## Primary Objective

Cut over Safety Field Excellence from static/curated homepage config to a dynamic published weekly highlight model while preserving:

- homepage shell architecture
- existing Safety backend Function App integration
- existing Safety ingestion behavior
- ui-kit doctrine compliance
- homepage flagship quality
- curated fallback until hosted dynamic proof is complete

## Required Architecture

```text
Safety checklist upload / Safety app workflow
  -> existing backend Function App
  -> existing Safety SharePoint lists
  -> new Safety Field Excellence rollup service
  -> generated candidate score records
  -> Safety leadership review / approval / override
  -> published weekly highlight artifact
  -> homepage current-published read endpoint
  -> hb-intel-homepage Safety Field Excellence dynamic adapter
  -> existing HbcSafetyHomepageSurface / governed homepage UI
```

## Absolutely Do Not

- Do not create a second backend.
- Do not bypass the existing Safety backend Function App.
- Do not compute safety excellence directly in the homepage browser client.
- Do not select homepage recognition from a single safety inspection score.
- Do not allow low-activity 100% scores to become highlighted content.
- Do not remove curated fallback before hosted proof.
- Do not ship a generic card-grid or thin-border white-card UI.
- Do not skip the uploaded homepage checklist and scorecard.
- Do not re-read files still within your current context.

## Required Source Modes

Implement these progressively:

```ts
export type SafetyFieldExcellenceSourceMode =
  | "curated-only"
  | "dynamic-preview"
  | "dynamic-with-curated-fallback"
  | "dynamic-only";
```

Default must remain:

```ts
"curated-only"
```

## Required UI Fallback

When no dynamic data is available, render a polished preview of the future Safety Field Excellence state.

The preview fallback must:

- use the same general surface structure as the final dynamic state
- be clearly labeled as preview / coming soon / awaiting published weekly data
- show representative evidence areas
- avoid naming real projects as winners unless backed by published data
- explain what data will appear after Safety records are published
- include an honest CTA to the Safety hub or records
- meet homepage-grade visual quality

Do not render a weak "No data available" empty state.

## Governing UI Inputs

Before any UI closure, inspect:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/doctrine/`
- `docs/reference/spfx-surfaces/benchmark/`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Required Scorecard Target

Final target:

- 48+/56
- no hard-stop failures
- no critical accessibility failures
- no host-fit instability
- no generic enterprise-card result
- credible compact and hosted behavior
- evidence-backed closure comparable in seriousness to hbKudos public runtime, without cloning hbKudos

## Current Repo Areas to Inspect

### Homepage

- `apps/hb-webparts/src/webparts/safetyFieldExcellence/`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts`
- `packages/ui-kit/src/HbcSafetyHomepageSurface/`

### Safety

- `apps/safety/`
- `packages/features/safety/src/domain/types.ts`
- `packages/features/safety/src/lists/descriptors.ts`
- `packages/features/safety/src/lists/fieldSchema.ts`
- `packages/features/safety/src/ports/ISafetyInspectionRepository.ts`
- `packages/features/safety/src/hooks/queries.ts`
- `packages/features/safety/src/scoring/`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`
- `backend/functions/src/services/safety-ingestion-application-service.ts`
- `backend/functions/src/services/safety-ingestion-graph-repository.ts`
- `backend/functions/src/config/safety-record-keeping-list-definitions.ts`

## Required Execution Sequence

1. Schema and architecture foundation.
2. Safety excellence scoring domain package.
3. Backend rollup APIs.
4. Weekly timer and publish workflow.
5. Homepage dynamic adapter and preview fallback.
6. UI/UX flagship remediation.
7. Hosted cutover proof.
8. Final closure and commit.

## Start Here

Before making changes:

1. Report current branch.
2. Report working tree status.
3. Confirm package manager.
4. Inspect repo-truth files listed above.
5. Produce a concise Plan Summary for Wave 01.
6. Do not implement beyond Wave 01 until Wave 01 closure evidence is complete.
