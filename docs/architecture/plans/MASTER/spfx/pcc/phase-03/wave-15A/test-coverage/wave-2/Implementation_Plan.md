# PCC Playwright Immediate ROI Implementation Plan

## 1. Objective

Implement the **Immediate / Highest ROI** improvements identified in the PCC Playwright evidence-depth audit.

The goal is to make the PCC live Playwright suite more useful to expert UI/UX auditors applying the PCC 100-point UI/UX Mold Breaker scorecard by improving:

- canonical traceability,
- full evidence package completeness,
- screenshot review usability,
- breakpoint/accessibility issue detail,
- touch-target measurement consistency,
- sanitizer precision,
- closeout validation.

This plan does not authorize automatic final scoring, automatic hard-stop pass/fail, or live tenant mutation.

## 2. Implementation Principles

### Evidence-first, not score-first

The Playwright suite should generate:

- evidence,
- traceability,
- warnings,
- findings,
- issue registers,
- worksheets,
- reviewer prompts,
- package completeness reports.

It must not generate:

- final score,
- final Phase 4 readiness approval,
- final hard-stop disposition,
- final EV captured status.

### Repo-truth first

The agent must inspect actual repo files before modifying them. Use previous context to avoid unnecessary re-reads, but verify anything that may have changed.

### Safe artifact policy

Evidence outputs may be repo-eligible only after sanitization and operator review.

Never commit:

- storageState,
- cookies/session/auth data,
- raw Playwright traces,
- videos,
- HAR files,
- raw `test-results/`,
- raw `playwright-report/`,
- unsanitized console/page-error dumps,
- screenshots not explicitly scrubbed/approved.

### Minimal coherent changes

Do not rewrite the suite. Extend the existing architecture:

- typed evidence models,
- lane-specific capture files,
- lane-specific writer files,
- assembler/report writer patterns,
- existing sanitizer style,
- existing expert-review posture.

## 3. Current Architecture Anchors

The local agent should expect the following existing architecture:

```text
e2e/pcc-live/pcc-evidence.types.ts
e2e/pcc-live/pcc-evidence.registry.ts
e2e/pcc-live/pcc-evidence.registry.spec.ts
e2e/pcc-live/pcc-scorecard.model.ts
e2e/pcc-live/pcc-scorecard.traceability.ts
e2e/pcc-live/pcc-scorecard.traceability.spec.ts

e2e/pcc-live/pcc-live.screenshot-capture.ts
e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts
e2e/pcc-live/pcc-live.screenshot.spec.ts

e2e/pcc-live/pcc-live.breakpoint-capture.ts
e2e/pcc-live/pcc-live.breakpoint-evidence-writer.ts
e2e/pcc-live/pcc-live.breakpoint.spec.ts

e2e/pcc-live/pcc-live.accessibility-capture.ts
e2e/pcc-live/pcc-live.accessibility-evidence-writer.ts
e2e/pcc-live/pcc-live.accessibility.spec.ts

e2e/pcc-live/pcc-live.workflow-capture.ts
e2e/pcc-live/pcc-live.workflow-evidence-writer.ts
e2e/pcc-live/pcc-live.workflow.spec.ts

e2e/pcc-live/pcc-live.content-capture.ts
e2e/pcc-live/pcc-live.content-review-writer.ts
e2e/pcc-live/pcc-live.content.spec.ts

e2e/pcc-live/pcc-live.doctrine-source.spec.ts
e2e/pcc-live/pcc-live.surface-blocks.spec.ts
e2e/pcc-live/pcc-live.scorecard-report.spec.ts
```

## 4. Workstream Summary

### Workstream 1 — Canonical Traceability Repair

**Prompt:** `Prompt_01_Canonical_Scorecard_Traceability_Repair.md`

Repair all durable Playwright source references that still point to:

