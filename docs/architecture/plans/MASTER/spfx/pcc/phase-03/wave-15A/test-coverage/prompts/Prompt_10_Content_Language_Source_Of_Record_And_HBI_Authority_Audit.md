# Prompt 10 — PCC Content, Language, Source-of-Record, and HBI Authority Audit — Updated Execution Prompt

## Role

You are the local code agent implementing **Prompt 10** for the PCC 100-Point UI/UX Mold Breaker Scorecard evidence automation track in the `RMF112018/hb-intel` repository.

You are implementing **safe, read-only visible-copy extraction and content review support** for the Project Control Center (PCC) live SharePoint Playwright evidence lane.

Your job is to add metadata-only tooling that extracts and classifies visible copy from PCC surfaces, then generates structured review artifacts for:

- construction language quality;
- state copy quality;
- source-of-record and source-confidence clarity;
- HBI authority boundaries;
- disabled reason clarity;
- owner / action / responsibility language;
- mock / fixture / demo-data transparency.

You are **not** calculating a final 100-point score, not marking evidence captured, not marking hard stops passed or failed, not editing PCC runtime/source code, not modifying tenant data, and not committing live evidence artifacts automatically.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

---

## Critical Context

Prompt 01 established the PCC live Playwright harness.

Prompt 02 established the evidence registry and manifest infrastructure.

Prompt 03 established scorecard pillar and hard-stop traceability.

Prompt 04 established safe live page-object / surface-smoke tooling and hardened:

- live tab navigation;
- HTTPS enforcement;
- expected origin / hostname boundary checks;
- sanitized runtime output.

Prompt 05 established screenshot and DOM summary evidence tooling.

Prompt 06 established breakpoint / container / overflow / rowspan / touch evidence tooling.

Prompt 07 established accessibility / Axe / keyboard / focus / ARIA evidence tooling.

Prompt 08 established workflow / action / state / source / false-affordance evidence tooling. Prompt 10 must **build on this**, not duplicate it unnecessarily. In particular, Prompt 08 already captures action labels, state snippets, source observations, HBI authority observations, external platform observations, approval queue observations, and continuity signals.

Prompt 09 established conditional edit-mode / high-zoom / drawer / unauthorized / special-state evidence support.

The attached original Prompt 10 objective was:

```text
Implement visible-copy extraction and content review artifacts. Extract headings, state copy, disabled reason text, source labels, HBI language, owner/action labels. Generate review templates for construction language, state copy quality, source-of-record clarity, and HBI authority boundaries.
```

