# 01 — Repo-Truth Audit Checklist

Run these checks before making edits.

## 1. Confirm branch and repo state

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -10
```

Record:
- active branch;
- uncommitted changes;
- latest relevant PCC commits.

If unrelated user work exists, do not overwrite it.

## 2. Confirm Wave 7 location and current definition

Inspect these files if present:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-07/
```

Search commands:

```bash
rg -n "Wave 7|wave-7|Documents / Document Control|Document Control Center|HB Document Control Center|Microsoft Files Lane|External Document Systems Lane|My Project Files|Project Document Source Registry|Project Engineer|Project Coordinator" docs/architecture/blueprint/sp-project-control-center docs/architecture/plans/MASTER/spfx/pcc
```

Confirm:
- Phase 3 Wave 7 is still Document Control / Documents.
- Responsibility Matrix remains later scope unless docs intentionally say otherwise.
- Existing two-lane language is identified for update.

## 3. Confirm current role sources

Inspect:

```text
packages/models/src/pcc/PccUserRoles.ts
packages/models/src/auth/ProjectRoles.ts
packages/models/src/pcc/PccCapabilities.ts
packages/models/src/pcc/TeamAccess.ts
packages/project-site-template/schemas/families/permissions.schema.json
packages/project-site-template/fields/families/permissions.fields.json
packages/project-site-template/validation/fixtures/valid/permissions.valid.json
```

Search commands:

```bash
rg -n "PCC_PERSONAS|ProjectRole|PCC_PERSONA_CAPABILITIES|TEAM_ACCESS_MANAGER_PERSONAS|templateKey|project_management|field_operations|project_accounting|estimating_preconstruction|external_design_team|owner_client_viewer|subcontractor_limited" packages/models/src packages/project-site-template
```

Confirm and reference in docs:
- canonical PCC personas;
- project-scoped role layer;
- permission template layer;
- deferred external templates;
- Team & Access manager personas.

## 4. Confirm existing Document Control models/surfaces

Inspect if present:

```text
packages/models/src/pcc/DocumentControl.ts
packages/models/src/pcc/PccReadModels.ts
apps/project-control-center/src/surfaces/documents/
backend/functions/src/hosts/pcc-read-model/
```

Search commands:

```bash
rg -n "DocumentControl|document-control|documents|DOCUMENT_CONTROL|PccDocumentControl|External Document|Microsoft Files|Procore|Document Crunch|Adobe Sign" packages/models/src/pcc apps/project-control-center/src backend/functions/src
```

Use findings to avoid duplicating or contradicting existing source/read-model terminology.

## 5. Capture lockfile checksum before docs-only edit

```bash
md5 pnpm-lock.yaml
```

Record checksum. It should not change.

## 6. Audit finding summary

Before editing, write a short internal summary for yourself covering:

- docs found;
- current Wave 7 definition;
- docs requiring update;
- role model evidence;
- risk/contradiction notes;
- files you plan to edit.

Do not create a permanent plan file unless that matches repo conventions or the user explicitly authorized it.
