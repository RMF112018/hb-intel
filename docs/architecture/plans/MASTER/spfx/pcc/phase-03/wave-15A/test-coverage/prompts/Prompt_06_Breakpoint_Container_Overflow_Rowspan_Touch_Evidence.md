# Prompt 06 — PCC Breakpoint, Container, Overflow, Rowspan, Touch, and Responsive Screenshot Evidence

## Role

You are the local code agent implementing **Prompt 06** for the PCC 100-Point UI/UX Mold Breaker Scorecard evidence automation track in the `RMF112018/hb-intel` repository.

You are implementing **safe live responsive evidence tooling** for viewport/breakpoint behavior, container width, resolved mode, card spans, overflow/clipping, direct-child/card stability, rowspan stability, touch targets, and responsive screenshots.

You are **not** calculating a final score, not marking evidence captured, not marking hard stops passed/failed, not editing PCC runtime/source code, and not committing live screenshots or responsive evidence artifacts automatically.

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

Prompt 05 established screenshot and DOM summary evidence tooling and hardened:

- above-fold/full-page/scroll-segment capture;
- DOM card summaries without full card body text;
- operator-review screenshot artifact posture;
- writer/spec sanitization across all four generated files.

The attached Prompt 06 objective was:

```text
Implement viewport matrix and breakpoint spec. Record browser viewport, measured PCC container width, derived/resolved mode, card spans, overflow, clipping, direct-child/card stability, touch target checks, and screenshots for EV-59..EV-71.
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
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.screenshot.types.ts
e2e/pcc-live/pcc-live.screenshot-capture.ts
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
```

Important repo-truth selector/data-marker context:

- `PccBentoGrid` emits:
  - `data-pcc-bento-grid`
  - `data-pcc-mode`
  - `data-pcc-grid-safety`
- `PccDashboardCard` emits:
  - `data-pcc-card`
  - `data-pcc-footprint`
  - `data-pcc-card-hierarchy`
  - `data-pcc-card-tier`
  - `data-pcc-card-region`
  - `data-pcc-heading-level`
  - `data-pcc-mode`
  - `data-pcc-column-span`
  - `data-pcc-row-span`
  - `data-pcc-measured-height`
  - optional `data-pcc-active-surface-panel`

Critical distinction:

```text
Automate responsive evidence collection, inventory, and traceability.
Do not automatically calculate the final 100-point score.
Do not mark EVs captured without operator/expert review.
Do not mark hard stops passed or failed.
```

---

## Repo-Truth Gate Before Editing

Before editing, verify current checkout has Prompt 01–05 foundation and current layout marker contracts.

Run/inspect enough to confirm:

