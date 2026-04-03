# Gap 1 Final Signoff — SPFx Permission Declaration

> **Created:** 2026-04-01
> **Status:** Closed
> **Authority:** This is the single authoritative signoff document for Gap 1. Start here.

## Executive Summary

The SPFx permission declaration gap for the Project Setup Requests package is fully resolved. The authoritative `package-solution.json` declares `webApiPermissionRequests` with `resource: "hb-intel-api-staging"` (default) and `scope: "access_as_user"`. Build-time parameterization via `SPFX_API_RESOURCE` env var produces the correct environment-specific resource value (`hb-intel-api-dev`, `hb-intel-api-staging`, `hb-intel-api-production`) in the `.sppkg` artifact. All three environments have been built and verified end-to-end. The document set has been reconciled — no contradictions remain.

**Final status: Closed in repo truth. Production activation requires only standard operator deployment and admin approval.**

---

## 1. Final Implemented State

| Aspect | Value |
|--------|-------|
| Source config | `apps/estimating/config/package-solution.json` |
| Declaration | `webApiPermissionRequests: [{ resource, scope }]` |
| `resource` (default) | `hb-intel-api-staging` |
| `resource` (parameterized) | `SPFX_API_RESOURCE` env var at build time |
| `scope` | `access_as_user` (constant, not parameterized) |
| Naming pattern | `hb-intel-api-{environment}` per IT-Department-Setup-Guide.md |
| Build orchestrator | `tools/build-spfx-package.ts` — overrides resource when `SPFX_API_RESOURCE` is set |
| Source file modified by build? | No — override applied to shell copy only |

---

## 2. Verification Summary

### Package builds verified

| Environment | `SPFX_API_RESOURCE` | `.sppkg` `ResourceId` | `.sppkg` `Scope` | Build result |
|-------------|--------------------|-----------------------|------------------|-------------|
| Staging | Not set (default) | `hb-intel-api-staging` | `access_as_user` | Passed |
| Production | `hb-intel-api-production` | `hb-intel-api-production` | `access_as_user` | Passed |
| Development | `hb-intel-api-dev` | `hb-intel-api-dev` | `access_as_user` | Passed |

### Propagation path verified

Source config → shell copy (with optional override) → `.sppkg` `AppManifest.xml` — no stripping, mutation, or regression across any environment.

### App-level verification

- `@hbc/features-estimating` check-types: clean
- `@hbc/features-estimating` build: clean
- `@hbc/features-estimating` lint: clean (0 errors)

---

## 3. Remaining Operator Actions

These are standard deployment prerequisites, not code or manifest gaps:

| Action | Who | Where | When |
|--------|-----|-------|------|
| Set `SPFX_API_RESOURCE` in CI/CD for each environment | DevOps | CI/CD pipeline configuration | Build time |
| Deploy `.sppkg` to SharePoint app catalog | IT operator | SharePoint app catalog | Deployment time |
| Approve pending API permission request | SharePoint tenant admin | SharePoint admin center → API access page | After deployment |

---

## 4. Document Hierarchy — What to Read

The Gap 1 document set is organized by purpose. **Start with this document for final status.** Use the others only when you need specific detail.

| Purpose | Document | Role |
|---------|----------|------|
| **Final status** | `project-setup-gap-1-final-signoff.md` | **Start here** — authoritative signoff |
| Implementation record | `project-setup-gap-1-implementation-closure.md` | Files changed, version history, full implementation timeline |
| Build verification | `project-setup-gap-1-build-verification.md` | Detailed propagation evidence for static and parameterized builds |
| Parameterization details | `project-setup-gap-1-parameterization-implementation.md` | `SPFX_API_RESOURCE` mechanism, fallback behavior, rationale |
| Value determination | `project-setup-gap-1-permission-input-freeze.md` | How `resource` and `scope` values were determined (P9-G1-01) |
| Original gap analysis | `project-setup-spfx-permission-declaration-gap-validation.md` | Historical — original gap identification, Microsoft guidance, evidence baseline |
| Reconciliation audit | `project-setup-gap-1-final-reconciliation-audit.md` | Historical — audit of doc contradictions and cleanup scope (P10-01/02) |

All documents in `docs/architecture/reviews/`.

---

## 5. Final Status Statement

**Gap 1 is closed.**

- The SPFx permission declaration is implemented in the authoritative source config.
- Build-time parameterization produces correct environment-specific values.
- The declaration propagates faithfully into the `.sppkg` artifact.
- All documentation is reconciled and internally consistent.
- No code or manifest gaps remain.
- Production activation is gated only on standard operator deployment and admin approval actions.
