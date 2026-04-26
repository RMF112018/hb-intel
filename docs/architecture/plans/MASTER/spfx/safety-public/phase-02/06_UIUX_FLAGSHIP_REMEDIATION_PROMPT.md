# Phase 02 — Prompt 06: Safety Field Excellence UI/UX Flagship Remediation

You are working in a fresh local code-agent session inside the live `RMF112018/hb-intel` repository.

Use `main` as authoritative repo truth unless the operator explicitly tells you to work from a feature branch.

## Objective

Audit and remediate the **Safety Field Excellence** homepage surface so the dynamic implementation delivered in Wave 05 meets the HB Central homepage UI/UX doctrine, the homepage checklist, and the flagship scorecard target.

This is a **UI/UX hardening and evidence-closure wave**.

It is not a backend wave.  
It is not a data-pipeline wave.  
It is not a new adapter implementation wave.  
It is not hosted proof. Prompt 07 owns hosted proof.

The expected output of this wave is a polished, doctrine-compliant, flagship-grade Safety Field Excellence surface that works across:

- curated-only
- dynamic-preview
- dynamic-with-curated-fallback
- dynamic-only
- valid published dynamic data
- no published dynamic data
- preview fallback
- stale dynamic data
- auth/network/invalid-payload fallback
- compact / minimal / summary-collapsed render modes

The target is:

- **48+/56** on the homepage scorecard
- **no hard-stop failures**
- **no critical accessibility failures**
- **no host-fit failures**
- **no generic enterprise white-card posture**
- **no misleading preview/sample content**

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
- activity/exposure evidence interpretation
- low-activity perfect-score suppression
- narrative generation
- homepage-safe DTOs
- preview DTOs

Prompt 06 must not re-implement any scoring or ranking logic.

### Wave 03 completed — backend rollup APIs

Wave 03 added backend candidate-generation APIs and persisted candidate records.

Prompt 06 must not call or alter those APIs.

### Wave 04 completed — publish workflow and current endpoint

Wave 04 added:

```text
GET /api/safety-field-excellence/homepage/current
```

The endpoint returns only published, homepage-safe data. It supports normal authenticated homepage users through a dedicated current-read authorization path.

Prompt 06 must not change backend routes, backend auth, timer behavior, or publish workflow.

### Wave 05 completed — dynamic homepage adapter

Wave 05 commit `8a481694c` added the frontend adapter and source modes:

- `curated-only` default
- `dynamic-preview`
- `dynamic-with-curated-fallback`
- `dynamic-only`

Wave 05 also added:

- `SafetyFieldExcellenceDataAdapter`
- `SafetyFieldExcellenceDynamicProvider`
- `safetyFieldExcellencePayloadMapper`
- `safetyFieldExcellencePreviewFallback`
- `safetyFieldExcellenceRuntimeProof`
- dynamic config slice
- runtime proof at `window.__hbIntel_safetyFieldExcellenceRuntimeProof`
- version bump to `SafetyFieldExcellenceWebPart 0.0.7.0`
- tests for adapter, mapper, preview fallback, provider, and state matrix

Known Wave 05 boundaries:

- default behavior remains `curated-only`
- adapter calls only `GET /api/safety-field-excellence/homepage/current`
- no MSAL
- no backend/admin/control-plane endpoint calls
- no scoring/ranking reimplementation
- no raw Safety list aggregation in browser
- no UI/UX flagship remediation yet
- hosted proof is still pending

Treat these outcomes as current repo truth.

---

## Governing UI/UX Inputs

Before making changes, inspect the current versions of:

```text
docs/reference/ui-kit/doctrine/
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md
docs/reference/spfx-surfaces/benchmark/
docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md
docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md
```

Also inspect the highest-quality homepage benchmark surfaces in the repo, especially current HB Kudos public surface patterns, without copying its exact visual treatment.

Do not re-read files that are still within your current context or memory.

---

## Files to Inspect First

Inspect current repo truth for these files:

```text
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDataAdapter.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.tsx
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePayloadMapper.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePreviewFallback.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceRuntimeProof.ts
apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceConsumerModel.tsx
apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx
apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx
apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts
apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts
packages/ui-kit/src/HbcSafetyHomepageSurface/
packages/ui-kit/src/homepage/
```

Also inspect the Wave 05 tests to understand the state matrix already covered:

```text
apps/hb-webparts/src/webparts/safetyFieldExcellence/**/__tests__/**
apps/hb-webparts/src/webparts/safetyFieldExcellence/**/*.test.*
```

Use actual repo paths where test conventions differ.

---

## Required Work Product

Prompt 06 must produce both implementation and evidence.

### Required implementation output

Improve the actual Safety Field Excellence UI/UX so it meets flagship homepage expectations across the dynamic states.

Likely areas:

- visual hierarchy
- preview fallback quality
- stale/degraded state treatment
- compact/minimal behavior
- state clarity without diagnostic noise
- CTA placement and clarity
- evidence signal readability
- proof-safe diagnostics separation
- host-fit and responsive behavior
- accessibility and keyboard behavior
- visual differentiation from generic cards
- coherence with `HbcSafetyHomepageSurface` and ui-kit doctrine

### Required evidence output

Create or update evidence docs such as:

```text
docs/architecture/plans/MASTER/spfx/safety-public/evidence/safety-field-excellence-uiux-scorecard.md
docs/architecture/plans/MASTER/spfx/safety-public/evidence/safety-field-excellence-homepage-checklist.md
docs/architecture/plans/MASTER/spfx/safety-public/evidence/safety-field-excellence-state-matrix.md
docs/architecture/plans/MASTER/spfx/safety-public/evidence/safety-field-excellence-breakpoint-and-host-fit-evidence.md
```

Use repo conventions if evidence docs already exist elsewhere.

The evidence must be specific to the current Wave 05 dynamic implementation, not a generic checklist.

---

## Audit First, Then Remediate

Before editing implementation code, produce a concise audit summary in the plan or closure notes.

Audit against these categories:

1. Doctrine and host compliance
2. UI-kit / premium-stack compliance
3. Token and styling discipline
4. Purpose-fit sophistication and persona expression
5. Surface composition and hierarchy
6. Homepage integration quality
7. Breakpoint and shell-fit quality
8. Interaction completeness
9. State-model completeness
10. Contract, data, and backend seam rigor
11. Identity, media, and attribution quality
12. Accessibility and keyboard behavior
13. Host-runtime resilience
14. Validation and closure proof

Then remediate gaps that materially affect the score or hard-stop status.

---

## Scorecard Target

Final target:

```text
48+/56
```

Hard-stop failures are not acceptable.

No category should remain below `3` unless the closure report documents a specific accepted exception and explains why it is not a hard-stop.

Doctrine controls over scorecard if stricter.

---

## Design Objective

Safety Field Excellence should feel like a productized, evidence-backed safety-recognition surface.

It should express:

- seriousness
- field relevance
- operational trust
- recognition without gamification
- weekly cadence
- transparent evidence
- confidence/freshness
- polished preview fallback
- compact resilience
- continuity with HB Central homepage surfaces

It should not feel like:

- a generic white-card status widget
- a raw data dump
- a dashboard crammed into a homepage slot
- a fake leaderboard
- an app admin panel
- a placeholder empty state
- an unstyled API fallback

---

## Required State Coverage

Remediate and test the UI across these states:

### `curated-only`

- existing curated behavior remains polished and unchanged except for harmless quality improvements
- no backend state leaks into UI
- no proof/diagnostic UI visible to normal users

### `dynamic-preview`

- fetch/proof behavior may occur
- public render remains curated by default
- diagnostics, if any, remain non-sensitive and hidden unless explicitly enabled
- no confusing partial dynamic content

### `dynamic-with-curated-fallback`

- valid dynamic payload renders as a live/published safety story
- no published data falls back to curated if curated config exists
- if no curated config exists, preview fallback renders
- auth/network/invalid-payload fallback is graceful
- fallback reason is visible only through proof/diagnostics, not as alarming user copy

