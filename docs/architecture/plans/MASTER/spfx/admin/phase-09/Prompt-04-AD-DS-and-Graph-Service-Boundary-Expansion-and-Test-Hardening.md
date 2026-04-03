# Prompt-04 — AD DS and Graph Service Boundary Expansion and Test Hardening

## Objective

Add the backend service boundaries needed for **Phase 9 hybrid identity administration** by:

- refining the existing Graph service for the cloud-side responsibilities it should own, and
- adding or formalizing the AD DS / on-prem identity execution boundary required for authoritative lifecycle work if repo truth shows it is missing.

The result must be a clean backend service layer with tests, mocks, and explicit boundary handling.


## Hard gate

Treat the following as mandatory for this prompt and all later prompts:

After the final `.sppkg` is delivered, IT must be able to install the app and complete required operational setup and ongoing maintenance **without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files**.

This prompt must therefore drive the repo toward:

- UI-managed setup, testing, rotation, and maintenance of required backend connections,
- secure backend custody/resolution of secrets and credentials,
- explicit operator-visible preflight checks for any external prerequisite the app cannot create itself,
- and documentation that distinguishes allowed admin-page approvals from prohibited code-edit setup.

Standard Microsoft admin approval pages are allowed where unavoidable. Code interaction is not.


## Important execution rules

- Do not re-read files still in context unless necessary.
- Extend existing patterns instead of discarding them without cause.
- Prefer stable Microsoft Graph v1.0 APIs unless a documented exception is necessary.
- Keep service boundaries explicit:
  - service = platform-specific execution adapter,
  - not a full workflow orchestrator,
  - not a UI-state manager.

## Primary repo targets

Inspect and update as appropriate:

- `backend/functions/src/services/graph-service.ts`
- `backend/functions/src/services/graph-service.test.ts`
- `backend/functions/src/services/service-factory.ts`
- any existing backend config/settings/secret-resolution files relevant to service connection setup

Create adjacent supporting files only if needed and only where the repo’s existing backend pattern clearly supports them.

If repo truth shows there is no suitable AD DS / on-prem execution boundary, add the smallest clean fit under the existing backend service pattern, such as:

- `backend/functions/src/services/ad-directory-service.ts`
- `backend/functions/src/services/hybrid-identity-service.ts`
- or another equally explicit location that matches repo doctrine.

## Required implementation outcomes

### A. Refine the Graph service contract

Refine or expand the Graph service for phase-appropriate methods such as:

- user lookup / search / read where cloud-side visibility is needed
- sync-status / cloud-state visibility helpers
- cloud-only group lookup / search / read if phase-approved
- cloud-side access or rollout-critical follow-on helpers approved by Prompt-03
- continued support for existing provisioning-era methods that must remain compatible

Do **not** default the Graph service into being the authority for every user lifecycle operation.

### B. Add or formalize the AD DS / on-prem execution boundary

If Prompt-01 confirmed the need and absence of a suitable repo pattern, add the smallest clean service boundary for authoritative AD DS lifecycle operations approved by Prompt-03, such as:

- user lookup / search / read
- user create
- user update for approved property sets
- enable / disable account
- password reset / unlock if phase-approved
- delete / deprovision if phase-approved
- AD-authoritative group methods if phase-approved

### C. Keep service boundaries clean

Each service must:

- normalize platform requests / responses,
- centralize auth / execution behavior where appropriate,
- centralize error normalization where appropriate,
- expose phase-appropriate typed methods,
- support mock mode / testability.

The services must **not** become:

- UI-state managers,
- full orchestration engines,
- or catch-all business workflow objects.

### D. Add or refine typed error categories

Add explicit errors or error metadata for categories such as:

- insufficient Graph permission / consent
- insufficient on-prem privilege / executor capability
- unsupported operation due to phase boundary
- unsupported operation due to source-of-authority mismatch
- protected / privileged / constrained target
- not found
- conflict / duplicate
- validation / bad request
- sync pending / downstream propagation lag
- transient Graph failure
- transient on-prem execution / connectivity failure

### E. Harden tests

Add or update focused unit tests covering:

- existing provisioning-oriented Graph methods still working,
- new cloud-side visibility / access methods,
- new AD DS / on-prem methods if added,
- authority-gating or phase-gating behavior,
- error normalization,
- mock behavior / deterministic tests.


### F. Add a governed connection-management substrate

Implement the smallest clean backend capability needed so the required Hybrid Identity connectors can be configured and maintained through the UI without code edits.

This should include, where pattern-consistent:

- typed connection-definition models,
- secure storage / secret-resolution handling in the backend,
- connection test / verify methods,
- connection health / last-verified metadata,
- update / rotate / disconnect behavior,
- and service-factory resolution that consumes governed connection config rather than hard-coded values.

Do **not** store secrets in SPFx.
Do **not** require IT to edit env files or source code for normal connector setup after deployment.
Do **not** weaken backend security just to satisfy the UI-configurability requirement.

## Documentation requirement

If the service contract layer becomes materially broader, update any directly relevant README or local guidance that describes backend service responsibilities.

If a new AD DS / hybrid identity service boundary is introduced, document it briefly in the touched backend guidance.

## Validation

Run the smallest meaningful set, likely:

- focused service unit tests,
- connection-resolution / connection-test tests where applicable,
- TypeScript/build checks for touched areas.

Document what was run in your working notes / commit summary if that is your normal repo practice.

## Completion condition

Stop when the service-boundary expansion and backend connection-management substrate are implemented, tested, and consistent with the Phase 9 action catalog, source-of-authority matrix, and connection-dependency matrix.
Do not build orchestration or UI in this prompt.
