# PCC Playwright Near-Term Evidence-Harness Implementation Plan

## Objective

Implement the **Near-Term** PCC Playwright evidence-harness roadmap items so the live evidence suite becomes more useful for expert UI/UX review after the Immediate ROI package.

The goal is not broader raw coverage. The goal is **higher audit utility**: per-surface evidence packets, richer accessibility/semantic artifacts, state/source matrices, safe workflow scenario evidence, and stronger content/Mold Breaker review outputs.

## Assumptions

- Immediate ROI package work is complete or will be reconciled during Prompt 11 closeout.
- Current canonical scorecard path is `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`.
- Current Playwright-supported EV subset remains `EV-037..EV-106` and `EV-125..EV-134` unless explicitly changed by a separate approved taxonomy decision.
- Outputs are expert-review evidence support only.

## Workstream A — Per-Surface Evidence Packets

Create a per-surface packet layer that consolidates screenshots, breakpoint issues, accessibility issues, workflow findings, content findings, state/source evidence, and scorecard references into auditor-friendly packets.

Expected outputs:

```text
surface-evidence-packets/
  project-home.md
  team-and-access.md
  documents.md
  project-readiness.md
  approvals.md
  external-systems.md
  control-center-settings.md
  site-health.md
surface-evidence-packets.json
surface-evidence-packets.md
```

Acceptance criteria: exactly eight surface packets; each includes surface ID, label, EVs, P1–P9 refs, HS refs, artifact references, evidence gaps, expert-review questions, and no final score / hard-stop pass-fail / EV final capture / Phase 4 readiness claim.

## Workstream B — Focus Path Screenshots and Semantic Maps

Improve accessibility evidence from summary counts into artifacts that show keyboard path, focus visibility, landmarks, heading hierarchy, and ARIA relationships.

Expected outputs:

```text
pcc-live-focus-path-timeline.json
pcc-live-focus-path-timeline.md
focus-path-screenshots/
pcc-live-focus-screenshot-inventory.json
pcc-live-heading-map.json
pcc-live-heading-map.md
pcc-live-landmark-map.json
pcc-live-landmark-map.md
pcc-live-aria-relationship-map.json
pcc-live-aria-relationship-map.md
```

Acceptance criteria: focus path evidence identifies focus order, selector/locator, role, name presence, focus status, bounding box, screenshot reference where captured; maps avoid raw HTML and sensitive data.

## Workstream C — State / Source Matrix

Produce a structured matrix tying state kinds, source systems, source confidence, freshness, read-only/deferred/preview/demo posture, and HBI authority boundaries to surfaces and cards.

Expected outputs:

```text
pcc-live-state-source-matrix.json
pcc-live-state-source-matrix.md
pcc-live-source-system-matrix.json
pcc-live-source-system-matrix.md
pcc-live-state-copy-quality-matrix.md
pcc-live-hbi-source-authority-matrix.md
```

Acceptance criteria: normalized states/sources; HBI remains advisory/assistive; observed/missing/operator-pending status is visible.

## Workstream D — Workflow Scenario Scripts

Move beyond static action inventory into safe, non-mutating workflow scenario evidence.

Expected outputs:

```text
pcc-live-workflow-scenario-evidence.json
pcc-live-workflow-scenario-evidence.md
pcc-live-workflow-scenario-index.json
pcc-live-false-affordance-scenario-register.json
pcc-live-false-affordance-scenario-register.md
```

Acceptance criteria: scenarios are inspection-only; mutation-looking labels are blocked; no-click reasons are recorded.

## Workstream E — Content / Mold Breaker Reports

Turn content extraction into stronger scorecard support for construction language, source clarity, HBI authority boundaries, generic SaaS risk, incumbent mimicry, command-center clarity, and progressive disclosure.

Expected outputs:

```text
visible-copy-corpus-by-card.json
visible-copy-corpus-by-card.md
construction-language-report.md
generic-saas-language-risk-report.md
mold-breaker-incumbent-failure-map.md
command-center-language-report.md
hbi-authority-language-report.md
```

Acceptance criteria: copy records grouped by surface/card/hierarchy/region/kind; construction-language and generic-SaaS risks are review support only.

## Workstream F — Integrated Closeout

Validate all Near-Term outputs together.

Expected outputs:

```text
near-term-evidence-closeout.json
near-term-evidence-closeout.md
near-term-residual-risk-register.md
near-term-artifact-index.md
```

## Standard Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check e2e/pcc-live docs/architecture/evidence/pcc-live docs/reference/spfx-surfaces/project-control-center
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```
