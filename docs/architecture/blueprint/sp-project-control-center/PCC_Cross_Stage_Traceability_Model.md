# PCC Cross-Stage Traceability Model

## Required Thesis

PCC must model cross-stage relationships between estimate, scope, vendor, commitment, submittal, product, field execution, closeout, warranty, and lessons records without taking source ownership from originating systems.

## Relationship Model

Traceability is represented as governed relationship edges between source-owned or PCC-native records. Traceability references support continuity, evidence review, and grounded reasoning.

## Relationship Examples

- estimate line item -> scope package
- scope package -> bid package
- bid package -> subcontractor/vendor
- commitment -> scope package
- submittal -> approved product/material
- approved product/material -> vendor/subcontractor
- RFI/ASI/CCD/change event -> scope/commitment/schedule impact
- inspection/punch item -> responsible scope/vendor
- closeout document -> product/vendor/system
- warranty claim -> approved product/vendor/commitment/closeout evidence
- lesson learned -> future estimating reference

## Conceptual Record Definitions

### `ProjectTraceabilityEdge`

Represents a directional relationship between two governed record references with source lineage metadata.

### `TraceabilityRelationshipType`

Defines allowed relationship semantics such as `supports`, `depends-on`, `approved-by`, `fulfilled-by`, `installed-by`, `evidenced-by`, and `learned-from`.

### `TraceabilityConfidence`

Defines confidence grading for relationship quality (for example `verified`, `probable`, `candidate`) and requires evidence posture for non-verified edges.

### `TraceabilityEvidenceReference`

Links an edge to supporting evidence/source references with permission-aware access controls.

## Guardrails

- Traceability never reassigns source ownership.
- Traceability edges must retain source lineage.
- Evidence references are required for high-impact decisions and warranty-sensitive conclusions.
- Cross-project trace queries require explicit authorization.

## Phase 14 Authority Addendum (2026-05-04)

Wave 14 authority path is `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/`.

Phase 14 / Wave 14 is the PCC-native approval/checkpoint control layer and owns checkpoint queue semantics, route-step semantics, decision semantics, audit-event semantics, and decision-history semantics.

Boundary lock:

- Source modules retain ownership of underlying workflow records.
- Procore retains ownership of Procore-native records.
- Sage remains accounting book-of-record owner.
- SharePoint/Document Control remain file/document storage owners where applicable.
- HBI has citation/summarization rights only and no decision authority.
- Power Automate remains reference-only for MVP posture.
- No external writeback and no tenant/list/group/security mutation are authorized by this addendum.

Wave relationship lock:

- Wave 13G remains Estimating Workbench feature authority.
- Phase 14 governs estimating-related checkpoint queue/routing/decision/audit semantics.
