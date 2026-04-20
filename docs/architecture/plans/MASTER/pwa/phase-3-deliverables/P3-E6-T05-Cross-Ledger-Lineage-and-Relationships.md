# P3-E6 — Constraints Module: Cross-Ledger Lineage and Relationships

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E6-T05 |
| **Parent** | [P3-E6 Constraints Module Field Specification](P3-E6-Constraints-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T05: Cross-Ledger Lineage and Relationships |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: spawn/promotion rules, lineage metadata, immutable lineage records, link vs spawn distinction, related items integration, and cross-ledger reporting implications. See T01–T04 for individual ledger models, and [T06](P3-E6-T06-Publication-Review-and-Governance.md) for publication and governance.*

---

## 5. Cross-Ledger Lineage and Relationships

### 5.1 Governed lineage model

The Constraints module uses a governed **spawn/promotion** model for cross-ledger relationships. Key principles:

- **Spawn** creates a new record in a target ledger, seeded with context from the parent. The parent record continues to exist; its identity is not transformed.
- **Link** creates a non-hierarchical peer relationship between two records. Either may exist independently without the other.
- **No single-record type-change model.** A risk does not "become" a constraint; a constraint does not "become" a delay. Spawn creates a new record; the parent record continues in its own lifecycle.
- **Lineage is immutable.** `parentId` fields on spawned records are set at creation and never changed.
- **Seed data is inherited but editable.** Spawned records inherit context from the parent to reduce PM data entry. The inherited data may be edited; the inheritance lineage is permanent.

### 5.2 Supported spawn paths

| From | To | Spawn trigger | Seed data inherited |
|------|----|--------------|---------------------|
| `RiskRecord` | `ConstraintRecord` | Risk materializes or becomes an active blocker | `category`, `description` (as starting text for constraint title/description), `owner`, `bic`, `projectId` |
| `ConstraintRecord` | `DelayRecord` | Constraint has caused or is causing a schedule delay | `parentConstraintId`, `projectId`, `category → delayEventType` (mapped), `owner`, `description` (as starting text for delay event description), `identifiedBy` |
| `ConstraintRecord` | `ChangeEventRecord` | Constraint requires a change event to resolve | `parentConstraintId`, `projectId`, `origin` (mapped from `category`), `description` (as starting text for change event title/description), `identifiedBy` |

### 5.3 Supported link paths (peer relationships)

| From | To | Link description |
|------|----|----------------|
| `DelayRecord` | `ChangeEventRecord` | Delay event and change event are related (e.g., delay causes cost recovery change event) |
| `ChangeEventRecord` | `DelayRecord` | Change event results in or is accompanied by a delay |
| Any record | `@hbc/related-items` | Cross-module links to Schedule activities, Financial budget lines, Permit records, RFIs, submittals, documents, photos, meeting items |

Links are stored as bidirectional references on each record. The link is a peer relationship; neither record is the parent.

### 5.4 `LineageRecord` structure (immutable)

Every spawn action creates an immutable `LineageRecord` in addition to setting the `parentId` on the child record:

| Field Name | TypeScript Type | Business Rule |
|------------|-----------------|---------------|
| `lineageId` | `string` | UUID; primary key; immutable |
| `projectId` | `string` | FK; immutable |
| `spawnAction` | `enum` | `RiskToConstraint` / `ConstraintToDelay` / `ConstraintToChange`; immutable |
| `parentLedger` | `enum` | `Risk` / `Constraint` / `Delay` / `Change`; immutable |
| `parentRecordId` | `string` | FK to parent record's primary key; immutable |
| `parentRecordNumber` | `string` | Human-readable number of parent (e.g., `RISK-003`, `CON-007`); denormalized for display; immutable |
| `childLedger` | `enum` | Target ledger; immutable |
| `childRecordId` | `string` | FK to spawned record's primary key; immutable |
| `childRecordNumber` | `string` | Human-readable number of spawned record; immutable |
| `spawnedAt` | `timestamp` | Timestamp of spawn action; immutable |
| `spawnedBy` | `string` | User ID who triggered spawn; immutable |
| `inheritedFields` | `string[]` | List of field names that were seeded from parent; immutable snapshot |
| `inheritedValues` | `Record<string, unknown>` | Snapshot of inherited field values at time of spawn; immutable |

**Immutability rule:** `LineageRecord` fields are never modified after creation. Lineage records are preserved even if the child or parent record is voided/cancelled.

### 5.5 Spawn workflow (user-facing)

**Spawn: Risk → Constraint**
1. PM selects a Risk record and chooses "Spawn Constraint" action.
2. System presents a Constraint creation form pre-populated with seeded context.
3. PM reviews, edits, and confirms; saves the new Constraint record.
4. System:
   - Creates `ConstraintRecord` with `parentRiskId` = source risk's `riskId`.
   - Creates `LineageRecord` (immutable).
   - Updates `RiskRecord.spawnedConstraintIds` to include the new constraint ID.
   - Transitions `RiskRecord.status` to `MaterializationPending` automatically.
5. Both records visible in their respective ledger views; lineage displayed on each record's detail view.

**Spawn: Constraint → Delay**
1. PM selects a Constraint record and chooses "Spawn Delay" action.
2. System presents a Delay creation form pre-populated with seeded context.
3. PM reviews, edits, confirms. Schedule reference mode is set by PM (Integrated or ManualFallback).
4. System:
   - Creates `DelayRecord` with `parentConstraintId` = source constraint's `constraintId`.
   - Creates `LineageRecord` (immutable).
   - Updates `ConstraintRecord.spawnedDelayIds`.

**Spawn: Constraint → Change Event**
1. PM selects a Constraint record and chooses "Spawn Change Event" action.
2. System presents a Change Event creation form pre-populated with seeded context.
3. PM reviews, edits, confirms.
4. System:
   - Creates `ChangeEventRecord` with `parentConstraintId` = source constraint's `constraintId`.
   - Creates `LineageRecord` (immutable).
   - Updates `ConstraintRecord.spawnedChangeEventIds`.

**Link: Delay ↔ Change Event**
1. PM selects a Delay and chooses "Link Change Event" (or vice versa).
2. PM selects the target Change Event from a picker.
3. System:
   - Adds `changeEventId` to `DelayRecord.linkedChangeEventIds`.
   - Adds `delayId` to `ChangeEventRecord.linkedDelayIds`.
   - No `LineageRecord` is created for peer links (links are not spawn).

### 5.6 Lineage display requirements

Every ledger detail view must display:
- **"Created from"** banner: If record has a `parentId`, display the parent record's number, title, and ledger type with a clickable link to the parent record.
- **"Spawned records"** section: Display all child records spawned from this record, with number, title, status, and link to detail view.
- **"Linked records"** section: Display all peer-linked records (Delay ↔ Change Event) with number, title, status.

### 5.7 `@hbc/related-items` integration

All four ledger record types are registered as object types in `@hbc/related-items`. Cross-module relationships (to schedule activities, financial budget lines, permit records, RFIs, submittals, photos, etc.) are managed through `@hbc/related-items`, not through direct foreign key fields on ledger records.

Registered object types for Constraints module:

| Object type | Ledger | Notes |
|------------|--------|-------|
| `RiskRecord` | Risk Ledger | |
| `ConstraintRecord` | Constraint Ledger | |
| `DelayRecord` | Delay Ledger | |
| `ChangeEventRecord` | Change Ledger | |

Supported relationship types (from `@hbc/related-items` registry, applicable to all four types):

| Relationship type | Applies to |
|------------------|-----------|
| Schedule activity (from P3-E5) | Constraint, Delay, Change |
| Financial budget line (from P3-E4) | Constraint, Delay, Change |
| Permit record (from P3-E7) | Constraint, Delay |
| RFI | All four |
| Submittal | Constraint, Change |
| Drawing / document | All four |
| Photo / site evidence | All four |
| Meeting item / action item | All four |
| Safety incident (from P3-E8) | Constraint |

### 5.8 Lineage in reporting and downstream summaries

**Health spine:** Lineage counts (risks with spawned constraints, constraints with spawned delays, constraints with spawned change events) are published as health metrics to enable leadership visibility of materialization rate.

**Work Queue:** Cross-ledger linkage ensures Work Queue items reference the full lineage context. A delay work item should display the originating constraint and risk if applicable.

**Reports:** Cross-ledger summary reports (e.g., "Risk Register to Resolution Tracker") can traverse lineage using `LineageRecord` to show how risks moved through the module workflow.

### 5.9 Lineage business rules

**Rule L-01: Spawn preserves parent**
Spawn never closes, voids, or mutates the parent record. Parent continues in its own lifecycle.

**Rule L-02: Lineage metadata is immutable**
`LineageRecord` fields are never modified after creation. Voiding a child or parent record does not delete or modify lineage records.

**Rule L-03: Spawn does not inherit status**
Spawned child records start in their initial status (e.g., `Identified`), not the parent's status.

**Rule L-04: Multiple spawns are allowed**
A single Constraint may spawn multiple Delays (for multiple delay events). A single Constraint may spawn multiple Change Events. Each spawn creates a separate child record and separate `LineageRecord`.

**Rule L-05: Peer links are bidirectional**
When Delay ↔ Change Event is linked, both records must carry the reference. System maintains bidirectionality on all link operations.

---

*Navigation: [← T04 Change Ledger](P3-E6-T04-Change-Ledger.md) | [Master Index](P3-E6-Constraints-Module-Field-Specification.md) | [T06 Publication, Review, and Governance →](P3-E6-T06-Publication-Review-and-Governance.md)*
