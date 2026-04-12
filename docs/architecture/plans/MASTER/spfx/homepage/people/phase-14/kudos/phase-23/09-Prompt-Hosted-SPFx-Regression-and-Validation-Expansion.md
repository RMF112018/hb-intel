# Prompt 09 — Hosted SPFx Regression and Validation Expansion
## Context
Work against the live repository:

- `https://github.com/RMF112018/hb-intel.git`
This prompt is part of the HB Kudos major-findings remediation package. Treat the accompanying audit report as the governing summary of the issue being corrected.
Do not re-read files that are already in your current context window or active memory unless necessary for post-edit validation.
Preserve the split-runtime boundary between the public Kudos runtime and the companion runtime.

## Objective

HB Kudos already has meaningful hosted Playwright coverage, but it is not yet model-grade complete. Expand the validation matrix so hosted SharePoint behavior, responsive behavior, and workflow regressions are better locked down.

## Primary files / areas to inspect

- `e2e/webparts/kudos/hosted/`
- `apps/dev-harness/src/tabs/KudosCompanionTab.tsx`
- `scripts/testing/people-kudos/`
- `scripts/testing/people-kudos-workflow/`
- `apps/hb-webparts/src/webparts/hbKudos/*`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/*`

## Required work

1. Review the current hosted Kudos Playwright coverage and identify high-value missing cases.
2. Add coverage for responsive states, safe-zone behavior, archive/feed interactions, companion workflow actions, and any critical regression paths not already protected.
3. Where visual proof artifacts or closure reporting are appropriate, add them.
4. Keep the suite targeted and useful; do not create noisy or brittle tests with little value.
5. Ensure the new validation footprint supports confident closure of the major findings package.

## Non-goals / guardrails

- Do not add redundant tests that merely duplicate existing assertions.
- Do not create a suite so slow or brittle that it becomes unused.

## Deliverables

- implement the code changes required to resolve this finding
- update or add tests where needed
- add or update focused documentation only where it materially supports long-term governance
- produce a concise change summary identifying what was changed, why, and any remaining risk

## Validation requirements

- targeted Playwright suite passes for hosted Kudos public and companion flows
- new tests prove the missing cases added in this pass
- validation output is clear enough to support closure review

## Completion standard

Do not stop at partial improvement. Close the finding completely enough that this area would not be called out again in a fresh repo-truth audit.
