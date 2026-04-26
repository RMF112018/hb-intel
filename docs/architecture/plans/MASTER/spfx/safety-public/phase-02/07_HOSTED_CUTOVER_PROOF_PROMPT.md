# Phase 02 — Prompt 07: Hosted Runtime Proof, Package Truth, and Staged Cutover

You are working in a fresh local code-agent session inside the live `RMF112018/hb-intel` repository.

Use `main` as authoritative repo truth unless the operator explicitly tells you to work from a feature branch.

## Objective

Prepare, verify, package, deploy, and prove the hosted runtime behavior for the dynamic **Safety Field Excellence** homepage surface.

This wave closes the gap left by Wave 06: actual package truth and hosted SharePoint runtime proof.

Prompt 07 must prove that the deployed SPFx package and the hosted HBCentral homepage runtime are using the intended Wave 05/06 code and that the dynamic Safety Field Excellence surface behaves correctly against the Wave 04 backend `homepage/current` contract.

This prompt owns:

- package truth
- deployed package proof
- hosted runtime proof
- backend current endpoint proof
- runtime proof object capture
- source-mode validation in hosted SharePoint
- preview/curated fallback proof
- stale/no-published proof where possible
- rollback instructions
- final cutover recommendation

This prompt does **not** own:

- new backend route development
- backend scoring changes
- timer redesign
- publish workflow redesign
- UI/UX redesign
- new homepage architecture
- approval/publish admin UI
- production dynamic-only enablement without proof

---

## Current Progress Baseline

### Wave 01 completed — schema/provisioning foundation

Wave 01 added the SharePoint schema foundation for:

- `Safety Field Excellence Candidate Scores`
- `Safety Field Excellence Weekly Highlights`

It also locked the canonical vocabularies:

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

- scoring
- ranking
- low-activity perfect-score suppression
- activity/exposure handling
- narrative generation
- homepage-safe DTOs
- preview DTOs

Prompt 07 must not re-implement any of this.

### Wave 03 completed — backend rollup APIs

Wave 03 added:

```text
POST /api/safety-field-excellence/rollup/dry-run
POST /api/safety-field-excellence/rollup/generate
GET  /api/safety-field-excellence/reporting-periods/{id}/candidates
```

It also added candidate persistence and Graph-backed query contracts.

Prompt 07 may use these routes only for proof/setup if necessary and only through the approved admin/test process. The homepage itself must not call them.

### Wave 04 completed — publish workflow and current endpoint

Wave 04 added:

- weekly timer trigger
- leadership routes for get/approve/override/publish/suppress/rollback
- read-only current endpoint:

```text
GET /api/safety-field-excellence/homepage/current
```

The current endpoint:

- allows any authenticated delegated user with `access_as_user`
- requires no Safety reviewer/admin role
- returns only published homepage-safe content
- returns `200 { state: "no-published-highlight" }` when no qualifying published item exists
- returns stale content only when `includeStale=true`
- never returns draft, pending-review, approved, archived, or suppressed content
- never returns raw candidate internals, `RawChecklistJson`, raw findings text, employee performance detail, or Graph/token diagnostics

Known backend limitation:

- weekly timer target reporting period is env-var-only in v1
- dynamic current-period resolution remains a follow-up before unattended weekly production operation
- dynamic-only must not be enabled in production until hosted proof passes

### Wave 05 completed — dynamic homepage adapter

Wave 05 commit `8a481694c` added:

- source modes:
  - `curated-only`
  - `dynamic-preview`
  - `dynamic-with-curated-fallback`
  - `dynamic-only`
- `SafetyFieldExcellenceDataAdapter`
- `SafetyFieldExcellenceDynamicProvider`
- payload mapper
- preview fallback
- runtime proof object:

```js
window.__hbIntel_safetyFieldExcellenceRuntimeProof
```

Wave 05 bumped:

```text
SafetyFieldExcellenceWebPart 0.0.6.0 -> 0.0.7.0
```

### Wave 06 completed — UI/UX flagship remediation

Wave 06 commit `10d219d44` added:

- first-class preview/stale/fallback/data-confidence treatments
- additive `HbcSafetyHomepageSurface` props:
  - `isPreview`
  - `isStale`
  - `fallbackReason`
  - `dataConfidence`
  - `degradedNoticeIcon`
- additive `SafetyPrimarySignal` props:
  - `lastUpdatedLabel`
  - `dataConfidence`
- icon + text degraded notice
- stale chip that survives compact/minimal modes
- preview/fallback chip that survives compact/minimal modes
- confidence chip
- no color-only degraded/stale meaning
- no hover-only meaning
- token-only CSS additions
- no MSAL
- no admin/control-plane endpoint calls from the homepage
- no raw checklist production handling
- four evidence docs under:

