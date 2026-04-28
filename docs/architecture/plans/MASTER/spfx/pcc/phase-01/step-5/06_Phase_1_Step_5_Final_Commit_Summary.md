# Prompt 06 — Phase 1 Step 5 Final Commit Summary

Use this prompt after Step 5 harness creation, harness execution/remediation, and closeout.

## Objective

Produce the final commit summary and description for Phase 1 Step 5.

Do not modify files in this prompt unless the closeout report is missing its commit summary / description section.

## Required Output

Output only the commit summary and description.

If the full extraction gate passed, use:

```text
test(project-site-template): close phase 1 schema validation
```

Suggested description:

```text
Add and execute the Project Site Template schema validation harness for Phase 1 Step 5.

Creates package-local validation scripts, representative valid and invalid fixtures, contract integrity checks, validation documentation, and Phase 1 Step 5 closeout. Validates all 14 populated family schemas, the root template contract, canonical enum/status posture, Procore boundary consts, OC-17/OC-18 placeholder-only treatment, no-secret posture, and ProjectStage / ProjectType / ProjectStatus anti-regression rules.

Marks fullExtractionComplete true only after the harness and integrity checks pass. Phase 1 is complete and ready for Phase 2 planning.

Validation only: no backend, SPFx, provisioning, Procore integration runtime, CI, generated deployment artifacts, package publishing, or runtime consumers.
```

If the full extraction gate did not pass, use:

```text
test(project-site-template): record phase 1 schema validation gaps
```

Suggested description:

```text
Add the Project Site Template schema validation harness and record remaining validation gaps for Phase 1 Step 5.

Creates package-local validation scripts, representative fixtures, integrity checks, validation documentation, and closeout/gap reporting. Leaves fullExtractionComplete false because one or more validation or architecture gates remain unresolved.

Validation only: no backend, SPFx, provisioning, Procore integration runtime, CI, generated deployment artifacts, package publishing, or runtime consumers.
```

If Prompt 05 was required, include one sentence describing the architecture-gap escalation.
