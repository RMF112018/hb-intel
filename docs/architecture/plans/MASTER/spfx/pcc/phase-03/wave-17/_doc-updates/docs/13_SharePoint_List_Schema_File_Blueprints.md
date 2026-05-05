# 13 — SharePoint List Schema File Blueprints

## Purpose

These blueprints define the exact list schema docs the local agent should create under `docs/reference/sharepoint/list-schemas/pcc/lists/`.


## Site Health Check Definitions

- File: `site-health-check-definitions.md`
- Scope: HB Central
- Purpose: Global check registry defining desired checks, category, severity defaults, read authority, and source module.
- Required indexed columns: CheckKey, Category, IsActive, AppliesToModule, TemplateVersion
- Required key fields: CheckKey, DisplayName, Category, DefaultSeverity, AppliesToModule, DesiredStateReference, EvidenceRequired, IsActive

Required sections in the final list schema doc:

1. Objective
2. List-Level Metadata
3. Field Schema
4. Content Types / Forms / Behavioral Context
5. Relationship Observations
6. Implementation-Relevant Findings
7. Open Questions / Follow-Up Checks

For section 7, do not leave unresolved blanks. If a fact is unavailable, write `Requires local tenant/schema verification before runtime implementation` and keep documentation-only scope.


## Site Health Snapshots

- File: `site-health-snapshots.md`
- Scope: Project site
- Purpose: Timeboxed aggregate health state per project and module source.
- Required indexed columns: ProjectId, SnapshotAt, OverallStatus, WorstSeverity, SourceStatus
- Required key fields: SnapshotId, ProjectId, SnapshotAt, OverallStatus, WorstSeverity, CheckCountsJson, SourceStatus, LastSuccessfulReadAt

Required sections in the final list schema doc:

1. Objective
2. List-Level Metadata
3. Field Schema
4. Content Types / Forms / Behavioral Context
5. Relationship Observations
6. Implementation-Relevant Findings
7. Open Questions / Follow-Up Checks

For section 7, do not leave unresolved blanks. If a fact is unavailable, write `Requires local tenant/schema verification before runtime implementation` and keep documentation-only scope.


## Site Health Findings

- File: `site-health-findings.md`
- Scope: Project site
- Purpose: Project-specific health findings queue, including drift, missing configuration, permission mismatch, and stale source findings.
- Required indexed columns: ProjectId, Status, Severity, Category, OwnerPersona, DetectedAt, ResolvedAt
- Required key fields: FindingId, ProjectId, CheckKey, Category, Severity, Status, Title, Summary, DetectedAt, OwnerPersona, EvidenceBundleId

Required sections in the final list schema doc:

1. Objective
2. List-Level Metadata
3. Field Schema
4. Content Types / Forms / Behavioral Context
5. Relationship Observations
6. Implementation-Relevant Findings
7. Open Questions / Follow-Up Checks

For section 7, do not leave unresolved blanks. If a fact is unavailable, write `Requires local tenant/schema verification before runtime implementation` and keep documentation-only scope.


## Site Health Evidence References

- File: `site-health-evidence-references.md`
- Scope: Project site
- Purpose: Evidence pointers to observed records without storing secrets or raw tenant-administration objects.
- Required indexed columns: ProjectId, FindingId, SourceSystem, ObservedAt, RedactionLevel
- Required key fields: EvidenceId, ProjectId, FindingId, SourceSystem, SourceRecordType, SourceRecordId, ObservedAt, Confidence, RedactionLevel, DisplayLabel

Required sections in the final list schema doc:

1. Objective
2. List-Level Metadata
3. Field Schema
4. Content Types / Forms / Behavioral Context
5. Relationship Observations
6. Implementation-Relevant Findings
7. Open Questions / Follow-Up Checks

For section 7, do not leave unresolved blanks. If a fact is unavailable, write `Requires local tenant/schema verification before runtime implementation` and keep documentation-only scope.


## Site Health Repair Requests

- File: `site-health-repair-requests.md`
- Scope: Project site
- Purpose: Future command-gated repair requests routed to admin verification or Wave 14 approval; no automatic execution.
- Required indexed columns: ProjectId, FindingId, RequestStatus, RequestedByPersona, RequestedAt, Wave14CheckpointId
- Required key fields: RepairRequestId, ProjectId, FindingId, RequestedAction, RequestStatus, RequestedBy, RequestedAt, AdminVerificationId, Wave14CheckpointId

Required sections in the final list schema doc:

1. Objective
2. List-Level Metadata
3. Field Schema
4. Content Types / Forms / Behavioral Context
5. Relationship Observations
6. Implementation-Relevant Findings
7. Open Questions / Follow-Up Checks

For section 7, do not leave unresolved blanks. If a fact is unavailable, write `Requires local tenant/schema verification before runtime implementation` and keep documentation-only scope.


## Site Health Admin Verifications

- File: `site-health-admin-verifications.md`
- Scope: Project site
- Purpose: Technical verification records that establish evidence sufficiency and repair readiness without executing repair.
- Required indexed columns: ProjectId, FindingId, VerificationStatus, VerifierPersona, VerifiedAt
- Required key fields: AdminVerificationId, ProjectId, FindingId, VerificationStatus, Verifier, VerifiedAt, EvidenceBundleId, VerificationNotes

Required sections in the final list schema doc:

1. Objective
2. List-Level Metadata
3. Field Schema
4. Content Types / Forms / Behavioral Context
5. Relationship Observations
6. Implementation-Relevant Findings
7. Open Questions / Follow-Up Checks

For section 7, do not leave unresolved blanks. If a fact is unavailable, write `Requires local tenant/schema verification before runtime implementation` and keep documentation-only scope.


## Site Health Audit Events

- File: `site-health-audit-events.md`
- Scope: Project site
- Purpose: Business audit trail for Site Health reads, review requests, verification actions, suppressed/resolved states, and unauthorized attempts.
- Required indexed columns: ProjectId, EventType, ActorPersona, OccurredAt, RelatedFindingId
- Required key fields: AuditEventId, ProjectId, EventType, Actor, ActorPersona, OccurredAt, RelatedFindingId, BeforeStateJson, AfterStateJson, CorrelationId

Required sections in the final list schema doc:

1. Objective
2. List-Level Metadata
3. Field Schema
4. Content Types / Forms / Behavioral Context
5. Relationship Observations
6. Implementation-Relevant Findings
7. Open Questions / Follow-Up Checks

For section 7, do not leave unresolved blanks. If a fact is unavailable, write `Requires local tenant/schema verification before runtime implementation` and keep documentation-only scope.
