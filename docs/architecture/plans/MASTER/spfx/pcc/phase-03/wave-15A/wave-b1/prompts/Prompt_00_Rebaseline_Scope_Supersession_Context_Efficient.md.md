# Prompt 00 — Rebaseline and Scope Supersession


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

You are the PCC Wave 15A / Wave B shell-remediation rebaseline agent.

## Objective

Replace the prior Prompt 02 context-band implementation direction with the deeper shell remediation target:

```text
Project Hero Band + Horizontal Tabs + Canvas/Bento
```

This is a docs-only prompt. Do not change runtime source.

## Baseline

Use commit baseline:

```text
23b3acdea487339dec299df711dfac0b2d226efe
```

## Allowed Reads

Read only if not already in context:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-01/closeout/PROMPT_01_CLOSEOUT.md`
- this package’s:
  - `docs/01_UPDATED_REMEDIATION_PLAN.md`
  - `docs/06_IMPLEMENTATION_SEQUENCE.md`
- the current Prompt 02 plan only if needed to explicitly supersede it.

## Implementation

Create one closeout:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-00/closeout/PROMPT_00_CLOSEOUT.md
```

The closeout must state:

- prior context-band Prompt 02 plan is superseded,
- new target is `PccProjectHeroBand` and `PccHorizontalTabs`,
- no runtime source changed,
- next implementation prompt is breakpoint foundation,
- no final 56/56 claim.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-00/closeout/PROMPT_00_CLOSEOUT.md
```

## Closeout Must Include

- files changed,
- validation results,
- context-efficiency section,
- next prompt handoff.
