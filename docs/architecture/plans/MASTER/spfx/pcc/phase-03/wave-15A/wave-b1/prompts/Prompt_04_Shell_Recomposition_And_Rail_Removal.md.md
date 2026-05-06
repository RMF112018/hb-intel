# Prompt 04 — Shell Recomposition and Rail Removal


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

You are the PCC shell recomposition implementation agent.

## Objective

Replace the old rail/header shell with the new thin shell:

```text
Project Hero Band + Horizontal Tabs + Canvas/Bento
```

This is the major runtime shell replacement prompt.

## Allowed Files to Edit

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccNavigationRail.tsx
apps/project-control-center/src/shell/PccNavigationRail.module.css
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.module.css
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccApp.bentoIntegration.test.tsx
apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-04-shell-recomposition/closeout/PROMPT_04_SHELL_RECOMPOSITION_CLOSEOUT.md
```

Delete old rail/header files only after the new shell compiles and tests are migrated:

```text
apps/project-control-center/src/shell/PccNavigationRail.tsx
apps/project-control-center/src/shell/PccNavigationRail.module.css
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.module.css
```

If retaining temporary exports is safer for tests, document deferment and do not delete until next prompt.

## Allowed Reads

Use active context first. Read only:

- `docs/03_SHELL_TARGET_SPECIFICATION.md`
- immediately prior Prompt 02 and Prompt 03 closeouts if needed
- files being edited
- tests being edited

Do not read surfaces unless a route-smoke failure requires it.

## Implementation Requirements

1. Update `PccShell` to mount:
   - `PccProjectHeroBand`
   - `PccHorizontalTabs`
   - `<main data-pcc-canvas>`
   - `<PccBentoGrid>`

2. Remove rail/workArea split layout.

3. Update `PccApp` to pass:
   - project placeholder metadata,
   - active surface label/workflow,
   - active surface id,
   - tab selection handler,
   - source confidence.

4. Preserve:
   - `PccSurfaceRouter`,
   - read-model client pass-through,
   - `PccBentoGrid`,
   - bento direct-child invariant,
   - all 8 route surfaces.

5. Host-fit:
   - remove or constrain `min-height: 100vh`,
   - avoid SharePoint double-scroll risks,
   - avoid horizontal overflow,
   - make canvas content flow inside host container.

6. Migrate test markers:
   - from `[data-pcc-rail]` to `[data-pcc-horizontal-tabs]`,
   - from `aria-current="page"` to `aria-selected="true"` for tabs,
   - preserve active surface panel assertion.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccShell.navigation PccShell.responsive PccApp.bentoIntegration PccSurfaceContextHeader PccHorizontalTabs PccProjectHeroBand
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed-files>
md5 pnpm-lock.yaml
```

## Stop Conditions

Stop if:

- any of the 8 surfaces cannot route,
- bento direct-child invariant breaks,
- shell replacement requires backend/API or live data,
- host-fit requires SPFx manifest or package changes,
- lockfile changes.

## Closeout

Create the closeout path above. Include:

- old files deleted or retained with rationale,
- shell DOM order,
- host-fit CSS changes,
- route preservation evidence,
- bento invariant evidence,
- context-efficiency section,
- next prompt: nav a11y / keyboard / surface smoke hardening.
