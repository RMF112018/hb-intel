# Prompt 02 — Add Traceability, Warranty, Obligation, Vendor/Product, and Cross-Project Knowledge Contracts

## Objective

Implement the second model-contract layer for the accepted unified lifecycle architecture. Add TypeScript contracts and fixtures for:

- cross-stage traceability edges;
- obligation trace records;
- vendor/subcontractor trace records;
- product/material trace records;
- warranty trace records;
- estimate reference records;
- lesson learned references;
- cross-project knowledge references.

This prompt must extend the model layer created in Prompt 01 and remain preview-safe and source-of-record aware.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Context Handling

Do not re-read files still in current context or memory. Re-open only the model files, fixtures, tests, and doctrine docs required to verify repo truth.

## Required Source Docs

Use these doctrine docs as source of truth:

- `docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`

## Required Contracts

Create or extend focused model files following existing PCC naming/export conventions.

At minimum, define these exported types/interfaces/enums:

### Traceability

- `PccTraceableRecordType`
- `PccTraceabilityEdgeType`
- `PccTraceabilityDirection`
- `PccTraceabilityConfidence`
- `PccProjectTraceabilityEdge`
- `PccRelatedRecordCluster`
- `PccTraceabilityGraphReadModel`

Required traceable record types:

- estimate-line-item;
- estimate-assembly;
- bid-package;
- scope-package;
- subcontractor-bid;
- commitment;
- purchase-order;
- vendor;
- subcontractor;
- product-material;
- submittal;
- rfi;
- asi-ccd-change-event;
- inspection;
- constraint;
- responsibility-matrix-item;
- punch-item;
- closeout-document;
- warranty-claim;
- lesson-learned;
- project-memory-record;
- lifecycle-event.

Required edge types:

- derived-from;
- references;
- satisfies;
- supersedes;
- caused-by;
- contributed-to;
- approved-by;
- installed-by;
- warranted-by;
- assigned-to;
- closed-by;
- reused-by;
- comparable-to.

### Warranty / Obligation / Vendor / Product

- `PccObligationTraceRecord`
- `PccVendorProductTraceRecord`
- `PccWarrantyTraceStatus`
- `PccWarrantyTraceRecord`
- `PccWarrantyTraceReadModel`

A warranty trace record must support source-backed links to:

- original scope or estimate reference;
- commitment/subcontract/vendor;
- approved product/material;
- submittal or closeout record;
- installation/inspection evidence;
- punch or issue context;
- warranty term/obligation evidence;
- responsible party recommendation with confidence and required evidence.

The model must prohibit unsupported warranty conclusions. Include explicit status values for insufficient evidence or unresolved responsibility.

### Cross-Project Knowledge

- `PccProjectKnowledgeReferenceType`
- `PccCrossProjectReferenceStatus`
- `PccCrossProjectReference`
- `PccProjectKnowledgeReference`
- `PccClosedProjectReferenceReadModel`

Required reference types:

- comparable-project;
- comparable-scope;
- vendor-performance;
- product-performance;
- estimate-variance;
- warranty-pattern;
- lesson-learned;
- risk-pattern;
- constructability-note;
- pursuit-reference.

## Required Security Fields

Every cross-project or warranty-related record must include:

- security class;
- source visibility rule;
- eligible lens/role access metadata;
- redaction/summary posture;
- source lineage;
- evidence links;
- confidence or verification status where conclusions are derived.

## Fixtures

Add deterministic fixtures showing:

- an estimate reference connected to a commitment and approved product;
- a warranty claim traced back to product/vendor/scope/evidence;
- a record with insufficient evidence that cannot assign responsibility;
- a lesson learned from a closed project reused as a future pursuit reference;
- a restricted cross-project reference hidden from unauthorized roles by metadata.

## Tests

Add or update tests proving:

- traceability edges only connect recognized record types;
- unsupported warranty conclusions are represented as insufficient-evidence/unresolved;
- cross-project references carry security and redaction metadata;
- fixtures form a deterministic graph with no orphaned required references;
- model exports are available through package public exports;
- no source-of-record ownership conflict is introduced.

## Constraints

- No backend implementation in this prompt.
- No SPFx implementation in this prompt.
- No dependency changes.
- No lockfile change.
- No live integrations.
- No tenant mutation.

## Validation

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
md5 pnpm-lock.yaml
```

If repo scripts differ, inspect package scripts and run closest equivalents.

## Required Response

Return:

1. Files changed.
2. Contracts added.
3. Fixture stories represented.
4. Tests added/updated.
5. Validation results.
6. Lockfile MD5 before/after.
7. Remaining gaps passed to Prompt 03.