```text
PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

Replace with:

```text
PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
```

Add tests so this cannot regress.

### Workstream 2 — Full Evidence Package Completeness

**Prompts:**

- `Prompt_02_Full_Evidence_Package_Completeness_And_Runbook.md`
- `Prompt_03_Report_Surface_Blocks_Doctrine_Source_Closeout_Integration.md`

Add package completeness validation so a full run can tell the operator whether these expected output groups exist:

```text
surface-smoke-*/
surface-screenshots-*/
breakpoints-*/
accessibility-*/
workflow-*/
content-*/
doctrine-source-*/
conditional-*/
surface-blocks-*/
scorecard-report-*/
```

The latest reviewed evidence package had many strong artifacts, but the committed package did not appear to include the final scorecard-report, surface-blocks, or doctrine-source groups. This must become visible as a package-completeness finding.

### Workstream 3 — Screenshot Contact Sheet and EV Manifest

**Prompt:** `Prompt_04_Screenshot_Contact_Sheet_And_EV_Manifest.md`

Add generated screenshot review artifacts:

```text
screenshot-contact-sheet.md
screenshot-manifest-by-ev.json
first-screen-review-index.md
```

These should not imply screenshots are scrubbed or approved; they are review aids.

### Workstream 4 — Breakpoint and Accessibility Issue Registers

**Prompts:**

- `Prompt_05_Breakpoint_Issue_Register.md`
- `Prompt_06_Accessibility_Issue_Register.md`

Convert summary counts into audit-usable issue registers:

```text
pcc-live-breakpoint-issue-register.json
pcc-live-breakpoint-issue-register.md
pcc-live-accessibility-issue-register.json
pcc-live-accessibility-issue-register.md
```

Findings should include surface, viewport if applicable, selector or stable identifier, evidence area, severity signal, EV refs, pillar refs, hard-stop refs, and review prompt.

### Workstream 5 — Touch Target Reconciliation

**Prompt:** `Prompt_07_Touch_Target_Measurement_Reconciliation.md`

Resolve the conflict where breakpoint output reported zero touch target measurements while accessibility output reported touch target issues.

Expected outcome:

- Shared selector/visibility logic where practical.
- Consistent measurement schema.
- Breakpoint lane reports touch targets where interactive controls exist.
- Accessibility lane remains WCAG/touch-review oriented.
- Any difference between lanes is explained in output.

### Workstream 6 — Run ID Sanitizer Precision

**Prompt:** `Prompt_08_Run_Id_Sanitizer_Over_Redaction_Repair.md`

Fix sanitizer logic that incorrectly redacts numeric run IDs / evidence folder names as phone numbers.

Expected outcome:

- Secrets, phone numbers, tokens, cookies, storageState, auth/session terms remain redacted.
- Safe evidence run IDs and relative paths remain navigable.
- Tests include false-positive and true-positive cases.

### Workstream 7 — Integrated Closeout

**Prompt:** `Prompt_09_Immediate_ROI_Closeout_Validation.md`

Validate that all Immediate ROI changes work together and produce a coherent evidence package structure without violating safety/scoring boundaries.

## 5. Acceptance Criteria

The Immediate ROI package is complete when:

1. No durable `_v2` scorecard references remain in Playwright evidence source/model files.
2. Canonical scorecard reference tests pass.
3. Full evidence package completeness is machine-checkable.
4. Missing doctrine-source, surface-blocks, or scorecard-report outputs are surfaced as evidence-package gaps.
5. Screenshot contact sheet and EV manifest outputs are generated by the screenshot lane.
6. Breakpoint issue register localizes clipping, overflow, direct-child, mode, and touch issues.
7. Accessibility issue register localizes axe, ARIA, contrast, focus, touch, hover, reduced-motion, and dialog concerns.
8. Touch target measurements are reconciled across breakpoint and accessibility lanes.
9. Sanitizer preserves safe run IDs and relative evidence paths while redacting real sensitive content.
10. Scorecard report remains expert-review-only.
11. Hard-stop worksheets remain manual-review-only.
12. No raw auth/session or prohibited Playwright artifacts are generated as repo-eligible outputs.

## 6. Validation Matrix

| Workstream | Required Validation |
|---|---|
| Canonical refs | `pnpm pcc:e2e:evidence:registry`; `pcc-scorecard.traceability.spec.ts`; grep for `_v2` in `e2e/pcc-live` |
| Package completeness | `pcc-live.scorecard-report.spec.ts`; package completeness unit tests |
| Surface-block/report integration | `pcc-live.surface-blocks.spec.ts`; `pcc-live.doctrine-source.spec.ts`; `pcc-live.scorecard-report.spec.ts` |
| Screenshot artifacts | `pcc-live.screenshot.spec.ts` |
| Breakpoint register | `pcc-live.breakpoint.spec.ts` |
| Accessibility register | `pcc-live.accessibility.spec.ts` |
| Touch reconciliation | breakpoint + accessibility specs |
| Sanitizer precision | writer/capture sanitizer tests, plus affected lane specs |
| Closeout | all targeted specs + `git diff --check` + targeted Prettier |

## 7. Recommended Commit Strategy

One commit per prompt is preferred. If the implementation is small and tightly coupled, prompts 02 and 03 may be combined only if the agent explains why.

Do not combine Prompt 01 with any other workstream. Canonical traceability repair should land independently.

## 8. Expected Developer Completion Summary

```text
Commit summary:
<one-line summary>

Commit description:
- Objective:
- Files changed:
- What changed:
- Validation:
- Safety/scoring boundary:
- Residual risks:
- Suggested next prompt:
```
