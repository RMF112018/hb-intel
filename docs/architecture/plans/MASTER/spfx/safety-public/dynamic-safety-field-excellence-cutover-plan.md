# Dynamic Safety Field Excellence — Cutover Plan

## Context

The current Safety Field Excellence homepage surface is curated and config-authored. Phase 02 cuts it over to a dynamic, weekly, backend-generated recognition surface fed by the existing Safety Function App and HBCentral Safety lists. This document captures the architecture, doctrine locks, and risk controls that govern the cutover.

This document is the cutover anchor referenced by `docs/architecture/plans/MASTER/spfx/safety-public/cut-over-plan/` and the phase-02 prompts. Scoped task plans under `phase-02/` execute waves; this file holds durable architecture commitments.

## Current Curated Architecture

- Web part: `apps/hb-webparts/src/webparts/safetyFieldExcellence/`
- Homepage zone: `apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx`
- Homepage shell: `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- Surface contracts: `apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts` (`SafetyFieldExcellenceConfig`, `LegacySafetyFieldExcellenceConfig`)
- Visual surface: `packages/ui-kit/src/HbcSafetyHomepageSurface/`
- Source: `moduleConfig.safetyFieldExcellence` — authored top-line, primary spotlight, secondary signals, freshness, urgency, indicator, CTA

The curated surface does not query Safety SharePoint lists or the backend Function App.

## Target Dynamic Architecture

```text
Safety checklist upload / Safety app workflow
  → existing backend Function App
  → existing Safety SharePoint lists
  → new Safety Field Excellence rollup service
  → Safety Field Excellence Candidate Scores
  → Safety leadership review / approval / override
  → Safety Field Excellence Weekly Highlights (published)
  → homepage current-published read endpoint
  → hb-intel-homepage Safety Field Excellence dynamic adapter
  → existing HbcSafetyHomepageSurface / governed homepage UI
```

### Backend Function App Integration Requirement

- Reuse the existing Safety Function App. Do not stand up a second backend.
- Reuse existing auth middleware, delegated/app role posture, managed-identity / Graph-only Safety posture, telemetry, request-id correlation, and Safety list GUID overlay resolution.
- The new module composes alongside existing ingestion, preview, and replay paths inside `backend/functions/src/services/` and `backend/functions/src/functions/`.

### No Browser Raw-List Aggregation Rule

- The homepage adapter may only call `GET /api/safety-field-excellence/homepage/current`.
- The homepage adapter must not query Safety SharePoint lists directly.
- The homepage adapter must not aggregate raw findings, inspections, or project-week records.
- The backend owns aggregation, scoring, approval, and provenance.

## Source-Mode Cutover

```ts
type SafetyFieldExcellenceSourceMode =
  | 'curated-only'
  | 'dynamic-preview'
  | 'dynamic-with-curated-fallback'
  | 'dynamic-only';
```

Default remains `curated-only` until hosted dynamic proof closes. Cutover proceeds: `curated-only → dynamic-preview → dynamic-with-curated-fallback → dynamic-only`. Each step is reversible by configuration without redeploy.

## Preview Fallback Requirement

When dynamic data is unavailable, render a polished preview of the future Safety Field Excellence state. The preview must:

- use the same surface structure as the dynamic state,
- be clearly labeled as preview / coming soon / awaiting published weekly data,
- show representative evidence areas (composite trend, activity exposure, corrective actions, data confidence, freshness),
- avoid naming real projects as winners unless backed by published data,
- explain what data will appear after Safety records are published,
- include an honest CTA to the Safety hub or records,
- meet homepage-grade visual quality.

A blank "no data available" empty state is non-conformant.

## UI/UX Flagship Acceptance Requirements

The dynamic surface must conform to the homepage UI/UX doctrine and audit instruments:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/doctrine/`
- `docs/reference/spfx-surfaces/benchmark/`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

The surface must communicate weekly safety story, primary recognition, supporting evidence, data confidence, freshness, secondary excellence signals, and a credible CTA. It must read as a serious safety-recognition product surface — not a thin status card.

## Scorecard Target

