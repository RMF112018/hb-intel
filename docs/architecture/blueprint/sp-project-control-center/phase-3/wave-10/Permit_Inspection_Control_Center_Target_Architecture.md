# Wave 10 Target Architecture — Permit & Inspection Control Center

Generated: 2026-05-01

## 1. Module Identity

### Official Wave Name

Phase 3 / Wave 10 — **Permit & Inspection Control Center**

### Legacy / Prior Name

Prior Wave 10 naming used **Permit Log**. Wave 10 target posture will define a unified permit/inspection command-center surface while preserving internal source families.

### Technical Interpretation

User-facing module identity will be unified. Internal source/model families will remain:

- `permits`
- `required-inspections`

## 2. Module Purpose

Wave 10 will define a governed project-control surface for permit lifecycle tracking, inspection readiness, failed/reinspection lineage, AHJ launcher visibility, fee exposure, evidence-backed closeout, and readiness/escalation integration.

## 3. Product Principles

- Unified operating surface: permits and inspections will be managed together.
- Exception-first UX: blockers, expirations, failures, missing evidence, and open fees will lead the surface.
- Source-of-record clarity: PCC internal workflow tracking will not claim legal AHJ authority.
- Launcher-only external posture: AHJ and Procore will remain launch/reference surfaces unless later-authorized.
- Evidence-backed closeout: closeout posture will require evidence or authorized override-by-reason.
- Planning-only architecture: this document defines target posture only and does not claim runtime shipment.

## 4. Source-of-Record Posture

- AHJ systems remain legal/regulatory source of record for permit and inspection authority.
- PCC remains internal workflow/accountability/readiness/audit source of record.
- Procore remains external system context/launcher/reference in Wave 10 target posture.
- No direct AHJ or Procore mutation behavior is authorized by this architecture.
- Field-level ownership and conflict rules are governed by `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`.

## 5. Command-Center UX Model

### 5.1 Primary Lanes

- Permit Lifecycle Lane
- Inspection Readiness Lane
- Failed / Reinspection Queue
- AHJ Launcher Panel

### 5.2 Permit Lifecycle Lane

The lane will define permit lifecycle states, ownership, dates, fee visibility, AHJ references, and exception escalation.

### 5.3 Inspection Readiness Lane

The lane will define inspection planning, call-in readiness, result posture, and follow-up requirements.

### 5.4 Failed / Reinspection Queue

Failed inspections will flow into corrective-action and reinspection lineage tracking with explicit parent/child traceability.

### 5.5 AHJ Launcher Panel

AHJ interaction posture remains launcher-link only. Wave 10 will not schedule, request, or update AHJ systems.

### 5.6 Record Detail Drawer

Permit and inspection records will expose lifecycle/status fields, ownership, date controls, evidence links, and audit history in a detail drawer pattern.

## 6. Workbook-Source Traceability Posture

Prompt 01 workbook audit is the authoritative local source evidence for workbook lineage.

Field classes:

- **Workbook-derived fields**: explicitly present in workbook headers/validation/status rules.
- **Implied workbook usage**: inferred workflow usage from workbook structure/context.
- **Target-architecture additions**: required Wave 10 fields not present in workbook source.
- **Ambiguous / future review**: fields requiring future decision/policy refinement.

Explicit workbook omissions from Prompt 01:

- permit `revision`
- permit `applicationValue`
- permit `permitFee`
- inspection `reInspectionFee`

These four fields are required target-architecture additions and are not workbook-derived fields.

## 7. Data Model

## 7.1 Permit Model

Planned permit record fields include:

- `permitId`
- `permitNumber`
- `permitType`
- `location`
- `description`
- `responsibleParty`
- `ahjName`
- `status`
- `dateRequired`
- `dateSubmitted`
- `dateReceived`
- `dateExpires`
- `revision` (target-added)
- `applicationValue` (target-added)
- `permitFee` (target-added)
- `comments`
- `evidenceLinks`
- `auditEvents`

## 7.2 Inspection Model

Planned inspection record fields include:

