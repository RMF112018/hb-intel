# Prompt 02 — Documentation Definition Update

You are working in the local repo:

```text
/Users/bobbyfetting/hb-intel
```

You are executing **Phase 3 / Wave 09 — Job Startup Checklist** planning refinement after completing Prompt 01.

Do not re-read files that are still within your current context or memory unless you need to verify repo truth, line-level details, or changed content.

---

## Objective

Update the appropriate Project Control Center planning, blueprint, roadmap, contract, and justified metadata files so **Wave 09 — Job Startup Checklist** is accurately defined as a governed item-level Project Readiness workflow module seeded from:

```text
docs/reference/example/Project_Startup_Checklist.pdf
```

This is a definition/planning-only update.

Do not implement runtime functionality.

---

## Required Inputs Before Editing

Before writing any file, review your Prompt 01 audit report and confirm:

- the PDF exists at `docs/reference/example/Project_Startup_Checklist.pdf`;
- complete checklist sections/categories were extracted;
- complete standard item-level checklist entries were extracted;
- responsibilities, timing, approvals, attachments/references, grouping, ordering, conditionality, and ambiguities were identified where present;
- governing PCC docs and model metadata were reviewed;
- candidate files for edits are justified by repo truth.

If Prompt 01 identified unresolved decisions that materially affect definition wording, use conservative planning language and list the decision as unresolved rather than inventing an answer.

---

## Candidate Files

Modify only files justified by Prompt 01 and current repo truth.

