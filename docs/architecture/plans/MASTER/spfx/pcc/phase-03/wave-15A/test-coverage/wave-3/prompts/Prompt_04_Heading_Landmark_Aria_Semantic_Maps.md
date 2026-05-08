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


# Prompt 04 — Heading, Landmark, and ARIA Semantic Maps

## Objective

Add **heading map**, **landmark map**, and **ARIA relationship map** evidence to the accessibility lane.

This prompt covers Near-Term Roadmap Item 8, second half.

## Required Repo-Truth Intake

Inspect current accessibility types/capture/writer from Prompt 03.

## Implementation Requirements

Emit:

```text
pcc-live-heading-map.json
pcc-live-heading-map.md
pcc-live-landmark-map.json
pcc-live-landmark-map.md
pcc-live-aria-relationship-map.json
pcc-live-aria-relationship-map.md
```

Heading map: surface ID, heading snippet, level, safe selector, sequence, hierarchy risks, needs-review. Landmark map: role/landmark type, accessible name, selector, duplicate/missing/ambiguous risks. ARIA map: source selector, relationship type, referenced IDs, target found, safe snippet, disposition.

## Tests

Verify maps emitted, broken ARIA refs flagged, heading risks flagged, landmarks captured, raw HTML/sensitive data absent, expert-review posture preserved.

## Validation

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec prettier --check e2e/pcc-live
git diff --check
```
