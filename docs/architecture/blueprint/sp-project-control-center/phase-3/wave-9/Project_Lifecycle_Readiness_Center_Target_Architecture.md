# Project Lifecycle Readiness Center — Target Architecture

## 1. Document Purpose

This document defines the target architecture for **Project Control Center Phase 3 / Wave 9 — Project Lifecycle Readiness Center**.

Wave 9 replaces the prior narrow target of `Job Startup Checklist` with a flagship lifecycle-readiness module that uses the exact startup, safety, and closeout checklist source items as default item libraries, then converts those items into structured, role-aware, evidence-backed, auditable project controls.

The module must not be implemented as:

- one giant checklist table;
- three static tabs named Startup / Safety / Closeout;
- a PDF replacement;
- a Procore clone;
- a form dump;
- a dead-end compliance tracker.

The module is a project lifecycle readiness, risk, accountability, evidence, and action-control center.

## 2. Recommended Module Name

### User-facing name

```text
Project Lifecycle Readiness Center
```

### Internal architecture name

```text
Project Readiness & Lifecycle Controls
```

### Rationale

`Project Lifecycle Readiness Center` is clearer than `Job Startup Checklist` because the source items now span:

- contract review and project setup;
- job startup and mobilization;
- safety readiness and recurring jobsite risk categories;
- permits and services posted on the jobsite;
- document tracking;
- pre-Certificate of Occupancy requirements;
- inspections;
- turnover;
- post-turnover financial/legal follow-up;
- project closeout documents for PX review;
- PBC close-out requirements.

The module should remain within the existing PCC `project-readiness` surface, but it should operate as the flagship lifecycle-readiness module seeded by multiple checklist families.

## 3. Governing Context

### 3.1 Relationship to Wave 8

Wave 8 remains the **Project Readiness Module Framework**. Wave 9 depends on Wave 8 and should not reinvent the shared framework.

Wave 8 should provide or govern:

- shared item-level workflow patterns;
- common item statuses;
- owner / due-date / reviewer fields;
- evidence/reference hooks;
- audit trail patterns;
- readiness summary cards;
- source-reference mapping;
- module registry behavior.

Wave 9 consumes that framework and specializes it for lifecycle readiness using startup, safety, and closeout seed items.

### 3.2 Relationship to Project Readiness Surface

The existing PCC MVP `project-readiness` surface should remain the parent surface. Wave 9 should extend the surface from a simple module placeholder into a command-center readiness experience.

Recommended hierarchy:

```text
PCC
└── Project Readiness surface
    └── Project Lifecycle Readiness Center
        ├── Lifecycle command center
        ├── My readiness actions
        ├── Startup readiness
        ├── Safety readiness
        ├── Closeout readiness
        ├── Evidence and document readiness
        ├── Readiness blockers and exceptions
        ├── Gate approvals and checkpoints
        └── Audit / source traceability
```

## 4. Source Checklist Inputs