```bash
git status --short
test -f playwright.pcc-live.config.ts
test -f e2e/pcc-live/pcc-live.env.ts
test -f e2e/pcc-live/pcc-live.surfaces.ts
test -f e2e/pcc-live/pcc-live.page-object.ts
test -f e2e/pcc-live/pcc-live.screenshot.types.ts
test -f e2e/pcc-live/pcc-live.screenshot-capture.ts
test -f e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
test -f e2e/pcc-live/pcc-live.screenshot.spec.ts
test -f e2e/pcc-live/pcc-evidence.types.ts
test -f apps/project-control-center/src/layout/footprints.ts
test -f apps/project-control-center/src/layout/PccBentoGrid.tsx
test -f apps/project-control-center/src/layout/PccDashboardCard.tsx
test -f docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Inspect only as needed:

```bash
sed -n '1,260p' apps/project-control-center/src/layout/footprints.ts
sed -n '1,220p' apps/project-control-center/src/layout/PccBentoGrid.tsx
sed -n '1,260p' apps/project-control-center/src/layout/PccDashboardCard.tsx
sed -n '1,260p' e2e/pcc-live/pcc-live.page-object.ts
sed -n '1,260p' e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
```

Stop and report if:

- any Prompt 01–05 foundation file is missing;
- the Prompt 04 page object no longer enforces HTTPS + expected origin + expected hostname;
- the Prompt 05 screenshot/writer safety posture is missing;
- current PCC layout marker contracts differ materially from the expected selectors above;
- existing Prompt 06 responsive evidence files already exist and conflict with this design;
- implementation appears to require PCC runtime/source edits;
- live responsive capture would require clicking mutation controls.

---

## Objective

Implement Prompt 06 responsive evidence tooling that can, when live env/storageState is intentionally configured:

1. Navigate all eight PCC surfaces using the Prompt 04 safe page object.
2. Exercise a defined viewport matrix.
3. For each viewport and surface, record:
   - browser viewport;
   - measured PCC bento container width;
   - observed `data-pcc-mode`;
   - derived mode from measured container width;
   - grid column count/expected columns;
   - card footprint/hierarchy/tier/region/heading-level attributes;
   - card column span/row span/measured height;
   - direct-child/card stability;
   - overflow and clipping observations;
   - horizontal-scroll observations;
   - touch-target checks.
4. Capture responsive screenshots for each viewport/surface snapshot.
5. Write deterministic responsive evidence metadata/reports.
6. Map initial support to:
   - `EV-59` through `EV-71`.
7. Preserve review boundaries:
   - evidence output is operator-review pending;
   - no EV registry status changes;
   - no final score;
   - no hard-stop pass/fail decisions.

Screenshots and responsive evidence may contain tenant/project information. Generated artifacts must not be staged or committed unless the operator explicitly reviews/scrubs and approves them.

---

## Required Files To Add

Create these files unless repo truth shows equivalent files already exist:

```text
e2e/pcc-live/pcc-live.breakpoint.types.ts
e2e/pcc-live/pcc-live.breakpoint-matrix.ts
e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint.spec.ts
```

Update these existing files only if needed:

```text
e2e/pcc-live/README.md
package.json
```

Do not create committed responsive evidence artifacts in this prompt. Live artifacts should be written only when live tests are intentionally run with valid env/storageState and must remain uncommitted until operator review/scrubbing.

---

## Files Allowed To Modify

Allowed:

```text
e2e/pcc-live/pcc-live.breakpoint.types.ts
e2e/pcc-live/pcc-live.breakpoint-matrix.ts
e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint.spec.ts
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

If a forbidden file appears necessary, stop and report instead of editing.

---

## Non-Negotiable Safety Rules

Do **not**:

- click save, submit, approve, reject, delete, edit, publish, provision, sync, or mutation controls;
- run SharePoint/Graph/Procore/Sage/Autodesk/Document Crunch/Adobe Sign mutations;
- modify tenant data;
- commit storageState/session files;
- commit raw traces/videos/HARs;
- commit raw `test-results/` or raw `playwright-report/`;
- commit unsanitized console dumps;
- serialize cookies, tokens, storageState, request headers, localStorage, sessionStorage, personal data, or auth/session context in JSON/markdown;
- mark any EV as `captured` in the registry;
- calculate the final 100-point score;
- mark hard stops as passed or failed.

Responsive screenshots are tenant-sensitive. Treat screenshots as **operator-review required** and **not auto-commit eligible**.

Navigation remains limited to Prompt 04 safe tab navigation.

---

## Required EV Scope

Prompt 06 creates initial support artifacts for:

```text
EV-59
EV-60
EV-61
EV-62
EV-63
EV-64
EV-65
EV-66
EV-67
EV-68
EV-69
EV-70
EV-71
```

Define a strict tuple:

```ts
export const PCC_BREAKPOINT_EVIDENCE_IDS = [
  'EV-59',
  'EV-60',
  'EV-61',
  'EV-62',
  'EV-63',
  'EV-64',
  'EV-65',
  'EV-66',
  'EV-67',
  'EV-68',
  'EV-69',
  'EV-70',
  'EV-71',
] as const;
```