This updated prompt expands that objective into a deterministic, safe, repo-auditable implementation contract.

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
e2e/pcc-live/pcc-live.conditional.types.ts
e2e/pcc-live/pcc-live.conditional-capture.ts
e2e/pcc-live/pcc-live.conditional-evidence-writer.ts
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
Automate visible-copy extraction, review scaffolding, and traceability.
Do not automatically score copy quality, Mold Breaker quality, HBI authority quality, or Phase 4 readiness.
Do not mark EVs captured without operator/expert review.
Do not mark hard stops passed or failed.
```

---

## Repo-Truth Gate Before Editing

Before editing, verify current checkout has Prompt 01–09 foundation.

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
test -f e2e/pcc-live/pcc-live.conditional.types.ts
test -f e2e/pcc-live/pcc-live.conditional-capture.ts
test -f e2e/pcc-live/pcc-live.conditional-evidence-writer.ts
test -f e2e/pcc-live/pcc-live.conditional.spec.ts
test -f e2e/pcc-live/pcc-scorecard.traceability.ts
test -f docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Search for existing Prompt 10 files before creating new files:

```bash
find e2e/pcc-live -maxdepth 1 -type f \( -name '*content*' -o -name '*language*' -o -name '*hbi*authority*' \) -print
```

Inspect only as needed:

```bash
sed -n '1,260p' e2e/pcc-live/pcc-live.workflow.types.ts
sed -n '1,320p' e2e/pcc-live/pcc-live.workflow-capture.ts
sed -n '1,320p' e2e/pcc-live/pcc-live.workflow-evidence-writer.ts
sed -n '1,260p' e2e/pcc-live/pcc-live.conditional.types.ts
sed -n '1,260p' e2e/pcc-live/pcc-live.page-object.ts
```

Stop and report if:

- any Prompt 01–09 foundation file is missing;
- the Prompt 04 page object no longer enforces HTTPS + expected origin + expected hostname;
- existing Prompt 10 content-language files already exist and conflict with this design;
- implementation appears to require PCC runtime/source edits;
- implementation would require tenant mutation;
- implementation would require clicking live edit/save/approve/submit/export/import/sync/external-launch controls;
- implementation would require Playwright config, `.gitignore`, dependency, or lockfile changes.

---

## Objective

Implement Prompt 10 content-language evidence tooling that can:

1. Navigate the normal PCC live page safely using the Prompt 04 page object.
2. Visit all eight registered PCC surfaces through safe tab navigation.
3. Extract visible-copy metadata from each surface, including:
   - headings;
   - card titles;
   - action labels;
   - disabled control labels and disabled reason text;
   - status labels;
   - state copy;
   - source-of-record labels;
   - source-confidence / freshness labels;
   - HBI command/search copy;
   - HBI advisory / refusal / authority-boundary language;
   - owner / action / responsibility labels;
   - mock / fixture / demo-data labels;
   - cross-module and lifecycle-reference language.
4. Classify copy records into auditable copy kinds without persisting full body text.
5. Generate deterministic, sanitized content review artifacts:
   - extracted visible-copy JSON;
   - construction language review;
   - state copy quality review;
   - source-of-record language review;
   - HBI authority language review;
   - disabled reason copy review.
6. Support scorecard evidence review for:
   - Pillar 1 — PCC Product Strategy and Command-Center Clarity;
   - Pillar 2 — Construction-Tech Mold Breaker Differentiation;
   - Pillar 5 — Workflow, Interaction, and Next-Action Clarity;
   - Pillar 6 — State Model, Read-Only, Preview, Degraded, and Source Confidence;
   - Pillar 8 — Accessibility, Visual Semantics, and Inclusive Use;
   - Pillar 9 — Evidence, Validation, and Phase 4 Readiness.
7. Support hard-stop review for:
   - HS-02 command-center failure;
   - HS-03 cognitive-overload failure;
   - HS-04 false-affordance failure;
   - HS-06 state-model failure;
   - HS-09 evidence failure;
   - HS-10 HBI authority failure.
8. Preserve review boundaries:
   - copy findings are `needs-review`, `review-support`, or `operator-pending`;
   - no copy category is auto-passed;
   - no final score is calculated;
   - no hard stop is marked passed or failed;
   - no EV registry status is changed.

---

## Required EV Scope

Prompt 10 creates content-language review support for workflow, state, source, and HBI authority evidence already seeded by Prompt 08:

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
export const PCC_CONTENT_LANGUAGE_EVIDENCE_IDS = [
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
- Add compile-time guards:
  - tuple length is 24;
  - tuple is unique;
  - tuple IDs are assignable to `PccEvidenceId`;
  - ID union does not widen to `string`.
- Do not include EV IDs outside `EV-83..EV-106`.
- Do not mark any of these EVs captured.
- Do not generate EV-125..EV-134 surface evidence blocks; Prompt 12 owns those.

Use status wording such as:

```text
review-support
needs-review
operator-pending
not-observed
observed
writer-test-only
self-skipped
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

## Required Files To Add

Create these files unless repo truth shows equivalent files already exist:

```text
e2e/pcc-live/pcc-live.content.types.ts
e2e/pcc-live/pcc-live.content-capture.ts
e2e/pcc-live/pcc-live.content-review-writer.ts
e2e/pcc-live/pcc-live.content.spec.ts
```

