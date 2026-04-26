# Phase 02 — Prompt 05: Homepage Dynamic Adapter, Source Modes, and Preview Fallback

You are working in a fresh local code-agent session inside the live `RMF112018/hb-intel` repository.

Use `main` as authoritative repo truth unless the operator explicitly tells you to work from a feature branch.

## Objective

Implement the SPFx homepage dynamic adapter for **Safety Field Excellence**.

The current Safety Field Excellence homepage surface is curated/config-authored. After Waves 01–04, the backend can now publish a governed weekly highlight artifact through the existing Safety Function App. Prompt 05 must connect the homepage surface to that backend contract while preserving the current curated fallback and current shell/rendering architecture.

This prompt must:

- add homepage source-mode support
- add a frontend data adapter for `GET /api/safety-field-excellence/homepage/current`
- map the backend published payload into the current `SafetyFieldExcellenceConfig` rendering contract
- add a polished preview fallback when no published data exists
- preserve curated-only default behavior until explicitly enabled
- add runtime proof
- add tests for all source modes and fallback states
- keep all backend work out of scope

Do **not** implement UI/UX flagship remediation in this wave. Prompt 06 owns the full doctrine/checklist/scorecard hardening pass. However, any UI or state behavior added in Prompt 05 must be compatible with the doctrine and must not create known hard-stop issues.

---

## Current Progress Baseline

### Wave 01 completed — schema/provisioning foundation

Wave 01 added:

- `Safety Field Excellence Candidate Scores`
- `Safety Field Excellence Weekly Highlights`
- descriptors and GUID overlay keys:
  - `SafetyFieldExcellenceCandidateScores`
  - `SafetyFieldExcellenceWeeklyHighlights`
- `SpFieldDefinition.indexed?: boolean`
- Safety provisioning indexed-column support
- canonical choice vocabularies:
  - `EligibilityStatus`: `eligible`, `ineligible`, `low-confidence`, `needs-review`
  - `ActivityEvidenceStatus`: `proven`, `inferred`, `missing`
  - `PublishRecommendation`: `primary`, `secondary`, `monitor`, `do-not-publish`
  - `PublishStatus`: `draft`, `pending-review`, `approved`, `published`, `archived`, `suppressed`

### Wave 02 completed — pure excellence domain

Wave 02 added:

```text
packages/features/safety/src/excellence/
```

It owns:

- candidate scoring
- ranking
- perfect-score suppression
- activity/exposure inference
- narrative gate
- homepage-safe payload DTOs
- preview payload DTOs

The frontend must not import backend code or re-implement scoring logic.

### Wave 03 completed — backend rollup APIs

Wave 03 added backend routes:

```text
POST /api/safety-field-excellence/rollup/dry-run
POST /api/safety-field-excellence/rollup/generate
GET  /api/safety-field-excellence/reporting-periods/{id}/candidates
```

It also added:

- `SafetyFieldExcellenceGraphRepository`
- `SafetyFieldExcellenceRollupService`
- candidate persistence into `Safety Field Excellence Candidate Scores`
- telemetry and query contracts
- route auth actions:
  - `excellence-rollup-read`
  - `excellence-rollup-generate`

### Wave 04 completed — publish workflow and current endpoint

Wave 04 commit `c02640387` added:

- weekly timer trigger
- six leadership routes:
  - `GET /api/safety-field-excellence/highlights/{id}`
  - `POST /api/safety-field-excellence/highlights/{id}/approve`
  - `POST /api/safety-field-excellence/highlights/{id}/override`
  - `POST /api/safety-field-excellence/highlights/{id}/publish`
  - `POST /api/safety-field-excellence/highlights/{id}/suppress`
  - `POST /api/safety-field-excellence/highlights/{id}/rollback`
- read-only homepage endpoint:
  - `GET /api/safety-field-excellence/homepage/current`
- dedicated homepage-current authorization:
  - any authenticated delegated user with `access_as_user`
  - app-only workload token where applicable
  - no Safety reviewer/admin role required
