# P3-E6 — Constraints Module: Publication, Review, and Governance

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E6-T06 |
| **Parent** | [P3-E6 Constraints Module Field Specification](P3-E6-Constraints-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T06: Publication, Review, and Governance |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-23 |

---

*This file covers: live operational state, published record snapshots, published review packages, publication authority, annotation scope (Published layer only), approval authority, supersede/void/archive model, state consumption by each surface, and the governance/configurability framework. See [T07](P3-E6-T07-Platform-Integration-and-Shared-Packages.md) for how these states feed downstream platform packages.*

---

## 6. Publication, Review, and Governance

### 6.1 Live operational state vs published state

The Constraints module maintains two distinct states:

**Live operational state** is the current working state of all records in all four ledgers. PMs and project controls users read and write to live operational state. Live state includes drafts, in-progress records, and all unsaved or partially complete records that have been saved but not yet published.

**Published state** is a governed snapshot created by an authorized PM or approver. Published state is the authoritative view for executive review, report generation, and health spine publication cadences.

| Consumer | State | Rationale |
|----------|-------|-----------|
| PM daily operations | Live | PMs must see current status without waiting for publish |
| Project controls dashboards | Live | Operational accuracy |
| Escalation and overdue detection | Live | Escalation must act on current state |
| Work Queue (action items) | Live | Actions must reflect current ledger state |
| Executive review (PER) | Published | PER reviews confirmed snapshots; not draft live edits |
| Health spine (review-facing metrics) | Published | Review-cycle metrics derive from published packages |
| Health spine (operational metrics) | Live | Day-to-day operational counts use live state |
| Reports for review packages | Published | Reports generated from published state for cadence review |
| Operational reports | Configurable | May use live or published per report type |

### 6.2 Published record snapshots (record-level publishing)

For important individual records (e.g., a high-priority constraint, an approved change event, a quantified delay), PMs may publish a **record-level snapshot** independent of the full module review package. A record snapshot:

- Creates an immutable `LedgerRecordSnapshot` capturing the current field values of the record.
- Is labeled with publication date, publisher, and snapshot ID.
- Can be annotated by executive reviewers via `@hbc/field-annotations` without mutating the live record.
- Is superseded when a newer snapshot of the same record is published.

### 6.3 Published review packages (module-level publishing)

For cadence-based executive review, PMs publish a **review package** covering one or more ledgers. A review package:

- Creates a `ReviewPackage` record containing a snapshot of all active records across the selected ledgers at the time of publication.
- Is labeled with review period, package ID, publication date, and publisher.
- May be created for: "All ledgers", "Constraint + Risk only", "Delay + Change only", or custom scoping per governed configuration.
- Is the authoritative source for executive review sessions.
- Remains available even after subsequent packages are published (historical packages are not deleted).

**`ReviewPackage` record structure:**

| Field | TypeScript Type | Business Rule |
|-------|----------------|---------------|
| `reviewPackageId` | `string` | UUID; immutable |
| `projectId` | `string` | FK; immutable |
| `packageNumber` | `string` | System-generated; format `RP-[###]` |
| `reviewPeriod` | `string` | Human-readable label (e.g., "March 2026 Monthly Review") |
| `ledgersIncluded` | `enum[]` | Which ledgers are in scope: `Risk`, `Constraint`, `Delay`, `Change` |
| `snapshotData` | `object` | Serialized snapshot of records from included ledgers at publish time |
| `publishedAt` | `timestamp` | Immutable |
| `publishedBy` | `string` | User ID; immutable |
| `status` | `enum` | `Active` / `Superseded` / `Archived` |

### 6.4 Publication authority

| Action | Who |
|--------|-----|
| Create / edit live records | PM, Project Controls |
| Publish record-level snapshots | PM |
| Publish review packages | PM or Designated Approver |
| Approve governed actions (dispositions, escalation acknowledgements) | Designated Approver |
| Annotate published state | Portfolio Executive Reviewer (PER) — read-only overlay |
| Configure governance rules and taxonomies | Manager of Operational Excellence / Admin |
| Access live operational state | PM, Project Controls |
| Access published state | PM, Designated Approver, PER (via published snapshots only) |

**Executive reviewer annotation boundary:** Executive reviewers (PERs) may annotate published record snapshots and review packages via `@hbc/field-annotations`. They may **not** annotate live operational records. Annotations never mutate ledger records. The annotation is a read-layer overlay stored separately in `@hbc/field-annotations`.

**Designated Approver:** A project-level role that may perform limited governed actions: publishing review packages, approving disposition decisions, and acknowledging escalations. This role does not have broad editing authority over ledger records.

### 6.5 Supersede / Archive / Void model

**For live ledger records (all four ledgers):**

| Action | When used | Required fields |
|--------|-----------|----------------|
| `Void` | Created in error; duplicate; no substantive content | `closureReason`, actor, timestamp |
| `Cancelled` | Deliberate withdrawal with explanation | `closureReason`, actor, timestamp |
| `Superseded` | Replaced by a successor record | `closureReason`, `successorRecordId`, actor, timestamp |
| `Archived` | End-of-project administrative closure; record was valid but no longer active | `closureReason`, actor, timestamp |

**For review packages:**

| Action | When used |
|--------|-----------|
| Superseded | A newer review package for the same period replaces this one |
| Archived | Package retained but moved to historical archive (end-of-project or after governed retention window) |

No hard delete in either case.

**For integrated Change records in Procore-integrated mode:** External cancellation/void states from Procore are mapped to the `Void` or `Cancelled` canonical status through the sync/mapping rules in `procoreMapping`. The HB Intel canonical record is not deleted.

### 6.6 Governance and configurability framework

The Manager of Operational Excellence or an authorized Admin may configure the following without code changes:

**Taxonomies and registries (governed configuration):**
- Risk category enumeration (T01 §1.4)
- Risk probability and impact scales and scoring weights (T01 §1.5)
- BIC team registry (used across all four ledgers)
- Constraint category enumeration (T02 §2.4)
- Constraint priority scale and thresholds (T02 §2.5)
- Delay event type enumeration (T03 §3.5)
- Delay responsible party enumeration (T03 §3.6)
- Delay critical path impact classification and float thresholds (T03 §3.7)
- Delay analysis method enumeration (T03 §3.8)
- Delay evidence type enumeration (T03 §3.9)
- Change event origin enumeration (T04 §4.5)
- Change event line item type enumeration (T04 §4.3)
- Procore status mapping table (T04 §4.7)

**Thresholds and escalation rules (governed configuration):**
- Risk score thresholds for color-coding and escalation (T01 §1.5)
- Constraint overdue threshold for work queue trigger
- Constraint age bucket definitions (< 7 days, 7–14, 14–30, 30–60, > 60)
- Delay notification reminder threshold (days after `delayStartDate` before triggering notification reminder)
- Delay state-gate additional requirements at `Quantified` and `Dispositioned`
- Change event approval required fields before `PendingApproval` transition
- Health spine metric thresholds for red/yellow/green classification

**Publication and review configuration:**
- Default ledger scope for review packages
- Review package cadence defaults (monthly, weekly, etc.)
- Who may publish record-level snapshots vs review packages

**Structural elements that are NOT configurable (locked in code/spec):**
- Record schemas (field names, types, immutability rules)
- Lifecycle state machines and valid transition rules
- Lineage model and spawn paths
- No-hard-delete enforcement
- Annotation isolation (annotations never stored in ledger records)
- Canonical identity model for Change Ledger
- Live vs published state split

### 6.7 BIC Team Registry (master)

The BIC team registry is shared across all four ledgers. Initial set (governed; Manager of Operational Excellence may add/rename/retire):

| BIC Team | Primary responsibility area |
|----------|---------------------------|
| Change Management | Change control and scope management |
| Commissioning Team | System commissioning and startup |
| Demolition Team | Demolition and site clearance |
| Design Team | Design and engineering coordination |
| Document Control | Documentation and records management |
| Environmental Team | Environmental compliance and remediation |
| Equipment Team | Equipment management and deployment |
| Field Team | Field operations and daily execution |
| Finance Team | Financial management and budget controls |
| Geotechnical Team | Soil, foundation, and geotechnical engineering |
| HR Team | Human resources and staffing |
| IT Team | Information technology and systems |
| Inspection Team | Quality inspection and testing |
| Legal Team | Legal, contractual, and claims matters |
| Logistics Team | Material delivery and logistics |
| Owner Relations | Owner coordination and interface |
| Permits Team | Permitting, regulatory approvals |
| Procurement Team | Material sourcing and purchasing |
| Project Management | Project controls and integrated oversight |
| Public Works Team | Public infrastructure coordination |
| QA/QC Team | Quality assurance and control |
| Regulatory Team | Regulatory compliance and code enforcement |
| Risk Team | Risk management, mitigation, and contingency |
| Safety Team | Safety management and incident response |
| Scheduling Team | Schedule development and critical path control |
| Security Team | Site security and access control |
| Stakeholder Relations | Stakeholder communication and alignment |
| Subcontractor Management | Subcontractor oversight and performance |
| Sustainability Team | Sustainability, LEED, and green building goals |
| Testing Team | Testing and commissioning protocols |
| Training Team | Training programs and qualifications |
| Utilities Team | Utility conflicts, locates, and relocations |

---

*Navigation: [← T05 Cross-Ledger Lineage](P3-E6-T05-Cross-Ledger-Lineage-and-Relationships.md) | [Master Index](P3-E6-Constraints-Module-Field-Specification.md) | [T07 Platform Integration →](P3-E6-T07-Platform-Integration-and-Shared-Packages.md)*
