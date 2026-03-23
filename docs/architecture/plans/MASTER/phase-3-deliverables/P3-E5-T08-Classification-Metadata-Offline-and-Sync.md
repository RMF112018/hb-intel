# P3-E5 — Schedule Module: Classification Metadata Offline and Sync

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5-T08 |
| **Parent** | [P3-E5 Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T08: Classification Metadata Offline and Sync |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

## 14. Classification and Metadata Framework

### 14.1 Governed Classification Framework

Source metadata is normalized on import and stored in classification fields on ImportedActivitySnapshot (§1.4). Classification mappings are Governed.

| Classification Dimension | Source | Governed Mapping |
|-------------------------|--------|-----------------|
| WBS code/name | P6 wbs_id / wbs_name | Preserved; mapped to HB WBS structure if configured |
| Activity codes | P6 activity code types | Mapped to governed code categories per §14.2 |
| UDF values | P6 user-defined fields | Mapped to typed classification fields per §14.2 |
| Trade code | Activity code or UDF | Governed mapping table |
| Phase code | Activity code or UDF | Governed mapping table |
| Area code | Activity code, UDF, or location | Governed mapping table |
| Contract milestone flag | Activity code or UDF | Boolean flag per governed rule |
| Responsibility | Resource or UDF | Mapped to HB user/role |

### 14.2 ActivityCodeValue and UDFValue Storage

Activity codes and UDFs are preserved verbatim in `activityCodeValues` and `udfValues` arrays (§1.4). The governed mapping layer derives `tradeCode`, `phaseCode`, `areaCode`, and `primaryResponsibleUserId` from these raw values via configurable rules administered by the Manager of Operational Excellence.

### 14.3 Classification Usage Rules

Classifications must be available for:
- Filtering and grouping in all module views
- Analytics segmentation (e.g., float by trade, slippage by phase)
- Work-package decomposition default population
- Visibility policy enforcement (§16)
- Recommendation logic input
- Roll-up dimension selection

---


## 15. Offline and Sync Model

Field execution is **full offline-first**, not cache-only. Users may create and edit field records when connectivity is absent. Changes are stored as durable local intents and replayed on reconnection.

### 15.1 IntentRecord

Each offline operation creates an immutable local intent. Intents are never deleted once created (audit trail). They are marked `Replayed` on successful sync.

| Field | Type | Description |
|-------|------|-------------|
| intentId | `string` | UUID; device-local |
| deviceId | `string` | Device identifier |
| userId | `string` | userId who created the intent |
| createdAt | `datetime` | Device-local timestamp (immutable) |
| operationType | `enum` | `Create` \| `Update` \| `StatusChange` \| `LinkArtifact` |
| recordType | `enum` | `FieldWorkPackage` \| `CommitmentRecord` \| `BlockerRecord` \| `ReadinessRecord` \| `ProgressClaimRecord` \| `AcknowledgementRecord` \| `LookAheadPlan` |
| targetId | `string` | FK to the record being mutated (may be client-generated for creates) |
| payload | `object` | Full field values for the operation |
| replayStatus | `enum` | `Pending` \| `Queued` \| `Replayed` \| `ConflictRequiresReview` \| `Failed` |
| replayedAt | `datetime` | Server-side sync timestamp |
| conflictDetails | `object` | If conflict: the conflicting server state at time of replay |
| retryCount | `integer` | Number of replay attempts |

### 15.2 Sync States

All field-layer records carry a `syncStatus` field with the following lifecycle:

| Status | Meaning |
|--------|---------|
| `SavedLocally` | Intent created on device; not yet in sync queue |
| `QueuedToSync` | Intent queued for server replay |
| `Synced` | Replay confirmed; server state matches intent |
| `ConflictRequiresReview` | Replay encountered a conflict (e.g., record modified on server after device went offline) |

### 15.3 Conflict Resolution Rules

| Conflict Type | Resolution |
|--------------|------------|
| Non-governed field update (e.g., free-text note) | Last-write-wins; both values preserved in audit |
| Status change on governed record (e.g., BlockerRecord.status) | Server state wins; user notified of conflict; intent preserved for manual review |
| Commitment date change on record with PendingApproval status | Conflict routed to PM for manual reconciliation |
| Create with client-generated ID | ID regenerated server-side if collision; client map updated |

Conflict routing uses `@hbc/session-state` for local persistence and conflict queue management. PM is notified via `@hbc/my-work-feed` when conflicts require review.

---


## 16. Visibility, Participation, and Access Control

### 16.1 Visibility Policy Model

Visibility is policy-driven by record type, workflow state, participant role, relationship context, and configured policy. All visibility policies are Governed.

| Policy Dimension | Governing Factor | Configured By |
|-----------------|-----------------|---------------|
| Internal vs external participant access | ParticipantRole.isExternal | Manager of Operational Excellence |
| Live working state vs published state | Publication.lifecycleStatus | System-enforced |
| Sensitive internal signals | Record.sensitivityClass | Manager of Operational Excellence |
| Field record visibility by trade | ParticipantRole.tradeCodes | Project-level (within governed limits) |
| Recommendation visibility | RecommendationRecord.visibilityPolicy | Manager of Operational Excellence |
| Confidence score visibility | ConfidenceRecord.visibilityPolicy | Manager of Operational Excellence |

**Hard rules:**
- External participants never see `Draft` or `ReadyForReview` publication records.
- External participants never see ConfidenceRecords or RecommendationRecords unless explicitly enabled by Governed policy.
- Executive review (`@hbc/field-annotations`) operates exclusively against `Published` publication records.
- PM-owned draft commitments and working scenarios are never visible to PER (Portfolio Executive Reviewer).

### 16.2 ExternalParticipantRecord

| Field | Type | Description |
|-------|------|-------------|
| participantId | `string` | UUID |
| projectId | `string` | FK to project |
| externalUserId | `string` | External user identifier |
| organizationName | `string` | Participant's organization |
| permittedWorkflows | `enum[]` | `FieldCommitment` \| `BlockerResolution` \| `ReadinessConfirmation` \| `LookAheadReview` |
| permittedRecordTypes | `enum[]` | Record types this participant may see |
| sensitivityClassExclusions | `string[]` | Sensitivity class codes this participant may not see |
| auditEnabled | `boolean` | Always true; immutable |
| approvedBy | `string` | userId who approved this participant |
| approvedAt | `datetime` | Immutable |
| expiresAt | `datetime` | Required expiry date |

---


---

## Navigation

| File | Contents |
|------|---------|
| [P3-E5.md](P3-E5-Schedule-Module-Field-Specification.md) | Master index — Purpose, Operating Model, Ownership Maturity |
| [P3-E5-T01-Source-Identity-and-Versioning.md](P3-E5-T01-Source-Identity-and-Versioning.md) | T01: §1 Identity/Versioning/Import and §17 Dual-Calendar Model |
| [P3-E5-T02-Dual-Truth-Commitments-and-Milestones.md](P3-E5-T02-Dual-Truth-Commitments-and-Milestones.md) | T02: §2 Dual-Truth/Operating Layer and §4 Milestone Working Model |
| [P3-E5-T03-Publication-Layer.md](P3-E5-T03-Publication-Layer.md) | T03: §3 Published Forecast Layer and §19 Schedule Summary Projection |
| [P3-E5-T04-Scenario-Branch-Model.md](P3-E5-T04-Scenario-Branch-Model.md) | T04: §5 Scenario Branch Model |
| [P3-E5-T05-Field-Execution-Layer.md](P3-E5-T05-Field-Execution-Layer.md) | T05: §6 Field Execution, §7 Acknowledgement, §8 Progress/Verification, §9 Roll-Up |
| [P3-E5-T06-Logic-Dependencies-and-Propagation.md](P3-E5-T06-Logic-Dependencies-and-Propagation.md) | T06: §10 Logic Layers and Dependency Model |
| [P3-E5-T07-Analytics-Intelligence-and-Grading.md](P3-E5-T07-Analytics-Intelligence-and-Grading.md) | T07: §11 Analytics/Grading/Confidence, §12 Recommendations, §13 Causation Taxonomy |
| [P3-E5-T08-Classification-Metadata-Offline-and-Sync.md](P3-E5-T08-Classification-Metadata-Offline-and-Sync.md) | T08: §14 Classification/Metadata, §15 Offline/Sync, §16 Visibility/Participation |
| [P3-E5-T09-Platform-Integration-and-Governance.md](P3-E5-T09-Platform-Integration-and-Governance.md) | T09: §18 Cross-Platform Workflow/Shared Packages, §20 Governance/Policy, §23 Executive Review |
| [P3-E5-T10-Business-Rules-Capabilities-and-Reference.md](P3-E5-T10-Business-Rules-Capabilities-and-Reference.md) | T10: §21 Business Rules, §22 Required Capabilities, §27 Status Enumerations, §28 Field Index |
| [P3-E5-T11-Implementation-and-Acceptance.md](P3-E5-T11-Implementation-and-Acceptance.md) | T11: §24 Implementation Guide, §25 Acceptance Gate, §26 Remaining Blockers |
