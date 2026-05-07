# Prompt 04 — PCC Surface Page Object, Navigation, Runtime Smoke, and Baseline EV-52 / EV-55 Evidence

## Role

You are the local code agent implementing **Prompt 04** for the PCC 100-Point UI/UX Mold Breaker Scorecard evidence automation track in the `RMF112018/hb-intel` repository.

You are implementing a **safe live SharePoint page object, surface registry, navigation/runtime smoke spec, and sanitized baseline evidence writer** for the Project Control Center.

You are **not** implementing full screenshot suites, breakpoint sweeps, accessibility scans, final scorecard scoring, hard-stop pass/fail decisions, or PCC runtime/source changes.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

---

## Critical Context

Prompt 01 established the PCC live Playwright harness foundation:

```text
playwright.pcc-live.config.ts
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.runtime.spec.ts
e2e/pcc-live/README.md
```

Prompt 02 established evidence registry and manifest infrastructure:

```text
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-evidence.manifest.ts
e2e/pcc-live/pcc-evidence.registry.spec.ts
```

Prompt 03 established scorecard pillar/hard-stop traceability:

```text
e2e/pcc-live/pcc-scorecard.types.ts
e2e/pcc-live/pcc-scorecard.model.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
e2e/pcc-live/pcc-scorecard.traceability.spec.ts
```

The attached Prompt 04 objective was:

```text
Implement PCC live page object, selectors, surface registry, and smoke spec. Navigate all eight surfaces in SharePoint, verify active panels, bento grid, cards, shell/host boundary basics, and write EV-52/EV-55 baseline evidence.
```

This updated prompt expands that objective into a deterministic, safe, and auditable implementation contract.

---

## Governing References

Use current repo truth from these references:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
docs/explanation/design-decisions/con-tech-ui-study.md
docs/explanation/design-decisions/con-tech-ux-study.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
e2e/pcc-live/pcc-live.env.ts
e2e/pcc-live/pcc-live.runtime.spec.ts
e2e/pcc-live/pcc-evidence.manifest.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
```

Known surface IDs from repo truth:

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

Known surface labels from repo truth:

```text
Project Home
Team & Access
Documents
Project Readiness
Approvals
External Platforms
Control Center Settings
Site Health
```

Critical distinction:

```text
Automate evidence traceability and reproducibility.
Do not automatically calculate the final 100-point score.
Do not mark hard stops passed/failed.
Final scoring and final hard-stop disposition remain expert-review-only.
```

---

## Repo-Truth Gate Before Editing

Before editing, verify current checkout has Prompt 01–03 foundation.

Run/inspect enough to confirm:

```bash
git status --short
test -f playwright.pcc-live.config.ts
test -f e2e/pcc-live/pcc-live.env.ts
test -f e2e/pcc-live/pcc-live.runtime.spec.ts
test -f e2e/pcc-live/pcc-evidence.types.ts
test -f e2e/pcc-live/pcc-evidence.registry.ts
test -f e2e/pcc-live/pcc-evidence.manifest.ts
test -f e2e/pcc-live/pcc-scorecard.traceability.ts
test -f packages/models/src/pcc/PccMvpSurfaces.ts
test -f apps/project-control-center/src/shell/PccHorizontalTabs.tsx
test -f docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Inspect only as needed:

```bash
sed -n '1,220p' packages/models/src/pcc/PccMvpSurfaces.ts
sed -n '1,220p' apps/project-control-center/src/shell/PccHorizontalTabs.tsx
sed -n '1,220p' e2e/pcc-live/pcc-live.runtime.spec.ts
sed -n '1,260p' e2e/pcc-live/pcc-evidence.manifest.ts
```

Stop and report if:

- any Prompt 01–03 foundation file is missing;
- surface IDs differ materially from the expected eight-surface list;
- existing Prompt 04 files already exist and conflict with this design;
- implementation appears to require PCC runtime/source edits;
- live navigation would require clicking mutation controls.

---

## Objective

Implement a safe live-runtime navigation layer that can:

1. Represent all eight PCC surfaces in a typed local e2e surface registry.
2. Provide a Playwright page object for loading PCC in SharePoint and navigating by safe tab controls.
3. Verify shell/navigation/runtime basics for all eight surfaces:
   - PCC tab exists;
   - tab role and active state are correct;
   - active surface panel exists;
   - bento grid exists;
   - cards exist;
   - shell/host boundary basics are present;
   - no obvious page/runtime error is captured in sanitized summary.
4. Write sanitized baseline evidence artifacts supporting:
   - `EV-52` SharePoint-hosted runtime evidence;
   - `EV-55` Tenant-hosted navigation evidence.
