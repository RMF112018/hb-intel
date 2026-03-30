# Phase 4 — Infrastructure Package

This package contains a sequenced implementation kit for bringing the **HB Intel Estimating / Project Setup SPFx package** through **Phase 4 — Infrastructure**.

## Included files

1. `Phase-4_Infrastructure_Action-Plan.md`
   - Master action plan
   - Workstreams
   - Deliverables
   - Acceptance criteria
   - Execution sequence

2. `Prompt-01_Repo-Truth-and-Infrastructure-Surface-Baseline.md`
   - Establish the exact current infrastructure and connected-services posture
   - Inventory hosting, startup validation, runtime dependencies, and service identities
   - Produce the canonical infrastructure baseline before hardening work starts

3. `Prompt-02_Functions-Hosting-Startup-and-Configuration-Scope.md`
   - Scope Azure Functions startup to the actual Project Setup deployment
   - Reduce over-broad boot blockers
   - Lock required configuration, feature gating, and environment validation

4. `Prompt-03_Managed-Identity-Storage-and-Secrets-Hardening.md`
   - Harden managed identity usage, storage dependencies, and secret handling
   - Replace unsafe or unclear credential patterns
   - Align runtime services to production-safe identity boundaries

5. `Prompt-04_CORS-Connected-Services-and-Permission-Model.md`
   - Finalize browser-origin rules, SharePoint / Graph access posture, and connected-service permissions
   - Remove or document unsupported service dependencies
   - Align platform permissions to least privilege and actual deployment scope

6. `Prompt-05_Observability-Release-Readiness-and-Operational-Guards.md`
   - Add monitoring, diagnostics, readiness checks, and deployment safeguards
   - Build operator-facing failure visibility and release gates
   - Add infrastructure-focused regression and readiness checks

7. `Prompt-06_Final-Verification_and-Handoff.md`
   - Run the final verification pass
   - Produce handoff notes, unresolved items, and next-phase blockers

## Recommended use

- Run the prompts **in order**.
- Do **not** merge work from a later prompt until the acceptance criteria from the prior prompt are satisfied.
- Treat this package as **Phase 4 only**.
- Keep broad feature redesign, data-contract churn, or UX polish out of this phase unless a prompt explicitly allows a narrowly scoped enabling change.

## Governing intent for Phase 4

Phase 4 is complete only when all of the following are true:

- The Project Setup deployment has a **clearly scoped and production-safe infrastructure footprint**.
- Azure Functions startup, configuration validation, and service initialization are aligned to the actual deployment scope.
- Managed identity, storage, secrets, and connected-service dependencies are explicit, least-privilege, and production-appropriate.
- CORS, App Catalog / SharePoint / Graph permissions, and runtime service prerequisites are documented and enforced.
- Operators have release-readiness checks, diagnostics, and monitoring signals for the retained Project Setup infrastructure surface.
