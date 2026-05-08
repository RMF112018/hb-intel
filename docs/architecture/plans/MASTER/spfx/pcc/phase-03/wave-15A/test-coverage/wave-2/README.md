# PCC Playwright Immediate ROI Prompt Package

## Purpose

This package instructs a local code agent to implement the **Immediate / Highest ROI** portion of the PCC Playwright evidence-depth roadmap.

The work is limited to the PCC live Playwright evidence harness and related documentation/scripts. It is not a PCC UI remediation sprint and must not change the final scoring boundary.

## Immediate / Highest ROI Items Covered

| Roadmap Item | Objective | Prompt(s) |
|---|---|---|
| 1 | Replace stale `_v2` scorecard references | `Prompt_01_Canonical_Scorecard_Traceability_Repair.md` |
| 2 | Produce full report / surface-block / doctrine-source package | `Prompt_02_Full_Evidence_Package_Completeness_And_Runbook.md`, `Prompt_03_Report_Surface_Blocks_Doctrine_Source_Closeout_Integration.md` |
| 3 | Add screenshot contact sheet and manifest | `Prompt_04_Screenshot_Contact_Sheet_And_EV_Manifest.md` |
| 4 | Add issue registers for breakpoint/accessibility | `Prompt_05_Breakpoint_Issue_Register.md`, `Prompt_06_Accessibility_Issue_Register.md` |
| 5 | Reconcile touch target contradiction | `Prompt_07_Touch_Target_Measurement_Reconciliation.md` |
| 6 | Fix run-ID over-redaction | `Prompt_08_Run_Id_Sanitizer_Over_Redaction_Repair.md` |
| Closeout | Validate all Immediate ROI work together | `Prompt_09_Immediate_ROI_Closeout_Validation.md` |

## Governing Repo Context

Target repository:

```text
RMF112018/hb-intel
```

Primary areas:

```text
playwright.pcc-live.config.ts
package.json
e2e/pcc-live/
docs/architecture/evidence/pcc-live/
docs/reference/spfx-surfaces/project-control-center/
```

Canonical scorecard path:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
```

Durable references must not point to:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md
```

## Required Operating Boundaries

- Do not calculate a final 100-point score.
- Do not mark hard stops as passed or failed.
- Do not mark EVs as finally captured by automation.
- Do not commit or generate raw auth/session material.
- Do not commit raw `test-results/`, raw `playwright-report/`, raw traces, raw videos, or HAR files.
- Do not add live write-side PCC actions.
- Do not mutate SharePoint tenant data.
- Do not modify PCC product UI runtime unless a prompt explicitly identifies a missing DOM marker as necessary and safe. The default posture is Playwright evidence-harness work only.
- Preserve expert-review/manual-scoring posture in all generated reports.

## Local Agent Session Rules

Every prompt in this package should be executed in a fresh local code-agent session or in a clearly bounded continuation.

The local agent must:

1. Start with repo-truth checks.
2. Avoid re-reading files that are still within its current context or memory. Reopen a file only when the file may have changed, the prior context is stale, or exact line-level content is required.
3. Make the smallest coherent code/doc changes necessary to satisfy the prompt.
4. Preserve existing sanitization and safety policy.
5. Run targeted validation before broader validation.
6. Report exact files changed, commands run, results, unresolved risks, and suggested next prompt.

## Recommended Execution Order

Run prompts in this sequence:

```text
Prompt 01
Prompt 02
Prompt 03
Prompt 04
Prompt 05
Prompt 06
Prompt 07
Prompt 08
Prompt 09
```

Prompt 01 should land first because stale scorecard references poison downstream traceability.

Prompts 02 and 03 should land before visual/detail enhancements because they establish full-package expectations and ensure later artifacts are visible in the scorecard package.

Prompts 04 through 08 may be executed independently after Prompt 03, but Prompt 09 must be last.

## Baseline Validation Commands

Use targeted commands as appropriate. Do not blindly run expensive commands when a targeted validation is sufficient, but do run broad validation for closeout.

```bash
git status --short
git rev-parse HEAD
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml

pnpm pcc:e2e:evidence:registry
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-scorecard.traceability.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.doctrine-source.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.surface-blocks.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.scorecard-report.spec.ts

pnpm exec prettier --check "e2e/pcc-live/**/*.{ts,md,json}" "docs/architecture/evidence/pcc-live/**/*.md" "docs/reference/spfx-surfaces/project-control-center/**/*.md"
git diff --check
```

## Expected Completion Summary Format

Each local agent completion summary should include:

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

## Package Files

```text
README.md
Implementation_Plan.md
prompts/
  Prompt_01_Canonical_Scorecard_Traceability_Repair.md
  Prompt_02_Full_Evidence_Package_Completeness_And_Runbook.md
  Prompt_03_Report_Surface_Blocks_Doctrine_Source_Closeout_Integration.md
  Prompt_04_Screenshot_Contact_Sheet_And_EV_Manifest.md
  Prompt_05_Breakpoint_Issue_Register.md
  Prompt_06_Accessibility_Issue_Register.md
  Prompt_07_Touch_Target_Measurement_Reconciliation.md
  Prompt_08_Run_Id_Sanitizer_Over_Redaction_Repair.md
  Prompt_09_Immediate_ROI_Closeout_Validation.md
```
