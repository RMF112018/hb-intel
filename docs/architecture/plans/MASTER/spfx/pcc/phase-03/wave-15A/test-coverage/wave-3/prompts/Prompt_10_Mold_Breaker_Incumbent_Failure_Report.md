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


# Prompt 10 — Mold Breaker and Incumbent Failure-Mode Reports

## Objective

Add **Mold Breaker / incumbent failure-mode** and **generic SaaS language risk** reports.

This prompt covers Near-Term Roadmap Item 11, second half.

## Required Repo-Truth Intake

Inspect Prompt 09 output plus governing con-tech UI/UX studies, canonical scorecard, evidence taxonomy, content writer, and doctrine-source writer.

## Implementation Requirements

Emit:

```text
generic-saas-language-risk-report.md
mold-breaker-incumbent-failure-map.md
progressive-disclosure-language-report.md
construction-tech-differentiation-review.md
```

Generic SaaS report should flag risk terms carefully with snippet hash, surface/card context, rationale, and reviewer question. Incumbent failure map should cover dense module anthology, equal-weight card wall, unclear next action, unclear source-of-record, false affordance, weak field-office fit, generic dashboard language, and poor state explanation.

## Tests

Verify reports emitted, expert-review posture, generic language context, no final score/hard-stop/readiness claim, canonical scorecard path used, no `_v2` path introduced.

## Validation

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec prettier --check e2e/pcc-live docs/reference/spfx-surfaces/project-control-center
git diff --check
```
