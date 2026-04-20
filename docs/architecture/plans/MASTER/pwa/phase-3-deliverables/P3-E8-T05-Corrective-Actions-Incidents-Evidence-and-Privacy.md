# P3-E8-T05 — Corrective Actions, Incidents, Evidence, and Privacy Tiers

**Doc ID:** P3-E8-T05
**Parent:** P3-E8 Safety Module — Master Index
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 5 of 10
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Safety Corrective Action Ledger

### 1.1 Design Decisions

| Decision | Detail |
|---|---|
| Decision 15 | Safety Corrective Action Ledger is centralized regardless of source workflow |
| Decision 27 | Safety evidence is a governed evidence-record layer with metadata, review state, sensitivity, retention |

The centralized Safety Corrective Action Ledger (SCAL) is the single record of all safety corrective actions on a project. It does not matter whether a corrective action originated from an inspection finding, an incident investigation, a JHA hazard review, or a direct safety observation from the Safety Manager. All corrective actions land in the SCAL.

This is a deliberate architecture decision. The source of a corrective action changes context and history, but it does not change the corrective action's lifecycle, ownership rules, work queue behavior, or contribution to the composite safety scorecard.

### 1.2 Corrective Action Lifecycle

```
OPEN ──────────────────────────► IN_PROGRESS
  │                                    │
  │                                    ▼
  │                         PENDING_VERIFICATION
  │                                    │
  │                         (verified by Safety Manager)
  │                                    ▼
  └──────────────────────────────► CLOSED
          │
          └─► VOIDED (Safety Manager may void if CA was created in error or no longer applicable)
```

| State | Meaning |
|---|---|
| `OPEN` | Created; assigned; due date set; no work started |
| `IN_PROGRESS` | Assignee has begun remediation |
| `PENDING_VERIFICATION` | Assignee has marked complete; awaiting Safety Manager sign-off |
| `CLOSED` | Safety Manager has verified resolution; may include evidence review |
| `VOIDED` | Safety Manager has voided; reason captured; retained for audit |

### 1.3 Severity and Due Date Rules

| Severity | Default Due | Work Queue Priority | Impact on Health Scorecard |
|---|---|---|---|
| CRITICAL | Same business day | CRITICAL | Triggers CRITICAL health tier regardless of other signals |
| MAJOR | 3 business days | HIGH | Contributes to AT_RISK health tier |
| MINOR | 7 business days | MEDIUM | No tier impact when on-time |

Safety Manager may override due date at creation. Overdue is computed: `dueDate < today AND status NOT IN (CLOSED, VOIDED)`.

### 1.4 Corrective Action Work Queue Items

| Trigger | Work Queue Item | Priority | Assignee |
|---|---|---|---|
| CA created | Complete safety corrective action | Per severity | Assigned party |
| CA is overdue | OVERDUE: safety corrective action | One level above severity | Assigned party + Safety Manager |
| CA is in PENDING_VERIFICATION for > 2 business days | Verify corrective action completion | MEDIUM | Safety Manager |
| CRITICAL CA open for > 4 hours without IN_PROGRESS | Respond to critical safety finding | CRITICAL | Safety Manager + PM |

### 1.5 Source Tracking

```typescript
interface ICorrectiveActionSourceLink {
  sourceType: CorrectiveActionSourceType;
  sourceRecordId: string | null;
  sourceDescription: string | null;          // For EXTERNAL / OBSERVATION sources
  sourceWeek: string | null;                 // ISO week for INSPECTION sources
  sourceIncidentDate: string | null;         // For INCIDENT sources
}
```

The source link is informational and immutable after creation. It does not change the corrective action's behavior in the ledger.

---

## 2. Incident and Case Management

### 2.1 Incident Record Purpose

Incidents in the Safety Module serve two functions: they are the factual record of what happened, and they are the starting point for investigation and corrective action generation. The incident record is not a reporting form — it is a governed case record.

### 2.2 Incident Lifecycle

```
REPORTED → UNDER_INVESTIGATION → INVESTIGATION_COMPLETE → CLOSED
                                          │
                                          └──► LITIGATED (set by Safety Manager when legal hold applies)
```

| State | Meaning |
|---|---|
| `REPORTED` | Initial record created; basic facts captured |
| `UNDER_INVESTIGATION` | Investigation in progress; narrative, root cause, witnesses being documented |
| `INVESTIGATION_COMPLETE` | Root cause analysis complete; corrective actions generated |
| `CLOSED` | All corrective actions resolved; case closed by Safety Manager |
| `LITIGATED` | Legal hold applied; record is read-only; retention category escalated to LITIGATION_HOLD |

### 2.3 Privacy Tier Model

Per Decision 16: incident/case visibility uses a tiered privacy model. The Safety Manager assigns the privacy tier at record creation. The tier may be escalated (e.g., from STANDARD to SENSITIVE) but not demoted without deliberate Safety Manager action and an audit note.

#### Tier 1: STANDARD

| Surface | What Is Visible |
|---|---|
| Project Team (PM, Super) | Full incident record except `personsInvolved` details |
| Safety Manager / Officer | Full record |
| PER | Anonymized count by incident type only |
| `personsInvolved` | Safety Manager / Officer only |

Use for: near-miss events, property damage, minor first aid cases with no injury privacy concern.

#### Tier 2: SENSITIVE

| Surface | What Is Visible |
|---|---|
| Project Team (PM, Super) | Incident type, date, location, immediate actions, corrective actions generated |
| Safety Manager / Officer | Full record |
| PM (limited) | Narrative summary only; no person details |
| Superintendent | Not visible |
| PER | Anonymized count only |
| `personsInvolved` | Safety Manager / Officer only |

