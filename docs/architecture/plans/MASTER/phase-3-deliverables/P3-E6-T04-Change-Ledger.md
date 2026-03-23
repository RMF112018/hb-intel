# P3-E6 — Constraints Module: Change Ledger

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E6-T04 |
| **Parent** | [P3-E6 Constraints Module Field Specification](P3-E6-Constraints-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T04: Change Ledger |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: Change event model, line items, HB Intel canonical identity/status model, Procore integration readiness (identity mapping, sync, write-path), and manual-to-integrated record promotion. See [T02](P3-E6-T02-Constraint-Ledger.md) and [T03](P3-E6-T03-Delay-Ledger.md) for Constraint and Delay ledgers (which may spawn or link to change events), and [T05](P3-E6-T05-Cross-Ledger-Lineage-and-Relationships.md) for lineage rules.*

---

## 4. Change Ledger

### 4.1 Purpose and boundary

The Change Ledger captures **change events** — identified scope, design, or condition changes that may result in cost or schedule adjustments. It is designed for two operational modes:

**Manual-native mode (Phase 3 launch):** HB Intel identifies and manages critical change events as a project-controls tracking surface, independently of any external financial system. This is the Phase 3 implementation target.

**Procore-integrated mode (future phase):** HB Intel evolves into a full-function Change Event Manager connected to Procore. The Phase 3 data model is shaped now so the ledger can map cleanly to Procore's change event header + child item model at integration time without requiring record redesign or migration.

**Key design invariants:**
- HB Intel retains **canonical identity** (stable UUID, canonical number, canonical status) permanently.
- Procore IDs, Procore statuses, and sync metadata are **mapped into** the canonical model as additional fields — they never replace the canonical fields.
- When a manual HB Intel change event later corresponds to a Procore change event, the **same canonical HB Intel record** is promoted to integrated status. The manual record is not closed and replaced.
- In integrated mode, authoritative transactional writes for Procore-owned fields execute through Procore API paths and reconcile back through sync/webhooks. HB Intel remains canonical for internal review/reporting semantics.

The Change Ledger is **HB Intel native** in Phase 3 manual mode, with **dual authority** in Procore-integrated mode.

### 4.2 Change Event Record Field Table

#### Identity and core fields (canonical — immutable in part)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `changeEventId` | `string` | Yes | Yes | Yes | UUID; canonical HB Intel primary key; immutable always; survives mode promotion |
| `projectId` | `string` | Yes | No | Yes | FK to project; immutable |
| `changeEventNumber` | `string` | Yes | Yes | Yes | Canonical HB Intel number; format `CE-[###]` (e.g., `CE-001`); auto-incrementing per project; immutable; displayed to users as the primary reference |
| `title` | `string` | Yes | No | No | Short descriptive title; 10–150 characters |
| `description` | `string` | Yes | No | No | Narrative of the change event; 50–2000 characters |
| `origin` | `enum` | Yes | No | Yes | Governed origin type (§4.5); immutable after creation |
| `dateIdentified` | `date` | Yes | No | Yes | ISO 8601; date change event first identified; immutable |
| `identifiedBy` | `string` | Yes | No | Yes | Name or user ID; immutable |
| `parentConstraintId` | `string` | No | No | Yes | FK to `ConstraintRecord.constraintId` if spawned from a constraint; null if created directly; immutable after creation |

#### Status and lifecycle fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `status` | `enum` | Yes | No | No | **Canonical HB Intel status** (§4.4); PM-managed; system enforces valid transitions; never replaced by Procore status |
| `statusDate` | `date` | Yes | Yes | No | Date of most recent status transition |
| `approvedDate` | `date` | No | No | No | Date change event was approved; required when `status = Approved`; immutable after set |
| `approvedBy` | `string` | No | No | No | Name or user ID of approver |
| `closureReason` | `string` | No | No | No | Required for `Void`, `Cancelled`, `Superseded`; recommended for `Closed` |
| `dateClosed` | `date` | No | No | No | ISO 8601; set when status reaches terminal; immutable after set |

#### Financial impact fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `lineItems` | `ChangeLineItem[]` | No | No | No | Line-item cost breakdown (§4.3); optional in manual mode; required if `totalCostImpact` is line-item-derived |
| `totalCostImpact` | `number` | Yes | No | No | Net USD cost impact; positive = increase; negative = credit; set directly if no line items; or calculated from line items if line items present |
| `totalCostCalculated` | `boolean` | No | No | No | `true` if `totalCostImpact` is calculated from `lineItems`; `false` if entered directly |
| `costConfidence` | `enum` | No | No | No | `Rough` / `Ordered` / `Definitive`; governed confidence in cost estimate |
| `scheduleImpactDays` | `integer` | No | No | No | Schedule impact in calendar days; positive = delay; negative = acceleration; null if none |
| `scheduleImpactDescription` | `string` | No | No | No | Narrative description of schedule impact; recommended if `scheduleImpactDays != null` |
| `linkedDelayIds` | `string[]` | No | No | No | FKs to `DelayRecord.delayId`; change events may be linked to delays (peer link, not spawn) |

#### Integration fields (Procore mapping — null in manual mode)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `integrationMode` | `enum` | Yes | No | No | `ManualNative` or `IntegratedWithProcore`; governs which fields are active for write operations |
| `procoreMapping` | `ProcoreMappingRecord \| null` | No | No | No | Null in `ManualNative` mode; populated when mode = `IntegratedWithProcore` (§4.6) |

#### Audit and append-only fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `attachments` | `AttachmentRef[]` | No | No | No | Supporting documents, approvals, RFIs, correspondence |
| `comments` | `CommentEntry[]` | No | No | No | Append-only comment log; `{ commentId, text, authorName, authorId, timestamp }` |
| `createdAt` | `timestamp` | Yes | Yes | Yes | Immutable |
| `createdBy` | `string` | Yes | Yes | Yes | Immutable |
| `lastEditedAt` | `timestamp` | No | Yes | No | — |
| `lastEditedBy` | `string` | No | Yes | No | — |

### 4.3 Change Line Item (`ChangeLineItem`) Structure

Line items allow the change event to be decomposed into cost components. This model maps cleanly to Procore's change event line item / PCO line item pattern.

| Field Name (camelCase) | TypeScript Type | Required | Business Rule |
|------------------------|-----------------|----------|---------------|
| `lineItemId` | `string` | Yes | UUID; stable per line item; survives mode promotion |
| `description` | `string` | Yes | Line item description; 10–500 characters |
| `type` | `enum` | Yes | `Labor` / `Material` / `Equipment` / `Subcontract` / `Other`; governed |
| `quantity` | `number` | No | Quantity for unit-based pricing |
| `unit` | `string` | No | Unit of measure (e.g., "LF", "CY", "EA", "LS") |
| `unitCost` | `number` | No | Unit cost in USD |
| `totalCost` | `number` | Yes | Total cost for this line item in USD; may be entered directly or calculated from `quantity × unitCost` |
| `costCode` | `string` | No | WBS or cost code for financial tracking |
| `procoreLineItemId` | `string` | No | Procore line item ID; populated after integration sync; null in manual mode |
| `notes` | `string` | No | Optional line-level notes |

### 4.4 Canonical Change Event Status Enumeration

The canonical HB Intel status model persists regardless of integration mode. In integrated mode, Procore statuses are mapped to this model and stored separately in `procoreMapping.procoreStatus`.

| Status | Meaning | Valid next states |
|--------|---------|-----------------|
| `Identified` | Change event recorded; initial assessment | `UnderAnalysis`, `PendingApproval`, `Void` |
| `UnderAnalysis` | Change event being quantified and documented | `PendingApproval`, `Void`, `Cancelled` |
| `PendingApproval` | Change event submitted for approval | `Approved`, `Rejected`, `UnderAnalysis` |
| `Approved` | Change event approved; `approvedDate` set | `Closed`, `Void` |
| `Rejected` | Change event rejected with reason | `UnderAnalysis`, `Void` |
| `Closed` | Change event closed out; cost absorbed or work executed | Terminal |
| `Void` | Created in error; duplicate; requires reason | Terminal |
| `Cancelled` | Deliberate withdrawal; requires reason | Terminal |
| `Superseded` | Replaced by a successor change event; requires reference | Terminal |

**Transition rules:**
- `Rejected` → `UnderAnalysis` is allowed for resubmission after rework.
- All terminal transitions require `closureReason`, actor, and timestamp.
- No hard deletes.

### 4.5 Change Event Origin Enumeration (Governed)

| Code | Label |
|------|-------|
| `SITE_CONDITION` | Unforeseen or differing site condition |
| `DESIGN_CHANGE` | Design change, clarification, or coordination |
| `OWNER_DIRECTIVE` | Owner-directed change or instruction |
| `REGULATORY` | Regulatory or code-compliance requirement |
| `SCOPE_CLARIFICATION` | Scope gap or clarification from contract documents |
| `VALUE_ENGINEERING` | Owner-accepted value engineering proposal |
| `SCHEDULE_RECOVERY` | Change required for schedule recovery |
| `FORCE_MAJEURE` | Force majeure event consequence |
| `SUBCONTRACTOR_REQUEST` | Subcontractor-initiated change request |
| `OTHER` | Unclassified origin |

### 4.6 Procore Mapping Record (`ProcoreMappingRecord`)

This record captures the full Procore integration state for a change event in `IntegratedWithProcore` mode. It is null in `ManualNative` mode.

| Field Name (camelCase) | TypeScript Type | Business Rule |
|------------------------|-----------------|---------------|
| `procoreChangeEventId` | `string` | Procore's internal change event ID; stable |
| `procoreChangeEventNumber` | `string` | Procore's displayed change event number (may differ from HB Intel canonical number) |
| `procoreStatus` | `string` | Procore-native status string (e.g., "Open", "Pending", "Approved"); stored raw, mapped to canonical HB Intel status separately |
| `procoreStatusMappedTo` | `enum` | The HB Intel canonical status this Procore status maps to; maintained by sync/mapping rules |
| `procoreProjectId` | `string` | Procore project ID for API routing |
| `syncState` | `enum` | `NotSynced` / `SyncPending` / `Synced` / `ConflictRequiresReview` |
| `lastSyncedAt` | `timestamp` | Timestamp of last successful sync |
| `procoreWritePathEnabled` | `boolean` | If `true`, authoritative transactional writes to Procore-owned fields execute via Procore API |
| `syncConflictDetails` | `string` | Narrative of conflict if `syncState = ConflictRequiresReview`; null otherwise |
| `procoreLineItemSyncState` | `enum` | Sync state for line items specifically |
| `promotedFromManualAt` | `timestamp` | Timestamp when this record was promoted from `ManualNative` to `IntegratedWithProcore` |
| `promotedBy` | `string` | User who executed the manual-to-integrated promotion |

### 4.7 Manual-to-Integrated Promotion

When a manual HB Intel Change Event is matched to a Procore Change Event after Procore integration is established:

1. The **canonical HB Intel record survives** — `changeEventId`, `changeEventNumber`, `dateIdentified`, `origin`, creation lineage, and all audit history are preserved.
2. `integrationMode` transitions from `ManualNative` → `IntegratedWithProcore`.
3. `procoreMapping` is populated with the Procore external identifiers, current Procore status, and sync state.
4. `promotedFromManualAt` and `promotedBy` are recorded.
5. After promotion, Procore-owned transactional fields are governed by the Procore write path. HB Intel fields for internal review, reporting, lineage, and governance semantics remain HB Intel-native.
6. HB Intel status (`status`) continues to be the canonical status for internal review, health spine, and reports. Procore status is mapped into `procoreMapping.procoreStatus` and `procoreStatusMappedTo`.

**Implementation note:** The status mapping table between Procore statuses and HB Intel canonical statuses is governed configuration managed by the Manager of Operational Excellence. The initial mapping is defined during integration implementation.

### 4.8 Procore Change Event Header + Child Item Model

The Phase 3 data model is shaped to accommodate the Procore change event model:

**Procore shape reference:**
- Change event header (`ChangeEventRecord`) corresponds to the Procore Change Event or Prime Change Event header.
- Line items (`ChangeLineItem[]`) correspond to Procore Change Event line items or Prime Potential Change Order (PCO) line items.
- `procoreMapping.procoreChangeEventId` links the HB Intel header to the Procore change event header.
- `lineItem.procoreLineItemId` links each HB Intel line item to the corresponding Procore line item.

**Future integration seam (Phase 3 does not implement):**
- Creating change events in HB Intel with write-through to Procore.
- Webhook/sync reconciliation for status updates from Procore back to HB Intel.
- Line item cost-code mapping to Procore budget codes.

These seams are defined by the field model above and the `ProcoreMappingRecord` structure. Future integration implementation follows the record shape; no schema redesign should be required.

### 4.9 Change Ledger Business Rules

**Rule CE-01: Canonical identity is permanent**
`changeEventId`, `changeEventNumber`, and HB Intel canonical `status` model are permanent. Mode promotion does not replace them.

**Rule CE-02: No hard delete**
Use `Void` for error records; terminal transitions require closure reason.

**Rule CE-03: Approval requires cost finalization**
`approvedDate` and `approvedBy` are required at `Approved` transition. `totalCostImpact` must be set before approval.

**Rule CE-04: Line items are optional but preferred**
Line items are strongly recommended for any change event with `totalCostImpact != 0`. They enable Procore mapping at integration time and provide cost audit trail.

**Rule CE-05: Procore write path governance**
`procoreWritePathEnabled` may only be set by integration configuration, not by end users. When true, UI must clearly indicate that writes to Procore-owned fields are transactional through Procore.

**Rule CE-06: Manual-to-integrated promotion is one-way**
`integrationMode` may be promoted from `ManualNative` to `IntegratedWithProcore`. It may not be reversed without admin action and explicit data reconciliation.

**Rule CE-07: Governed taxonomies**
The origin enumeration, status mapping tables, and line item type taxonomy are governed configuration managed by the Manager of Operational Excellence.

### 4.10 Change Ledger Metrics (Published to Health Spine)

| Metric | Type | Calculation |
|--------|------|-------------|
| `openChangeEventCount` | integer | Count where `status NOT IN (Closed, Void, Cancelled, Superseded)` |
| `pendingApprovalCount` | integer | Count where `status = PendingApproval` |
| `totalPendingCostImpact` | number (USD) | Sum of `totalCostImpact` for `PendingApproval` events |
| `totalApprovedCostImpact` | number (USD) | Sum of `totalCostImpact` for `Approved` and `Closed` events |
| `changeEventCountByOrigin` | map | Count by `origin`, open events |

---

*Navigation: [← T03 Delay Ledger](P3-E6-T03-Delay-Ledger.md) | [Master Index](P3-E6-Constraints-Module-Field-Specification.md) | [T05 Cross-Ledger Lineage →](P3-E6-T05-Cross-Ledger-Lineage-and-Relationships.md)*