Update this existing file only if needed:

```text
e2e/pcc-live/README.md
```

Do not create committed live content evidence artifacts in this prompt. Live artifacts should be written only when live tests are intentionally run with valid env/storageState and must remain uncommitted until operator review/scrubbing.

---

## Files Allowed To Modify

Allowed:

```text
e2e/pcc-live/pcc-live.content.types.ts
e2e/pcc-live/pcc-live.content-capture.ts
e2e/pcc-live/pcc-live.content-review-writer.ts
e2e/pcc-live/pcc-live.content.spec.ts
e2e/pcc-live/README.md
```

Do not modify:

```text
apps/project-control-center/src/**
apps/project-control-center/package.json
apps/project-control-center/config/**
apps/project-control-center/src/webparts/**
packages/**
backend/**
package.json
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
e2e/pcc-live/pcc-live.conditional*.ts
e2e/pcc-live/pcc-evidence*.ts
e2e/pcc-live/pcc-scorecard*.ts
docs/reference/**
docs/explanation/**
.gitignore
```

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
- serialize cookies, tokens, storageState, request headers, localStorage, sessionStorage, personal data, raw DOM HTML, full page text, auth/session context, or request/response payloads;
- mark any EV as `captured` in the registry;
- calculate the final 100-point score;
- mark hard stops as passed or failed.

Navigation remains limited to Prompt 04 safe tab navigation for the normal live lane. Content extraction is **inspection-only**.

---

## Content Types Module

Create:

```text
e2e/pcc-live/pcc-live.content.types.ts
```

Required exported constants and types:

```ts
export const PCC_CONTENT_LANGUAGE_EVIDENCE_IDS = [/* EV-83..EV-106 */] as const;

export type PccContentLanguageEvidenceId =
  (typeof PCC_CONTENT_LANGUAGE_EVIDENCE_IDS)[number];

export type PccContentRunState =
  | 'completed'
  | 'self-skipped'
  | 'operator-pending'
  | 'writer-test-only';

export type PccVisibleCopyKind =
  | 'heading'
  | 'card-title'
  | 'action-label'
  | 'disabled-reason'
  | 'status-label'
  | 'state-copy'
  | 'source-label'
  | 'source-confidence'
  | 'freshness-label'
  | 'hbi-copy'
  | 'hbi-authority'
  | 'owner-responsibility'
  | 'mock-fixture-label'
  | 'navigation-label'
  | 'cross-module-reference'
  | 'unknown';

export type PccContentReviewCategory =
  | 'construction-language'
  | 'state-copy-quality'
  | 'source-of-record-language'
  | 'hbi-authority-language'
  | 'disabled-reason-copy'
  | 'owner-action-responsibility'
  | 'mock-fixture-transparency';

export type PccContentReviewDisposition =
  | 'review-support'
  | 'needs-review'
  | 'operator-pending'
  | 'not-observed';

export interface PccVisibleCopySignalFlags {
  constructionVocabulary: boolean;
  ownershipLanguage: boolean;
  nextActionLanguage: boolean;
  sourceBoundaryLanguage: boolean;
  sourceConfidenceLanguage: boolean;
  freshnessLanguage: boolean;
  hbiMention: boolean;
  hbiAdvisoryLanguage: boolean;
  hbiMutationAuthorityRisk: boolean;
  readOnlyPreviewDeferredLanguage: boolean;
  disabledReasonLanguage: boolean;
  mockFixtureDemoLanguage: boolean;
  crossModuleLanguage: boolean;
}

export interface PccVisibleCopyRecord {
  surfaceId: PccLiveSurfaceId;
  kind: PccVisibleCopyKind;
  selector: string;
  textSnippet: string;
  textHash: string;
  charCount: number;
  wordCount: number;
  visible: boolean;
  signals: PccVisibleCopySignalFlags;
  needsReview: boolean;
}

export interface PccContentReviewFinding {
  category: PccContentReviewCategory;
  disposition: PccContentReviewDisposition;
  surfaceId?: PccLiveSurfaceId;
  evidenceIds: readonly PccEvidenceId[];
  title: string;
  rationale: string;
  supportingCopyHashes: string[];
  reviewerPrompt: string;
}

export interface PccContentSurfaceSummary {
  surfaceId: PccLiveSurfaceId;
  label: string;
  visibleCopyCount: number;
  headingCount: number;
  actionLabelCount: number;
  disabledReasonCount: number;
  stateCopyCount: number;
  sourceLabelCount: number;
  hbiCopyCount: number;
  ownerResponsibilityCount: number;
  mockFixtureLabelCount: number;
  needsReviewCount: number;
}

export interface PccContentEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  selfSkipped: boolean;
  runState: PccContentRunState;
  evRefs: readonly PccEvidenceId[];
  surfaces: PccContentSurfaceSummary[];
  copyRecords: PccVisibleCopyRecord[];
  findings: PccContentReviewFinding[];
  summary: {
    surfaceCount: number;
    copyRecordCount: number;
    findingCount: number;
    constructionLanguageFindingCount: number;
    stateCopyFindingCount: number;
    sourceLanguageFindingCount: number;
    hbiAuthorityFindingCount: number;
    disabledReasonFindingCount: number;
    ownerActionFindingCount: number;
    mockFixtureFindingCount: number;
    needsReviewCount: number;
    warningCount: number;
  };
  warnings: string[];
  disclaimer: string;
}
```

