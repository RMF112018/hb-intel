# P3-E7-T06 — UX Surface, Operational Views, and Reporting

**Doc ID:** P3-E7-T06
**Parent:** P3-E7 Permits Module
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 6 of 8
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Surface Overview

The Permits module exposes three primary operational surfaces and one executive review surface:

| Surface | Audience | Primary Purpose |
|---|---|---|
| Permit List View | PM, Site Supervisor | All permits for a project; health and expiration overview |
| Permit Detail View | PM, Site Supervisor | Single permit: lifecycle, inspections, deficiencies, evidence |
| Inspection Log | PM, Site Supervisor | Inspection visit log with deficiency tracking |
| Compliance Dashboard | PM, Leadership | Project-level permit compliance aggregate |
| Executive Review (PER) | Executives, Senior Leadership | Read + annotate; no mutations |

---

## 2. Permit List View

### 2.1 Columns and Default Sort

| Column | Source | Default Visible | Sortable | Filterable |
|---|---|---|---|---|
| Permit Number | `IssuedPermit.permitNumber` | Yes | Yes | Yes |
| Type | `IssuedPermit.permitType` | Yes | Yes | Yes (multi-select) |
| Jurisdiction | `IssuedPermit.jurisdictionName` | Yes | Yes | Yes |
| Status | `IssuedPermit.currentStatus` | Yes | Yes | Yes (multi-select) |
| Health | `IssuedPermit.derivedHealthTier` | Yes | Yes | Yes |
| Expiration Date | `IssuedPermit.expirationDate` | Yes | Yes (default asc) | Range |
| Days to Expiration | `IssuedPermit.daysToExpiration` (calculated) | Yes | Yes | — |
| Expiration Risk | `IssuedPermit.expirationRiskTier` | Yes | Yes | Yes |
| Open Deficiencies | Derived from `InspectionDeficiency` | Yes | Yes | — |
| Thread | `IssuedPermit.threadRelationshipType` | No | No | Yes |
| Responsible Party | `IssuedPermit.currentResponsiblePartyId` | No | No | Yes |
| Tags | `IssuedPermit.tags` | No | No | Yes (multi-tag) |

### 2.2 Health Status Indicators

| Health Tier | Color | Icon | List Row Treatment |
|---|---|---|---|
| `CRITICAL` | Red | ⛔ | Bold row; pinned to top of sort |
| `AT_RISK` | Amber | ⚠️ | Standard row; secondary sort after CRITICAL |
| `NORMAL` | Green | ✓ | Standard row |
| `CLOSED` | Gray | ✓ | Muted row; collapsed by default |

### 2.3 Thread View Toggle

When "Show Thread View" is toggled:
- Permits are grouped by `threadRootPermitId`
- Thread root is displayed first
- Children are indented one level
- Thread health badge appears on the root row
- Thread rows share a visual separator

### 2.4 Quick Actions (from List)

| Action | Permission | Triggers |
|---|---|---|
| View detail | All roles | Navigate to Permit Detail View |
| Mark inspection result | PM, Site Supervisor | Opens inspection result modal |
| Log deficiency | PM, Site Supervisor | Opens deficiency creation modal |
| Start renewal | PM | Creates `RENEWAL_INITIATED` lifecycle action |
| Export permit list | All roles | CSV export of visible columns |

---

## 3. Permit Detail View

### 3.1 View Sections

The detail view is organized into the following collapsible sections:

| Section | Content |
|---|---|
| **Header** | Permit number, type, jurisdiction, current status with badge, health tier indicator, next-move prompt (`@hbc/bic-next-move`) |
| **Identity and Dates** | Application date, issuance date, expiration date, renewal date, days to expiration, expiration risk tier |
| **Jurisdiction Contact** | Contact name, title, phone, email, address, office hours, portal URL |
| **Permit Details** | Description, conditions, tags, fee amount, bond amount |
| **Responsibility** | Accountable role, responsible party, next action owner, escalation owner, watchers |
| **Thread** | Parent permit link, child permits list, thread relationship type |
| **Required Inspections** | All `RequiredInspectionCheckpoint` records; status, result, sequence; progress bar |
| **Inspection Log** | All `InspectionVisit` records; chronological; expandable to show deficiencies |
| **Lifecycle History** | All `PermitLifecycleAction` records; chronological audit trail |
| **Evidence** | All `PermitEvidenceRecord` records; upload new; view/download |
| **Annotations** | PER-surface only; shows all annotations; creation available to executives |