5. Preserve the status boundary:
   - EV-52 / EV-55 artifacts can be produced as **baseline evidence output**;
   - registry status must not be automatically changed to `captured`;
   - final capture acceptance remains operator/expert-review gated.

---

## Required Files To Add

Create these files unless repo truth shows equivalent files already exist:

```text
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
```

Update these existing files only if needed:

```text
e2e/pcc-live/README.md
package.json
```

Do not create committed live run artifacts in this prompt. Live run artifacts should be written only when the live spec is intentionally run with valid env/storageState. They should be operator-reviewed before commit.

---

## Files Allowed To Modify

Allowed:

```text
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.page-object.ts
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
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
e2e/pcc-live/pcc-live.runtime.spec.ts
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

- click save, submit, approve, reject, delete, provision, sync, edit-page, publish, or mutation controls;
- run SharePoint/Graph/Procore/Sage/Autodesk/Document Crunch/Adobe Sign mutations;
- modify tenant data;
- commit storageState/session files;
- commit raw traces/videos/HARs;
- commit raw `test-results/` or raw `playwright-report/`;
- commit unsanitized console dumps;
- serialize cookies, tokens, storageState, request headers, personal data, or auth/session context;
- mark any EV as `captured` in the registry;
- calculate the final 100-point score;
- mark hard stops as passed or failed.

Navigation is allowed only through PCC tab controls that satisfy:

```text
role="tab"
data-pcc-tab-id="<surface-id>"
type="button"
```

Do not use SharePoint-generated CSS class names as primary selectors.

---

## Required Surface Registry

Create:

```text
e2e/pcc-live/pcc-live.surfaces.ts
```

Export a strict eight-surface tuple and typed registry.

Required surface IDs:

```ts
export const PCC_LIVE_SURFACE_IDS = [
  'project-home',
  'team-and-access',
  'documents',
  'project-readiness',
  'approvals',
  'external-systems',
  'control-center-settings',
  'site-health',
] as const;
```

Required surface labels:

```text
project-home -> Project Home
team-and-access -> Team & Access
documents -> Documents
project-readiness -> Project Readiness
approvals -> Approvals
external-systems -> External Platforms
control-center-settings -> Control Center Settings
site-health -> Site Health
```

Required types/interfaces:

```ts
export type PccLiveSurfaceId = (typeof PCC_LIVE_SURFACE_IDS)[number];

