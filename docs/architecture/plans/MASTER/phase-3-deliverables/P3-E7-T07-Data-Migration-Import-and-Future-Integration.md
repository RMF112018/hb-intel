# P3-E7-T07 — Data Migration, Import, and Future Integration

**Doc ID:** P3-E7-T07
**Parent:** P3-E7 Permits Module
**Phase:** 3
**Workstream:** E — Data Models and Field Specifications
**Part:** 7 of 8
**Owner:** Architecture
**Last Updated:** 2026-03-23

---

## 1. Migration from Flat IPermit Model

### 1.1 Migration Scope

The prior `IPermit` model is a flat record with nested `IInspection[]` and `IInspectionIssue[]` arrays. All existing permit data must be migrated to the new multi-record architecture before the new module is activated in production.

The migration is a **one-time, non-reversible** transformation. A rollback path must be maintained until post-migration validation is complete.

### 1.2 Migration Mapping

#### IPermit → IssuedPermit

| Source Field (IPermit) | Target Field (IIssuedPermit) | Notes |
|---|---|---|
| `id` | `issuedPermitId` | Preserve as UUID |
| `project_id` | `projectId` | Type coercion: number → string |
| `number` | `permitNumber` | Direct |
| `type` | `permitType` | Map to new `PermitType` type union |
| `status` | `currentStatus` | Map via status mapping table (§1.3) |
| `authority` | `jurisdictionName` | Direct |
| `authorityContact.name` | `jurisdictionContact.contactName` | Renamed field |
| `authorityContact.phone` | `jurisdictionContact.phone` | Optional; carry forward |
| `authorityContact.email` | `jurisdictionContact.email` | Optional; carry forward |
| `authorityContact.address` | `jurisdictionContact.address` | Optional; carry forward |
| `applicationDate` | `applicationDate` | Direct |
| `approvalDate` | `issuanceDate` | Rename; treat as issuance date |
| `expirationDate` | `expirationDate` | Direct |
| `renewalDate` | `renewalDate` | Direct; optional |
| `cost` | `permitFeeAmount` | Rename |
| `bondAmount` | `bondAmount` | Direct |
| `description` | `description` | Direct |
| `comments` | (carry to notes on ISSUED action) | Store as notes on synthetic lifecycle action |
| `conditions` | `conditions` | Direct (string[]) |
| `tags` | `tags` | Direct (string[]) |
| `priority` | `tags` (append "priority:high/medium/low") | No direct field in new model; use tags |
| `expirationRisk` (calculated) | Recalculated on migration | Do not carry; derive fresh |
| `daysToExpiration` (calculated) | Recalculated on migration | Do not carry; derive fresh |

**Defaults applied during migration:**
- `threadRelationshipType = 'STANDALONE'` (no thread data in prior model)
- `threadRootPermitId = null`, `parentPermitId = null`
- `accountableRole = 'PROJECT_MANAGER'` (default; PM to review post-migration)
- `currentResponsiblePartyId` = project PM user ID (from project record)
- `watcherPartyIds = []`

#### IPermit → PermitLifecycleAction (Synthetic ISSUED action)

For every migrated permit, a synthetic `PermitLifecycleAction` is created to initialize the audit trail:

```typescript
{
  actionType: 'ISSUED',
  actionDate: permit.applicationDate,  // best available date
  previousStatus: null,                 // creation event
  newStatus: mappedCurrentStatus,
  performedByUserId: 'MIGRATION_SYSTEM',
  performedByName: 'Data Migration',
  performedByRole: 'system',
  notes: `Migrated from legacy IPermit model. Original comments: ${permit.comments}`,
  evidenceRecordIds: [],
  requiresAcknowledgment: false
}
```

#### IInspection → InspectionVisit

| Source Field (IInspection) | Target Field (IInspectionVisit) | Notes |
|---|---|---|
| `id` | `visitId` | Preserve UUID |
| `permitId` | `issuedPermitId` | Direct |
| `type` | (no direct field) | Store in `inspectorNotes` header |
| `scheduledDate` | `scheduledDate` | Direct |
| `completedDate` | `completedDate` | Direct |
| `inspector` | `inspectorName` | Direct |
| `inspectorContact.phone` | `inspectorContact.phone` | Direct |
| `inspectorContact.email` | `inspectorContact.email` | Direct |
| `inspectorContact.badge` | `inspectorContact.badgeNumber` | Rename |
| `result` | `result` | Map via result mapping table (§1.4) |
| `complianceScore` | (dropped) | Manual numeric score — not carried |
| `comments` | `inspectorNotes` | Rename |
| `resolutionNotes` | `internalNotes` | Rename |
| `followUpRequired` | `followUpRequired` | Direct |
| `duration` | `durationMinutes` | Direct |
| `createdAt` | `createdAt` | Direct |
| `updatedAt` | `updatedAt` | Direct |

