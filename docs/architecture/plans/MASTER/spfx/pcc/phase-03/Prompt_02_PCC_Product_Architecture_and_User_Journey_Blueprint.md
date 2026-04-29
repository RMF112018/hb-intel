# Prompt 02 — PCC Product Architecture and User Journey Blueprint

## Objective

Conduct a repo-truth planning pass and create a documentation-only Product Architecture and User Journey Blueprint for the Project Control Center (PCC).

The objective is to define the PCC as a daily project operating surface for project teams while Phase 2 provisioning continues. Do not implement SPFx, backend, provisioning, tenant mutation, or Procore runtime behavior.

## Context

Phase 3 may proceed only as a planning/readiness track while Phase 2 continues. The prior Phase 3 readiness documentation established that product architecture and user journey planning are concurrent-safe because they do not require stable Phase 2 manifest exports or execution semantics.

The PCC is intended to be a governed SharePoint-hosted business application on each project site. It must organize project identity, daily priorities, responsibilities, documents, access, readiness, workflow records, site health, settings, and external system launch/context without requiring normal users to use native SharePoint administration.

## Primary Question

What should the PCC product experience accomplish for each project role, and what user journeys must the future SPFx shell and backend services support?

## Required Repo Sources

Inspect current repo truth before writing:

```text
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-3/**
docs/reference/ui-kit/doctrine/**
docs/reference/spfx-surfaces/**
packages/project-site-template/**
packages/project-site-provisioning/**
```

Search for existing related application patterns:

```text
Project Sites
Document Control Center
Team & Access
Site Health
Priority Actions Rail
Project Home
Command Center
Responsibility Matrix
Action Center
Project Directory
Control Center Settings
```

## Allowed Files

Create documentation only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/PCC_Product_Architecture_and_User_Journey_Blueprint.md
```

Optional, only if needed:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Phase_3_Open_Decision_Register.md
```

## Forbidden Files

Do not modify:

```text
apps/**
backend/**
packages/**
tools/**
.github/**
scripts/**
infra/**
package.json
pnpm-lock.yaml
tsconfig.base.json
turbo.json
SPFx manifests
deployment workflows
tenant/provisioning scripts
```

## Required Deliverable — `PCC_Product_Architecture_and_User_Journey_Blueprint.md`

Include the following sections:

1. Objective
2. Source documents audited
3. Product definition
4. PCC operating principles
5. Role/persona matrix
6. Primary user journeys
7. Project Home / Command Center experience
8. Work Center Navigation model
9. Priority Actions Rail model
10. Today / This Week model
11. Readiness and risk rollup model
12. My Responsibilities model
13. Team & Access journey
14. Document Control journey
15. Site Health / drift / repair journey
16. Control Center Settings journey
17. External system launch/context journey
18. Incomplete provisioning and missing data states
19. Archive/read-only behavior
20. Mobile/tablet/desktop user posture
21. Interface assumptions
22. Phase 2 dependencies
23. Open decisions
24. Risks
25. Recommended next prompt

## Required Personas

Document role-based journeys for at least:

- Project Executive
- Project Manager
- Superintendent
- Project Accountant
- Safety / QAQC
- Manager of Operational Excellence
- Estimating Coordinator / Lead Estimator
- IT / Control Center Admin
- Executive Oversight / Global Read-Only user

## Required Journey Detail

For each persona include:

- primary objective
- common entry points
- key daily questions
- common actions
- required PCC surfaces
- required backend/read model assumptions
- blocked implementation dependencies
- success criteria

## Required Product Architecture Rules

Preserve these rules:

- PCC is not native SharePoint administration.
- Normal users must not need SharePoint page edit mode, list settings, library settings, site settings, or advanced permissions.
- PCC is not Procore, Sage, Compass, Document Crunch, Adobe Sign, Cupix, Teams, or Outlook.
- PCC organizes, summarizes, deep-links, and governs project context around those systems.
- Procore remains backend-routed.
- SPFx does not call Procore directly.
- SharePoint lists do not become a full Procore mirror.
- Procore write-back remains out of scope.
- External users remain deferred unless separately approved.
- HBI Assistant remains deferred unless repo truth explicitly authorizes it.
- ProjectType, ProjectStage, and ProjectStatus remain orthogonal.

## Required Interface Assumptions Register

Include a table:

```markdown
| Assumption ID | Assumption | Source / Reason | Phase 2 Dependency | Risk if Wrong | Resolution Gate |
|---|---|---|---|---|---|
```

## Required Open Decision Register

Include a table:

```markdown
| Decision ID | Decision Needed | Options | Recommended Interim Position | Owner | Required Before |
|---|---|---|---|---|---|
```

Do not close decisions unless repo truth supports closure.

## Validation

Run:

```bash
git status --short
```

If documentation-only:

```text
No build/typecheck required because no code changed.
```

If a repo-standard Markdown validation command exists, run it. If not, state that none was found.

## Required Final Response

Return only:

```text
Commit summary
Commit description
Validation results
Open decisions
Recommended next prompt
```

## Recommended Commit Summary

```text
docs(pcc): define phase 3 product architecture and user journeys
```

## Recommended Commit Description

```text
Manifest: SharePoint Project Control Center

Version: no package or SPFx version change; documentation-only Phase 3 product planning step.

Adds the PCC Product Architecture and User Journey Blueprint under docs/architecture/blueprint/sp-project-control-center/phase-3/. Defines the PCC as a daily governed project operating surface and maps role-based journeys for project executives, project managers, superintendents, accounting, safety/QAQC, IT/admin, estimating, operational excellence, and executive oversight users.

Preserves Phase 3 concurrent boundaries:
- planning only;
- no SPFx implementation;
- no backend implementation;
- no provisioning executor;
- no tenant mutation;
- no Graph/PnP calls;
- no Procore runtime, secrets, mirror, or write-back.

Validation:
- git status --short
- documentation-only; no build/typecheck required because no code changed
```