- 48+/56
- no hard-stop failures
- no critical accessibility failures
- no host-fit instability
- no generic enterprise-card result
- credible compact and hosted behavior
- evidence-backed closure comparable in seriousness to hbKudos public runtime, without cloning hbKudos

## Risk Controls for Single-Score Recognition

Recognition driven from a single inspection score is a known failure mode. The cutover applies layered controls:

1. **Eligibility gates**: active project gate, current/recent valid inspection gate, activity/exposure gate, data quality gate, unresolved high-risk finding gate, narrative explainability gate.
2. **Low-activity perfect-score suppression**: a single 100% score with insufficient activity evidence is ineligible; recorded with `EligibilityStatus = 'ineligible'` and reason in `ExclusionReasonsJson`.
3. **Composite score**: weighted blend (`SafetyPerformance 30%`, `ConsistencyTrend 20%`, `ActivityExposure 20%`, `CorrectiveAction 20%`, `DataQuality 10%`).
4. **Editorial override with reason**: any override is recorded on the Weekly Highlight with `EditorialOverrideApplied = true` and a non-empty `OverrideReason`.
5. **Rollback path**: `RollbackFromItemId` (Number) records the prior Weekly Highlight item ID when rolling back; preserves auditability.
6. **Data confidence labeling**: `DataConfidence` (`high` / `medium` / `low`) accompanies every published highlight; surface visually communicates it.

## Locked Choice Vocabularies

These are the canonical strings used by Wave 01 schema, the scoring domain (Wave 02), the rollup/publish state machine (Waves 03–04), and the homepage adapter (Wave 05). Any drift is a defect.

| Field | Allowed values |
|---|---|
| `EligibilityStatus` | `eligible`, `ineligible`, `low-confidence`, `needs-review` |
| `ActivityEvidenceStatus` | `proven`, `inferred`, `missing` |
| `PublishRecommendation` | `primary`, `secondary`, `monitor`, `do-not-publish` |
| `PublishStatus` | `draft`, `pending-review`, `approved`, `published`, `archived`, `suppressed` |
| `DataConfidence` | `high`, `medium`, `low` |
| `HighestRiskFindingLevel` | `info`, `medium`, `high` (matches existing Safety vocabulary) |

## Wave Map

| Wave | Prompt | Scope |
|---|---|---|
| 01 | `phase-02/01_SCHEMA_AND_ARCHITECTURE_PROMPT.md` | **Current.** Schema, descriptors, provisioning + indexed-column wiring through Safety provisioning path, schema docs, this architecture doc. No runtime change. |
| 02 | `phase-02/02_SCORING_DOMAIN_PACKAGE_PROMPT.md` | Pure scoring domain in `packages/features/safety/src/excellence/`. |
| 03 | `phase-02/03_BACKEND_ROLLUP_APIS_PROMPT.md` | Repository, rollup service, admin routes, homepage current-published read route. |
| 04 | `phase-02/04_TIMER_AND_PUBLISH_WORKFLOW_PROMPT.md` | Weekly timer trigger, approval / override / publish / suppress / rollback. |
| 05 | `phase-02/05_HOMEPAGE_DYNAMIC_ADAPTER_PROMPT.md` | Source-mode plumbing, dynamic adapter, preview fallback. |
| 06 | `phase-02/06_UIUX_FLAGSHIP_REMEDIATION_PROMPT.md` | UI/UX remediation against checklist + scorecard. |
| 07 | `phase-02/07_HOSTED_CUTOVER_PROOF_PROMPT.md` | Hosted package + runtime proof. |
| 08 | `phase-02/08_FINAL_CLOSURE_AND_COMMIT_PROMPT.md` | Closure, version bumps, final commit. |

## Pending Items After Wave 01

- Tenant GUID extraction for the two new lists must follow provisioning. Until then, descriptor lookups fail closed via `SafetyConfigurationError`.
- Index-state repair is implemented; hosted validation against a real tenant is deferred to Waves 03–07.
- JSON-in-Note columns (`SecondaryCandidateIdsJson`, `HomepagePayloadJson`, `SourceCandidateIdsJson`, `ActivityEvidenceJson`, `ExclusionReasonsJson`, `SourceInspectionIdsJson`, `SourceFindingIdsJson`) require disciplined writers in Wave 04.