You may add helper types if useful, but keep the model metadata-only and sanitized.

---

## Content Capture Module

Create:

```text
e2e/pcc-live/pcc-live.content-capture.ts
```

Required behavior:

1. Accept:
   - Playwright `Page`;
   - Prompt 04 `PccLivePageObject`;
   - `pageUrl`;
   - eight surfaces;
   - optional caps such as max copy records per surface.
2. Navigate safely:
   - use `pageObject.goto(pageUrl)`;
   - use `pageObject.waitForPccRoot()`;
   - for each surface, use `pageObject.assertSurfaceActive(surface)`.
3. Extract only visible metadata:
   - no full DOM HTML;
   - no full page body text;
   - no screenshots;
   - no storageState / auth / cookies / headers / localStorage / sessionStorage.
4. Prefer stable selectors and markers:
   - `[data-pcc-active-surface-panel="<surface>"]`
   - `[data-pcc-card]`
   - `[data-pcc-card-heading]`
   - `[data-pcc-heading-level]`
   - `[data-pcc-card-region]`
   - `[data-pcc-card-tier]`
   - `[data-pcc-state]`
   - `[data-pcc-state-kind]`
   - `[data-pcc-source]`
   - `[data-pcc-source-system]`
   - `[data-pcc-system-of-record]`
   - `[data-pcc-source-of-record]`
   - `[data-pcc-source-confidence]`
   - `[data-pcc-read-model]`
   - `[data-pcc-fixture]`
   - `[data-pcc-mock]`
   - `[data-pcc-hbi]`
   - `[data-pcc-command-search]`
5. Also inspect semantic HTML:
   - `h1`, `h2`, `h3`;
   - `button`;
   - `a[href]`;
   - `[role="button"]`;
   - `[role="link"]`;
   - `[role="tab"]`;
   - `[role="alert"]`;
   - `[aria-busy]`;
   - `[disabled]`;
   - `[aria-disabled="true"]`.
6. Extract copy kinds:
   - heading;
   - card-title;
   - action-label;
   - disabled-reason;
   - status-label;
   - state-copy;
   - source-label;
   - source-confidence;
   - freshness-label;
   - hbi-copy;
   - hbi-authority;
   - owner-responsibility;
   - mock-fixture-label;
   - navigation-label;
   - cross-module-reference.
