# Prompt 02 — Horizontal Tabs Primitive


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

You are the PCC horizontal tab navigation primitive implementation agent.

## Objective

Create `PccHorizontalTabs` as a premium PCC-local navigation component. Do not mount it in `PccShell` yet unless the prompt is explicitly extended later.

## Allowed Files to Edit

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-02-horizontal-tabs/closeout/PROMPT_02_HORIZONTAL_TABS_CLOSEOUT.md
```

## Allowed Reads

Use active context first. Read only:

- `docs/03_SHELL_TARGET_SPECIFICATION.md`
- `docs/02_SOURCE_OWNERSHIP_MAP.md`
- `packages/ui-kit/src/HbcTabs/index.tsx` and `types.ts` only if you need to verify public API suitability.
- `@hbc/models/pcc` exported surface IDs/types only if TypeScript requires exact import shape.

Do not read rail files unless you need icon mapping and it is not in current context.

## Implementation Requirements

1. Implement horizontal tab navigation for all 8 PCC MVP surfaces.
2. Required order:

```text
Project Home as `Project Home`
Team & Access as `Team`
Documents as `Documents`
Project Readiness as `Project Readiness`
Approvals as `Approvals`
External Systems as `Apps`
Control Center Settings as `Settings`
Site Health as `Site Health`
```

3. Required markers:

```text
data-pcc-horizontal-tabs=""
data-pcc-tab-id="<surface-id>"
data-pcc-tab-active="true|false"
data-pcc-tab-mode="<mode>"
```

4. Required accessibility:

- `role="tablist"`
- `role="tab"`
- `aria-selected`
- visible focus ring
- ArrowLeft / ArrowRight
- Home / End
- Enter / Space activation

5. Required visual behavior:

- 2px orange underline active state,
- 8% orange background wash on active tab,
- 13px / 600 / 0.02em typography target,
- 120ms transitions,
- compact behavior at `smallLaptop` and below,
- no hidden tablist at phone width.

6. Use UI-kit tokens and icons. Compose `HbcTabs` only if doing so does not block required behavior. If direct `HbcTabs` composition is insufficient, implement a PCC-local tablist with UI-kit tokens and document why.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccHorizontalTabs
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed-files>
md5 pnpm-lock.yaml
```

## Stop Conditions

Stop if:

- adding tabs requires shell recomposition,
- adding tabs requires package dependency changes,
- `HbcTabs` public API blocks required PCC behavior and you cannot implement local behavior without shared package edits,
- lockfile changes.

## Closeout

Create the closeout path above. Include:

- whether `HbcTabs` was composed or not and why,
- keyboard/a11y test results,
- files changed,
- context-efficiency section,
- next prompt: Project Hero Band.
