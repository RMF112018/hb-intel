# 09-Recommended-Remediation-Sequence

## Recommended Closure Order

### 1. Restore the real SharePoint repository and upload seams
This is first because the hosted backend path cannot be trusted until the actual SharePoint persistence implementation exists at the declared package boundary.

### 2. Repair the SharePoint ID / lookup contract
Do this before any write logic is finalized. The current domain/storage contract is incompatible with real SharePoint lookup semantics.

### 3. Add explicit reference-list bindings and production-ready descriptor/config wiring
The backend cannot resolve projects safely without first-class bindings to `Projects` and `Legacy Project Fallback Registry`, and the zero-GUID-only posture is not deploy-ready.

### 4. Fix weekly rollup scope and derivation
Once the real repository seam and ID contract are in place, repair the week-scoped aggregation logic so project-week records truly remain derived.

### 5. Strengthen `Safety Ingestion Runs`
Add reporting-period identity, attempted/resolved project context, and better review metadata so audit/review/replay can be trusted.

### 6. Implement retry/replay closure flow
Once the run model is richer and the real SharePoint repository exists, add replay against retained uploads and bounded review actions.

### 7. Harden date normalization and reporting-period validation
Do this after the core write contract is stable so the validation rules align to the final storage behavior.

### 8. Split parser/data anomalies from invalid-template telemetry
Improve operational diagnosis after the core correctness defects are closed.

### 9. Add real workbook and SharePoint verification coverage
Leave this last in sequence, but require it before declaring backend closure. Some tests depend on the repaired repository and storage contract.

## Why this order matters

- The missing SharePoint repository seam and lookup contract are foundational. Everything else depends on them.
- Weekly rollup fixes should happen only after the storage and relationship contract is truthful.
- Replay architecture depends on a working upload-library and run-record model.
- Validation hardening and telemetry improvements are important, but they should not come before the storage seam is real.

## Issues that must remain isolated in their own prompts

These should not be collapsed together:

- restoring the SharePoint repository seam
- repairing the lookup/item-ID contract
- fixing weekly rollup scope
- strengthening the ingestion-run schema
- implementing replay/retry
- building final verification coverage

Each of those changes touches separate risk surfaces and needs independent proof of closure.
