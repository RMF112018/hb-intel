# 04 — Create Traceability, Knowledge Reuse, Warranty, Search, and HBI Grounding Docs

## Objective

Create the architecture documents that define cross-stage traceability, closed-project knowledge reuse, warranty traceability, and unified search/HBI grounding.

## New Files to Create

```text
docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md
```

## File 1: PCC_Cross_Stage_Traceability_Model.md

### Required Thesis

PCC must eventually model relationships across estimate, scope, vendor, commitment, submittal, product, field execution, closeout, warranty, and lessons learned records.

Traceability records should connect records without taking ownership away from source systems.

### Required Relationship Examples

Include at minimum:

- estimate line item → scope package
- scope package → bid package
- bid package → subcontractor/vendor
- commitment → scope package
- submittal → approved product/material
- approved product/material → vendor/subcontractor
- RFI/ASI/CCD/change event → scope/commitment/schedule impact
- inspection/punch item → responsible scope/vendor
- closeout document → product/vendor/system
- warranty claim → approved product/vendor/commitment/closeout evidence
- lesson learned → future estimating reference

### Required Record Concepts

Define conceptual records only:

- `ProjectTraceabilityEdge`
- `TraceabilityRelationshipType`
- `TraceabilityConfidence`
- `TraceabilityEvidenceReference`

## File 2: PCC_Company_Knowledge_Reuse_Model.md

### Required Thesis

Closed and active projects should become governed company knowledge assets for future pursuits, estimating, operations, warranty, and executive learning.

### Required Sections

1. Purpose
2. Knowledge Reuse Use Cases
3. Comparable Project References
4. Estimating Historical References
5. Lessons Learned Feedback Loop
6. Subcontractor/Vendor Performance Feedback
7. Warranty Claim Pattern Feedback
8. Cross-Project Security Filtering
9. Closed-Project Reference Mode
10. MVP vs Later-Phase Timing
11. Guardrails

### Required Record Concepts

Define conceptual records only:

- `ProjectKnowledgeReference`
- `CrossProjectReference`
- `LessonLearnedReference`
- `ComparableProjectReference`

## File 3: PCC_Warranty_Traceability_Model.md

### Required Thesis

Warranty should be able to trace claims and obligations back to source evidence across estimate, scope, vendor, product, commitment, submittal, closeout, and field execution records.

### Required Sections

1. Purpose
2. Warranty Trace Mode
3. Obligation Traceability
4. Vendor/Subcontractor Traceability
5. Product/Material Traceability
6. Approved Submittal Traceability
7. Closeout Document Traceability
8. Field Execution / Inspection / Punch Traceability
9. Evidence Requirements
10. HBI Limitations
11. Security and Privacy
12. Guardrails

### Required Record Concepts

Define conceptual records only:

- `ObligationTraceRecord`
- `VendorProductTraceRecord`
- `WarrantyTraceRecord`
- `EstimateReferenceRecord`
- `CloseoutEvidenceReference`

## File 4: PCC_Unified_Search_And_HBI_Grounding_Model.md

### Required Thesis

PCC search and HBI must retrieve across lifecycle stages while respecting permissions, source-of-record boundaries, source lineage, and evidence requirements.

HBI may summarize and reason over grounded records, but it must not become the source of truth.

### Required Sections

1. Purpose
2. Unified Project Search
3. Cross-Project Search
4. HBI Grounding Requirements
5. Required Source Citations
6. Permission Filtering
7. Sensitive Content Handling
8. Refusal / Insufficient Evidence Behavior
9. Search Facets
10. Future Knowledge Graph Readiness
11. Guardrails

### Required User Questions to Support Eventually

Include these examples:

- What did estimating assume for this scope?
- Who installed this product?
- Which submittal approved this material?
- Was this warranty issue tied to a subcontractor scope?
- Have we done this detail before?
- What similar projects had this issue?
- Which lesson learned should apply to this pursuit?

## Validation

Run Prettier check only on the new files:

```bash
pnpm exec prettier --check \
  docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md \
  docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md \
  docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md \
  docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md
```

If formatting fails, run Prettier only on those files.
