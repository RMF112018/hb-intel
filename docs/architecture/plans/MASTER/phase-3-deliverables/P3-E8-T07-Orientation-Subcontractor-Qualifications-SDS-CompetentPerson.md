# P3-E8-T07 — Orientation, Subcontractor Submissions, Qualifications, SDS, and Competent Person

**Doc ID:** P3-E8-T07
**Parent:** P3-E8 Safety Module — Master Index
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 7 of 10
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Worker Orientation and Acknowledgment

### 1.1 Design Decision

Per Decision 17: orientation and acknowledgment records are first-class governed records.

Orientation is not a checkbox on a project setup form. Every worker who enters the site must have an orientation record. The orientation record is owned and administered by the Safety Manager or Safety Officer. The project team can view orientation status (aggregate and individual records for their project), but cannot create, edit, or void orientation records.

### 1.2 Orientation Record Governance

```typescript
// Governed orientation topic checklist — Safety Manager controls the active topic list
interface IOrientationTopicDefinition {
  topicKey: OrientationTopic;           // Governed enum value
  topicName: string;
  isRequired: boolean;                  // Required = must be checked; optional = situational
  regulatoryRef: string | null;
}
```

The Safety Manager maintains the active orientation topic list for the workspace. All orientations use the current active topic list. If a topic is added to the list after workers have already been oriented, those prior records are not retroactively invalidated — they are marked with the topic set that was in effect at the time.

### 1.3 Acknowledgment Integration

Per the hybrid acknowledgment model: digital acknowledgment via `@hbc/acknowledgment` is the preferred method for in-app users. Physical signature and verbal confirmation are permitted for workers without app access.

```typescript
type AcknowledgmentMethod =
  | 'DIGITAL_SIGNATURE'     // @hbc/acknowledgment flow
  | 'PHYSICAL_SIGNATURE'    // Paper sign-off, scanned and attached as evidence
  | 'VERBAL_CONFIRMED';     // Safety Manager records verbal confirmation; no physical evidence
```

When `PHYSICAL_SIGNATURE` is used, the `acknowledgmentEvidenceId` field must point to a scanned sign-in evidence record.

When `VERBAL_CONFIRMED` is used, the Safety Manager must add a note in the orientation record. This method is last resort for workers with language or literacy barriers where digital and physical methods are not practical.

### 1.4 Orientation Work Queue Items

| Trigger | Work Queue Item | Priority | Assignee |
|---|---|---|---|
| New subcontractor expected on site with no orientation records | Orientate new subcontractor crew | HIGH | Safety Manager |
| Worker on-site without completed orientation record | Complete worker orientation | HIGH | Safety Manager |
| Orientation in PENDING_ACKNOWLEDGMENT for > 2 days | Follow up on orientation acknowledgment | MEDIUM | Safety Manager |

### 1.5 Orientation Completion Requirement in Readiness

Whether a subcontractor's crew has been oriented feeds directly into the subcontractor-level readiness evaluation (T08). A subcontractor with no orientation records and workers on site is a readiness blocker.

---

## 2. Subcontractor Safety-Plan Submissions

### 2.1 Design Decision

Per Decision 18: subcontractor safety-plan submissions are first-class governed records.

A subcontractor's safety plan is not a document dropped in a folder. It is a governed submission record with a review lifecycle, status, and formal review disposition by the Safety Manager.

### 2.2 Submission Review Lifecycle

```
PENDING_REVIEW → APPROVED
             │
             ├──► REJECTED (with notes; subcontractor must resubmit)
             └──► REVISION_REQUESTED (Safety Manager has specific change requests)
```

| State | Meaning |
|---|---|
| `PENDING_REVIEW` | Submission received; awaiting Safety Manager review |
| `APPROVED` | Safety Manager has reviewed and accepted the submission |
| `REJECTED` | Safety Manager has rejected; reason documented; subcontractor must resubmit |
| `REVISION_REQUESTED` | Accepted in principle but specific revisions required; subcontractor must resubmit |

### 2.3 Submission Type Coverage

The `SafetySubmissionType` union covers the main submission categories a subcontractor is expected to provide before mobilizing:

