# Comprehensive Implementation Plan

## 1. Objective

Build a scorecard evidence and audit-support system for PCC Phase 3 closeout / Phase 4 readiness evaluation. The system must collect hosted runtime evidence and produce reproducible scoring support aligned to the 100-point PCC UI/UX Mold Breaker scorecard.

## 2. Key Principle

The final score cannot be fully automated. The system must separate:

| Area | Automation Level |
|---|---|
| Screenshots, console logs, runtime errors, breakpoints, DOM markers | Highly automatable |
| Keyboard/focus/ARIA/disabled-control checks | Highly automatable |
| Accessibility scans and contrast | Partially/highly automatable with axe + computed checks |
| Source/doctrine file inventory | Automatable |
| Mold Breaker differentiation | Expert review supported by structured evidence |
| Cognitive load and visual polish scoring | Expert review supported by screenshots and heuristics |
| Final 100-point scoring | Human/expert-scored using generated evidence |

## 3. Implementation Workstreams

### Workstream A — Hosted Playwright Evidence

- Add PCC live Playwright config.
- Add auth/storageState docs.
- Add page object and surface registry.
- Add screenshot, runtime, breakpoint, accessibility, and workflow specs.
- Generate evidence artifacts under `artifacts/pcc-live-evidence/<run-id>/`.

### Workstream B — Evidence Registry and Manifest

- Register every EV ID.
- Require every EV ID to resolve to a status.
- Output `manifest.json`, `evidence-summary.md`, `coverage-matrix.md`, and `pending-evidence.md`.

### Workstream C — Scorecard Traceability

- Map every EV to pillars, subcategories, and hard stops.
- Generate `pillar-evidence-map.md` and `hard-stop-evidence-map.md`.
- Generate a scoring worksheet with blank/manual scoring fields and evidence references.

### Workstream D — Doctrine and Source Audit

- Verify governing docs exist.
- Extract source file references for shell, tabs, cards, bento, state, surfaces, tests, manifest/package.
- Produce doctrine conformance artifacts.

### Workstream E — Mold Breaker and Content Audit

- Compare PCC evidence to construction-tech UI/UX failure modes.
- Extract visible copy from hosted PCC and source where needed.
- Review construction language, state copy, HBI authority language, source-of-record clarity, and next-action clarity.

### Workstream F — Final Audit Package

- Assemble scorecard-ready package.
- Include evidence index, findings register, hard-stop checklist, and Phase 4 readiness statement.
- Distinguish automated results from expert-review findings.

## 4. File Architecture

```text
playwright.pcc-live.config.ts
e2e/pcc-live/
  README.md
  pcc-live.env.ts
  pcc-live.surfaces.ts
  pcc-live.viewports.ts
  pcc-live.selectors.ts
  pcc-live.evidence-types.ts
  pcc-live.evidence-registry.ts
  pcc-live.evidence-writer.ts
  pcc-live.scorecard-map.ts
  pcc-live.page.ts
  pcc-live.runtime.spec.ts
  pcc-live.screenshots.spec.ts
  pcc-live.breakpoints.spec.ts
  pcc-live.accessibility.spec.ts
  pcc-live.states-actions.spec.ts
  pcc-live.conditional.spec.ts
  pcc-live.content-extraction.spec.ts
  pcc-live.evidence-blocks.spec.ts
  pcc-live.report.spec.ts
tools/pcc-scorecard/
  generate-scorecard-package.ts
  doctrine-source-audit.ts
  mold-breaker-audit-template.ts
  content-language-audit.ts
```

## 5. Environment

```bash
export PCC_LIVE_SITE_URL="https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject"
export PCC_LIVE_PAGE_URL="https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject"
export PCC_LIVE_STORAGE_STATE="$HOME/.config/hbc/pcc-sp-auth.json"
export PCC_EVIDENCE_OUTPUT_DIR="artifacts/pcc-live-evidence"
export PCC_EXPECTED_PACKAGE_VERSION="1.0.0.16"
```

## 6. Evidence Output

```text
artifacts/pcc-live-evidence/<run-id>/
  manifest.json
  evidence-summary.md
  coverage-matrix.md
  pending-evidence.md
  screenshots/
  console/
  runtime/
  accessibility/
  breakpoints/
  surfaces/
  workflows/
  scorecard/
```

## 7. Validation

Minimum validation after implementation:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:live
pnpm exec prettier --check playwright.pcc-live.config.ts e2e/pcc-live tools/pcc-scorecard package.json .gitignore
git diff --check
```
