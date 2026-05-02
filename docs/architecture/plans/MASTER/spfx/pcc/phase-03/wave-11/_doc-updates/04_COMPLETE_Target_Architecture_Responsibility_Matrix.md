# COMPLETE Target Architecture — Responsibility Matrix

Generated: 2026-05-02

## 1. Module Identity

### Official Wave Name

**Phase 3 / Wave 11 — Responsibility Matrix**

### User-Facing Subtitle

**RACI + Owner-Contract Responsibility Control Center**

### Work Center

**Project Readiness**

### Technical Interpretation

The Responsibility Matrix is a governed, template-driven, project-instance-based Project Readiness module. It converts the company’s responsibility workbooks into approved default responsibility templates, activates those templates into project-specific responsibility records, resolves role-based ownership into project team assignments, separates contract-party responsibility from internal RACI responsibility, adds decision-rights and workflow-step support where RACI is insufficient, tracks current action ownership, manages handoffs, records evidence links, detects gaps and conflicts, and contributes blockers to Project Readiness and Priority Actions.

---

## 2. Objective

The Responsibility Matrix must answer:

- Who owns this?
- Who is accountable?
- Who is responsible for current action?
- Who must review, approve, consult, support, verify, or be informed?
- Which contract party carries the responsibility?
- What is the source basis?
- What evidence supports completion or sign-off?
- What gaps, conflicts, handoffs, or overdue actions require attention?

The module is not a spreadsheet clone. It is a governed accountability and responsibility-control system.

---

## 3. Source Workbook Grounding

### Canonical repo sources

```text
docs/reference/example/Responsibility Matrix - Template.xlsx
docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx
```

### Source interpretation

| Source | Target use |
|---|---|
| Responsibility Matrix - Template.xlsx | Authoritative seed source for default PM and Field operating responsibility items. |
| Responsibility Matrix - Owner Contract Template.xlsx | Authoritative seed source for owner-contract responsibility structure, party-code concepts, and contract-obligation mapping fields. |
| Target architecture / research | Used to enhance the workbook-derived model where spreadsheet structure is incomplete. |

### Prior extraction basis

- 109 default responsibility items from the general workbook.
- 82 PM items.
- 27 Field items.
- 36 ambiguous owner-contract placeholder rows.
- 0 populated owner-contract default obligation descriptions.

### Source traceability fields

Every item must preserve:

```text
sourceFile
sourceWorkbookType
sourceSheet
sourceRow
sourceSection
sourceCategory
sourceSubcategory
sourceItemText
sourceAssignmentMarks
sourceRoleColumns
sourceExtractionClassification
sourceMappingNotes
```

---

## 4. Four-Layer Architecture Model

| Layer | Purpose |
|---|---|
| Template Library | Company-standard responsibility definitions sourced from workbook extraction and approved enhancements. |
| Project Instance Library | Project-specific activated responsibility items created from templates. |
| Assignment Layer | Role, person, company, contract-party, RACI, and decision-rights assignments. |
| Workflow / Evidence Layer | Review status, current action owner, evidence links, exceptions, approvals, audit, and snapshots. |

### Locked rule

Template items define what should exist. Project instances define what is active on a specific project.

---

## 5. Two-Axis Responsibility Model

### Axis 1 — Contract-party responsibility

Allowed values:

- Owner
- Contractor / GC
- Architect
- Engineer
- Consultant
- Subcontractor
- Vendor / Supplier
- AHJ / Authority
- Insurer / Bonding
- Shared / Multi-party
- Not Applicable
- To Be Determined

### Axis 2 — Internal RACI responsibility

Allowed normalized values:

| Code | Meaning |
|---|---|
| R | Responsible |
| A | Accountable |
| C | Consulted |
| I | Informed |
| S | Supporting |
| V | Verifier |
| Q | Quality Reviewer |
| O | Originator / Owner of record |
| N/A | Not applicable |
| Unknown | Requires review |

### Non-negotiable semantic rule

Contract-party `Contractor` must never be represented as bare `C` in the same field as RACI `C = Consulted`.

---

## 6. Decision-Rights Overlay

RACI is the baseline. Decision-heavy items require decision-rights fields.

### Applies to responsibility types

- Decision
- Approval
- Review
- Sign-off
- Contractual obligation
- Commercial control
- Contract-party exception

### Fields

```text
decisionType
decisionDriver
recommender
requiredAdvisor
requiredApprover
decider
performer
inputProviders
decisionDueDate
decisionStatus
decisionRationale
decisionOutcome
decisionEvidenceLink
```

