# Prompt 09 — PCC Conditional Edit Mode, High-Zoom, Drawer, Unauthorized, and Special State Evidence

## Role

You are the local code agent implementing **Prompt 09** for the PCC 100-Point UI/UX Mold Breaker Scorecard evidence automation track in the `RMF112018/hb-intel` repository.

You are implementing **safe, opt-in conditional evidence tooling** for evidence that requires special setup or special runtime context, including:

- edit-mode / edit-page read-only boundary evidence;
- high-zoom and short-height constrained-canvas evidence;
- drawer / modal / dialog observation evidence;
- unauthorized / low-permission state evidence;
- special state/source evidence requiring conditional setup;
- operator-pending records when conditional setup is absent.

You are **not** calculating a final score, not marking evidence captured, not marking hard stops passed/failed, not editing PCC runtime/source code, not modifying tenant data, and not committing live evidence artifacts automatically.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

---

## Critical Context

Prompt 01 established the PCC live Playwright harness and already added optional conditional env fields in:

```text
e2e/pcc-live/pcc-live.env.ts
```

Current repo truth already exposes these optional fields:

```text
PCC_LIVE_EDIT_PAGE_URL
PCC_LIVE_UNAUTHORIZED_STORAGE_STATE
PCC_LIVE_UNAUTHORIZED_PAGE_URL
PCC_LIVE_ENABLE_CONDITIONAL
```

and these parsed env properties:

```ts
editPageUrl?: string;
unauthorizedStorageStatePath?: string;
unauthorizedPageUrl?: string;
conditionalEnabled: boolean;
```

Do **not** add new env parsing in Prompt 09 unless local repo truth proves those fields are missing.

Prompt 02 established evidence registry and manifest infrastructure.

Prompt 03 established scorecard pillar/hard-stop traceability.

Prompt 04 established safe live page-object/surface-smoke tooling and hardened:

- live tab navigation;
- HTTPS enforcement;
- expected origin / hostname boundary checks;
- sanitized runtime output.

Prompt 05 established screenshot and DOM summary evidence tooling.

Prompt 06 established breakpoint/container/overflow/rowspan/touch evidence tooling.

Prompt 07 established accessibility/Axe/keyboard/focus/ARIA evidence tooling.

Prompt 08 established workflow/action/state/source/false-affordance evidence tooling.

The uploaded Prompt 09 objective was:

```text
Implement conditional lane for EV-57, EV-67, EV-68, EV-82, EV-94, EV-96, EV-102 and other state evidence requiring special setup. Use env vars for edit URL and unauthorized storage state. Record operator-pending when not configured.
```

This replacement prompt expands that objective into a safe, deterministic, repo-auditable implementation contract.

---

## Governing References

Use current repo truth from these references:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.workflow.types.ts
e2e/pcc-live/pcc-live.workflow-capture.ts
e2e/pcc-live/pcc-live.workflow-evidence-writer.ts
e2e/pcc-live/pcc-live.accessibility.types.ts
e2e/pcc-live/pcc-live.breakpoint.types.ts
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
```

Important current surface registry:

```text
project-home
team-and-access
documents
project-readiness
approvals
external-systems
control-center-settings
site-health
```

Critical distinction:

```text
Automate conditional evidence collection, inventory, and traceability.
Do not automatically calculate the final 100-point score.
Do not mark EVs captured without operator/expert review.
Do not mark hard stops passed or failed.
```

---

## Repo-Truth Gate Before Editing

Before editing, verify current checkout has Prompt 01–08 foundation.

Run/inspect enough to confirm:

```bash
git status --short
test -f playwright.pcc-live.config.ts
test -f e2e/pcc-live/pcc-live.env.ts
test -f e2e/pcc-live/pcc-live.surfaces.ts
test -f e2e/pcc-live/pcc-live.page-object.ts
test -f e2e/pcc-live/pcc-live.workflow.types.ts
test -f e2e/pcc-live/pcc-live.workflow-capture.ts
test -f e2e/pcc-live/pcc-live.workflow-evidence-writer.ts
test -f e2e/pcc-live/pcc-live.workflow.spec.ts
test -f e2e/pcc-live/pcc-live.accessibility.spec.ts
test -f e2e/pcc-live/pcc-live.breakpoint.spec.ts
test -f e2e/pcc-live/pcc-evidence.types.ts
test -f e2e/pcc-live/pcc-evidence.registry.ts
test -f docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Verify the existing env helper exposes conditional fields:

```bash
rg -n "PCC_LIVE_EDIT_PAGE_URL|PCC_LIVE_UNAUTHORIZED_STORAGE_STATE|PCC_LIVE_UNAUTHORIZED_PAGE_URL|PCC_LIVE_ENABLE_CONDITIONAL|conditionalEnabled|unauthorizedStorageStatePath|editPageUrl" e2e/pcc-live/pcc-live.env.ts
```

Inspect only as needed:

```bash
sed -n '1,260p' e2e/pcc-live/pcc-live.env.ts
sed -n '1,260p' e2e/pcc-live/pcc-live.page-object.ts
sed -n '1,260p' e2e/pcc-live/pcc-live.workflow-capture.ts
sed -n '1,260p' e2e/pcc-live/pcc-live.workflow-evidence-writer.ts
```

Stop and report if:

- any Prompt 01–08 foundation file is missing;
- the Prompt 04 page object no longer enforces HTTPS + expected origin + expected hostname;
- existing Prompt 09 conditional evidence files already exist and conflict with this design;
- implementation appears to require PCC runtime/source edits;
- conditional capture would require tenant mutation;
- conditional capture would require clicking live edit/save/approve/submit/export/import/sync controls;
- implementation would require Playwright config, `.gitignore`, dependency, or lockfile changes.

---

## Objective

Implement Prompt 09 conditional evidence tooling that can, when live env/storageState and special optional env vars are intentionally configured:

1. Navigate the normal PCC page safely using the Prompt 04 page object.
2. Record conditional setup status for each conditional lane:
   - configured and attempted;
   - configured but blocked;
   - not configured / operator-pending;
   - self-skipped due missing base live env/storageState.
3. Collect evidence for:
   - edit-mode or edit-page read-only boundary;
   - high zoom / short-height / constrained-canvas behavior;
   - drawer/modal/dialog state observation;
   - unauthorized-state observation using unauthorized storage state;
   - special state model evidence for unavailable, unauthorized, read-only, deferred, stale, missing-config, blocked, degraded, preview, mock/demo, and source-owned states;
   - HBI authority and false-affordance risk in conditional contexts where visible.
4. Write deterministic sanitized conditional evidence outputs.
5. Map initial support to:
   - `EV-57`
   - `EV-67`
   - `EV-68`
   - `EV-82`
   - `EV-94`
   - `EV-96`
   - `EV-102`
6. Optionally include related state/source EV refs only when clearly supported by the special condition evidence:
   - `EV-93`
   - `EV-95`
   - `EV-97`
   - `EV-98`
   - `EV-99`
   - `EV-100`
   - `EV-101`
   - `EV-103`
   - `EV-104`
   - `EV-105`
   - `EV-106`
7. Preserve review boundaries:
   - evidence output is operator-review pending;
   - unconfigured lanes are recorded as operator-pending, not failed;
   - conditional findings are `needs-review`, not final pass/fail;
   - no EV registry status changes;
   - no final score;
   - no hard-stop pass/fail decisions.

Conditional evidence can contain selectors, labels, state copy snippets, URLs, and runtime context. Do not persist full DOM HTML, full card body text, raw URLs with query strings, cookies, tokens, storageState content, request payloads, raw console output, or personal/contact data.

---

## Required Files To Add

Create these files unless repo truth shows equivalent files already exist:

```text
e2e/pcc-live/pcc-live.conditional.types.ts
e2e/pcc-live/pcc-live.conditional-capture.ts
e2e/pcc-live/pcc-live.conditional-evidence-writer.ts
e2e/pcc-live/pcc-live.conditional.spec.ts
```

Update these existing files only if needed:

```text
e2e/pcc-live/README.md
package.json
```

Do not create committed live conditional evidence artifacts in this prompt. Live artifacts should be written only when live tests are intentionally run with valid env/storageState and must remain uncommitted until operator review/scrubbing.

---

## Files Allowed To Modify

Allowed:

```text
e2e/pcc-live/pcc-live.conditional.types.ts
e2e/pcc-live/pcc-live.conditional-capture.ts
e2e/pcc-live/pcc-live.conditional-evidence-writer.ts
e2e/pcc-live/pcc-live.conditional.spec.ts
e2e/pcc-live/README.md
package.json
```

Do not modify:

```text
apps/project-control-center/src/**
apps/project-control-center/package.json
apps/project-control-center/config/**
apps/project-control-center/src/webparts/**
packages/**
backend/**
pnpm-lock.yaml
playwright.config.ts
playwright.kudos-live.config.ts
playwright.homepage-live.config.ts
playwright.pcc-live.config.ts
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
e2e/pcc-live/pcc-live.screenshot*.ts
e2e/pcc-live/pcc-live.breakpoint*.ts
e2e/pcc-live/pcc-live.accessibility*.ts
e2e/pcc-live/pcc-live.workflow*.ts
e2e/pcc-live/pcc-evidence*.ts
e2e/pcc-live/pcc-scorecard*.ts
docs/reference/**
docs/explanation/**
.gitignore
```

`package.json` may be changed only to add an optional opt-in root script. Do not change dependencies for Prompt 09.

If a forbidden file appears necessary, stop and report instead of editing.

---

## Non-Negotiable Safety Rules

Do **not**:

- click save, submit, approve, reject, delete, edit, publish, provision, sync, create, update, upload, import, export, award, assign, route, send, sign, commit, certify, or mutation controls;
- click External Platform launch links;
- click approval/rejection/submission controls;
- open external systems;
- run SharePoint/Graph/Procore/Sage/Autodesk/Document Crunch/Adobe Sign mutations;
- modify tenant data;
- commit storageState/session files;
- read or serialize storageState file contents;
- commit raw traces/videos/HARs;
- commit raw `test-results/` or raw `playwright-report/`;
- commit unsanitized console dumps;
- serialize cookies, tokens, storageState, request headers, localStorage, sessionStorage, personal data, raw DOM HTML, or auth/session context in JSON/markdown;
- mark any EV as `captured` in the registry;
- calculate the final 100-point score;
- mark hard stops as passed or failed.

Navigation remains limited to Prompt 04 safe tab navigation for the normal live lane. Conditional evidence is **inspection-only**. Keyboard tests may press `Tab`, `Shift+Tab`, `Escape`, and safe arrow navigation if needed. Do not press `Enter` or `Space` on unknown live controls.

Edit-mode evidence must never save, publish, submit, approve, sync, upload, route, or mutate tenant content.

Unauthorized evidence must use the configured unauthorized storage state file path only as a Playwright `storageState` input. Do not inspect, read, print, or serialize that file.

---

## Required EV Scope

Prompt 09 creates initial conditional support artifacts for:

```text
EV-57
EV-67
EV-68
EV-82
EV-94
EV-96
EV-102
```

Define a strict tuple:

```ts
export const PCC_CONDITIONAL_CORE_EVIDENCE_IDS = [
  'EV-57',
  'EV-67',
  'EV-68',
  'EV-82',
  'EV-94',
  'EV-96',
  'EV-102',
] as const;
```

Define optional related state/source refs:

```ts
export const PCC_CONDITIONAL_RELATED_EVIDENCE_IDS = [
  'EV-93',
  'EV-95',
  'EV-97',
  'EV-98',
  'EV-99',
  'EV-100',
  'EV-101',
  'EV-103',
  'EV-104',
  'EV-105',
  'EV-106',
] as const;
```

Define final exported combined tuple:

```ts
export const PCC_CONDITIONAL_EVIDENCE_IDS = [
  ...PCC_CONDITIONAL_CORE_EVIDENCE_IDS,
  ...PCC_CONDITIONAL_RELATED_EVIDENCE_IDS,
] as const;
```

Rules:

- Use only EV IDs from Prompt 02 `PccEvidenceId`.
- Add compile-time guards:
  - core tuple length is 7;
  - related tuple length is 11;
  - combined tuple length is 18;
  - combined tuple is unique;
  - combined tuple IDs are assignable to `PccEvidenceId`;
  - ID union does not widen to `string`.
- Do not include EV IDs outside the specified core/related list.
- Do not mark any of these EVs captured.

Use status wording such as:

```text
operator-pending
not-configured
configured-not-run
self-skipped
needs-review
initial-conditional-support
```

Do not use status wording such as:

```text
captured
passed
approved
complete
score-ready
Phase 4 ready
hard stop passed
hard stop failed
```

---

## Conditional Types Module

Create:

```text
e2e/pcc-live/pcc-live.conditional.types.ts
```

Required exported types/interfaces:

```ts
export type PccConditionalEvidenceId = (typeof PCC_CONDITIONAL_EVIDENCE_IDS)[number];

export type PccConditionalRunState =
  | 'completed'
  | 'self-skipped'
  | 'operator-pending'
  | 'writer-test-only';

export type PccConditionalLaneId =
  | 'edit-mode'
  | 'high-zoom'
  | 'short-height'
  | 'drawer-modal'
  | 'unauthorized'
  | 'special-state';

export type PccConditionalLaneStatus =
  | 'completed'
  | 'self-skipped'
  | 'not-configured'
  | 'configured-not-run'
  | 'blocked'
  | 'needs-review'
  | 'operator-pending';

export interface PccConditionalSetupStatus {
  laneId: PccConditionalLaneId;
  status: PccConditionalLaneStatus;
  configured: boolean;
  attempted: boolean;
  reason: string;
  evRefs: readonly PccEvidenceId[];
}

export interface PccConditionalStateObservation {
  laneId: PccConditionalLaneId;
  surfaceId?: PccLiveSurfaceId;
  stateKind:
    | 'edit-mode'
    | 'read-only'
    | 'preview'
    | 'deferred'
    | 'unavailable'
    | 'unauthorized'
    | 'stale'
    | 'missing-config'
    | 'blocked'
    | 'degraded'
    | 'drawer'
    | 'modal'
    | 'dialog'
    | 'high-zoom'
    | 'short-height'
    | 'mock-demo'
    | 'source-owned'
    | 'unknown';
  observed: boolean;
  selector?: string;
  snippet?: string;
  hasImpact: boolean;
  hasOwner: boolean;
  hasNextStep: boolean;
  needsReview: boolean;
}

export interface PccConditionalLayoutObservation {
  laneId: PccConditionalLaneId;
  surfaceId?: PccLiveSurfaceId;
  viewportWidth: number;
  viewportHeight: number;
  zoomOrScaleLabel: string;
  horizontalOverflowDetected: boolean;
  clippedElementCount: number;
  primaryActionVisible: boolean;
  activePanelVisible: boolean;
  needsReview: boolean;
}

export interface PccConditionalFocusObservation {
  laneId: PccConditionalLaneId;
  surfaceId?: PccLiveSurfaceId;
  dialogCount: number;
  modalCount: number;
  drawerCount: number;
  focusableCount: number;
  focusRiskCount: number;
  status: PccConditionalLaneStatus;
  notes: string[];
}

export interface PccConditionalAuthObservation {
  laneId: 'unauthorized';
  attemptedUrl?: string;
  unauthorizedStorageConfigured: boolean;
  pageLoaded: boolean;
  unauthorizedStateObserved: boolean;
  signInRedirectObserved: boolean;
  accessDeniedObserved: boolean;
  pccContentVisible: boolean;
  needsReview: boolean;
  notes: string[];
}

export interface PccConditionalEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  selfSkipped: boolean;
  runState: PccConditionalRunState;
  evRefs: readonly PccEvidenceId[];
  setup: PccConditionalSetupStatus[];
  stateObservations: PccConditionalStateObservation[];
  layoutObservations: PccConditionalLayoutObservation[];
  focusObservations: PccConditionalFocusObservation[];
  authObservations: PccConditionalAuthObservation[];
  summary: {
    totalLanes: number;
    completedLanes: number;
    operatorPendingLanes: number;
    notConfiguredLanes: number;
    stateObservationCount: number;
    layoutObservationCount: number;
    focusObservationCount: number;
    authObservationCount: number;
    needsReviewCount: number;
    warningCount: number;
  };
  warnings: string[];
  disclaimer: string;
}
```

You may add helper types if useful, but keep the observation model metadata-only and sanitized.

---

## Conditional Capture Module

Create:

```text
e2e/pcc-live/pcc-live.conditional-capture.ts
```

Required behavior:

1. Accept:
   - Playwright `Browser`;
   - Playwright `Page`;
   - Prompt 04 `PccLivePageObject`;
   - `PccLiveEnv`;
   - eight surfaces;
   - optional capture limits.
2. Respect the conditional gate:
   - if base live env is missing, the live test self-skips via `skipIfMissingPccLiveEnv(test)`;
   - if base live env is ready but `env.conditionalEnabled !== true`, return/write operator-pending lane setup records and do not perform special conditional capture;
   - if `env.conditionalEnabled === true`, attempt only lanes with required setup present.
3. For each lane, record setup status:
   - configured;
   - attempted;
   - completed / not-configured / blocked / operator-pending / needs-review;
   - sanitized reason.
4. Do not modify tenant data.
5. Do not click mutation controls.

### Lane: Edit Mode / Edit URL

Required env:

```text
PCC_LIVE_ENABLE_CONDITIONAL=true
PCC_LIVE_EDIT_PAGE_URL=<tenant-hosted edit-mode or special-state page URL>
```

Behavior:

- If `editPageUrl` is absent, record lane as `not-configured` / `operator-pending`.
- If present:
  - navigate to the edit page URL using the authenticated page or a new page in the same context;
  - enforce HTTPS + same tenant hostname as `env.siteUrl`;
  - inspect only;
  - do not click Save, Publish, Submit, Sync, Upload, Edit, Delete, Approve, Reject, or mutation controls.
- Record:
  - edit-mode/read-only/preview/deferred/unavailable state signals;
  - enabled mutation-looking controls;
  - disabled controls with/without reasons;
  - false-affordance needs-review count;
  - source-owned/read-only boundary language.

### Lane: High Zoom

Required env:

```text
PCC_LIVE_ENABLE_CONDITIONAL=true
```

No extra URL required beyond base page URL.

Behavior:

- Use the normal `env.pageUrl`.
- Use viewport/device settings that approximate high zoom/constrained canvas without modifying tenant data.
- Recommended safe approach:
  - `page.setViewportSize({ width: 1024, height: 768 })`;
  - use `page.evaluate(() => { document.documentElement.style.zoom = '200%'; })` only as a client-side visual simulation for evidence, then restore it after capture.
- If CSS zoom is used:
  - record that it is a simulated high-zoom lane, not browser-native zoom proof;
  - do not claim pass/fail.
- Inspect:
  - horizontal overflow;
  - clipped elements;
  - active panel visibility;
  - primary action visibility.
- Do not persist screenshots unless metadata-only path references are explicitly implemented with operator-review required. Prefer no screenshot files in Prompt 09.

### Lane: Short Height

Required env:

```text
PCC_LIVE_ENABLE_CONDITIONAL=true
```

No extra URL required beyond base page URL.

Behavior:

- Use the normal `env.pageUrl`.
- Set viewport to a constrained height, for example:
  - `{ width: 1366, height: 560 }`
- Inspect:
  - primary action visibility;
  - active panel visibility;
  - vertical clipping;
  - horizontal overflow;
  - sticky/toolbar/drawer obstruction if observable.
- Record as evidence; do not pass/fail.

### Lane: Drawer / Modal / Dialog

Required env:

```text
PCC_LIVE_ENABLE_CONDITIONAL=true
```

No extra URL required beyond base page URL unless repo truth documents a safe URL.

Behavior:

- Inspect existing visible:
  - `[role="dialog"]`
  - `[aria-modal="true"]`
  - `[data-pcc-drawer]`
  - `[data-pcc-modal]`
  - `[data-pcc-dialog]`
- Do **not** open drawers/modals unless there is a clearly safe non-mutating control with stable PCC marker such as:
  - `[data-pcc-open-preview]`
  - `[data-pcc-preview-trigger]`
  - `[data-pcc-open-drawer]`
- If no drawer/modal is visible and no safe preview trigger exists, record `not-observed` / `operator-pending`, not failure.
- If observed, record:
  - dialog count;
  - modal count;
  - drawer count;
  - focusable count;
  - focus-risk count;
  - sanitized notes.

### Lane: Unauthorized

Required env:

```text
PCC_LIVE_ENABLE_CONDITIONAL=true
PCC_LIVE_UNAUTHORIZED_STORAGE_STATE=<path to unauthorized or low-permission storageState>
```

Optional env:

```text
PCC_LIVE_UNAUTHORIZED_PAGE_URL=<specific page URL to test unauthorized state>
```

Behavior:

- If unauthorized storage state path is absent, record lane as `not-configured` / `operator-pending`.
- If path is present but file does not exist, record lane as `blocked`, do not read/print file contents.
- If present and exists:
  - create a new Playwright context using that `storageState` path;
  - navigate to `env.unauthorizedPageUrl ?? env.pageUrl`;
  - enforce HTTPS + same tenant hostname as `env.siteUrl`;
  - inspect whether unauthorized/access-denied/sign-in state is shown;
  - inspect whether PCC content is visible or not visible;
  - do not click sign-in or permission request controls.
- Record:
  - unauthorized state observed;
  - sign-in redirect observed;
  - access denied observed;
  - PCC content visible;
  - needsReview.
- Do not serialize the storage state path or contents.

### Lane: Special State

Required env:

```text
PCC_LIVE_ENABLE_CONDITIONAL=true
```

