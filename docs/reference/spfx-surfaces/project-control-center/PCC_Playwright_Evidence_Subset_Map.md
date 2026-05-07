# PCC Playwright Evidence Subset Map

**Document Status:** Canonical Playwright subset map  
**Related Taxonomy:** `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Evidence_Taxonomy.md`  
**Related Runbook:** `docs/architecture/evidence/pcc-live/README.md`

## 1. Purpose

This document maps the current live PCC Playwright suite to the PCC 100-point UI/UX evidence taxonomy.

The current Playwright subset covers 80 evidence IDs:

```text
EV-037..EV-106
EV-125..EV-134
```

## 2. Commands

```bash
pnpm pcc:e2e:live:list
pnpm pcc:e2e:live
pnpm pcc:e2e:evidence:registry
```

## 3. Environment Variables

Required:

```bash
PCC_LIVE_SITE_URL
PCC_LIVE_PAGE_URL
PCC_LIVE_STORAGE_STATE
PCC_EVIDENCE_OUTPUT_DIR
PCC_EXPECTED_PACKAGE_VERSION
```

Optional:

```bash
PCC_LIVE_BRAVE_EXECUTABLE_PATH
PCC_LIVE_EDIT_PAGE_URL
PCC_LIVE_UNAUTHORIZED_STORAGE_STATE
PCC_LIVE_UNAUTHORIZED_PAGE_URL
PCC_LIVE_ENABLE_CONDITIONAL
```

## 4. Spec-to-EV Map

| Spec / Source | EV Coverage | Primary Purpose |
|---|---|---|
| `pcc-evidence.registry.spec.ts` | EV-037..EV-106, EV-125..EV-134 | Registry validity and traceability coverage. |
| `pcc-scorecard.traceability.spec.ts` | EV subset to P1..P9 and HS-01..HS-10 | Scorecard/hard-stop mapping and manual worksheet generation. |
| `pcc-live.surface-smoke.spec.ts` | EV-052, EV-055 | Hosted root markers and safe navigation across eight surfaces. |
| `pcc-live.screenshot.spec.ts` | EV-037..EV-049, EV-125..EV-134 | Screenshot, DOM card summary, above-fold, full-page, scroll-segment evidence. |
| `pcc-live.breakpoint.spec.ts` | EV-059..EV-071 | Responsive modes, grid/card measurements, row spans, overflow, touch targets. |
| `pcc-live.accessibility.spec.ts` | EV-072..EV-082 | Axe, keyboard focus, ARIA, contrast, reduced motion, hover-only, dialog focus, touch target evidence. |
| `pcc-live.workflow.spec.ts` | EV-083..EV-106 | Actions, disabled reasons, read-only/preview, source boundaries, false affordance, HBI authority. |
| `pcc-live.content.spec.ts` | EV-083..EV-106 support | Visible copy, construction language, state copy, source/HBI/disabled reason review support. |
| `pcc-live.doctrine-source.spec.ts` | EV-037..EV-058 | Governing docs, scorecard, Mold Breaker studies, source index, conformance maps. |
| `pcc-live.conditional.spec.ts` | EV-057, EV-067, EV-068, EV-082, EV-093..EV-106 | Edit mode, high zoom, short height, drawer/modal, unauthorized, special states. |
| `pcc-live.surface-blocks.spec.ts` | EV-125..EV-134 | Surface blocks, shared primitive block, cross-surface evidence index. |
| `pcc-live.scorecard-report.spec.ts` | EV coverage matrix / P1..P9 / HS-01..HS-10 | Final audit package for expert review; no scoring. |

## 5. Output Artifact Map

### Surface Smoke

```text
pcc-live-surface-smoke.json
pcc-live-surface-smoke.md
```

### Screenshot / DOM

```text
pcc-live-screenshot-evidence.json
pcc-live-screenshot-evidence.md
pcc-live-screenshot-inventory.json
pcc-live-dom-card-summary.json
screenshots/*.png
```

### Breakpoint

```text
pcc-live-breakpoint-evidence.json
pcc-live-breakpoint-evidence.md
pcc-live-breakpoint-matrix.json
pcc-live-breakpoint-card-measurements.json
pcc-live-breakpoint-touch-targets.json
```

### Accessibility

```text
pcc-live-accessibility-evidence.json
pcc-live-accessibility-evidence.md
pcc-live-axe-summary.json
pcc-live-keyboard-focus-summary.json
pcc-live-aria-label-summary.json
pcc-live-contrast-summary.json
```

### Workflow

```text
pcc-live-workflow-evidence.json
pcc-live-workflow-evidence.md
pcc-live-action-summary.json
pcc-live-state-summary.json
pcc-live-source-summary.json
pcc-live-false-affordance-summary.json
pcc-live-hbi-authority-summary.json
```

### Content

```text
pcc-live-content-evidence.json
pcc-live-content-evidence.md
extracted-visible-copy.json
content-findings.json
construction-review.md
state-copy-review.md
source-of-record-review.md
hbi-authority-review.md
disabled-reason-review.md
```

### Doctrine / Source / Mold Breaker

```text
pcc-live-doctrine-source-evidence.json
pcc-live-doctrine-source-evidence.md
governing-doc-verification.json
source-file-index.json
source-file-index.md
doctrine-conformance-map.json
doctrine-conformance-map.md
mold-breaker-review.md
incumbent-failure-mode-map.md
cognitive-load-review.md
progressive-disclosure-review.md
field-office-continuity-review.md
primitive-source-review.md
surface-source-review.md
state-source-review.md
test-coverage-review.md
package-version-proof.md
```

### Conditional

```text
pcc-live-conditional-evidence.json
pcc-live-conditional-evidence.md
pcc-live-conditional-setup-summary.json
pcc-live-conditional-state-summary.json
pcc-live-conditional-layout-summary.json
pcc-live-conditional-focus-summary.json
pcc-live-conditional-auth-summary.json
```

### Surface Blocks

```text
pcc-live-surface-blocks-evidence.json
pcc-live-surface-blocks-evidence.md
surface-block-index.json
surface-block-index.md
blocks/*-surface-block.json
blocks/*-surface-block.md
primitive-evidence-summary.md
cross-surface-gap-register.md
```

### Scorecard Report Package

```text
pcc-live-scorecard-report.json
pcc-live-scorecard-report.md
executive-review-summary.md
audit-package-index.json
audit-package-index.md
evidence-coverage-matrix.json
evidence-coverage-matrix.md
pillar-evidence-map.json
pillar-evidence-map.md
hard-stop-worksheet.json
hard-stop-worksheet.md
expert-scoring-worksheet.json
expert-scoring-worksheet.md
findings-register.json
findings-register.md
residual-risk-register.json
residual-risk-register.md
artifact-inventory.json
artifact-inventory.md
manual-review-checklist.md
final-report-readme.md
```

## 6. Output Interpretation

Playwright outputs may support:

- Evidence traceability.
- Screenshot proof.
- Runtime proof.
- Breakpoint proof.
- Accessibility proof.
- Workflow and false-affordance review.
- Source-of-record review.
- HBI authority review.
- Surface evidence blocks.
- Expert scoring package assembly.

Playwright outputs must not be treated as:

- Final score.
- Final Phase 4 readiness approval.
- Final hard-stop disposition.
- Automatic evidence capture completion.
- Production deployment approval.
