# Prompt-04 — Phase 7 Managed Identity and Connected Service Readiness

## Objective

Validate and harden the backend’s managed identity and connected-service access model for production use across SharePoint, Graph, Storage, SignalR, telemetry, and other Project Setup dependencies.

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

1. Audit the service factory and connected-service clients to establish the real service access model used by the Project Setup host.
2. For each connected service, identify the expected authentication mechanism, minimum permission posture, and unresolved tenant/admin prerequisites.
3. Harden code and docs where service access behavior is under-specified, over-broad, or inconsistent with the intended production model.
4. Produce a least-privilege oriented service-readiness matrix covering all active Project Setup domain dependencies.
5. Identify which dependencies are code-ready but tenant-blocked versus code-incomplete.

## Required outputs

- A connected-service readiness matrix
- A managed identity / service access posture that is explicit and documented
- A blocker list separating code gaps from tenant/admin prerequisites

## Documentation / report targets to update

- `docs/reference/configuration/project-setup-connected-services-readiness.md`
- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`

## Additional requirements

- Be explicit about any SharePoint vs Graph permission choices that materially affect rollout complexity.
- Do not claim least privilege without showing the actual dependency and permission rationale.