Candidate files may include:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/PccModuleFlags.ts
packages/models/src/pcc/PccCapabilities.ts
```

Do not require all files to change. Do not change a file unless the audit proves the change is necessary.

---

## Required Definition Content

Where appropriate in the governing docs, define Wave 09 as:

```text
Wave 09 — Job Startup Checklist
```

Define the module as a governed item-level Project Readiness workflow module seeded by default from:

```text
docs/reference/example/Project_Startup_Checklist.pdf
```

The docs should establish that the source PDF is the standard seed reference, not a runtime importer requirement.

---

## Product Definition Requirements

The planning update must describe that the Job Startup Checklist supports, or is planned to support:

- default seeded startup checklist items from the PDF;
- item-level status tracking;
- responsible role / responsible party assignment;
- due-date or trigger-date handling where applicable;
- project-specific applicability, including active/inactive or not-applicable state;
- review and approval states where applicable;
- comments / notes;
- attachment or reference links where applicable;
- blocker surfacing to the Priority Actions Rail;
- summary rollups to Project Home / Project Readiness;
- audit history for item changes;
- traceability back to the source PDF, source section, source item, source order, and seed version.

Do not overstate implemented functionality. Use planning language if the repo has not implemented the module yet.

---

## Checklist Seed Posture

Add or refine language establishing that:

- standard checklist items are seeded by default from `docs/reference/example/Project_Startup_Checklist.pdf`;
- each seeded item should retain source traceability:
  - source file;
  - source section;
  - source checklist item;
  - source order;
  - seed version;
- project-specific modifications must preserve the standard seed lineage;
- project records may carry:
  - project-level override;
  - active/inactive/not-applicable state;
  - responsible role/party;
  - status;
  - due/trigger date if applicable;
  - review/approval state if applicable;
  - comments/notes;
  - attachment/reference links if applicable;
  - audit history.

Do not create an actual seed file, parser, importer, generated schema, or runtime model unless separately authorized in a later phase.

---

## Status Vocabulary

Use or align to the Phase 3 Project Readiness framework status vocabulary if repo truth supports it:

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

Do not invent a separate startup-specific status vocabulary unless the repo already defines one and the conflict is documented.

If the repo uses machine keys, preserve existing naming conventions and add comments/docs only if appropriate.

---

## Editable Authority / Participation Model

Unless repo truth requires different wording, define:

- Project Executive and Project Manager can review and maintain the Job Startup Checklist.
- Admin / PCC Admin may configure or correct seeded items and project-level records.
- Other project users may receive assigned responsibilities, comments, and read-only or limited participation views depending on future implementation scope.
- This planning update does not authorize runtime permission changes or live permission execution.

Align this language to existing persona/capability docs or metadata. Avoid introducing persona names that conflict with existing repo vocabulary.

---

## Priority Actions / Project Readiness Linkage

Define that blocked, overdue, missing-owner, or needs-review startup checklist items are eligible to surface into:

- Priority Actions Rail as readiness blockers;
- Project Home readiness summary;
- Project Readiness rollups;
- My Responsibilities / assigned-item views in later phases.

Keep this as planning/definition linkage. Do not implement action execution, notification, workflow mutation, persistence, or runtime integrations.

---

## Roadmap / Blueprint Consistency

Ensure the docs consistently position Wave 09 as the first structured readiness workflow module after:

```text
Wave 08 — Project Readiness Module Framework
```

Keep the downstream sequencing clear:

```text
Wave 10 — Permit Log
Wave 11 — Responsibility Matrix
Wave 12 — Constraints Log
Wave 13 — Buyout Log
Wave 14 — Approvals / Checkpoints
```

If the current docs use a different wave title or numbering convention, preserve repo truth but document the mapping clearly.

---

## Standard Project Site Template Contract Alignment

If the contract doc is updated, keep the language at contract/planning level.

Do not define a final database schema, generated JSON schema, parser contract, or SharePoint runtime implementation.

Appropriate contract-level language may include:

- module seed source;
- project-level item record expectations;
- traceability and override posture;
- readiness blocker eligibility;
- standard role authority posture;
- deferred implementation details.

---

## Model Metadata Files

Only update files under `packages/models/src/pcc/**` if Prompt 01 proves current metadata is incomplete or inconsistent for Wave 09 planning.

Permitted metadata-only updates may include:

- module flag labels/descriptions;
- work center/module naming alignment;
- capability descriptions that already exist for planning/preview;
- comments or descriptive constants consistent with existing patterns.

Forbidden metadata work:

- runtime permission execution;
- new backend route contracts;
- parser/importer interfaces;
- generated schema;
- persistence models;
- live tenant operation models;
- package or lockfile changes.

If any `packages/models/**` file changes, Prompt 03 must run model validation.

---

## Forbidden Work During Prompt 02

Do not implement or modify:

- SPFx UI;
- backend routes;
- parser/importer;
- generated JSON schema;
- package or lockfile files;
- manifests;
- workflows;
- deployment artifacts;
- `.sppkg`;
- tenant/app-catalog work;
- Graph/PnP/SharePoint REST runtime;
- Procore/Sage/Document Crunch/Adobe Sign runtime;
- auth/token wiring;
- provisioning executor;
- backend write routes.

Do not modify unrelated formatting across large docs unless necessary.

---

## Required Pre/Post Checks

Before editing:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
md5 pnpm-lock.yaml
```

After editing, before handing off to Prompt 03:

```bash
git status --short
md5 pnpm-lock.yaml
git diff --check
git diff --stat HEAD
git diff --name-only HEAD
```

Do not commit in Prompt 02 unless explicitly directed by the user. Commit is handled by Prompt 03.

---

## Required Output

Return:

```text
## Prompt 02 Execution Report — Wave 09 Job Startup Checklist

### Files Changed

- ...

### Definition Updates Made

- ...

### PDF Source Alignment

- Confirmed source path referenced as:
  docs/reference/example/Project_Startup_Checklist.pdf

### Status Vocabulary Alignment

- ...

### Authority / Capability Alignment

- ...

### Priority Actions / Rollup Alignment

- ...

### Boundaries Preserved

- No SPFx UI:
- No backend routes:
- No parser/importer:
- No generated schema:
- No package/lockfile/manifest/workflow/deployment changes:
- No tenant/runtime mutation:

### Validation Performed

- git status --short:
- md5 pnpm-lock.yaml:
- git diff --check:
- git diff --stat HEAD:
- git diff --name-only HEAD:

### Residual Risks / Open Decisions

- ...

### Prompt 03 Readiness Verdict

Ready / Needs correction before closeout
```
