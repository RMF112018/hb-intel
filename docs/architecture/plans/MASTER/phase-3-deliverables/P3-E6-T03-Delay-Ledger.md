# P3-E6 — Constraints Module: Delay Ledger

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E6-T03 |
| **Parent** | [P3-E6 Constraints Module Field Specification](P3-E6-Constraints-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T03: Delay Ledger |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: Delay record model, schedule reference model, time impact vs cost/commercial impact separation, evidence-oriented state gates, and future-ready TIA/fragnet/claims support. See [T02](P3-E6-T02-Constraint-Ledger.md) for the Constraint ledger (which may spawn delays), [T04](P3-E6-T04-Change-Ledger.md) for the Change ledger (which delays may link to), and [T05](P3-E6-T05-Cross-Ledger-Lineage-and-Relationships.md) for cross-ledger lineage rules.*

---

## 3. Delay Ledger

### 3.1 Purpose and boundary

The Delay Ledger captures **contemporaneous delay event records** structured for claims-readiness and formal delay analysis. The ledger is designed to be **B+/C-ready** — it must support the contemporaneous evidence requirements needed to substantiate a schedule delay claim without requiring full TIA/fragnet capabilities at Phase 3 launch.

Key design principles:
- **Contemporaneous by default.** Records capture delay events as they occur, not retrospectively.
- **Strong evidence orientation.** Each delay record maintains explicit references to the control schedule baseline, impacted activities/paths, and date of formal owner notification.
- **Strict separation of time impact from cost/commercial impact.** A single delay event may have both, but they are tracked in separate field groups with separate quantification confidence levels.
- **Evidence gates at higher-confidence states.** `Quantified` and `Dispositioned` states have explicit preconditions beyond narrative.
- **Future-ready.** Fields exist for TIA, fragnet support, and claims-grade packaging without requiring full implementation at Phase 3 launch.
- **Governed schedule reference model.** When the integrated P3-E5 Schedule module is available, delays reference schedule versions formally. Manual fallback allowed where integration is not yet established.

The Delay Ledger is **HB Intel native**. HB Intel originates and owns all delay records. Schedule version references from integrated schedule sources are consumed read-only; the Delay Ledger does not mutate schedule records.

### 3.2 Delay Record Field Table

#### Identity and core fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `delayId` | `string` | Yes | Yes | Yes | UUID; primary key; immutable |
| `projectId` | `string` | Yes | No | Yes | FK to project; immutable |
| `delayNumber` | `string` | Yes | Yes | Yes | System-generated; format `DEL-[###]` (e.g., `DEL-001`); auto-incrementing per project; immutable |
| `title` | `string` | Yes | No | No | Short descriptive title; 10–150 characters |
| `eventDescription` | `string` | Yes | No | No | Contemporaneous narrative of the delay event; 100–3000 characters; must describe the event factually and specifically |
| `delayEventType` | `enum` | Yes | No | Yes | Governed delay event type (§3.5); immutable after creation |
| `responsibleParty` | `enum` | Yes | No | No | Governed responsible party attribution (§3.6); PM-set; may be updated during analysis |
| `dateIdentified` | `date` | Yes | No | Yes | ISO 8601; date delay was first formally recognized; immutable |
| `identifiedBy` | `string` | Yes | No | Yes | Name or user ID; immutable |
| `parentConstraintId` | `string` | No | No | Yes | If spawned from a constraint, FK to `ConstraintRecord.constraintId`; null if created directly; immutable |
| `status` | `enum` | Yes | No | No | Delay lifecycle status (§3.4); PM-managed; evidence gate rules enforced at key transitions |
| `statusDate` | `date` | Yes | Yes | No | Date of most recent status transition |

#### Event timing fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `delayStartDate` | `date` | Yes | No | Yes | ISO 8601; date the delay event commenced; must be ≤ `dateIdentified`; immutable after creation |
| `delayEndDate` | `date` | No | No | No | ISO 8601; date delay event concluded or projected conclusion; null if ongoing |
| `notificationDate` | `date` | Yes | No | No | ISO 8601; date formal written notice was provided to owner; must be ≥ `delayStartDate`; critical for claim substantiation |
| `notificationReference` | `string` | No | No | No | Reference to notification document (e.g., letter number, email subject, RFI number) |

#### Schedule reference fields (governed model)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `scheduleReferenceMode` | `enum` | Yes | No | No | `Integrated` or `ManualFallback`; determines which schedule fields are active |
| `scheduleVersionId` | `string` | No | No | No | FK to `ScheduleVersionRecord.versionId` (P3-E5); required if `scheduleReferenceMode = Integrated`; null if `ManualFallback` |
| `controlScheduleName` | `string` | Yes | No | No | Human-readable name of the control/current schedule used as analysis basis (e.g., "BL Rev 2 — 2025-Q2 Update"); required in both modes |
| `controlScheduleDate` | `date` | Yes | No | No | Date of the control schedule update being used as impact basis |
| `impactedActivityIds` | `string[]` | No | No | No | FKs to `ImportedActivitySnapshot.snapshotId` (P3-E5); used when `scheduleReferenceMode = Integrated`; may be empty if analysis is path-level only |
| `impactedActivityFreeText` | `string[]` | No | No | No | Free-text activity names/codes for `ManualFallback` mode; array of strings |
| `impactedPathDescription` | `string` | Yes | No | No | Narrative description of the impacted schedule path, sequence, or milestone; required regardless of reference mode; min 50 characters |
| `criticalPathImpact` | `enum` | Yes | No | No | Governed assessment (§3.7); PM/project controls set; validated at `Quantified` state gate |

#### Time impact fields (separate from cost/commercial)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `timeImpact` | `TimeImpactRecord` | No | No | No | Time impact record (§3.8); required at `Quantified` state gate |

**`TimeImpactRecord` structure:**

| Sub-field | TypeScript Type | Required at Quantified | Business Rule |
|-----------|-----------------|------------------------|---------------|
| `estimatedCalendarDays` | `integer` | Yes | Positive; estimated excusable delay calendar days |
| `estimatedWorkingDays` | `integer` | No | Working days equivalent; may differ from calendar days |
| `analysisMethod` | `enum` | Yes | Governed analysis method (§3.9) |
| `analysisBasis` | `string` | Yes | Narrative explanation of how the estimate was derived; min 100 chars |
| `fragnetAvailable` | `boolean` | No | Whether a fragnet has been prepared; false = not yet |
| `fragnetReference` | `string` | No | URI or reference to fragnet document; populated if `fragnetAvailable = true` |
| `tiaAvailable` | `boolean` | No | Whether a formal TIA has been performed |
| `tiaReference` | `string` | No | URI or reference to TIA document |
| `pwindowStart` | `date` | No | Start of impact window (P-window for impact analysis) |
| `pwindowEnd` | `date` | No | End of impact window |
| `quantificationConfidence` | `enum` | Yes | `Rough` / `Ordered` / `Definitive`; governs evidence gate requirements |

#### Commercial and cost impact fields (separate from time)

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `commercialImpact` | `CommercialImpactRecord` | No | No | No | Commercial/cost impact record (§3.10); required at `Quantified` gate if cost impact exists |

**`CommercialImpactRecord` structure:**

| Sub-field | TypeScript Type | Required | Business Rule |
|-----------|-----------------|----------|---------------|
| `hasCostImpact` | `boolean` | Yes | Explicit flag; must be set; governs whether cost fields are required |
| `costImpactEstimate` | `number` | If `hasCostImpact = true` | USD estimate; positive = cost increase |
| `costImpactConfidence` | `enum` | If `hasCostImpact = true` | `Rough` / `Ordered` / `Definitive` |
| `costImpactDescription` | `string` | If `hasCostImpact = true` | Narrative of cost exposure; min 50 chars |
| `costImpactBreakdown` | `CostBreakdownItem[]` | No | Optional line-level breakdown; `{ description, amount, costCode }` |
| `linkedChangeEventId` | `string` | No | FK to `ChangeEventRecord.changeEventId` if cost impact flows to a change event |
| `separationConfirmed` | `boolean` | Yes | Must be `true` before reaching `Quantified` state; confirms that time impact and cost impact are analyzed separately and not conflated |

#### Closure and lineage fields

| Field Name (camelCase) | TypeScript Type | Required | Calculated | Immutable | Business Rule |
|------------------------|-----------------|----------|------------|-----------|---------------|
| `dispositionOutcome` | `enum` | No | No | No | Required at `Dispositioned` gate (§3.4); `Withdrawn` / `SettledByChange` / `SettledByTime` / `ClaimPreserved` / `Dispute` |
| `dispositionNotes` | `string` | No | No | No | Required at `Dispositioned` gate; narrative of disposition |
| `dateClosed` | `date` | No | No | No | Set when status = `Closed`; immutable after set |
| `closureReason` | `string` | No | No | No | Required for `Void`, `Cancelled`; recommended for `Closed` |
| `evidenceAttachments` | `AttachmentRef[]` | No | No | No | Array of `{ attachmentId, uri, description, attachedAt, attachedBy, evidenceType }`; `evidenceType` is governed enum (§3.11) |
| `comments` | `CommentEntry[]` | No | No | No | Append-only comment log |
| `linkedChangeEventIds` | `string[]` | No | No | No | FKs to `ChangeEventRecord.changeEventId`; delay may be linked to (not spawned from) change events |
| `createdAt` | `timestamp` | Yes | Yes | Yes | Immutable |
| `createdBy` | `string` | Yes | Yes | Yes | Immutable |
| `lastEditedAt` | `timestamp` | No | Yes | No | — |
| `lastEditedBy` | `string` | No | Yes | No | — |

### 3.3 Claims-Readiness Orientation

The Delay Ledger is designed at **B+/C-ready** level. The following Phase 3 requirements are locked:

**What Phase 3 must implement:**
- Contemporaneous event narrative with mandatory minimums
- Formal owner notification date and reference
- Control schedule name and date as explicit fields (not implied)
- Impacted activity reference (integrated or manual fallback)
- Explicit impacted path description (min 50 chars)
- Separation of time impact from commercial/cost impact (confirmed by explicit boolean gate)
- Analysis method field (governs what type of quantification was used)
- Evidence attachments with typed evidence categories
- Status gates at `Quantified` and `Dispositioned` with explicit preconditions

**What Phase 3 defines but does not fully implement (future-ready seams):**
- Fragnet preparation (`fragnetAvailable`, `fragnetReference` — fields exist, tooling not required)
- Formal TIA (`tiaAvailable`, `tiaReference` — fields exist, tooling not required)
- P-window analysis (`pwindowStart`, `pwindowEnd` — fields exist, analysis tooling not required)
- Claims packaging or export (fields ready for packaging; claims export not required at Phase 3)

These seams are intentional. Future phases may add TIA tooling, fragnet generation, or claims-grade packaging using the field structure established here without schema redesign.

### 3.4 Delay Lifecycle (Status Enumeration)

| Status | Meaning | Evidence gate preconditions | Valid next states |
|--------|---------|---------------------------|------------------|
| `Identified` | Delay event recorded; minimal data | None | `UnderAnalysis`, `Void` |
| `UnderAnalysis` | Delay being investigated; impact analysis in progress | None | `Quantified`, `Void`, `Cancelled` |
| `Quantified` | Time and cost impact quantified | **Gate:** `timeImpact` populated with `estimatedCalendarDays`, `analysisMethod`, `analysisBasis`; `commercialImpact.separationConfirmed = true`; `criticalPathImpact` set | `Dispositioned`, `Closed`, `Void` |
| `Dispositioned` | Delay has been formally dispositioned | **Gate:** `dispositionOutcome` set; `dispositionNotes` non-empty; `notificationDate` populated | `Closed` |
| `Closed` | Delay fully resolved; record archived | — | Terminal |
| `Void` | Created in error; duplicate | Requires `closureReason` | Terminal |
| `Cancelled` | Deliberate withdrawal | Requires `closureReason` | Terminal |

**Transition rules:**
- `Quantified` gate enforced by system; transitions blocked if preconditions not met.
- `Dispositioned` gate enforced by system; `dispositionOutcome` required.
- `separationConfirmed` must explicitly be `true` before `Quantified` transition; confirms that PM has consciously separated time and cost analysis.
- Governed configuration may add additional gate requirements (e.g., attachment required at `Quantified`).

### 3.5 Delay Event Type Enumeration (Governed)

| Code | Label |
|------|-------|
| `OWNER_DIRECTED` | Owner-directed delay (change, suspension, access) |
| `DIFFERING_CONDITIONS` | Differing site or subsurface conditions |
| `WEATHER_EXCEEDANCE` | Adverse weather exceeding contract baseline |
| `THIRD_PARTY` | Third-party caused (utility, public authority, regulator) |
| `DESIGN_CHANGE` | Design change or coordination failure |
| `FORCE_MAJEURE` | Force majeure event |
| `CONCURRENT` | Concurrent delay (multiple parties) |
| `CONTRACTOR_CAUSED` | Contractor-caused delay (self-assessment) |
| `SUBCONTRACTOR_CAUSED` | Subcontractor-caused delay |
| `PROCUREMENT` | Material or equipment procurement delay |
| `LABOR` | Labor shortage or workforce delay |
| `OTHER` | Unclassified delay event |

### 3.6 Responsible Party Enumeration (Governed)

| Code | Label |
|------|-------|
| `OWNER` | Owner or owner's representative |
| `GC` | General contractor |
| `SUBCONTRACTOR` | Subcontractor or sub-tier |
| `THIRD_PARTY` | Third party (utility, regulator, public authority) |
| `FORCE_MAJEURE` | Force majeure (no responsible party) |
| `CONCURRENT` | Concurrent (shared responsibility) |
| `UNKNOWN` | Not yet determined |

### 3.7 Critical Path Impact Enumeration (Governed)

| Code | Label |
|------|-------|
| `CRITICAL` | Delay is on or will impact the critical path |
| `NEAR_CRITICAL` | Delay is on near-critical path with < governed float threshold |
| `NON_CRITICAL` | Delay does not impact critical path |
| `UNKNOWN` | Not yet analyzed |

Float threshold for `NEAR_CRITICAL` classification is governed configuration.

### 3.8 Time Impact Analysis Method Enumeration (Governed)

| Code | Label |
|------|-------|
| `TIA` | Time Impact Analysis (AACE RP 29R-03 compliant) |
| `FRAGNET` | Fragnet insertion method |
| `GLOBAL_IMPACT` | Global impact method (total delay apportionment) |
| `AS_PLANNED_VS_AS_BUILT` | As-planned versus as-built comparison |
| `CONTEMPORANEOUS_UPDATE` | Contemporaneous schedule update method |
| `MANUAL_ESTIMATE` | Manual estimate by PM/scheduler |
| `NOT_YET_PERFORMED` | Analysis not yet complete |

### 3.9 Evidence Type Enumeration (Governed)

Evidence attachments are typed to support eventual claims packaging:

| Code | Label |
|------|-------|
| `CORRESPONDENCE` | Owner/GC letters, emails, or notices |
| `MEETING_MINUTES` | Meeting minutes or action items |
| `SCHEDULE_DOCUMENT` | Schedule file (CPM file, update, or fragnet) |
| `PHOTO` | Site photographs |
| `DAILY_REPORT` | Daily report or foreman log |
| `COST_DOCUMENT` | Cost estimate, invoice, or backup |
| `THIRD_PARTY_DOCUMENT` | Utility, regulatory, or public authority document |
| `TIA_DOCUMENT` | Formal TIA report |
| `OTHER` | Uncategorized evidence |

### 3.10 Delay Ledger Business Rules

**Rule D-01: Contemporaneous evidence orientation**
`eventDescription`, `controlScheduleName`, `controlScheduleDate`, and `impactedPathDescription` are required at record creation. These fields enforce the contemporaneous nature of the delay record.

**Rule D-02: Notification date integrity**
`notificationDate` must be ≥ `delayStartDate`. Notification cannot precede the delay event.

**Rule D-03: Schedule reference consistency**
If `scheduleReferenceMode = Integrated`, `scheduleVersionId` is required. If `scheduleReferenceMode = ManualFallback`, `impactedActivityFreeText` or `impactedPathDescription` must be populated.

**Rule D-04: Impact separation gate**
`commercialImpact.separationConfirmed` must be `true` before `Quantified` transition. This explicit gate ensures PMs consciously confirm that time impact and cost/commercial impact analyses are separate.

**Rule D-05: No hard delete**
Use `Void` for error records; terminal transitions require closure reason.

**Rule D-06: Governed gate requirements**
The Manager of Operational Excellence may add gate requirements at `Quantified` or `Dispositioned` states via governed configuration (e.g., requiring at least one `SCHEDULE_DOCUMENT` attachment at `Quantified`).

**Rule D-07: Change event linking**
A delay record may be linked to one or more change events (Delay ↔ Change is a peer link, not a spawn). Links are maintained in `linkedChangeEventIds`. Bidirectional references are maintained.

### 3.11 Delay Ledger Metrics (Published to Health Spine)

| Metric | Type | Calculation |
|--------|------|-------------|
| `openDelayCount` | integer | Count where `status NOT IN (Closed, Void, Cancelled)` |
| `criticalPathDelayCount` | integer | Count where `criticalPathImpact = CRITICAL` and status open |
| `totalQuantifiedDelayDays` | integer | Sum of `timeImpact.estimatedCalendarDays` for `Quantified`+ delays |
| `pendingNotificationCount` | integer | Count where `notificationDate` not yet set and `delayStartDate < today - governed threshold` |
| `delayCountByEventType` | map | Count by `delayEventType`, open delays |

---

*Navigation: [← T02 Constraint Ledger](P3-E6-T02-Constraint-Ledger.md) | [Master Index](P3-E6-Constraints-Module-Field-Specification.md) | [T04 Change Ledger →](P3-E6-T04-Change-Ledger.md)*
