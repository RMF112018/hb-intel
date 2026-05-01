# Phase 3 / Wave 09 — Startup Checklist Planning Prompt Package

## Purpose

This package provides a sequenced set of markdown prompts for a local code agent to refine and enhance the Project Control Center planning for **Phase 3 / Wave 09 — Job Startup Checklist** in the `hb-intel` repo.

The objective is to define the Job Startup Checklist as a governed, item-level Project Readiness workflow module seeded from the standard startup checklist PDF.

## Local Repo Path

```text
/Users/bobbyfetting/hb-intel
```

## Target Wave

```text
Phase 3 / Wave 09 — Job Startup Checklist
```

Known surrounding sequence:

```text
Wave 08 — Project Readiness Module Framework
Wave 09 — Job Startup Checklist
Wave 10 — Permit Log
Wave 11 — Responsibility Matrix
Wave 12 — Constraints Log
Wave 13 — Buyout Log
Wave 14 — Approvals / Checkpoints
```

Treat Wave 09 as the first structured readiness workflow module after the shared Project Readiness Module Framework unless repo truth proves a different naming convention.

## Required Source PDF

The local code agent must inspect this file directly:

```text
/Users/bobbyfetting/hb-intel/docs/reference/example/Project_Startup_Checklist.pdf
```

The PDF is the governing seed source for the default Job Startup Checklist items.

## Prompt Execution Order

Run the prompts in this order:

1. `Prompt-01-PDF-and-Repo-Truth-Audit-No-Writes.md`
2. Review the audit report and proposed edit plan before allowing writes.
3. `Prompt-02-Documentation-Definition-Update.md`
4. Review the changed-file scope before closeout.
5. `Prompt-03-Consistency-Validation-and-Commit-Closeout.md`

Use `Fresh-Session-Reviewer-Prompt-Wave-09.md` in a separate ChatGPT review session to review the local agent’s plan, execution reports, validation output, and commit closeout.

## Strict Boundaries

This package is for planning and documentation refinement only.

Do **not** authorize:

- SPFx UI implementation;
- backend routes;
- parser/importer implementation;
- generated JSON schema;
- runtime permission execution;
- tenant mutation;
- SharePoint, Graph, PnP, Procore, Sage, Document Crunch, Adobe Sign, or other external-system runtime work;
- app-catalog work;
- `.sppkg`;
- deployment artifacts;
- auth/token wiring;
- provisioning executor changes;
- backend write routes;
- package, lockfile, manifest, workflow, or deployment changes.

If the audit proves a metadata file under `packages/models/**` must change, the change must remain definition/planning metadata only and must be validated with the model package checks listed in the prompts.

## Expected Final Commit Summary

Use this commit summary unless repo truth justifies a more accurate one:

```text
docs(pcc): define wave 9 startup checklist module
```

The commit description should mention:

- Wave 09 / Job Startup Checklist definition refined;
- standard seed source PDF under `docs/reference/example/Project_Startup_Checklist.pdf`;
- default seeded item posture;
- item-level readiness workflow expectations;
- Priority Actions Rail / Project Readiness linkage;
- no runtime implementation, backend route, parser, generated schema, deployment, or tenant mutation.

## Expected Final Output from Local Agent

The local agent should provide:

- changed files;
- validation commands and output;
- lockfile MD5 before and after;
- commit hash;
- commit summary;
- commit description;
- any residual risks or follow-up decisions.
