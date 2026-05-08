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


# Prompt 07 — Workflow Scenario Scripts with No-Mutation Guardrails

## Objective

Add safe, inspection-only **workflow scenario scripts** for PCC live evidence.

This prompt covers Near-Term Roadmap Item 10, first half.

## Required Repo-Truth Intake

Inspect workflow types/capture/writer/spec, page object, and surfaces.

## Implementation Requirements

Create a scenario model and safe runner for categories including surface navigation, external launch inspection, local view control, disabled/reference control, approval queue inspection, HBI command entry inspection, source boundary inspection, drawer/modal inspection, and false-affordance inspection.

Each scenario records ID, surface, objective, safe locator, action label/kind, whether any click occurred, safe/local/inspection-only classification, destination, mutation keyword, context, result/no-attempt reason, needs-review, and EV/pillar/hard-stop refs.

## No-Mutation Rules

Do not click approve, reject, submit, save, delete, create, edit, update, upload, sync, send, sign, award, assign, provision, commit, or certify.

## Tests

Verify mutation-looking controls are not clicked, launch links inspected safely, local view controls classified, disabled reasons preserved, deterministic output, and no final scoring claims.

## Validation

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec prettier --check e2e/pcc-live
git diff --check
```
