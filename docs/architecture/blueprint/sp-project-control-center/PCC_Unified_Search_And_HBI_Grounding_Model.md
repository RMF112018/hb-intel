# PCC Unified Search And HBI Grounding Model

## 1. Purpose

Define search and HBI grounding architecture for lifecycle-wide retrieval within source-of-record, permission, and evidence guardrails.

## 2. Unified Project Search

Unified project search should retrieve across project lifecycle records while preserving source ownership and lineage visibility.

## 3. Cross-Project Search

Cross-project search is allowed only through governed permission-filtered modes and must respect confidentiality boundaries.

## 4. HBI Grounding Requirements

HBI responses must be grounded in retrievable records with source lineage and evidence references.

## 5. Required Source Citations

HBI answers must cite source references for factual claims and identify uncertainty where evidence is incomplete.

## 6. Permission Filtering

Search and HBI retrieval must enforce role, stage, project, and cross-project access controls.

## 7. Sensitive Content Handling

Sensitive pursuit, executive, financial, HR, and privileged contexts must be filtered or withheld per policy.

## 8. Refusal / Insufficient Evidence Behavior

When retrieval lacks sufficient evidence, HBI must refuse, defer, or provide qualified guidance rather than asserting unsupported conclusions.

## 9. Search Facets

Recommended facets include stage, module, source system, vendor/subcontractor, product/material, commitment, risk category, warranty relevance, and confidence/evidence state.

## 10. Future Knowledge Graph Readiness

Traceability and memory models should remain compatible with future governed graph-oriented retrieval layers.

## 11. Guardrails

- HBI is not a source of truth.
- No non-cited factual assertions.
- No bypass of permission boundaries.
- No cross-project leakage.
- No source writeback.

## Example User Questions

- What did estimating assume for this scope?
- Who installed this product?
- Which submittal approved this material?
- Was this warranty issue tied to a subcontractor scope?
- Have we done this detail before?
- What similar projects had this issue?
- Which lesson learned should apply to this pursuit?

## Unified Lifecycle Developer Contracts Cross-Reference

Implementation and future changes for unified lifecycle behavior MUST align with the developer contracts in `docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/`, including bounded-context ownership, route taxonomy and forbidden routes, record state machines, field-level dictionary, permission/redaction resolution, HBI citation/refusal contract, source-system integration contracts, audit-event model, degraded-state matrix, module onboarding template, and validation/test gates.

This reference is documentation governance only. It does not assert production/live tenant readiness and does not authorize runtime/source-system mutations.
