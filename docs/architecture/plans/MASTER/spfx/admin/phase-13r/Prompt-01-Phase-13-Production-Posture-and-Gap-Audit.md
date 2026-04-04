# Prompt-01 — Phase 13 Production Posture and Gap Audit

## Objective

Audit the current repo and document the **actual production posture** of the Admin SPFx IT Control Center so Phase 13 work targets real hardening gaps instead of generic release boilerplate.

## Important execution rules

- Read the **smallest authoritative set** needed.
- Do **not** re-read files already in current agent context unless they changed, context is stale, or this prompt explicitly requires it.
- Treat this as a present-truth audit, not a roadmap-writing exercise.
- Do not start writing runbooks or release gates in this prompt.

## Read this authority set first

1. `docs/architecture/blueprint/current-state-map.md`
2. admin phase docs already present under `docs/architecture/plans/MASTER/spfx/admin/`
3. `apps/admin/package.json`
4. `apps/admin/src/router/routes.ts`
5. `packages/features/admin/README.md`
6. `backend/functions/README.md`
7. any existing deployment, release, runbook, or support docs relevant to admin/provisioning/backend
8. any existing CI/CD or environment docs relevant to `apps/admin` and `backend/functions`

## Scope of work

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-13/admin-spfx-phase-13-production-posture-audit.md`

## Required sections

1. **Purpose**
2. **Authority set used**
3. **Confirmed production-relevant foundations already present**
4. **Confirmed production-readiness gaps**
5. **What is documentation-only vs implementation-dependent**
6. **What earlier-phase outputs this phase depends on**
7. **Explicit non-gaps**
8. **Residual unknowns requiring later verification**

## Minimum facts to capture if still true

- `apps/admin` is a real package but current routing still reflects unfinished operator information architecture.
- `@hbc/features-admin` still documents in-memory or deferred observability-related limitations.
- `backend/functions` already documents managed identity vs local credentials, environment variables, request lifecycle endpoints, and an auth middleware pattern.
- The admin target architecture remains too thin by itself to act as the complete production-readiness package.
- There is meaningful existing admin/control-plane foundation to harden rather than replace.

## Deliverable quality bar

The audit must clearly separate:
- confirmed repo fact,
- inferred risk,
- and production-hardening recommendation.

Do **not** blur these categories.

## Validation

Before finishing:
- verify every referenced path exists,
- remove speculative claims presented as facts,
- ensure the audit is usable as the evidence basis for the rest of Phase 13.

## Completion condition

Stop after the production posture audit is complete and internally consistent.
