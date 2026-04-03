# README — Admin SPFx App-Binding / Backend-Setup Prompt Package

## What this package is

This is a follow-on local-code-agent prompt package for implementing the **app-binding / backend-setup configuration slice** after Phase 6.

It assumes the Phase 6 install/bootstrap lane already exists and that the remaining gap is the durable publication, retrieval, verification, and repair of target-app backend bindings.

## What is included

1. `Admin-SPFx-App-Binding-Backend-Setup-Summary-Plan.md`
2. `README.md`
3. `Prompt-01-App-Binding-Gap-Audit-and-Slice-Definition.md`
4. `Prompt-02-App-Binding-Architecture-and-Resolution-Model.md`
5. `Prompt-03-Shared-App-Binding-Contracts-and-Governance-Slice.md`
6. `Prompt-04-Backend-App-Binding-Store-and-Retrieval-API.md`
7. `Prompt-05-Install-Flow-Integration-and-Binding-Publication.md`
8. `Prompt-06-Target-App-Runtime-Resolver-Integration.md`
9. `Prompt-07-App-Binding-Verification-and-Drift-Checks.md`
10. `Prompt-08-Admin-UX-for-App-Binding-Status-and-Repair.md`
11. `Prompt-09-Docs-Runbooks-Validation-and-Final-Reconciliation.md`

## Intended execution order

Run the prompt files in numeric order.

## Critical execution rules for the code agent

- Treat live repo truth as authoritative.
- Use the Admin end-state plan and Phase 6 artifacts as the immediate controlling inputs.
- Read the smallest authoritative file set needed.
- **Do not re-read files that are still within active context or memory unless they changed, the context is stale, or the scope widened.**
- Distinguish clearly between:
  - confirmed repo fact
  - confirmed phase-doc fact
  - inferred implementation recommendation
  - unresolved blocker
- Keep the slice narrow and forward-compatible.

## Core implementation goal

Create a first-class app-binding model that lets the Admin control plane publish backend/runtime bindings for target SPFx apps and lets those apps resolve the binding before making backend-dependent calls.

## Core design constraints

- Avoid circular runtime dependency.
- Avoid per-app rebuild dependency for routine operator changes.
- Preserve SPFx as operator or consumer surface, not privileged executor.
- Preserve backend/control-plane ownership for writes, audit, and repair.
- Keep compatibility with future Phase 10 configuration governance.

## Expected repo outputs

### Documentation
- `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/**` or equivalent repo-truth path
- targeted updates to local README/runbook docs as needed

### Frontend
- admin app pages/routes only where needed for binding status/repair
- target app runtime binding resolution in the appropriate apps (at minimum Accounting and Project Setup)

### Backend
- app-binding persistence/retrieval service
- publication and verification support
- integration with install/bootstrap flow

### Shared contracts
- smallest correct shared contract surface for durable app-binding records, retrieval responses, verification/drift results, and operator actions

## Completion standard

The package is complete when:
- bindings can be published from the Admin control plane,
- target apps can resolve them before backend use,
- verification/drift checks exist,
- repair/reapply actions exist,
- docs and validation are coherent,
- and the solution stays architecture-safe.