### `dynamic-only`

- valid dynamic payload renders as the primary experience
- no published data renders the preview fallback
- stale data renders with clear but non-alarming stale/freshness treatment
- auth/network/invalid-payload renders safe preview/error fallback
- no blank state

### Preview fallback

- clearly labeled preview / awaiting published weekly data
- names no fake winning project
- does not imply a real project has been recognized
- uses final product structure enough to preview future intent
- includes representative evidence categories:
  - inspection consistency
  - active field exposure
  - corrective-action / finding response
  - finding severity trend
- CTA only appears when configured and honest

### Stale dynamic state

- stale status is visible but not overbearing
- stale state does not look like a fresh weekly award
- CTA remains useful
- runtime proof shows stale state

---

## Surface Composition Requirements

The standard mode should have a clear information hierarchy:

1. Safety posture / weekly cadence
2. Primary project or preview story
3. Evidence-backed summary
4. Key indicator / confidence / freshness
5. Secondary signals
6. CTA

The compact mode should intentionally reduce content:

- not a squeezed standard layout
- fewer secondary signals
- shorter copy
- compact metadata
- no horizontal overflow
- no awkward orphan CTA

The minimal / summary-collapsed mode should show only:

- status / cadence
- primary title or preview title
- one concise evidence signal or freshness indicator

---

## UI-Kit and Styling Rules

Prefer governed shared components and existing surface primitives.

Do:

- use or extend `HbcSafetyHomepageSurface`
- use ui-kit tokens/classes where established
- use existing homepage empty/loading/state patterns where appropriate
- keep dynamic state styling consistent with homepage doctrine
- make any `packages/ui-kit` changes reusable and test-backed

Do not:

- create a disconnected local white-card component
- hard-code ungoverned colors/spacers where tokens exist
- duplicate `HbcSafetyHomepageSurface` locally
- add heavy app chrome inside the homepage slot
- use hover-only meaning
- expose debug labels to normal users

If `HbcSafetyHomepageSurface` lacks a required state treatment, prefer a modest, governed extension there over local one-off hacks.

---

## Accessibility Requirements

Validate:

- semantic region / heading structure
- keyboard-reachable CTAs
- visible focus states
- no color-only meaning
- readable contrast in all variants
- reduced motion respected if motion is used
- touch target size
- screen-reader-safe preview wording
- stale/fallback meaning exposed textually

Do not add animation unless it materially improves clarity and respects reduced motion.

---

## Host-Fit and Responsive Requirements

Validate and remediate:

- desktop full-width
- two-up homepage lane
- compact shell mode
- minimal / summary-collapsed shell mode
- laptop width
- tablet landscape
- tablet portrait
- narrow/mobile portrait
- short viewport height
- 125% and 150% zoom

No horizontal overflow.

No text collision.

No clipped CTA.

No hidden critical information.

No dependency on unstable SharePoint DOM internals.

---

## Runtime Proof and Diagnostics

Wave 05 added:

```js
window.__hbIntel_safetyFieldExcellenceRuntimeProof
```

Prompt 06 must preserve this object and may extend it only if necessary.

It must never include:

- tokens
- raw payload JSON
- raw findings text
- raw checklist content
- employee performance detail
- Graph diagnostics

Prompt 06 may add non-sensitive proof fields if useful for UI/UX closure, such as:

- `renderMode`
- `surfaceVariant`
- `previewFallbackRendered`
- `staleTreatment`
- `scorecardVersion`

Only add these if useful and test-backed.

Normal users should not see diagnostic proof details unless diagnostics are explicitly enabled.

---

## Contract / Backend Seam Rules

Do not change backend code in this prompt.

The SPFx homepage surface must still call only:

```text
GET /api/safety-field-excellence/homepage/current
```

It must not call:

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

Do not query raw SharePoint Safety lists from SPFx.

Do not add scoring/ranking calculations to the frontend.

