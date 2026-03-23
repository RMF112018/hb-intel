# P3-E6 — Constraints Module: Constraint Ledger

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E6-T02 |
| **Parent** | [P3-E6 Constraints Module Field Specification](P3-E6-Constraints-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T02: Constraint Ledger |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: Constraint record model, fields, lifecycle, categorization, and governance. See [T01](P3-E6-T01-Risk-Ledger.md) for the Risk ledger, [T03](P3-E6-T03-Delay-Ledger.md) for the Delay ledger, [T04](P3-E6-T04-Change-Ledger.md) for the Change ledger, and [T05](P3-E6-T05-Cross-Ledger-Lineage-and-Relationships.md) for cross-ledger lineage including Constraint → Delay and Constraint → Change spawn.*

---

## 2. Constraint Ledger

### 2.1 Purpose and boundary

The Constraint Ledger captures **active project blockers and issues** requiring management action. A constraint is a present-state impediment — something that is currently affecting or about to affect project execution, and that requires deliberate action to resolve.

The Constraint Ledger is **not** the parent record type for all other module activity:
- Risks are tracked separately in the Risk Ledger (T01) until they materialize.
- Delays arising from constraints are tracked in the Delay Ledger (T03) as separately spawned records.
- Change events arising from constraints are tracked in the Change Ledger (T04) as separately spawned records.
- The Constraint Ledger is a **peer** of the other three ledgers, not their parent.

The Constraint Ledger is **HB Intel native**. No external system is authoritative for constraint records.

### 2.2 Constraint Record Field Table

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `constraintId` | `string` | Yes | Yes | Yes | UUID; primary key; immutable after creation |
| `projectId` | `string` | Yes | No | Yes | FK to project; immutable after creation |
| `constraintNumber` | `string` | Yes | Yes | Yes | System-generated; format `CON-[###]` (e.g., `CON-001`); auto-incrementing per project; immutable |
| `title` | `string` | Yes | No | No | Short descriptive title; 10–120 characters |
| `description` | `string` | Yes | No | No | Full constraint narrative; 50–1000 characters; describes the active blocker clearly |
| `category` | `enum` | Yes | No | Yes | Governed category (§2.4); immutable after creation; governs reporting and BIC routing |
| `priority` | `enum` | Yes | No | No | Governed priority (§2.5); PM-set; may be updated as situation evolves |
| `dateIdentified` | `date` | Yes | No | Yes | ISO 8601; day constraint first identified; immutable after creation |
| `identifiedBy` | `string` | Yes | No | Yes | Name or user ID; immutable |
| `owner` | `string` | Yes | No | No | Person accountable for constraint resolution; may be reassigned; every constraint must have an owner at all times |
| `bic` | `enum` | Yes | No | No | Governed BIC team (§2.6); may be reassigned; creates audit event |
| `dueDate` | `date` | Yes | No | No | Target resolution date; must be ≥ `dateIdentified`; PM-editable; extension creates audit entry |
| `daysOpen` | `integer` | Yes | Yes | No | **Calculated**: `today − dateIdentified` in calendar days; recalculated on load; used for escalation |
| `status` | `enum` | Yes | No | No | Constraint lifecycle status (§2.3); PM-managed; system enforces valid transitions |
| `statusDate` | `date` | Yes | Yes | No | Date of most recent status transition |
| `closureDocumentUri` | `string` | No | No | No | URI to supporting closure documentation (PDF, memo, email); required recommendation before closure |
| `closureNotes` | `string` | No | No | No | PM narrative on how constraint was resolved; required recommendation before closure |
| `dateClosed` | `date` | No | No | No | ISO 8601; set when constraint reaches `Resolved`; immutable after set |
| `closureReason` | `string` | No | No | No | Required for `Void`, `Cancelled`, `Superseded`; optional but recommended for `Resolved` |
| `parentRiskId` | `string` | No | No | Yes | If spawned from a Risk record, contains the parent `riskId`; null if created directly; immutable after creation |
| `spawnedDelayIds` | `string[]` | No | Yes | No | **Calculated**: array of `DelayRecord.delayId` values spawned from this constraint; read-only |
| `spawnedChangeEventIds` | `string[]` | No | Yes | No | **Calculated**: array of `ChangeEventRecord.changeEventId` values spawned from this constraint; read-only |
| `reference` | `string` | No | No | No | Optional human-readable external reference (e.g., drawing number, RFI number, permit reference) |
| `comments` | `CommentEntry[]` | No | No | No | Append-only comment log; `{ commentId, text, authorName, authorId, timestamp }`; no editing or deletion of existing entries |
| `attachments` | `AttachmentRef[]` | No | No | No | Supporting documents, evidence, or communications |
| `createdAt` | `timestamp` | Yes | Yes | Yes | System-generated; immutable |
| `createdBy` | `string` | Yes | Yes | Yes | User ID; immutable |
| `lastEditedAt` | `timestamp` | No | Yes | No | Updated on every save |
| `lastEditedBy` | `string` | No | Yes | No | User ID of last editor |

### 2.3 Constraint Lifecycle (Status Enumeration)

| Status | Meaning | Valid next states |
|--------|---------|------------------|
| `Identified` | Constraint recorded; initial state | `UnderAction`, `Pending`, `Void` |
| `UnderAction` | Constraint being actively worked; mitigation in progress | `Pending`, `Resolved`, `Void` |
| `Pending` | Resolution awaiting external event (owner decision, permit, delivery, etc.) | `UnderAction`, `Resolved`, `Void` |
| `Resolved` | Constraint fully resolved; `dateClosed` set; closure documentation strongly recommended | Terminal |
| `Void` | Created in error or duplicate; no substantive use; requires reason | Terminal |
| `Cancelled` | Deliberate withdrawal; requires reason | Terminal |
| `Superseded` | Replaced by a newer constraint record; requires reference to successor | Terminal |

**Transition rules:**
- All terminal transitions require `closureReason`, actor, and timestamp.
- `Resolved` requires `dateClosed` to be set at transition time.
- `Resolved` without `closureDocumentUri` generates a system warning (not a hard block); system logs that documentation is missing.
- `Superseded` requires `successorConstraintId` reference.
- No backward transitions after `Resolved`, `Void`, `Cancelled`, or `Superseded`.
- `Pending` may return to `UnderAction` if the external event resolves and work resumes.

### 2.4 Category Enumeration (Governed)

The following categories are the initial governed set. The Manager of Operational Excellence may add, rename, or retire categories via governed configuration. Category is **immutable after creation**.

| Category Code | Label |
|---------------|-------|
| `DESIGN` | Design and engineering |
| `PERMITS` | Permits and regulatory approvals |
| `PROCUREMENT` | Materials and equipment procurement |
| `LABOR` | Labor and workforce availability |
| `WEATHER` | Weather and environmental |
| `SAFETY` | Safety and health |
| `QUALITY` | Quality and defect management |
| `SCHEDULE` | Schedule and sequencing |
| `COST` | Budget and cost |
| `ENVIRONMENTAL` | Environmental compliance and remediation |
| `EQUIPMENT` | Equipment availability and performance |
| `COMMUNICATION` | Communication and coordination |
| `SITE_ACCESS` | Site access and logistics |
| `UTILITIES` | Utility conflicts and relocations |
| `GEOTECHNICAL` | Geotechnical and soil conditions |
| `LEGAL` | Legal and contractual |
| `TECHNOLOGY` | Technology and systems |
| `SECURITY` | Security and access |
| `SUBCONTRACTOR` | Subcontractor performance |
| `INSPECTIONS` | Inspection and testing |
| `LOGISTICS` | Material delivery and logistics |
| `STAKEHOLDER` | Stakeholder coordination and approvals |
| `OWNER_REQUIREMENTS` | Owner-specified requirements |
| `CHANGE_MANAGEMENT` | Change control and scope |
| `PUBLIC_WORKS` | Public works and infrastructure |
| `OTHER` | Unclassified constraint |

### 2.5 Priority Enumeration (Governed)

The priority levels, labels, and associated escalation thresholds are governed configuration.

| Level | Label | Governed default meaning |
|-------|-------|--------------------------|
| 1 | Critical | Blocking critical path or major project deliverable now |
| 2 | High | Significant schedule or cost risk; action required this week |
| 3 | Medium | Active impediment; action required within the month |
| 4 | Low | Minor impediment; tracked for awareness |

### 2.6 BIC Team Registry (Governed)

BIC team assignment indicates which team holds accountability for constraint resolution. The registry is governed configuration managed by the Manager of Operational Excellence. The initial set covers the major project team functions (Design Team, Field Team, Procurement Team, Safety Team, Permits Team, Scheduling Team, etc.). The full working BIC registry is maintained in the governance configuration layer (T06 §6.4) and referenced here by reference.

### 2.7 Constraint Ledger Business Rules

**Rule C-01: Immutability of creation identity**
`constraintId`, `constraintNumber`, `category`, `dateIdentified`, `identifiedBy`, `projectId` are immutable after first save.

**Rule C-02: Owner accountability**
Every constraint must have an `owner` at all times. Reassignment creates an audit entry. System blocks closure if `owner` is empty.

**Rule C-03: No hard delete**
Use `Void` for error records; all terminal transitions require closure reason and create an audit entry.

**Rule C-04: Comments are append-only**
Comment entries may not be edited or deleted after save. Each entry captures author and timestamp.

**Rule C-05: Overdue detection**
If `status NOT IN (Resolved, Void, Cancelled, Superseded)` AND `dueDate < today`, the constraint is overdue. Overdue threshold for escalation (e.g., overdue > 14 days → escalation) is governed configuration.

**Rule C-06: Closure documentation**
System recommends `closureDocumentUri` before `Resolved` transition and logs a warning if absent. PM may override. Governance configuration may promote this to a hard requirement.

**Rule C-07: Spawned record tracking**
`spawnedDelayIds` and `spawnedChangeEventIds` are read-only system-maintained references. PMs do not populate these directly; they are managed by the lineage model (T05).

**Rule C-08: Governed thresholds**
Age buckets, overdue escalation timers, priority color-coding thresholds, and work queue trigger conditions are governed configuration, not hard-coded.

### 2.8 Constraint Ledger Metrics (Published to Health Spine)

| Metric | Type | Calculation |
|--------|------|-------------|
| `openConstraintCount` | integer | Count where `status IN (Identified, UnderAction, Pending)` |
| `overdueConstraintCount` | integer | Count of open constraints where `dueDate < today` |
| `criticalConstraintCount` | integer | Count of open constraints where `priority = Critical` |
| `constraintCountByCategory` | map | Count by `category`, open constraints only |
| `avgDaysOpen` | decimal | Mean `daysOpen` across open constraints |
| `maxDaysOpen` | integer | Maximum `daysOpen` across open constraints |

All metric thresholds and escalation triggers are governed configuration.

---

*Navigation: [← T01 Risk Ledger](P3-E6-T01-Risk-Ledger.md) | [Master Index](P3-E6-Constraints-Module-Field-Specification.md) | [T03 Delay Ledger →](P3-E6-T03-Delay-Ledger.md)*