### Locked rule

For decision and approval items, `Accountable` is not enough. The module must identify the `decider` / `approver` and the `performer`.

---

## 7. Template Library and Version Governance

### Template fields

```text
templateId
templateVersion
templateName
templateStatus
sourceWorkbook
sourceWorkbookVersion
sourceSheet
sourceRow
sourceSection
sourceCategory
sourceSubcategory
sourceItemText
normalizedTitle
normalizedDescription
defaultLifecyclePhase
defaultResponsibilityDomain
defaultResponsibilityType
defaultCriticality
defaultContractPartyModel
defaultRaciModel
defaultDecisionModel
defaultEvidencePolicy
defaultActivationRule
appliesToProjectTypes
appliesToProjectStages
approvedBy
approvedDate
effectiveDate
retiredDate
supersededByTemplateId
migrationPolicy
```

### Template status values

- Draft
- Active
- Superseded
- Retired
- Archived

### Migration policies

| Policy | Meaning |
|---|---|
| New Projects Only | Existing projects retain prior version. |
| Optional Update | PM/PX can apply updated default. |
| Required Review | Existing project instances are flagged for review. |
| Required Migration | Existing project instances must migrate after approval. |
| No Migration | Historical version remains locked. |

---

## 8. Project Instance Model

### Fields

```text
projectResponsibilityItemId
projectId
templateId
templateVersion
instanceStatus
activationStatus
sourceClassification
normalizedTitle
description
lifecyclePhase
responsibilityDomain
responsibilityType
workstream
criticality
currentActionOwnerId
requiresEvidence
requiresReview
requiresApproval
requiresSignoff
contractReferenceRequired
createdFromTemplate
createdManually
createdBy
createdAt
lastReviewedBy
lastReviewedAt
retiredBy
retiredAt
```

### Instance status values

- Draft
- Needs Assignment
- Needs Review
- Active
- In Progress
- Blocked
- Needs Approval
- Approved
- Complete
- Deferred
- Not Applicable
- Retired

---

## 9. Workbook Import and Human Review Pipeline

```text
Workbook row extracted
  → source row classified
  → default item candidate created
  → source marks normalized
  → ambiguous marks flagged
  → template librarian / PM / PX review
  → approved, deferred, retired, or marked needs clarification
  → active template version created
  → project instances seeded from active template
```

### Import review screens

- Source Import Review
- Ambiguous Rows Queue
- Role Mapping Review
- Default Item Approval
- Source-to-Target Diff View
- Template Version Approval
- Project Activation Preview

### Row classification

| Classification | Treatment |
|---|---|
| Responsibility item | Eligible for default item creation. |
| Section header | Preserve as grouping, not responsibility item. |
| Instruction row | Preserve in extraction notes. |
| Blank row | Ignore. |
| Formatting-only row | Ignore. |
| Placeholder row | Preserve as schema/pattern source only. |
| Ambiguous row | Include in ambiguous-items register; do not activate without review. |

---

## 10. Contract Clause / Obligation Reference Model

### Fields

```text
contractResponsibilityId
projectResponsibilityItemId
contractDocumentType
contractDocumentName
contractDocumentVersion
contractSection
specSection
drawingReference
clauseSummary
obligationType
obligationTrigger
requiredNoticePeriod
requiredEvidence
responsibleContractParty
hbInternalOwnerRole
hbInternalOwnerPerson
reviewingParty
approvingParty
riskIfMissed
commercialImpact
legalReviewRequired
contractReferenceConfidence
requiresUserReview
```

### Obligation types

- Notice
- Approval
- Review
- Payment
- Cost responsibility
- Schedule responsibility
- Document submission
- Information furnished by owner
- Information furnished by contractor
- Design coordination
- Permit / AHJ support
- Insurance / bond
- Claims / dispute
- Change management
- Closeout / turnover
- Warranty
- Other

### Legal guardrail

The module records references and user-entered mappings only. It does not interpret contract language as legal advice or create legal obligations.

---

## 11. Assignment Layer

### Assignment scopes

| Scope | Use |
|---|---|
| Role | Default project role assignment. |
| Person | Named individual assigned on a project. |
| Company | External company or project participant. |
| Contract Party | Owner, Contractor, Architect, Consultant, Subcontractor, AHJ, etc. |

### Fields