The default item library is seeded from checklist-definition files stored at:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/
```

This target architecture defines the lifecycle-readiness module contract and references the checklist-definition files as the governing default item source. It does not duplicate the full item inventory; implementation prompts must use the checklist-definition files and crosswalk documentation for exact seeded items and traceability.

The checklist definition files must preserve source traceability to the underlying PDFs:

```text
docs/reference/example/Project_Startup_Checklist.pdf
docs/reference/example/Project_Safety_Checklist.pdf
docs/reference/example/Project_Closeout_Checklist.pdf
```

Expected extracted source families:

| Family     | Source Template                                    | Primary Use                                                                                                               |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `startup`  | Job Start up Checklist                             | Contract review, job setup, mobilization, services/equipment, permits posted on jobsite.                                  |
| `safety`   | Jobsite Safety Checklist                           | High-risk safety categories and recurring jobsite safety readiness checks.                                                |
| `closeout` | Project Closeout & Pre Cert of Occupancy checklist | Document tracking, inspections, CO readiness, turnover, post-turnover, PX closeout documents, PBC close-out requirements. |

## 5. Product Thesis

The value of the module is not that it digitizes checklist rows. The value is that checklist-derived controls remain useful throughout the project lifecycle.

The module should answer:

- What must be ready before the project starts?
- What is blocking mobilization?
- What safety readiness risks need action?
- What closeout items need to start now, even though turnover is months away?
- What evidence is missing?
- Who owns each unresolved item?
- Which items are overdue, blocked, or waiting on an external party?
- Which readiness gates need PM, PX, Safety, Accounting, Owner, Architect, AHJ, or executive review?
- What source checklist item created this project-control obligation?
- What actions should be promoted into Priority Actions?
- What documentation will be needed for turnover, closeout, audit, or lessons learned?

## 6. Scope Model

### 6.1 In Scope

Wave 9 documentation should define the architecture for:

- startup, safety, and closeout checklist families;
- source-seeded default item library;
- lifecycle phase classification;
- readiness domain classification;
- item type classification;
- criticality and risk tagging;
- role/action authority model;
- evidence/document link contract;
- readiness scoring;
- gate/checkpoint model;
- exception and escalation model;
- template vs project-instance model;
- audit and source traceability model;
- Priority Actions integration posture;
- Approvals / Checkpoints integration posture;
- HB Document Control Center evidence posture;
- Procore / Sage / external-system reference posture;
- flagship SPFx UX direction;
- read-model and fixture/mock-provider target architecture;
- acceptance criteria and validation plan.

### 6.2 Out of Scope for Wave 9 Documentation Update

This documentation update does not authorize:

- SPFx implementation;
- backend runtime implementation;
- backend write-route implementation;
- parser/importer implementation;
- generated production schemas;
- live SharePoint list provisioning;
- live Graph/PnP calls;
- Procore runtime integration;
- Sage runtime integration;
- Document Crunch / Adobe Sign runtime integration;
- safety-platform runtime integration;
- tenant mutation;
- package/deployment work;
- workflow execution;
- live notification;
- production rollout.

## 7. Module Boundary Decisions

### 7.1 Primary owner

Project Lifecycle Readiness Center owns lifecycle readiness status and project-specific checklist-derived workflow state.

### 7.2 Adjacent module relationships

| Adjacent Module               | Relationship                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Project Home / Command Center | Displays readiness rollups, blockers, and executive summary cards.                                              |
| Priority Actions Rail         | Receives overdue, blocked, missing-evidence, failed-safety, approval-needed, and gate-blocking readiness items. |
| HB Document Control Center    | Stores or links evidence documents; provides document source references.                                        |
| Approvals / Checkpoints       | Handles PM/PX/Safety/Accounting/AHJ/Owner/Architect/executive approvals and gate decisions.                     |
| Responsibility Matrix         | Supplies owner/accountability defaults when available; shows assigned readiness responsibilities.               |
| Team & Access                 | Helps resolve ownership gaps and missing-access blockers.                                                       |
| Permit Log                    | May own detailed permit records; Wave 9 may show permit-posting readiness and link to Permit Log.               |
| Site Health                   | Reports source/configuration health for readiness module data sources.                                          |
| External Systems              | Supplies launch links and missing-mapping states for Procore, Sage, Outlook, utilities, or other references.    |

### 7.3 Avoiding module sprawl

Items should be classified as one of:

- **Owned** by Lifecycle Readiness Center.
- **Linked** to another PCC module but visible in lifecycle readiness.
- **External reference** to a system of record outside PCC.
- **Deferred** for a later implementation phase.

## 8. Lifecycle Phase Model

Use lifecycle phase classification to avoid a static three-tab checklist.

Recommended lifecycle phases:

| Phase ID                       | Display Name                           | Description                                                                                  |
| ------------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------- |
| `contract-review`              | Contract Review                        | Owner contract, savings, contingency, LDs, special terms, allowances.                        |
| `startup-readiness`            | Startup Readiness                      | Job setup, accounting, Procore, budget, schedule, turnover, insurance, NOC/NTO, job files.   |
| `mobilization-readiness`       | Mobilization Readiness                 | Services/equipment, utilities, field office, trailer, signage, first aid/fire extinguishers. |
| `permit-ahj-readiness`         | Permit / AHJ Readiness                 | Permits posted, preconstruction meetings, AHJ checklists, plan changes, approvals.           |
| `safety-readiness`             | Safety Readiness                       | High-risk safety exposure checks and recurring jobsite safety categories.                    |
| `active-construction-controls` | Active Construction Controls           | Recurring readiness controls that remain visible during active construction.                 |
| `pre-co-readiness`             | Pre-Certificate of Occupancy Readiness | CO/TCO blockers, final inspections, surveys, certifications, AHJ requirements.               |
| `turnover-readiness`           | Turnover Readiness                     | Punch list, as-builts, warranties, manuals, attic stock, owner meetings, CO distribution.    |
| `post-turnover-closeout`       | Post-Turnover / Financial Closeout     | Final payment, lien timing, photos, recommendation letter, file return, PX closeout package. |
| `warranty-lessons-learned`     | Warranty / Lessons Learned             | Lessons learned, recommendation letters, post-completion handoff, future knowledge capture.  |

## 9. Readiness Domain Model

Readiness domains group items by business concern.

Recommended domains:

| Domain ID               | Display Name            | Examples                                                                        |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| `contract-commercial`   | Contract / Commercial   | LDs, savings clause, contingency, SOV, owner contract.                          |
| `financial-accounting`  | Financial / Accounting  | Job setup in Accounting, budget roll, final payment, liens, release of liens.   |
| `systems-setup`         | Systems Setup           | Procore setup, Sage budget transfer, Outlook reminders, external mappings.      |
| `documents-records`     | Documents / Records     | Job files, drawings/specs, as-builts, manuals, certificates, reports.           |
| `insurance-risk`        | Insurance / Risk        | Bonding, SDI, COI, builder's risk, owner insurance, NOC/NTO.                    |
| `schedule-planning`     | Schedule / Planning     | Project schedule, turnover meetings, logistics plan.                            |
| `safety-qaqc`           | Safety / QAQC           | Safety plan, SDS notebook, fall/electrical/struck-by/crushed-by risks, PPE.     |
| `field-mobilization`    | Field Mobilization      | Services, equipment, signage, utilities, trailer, sanitary.                     |
| `permit-ahj`            | Permit / AHJ            | Permits, inspections, health department, fire, utilities, PBC requirements.     |
| `owner-turnover`        | Owner Turnover          | CO copy, punch list, warranties, manuals, attic stock, appreciation letter.     |
| `closeout-compliance`   | Closeout Compliance     | CO, CC, surveys, certifications, final inspections, private provider letters.   |
| `knowledge-performance` | Knowledge / Performance | Lessons learned, project recap, subcontractor evaluation, cost variance report. |

## 10. Item Type Model

Each source item must be classified by type so the UX and logic can vary by need.

| Item Type                   | Description                                                        | Example Behavior                                                   |
| --------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `verification`              | User confirms status.                                              | Yes / No / N/A or Complete / Not Complete.                         |
| `evidence-required`         | Requires document/photo/certificate/link evidence.                 | Cannot mark complete unless evidence exists or waiver is approved. |
| `date-capture`              | Captures date or creates reminder date.                            | Date field, reminder, statutory timer.                             |
| `approval-checkpoint`       | Requires approval/review.                                          | Sends read-model prompt to Approvals / Checkpoints.                |
| `external-system-reference` | Refers to Procore, Sage, Outlook, utilities, AHJ, or other system. | Show external reference and missing configuration states.          |
| `risk-control`              | Controls a safety/legal/financial/compliance risk.                 | Higher scoring weight, priority action on fail/block.              |
| `recurring-inspection`      | Safety or field control that can recur.                            | Supports snapshot history by inspection period.                    |
| `document-tracking`         | Tracks receipt/completion of documents.                            | Evidence list + Document Control link.                             |
| `future-closeout-exposure`  | Should be visible early although due later.                        | Appears in long-range closeout readiness.                          |
| `reference-only`            | Informational or deferred item.                                    | Visible but not completion-gated in current phase.                 |

## 11. Criticality Model

Use criticality to drive scoring, sorting, and escalation.

| Criticality     | Meaning                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| `critical`      | Blocks startup, occupancy, life safety, statutory/legal protection, or turnover. |
| `high`          | Material risk to schedule, owner turnover, financial closeout, or compliance.    |
| `medium`        | Important operational control, but not gate-blocking by default.                 |
| `low`           | Useful but not material to readiness gate.                                       |
| `informational` | Reference or future-planning item.                                               |

Recommended high-priority risk tags:

- `life-safety`
- `fall-exposure`
- `electrical-risk`
- `struck-by-risk`
- `crushed-by-risk`
- `insurance`
- `lien-rights`
- `certificate-of-occupancy`
- `permit`
- `ahj`
- `owner-turnover`
- `financial-closeout`
- `contract-risk`
- `documentation`
- `external-dependency`

## 12. Template vs Project Instance Model

Separate master definitions from project-specific workflow state.

### 12.1 Template item library

The template item library is the normalized library seeded from the PDFs/checklist-definition files.

Fields:

```ts
interface LifecycleReadinessTemplateItem {
  templateItemId: string;
  family: 'startup' | 'safety' | 'closeout';
  sourceDocument: string;
  sourceDocumentVersion?: string;
  sourcePage?: number;
  sourceSection: string;
  sourceItemNumber: string;
  sourceItemText: string;
  sourceResponseOptions?: readonly string[];
  normalizedTitle: string;
  lifecyclePhase: LifecycleReadinessPhase;
  readinessDomain: LifecycleReadinessDomain;
  itemType: LifecycleReadinessItemType;
  criticality: LifecycleReadinessCriticality;
  riskTags: readonly string[];
  defaultOwnerRole?: PccPersona | string;
  defaultReviewerRole?: PccPersona | string;
  evidenceRequirement: EvidenceRequirementPolicy;
  externalSystemRefs?: readonly ExternalSystemRef[];
  defaultGateImpact?: ReadinessGateImpact;
  activeByDefault: boolean;
  classificationNotes?: string;
}
```

### 12.2 Project item instance

A project instance is created from a template item and records project-specific state.

Fields:

```ts
interface LifecycleReadinessProjectItem {
  projectItemId: string;
  projectId: string;
  templateItemId: string;
  family: 'startup' | 'safety' | 'closeout';
  status: LifecycleReadinessStatus;
  ownerRole?: PccPersona | string;
  ownerUserId?: string;
  reviewerRole?: PccPersona | string;
  dueDate?: string;
  completedAtUtc?: string;
  completedBy?: string;
  notApplicableReason?: string;
  deferredReason?: string;
  blockedReason?: string;
  exceptionCode?: LifecycleReadinessExceptionCode;
  evidenceLinks: readonly EvidenceLink[];
  approvalCheckpointIds?: readonly string[];
  priorityActionIds?: readonly string[];
  auditEventIds: readonly string[];
  projectOverride?: ProjectItemOverrideSummary;
}
```

### 12.3 Project-specific overrides

Allowed overrides should include:

- add project-specific item;
- deactivate default item with reason;
- mark item not applicable with reason;
- change owner;
- change reviewer;
- change due date;
- change evidence requirement only with authorized override;
- add project-specific criticality or risk tag;
- reopen completed item.

Master template items must not be mutated by project-specific overrides.

## 13. Status Model

Recommended statuses:

| Status           | Meaning                                           |
| ---------------- | ------------------------------------------------- |
| `not-started`    | Item has not started.                             |
| `in-progress`    | Work is underway.                                 |
| `blocked`        | Item cannot proceed without resolution.           |
| `needs-evidence` | Required evidence is missing.                     |
| `needs-review`   | Work is complete but needs review.                |
| `approved`       | Required reviewer approved.                       |
| `returned`       | Reviewer returned item for correction.            |
| `complete`       | Item is complete.                                 |
| `failed`         | Safety/inspection/readiness check failed.         |
| `deferred`       | Item deferred with reason.                        |
| `not-applicable` | Item not applicable with reason.                  |
| `waived`         | Requirement waived by authorized role with audit. |

## 14. Exception Model

Recommended exception codes:

| Code                             | Meaning                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| `blocked-by-owner`               | Owner action, information, payment, insurance, or approval is blocking the item.                |
| `blocked-by-ahj`                 | AHJ, Building Department, Fire, Health Department, utility, or PBC action is blocking the item. |
| `blocked-by-subcontractor`       | Subcontractor document, work, or response is blocking the item.                                 |
| `blocked-by-design-team`         | Architect/engineer action is blocking the item.                                                 |
| `awaiting-internal-approval`     | Internal PM/PX/Safety/Accounting/IT approval required.                                          |
| `awaiting-external-system-setup` | Procore, Sage, Outlook, utility, or other setup is incomplete.                                  |
| `evidence-missing`               | Required document/evidence is missing.                                                          |
| `failed-safety-check`            | Safety check failed and requires follow-up.                                                     |
| `statutory-deadline-risk`        | Date-based legal/statutory deadline requires attention.                                         |
| `ready-for-review`               | Item is ready for reviewer decision.                                                            |

## 15. Evidence and Document Link Model

### 15.1 Evidence source of record

The HB Document Control Center / SharePoint project record is the evidence/document source of record for Wave 9. Procore and other systems may provide external references or lineage links, but they do not own Wave 9 completion state.

### 15.2 Evidence policy

Each item needs an evidence policy:

```ts
type EvidenceRequirementPolicy =
  | 'none'
  | 'optional'
  | 'required-before-complete'
  | 'required-before-approval'
  | 'conditional'
  | 'external-reference-only';
