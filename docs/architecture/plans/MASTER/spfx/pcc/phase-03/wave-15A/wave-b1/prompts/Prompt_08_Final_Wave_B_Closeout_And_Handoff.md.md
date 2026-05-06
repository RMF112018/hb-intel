# Prompt 08 — Final Wave B Closeout and Handoff


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

You are the PCC Wave 15A / Wave B final shell-remediation closeout agent.

## Objective

Create a final closeout documenting completion of the shell remediation sequence and handoff to later surface remediation.

This is docs-only. Do not change runtime source.

## Allowed Files to Edit

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/WAVE_B_SHELL_REMEDIATION_CLOSEOUT.md
```

## Allowed Reads

Use active context first. Read only:

- Prompt 00–07 closeouts,
- evidence index,
- current git diff/status,
- README if needed for summary.

Do not re-read runtime source unless validating a disputed closeout claim.

## Closeout Requirements

Include:

1. Executive outcome.
2. Prompt-by-prompt summary.
3. Final source architecture:
   - 8 breakpoints,
   - Project Hero Band,
   - Horizontal Tabs,
   - recomposed shell,
   - preserved bento.
4. Files changed by the sequence, summarized from actual commits/diffs.
5. Validation evidence summary.
6. Screenshot/evidence status.
7. Tenant-hosted proof status.
8. Scorecard impact:
   - shell/host fit,
   - navigation,
   - context,
   - breakpoint behavior,
   - product confidence.
9. No final 56/56 claim.
10. Remaining surface remediation handoff.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/WAVE_B_SHELL_REMEDIATION_CLOSEOUT.md
md5 pnpm-lock.yaml
```

## Stop Conditions

Stop if:

- closeout would need to claim unproven screenshots or tenant proof,
- runtime source has uncommitted changes not covered by prior prompt closeouts,
- lockfile changed.

## Final Response Required

Return only:

- closeout file path,
- validation results,
- remaining risks,
- suggested commit summary/description if the user wants to commit.
