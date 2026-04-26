# 00 — Plan Summary

## Objective

Cut over Safety Field Excellence from a curated/config-authored homepage module to a dynamic, weekly, backend-generated safety recognition surface. The new surface must consume published highlights generated from `hb-intel-safety` data through the existing backend Function App, while maintaining homepage shell discipline, ui-kit doctrine, and flagship UI/UX quality.

## Current Baseline

The current Safety Field Excellence surface:

- lives under `apps/hb-webparts/src/webparts/safetyFieldExcellence/`
- is embedded by `apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx`
- consumes `moduleConfig.safetyFieldExcellence`
- maps normalized config to `HbcSafetyHomepageSurface`
- supports authored top-line summary, primary spotlight, secondary signals, freshness, urgency, indicator, CTA, and shell render modes
- does not read the Safety backend or SharePoint Safety lists directly

The current Safety app/backend already creates structured Safety data through:

- Safety Reporting Periods
- Safety Project Week Records
- Safety Inspection Events
- Safety Findings
- Safety Ingestion Runs
- Safety Checklist Uploads
- Projects
- Legacy Project Fallback Registry

The current project-week rollup is not sufficient for a fair dynamic homepage recognition model by itself. It primarily proves inspection count, average inspection score, and highest risk finding level. It does not yet fully prove activity/exposure, corrective-action timeliness, repeat finding reduction, or weekly approval metadata.

## Target State

```text
Safety workbook ingestion
  → existing Safety backend Function App
  → existing Safety structured lists
  → new backend weekly Safety Field Excellence rollup
  → candidate score records
  → Safety leadership review / approval / override
  → published weekly highlight artifact
  → homepage dynamic adapter
  → existing HbcSafetyHomepageSurface
```

## Recommended Cutover Strategy

Use a progressive source-mode cutover:

```ts
type SafetyFieldExcellenceSourceMode =
  | "curated-only"
  | "dynamic-preview"
  | "dynamic-with-curated-fallback"
  | "dynamic-only";
```

Default remains `curated-only` until dynamic backend, approval workflow, homepage adapter, hosted proof, and scorecard evidence pass.

## UI/UX North Star

The surface must become a serious safety-recognition product surface, not a thin status card. It should communicate:

- a clear weekly safety story
- primary project recognition
- supporting evidence
- data confidence
- freshness
- secondary excellence signals
- a credible CTA to Safety records
- a polished future-state preview when dynamic data is unavailable

The no-data fallback should not be a blank empty state. It should be a preview/skeleton of the final experience with clearly labeled sample/prospective content, so stakeholders can understand what will appear once weekly Safety data is available.

## Development Path

1. Lock repo-truth architecture and list contract.
2. Add governed candidate/highlight schema.
3. Build pure scoring/excellence package.
4. Extend existing backend Function App with rollup, candidate, approval, publish, and homepage read APIs.
5. Add weekly timer trigger and manual dry-run endpoint.
6. Add homepage dynamic data adapter and source modes.
7. Add preview fallback state.
8. Validate against checklist and scorecard.
9. Run hosted package/runtime proof.
10. Cut over from curated-only to dynamic-with-curated-fallback, then dynamic-only.
