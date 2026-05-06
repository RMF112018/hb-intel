# Prompt 07 — README, Evidence, and Screenshot Index


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

You are the PCC shell remediation documentation and evidence indexing agent.

## Objective

Update PCC app documentation and create/update the Wave B shell-remediation evidence index.

This is docs/evidence only. Do not change runtime source.

## Allowed Files to Edit

```text
apps/project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/evidence/shell-remediation/INDEX.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-07-readme-evidence/closeout/PROMPT_07_README_EVIDENCE_CLOSEOUT.md
```

## Allowed Reads

Use active context first. Read only:

- current README,
- latest prompt closeouts if needed for evidence links,
- screenshot folder listings if screenshots exist.

Do not read runtime source unless needed to verify a doc statement.

## Documentation Requirements

Update README to reflect:

- new Project Hero Band,
- new horizontal tab navigation,
- 8-mode breakpoint policy,
- preserved bento layout,
- preview/no-live-operational-release posture,
- basis-of-design reference:
  `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`.

Create evidence index with:

- available screenshot paths,
- missing screenshot gaps,
- tenant-hosted proof status,
- validation command summary by prompt,
- no final 56/56 claim.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm exec prettier --check apps/project-control-center/README.md docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/evidence/shell-remediation/INDEX.md docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-07-readme-evidence/closeout/PROMPT_07_README_EVIDENCE_CLOSEOUT.md
md5 pnpm-lock.yaml
```

## Stop Conditions

Stop if:

- README update requires claiming tenant-hosted proof that does not exist,
- evidence index would invent screenshots,
- lockfile changes.

## Closeout

Create closeout path above. Include:

- docs changed,
- evidence availability,
- context-efficiency section,
- next prompt: final Wave B closeout.
