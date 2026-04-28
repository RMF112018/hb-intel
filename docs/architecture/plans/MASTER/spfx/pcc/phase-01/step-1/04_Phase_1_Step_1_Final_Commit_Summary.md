# Prompt 04 — Phase 1 Step 1 Final Commit Summary

Use this prompt after Prompt 01 and Prompt 03, and after Prompt 02 only if Prompt 02 was required.

## Objective

Produce the final commit summary and description for Phase 1 Step 1.

Do not modify files in this prompt unless the closeout report is missing its commit summary / description section.

## Required Output

Output only the commit summary and description.

Suggested summary:

```text
feat(project-site-template): scaffold machine-readable template contract
```

Suggested description:

```text
Create the initial Project Site Template package scaffold for the Phase 1 machine-readable PCC contract.

Adds the project-site-template package folder, root template-contract skeleton, template-contract schema skeleton, 14 schema-family skeleton files, package README, scaffold notes, and Phase 1 Step 1 closeout report. The scaffold is traceable to the Phase 0 Step 2 closeout and preserves the no-new-architecture-decisions boundary.

Scaffold only: no full schema extraction, backend provisioning, SPFx implementation, Procore integration, CI changes, generated files, deployment artifacts, or package publishing.
```

If `package.json` was not created, replace "package" language with "contract scaffold folder".

If Prompt 02 was required, add one sentence describing the architecture gap escalation.
