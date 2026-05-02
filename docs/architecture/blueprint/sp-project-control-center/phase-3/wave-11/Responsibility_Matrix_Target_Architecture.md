# Wave 11 Responsibility Matrix Target Architecture

Status: Canonical Wave 11 architecture definition (documentation-only)

## 1. Module Identity

- Official name: `Responsibility Matrix`
- Subtitle: `RACI + Owner-Contract Responsibility Control Center`
- Wave: 11
- Work center: Project Readiness
- Scope posture: Unified module, not separate spreadsheet launchers

## 2. Objective

Define a governed, template-driven, project-instance-based responsibility control system that preserves workbook source traceability while enabling operational ownership, workflow, escalation, and audit posture.

## 3. Source Workbook Grounding

Source references:

- `docs/reference/example/Responsibility Matrix - Template.xlsx` (`PM`, `Field`)
- `docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx` (`Template`)

Repo-truth counting posture:

- `109` = workbook-derived task-row context: 82 PM task-text rows + 27 Field rows with assignment marks.
- Strict marked assignment rows total `98` (71 PM + 27 Field).
- Owner-contract workbook is currently schema/placeholder posture only, with no populated default obligation-description rows.

## 4. Four-Layer Model

### 4.1 Template Library Layer

- Stores governed default responsibility definitions.
- Preserves workbook source references and seed metadata.
- Tracks template lineage and version context.

### 4.2 Project Instance Library Layer

- Instantiates project responsibility records from approved templates.
- Stores project-specific assignment, status, due, and exception posture.
- Preserves originating template/version linkage.

### 4.3 Assignment Layer

- Resolves role/person assignment and support/sign-off semantics.
- Tracks assignment lifecycle, handoff, and current-action ownership.

### 4.4 Workflow / Evidence Layer

- Records workflow-step progress, decision posture, and exception handling.
- Stores evidence references only (no binary ownership).
- Emits audit events for material responsibility changes.

## 5. Two-Axis Model

Axis A: contract-party responsibility (`Owner`, `Architect/Engineer`, `Contractor`, extensions as governed).

Axis B: internal RACI responsibility (`Responsible`, `Accountable`, `Consulted`, `Informed`).

Hard semantic rule: contract-party `C = Contractor` is never equivalent to RACI `C = Consulted`.

## 6. Decision-Rights Overlay

For decision-heavy items, add decision-rights fields in addition to RACI:

- decision driver/recommender
- approver/decider
- contributors/input roles
- execution performer

Baseline posture: one accountable and one decider for active operational decisions unless explicit governed shared-accountability exception exists.

## 7. Template Library and Version Governance

Template governance must include:

- template status (`draft`, `approved`, `retired`)
- effective date and retirement date
- source snapshot metadata
- migration policy for active project instances
- approval/audit trail for template updates

## 8. Project Instance Model

Project records must preserve:

- `projectId`
- `templateItemId`
- `templateVersion`
- assignment and workflow fields
- exception and evidence-reference posture
- audit linkage

Project overrides cannot mutate master template history.

## 9. Workbook Import and Human Review Pipeline

Pipeline posture:

1. ingest workbook rows
2. classify row type (item/header/instruction/placeholder/ambiguous)
3. normalize assignment markers
4. require human review for ambiguous or policy-sensitive rows
5. approve for template activation

No row is auto-activated solely by non-empty cells.

## 10. Contract Clause / Obligation Reference Model

Owner-contract mappings must support project-controls metadata fields such as:

- contract document reference
- article/section
- page
- obligation summary
- trigger/condition
- evidence reference expectation

This module does not perform legal interpretation.

## 11. Assignment Layer

Assignment model fields include:

- owner role/person
- support roles/people
- reviewer/sign-off roles
- accountable owner
- current action owner
- due posture and escalation status

## 12. Team & Access Role Resolution Contract

Responsibility assignments resolve personas through Team & Access roster posture.

- Team & Access remains owner of roster/access state.
- Responsibility Matrix consumes role/person resolution results.
- Inactive/missing assignees surface as assignment exceptions.

## 13. Assignment Lifecycle and Handoff

Lifecycle states include assignment created, reassigned, handoff accepted, unassigned, and closed.

Each handoff requires timestamped actor attribution and audit event capture.

## 14. Current Action Owner / Ball-In-Court Model

Current action owner indicates who must act now and may differ from accountable owner.

Required posture:

- current action owner
- action due date
- overdue/escalation flags
- notification triggers

## 15. Workflow Step Model

Workflow-capable items support stepwise routing:

- step type (review/approval/decision/sign-off)
- required vs optional reviewers
- pending action owner
- step status history

Wave 11 defines the architecture posture; runtime execution remains downstream.

## 16. Notification and Escalation Policy

Target policy includes:

- due-soon reminder
- overdue escalation
- unresolved critical exception escalation
- reassignment/handoff alerts

Wave 11 documentation defines policy intent and event contracts only.

## 17. Responsibility Criticality

Each responsibility item carries criticality posture (for example `low`, `medium`, `high`, `critical`) used by Matrix Health Score and Priority Actions triggers.