Rules:

- Use only EV IDs from Prompt 02 `PccEvidenceId`.
- Add compile-time guard that the tuple IDs are assignable to `PccEvidenceId`.
- Do not include EV IDs outside the specified list.
- Do not mark any of these EVs captured.
- Use status wording such as:
  - `operator-review-pending`;
  - `initial-responsive-support`;
  - `breakpoint-inventory-ready`.

Do not use status wording such as:

```text
captured
passed
complete
approved
score-ready
Phase 4 ready
```

---

## Responsive Mode and Threshold Contract

Create a local e2e-only copy of the responsive threshold contract in:

```text
e2e/pcc-live/pcc-live.breakpoint-matrix.ts
```

Do **not** import from `apps/project-control-center/src/layout/footprints.ts`.

Reason: e2e evidence should not depend on runtime app source imports. It should compare observed tenant/runtime values against a local repo-truth copy.

Current repo-truth thresholds and modes:

```ts
export const PCC_LIVE_RESPONSIVE_MODES = [
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
  'standardLaptop',
  'largeLaptop',
  'desktop',
  'ultrawide',
] as const;

export const PCC_LIVE_RESPONSIVE_COLUMNS = {
  phone: 1,
  tabletPortrait: 2,
  tabletLandscape: 6,
  smallLaptop: 8,
  standardLaptop: 10,
  largeLaptop: 12,
  desktop: 12,
  ultrawide: 12,
} as const;
```

Threshold resolver based on measured PCC container inline width:

```ts
export function resolvePccLiveResponsiveMode(inlineSizePx: number): PccLiveResponsiveMode {
  if (inlineSizePx < 480) return 'phone';
  if (inlineSizePx <= 768) return 'tabletPortrait';
  if (inlineSizePx <= 1024) return 'tabletLandscape';
  if (inlineSizePx <= 1180) return 'smallLaptop';
  if (inlineSizePx <= 1440) return 'standardLaptop';
  if (inlineSizePx <= 1599) return 'largeLaptop';
  if (inlineSizePx <= 1919) return 'desktop';
  return 'ultrawide';
}
```

Viewport matrix:

```ts
export const PCC_LIVE_VIEWPORT_MATRIX = [
  { id: 'phone-390', label: 'Phone 390', width: 390, height: 844, touch: true },
  {
    id: 'tablet-portrait-768',
    label: 'Tablet Portrait 768',
    width: 768,
    height: 1024,
    touch: true,
  },
  {
    id: 'tablet-landscape-1024',
    label: 'Tablet Landscape 1024',
    width: 1024,
    height: 768,
    touch: true,
  },
  { id: 'small-laptop-1180', label: 'Small Laptop 1180', width: 1180, height: 820, touch: false },
  {
    id: 'standard-laptop-1366',
    label: 'Standard Laptop 1366',
    width: 1366,
    height: 900,
    touch: false,
  },
  { id: 'large-laptop-1536', label: 'Large Laptop 1536', width: 1536, height: 960, touch: false },
  { id: 'desktop-1728', label: 'Desktop 1728', width: 1728, height: 1117, touch: false },
  { id: 'ultrawide-2048', label: 'Ultrawide 2048', width: 2048, height: 1280, touch: false },
] as const;
```

Notes:

- Expected mode should be derived from **measured PCC container width**, not browser viewport width.
- Browser viewport and SharePoint chrome may reduce available PCC container width.
- If observed `data-pcc-mode` differs from derived mode, record a warning in evidence; do not mark final pass/fail.
- In tests, helper functions should validate threshold behavior deterministically without live env.

---

## Breakpoint Types Module

Create:

```text
e2e/pcc-live/pcc-live.breakpoint.types.ts
```

Required exported types/interfaces:

