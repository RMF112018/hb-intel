# Prompt 02 — Optional Minimal Documentation Patch If Required

Use this prompt only after completing:

```text
Prompt 01 — Phase 0 Step 1 Architecture Stabilization Audit
```

## Objective

If the Phase 0 Step 1 audit found clear documentation contradictions that block schema extraction, make the minimum necessary documentation-only corrections to stabilize the governing Project Control Center architecture.

This prompt is optional. Do not run it if the audit found no blocking documentation contradictions.

## Scope

You may modify only markdown files under:

```text
docs/architecture/blueprint/sp-project-control-center/
```

Preferred files for corrections:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md
```

Do **not** modify:

- code;
- schemas;
- SPFx packages;
- backend files;
- manifests;
- tests;
- provisioning scripts;
- package versions;
- generated files;
- app files outside the PCC documentation directory.

Do **not** create `packages/project-site-template/`.

Do **not** create schemas.

Do **not** implement PCC.

Do **not** re-read files that are still within your current context or memory unless you need to verify exact edit locations, resolve a contradiction, or confirm repo truth.

---

## Required Patch Rules

Only patch issues that meet all of these conditions:

1. The issue was identified in the Phase 0 Step 1 audit.
2. The issue blocks or materially confuses schema extraction.
3. The correct value is already established in the governing docs or Decision Closure Register.
4. The patch is a documentation-only clarification, not a new architecture decision.

If an issue requires a new decision, do **not** patch it. Add it to the backlog as an architecture decision required before Phase 1.

---

## High-Priority Corrections If Found

Patch any confirmed contradiction involving:

- ProjectType values;
- ProjectStage values;
- ProjectStatus values;
- archive being incorrectly treated as a stage;
- `active_construction` being incorrectly treated as ProjectType;
- `preconstruction_only` or `warranty_closeout` appearing as active architecture values;
- Procore mapping owner;
- Project Accountant incorrectly named as Procore mapping owner;
- ProcoreCompanyId as a secret instead of configuration;
- direct SPFx-to-Procore API calls;
- storing Procore secrets in SharePoint/SPFx/markdown/repo/client config;
- Sage Intacct system-of-record boundary;
- Team & Access bypassing PCC UI;
- normal users requiring native SharePoint settings/edit screens;
- Decision Closure Register status values outside:
  - `Frozen for MVP`
  - `Runtime Configuration`
  - `Deferred`
  - `Proof-Gated`

---

## Required Documentation Update Pattern

For every patch:

1. Preserve existing headings unless a heading is clearly wrong.
2. Prefer small edits over large rewrites.
3. Add clarifying language rather than deleting useful context.
4. Do not introduce new IDs, credentials, secrets, or implementation assumptions.
5. If updating both blueprint and contract, keep strategic language in the blueprint and implementation language in the contract.
6. Update the Phase 0 audit files to reflect the patched status.

---

## Required Validation

After patching:

1. Search the PCC documentation directory for obsolete active enum values:
   - `preconstruction_only`
   - `warranty_closeout`
2. Search for `active_construction` and confirm it is only used as ProjectStage.
3. Search for Procore direct-call language and confirm SPFx direct Procore API calls are prohibited.
4. Confirm no secrets were added.
5. Confirm only markdown documentation files changed.
6. Confirm no files outside `docs/architecture/blueprint/sp-project-control-center/` changed.

---

## Required Completion Summary

Provide:

```markdown
## Completion Summary

### Documentation Files Modified
### Contradictions Resolved
### Items Left Unchanged and Why
### Items Deferred for Architecture Decision
### Validation Performed
### Confirmation of No Code / Schema / SPFx / Backend Changes
### Suggested Commit Message
```

Suggested commit message:

```text
docs(sp-project-control-center): stabilize phase 0 architecture documentation
```
