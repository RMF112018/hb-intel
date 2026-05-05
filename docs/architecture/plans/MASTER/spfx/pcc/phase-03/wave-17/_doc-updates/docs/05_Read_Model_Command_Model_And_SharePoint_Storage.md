# 05 — Read Model, Command Model, and SharePoint Storage

## Read Model Contract

Wave 17 must define these read-model routes for a future implementation package:

| Route ID | Path | Client Method | DTO |
|---|---|---|---|
| `site-health` | `/api/pcc/projects/{projectId}/site-health` | `getSiteHealth` | `IPccSiteHealthReadModel` |
| `site-health-findings` | `/api/pcc/projects/{projectId}/site-health-findings` | `getSiteHealthFindings` | `IPccSiteHealthFindingsReadModel` |
| `site-health-template-compliance` | `/api/pcc/projects/{projectId}/site-health-template-compliance` | `getSiteHealthTemplateCompliance` | `IPccSiteHealthTemplateComplianceReadModel` |
| `site-health-provisioning-status` | `/api/pcc/projects/{projectId}/site-health-provisioning-status` | `getSiteHealthProvisioningStatus` | `IPccSiteHealthProvisioningStatusReadModel` |
| `site-health-list-library-compliance` | `/api/pcc/projects/{projectId}/site-health-list-library-compliance` | `getSiteHealthListLibraryCompliance` | `IPccSiteHealthListLibraryComplianceReadModel` |
| `site-health-permission-posture` | `/api/pcc/projects/{projectId}/site-health-permission-posture` | `getSiteHealthPermissionPosture` | `IPccSiteHealthPermissionPostureReadModel` |
| `site-health-settings-health` | `/api/pcc/projects/{projectId}/site-health-settings-health` | `getSiteHealthSettingsHealth` | `IPccSiteHealthSettingsHealthReadModel` |
| `site-health-external-source-health` | `/api/pcc/projects/{projectId}/site-health-external-source-health` | `getSiteHealthExternalSourceHealth` | `IPccSiteHealthExternalSourceHealthReadModel` |
| `site-health-admin-verification` | `/api/pcc/projects/{projectId}/site-health-admin-verification` | `getSiteHealthAdminVerification` | `IPccSiteHealthAdminVerificationReadModel` |
| `site-health-audit-history` | `/api/pcc/projects/{projectId}/site-health-audit-history` | `getSiteHealthAuditHistory` | `IPccSiteHealthAuditHistoryReadModel` |
| `site-health-hbi-context` | `/api/pcc/projects/{projectId}/site-health-hbi-context` | `getSiteHealthHbiContext` | `IPccSiteHealthHbiContextReadModel` |

## Route Rules

- GET only.
- No query serialization of `viewerPersona`.
- `viewerPersona` may pass only as an in-memory fixture envelope value if existing PCC conventions use it.
- Unknown project returns `source-unavailable` with empty project-scoped arrays.
- Backend unavailable returns `backend-unavailable` with empty arrays and warning copy.
- Fixture mode returns `mode: fixture`, `readOnly: true`, and deterministic data.
- No route creates, patches, deletes, approves, suppresses, or repairs records in Wave 17.

## Command Model Contract

Command names may be documented for future gating only:

| Future Command | Purpose | Wave 17 Execution |
|---|---|---|
| `requestSiteHealthReview` | Ask admin/reviewer to evaluate a finding | Not executable |
| `requestSiteHealthRepair` | Create future repair request record | Not executable |
| `verifySiteHealthFinding` | Admin evidence sufficiency review | Not executable |
| `suppressSiteHealthFinding` | Hide accepted risk with audit trail | Not executable |
| `resolveSiteHealthFinding` | Mark finding as resolved after external/manual repair | Not executable |

## Storage Split

| Record Family | HB Central | Project Site | Derived Only |
|---|---:|---:|---:|
| Health check definitions | Yes | No | No |
| Category/severity/status registry | Yes | No | No |
| Desired state references | Yes | Project-specific copy/reference where needed | No |
| Observed state snapshots | No | Yes | Sometimes |
| Health findings | No by default | Yes | Sometimes |
| Evidence references | No by default | Yes | No |
| Repair requests | Optional global rollup | Yes | No |
| Admin verifications | Optional global rollup | Yes | No |
| Site Health audit events | Optional rollup | Yes | No |
| Priority Action candidates | No | Derived/read-model | Yes |
| HBI context | No | Derived/read-model | Yes |

