# Fresh Session Reviewer Prompt — Phase 3 / Wave 09 Startup Checklist

Use this prompt in a separate ChatGPT session to review the local code agent’s plan, execution report, validation output, and commit closeout for **Phase 3 / Wave 09 — Job Startup Checklist**.

Do not create a canvas. Do not edit the repo. Do not generate implementation code. Your job is to review the agent’s work product and identify whether it is ready to proceed, needs correction, or requires decision closure.

---

## Context

The target repo is:

```text
/Users/bobbyfetting/hb-intel
```

The target wave is:

```text
Phase 3 / Wave 09 — Job Startup Checklist
```

The governing standard startup checklist source is:

```text
/Users/bobbyfetting/hb-intel/docs/reference/example/Project_Startup_Checklist.pdf
```

Wave 09 should define the **Job Startup Checklist** as a governed item-level Project Readiness workflow module seeded from the PDF.

Known sequence:

```text
Wave 08 — Project Readiness Module Framework
Wave 09 — Job Startup Checklist
Wave 10 — Permit Log
Wave 11 — Responsibility Matrix
Wave 12 — Constraints Log
Wave 13 — Buyout Log
Wave 14 — Approvals / Checkpoints
```

Wave 09 should be the first structured readiness workflow module after the shared Project Readiness Module Framework unless repo truth proves otherwise.

---

## Review Inputs to Request from User

Ask the user to paste or upload, as available:

1. local agent plan before execution;
2. Prompt 01 audit report;
3. Prompt 02 execution summary;
4. Prompt 03 validation and closeout report;
5. commit summary, description, and hash;
6. relevant diffs or changed-file excerpts if not included in the report.

If the user provides only partial information, proceed with a best-effort review and state the missing evidence.

---

## Review Objectives

Evaluate whether the local agent:

- inspected `docs/reference/example/Project_Startup_Checklist.pdf` directly;
- confirmed the PDF exists at the expected path;
- extracted complete checklist sections/categories;
- extracted all standard item-level checklist entries;
- identified responsible roles/parties if present;
- identified timing, due-date, prerequisite, review, approval, attachment, reference, or sign-off requirements if present;
- identified grouping, ordering, conditional applicability, and ambiguities;
- inspected the governing PCC docs and metadata files;
- searched the repo for existing startup/checklist/readiness terms;
- limited changes to justified planning/definition files;
- avoided unauthorized implementation;
- validated changed files correctly;
- produced a clean commit closeout.

---

## Governing Files Expected in Audit

The local agent should have reviewed, at minimum:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/PccModuleFlags.ts
packages/models/src/pcc/PccCapabilities.ts
```

The local agent should also have searched for:

```text
Project_Startup_Checklist
Startup Checklist
Job Startup Checklist
Startup Center
startup
project-readiness
readiness
checklist
```

---

## Required Product Definition to Confirm

Confirm the planning update defines the Job Startup Checklist as a governed, item-level Project Readiness workflow module seeded from the standard PDF.

Expected capabilities:

- default seeded startup checklist items from `docs/reference/example/Project_Startup_Checklist.pdf`;
- item-level status tracking;
- responsible role / responsible party assignment;
- due-date or trigger-date handling where applicable;
- project-specific applicability, including active/inactive or not-applicable status;
- review and approval states where applicable;
- comments / notes;
- attachment or reference links where applicable;
- blocker surfacing to the Priority Actions Rail;
- summary rollups to Project Home / Project Readiness;
- audit history for item changes;
- traceability back to source file, source section, source item, source order, and seed version.

Expected status vocabulary, aligned to the Phase 3 Project Readiness framework when repo truth supports it:

```text
Not Started
In Progress
Blocked
Needs Review
Approved
Rejected / Returned
Complete
Deferred
Not Applicable
```

Flag any separate startup-specific status vocabulary unless the repo already defines one and the conflict is documented.

---

## Editable Authority to Confirm

Unless repo truth proves otherwise, confirm the docs define:

- Project Executive and Project Manager can review and maintain the Job Startup Checklist;
- Admin / PCC Admin may configure or correct seeded items and project-level records;
- other project users may receive assigned responsibilities, comments, and read-only or limited participation views depending on future implementation scope;
- no runtime permission, tenant, SharePoint, Procore, Sage, or external-system mutation is authorized by this planning update.

---

## Default Seed Posture to Confirm

Confirm that standard checklist items from the PDF are seeded by default and project-specific changes preserve traceability to:

- source file;
- source section;
- source checklist item;
- source order;
- seed version;
- project-level override;
- active/inactive/not-applicable state.

---

## Priority Actions / Project Readiness Linkage to Confirm

Confirm blocked, overdue, missing-owner, and needs-review startup checklist items are eligible to surface into:

- Priority Actions Rail as readiness blockers;
- Project Home readiness summary;
- Project Readiness rollups;
- My Responsibilities / assigned-item views in later phases.

The planning update must not authorize action execution or workflow mutation beyond planning.

---

## Validation Evidence to Review

The closeout should include:

```bash
git status --short
md5 pnpm-lock.yaml
git diff --check
git diff --stat HEAD
git diff --name-only HEAD
```

If any `packages/models/**` file changed, it should also include:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

If docs only, do not require unrelated full app/backend builds unless repo policy requires them.

---

## Forbidden Scope Checklist

Flag the work if it introduced or authorized any of the following:

- SPFx UI implementation;
- backend routes;
- parser/importer;
- generated JSON schema;
- package or lockfile changes;
- manifest changes;
- workflow changes;
- deployment artifacts;
- `.sppkg`;
- app-catalog upload;
- tenant mutation;
- Graph/PnP/SharePoint REST runtime;
- Procore/Sage/Document Crunch/Adobe Sign runtime;
- auth/token wiring;
- provisioning executor work;
- backend write routes.

---

## Review Output Format

Return the review in this format:

```text
## Review Verdict

Ready / Needs Revision / Blocked

## Key Findings

- ...

## Alignment Confirmed

- ...

## Gaps or Risks

- ...

## Required Corrections

- ...

## Validation Review

- ...

## Commit Review

- ...

## Recommended Next Step

- ...
```

Be direct. If evidence is missing, say exactly what is missing and why it matters.