```

### 15.3 Evidence link fields

```ts
interface EvidenceLink {
  evidenceId: string;
  evidenceType:
    | 'document'
    | 'certificate'
    | 'letter'
    | 'permit'
    | 'inspection-result'
    | 'photo-video'
    | 'meeting-record'
    | 'external-system-record'
    | 'email-record'
    | 'manual-note';
  title: string;
  sourceSystem:
    | 'sharepoint'
    | 'procore'
    | 'sage'
    | 'outlook'
    | 'external-url'
    | 'manual'
    | 'unknown';
  documentControlSourceKey?: string;
  url?: string;
  fileId?: string;
  capturedBy?: string;
  capturedAtUtc?: string;
  verificationStatus?: 'unverified' | 'verified' | 'rejected' | 'waived';
}
```

### 15.4 Evidence examples by item type

| Item Area | Evidence Examples                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Startup   | Owner contract terms, COI, NOC, NTO certified mail receipt, schedule, logistics plan, safety plan, SDS notebook.                                       |
| Safety    | Safety inspection record, photo, JHA, corrective action record, training record.                                                                       |
| Closeout  | CO/CC, surveys, certificates, warranty letters, O&M manuals, lien releases, as-builts, final inspection approvals, private provider completion letter. |

## 16. Role / Action Authority Model

Use repo-truth PCC personas where available. Do not invent runtime authorization; this is planning/read-model authority documentation until implementation is authorized.

### 16.1 Core roles

Minimum roles to evaluate:

- PCC Admin
- IT / Tenant Admin
- Executive Oversight
- Project Executive
- Project Manager
- Superintendent
- Project Accounting
- Safety / QAQC
- Manager of Operational Excellence
- Estimating Coordinator
- Lead Estimator
- Project Coordinator
- Project Team Member
- Project Viewer
- External Contributor
- Owner / Client Viewer, if future external visibility is approved
- Subcontractor Limited, if future external visibility is approved

If the current model lacks some roles, document the gap and do not hard-code missing personas without explicit model-update approval.

### 16.2 Actions

Recommended action vocabulary:

| Action               | Description                                  |
| -------------------- | -------------------------------------------- |
| `view`               | View item and summary.                       |
| `complete`           | Mark item complete.                          |
| `fail`               | Mark safety/readiness item failed.           |
| `mark-na`            | Mark item not applicable.                    |
| `defer`              | Defer item with reason.                      |
| `assign-owner`       | Assign/reassign owner.                       |
| `change-due-date`    | Change due date/reminder date.               |
| `attach-evidence`    | Add evidence link/document reference.        |
| `remove-evidence`    | Remove evidence link with audit.             |
| `request-review`     | Submit item for review/approval.             |
| `approve`            | Approve item/checkpoint.                     |
| `return`             | Return item for correction.                  |
| `waive`              | Waive requirement with reason and authority. |
| `override-status`    | Administrative status override.              |
| `reopen`             | Reopen completed item.                       |
| `configure-template` | Configure default template/library rules.    |
| `export`             | Export readiness/evidence package.           |
| `view-audit`         | View audit history.                          |

### 16.3 Authority guidance

| Role                                    | Expected Authority                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| PCC Admin                               | Configure templates, override status, view audit, administer module settings.                                            |
| IT / Tenant Admin                       | Technical configuration visibility only; no business completion authority by default.                                    |
| Executive Oversight                     | Read-only portfolio/project drill-in; may receive escalations; no default completion authority.                          |
| Project Executive                       | Approve gates, override/defer with audit, view all, escalate unresolved blockers.                                        |
| Project Manager                         | Primary owner for startup/closeout readiness; assign owners, complete many items, request/approve reviews where allowed. |
| Superintendent                          | Own/complete field mobilization, jobsite safety readiness, permit posting, site services, inspection readiness items.    |
| Project Accounting                      | Own/complete accounting, final payment, lien, financial closeout support items.                                          |
| Safety / QAQC                           | Own/review safety readiness and failed safety checks.                                                                    |
| Manager of Operational Excellence       | Review governance/process readiness and cross-project exceptions.                                                        |
| Estimating Coordinator / Lead Estimator | Support turnover from estimating, estimate review, bid/qualification handoff, preconstruction setup.                     |
| Project Coordinator                     | Support document/evidence follow-up, closeout package assembly, meeting records, notices.                                |
| Project Team Member                     | Complete assigned items and attach evidence where authorized.                                                            |
| Project Viewer                          | View only unless explicitly granted assignment-specific completion.                                                      |

### 16.4 Action boundary clarifications

- `approve` confirms reviewer/checkpoint acceptance and must not silently perform `waive` or `override-status`.
- `waive` records a policy exception with explicit reason/authority and does not imply `complete`.
- `override-status` is administrative correction authority and must always emit an auditable reason/event.
- `reopen` is a controlled transition from complete/approved/waived back to actionable state with reason.
- `configure-template` is restricted to template/library governance and does not mutate historical item-source lineage.
- `view-audit` is read-only access to lifecycle readiness audit trails and does not imply edit authority.

### 16.5 Shared-model role alignment gap handling

If shared PCC persona models do not currently include a required role name, documentation should map that role to the nearest existing governance persona for planning/read-model posture and explicitly defer a model update decision. This Prompt 05 refinement does not authorize shared-model enum/type mutations.

## 17. Readiness Scoring Model

### 17.1 Scoring principles

Do not rely on raw percent complete alone. Use layered scoring so leadership can distinguish harmless incomplete items from gate-blocking risk.

Metric definitions:

- `completionPercent`: `(complete + approved + waived + mark-na where applicable) / active applicable items`.
- `requiredReadinessPercent`: percent of required non-optional items in complete/approved/waived states.
- `evidenceReadinessPercent`: percent of required evidence obligations satisfied per policy.
- `approvalReadinessPercent`: percent of required checkpoint items in approved (or approved-with-exceptions) state.
- `riskWeightedReadinessScore`: weighted aggregate of readiness state by `criticality` and `riskTags` with blocker/failure penalties.
- `blockedItemCount`: active items in blocked categories.
- `overdueItemCount`: active items past due date.
- `failedSafetyItemCount`: safety items in failed state.
- `gateBlockingItemCount`: items marked gate-blocking for the active or next lifecycle gate.

Recommended score dimensions:

| Score                        | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `completionPercent`          | Completed items divided by active applicable items. |
| `requiredReadinessPercent`   | Required non-optional items complete/approved.      |
| `evidenceReadinessPercent`   | Required evidence satisfied.                        |
| `approvalReadinessPercent`   | Required checkpoints approved.                      |
| `riskWeightedReadinessScore` | Weighted score based on criticality and risk tags.  |
| `blockedItemCount`           | Number of blocked items.                            |
| `overdueItemCount`           | Number of overdue items.                            |
| `failedSafetyItemCount`      | Number of failed safety controls.                   |
| `gateBlockingItemCount`      | Items blocking phase/gate transition.               |

### 17.2 Gate readiness

Recommended gates:

| Gate                        | Blocks / Informs                                             |
| --------------------------- | ------------------------------------------------------------ |
| `contract-review-ready`     | Contract awareness, commercial risk, allowances, LDs.        |
| `startup-ready`             | Job setup readiness before active project execution.         |
| `mobilization-ready`        | Field/service/equipment readiness before mobilization.       |
| `safety-ready`              | High-risk safety controls before and during active work.     |
| `permit-ahj-ready`          | Permit and AHJ readiness.                                    |
| `pre-co-ready`              | TCO/CO readiness.                                            |
| `turnover-ready`            | Owner turnover readiness.                                    |
| `financial-closeout-ready`  | Final payment/lien/release/subcontractor closeout readiness. |
| `project-closeout-complete` | Internal PX closeout package and lessons learned readiness.  |

### 17.3 Gate outcomes

```ts
type ReadinessGateState =
  | 'not-started'
  | 'in-progress'
  | 'ready'
  | 'blocked'
  | 'approved'
  | 'approved-with-exceptions'
  | 'not-applicable';