export interface PccLiveSurfaceDefinition {
  id: PccLiveSurfaceId;
  label: string;
  expectedTabSelector: string;
  expectedActivePanelSelector: string;
  expectedHeroOrHeadingText?: string;
  expectedEvRefs: readonly ('EV-52' | 'EV-55')[];
}
```

Recommended selector strategy:

```ts
expectedTabSelector: `[data-pcc-tab-id="${id}"]`
expectedActivePanelSelector: `[data-pcc-active-surface-panel="${id}"]`
```

Add compile-time guards:

- surface ID does not widen to `string`;
- surface tuple length is 8;
- registry keys exactly match tuple IDs.

Do not import runtime app code from `apps/project-control-center/src/**`.

It is acceptable to duplicate the eight ID strings locally for e2e stability, but comments should state they are verified against `packages/models/src/pcc/PccMvpSurfaces.ts`.

---

## Required Page Object

Create:

```text
e2e/pcc-live/pcc-live.page-object.ts
```

The page object should encapsulate selectors and safe actions.

Recommended class:

```ts
export class PccLivePageObject {
  constructor(private readonly page: Page) {}

  async goto(pageUrl: string): Promise<void>;
  async waitForPccRoot(): Promise<void>;
  async getRootMarkerCounts(): Promise<Record<string, number>>;
  async getConsoleAndPageErrorSummary(): Promise<PccLiveRuntimeErrorSummary>;
  async navigateToSurface(surface: PccLiveSurfaceDefinition): Promise<void>;
  async assertSurfaceActive(surface: PccLiveSurfaceDefinition): Promise<PccLiveSurfaceSmokeResult>;
  async inspectAllSurfaces(surfaces: readonly PccLiveSurfaceDefinition[]): Promise<PccLiveSurfaceSmokeResult[]>;
}
```

Selectors to support:

```text
[data-pcc-horizontal-tabs]
[data-pcc-tab-id]
[data-pcc-tab-active]
[data-pcc-active-surface-panel]
[data-pcc-bento-grid]
[data-pcc-card]
[data-pcc-card-hierarchy]
[data-pcc-card-tier]
[data-pcc-card-region]
[data-pcc-footprint]
[data-pcc-heading-level]
```

Page object requirements:

1. Use only stable `data-pcc-*` selectors and ARIA roles for PCC assertions.
2. Wait for root PCC markers with bounded timeouts.
3. Navigate by clicking the tab for each surface.
4. Before clicking, assert the target is a tab and not a mutation control.
5. After clicking, assert:
   - target tab has `aria-selected="true"` or `data-pcc-tab-active="true"`;
   - active surface panel selector is present;
   - at least one bento grid exists;
   - at least one card exists;
   - card count and grid count are captured;
   - URL remains HTTPS and inside the expected tenant/page origin.
6. Capture console/page errors only as sanitized counts and short message classifications.
7. Do not store raw console dumps.
8. Do not store cookies, headers, localStorage, sessionStorage, or request bodies.
9. Do not take screenshots in Prompt 04 unless a later prompt explicitly asks for screenshot evidence.

If a surface tab is missing, fail with a clear operator message identifying the missing surface ID and selector.

---

## Runtime Error Sanitization Requirements

Define sanitized error summary types, either in `pcc-live.page-object.ts` or `pcc-live.evidence-writer.ts`.

Only store:

```text
type
count
messageHash or short sanitized message
surfaceId if applicable
```

Do not store:

```text
full stack traces
URLs with auth query strings
cookies
tokens
headers
storageState
PII
request/response payloads
```

A simple sanitizer is acceptable:

- truncate message to 240 characters;
- remove query strings from URLs;
- replace email-like values with `[redacted-email]`;
- replace long hex/base64-like tokens with `[redacted-token]`.

---

## Required Evidence Writer

Create:

```text
e2e/pcc-live/pcc-live.evidence-writer.ts
```

The writer must produce sanitized baseline runtime evidence only when the live spec actually runs with valid env.

Required output files, written under `env.evidenceOutputDir`:

```text
pcc-live-surface-smoke.json
pcc-live-surface-smoke.md
```

Optionally call `writePccEvidenceManifest(...)` from Prompt 02 to also write:

```text
pcc-evidence-manifest.json
pcc-evidence-summary.md
```

If using the manifest writer, pass only sanitized artifact path references.

Evidence JSON must include:

```ts
runId
generatedAtIso
tenantSiteUrl
tenantPageUrl
expectedPackageVersion
evRefs: ['EV-52', 'EV-55']
surfaces: PccLiveSurfaceSmokeResult[]
summary:
  totalSurfaces
  passedSurfaces
  failedSurfaces
  totalGridCount
  totalCardCount
  consoleErrorCount
  pageErrorCount
warnings
disclaimer
```

Required disclaimer:

```text
This output is baseline live-runtime evidence for EV-52 and EV-55 only. It is not a final scorecard result and does not mark any EV captured without operator review.
```

Markdown summary must include:

```text
run ID
generated timestamp
tenant site/page
expected package version
EV refs EV-52 and EV-55
surface table for all eight surfaces
grid/card counts
console/page-error counts
warnings
not-final-scoring disclaimer
operator-review reminder
```

The writer must filter output path references using existing Prompt 02 artifact safety rules where possible. Do not write raw Playwright report artifacts.

---

## Required Smoke Spec

Create:

```text
e2e/pcc-live/pcc-live.surface-smoke.spec.ts
```

Tests must self-skip clearly when `PCC_LIVE_*` env/storageState is missing by using the existing Prompt 01 helper:

```ts
skipIfMissingPccLiveEnv(test)
```

Recommended tests:

1. `PCC live surface registry is complete and selector-safe`
   - No live env needed.
   - Asserts exactly 8 surfaces.
   - Asserts every surface has a `data-pcc-tab-id` selector.
   - Asserts every surface has a `data-pcc-active-surface-panel` selector.
   - Asserts only EV-52 / EV-55 refs are used for Prompt 04 surface smoke evidence.

2. `PCC hosted runtime exposes root shell markers`
   - Self-skips if live env missing.
   - Loads `PCC_LIVE_PAGE_URL`.
   - Asserts horizontal tabs, at least one bento grid, and at least one card.

3. `PCC hosted runtime navigates all eight surfaces through safe tabs`
   - Self-skips if live env missing.
   - Loads `PCC_LIVE_PAGE_URL`.
   - Uses the page object to navigate all eight surfaces by tab.
   - Verifies active tab/panel/grid/card for each surface.
   - Writes sanitized baseline evidence to `PCC_EVIDENCE_OUTPUT_DIR`.

4. Optional: `PCC smoke evidence writer preserves sanitized output policy`
   - No live env needed.
   - Uses temp directory.
   - Writes sample sanitized results.
   - Asserts output excludes `storageState`, cookies, tokens, raw traces, raw Playwright paths, and auth/session strings.
   - Asserts curated artifact paths are safe.

The live tests must not run or fail when env is absent; they must self-skip clearly.

---

## Evidence / EV Status Rules

Prompt 04 can generate baseline evidence artifacts that support:

```text
EV-52 SharePoint-hosted runtime evidence
EV-55 Tenant-hosted navigation evidence
```

Prompt 04 must not:

- modify `PCC_EVIDENCE_REGISTRY` statuses;
- mark EV-52 or EV-55 as `captured`;
- calculate final scorecard status;
- mark HS-08 / HS-09 passed;
- imply Phase 4 readiness.

Use language like:

```text
supports EV-52 / EV-55 baseline review
operator-review required before captured status
```

Do not use language like:

```text
EV-52 captured
EV-55 passed
HS-08 passed
HS-09 passed
scorecard complete
```

---

## Optional Root Script

If materially useful, add this opt-in-only script to root `package.json`:

```json
"pcc:e2e:surface-smoke": "playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts"
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

Update `e2e/pcc-live/README.md` with a concise Prompt 04 section.

Include:

```text
surface smoke purpose
eight-surface list
safe-tab navigation rule
EV-52 / EV-55 baseline evidence support
evidence output files
PCC_EVIDENCE_OUTPUT_DIR usage
operator-review requirement before committing curated evidence
never-commit artifact reminder
run command
not-final-scoring disclaimer
```

Do not remove Prompt 01–03 safety posture.

---

## Validation Commands

Run and report:

```bash
git status --short
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

Do not run live tenant tests unless valid `PCC_LIVE_*` env and storageState are intentionally configured. When env is absent, live tests should self-skip clearly and the no-env registry/writer tests should pass.

If a live run is performed, closeout must include:

```text
whether live tests ran or self-skipped
whether evidence files were written
the output directory path only
no raw artifact content
no cookies/tokens/storageState
```

---

## Acceptance Criteria

Prompt 04 is complete only when:

- all eight surfaces are represented in a typed e2e surface registry;
- page object uses stable `data-pcc-*` selectors and ARIA roles;
- page object never clicks mutation controls;
- no SharePoint-generated CSS class names are used as primary selectors;
- live tests self-skip clearly without env/storageState;
- root marker smoke can verify PCC shell basics when env is configured;
- navigation smoke can visit all eight surfaces through safe tabs when env is configured;
- active tab/panel, bento grid, and card presence are verified per surface;
- sanitized baseline EV-52 / EV-55 evidence writer exists;
- evidence output does not serialize secrets, storageState, cookies, tokens, raw traces, videos, HARs, request/response payloads, or raw Playwright report output;
- curated evidence path remains repo-visible and is not ignored;
- Prompt 02 registry tests still pass;
- Prompt 03 traceability tests still pass;
- no EV is marked captured in registry;
- no hard stop is marked passed/failed;
- no final 100-point score is calculated or implied;
- no PCC runtime/source files are modified;
- `pnpm-lock.yaml` is unchanged.

---

## Stop Conditions

Stop and report instead of continuing if:

- Prompt 01–03 foundation files are missing;
- surface IDs cannot be verified;
- existing Prompt 04 files conflict with this design;
- implementation requires PCC runtime/source edits;
- implementation requires Playwright config edits;
- implementation requires `.gitignore` changes;
- `pnpm-lock.yaml` changes;
- page object would need to click a mutation control;
- any evidence writer would serialize cookies, storageState, tokens, raw traces/videos/HARs, raw Playwright outputs, or unsanitized console output;
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
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-smoke.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-evidence.registry.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts` — <result>
- `pnpm exec playwright test --config=playwright.pcc-live.config.ts --list` — <result>
- `pnpm exec prettier --check --ignore-unknown e2e/pcc-live package.json` — <result or adjusted command with reason>
- `git diff --check` — <result>
- `pnpm --filter @hbc/spfx-project-control-center check-types` — <result>
- `pnpm --filter @hbc/spfx-project-control-center test` — <result>

Evidence / scorecard impact:
- Surface page object established.
- Eight-surface live navigation smoke established.
- Baseline EV-52 / EV-55 evidence writer established.
- EV-52 / EV-55 support remains operator-review pending.
- No final 100-point score calculated.
- No hard stop marked passed/failed.

Safety confirmation:
- No tenant mutation.
- Live tenant run <ran/self-skipped/not run> with reason.
- No storageState committed.
- No raw Playwright artifacts committed.
- No raw console dumps committed.
- No PCC runtime source modified.
- `pnpm-lock.yaml` unchanged.
- No EV marked captured.

Residual risks or pending items:
- <items>
```