Optional URL:

```text
PCC_LIVE_EDIT_PAGE_URL
```

Behavior:

- Inspect the base page and/or edit page URL when configured for state terms:
  - loading;
  - empty;
  - error;
  - blocked;
  - degraded;
  - preview;
  - read-only;
  - deferred;
  - unavailable;
  - unauthorized;
  - stale;
  - missing-config;
  - mock-demo;
  - source-owned.
- Record observed/not-observed metadata, snippets sanitized/truncated, hasImpact/hasOwner/hasNextStep booleans.
- Do not force state changes through UI controls.

---

## Conditional Evidence Writer

Create:

```text
e2e/pcc-live/pcc-live.conditional-evidence-writer.ts
```

Required output files:

```text
pcc-live-conditional-evidence.json
pcc-live-conditional-evidence.md
pcc-live-conditional-setup-summary.json
pcc-live-conditional-state-summary.json
pcc-live-conditional-layout-summary.json
pcc-live-conditional-focus-summary.json
pcc-live-conditional-auth-summary.json
```

Write these under the provided run output directory:

```text
<PCC_EVIDENCE_OUTPUT_DIR>/conditional-<run-id>/
```

Do not write under `test-results/` or `playwright-report/`.

Evidence JSON must include:

```text
runId
generatedAtIso
tenantSiteUrl
tenantPageUrl
expectedPackageVersion
selfSkipped
runState
evRefs
setup
stateObservations
layoutObservations
focusObservations
authObservations
summary
warnings
disclaimer
```

Required disclaimer:

```text
This output is conditional edit-mode, high-zoom, drawer/modal, unauthorized, and special-state evidence support for EV-57, EV-67, EV-68, EV-82, EV-94, EV-96, EV-102, and related state/source EVs only. It is not a final scorecard result and does not mark any EV captured without operator review.
```

Markdown summary must include:

```text
run ID
generated timestamp
tenant site/page
expected package version
EV refs
lane setup table
state observation count
layout observation count
focus observation count
auth observation count
operator-pending lane count
not-configured lane count
needs-review count
warning count
operator-review reminder
not-final-scoring disclaimer
```

Sanitization requirements:

- Reuse or duplicate conservative Prompt 04/05/06/07/08 sanitization logic.
- Sanitize all free-text fields written to JSON/markdown.
- Preserve safe curated repo/output paths.
- Exclude raw Playwright/auth/session paths from artifact references if artifact references are included.
- Do not serialize cookies, tokens, storageState content, storageState file paths, request/response payloads, raw console dumps, headers, raw DOM HTML, names/emails/phone numbers, or full text content.
- For unauthorized lane, only serialize booleans/status/reason; do not serialize the storageState path.

---

## Conditional Spec

Create:

```text
e2e/pcc-live/pcc-live.conditional.spec.ts
```

Required tests:

### 1. Conditional EV tuple is valid

No live env required.

Assert:

- core tuple contains exactly:
  - `EV-57`, `EV-67`, `EV-68`, `EV-82`, `EV-94`, `EV-96`, `EV-102`
- related tuple contains exactly:
  - `EV-93`, `EV-95`, `EV-97`, `EV-98`, `EV-99`, `EV-100`, `EV-101`, `EV-103`, `EV-104`, `EV-105`, `EV-106`
- combined tuple has length 18;
- every tuple ID exists in `REQUIRED_PCC_EVIDENCE_IDS`;
- no duplicate EV IDs;
- no EV outside Prompt 09 scope.

### 2. Conditional writer preserves sanitized output policy

No live env required.

Use temp directory and sample fake conditional evidence.

Assert:

- writer produces all expected JSON/markdown files;
- safe curated path remains present if included;
- unsafe strings are not present in all generated files:
  - email address;
  - phone number;
  - token-like blob;
  - query string;
  - raw DOM HTML snippet such as `<button`;
  - storageState path or literal;
  - unauthorized storage file path;
  - `cookie`;
  - `token`;
  - `session`;
  - `.auth`;
  - `test-results`;
  - `playwright-report`;
  - `trace.zip`;
  - `video.webm`;
  - `network.har`;
  - `hard stop passed`;
  - `hard stop failed`;
  - `score-ready`;
  - `Phase 4 ready`;
- redaction markers appear where appropriate;
- disclaimer appears;
- no EV is represented as captured;
- no hard stop is represented as passed/failed.

### 3. Conditional capture helper records operator-pending when conditional disabled

No live tenant env required.

