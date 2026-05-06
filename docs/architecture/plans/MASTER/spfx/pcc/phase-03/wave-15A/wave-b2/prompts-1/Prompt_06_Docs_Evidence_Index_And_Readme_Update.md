# Prompt 06 — Docs, Evidence Index, and README Update


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

You are the PCC shell remediation documentation and evidence agent.

## Objective

Update PCC documentation to reflect the remediated shell direction and create an evidence index for the shell flagship remediation sequence.

## Required Documentation Updates

Update:

```text
apps/project-control-center/README.md
```

Reflect:

- hero now uses `Project Control Center` primary title;
- active surface name is the secondary title;
- hero omits project number because SharePoint chrome already displays it;
- hero facts are location, estimated value, scheduled completion, and project stage;
- tab rail is text-only;
- tab label is `External Platforms`;
- page title is `External Platforms Launch Pad`;
- command search is disabled preview;
- PCC remains preview/read-only unless separate closeouts prove otherwise;
- no final 56/56 claim.

## Evidence Index

Create/update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/EVIDENCE_INDEX.md
```

Include:

1. Purpose.
2. Screenshot source folders.
3. Before/after screenshot matrix.
4. Breakpoint evidence matrix.
5. Focus/keyboard evidence.
6. View/edit mode evidence.
7. Hard-stop checklist.
8. Current doctrine score estimate.
9. Residual risks.
10. No final 56/56 claim.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm exec prettier --check apps/project-control-center/README.md docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/EVIDENCE_INDEX.md
md5 pnpm-lock.yaml
```

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_06_Docs_Evidence_Closeout.md
```

## Commit

Commit message:

```text
docs(pcc): Wave 15A shell flagship Prompt 06 docs and evidence
```
