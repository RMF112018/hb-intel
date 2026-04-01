# Prompt-03 — Phase 7 CORS, Origin, and Environment Configuration Hardening

## Objective

Make the Project Setup domain’s browser-to-API access posture explicit and production-ready by hardening origin allowlists, environment-variable rules, and startup validation behavior.

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

1. Audit all repo-truth definitions and assumptions for CORS, allowed origins, credentials support, and local-vs-production behavior.
2. Harden configuration and documentation so the production origin posture is explicit and reproducible.
3. Audit environment-variable handling for security-sensitive and connectivity-sensitive settings.
4. Classify environment variables as required, optional, mock-only, local-only, or tenant-dependent.
5. Update startup validation and related docs so environment readiness failures are clear, intentional, and not hidden behind ambiguous warnings where a hard gate is required.

## Required outputs

- A hardened CORS/origin posture
- A normalized Project Setup environment-variable readiness model
- Updated startup validation expectations and deployment gating guidance

## Documentation / report targets to update

- `docs/reference/configuration/project-setup-environment-readiness.md`
- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`

## Additional requirements

- Preserve appropriate mock/local developer experience, but do not let local-friendly behavior silently define production expectations.

