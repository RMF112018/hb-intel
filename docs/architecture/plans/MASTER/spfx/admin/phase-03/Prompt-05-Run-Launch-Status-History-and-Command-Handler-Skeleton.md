# Prompt 05 — Run Launch, Status, History, and Command Handler Skeleton

## Objective

Implement the generalized command-handler layer for launching admin runs and retrieving status/history, aligned with the Phase 2 run model and Phase 3 backend foundation.

## Context efficiency rule

Do **not** re-read files that are still in your active context or memory unless they changed or this prompt explicitly requires a fresh comparison.

## Required repo-truth context

Read the smallest authoritative set necessary, including:

- the Phase 2 run model and command/API contract docs, if present in repo
- the Phase 3 host / service-container / route docs created earlier in this phase
- the minimal current provisioning status / retry / history surfaces needed for compatibility review
- `apps/admin/src/pages/ProvisioningOversightPage.tsx`

## Scope of work

1. Implement the generalized backend command-handling skeleton for:
   - run launch,
   - status retrieval,
   - history listing,
   - retry command receipt,
   - repair command receipt,
   - validation command receipt.
2. Map route DTOs to internal command objects cleanly.
3. Normalize response envelopes so the operator console has a stable backend contract.
4. Ensure provisioning-backed runs can still be represented through the generalized response model where appropriate.
5. Add minimal status/history compatibility handling for current admin oversight consumers if needed.

## Required outputs

Implement the handler layer in repo and update:

- `docs/architecture/plans/MASTER/spfx/admin/phase-3/admin-control-plane-api-surface-and-route-catalog.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-3/admin-control-plane-phase-3-decision-register.md`

The decision register must record any important handler-shape or compatibility choices.

## Implementation requirements

- Keep handlers orchestration-facing, not UI-facing.
- Keep response shape aligned with the generalized run model.
- Separate transport DTO handling from execution logic.
- Preserve current provisioning behavior where the admin oversight page depends on it.

## Documentation requirements

- Document any compatibility bridge added for existing admin consumers.
- Record any intentionally deferred fields or envelopes clearly.

## Validation requirements

- Validate handler typing, route integration, and serialization behavior.
- Add narrow tests for launch/status/history command flow if the repo already supports backend handler tests.

## Acceptance / completion conditions

This prompt is complete when:
- the backend has a generalized command-handler skeleton for launch/status/history and related commands,
- response envelopes are stable enough for later UI integration,
- and provisioning compatibility is explicit rather than accidental.

## No-go boundaries

- Do not fully implement Phase 4 evidence persistence here.
- Do not hard-wire handlers directly to one provisioning-only route shape forever.
- Do not push transport logic down into adapters.
