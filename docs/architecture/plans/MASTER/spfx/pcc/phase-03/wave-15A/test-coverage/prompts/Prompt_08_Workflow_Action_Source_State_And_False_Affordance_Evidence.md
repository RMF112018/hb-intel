# Prompt 08 — PCC Workflow, Action, Source, State, and False-Affordance Evidence

## Role

You are the local code agent implementing **Prompt 08** for the PCC 100-Point UI/UX Mold Breaker Scorecard evidence automation track in the `RMF112018/hb-intel` repository.

You are implementing **safe, opt-in workflow/state/source evidence tooling** for workflow clarity, primary actions, priority ordering, disabled/read-only/deferred/preview honesty, false-affordance risk, source-of-record visibility, External Platforms launch posture, Approvals queue posture, HBI authority language, cross-module continuity, owners/responsibilities, mock/demo labeling, and conditional state limits.

You are **not** calculating a final score, not marking evidence captured, not marking hard stops passed/failed, not editing PCC runtime/source code, and not committing live evidence artifacts automatically.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

---

## Critical Context

Prompt 01 established the PCC live Playwright harness.

Prompt 02 established evidence registry and manifest infrastructure.

Prompt 03 established scorecard pillar/hard-stop traceability.

Prompt 04 established safe live page-object/surface-smoke tooling and hardened:

- live tab navigation;
- URL origin/hostname boundary checks;
- sanitized baseline EV-52 / EV-55 output.

Prompt 05 established screenshot and DOM summary evidence tooling.

Prompt 06 established breakpoint/container/overflow/rowspan/touch evidence tooling.

Prompt 07 established accessibility/Axe/keyboard/focus/ARIA evidence tooling.

The attached Prompt 08 objective was:

```text
Implement workflow/state/source evidence tests for EV-83..EV-106. Cover primary actions, priorities, disabled/read-only/deferred/preview honesty, External Platforms launch posture, Approvals queues, HBI/command, cross-module continuity, owners, source-of-record, mock/demo labels, and conditional state limits.
```

This updated prompt expands that objective into a safe, deterministic, repo-auditable implementation contract.

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
e2e/pcc-live/pcc-live.accessibility.types.ts
e2e/pcc-live/pcc-live.accessibility.spec.ts
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
```

Important current repo-truth context:

- `PCC_LIVE_SURFACES` defines the eight live PCC surfaces:
  - `project-home`
  - `team-and-access`
  - `documents`
  - `project-readiness`
  - `approvals`
  - `external-systems`
  - `control-center-settings`
  - `site-health`
- `PccLivePageObject` already enforces safe tab navigation, HTTPS, expected origin, and expected hostname.
- The scorecard explicitly treats workflow/action clarity, read-only workflow honesty, false affordance, state/source clarity, and HBI authority as scoring/hard-stop concerns.
- `pcc-evidence.registry.ts` maps EV-85..EV-92 to interaction/workflow, EV-93..EV-99 to state model, and EV-100..EV-106 to source-of-record; EV-83..EV-84 remain part of the accessibility/interaction transition and should be supported without altering the registry.

Critical distinction:

```text
Automate workflow/state/source evidence collection, inventory, and traceability.
Do not automatically calculate the final 100-point score.
Do not mark EVs captured without operator/expert review.
Do not mark hard stops passed or failed.
```

---

## Repo-Truth Gate Before Editing

Before editing, verify current checkout has Prompt 01–07 foundation.

Run/inspect enough to confirm:

```bash
git status --short
test -f playwright.pcc-live.config.ts
test -f e2e/pcc-live/pcc-live.env.ts
test -f e2e/pcc-live/pcc-live.surfaces.ts
test -f e2e/pcc-live/pcc-live.page-object.ts
test -f e2e/pcc-live/pcc-live.accessibility.types.ts
test -f e2e/pcc-live/pcc-live.accessibility.spec.ts
test -f e2e/pcc-live/pcc-evidence.types.ts
test -f e2e/pcc-live/pcc-evidence.registry.ts
test -f e2e/pcc-live/pcc-scorecard.traceability.ts
test -f docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Inspect only as needed:

```bash
sed -n '1,260p' e2e/pcc-live/pcc-live.page-object.ts
sed -n '1,220p' e2e/pcc-live/pcc-live.surfaces.ts
sed -n '1,260p' e2e/pcc-live/pcc-evidence.registry.ts
sed -n '1,260p' e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts
cat package.json
```

Stop and report if:

- any Prompt 01–07 foundation file is missing;
- the Prompt 04 page object no longer enforces HTTPS + expected origin + expected hostname;
- existing Prompt 08 workflow/state/source files already exist and conflict with this design;
- implementation appears to require PCC runtime/source edits;
- live workflow evidence capture would require clicking mutation controls.

---

## Objective

Implement Prompt 08 workflow/state/source evidence tooling that can, when live env/storageState is intentionally configured:

1. Navigate all eight PCC surfaces using the Prompt 04 safe page object.
2. Inspect each active surface panel for:
   - primary action clarity;
   - priority content before reference content;
   - action labels and action posture;
   - disabled-action and disabled-reason clarity;
   - read-only / preview / deferred / unavailable / stale / unauthorized / degraded honesty;
   - false-affordance risk;
   - source-of-record and data-confidence language;
   - HBI/command authority boundaries;
   - owner/responsibility signals;
   - mock/demo/fixture/stub labels;
   - conditional-state limitations and missing-config/blocked-state hints;
   - cross-module continuity signals;
   - External Platforms launch-only posture;
   - Approvals queue posture.
3. Write deterministic sanitized workflow evidence outputs.
4. Map initial support to:
   - `EV-83` through `EV-106`.
5. Preserve review boundaries:
   - evidence output is operator-review pending;
   - false-affordance and state/source issues are `needs-review` findings, not final pass/fail;
   - no EV registry status changes;
   - no final score;
   - no hard-stop pass/fail decisions.

Workflow evidence can contain selectors, labels, copy snippets, link destinations, and state terms. Do not persist full DOM HTML, full card body text, raw URLs with query strings, cookies, tokens, storageState, request payloads, raw console output, or personal/contact data.

---

## Required Files To Add

Create these files unless repo truth shows equivalent files already exist:

```text
e2e/pcc-live/pcc-live.workflow.types.ts
e2e/pcc-live/pcc-live.workflow-capture.ts
e2e/pcc-live/pcc-live.workflow-evidence-writer.ts
e2e/pcc-live/pcc-live.workflow.spec.ts
```

Update these existing files only if needed:

```text
e2e/pcc-live/README.md
package.json
```

Do not create committed live workflow evidence artifacts in this prompt. Live artifacts should be written only when live tests are intentionally run with valid env/storageState and must remain uncommitted until operator review/scrubbing.

---

## Files Allowed To Modify

Allowed:

```text
e2e/pcc-live/pcc-live.workflow.types.ts
e2e/pcc-live/pcc-live.workflow-capture.ts
e2e/pcc-live/pcc-live.workflow-evidence-writer.ts
e2e/pcc-live/pcc-live.workflow.spec.ts
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
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
e2e/pcc-live/pcc-live.screenshot.types.ts
e2e/pcc-live/pcc-live.screenshot-capture.ts
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
e2e/pcc-live/pcc-live.screenshot.spec.ts
e2e/pcc-live/pcc-live.breakpoint.types.ts
e2e/pcc-live/pcc-live.breakpoint-matrix.ts
e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint.spec.ts
e2e/pcc-live/pcc-live.accessibility.types.ts
e2e/pcc-live/pcc-live.accessibility-capture.ts
e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts
e2e/pcc-live/pcc-live.accessibility.spec.ts
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-evidence.manifest.ts
e2e/pcc-live/pcc-evidence.registry.spec.ts
e2e/pcc-live/pcc-scorecard.types.ts
e2e/pcc-live/pcc-scorecard.model.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
e2e/pcc-live/pcc-scorecard.traceability.spec.ts
docs/reference/**
docs/explanation/**
.gitignore
```

