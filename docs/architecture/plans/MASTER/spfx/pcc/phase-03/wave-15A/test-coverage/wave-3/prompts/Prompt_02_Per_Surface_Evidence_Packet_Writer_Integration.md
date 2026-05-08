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


# Prompt 02 — Per-Surface Evidence Packet Writer and Integration

## Objective

Implement the writer and report integration for **per-surface evidence packets**.

This prompt covers Near-Term Roadmap Item 7, second half.

## Required Repo-Truth Intake

Inspect:

```text
e2e/pcc-live/pcc-live.evidence-writer.ts
e2e/pcc-live/pcc-live.surface-blocks-writer.ts
e2e/pcc-live/pcc-live.scorecard-report-writer.ts
e2e/pcc-live/pcc-live.scorecard-report-assembler.ts
e2e/pcc-live/pcc-live.surface-blocks.spec.ts
```

## Implementation Requirements

Emit:

```text
surface-evidence-packets.json
surface-evidence-packets.md
surface-evidence-packets/project-home.md
surface-evidence-packets/team-and-access.md
surface-evidence-packets/documents.md
surface-evidence-packets/project-readiness.md
surface-evidence-packets/approvals.md
surface-evidence-packets/external-systems.md
surface-evidence-packets/control-center-settings.md
surface-evidence-packets/site-health.md
```

Markdown must include surface identity, evidence coverage, upstream artifacts, top issues/gaps, expert-review questions, scorecard refs, hard-stop refs, operator-review status, and disclaimer.

Integrate packet references into scorecard-report or surface-block report only if clean and non-breaking.

## Tests

Verify all expected files emitted, JSON index has eight packets, safe artifact paths preserved, forbidden raw artifact paths excluded/flagged, and no final score/readiness claims.

## Validation

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts
pnpm exec prettier --check e2e/pcc-live
git diff --check
```