7. Disabled reason extraction:
   - if a disabled control has `aria-describedby`, read only the referenced element’s short sanitized text;
   - if it has `data-pcc-disabled-reason`, read that attribute;
   - if it has `title`, read the title;
   - if no reason exists, create a `needs-review` finding without inventing a reason.
8. HBI authority extraction:
   - detect HBI / command / search copy;
   - detect advisory language such as `suggest`, `recommend`, `review`, `assist`, `draft`, `explain`;
   - detect risky authority verbs such as `approve`, `reject`, `certify`, `commit`, `sign`, `submit`, `write`, `sync`, `award`;
   - risky verbs create `needs-review` findings, not pass/fail.
9. Source-of-record extraction:
   - detect PCC, SharePoint, Procore, Sage, Autodesk, Document Crunch, Adobe Sign, HBI, Fixture, Mock, Unknown;
   - detect read-only/source-owned boundaries;
   - detect freshness/stale/confidence labels.
10. Content review findings:
   - generate review-support / needs-review items, not final conclusions;
   - each finding must reference relevant EV IDs;
   - each finding must include reviewer prompts for human evaluation.

### Sanitization

Sanitize all free text before returning from capture.

Sanitization must:

- strip query strings;
- redact emails;
- redact phone numbers;
- redact token-like blobs;
- redact raw HTML;
- redact storage/auth/session/cookie/secret terms where they appear in copy;
- redact raw Playwright artifact paths;
- redact hard-stop/pass/fail/readiness claim phrases;
- truncate snippets to a conservative maximum, preferably 160 characters or less;
- produce a stable text hash/fingerprint so reviewers can correlate records without full text.

---

## Content Review Writer

Create:

```text
e2e/pcc-live/pcc-live.content-review-writer.ts
```

Required output files:

```text
pcc-live-content-evidence.json
pcc-live-content-evidence.md
extracted-visible-copy.json
content-review-findings.json
construction-language-review.md
state-copy-quality-review.md
source-of-record-language-review.md
hbi-authority-language-review.md
disabled-reason-copy-review.md
```

Write these under the provided run output directory:

```text
<PCC_EVIDENCE_OUTPUT_DIR>/content-<run-id>/
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
copyRecords
findings
summary
warnings
disclaimer
```

Required disclaimer:

```text
This output is visible-copy, construction-language, source-of-record, state-copy, disabled-reason, and HBI authority review support for EV-83 through EV-106 only. It is not a final scorecard result and does not mark any EV captured or any hard stop passed or failed.
```

Markdown summary must include:

```text
run ID
generated timestamp
tenant site/page
expected package version
EV refs
surface summary table
copy kind counts
finding category counts
needs-review count
warning count
operator-review reminder
not-final-scoring disclaimer
```

Each review markdown must include:

```text
purpose
scope
related scorecard pillars
related hard stops
related EV IDs
automated extraction summary
reviewer checklist
findings table
open reviewer notes section
explicit statement that this is review support only
```

Required review markdown files:

### `construction-language-review.md`

Must support review of:

- construction operations vocabulary;
- ownership and responsibility clarity;
- priority / urgency / next-action clarity;
- lifecycle continuity language;
- avoidance of generic dashboard language.

### `state-copy-quality-review.md`

Must support review of:

- loading, empty, error, blocked, degraded, preview, read-only, deferred, unavailable, unauthorized, stale, missing-configuration, mock/demo/fixture copy;
- whether state copy communicates condition, impact, owner, and next step;
- whether preview/read-only/deferred states are distinguishable.

### `source-of-record-language-review.md`

Must support review of:

- source-of-record clarity;
- source-confidence / freshness language;
- PCC vs SharePoint vs Procore vs Sage vs Fixture / Mock boundary;
- read-only/source-owned records;
- no invented ownership conclusions.