```

## 18. Priority Actions Integration

Items should produce priority actions when they are:

- blocked;
- overdue;
- failed safety checks;
- missing required evidence;
- awaiting approval;
- gate-blocking;
- statutory/date sensitive;
- assigned to the current viewer;
- tied to missing external-system setup;
- escalated by PM/PX/Safety/Accounting.

Priority action categories should align with existing PCC rail posture:

- readiness blockers;
- approval checkpoints;
- access requests only if an owner cannot act due to access;
- external-system mapping prompts.

Priority Actions should consume Wave 9 signals in read-model/posture form only during this documentation phase; no runtime queue mutation is authorized by Prompt 05.

## 19. Approvals / Checkpoints Integration

Wave 9 should define approval checkpoint needs without implementing live approval execution.

Policy distinction:

- `required-before-complete`: completion transition blocked until evidence/requirements are satisfied or formally waived.
- `required-before-approval`: review/approval transition blocked until required review artifacts/evidence are present.

Recommended checkpoint types:

| Checkpoint Type              | Typical Authority                                       |
| ---------------------------- | ------------------------------------------------------- |
| Startup readiness gate       | PM / PX                                                 |
| Mobilization readiness gate  | PM / Superintendent / PX                                |
| Safety readiness review      | Safety / QAQC, Superintendent, PM                       |
| Permit/AHJ readiness         | PM / Superintendent; AHJ evidence as external reference |
| Pre-CO readiness             | PM / Superintendent / PX                                |
| Turnover readiness           | PM / PX / Owner representative reference                |
| Financial closeout readiness | PM / Project Accounting / PX                            |
| Template waiver/override     | PCC Admin / PX / Manager of Operational Excellence      |

## 20. Safety Readiness Model

Safety items differ from startup and closeout because they may be recurring or periodic.

Safety checklist behavior should support:

- risk category item definitions;
- pass/fail/N/A response options;
- recurring inspection snapshots;
- failed-item corrective action linkage;
- Safety / QAQC reviewer role;
- Superintendent ownership visibility;
- leading-indicator reporting;
- historical trend readiness for future analytics;
- escalation for repeated failed categories.

Wave 9 may document this as target architecture even if runtime implementation is deferred.

## 21. Closeout-From-Day-One Model

Closeout should not appear only at the end of a project.

The module should surface early closeout exposure for:

- as-builts requested from subcontractors;
- RFI closure;
- submittal closure;
- change order approval;
- certificates and surveys;
- O&M manuals;
- warranty letters;
- attic stock;
- lien releases;
- final payment forms;
- lessons learned;
- subcontractor evaluations;
- project recap and cost variance report.

Recommended UX label:

```text
Future Closeout Exposure
```

This allows PM/PX/Superintendent/Project Coordinator to see future closeout risks during active construction.

## 22. External-System Posture

### 22.1 Procore

Procore remains an external project-management system. Wave 9 must not clone Procore forms or use Procore as the source of truth for lifecycle readiness completion state.

System-of-record ownership boundaries for lifecycle readiness, linked Procore records, and derived readiness posture are governed by `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`.

Allowed architecture posture:

- deep link to relevant Procore records;
- reference Procore setup status;
- store Procore object IDs/URLs as lineage fields where applicable;
- show missing Procore setup/mapping as a readiness blocker or external-system prompt.

Forbidden in this documentation update:

- Procore API runtime;
- Procore write-back;
- Procore form clone;
- full Procore mirror;
- completion state stored only in Procore.

### 22.2 Sage / Accounting

Sage/accounting-related readiness items should be tracked in PCC as checklist-derived controls, with any Sage-specific state treated as external reference unless later integration is authorized.

### 22.3 Outlook / Utilities / AHJ / Other Systems

These should be modeled as external references or manual evidence records until a later integration phase authorizes more.

## 23. UX Architecture

### 23.1 Recommended UX model

The flagship UX should be a command center with progressive disclosure.

Primary regions:

1. **Readiness Hero** — project lifecycle readiness score, active gate, major blockers, risk-weighted status.
2. **Lifecycle Map** — contract review → startup → mobilization → safety → active controls → pre-CO → turnover → post-turnover.
3. **My Readiness Actions** — role-filtered action queue for assigned user/persona.
4. **Readiness Domains** — card grid by contract, financial, systems, documents, insurance, safety, permits, turnover, closeout.
5. **Blockers & Exceptions** — blocked, overdue, failed, missing evidence, awaiting approval.
6. **Evidence Readiness** — missing/required evidence rollup with Document Control links.
7. **Future Closeout Exposure** — early warning area for closeout items not yet due but likely to cause late risk.
8. **Item Detail Drawer** — source traceability, status, owner, due date, evidence, comments, audit, approvals, source item text.
9. **Template / Source View** — admin-only review of seed library and project overrides.
10. **Audit / History View** — PM/PX/Admin-visible change history.

Implementation-readiness intent:

- The flagship UX above defines the target interaction model for later code waves.
- It is explicitly not a giant static checklist, simple three-tab interface, PDF-first UI, or form dump.

### 23.2 Views / lenses

Recommended filter lenses:

- My Actions
- Startup Gate
- Mobilization Gate
- Safety Readiness
- CO / Turnover Readiness
- Missing Evidence
- Overdue / Blocked
- Awaiting Approval
- Owner / Architect / AHJ Dependencies
- Accounting / Financial Closeout
- Executive Summary
- Source Checklist View

### 23.3 Anti-patterns

Do not build:

- a long static table as the default experience;
- three top-level checklist tabs as the core IA;
- a PDF viewer as the main interaction;
- a generic data grid with no readiness interpretation;
- separate disconnected startup, safety, and closeout modules unless the architecture explicitly links them through lifecycle rollups and shared item instances.

## 24. Read-Model Target Architecture

### 24.1 Read model

Recommended read-model addition:

```ts
interface PccLifecycleReadinessReadModel {
  summary: LifecycleReadinessSummary;
  gates: readonly LifecycleReadinessGate[];
  domains: readonly LifecycleReadinessDomainSummary[];
  lifecyclePhases: readonly LifecycleReadinessPhaseSummary[];
  myActions: readonly LifecycleReadinessAction[];
  blockers: readonly LifecycleReadinessBlocker[];
  evidenceSummary: LifecycleReadinessEvidenceSummary;
  futureCloseoutExposure: readonly LifecycleReadinessExposureItem[];
  templateLibrarySummary: LifecycleTemplateLibrarySummary;
  sampleItems: readonly LifecycleReadinessProjectItem[];
  sourceTraceability: readonly LifecycleReadinessSourceReference[];
  auditSample?: readonly LifecycleReadinessAuditEvent[];
}
```

### 24.2 Envelope posture

Use existing PCC read-model envelope semantics:

- read-only;
- deterministic fixture/mock/local mode;
- source status warnings;
- viewer persona passthrough;
- no mutation.

### 24.3 Backend route target

Future target route, subject to implementation authorization:

```text
GET /api/pcc/projects/{projectId}/lifecycle-readiness
```

No write route is authorized by this documentation update.

## 25. Fixture and Mock Provider Requirements

Future implementation should include deterministic fixtures for:

- fully healthy project;
- startup blocked project;
- safety failed project;
- closeout exposure project;
- missing evidence project;
- unknown project;
- backend unavailable;
- unauthorized/forbidden persona display state;
- archived/read-only project.

Fixtures should include source-traceable items from the saved checklist-definition files.

## 26. Source Traceability Contract

Every seeded item must include:

```ts
interface LifecycleReadinessSourceReference {
  sourceDocument: string;
  sourceDocumentPath: string;
  sourceDocumentVersion?: string;
  sourcePage?: number;
  sourceSection: string;
  sourceItemNumber: string;
  sourceItemText: string;
  sourceResponseOptions?: readonly string[];
  extractedAtUtc?: string;
  extractedBy?: 'manual' | 'pdf-text' | 'pdf-image-review' | 'agent-assisted';
  normalizedItemId: string;
  notes?: string;
}
```

Source item text must remain exact. Normalized titles/classifications may be added separately but must not overwrite the source text.

## 27. Audit Model

Audit events should capture:

- template version applied;
- project item created;
- status changed;
- owner changed;
- due date changed;
- evidence added/removed;
- item marked N/A;
- item deferred;
- item waived;
- item approved/returned;
- priority action generated/resolved;
- gate state changed;
- item reopened;
- export generated.

Audit fields:

```ts
interface LifecycleReadinessAuditEvent {
  auditEventId: string;
  projectId: string;
  projectItemId?: string;
  eventType: string;
  actorUserId?: string;
  actorPersona?: PccPersona | string;
  occurredAtUtc: string;
  previousValue?: unknown;
  newValue?: unknown;
  reason?: string;
  source?: 'user' | 'system' | 'template-seed' | 'import' | 'admin-override';
}
```

## 28. Export / Reporting Target

Future export/reporting support should be considered in the data model, even if not implemented in Wave 9.

Potential exports:

- Startup readiness report.
- Safety readiness summary.
- CO readiness report.
- Owner turnover evidence package.
- PX closeout package.
- Missing evidence register.
- Gate approval history.
- Audit trail export.

## 29. Documentation Updates Required

At minimum, update:

- Phase 3 roadmap references where Wave 9 currently says `Job Startup Checklist`.
- Phase 3 implementation plan where Wave 9 is defined as an item-level startup workflow module.
- PCC target architecture module map and Project Home rollup language where needed.
- Workflow module register if it lists Wave 9 or startup checklist module scope.
- MVP scope if it lists `Job Startup Checklist` as a narrow module.
- Add this target architecture file under the Wave 9 blueprint/phase documentation path.

Recommended target file path:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Target_Architecture.md
```

