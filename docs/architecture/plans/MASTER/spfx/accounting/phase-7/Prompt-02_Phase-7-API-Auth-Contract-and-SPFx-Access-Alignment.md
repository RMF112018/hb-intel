# Prompt-02 — Phase 7 API Auth Contract and SPFx Access Alignment

## Objective

Freeze and remediate the production API auth contract so the SPFx surfaces, protected backend, and documentation are aligned on token audience, issuer handling, API approval expectations, and caller authorization assumptions.

## Core instructions

- Treat the live repo as authoritative implementation truth.
- Do not re-read files that are still within your current context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Use official Microsoft documentation where platform/security behavior needs confirmation.
- Distinguish clearly between:
  - confirmed repo fact
  - confirmed repo-doc intent
  - confirmed Microsoft-documented requirement / best practice
  - inferred recommendation
  - unresolved dependency
- Keep scope constrained to this prompt’s task.

## Required work

1. Using the Phase 7 audit as input, reconcile the code and docs for the protected API audience contract, accepted issuers, token-version handling, and required claims.
2. Verify whether the backend auth contract is correctly aligned with the intended SPFx calling model and document any mismatches.
3. Harden or clarify the code and docs so the authoritative API auth contract is explicit, production-safe, and internally consistent.
4. Document the exact SPFx-side approval / permission dependencies needed for production deployment.
5. Update or create any reference docs needed so future implementation work does not rely on ambiguity.

## Required outputs

- A hardened and documented API auth contract
- Updated code and/or docs for audience, issuer, token-version, and claims handling as needed
- A clear statement of SPFx API access dependencies and tenant-admin approval requirements

## Documentation / report targets to update

- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`
- `docs/reference/configuration/project-setup-api-auth-contract.md`

## Additional requirements

- Do not weaken auth validation for convenience.
- If repo truth and docs disagree, reconcile them explicitly and record the decision.

