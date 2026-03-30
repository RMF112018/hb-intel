# Phase 3 — Auth Package

This package contains a sequenced implementation kit for bringing the **HB Intel Estimating / Project Setup SPFx package** through **Phase 3 — Auth**.

## Included files

1. `Phase-3_Auth_Action-Plan.md`
   - Master action plan
   - Workstreams
   - Deliverables
   - Acceptance criteria
   - Execution sequence

2. `Prompt-01_Repo-Truth-and-Auth-Surface-Baseline.md`
   - Establish the exact current auth and runtime posture
   - Inventory token assumptions, route protections, and mode gating
   - Produce the canonical auth baseline before redesign work starts

3. `Prompt-02_Production-Mode-and-SPFx-Token-Acquisition.md`
   - Make production mode real
   - Replace opaque token injection assumptions with a deliberate SPFx API-auth flow
   - Lock runtime config and activation requirements

4. `Prompt-03_API-Token-Version-and-Validator-Redesign.md`
   - Determine the API token-version contract
   - Redesign token validation to match the chosen model
   - Remove narrow issuer/audience assumptions that are not production-safe

5. `Prompt-04_Delegated-vs-App-Only-Boundaries_and-Managed-Identity-Cleanup.md`
   - Separate delegated-user behavior from app-only behavior
   - Correct the current OBO / managed-identity boundary
   - Document and enforce least-privilege access paths

6. `Prompt-05_Backend-Auth-Hardening_CORS-Permissions-and-Tests.md`
   - Finalize backend auth enforcement
   - Lock down CORS and permission requirements
   - Add auth-focused contract, regression, and release-readiness tests

7. `Prompt-06_Final-Verification_and-Handoff.md`
   - Run the final verification pass
   - Produce handoff notes, unresolved items, and next-phase blockers

## Recommended use

- Run the prompts **in order**.
- Do **not** merge work from a later prompt until the acceptance criteria from the prior prompt are satisfied.
- Treat this package as **Phase 3 only**.
- Keep broad SharePoint provisioning maturity, non-auth UX work, and unrelated infrastructure polish out of this phase unless a prompt explicitly allows a narrowly scoped enabling change.

## Governing intent for Phase 3

Phase 3 is complete only when all of the following are true:

- The package has a **real production mode** that is intentionally gated and no longer depends on opaque token injection behavior.
- The SPFx frontend uses a deliberate and documented auth pattern for the Project Setup API.
- The backend token validator is aligned to the chosen Entra token model and no longer relies on unsafe narrow assumptions.
- Delegated-user and app-only / managed-identity behaviors are clearly separated and correctly named.
- The backend route surface has explicit auth requirements, production-safe CORS, and regression coverage for auth failures and success paths.
