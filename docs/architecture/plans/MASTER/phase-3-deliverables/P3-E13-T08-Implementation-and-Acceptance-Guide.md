# P3-E13-T08 — Implementation and Acceptance Guide

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E13-T08 |
| **Parent** | [P3-E13 Subcontract Execution Readiness Module](P3-E13-Subcontract-Execution-Readiness-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T08 of 8 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Implementation Order

Implement the module in the order below. Do not skip stages.

| Stage | Implements | Why first / why here |
|---|---|---|
| 1 | Parent case, identity, lineage, workflow status, decision record scaffold | Everything else hangs off the parent case and the workflow / decision split |
| 2 | Requirement profile binding and generated `ReadinessRequirementItem` model | The module is governed-profile-driven, not checklist-driven |
| 3 | Artifact ledger and specialist evaluation state | Dual-state item behavior must exist before exception routing |
| 4 | Parent `ExceptionCase`, immutable iterations, approval slots, actions, delegation events | Exception handling is a first-class architecture concern, not an afterthought |
| 5 | Issued readiness decision and Financial gate projection | Gate integration must consume formal decision outputs |
| 6 | Work / notification / health / activity / related-item publications | Downstream projections should be wired as the core workflow comes online |
| 7 | PWA / SPFx surfaces, review annotations, audit history, and precedent publication | UX and review depth build on top of the stable workflow model |

---

## 2. Dependency And Package Blockers

| Dependency | Blocker reason | Earliest blocked stage |
|---|---|---|
| `@hbc/versioned-record` | Required for immutable history, iteration integrity, and decision audit | Stage 1 |
| `@hbc/workflow-handoff` | Required for governed approval routing and controlled reassignment | Stage 4 |
| `@hbc/my-work-feed` | Required for routed actions and escalations | Stage 6 |
| `@hbc/notification-intelligence` | Required for timer-driven reminders, overdue notifications, and escalations | Stage 6 |
| `@hbc/bic-next-move` | Required for blocked-execution and overdue-action prompts | Stage 6 |
| `@hbc/field-annotations` | Required for review-capable non-mutating overlays | Stage 7 |
| `@hbc/related-items` | Required for Financial and lineage relationship publication | Stage 6 |
| `@hbc/publish-workflow` | Required only if `GlobalPrecedentReference` publication is activated in the first implementation slice | Stage 7 |

No implementation may replace a blocker with a local substitute.

---

## 3. Required Validation Checklist

Validate at minimum:

- parent case identity works and only one active case exists per governed identity,
- normal resubmissions remain in-case,
- material identity changes create supersede / void plus successor case,
- requirement profiles generate item sets,
- artifact and evaluation state remain separate,
- specialist applicability rulings do not depend on PM free-form suppression,
- exception iterations are immutable,
- controlled delegation preserves slot identity and audit history,
- readiness decisions are explicit issued records,
- Financial gate reads decision-derived output only,
- downstream publications are projections only,
- annotations never mutate operational records.

---

## 4. Acceptance Criteria

The module is acceptable only when all of the following are true:

1. `SubcontractReadinessCase` exists as the parent source-of-truth model.
2. One active case rule is enforced for same legal entity plus same award intent.
3. Normal renewals / resubmissions remain inside the same case.
4. Material identity changes create supersede / void plus new case.
5. Governed requirement generation is implemented; no universal fixed 12-item governing model remains.
6. Each `ReadinessRequirementItem` has both artifact state and compliance evaluation state.
7. Typed metadata exists for insurance, licensing, expiration / renewal, jurisdiction, evaluator role, and blocking severity where applicable.
8. SDI / prequalification supports the governed outcome family and is not reduced to Compass-only binary logic.
9. `ExceptionCase` exists under the readiness case.
10. `ExceptionSubmissionIteration` records are immutable snapshots.
11. Approval actions are tied to iterations and preserved approval slots.
12. Delegation is controlled reassignment with audit history.
13. `ExecutionReadinessDecision` is a formal issued record.
14. Financial gate consumption depends on issued decision / readiness projection rather than checklist completion.
15. Health / Work Queue / Related Items / activity consume projections or publication artifacts only.
16. Review annotations do not mutate operational records.

---

## 5. Evidence Expected For Acceptance

Collect evidence for at least:

- one normal in-case resubmission,
- one superseded case with successor linkage,
- one SDI family item resolved through a non-binary valid outcome,
- one exception iteration rejected and resubmitted as a new immutable iteration,
- one delegated approval slot showing preserved slot identity,
- one issued blocked decision and one issued ready decision,
- one Financial gate enforcement proof,
- one annotation-isolation proof.

---

## 6. Migration / Coexistence Relative To P3-E12

P3-E12 remains historical context only.

Migration / coexistence rules:

- active authority moves to P3-E13,
- old checklist / mutable-waiver framing must not be reused as the governing model,
- useful boundary logic from P3-E12 may survive only where it does not conflict with the case-driven architecture,
- references to `Subcontract Checklist` and `Compliance Waiver` as the governing shape must be replaced in active authority docs.

---

## 7. Cross-Reference Update Checklist

The following docs must point to `P3-E13` in the same implementation pass:

- `phase-3-deliverables/README.md`
- `MASTER/README.md`
- `04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `P3-E12-Subcontract-Compliance-Module-Field-Specification.md`
- `P3-E1-Phase-3-Module-Classification-Matrix.md`
- `P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md`
- `P3-G1-Lane-Capability-Matrix.md`

Update goals:

- mark `P3-E12` as superseded historical reference,
- make `P3-E13` the active field-spec authority,
- replace stale checklist / waiver language,
- preserve still-valid Financial gate ownership and review-capable boundary rules.
