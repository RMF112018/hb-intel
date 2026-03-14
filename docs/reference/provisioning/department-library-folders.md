# Department Library & Folder Tree Reference

> **Doc Classification:** Canonical Current-State — Reference quadrant; provisioning audience; documents department-specific library pruning and folder tree structure.

**Source:** W0-G2-T08 — Validation, Idempotency, Migration, and Seed Rules
**Config:** `backend/functions/src/config/core-libraries.ts`

---

## Library Pruning Model

Each project receives the 3 core libraries (Project Documents, Drawings, Specifications). When a project's `department` field is set, the department-specific library is **added** to the core set. Libraries from other departments are omitted.

| Department | Additional Library | Total Libraries |
|------------|-------------------|-----------------|
| `commercial` | Commercial Documents | 4 |
| `luxury-residential` | Luxury Residential Documents | 4 |
| *(none set)* | *(none)* | 3 |

---

## Commercial Folder Tree (34 folders)

**Library:** Commercial Documents

```
Owner Files/
  Contract/
  Insurance/
  Notices/
Engineering Reports/
  Civil/
  MEP/
  Structural/
  Surveyor/
Permits/
  HBC Permits/
  Sub Permits/
Testing and Inspection/
  Concrete/
  Soil/
  Special Inspections/
Meetings/
Safety/
  JHA Forms/
  Incident Reports/
Schedule/
  CPM/
  3 Week Look Ahead/
Accounting/
  Budget/
  Forecast/
  Pay Applications/
Change Orders/
  PCO/
  PCCO/
Subcontractor/
Closeout/
  Owner Manual/
  Punchlist/
```

---

## Luxury Residential Folder Tree (37 folders)

**Library:** Luxury Residential Documents

```
Owner Files/
  Contract/
  Insurance/
  Notices/
  Owner Direct Subcontracts/
Engineering Reports/
  Civil/
  MEP/
  Structural/
  Surveyor/
Permits/
  HBC Permits/
  Sub Permits/
Testing and Inspection/
  Concrete/
  Soil/
  HVAC/
Meetings/
Safety/
  JHA Forms/
  Incident Reports/
Schedule/
  CPM/
  3 Week Look Ahead/
Accounting/
  Budget/
  Forecast/
  Pay Applications/
Change Orders/
  PCO/
  PCCO/
Subcontractor/
  Working Documents/
Closeout/
  Owner Manual/
  Punchlist/
  Survey/
```

---

## Key Differences Between Departments

| Feature | Commercial | Luxury Residential |
|---------|-----------|-------------------|
| Owner Direct Subcontracts folder | No | Yes |
| Testing/Inspection: Special Inspections | Yes | No |
| Testing/Inspection: HVAC | No | Yes |
| Subcontractor/Working Documents | No | Yes |
| Closeout/Survey | No | Yes |
| **Total folders** | **34** | **37** |

---

## Folder Ordering Requirement

Folders are listed in **parent-first order** in the configuration array. Sequential creation via `createFolderIfNotExists` works without path-segment walking because parent folders always appear before their children.

The `validateDepartmentConfig()` helper enforces this ordering constraint.

---

*End of Department Library & Folder Tree Reference v1.0*
