# P3-E5 — Schedule Module: Logic Dependencies and Propagation

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E5-T06 |
| **Parent** | [P3-E5 Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T06: Logic Dependencies and Propagation |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

## 10. Logic Layers and Dependency Model

### 10.1 Logic Layer Enumeration

The module maintains three distinct logic layers. These layers do not overwrite each other.

| Layer | Record Type | Authority | Read-Only? |
|-------|-------------|-----------|------------|
| `SourceCPM` | ImportedRelationshipRecord | Upstream CPM tool | Yes; immutable after import |
| `Scenario` | ScenarioLogicRecord | PM scenario draft | No; editable within scenario |
| `WorkPackage` | WorkPackageLinkRecord | PM/field team | No; governs execution dependencies |

### 10.2 ImportedRelationshipRecord

Captures the CPM logic imported from the source file. Immutable; stored per ScheduleVersionRecord.

| Field | Type | Description |
|-------|------|-------------|
| relationshipId | `string` | UUID |
| versionId | `string` | FK to ScheduleVersionRecord |
| predecessorKey | `string` | externalActivityKey of predecessor |
| successorKey | `string` | externalActivityKey of successor |
| relationshipType | `enum` | `FS` \| `SS` \| `FF` \| `SF` |
| lagHrs | `number` | Lag in hours; negative = lead |
| logicSource | `enum` | `SourceCPM` (always for this record type) |

### 10.3 WorkPackageLinkRecord

Short-interval dependency links created by the field team. Not CPM logic; execution-sequencing constraints.

| Field | Type | Description |
|-------|------|-------------|
| linkId | `string` | UUID |
| projectId | `string` | FK to project |
| predecessorWorkPackageId | `string` | FK to FieldWorkPackage |
| successorWorkPackageId | `string` | FK to FieldWorkPackage |
| linkType | `enum` | `FS` \| `SS` \| `FF` \| `SF` |
| lagDays | `number` | Lag in days |
| promotionEligible | `boolean` | Whether this link may be considered for promotion to scenario logic |
| createdBy | `string` | userId |
| createdAt | `datetime` | Immutable |

### 10.4 Impact Propagation Rules

The module supports **governed native dependency-aware impact propagation**. Propagation is distinct by layer:

| Propagation Type | Basis | Becomes Authoritative When |
|-----------------|-------|---------------------------|
| `SourceSchedulePropagated` | CPM float / logic from imported snapshot | Already authoritative as imported source truth |
| `OperatingLayerProjected` | Commitment date changes + work-package link traversal | Requires PM approval per governed threshold |
| `ScenarioLayerProjected` | Scenario date overrides + scenario logic | Requires scenario promotion approval |

**Business rules:**
- Propagated effects from operating or scenario layers influence analytics and recommendations immediately (informational).
- Propagated effects become authoritative on publication-layer records only when the publication lifecycle is completed.
- Propagation does not silently modify ImportedActivitySnapshots.
- PM is notified via `@hbc/my-work-feed` when operating-layer propagation would create a `ConflictRequiresReview` status on a ManagedCommitmentRecord.

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