- `inspectionId`
- `inspectionNumber`
- `inspectionType`
- `inspectionCode`
- `relatedPermitId`
- `dateCalledIn`
- `scheduledWindow`
- `resultStatus`
- `comment`
- `verifiedOnline`
- `reinspectionRequired`
- `reInspectionFee` (target-added)
- `evidenceLinks`
- `auditEvents`

## 7.3 AHJ / Jurisdiction Profile Model

Planned AHJ profile fields include:

- `ahjId`
- `ahjDisplayName`
- `jurisdictionType`
- `portalUrl`
- `inspectionPortalUrl`
- `contactName`
- `contactPhone`
- `contactEmail`
- `cutoffNotes`
- `launcherOnly` (must remain true in Wave 10 target posture)

## 7.4 Fee Exposure Model

Planned fee exposure record fields include:

- `feeRecordId`
- `relatedRecordType` (`permit` or `inspection`)
- `relatedRecordId`
- `applicationValue`
- `permitFee`
- `reInspectionFee`
- `feeStatus`
- `invoiceReference`
- `receiptEvidenceLinks`
- `notes`

## 8. Status Model

## 8.1 Permit Statuses

Planned permit statuses:

- `not-started`
- `pending-application`
- `application-submitted`
- `pending-revision`
- `approved`
- `received`
- `active`
- `expiring`
- `expired`
- `void`
- `closed`

## 8.2 Inspection Statuses

Planned inspection statuses:

- `not-ready`
- `ready-to-request`
- `requested`
- `scheduled`
- `partial`
- `passed`
- `failed`
- `reinspection-required`
- `reinspection-scheduled`
- `closed`
- `not-applicable`

## 8.3 Fee Statuses

Planned fee statuses:

- `not-applicable`
- `open`
- `pending-receipt`
- `paid`
- `waived`
- `disputed`

## 8.4 Evidence Statuses

Planned evidence statuses:

- `not-required`
- `required-missing`
- `submitted`
- `verified`
- `override-approved`

## 9. Status Transition Rules

## 9.1 Permit Transition Rules

- `pending-application -> application-submitted`
- `application-submitted -> pending-revision | approved`
- `approved -> received -> active`
- `active -> expiring -> expired`
- `* -> void` requires authorized reason and audit event
- `active|expired -> closed` requires evidence-ready posture or authorized override-by-reason

## 9.2 Inspection Transition Rules

- `ready-to-request -> requested -> scheduled`
- `scheduled -> passed|partial|failed`
- `failed -> reinspection-required -> reinspection-scheduled -> passed|failed`
- `failed -> closed` allowed only with authorized no-reinspection decision and audit reason

## 10. Failed/Reinspection Lineage Requirement

Reinspection lineage is a first-class internal PCC workflow concept:

- `parentInspectionId`
- `childReinspectionId`
- `failedItemSummary`
- `correctiveActionOwner`
- `correctiveActionDueDate`
- `reinspectionRequired`
- `reinspectionRequestedDate`
- `reinspectionScheduledWindow`
- `reInspectionFee`
- `reinspectionResult`
- `evidenceLinks`
- `auditEvents`

Lineage remains internal PCC workflow tracking and will not schedule, request, or update AHJ systems.

## 11. Role / Action Model

Planned role/action posture includes:

- PM/PX/Superintendent/Coordinator operational update permissions by policy.
- Approvals / Checkpoints authority routing for gated decisions.
- Viewer/oversight roles with read-only posture for non-edit contexts.
- Permissioned actions for status updates, lineage creation, evidence confirmation, and exception override requests.

## 12. Priority Actions Generation Rules

Wave 10 will define action generation for:

- expiring or expired permits
- required inspections not requested/scheduled in target windows
- failed inspections awaiting corrective action or reinspection
- evidence-required records lacking evidence
- fee records in open/pending states

Priority Actions outputs will feed Project Home rail categories and downstream readiness escalation.

## 13. Project Readiness Integration

Wave 10 will provide normalized readiness signals into Wave 8 framework seams:

- permit blockers
- inspection blockers
- evidence blockers
- fee-risk posture
- confidence/supporting source lineage signals