### `hbi-authority-language-review.md`

Must support review of:

- HBI advisory vs authority language;
- command/search language;
- refusal / boundary language where visible;
- risky mutation authority verbs;
- HS-10 HBI authority failure risk.

### `disabled-reason-copy-review.md`

Must support review of:

- disabled controls with reasons;
- disabled controls without reasons;
- whether reason text explains condition, impact, and next step;
- false-affordance risk from enabled mutation-looking controls in read-only/preview contexts.

### Sanitization requirements

- Reuse or duplicate conservative Prompt 04/05/06/07/08/09 sanitization logic.
- Sanitize all free-text fields written to JSON/markdown.
- Preserve safe curated repo/output paths.
- Exclude raw Playwright/auth/session paths from artifact references if artifact references are included.
- Do not serialize cookies, tokens, storageState content, storageState file paths, request/response payloads, raw console dumps, headers, raw DOM HTML, names/emails/phone numbers, or full text output.
- Do not output hard stop pass/fail or readiness disposition claims.

---

## Content Spec

Create:

```text
e2e/pcc-live/pcc-live.content.spec.ts
```

Required tests:

### 1. Content-language EV tuple is valid

No live env required.

Assert:

- tuple contains exactly `EV-83` through `EV-106`;
- tuple has length 24;
- every tuple ID exists in `REQUIRED_PCC_EVIDENCE_IDS`;
- no duplicate EV IDs;
- no EV outside Prompt 10 scope.

### 2. Content writer preserves sanitized output policy

No live env required.

Use temp directory and sample fake content evidence.

Assert:

- writer produces all expected JSON/Markdown files;
- safe curated path remains present if included;
- unsafe strings are not present in all generated files:
  - email address;
  - phone number;
  - token-like blob;
  - query string;
  - raw DOM HTML snippet such as `<button`;
  - storageState path or literal;
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

### 3. Synthetic visible-copy extraction covers required copy kinds

No live tenant env required.

Use `page.setContent(...)` with synthetic PCC-like DOM containing:

- active surface panel;
- headings;
- card title;
- primary action;
- disabled control with `aria-describedby`;
- disabled control without a reason;
- state copy;
- source-of-record labels;
- source-confidence / freshness labels;
- HBI advisory copy;
- risky HBI authority wording;
- owner / responsibility / next-action language;
- mock / demo / fixture language;
- cross-module references.

Assert:

- extracted records include required copy kinds;
- disabled reason text is captured only as sanitized snippet;
- disabled-without-reason produces a `needs-review` finding;
- HBI risky authority language produces a `needs-review` finding;
- source-of-record language produces review-support findings;
- no raw body text, email, phone, query string, storageState path, or raw HTML persists.

### 4. Synthetic review templates include required sections

No live tenant env required.

Use writer output from synthetic run.

Assert each review markdown includes:

- purpose;
- scope;
- related pillars;
- related hard stops;
- related EV IDs;
- reviewer checklist;
- findings table;
- open reviewer notes;
- review-support-only disclaimer.

### 5. Content capture does not click or mutate

No live tenant env required.

Use synthetic DOM with buttons whose click handlers increment counters or set flags.

Run capture.

Assert:

- click counter remains zero;
- no navigation to external links occurred;
- action labels were extracted without clicking.

### 6. Live content capture self-skips without live env

Live env required only if configured.

Use:

```ts
skipIfMissingPccLiveEnv(test)
```

When base live env is missing, this test self-skips clearly.

When base live env is ready:

- navigate all eight surfaces through the page object;
- extract content metadata;
- write content evidence;
- assert output files exist;
- assert no raw DOM HTML/full text/storageState path output;
- assert no `captured`/hard-stop pass/fail wording.

Important:

- Do not stage generated evidence artifacts.
- Closeout should report output directory path only plus counts.
- Do not print storageState paths, raw full text, URLs with query strings, or full issue payloads.

---