**No linked checkpoint:** Migrated visits have `linkedCheckpointId = undefined`. PM team to manually link visits to checkpoints post-migration where identifiable.

**Responsibility defaults on visit:**
- `currentResponsiblePartyId` = project PM user ID
- `currentResponsiblePartyType = 'USER'`

#### IInspectionIssue → InspectionDeficiency

| Source Field (IInspectionIssue) | Target Field (IInspectionDeficiency) | Notes |
|---|---|---|
| `id` | `deficiencyId` | Preserve UUID |
| (parent inspection) | `visitId` | Set from parent `IInspection.id` |
| (parent permit) | `issuedPermitId` | Set from parent chain |
| `description` | `description` | Direct |
| `severity` | `severity` | Map to new `DeficiencySeverity`; HIGH/MEDIUM carry; no LOW in old model |
| `resolved` | `resolutionStatus` | `true → RESOLVED`; `false → OPEN` |
| `resolutionNotes` | `resolutionNotes` | Direct; required if `resolutionStatus = RESOLVED` |

**New required fields with defaults:**
- `correctiveActionRequired = 'See resolution notes'` (placeholder; PM to update)
- `requiresReinspection = false` (default; team to update where applicable)
- `createdByUserId = 'MIGRATION_SYSTEM'`

### 1.3 Status Mapping (IPermit.status → IssuedPermitStatus)

| Old Status | New Status | Notes |
|---|---|---|
| `pending` | `ACTIVE` | Old pending treated as active pre-approval |
| `approved` | `ACTIVE` | Standard active state |
| `renewed` | `RENEWED` | Carry forward |
| `expired` | `EXPIRED` | Carry forward |
| `rejected` | `REJECTED` | Carry forward |

### 1.4 Result Mapping

#### InspectionResult → InspectionVisitResult

| Old Result | New Result |
|---|---|
| `passed` | `PASSED` |
| `conditional` | `PASSED_WITH_CONDITIONS` |
| `failed` | `FAILED` |
| `pending` | `PENDING` |

#### RequiredInspectionResult (unchanged except naming)

| Old | New |
|---|---|
| `Pass` | `PASS` |
| `Fail` | `FAIL` |
| `NA` | `NOT_APPLICABLE` |
| `Pending` | `PENDING` |

### 1.5 IRequiredInspectionRecord → RequiredInspectionCheckpoint

| Source Field | Target Field | Notes |
|---|---|---|
| `inspectionId` | `checkpointId` | Preserve UUID |
| `projectId` | `projectId` | Direct |
| `permitId` | `issuedPermitId` | Direct |
| `inspectionName` | `checkpointName` | Direct |
| `codeReference` | `codeReference` | Direct |
| `dateCalledIn` | `dateCalledIn` | Direct |
| `result` | `currentResult` | Map via result mapping above |
| `comment` | (store in `checkpointName` note) | No direct notes field; PM to review |
| `verifiedOnline` | `verifiedOnline` | Direct |
| `sequence` | `sequence` | Direct |

**Defaults:**
- `status` derived from `currentResult` (PASS → PASSED, FAIL → FAILED, PENDING → NOT_SCHEDULED, NA → NOT_APPLICABLE)
- `isBlockingCloseout = true` (conservative default; team to review)
- `blockedByCheckpointIds = []`
- `linkedInspectionVisitIds = []` (no linkage in prior model)

### 1.6 Migration Validation Checklist

Before cutover, verify:
- [ ] All prior `IPermit` records have a corresponding `IssuedPermit` record
- [ ] All prior `IInspection` records have a corresponding `InspectionVisit` record
- [ ] All prior `IInspectionIssue` records have a corresponding `InspectionDeficiency` record
- [ ] All prior `IRequiredInspectionRecord` records have a corresponding `RequiredInspectionCheckpoint`
- [ ] Each `IssuedPermit` has exactly one synthetic `ISSUED` `PermitLifecycleAction`
- [ ] `complianceScore` field is absent from all migrated records
- [ ] Health tiers are recalculated for all migrated permits
- [ ] Work queue items are generated where applicable (expiring permits, open deficiencies)