Wave 10 does not alter Wave 8 framework ownership.

## 14. Approvals / Checkpoints Integration

Wave 10 will define checkpoint trigger seams for:

- closeout authorization
- no-reinspection exception approvals
- override-by-reason decisions for evidence/transition exceptions

Wave 14 remains approvals/checkpoints authority owner.

## 15. HB Document Control Center Evidence Posture

Wave 10 evidence links will reference governed project-record evidence locations. Wave 10 will not define binary-storage ownership.

- Evidence ownership remains HB Document Control Center / SharePoint project record.
- Wave 10 will define evidence-link requirements and verification state.
- Evidence-backed closeout remains default posture.

## 16. External Systems Posture

- AHJ: launcher links only.
- Procore: launcher/reference only in Wave 10 target posture.
- No direct runtime sync/writeback/automation behavior is implied.
- External systems may provide context links, not execution authority, in Wave 10 scope.

## 17. Template / Configuration Model

Planned configuration seams include:

- status-vocabulary policy controls (baseline locked, controlled admin extension)
- role/action policy map
- AHJ profile registry
- permit/inspection template families by project context
- readiness/escalation threshold settings
- evidence requirement policy toggles with audit controls

## 18. Reporting Model

Planned reporting outputs include:

- permit lifecycle summary by status and date risk
- inspection readiness and failure/reinspection trend views
- fee exposure summaries
- evidence coverage and closeout readiness posture
- readiness/priority-action rollups for PM/PX/executive views

## 19. Audit Model

Wave 10 will define business audit events for:

- status transitions
- ownership/responsibility changes
- lineage creation/update
- evidence state updates
- fee state updates
- override/approval events

Each event will capture actor, timestamp, prior/new values where applicable, reason/comment, and correlation context.

## 20. Import / Migration Model

Planned import/migration posture:

- workbook-to-target mapping with field taxonomy classes
- legacy workbook row import support with lineage metadata
- ambiguous-field holding posture for unresolved mappings
- migration provenance fields for workbook/sheet/row/source tags

## 21. Guardrails

- Architecture-only definition; no runtime implementation claims.
- No tenant mutation, no external-system mutation, no AHJ runtime integration.
- Preserve internal `permits` / `required-inspections` families for source continuity.
- Preserve Wave 10 relationship with Wave 8 (framework) and Wave 14 (approvals/checkpoints).
- Keep evidence-backed closeout and launcher-only external posture as non-negotiable defaults.

## 22. Acceptance Criteria

Wave 10 architecture definition is complete when:

- all required Prompt 03 sections are present in this file;
- workbook traceability posture and target-added fields are explicitly documented;
- failed/reinspection lineage is formalized as a first-class model;
- AHJ/Procore launcher-only posture is explicit;
- integration seams to Project Readiness, Priority Actions, Approvals / Checkpoints, HB Document Control Center, and External Systems are explicit;
- planning-only/non-shipped language is consistent across sections.

## 23. Implementation Exclusions

This Wave 10 architecture definition does not authorize or imply:

- backend route implementation
- SPFx surface implementation
- package/version/manifest changes
- tenant configuration or deployment actions
- AHJ portal mutation/request/scheduling activity
- Procore runtime sync/writeback activity
- Microsoft Graph or other external-system runtime mutations

## Cross-Reference: Procore Data-Layer Overlay Authority

Active machine-readable authority path:
`docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/artifacts/`

Interpretation bridge:

- Apply this wave document with the Prompt 03 governing-doc bridge in:
  - `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
  - `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`
  - `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md`
  - `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md`

Distinction lock:

- Wave 13 Buyout Log remains the active module wave.
- Wave 13A-13F is a cross-cutting Procore data-layer overlay.
- `wave-99-procore/_doc-updates` is prior planning context only.

Runtime guardrail lock:

- This cross-reference does not authorize Procore runtime, Procore sync, Procore write-back, Procore SDK adoption, or Procore file mirroring.
- Live Procore read behavior remains gated until 13A-13F completion and a separate approved live-read proof gate.