## Optional README Update

Update `e2e/pcc-live/README.md` with a concise Prompt 10 section only if useful.

Include:

```text
content/language evidence purpose
visible-copy extraction scope
source-of-record/HBI authority review scope
disabled-reason review scope
review-support-only posture
EV-83..EV-106 support scope
operator-review requirement before committing evidence
raw DOM/full-text/storageState prohibition
PCC_EVIDENCE_OUTPUT_DIR usage
run command
not-final-scoring disclaimer
```

Do not remove Prompt 01–09 safety posture.

---

## Validation Commands

Run and report:

```bash
git status --short
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.conditional.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec prettier --check --ignore-unknown e2e/pcc-live
git diff --check
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm install --frozen-lockfile
```

Do not run live content capture unless valid `PCC_LIVE_*` env/storageState are configured.

If `pnpm install --frozen-lockfile` is blocked by host authorization policy, report it as an environment authorization blocker, not as a code failure.

If a live content run is performed, closeout must include:

```text
whether base live env was ready or self-skipped
whether evidence files were written
output directory path only
surface count
copy record count
finding count
construction language finding count
state copy finding count
source language finding count
HBI authority finding count
disabled reason finding count
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

Prompt 10 is complete only when:

- content-language EV tuple is strict and valid;
- visible-copy/content capture module exists;
- content review writer exists;
- content spec exists and self-skips without base env/storageState;
- all eight PCC surfaces are supported;
- extraction covers headings, card titles, action labels, disabled reasons, state copy, source labels, source confidence/freshness, HBI language, owner/action labels, mock/fixture/demo labels, and cross-module/lifecycle references;
- writer produces all required JSON/Markdown output files in tests;
- review markdown files include required sections and review checklists;
- writer excludes unsafe raw/auth/session/DOM/full-text/storageState content from JSON/Markdown;
- evidence artifacts are not staged/committed automatically;
- Prompt 09 conditional tests still pass;
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

- Prompt 01–09 foundation files are missing;
- Prompt 04 URL-boundary/sanitization hardening is missing;
- Prompt 08 workflow/source/HBI observation posture is missing;
- Prompt 09 conditional files are missing;
- existing Prompt 10 files conflict with this design;
- implementation requires PCC runtime/source edits;
- implementation requires Playwright config edits;
- implementation requires `.gitignore` changes;
- implementation requires dependency or lockfile changes;
- content extraction would require clicking live mutation controls;
- External Platforms validation would require opening external links;
- Approvals validation would require approve/reject/submit actions;
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
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.conditional.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts --list` — <result>
- `pnpm exec prettier --check --ignore-unknown e2e/pcc-live` — <result>
- `git diff --check` — <result>
- `pnpm --filter @hbc/spfx-project-control-center check-types` — <result>
- `pnpm --filter @hbc/spfx-project-control-center test` — <result>
- `pnpm install --frozen-lockfile` — <result or environment authorization blocker>

Evidence / scorecard impact:
- Visible-copy extraction tooling established.
- Construction-language review support established.
- State-copy quality review support established.
- Source-of-record/source-confidence language review support established.
- HBI authority language review support established.
- Disabled-reason copy review support established.
- Owner/action/responsibility language review support established.
- Mock/fixture/demo transparency review support established.
- Initial EV-83 through EV-106 content-language evidence support established.
- Evidence remains operator-review pending.
- No final 100-point score calculated.
- No hard stop marked passed/failed.

Safety confirmation:
- No tenant mutation.
- Live content capture <ran/self-skipped/not run> with reason.
- No storageState path/content committed.
- No raw Playwright artifacts committed.
- No raw console dumps committed.
- No raw DOM HTML or full text content committed.
- No content evidence artifacts staged/committed automatically.
- No PCC runtime source modified.
- `pnpm-lock.yaml` unchanged.
- No EV marked captured.

Residual risks or pending items:
- <items>
```