- published-only current response:
  - never returns draft, pending-review, approved, archived, or suppressed
  - no raw candidate internals
  - no `RawChecklistJson`
  - no raw findings text
  - no employee performance details
  - no Graph/token diagnostics
- 200 no-data contract:
  - `state: "no-published-highlight"` when no qualifying published artifact exists
- stale support:
  - `includeStale=true` may return stale item with `isStale: true`
- timer limitation:
  - reporting period resolution is env-var-only in v1
  - dynamic current-period resolution remains a backend follow-up

Treat Wave 04 as the backend contract baseline for Prompt 05.

---

## Current Homepage Repo Truth

Before implementation, inspect current repo truth. Do not re-read files still within your current context.

### Current Safety surface

```text
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceConsumerModel.tsx
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json
```

Current `SafetyFieldExcellence.tsx` is a curated/config consumer around `HbcSafetyHomepageSurface`. It currently:

- accepts `config`
- accepts `activeAudience`
- accepts `isLoading`
- accepts `shellRenderMode`
- coerces/normalizes authored config
- renders loading/empty/invalid states
- maps normalized config into the shared surface

Preserve this seam.

### Current homepage zone

```text
apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx
```

Current zone is intentionally thin:

- shell owns placement and render mode
- child owns safety model/state/rendering
- zone passes `moduleConfig.safetyFieldExcellence`
- zone passes `activeAudience`
- zone passes `shellRenderMode`

Do not move heavy logic into the shell.

### Current contracts and config

```text
apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts
apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts
apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx
```

Current `SafetyFieldExcellenceConfigInput` supports canonical and legacy authored config. Preserve compatibility.

### UI surface

```text
packages/ui-kit/src/HbcSafetyHomepageSurface/
```

or current repo-equivalent path for:

```text
HbcSafetyHomepageSurface
```

Do not replace this surface with a one-off card in Prompt 05. Use or extend the existing model.

### SPFx / backend auth patterns

Inspect current SPFx patterns for:

- `AadHttpClient`
- `MSGraphClientV3`
- any existing Function App client
- webpart context availability
- property pane config patterns
- runtime proof patterns
- package version constants

Candidate search terms:

```text
AadHttpClient
aadHttpClientFactory
functionApp
apiBaseUrl
runtimeProof
expectedPackageVersion
__hbIntel
```

Use the repo’s established pattern. If none exists in `apps/hb-webparts`, implement the narrowest SPFx-safe `AadHttpClient` client required for this endpoint.

Do not use direct MSAL inside SPFx.

---

## Source Modes

Implement these source modes:

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

### Mode behavior

| Mode | Behavior |
|---|---|
| `curated-only` | Existing behavior only. No backend call required. |
| `dynamic-preview` | Fetch backend current endpoint and build runtime proof, but do not replace the public curated render unless diagnostics/test flag explicitly requests it. |
| `dynamic-with-curated-fallback` | Render backend published payload when valid/fresh. Fall back to curated config when backend call fails, payload invalid, or no published highlight exists. |
| `dynamic-only` | Render backend published payload when valid. Render preview/no-data/stale/error states when dynamic content is missing or unavailable. Do not fall back to curated unless explicitly configured as emergency override. |

---

## Backend Endpoint Contract

Prompt 05 consumes only:

```text
GET /api/safety-field-excellence/homepage/current
```

Optional query behavior:

```text
?includeStale=true
```

Do not call:

```text
/rollup/dry-run
/rollup/generate
/reporting-periods/{id}/candidates
/highlights/{id}
/approve
/override
/publish
/suppress
/rollback
```

Those are admin/control-plane or leadership routes.

### Expected backend response states

The adapter must tolerate at least:

```ts
type SafetyFieldExcellenceCurrentState =
  | "published"
  | "no-published-highlight";
```

The actual backend response may wrap data in the repo’s normal `successResponse(...)` envelope. Inspect the concrete response shape in Wave 04 code and implement against repo truth.

