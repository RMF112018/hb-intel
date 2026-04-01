# Prompt-01 — Phase 7 Repo-Truth Security and Connected Services Audit

## Objective

Conduct a comprehensive repo-truth audit of the Project Setup domain’s security posture, auth model, environment gating, CORS posture, and connected-service assumptions before any remediation work begins.

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

1. Audit the live repo implementation for the Project Setup / provisioning host, including JWT validation, withAuth middleware, startup validation, service factory initialization, CORS-related configuration, managed identity usage, role resolution, and connected-service clients.
2. Identify all code paths and docs that define or imply the production auth contract for SPFx callers into the backend.
3. Identify all environment variables that materially affect security, service access, and deployment readiness.
4. Identify all connected services currently assumed by the Project Setup domain and classify each as active, optional, stubbed, or unresolved.
5. Produce an explicit gap inventory showing where repo truth is incomplete, ambiguous, contradictory, or not yet production-ready.

## Required outputs

- A repo-truth audit report for Phase 7 security and connected-service readiness
- A gap inventory with severity / impact framing
- A recommended remediation sequence for the remaining prompts in this phase

## Documentation / report targets to update

- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`

## Additional requirements

- Be explicit about whether CORS is fully defined in repo truth, partly defined in docs only, or still dependent on tenant/platform configuration.
- Be explicit about whether role resolution is environment-driven, claims-driven, or hybrid.

