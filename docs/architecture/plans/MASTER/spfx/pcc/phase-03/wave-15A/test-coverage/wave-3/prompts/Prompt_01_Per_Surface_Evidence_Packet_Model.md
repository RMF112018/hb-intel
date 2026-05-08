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


# Prompt 01 — Per-Surface Evidence Packet Model

## Objective

Design and implement the foundational data model and assembler for **per-surface evidence packets**.

This prompt covers Near-Term Roadmap Item 7, first half.

## Required Repo-Truth Intake

Inspect only the files needed for this scope:

```text
e2e/pcc-live/pcc-live.surfaces.ts
e2e/pcc-live/pcc-live.surface-blocks.types.ts
e2e/pcc-live/pcc-live.surface-blocks-assembler.ts
e2e/pcc-live/pcc-live.scorecard-report-assembler.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
e2e/pcc-live/pcc-evidence.registry.ts
docs/reference/spfx-surfaces/project-control-center/PCC_Playwright_Evidence_Subset_Map.md
```

If Immediate ROI package files have introduced package-completeness, screenshot manifests, or issue registers, inspect those current files and integrate with them. Do not assume names if repo truth differs.

## Implementation Requirements

Create or extend types and assembler logic for a per-surface packet model supporting: one packet per PCC live surface; EV, pillar, and hard-stop refs; upstream artifact references by lane; screenshot/breakpoint/accessibility/workflow/content/state-source summaries; missing-artifact gaps; expert-review questions; and a disclaimer confirming no final score, no hard-stop pass/fail, no EV final capture, and no Phase 4 readiness claim.

Potential model names:

```text
PccSurfaceEvidencePacket
PccSurfaceEvidencePacketRun
PccSurfaceEvidencePacketArtifactRef
PccSurfaceEvidencePacketGap
PccSurfaceEvidencePacketReviewQuestion
```

## Output Contract

Prepare for:

```text
surface-evidence-packets.json
surface-evidence-packets.md
surface-evidence-packets/<surface-id>.md
```

## Tests

Add synthetic assembler tests verifying eight packets, known surface IDs, no unknown EV refs, gap handling, disclaimers, and no automated score/readiness claims.

## Validation

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec prettier --check e2e/pcc-live
git diff --check
```

## Closeout Response

Report files changed, model names, tests, validation, integration assumptions, and no-score/no-mutation confirmation.
