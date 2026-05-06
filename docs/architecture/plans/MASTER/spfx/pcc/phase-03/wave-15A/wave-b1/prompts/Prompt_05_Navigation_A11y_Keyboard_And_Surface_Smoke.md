# Prompt 05 — Navigation A11y, Keyboard, and Surface Smoke


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

You are the PCC navigation accessibility and shell smoke-test hardening agent.

## Objective

Harden the horizontal tab navigation after shell replacement and prove all 8 surfaces route correctly through the new shell.

## Allowed Files to Edit

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccShell.surfaceSmoke.test.tsx
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-05-nav-a11y-smoke/closeout/PROMPT_05_NAV_A11Y_SMOKE_CLOSEOUT.md
```

Create `PccShell.surfaceSmoke.test.tsx` if no equivalent shell-level all-surface smoke test exists.

## Allowed Reads

Use active context first. Read only:

- edited files,
- `PccSurfaceRouter.tsx` only if exact route behavior is needed,
- failing surface test output only if smoke tests fail.

Do not read every surface implementation.

## Implementation Requirements

1. Ensure horizontal tabs:
   - remain reachable at all 8 modes,
   - have visible focus,
   - support ArrowLeft / ArrowRight,
   - support Home / End,
   - support Enter / Space activation,
   - expose non-color-only active state.

2. Add/confirm shell-level smoke test for all 8 surface ids:
   - render app,
   - activate tab,
   - assert exactly one active surface panel,
   - assert panel id matches selected tab,
   - assert no shell crash.

3. Validate phone/narrow behavior:
   - tablist still exists,
   - active tab still discoverable,
   - no display:none hidden nav without alternate access.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccHorizontalTabs PccShell.navigation PccShell.responsive PccShell.surfaceSmoke
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed-files>
md5 pnpm-lock.yaml
```

## Stop Conditions

Stop if:

- smoke tests require surface redesign,
- keyboard fix requires shared UI-kit changes,
- phone behavior requires adding a new navigation component outside this shell,
- lockfile changes.

## Closeout

Create the closeout path above. Include:

- a11y/keyboard coverage,
- all-surface smoke result,
- remaining visual evidence gaps,
- context-efficiency section,
- next prompt: bento priority and standard-laptop QA.
