# PCC Warranty Traceability Model

## 1. Purpose

Define warranty traceability architecture so claims and obligations can be traced through lifecycle evidence before conclusions are made.

## 2. Warranty Trace Mode

Warranty trace mode is a governed, evidence-first view over the same unified PCC project truth.

## 3. Obligation Traceability

Claims should trace contractual and scope obligations with lineage to source-owned records.

## 4. Vendor/Subcontractor Traceability

Trace links should connect warranty issues to responsible subcontractors/vendors where supported by commitments and execution evidence.

## 5. Product/Material Traceability

Warranty analysis should connect to approved products/materials and installation context.

## 6. Approved Submittal Traceability

Warranty claims should trace to relevant approved submittals and any governing constraints.

## 7. Closeout Document Traceability

Closeout deliverables and turnover records should be linked as evidence references for warranty review.

## 8. Field Execution / Inspection / Punch Traceability

Field logs, inspections, and punch context should be connected where they support claim analysis.

## 9. Evidence Requirements

Warranty conclusions require lineage-backed evidence links; unsupported conclusions must be marked insufficient.

## 10. HBI Limitations

HBI may summarize trace context but cannot create source truth or legal conclusions without adequate evidence.

## 11. Security and Privacy

Warranty trace views must enforce project permissions, role controls, and sensitive-content boundaries.

## 12. Guardrails

- No warranty responsibility conclusions without evidence lineage.
- No source-system writeback from warranty trace mode.
- No cross-project leakage of restricted claim context.

## Conceptual Record Definitions

### `ObligationTraceRecord`

Represents obligation lineage from contract/scope context to specific warranty issue context.

### `VendorProductTraceRecord`

Represents vendor/subcontractor and product lineage relevant to a warranty question.

### `WarrantyTraceRecord`

Represents the aggregate trace context for a warranty claim, including confidence/evidence state.

### `EstimateReferenceRecord`

Represents links to estimating assumptions/exclusions/alternates relevant to warranty analysis.

### `CloseoutEvidenceReference`

Represents closeout and turnover artifacts that support or constrain warranty interpretation.
