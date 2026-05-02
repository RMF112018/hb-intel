# Prompt 08 — Fresh Reviewer Prompt

## Objective

You are a fresh reviewer for the HB Intel / Project Control Center repo at:

```text
/Users/bobbyfetting/hb-intel
```

Review the completed Phase 3 Wave 11 Responsibility Matrix implementation against repo truth, Wave 11 documentation, current web research, and guardrail requirements.

Do not implement code unless explicitly authorized after your review.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Required Baseline Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Required Review Scope

Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/
packages/models/src/pcc/
backend/functions/src/hosts/pcc-read-model/
apps/project-control-center/src/api/
apps/project-control-center/src/fixtures/
apps/project-control-center/src/surfaces/
apps/project-control-center/src/tests/
apps/project-control-center/package.json
packages/models/package.json
backend/functions/package.json
package.json
```

## Required Web Research

Use web search to verify current best-practice context for:

- RACI / RAM;
- AIA / ConsensusDocs / CSI responsibility allocation;
- RAPID / DACI decision-rights frameworks;
- Procore / Autodesk workflow current-action-owner patterns;
- Git / Prettier / Vitest validation practices.

Use research as validation input only. Repo truth and Wave 11 docs control.

## Required Review Questions

1. Does the implementation match the Wave 11 target architecture?
2. Does it preserve `109 / 98 / 0` workbook posture?
3. Does it keep owner-contract active default obligations at `0`?
4. Does it avoid legal advice and automatic contract interpretation?
5. Does it separate contract-party responsibility from RACI?
6. Does it include template library, project instance, assignment, decision-rights, current-action-owner, workflow-step, handoff, exception, evidence-link, Matrix Health Score, and snapshot/read-model concepts?
7. Does it preserve Team & Access ownership?
8. Does it preserve Document Control evidence-binary ownership?
9. Does it preserve Wave 14 approval/checkpoint execution ownership?
10. Does it avoid external runtime integrations and writeback?
11. Does it avoid package/lockfile/manifest/workflow/deployment changes unless explicitly authorized?
12. Are tests sufficient and passing?
13. Are any UI states misleading or over-claiming runtime capabilities?
14. Are degraded/source-unavailable states safe?

## Validation Commands

Run applicable commands:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
pnpm exec prettier --check <touched files>
```

## Final Output

Provide:

- review verdict: pass / pass with minor issues / changes required / blocked;
- repo baseline;
- files reviewed;
- validation results;
- guardrail findings;
- implementation gaps;
- residual risks;
- recommended next corrective prompt, if any.

Do not commit unless explicitly instructed.