If the repo uses a different existing Wave 9 folder convention, follow repo truth and document the path decision.

## 30. Acceptance Criteria

Wave 9 documentation update is accepted when:

1. Wave 9 is consistently redefined as `Project Lifecycle Readiness Center` or an explicitly approved equivalent name.
2. Documentation clearly states that the module uses startup, safety, and closeout checklist definition files as seed sources.
3. The old `Job Startup Checklist` wording remains only as source-template context, not as the module name/architecture target.
4. The target architecture file exists and covers lifecycle phases, domains, item types, criticality, role/action authority, evidence, scoring, source traceability, audit, UX, read-model, fixture, and integration posture.
5. The default item library is referenced with exact source traceability requirements.
6. Documentation prevents the three-tab/static checklist/PDF replacement anti-pattern.
7. Wave 8 dependency remains clear.
8. Priority Actions, Approvals/Checkpoints, HB Document Control Center, Responsibility Matrix, Team & Access, External Systems, Site Health, Procore, Sage, and SharePoint relationships are described accurately and conservatively.
9. No code/runtime/deployment/tenant changes are introduced.
10. Validation passes and lockfile remains unchanged.

## 31. Open Decisions to Record

The documentation update should record these as open or deferred unless the user provides explicit decisions:

| Decision                                                                            | Default Recommendation                                                                |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Should missing repo personas such as Project Coordinator be added to shared models? | Defer; document role need and do not hard-code without separate model prompt.         |
| Should safety checks recur on a schedule in MVP?                                    | Target architecture yes; runtime recurrence deferred.                                 |
| Should project teams be able to add custom readiness items?                         | Yes, with audit and without mutating master template library.                         |
| Should external parties complete items directly?                                    | No by default; future external visibility requires separate approval.                 |
| Should Procore checklist completion remain accepted as source state?                | No; Procore is external reference only unless later approved.                         |
| Should evidence be mandatory for all closeout items?                                | Conditional by item classification; high-risk document items should require evidence. |
| Should readiness scoring block phase transition?                                    | Target architecture should support gates; enforcement deferred until implementation.  |

## 32. Summary

Project Lifecycle Readiness Center transforms checklist artifacts into a living lifecycle-control plane. The startup, safety, and closeout items become structured project obligations with owners, evidence, risk, due dates, approvals, blockers, exceptions, and audit history.

The module should give checklist data ongoing operational value before, during, and after completion.