`package.json` may be changed only to add an optional opt-in root script. Do not change dependencies for Prompt 08.

If a forbidden file appears necessary, stop and report instead of editing.

---

## Non-Negotiable Safety Rules

Do **not**:

- click save, submit, approve, reject, delete, edit, publish, provision, sync, create, update, submit, upload, import, export, award, assign, route, send, or mutation controls;
- click External Platform launch links;
- click Procore, Sage, SharePoint, Autodesk, Document Crunch, Adobe Sign, HBI commit, approval, or sign-off controls;
- run SharePoint/Graph/Procore/Sage/Autodesk/Document Crunch/Adobe Sign mutations;
- modify tenant data;
- commit storageState/session files;
- commit raw traces/videos/HARs;
- commit raw `test-results/` or raw `playwright-report/`;
- commit unsanitized console dumps;
- serialize cookies, tokens, storageState, request headers, localStorage, sessionStorage, personal data, raw DOM HTML, or auth/session context in JSON/markdown;
- mark any EV as `captured` in the registry;
- calculate the final 100-point score;
- mark hard stops as passed or failed.

Navigation remains limited to Prompt 04 safe tab navigation. Workflow evidence is **inspection-only**. Keyboard tests may press `Tab`, `Shift+Tab`, `Escape`, and safe arrow navigation if needed. Do not press `Enter` or `Space` on unknown live controls.

---

## Required EV Scope

Prompt 08 creates initial support artifacts for:

```text
EV-83
EV-84
EV-85
EV-86
EV-87
EV-88
EV-89
EV-90
EV-91
EV-92
EV-93
EV-94
EV-95
EV-96
EV-97
EV-98
EV-99
EV-100
EV-101
EV-102
EV-103
EV-104
EV-105
EV-106
```

Define a strict tuple:

```ts
export const PCC_WORKFLOW_EVIDENCE_IDS = [
  'EV-83',
  'EV-84',
  'EV-85',
  'EV-86',
  'EV-87',
  'EV-88',
  'EV-89',
  'EV-90',
  'EV-91',
  'EV-92',
  'EV-93',
  'EV-94',
  'EV-95',
  'EV-96',
  'EV-97',
  'EV-98',
  'EV-99',
  'EV-100',
  'EV-101',
  'EV-102',
  'EV-103',
  'EV-104',
  'EV-105',
  'EV-106',
] as const;
```

Rules:

- Use only EV IDs from Prompt 02 `PccEvidenceId`.
- Add compile-time guard that the tuple IDs are assignable to `PccEvidenceId`.
- Add compile-time guards:
  - tuple length is 24;
  - tuple is unique;
  - tuple ID union does not widen to `string`.
- Do not include EV IDs outside the specified list.
- Do not mark any of these EVs captured.
- Use status wording such as:
  - `operator-review-pending`;
  - `initial-workflow-state-source-support`;
  - `workflow-inventory-ready`;
  - `state-source-inventory-ready`;
  - `needs-review`.

Do not use status wording such as:

```text
captured
passed
approved
complete
score-ready
Phase 4 ready
```

---

## Workflow Types Module

Create:

```text
e2e/pcc-live/pcc-live.workflow.types.ts
```

Required exported types/interfaces:

```ts
export type PccWorkflowEvidenceId = (typeof PCC_WORKFLOW_EVIDENCE_IDS)[number];

export type PccWorkflowRunState = 'completed' | 'self-skipped' | 'writer-test-only';

export type PccWorkflowObservationStatus =
  | 'observed'
  | 'not-observed'
  | 'needs-review'
  | 'operator-review-pending';

export type PccActionRiskLevel = 'none-observed' | 'low' | 'medium' | 'high' | 'needs-review';

export type PccWorkflowActionKind =
  | 'navigation'
  | 'launch'
  | 'filter'
  | 'search'
  | 'preview'
  | 'read-only'
  | 'approve'
  | 'reject'
  | 'submit'
  | 'save'
  | 'delete'
  | 'sync'
  | 'export'
  | 'unknown';

export interface PccWorkflowActionObservation {
  surfaceId: PccLiveSurfaceId;
  selector: string;
  tagName: string;
  role?: string;
  kind: PccWorkflowActionKind;
  enabled: boolean;
  disabled: boolean;
  ariaDisabled: boolean;
  hasDisabledReason: boolean;
  hasAccessibleName: boolean;
  labelSnippet?: string;
  destinationHost?: string;
  destinationPath?: string;
  destinationIsExternal: boolean;
  mutationKeywordDetected: boolean;
  readOnlyOrPreviewContext: boolean;
  falseAffordanceRisk: PccActionRiskLevel;
  needsReview: boolean;
}

export interface PccWorkflowPriorityObservation {
  surfaceId: PccLiveSurfaceId;
  primaryActionCount: number;
  priorityCardCount: number;
  referenceCardCount: number;
  firstPrimaryActionIndex?: number;
  firstReferenceCardIndex?: number;
  priorityBeforeReference: boolean;
  needsReview: boolean;
  notes: string[];
}

export interface PccWorkflowStateObservation {
  surfaceId: PccLiveSurfaceId;
  stateKind:
    | 'loading'
    | 'empty'
    | 'error'
    | 'blocked'
    | 'degraded'
    | 'preview'
    | 'read-only'
    | 'deferred'
    | 'unavailable'
    | 'unauthorized'
    | 'stale'
    | 'missing-config'
    | 'mock-demo'
    | 'fixture'
    | 'unknown';
  observed: boolean;
  selector?: string;
  copySnippet?: string;
  hasImpact: boolean;
  hasOwner: boolean;
  hasNextStep: boolean;
  needsReview: boolean;
}

export interface PccSourceOfRecordObservation {
  surfaceId: PccLiveSurfaceId;
  sourceSystem:
    | 'PCC'
    | 'SharePoint'
    | 'Procore'
    | 'Sage'
    | 'Autodesk'
    | 'Document Crunch'
    | 'Adobe Sign'
    | 'HBI'
    | 'Fixture'
    | 'Mock'
    | 'Unknown';
  observed: boolean;
  selector?: string;
  ownershipSnippet?: string;
  readOnlyBoundaryObserved: boolean;
  writeAuthorityClaimObserved: boolean;
  needsReview: boolean;
}

export interface PccHbiAuthorityObservation {
  surfaceId: PccLiveSurfaceId;
  selector?: string;
  hbiMentionObserved: boolean;
  commandSearchObserved: boolean;
  advisoryLanguageObserved: boolean;
  mutationAuthorityClaimObserved: boolean;
  riskyKeywordCount: number;
  needsReview: boolean;
}

export interface PccExternalPlatformObservation {
  surfaceId: PccLiveSurfaceId;
  launchSurfaceObserved: boolean;
  launchOnlyLanguageObserved: boolean;
  externalLinkCount: number;
  unsafeExecutableActionCount: number;
  destinationHosts: string[];
  needsReview: boolean;
}

export interface PccApprovalsQueueObservation {
  surfaceId: PccLiveSurfaceId;
  queueObserved: boolean;
  approveActionCount: number;
  rejectActionCount: number;
  submitActionCount: number;
  readOnlyOrPreviewBoundaryObserved: boolean;
  disabledReasonCount: number;
  riskyExecutableActionCount: number;
  needsReview: boolean;
}

export interface PccContinuityObservation {
  surfaceId: PccLiveSurfaceId;
  ownerSignalCount: number;
  responsibilitySignalCount: number;
  crossSurfaceReferenceCount: number;
  lifecycleLanguageCount: number;
  nextActionLanguageCount: number;
  needsReview: boolean;
}

export interface PccWorkflowSurfaceEvidence {
  surfaceId: PccLiveSurfaceId;
  label: string;
  actions: PccWorkflowActionObservation[];
  priority: PccWorkflowPriorityObservation;
  states: PccWorkflowStateObservation[];
  sources: PccSourceOfRecordObservation[];
  hbiAuthority: PccHbiAuthorityObservation;
  externalPlatform?: PccExternalPlatformObservation;
  approvalsQueue?: PccApprovalsQueueObservation;
  continuity: PccContinuityObservation;
  warnings: string[];
}

export interface PccWorkflowEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  selfSkipped: boolean;
  runState: PccWorkflowRunState;
  evRefs: readonly PccEvidenceId[];
  surfaces: PccWorkflowSurfaceEvidence[];
  summary: {
    totalSurfaces: number;
    totalActions: number;
    totalPrimaryActions: number;
    totalDisabledWithoutReason: number;
    totalFalseAffordanceNeedsReview: number;
    totalStateObservations: number;
    totalSourceObservations: number;
    totalMockDemoSignals: number;
    totalHbiAuthorityRisks: number;
    totalExternalLaunchObservations: number;
    totalApprovalsQueueObservations: number;
    totalContinuitySignals: number;
    totalWarnings: number;
  };
  warnings: string[];
  disclaimer: string;
}
```

