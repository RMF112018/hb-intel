# P3-E11-T01 — Operating Model, Scope, Surface Map, and Lifecycle Continuity

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E11-T01 |
| **Parent** | [P3-E11 Project Startup Module](P3-E11-Project-Startup-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T01 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. What Project Startup Is

Project Startup is the **governed program through which HB Intel certifies, authorizes, and documents the launch of a construction project**. It is not a collection of forms that get filled out once and filed. It is an operating system for project mobilization — a structured sequence of planning, certification, PE authorization, early stabilization, and baseline lock that produces an auditable, immutable record of what was committed, who was assigned, what was reviewed, and what was waived at the moment of launch.

### 1.1 Three Governing Functions

Startup performs three functions that must remain architecturally distinct:

**Function A — Readiness Certification:** Each of Startup's six sub-surfaces (checklist, safety readiness, permit posting, contract obligations, responsibility matrix, execution baseline) operates as an independent ledger that must be brought to a certifiable state by the PM team. Readiness is not self-declared — it is submitted for PE review and formally accepted or returned for correction.

**Function B — PE Mobilization Authorization:** Once all sub-surface certifications are accepted, the PE issues a formal mobilization authorization. This is the governance gate that separates planning from execution. It is distinct from PE annotation and distinct from sub-surface approval. It is a named, timestamped, auditable act of authorization that launches the project.

**Function C — Baseline Continuity:** After a PE-governed stabilization window, Startup locks an immutable `StartupBaseline` snapshot that captures every material commitment made at launch. This snapshot travels forward into the Closeout/Autopsy phase as the reference for delta analysis — the "what we planned" record that makes post-project learning meaningful.

### 1.2 What Startup Is Not

| Incorrectly scoped concept | Correct model |
|---|---|
| A checklist that gets "completed" once | An active readiness program with certification gates, PE authorization, and a governed stabilization window |
| A substitute for the Safety module | Safety Readiness is a startup-phase pre-check; Safety module owns ongoing operations and corrective-action ledgers |
| A permit lifecycle ledger | Permit Posting Verification cross-references Permits for display context; Permits module owns all permit lifecycle records |
| A financial model | Execution Baseline captures startup-time contractual commitments; Financial module owns the live cost model |
| A project schedule | Execution Baseline captures planned launch dates; Schedule module owns the live CPM and milestone tracking |
| An org-wide intelligence publisher | Startup never publishes to org intelligence indexes; that is Closeout's domain after PE-approved archive events |
| A document management system | Startup stores file references; SharePoint is the document store |

---

## 2. Why the Five-Surface Composite Model Is Superseded

The original P3-E11 model treated Project Startup as five equal peer sub-surfaces and derived a module-level status from composite math:

```
// OLD MODEL — superseded
StartupModuleStatus = 'Complete' when:
  StartupChecklist.status === 'Complete'         AND
  JobsiteSafetyChecklist.status === 'Complete'   AND
  ResponsibilityMatrix rows ≥ 1 PM assignment    AND
  OwnerContractReview rows ≥ 1                   AND
  ProjectManagementPlan.status === 'Approved'
```

This model had five material deficiencies:

**Deficiency 1 — False completion signal without PE governance.** The `Complete` state could be reached without PE ever formally reviewing the startup records. A PM could approve their own PM Plan and mark all checklist items `Yes` without any PE involvement. No mobilization authorization was required.

**Deficiency 2 — No evidence or blocker trail.** The composite math measured whether records existed, not whether they were sound. There was no blocker model, no waiver trail, no certification audit, and no record of what PE actually reviewed and accepted.

**Deficiency 3 — No stabilization window.** Completion was terminal. Real-world mobilization always surfaces gaps in pre-mobilization records. There was no governed correction period between PE authorization and baseline freeze.

**Deficiency 4 — No baseline continuity record.** `Complete` was a status flag, not a snapshot. Closeout had nothing to compute deltas against because there was no "what was planned at launch" record.

**Deficiency 5 — Flat surface architecture obscured governance hierarchy.** Not all sub-surfaces are equal. The Execution Baseline is the apex commitment record. The Responsibility Matrix is a prerequisite for the Execution Baseline's Section VII. The Contract Obligations Register drives ongoing monitoring obligations that survive through execution. Treating them as five equal peers produced no routing of authority and no sequencing of certification work.

The new model replaces composite math with a governed readiness program: structured certifications per sub-surface, formal PE review, explicit authorization gate, stabilization window, and immutable baseline lock.

---

## 3. Surface Map

### 3.1 Three-Tier Program Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  TIER 1 — READINESS PROGRAM CORE                                     │
│  (lifecycle state machine; program-level blockers; readiness gates;  │
│   exception waivers; PE mobilization authorization)                  │
│                                                                       │
│  StartupProgram ──► StartupReadinessState (8-state machine)          │
│  ReadinessCertification × 6   ReadinessGateRecord × 6               │
│  ProgramBlocker (0+)          ExceptionWaiverRecord (0+)            │
│  PEMobilizationAuthorization                                         │
└───────────────────────────┬─────────────────────────────────────────┘
                            │  certifications and gate evaluations
                            │  feed program state
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  TIER 2 — SUBORDINATE LEDGERS AND VERIFICATION SURFACES              │
│  (project team operates; each surface certifies independently)       │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Startup Task │  │ Startup      │  │ Permit Posting           │   │
│  │ Library      │  │ Safety       │  │ Verification             │   │
│  │ (55 tasks)   │  │ Readiness    │  │ (Section 4 cross-ref)    │   │
│  │              │  │ (32 items +  │  │                          │   │
│  │              │  │  remediation)│  │                          │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Contract     │  │ Resp.        │  │ Project Execution        │   │
│  │ Obligations  │  │ Routing      │  │ Baseline                 │   │
│  │ Register     │  │ Engine       │  │ (PM Plan)                │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │  PE mobilization authorization
                            │  → stabilization window
                            │  → baseline lock event
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  TIER 3 — BASELINE CONTINUITY RECORDS                                │
│  (immutable after lock; Startup owns; Closeout reads only)           │
│                                                                       │
│  StartupBaseline ─── created at BASELINE_LOCKED ──► immutable       │
│       │                                                               │
│       └── GET /api/startup/{projectId}/baseline ──► P3-E10 Closeout │
│              (read-only; Closeout uses for delta analysis)            │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Sub-Surface Definitions

| # | Sub-surface | Tier 2 role | Certifier | Gate weight |
|---|---|---|---|---|
| 1 | **Startup Task Library** | Readiness task ledger — 55 governed tasks covering mobilization actions | PM, PA | Required |
| 2 | **Startup Safety Readiness** | 32-item pre-mobilization safety check; remediation-capable | PM, Safety Manager | Required |
| 3 | **Permit Posting Verification** | Section 4 cross-reference — confirms permits are physically posted on jobsite | PM, Superintendent | Required |
| 4 | **Contract Obligations Register** | Governed ledger of extracted Owner contract obligations with lifecycle states | PM, PA | Required |
| 5 | **Responsibility Routing Engine** | PM sheet (84 tasks, 9 roles) + Field sheet (28 tasks, 8 roles); named assignments | PM, PX | Required |
| 6 | **Project Execution Baseline** | 11-section structured commitment baseline; the PM Plan as a typed record | PM (submit) + PX (approve) | Required |

---

## 4. Program Lifecycle — Eight States

### 4.1 State Definitions

```
  ① DRAFT
     Program initialized at project creation.
     No active sub-surface editing has occurred.
     All sub-surface records exist but are empty instances.
         │
         │ auto-transition: any sub-surface record first edited
         │ (first checklist item result, first obligation row, etc.)
         ▼
  ② ACTIVE PLANNING
     Team is actively working across sub-surfaces.
     Iterative; no readiness gate submitted.
     ProgramBlockers may be raised and tracked.
     This is the primary working state.
         │
         │ PM action: submits ReadinessCertification
         │ for all 6 required sub-surfaces
         ▼
  ③ READINESS REVIEW  ◄────────────── PE returns cert for revision
     PE is reviewing submitted certifications.               │
     PM corrections during review regress the program        │
     back to ACTIVE_PLANNING for the affected surface.       │
     PE evaluates each via ReadinessGateRecord.              │
         │
         │ PE action: all gate evaluations → ACCEPTED or WAIVED
         ▼
  ④ READY FOR MOBILIZATION
     All certifications have been formally accepted by PE.
     Program is cleared for mobilization.
     Sub-surfaces remain editable until authorization is issued.
     Minor corrections are allowed; major changes require re-certification.
         │
         │ PE action: issues formal mobilization authorization
         │ (PEMobilizationAuthorization.status = ISSUED)
         ▼
  ⑤ MOBILIZED
     PE has formally authorized project mobilization.
     Physical mobilization is underway.
     Stabilization window begins automatically.
         │
         │ auto-transition: stabilization window opens
         ▼
  ⑥ STABILIZING
     Stabilization window active (default: 14 days; PE-configurable).
     All Tier 2 sub-surfaces remain editable.
     Team makes corrections and finalizations discovered during
     early mobilization — material gaps should be resolved here.
     PE monitors; may flag records for re-review.
     New waivers may be created and approved during this window.
         │
         │ PE action: closes stabilization window
         │ (or window expires automatically at configured duration)
         ▼
  ⑦ BASELINE LOCKED / TRANSITIONED
     PE closes the stabilization window.
     StartupBaseline snapshot created — immutable from this point.
     All Tier 2 records become read-only.
     Startup transitions to continuity mode:
       — Tier 1 records are display-only.
       — StartupBaseline is available to Closeout for delta analysis.
       — Work Queue items for Startup are cleared.
     Startup remains "alive" in the project; it does not disappear.
     It provides a permanent read-only record of launch state.
         │
         │ system: project archive event (from project record)
         ▼
  ⑧ ARCHIVED
     Project has been formally archived.
     Startup records are in long-term read-only storage.
     StartupBaseline remains queryable for historical analysis.
```

### 4.2 State Transition Table

| From | To | Trigger type | Condition | Requires PE |
|---|---|---|---|---|
| `DRAFT` | `ACTIVE_PLANNING` | System | First edit to any Tier 2 sub-surface record | No |
| `ACTIVE_PLANNING` | `READINESS_REVIEW` | PM action | PM submits ReadinessCertification for all 6 sub-surfaces (all must have `certStatus ≠ NOT_SUBMITTED`) | No |
| `READINESS_REVIEW` | `ACTIVE_PLANNING` | PE action | PE rejects any certification (certStatus → REJECTED); program regresses for correction | No |
| `READINESS_REVIEW` | `READY_FOR_MOBILIZATION` | PE action | All ReadinessGateRecord evaluations → ACCEPTED or WAIVED; readiness gates are formally accepted and the program is cleared for mobilization review | **Yes — PX role required** |
| `READY_FOR_MOBILIZATION` | `ACTIVE_PLANNING` | PE action | PE reopens readiness before mobilization because a material correction or newly discovered issue requires recertification; PE-authored rationale note required | **Yes** |
| `READY_FOR_MOBILIZATION` | `MOBILIZED` | PE action | PE issues `PEMobilizationAuthorization`, confirms physical mobilization commenced, and opens the stabilization window | **Yes** |
| `MOBILIZED` | `STABILIZING` | System | Auto-transition at mobilization confirmation timestamp | No |
| `STABILIZING` | `BASELINE_LOCKED` | PE action or timer | PE closes stabilization window, OR stabilization window duration expires | **PE action or timer** |
| `BASELINE_LOCKED` | `ARCHIVED` | System | Project archive event from project record | No |

**Guard rules:**
- States cannot be skipped. The API rejects out-of-sequence transitions with HTTP 409 and logs the attempt.
- `READY_FOR_MOBILIZATION` → `ACTIVE_PLANNING` reopen actions require a PE-authored rationale note.
- Timer expiry on the stabilization window runs the same code path as the PE close action; the system becomes the actor.

### 4.3 Material Changes During READY_FOR_MOBILIZATION

Once the program reaches `READY_FOR_MOBILIZATION`, sub-surfaces remain editable for minor corrections. "Material change" is defined as any edit that would change the outcome of a ReadinessGateRecord evaluation. The following triggers automatic PE notification and may require re-certification:

| Change type | PE notification required | Re-certification required |
|---|---|---|
| Single checklist item result changed from Yes to No | Yes | At PE discretion |
| Contract obligation added, flagged for review | Yes | No — obligation is tracked going forward |
| Safety readiness `Fail` item added | Yes | Yes — Safety Readiness certification |
| Named assignment changed in Responsibility Matrix | No | No |
| Execution Baseline date field changed materially (>14 days) | Yes | At PE discretion |
| Execution Baseline status reverted from Approved to Draft | Yes | Yes — Execution Baseline certification |

---

## 5. Program Status vs. Sub-Surface Status

These two status dimensions are linked but independent. Conflating them was a core deficiency of the old model.

### 5.1 Program Status (Tier 1)

`StartupProgram.currentStateCode` is the top-level program lifecycle state (the 8-state machine). It is what the project canvas displays, what the Health Spine consumes, and what PE uses as the authoritative signal for mobilization readiness.

**Program status is governed by explicit gate events, not by aggregated sub-surface data.**

### 5.2 Sub-Surface Certification Status (per surface, Tier 1 adjunct)

Each `ReadinessCertification.certStatus` tracks whether PM has submitted and PE has accepted the formal certification for that surface. Values: `NOT_SUBMITTED` → `SUBMITTED` → `UNDER_REVIEW` → `ACCEPTED` or `REJECTED` or `WAIVED`.

### 5.3 Sub-Surface Operational Status (per surface, Tier 2)

Each sub-surface also maintains its own internal completeness signal — e.g., `StartupTaskLibrary` completion metrics, `JobsiteSafetyChecklist.openRemediationCount`, `ProjectExecutionBaseline.status`. These measure operational progress within the surface and determine certification eligibility, but they are not themselves the certification.

### 5.4 The Certification Pipeline

```
Sub-surface operational completeness
        ↓ enables PM to submit certification
ReadinessCertification submitted by PM
        ↓ triggers PE review via ReadinessGateRecord
PE evaluates gate criteria (per ReadinessGateRecord)
        ↓ PE accepts / rejects / conditionally accepts
Certification accepted or waived
        ↓ all 6 certifications accepted or waived
Program advances to READY_FOR_MOBILIZATION
        ↓ PE issues PEMobilizationAuthorization
Program advances to MOBILIZED
```

**The critical distinction:** A PM Plan with `status = Approved` is operationally complete. It is not certified. Certification requires that PE has reviewed the plan in the context of the full readiness program and explicitly accepted the `ReadinessCertification` for `EXECUTION_BASELINE`. These are separate acts by separate people at a separate moment.

---

## 6. Always-On Lifecycle Positioning

Startup is not a "launch phase" feature. It is always present and always relevant:

| Project phase | Startup activity |
|---|---|
| **Project creation** | `StartupProgram` instantiated in `DRAFT`; all sub-surface records created as empty instances |
| **Pre-mobilization (Active Planning)** | Primary working period; team completes all sub-surfaces; blockers tracked; certifications submitted |
| **Readiness review period** | PE reviews; program may cycle between READINESS_REVIEW and ACTIVE_PLANNING multiple times |
| **Mobilization window** | PE authorization issued; physical mobilization underway; stabilization window running |
| **Early execution (Stabilizing)** | Corrections and gap-filling; team has final opportunity to correct baseline records before lock |
| **Execution (Baseline Locked)** | Startup is read-only; provides launch record for all project participants; feeds Closeout |
| **Closeout and Autopsy** | Closeout reads StartupBaseline for delta analysis; no new Startup activity |
| **Archive** | Startup records in long-term storage |

**The module never goes away.** Even in execution, the Startup workspace is accessible as a read-only historical record. Team members new to the project can review the launch record to understand what commitments were made and who was assigned what.

---

## 7. Stabilization Window — Governing Rules

### 7.1 Purpose

The stabilization window exists because real-world mobilization always surfaces gaps in the pre-mobilization startup records. COI certificates arrive late. A permit gets posted that wasn't available pre-mobilization. The site logistics change the safety plan. The stabilization window is the formal, bounded, PE-monitored correction period that handles this reality without allowing the baseline to drift indefinitely.

### 7.2 Duration and Configuration

- Default duration: **14 calendar days** from PE mobilization confirmation
- PE may configure a longer window at mobilization time (no system-imposed maximum, but field guidance suggests 30 days as a reasonable ceiling)
- The window cannot be shortened after it opens; PE must close it explicitly or allow it to expire

### 7.3 What Remains Editable During Stabilization

All Tier 2 sub-surface records remain editable during stabilization:

| Sub-surface | Editable during stabilization | Restriction |
|---|---|---|
| Startup Task Library | Yes — any task result may be corrected | New tasks cannot be added (template is frozen) |
| Safety Readiness | Yes — results may be corrected; new remediations may be resolved | |
| Permit Posting Verification | Yes — particularly useful as permits arrive and get posted | |
| Contract Obligations Register | Yes — new obligations may be added; existing obligations may be updated | |
| Responsibility Matrix | Yes — named assignments may be corrected | Governed task descriptions remain immutable |
| Project Execution Baseline | Yes — sections may be updated; new signatures added | |

### 7.4 What PE Monitors During Stabilization

PE receives a Work Queue summary of open items at stabilization window open. PE may flag any Tier 2 record for re-review during stabilization. A PE flag does not block the baseline lock — it is a PE notation — but it is recorded in the `StartupBaseline` snapshot as a flagged item.

### 7.5 Baseline Lock Is a Distinct Act

When the stabilization window closes (PE action or timer), the API executes a transaction that:
1. Creates the `StartupBaseline` snapshot (see T02 §7.2)
2. Sets all Tier 2 records to read-only
3. Advances program state to `BASELINE_LOCKED`
4. Emits `StartupBaselineLocked` to the Activity Spine
5. Clears Startup-sourced Work Queue items

After this transaction, the baseline is permanently immutable. There is no "re-open baseline" function.

---

## 8. Source-of-Truth Boundary Map

### 8.1 Governing Rule

Startup is the exclusive SoT writer for launch readiness, launch intent, startup baselines, certifications, waivers, and early stabilization records. Adjacent modules own their own operational domains. The boundary is strict and enforced at the API level.

### 8.2 Boundary Matrix

| Data concern | SoT owner | Startup relationship | Direction | Notes |
|---|---|---|---|---|
| Project identity (name, number, sector, AHJ) | Project record (`@hbc/project-core`) | Inherits at creation | Read | Startup never creates or modifies project fields |
| Project lifecycle phase | Project record | Reads for context | Read | Startup's 8-state machine is independent of the project's phase enum; they are correlated but not linked by write |
| Permit lifecycle, permit records, inspections | P3-E7 Permits | Cross-reference for display | Read | Startup reads permit type and status to display alongside Section 4 items; Section 4 result never writes to Permits |
| Permit posting on jobsite | P3-E11 Startup (Section 4) | Owns — exclusive write | Write | Startup Section 4 items are the exclusive SoT for "is this permit posted on the jobsite?" |
| Ongoing safety inspections and scores | P3-E8 Safety | Related Items link only | Read (link) | Startup registers a Related Items relationship; Startup reads the Safety module inspection log identifier for the link |
| Safety corrective-action ledger | P3-E8 Safety | No relationship | None | Startup Fail items do not create Safety corrective actions; Safety module does not read Startup safety results |
| Safety readiness at mobilization | P3-E11 Startup (Safety Readiness) | Owns — exclusive write | Write | The startup-phase safety pre-check is Startup's data; Safety module has no visibility into it as a record |
| Contract financial model, budget baseline | P3-E4 Financial | Pre-fill signal only | Read (hint) | Financial contract amount may pre-fill Execution Baseline `contractAmount`; PM must confirm; after baseline lock, the two are independent |
| Live financial actuals, forecasts, cost model | P3-E4 Financial | No relationship after lock | None | Startup's `contractAmount` is a launch-time commitment; Financial module owns all live cost data |
| Project schedule, CPM, milestones | P3-E5/E6 Schedule | Pre-fill signal only | Read (hint) | Schedule date signals may pre-fill Execution Baseline date fields; PM confirms; after lock, independent |
| Launch-time schedule commitments | P3-E11 Startup (Execution Baseline) | Owns — exclusive write | Write | Planned start, SC date, NTP date, goal dates — all launch-time commitments owned by Startup |
| Subcontractor scorecards and lessons | P3-E10 Closeout | No relationship | None | Startup does not read or write any Closeout operational records |
| StartupBaseline snapshot | P3-E11 Startup (Tier 3) | Owns — exclusive write | Write → Read | Startup creates and owns the snapshot; Closeout reads it via API for delta analysis |
| Org intelligence indexes | Org Intelligence Layer | No publication path | None | Startup never publishes to org-wide derived intelligence; that is Closeout's domain after PE-approved archive events |
| Activity Spine events | P3-D1 | Publishes events | Write (events) | Startup is an event source; spine stores and routes events |
| Health Spine metrics | P3-D2 | Publishes metrics | Write (metrics) | Startup publishes readiness state and surface metrics |
| Work Queue items | P3-D3 | Creates and clears items | Write | Work Queue items for Startup conditions are Startup-owned |
| Related Items registry | P3-D4 | Registers relationships | Write | Startup registers cross-module link pairs |

### 8.3 The Closeout Continuity Interface

The relationship between Startup and Closeout is one of the most consequential boundaries in the module design. Its rules are:

1. **Startup writes; Closeout reads.** The interface is one-directional. At `BASELINE_LOCKED`, the `StartupBaseline` snapshot becomes available via `GET /api/startup/{projectId}/baseline`. Closeout queries this endpoint. Startup never queries any Closeout endpoint.

2. **The snapshot is the only interface.** Closeout does not query live `ProjectExecutionBaseline` records, individual obligation rows, or checklist items. The snapshot is the full, structured data export of launch-state records.

3. **Closeout uses the snapshot for delta analysis, not for SoT.** When an Autopsy compares "planned start date" vs. "actual start date," the planned start date comes from `StartupBaseline.executionBaselineFieldsAtLock.projectStartDate`. The actual comes from Schedule module records. Startup never touches the actual.

4. **Waivers at lock are delta-analysis input.** The `StartupBaseline.approvedWaiversAtLock` array tells Closeout which items were waived at mobilization and whether they were later resolved. This feeds the Autopsy finding "Did waived items get resolved during execution?"

---

## 9. Cross-Contract Positioning

| Contract | Relationship |
|---|---|
| P3-E1 §3.10 | Module classification — always-on lifecycle module; readiness program |
| P3-E2 §13 | SoT and action-authority matrix — Startup's SoT scope must be consistent with §13 entries |
| P3-D1 Activity Spine | Startup publishes lifecycle events; event catalog in T08 §1 |
| P3-D2 Health Spine | Startup publishes readiness state and surface metrics; metric catalog in T08 §2 |
| P3-D3 Work Queue | Startup raises and clears Work Queue items; item catalog in T08 §3 |
| P3-D4 Related Items | Startup registers cross-module relationship pairs; pairs in T08 §4 |
| P3-E4 Financial | Read-only pre-fill signal for Execution Baseline; independent after lock |
| P3-E7 Permits | Read-only display context for Section 4 Permit Posting Verification |
| P3-E8 Safety | Related Items link only; Safety module is operationally independent |
| P3-E10 Closeout | StartupBaseline read API; Closeout reads for delta analysis; no reverse flow |
| P3-G1 §4.10 | Lane capability — full parity; both PWA and SPFx deliver full Startup experience |
| P3-H1 §18.6 | Acceptance criteria for Startup; T10 §5 provides the updated 31-criterion gate |

---

*[Master Index](P3-E11-Project-Startup-Module-Field-Specification.md) | [T02 →](P3-E11-T02-Record-Families-Identity-Lifecycle-Certifications-Waivers.md)*