```ts
export type PccBreakpointEvidenceId = (typeof PCC_BREAKPOINT_EVIDENCE_IDS)[number];

export type PccLiveResponsiveMode =
  | 'phone'
  | 'tabletPortrait'
  | 'tabletLandscape'
  | 'smallLaptop'
  | 'standardLaptop'
  | 'largeLaptop'
  | 'desktop'
  | 'ultrawide';

export interface PccLiveViewportDefinition {
  id: string;
  label: string;
  width: number;
  height: number;
  touch: boolean;
}

export interface PccLiveGridMeasurement {
  surfaceId: PccLiveSurfaceId;
  viewportId: string;
  browserViewportWidth: number;
  browserViewportHeight: number;
  measuredContainerWidth: number;
  measuredContainerHeight: number;
  observedMode?: PccLiveResponsiveMode | string;
  derivedMode: PccLiveResponsiveMode;
  expectedColumns: number;
  observedGridSafety?: string;
  horizontalScrollDetected: boolean;
  viewportOverflowX: number;
  documentScrollWidth: number;
  documentClientWidth: number;
}

export interface PccLiveCardMeasurement {
  surfaceId: PccLiveSurfaceId;
  viewportId: string;
  index: number;
  footprint?: string;
  hierarchy?: string;
  tier?: string;
  region?: string;
  headingLevel?: string;
  dataMode?: string;
  columnSpan?: number;
  rowSpan?: number;
  measuredHeight?: number;
  boundingWidth: number;
  boundingHeight: number;
  directChildOfGrid: boolean;
  clipped: boolean;
  overflowX: boolean;
  overflowY: boolean;
  minTouchTargetIssueCount: number;
}

export interface PccLiveTouchTargetMeasurement {
  surfaceId: PccLiveSurfaceId;
  viewportId: string;
  selector: string;
  role?: string;
  tagName: string;
  width: number;
  height: number;
  belowRecommendedSize: boolean;
}

export interface PccLiveBreakpointScreenshotArtifact {
  surfaceId: PccLiveSurfaceId;
  viewportId: string;
  path: string;
  fileName: string;
  viewportWidth: number;
  viewportHeight: number;
  operatorReviewRequired: true;
}

export interface PccLiveBreakpointSurfaceEvidence {
  surfaceId: PccLiveSurfaceId;
  label: string;
  viewportId: string;
  viewportLabel: string;
  grid: PccLiveGridMeasurement;
  cards: PccLiveCardMeasurement[];
  touchTargets: PccLiveTouchTargetMeasurement[];
  screenshot?: PccLiveBreakpointScreenshotArtifact;
  warnings: string[];
}

export interface PccLiveBreakpointEvidenceRun {
  runId: string;
  generatedAtIso: string;
  tenantSiteUrl: string;
  tenantPageUrl: string;
  expectedPackageVersion: string;
  selfSkipped: boolean;
  runState: 'completed' | 'self-skipped' | 'writer-test-only';
  evRefs: readonly PccEvidenceId[];
  surfaces: PccLiveBreakpointSurfaceEvidence[];
  summary: {
    totalSurfaceViewportPairs: number;
    totalScreenshots: number;
    totalCardsMeasured: number;
    totalTouchTargetsMeasured: number;
    totalWarnings: number;
    modeMismatchCount: number;
    horizontalOverflowCount: number;
    clippedCardCount: number;
    directChildIssueCount: number;
    touchTargetIssueCount: number;
  };
  warnings: string[];
  disclaimer: string;
}
```

Add compile-time guards:

- breakpoint EV tuple IDs are assignable to `PccEvidenceId`;
- responsive mode tuple does not widen to `string`;
- viewport tuple has 8 entries;
- EV tuple has 13 entries and is unique.

---

## Breakpoint Capture Module

Create:

```text
e2e/pcc-live/pcc-live.breakpoint-capture.ts
```

Required behavior:

1. Accept:
   - Playwright `Page`;
   - Prompt 04 `PccLivePageObject`;
   - eight surfaces;
   - viewport matrix;
   - output directory.
