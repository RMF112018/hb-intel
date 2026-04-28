# Prompt 03 — Phase 1 Step 5 Run Harness and Remediate Schema Defects

## Objective

Run the Phase 1 Step 5 validation harness and remediate only mechanical schema defects required for the harness to pass.

This prompt is not an architecture redesign prompt. It must not introduce new architecture decisions or expand the contract.

---

## Required Commands

Run the package-local validation commands created in Prompt 02, such as:

```text
node packages/project-site-template/validation/validate-template-contract.mjs
node packages/project-site-template/validation/contract-integrity-checks.mjs
```

If package scripts exist:

```text
<package manager> --filter @hbc/project-site-template validate:all
```

Use the repo's package manager convention.

---

## Allowed Remediation

You may fix:

- invalid JSON syntax;
- invalid JSON Schema syntax;
- bad `$ref` paths;
- missing local `$defs` referenced by a property;
- missing required property definitions;
- fixture mistakes where the fixture contradicts the already-populated schema;
- schema description typos;
- template-contract schema reference issues;
- package-local validation script bugs;
- deterministic report writing issues.

You may modify only:

```text
packages/project-site-template/schemas/
packages/project-site-template/template-contract.json
packages/project-site-template/package.json
packages/project-site-template/validation/
packages/project-site-template/docs/Phase_1_Step_5_Schema_Validation_Harness_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_5_Schema_Validation_Harness_Closeout.md
```

---

## Not Allowed

Do not:

- alter enum meanings;
- add architecture fields not in the Contract / field maps;
- convert OC-17 or OC-18 into canonical Procore models;
- remove Procore guardrail consts;
- weaken no-secret checks;
- weaken invalid fixtures just to pass;
- change Wave 1 / Wave 2 / Wave 3 schemas in ways unrelated to validation defects;
- modify backend, SPFx, provisioning, manifests, tests outside package-local harness, generated files, CI, root workspace, deployment files, or runtime consumers;
- set `fullExtractionComplete: true` in this prompt unless Prompt 04 is being executed after all validation passes.

---

## Architecture Gap Rule

If a failure cannot be fixed mechanically without changing architecture, stop and use:

```text
Prompt 05 — Phase 1 Step 5 Architecture Gap Escalation If Required
```

Examples of architecture gaps:

- a required field cannot be represented without a new meaning;
- a field-map/schema conflict changes business logic;
- a guardrail conflicts with the Contract;
- Procore placeholder treatment is insufficient for validation without adding canonical Procore model semantics;
- a downstream validation expectation requires provisioning or runtime behavior.

---

## Required Validation Report

Update or create:

```text
packages/project-site-template/validation/reports/schema-validation-report.json
packages/project-site-template/validation/reports/contract-integrity-report.json
```

If reports are deterministic and intended to be source-controlled, commit them. If not, add `.gitignore` or documentation guidance under `validation/README.md` and do not commit generated reports.

The report must summarize:

- command run;
- timestamp or omit timestamp for deterministic output;
- pass/fail;
- schemas validated;
- fixtures validated;
- invalid fixtures confirmed failing;
- integrity checks passed;
- failures fixed;
- remaining failures.

Prefer deterministic reports without machine-specific absolute paths.

---

## Required Notes Update

Update:

```text
packages/project-site-template/docs/Phase_1_Step_5_Schema_Validation_Harness_Notes.md
```

Add:

```markdown
## Harness Execution Results
## Remediations Performed
## Remaining Failures
## Step 5 Closeout Readiness
```

---

## Completion Summary

Output:

```markdown
## Completion Summary

### Commands Run
### Initial Validation Result
### Remediations Performed
### Final Validation Result
### Reports Created / Updated
### Architecture Gaps
### Ready for Step 5 Closeout?
### Guardrails Preserved
### Suggested Commit Message
```

Suggested commit message:

```text
test(project-site-template): validate schema contract integrity
```