Use a fake/minimal `PccLiveEnv` object with:

```ts
conditionalEnabled: false
```

and a synthetic page/page object where needed.

Assert:

- each lane setup status is `operator-pending` or `not-configured`;
- `attempted` is false for special setup lanes;
- no tenant navigation beyond safe synthetic setup is required;
- no evidence is represented as captured.

### 4. Synthetic high-zoom / short-height / drawer / special-state boundaries

No live tenant env required.

Use `page.setContent(...)` with synthetic PCC-like DOM containing:

- active surface panel;
- primary action;
- clipped/overflow fixture;
- read-only/preview/deferred/unavailable/blocked/degraded/stale/missing-config/mock-demo/source-owned state terms;
- visible role dialog/modal sample;
- safe preview/drawer marker if needed.

Assert:

- high-zoom/short-height layout observations are metadata-only;
- drawer/modal observation records counts/focus risk without clicking mutation controls;
- state observations are observed with sanitized snippets;
- no raw body text, email, phone, query string, storageState path, or raw HTML is persisted.

### 5. Unauthorized lane synthetic/not-configured behavior

No live tenant env required.

Use fake env combinations:

- no unauthorized storage state path;
- path configured but intentionally missing.

Assert:

- missing path records `not-configured` / `operator-pending`;
- nonexistent path records `blocked`;
- storageState file path is not serialized in output;
- no file content is read.

### 6. Live conditional capture self-skips or operator-pending without conditional env

Live env required only if configured.

Use:

```ts
skipIfMissingPccLiveEnv(test)
```

When base live env is missing, this test self-skips clearly.

When base live env is ready but `PCC_LIVE_ENABLE_CONDITIONAL` is not `true`:

- write conditional evidence with setup statuses as operator-pending/not-configured;
- do not perform special lanes;
- assert output files exist;
- assert no raw DOM HTML/full text/storageState path output;
- assert no `captured`/hard-stop pass/fail wording.

When base live env is ready and `PCC_LIVE_ENABLE_CONDITIONAL=true`:

- attempt only configured lanes:
  - base page lanes: high zoom, short height, drawer/modal, special state;
  - edit lane only if `PCC_LIVE_EDIT_PAGE_URL` is present;
  - unauthorized lane only if `PCC_LIVE_UNAUTHORIZED_STORAGE_STATE` is present.
- write output files;
- assert no raw DOM HTML/full text/storageState path output;
- assert no `captured`/hard-stop pass/fail wording.

Important:

- Do not stage generated evidence artifacts.
- Closeout should report output directory path only plus counts.
- Do not print storageState path, raw state text, URLs with query strings, or full issue payloads.

---

## Optional Root Script

If materially useful, add this opt-in-only script to root `package.json`:

```json
"pcc:e2e:conditional": "playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.conditional.spec.ts"
```

Do not wire it into:

```text
test
e2e
build
CI
Turbo defaults
```

Do not modify `pnpm-lock.yaml`.

If `package.json` is not changed, omit it from changed files and validation targets.

---

## README Update Requirements

Update `e2e/pcc-live/README.md` with a concise Prompt 09 section if needed.

Include:

```text
conditional evidence purpose
PCC_LIVE_ENABLE_CONDITIONAL gate
PCC_LIVE_EDIT_PAGE_URL usage
PCC_LIVE_UNAUTHORIZED_STORAGE_STATE usage without serializing its path or contents
PCC_LIVE_UNAUTHORIZED_PAGE_URL usage
operator-pending behavior when conditional setup is absent
edit-mode inspection-only rule
high-zoom simulation caveat
drawer/modal observation behavior
unauthorized lane safety behavior
EV-57/67/68/82/94/96/102 and related state/source EV support scope
operator-review requirement before committing evidence
raw DOM/full-text/storageState prohibition
PCC_EVIDENCE_OUTPUT_DIR usage
run command
not-final-scoring disclaimer
```

Do not remove Prompt 01–08 safety posture.

---

## Validation Commands

Run and report:

```bash
git status --short
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.conditional.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec prettier --check --ignore-unknown e2e/pcc-live package.json
git diff --check
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm install --frozen-lockfile
```

If `package.json` is not changed, it is acceptable to omit `package.json` from the Prettier target.

Do not run special conditional live capture unless valid `PCC_LIVE_*` env, storageState, and intentional `PCC_LIVE_ENABLE_CONDITIONAL=true` are configured.

If a live conditional run is performed, closeout must include:

```text
whether base live env was ready or self-skipped
whether conditional gate was enabled
whether edit URL lane was configured
whether unauthorized lane was configured
whether evidence files were written
output directory path only
completed lane count
operator-pending lane count
not-configured lane count
state observation count
layout observation count
focus observation count
auth observation count
needs-review count
warning count
no raw DOM HTML
no full text content
no storageState path/content
no cookies/tokens/storageState
```

Do not print storageState paths.

---

## Acceptance Criteria

Prompt 09 is complete only when:

- conditional EV tuples are strict and valid;
- conditional capture module exists;
- conditional evidence writer exists;
- conditional spec exists and self-skips without base env/storageState;
- conditional-disabled state records operator-pending/not-configured instead of failing;
- edit-mode lane records not-configured/operator-pending unless edit URL is configured;
- unauthorized lane records not-configured/operator-pending unless unauthorized storage state is configured;
- unauthorized lane never prints or serializes storageState path/content;
- high-zoom/short-height lanes are evidence-only and do not claim pass/fail;
- drawer/modal lane records observed/not-observed metadata without mutation;
- special state lane records state/source evidence without forcing UI state changes;
- writer produces all expected metadata/report files in tests;
- writer excludes unsafe raw/auth/session/DOM/full-text/storageState content from JSON/markdown;
- evidence artifacts are not staged/committed automatically;
- Prompt 08 workflow tests still pass;
- Prompt 07 accessibility tests still pass;
- Prompt 06 breakpoint tests still pass;
- Prompt 05 screenshot tests still pass;
- Prompt 04 surface-smoke tests still pass;
- Prompt 02 registry tests still pass;
- Prompt 03 traceability tests still pass;
- no EV is marked captured;
- no hard stop is marked passed/failed;
- no final score is calculated or implied;
- no PCC runtime/source files are modified;
- `pnpm-lock.yaml` is unchanged.

---

## Stop Conditions

Stop and report instead of continuing if:

- Prompt 01–08 foundation files are missing;
- Prompt 04 URL-boundary/sanitization hardening is missing;
- Prompt 05/06/07/08 writer safety posture is missing;
- existing Prompt 09 files conflict with this design;
- implementation requires PCC runtime/source edits;
- implementation requires Playwright config edits;
- implementation requires `.gitignore` changes;
- implementation requires dependency or lockfile changes;
- conditional capture would require clicking live mutation controls;
- External Platforms validation would require opening external links;
- Approvals validation would require approve/reject/submit actions;
- unauthorized validation would require reading/printing storageState contents;
- any writer would serialize cookies, storageState path/content, tokens, raw traces/videos/HARs, raw Playwright outputs, request/response payloads, raw console dumps, raw DOM HTML, names/emails/phone numbers, or unsanitized full text output;
- any implementation attempts score calculation or hard-stop pass/fail decisions.

---

## Required Closeout Response

Return exactly this structure:

```markdown
Prompt completed.

Files changed:
- <path>
- <path>

Validation:
- `git status --short` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.conditional.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts --list` — <result>
- `pnpm exec prettier --check --ignore-unknown e2e/pcc-live package.json` — <result or adjusted command with reason>
- `git diff --check` — <result>
- `pnpm --filter @hbc/spfx-project-control-center check-types` — <result>
- `pnpm --filter @hbc/spfx-project-control-center test` — <result>
- `pnpm install --frozen-lockfile` — <result>

Evidence / scorecard impact:
- Conditional setup/status evidence tooling established.
- Edit-mode/read-only boundary evidence support established.
- High-zoom and short-height evidence support established.
- Drawer/modal/dialog observation evidence support established.
- Unauthorized-state evidence support established.
- Special state/source evidence support established.
- Initial EV-57, EV-67, EV-68, EV-82, EV-94, EV-96, EV-102 evidence support established.
- Related state/source EV evidence support established where applicable.
- Evidence remains operator-review pending.
- No final 100-point score calculated.
- No hard stop marked passed/failed.

Safety confirmation:
- No tenant mutation.
- Live conditional capture <ran/self-skipped/operator-pending/not run> with reason.
- No storageState path/content committed.
- No raw Playwright artifacts committed.
- No raw console dumps committed.
- No raw DOM HTML or full text content committed.
- No conditional evidence artifacts staged/committed automatically.
- No PCC runtime source modified.
- `pnpm-lock.yaml` unchanged.
- No EV marked captured.

Residual risks or pending items:
- <items>
```