2. For each viewport:
   - set viewport size using `page.setViewportSize({ width, height })`;
   - navigate/reload PCC page through Prompt 04 page object;
   - wait for PCC root;
   - for each surface:
     - navigate via safe tab;
     - assert active surface through Prompt 04 page object;
     - measure grid/container/card/touch behavior;
     - capture a responsive screenshot.
3. Use deterministic screenshot names:
   - `breakpoint-{viewportId}-{surfaceId}.png`
4. Write screenshots under:
   - `<outputDir>/breakpoint-screenshots/`
5. Screenshot capture options:
   - `animations: 'disabled'`;
   - `caret: 'hide'`;
   - viewport screenshot only, not full-page;
   - mask likely sensitive controls using the same mask policy from Prompt 05.

Measurement requirements:

### Grid/container

Use stable selectors:

```text
[data-pcc-bento-grid]
[data-pcc-card]
[data-pcc-active-surface-panel]
```

Record:

- bounding rect width/height for first visible `[data-pcc-bento-grid]`;
- observed mode from `data-pcc-mode`;
- observed grid safety from `data-pcc-grid-safety`;
- derived mode from measured container width;
- expected columns from local matrix;
- document scroll width/client width;
- horizontal scroll / overflow flag.

### Cards

For each visible `[data-pcc-card]` up to a cap. Recommended cap: 120 per surface/viewport.

Record:

- data attributes listed above;
- bounding width/height;
- parsed numeric `data-pcc-column-span`;
- parsed numeric `data-pcc-row-span`;
- parsed numeric `data-pcc-measured-height`;
- whether direct parent is `[data-pcc-bento-grid]`;
- clipping/overflow observations using bounding rect and scroll dimensions;
- touch target issue count inside the card.

### Direct-child/card stability

A card is direct-child stable when:

```ts
card.parentElement?.matches('[data-pcc-bento-grid]') === true;
```

Record direct-child issues as warnings. Do not mutate DOM.

### Overflow/clipping

Record evidence, not final pass/fail.

Suggested checks:

- document horizontal overflow: `document.documentElement.scrollWidth > document.documentElement.clientWidth + 1`;
- card `scrollWidth > clientWidth + 1`;
- card `scrollHeight > clientHeight + 1`;
- bounding rect extends outside viewport or grid bounds by more than 1px.

### Touch targets

Measure interactive controls using selectors such as:

```text
button
a[href]
[role="button"]
[role="tab"]
input
select
textarea
[tabindex]:not([tabindex="-1"])
```

Exclude hidden/disabled controls.

Record:

- tag name;
- role;
- width/height;
- below recommended size.

Recommended threshold:

```text
44px x 44px for touch viewport rows
32px x 32px for non-touch viewport rows
```

Do not click touch targets during measurement.

### Sanitization

Do not persist full text content.

Do not persist href URLs with query strings.

Do not persist email/user/contact/body text.

Use only selectors, dimensions, stable data attributes, counts, and sanitized warnings.

---

## Breakpoint Evidence Writer

Create:

```text
e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts
```

Required output files:

```text
pcc-live-breakpoint-evidence.json
pcc-live-breakpoint-evidence.md
pcc-live-breakpoint-matrix.json
pcc-live-breakpoint-card-measurements.json
pcc-live-breakpoint-touch-targets.json
```

Write these under the provided run output directory:

```text
<PCC_EVIDENCE_OUTPUT_DIR>/breakpoints-<run-id>/
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
This output is breakpoint, container, overflow, rowspan, and touch evidence support for EV-59..EV-71 only. It is not a final scorecard result and does not mark any EV captured without operator review.
```

Markdown summary must include:

```text
run ID
generated timestamp
tenant site/page
expected package version
EV refs
viewport matrix summary
surface/viewport summary table
mode mismatch count
horizontal overflow count
clipped card count
direct-child issue count
touch target issue count
screenshot count
operator-review reminder
not-final-scoring disclaimer
```

