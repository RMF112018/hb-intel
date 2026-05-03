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