```text
docs/architecture/plans/MASTER/spfx/safety-public/evidence/
```

Wave 06 scorecard result:

```text
55/56
```

with category 13 host-runtime resilience capped at 3 pending Prompt 07.

Wave 06 bumped:

```text
SafetyFieldExcellenceWebPart 0.0.7.0 -> 0.0.8.0
```

Treat Wave 06 as the current source truth.

---

## Critical Rule

Do not claim hosted runtime closure from source code, local tests, or local screenshots alone.

Prompt 07 closes only when hosted SharePoint runtime evidence proves:

1. the deployed package contains the intended Wave 06 source,
2. the hosted page is loading the expected bundle/package version,
3. the hosted page exposes the expected runtime proof object,
4. source-mode behavior matches the Wave 05/06 contract,
5. fallback states work,
6. current endpoint auth works for normal authenticated homepage users,
7. rollback steps are documented.

---

## Files to Inspect First

Do not re-read files still within your current context or memory.

Inspect:

```text
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceWebPart.manifest.json
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDataAdapter.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.tsx
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceRuntimeProof.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePreviewFallback.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePayloadMapper.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceConsumerModel.tsx
apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx
apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.ts
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/config/package-solution.json
apps/hb-webparts/config/config.json
apps/hb-webparts/gulpfile.js
tools/build-spfx-package.ts
docs/architecture/plans/MASTER/spfx/safety-public/evidence/
```

Also inspect packaging/proof scripts used elsewhere in the repo:

```text
tools/
scripts/
docs/architecture/plans/MASTER/spfx/**/evidence/
docs/reference/spfx-surfaces/benchmark/
```

Use repo equivalents where paths differ.

---

## Required Hosted Targets

Use current tenant/site truth from the operator or repo docs. If not explicitly provided, start with the known HBCentral host pattern:

```text
https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
```

The target page should be the HB Central homepage or the hosted page where the `hbHomepage` shell embeds Safety Field Excellence.

Do not assume the page is correct. Capture the actual URL used in evidence docs.

---

## Required Evidence Docs

Create or update:

```text
docs/architecture/plans/MASTER/spfx/safety-public/evidence/safety-field-excellence-hosted-runtime-proof.md
docs/architecture/plans/MASTER/spfx/safety-public/evidence/safety-field-excellence-package-truth-proof.md
docs/architecture/plans/MASTER/spfx/safety-public/evidence/safety-field-excellence-cutover-readiness.md
docs/architecture/plans/MASTER/spfx/safety-public/evidence/safety-field-excellence-rollback-runbook.md
```

You may create one combined closure doc if repo conventions require it, but it must contain all sections listed below.

---

## Package Truth Requirements

Prove the generated `.sppkg` contains the intended Wave 06 source and expected webpart version.

Required checks:

### 1. Source version

Verify:

```text
SafetyFieldExcellenceWebPart.manifest.json
version = 0.0.8.0
```

### 2. Package version

Verify the generated package contains:

- SafetyFieldExcellenceWebPart manifest
- version `0.0.8.0`
- dynamic source-mode strings:
  - `dynamic-preview`
  - `dynamic-with-curated-fallback`
  - `dynamic-only`
- endpoint path:
  - `/api/safety-field-excellence/homepage/current`
- runtime proof symbol:
  - `__hbIntel_safetyFieldExcellenceRuntimeProof`
- Wave 06 UI/UX strings:
  - `Live data temporarily unavailable`
  - `High confidence`
  - `Medium confidence`
  - `Low confidence`
  - `Stale`
  - `Preview`
- no admin/control-plane endpoint strings in production bundle:
  - `/rollup/dry-run`
  - `/rollup/generate`
  - `/reporting-periods/`
  - `/candidates`
  - `/approve`
  - `/publish`
  - `/suppress`
  - `/rollback`

Do not treat a successful package command as sufficient. Inspect package contents.

### 3. Package artifact evidence

Record:

- package file path
- package SHA256
- build timestamp
- source commit SHA
- manifest version
- package-solution version if relevant
- bundle/string proof commands
- results

---

## Build and Package Commands

Use repo-correct commands. Do not invent passing results.

Likely flow:

```bash
git status --short
git rev-parse HEAD
pnpm install --frozen-lockfile
pnpm --filter @hbc/spfx-hb-webparts check-types
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/features-safety check-types
pnpm --filter @hbc/functions check-types
pnpm exec vitest run --config vitest.config.ts src/webparts/safetyFieldExcellence
pnpm --filter @hbc/spfx-hb-webparts build
pnpm --filter @hbc/spfx-hb-webparts package-solution
```

