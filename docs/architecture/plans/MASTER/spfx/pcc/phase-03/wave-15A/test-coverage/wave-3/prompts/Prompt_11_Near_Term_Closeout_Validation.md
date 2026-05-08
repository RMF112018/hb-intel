# Local Code Agent Prompt — PCC Playwright Near-Term Evidence-Harness Package

Repository: `RMF112018/hb-intel`

You are implementing a narrowly scoped enhancement to the PCC live Playwright evidence harness. This is not a PCC product UI remediation sprint.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Non-Negotiable Boundaries

- Do not produce a final 100-point score.
- Do not mark hard stops as passed or failed.
- Do not mark EVs as finally captured by automation.
- Do not claim Phase 4 readiness.
- Do not introduce live tenant mutation.
- Do not click save, submit, approve, reject, delete, sync, upload, provision, or writeback controls in a live tenant.
- Do not commit storageState files, cookies, auth/session data, raw traces, videos, HAR files, raw `test-results/`, raw `playwright-report/`, unsanitized console dumps, or unsanitized screenshots.
- Do not change PCC product UI runtime unless the prompt explicitly requires a missing evidence marker and the change is minimal, safe, and validated.
- Do not change dependencies, lockfile, SPFx manifests, or package-solution metadata unless explicitly justified and approved.

## Canonical Scorecard Reference

Use only this durable scorecard path in new evidence/source references:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
```

Do not introduce durable `_v2` scorecard references.

## Required Validation Posture

Run targeted validation for your prompt scope and report exact commands/results. At minimum, use targeted Playwright specs for files you modify, `pnpm exec prettier --check` on changed paths, `git diff --check`, and lockfile hash before/after if package files are touched.


# Prompt 11 — Near-Term Closeout Validation

## Objective

Perform final Near-Term package closeout validation across Prompts 01–10.

This prompt covers integrated closeout for Near-Term Roadmap Items 7–11.

## Required Repo-Truth Intake

Inspect current changed files from this Near-Term package only and relevant final outputs/specs under `e2e/pcc-live/`, `docs/architecture/evidence/pcc-live/`, and `docs/reference/spfx-surfaces/project-control-center/`.

## Required Output Checks

Confirm these are present in writer contracts and tested, or explicitly deferred:

```text
surface-evidence-packets.json
surface-evidence-packets.md
surface-evidence-packets/<surface-id>.md
pcc-live-focus-path-timeline.json
pcc-live-focus-path-timeline.md
pcc-live-focus-screenshot-inventory.json
pcc-live-heading-map.json
pcc-live-heading-map.md
pcc-live-landmark-map.json
pcc-live-landmark-map.md
pcc-live-aria-relationship-map.json
pcc-live-aria-relationship-map.md
pcc-live-state-source-matrix.json
pcc-live-state-source-matrix.md
pcc-live-source-system-matrix.json
pcc-live-source-system-matrix.md
pcc-live-state-copy-quality-matrix.md
pcc-live-hbi-source-authority-matrix.md
pcc-live-workflow-scenario-evidence.json
pcc-live-workflow-scenario-evidence.md
pcc-live-workflow-scenario-index.json
pcc-live-false-affordance-scenario-register.json
pcc-live-false-affordance-scenario-register.md
visible-copy-corpus-by-card.json
visible-copy-corpus-by-card.md
construction-language-report.md
command-center-language-report.md
hbi-authority-language-report.md
generic-saas-language-risk-report.md
mold-breaker-incumbent-failure-map.md
progressive-disclosure-language-report.md
construction-tech-differentiation-review.md
```

## Boundary Checks

Confirm no final score, no hard-stop pass/fail, no EV final capture, no Phase 4 readiness claim, no live tenant mutation, no raw auth/session artifacts, no raw traces/videos/HAR, no raw `test-results/` or `playwright-report/`, no unsafe screenshots auto-committed, no durable `_v2` refs, and no package/lockfile/manifest drift unless approved.

## Validation Commands

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check e2e/pcc-live docs/architecture/evidence/pcc-live docs/reference/spfx-surfaces/project-control-center
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Closeout Report

Produce objective, files changed, outputs added, tests added, validation, improvements by roadmap item 7–11, safety/no-mutation/no-scoring boundary confirmation, residual risks, and recommended next workstream.