### Published response shape

The adapter should expect and validate safe fields equivalent to:

```ts
interface SafetyFieldExcellenceHomepageCurrentPublished {
  readonly state: "published";
  readonly highlightItemId: number;
  readonly reportingPeriodId?: string;
  readonly reportingPeriodSpItemId?: number;
  readonly periodLabel?: string;
  readonly weekStartDate?: string;
  readonly weekEndDate?: string;
  readonly publishStatus: "published";
  readonly publishedAt?: string;
  readonly freshUntil?: string;
  readonly isStale: boolean;
  readonly dataConfidence?: "high" | "medium" | "low";
  readonly homepagePayload: unknown;
}
```

### No published response shape

The adapter should expect and validate safe fields equivalent to:

```ts
interface SafetyFieldExcellenceHomepageCurrentNoPublished {
  readonly state: "no-published-highlight";
  readonly isStale?: false;
  readonly dataConfidence?: "low";
  readonly message?: string;
}
```

### Hard security rule

The frontend must not require or expect:

- raw candidate internals
- raw finding text
- raw checklist JSON
- employee performance detail
- Graph diagnostics
- token diagnostics
- admin-only state machine fields

If those appear in the response, treat it as invalid and render a safe fallback.

---

## Required Implementation

### 1. Add dynamic source-mode contract

Update the appropriate homepage contract file, likely:

```text
apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts
```

or the shell module config contract if source-mode belongs there.

Add types similar to:

```ts
export type SafetyFieldExcellenceSourceMode =
  | "curated-only"
  | "dynamic-preview"
  | "dynamic-with-curated-fallback"
  | "dynamic-only";

export interface SafetyFieldExcellenceDynamicConfig {
  readonly sourceMode?: SafetyFieldExcellenceSourceMode;
  readonly functionAppBaseUrl?: string;
  readonly includeStale?: boolean;
  readonly diagnosticsEnabled?: boolean;
  readonly emergencyUseCuratedFallback?: boolean;
}
```

Use existing config naming conventions. Do not invent global config if module config already has a proper extension point.

### 2. Add backend current client / data adapter

Create files such as:

```text
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDataAdapter.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.tsx
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePayloadMapper.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePreviewFallback.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceRuntimeProof.ts
```

Use repo naming conventions where different.

The adapter must:

- call only `GET /api/safety-field-excellence/homepage/current`
- use `AadHttpClient` or the repo’s existing SPFx-safe function app client
- support normal authenticated users with delegated `access_as_user`
- include `includeStale=true` only when mode/config calls for it
- use request ID if existing client pattern supports it
- enforce timeout/abort behavior if repo pattern supports it
- classify errors into safe UI states
- validate the payload before rendering
- never expose raw error details to the public surface

### 3. Map backend payload to existing SafetyFieldExcellenceConfig

Implement a mapper from Wave 04 backend response / Wave 02 DTO into:

```ts
SafetyFieldExcellenceConfigInput
```

The mapper should produce canonical `SafetyFieldExcellenceConfig`, not legacy `items[]`.

Map into:

- `heading`
- `topLineSummary`
- `primarySpotlight`
- `secondarySignals`
- `sectionCta`
- `maxSecondaryItems`
- `staleAfterHours`

Use existing normalization in:

```text
operationalAwarenessConfig.ts
```

Do not bypass the existing normalizer unless necessary.

### 4. Validate backend payload

Implement strict, defensive runtime validation.

Requirements:

- `publishStatus` must be `published`
- `state` must be recognized
- `homepagePayload` must be object-like for published state
- `HomepagePayloadJson` must already be parsed by backend or safely parsed by adapter if backend returns JSON string
- `primarySpotlight` must have id/title/summary if present
- CTAs must have non-empty label and href
- freshness dates must be ISO-parseable if supplied
- `isStale` must be boolean where supplied
- unknown fields must be ignored, not rendered

If invalid:

- in `dynamic-with-curated-fallback`, fall back to curated config and record proof fallback reason
- in `dynamic-only`, render preview/error-safe fallback and record proof fallback reason

### 5. Add preview fallback

When no published data is available, render a polished future-state preview, not a weak blank state.

The preview fallback must:

- be clearly labeled as preview / awaiting published weekly data
- not name a fake winning project
- not imply live data exists
- use the same final surface structure where possible
- show representative evidence categories:
  - inspection consistency
  - corrective-action response
  - active field exposure
  - finding severity trend
- include honest CTA only if configured, such as:
  - `Open Safety hub`
  - `View Safety records`
- meet current surface quality without full Prompt 06 remediation

Suggested copy:

```text
Weekly Safety Excellence Preview

Once weekly Safety records are published, this surface will highlight the project with the strongest verified field-safety performance — based on inspection consistency, active-jobsite evidence, finding response, and data quality.
```

Do not render:

```text
No data available.
```

as the primary experience.

### 6. Extend `SafetyFieldExcellence` props

Current props are:

```ts
export interface SafetyFieldExcellenceProps {
  config?: SafetyFieldExcellenceConfigInput;
  activeAudience?: string;
  isLoading?: boolean;
  shellRenderMode?: "standard" | "compact" | "summary-collapsed";
}
```

Extend carefully. Example:

```ts
export interface SafetyFieldExcellenceProps {
  config?: SafetyFieldExcellenceConfigInput;
  activeAudience?: string;
  isLoading?: boolean;
  shellRenderMode?: "standard" | "compact" | "summary-collapsed";
  sourceMode?: SafetyFieldExcellenceSourceMode;
  dynamicConfig?: SafetyFieldExcellenceConfigInput;
  dynamicState?: SafetyFieldExcellenceDynamicState;
  dynamicErrorMessage?: string;
  fallbackReason?: string;
}
```

Keep backwards compatibility.

### 7. Add provider at zone level

Update:

```text
apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx
```

Preserve it as a thin shell-owned wrapper.

Preferred structure:

```tsx
<SafetyFieldExcellenceDynamicProvider
  sourceMode={...}
  functionAppBaseUrl={...}
  includeStale={...}
  diagnosticsEnabled={...}
  spfxContext={...}
>
  {(dynamic) => (
    <SafetyFieldExcellence
      config={moduleConfig.safetyFieldExcellence}
      dynamicConfig={dynamic.config}
      dynamicState={dynamic.state}
      dynamicErrorMessage={dynamic.errorMessage}
      fallbackReason={dynamic.fallbackReason}
      activeAudience={moduleConfig.activeAudience}
      shellRenderMode={shellRenderMode}
      sourceMode={sourceMode}
    />
  )}
</SafetyFieldExcellenceDynamicProvider>
```

Adapt to actual repo props/context patterns.

If `SafetyFieldExcellenceZone` currently lacks SPFx context needed for `AadHttpClient`, trace the shell contract and add the narrowest context prop required. Do not create broad shell refactors.

### 8. Add runtime proof object

Add a browser proof object:

```ts
declare global {
  interface Window {
    __hbIntel_safetyFieldExcellenceRuntimeProof?: {
      generatedAt: string;
      sourceMode: SafetyFieldExcellenceSourceMode;
      dataSource: "curated" | "dynamic" | "preview-fallback" | "curated-fallback" | "error-fallback";
      backendFunctionAppUrlConfigured: boolean;
      currentEndpointConfigured: boolean;
      currentEndpointUrl?: string;
      currentEndpointStatus?: number;
      publishedHighlightId?: number;
      reportingPeriodId?: string;
      reportingPeriodSpItemId?: number;
      periodLabel?: string;
      publishStatus?: "published";
      freshUntil?: string;
      isStale?: boolean;
      dataConfidence?: "high" | "medium" | "low";
      primaryProjectNumber?: string;
      secondaryCount: number;
      fallbackReason?: string;
      lastFetchStartedAt?: string;
      lastFetchCompletedAt?: string;
      packageVersion?: string;
      expectedPackageVersion?: string;
    };
  }
}
```