Do not change source mode semantics unless a Wave 05 bug is discovered; if changed, update tests and document why.

---

## Recommended Remediation Areas

Assess and remediate these likely areas from Wave 05:

### 1. Preview fallback visual weight

The preview fallback should feel like a preview of a serious future product, not filler content.

Improve:

- preview label clarity
- primary narrative polish
- evidence category layout
- future-state language
- CTA treatment
- compact preview behavior

### 2. Stale/degraded treatment

Ensure stale data does not look like a fresh recognition.

Improve:

- stale indicator
- last updated / fresh until language
- caution tone
- CTA to Safety hub or record
- proof state

### 3. Dynamic published story hierarchy

For valid dynamic data, ensure the surface reads as a weekly Safety Excellence story, not raw metrics.

Improve:

- title hierarchy
- supporting evidence copy
- metrics/indicator chips
- secondary signal readability
- confidence/freshness language

### 4. Compact and minimal render modes

Ensure shell-fit behavior is intentional.

Improve:

- content reduction logic
- secondary signal caps
- CTA presence/absence
- metadata truncation
- spacing

### 5. Accessibility polish

Improve focus, labels, semantics, and non-color meaning where needed.

### 6. Scorecard/evidence docs

Add detailed closure documentation tied to actual files and states.

---

## Required Tests

Update or add tests as needed.

Minimum test coverage:

### Visual/state model tests

- dynamic published state renders primary story
- preview fallback renders clear preview label
- stale dynamic state renders stale/freshness language
- auth/network fallback does not expose raw error details
- invalid payload fallback does not render backend diagnostics
- compact mode intentionally reduces content
- minimal mode renders without secondary clutter

### Config/source-mode regression tests

- `curated-only` unchanged
- `dynamic-preview` still renders curated by default
- `dynamic-with-curated-fallback` renders curated on no-published when curated exists
- `dynamic-only` renders preview on no-published
- emergency curated fallback behavior remains explicit

### Accessibility tests where repo harness supports it

- primary CTA has accessible label
- preview state has textual preview cue
- stale state has textual stale cue
- no hover-only meaning
- focusable elements remain valid

### Runtime proof tests

- proof object remains safe
- new UI/UX fields, if added, are non-sensitive
- proof not shown to normal users

### Contract guard tests

- no admin/control-plane endpoint calls from SPFx
- no raw checklist/finding fields in production Safety Field Excellence frontend
- no MSAL import

---

## Validation

Use repo-correct commands. Suggested commands:

```bash
pnpm --filter @hbc/spfx-hb-webparts check-types
pnpm --filter @hbc/spfx-hb-webparts test
pnpm --filter @hbc/features-safety check-types
pnpm --filter @hbc/functions check-types
```

If the repo still has known unrelated type/test failures, do not hide them. Report:

- exact command
- exact result
- whether failures are pre-existing
- why they are unrelated
- what targeted tests passed

Run targeted tests for:

```text
apps/hb-webparts/src/webparts/safetyFieldExcellence/
apps/hb-webparts/src/webparts/hbHomepage/
apps/hb-webparts/src/homepage/
packages/ui-kit/src/HbcSafetyHomepageSurface/
```

Run grep checks:

```bash
grep -R "safety-field-excellence/rollup\|/highlights/.*/approve\|/highlights/.*/publish\|/candidates" apps/hb-webparts/src || true
grep -R "RawChecklistJson\|rawChecklistJson" apps/hb-webparts/src/webparts/safetyFieldExcellence apps/hb-webparts/src/homepage packages/ui-kit/src/HbcSafetyHomepageSurface || true
grep -R "msal" apps/hb-webparts/src/webparts/safetyFieldExcellence apps/hb-webparts/src/webparts/hbHomepage || true
```

Expected:

- no homepage calls to admin/control-plane endpoints
- no raw checklist handling in production frontend code
- no direct MSAL usage

---

## SPFx Manifest / Package Version Guidance

Prompt 05 already bumped `SafetyFieldExcellenceWebPart` to `0.0.7.0`.

For Prompt 06:

- If you change SPFx source that affects the deployed webpart runtime, evaluate repo packaging policy.
- If a manifest/package version bump is required, bump to the next 4-part version and document why.
- If no manifest bump is required, explicitly document why.
- Do not bump unrelated manifests.

Prompt 07 owns package-truth and hosted-runtime proof.

---

## Required Evidence Docs

Create or update evidence docs with this structure.

### `safety-field-excellence-uiux-scorecard.md`

Include:

- date
- branch/commit
- inspected files
- score per category
- total score
- hard-stop status
- remediation summary
- remaining exceptions

### `safety-field-excellence-homepage-checklist.md`

Include:

- checklist item
- pass/fail/partial
- evidence
- file/test reference
- remediation note

### `safety-field-excellence-state-matrix.md`

Include rows for:

- curated-only
- dynamic-preview
- dynamic-with-curated-fallback / valid dynamic
- dynamic-with-curated-fallback / no-published + curated
- dynamic-with-curated-fallback / no-published + no curated
- dynamic-only / valid dynamic
- dynamic-only / no-published
- dynamic-only / stale
- dynamic-only / auth-error
- dynamic-only / network-error
- dynamic-only / invalid-payload

### `safety-field-excellence-breakpoint-and-host-fit-evidence.md`

Include:

- tested viewport / mode
- expected behavior
- observed behavior
- pass/fail
- remediation notes

If screenshots are generated locally, reference paths. Do not fabricate screenshots.

---

## Out of Scope

Do not:

- modify backend routes
- modify backend auth
- modify timer behavior
- modify publish workflow
- implement approval/publish UI
- query raw SharePoint Safety lists from SPFx
- call admin/control-plane endpoints from the homepage
- re-implement scoring/ranking
- parse or render raw findings
- expose raw backend errors
- remove curated fallback
- break legacy authored config
- perform broad shell refactors
- perform hosted proof
- claim production dynamic-only readiness

---

## Required Closure Report

Return:

```md
# Phase 02 — Prompt 06 Closure Report

## Summary

## Files Inspected

## Files Changed

## UI/UX Audit Findings

## Remediation Implemented

## Scorecard Result

Include:
- total score
- per-category scores
- hard-stop status
- remaining exceptions

## Checklist Result

## State Matrix Result

Cover:
- curated-only
- dynamic-preview
- dynamic-with-curated-fallback
- dynamic-only
- preview fallback
- stale
- auth/network/invalid-payload

## Breakpoint / Host-Fit Evidence

## Accessibility Evidence

## Runtime Proof Impact

Confirm runtime proof remains safe and useful.

## Backend / Contract Boundary

Confirm no backend routes changed and frontend still calls only:
GET /api/safety-field-excellence/homepage/current

## Validation Results

Include exact commands and pass/fail results.

## Manifest / Version Decision

State whether a manifest/package version changed and why.

## Out of Scope Confirmed

Confirm:
- no backend changes
- no timer changes
- no publish workflow changes
- no approval UI
- no hosted proof
- no scoring/ranking reimplementation
- no raw Safety list aggregation
- no admin/control-plane endpoint calls

## Risks / Follow-Up Items

Call out:
- Prompt 07 owns hosted proof
- backend timer current-period resolution remains env-var-only from Wave 04
- dynamic-only should not be enabled in production until hosted proof passes

## Prompt 07 Readiness

State whether the surface is ready for package-truth and hosted-runtime proof.
```

---

## Commit Guidance

If the wave closes cleanly, use a commit title similar to:

```text
SafetyFieldExcellenceWebPart 0.0.8.0: harden dynamic safety surface UI/UX
```

or, if no manifest bump is required:

```text
hb-intel-homepage phase-02 wave 06: harden safety field excellence UI/UX
```

Commit body should mention:

- doctrine/checklist/scorecard remediation
- dynamic state UI hardening
- preview fallback hardening
- compact/minimal behavior
- accessibility/host-fit improvements
- evidence docs added
- validation commands
- manifest/version decision
- no backend changes
