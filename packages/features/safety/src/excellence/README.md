# `@hbc/features-safety` — excellence

Pure-domain scoring, eligibility, ranking, and publish-payload DTOs for the
dynamic Safety Field Excellence cutover.

## Purpose

Generate deterministic candidate scores from existing Safety domain data
and produce homepage-safe publish-payload DTOs for the weekly highlight
artifact. This package is consumed by:

- **Prompt 03** — backend Function App rollup APIs (data assembly, write).
- **Prompt 04** — weekly timer and approval/publish workflow.
- **Prompt 05** — homepage SPFx adapter (maps these DTOs onto the
  consumer-side `SafetyFieldExcellenceConfig` shape; **this package does
  not own that mapping**).

## Inputs and outputs

- **Input:** `SafetyExcellenceCandidateInput` — reuses canonical
  `SafetyReportingPeriod`, `SafetyProjectWeekRecord`,
  `SafetyInspectionEvent`, and `SafetyFinding` from
  `packages/features/safety/src/domain/types.ts`. Optional caller-supplied
  `SafetyActivityEvidence`. Optional `generatedAt` / `generatorVersion`
  for deterministic tests.
- **Output (per project-week):** `SafetyExcellenceCandidateScore` —
  serializable, ready to persist into `Safety Field Excellence Candidate
  Scores`.
- **Output (per highlight):** `SafetyFieldExcellenceHomepagePayload` or
  `SafetyFieldExcellencePreviewPayload` — JSON-safe shapes ready to
  persist into `Safety Field Excellence Weekly Highlights
  .HomepagePayloadJson`. Prompt 05 owns the SPFx adapter.

## Scoring dimensions and composite weights

```text
composite =
  safetyPerformance * 0.30 +
  consistencyTrend  * 0.20 +
  activityExposure  * 0.20 +
  correctiveAction  * 0.20 +
  dataQuality       * 0.10
```

All sub-scores are 0..100. Rounding only happens at the public-result
boundary in `generate.ts`.

## Score-scale convention

Existing `SafetyInspectionEvent.inspectionScore` is fractional (0..1) —
produced by `scoring/scoringEngine.ts`. The excellence domain operates on
0..100 internally; `inspectionFiltering.ts` exposes a `toPercent` adapter
applied at the boundary.

## Inspection handling

- `accepted` — counted toward the safety-performance numerator.
- `duplicate-suspected` — never counted; reduces `dataQualityScore` and
  emits a notes entry.
- `review-required` — never counted; reduces `dataQualityScore`, emits
  notes, and forces `eligibilityStatus = 'needs-review'`.
- `superseded` — never counted; ignored by score and eligibility paths.
- `rejected` — never counted; ignored.

## Mandatory low-activity perfect-score suppression

`eligibility.ts` enforces two guards. Either guard pushes
`perfect-score-insufficient-activity-evidence` onto `exclusionReasons` and
demotes the candidate to `ineligible` / `do-not-publish`:

```ts
// Primary rule
if (
  averageInspectionScoreWindow === 100 &&
  inspectionCountWindow <= 1 &&
  evidence.status !== 'proven'
) { /* suppress */ }

// Secondary guard
if (
  averageInspectionScoreWindow === 100 &&
  totalNoAcrossAccepted === 0 &&
  highSeverityFindingCount === 0 &&
  evidence.status === 'missing'
) { /* suppress */ }
```

## Activity / exposure handling

Allowed sources: `manual`, `daily-log`, `project-stage`,
`inspection-density`, `none`.

- `proven` — only when the caller supplies it via
  `manual` or `daily-log` (see "Known limitations" below).
- `inferred` — auto-derived from `projectStageSnapshot` matching an
  active-construction pattern, or from rolling inspection density (≥3
  inspections in the rolling history).
- `missing` — fallback default.

`inferred` evidence may support `secondary` or `monitor` recommendations
but never `primary`. `missing` evidence blocks `primary` and triggers the
suppression rule above when paired with a 100% score.

## Multi-signal narrative gate

A `primary` or `secondary` candidate must clear at least two independent
signals (safety performance, consistency trend, proven activity, finding
response, data quality). Single-signal narratives are flagged with
`single-signal-narrative` and demoted to `low-confidence` / `monitor`.

## Canonical Wave 01 vocabularies

The package consumes the locked vocabularies from the Wave 01 schema and
the cutover architecture doc. Do not introduce synonyms.

| Field | Allowed values |
|---|---|
| `EligibilityStatus` | `eligible`, `ineligible`, `low-confidence`, `needs-review` |
| `ActivityEvidenceStatus` | `proven`, `inferred`, `missing` |
| `PublishRecommendation` | `primary`, `secondary`, `monitor`, `do-not-publish` |
| `PublishStatus` (referenced only) | `draft`, `pending-review`, `approved`, `published`, `archived`, `suppressed` |

Reason codes are exported as `EXCELLENCE_REASON_CODES`.

## Known limitations

- **No tenant manpower / daily-log source today.** `proven` evidence
  requires caller-supplied `manual` or `daily-log` data. Backend Prompt
  03 may enrich activity evidence later; the domain accepts injected
  evidence without re-derivation.
- **Aged-open-finding count is fixed at 0.** Wave 01 schema does not
  add per-finding due/resolved-date fields. `correctiveActions.ts`
  documents this and reports `confidence: 'low'` until a future schema
  iteration adds aging signals. Closure performance is **not**
  fabricated.
- **Repeat-finding heuristic.** `(projectNumber, sectionNumber,
  checklistRowNumber)` recurring across the rolling history. Depth and
  fidelity depend on the rolling history Prompt 03 supplies.
- **Backend Prompt 03 owns data retrieval.** This package never touches
  Graph, SharePoint, the Function App, React, SPFx, or
  `apps/hb-webparts`. Prompt 05 owns the SPFx adapter that maps the
  homepage publish-payload DTO onto the consumer-side homepage config
  contract.