```text
assignmentId
projectResponsibilityItemId
assignmentScope
sourceRole
normalizedRole
projectRoleId
projectPersonId
companyId
contractParty
raciValue
decisionRole
isPrimary
isRequired
startDate
endDate
backupOwnerId
temporaryDelegateId
assignmentStatus
assignmentReason
createdBy
createdAt
updatedBy
updatedAt
```

### Assignment status values

- Proposed
- Active
- Pending Review
- Pending Approval
- Reassigned
- Delegated
- Expired
- Removed
- Retired

### Rule

Role-based assignments are allowed for templates and default project setup. Person-based assignment is required for active execution items unless the item is explicitly informational or not applicable.

---

## 12. Team & Access Role Resolution Contract

### Required inputs

```text
projectRoleId
projectRoleName
projectPersonId
personDisplayName
personEmail
company
isInternal
isExternal
isActiveOnProject
accessStatus
projectRoleStatus
assignmentEligibility
startDate
endDate
```

### Resolution rules

- If a responsibility item is role-assigned and the role has one active person, it may resolve to that person after PM/PX review.
- If a role has multiple active people, PM/PX must choose a person or approve shared responsibility.
- If a role has no active person, the item is flagged as `role-vacant`.
- If a person leaves the project, all active Responsible and Accountable assignments are flagged for reassignment.
- External parties may be contract-party participants, consulted parties, informed parties, reviewers, or submitters, but cannot be internal Accountable owners unless explicitly configured and approved.

---

## 13. Assignment Lifecycle and Handoff

### Handoff triggers

- User removed from project.
- User role changed.
- User access expires.
- Project phase changes.
- PM/PX manually reassigns responsibility.
- Responsibility item becomes active for a new phase.
- Backup owner activated.
- Temporary delegate assigned.
- Critical item overdue.

### Handoff fields

```text
handoffId
projectResponsibilityItemId
fromAssignmentId
toAssignmentId
handoffReason
handoffStatus
requestedBy
requestedAt
approvedBy
approvedAt
effectiveDate
handoffNotes
```

### Handoff statuses

- Proposed
- Pending Approval
- Approved
- Rejected
- Completed
- Cancelled

### Rule

No active critical item may remain assigned to an inactive project participant without a documented exception.

---

## 14. Current Action Owner / Ball-In-Court Model

### Fields

```text
currentActionOwnerType
currentActionOwnerRole
currentActionOwnerPerson
currentActionCompany
currentActionReason
currentActionDueDate
currentActionStatus
currentActionEscalationPath
currentActionSetBy
currentActionSetAt
```

### Owner types

- Responsible
- Accountable
- Reviewer
- Approver
- Decider
- Contract-party reviewer
- Evidence provider
- PM
- PX
- Admin

### Rule

The current action owner is the party currently expected to act. It may differ from the Accountable owner.

---

## 15. Workflow Step Model

### Applies to

- Review items
- Approval items
- Decision items
- Sign-off items
- Contractual obligations
- Critical exception resolutions

### Fields

```text
workflowTemplateId
workflowInstanceId
workflowStepId
stepName
stepOrder
stepOwnerRole
stepOwnerPerson
stepOwnerCompany
stepDueDate
stepStatus
responseRequired
responseValue
responseDate
responseNotes
attachmentsRequired
evidenceRequired
```

### Step statuses

- Not Started
- Pending
- In Progress
- Responded
- Returned
- Approved
- Rejected
- Skipped
- Complete

---

## 16. Notification and Escalation Policy

### Notification events

- New responsibility assigned.
- Assignment changed.
- Accountable owner changed.
- Current action owner changed.
- Due date approaching.
- Item overdue.
- Evidence missing.
- Review requested.
- Approval requested.
- Contract-party exception opened.
- Handoff requested.
- Handoff approved.
- Item completed.
- Item retired.

### Escalation rules

| Trigger | First escalation | Second escalation |
|---|---|---|
| Missing Accountable on critical item | PM | PX |
| Missing Responsible on critical item | PM | PX |
| Role vacant | PM | PX |
| Overdue current action | Current owner + PM | PX |
| Contract-party ambiguity | PM | PX / Legal-review flag |
| Evidence missing for closure | Responsible + PM | PX |
| Reassignment unresolved | PM | PX |
| Approval overdue | Approver + PM | PX |

### Suppression rules

Suppress notifications for draft template rows, inactive project phases, not-applicable items, informational-only items, archived projects, and retired items.

---

## 17. Responsibility Criticality