| Type | Typical Content |
|---|---|
| `COMPANY_SAFETY_PLAN` | Subcontractor's company-wide safety program (OSHA compliance, policies, procedures) |
| `PROJECT_SPECIFIC_APP` | Subcontractor's project-specific safety plan tailored to the scope on this project |
| `HAZARD_COMMUNICATION` | Subcontractor's HazCom / SDS inventory and handling procedures |
| `OTHER` | Other required safety documentation (e.g., crane inspection records, certifications not in the cert record family) |

A subcontractor may have multiple submission records — one per type. The readiness evaluation (T08) checks whether all required submission types are in APPROVED state.

### 2.4 Required Submissions per Subcontractor

The SSSP governed section `subcontractorComplianceStandards` defines which submission types are required for which trade scopes. The readiness engine uses this governed definition when evaluating subcontractor readiness.

---

## 3. Certifications and Qualifications

### 3.1 Design Decision

Per Decision 34: certifications and qualifications are their own governed compliance records.

They are not embedded in worker profile fields. They are standalone records that can be searched, filtered by expiration, linked to competent-person designations, and included in readiness evaluations.

### 3.2 Certification Lifecycle

```
Active (on creation with future expiration or no expiration)
  └──► EXPIRING_SOON (within 30 days of expiration)
         └──► EXPIRED (past expiration date)
  └──► REVOKED (Safety Manager or external authority revokes)
```

Status is computed daily:
- `expirationDate` null → ACTIVE (no expiration)
- `expirationDate` > today + 30 days → ACTIVE
- `expirationDate` within 30 days → EXPIRING_SOON
- `expirationDate` < today → EXPIRED
- Explicit `REVOKED` flag set → REVOKED

### 3.3 Certification Work Queue Items

| Trigger | Work Queue Item | Priority | Assignee |
|---|---|---|---|
| Certification EXPIRING_SOON, active project role requiring it | Renew certification before expiration | HIGH | Safety Manager |
| Certification EXPIRED, worker has active competent-person designation requiring it | Certification expired for competent-person role | CRITICAL | Safety Manager |
| Certification EXPIRED, required for current scope | Worker certification expired | HIGH | Safety Manager |

### 3.4 Certification and Competent-Person Linkage

When a `ICompetentPersonDesignation` record requires a certification (`qualifyingCertificationId` is set), the platform monitors that certification's status. If the certification reaches EXPIRED or REVOKED:

- The system sets the designation's `status` to EXPIRED
- A work queue item is generated (CRITICAL priority)
- The readiness engine is notified to re-evaluate any readiness decisions that depended on that designation

---

## 4. HazCom / SDS Records

### 4.1 Design Decision

Per Decision 35: HazCom/SDS compliance is its own governed record family.

The SDS inventory for a project is not a folder of uploaded PDFs. It is a tracked record per chemical product — who uses it, which subcontractor is responsible, and that the current SDS revision is on file.

### 4.2 SDS Record Governance

The Safety Manager or Safety Officer maintains the SDS inventory. Subcontractors are expected to submit SDS records for their chemical products as part of their HazCom submission. The Safety Manager reviews and creates the governed `IHazComSdsRecord` with the linked evidence record.

### 4.3 SDS Compliance Check for Readiness

The readiness engine (T08) checks that all subcontractors with chemical products on site have:
- At least one HazCom submission in APPROVED state
- SDS records in ACTIVE status for all products currently on site

A subcontractor with ACTIVE chemical products but no SDS records may be flagged as a readiness blocker per the governed blocker matrix.

---

## 5. Competent-Person Designations

### 5.1 Design Decision

Per Decision 36: competent-person designations are project-specific governed designation records.

A competent-person designation is not a field on a user profile. It is a project-scoped, time-bounded governed record that designates a specific person to supervise a specific activity requiring a competent person per OSHA or governing regulation.

### 5.2 Scope of Designation

Each designation covers one `CompetencyArea`. A person may hold multiple active designations for different competency areas on the same project.