Use for: recordable injuries, first aid cases where worker identity privacy matters, situations where the PM needs operational awareness but full narrative is sensitive.

#### Tier 3: RESTRICTED

| Surface | What Is Visible |
|---|---|
| Project Team | Incident type and date only; no narrative |
| PM / Superintendent | Incident type and date only |
| Safety Manager / Officer | Full record |
| PER | Anonymized count only |
| `personsInvolved` | Safety Manager / Officer only |

Use for: fatalities, lost-time injuries, incidents under active regulatory investigation, incidents with litigation potential.

### 2.4 `personsInvolved` Record

```typescript
interface IIncidentPersonRecord {
  personId: string | null;               // Governed worker identity ref if available
  personName: string;                    // Always captured (not exposed beyond Safety Manager/Officer)
  personCompanyId: string | null;
  personCompanyName: string;
  roleInIncident: IncidentPersonRole;    // INJURED_PARTY | WITNESS | SUPERVISOR_ON_DUTY | FIRST_RESPONDER
  injuryDescription: string | null;      // Null for non-injured roles
  injuryBodyPart: string | null;
  medicalAttentionRequired: boolean;
  medicalFacility: string | null;
  returnToWorkDate: string | null;
  lostDays: number | null;
}
```

`personsInvolved` is always Safety Manager / Officer only, regardless of privacy tier. This field set is never exposed to project team members, PER, or any other surface.

### 2.5 Corrective Actions from Incidents

When an incident reaches `INVESTIGATION_COMPLETE`, the Safety Manager generates corrective actions from the root cause analysis. These CAs are created in the centralized SCAL with `sourceType: 'INCIDENT'` and `sourceRecordId` pointing to the incident record.

---

## 3. Evidence Record Model

### 3.1 Governed Evidence Layer

Per Decision 27: safety evidence is a governed record layer — not unstructured attachment storage. Every piece of evidence in the Safety workspace is a `ISafetyEvidenceRecord` with:

- Source record linkage (what it belongs to)
- Sensitivity tier (who can see it)
- Retention category (how long it must be kept)
- Review state (has a Safety Manager reviewed and accepted this evidence)
- Metadata (file info, capture context)

### 3.2 Evidence Source Types and Their Sensitivity Defaults

| Source Type | Default Sensitivity | Notes |
|---|---|---|
| INSPECTION | STANDARD | Inspection photos, condition documentation |
| INCIDENT | SENSITIVE | Incident scene photos; upgrade to RESTRICTED when LITIGATED |
| JHA | STANDARD | JHA worksheets, risk documentation |
| CORRECTIVE_ACTION | STANDARD | Evidence of corrective action completion |
| TOOLBOX_TALK | STANDARD | Sign-in sheets, presentation materials |
| ORIENTATION | STANDARD | Orientation completion proof |
| SUBMISSION | STANDARD | Subcontractor safety plan documents |
| CERTIFICATION | STANDARD | Certification card photos, course completion records |
| GENERAL | STANDARD | Miscellaneous safety documentation |

Safety Manager may escalate sensitivity tier for any evidence record. Sensitivity tier governs who can view the stored document.

### 3.3 Retention Categories

| Category | Minimum Retention | Notes |
|---|---|---|
| `STANDARD_PROJECT` | Project close + 3 years | Standard project safety records |
| `EXTENDED_REGULATORY` | Project close + 7 years | OSHA-required records, SSSP, training records |
| `LITIGATION_HOLD` | Until legal hold released | Set when incident enters LITIGATED state; cannot expire |

The platform enforces that LITIGATION_HOLD records cannot be deleted without explicit Safety Manager action and an audit note. The platform does not automatically purge any record in Phase 3 — retention enforcement is an operational responsibility.

### 3.4 Evidence Review Workflow

Evidence records begin in `PENDING_REVIEW`. The Safety Manager reviews and either accepts or rejects:

- `ACCEPTED`: Evidence is suitable for its purpose; linked to source record as verified
- `REJECTED`: Evidence is not suitable (wrong content, blurry photo, wrong document); rejection notes required; assignee may re-upload

Evidence review is not required before a corrective action closes, but the composite scorecard considers the ratio of accepted evidence on CRITICAL and MAJOR corrective actions as a quality signal.

### 3.5 Evidence Record Audit Trail

All evidence records participate in the `@hbc/versioned-record` audit pattern. Every mutation (sensitivity change, retention escalation, review decision) produces an immutable version snapshot. This ensures a complete chain of custody for all safety evidence.

---

## 4. Composite Safety Health (Evidence and Corrective Action Contribution)

The composite safety scorecard (T09) receives signals from corrective action and incident records:

| Signal | How Computed |
|---|---|
| Open CRITICAL CAs | Count of CAs in OPEN or IN_PROGRESS with severity CRITICAL |
| Overdue CAs | Count of CAs where `isOverdue = true` and status not terminal |
| CA aging | Average days open for OPEN + IN_PROGRESS CAs |
| Incident count (current project) | Count by type in current 30-day window |
| LITIGATED incidents | Boolean: any incident in LITIGATED state on project |

These signals feed the composite scorecard's corrective action dimension (T09 §4).

---

## 5. Locked Decisions Reinforced in This File

| Decision | Reinforced Here |
|---|---|
| 15 — Corrective Action Ledger is centralized regardless of source | §1.1 |
| 16 — Incident/case visibility uses tiered privacy model | §2.3 |
| 27 — Safety evidence is a governed evidence-record layer | §3.1 |

---

*[← T04](P3-E8-T04-Inspection-Program-Template-Governance-and-Scorecard.md) | [Master Index](P3-E8-Safety-Module-Field-Specification.md) | [T06 →](P3-E8-T06-JHA-Pre-Task-Toolbox-Prompt-and-Toolbox-Talk.md)*
