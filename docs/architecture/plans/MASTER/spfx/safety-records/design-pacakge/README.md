# Safety Record Keeping — Fresh Design Package

## Purpose

This package defines a fresh Release 1 design for the Safety Record Keeping solution with the finalized site topology:

- **User experience / application host:** `https://hedrickbrotherscom.sharepoint.com/sites/Safety`
- **Upload landing zone for offline field checklists:** `/sites/Safety`
- **Authoritative structured safety lists:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- **Canonical reference lists already on HBCentral:** `Projects`, `Legacy Project Fallback Registry`

The design assumes field safety coordinators complete the governed Excel checklist **offline**, then upload the workbook through the Safety application. The backend parses the workbook, recalculates the inspection score, creates formal safety records on HBCentral, and updates reporting-period / project-week rollups.

## Included documents

- `00-Design-Summary.md`
- `01-Site-Topology-and-Hosting-Model.md`
- `02-Release-1-Upload-First-Workflow.md`
- `03-Data-Model-and-HBCentral-List-Architecture.md`
- `03A-Checklist-Template-Contract.md`
- `04-Parser-Validation-and-Scoring-Engine.md`
- `05-Downstream-Safety-Field-Excellence-Publishing-Model.md`
- `06-Implementation-Plan.md`
- `07-Risks-Assumptions-and-Decisions.md`

## Core decisions

1. **Do not require live in-app checklist entry in Release 1.**
2. **Use the Excel checklist as the governed offline field instrument.**
3. **Treat uploaded workbooks as input artifacts, not source-of-truth records.**
4. **Recalculate scores in the backend from parsed checklist responses.**
5. **Store authoritative structured records on HBCentral, not in the Safety-site lists.**
6. **Keep the Safety site focused on experience, intake, queueing, and submission UX.**
7. **Preserve each inspection event as a first-class record.**
8. **Derive weekly project scores from one or more inspection events.**

## Fast read path

Read in this order:

1. `00-Design-Summary.md`
2. `01-Site-Topology-and-Hosting-Model.md`
3. `02-Release-1-Upload-First-Workflow.md`
4. `03-Data-Model-and-HBCentral-List-Architecture.md`
5. `03A-Checklist-Template-Contract.md`
6. `04-Parser-Validation-and-Scoring-Engine.md`
7. `05-Downstream-Safety-Field-Excellence-Publishing-Model.md`
8. `06-Implementation-Plan.md`
