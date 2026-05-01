# Wave 10 Target Architecture — Permit & Inspection Control Center

Generated: 2026-05-01

## 1. Purpose

This document defines the Wave 10 target posture as a unified **Permit & Inspection Control Center**.

This is architecture documentation only. It does not authorize runtime implementation, backend routes, SPFx surfaces, package changes, app manifests, tenant activity, AHJ activity, or external-system integration.

## 2. Target Posture

Wave 10 will define a command-center model for permit lifecycle and required inspection readiness in one surface.

- The user-facing module name will be **Permit & Inspection Control Center**.
- Internal record/model families will remain `permits` and `required-inspections` for source continuity.
- Future implementation must keep AHJ interactions launcher-link only.
- Future implementation must keep Procore posture launcher/reference only unless separately authorized.
- Future implementation must preserve integration seams to Project Readiness, Priority Actions, Approvals / Checkpoints, HB Document Control Center, and External Systems.

## 3. Workbook-Source Posture

Prompt 01 workbook audit is the authoritative local source-truth basis for workbook lineage.

Field mapping categories:

- **Workbook-derived fields**: explicit worksheet columns and explicit validation/status structures.
- **Implied workbook usage**: fields implied by workbook structure or operational context but not explicitly constrained.
- **Target-architecture additions**: fields required by Wave 10 target posture that are not present in workbook source.
- **Ambiguous / future review**: fields needing additional policy/ownership decisions before implementation.

Explicit omission from current workbook source:

- permit `revision`
- permit `applicationValue`
- permit `permitFee`
- inspection `reInspectionFee`

These four fields are required **target-architecture additions** and are not workbook-derived fields.

## 4. Required Reinspection Lineage Model

Wave 10 target architecture will define reinspection lineage as a first-class internal PCC workflow concept:

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

Reinspection lineage is internal PCC workflow tracking only. It will not schedule, request, or update AHJ systems.

## 5. Status, Evidence, and Closeout Posture

Wave 10 target posture will define permit/inspection status tracking and exception handling with evidence-backed closeout.

- Future implementation must support failed inspection correction and reinspection transitions.
- Future implementation must treat evidence-backed closeout as the default posture.
- Future implementation may allow authorized override-by-reason controls for closeout exceptions.
- Future implementation must preserve business auditability across status transitions, ownership updates, and exception decisions.

## 6. Wave Relationship Guardrails

- Wave 8 will remain the shared Project Readiness framework seam owner.
- Wave 10 will define permit/inspection source posture and queue semantics that feed readiness and action surfaces.
- Wave 14 will remain the approvals/checkpoints authority surface for governed checkpoint decisions.

No statement in this document implies Wave 10 runtime shipment or implementation completion.
