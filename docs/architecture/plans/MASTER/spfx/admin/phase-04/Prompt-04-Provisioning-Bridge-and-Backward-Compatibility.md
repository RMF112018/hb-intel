# Prompt-04 — Provisioning Bridge and Backward Compatibility

## Objective

Bridge the existing provisioning saga and related admin mutation paths into the generalized Phase 4 run/audit/evidence spine while preserving current behavior and compatibility.

This is the transition prompt that turns the generalized persistence primitives into live operational history.

## Important execution rules

- Do **not** re-read files already in context unless needed.
- Preserve current provisioning endpoint contracts unless a safe additive extension is required.
- Treat the existing provisioning status model as a compatibility surface, not the full final history model.
- Keep changes additive and traceable.

## Inputs

Use:
- the generalized stores and shared types created in Prompt-03
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `docs/architecture/reviews/phase-4-provisioning-status-and-saga-audit.md`

## Required implementation work

### A. Saga bridge
Update the provisioning saga so it writes into the generalized spine at minimum for:
- run launch
- step / stage progress transitions as justified by the baseline
- Step 5 deferral
- retry initiation
- completion
- failure
- compensation / repair-relevant failure context where available

### B. Admin mutation bridge
Ensure the generalized audit spine captures admin-driven mutation paths such as:
- retry
- escalate
- archive
- acknowledge escalation
- force-state transition

Be explicit about which of these are:
- state-changing run events
- annotations
- override events
- compatibility-only actions

### C. Compatibility preservation
Keep current provisioning-specific behavior working:
- `IProvisioningStatus`
- current provisioning endpoints
- current admin oversight reads
- current request-reconciliation behavior unless this prompt safely improves it

If you improve any previously known drift path, document exactly what changed.

### D. SharePoint compatibility sink handling
If the existing SharePoint `writeAuditRecord` path remains necessary, keep it as:
- a compatibility or secondary sink,
- not the sole authoritative generalized audit system.

Document this boundary in code comments and docs if needed.

## Required tests

Add targeted tests covering:
- generalized run/audit writes during successful saga execution
- generalized writes during failed execution
- retry chain capture
- Step 5 deferral capture
- admin mutation capture for at least the highest-risk mutation paths
- preservation of current provisioning endpoint behavior

## Required documentation updates

Update or create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-4/admin-spfx-phase-4-provisioning-bridge.md`

This doc must explain:
- what provisioning now writes to the generalized spine,
- what remains provisioning-specific,
- what compatibility surfaces were preserved,
- and any intentional transitional duplication.

## Validation

Run the smallest justified validation set, likely including touched backend tests and type-checks.

## Completion condition

Stop when provisioning is writing into the generalized Phase 4 spine and current provisioning/admin flows still work as compatibility surfaces.