If actual scripts differ, inspect `package.json`, `apps/hb-webparts/package.json`, and existing build scripts. Use current repo standard.

If known unrelated errors remain, document them exactly and prove the Safety Field Excellence targeted checks pass.

---

## Deployment Requirements

Deploy only the correct generated SPFx package after package truth is proven.

Required proof:

- package file selected
- app catalog destination
- upload/deploy command or manual app catalog steps
- deployment timestamp
- deployed package version
- app catalog item evidence where available
- confirmation the target site/page uses the updated webpart

Do not deploy a stale `.sppkg`.

Do not rely on an old file path without proving file timestamp and SHA.

---

## Backend Runtime Proof

Before validating the homepage, prove the backend current endpoint is reachable and behaves as expected.

Required checks:

### 1. Health / readiness

Run existing backend health/readiness check if available.

Record:

- URL
- status
- request ID / correlation ID if available
- response summary

### 2. Current endpoint: normal authenticated user

Prove:

```text
GET /api/safety-field-excellence/homepage/current
```

works with a normal authenticated delegated user token and does not require Safety reviewer/admin roles.

Acceptable outcomes:

- `200 state: "published"` if a published highlight exists
- `200 state: "no-published-highlight"` if none exists

Unacceptable outcomes:

- 401/403 for a normal authenticated homepage user, unless token acquisition itself failed and is documented as a separate auth setup issue
- raw candidate internals
- `RawChecklistJson`
- raw findings text
- employee performance detail
- Graph/token diagnostics

### 3. Current endpoint: no-data/stale path

Where feasible, prove one of:

- no published data returns `state: "no-published-highlight"`
- stale data returns only when `includeStale=true`
- suppressed/unpublished records are not returned

Do not mutate production content solely to manufacture a test unless operator explicitly authorizes it.

---

## Hosted Runtime Proof Object

On the hosted SharePoint page, run:

```js
JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
```

Capture the output.

Required fields to verify:

```json
{
  "sourceMode": "...",
  "dataSource": "...",
  "state": "...",
  "backendFunctionAppUrlConfigured": true,
  "currentEndpointConfigured": true,
  "currentEndpointUrl": ".../api/safety-field-excellence/homepage/current",
  "currentEndpointStatus": 200,
  "secondaryCount": 0,
  "previewFallbackRendered": true,
  "staleTreatment": false
}
```

Exact values depend on source mode and backend state.

The proof object must never include:

- tokens
- raw payload JSON
- raw checklist content
- raw findings text
- employee performance detail
- Graph diagnostics

---

## Hosted Source-Mode Validation Matrix

Validate each source mode where possible.

### 1. `curated-only`

Expected:

- no backend call required
- existing curated render remains intact
- runtime proof:
  - `sourceMode: "curated-only"`
  - `dataSource: "curated"`
  - no current endpoint call required

Required evidence:

- screenshot or DOM proof
- runtime proof JSON
- network panel or proof showing no backend call if feasible

### 2. `dynamic-preview`

Expected:

- backend current endpoint is fetched/proofed
- public render remains curated by default
- runtime proof records endpoint status/outcome
- no user-visible premature dynamic cutover

Required evidence:

- screenshot or DOM proof
- runtime proof JSON
- network proof showing only `/homepage/current`

### 3. `dynamic-with-curated-fallback`

Expected when published data exists:

- dynamic published payload renders
- data confidence chip visible
- stale/preview/fallback chips behave correctly
- runtime proof:
  - `sourceMode: "dynamic-with-curated-fallback"`
  - `dataSource: "dynamic"`
  - `publishStatus: "published"`
  - `currentEndpointStatus: 200`

Expected when no published data or auth/network issue:

- curated fallback renders if curated config exists
- preview fallback renders if no curated config exists
- runtime proof records fallback reason
- no raw backend error shown

Required evidence:

- screenshot/DOM proof
- runtime proof JSON
- network proof

### 4. `dynamic-only`

Do not enable in production by default.

Validate only in a controlled test page/config or with explicit operator approval.

Expected:

- dynamic published data renders when available
- no published data renders preview fallback
- auth/network/invalid-payload renders preview/error fallback
- runtime proof records:
  - previewFallbackRendered when applicable
  - staleTreatment when applicable
  - fallbackReason where applicable

Required evidence:

- screenshot/DOM proof on controlled page
- runtime proof JSON
- rollback path if accidentally enabled on production homepage

---

## UI/UX Hosted Checks

