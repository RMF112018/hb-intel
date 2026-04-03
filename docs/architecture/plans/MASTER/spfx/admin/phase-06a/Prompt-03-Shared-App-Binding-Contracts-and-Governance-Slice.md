# Prompt-03 — Shared App-Binding Contracts and Governance Slice

## Objective

Introduce the smallest correct shared contract surface for durable app-binding records, retrieval responses, verification/drift results, and repair actions.

## Important execution rules

- Prefer the existing authoritative shared model location in repo truth.
- **Do not re-read files that are still within active context or memory unless they changed, the context is stale, or the scope widened.**
- Keep the slice intentionally minimal and forward-compatible.
- Do not build the full generalized Phase 10 config registry contract here.

## Inputs

Use:
- the Prompt-01 gap audit
- the Prompt-02 architecture docs
- the existing admin-control-plane models and persistence vocabulary

## Required work

### A. Add or extend shared contracts
Define the smallest correct model set for:
- app binding record
- binding source type / scope
- binding status summary
- binding retrieval response for target apps
- binding publication request/result
- binding verification result set
- binding drift finding
- binding repair/reapply action request/result
- binding audit/evidence references where needed

At minimum the binding contract must carry:
- target app identity/key
- `functionAppUrl`
- `apiAudience`
- `backendMode`
- `allowBackendModeSwitch`
- publication metadata
- active/inactive or superseded status
- source/version metadata sufficient for audit and future governance

### B. Define binding status vocabulary
Include explicit durable states such as:
- NotConfigured
- PendingPublication
- Active
- Drifted
- Superseded
- Error

Adjust only if existing repo conventions strongly require different naming.

### C. Define persistence expectations
Document or implement the minimal persistence contract for:
- active binding header
- target-app lookup keying
- version/revision metadata
- last-published actor and timestamp
- drift status / verification timestamps
- evidence references

Prefer existing persistence foundations where safe.

### D. Add a contract note
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-contract-slice.md`

This doc should explain:
- where the shared contracts live,
- why this slice is intentionally minimal,
- how it stays forward-compatible with broader config governance later.

## Required boundaries

- Do not put backend-only sensitive internals into browser-facing types.
- Do not overfit the contracts to only one app.
- Do not bypass durable representation for version/publication state.
- Do not introduce a full cross-domain configuration DSL.

## Validation

Before finishing:
- ensure the contract location is consistent with repo conventions,
- ensure backend and frontend can import the shared types cleanly,
- ensure the vocabulary aligns with the architecture docs,
- add or update focused shared-model tests if the repo already follows that pattern.

## Completion condition

Stop after the shared contracts and contract-slice doc are complete.
Do not implement store or runtime resolver logic in this prompt.
