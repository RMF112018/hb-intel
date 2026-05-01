# 09 — Prompt 06: Validation, Closeout, and Commit

## Role

You are a local code agent in `/Users/bobbyfetting/hb-intel`. Wave 9 documentation updates are complete in the working tree.

## Objective

Validate the documentation-only update, confirm guardrails, create closeout documentation if appropriate, and commit the changes.

## Pre-Validation Commands

Run:

```bash
git status --short
md5 pnpm-lock.yaml
git diff --check
```

Run targeted Prettier check for touched Markdown files. Prefer a direct list of touched files:

```bash
pnpm exec prettier --check <touched markdown files>
```

If appropriate and not overly broad, run:

```bash
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/**/*.md
```

## Optional Closeout File

If repo convention supports Wave closeout docs, add:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Wave_9_Documentation_Update_Closeout.md
```

Closeout should include:

- branch / HEAD;
- files inspected;
- files changed;
- checklist-definition files used;
- what changed;
- what did not change;
- validation output;
- lockfile MD5 before and after;
- no-runtime/no-tenant/no-package/no-lockfile confirmation;
- remaining open decisions;
- recommended next prompt.

Do not create a closeout file if repo convention indicates closeouts only happen after implementation waves or if the user has not authorized it.

## Required Final Checks

Confirm:

- Wave 9 no longer appears as only `Job Startup Checklist` in governing docs.
- `Job Start up Checklist` remains only as source-template context where applicable.
- Startup, safety, and closeout are all included as source families.
- Target architecture file exists and is detailed.
- Item-library/crosswalk documentation exists or the target architecture clearly points to the checklist-definition files.
- No code files changed unless explicitly authorized.
- No package files changed.
- `pnpm-lock.yaml` unchanged.
- No runtime integration, tenant mutation, SPFx package, deployment, or external system operation was introduced.

## Commit

Use:

```text
docs(pcc): redefine wave 9 lifecycle readiness architecture
```

Commit description:

```text
Redefines Phase 3 Wave 9 from a narrow Job Startup Checklist module into the Project Lifecycle Readiness Center target architecture.

Updates PCC planning, blueprint, roadmap, and Wave 9 documentation to incorporate startup, safety, and closeout checklist item libraries as lifecycle readiness controls with source traceability, role/action rules, evidence requirements, readiness scoring, phase activation, priority action linkage, approvals/checkpoints posture, audit history, and flagship UX direction.

Documentation-only. No source code, package changes, lockfile changes, runtime integrations, tenant mutation, SPFx package/deployment work, live Graph/Procore/SharePoint/Document Crunch/Adobe Sign operations, or provisioning execution are introduced.
```

## Final Response Required

Return:

- commit hash;
- commit summary;
- commit description;
- files changed;
- validation output;
- lockfile MD5 before and after;
- explicit exclusions;
- open decisions / risks;
- recommended next prompt.
