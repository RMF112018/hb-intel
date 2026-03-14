# Workflow List Schemas — G2 Consolidated Reference

> **Doc Classification:** Living Reference (Diátaxis) — Reference quadrant; data model audience; consolidated schema reference for all Wave 0 Group 2 workflow-family lists.

**Source:** W0-G2-T01 — Shared List Schema Standards and PID Contract (§2–§3, §6)
**Populated By:** T02 (Startup), T03 (Closeout), T04 (Safety), T05 (Project Controls), T06 (Financial)
**Consumers:** T07 (provisioning saga), T09 (integration tests), Wave 1 app teams

---

## Mandatory Fields — Every G2 List

Every G2 workflow-family list must include the following fields in addition to workflow-specific fields:

| Field | InternalName | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| Project ID | `pid` | Text | Yes | See [PID Contract](./pid-contract.md) — indexed, default = `projectNumber` |
| Title | `Title` | Text | Yes | SharePoint built-in — repurposed per list (record number, item name) |
| Status | `Status` | Choice | Yes | Workflow-specific choices defined per list in T02–T06 |
| Created | *(built-in)* | DateTime | Auto | SharePoint-managed — do not declare in `IListDefinition.fields[]` |
| Modified | *(built-in)* | DateTime | Auto | SharePoint-managed — do not declare in `IListDefinition.fields[]` |
| Created By | *(built-in)* | User | Auto | SharePoint-managed — do not declare in `IListDefinition.fields[]` |

---

## Naming Conventions

### List Titles
- Use sentence case (not ALL CAPS or Title Case With Every Word)
- Use plain language matching operational vocabulary
- Maximum 50 characters
- Examples: `Startup Checklist Items`, `JHA Log`, `Buyout Log`, `Permit Log`

### Internal Field Names
- PascalCase without spaces (exception: `pid` is lowercase per contract)
- Never use spaces (SharePoint encodes as `_x0020_`)
- Never use reserved SharePoint names (`ID`, `Author`, `Editor`, `Created`, `Modified`)
- Examples: `StartDate`, `DueDate`, `AssignedTo`, `ParentRecord`

### Choice Field Patterns

| Pattern | Choices | Used For |
|---------|---------|----------|
| Checklist items | `Open \| In Progress \| Complete \| N/A` | Startup, closeout, safety checklists |
| Log entries | `Open \| In Progress \| Closed` | JHA, permits, inspections, constraints |
| Approval workflows | `Pending \| Submitted \| Approved \| Rejected` | Buyout, subcontract, draw schedule |
| Financial records | `Pending \| Active \| Complete \| On Hold` | Forecast, GC-GR |

T02–T06 use these patterns as defaults. Workflow-specific deviations must be documented with rationale.

---

## Seeded-File Classification Model

| State | Definition | G2 Action |
|-------|-----------|-----------|
| **Seed now** | Needs both a backing list and a seeded template file for current operational use | Create list + create asset file + add to `template-file-manifest.ts` |
| **List only** | Sufficiently captured by a SharePoint list; no template file needed | Create list only |
| **Reference file only** | Too early-stage or document-centric for a list in Wave 0 | Create asset file + add to `template-file-manifest.ts` |
| **Future feature target** | Recognized but neither list nor file appropriate in Wave 0 | No G2 provisioning action; log as Wave 1 input |

---

## T02 — Startup / Kickoff / Handoff Schemas

*Section populated by T02 implementation. Placeholder for list field schemas.*

---

## T03 — Closeout / Turnover / Punch Schemas

*Section populated by T03 implementation. Placeholder for list field schemas.*

---

## T04 — Safety / JHA / Incident Schemas

*Section populated by T04 implementation. Placeholder for list field schemas.*

---

## T05 — Project Controls / Permits / Inspections Schemas

*Section populated by T05 implementation. Placeholder for list field schemas.*

---

## T06 — Financial / Buyout / Forecast Schemas

*Section populated by T06 implementation. Placeholder for list field schemas.*

---

*End of Workflow List Schemas v1.0 — scaffold; populated incrementally by T02–T06*
