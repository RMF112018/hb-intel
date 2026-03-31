# Prompt-07-03 — Phase 1 Config, Auth, CORS, and Identity Scoping for Project Setup Host

## Context
You are continuing the Phase 1 remediation after establishing the Project Setup domain host.

The architectural target is a dedicated Project Setup Function App host backed by shared services. That host must now have **truthful domain-scoped operational assumptions** rather than inheriting broad shared-host posture.

Relevant review file to keep current as you work:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Critical standing instruction:
- **Do not re-read files that are already in your active context or memory unless needed to verify a contradiction, inspect a dependency you have not yet loaded, or retrieve exact evidence for docs/tests.**

## Objective
Finish the Phase 1 backend scope freeze by scoping the Project Setup host’s:
- config validation,
- auth posture,
- CORS assumptions,
- managed identity / downstream dependency assumptions,
- release/readiness assertions.

The goal is not to finish all auth hardening across the entire product. The goal is to make the **Project Setup host’s boundary truthful and self-contained**.

## Required Work

### 1) Scope config validation to Project Setup
Refactor or configure validation so the Project Setup host checks only what it genuinely requires.

This should include:
- Project Setup-specific environment/config requirements,
- Project Setup-specific downstream service assumptions,
- clear separation between mandatory startup requirements and later/runtime/provisioning prerequisites,
- host-specific readiness output where appropriate.

Do not allow unrelated domains to impose boot requirements on the Project Setup host.

### 2) Scope auth posture to Project Setup
Ensure the Project Setup host has an explicit and auditable auth posture covering at minimum:
- API audience / token validation assumptions,
- route protection expectations,
- any role/upn/admin exceptions that remain intentionally in scope,
- retained `ui-review` compatibility where intended.

If shared helpers are reused, confirm the Project Setup host only applies the auth/config behavior it actually needs.

### 3) Scope CORS posture
Make the Project Setup host’s CORS posture explicit and domain-specific.

Do not leave it coupled to broader host assumptions unless there is a strong technical reason.

If the current CORS behavior is intentionally broader for deployment/platform reasons, document that precisely and explain why. Otherwise tighten it to match the Project Setup deployment reality.

### 4) Scope managed identity / downstream grant assumptions
Document and encode the Project Setup host’s downstream dependency posture, including only the services and permission assumptions genuinely needed for Project Setup.

This should make it obvious:
- what the Project Setup host calls,
- what grants/settings it needs,
- what it does **not** need because those belong to other domains.

### 5) Update readiness language
Refactor or clarify health/readiness outputs and supporting docs so they describe the Project Setup host truthfully rather than echoing the broader transitional host posture.

## Tests / Verification
Add or update targeted tests for:
- Project Setup host config-validation scope,
- Project Setup host auth/readiness expectations,
- any host-specific health/readiness output that changed,
- CORS/config assumptions if those are expressed in testable config artifacts.

Favor targeted tests over broad unrelated suite churn.

## Required Documentation Updates
Update `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md` with:

### Progress Notes
- what config/auth/CORS/identity scoping work was completed,
- what assumptions were removed from the Project Setup host,
- what assumptions remain intentionally in scope.

### Closure Statement
State whether the **operational-boundary truthfulness** portion of Phase 1 is now closed.

### Evidence
List exact file paths for:
- host-specific config validation
- host-specific auth posture
- host-specific CORS/runtime config
- host-specific readiness/health behavior
- tests

Also update any architecture/runbook docs needed so deployment topology and domain-scoped requirements are truthful.

## Constraints
- Do not use this prompt to reopen unrelated Phase 3/4 cleanup unless required by the Project Setup host boundary.
- Do not broaden Project Setup runtime assumptions for convenience.
- Preserve least privilege and minimal blast radius principles.

## Deliverables
1. Project Setup host has domain-scoped config/auth/CORS/identity posture.
2. Tests or equivalent proof artifacts are updated.
3. Review report is updated with progress notes, closure statement, and evidence.

## Final Response Requirements
Summarize:
- startup requirements now in scope,
- startup requirements removed from scope,
- auth/CORS/MI posture changes,
- test results,
- any remaining residuals that prevent honest Phase 1 closure.