```typescript
type CompetencyArea =
  | 'EXCAVATION'         // OSHA 29 CFR 1926.651 competent person requirement
  | 'SCAFFOLDING'        // OSHA 29 CFR 1926.451
  | 'FALL_PROTECTION'    // OSHA 29 CFR 1926.502
  | 'CONFINED_SPACE'     // OSHA 29 CFR 1910.146
  | 'RIGGING'            // OSHA 29 CFR 1926.251
  | 'ELECTRICAL'         // OSHA 29 CFR 1926.416
  | 'CUSTOM';            // Safety Manager-defined; description required
```

### 5.3 Designation and JHA Integration

When a JHA is created for an activity that requires a competent person (`requiresCompetentPerson = true`), the JHA must reference a valid ACTIVE `ICompetentPersonDesignation` for the applicable competency area before the Safety Manager can approve the JHA.

This creates a hard pre-condition: for any scope requiring a competent person, a designation record must exist and be ACTIVE.

### 5.4 Designation Expiration and Revocation

Designations expire on `expirationDate` (null = no expiration, valid for project duration). The Safety Manager may revoke a designation at any time with a revocation reason.

When a designation expires or is revoked:
- Any JHA that required that designation is flagged (work queue item: re-evaluate JHA competent person)
- The readiness engine re-evaluates any activity readiness that depended on that designation

---

## 6. Workforce Identity — Hybrid Model

Per Decision 31: workforce identity uses a hybrid model across all records in this T-file (orientation, toolbox attendance, certifications, designations).

### 6.1 Governed Identity Path

When a worker has a system identity (platform user account, company employee registry):
- `workerId` field is populated with the governed reference
- Worker fields auto-populate from the governed identity on record creation
- Certification and designation records are linked to the governed identity

### 6.2 Provisional / Ad Hoc Identity Path

When a worker is on site without a governed identity (day labor, short-term visitor, new hire not yet in the system):
- `workerId` field is null
- `workerName` and `workerCompanyName` are required free-text fields
- All Safety records can be created with provisional identity
- Provisional records can be linked to a governed identity retroactively if/when the worker enters the system

### 6.3 Identity Upgrade

If a provisional worker is later registered in the system, the Safety Manager can perform an identity upgrade:
- Link the existing provisional records to the new governed `workerId`
- Prior records retain their original `workerName` in a `legacyWorkerName` audit field
- The `updatedAt` / `updatedBy` fields record the upgrade

---

## 7. Company Registry and Future Procore Mapping

Per Decision 32: subcontractor/company identity uses the governed company registry.
Per Decision 33: future-state company mapping supports Procore commitment vendor/company identity.

### 7.1 Company Registry Usage

All subcontractor-related records use `workerCompanyId` to reference the governed company registry. The company registry is shared across Safety, Subcontractors, and Permits modules. Adding a new subcontractor to the registry is not a Safety-module action — it is a registry action that the Safety module consumes.

### 7.2 Procore Future Mapping

The `workerCompanyId` field is designed to accommodate a future external mapping key:
- The company registry schema will include a `procore_vendor_id` field (nullable)
- When the Procore integration is implemented, company registry records will be matched to Procore vendor/company identity via this field
- Safety module records do not need to change — they reference `workerCompanyId`, which will carry the mapping once populated

---

## 8. Locked Decisions Reinforced in This File

| Decision | Reinforced Here |
|---|---|
| 17 — Orientation and acknowledgment records are first-class governed records | §1 |
| 18 — Subcontractor safety-plan submissions are first-class governed records | §2 |
| 31 — Workforce identity: hybrid governed + provisional/ad hoc | §6 |
| 32 — Subcontractor/company identity: governed company registry | §7.1 |
| 33 — Future company mapping supports Procore vendor identity | §7.2 |
| 34 — Certifications/qualifications are their own governed compliance records | §3 |
| 35 — HazCom/SDS compliance is its own governed record family | §4 |
| 36 — Competent-person designations are project-specific governed designation records | §5 |

---

*[← T06](P3-E8-T06-JHA-Pre-Task-Toolbox-Prompt-and-Toolbox-Talk.md) | [Master Index](P3-E8-Safety-Module-Field-Specification.md) | [T08 →](P3-E8-T08-Readiness-Evaluation-Blocker-Matrix-and-Override-Workflow.md)*
