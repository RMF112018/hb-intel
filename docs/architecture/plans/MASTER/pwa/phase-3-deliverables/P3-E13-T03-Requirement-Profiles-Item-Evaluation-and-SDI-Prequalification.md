# P3-E13-T03 — Requirement Profiles, Item Evaluation, and SDI / Prequalification

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E13-T03 |
| **Parent** | [P3-E13 Subcontract Execution Readiness Module](P3-E13-Subcontract-Execution-Readiness-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T03 of 8 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Governed Requirement Profile Model

Requirement items must be generated from governed `RequirementProfile` records. There is no universal fixed 12-item core model in the governing architecture.

### 1.1 Profile authority

| Concern | Owner |
|---|---|
| Profile library definition | Compliance / Risk governance |
| Profile versioning | Compliance / Risk governance |
| Binding logic | Specialist-owned, deterministic, and auditable |
| Ad hoc PM item suppression | Not allowed as governing behavior |

### 1.2 Minimum profile inputs

At minimum, profile selection must be driven by:

- trade,
- scope,
- labor-on-site posture,
- jurisdiction,
- risk class,
- policy conditions,
- insurance posture,
- licensing posture,
- SDI / prequalification posture.

The profile may later expand to include additional governed signals, but these inputs are the minimum expected in Phase 3.

---

## 2. Requirement Generation

When a readiness case is bound to a requirement profile:

1. The case stores the profile identity and version.
2. The module instantiates governed `ReadinessRequirementItem` records.
3. Each item receives its typed metadata, blocking severity, and evidence expectations from the profile.
4. The item set becomes the case-level requirement ledger for that profile version.

Generated items may be renewed or re-evaluated in-case. They are not recreated as a new case unless a material identity change occurs under T02.

---

## 3. `ReadinessRequirementItem`

Each item must carry both artifact state and compliance evaluation state.

### 3.1 Required item fields

| Field | Rule |
|---|---|
| `readinessRequirementItemId` | Immutable UUID |
| `readinessCaseId` | Parent linkage |
| `requirementFamily` | Typed family code |
| `profileRequirementKey` | Stable governed key from the profile |
| `artifactState` | Required |
| `complianceEvaluationState` | Required |
| `blockingSeverity` | Typed blocking posture |
| `responsibleEvaluatorRole` | Typed specialist owner |
| `expiresAt` | Nullable; required for renewable items |
| `renewalStatus` | Typed renewable posture |

### 3.2 Typed metadata expectations

At minimum, items must support typed metadata for:

- insurance coverage / endorsement requirements,
- licensing jurisdiction / class,
- expiration / renewal posture,
- named additional insured or wording requirements where applicable,
- jurisdiction verification detail,
- responsible evaluator role,
- blocking severity.

The profile governs which metadata fields apply to which requirement family.

---

## 4. Artifact Model

`RequirementArtifact` is the linked evidence model for a requirement item. It must support:

- uploaded artifacts,
- external references,
- replacement lineage,
- received timestamps,
- source-system provenance when present.

### 4.1 Artifact state

```typescript
type ArtifactState =
  | 'NOT_PROVIDED'
  | 'REQUESTED'
  | 'RECEIVED_PENDING_REVIEW'
  | 'RECEIVED_ACCEPTED'
  | 'RECEIVED_DEFICIENT'
  | 'REPLACED'
  | 'EXTERNAL_REFERENCE_ONLY'
  | 'NOT_REQUIRED_BY_RULE';
```

Artifact state answers: what evidence has been supplied and what is its receipt posture?

---

## 5. Evaluation Model

`RequirementEvaluation` is the specialist interpretation of the item, not the same thing as artifact receipt.

### 5.1 Compliance evaluation state

```typescript
type ComplianceEvaluationState =
  | 'NOT_STARTED'
  | 'UNDER_REVIEW'
  | 'SATISFIED'
  | 'SATISFIED_WITH_CONDITIONS'
  | 'NOT_REQUIRED_BY_RULE'
  | 'DEFICIENT'
  | 'EXCEPTION_REQUIRED'
  | 'REJECTED';
```

Evaluation state answers: what is the specialist ruling on this requirement?

### 5.2 Governing rule

An item may have:

- an artifact in acceptable receipt state but still be `DEFICIENT`,
- no uploaded artifact but still be `NOT_REQUIRED_BY_RULE`,
- an artifact plus an `EXCEPTION_REQUIRED` ruling,
- a specialist-issued `SATISFIED_WITH_CONDITIONS` ruling without changing the artifact receipt record.

This is why artifact state and evaluation state must stay separate.

---

## 6. Applicability And PM Override Doctrine

Loose PM required-flag suppression is prohibited.

- PM / APM / PA may request a specialist applicability review.
- Only specialist evaluation may resolve an item to `NOT_REQUIRED_BY_RULE`.
- The item remains in the ledger with its ruling and audit trail.
- The requirement set may not be silently shrunk by PM ad hoc edits.

---

## 7. SDI / Prequalification Requirement Family

SDI / prequalification is a governed requirement family, not a binary Compass-only row.

### 7.1 Required valid outcomes

At minimum, the governed outcome family must support:

- `Qualified`
- `NotRequiredByRule`
- `AlternateRiskTreatmentApproved`
- `ExceptionRequired`
- `Rejected`

### 7.2 Meaning of the outcomes

| Outcome | Meaning |
|---|---|
| `Qualified` | Standard governed qualification path satisfied |
| `NotRequiredByRule` | Rule set determines the requirement family does not apply |
| `AlternateRiskTreatmentApproved` | Standard qualification not used, but governed alternate treatment is accepted |
| `ExceptionRequired` | Readiness cannot proceed without an approved exception path |
| `Rejected` | The requirement family fails and blocks readiness |

### 7.3 Future integration posture

Future enterprise or vendor-master prequalification systems may later populate:

- qualification reference status,
- risk ratings,
- history,
- linked evidence,
- advisory flags.

Those systems may influence item generation or evaluation but do not replace the project-level readiness decision issued by this module.