## Candidate SharePoint Lists

### Site Health Check Definitions

- Scope: HB Central
- Purpose: Global check registry defining desired checks, category, severity defaults, read authority, and source module.
- Indexed columns: CheckKey, Category, IsActive, AppliesToModule, TemplateVersion
- Key fields: CheckKey, DisplayName, Category, DefaultSeverity, AppliesToModule, DesiredStateReference, EvidenceRequired, IsActive

### Site Health Snapshots

- Scope: Project site
- Purpose: Timeboxed aggregate health state per project and module source.
- Indexed columns: ProjectId, SnapshotAt, OverallStatus, WorstSeverity, SourceStatus
- Key fields: SnapshotId, ProjectId, SnapshotAt, OverallStatus, WorstSeverity, CheckCountsJson, SourceStatus, LastSuccessfulReadAt

### Site Health Findings

- Scope: Project site
- Purpose: Project-specific health findings queue, including drift, missing configuration, permission mismatch, and stale source findings.
- Indexed columns: ProjectId, Status, Severity, Category, OwnerPersona, DetectedAt, ResolvedAt
- Key fields: FindingId, ProjectId, CheckKey, Category, Severity, Status, Title, Summary, DetectedAt, OwnerPersona, EvidenceBundleId

### Site Health Evidence References

- Scope: Project site
- Purpose: Evidence pointers to observed records without storing secrets or raw tenant-administration objects.
- Indexed columns: ProjectId, FindingId, SourceSystem, ObservedAt, RedactionLevel
- Key fields: EvidenceId, ProjectId, FindingId, SourceSystem, SourceRecordType, SourceRecordId, ObservedAt, Confidence, RedactionLevel, DisplayLabel

### Site Health Repair Requests

- Scope: Project site
- Purpose: Future command-gated repair requests routed to admin verification or Wave 14 approval; no automatic execution.
- Indexed columns: ProjectId, FindingId, RequestStatus, RequestedByPersona, RequestedAt, Wave14CheckpointId
- Key fields: RepairRequestId, ProjectId, FindingId, RequestedAction, RequestStatus, RequestedBy, RequestedAt, AdminVerificationId, Wave14CheckpointId

### Site Health Admin Verifications

- Scope: Project site
- Purpose: Technical verification records that establish evidence sufficiency and repair readiness without executing repair.
- Indexed columns: ProjectId, FindingId, VerificationStatus, VerifierPersona, VerifiedAt
- Key fields: AdminVerificationId, ProjectId, FindingId, VerificationStatus, Verifier, VerifiedAt, EvidenceBundleId, VerificationNotes

### Site Health Audit Events

- Scope: Project site
- Purpose: Business audit trail for Site Health reads, review requests, verification actions, suppressed/resolved states, and unauthorized attempts.
- Indexed columns: ProjectId, EventType, ActorPersona, OccurredAt, RelatedFindingId
- Key fields: AuditEventId, ProjectId, EventType, Actor, ActorPersona, OccurredAt, RelatedFindingId, BeforeStateJson, AfterStateJson, CorrelationId


## SharePoint List Design Rules

- Every operational queue must have indexed filters for `ProjectId`, `Status`, `Severity`, `Category`, and relevant date fields.
- Avoid default views spanning all items.
- Avoid broad lookup/person/managed-metadata sorting in large views.
- Do not use item-level unique permissions as the default isolation mechanism.
- Do not store secrets, raw tokens, or sensitive tenant configuration.
- Store evidence references and safe display labels, not raw secret values.
- All list schema docs must use the standard `docs/reference/sharepoint/list-schemas/pcc/lists/*.md` format.

## Pagination and Threshold Posture

- Findings queue must paginate.
- Default page size: 25.
- Max page size: 100.
- All queue filters must be index-backed.
- Large-history views must default to the current project and recent date range.
- Audit/history views must support date-range filters.
- Avoid all-items scans.
- Use stale-source display instead of aggressive polling.

## Stale Source Behavior

`lastSuccessfulReadAt` and `sourceStatus` must appear on every read model. If data is stale, the UI shows a warning and disables command affordances. Stale data may still be displayed when labeled, but HBI must disclose uncertainty.