### 3.2 Required Inspections Progress Display

```
Required Inspections: 11 of 14 complete (3 pending)
[========================================--------] 79%

 ✓  Building Footer & ISO pads           PASS
 ✓  Soil bearing test                    PASS
 ✓  Pre-slab inspection                  PASS
 ✓  Underground plumbing rough-in        PASS
 ✓  Structural steel                     PASS
 ⚠  Fire preliminary                     FAIL  ← blocking; re-inspection needed
 ✓  Framing rough-in                     PASS
 ✓  Electrical rough-in                  PASS
 —  Insulation                          PENDING
 —  Final — Building                    PENDING
 ✓  Final — Electrical                   PASS
 —  Final — Plumbing                    PENDING
 ✓  Final — Mechanical                   PASS
 ✓  Certificate of Occupancy             PASS
```

### 3.3 Lifecycle History Display

Each `PermitLifecycleAction` entry shows:
- Action type (human-readable label)
- Date/time
- Performed by (name + role)
- Previous status → New status
- Notes (if present)
- Evidence links (if attached)
- Acknowledgment status (if required)

Terminal states (`CLOSED`, `EXPIRED`, `REVOKED`) are displayed with distinct visual treatment (green seal, red expired badge, gray revoked stamp).

### 3.4 Editing Constraints in Detail View

| Field Group | Who May Edit |
|---|---|
| Description, conditions, tags | Project Manager |
| Jurisdiction contact | Project Manager |
| Fee amount, bond amount | Project Manager |
| Responsible party assignment | Project Manager |
| Watcher list | PM, Site Supervisor |
| Status | Via lifecycle action only (no direct edit) |
| Thread relationships | Read-only after issuance |
| Evidence | PM, Site Supervisor (upload); all roles (view) |

---

## 4. Inspection Log View

### 4.1 Layout

The inspection log is a tabular view of all `InspectionVisit` records for a permit, with inline expansion to show associated `InspectionDeficiency` records.

| Column | Source |
|---|---|
| Visit Date | `InspectionVisit.scheduledDate` or `completedDate` |
| Inspector | `InspectionVisit.inspectorName` |
| Linked Checkpoint | `RequiredInspectionCheckpoint.checkpointName` |
| Result | `InspectionVisit.result` (with color badge) |
| Follow-up Required | `InspectionVisit.followUpRequired` |
| Open Deficiencies | Count of `InspectionDeficiency` with non-resolved status |

### 4.2 Deficiency Sub-table (Expanded Row)

| Column | Source |
|---|---|
| Description | `InspectionDeficiency.description` |
| Severity | `InspectionDeficiency.severity` (with color badge) |
| Resolution Status | `InspectionDeficiency.resolutionStatus` |
| Assigned To | `InspectionDeficiency.assignedToPartyId` (resolved to name) |
| Due Date | `InspectionDeficiency.dueDate` |
| Code Reference | `InspectionDeficiency.codeReference` |

### 4.3 Inline Deficiency Actions

From the expanded deficiency row:
- **Acknowledge** — transition to `ACKNOWLEDGED` (responsible party action)
- **Start Remediation** — transition to `REMEDIATION_IN_PROGRESS`
- **Mark Resolved** — transition to `RESOLVED`; resolution notes required
- **Dispute** — transition to `DISPUTED`; notes required
- **Attach Evidence** — create `PermitEvidenceRecord` linked to deficiency's visit

---

## 5. Compliance Dashboard

