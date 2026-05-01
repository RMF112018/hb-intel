# Prompt 01 — PDF and Repo-Truth Audit Only / No Writes

You are working in the local repo:

```text
/Users/bobbyfetting/hb-intel
```

Your objective is to perform a comprehensive, no-write audit for **Phase 3 / Wave 09 — Job Startup Checklist**. This is an audit and planning pass only. Do not modify files. Do not create files. Do not stage or commit anything.

Do not re-read files that are still within your current context or memory unless you need to verify repo truth, line-level details, or changed content.

---

## Objective

Audit the standard startup checklist PDF and the current Project Control Center planning/model metadata so Wave 09 can be accurately defined as a governed item-level **Job Startup Checklist** workflow module.

The final output of this prompt is:

1. a PDF extraction report;
2. a repo-truth audit report;
3. a proposed documentation/metadata edit plan for Prompt 02;
4. explicit open decisions or ambiguities.

Make no file changes.

---

## Required Source PDF

Inspect this exact file directly:

```text
/Users/bobbyfetting/hb-intel/docs/reference/example/Project_Startup_Checklist.pdf
```

You must confirm whether it exists at that path.

The PDF contains the standard startup checklist items that must seed the module by default. Do not summarize it loosely. Perform a complete item-level audit.

---

## Required PDF Extraction

Extract and report:

- every checklist section/category;
- every standard checklist item;
- the source section for each item;
- item order within the source;
- responsible role/party if present;
- timing, due-date, trigger-date, prerequisite, review, approval, attachment/reference, or sign-off requirement if present;
- grouping/order logic;
- conditional applicability by project type, stage, delivery method, role, or other condition if present;
- any ambiguous items, duplicate-seeming items, unclear ownership, or implementation decisions requiring closure.

Use a structured table where practical.

Minimum table columns:

```text
Source Section | Source Order | Checklist Item | Responsible Role/Party | Timing/Trigger | Review/Approval/Sign-Off | Attachment/Reference | Conditionality | Notes / Ambiguities
```

If the PDF extraction method is imperfect, clearly state the limitation and use a secondary method to validate the content before proceeding.

---

## Required Repo-Truth Review

Inspect, at minimum:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/PccModuleFlags.ts
packages/models/src/pcc/PccCapabilities.ts
```

Search the repo for:

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

Use fast, targeted repo-truth commands such as:

```bash
cd /Users/bobbyfetting/hb-intel
pwd
git status --short
rg -n "Project_Startup_Checklist|Startup Checklist|Job Startup Checklist|Startup Center|startup|project-readiness|readiness|checklist" .
```

Use narrower searches if the broad search is too noisy.

---

## Product Definition to Test Against Repo Truth

Wave 09 should define the **Job Startup Checklist** as a governed item-level Project Readiness workflow module seeded from `docs/reference/example/Project_Startup_Checklist.pdf`.

The module should support:

- default seeded startup checklist items from the PDF;
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
- traceability back to the source PDF, source section, source item, source order, and seed version.

---

## Status Vocabulary Review

Determine whether the Phase 3 Project Readiness framework already defines or implies a status vocabulary.

Expected vocabulary unless repo truth requires otherwise:

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

Do not recommend a separate startup-specific status vocabulary unless the repo already defines one and the conflict is documented.

---

## Editable Authority Review

Unless repo truth requires different wording, plan for this authority model:

- Project Executive and Project Manager can review and maintain the Job Startup Checklist.
- Admin / PCC Admin may configure or correct seeded items and project-level records.
- Other project users may receive assigned responsibilities, comments, and read-only or limited participation views, depending on future implementation scope.
- No runtime permission, tenant, SharePoint, Procore, Sage, or external-system mutation is authorized by this planning update.

Identify any conflict with current capability or persona definitions.

---

## Default Seed Posture Review

Confirm how the docs should describe seeded default checklist items.

Recommended posture:

- standard checklist items from the PDF are seeded by default;
- project-specific changes preserve traceability to source file, source section, source checklist item, source order, and seed version;
- project-level overrides must preserve active/inactive/not-applicable state;
- future implementation must distinguish standard seed content from project-specific modifications.

---

## Priority Actions / Rollup Review

Assess where and how the Wave 09 docs should describe linkage to:

- Priority Actions Rail as readiness blockers;
- Project Home readiness summary;
- Project Readiness rollups;
- My Responsibilities / assigned-item views in later phases.

Blocked, overdue, missing-owner, and needs-review startup checklist items should be eligible to surface.

Do not recommend action execution or workflow mutation in Wave 09 unless current roadmap truth explicitly scopes it.

---

## Files That May Need Changes in Prompt 02

Likely candidate files, subject to audit:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/PccModuleFlags.ts
packages/models/src/pcc/PccCapabilities.ts
```

Do not assume all files must change. Identify only files justified by repo truth.

---

## Forbidden Work During Prompt 01

Do not:

- modify files;
- create files;
- stage changes;
- commit;
- implement SPFx UI;
- implement backend routes;
- implement parser/importer logic;
- generate JSON schema;
- alter packages, manifests, workflows, deployments, or lockfiles;
- authorize tenant, Graph, PnP, SharePoint REST, Procore, Sage, Document Crunch, Adobe Sign, or other runtime integrations.

---

## Required Output

Return the audit in this format:

```text
## Prompt 01 Audit — Wave 09 Job Startup Checklist

### Repo State

- Current branch:
- Current HEAD:
- git status --short:
- PDF exists at expected path: Yes/No

### PDF Extraction Report

[Structured section/item-level extraction table.]

### Repo-Truth Findings

- Roadmap findings:
- Blueprint findings:
- Standard Project Site Template Contract findings:
- Phase 3 Module Implementation Plan findings:
- Model metadata findings:
- Search findings:

### Proposed Wave 09 Product Definition

- ...

### Proposed Documentation / Metadata Edit Plan for Prompt 02

| Candidate File | Proposed Change | Justification | Required / Optional |
|---|---|---|---|

### Status Vocabulary Recommendation

- ...

### Authority / Capability Recommendation

- ...

### Priority Actions / Rollup Recommendation

- ...

### Open Decisions / Ambiguities

| Decision | Source | Why It Matters | Recommendation |
|---|---|---|---|

### Prompt 02 Readiness Verdict

Ready / Needs decision closure before writes
```

Keep the report precise. Include enough detail that Prompt 02 can update the planning docs without guessing.
