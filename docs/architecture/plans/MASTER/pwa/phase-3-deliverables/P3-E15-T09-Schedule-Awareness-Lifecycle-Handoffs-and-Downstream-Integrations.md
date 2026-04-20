# P3-E15-T09 — Schedule Awareness, Lifecycle Handoffs, and Downstream Integrations

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E15-T09 |
| **Parent** | [P3-E15 QC Module Field Specification](P3-E15-QC-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T09 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Governing Principle: QC Is Schedule-Aware, Not Schedule-Authoritative

QC must be aware of schedule context so quality obligations can be projected against planned work, milestones, and turnover-quality readiness. QC does not own CPM logic, field execution planning, short-interval commitments, or schedule publication.

The locked boundary is:

- [P3-E5](P3-E5-Schedule-Module-Field-Specification.md) owns schedule truth, look-ahead planning, commitment management, and field-execution depth.
- QC consumes read-only schedule references and publishes quality readiness signals against that context.
- [07_Phase-6_Field-First-HB-Site-Control-Plan.md](../07_Phase-6_Field-First-HB-Site-Control-Plan.md) owns future field-first/mobile execution depth.

---

## 2. Schedule-Awareness Model

### 2.1 Purpose

Schedule awareness inside QC answers:

- Which quality obligations align to which upcoming work or milestone?
- Which plans, gates, tests, mockups, approvals, and advisory activations are approaching the window where they matter?
- Which quality conditions threaten turnover-quality readiness or milestone reliability?

### 2.2 Read-only schedule reference rule

QC records may carry schedule references. They may not author or mutate schedule records.

### 2.3 Minimum schedule reference model

Each schedule-aware QC record should be able to carry one or more of:

| Reference type | Meaning |
|---|---|
| `activityRef` | specific schedule activity alignment |
| `milestoneRef` | milestone or contract/operational milestone alignment |
| `phaseRef` | phase or major scope segment alignment |
| `lookAheadWindowRef` | governed look-ahead window context |
| `windowStartDate` / `windowEndDate` | simplified timing context when direct window ref is unavailable |

These are reference fields only. They do not grant QC write authority over Schedule.

---

## 3. Mapping QC Controls to Activities, Milestones, and Look-Ahead Windows

### 3.1 Mapping targets

The following QC records must support schedule context mapping where applicable:

- `WorkPackageQualityPlan`
- control-gate entries within the plan
- `PreconstructionReviewPackage`
- `ReviewFinding`
- `QcIssue`
- `CorrectiveAction`
- `ExternalApprovalDependency`
- `SubmittalItemRecord`
- `AdvisoryVerdict`
- `VersionDriftAlert`

### 3.2 Mapping matrix

| QC concern | Schedule-aware mapping expectation |
|---|---|
| Preinstallation meeting | linked to the installation activity or phase window it protects |
| Mockup | linked to the activity or milestone that cannot credibly proceed before mockup acceptance |
| Test | linked to the work segment or readiness milestone the test governs |
| Hold point | linked to the activity or milestone whose readiness is soft-gated by QC |
| Witness point | linked to the activity or milestone requiring observed evidence before downstream readiness |
| External approval dependency | linked to the window or milestone affected by late approval |
| Advisory package-dependent activation | linked to the work package or activity family the advisory governs |
| Turnover-quality readiness | linked to substantial completion, turnover, pre-punch, or equivalent project milestones |

### 3.3 Governing rule

QC may show:

- which upcoming work is exposed,
- which quality prerequisites are due,
- which milestones are carrying quality risk,
- and which work packages are not quality-ready.

QC may not:

- sequence field work,
- manage daily crew commitments,
- manage PPC or short-interval plans,
- or replace schedule’s field-execution layer.

---

## 4. Look-Ahead and Readiness Signaling

### 4.1 Baseline-visible signaling

In Phase 3, QC may publish:

- upcoming-window quality readiness signals,
- milestone-aligned quality risk flags,
- pending gate/advisory/approval prerequisites,
- turnover-quality readiness posture,
- drift or recheck signals with timing consequence.

### 4.2 Readiness signal classes

| Signal class | Meaning |
|---|---|
| `quality-ready` | all governed quality prerequisites satisfied for the mapped window or milestone |
| `quality-ready-with-conditions` | work may proceed only within explicit exception or condition posture |
| `quality-at-risk` | unresolved quality condition threatens the upcoming window or milestone |
| `quality-blocked` | unresolved quality condition materially blocks credible readiness |
| `quality-recheck-required` | later source conflict, drift, or exception expiry requires renewed QC evaluation |

### 4.3 Explicitly deferred depth

The following remain intentionally outside QC:

- daily field execution planning,
- short-interval commitment management,
- PPC metrics,
- mobile-first field capture,
- degraded-connectivity workflows,
- field-originated execution updates and sync behavior.

Those depths belong to Schedule and future Site Controls.

---

## 5. Lifecycle Boundary Through Pre-Punch and Turnover-Quality Readiness

QC lifecycle authority runs through:

- preconstruction planning,
- review and readiness gating,
- active issue/evidence/exception control,
- pre-punch quality posture,
- turnover-quality readiness.

QC does not own:

- formal punch workflow,
- commissioning/startup operational execution,
- warranty case execution,
- deep field/mobile site execution.

QC hands forward a governed quality basis, not the downstream module’s record ownership.

---

## 6. Handoff Contract to Closeout

### 6.1 Purpose

Closeout needs the quality basis that explains whether turnover-quality obligations were met, what remained open, and what evidence and exception posture existed at handoff.

### 6.2 Handoff payload expectations

The QC → Closeout seam should include:

- `ProjectQcSnapshot` reference for the accepted turnover-quality basis,
- open versus verified-closed quality issue posture,
- approved `DeviationOrWaiverRecord` posture relevant to turnover,
- key `EvidenceReference` refs used for turnover-quality readiness,
- external approvals affecting closeout posture,
- advisory conflicts or drift states still open at handoff.

### 6.3 Governing rule

Closeout receives reference and snapshot continuity. It does not receive ownership of live QC records.

---

## 7. Handoff Contract to Startup / Commissioning

### 7.1 Purpose

Startup needs to know which quality constraints, exceptions, tests, or witness results matter to startup acceptance and system/equipment readiness.

### 7.2 Handoff payload expectations

The QC → Startup seam should include:

- quality-plan sections and control expectations relevant to startup or commissioning,
- approved or pending exceptions affecting startup readiness,
- test and witness results plus evidence references relevant to startup acceptance,
- system/equipment quality issues still open at handoff,
- responsible-party and verifier context where continued review is needed.

### 7.3 Governing rule

Startup remains authoritative for its commissioning/startup program and certifications. QC provides read-only basis context and unresolved quality conditions.

---

## 8. Handoff Contract to Warranty

### 8.1 Purpose

Warranty needs accepted quality basis and evidence lineage so later case handling can understand what was accepted, waived, or conditionally approved at turnover.

### 8.2 Handoff payload expectations

The QC → Warranty seam should include:

- accepted basis and approved project-basis context relevant to covered items/systems,
- relevant `EvidenceReference` lineage,
- approved deviations/waivers with future claim relevance,
- unresolved or resolved recurrence history that remains informative,
- responsible-organization quality history that should remain queryable.

### 8.3 Governing rule

Warranty receives continuity context and references. It does not inherit QC’s live issue ledger or verifier-close workflow.

---

## 9. Handoff Contract to Site Controls

### 9.1 Purpose

Future Site Controls will consume field-facing control expectations and unresolved readiness blockers as part of deeper field/mobile execution.

### 9.2 Handoff payload expectations

The QC → Site Controls seam should provide:

- activated field-facing control expectations from `DownstreamQcActivationMapping`,
- unresolved readiness blockers and recheck-required conditions,
- advisory and drift alerts that affect active field work,
- gate/test/mockup/witness expectations already activated in QC,
- read-only lineage back to originating QC records and snapshots.

### 9.3 Governing rule

QC does not become the field-execution workspace. Site Controls consumes the signals and references; future field execution records remain Site Controls-owned.

---

## 10. Preserved Lineage Rules Across Handoffs

### 10.1 Handoff lineage chain

```text
Governed standard / extension
  → WorkPackageQualityPlan
  → PreconstructionReviewPackage
  → ReviewFinding
  → QcIssue / CorrectiveAction
  → Evidence / Deviation / Approval / Advisory
  → ProjectQcSnapshot / QualityHealthSnapshot
  → downstream handoff reference
```

### 10.2 Preservation requirements

Every handoff must preserve:

- source QC record identifiers,
- source snapshot identifiers,
- source governed-version references,
- responsible-organization lineage where relevant,
- applicable deviation/evidence/advisory references,
- handoff issuance timestamp and basis.

### 10.3 Anti-pattern

No downstream module may receive an untraceable summary that loses drillback to QC origin.

---

## 11. Related Modules and Shared Package Touchpoints

### 11.1 Module touchpoints

| Module / contract | QC relationship |
|---|---|
| [P3-E5](P3-E5-Schedule-Module-Field-Specification.md) | read-only schedule context, milestone refs, look-ahead awareness, no execution ownership |
| [P3-E10](P3-E10-Project-Closeout-Module-Field-Specification.md) | turnover-quality readiness seam and closeout continuity |
| [P3-E11-T06](P3-E11-T06-Project-Execution-Baseline-Startup-Baselines-and-Closeout-Continuity.md) | immutable continuity/snapshot pattern for startup |
| [P3-E14-T03](P3-E14-T03-Coverage-Registry-and-Turnover-Startup-Handoffs.md) | PM-mediated handoff and continuity-reference doctrine |
| [07_Phase-6_Field-First-HB-Site-Control-Plan.md](../07_Phase-6_Field-First-HB-Site-Control-Plan.md) | future field/mobile execution destination |
| [P3-G1](P3-G1-Lane-Capability-Matrix.md) / [P3-G2](P3-G2-Cross-Lane-Navigation-and-Handoff-Map.md) | baseline-visible lane depth and cross-lane handoff behavior |

### 11.2 Shared package touchpoints

| Shared package | T09 use |
|---|---|
| `@hbc/related-items` | preserve navigable lineage among QC, Schedule, Closeout, Startup, Warranty, and Site Controls seams |
| `@hbc/project-canvas` | show baseline-visible readiness and handoff posture in Project Hub |
| `@hbc/notification-intelligence` | publish quality-at-risk, blocked, and recheck-required signals |
| `@hbc/my-work-feed` | continue normalized obligation publication from T05 |
| `@hbc/versioned-record` | retain immutable snapshot and handoff provenance |
| `@hbc/session-state` | preserve context continuity through baseline-visible QC flows |

---

## 12. Baseline-Visible vs Deferred Matrix

| Concern | Phase 3 QC | Deferred elsewhere |
|---|---|---|
| Milestone alignment | Yes | — |
| Upcoming-window readiness signal | Yes | — |
| Hold-point / mockup / test due posture | Yes | — |
| Turnover-quality readiness posture | Yes | — |
| Daily field commitments | No | Schedule / Site Controls |
| Short-interval planning | No | Schedule / Site Controls |
| PPC metrics | No | Schedule |
| Mobile-first field capture | No | Site Controls |
| Offline/deferred-sync field workflow | No | Site Controls |

---

## 13. Acceptance Framing

T09 is acceptable only when:

1. QC can project quality readiness against activities, milestones, phases, or look-ahead windows without mutating Schedule,
2. upcoming-window quality risk is visible in Project Hub baseline-visible surfaces,
3. closeout, startup, warranty, and future Site Controls handoffs preserve QC lineage and source snapshot references,
4. the doc clearly differentiates baseline-visible schedule awareness from deferred field/mobile execution depth,
5. no section implies that QC owns punch, commissioning/startup execution, warranty case execution, or field-first mobile workflows.

---

## 14. Cross-References

- [P3-E15-T04](P3-E15-T04-Quality-Plans-Reviews-and-Control-Gates.md)
- [P3-E15-T05](P3-E15-T05-Issues-Corrective-Actions-and-Work-Queue-Publication.md)
- [P3-E15-T06](P3-E15-T06-Deviations-Evidence-and-External-Approval-Dependencies.md)
- [P3-E15-T07](P3-E15-T07-Submittal-Completeness-Advisory.md)
- [P3-E5](P3-E5-Schedule-Module-Field-Specification.md)
- [P3-E11-T06](P3-E11-T06-Project-Execution-Baseline-Startup-Baselines-and-Closeout-Continuity.md)
- [P3-E14-T03](P3-E14-T03-Coverage-Registry-and-Turnover-Startup-Handoffs.md)