### 5.1 Project-Level Summary Tiles

| Tile | Metric | Source |
|---|---|---|
| Active Permits | `activePermitCount` | Health spine aggregate |
| Critical Permits | `criticalPermitCount` | Health spine aggregate |
| Expiring ≤ 30 Days | `expiringWithin30DaysCount` | Health spine aggregate |
| Stop Work Orders | `stopWorkPermitCount` | Health spine aggregate |
| Open Deficiencies | Sum across all permits | Live query |
| Closed This Month | Count of `CLOSED` permits this calendar month | Live query |

### 5.2 Permit Health Breakdown Chart

A stacked bar or donut chart breaking down permits by `derivedHealthTier`:
- CRITICAL (red), AT_RISK (amber), NORMAL (green), CLOSED (gray)

### 5.3 Expiration Timeline View

A timeline visualization showing:
- X axis: next 12 months
- Each permit as a bar from today to `expirationDate`
- Color-coded by `expirationRiskTier`
- Click to navigate to Permit Detail View

### 5.4 Deficiency Aging View

A summary table showing:
- Open deficiencies grouped by age bucket (0–3 days, 4–7 days, 8–14 days, 14+ days)
- Broken down by severity (HIGH, MEDIUM, LOW)
- Click-through to the specific permit's inspection log

---

## 6. Executive Review (PER) Surface

### 6.1 PER Access Model

The PER surface renders the same Permit Detail View with the following differences:

- **Annotation panel** is shown and active for executives
- **Mutation controls** (edit buttons, lifecycle action buttons) are hidden
- **Read-only status** is clearly indicated in the header

### 6.2 Annotation UX

Executives may click any annotatable field to open an annotation sidebar:
- Annotation type selector: Note | Flag | Recommendation
- Free-text body
- Save → creates `@hbc/field-annotations` record with `IPermitAnnotationAnchor`

Annotations are displayed inline next to annotated fields with a color-coded indicator:
- Note: blue ℹ️
- Flag: amber 🚩
- Recommendation: green 💡

### 6.3 PER Export

Executives may export an annotated permit summary including:
- All `IssuedPermit` fields
- All `RequiredInspectionCheckpoint` status
- All open `InspectionDeficiency` records
- All annotations attached to this permit
- Export format: PDF or CSV

---

## 7. Reporting

### 7.1 Available Reports

| Report | Audience | Cadence |
|---|---|---|
| Permit Status Summary | PM, Leadership | On-demand + weekly |
| Expiring Permits (Next 30/60/90 Days) | PM | On-demand + weekly |
| Open Deficiency Report | PM, Site Supervisor | On-demand + daily |
| Closed Permits (Period) | PM, Leadership | On-demand + monthly |
| Stop-Work History | PM, Leadership, Legal | On-demand |
| Inspection Outcomes by Permit Type | PM, Leadership | On-demand + monthly |

### 7.2 Export Fields

All reports export in CSV. Core fields for the Permit Status Summary:

| Field | Source |
|---|---|
| Permit Number | `IssuedPermit.permitNumber` |
| Type | `IssuedPermit.permitType` |
| Jurisdiction | `IssuedPermit.jurisdictionName` |
| Current Status | `IssuedPermit.currentStatus` |
| Health Tier | `IssuedPermit.derivedHealthTier` |
| Expiration Date | `IssuedPermit.expirationDate` |
| Days to Expiration | Calculated |
| Expiration Risk | `IssuedPermit.expirationRiskTier` |
| Open Deficiency Count | Derived |
| Inspection Progress | `passedCheckpointCount / totalBlockingCheckpointCount` |
| Responsible Party | Resolved from `currentResponsiblePartyId` |

---

*[← T05](P3-E7-T05-Workflow-Publication-and-Downstream-Surfaces.md) | [Master Index](P3-E7-Permits-Module-Field-Specification.md) | [T07 →](P3-E7-T07-Data-Migration-Import-and-Future-Integration.md)*