| Criticality | Meaning |
|---|---|
| Critical | Missed item may materially affect contract rights, money, schedule, life safety, compliance, or owner relationship. |
| High | Missed item may cause delay, payment risk, rework, coordination failure, or escalation. |
| Medium | Important operating responsibility but not immediately critical. |
| Low | Informational, recurring, or administrative responsibility. |

---

## 18. Responsibility Domain Taxonomy

| Domain | Typical Accountable | Typical Responsible |
|---|---|---|
| Prime Contract | PX / PM | PM / PA |
| Owner Notices | PM / PX | PM / PA |
| Change Orders | PM | PM / PA / Accountant |
| Subcontract Administration | PM | PM / PA |
| Subcontractor SOV Review | PM | PM / PA / Accountant |
| Pay Applications | PM / Accountant | PA / Accountant |
| Release of Funds | PX / PM | Accountant / PM |
| OCIP / Insurance | PM / Accountant | PA / Accountant |
| Schedule Updates | PM | Superintendent / Scheduler |
| Buyout | PM / PX | PM / Estimating / PA |
| Field Operations | Superintendent | Assistant Super / Field Team |
| Sitework / Utilities | Superintendent | Field Team / Trade Partner |
| Interiors | Superintendent | Field Team / Trade Partner |
| Envelope | Superintendent / QAQC | Field Team / QAQC |
| MEP Coordination | Superintendent / PM | Field Team / Trade Partner |
| QAQC | QAQC / Superintendent | Field Team |
| Safety | Safety / Superintendent | Field Team |
| Closeout / Warranty | PM / Superintendent | PA / Field Team |
| Owner-Contract Obligations | PM / PX | Assigned internal owner |

---

## 19. Exception Model

### Exception types

```text
missing-accountable
multiple-accountable
missing-responsible
role-vacant
person-inactive
assignment-expired
handoff-required
stale-assignment
contract-party-ambiguous
contract-reference-missing
legal-review-required
evidence-missing
approval-overdue
workflow-step-overdue
source-row-ambiguous
unsupported-workbook-marker
template-version-stale
project-stage-not-applicable
```

### Resolution statuses

- Open
- Assigned
- In Review
- Resolved
- Deferred
- Not Applicable
- Reopened

### Rule

Critical exceptions must surface to Project Readiness and Priority Actions.

---

## 20. Evidence and Document Control Integration

Responsibility Matrix stores evidence metadata and links only. HB Document Control Center / SharePoint project record owns binary documents.

### Evidence types

- Contract clause
- Executed agreement
- Owner notice
- Meeting minutes
- Change order
- Subcontract document
- Pay application
- Schedule update
- QAQC report
- Inspection record
- Email / correspondence record
- Approval record
- Sign-off snapshot
- Other

### Evidence statuses

- Not Required
- Required
- Missing
- Linked
- Accepted
- Rejected
- Superseded

---

## 21. UI Architecture

### Lanes

1. Overview
2. Matrix View
3. Item Register
4. Owner-Contract Mapping
5. My Responsibilities
6. Gaps & Conflicts
7. Handoffs
8. Template / Source Mapping Admin

### Overview cards

- Matrix Health Score
- Critical Gaps
- Missing Accountable
- Missing Responsible
- Role Vacancies
- Contract-Party Exceptions
- Evidence Missing
- Handoffs Pending
- Overdue Current Actions
- Recent Responsibility Changes

### Global "Who Owns This?" lookup

The module must answer:

```text
Who is accountable?
Who is responsible?
Who is current action owner?
Which contract party owns the obligation?
What evidence supports it?
What is overdue or blocked?
```

---

## 22. Matrix Health Score

### Components

```text
accountabilityCoverage
responsibilityCoverage
contractPartyCoverage
evidenceCoverage
handoffRisk
stalenessRisk
criticalGapCount
overdueCurrentActionCount
```

### Score posture

| Score | Posture |
|---:|---|
| 90–100 | Healthy |
| 75–89 | Watch |
| 50–74 | At Risk |
| 0–49 | Critical |

### Override rule

Any unresolved critical gap produces at least an `At Risk` posture even if the blended score is high.

---

## 23. Integrations

### Project Readiness

Wave 11 contributes blockers when:

- critical item has no Accountable;
- critical item has no Responsible;
- owner-contract obligation lacks internal owner;
- contract-party responsibility is ambiguous;
- required evidence is missing;
- critical workflow step is overdue;
- critical handoff is unresolved.

### Priority Actions

Generate actions for:

- missing Accountable;
- missing Responsible;
- current action overdue;
- role vacant;
- person inactive;
- handoff pending;
- evidence missing;
- contract-party ambiguity;
- approval overdue;
- template migration required.

### Approvals / Checkpoints

Responsibility Matrix requests approvals for:

- default template activation;
- project matrix baseline approval;
- critical Accountable owner change;
- contract-party exception resolution;
- critical item retirement;
- required migration;
- final matrix snapshot.

Wave 14 owns approval execution.

### Team & Access

Responsibility Matrix consumes project team roster and access status. It does not execute access changes.

### HB Document Control Center

Responsibility Matrix links to evidence and snapshots. It does not store binaries or manage libraries.

### External Systems

External systems are launcher/reference-only unless later gates authorize runtime integration.

---

## 24. Snapshot / Export Governance

### Snapshot fields

```text
snapshotId
projectId
snapshotType
snapshotDate
createdBy
approvedBy
approvedDate
includedFilters
templateVersion
projectInstanceVersion
disclaimer
snapshotFileUrl
snapshotStatus
```

### Snapshot types

- Internal Review
- Owner Meeting
- Contract Responsibility Review
- PM/PX Approval
- Closeout Record
- Audit Record

### Rule

Exports are records of module state at a point in time. They are not contract amendments.

---

## 25. Permissions and Governance

| Capability | Viewer | Assignee | PM | PX | Admin |
|---|---:|---:|---:|---:|---:|
| View matrix | Yes | Yes | Yes | Yes | Yes |
| View own responsibilities | Yes | Yes | Yes | Yes | Yes |
| Comment | No | Yes | Yes | Yes | Yes |
| Update own status | No | Yes | Yes | Yes | Yes |
| Link evidence | No | Yes | Yes | Yes | Yes |
| Edit assignments | No | No | Yes | Yes | Yes |
| Change Accountable | No | No | Approval required | Yes | Yes |
| Resolve exception | No | Limited | Yes | Yes | Yes |
| Manage templates | No | No | No | Review only | Yes |
| Approve matrix baseline | No | No | Yes | Yes | Admin support |
| Export snapshot | No | No | Yes | Yes | Yes |

---

## 26. Audit Event Types

```text
item-imported
item-created
item-activated
item-edited
item-retired
template-version-created
template-version-approved
template-version-retired
assignment-added
assignment-changed
assignment-removed
accountable-changed
responsible-changed
contract-party-changed
current-action-owner-changed
workflow-step-started
workflow-step-completed
exception-opened
exception-resolved
evidence-linked
evidence-removed
handoff-requested
handoff-approved
handoff-completed
snapshot-created
snapshot-approved
```

---

## 27. Testing and Validation Contract

Required validation tests:

- active critical items require one Accountable;
- active task/deliverable items require at least one Responsible;
- multiple Accountables require explicit exception flag;
- contract-party responsibility and RACI responsibility are stored separately;
- workbook-derived items retain source workbook, sheet, and row;
- owner-contract placeholder rows are not active default obligations;
- inactive project users cannot remain active Responsible or Accountable without exception;
- role-vacant assignments generate exceptions;
- evidence-required items without evidence generate exceptions;
- critical exceptions generate Priority Actions;
- decision/approval items support decision-rights fields;
- workflow items support current action owner;
- project instance records preserve template version;
- template updates do not mutate project instances without migration action;
- Matrix Health Score is blocker-first;
- snapshot exports include template version and disclaimer.

---

## 28. MVP Scope Lock

### MVP includes

- Template library.
- Project instance model.
- Workbook source mapping.
- PM / Field default item activation.
- Owner-contract mapping structure.
- RACI + contract-party separation.
- Role/person assignments.
- Assignment lifecycle.
- Current action owner.
- Workflow step model.
- Exceptions.
- Evidence links.
- My Responsibilities.
- Matrix View.
- Item Register.
- Gaps & Conflicts.
- Handoffs.
- Matrix Health Score.
- Project Readiness integration.
- Priority Actions integration.
- Approvals / Checkpoints handoff posture.
- Document Control evidence-link posture.
- Audit event model.
- Snapshot target posture.

### MVP excludes

- Legal interpretation.
- Contract clause extraction without human review.
- External-system writeback.
- Automated Procore/Sage/Graph/SharePoint mutation.
- Production rollout.
- Tenant mutation.
- Standalone legal workflow.
- Replacing executed contract documents.
- Replacing Procore workflows.
