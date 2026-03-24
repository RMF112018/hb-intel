# P3-E11-T07 — Startup Safety Readiness and Permit Posting Verification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E11-T07 |
| **Parent** | [P3-E11 Project Startup Module](P3-E11-Project-Startup-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T07 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Two Verification Surfaces in This File

This T-file covers two closely related Startup verification surfaces:

1. **Startup Safety Readiness** (§2–§6) — the 32-item startup-phase safety readiness assessment; remediation-capable with full escalation and blocker model; distinct from Safety module ongoing operations
2. **Permit Posting Verification** (§7–§9) — Section 4 of the Startup Task Library as a governed evidence-and-cross-reference surface for permits posted on the jobsite

Both surfaces are owned exclusively by `@hbc/project-startup`. Neither writes to any other module.

---

## 2. Startup Safety Readiness — Purpose and Boundary

The Startup Safety Readiness surface is a **remediation-capable startup-phase safety assessment**. It checks that the jobsite is prepared for safe mobilization. It is not an ongoing inspection surface; that function belongs to the Safety module (P3-E8).

**Source document:** `docs/reference/example/Project_Safety_Checklist.pdf` — "Jobsite Safety Checklist"; 32 items in 2 sections; response values: Pass = Satisfactory; Fail = Unsatisfactory; N/A = Not Observed.

"Remediation-capable" means: a `Fail` result does not block the checklist from advancing, but it creates a first-class `SafetyRemediationRecord` that must be explicitly acknowledged, assigned, and tracked through to resolution before the surface can be certified ready. Open remediations generate Work Queue items and can escalate to `ProgramBlocker` severity.

### 2.1 Boundary Rules — Safety Module Non-Interference

The following rules are locked and must not be violated:

- The Startup Safety Readiness surface **does not feed** the Safety module's inspection scoring, corrective action log, or incident records.
- A `Fail` result on a Safety Readiness item **does not create** a corrective action record in P3-E8 Safety.
- Safety module executive review exclusion rules **do not apply** to the Startup Safety Readiness surface. Startup Safety is subject to standard executive review annotation boundaries (via `@hbc/field-annotations`).
- The two surfaces are architecturally parallel. They may be visually cross-referenced in the UI via Related Items links, but they remain operationally independent.

See §10 for the full SoT boundary table covering both surfaces.

---

## 3. Startup Safety Readiness — Field Architecture

### 3.1 JobsiteSafetyChecklist Header

One per project. Created at project creation alongside `StartupProgram`.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `safetyChecklistId` | `string` | Yes | Yes | UUID; immutable |
| `programId` | `string` | Yes | No | FK to StartupProgram |
| `projectId` | `string` | Yes | No | FK to project |
| `createdAt` | `datetime` | Yes | Yes | Timestamp of creation |
| `createdBy` | `string` | Yes | No | userId |
| `lastModifiedAt` | `datetime` | Yes | Yes | Timestamp of most recent item edit |
| `lastModifiedBy` | `string` | No | No | userId |
| `passCount` | `number` | Yes | Yes | Count of items with `result = Pass` |
| `failCount` | `number` | Yes | Yes | Count of items with `result = Fail` |
| `naCount` | `number` | Yes | Yes | Count of items with `result = NA` |
| `openRemediationCount` | `number` | Yes | Yes | Count of `Fail` items where no `SafetyRemediationRecord` has `remediationStatus = RESOLVED` |
| `escalatedRemediationCount` | `number` | Yes | Yes | Count of `SafetyRemediationRecord` records with `remediationStatus = ESCALATED` |
| `certificationStatus` | `enum` | Yes | Yes | Mirrors `ReadinessCertification.certStatus` for `SAFETY_READINESS` sub-surface |
| `notes` | `string` | No | No | Optional overall safety readiness notes |

### 3.2 SafetyReadinessSection Model

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `sectionId` | `string` | Yes | Yes | UUID; immutable |
| `safetyChecklistId` | `string` | Yes | No | FK |
| `sectionNumber` | `number` | Yes | No | 1 or 2; immutable |
| `sectionTitle` | `enum` | Yes | No | `AreasOfHighestRisk` \| `OtherRisks`; immutable |
| `itemCount` | `number` | Yes | No | Section 1 = 4; Section 2 = 28; immutable |

### 3.3 SafetyReadinessItem Model

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `itemId` | `string` | Yes | Yes | UUID; immutable |
| `sectionId` | `string` | Yes | No | FK |
| `itemNumber` | `string` | Yes | No | Section-prefixed (e.g., `1.1`, `2.14`); immutable |
| `description` | `string` | Yes | No | Verbatim item text; immutable |
| `result` | `enum \| null` | No | No | `Pass` \| `Fail` \| `NA` \| null — null = not yet assessed |
| `assessedBy` | `string` | No | No | userId of person who set the result |
| `assessedAt` | `datetime` | No | No | Timestamp when result was set |
| `lastModifiedAt` | `datetime` | No | Yes | Timestamp when result last changed |
| `lastModifiedBy` | `string` | No | No | userId |
| `hasOpenRemediation` | `boolean` | Yes | Yes | `true` if `result = Fail` and no `SafetyRemediationRecord` with `remediationStatus = RESOLVED` exists |

---

## 4. SafetyRemediationRecord — Full Model

A `SafetyRemediationRecord` is automatically created as a stub when a safety item receives `result = Fail`. It is a first-class record — not a text note — with its own lifecycle, assignment, evidence, and escalation model.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `remediationId` | `string` | Yes | Yes | UUID; immutable |
| `itemId` | `string` | Yes | No | FK to SafetyReadinessItem |
| `safetyChecklistId` | `string` | Yes | No | FK |
| `programId` | `string` | Yes | No | FK |
| `remediationNote` | `string` | Yes | No | Describes the deficiency and the corrective action planned or taken; required before certification can be submitted |
| `remediationStatus` | `enum` | Yes | No | `PENDING` \| `IN_PROGRESS` \| `RESOLVED` \| `ESCALATED`; see §5 |
| `assignedRoleCode` | `string` | No | No | Role code responsible for resolving this remediation (e.g., `LeadSuper`, `PM`, `SafetyMgr`) |
| `assignedPersonName` | `string` | No | No | Full name of the person assigned; populated immediately or at PM review |
| `assignedUserId` | `string` | No | No | FK to user record; null if person not yet in system |
| `dueDate` | `date` | No | No | Required resolution date; must be set before certification is submitted |
| `evidenceAttachmentIds` | `string[]` | No | No | File IDs from document management layer documenting the corrective action (photos, sign-off records, inspection notes) |
| `escalationLevel` | `enum` | No | No | `NONE` \| `PM` \| `PX`; set by escalation engine |
| `escalatedAt` | `datetime` | No | No | Timestamp when escalation level was last elevated |
| `escalatedBy` | `string` | No | No | userId of person or system process that triggered escalation |
| `escalationNote` | `string` | No | No | Notes added at escalation |
| `programBlockerRef` | `string` | No | No | FK to `ProgramBlocker` if this remediation has been elevated to a program-level blocker |
| `resolvedAt` | `datetime` | No | Yes | Timestamp when `remediationStatus` was set to `RESOLVED` |
| `resolvedBy` | `string` | No | No | userId |
| `createdAt` | `datetime` | Yes | Yes | Timestamp of stub creation |
| `createdBy` | `string` | Yes | No | userId (system-created on `Fail` save) |

---

## 5. Remediation Lifecycle and Escalation Rules

```
PENDING → IN_PROGRESS → RESOLVED
PENDING → ESCALATED
IN_PROGRESS → ESCALATED
ESCALATED → IN_PROGRESS (on PM/PX acknowledgment)
ESCALATED → RESOLVED
```

### 5.1 Auto-Creation Rule

When `result = Fail` is saved on a `SafetyReadinessItem`, the system automatically creates a `SafetyRemediationRecord` stub with:
- `remediationStatus = PENDING`
- `escalationLevel = NONE`
- All other fields null

The stub is immediately surfaced as a Work Queue item of type `SafetyRemediationPending` assigned to the PM.

### 5.2 Escalation Thresholds

| Condition | Escalation action |
|---|---|
| `remediationStatus = PENDING` AND no `assignedPersonName` populated after 2 business days | Elevate `escalationLevel` to `PM`; Work Queue item assigned to PM with `SafetyRemediationUnassigned` type |
| `remediationStatus = PENDING` or `IN_PROGRESS` AND `dueDate < today` | Elevate `escalationLevel` to `PM`; Work Queue item assigned to PM with `SafetyRemediationOverdue` type |
| `remediationStatus = PENDING` or `IN_PROGRESS` AND `dueDate < today - 3 days` | Elevate `escalationLevel` to `PX`; create `ProgramBlocker` with `scope = SAFETY_READINESS` and `severity = HIGH`; set `programBlockerRef` on remediation record |
| `escalatedRemediationCount ≥ 2` at time of certification review | Advisory surfaced on certification gate |

### 5.3 Blocker Rule

An escalated remediation (`escalationLevel = PX`) generates a `ProgramBlocker` (T02 §3.4) with:
- `scope = SAFETY_READINESS`
- `severity = HIGH`
- `description` = "Safety remediation overdue: [itemNumber] [description]"
- `blockedSubSurfaces = ['SAFETY_READINESS']`

The blocker must be resolved or waived (with PE note) before the `SAFETY_READINESS` certification can be submitted.

---

## 6. All 32 Safety Readiness Items — Verbatim Reference

### Section 1: Areas of Highest Risk (4 items)

| Item No. | Description |
|---|---|
| 1.1 | Fall Exposures |
| 1.2 | Electrical Shocks |
| 1.3 | Struck by Risks |
| 1.4 | Crushed by Risks |

### Section 2: Other Risks — These caused most injuries (28 items)

| Item No. | Description |
|---|---|
| 2.1 | Blasting/Explosives |
| 2.2 | Concrete Construction |
| 2.3 | Cranes & Elevators |
| 2.4 | Demolition |
| 2.5 | Electrical |
| 2.6 | Excavation |
| 2.7 | Fire Protection |
| 2.8 | First Aid |
| 2.9 | Flammables |
| 2.10 | Floor & Wall Openings |
| 2.11 | Gases, Fumes, Dusts |
| 2.12 | General Safety |
| 2.13 | Hazard Communication |
| 2.14 | Housekeeping |
| 2.15 | Illumination |
| 2.16 | Lockout/tagout |
| 2.17 | Maintenance |
| 2.18 | Motor Vehicles |
| 2.19 | Noise Exposure |
| 2.20 | Personal Protection |
| 2.21 | Safety Training |
| 2.22 | Sanitation |
| 2.23 | Scaffolding |
| 2.24 | Signs, Signals, Barricades |
| 2.25 | Stairways & Ladders |
| 2.26 | Steel Erection |
| 2.27 | Tools |
| 2.28 | Welding & Cutting |

---

## 7. Safety Readiness Certification Eligibility

`ReadinessCertification` for `SAFETY_READINESS` may be submitted when **all** of:

1. All 32 items have a result value (`Pass`, `Fail`, or `NA`) — no null results remain
2. Every `Fail` item has a `SafetyRemediationRecord` with `remediationNote` populated
3. Every `Fail` item's `SafetyRemediationRecord` has `assignedPersonName` populated
4. Every `Fail` item's `SafetyRemediationRecord` has `dueDate` populated
5. No `SafetyRemediationRecord` has `escalationLevel = PX` or an active `programBlockerRef` (or any such blockers are waived with PE note)

`openRemediationCount > 0` is permitted at submission — PE reviews and may accept the certification with acknowledged open remediations, or return it for additional resolution.

Items with `result = NA` are excluded from pass/fail counts. PE reviews the full `failCount`, `openRemediationCount`, and `escalatedRemediationCount` before accepting.

---

## 8. Permit Posting Verification — Purpose and Boundary

The Permit Posting Verification surface is **Section 4 of the Startup Task Library** elevated to a first-class evidence-and-cross-reference verification surface. It answers one question per permit type: "Is this permit physically posted on the jobsite?" Evidence (photos, scans) is attached. Optional cross-reference to P3-E7 provides display context on permit lifecycle status.

**Section 4 items are `StartupTaskInstance` records** (see T03) created from `StartupTaskTemplate` records in the `STARTUP_TASK_LIBRARY`. The `sectionTitle` for Section 4 is `PermitsPostedOnJobsite`. There are 12 Section 4 items.

In addition to the standard `StartupTaskInstance` fields, each Section 4 item has a companion `PermitVerificationDetail` record that carries permit-specific verification metadata (see §8.2). This companion record is created automatically alongside each Section 4 `StartupTaskInstance`.

### 8.1 Boundary Rules — Permits Module Non-Interference

The following rules are locked:

- Section 4 items **do not write** to the Permits module (P3-E7). Marking a Section 4 item `Yes` does not create, update, close, or modify any Permit record in P3-E7.
- Permit status from P3-E7 **does not auto-resolve** Section 4 item results. Even if a permit reaches `ISSUED` status in P3-E7, the corresponding Section 4 `result` is not automatically changed. The team must manually confirm physical posting.
- The two surfaces are complementary and parallel. Section 4 answers "Is this permit posted on the jobsite?" P3-E7 answers "What is this permit's lifecycle status, inspection history, and expiration date?"
- Section 4 may display P3-E7 context in the UI. It may not write to P3-E7 under any circumstances.

---

## 9. Permit Posting Verification — Field Architecture

### 9.1 PermitVerificationDetail Model

One `PermitVerificationDetail` per Section 4 `StartupTaskInstance`. Created automatically on task library instantiation for all Section 4 items.

| Field | Type | Required | Calculated | Rule |
|---|---|---|---|---|
| `detailId` | `string` | Yes | Yes | UUID; immutable |
| `taskInstanceId` | `string` | Yes | No | FK to the Section 4 `StartupTaskInstance`; one-to-one |
| `projectId` | `string` | Yes | No | FK |
| `permitType` | `string` | Yes | No | Permit type name (e.g., `Master Permit`, `Roofing Permit`); immutable; from task template |
| `physicalEvidenceAttachmentIds` | `string[]` | No | No | Photos or scans confirming the permit is physically posted on the jobsite |
| `verifiedBy` | `string` | No | No | userId of the person who confirmed physical posting |
| `verifiedAt` | `datetime` | No | No | Timestamp of physical verification |
| `discrepancyReason` | `string` | No | No | Required when the task `result = No`; describes why the permit is not posted (not yet issued, pending inspection, posted at wrong location, etc.) |
| `permitModuleRecordRef` | `string` | No | No | Optional FK to the matching P3-E7 Permit record; team-entered; not auto-populated |
| `permitStatusFromModule` | `string` | No | Yes | Cached display value from P3-E7 permit record (status only); read-only; null if `permitModuleRecordRef` is null |
| `permitExpirationFromModule` | `date` | No | Yes | Cached permit expiration date from P3-E7; read-only |
| `lastCrossRefreshedAt` | `datetime` | No | Yes | Timestamp of last P3-E7 cross-reference refresh |
| `createdAt` | `datetime` | Yes | Yes | Timestamp |
| `lastModifiedAt` | `datetime` | Yes | Yes | Timestamp |

### 9.2 Section 4 Task Item to Permit Type Mapping

| Item No. | Task Title | Permit Type | Notes |
|---|---|---|---|
| 4.1 | Master permit posted | `Master` | — |
| 4.2 | Roofing permit posted | `Roofing` | — |
| 4.3 | Mechanical permit posted | `Mechanical` | — |
| 4.4 | Plumbing permit posted | `Plumbing` | — |
| 4.5 | Electrical permit posted | `Electrical` | — |
| 4.6 | Fire sprinkler permit posted | `FireSprinkler` | — |
| 4.7 | Fire alarm permit posted | `FireAlarm` | — |
| 4.8 | Elevator permit posted | `Elevator` | If applicable |
| 4.9 | Low voltage permit posted | `LowVoltage` | If applicable |
| 4.10 | Demolition permit posted | `Demolition` | If applicable |
| 4.11 | Excavation / earthwork permit posted | `ExcavationEarthwork` | If applicable |
| 4.12 | Other jurisdictional permit posted | `OtherJurisdictional` | As required by jurisdiction |

> Section 4 items with `result = NA` indicate the permit type is not required for this project scope. N/A items are excluded from certification completion calculations.

### 9.3 Cross-Reference Display Model

When displaying Section 4 items, the UI queries the Permits module for permits of the matching `permitType` on this project and surfaces them as display context only:

| Display element | Source | Writeable |
|---|---|---|
| Permit status | P3-E7 permit record `status` | No — display only |
| Permit issued date | P3-E7 permit record `issuedDate` | No — display only |
| Permit expiration date | P3-E7 permit record `expirationDate` | No — display only |
| Permit number | P3-E7 permit record `permitNumber` | No — display only |

The cross-reference display is a UI hint. The API does not accept P3-E7 permit status as a write input to any Section 4 task result.

### 9.4 Discrepancy Reason Requirement

When `result = No` is saved on a Section 4 `StartupTaskInstance`:
1. The system requires `discrepancyReason` on the `PermitVerificationDetail` to be populated before the item can be confirmed
2. A Work Queue item of type `PermitNotPosted` is raised, routed to the PM, with the permit type and discrepancy reason surfaced
3. The item generates a `TaskBlocker` of type `PendingPermit` on the task instance, which blocks certification for `PERMIT_POSTING`

Work Queue items clear and the blocker clears when the task result is updated to `Yes` or `NA` with appropriate documentation.

### 9.5 Evidence Requirements for Certification

`ReadinessCertification` for `PERMIT_POSTING` (governed by the `STARTUP_TASK_LIBRARY` certification rules per T03 §10, applied to Section 4 items) may be submitted when:

1. All 12 Section 4 `StartupTaskInstance` records have `result ≠ null`
2. All items with `result = Yes` have at least one `physicalEvidenceAttachmentId` in their `PermitVerificationDetail` record (photo of posted permit required)
3. All items with `result = No` have `discrepancyReason` populated in their `PermitVerificationDetail` record, and either:
   - An active `TaskBlocker` of type `PendingPermit` is documented and acknowledged, OR
   - A `ProgramBlocker` with PE waiver note covers the outstanding item
4. Items with `result = NA` are excluded from the above requirements

---

## 10. SoT Boundary Matrix — Both Surfaces

| Data domain | Startup Safety Readiness owns | Startup Safety Readiness reads | Startup Safety Readiness may not |
|---|---|---|---|
| Safety readiness item results | `SafetyReadinessItem.result` | — | Write to P3-E8 Safety corrective actions |
| Remediation records | `SafetyRemediationRecord.*` | — | Create P3-E8 inspection records |
| Safety program blockers | `ProgramBlocker` (SAFETY_READINESS scope) | — | Modify P3-E8 scoring or dashboards |

| Data domain | Permit Posting Verification owns | Permit Posting Verification reads | Permit Posting Verification may not |
|---|---|---|---|
| Permit posting confirmation | `StartupTaskInstance.result` (Section 4) | — | Write to P3-E7 Permit records |
| Verification details | `PermitVerificationDetail.*` | — | Create or close P3-E7 Permit lifecycle events |
| P3-E7 context | — | `status`, `issuedDate`, `expirationDate`, `permitNumber` (display only) | Auto-resolve P3-E7 items from Section 4 results |

---

## 11. Cross-Reference

| Concern | Governing source |
|---|---|
| Safety Readiness field architecture | This file (T07) |
| Permit Posting Verification field architecture | This file (T07) |
| Section 4 as `StartupTaskInstance` records | T03 §2 — `StartupTaskInstance` model |
| `TaskBlocker` model for permit blockers | T03 §8 |
| `ProgramBlocker` model | T02 §3.4 |
| Certification model for both surfaces | T02 §3.3 |
| Work Queue items for remediations and permit items | T08 §3 |
| Permits module boundary | P3-E7 |
| Safety module boundary | P3-E8 |
| Role permissions for safety and permit surfaces | T09 §1 |

---

*[← T06](P3-E11-T06-Project-Execution-Baseline-Startup-Baselines-and-Closeout-Continuity.md) | [Master Index](P3-E11-Project-Startup-Module-Field-Specification.md) | [T08 →](P3-E11-T08-Spine-Publication-Reports-Executive-Review-and-Cross-Module-Consumption.md)*
