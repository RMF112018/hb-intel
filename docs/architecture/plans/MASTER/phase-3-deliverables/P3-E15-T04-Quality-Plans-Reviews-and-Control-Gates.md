# P3-E15-T04 — Quality Plans, Reviews, and Control Gates

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E15-T04 |
| **Parent** | [P3-E15 Project Hub QC Module](P3-E15-QC-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T04 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Operating Principle

Quality planning in Phase 3 is a **governed template-instance system**, not an informal checklist exercise. `WorkPackageQualityPlan` is the authoritative project-scoped plan record. `PreconstructionReviewPackage` is the authoritative package-and-phase review record. Control gates are **soft-gated readiness controls**: they do not act as hard technical stops, but they do create formal readiness posture, escalation state, downstream issue creation, and work-queue obligations.

The purpose of this file is to lock:

- how governed standards and required best-practice packets become project plans,
- how mandatory coverage differs from project-selected expansion,
- how plans generate review packages and findings,
- how hold points, witness points, tests, mockups, and preinstallation meetings are represented,
- and how unmet prerequisites become actionable lineage rather than informal project memory.

---

## 2. `WorkPackageQualityPlan` Operating Model

### 2.1 Core Object Model

`WorkPackageQualityPlan` is the project-scoped authoritative quality-plan record for one governed work package or controlled work-package cluster. Each plan is instantiated from governed core plus any approved project extensions.

| Field group | Required content |
|---|---|
| Identity | `workPackageQualityPlanId`, `projectId`, `workPackageKey`, `planVersionId`, status, created/updated provenance |
| Governed basis | linked `GovernedQualityStandard` refs, linked `ProjectQualityExtension` refs, mandatory plan-set generation version |
| Scope | trade / discipline, area or location scope, package/phase applicability, schedule-awareness refs, related spec or package refs |
| Accountability | `ResponsiblePartyAssignment` for owning organization, optional individual, designated verifier, Quality Control Manager review flag |
| Coverage | mandatory coverage items, selected high-risk additions, controlled addenda, override flags, approval provenance |
| Gates | required preinstallation meetings, hold points, witness points, tests, mockups, required acceptance prerequisites |
| Readiness posture | current plan completeness, gate readiness posture, open exception count, blocked/escalated signals |
| Lineage | parent governed plan-set refs, downstream review-package refs, spawned issue refs, downstream handoff refs |

### 2.2 Plan Lifecycle

`WorkPackageQualityPlan` uses the following lifecycle:

| State | Meaning |
|---|---|
| `draft` | Plan exists but required governed coverage and accountability are not complete |
| `in-review` | PM / PE / PA / Project Engineer has assembled the plan and routed it for internal review |
| `preliminarily-active` | Plan is usable for early planning, but package-dependent requirements are not yet fully accepted |
| `active` | All mandatory coverage is active, package-dependent prerequisites are accepted or excepted, and the plan is operational |
| `ready-for-control-gates` | Plan is active and the gate set may be used for execution-readiness routing |
| `superseded` | Replaced by a newer plan version |
| `closed` | Work package is complete for QC planning purposes |

### 2.3 Preliminary vs Accepted Package-Dependent Activation

Package-dependent quality controls may require source material that is not fully accepted when the plan is first assembled. To prevent false certainty while still allowing early planning, QC uses two activation depths:

| Activation depth | Meaning |
|---|---|
| `preliminarily-active` | Governed mandatory plan set is instantiated and early planning can proceed, but one or more package-dependent controls remain pending package acceptance, accepted exception, or verified prerequisite |
| `active` | The required package-dependent controls are accepted, or a bounded `DeviationOrWaiverRecord` authorizes operation with conditions |

**Rule:** no plan may skip directly from `draft` to `active` if package-dependent prerequisites remain unresolved.

---

## 3. Mandatory Coverage vs Project-Selected Expansion

### 3.1 Mandatory Coverage Model

Mandatory coverage is the non-removable minimum quality-plan set defined by MOE/Admin for the applicable work-package type, discipline, and risk category.

Mandatory coverage must include:

- required governed standards,
- required best-practice packets,
- required gate classes,
- required review-package types,
- minimum evidence requirements,
- and minimum verifier designation rules.

### 3.2 Project-Selected High-Risk Additions

Projects may add high-risk coverage only as an additive overlay. These additions may include:

- extra mockups,
- extra witness points,
- expanded test requirements,
- additional preinstallation meetings,
- extra discipline review packages,
- additional evidence minimums,
- heightened approval dependencies.

### 3.3 Coverage Rules

| Rule | Effect |
|---|---|
| Governed mandatory coverage cannot be removed | Project cannot weaken the plan floor |
| Project-selected additions are additive only | Additions may increase rigor, never reduce it |
| Additions must carry provenance | Every project-selected addition must record who added it, why, and under which risk basis |
| High-risk additions may later be promoted | Reusable project additions may become future governed candidates through the T02 promotion model |

---

## 4. Standards and Best-Practice Mapping

`GovernedQualityStandard` and required best-practice packets do not sit outside the plan. They are instantiated into plan coverage sections with explicit applicability.

### 4.1 Mapping Layers

| Source | Maps into plan as |
|---|---|
| `GovernedQualityStandard` | required plan obligations, review criteria, minimum evidence requirements, gate requirements |
| Governed best-practice packet | grouped quality activities, example acceptance checks, discipline-specific guardrails |
| `ProjectQualityExtension` | approved additive project-local requirement block tied to a governed parent |

### 4.2 Mapping Output

Each plan must materialize the following sections:

| Plan section | Purpose |
|---|---|
| `governedRequirements` | requirements directly instantiated from governed standards |
| `projectExtensions` | approved project-specific additive requirements |
| `reviewRequirements` | required review-package and discipline checkpoints |
| `controlGateRequirements` | hold points, witness points, tests, mockups, and preinstallation meetings |
| `evidenceMinimums` | minimum evidence references needed by state or gate |
| `approvalDependencies` | internal/external approvals that condition readiness |

---

## 5. Required Control Gate Families

QC uses a single governed control-gate family model with typed subcategories.

### 5.1 Gate Types

| Gate type | Description |
|---|---|
| `preinstallation-meeting` | Required quality coordination meeting before affected work proceeds |
| `mockup` | Required mockup or sample installation proving quality approach |
| `test` | Required test, inspection, or documented verification event |
| `hold-point` | Required review or acceptance point before work should continue |
| `witness-point` | Review point where QC or designated reviewer may observe/confirm but work is not automatically stopped |

### 5.2 Control Gate Requirement Model

Each plan-level control gate requirement must define:

- gate type,
- gate title,
- linked work-package ref,
- prerequisite set,
- responsible organization + optional individual,
- designated verifier or reviewer role,
- required evidence minimums,
- acceptance criteria summary,
- readiness effect if not satisfied,
- related review-package or test refs where applicable.

### 5.3 Gate Status Model

Control gates are soft-gated and use the following statuses:

| Status | Meaning |
|---|---|
| `not-ready` | Required prerequisites or evidence are incomplete |
| `ready-with-conditions` | Gate may proceed with explicit conditions or bounded accepted exceptions |
| `ready-for-review` | Responsible party asserts prerequisites are complete and requests reviewer/verifier action |
| `accepted` | Reviewer/verifier confirms gate conditions are satisfied |
| `blocked` | Material issue or unmet prerequisite prevents acceptance posture |
| `escalated` | Gate remains unresolved past SLA, or risk/authority threshold requires escalation |

### 5.4 Gate Behavior Rules

| Condition | Required QC behavior |
|---|---|
| Missing mandatory prerequisite | Gate remains `not-ready` or `blocked`; plan readiness is degraded |
| Evidence incomplete but workaround approved | Gate may move to `ready-with-conditions` only through explicit documented conditions or approved deviation |
| Responsible party requests review | Gate moves to `ready-for-review`; work queue item publishes to designated reviewer or verifier |
| Reviewer accepts | Gate moves to `accepted`; related readiness signal updates |
| Gate fails materially | Spawn or link a `QcIssue`; preserve gate-origin lineage |
| Gate ages past SLA or high-risk threshold | Move to `escalated`; publish escalation via work queue / notifications |

---

## 6. Controlled Project Addenda and Overrides

Project-specific adaptation is allowed only through controlled addenda and bounded overrides inside the plan.

### 6.1 Addenda

Addenda are additive project-specific refinements that:

- attach to a governed parent requirement,
- explain project-specific risk or scope conditions,
- define additional gate or review requirements,
- and preserve the governed floor.

### 6.2 Overrides

Overrides are exceptional and must not act as silent local rewrites of governed core.

| Override type | Allowed? | Control |
|---|---|---|
| Additive rigor increase | Yes | Project approval plus provenance |
| Equivalent method substitution | Yes, bounded | Requires rationale and approver provenance |
| Removal of governed mandatory coverage | No | Must be handled as `DeviationOrWaiverRecord`, not a plan edit |
| Reduction of evidence minimums | No without approved deviation | Must route through T06 exception path |

---

## 7. `PreconstructionReviewPackage` Structure

`PreconstructionReviewPackage` is the authoritative structured review record for package-phase-discipline review.

### 7.1 Review Package Axes

Every review package must be typed on three axes:

| Axis | Required value |
|---|---|
| Package | the specific design package, procurement package, or work package under review |
| Phase | preconstruction, design review, submittal-support, pre-execution readiness, or turnover-quality readiness |
| Discipline | one or more reviewing disciplines, such as structural, architectural, MEP, envelope, interiors, specialty systems |

### 7.2 Package Structure

Each review package must include:

- package identity and version,
- linked `WorkPackageQualityPlan`,
- phase and discipline set,
- required reviewers,
- package references and spec references,
- acceptance criteria summary,
- due dates and meeting coordination,
- review status,
- spawned `ReviewFinding` set,
- package-dependent activation impact.

### 7.3 Review Package Lifecycle

| State | Meaning |
|---|---|
| `draft` | Package being assembled |
| `submitted` | Package routed for review |
| `under-review` | Active review in progress |
| `accepted` | Review complete with no unresolved blocking findings |
| `accepted-with-conditions` | Review accepted, but explicit open conditions remain |
| `returned` | Package requires revision and resubmission |
| `voided` | Package no longer applicable |

---

## 8. `ReviewFinding` Model

`ReviewFinding` is the first-class output of a review package. It is not a note field and must support downstream obligation creation.

### 8.1 Finding Fields

Each `ReviewFinding` must include:

- finding identity,
- origin `PreconstructionReviewPackage`,
- finding type,
- severity,
- finding statement,
- affected requirement refs,
- responsible organization + optional individual,
- due date,
- disposition status,
- evidence expectation refs,
- spawn-to-issue flag or issue linkage.

### 8.2 Finding Disposition

| Disposition | Meaning |
|---|---|
| `open` | Newly issued and unresolved |
| `accepted` | Acknowledged and tracked but not yet converted into a deeper issue |
| `deferred` | Explicitly deferred under governed conditions |
| `converted-to-issue` | Spawned downstream `QcIssue` and retains linkage |
| `closed` | Resolved inside the review-package flow without separate issue record |

### 8.3 Finding-to-Issue Rule

A `ReviewFinding` must spawn a `QcIssue` when:

- the finding creates an operational follow-up obligation,
- the finding blocks or escalates a control gate,
- the finding cannot be resolved inside package review alone,
- or the reviewer marks the finding as requiring tracked corrective action.

The spawned issue must preserve:

- review package id,
- finding id,
- severity,
- affected requirement refs,
- and the originating responsible-party context.

---

## 9. Lineage and Gate Consequences

The lineage chain for T04 is mandatory:

`WorkPackageQualityPlan`
→ `PreconstructionReviewPackage`
→ `ReviewFinding`
→ `QcIssue` where actionable

Control gates may attach at either the plan level or the review-package level. When a gate fails:

- the gate record retains its own readiness posture,
- the related plan readiness posture degrades,
- the review package may remain `accepted-with-conditions` or be `returned`,
- and a downstream `QcIssue` is created when tracked remediation is required.

---

## 10. Role and Accountability Rules

| Actor | T04 authority |
|---|---|
| PM / PE / PA / Project Engineer | Own plan assembly, package administration, version adoption decisions, package routing, and record hygiene |
| Superintendent / field leadership | Own execution-readiness inputs, confirm field prerequisites, route ready-for-review status, and respond to gate follow-up |
| Quality Control Manager | Reviews high-risk plans/packages, challenges controlled addenda, authors governed candidates, and may require stronger controls |
| Designated verifier | Reviews gate-ready submissions and confirms gate acceptance; does not let responsible parties self-close |

### 10.1 Accountability Rule

Responsible parties perform the work needed to satisfy the plan or gate. Designated reviewers/verifiers confirm readiness and acceptance. The same user should not both self-declare completion and serve as the authoritative verifier unless explicitly allowed by the centrally governed verifier-eligibility policy and designated at project/work-package level.

---

## 11. Governing Summary

T04 defines QC planning as a structured, governed system:

- `WorkPackageQualityPlan` is the project control record,
- `PreconstructionReviewPackage` is the package/phase/discipline review record,
- control gates are soft-gated readiness controls with explicit statuses,
- and `ReviewFinding` is the required bridge from plans and reviews into the issue ledger when an actionable deficiency or unresolved prerequisite exists.

This structure gives Project Hub QC real planning and readiness depth without collapsing into a field-first execution engine.

---

*[← T03](P3-E15-T03-Record-Families-Authority-and-Data-Model.md) | [T05 →](P3-E15-T05-Issues-Corrective-Actions-and-Work-Queue-Publication.md)*
