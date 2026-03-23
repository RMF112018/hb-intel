# P3-E6 — Constraints Module: Risk Ledger

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E6-T01 |
| **Parent** | [P3-E6 Constraints Module Field Specification](P3-E6-Constraints-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T01: Risk Ledger |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: Risk record model, fields, lifecycle, categorization, and governance. See [T02](P3-E6-T02-Constraint-Ledger.md) for the Constraint ledger, [T03](P3-E6-T03-Delay-Ledger.md) for the Delay ledger, [T04](P3-E6-T04-Change-Ledger.md) for the Change ledger, and [T05](P3-E6-T05-Cross-Ledger-Lineage-and-Relationships.md) for cross-ledger lineage including Risk → Constraint spawn.*

---

## 1. Risk Ledger

### 1.1 Purpose and boundary

The Risk Ledger captures **forward-looking, potential threats** to project outcomes that have not yet materialized as active blockers. Risks are distinct from constraints, delays, and change events:

- A **risk** is a future possibility with assessed probability and impact, requiring mitigation planning.
- When a risk materializes or becomes an active blocker, a **Constraint** is spawned from it (see T05).
- Risks are **never** collapsed into the Constraint ledger, even if they are high-probability.

The Risk Ledger is **HB Intel native**. No external system is authoritative for risk records. HB Intel originates and owns all risk records.

### 1.2 Risk Record Field Table

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `riskId` | `string` | Yes | Yes | Yes | UUID; primary key; immutable after creation |
| `projectId` | `string` | Yes | No | Yes | FK to project; immutable after creation |
| `riskNumber` | `string` | Yes | Yes | Yes | System-generated; format `RISK-[###]` (e.g., `RISK-001`); auto-incrementing per project; immutable after creation |
| `title` | `string` | Yes | No | No | Short descriptive title; 10–120 characters |
| `description` | `string` | Yes | No | No | Full risk narrative; 50–1000 characters; contemporaneous statement of the potential threat |
| `category` | `enum` | Yes | No | Yes | Governed risk category (§1.4); immutable after creation; governs reporting roll-up |
| `probability` | `enum` | Yes | No | No | Governed scale (§1.5); PM/Risk Owner sets; drives riskScore |
| `impact` | `enum` | Yes | No | No | Governed scale (§1.5); PM/Risk Owner sets; drives riskScore |
| `riskScore` | `integer` | Yes | Yes | No | **Calculated**: `probability × impact` (ordinal multiplication); recalculated on save; used for priority ordering |
| `dateIdentified` | `date` | Yes | No | Yes | ISO 8601; date risk was first recorded; immutable after creation |
| `identifiedBy` | `string` | Yes | No | Yes | Name or user ID of person who identified the risk; immutable |
| `owner` | `string` | Yes | No | No | Person responsible for monitoring and mitigating this risk; may be reassigned |
| `bic` | `enum` | Yes | No | No | Governed BIC team owning the risk area (§1.6); may be reassigned; creates audit event on change |
| `targetMitigationDate` | `date` | Yes | No | No | Target date to implement mitigation or reach accepted/closed state; must be ≥ `dateIdentified` |
| `mitigationStrategy` | `string` | No | No | No | Planned mitigation actions; 0–2000 characters; narrative |
| `contingencyStrategy` | `string` | No | No | No | Contingency plan if risk materializes; 0–2000 characters; narrative |
| `residualRiskNotes` | `string` | No | No | No | Notes on residual risk after mitigation; narrative |
| `status` | `enum` | Yes | No | No | Risk lifecycle status (§1.3); PM-editable; system enforces valid transitions |
| `statusDate` | `date` | Yes | Yes | No | **Calculated**: date of most recent status transition; updated on every status change |
| `closureReason` | `string` | No | No | No | Required when status = `Closed`, `Void`, or `Cancelled`; reason for terminal transition |
| `dateClosed` | `date` | No | No | No | ISO 8601; populated only when status reaches a terminal state; immutable after set |
| `spawnedConstraintIds` | `string[]` | No | Yes | No | **Calculated**: array of `ConstraintRecord.constraintId` values spawned from this risk; read-only; maintained by lineage model |
| `attachments` | `AttachmentRef[]` | No | No | No | Supporting documents, assessments, or evidence; `{ attachmentId, uri, description, attachedAt, attachedBy }` |
| `createdAt` | `timestamp` | Yes | Yes | Yes | System-generated; immutable |
| `createdBy` | `string` | Yes | Yes | Yes | User ID; immutable |
| `lastEditedAt` | `timestamp` | No | Yes | No | Updated on every save |
| `lastEditedBy` | `string` | No | Yes | No | User ID of last editor |

### 1.3 Risk Lifecycle (Status Enumeration)

| Status | Meaning | Valid next states |
|--------|---------|------------------|
| `Identified` | Risk recorded; initial assessment state | `UnderAssessment`, `Accepted`, `Void` |
| `UnderAssessment` | Probability/impact being refined; mitigation being planned | `Mitigated`, `Accepted`, `MaterializationPending`, `Void` |
| `Mitigated` | Mitigation actions completed; residual risk acceptable | `Accepted`, `Closed`, `MaterializationPending` |
| `Accepted` | Risk accepted as within tolerance; no further mitigation planned | `Closed`, `MaterializationPending` |
| `MaterializationPending` | Risk is materializing; constraint spawn is underway or imminent | `Closed` (after constraint handles the issue) |
| `Closed` | Risk resolved, expired, or constraint fully handled the issue | Terminal |
| `Void` | Created in error; duplicate; abandoned before substantive use | Terminal |
| `Cancelled` | Deliberate withdrawal with reason | Terminal |

**Transition rules:**
- All terminal state transitions require `closureReason`, actor, and timestamp.
- `MaterializationPending` does NOT automatically close the risk; the risk remains open until PM explicitly closes it after the spawned constraint resolves the issue.
- No hard deletes. Abandoned records without substantial input use `Void`.

### 1.4 Risk Category Enumeration (Governed)

The following categories are the initial governed set. The Manager of Operational Excellence may add, rename, or retire categories via governed configuration. Category is **immutable after creation** to preserve reporting integrity.

| Category Code | Label |
|---------------|-------|
| `SITE_CONDITIONS` | Site conditions and geotechnical |
| `DESIGN` | Design completeness and coordination |
| `PERMITS_REGULATORY` | Permits, approvals, and regulatory |
| `PROCUREMENT` | Materials, equipment, and supply chain |
| `LABOR` | Labor availability and workforce |
| `SUBCONTRACTOR` | Subcontractor performance and capacity |
| `WEATHER_ENVIRONMENTAL` | Weather and environmental |
| `FINANCIAL` | Budget, cost, and commercial exposure |
| `SCHEDULE` | Schedule and sequencing risk |
| `SCOPE` | Scope creep, scope gaps, and changes |
| `STAKEHOLDER` | Owner, stakeholder, and third-party |
| `SAFETY_HEALTH` | Safety and health |
| `LEGAL_CONTRACTUAL` | Legal, contractual, and claims risk |
| `TECHNOLOGY` | Technology and systems |
| `FORCE_MAJEURE` | Force majeure and uncontrollable events |
| `OTHER` | Unclassified risk |

### 1.5 Probability and Impact Scales (Governed)

Both scales use ordinal integers that multiply to produce `riskScore`. The specific labels, breakpoints, and scoring weights are governed configuration managed by the Manager of Operational Excellence.

**Default governed scale (may be reconfigured):**

| Level | Label | Probability meaning | Impact meaning |
|-------|-------|--------------------|-|
| 1 | Low | < 20% likelihood | Minimal project impact |
| 2 | Medium-Low | 20–40% likelihood | Minor delays or cost |
| 3 | Medium | 40–60% likelihood | Moderate schedule or cost impact |
| 4 | Medium-High | 60–80% likelihood | Significant schedule or cost impact |
| 5 | High | > 80% likelihood | Critical path or major cost exposure |

`riskScore` = `probability × impact` (range 1–25). Score thresholds for color-coding and escalation are governed configuration.

### 1.6 BIC Team Registry (Governed)

The BIC (Ball-In-Court) team assignment indicates which team is responsible for monitoring and mitigating the risk. The BIC team registry is governed configuration managed by the Manager of Operational Excellence. The initial set matches the registry used across all Constraints module ledgers (see T06 §6.4 for the master BIC registry).

### 1.7 Risk Ledger Business Rules

**Rule R-01: Immutability of creation identity**
`riskId`, `riskNumber`, `category`, `dateIdentified`, `identifiedBy`, `projectId` are immutable after first save.

**Rule R-02: No hard delete**
No risk record may be hard-deleted after creation. Use `Void` for error records. All terminal transitions require closure reason and create an audit entry.

**Rule R-03: Owner accountability**
Every risk must have an `owner` at all times. Reassignment creates an audit event.

**Rule R-04: Score recalculation**
`riskScore` is recalculated on every save that changes `probability` or `impact`. Historical score snapshots are maintained by `@hbc/versioned-record`.

**Rule R-05: Spawn accountability**
When a risk spawns a constraint (via T05 lineage model), the risk `status` transitions to `MaterializationPending` automatically. The risk PM may acknowledge and move forward with separate close action.

**Rule R-06: Governed thresholds**
Escalation timers, overdue thresholds, and `riskScore` color-coding breakpoints are governed configuration, not hard-coded.

### 1.8 Risk Ledger Metrics (Published to Health Spine)

| Metric | Type | Calculation |
|--------|------|-------------|
| `openRiskCount` | integer | Count where `status NOT IN (Closed, Void, Cancelled)` |
| `highRiskCount` | integer | Count where `riskScore >= governed threshold` and status open |
| `overdueRiskCount` | integer | Count where `targetMitigationDate < today` and status open |
| `riskCountByCategory` | map | Count by `category`, open risks only |
| `materializationRateThisPeriod` | integer | Count of risks that moved to `MaterializationPending` in the governed review window |

All metric thresholds are governed configuration.

---

*Navigation: [Master Index](P3-E6-Constraints-Module-Field-Specification.md) | [T02 Constraint Ledger →](P3-E6-T02-Constraint-Ledger.md)*