Sanitization requirements:

- Reuse or duplicate conservative Prompt 04/05 sanitization logic.
- Sanitize all free-text fields written to JSON/markdown.
- Preserve safe curated repo/output paths.
- Exclude raw Playwright/auth/session paths from artifact references if artifact references are included.
- Do not serialize cookies, tokens, storageState, request/response payloads, raw console dumps, or headers.

---

## Breakpoint Spec

Create:

```text
e2e/pcc-live/pcc-live.breakpoint.spec.ts
```

Required tests:

### 1. Breakpoint EV tuple and viewport matrix are valid

No live env required.

Assert:

- EV tuple contains exactly `EV-59..EV-71`;
- every tuple ID exists in `REQUIRED_PCC_EVIDENCE_IDS`;
- no duplicate EV IDs;
- no EV outside Prompt 06 scope;
- viewport matrix contains exactly 8 rows;
- responsive mode tuple contains exactly 8 modes;
- threshold resolver returns the correct mode for representative values:
  - 320 -> phone
  - 480 -> tabletPortrait
  - 768 -> tabletPortrait
  - 769 -> tabletLandscape
  - 1024 -> tabletLandscape
  - 1025 -> smallLaptop
  - 1180 -> smallLaptop
  - 1181 -> standardLaptop
  - 1440 -> standardLaptop
  - 1441 -> largeLaptop
  - 1599 -> largeLaptop
  - 1600 -> desktop
  - 1919 -> desktop
  - 1920 -> ultrawide.

### 2. Breakpoint writer preserves sanitized output policy

No live env required.

Use temp directory and sample fake measurements.

Assert:

- writer produces all expected JSON/markdown files;
- safe curated path remains present if included;
- unsafe strings are not present in JSON/markdown:
  - email address;
  - token-like blob;
  - query string;
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
- screenshot records have `operatorReviewRequired: true`;
- no EV is represented as captured.

### 3. Breakpoint capture helpers preserve measurement boundaries

No live env required if using sample DOM in Playwright page.

Use `page.setContent(...)` with a small synthetic PCC-like DOM containing:

- `[data-pcc-bento-grid]`
- direct `[data-pcc-card]`
- nested/non-direct `[data-pcc-card]`
- touch targets with below-threshold dimensions

Assert:

- direct-child card is identified as stable;
- nested card is identified as not direct-child;
- card spans and row spans are parsed;
- touch target below threshold is identified;
- no text body is persisted in measurements.

This test may run in Playwright browser but must not require live tenant env.

### 4. Live breakpoint capture self-skips without live env

Live env required only if configured.

Use:

```ts
skipIfMissingPccLiveEnv(test);
```

When env is missing, this test self-skips clearly.

When env is configured:

- for each viewport in the matrix:
  - set viewport;
  - load `PCC_LIVE_PAGE_URL`;
  - navigate all eight surfaces through Prompt 04 page object;
  - measure breakpoint/container/card/touch data;
  - write output files under `PCC_EVIDENCE_OUTPUT_DIR`;
  - capture responsive screenshots;
- assert:
  - at least one grid measurement per surface/viewport;
  - all eight surfaces are represented;
  - all eight viewport IDs are represented;
  - screenshots have `operatorReviewRequired: true`;
  - output files exist.

Important:

- Do not stage generated screenshot/evidence artifacts.
- Closeout should report output directory path only plus counts.
- Do not print screenshot contents or raw file lists beyond safe output path/counts.

---

## Optional Root Script

If materially useful, add this opt-in-only script to root `package.json`:

```json
"pcc:e2e:breakpoints": "playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts"
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

Update `e2e/pcc-live/README.md` with a concise Prompt 06 section.

Include:

```text
breakpoint evidence purpose
viewport matrix
container-width vs browser-width distinction
resolved `data-pcc-mode` vs derived mode distinction
card span/rowspan/direct-child/overflow/touch evidence scope
EV-59..EV-71 initial support scope
operator-review requirement before committing screenshots/evidence
PCC_EVIDENCE_OUTPUT_DIR usage
run command
not-final-scoring disclaimer
```

Do not remove Prompt 01–05 safety posture.

---

## Evidence / EV Status Rules

Prompt 06 can generate breakpoint/container/overflow/rowspan/touch evidence support for:

```text
EV-59..EV-71
```

Prompt 06 must not:

- modify `PCC_EVIDENCE_REGISTRY` statuses;
- mark any EV as `captured`;
- calculate final scorecard status;
- mark hard stops passed/failed;
- imply Phase 4 readiness.

Use language like:

```text
initial responsive support
operator-review pending
breakpoint inventory ready for review
touch/overflow findings ready for review
```

Do not use language like:

```text
captured
passed
approved
complete
score-ready
Phase 4 ready
```

---

## Validation Commands

Run and report:

```bash
git status --short
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
```

If `package.json` is not changed, it is acceptable to omit `package.json` from the Prettier target.

Do not run live tenant breakpoint capture unless valid `PCC_LIVE_*` env and storageState are intentionally configured.

If a live run is performed, closeout must include:

```text
whether live breakpoint capture ran or self-skipped
whether screenshot/evidence files were written
output directory path only
viewport count
surface count
screenshot count
card measurement count
touch target measurement count
warnings count
no raw screenshot content
no cookies/tokens/storageState
```

---

## Acceptance Criteria

Prompt 06 is complete only when:

- breakpoint EV tuple is strict and valid;
- viewport matrix exists and has 8 rows;
- threshold resolver is tested at boundaries;
- breakpoint capture module exists;
- breakpoint evidence writer exists;
- breakpoint spec exists and self-skips live capture without env/storageState;
- all eight surfaces and all eight viewport rows are covered by live capture logic;
- browser viewport, measured PCC container width, observed mode, and derived mode are recorded;
- card spans, row spans, measured heights, hierarchy/tier/region/footprint attributes are recorded;
- direct-child card stability is measured;
- overflow/clipping is measured;
- touch targets are measured without clicking;
- responsive screenshots are marked `operatorReviewRequired: true`;
- writer produces all expected metadata/report files in tests;
- writer excludes unsafe raw/auth/session text from JSON/markdown;
- screenshot artifacts are not staged/committed automatically;
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

- Prompt 01–05 foundation files are missing;
- Prompt 04 URL-boundary/sanitization hardening is missing;
- Prompt 05 screenshot/writer safety posture is missing;
- existing Prompt 06 files conflict with this design;
- implementation requires PCC runtime/source edits;
- implementation requires Playwright config edits;
- implementation requires `.gitignore` changes;
- `pnpm-lock.yaml` changes;
- breakpoint capture would require clicking mutation controls;
- any writer would serialize cookies, storageState, tokens, raw traces/videos/HARs, raw Playwright outputs, request/response payloads, raw console dumps, or unsanitized text output;
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

Evidence / scorecard impact:

- Breakpoint/viewport matrix evidence tooling established.
- Container-width/resolved-mode/derived-mode capture established.
- Card span/rowspan/direct-child/overflow/touch target measurement established.
- Responsive screenshot support established.
- Initial EV-59..EV-71 evidence support established.
- Evidence remains operator-review pending.
- No final 100-point score calculated.
- No hard stop marked passed/failed.

Safety confirmation:

- No tenant mutation.
- Live breakpoint capture <ran/self-skipped/not run> with reason.
- No storageState committed.
- No raw Playwright artifacts committed.
- No raw console dumps committed.
- No responsive screenshot artifacts staged/committed automatically.
- No PCC runtime source modified.
- `pnpm-lock.yaml` unchanged.
- No EV marked captured.

Residual risks or pending items:

- <items>
```
