# P3-E14-T01 — Module Scope, Operating Model, and Source-of-Truth Boundaries

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E14-T01 |
| **Parent** | [P3-E14 Project Warranty Module](P3-E14-Project-Warranty-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T01 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Module Purpose and Value Proposition

The Project Warranty Module is the **governed internal operating surface for tracking warranty coverage, managing active warranty cases, routing responsibility to the correct subcontractor or manufacturer, aging open issues against SLA commitments, scheduling and verifying corrective visits, and closing cases with documented resolution evidence.**

The business case is direct. Every construction project carries a period of post-construction warranty obligations — typically one year for labor and workmanship, longer for systems and equipment. Today those obligations are tracked across email threads, shared spreadsheets, and individual PM judgment. There is no canonical case state, no SLA visibility, no systematic responsibility routing, and no structured evidence chain for back-charge or dispute defense. When an owner reports an issue six months after turnover, the PM cannot quickly determine: who is responsible, whether the issue is in scope, what the current SLA posture is, what attempts have been made, or whether similar issues have been opened against the same subcontractor.

P3-E14 replaces that pattern with a first-class operating model: a structured coverage registry, a governed case lifecycle, systematic subcontractor routing and acknowledgment, SLA tracking with aging and escalation, evidence accumulation, verification gates, and an immutable resolution record. It is not a document folder. It is not a checklist. It is an operating workflow.

---

## 2. Why This Module Exists in Phase 3

The original Phase 3 Stage 7.7 entry classified Warranty as "baseline-visible lifecycle" — meaning the module would surface a tile showing open obligations but would not implement deeper case management. That classification was a deliberate deferral, not a permanent ceiling.

P3-E14 lifts that ceiling. The decision to fully specify Warranty now is driven by three constraints that made deferral costly:

**Constraint 1 — Canonical record design window.** If Warranty case records are not designed in Phase 3, the future external workspace (owner portal, subcontractor collaboration) will be forced to design its own data model. That produces a forked system with two competing canonical stores. Designing the canonical record model now costs the same as designing it later, but prevents the fork.

**Constraint 2 — Closeout and Startup seams.** Closeout owns the turnover package. Startup owns commissioning evidence. Both of those hand off to Warranty at project completion. The seams for those handoffs must be designed while Closeout and Startup are in active development in Phase 3, not retrofitted later.

**Constraint 3 — Financial back-charge advisory.** The Financial module needs a structured warranty-case reference to support back-charge tracking. Without a governed case record, Financial cannot link cost recovery actions to a canonical claim origin.

### What "baseline-visible" was

Baseline-visible Warranty would have delivered:
- A canvas tile surfacing a count of open obligations
- Links to turnover documents (from Closeout)
- No case management, no routing, no SLA, no evidence model, no lifecycle

### What P3-E14 adds

P3-E14 delivers the full Layer 1 operating surface:
- Structured `WarrantyCoverageItem` registry with typed coverage scope, responsible party, expiration dates, and asset/system anchoring
- First-class `WarrantyCase` lifecycle with 16 canonical states from `Open` through `Closed`
- Coverage decision workflow (`Pending_Coverage_Decision → Not_Covered / Denied / Assigned`)
- Subcontractor routing and acknowledgment (`SubcontractorAcknowledgment`)
- Visit scheduling and tracking (`WarrantyVisit`)
- Evidence attachment (`WarrantyCaseEvidence`)
- SLA model with response, repair, and verification windows
- Aging and escalation with Work Queue publication
- Immutable `WarrantyCaseResolutionRecord` at closure
- Health spine metrics, canvas tile, and Reports publication
- Clean seam design for the future owner/subcontractor external workspace

---

## 3. Operating Model

The Warranty module operates at the project level. Each project has one warranty operating context. There is no portfolio-level warranty record that aggregates across projects; the Health spine and Reports module serve that aggregation role.

### 3.1 Operational flow

```text
[PROJECT REACHES TURNOVER]
         │
         ▼
[Coverage Registry Populated]
  PM registers WarrantyCoverageItems from:
  — Closeout turnover package (P3-E10)
  — Startup commissioning records (P3-E11)
  — Manual entry for manufacturer warranties
         │
         ▼
[Owner or Site Issue Identified]
  PM logs OwnerIntakeLog entry
  Case is created: WarrantyCase (status: Open)
         │
         ▼
[Coverage Decision Made]
  PM/Warranty Manager determines: is this in scope?
  — In scope → Assigned (subcontractor identified)
  — Out of scope → Not_Covered (terminal)
  — Not a warranty claim → Denied (terminal)
  — Already open → Duplicate (linked to canonical case)
         │
         ▼
[Subcontractor Routing and Response]
  SubcontractorAcknowledgment record created
  Sub must acknowledge and accept/dispute scope
  SLA response window starts at assignment
         │
         ▼
[Visit and Repair]
  WarrantyVisit scheduled
  Work transitions through Scheduled → InProgress → Corrected
  Evidence attached: WarrantyCaseEvidence
         │
         ▼
[Verification]
  PM/Warranty Manager schedules verification visit
  Status: PendingVerification → Verified
         │
         ▼
[Closure]
  WarrantyCaseResolutionRecord created (immutable)
  Back-charge advisory published to Financial if flagged
  Activity spine event emitted
  Case status: Closed
```

### 3.2 What the module does not manage

The module does not manage construction defect litigation (legal domain), final lien releases (Financial / Closeout domain), ongoing facility maintenance after warranty expiration (FM domain), or proactive maintenance scheduling (not a warranty obligation). These are out of scope now and in the future.

---

## 4. Two-Layer Architecture and Future Workspace Seam

### 4.1 Layer definitions

The Warranty domain operates on a deliberate two-layer model. Both layers share the same canonical record model. Layer 2 does not create a parallel data store.

| Layer | What it is | Phase | Key actors |
|---|---|---|---|
| **Layer 1 — Project Hub internal** | PM-driven warranty control surface; coverage registry; case management; routing; SLA; closure | Phase 3 | PM, PX, APM/PA, Warranty Manager |
| **Layer 2 — External collaborative workspace** | Owner-facing intake; direct subcontractor participation; guided resolution workflow; external SLA visibility | Future (explicitly deferred) | Owner, Homeowner/Tenant, Subcontractor, PM |

### 4.2 Canonical record invariant

Layer 2 must **write to the Phase 3 record model**, not fork it. Specifically:

- Owner-submitted issues must flow into `OwnerIntakeLog` or directly into `WarrantyCase` records via governed intake
- Subcontractor acknowledgment must write to `SubcontractorAcknowledgment`
- Visit scheduling and evidence must write to `WarrantyVisit` and `WarrantyCaseEvidence`
- No parallel canonical case store may be created

This invariant is binding. When Layer 2 is designed, its data model must extend the Phase 3 types, not replace them.

### 4.3 Phase 3 boundary for Layer 2 seams

Phase 3 defines the seam contracts that Layer 2 will consume. It does not build Layer 2. The seam contracts are:

- The `OwnerIntakeLog` record is designed to accept a future `sourceChannel` field (e.g., `OWNER_PORTAL`, `PM_ENTERED`) so intake source is distinguishable without a schema change
- The `SubcontractorAcknowledgment` record is designed with an `enteredBy` field that distinguishes PM-on-behalf from direct subcontractor entry
- The `WarrantyCase` status model includes `AwaitingOwner` to support cases blocked on owner access — a state that makes no sense in the PM-only model but is essential for Layer 2
- Identity keying on all records uses `projectId` + external party identifiers that are stable across both layers

---

## 5. Source-of-Truth Boundary Matrix

### 5.1 Boundary positions

| Data concern | Source-of-truth owner | Warranty's relationship |
|---|---|---|
| Warranty coverage definitions (what is covered, by whom, for how long) | **Warranty module** | Author and maintain |
| Source warranty documents (certificates, turnover package assembly) | **Closeout module** (P3-E10) | Consume as linked reference; never re-author |
| Commissioning evidence, startup system readiness records | **Startup module** (P3-E11) | Consume as linked reference; never re-author |
| Active warranty case lifecycle | **Warranty module** | Author and maintain |
| Subcontractor scope acknowledgment and resolution declaration | **Warranty module** | Author and maintain |
| Owner communication history (Phase 3) | **Warranty module** (PM-entered `OwnerIntakeLog`) | Author; seam designed for Layer 2 extension |
| Back-charge cost records, financial commitments | **Financial module** (P3-E4) | Publish advisory; never write Financial records |
| Health metrics derived from warranty posture | **Health spine** (P3-D2) | Emit; Health computes and publishes to canvas |
| Work Queue routing items | **Work Queue spine** (P3-D3) | Emit; Work Queue routes and surfaces |
| Activity event stream | **Activity spine** (P3-D1) | Emit; Activity Timeline aggregates |
| Report artifacts assembled from warranty data | **Reports module** (P3-F1) | Surface data candidates; never own report artifacts |
| Related items graph | **Related Items** (P3-D4) | Publish links; never own the graph |

### 5.2 Boundary constraints by adjacent module

**Closeout (P3-E10):**
Closeout owns the turnover package — the assembly of O&M manuals, warranty certificates, and as-built documentation delivered to the owner at project close. Closeout is the source of warranty certificate documents. Warranty consumes Closeout's turnover package records as references for coverage item registration. Warranty may never write to Closeout records. Closeout may read Warranty's posture summary as an advisory (open cases, unresolved coverage) for use in close scoring, but Closeout does not gate on warranty posture in Phase 3.

**Startup / Commissioning (P3-E11):**
Startup owns the commissioning evidence trail — whether systems were started up, tested, and accepted. That record establishes the baseline against which warranty claims on systems are evaluated. When a PM registers a system coverage item, they may link it to a Startup commissioning record. Warranty reads that reference; it does not write to Startup records.

**Financial (P3-E4):**
Financial owns all cost and commitment records. When a warranty case results in a determination that the subcontractor is not fulfilling their warranty obligation and back-charge is appropriate, the Warranty module publishes an advisory to Financial. The advisory includes case reference, subcontractor identity, PM-estimated impact, and rationale. The Financial module PM/PX decides whether to initiate formal back-charge. Warranty never creates a commitment record.

**Reports (P3-F1):**
Reports assembles release artifacts from module data. Warranty publishes report-candidate data (posture summaries, aging reports, coverage expiration reports). Reports owns the artifact. Warranty owns the underlying data.

**Work Queue (P3-D3) and Health spine (P3-D2):**
These are consumption surfaces. Warranty emits events and metrics; these spines aggregate, route, and surface them. The spines do not own warranty case state. Work Queue items do not advance the warranty case lifecycle — they notify actors of required next moves. The PM or system transition, not the Work Queue acknowledgment, advances the case status.

---

## 6. Explicit Out-of-Scope Items for Phase 3

| Item | Reason deferred |
|---|---|
| Owner-facing intake portal and authentication | Layer 2 external workspace scope |
| Direct subcontractor access to Project Hub warranty surfaces | Layer 2 external workspace scope |
| Outbound email / push notification to owners or external parties | Layer 2 + notification infrastructure scope |
| Owner role in `@hbc/auth` authority model | Layer 2 prerequisite; not Phase 3 |
| External SLA reporting dashboard for owners | Layer 2 scope |
| Shared PM + owner + subcontractor resolution workspace | Layer 2 scope |
| Integration with property management systems | Future integration scope |
| Proactive maintenance scheduling | Facility management domain, not warranty |
| Construction defect litigation management | Legal domain |
| Final lien release tracking | Financial / Closeout domain |

---

*← [Master Index](P3-E14-Project-Warranty-Module-Field-Specification.md) | [T02 →](P3-E14-T02-Record-Families-Identity-and-Authority-Model.md)*