Runtime proof must never include tokens, raw payload JSON, raw findings text, or raw checklist content.

### 9. Add safe diagnostics UI only if already supported

Do not expose developer diagnostics to normal users.

If `diagnosticsEnabled` is true and the current repo has a diagnostics display pattern, you may show non-sensitive labels such as:

- source mode
- data source
- stale
- fallback reason

Otherwise proof object is sufficient for Prompt 05.

### 10. Preserve authored curated behavior

Existing curated behavior must remain unchanged in `curated-only`.

Do not change legacy config normalization, authored audience filtering, loading state, empty state, or current surface rendering unless required to add dynamic states safely.

---

## State Model

Implement and test:

```ts
export type SafetyFieldExcellenceDynamicState =
  | "idle"
  | "loading"
  | "ready"
  | "preview"
  | "stale"
  | "no-published-highlight"
  | "invalid-payload"
  | "auth-error"
  | "network-error"
  | "error";
```

Map states by source mode:

### `curated-only`

- no fetch
- render curated
- proof `dataSource = "curated"`

### `dynamic-preview`

- fetch current endpoint
- record proof
- default render remains curated
- diagnostics/test switch may render dynamic preview for validation
- no public cutover

### `dynamic-with-curated-fallback`

- ready + valid published payload → render dynamic
- stale published payload with `includeStale=true` → render dynamic with stale/degraded posture
- no published highlight → render curated fallback, unless no curated config exists, then preview fallback
- auth/network/invalid payload → curated fallback, unless no curated config exists, then preview/error fallback

### `dynamic-only`

- ready + valid published payload → render dynamic
- no published highlight → preview fallback
- stale with `includeStale=true` → stale dynamic display
- auth/network/invalid payload → preview/error fallback
- curated config is not used unless `emergencyUseCuratedFallback === true`

---

## Auth and SPFx Client Requirements

The backend current endpoint allows any authenticated delegated user with `access_as_user`.

The SPFx adapter must:

- acquire/call with the existing SPFx delegated API pattern
- use `AadHttpClient` or repo-equivalent
- target the configured backend Function App resource/base URL
- not use direct MSAL
- not require Safety reviewer/admin roles
- handle 401/403 distinctly as `auth-error`
- in `dynamic-with-curated-fallback`, fall back to curated on 401/403 and record proof
- in `dynamic-only`, render preview/error fallback on 401/403 and record proof

Configuration must make the backend base URL explicit. Do not hard-code production URL unless current repo already has a governed env/property pattern.

---

## Configuration Requirements

Add or reuse config fields for:

```ts
sourceMode
functionAppBaseUrl
includeStale
diagnosticsEnabled
emergencyUseCuratedFallback
safetyHubUrl or section CTA fallback URL
```

Where these live depends on repo truth:

- module config
- webpart properties
- tenant-hosted config list
- existing homepage config object

Keep the implementation narrow and consistent with the current homepage architecture.

Default values:

```ts
sourceMode = "curated-only"
includeStale = false
diagnosticsEnabled = false
emergencyUseCuratedFallback = false
```

If `functionAppBaseUrl` is missing:

- `curated-only`: no issue
- `dynamic-preview`: proof should show not configured; render curated
- `dynamic-with-curated-fallback`: render curated fallback
- `dynamic-only`: render preview/error fallback

---

## Preview Payload Mapping

The preview fallback should be generated in frontend code if backend returns `no-published-highlight`, because the backend current endpoint intentionally returns no published artifact.

Preferred frontend canonical config:

```ts
const previewConfig: SafetyFieldExcellenceConfig = {
  heading: "Safety and Field Excellence",
  topLineSummary: {
    statusLabel: "Preview",
    statusVariant: "info",
    summaryText:
      "Weekly Safety Excellence will appear here once Safety records are published.",
    lastUpdatedLabel: "Awaiting published weekly data",
  },
  primarySpotlight: {
    id: "safety-excellence-preview",
    title: "Weekly Safety Excellence Preview",
    summary:
      "Once weekly Safety records are published, this surface will highlight verified field-safety performance based on inspection consistency, active-jobsite evidence, finding response, and data quality.",
    compactSummary:
      "Preview of the weekly Safety Excellence highlight.",
    urgency: "routine",
    metadata: "Preview content — not a live project recognition",
    indicator: {
      label: "Preview",
      variant: "info",
    },
    freshness: {
      source: "curated",
    },
  },
  secondarySignals: [
    {
      id: "safety-preview-inspection-consistency",
      title: "Inspection consistency",
      summary:
        "Published highlights will consider rolling inspection performance, not a single score.",
      urgency: "routine",
      indicator: { label: "Example signal", variant: "neutral" },
    },
    {
      id: "safety-preview-activity-evidence",
      title: "Active field exposure",
      summary:
        "The model will look for evidence that meaningful work was active on site.",
      urgency: "routine",
      indicator: { label: "Example signal", variant: "neutral" },
    },
    {
      id: "safety-preview-corrective-response",
      title: "Finding response",
      summary:
        "Corrective-action behavior and finding severity will inform recognition.",
      urgency: "routine",
      indicator: { label: "Example signal", variant: "neutral" },
    },
  ],
};
```

Adjust copy and labels to fit the current UI, but preserve honesty.

---

## Do Not

- Do not add backend routes.
- Do not change backend auth.
- Do not change timer behavior.
- Do not change publish workflow.
- Do not implement approval/publish UI.
- Do not query SharePoint Safety lists directly from SPFx.
- Do not call candidate or highlight admin endpoints from homepage.
- Do not re-implement scoring or ranking in frontend code.
- Do not parse or render raw findings.
- Do not expose raw backend errors to users.
- Do not remove curated fallback.
- Do not break legacy authored config.
- Do not perform broad shell refactors.
- Do not perform Prompt 06 UI/UX flagship remediation in this wave.
- Do not bump SPFx manifests unless the repo’s package/version policy requires it for this SPFx source change. If a bump is required, document exactly why.

---

## Required Tests

Add or update tests in the repo’s established test locations.

Minimum required tests:

### Data adapter

- builds correct `homepage/current` URL
- includes `includeStale=true` only when requested
- uses configured function app base URL
- handles success published response
- handles `no-published-highlight`
- handles stale published response
- handles 401/403 as auth-error
- handles network failure
- handles malformed JSON
- rejects unexpected/unpublished statuses
- strips/ignores raw forbidden fields if present
- never returns raw checklist/finding content to renderer

### Payload mapper

- maps backend published payload to canonical `SafetyFieldExcellenceConfig`
- validates required primary spotlight fields
- maps freshness to `source: "live"`, `updatedAt`, `expiresAt`
- maps stale payload into degraded/freshness state
- maps secondary signals within existing limits
- rejects invalid CTA
- does not mutate backend payload object

### Preview fallback

- preview config is clearly labeled preview
- preview config names no fake project
- preview config includes representative evidence labels
- preview config is valid through `normalizeSafetyFieldExcellenceConfig`

### Source modes

- `curated-only` renders existing curated config and makes no backend call
- `dynamic-preview` fetches/proofs but keeps curated render by default
- `dynamic-with-curated-fallback` renders dynamic when valid
- `dynamic-with-curated-fallback` renders curated when endpoint returns no-published
- `dynamic-with-curated-fallback` renders preview when no curated config exists
- `dynamic-only` renders dynamic when valid
- `dynamic-only` renders preview on no-published
- `dynamic-only` renders preview/error fallback on auth/network/invalid payload
- stale dynamic payload renders with stale/degraded freshness

### Runtime proof

- proof object is populated for every source mode
- proof object shows `dataSource`
- proof object includes endpoint status/fallback reason
- proof object never includes tokens or raw payload content
- proof object records package/expected version if current repo pattern supports it

