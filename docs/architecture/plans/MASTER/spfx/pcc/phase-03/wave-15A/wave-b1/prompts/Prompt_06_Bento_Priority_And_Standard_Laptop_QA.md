# Prompt 06 — Bento Priority and Standard-Laptop QA


# Shared Instructions for This Prompt

## Context-Efficiency Rules

- Use active context first.
- Do not re-read files that are already in your current context and have not changed.
- Read only files you will edit, tests you will update, the immediately prior closeout, or exact type definitions needed to compile.
- Do not run broad repo audits.
- Do not search unrelated packages or archived plans.
- Do not inspect backend/API/surface/shared-package files unless a validation failure points there or this prompt explicitly allows it.
- If you need files outside the allowed list, stop and explain why before expanding scope.

## Global Guardrails

- No backend/API runtime changes.
- No Graph/PnP/SharePoint REST.
- No Procore live integration.
- No dependency install/update.
- No `pnpm-lock.yaml` drift.
- No package/manifest bump unless packaging files are changed and user approval is obtained.
- No final 56/56 claim.
- No `git push` unless the user explicitly instructs it.


## Role

You are the PCC standard-laptop content-priority remediation agent.

## Objective

Tune Project Home and bento priority so the new shell performs well at `standardLaptop` and adjacent laptop breakpoints.

## Allowed Files to Edit

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsCard.tsx
apps/project-control-center/src/layout/PccDashboardCard.module.css
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-06-bento-laptop-qa/closeout/PROMPT_06_BENTO_LAPTOP_QA_CLOSEOUT.md
```

Only edit `PccDashboardCard.tsx` if a missing marker/prop prevents tests from proving hierarchy.

## Allowed Reads

Use active context first. Read only:

- edited files,
- `docs/03_SHELL_TARGET_SPECIFICATION.md`,
- `docs/04_BREAKPOINT_POLICY_SPECIFICATION.md`,
- exact test failure files.

Do not read unrelated surfaces.

## Implementation Requirements

1. Ensure Project Intelligence and Priority Actions use `hierarchy="primary"` where applicable.
2. Preserve Project Home direct-card fragment structure.
3. Preserve bento direct-child invariant.
4. Ensure `standardLaptop` and `smallLaptop` card spans prioritize primary cards.
5. Do not redesign all Project Home cards.

## Visual QA

If browser capture is available, capture:

```text
1180px
1181px
1366px
1440px
1441px
```

If not available, document evidence gap.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccProjectHome PccBentoGrid.footprints PccApp.bentoIntegration
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed-files>
md5 pnpm-lock.yaml
```

## Stop Conditions

Stop if:

- Project Home priority tuning requires broad surface redesign,
- bento direct-child invariant breaks,
- card hierarchy changes require shared UI-kit updates,
- lockfile changes.

## Closeout

Create the closeout path above. Include:

- hierarchy changes,
- standard-laptop QA result or evidence gap,
- bento invariant proof,
- context-efficiency section,
- next prompt: README/evidence index.