## 18. Responsibility Domain Taxonomy

Items are grouped by governed responsibility domains (for example contracts/commercial, schedule/planning, cost/accounting, field operations, quality, safety, permitting, closeout).

Domain taxonomy is additive and governance-controlled.

## 19. Exception Model

Exception posture includes:

- missing accountable owner
- missing current action owner
- overdue action
- conflicting assignments
- unresolved contract-party mapping
- missing required evidence reference

Exceptions can emit readiness blockers and priority actions.

## 20. Evidence and Document Control Integration

Evidence posture is reference-only in this module.

- Evidence binaries remain owned by HB Document Control Center / SharePoint project record.
- Responsibility Matrix stores reference metadata, status, and linkage only.

## 21. UI Architecture and Eight Lanes

Wave 11 UI lane architecture:

1. Overview
2. Matrix
3. Register
4. Owner-Contract Mapping
5. My Responsibilities
6. Gaps and Conflicts
7. Handoffs
8. Template and Admin

## 22. Global `Who Owns This?` Lookup

Provide global lookup by responsibility item, role, person, lifecycle phase, and current action owner.

Lookup is read-model posture; execution tooling remains future implementation.

## 23. Matrix Health Score

Matrix Health Score is blocker-first and risk-sensitive.

Inputs include:

- unresolved critical exceptions
- overdue current actions
- missing accountable/current owner
- pending required evidence references
- unresolved decision-rights gaps

## 24. Project Readiness Integration

Wave 11 contributes normalized readiness posture to Wave 8 framework surfaces.

- Wave 8 remains framework owner.
- Wave 11 must not redefine framework ownership or scoring doctrine.

## 25. Priority Actions Integration

Critical and overdue responsibility exceptions can emit priority action candidates with role/person context and due posture.

## 26. Approvals / Checkpoints Integration

Wave 11 may request or reference approvals.

- Wave 14 retains approval/checkpoint execution authority.
- Wave 11 does not claim approval runtime execution.

## 27. Team & Access Integration

Wave 11 consumes Team & Access roster/access outputs for assignment validity, vacancy detection, and reassignment posture.

## 28. External Systems Launcher/Reference Posture

External systems remain launcher/reference posture in this architecture.

- No external writeback/sync/mirror mutation is claimed.
- No Procore/Sage/Graph/AHJ runtime mutation behavior is defined.

## 29. Snapshot/Export Governance

Snapshots/exports are governed records for reporting/audit context.

- They are not contract amendments.
- They do not replace executed contracts.

## 30. Permissions and Governance

Governed edit authority is role-based and scoped.

- PM/PX/Admin governance posture for changes
- audit-required mutations
- restricted template governance actions

## 31. Audit Event Model

Audit events are required for:

- template/version changes
- assignment/handoff changes
- current action owner changes
- exception state changes
- evidence reference changes
- snapshot/export generation

## 32. Testing and Validation Contract

Wave 11 documentation requires downstream validation coverage for:

- source-row traceability integrity
- assignment marker normalization
- accountable/current-owner constraints
- exception and health-score derivation
- integration seam invariants with Wave 8/Wave 14/Document Control/Team & Access

## 33. MVP Scope Lock

Wave 11 MVP architecture scope includes documentation-level target contracts for unified responsibility modeling and integration seams.

No runtime delivery is claimed by this document.

## 34. Explicit Exclusions and Guardrails

- No legal advice.
- No automatic creation of legal obligations.
- No replacement of executed contracts.
- No external-system writeback/mutation posture.
- No runtime claims for Procore, Sage, Graph, SharePoint REST/PnP, AHJ, or tenant mutation.

## Research / Source Index (raw URLs)

- https://www.pmi.org/learning/library/project-success-core-values-key-accountabilities-6262
- https://help.aiacontracts.com/hc/en-us/articles/4411605946515-Summary-A201-2007-General-Conditions-of-the-Contract-for-Construction
- https://learn.aiacontracts.com/articles/6538728-construction-contracting-basics-submittals/
- https://www.consensusdocs.org/contract/230-owner-and-constructor-agreement-cost-of-work-plus-a-fee-with-gmp/
- https://www.csiresources.org/learning/practice-guides/pdpg
- https://www.bain.com/insights/rapid-tool-to-clarify-decision-accountability/
- https://www.atlassian.com/team-playbook/plays/daci
- https://support.procore.com/faq/who-can-be-designated-as-an-assignee-on-an-rfi
- https://support.procore.com/products/online/user-guide/project-level/rfi/tutorials/shift-the-ball-in-court-on-an-rfi
- https://help.autodesk.com/cloudhelp/ENG/Build-Submittals/files/admin-submittals/Submittals_Permissions.html
- https://help.autodesk.com/cloudhelp/ENG/Build-Submittals/files/work-submittals/Process_Submittal.html

## Prompt Sequencing Note

`Wave_11_Documentation_Closeout.md` is intentionally deferred to Prompt 05 so closeout reflects the complete Wave 11 documentation package.