You may add helper types if useful, but keep the observation model metadata-only and sanitized.

---

## Workflow Capture Module

Create:

```text
e2e/pcc-live/pcc-live.workflow-capture.ts
```

Required behavior:

1. Accept:
   - Playwright `Page`;
   - Prompt 04 `PccLivePageObject`;
   - eight surfaces;
   - optional capture limits.
2. For each surface:
   - load page once via `PccLivePageObject.goto(pageUrl)`;
   - navigate surfaces through `PccLivePageObject.assertSurfaceActive(surface)`;
   - scope inspection to active panel when present:
     - `[data-pcc-active-surface-panel="<surfaceId>"]`;
   - inspect only. Do not click live workflow controls.
3. Inspect actions:
   - selectors:
     - `button`
     - `a[href]`
     - `[role="button"]`
     - `[role="link"]`
     - `[role="tab"]`
     - `[data-pcc-action]`
     - `[data-pcc-command]`
     - `[data-pcc-launch]`
     - `[data-pcc-external-system]`
   - cap observations. Recommended cap: 160 per surface.
   - record tag/role/enabled/disabled/aria-disabled/accessible-name booleans.
   - record sanitized label snippet only, max 80 characters.
   - record href destination host/path with query stripped.
   - classify kind using label/attribute heuristics.
   - classify mutation keywords:
     - approve, reject, submit, save, delete, create, edit, update, upload, sync, send, sign, award, assign, provision, commit, certify.
   - classify false-affordance risk:
     - `high` when enabled mutation-keyword control appears inside read-only/preview/deferred/unavailable context;
     - `medium` when disabled/aria-disabled control lacks a reason;
     - `needs-review` when unclear;
     - no final pass/fail.
4. Inspect priority ordering:
   - use card markers:
     - `[data-pcc-card]`
     - `[data-pcc-card-hierarchy]`
     - `[data-pcc-card-tier]`
     - `[data-pcc-card-region]`
     - `[data-pcc-footprint]`
   - count primary/hierarchy command cards and reference cards.
   - compare first primary/priority action index against first reference card index.
   - record `priorityBeforeReference` as evidence; do not score.
5. Inspect state model:
   - look for state keywords in sanitized/limited text and stable attributes:
     - loading, empty, error, blocked, degraded, preview, read-only, readonly, deferred, unavailable, unauthorized, stale, missing configuration, mock, demo, fixture.
   - inspect state-oriented selectors:
     - `[role="alert"]`
     - `[aria-busy]`
     - `[data-pcc-state]`
     - `[data-pcc-preview]`
     - `[data-pcc-readonly]`
     - `[data-pcc-read-only]`
     - `[data-pcc-deferred]`
     - `[data-pcc-source-confidence]`
     - `[data-pcc-state-kind]`
   - record snippets only when sanitized/truncated to 120 characters.
   - do not persist full body text.
   - infer `hasImpact`, `hasOwner`, `hasNextStep` from keywords only, not full text.
