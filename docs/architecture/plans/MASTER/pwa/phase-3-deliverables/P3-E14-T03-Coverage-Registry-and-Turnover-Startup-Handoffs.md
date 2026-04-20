# P3-E14-T03 — Coverage Registry, Turnover, and Startup Handoffs

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E14-T03 |
| **Parent** | [P3-E14 Project Warranty Module](P3-E14-Project-Warranty-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T03 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Coverage Registry Purpose

The coverage registry is the authoritative inventory of **what is under warranty for a given project, who is responsible for each coverage scope, and for how long each commitment runs.** It is not a document folder. It is a structured, queryable record set that enables case routing, expiration management, and upstream/downstream continuity.

Every `WarrantyCase` must be anchored to a `WarrantyCoverageItem`. Cases may not be created in isolation — they must have a coverage claim as their starting point. This is the fundamental structural constraint that makes the Warranty module an operating surface rather than a generic issue tracker.

The registry is populated at project turnover from three sources: Closeout turnover packages, Startup commissioning records, and manual PM entry for coverage items not captured by either automated source.

---

## 2. Coverage Layer Taxonomy

### 2.1 The three layers

| Layer | What it covers | Responsible party type | Typical term |
|---|---|---|---|
| **Product** | Manufacturer warranty on specific equipment, materials, or assemblies installed on the project | Manufacturer or supplier | Per product spec; often 1–10 years |
| **Labor** | Subcontractor warranty on their installed workmanship — the quality and durability of how work was performed | Subcontractor legal entity | Typically 1 year from substantial completion |
| **System** | Warranty on an integrated building system that spans multiple scopes or vendors — HVAC, fire protection, building envelope, etc. | Lead sub, GC, or system integrator | Per contract; often 1–2 years |

### 2.2 Coverage scope labels

The `coverageScope` field on `IWarrantyCoverageItem` uses a governed label taxonomy. These are not free-form strings. The following base taxonomy applies; project-specific variants may be added by the PM within the layer classification.

**Product layer scopes (examples):**

| Scope label | Description |
|---|---|
| `Equipment.HVAC-AHU-{tag}` | Air handling unit by equipment tag |
| `Equipment.Boiler-{tag}` | Boiler by equipment tag |
| `Equipment.Generator-{tag}` | Generator by equipment tag |
| `Equipment.Elevator-{tag}` | Elevator by equipment tag |
| `Material.Roofing-Membrane` | Roofing membrane product warranty |
| `Material.Window-Glazing` | Window and glazing product warranty |
| `Material.Waterproofing-Below-Grade` | Below-grade waterproofing product warranty |

**Labor layer scopes (examples):**

| Scope label | Description |
|---|---|
| `Labor.Concrete` | Concrete placement and finishing |
| `Labor.Framing-Exterior` | Exterior framing and sheathing |
| `Labor.Roofing` | Roofing installation labor |
| `Labor.Plumbing` | Plumbing rough-in and finish |
| `Labor.Mechanical-HVAC` | Mechanical and HVAC installation |
| `Labor.Electrical` | Electrical rough-in and finish |
| `Labor.Drywall-Finish` | Drywall and finish work |
| `Labor.Flooring` | Flooring installation |
| `Labor.Painting` | Painting and finishing |
| `Labor.Glazing` | Glazing and curtainwall installation |

**System layer scopes (examples):**

| Scope label | Description |
|---|---|
| `System.HVAC-Building` | Building-wide HVAC system (controls + equipment + ductwork) |
| `System.Fire-Protection` | Fire suppression and alarm system |
| `System.Building-Envelope` | Envelope — façade, windows, roofing as an integrated system |
| `System.Plumbing-Domestic` | Domestic water system (hot + cold + distribution) |
| `System.Electrical-Distribution` | Electrical distribution from service entry through panels |
| `System.Low-Voltage` | Low-voltage systems — security, AV, data |

### 2.3 Taxonomy governance

The base taxonomy above is governed. New scope labels must follow the `{Layer}.{Category}-{Qualifier}` format. PM-created custom labels are allowed for project-specific scopes but must be classified within one of the three layers. Unclassified coverage items may not be promoted to `Active`.

---

## 3. Asset, System, and Location Anchoring

### 3.1 Why anchoring matters

A `WarrantyCoverageItem` without an anchor is an incomplete record. "HVAC warranty" is not actionable — "HVAC AHU-3, Level 4, North Wing" is. The anchoring model ties coverage items to physical referents so that when a case is filed, the system can validate that the location of the defect aligns with the coverage scope.

Anchoring is also the mechanism for relating coverage items to Startup commissioning records and Closeout asset schedules — both of which use the same physical referent keys.

### 3.2 Anchor types

```typescript
interface IWarrantyLocationRef {
  // Physical location anchor — where is this coverage applicable?
  buildingRef: string | null;        // building identifier (multi-building projects)
  floor: string | null;              // floor / level label
  zone: string | null;               // zone, wing, or quadrant
  unit: string | null;               // unit / suite / apartment (residential)
  space: string | null;              // specific room, corridor, or exterior element
  description: string;               // human-readable location description (required)
}

interface IWarrantySystemRef {
  // Named building system anchor — which system does this coverage apply to?
  systemKey: string;                 // from System layer taxonomy (e.g., 'System.HVAC-Building')
  systemDisplayName: string;
  subSystemRef: string | null;       // sub-system qualifier (e.g., 'Loop-A', 'Zone-3')
}

interface IWarrantyAssetRef {
  // Specific equipment or asset anchor
  assetTag: string;                  // equipment tag from project equipment register
  assetDisplayName: string;          // human-readable name (e.g., 'Air Handling Unit AHU-3')
  assetCategory: string;             // equipment category from Startup equipment register
  startupEquipmentRecordId: string | null; // FK to Startup equipment record (P3-E11) if available
  closeoutAssetScheduleId: string | null;  // FK to Closeout O&M asset schedule if available
}
```

### 3.3 Anchoring requirements by coverage layer

| Layer | Location ref | System ref | Asset ref |
|---|---|---|---|
| Product | Recommended | Required for equipment | Required for equipment; optional for materials |
| Labor | Required | Optional | Optional |
| System | Optional | Required | Not applicable (system-level) |

A coverage item where the required anchors are absent is flagged as `isMetadataComplete: false` and remains in `Draft` status until the PM supplies the missing anchor data.

---

## 4. Coverage Item Lifecycle and Metadata Completeness

### 4.1 Coverage item lifecycle

```text
DRAFT
  │ PM completes required metadata
  │ (scope, responsible party, dates, required anchors)
  ▼
ACTIVE ──── (daily expiration sweep) ──── EXPIRED
  │
  │ PM/PX explicit void
  ▼
VOIDED
```

A coverage item may not be the anchor for a `WarrantyCase` while in `Draft` status. PMs who attempt to open a case against an incomplete coverage item receive a "coverage metadata incomplete" advisory with the specific missing fields.

### 4.2 Metadata completeness gates

A coverage item must have all of the following before `Active` promotion:

- `coverageLayer`, `coverageScope` — within governed taxonomy
- `responsiblePartyId`, `responsiblePartyName` — resolved against company/vendor registry
- `warrantyStartDate`, `warrantyEndDate` — valid ISO dates; start before end; start on or after project substantial completion date
- Layer-appropriate anchors (per §3.3 above)
- At least one of: `closeoutTurnoverRef`, `startupCommissioningRef`, or `sourceHandoff = Manual` with PM confirmation

### 4.3 Draft coverage advisory

When a project has active warranty cases but one or more coverage items remain in `Draft`, the canvas tile surfaces a "Coverage registry incomplete" advisory and the Work Queue routes a task to the PM to complete missing coverage metadata. This is not a blocker on existing cases — it is an informational advisory to ensure the registry reflects full coverage truth.

---

## 5. Turnover Package Linkage (Closeout → Warranty)

### 5.1 What Closeout owns

Closeout (P3-E10) assembles and owns the turnover package — the structured set of O&M manuals, warranty certificates, commissioning reports, as-built documents, and owner training records delivered to the owner at project close. Closeout is the source of warranty certificate documents.

Warranty does not re-author or duplicate Closeout records. Warranty consumes Closeout's turnover artifacts as linked references.

### 5.2 Closeout turnover reference model

```typescript
interface ICloseoutTurnoverRef {
  closeoutTurnoverPackageId: string;    // FK to Closeout turnover package record
  closeoutTurnoverSectionId: string;   // FK to specific section or artifact within the package
  turnoverArtifactType: CloseoutTurnoverArtifactType; // WarrantyCertificate | OmManual | CommissioningReport | AsBuilt
  artifactDescription: string;         // human-readable description of the linked artifact
}

enum CloseoutTurnoverArtifactType {
  WarrantyCertificate = 'WarrantyCertificate',
  OmManual = 'OmManual',
  CommissioningReport = 'CommissioningReport',
  AsBuilt = 'AsBuilt',
}
```

### 5.3 Closeout-to-Warranty handoff flow

The handoff is a PM-mediated process, not an automated push. When Closeout reaches the turnover-package-complete milestone:

1. Closeout surfaces the assembled turnover package with warranty certificate records, equipment schedules, and O&M artifact links.
2. The PM opens the Warranty module and registers coverage items, using Closeout turnover records as source references for each item.
3. For each coverage item registered, the PM populates `closeoutTurnoverRef` pointing to the specific certificate or turnover section governing that coverage.
4. The PM promotes coverage items from `Draft` to `Active`.

### 5.4 Missing turnover coverage advisory

When a project is in the warranty period and has no coverage items registered (or has only items in `Draft`), the Warranty canvas tile and Health spine surface a "Coverage registry not established" advisory. This is distinct from a health score degradation — it is a setup-state advisory that persists until the PM has registered and activated at least one coverage item.

If warranty certificates are missing from the Closeout turnover package, the PM may still register coverage items manually (`sourceHandoff = Manual`) with a PM-entered description of the coverage commitment. Manual items remain valid for case management. The missing certificate is noted in `metadataGaps` on the coverage item.

---

## 6. Startup and Commissioning Linkage (Startup → Warranty)

### 6.1 What Startup owns

Startup (P3-E11) owns the commissioning and startup-readiness trail: whether building systems were started, tested, and accepted before handover. Startup records the evidence that systems were operating correctly as of the turnover date — establishing the baseline against which warranty claims on those systems are evaluated.

### 6.2 Startup commissioning reference model

```typescript
interface IStartupCommissioningRef {
  startupProjectId: string;             // FK to Startup module project record
  commissioningRecordId: string;        // FK to specific commissioning record in Startup
  commissionedSystemKey: string;        // matches IWarrantySystemRef.systemKey
  commissionedAssetTag: string | null;  // matches IWarrantyAssetRef.assetTag (if equipment-specific)
  commissioningCompletedAt: string;     // ISO datetime (from Startup record)
  commissioningStatus: StartupCommissioningStatus; // Accepted | AcceptedWithConditions | Deferred
}

enum StartupCommissioningStatus {
  Accepted = 'Accepted',
  AcceptedWithConditions = 'AcceptedWithConditions',
  Deferred = 'Deferred',   // system was not formally commissioned at turnover
}
```

### 6.3 Startup-to-Warranty handoff flow

For system and equipment coverage items (`coverageLayer = System` or coverage items with `assetRef` populated):

1. The PM reviews Startup's commissioning records for the relevant systems.
2. When registering the coverage item in Warranty, the PM populates `startupCommissioningRef` pointing to the Startup commissioning record.
3. The commissioning status is surfaced on the coverage item detail and on case detail when a case is filed against that coverage item.

A coverage item whose `startupCommissioningRef.commissioningStatus = Deferred` receives a flag: "System was not formally commissioned at turnover — warranty scope may be limited." This is informational only — it does not block case creation.

### 6.4 Uncommissioned systems and warranty scope

When a case is filed against a system coverage item that was not formally commissioned (`commissioningStatus = Deferred`), the PM making the coverage decision receives an advisory: "This system was not formally commissioned at turnover per Startup record [reference]. Coverage determination should account for this." The coverage decision is still PM's to make — the advisory surfaces the relevant context.

---

## 7. Manual Coverage Registration

When coverage items are not sourced from Closeout or Startup records, PMs register them manually. Manual registration is the expected path for:

- Manufacturer product warranties not separately captured in the Closeout turnover package
- Structural warranties that are GC-level obligations not tied to a specific sub
- Coverage items identified during the warranty period that were not registered at turnover
- Projects activated before Closeout or Startup integration is live in this release

Manual items must still satisfy the metadata completeness gates in §4.2. The `sourceHandoff = Manual` designation and PM confirmation substitute for the external source reference.

---

## 8. How the Registry Avoids Becoming a Document Repository

This distinction is architecturally important. A document repository answers "what documents exist?" The coverage registry answers "what is covered, by whom, and for how long — and against which of those commitments do open cases sit?"

The structural guards are:

1. **Coverage items are queryable records, not file containers.** Warranty certificates, O&M manuals, and commissioning reports are `closeoutTurnoverRef` or `startupCommissioningRef` pointers — linked references, not embedded documents. The documents live in their source systems. The registry holds the typed metadata that makes coverage searchable.

2. **Cases require a coverage anchor.** A `WarrantyCase` must reference a `WarrantyCoverageItem`. The registry is not optional backstory — it is the precondition for case management. This forces the PM to maintain the registry as a live operating record, not as a one-time filing task.

3. **Coverage item metadata is typed and filterable.** The PM can query: "show all coverage expiring in the next 90 days," "show all HVAC system coverage with open cases," "show all labor coverage where the responsible party is [sub name]." A document repository cannot answer these questions. A typed, indexed registry can.

4. **Missing metadata is surfaced as operational friction.** Draft coverage items, missing anchors, and absent source references generate advisory signals that appear in the Work Queue and canvas tile. The system creates operational pressure to maintain registry completeness — not through hard blocks, but through visible advisory posture.

---

## 9. Coverage Expiration Management

### 9.1 Daily expiration sweep

The system performs a daily expiration sweep. When `warrantyEndDate` passes, a coverage item transitions from `Active` to `Expired` and a `WarrantyCoverageExpiration` record is system-generated. The expiration record is read-only and immutable.

### 9.2 Expiration advisory window

Coverage items within `expirationAdvisoryThresholdDays` of their `warrantyEndDate` (default: 30 days) receive:
- A Work Queue advisory task routed to the PM: "Coverage for [scope] expires in N days — review open cases"
- A Health spine signal: "Expiring coverage with open cases" (if linked cases exist)
- A canvas tile advisory badge

### 9.3 Open cases at expiration

Expiration of a coverage item does not automatically close linked cases. The case lifecycle is independent. When a coverage item expires with linked open cases:

- The PM receives a Work Queue escalation: "Coverage has expired; N open cases remain"
- The expired coverage item remains as a reference on the case (it is not cleared)
- Cases transition to `Closed` only through the normal closure path — PM/Warranty Manager must explicitly close them
- If cases remain open more than 30 days after coverage expiration without PM action, PX receives an escalation advisory

---

*← [T02](P3-E14-T02-Record-Families-Identity-and-Authority-Model.md) | [Master Index](P3-E14-Project-Warranty-Module-Field-Specification.md) | [T04 →](P3-E14-T04-Warranty-Case-Lifecycle-States-and-SLA-Escalation-Model.md)*
