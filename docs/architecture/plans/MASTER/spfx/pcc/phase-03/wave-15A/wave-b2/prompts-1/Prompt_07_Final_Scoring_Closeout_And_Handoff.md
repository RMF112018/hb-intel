# Prompt 07 — Final Scoring Closeout and Handoff


## Shared Context-Efficiency Rules

- Use active context first.
- Do not re-read files that are still within your current context or memory and have not changed.
- Read only the files required for this prompt, the immediately prior closeout, and files needed to verify current repo truth.
- Do not run broad repo audits unless this prompt explicitly requires one.
- Do not inspect unrelated packages unless a validation failure points there.
- If scope expansion is required, stop and explain why before editing additional files.

## Global Guardrails

- No live tenant writes.
- No Graph / PnP / SharePoint REST runtime work.
- No Procore / Document Crunch / Adobe Sign runtime work.
- No backend route changes.
- No approval/workflow execution.
- No dependency install/update.
- No package/manifest/SPPKG changes.
- No `pnpm-lock.yaml` drift.
- No final 56/56 claim unless evidence independently proves it.
- Do not push unless explicitly instructed.


## Role

You are the PCC shell flagship remediation closeout auditor.

## Objective

Perform a final repo-truth and evidence-backed closeout for the shell flagship remediation sequence. Score the outcome against UI-kit doctrine and prepare a handoff for remaining Wave 15A work.

## Required Reads

Use active context first. Read only:

- Prompt 01–06 closeouts;
- evidence index;
- changed shell/source/test files if needed to verify claims;
- README;
- relevant doctrine scoring model if not already in context.

## Required Output

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/FINAL_CLOSEOUT_AND_HANDOFF.md
```

Include:

1. Objective.
2. Prompts executed and commit SHAs.
3. Files changed.
4. Product decisions implemented.
5. Tests and validation evidence.
6. Hosted evidence summary.
7. Hard-stop checklist.
8. Doctrine score reassessment.
9. What improved.
10. Residual risks.
11. What is explicitly not claimed.
12. Recommended next wave/prompt.

## Scoring Guidance

Do not claim final 56/56 unless:

- all hard-stops are clear;
- hosted evidence is complete;
- accessibility evidence is complete;
- responsive evidence is complete;
- shell remediation has been assessed together with affected surface content.

Expected realistic range after this package:

```text
40–46 / 56 if code and evidence are strong.
48+ / 56 only if visual, accessibility, and hosted evidence are excellent.
```

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/FINAL_CLOSEOUT_AND_HANDOFF.md
md5 pnpm-lock.yaml
```

## Commit

Commit message:

```text
docs(pcc): Wave 15A shell flagship final closeout and handoff
```