### Regression

- existing Safety Field Excellence curated tests remain green
- existing homepage shell tests remain green
- no backend package tests are required unless shared types change, but run typecheck across touched frontend package

---

## Validation

Use repo-correct commands. Suggested commands:

```bash
pnpm --filter hb-webparts check-types
pnpm --filter hb-webparts test
pnpm --filter @hbc/features-safety check-types
pnpm --filter @hbc/functions check-types
```

If package filter names differ, inspect `package.json` and use the correct scripts.

Run any targeted test scripts for:

```text
apps/hb-webparts/src/webparts/safetyFieldExcellence/
apps/hb-webparts/src/webparts/hbHomepage/
apps/hb-webparts/src/homepage/
```

Run grep checks:

```bash
grep -R "safety-field-excellence/rollup\|/highlights/.*/approve\|/highlights/.*/publish\|/candidates" apps/hb-webparts/src || true
grep -R "RawChecklistJson\|rawChecklistJson" apps/hb-webparts/src/webparts/safetyFieldExcellence apps/hb-webparts/src/homepage || true
grep -R "msal" apps/hb-webparts/src/webparts/safetyFieldExcellence apps/hb-webparts/src/webparts/hbHomepage || true
```

Expected:

- no homepage calls to admin/control-plane endpoints
- no raw checklist handling in SPFx surface
- no direct MSAL usage

Do not claim tests passed unless they actually passed.

---

## Required Closure Report

Return:

```md
# Phase 02 — Prompt 05 Closure Report

## Summary

## Files Inspected

## Files Changed

## Backend Contract Consumed

Confirm the adapter calls only:
GET /api/safety-field-excellence/homepage/current

Confirm it does not call:
- rollup/dry-run
- rollup/generate
- candidates
- highlights get/admin routes
- approve/override/publish/suppress/rollback

## Source Modes Implemented

Explain behavior for:
- curated-only
- dynamic-preview
- dynamic-with-curated-fallback
- dynamic-only

## Auth / Function App Client

Explain:
- client used
- function app base URL source
- delegated auth behavior
- handling of 401/403
- no Safety role requirement assumed by frontend

## Payload Mapping

Explain how backend payload maps into `SafetyFieldExcellenceConfig`.

## Preview Fallback

Confirm:
- clearly labeled preview
- no fake project winner
- representative evidence labels
- valid through existing normalizer

## Runtime Proof

Include browser console command:

```js
JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
```

Include expected proof examples for:
- curated-only
- dynamic valid
- no-published preview fallback
- curated fallback
- auth/network error fallback

## Validation Results

Include exact commands and pass/fail results.

## Out of Scope Confirmed

Confirm no backend changes, no publish workflow changes, no timer changes, no SPFx approval UI, no SharePoint raw-list aggregation, no scoring logic, no UI/UX flagship remediation, and no manifest bump unless explicitly required.

## Risks / Follow-Up Items

Call out:
- Prompt 06 still owns flagship UI/UX remediation
- hosted proof still belongs to Prompt 07
- backend timer current-period resolution remains env-var-only from Wave 04
- dynamic-only should not be enabled in production until hosted proof passes

## Prompt 06 Readiness

State whether Prompt 06 can now audit/remediate the dynamic Safety Field Excellence surface against:
- `docs/reference/ui-kit/doctrine/`
- homepage checklist
- homepage scorecard
```

---

## Commit Guidance

If the wave closes cleanly, use a commit title similar to:

```text
hb-intel-homepage phase-02 wave 05: add safety field excellence dynamic adapter
```

Commit body should mention:

- `homepage/current` backend endpoint consumed
- source modes added
- default remains curated-only
- dynamic adapter added
- preview fallback added
- runtime proof object added
- no backend routes/timer/publish workflow changes
- no scoring reimplementation
- no raw Safety list aggregation in browser
- validation commands
- manifest/version decision
