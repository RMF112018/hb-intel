# Prompt 01 — Scope Lock and Repo-Truth Audit


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

You are the PCC shell flagship remediation auditor.

## Objective

Conduct a targeted repo-truth audit for the PCC shared shell, hero, disabled command affordance, and tab rail before implementation. Produce a concise implementation file map and confirm whether the current repo still matches the assumptions in this remediation package.

## Required Reads

Read only what is necessary from:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/preview/projectPlaceholder.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/layout/footprints.ts
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/IProjectProfile.ts
packages/models/src/pcc/fixtures/projectProfile.ts
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
apps/project-control-center/src/tests/PccProjectHeroBand.test.tsx
apps/project-control-center/README.md
```

## Audit Requirements

Confirm:

- current shell structure;
- current hero content source;
- current placeholder/reference identity usage;
- current tab labels;
- current icon usage;
- current command search behavior;
- current tab accessibility wiring;
- current breakpoint mode contract;
- current tests that must be updated;
- any local changes already present in the working tree.

## Output File

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_01_Scope_Lock_Audit.md
```

Include:

1. Objective.
2. Files read.
3. Repo-truth findings.
4. Implementation file map.
5. Guardrails.
6. Risks.
7. Recommendation for Prompt 02.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/shell-flagship-remediation/Prompt_01_Scope_Lock_Audit.md
md5 pnpm-lock.yaml
```

## Commit

Commit only the audit file.

Commit message:

```text
docs(pcc): Wave 15A shell flagship Prompt 01 scope audit
```