---

## 2. Required Inspections Import Workflow

See T04 §5 for the detailed xlsx import specification. This section covers the operational process.

### 2.1 Import Entry Points

1. **Permit Detail View** → "Required Inspections" section → "Import from Template" button
2. **Bulk import** (future): batch upload across multiple permits via admin panel

### 2.2 Idempotency and Re-import

If checkpoints already exist for a permit when an import is initiated:
- The system warns: "N checkpoints already exist for this permit"
- User may choose: Append (add new), Replace (delete existing and re-import), or Cancel
- Replace requires PM-level authorization
- All-or-nothing semantics apply regardless of choice

### 2.3 Import Result Display

After successful import, a summary is shown:
- Total rows processed
- Checkpoints created
- Rows skipped (if any, with reason)
- Permits where checkpoints were linked (if multi-permit import)

---

## 3. PermitEvidenceRecord Upload

### 3.1 Upload UX

Evidence is uploaded from:
- Permit Detail View → Evidence section → "Upload Evidence" button
- Inspection Log → Deficiency row → "Attach Evidence" button (auto-links to visit)
- Lifecycle Action modal → "Attach Supporting Document" (auto-links to action)

### 3.2 File Handling

- Supported types: PDF, JPG, PNG, DOCX, XLSX (extensible)
- Maximum file size: 50 MB per file (configurable)
- Storage: files stored in project document storage; `PermitEvidenceRecord.storageUri` holds the reference
- File names are preserved as uploaded; deduplication is user responsibility
- Files are not deleted when `PermitEvidenceRecord` is deleted (soft-reference model)

### 3.3 Supported Evidence Types

See T02 §8.3 for the `PermitEvidenceType` enum. Required fields on upload:
- `evidenceType` — must select from enum
- `title` — required
- `description` — optional but recommended for certificates and violation notices

---

## 4. Versioned Record Audit Trail (@hbc/versioned-record)

`@hbc/versioned-record` provides an immutable audit trail for `IssuedPermit` field changes (separate from `PermitLifecycleAction` which tracks status transitions).

### 4.1 Fields Tracked by Versioned Record

| Field | Reason for Tracking |
|---|---|
| `expirationDate` | Renewal date changes are material; history matters for compliance |
| `jurisdictionContact` | Contact changes affect who owns the relationship |
| `permitFeeAmount`, `bondAmount` | Financial amounts; audit-sensitive |
| `conditions` | Jurisdiction conditions may be amended |
| `description` | Material changes to permit scope |
| `accountableRole`, `currentResponsiblePartyId` | Accountability chain changes |

### 4.2 Versioned Record Access

- Full version history is accessible from the Permit Detail View → Lifecycle History section
- Each version snapshot shows: changed field, old value, new value, changed by, changed at
- Version history is read-only; no version rollback capability in Phase 3

---

## 5. Future Integration Path (Jurisdiction API)

Phase 3 delivers manual data entry and xlsx import. Future phases may add direct jurisdiction system integration.

### 5.1 Anticipated Integration Points

| Integration | Description | Phase |
|---|---|---|
| Jurisdiction portal status sync | Pull permit status updates from jurisdiction API | Future |
| Inspection scheduling API | Submit inspection requests directly to jurisdiction | Future |
| Electronic permit issuance | Receive issued permit documents automatically | Future |
| Violation notice sync | Pull violation notices from jurisdiction system | Future |

### 5.2 Design Constraints for Future Readiness

To avoid future re-migration, the current model accommodates future integration with these design choices:
- `jurisdictionContact.portalUrl` — stored now for future API endpoint derivation
- `PermitApplication.trackingNumber` — captures jurisdiction tracking number if available
- `PermitLifecycleAction.jurisdictionReferenceNumber` — external reference from jurisdiction system
- `PermitEvidenceRecord.storageUri` — URI format chosen to be replaceable with jurisdiction document API URL

---

*[← T06](P3-E7-T06-UX-Surface-Operational-Views-and-Reporting.md) | [Master Index](P3-E7-Permits-Module-Field-Specification.md) | [T08 →](P3-E7-T08-Implementation-and-Acceptance.md)*
