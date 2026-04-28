# Prompt 02 — Phase 0 Step 2 Closeout Remediation If Validation Fails

Use this prompt only if Prompt 01 identifies a validation failure in the Phase 0 Step 2 closeout.

## Objective

Perform minimal documentation-only remediation for Step 2 closeout validation failures.

This prompt must **not** introduce new architecture decisions. It may only correct missing, malformed, or internally inconsistent Step 2 documentation when the intended correction is already established by:

- the Step 2 prompt requirements;
- the Step 2 deliverables;
- the Step 1 audit;
- the Standard Project Site Template Contract;
- the Target Architecture Blueprint;
- the Roadmap.

If the correction requires a new architecture decision, do **not** patch it. Record it as an architecture gap and mark Phase 1 as not ready.

---

## Allowed Scope

You may modify only markdown files under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/
```

Do not modify governing source files unless explicitly instructed later by a separate architecture-stabilization prompt.

Do not modify:

- code;
- schemas;
- SPFx files;
- backend files;
- manifests;
- tests;
- provisioning scripts;
- package versions;
- generated files;
- `packages/project-site-template/`.

Do not create schemas.

Do not create `packages/project-site-template/`.

Do not run builds, tests, lint, typecheck, packaging, or deployment.

Do not re-read files that are still within your current context or memory unless exact verification is required.

---

## Allowed Remediation Types

You may remediate only these issue types:

1. Missing required section in a Step 2 markdown file.
2. Missing required table column in a Step 2 markdown file.
3. Missing Object Catalog row in the Object Catalog Disposition.
4. Missing required schema family in the Schema Family Taxonomy.
5. Missing required rule category or Enforcement Layer in the Validation Rule Table Plan.
6. Missing required anti-regression or boundary statement.
7. Inconsistent wording that could imply:
   - schemas were created;
   - `packages/project-site-template/` was created;
   - Phase 1 may proceed to schema generation before review acceptance;
   - JSON Schema alone enforces cross-layer behavior;
   - Procore Object Link / Curated Summary rows become full Procore canonical models in Phase 1.

If any issue falls outside this list, stop and record it as an architecture gap.

---

## Required Validation After Remediation

After remediation, re-run the Prompt 01 validation checks and update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Closeout_Report.md
```

The closeout report must clearly state:

- what failed;
- what was corrected;
- why the correction was documentation-only;
- whether Phase 1 readiness changed;
- whether any architecture gap remains.

---

## Required Completion Summary

When complete, output:

```markdown
## Completion Summary

### Files Modified
### Validation Failures Remediated
### Validation Failures Not Remediated
### Architecture Gaps Identified
### Phase 1 Readiness Decision
### Boundary Confirmation
### Suggested Commit Message
```

Suggested commit message:

```text
docs(sp-project-control-center): remediate phase 0 step 2 closeout validation
```