Prompt 06 already produced scorecard evidence, but Prompt 07 must verify the deployed hosted page reflects it.

Hosted checks:

- Preview chip visible when preview fallback renders
- Stale chip visible when stale state renders
- Confidence chip visible for published data with confidence
- Degraded/fallback notice uses icon + text
- Compact/minimal mode cues survive where the host shell triggers those modes
- No color-only stale/degraded meaning
- No hover-only signal meaning
- No dead CTA
- No raw backend error text
- No console errors attributable to Safety Field Excellence
- No horizontal overflow in the hosted SharePoint canvas

Where screenshots are captured, record paths. Do not fabricate screenshots.

---

## Network Proof

Using browser developer tools, Playwright, or an approved script, prove:

Allowed from Safety Field Excellence homepage surface:

```text
/api/safety-field-excellence/homepage/current
```

Not allowed from Safety Field Excellence homepage surface:

```text
/api/safety-field-excellence/rollup/dry-run
/api/safety-field-excellence/rollup/generate
/api/safety-field-excellence/reporting-periods/{id}/candidates
/api/safety-field-excellence/highlights/{id}
POST /approve
POST /override
POST /publish
POST /suppress
POST /rollback
```

Record evidence:

- network request URL
- status
- response state
- no forbidden endpoint calls

---

## Console Proof

Record console state:

- no Safety Field Excellence runtime exceptions
- no auth loops
- no unhandled promise rejections from adapter/provider
- runtime proof object present
- no token/raw payload exposure

If there are unrelated console errors, document them separately and prove they are unrelated.

---

## Rollback Requirements

Create rollback instructions covering at minimum:

### SPFx rollback

- redeploy prior `.sppkg` package
- or revert to prior app catalog version
- confirm `SafetyFieldExcellenceWebPart` reverts from `0.0.8.0` to prior version if necessary
- clear CDN/app catalog cache path if required by tenant practice

### Config rollback

- set source mode to `curated-only`
- remove or disable `safetyFieldExcellenceDynamic`
- remove/ignore `functionAppBaseUrl`
- keep authored curated fallback config intact

### Backend content rollback

- suppress current published highlight if content is incorrect
- publish/rollback a prior highlight only through Wave 04 leadership routes
- do not directly edit list records except through documented emergency process

### Emergency homepage fallback

- ensure curated config renders
- prove runtime proof `dataSource: "curated"` or `curated-fallback`

---

## Cutover Recommendation Rules

Do not recommend `dynamic-only` for production unless all are true:

- package truth proven
- hosted runtime proof proven
- backend current endpoint works for normal authenticated users
- dynamic published payload renders correctly
- no-published preview fallback renders correctly
- auth/network fallback renders safely
- rollback tested/documented
- Safety/operations owner accepts the content governance process
- backend timer current-period resolution risk is addressed or explicitly accepted

Preferred production cutover after Prompt 07:

```text
dynamic-with-curated-fallback
```

with curated fallback retained until at least one full weekly cycle is proven.

Recommended staged path:

1. `curated-only`
2. `dynamic-preview`
3. `dynamic-with-curated-fallback`
4. monitor at least one weekly cycle
5. consider `dynamic-only` only after backend timer current-period resolution is remediated or governance accepts the env-var limitation

---

## Required Evidence Document Structure

### `safety-field-excellence-package-truth-proof.md`

Include:

- repo commit SHA
- package file path
- package SHA256
- manifest version
- package-solution version
- string proof results
- build commands and results
- deployment artifact selected
- stale package exclusion proof

### `safety-field-excellence-hosted-runtime-proof.md`

Include:

- hosted page URL
- browser/user context
- source mode tested
- runtime proof JSON
- screenshot paths if captured
- network proof
- console proof
- backend current endpoint response summary
- UI state observed
- pass/fail

### `safety-field-excellence-cutover-readiness.md`

Include:

- readiness matrix
- source modes tested
- backend readiness
- UI/UX scorecard carry-forward
- unresolved risks
- recommended production source mode
- explicit dynamic-only recommendation or rejection

### `safety-field-excellence-rollback-runbook.md`

Include:

- SPFx rollback
- config rollback
- content rollback
- emergency curated fallback
- verification after rollback
- owner/action table

---

## Validation Commands

Use repo-correct commands. Suggested:

```bash
git status --short
git rev-parse HEAD
pnpm --filter @hbc/spfx-hb-webparts check-types
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/features-safety check-types
pnpm --filter @hbc/functions check-types
pnpm exec vitest run --config vitest.config.ts src/webparts/safetyFieldExcellence
```

For packaging, use repo-correct commands discovered from scripts. Examples only:

```bash
pnpm --filter @hbc/spfx-hb-webparts build
pnpm --filter @hbc/spfx-hb-webparts package-solution
```

For package proof, use shell commands such as:

```bash
shasum -a 256 <path-to-sppkg>
unzip -l <path-to-sppkg>
strings <extracted-or-bundle-file> | grep "__hbIntel_safetyFieldExcellenceRuntimeProof"
strings <extracted-or-bundle-file> | grep "dynamic-with-curated-fallback"
strings <extracted-or-bundle-file> | grep "/api/safety-field-excellence/homepage/current"
```

Adjust for actual package structure.

---

## Guard Greps

Run and document:

```bash
grep -R "safety-field-excellence/rollup\|/highlights/.*/approve\|/highlights/.*/publish\|/candidates" apps/hb-webparts/src || true
grep -R "RawChecklistJson\|rawChecklistJson" apps/hb-webparts/src/webparts/safetyFieldExcellence apps/hb-webparts/src/homepage packages/ui-kit/src/HbcSafetyHomepageSurface || true
grep -R "msal" apps/hb-webparts/src/webparts/safetyFieldExcellence apps/hb-webparts/src/webparts/hbHomepage || true
```

Expected:

- no production homepage calls to admin/control-plane endpoints
- no raw checklist handling in production frontend code
- no direct MSAL usage

Test-guard mentions are acceptable if clearly test-only.

---

## Hard Stop Conditions

Do not declare Wave 07 closed if any of these are true:

- package version mismatch
- deployed package does not contain Wave 06 strings/proof symbol
- hosted runtime proof object missing
- hosted runtime still loads an older bundle
- `homepage/current` returns 401/403 for normal authenticated homepage users
- homepage calls admin/control-plane endpoints
- raw checklist/finding data appears in frontend response/render/proof
- preview fallback is not visible when no published content exists
- stale/preview/fallback chips do not render in hosted page when corresponding state is active
- console shows Safety Field Excellence runtime failures
- rollback path is not documented
- production is switched to `dynamic-only` without proof and owner acceptance

---

## Required Closure Report

Return:

```md
# Phase 02 — Prompt 07 Closure Report

## Summary

## Files Inspected

## Files Changed

## Package Truth

Include:
- commit SHA
- package path
- package SHA256
- manifest version
- package-solution version
- bundle/string proof
- stale package exclusion proof

## Deployment Proof

Include:
- app catalog/package upload proof
- deployed version
- target site/page URL
- timestamp
- operator/account context

## Backend Current Endpoint Proof

Include:
- endpoint URL
- auth context
- status
- response state
- no raw data proof
- normal authenticated user proof

## Hosted Runtime Proof

Include:
- browser console runtime proof JSON
- source mode
- data source
- endpoint status
- fallback reason if any
- stale/preview proof fields
- screenshot paths if captured

## Source Mode Validation

Cover:
- curated-only
- dynamic-preview
- dynamic-with-curated-fallback
- dynamic-only controlled validation or explicit deferral with reason

## UI/UX Hosted Verification

Confirm:
- preview/stale/fallback/data-confidence treatments render
- no horizontal overflow
- no dead CTA
- no raw error text
- no color-only/hover-only meaning in active states

## Network and Console Proof

## Rollback Runbook

## Cutover Recommendation

State one of:
- remain curated-only
- enable dynamic-preview
- enable dynamic-with-curated-fallback
- dynamic-only not recommended yet
- dynamic-only recommended only with explicit owner acceptance

## Validation Results

Include exact commands and pass/fail results.

## Out of Scope Confirmed

Confirm no backend route changes, no scoring changes, no publish workflow changes, no UI redesign beyond proof fixes, no broad shell refactor.

## Risks / Follow-Up Items

Call out:
- backend timer current-period resolution remains env-var-only unless remediated elsewhere
- dynamic-only production enablement risk
- any unresolved tenant/package/runtime issues

## Final Status

State whether hosted cutover is approved, conditionally approved, or blocked.
```

---

## Commit Guidance

If this wave only adds evidence docs and package-proof scripts, use a commit title like:

```text
hb-intel-homepage phase-02 wave 07: prove hosted safety field excellence cutover
```

If no source changes are made and evidence is retained outside the repo, do not create a source commit solely to claim closure. Instead provide the closure report and evidence paths.

If source changes are necessary to fix package/runtime proof defects, document them narrowly and update version/package proof accordingly.

Commit body should mention:

- package truth
- hosted runtime proof
- source-mode validation
- backend current endpoint proof
- rollback runbook
- cutover recommendation
- validation commands
