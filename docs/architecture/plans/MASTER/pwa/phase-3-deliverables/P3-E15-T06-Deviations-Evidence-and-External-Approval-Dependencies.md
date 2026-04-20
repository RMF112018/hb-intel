# P3-E15-T06 — Deviations, Evidence, and External Approval Dependencies

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E15-T06 |
| **Parent** | [P3-E15 Project Hub QC Module](P3-E15-QC-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T06 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Operating Principle

`DeviationOrWaiverRecord`, `EvidenceReference`, and `ExternalApprovalDependency` are first-class control records. They sit alongside plans, issues, corrective actions, and gates. They do not replace those records, and they do not become free-floating document or approval trackers detached from QC lineage.

The purpose of T06 is to lock:

- how QC handles approved exceptions and conditional operation,
- what counts as acceptable evidence by state and use case,
- how external approvals are tracked internally,
- and how later external/official source changes interact with approved project basis without silently mutating accepted QC context.

---

## 2. `DeviationOrWaiverRecord` Model

### 2.1 Purpose

`DeviationOrWaiverRecord` is the only allowed vehicle for formally operating outside a governed QC rule, evidence minimum, package-dependent prerequisite, or readiness condition.

It is required for exceptions such as:

- proceeding with conditions on a soft gate,
- temporarily accepting alternate evidence,
- retaining an approved project basis despite newer external/official source changes,
- or allowing bounded deviation from a governed plan requirement.

### 2.2 Required Fields

Each `DeviationOrWaiverRecord` must include:

- `deviationOrWaiverRecordId`, `projectId`, `exceptionKey`,
- governing rule or requirement reference,
- exception type,
- scope statement,
- rationale,
- conditions of approval,
- approver set,
- responsible organization + optional individual,
- effective date,
- expiry or review-by date,
- linked plan / review / issue / gate / advisory refs,
- downstream readiness impact,
- linked evidence refs,
- audit provenance.

### 2.3 Lifecycle

| State | Meaning |
|---|---|
| `draft` | Exception being prepared |
| `submitted` | Routed for authority review |
| `under-review` | Active review underway |
| `approved` | Exception granted with active conditions |
| `rejected` | Exception denied |
| `expired` | Approval window ended without renewal or resolution |
| `withdrawn` | Request removed before decision |
| `resolved` | Exception no longer needed because underlying condition is fully satisfied |

### 2.4 Approval Rules

- No deviation may be implied by note text or gate status alone.
- A gate or plan may move to `ready-with-conditions` only if the required exception is already `approved`.
- Approved exceptions must remain time-bounded or review-bounded where applicable.
- Expired exceptions immediately affect readiness and may re-block associated records.

---

## 3. Approved Exceptions and Conditions

### 3.1 Condition Model

An approved deviation must declare its conditions explicitly. Conditions may include:

- limited duration,
- extra evidence requirements,
- added reviewer checks,
- additional external approval receipts,
- heightened monitoring or recheck cadence,
- or mandatory follow-up corrective action.

### 3.2 Readiness Effect

| Exception posture | Readiness effect |
|---|---|
| No deviation needed | Standard readiness rules apply |
| Deviation approved with conditions | Affected record may be `ready-with-conditions` |
| Deviation submitted but not approved | Affected record remains `not-ready` or `blocked` |
| Deviation expired | Affected record downgrades and may escalate |

---

## 4. `EvidenceReference` Model

### 4.1 Purpose

`EvidenceReference` is a metadata/reference record only. QC never stores the underlying file as its own canonical payload. The record exists to prove:

- what evidence is being relied on,
- where it lives,
- what requirement it supports,
- what its review posture is,
- and whether it satisfies governed minimums.

### 4.2 Required Fields

Each `EvidenceReference` must include:

- `evidenceReferenceId`, `projectId`, `evidenceKey`,
- source system or source repository reference,
- external/document link reference,
- evidence type,
- captured or publication date,
- linked QC records,
- responsible organization + optional individual where applicable,
- governed minimum-rule ref,
- review status,
- supersession ref if replaced,
- provenance metadata.

### 4.3 Evidence Lifecycle

| State | Meaning |
|---|---|
| `captured` | Evidence reference created but not yet submitted for acceptance |
| `submitted` | Evidence is asserted as supporting a QC state transition |
| `accepted` | Reviewer/verifier confirms evidence is sufficient |
| `rejected` | Evidence does not satisfy the requirement |
| `superseded` | Newer evidence replaces the reference |

---

## 5. Governed Minimum Evidence Requirements

QC uses minimum evidence floors by use case and state. Projects may add more evidence but may not weaken these minimums without approved deviation.

### 5.1 Use-Case Matrix

| Use case | Minimum evidence expectation |
|---|---|
| Baseline plan activation | Evidence proving required plan inputs, accountability assignments, and package references are complete where governed standards require it |
| Review-package acceptance | Evidence or package references sufficient to support reviewer acceptance and finding disposition |
| Gate acceptance | Evidence that gate prerequisites and acceptance criteria were satisfied, or approved conditional evidence under deviation |
| Issue `ready-for-review` | Evidence demonstrating completion of the issue or linked actions |
| Corrective-action verification | Verification evidence sufficient for reviewer/verifier to confirm closure |
| Deviation approval | Evidence supporting rationale, alternative basis, or temporary operating condition |
| External approval receipt | Evidence of submission, decision, and received approval/rejection artifact or reference |

### 5.2 Evidence Sufficiency Rule

Evidence sufficiency is governed by QC reviewers/verifiers and cannot be inferred solely from file presence. A linked file or link without accepted evidence posture is not the same as accepted evidence.

---

## 6. `ExternalApprovalDependency` Model

### 6.1 Purpose

`ExternalApprovalDependency` tracks approvals that remain external to QC but materially affect QC readiness or closure. Examples include:

- AOR approval,
- consultant review,
- manufacturer confirmation,
- third-party testing or certification signoff,
- special inspector receipt,
- other external-party acceptance required by governed quality controls.

QC tracks these internally so project teams can see what is blocking progress without building an external-facing portal.

### 6.2 Required Fields

Each `ExternalApprovalDependency` must include:

- `externalApprovalDependencyId`, `projectId`, `dependencyKey`,
- authority / party name,
- approval type,
- linked plan / review / issue / gate / advisory refs,
- submission reference,
- submission date,
- due date,
- current state,
- who submitted,
- who decided or responded when known,
- proof reference of the decision,
- responsible organization + optional individual,
- readiness/blocking effect,
- provenance metadata.

### 6.3 Lifecycle

| State | Meaning |
|---|---|
| `not-started` | Approval requirement identified but not yet submitted |
| `submitted` | Submission sent; awaiting formal processing |
| `awaiting-response` | Waiting on external response or receipt |
| `approved` | External approval received |
| `rejected` | External approval denied |
| `expired` | Approval window lapsed or receipt is no longer current |
| `waived` | Dependency formally waived through governed authority |
| `superseded` | A newer dependency record replaces this one |

### 6.4 Auditability Rule

Every external approval dependency must keep a traceable audit chain for:

- who identified the dependency,
- who submitted it,
- when it was submitted,
- what source proves the decision,
- and which QC records are released or blocked by the outcome.

---

## 7. Conflict Handling: Approved Project Basis vs Newer External Sources

QC must support situations where a project has an accepted basis but a newer external or official source appears later.

### 7.1 Governing Rule

- A newer external/official source must not silently mutate an already accepted QC basis.
- Instead, QC must open a tracked recheck or exception path.
- The project either adopts the newer basis, retains the approved basis with rationale, or uses a bounded approved deviation path.

### 7.2 Conflict Path

| Conflict outcome | QC handling |
|---|---|
| Adopt newer source | Update linked plan/advisory context via explicit revision workflow |
| Retain approved basis | Record rationale and create tracked recheck condition |
| Temporary exception | Require `DeviationOrWaiverRecord` with conditions and expiry |
| Unresolved conflict | Degrade readiness and/or hold the affected record in conditional or blocked posture |

### 7.3 Relevance to Advisory and Readiness

This rule is especially relevant when:

- submittal advisory currentness checks find a newer official source,
- external approval receipts conflict with approved project basis,
- or newer consultant/AOR direction affects a previously accepted gate or review package.

In all cases, the conflict must become an explicit tracked record and may affect readiness, but QC must not rewrite prior accepted state without a governed revision path.

---

## 8. Relationship to Downstream Quality Controls

### 8.1 Plans and Gates

- A `WorkPackageQualityPlan` may not reach `active` if a required deviation or external approval is unresolved.
- A control gate may only be `ready-with-conditions` if the relevant exception is approved and the evidence minimum is satisfied for that conditional state.

### 8.2 Issues and Corrective Actions

- A `QcIssue` or `CorrectiveAction` may not move to `verified-closed` if the required evidence minimum is unsatisfied.
- Required external approvals may block issue or action closure when closure depends on external signoff.

### 8.3 Health and Readiness

- Open deviations,
- rejected or expired evidence,
- unresolved external approvals,
- and approved-but-condition-heavy exceptions

all feed readiness posture and later health/scorecard logic in T08.

---

## 9. Internal-Only Phase 3 Boundary

T06 does not authorize external collaboration surfaces.

- External approvals are tracked as internal dependencies.
- Evidence references point to artifacts; QC does not become the artifact host.
- Exceptions are approved internally through governed HB authority.
- No external user interface, portal, or direct third-party participation is introduced by this file.

---

## 10. Governing Summary

T06 locks the control records that let QC operate credibly under real project constraints:

- `DeviationOrWaiverRecord` is the only valid exception mechanism,
- `EvidenceReference` is the governed metadata layer proving sufficiency without making QC a repository,
- `ExternalApprovalDependency` tracks required outside decisions inside the internal QC operating surface,
- and conflicts with newer external/official sources are handled through explicit recheck or exception logic rather than silent mutation.

---

*[← T05](P3-E15-T05-Issues-Corrective-Actions-and-Work-Queue-Publication.md) | [T07 → reserved in master index](P3-E15-QC-Module-Field-Specification.md)*