6. Inspect source-of-record/data confidence:
   - detect source system mentions/attributes for:
     - PCC, SharePoint, Procore, Sage, Autodesk, Document Crunch, Adobe Sign, HBI, Fixture, Mock.
   - inspect selectors:
     - `[data-pcc-source]`
     - `[data-pcc-source-system]`
     - `[data-pcc-system-of-record]`
     - `[data-pcc-source-of-record]`
     - `[data-pcc-source-confidence]`
     - `[data-pcc-read-model]`
     - `[data-pcc-fixture]`
     - `[data-pcc-mock]`
   - record source system, ownership snippet, read-only boundary observed, write-authority claim observed.
   - do not infer real integrations.
7. Inspect HBI authority:
   - detect HBI/command/search mentions and selectors:
     - `[data-pcc-hbi]`
     - `[data-pcc-command]`
     - `[data-pcc-command-search]`
     - `[data-pcc-ai]`
   - record advisory language and risky mutation authority keywords:
     - approve, reject, certify, commit, sign, submit, mutate, write, sync, award.
   - do not fail; set `needsReview`.
8. Inspect External Platforms launch posture:
   - only on `external-systems` surface, but generic observations may be present elsewhere.
   - record external link count and destination hosts, query stripped.
   - verify via observation whether launch-only/read-only language appears.
   - do not click external links.
   - flag enabled mutation-keyword controls as needs-review.
9. Inspect Approvals queue posture:
   - only on `approvals` surface, but generic observations may be present elsewhere.
   - count approve/reject/submit actions.
   - record whether preview/read-only/deferred boundary language is present.
   - record disabled-reason counts.
   - flag enabled approval mutation controls as needs-review.
   - do not click.
10. Inspect continuity/ownership:
    - detect keywords/attributes for owner, responsible, assignee, role, trade, vendor, Ball in Court, due, next action, lifecycle, readiness, documents, approvals, site health, external systems.
    - record counts only.
    - do not persist names, people, email, phone, or full text.

Sanitization requirements:

- Do not persist raw DOM HTML.
- Do not persist full visible text.
- Do not persist href URLs with query strings.
- Do not persist email/user/contact/body text.
- Do not persist localStorage/sessionStorage/cookies/headers.
- Use only selectors, roles, attributes, sanitized short snippets, destination host/path, booleans, counts, and sanitized warnings.
- Redact:
  - email-like values -> `[redacted-email]`;
  - long token-like values -> `[redacted-blob]`;
  - credential/session words -> `[redacted-cred]`;
  - HTML tags -> `[redacted-html]`.

---

## Workflow Evidence Writer

Create:

```text
e2e/pcc-live/pcc-live.workflow-evidence-writer.ts
```

Required output files:

```text
pcc-live-workflow-evidence.json
pcc-live-workflow-evidence.md
pcc-live-action-summary.json
pcc-live-state-summary.json
pcc-live-source-summary.json
pcc-live-false-affordance-summary.json
pcc-live-hbi-authority-summary.json
```

Write these under the provided run output directory:

```text
<PCC_EVIDENCE_OUTPUT_DIR>/workflow-state-source-<run-id>/
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
surfaces
summary
warnings
disclaimer
```

Required disclaimer:

```text
This output is workflow, action, source, state, and false-affordance evidence support for EV-83..EV-106 only. It is not a final scorecard result and does not mark any EV captured without operator review.
```

Markdown summary must include:

```text
run ID
generated timestamp
tenant site/page
expected package version
EV refs
surface workflow summary table
total action count
primary action count
disabled-without-reason count
false-affordance needs-review count
state observation count
source observation count
mock/demo signal count
HBI authority risk count
External Platforms launch observation count
Approvals queue observation count
continuity signal count
warning count
operator-review reminder
not-final-scoring disclaimer
```

Sanitization requirements:

- Reuse or duplicate conservative Prompt 04/05/06/07 sanitization logic.
- Sanitize all free-text fields written to JSON/markdown.
- Preserve safe curated repo/output paths.
- Exclude raw Playwright/auth/session paths from artifact references if artifact references are included.
- Do not serialize cookies, tokens, storageState, request/response payloads, raw console dumps, headers, raw DOM HTML, names/emails/phone numbers, or full text content.

---

## Workflow Spec

Create:

```text
e2e/pcc-live/pcc-live.workflow.spec.ts
```

Required tests:

### 1. Workflow EV tuple is valid

No live env required.

Assert:

- tuple contains exactly `EV-83..EV-106`;
- every tuple ID exists in `REQUIRED_PCC_EVIDENCE_IDS`;
- no duplicate EV IDs;
- no EV outside Prompt 08 scope;
- tuple length is 24.

### 2. Workflow writer preserves sanitized output policy

No live env required.

Use temp directory and sample fake workflow evidence.

Assert:

- writer produces all expected JSON/markdown files;
- safe curated path remains present if included;
- unsafe strings are not present in all generated files:
  - email address;
  - phone number if included in fixture;
  - token-like blob;
  - query string;
  - raw DOM HTML snippet such as `<button`;
  - `storageState`;
  - `cookie`;
  - `token`;
  - `session`;
  - `.auth`;
  - `test-results`;
  - `playwright-report`;
  - `trace.zip`;
  - `video.webm`;
  - `network.har`;
- redaction markers appear where appropriate;
- disclaimer appears;
- no EV is represented as captured;
- no hard stop is represented as passed/failed.

### 3. Workflow capture helpers preserve synthetic DOM boundaries

No live tenant env required.

Use `page.setContent(...)` with synthetic PCC-like DOM containing:

- active surface panel;
- primary action button;
- reference card;
- disabled control with and without disabled reason;
- read-only/preview/deferred/unavailable state copy;
- mock/demo/fixture/source labels;
- HBI advisory and risky mutation language;
- External Platforms launch link sample;
- Approvals approve/reject/submit sample;
- owner/responsibility/next-action/lifecycle language;
- raw body text that must not be persisted.

Assert:

- action observations classify navigation/launch/mutation keywords without clicking.
- disabled-without-reason is detected.
- false-affordance needs-review is detected for enabled mutation control in read-only/preview context.
- priority ordering evidence is produced.
- state observations include read-only/preview/deferred/mock-demo/fixture as observed where present.
- source observations include source systems where present.
- HBI authority risky mutation keywords are counted as needs-review, not pass/fail.
- External Platforms and Approvals observations are metadata-only and do not click.
- no raw body text, email, phone, query string, or raw HTML is persisted in serialized observations.

### 4. Live workflow capture self-skips without live env

Live env required only if configured.

Use:

```ts
skipIfMissingPccLiveEnv(test)
```

When env is missing, this test self-skips clearly.

When env is configured:

- load `PCC_LIVE_PAGE_URL`;
- navigate all eight surfaces through Prompt 04 page object;
- collect workflow/state/source evidence;
- write output files under `PCC_EVIDENCE_OUTPUT_DIR`;
- assert:
  - all eight surfaces represented;
  - output files exist;
  - no raw DOM HTML in output files;
  - no EV captured status emitted;
  - no hard stop pass/fail emitted.

Important:

- Do not stage generated evidence artifacts.
- Closeout should report output directory path only plus counts.
- Do not print raw workflow text, URLs with query strings, or full issue payloads.

---

## Optional Root Script

If materially useful, add this opt-in-only script to root `package.json`:

```json
"pcc:e2e:workflow": "playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts"
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

Update `e2e/pcc-live/README.md` with a concise Prompt 08 section.

Include:

```text
workflow/state/source evidence purpose
inspection-only rule
no live workflow clicking rule
primary actions / disabled reasons / false-affordance scope
state/source/HBI authority/External Platforms/Approvals scope
EV-83..EV-106 initial support scope
operator-review requirement before committing evidence
raw DOM/full-text prohibition
PCC_EVIDENCE_OUTPUT_DIR usage
run command
not-final-scoring disclaimer
```

Do not remove Prompt 01–07 safety posture.

---

## Evidence / EV Status Rules

Prompt 08 can generate workflow/action/source/state/false-affordance evidence support for:

```text
EV-83..EV-106
```

Prompt 08 must not:

- modify `PCC_EVIDENCE_REGISTRY` statuses;
- mark any EV as `captured`;
- calculate final scorecard status;
- mark hard stops passed/failed;
- imply Phase 4 readiness.

Use language like:

```text
initial workflow-state-source support
operator-review pending
needs-review
workflow inventory ready for review
state/source inventory ready for review
```

Do not use language like:

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

## Validation Commands

Run and report:

```bash
git status --short
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

Do not run live tenant workflow capture unless valid `PCC_LIVE_*` env and storageState are intentionally configured.

If a live run is performed, closeout must include:

```text
whether live workflow capture ran or self-skipped
whether evidence files were written
output directory path only
surface count
action observation count
primary action count
disabled-without-reason count
false-affordance needs-review count
state observation count
source observation count
mock/demo signal count
HBI authority risk count
External Platforms observation count
Approvals queue observation count
continuity signal count
warning count
no raw DOM HTML
no full text content
no cookies/tokens/storageState
```

---

## Acceptance Criteria

Prompt 08 is complete only when:

- workflow EV tuple is strict and valid for EV-83..EV-106;
- workflow/state/source capture module exists;
- workflow evidence writer exists;
- workflow spec exists and self-skips live capture without env/storageState;
- all eight surfaces are covered by live capture logic;
- action observations are metadata-only and do not click live workflow controls;
- primary action / priority ordering evidence is collected;
- disabled reason evidence is collected;
- read-only / preview / deferred / unavailable / stale / unauthorized / degraded / mock-demo / fixture state evidence is collected where present;
- false-affordance risks are flagged as needs-review only;
- source-of-record/data-confidence evidence is collected without inventing integration facts;
- External Platforms launch posture is inspected without clicking links;
- Approvals queue posture is inspected without approving/rejecting/submitting;
- HBI authority risks are flagged without final pass/fail;
- continuity/owner/next-action signals are counted without persisting names/contact data;
- writer produces all expected metadata/report files in tests;
- writer excludes unsafe raw/auth/session/DOM/full-text content from JSON/markdown;
- evidence artifacts are not staged/committed automatically;
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

- Prompt 01–07 foundation files are missing;
- Prompt 04 URL-boundary/sanitization hardening is missing;
- Prompt 05/06/07 writer safety posture is missing;
- existing Prompt 08 files conflict with this design;
- implementation requires PCC runtime/source edits;
- implementation requires Playwright config edits;
- implementation requires `.gitignore` changes;
- implementation requires dependency or lockfile changes;
- workflow capture would require clicking live mutation controls;
- External Platforms validation would require opening external links;
- Approvals validation would require approve/reject/submit actions;
- any writer would serialize cookies, storageState, tokens, raw traces/videos/HARs, raw Playwright outputs, request/response payloads, raw console dumps, raw DOM HTML, names/emails/phone numbers, or unsanitized full text output;
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
- Workflow/action evidence tooling established.
- Primary action / priority ordering evidence support established.
- Disabled reason and false-affordance evidence support established.
- State/read-only/preview/deferred/source confidence evidence support established.
- External Platforms launch posture evidence support established.
- Approvals queue posture evidence support established.
- HBI authority and cross-module continuity evidence support established.
- Initial EV-83..EV-106 evidence support established.
- Evidence remains operator-review pending.
- No final 100-point score calculated.
- No hard stop marked passed/failed.

Safety confirmation:
- No tenant mutation.
- Live workflow capture <ran/self-skipped/not run> with reason.
- No storageState committed.
- No raw Playwright artifacts committed.
- No raw console dumps committed.
- No raw DOM HTML or full text content committed.
- No workflow evidence artifacts staged/committed automatically.
- No PCC runtime source modified.
- `pnpm-lock.yaml` unchanged.
- No EV marked captured.

Residual risks or pending items:
- <items>
```
