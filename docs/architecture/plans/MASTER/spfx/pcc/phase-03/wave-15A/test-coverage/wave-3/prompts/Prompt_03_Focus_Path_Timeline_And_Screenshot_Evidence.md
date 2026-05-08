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


# Prompt 03 — Focus Path Timeline and Screenshot Evidence

## Objective

Add **focus path timeline** and optional **focus path screenshot inventory** evidence to the accessibility lane.

This prompt covers Near-Term Roadmap Item 8, first half.

## Required Repo-Truth Intake

Inspect:

```text
e2e/pcc-live/pcc-live.accessibility.types.ts
e2e/pcc-live/pcc-live.accessibility-capture.ts
e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts
e2e/pcc-live/pcc-live.accessibility.spec.ts
e2e/pcc-live/pcc-live.surfaces.ts
```

## Implementation Requirements

Extend accessibility capture/writer support for:

```text
pcc-live-focus-path-timeline.json
pcc-live-focus-path-timeline.md
focus-path-screenshots/
pcc-live-focus-screenshot-inventory.json
```

Rows should include surface ID, focus step, selector/safe locator, tag, role, accessible name presence, visible focus status, bounding box, viewport dimensions, screenshot path if captured, needs-review status, EV/pillar/hard-stop refs, and operator-review status.

Keep screenshot count bounded and mark focus screenshots operator-review required.

## Tests

Add synthetic tests for focus rows, screenshot inventory path safety, Markdown utility, no raw HTML, and no automated score/readiness claims.

## Validation

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec prettier --check e2e/pcc-live
git diff --check
```
