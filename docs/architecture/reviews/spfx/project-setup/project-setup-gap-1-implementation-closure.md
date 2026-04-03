# Gap 1 Implementation Closure Record — SPFx Permission Declaration

> **Created:** 2026-04-01 (P9-G1-05)
> **Status:** Closed — see `project-setup-gap-1-final-signoff.md` for authoritative final status
> **Phase:** 9–10, Gap 1
> **Prompt sequence:** P9-G1-01 through P9-G1-05, P10-01 through P10-05

## Executive Summary

The confirmed SPFx permission declaration gap for the Project Setup Requests package is resolved. The authoritative `package-solution.json` now declares `webApiPermissionRequests` with `resource: "hb-intel-api-staging"` and `scope: "access_as_user"`. The declaration propagates faithfully through the full packaging path into the deployable `.sppkg` artifact. All affected documentation has been reconciled to reflect implemented truth.

Production activation remains gated on a single operator-executed action: a SharePoint tenant admin must approve the pending API permission request in the SharePoint admin center "API access" page after `.sppkg` deployment. This is the standard Microsoft-documented SPFx API approval flow and is no longer a code or manifest gap.

---

## 1. Implemented Permission Request Values

```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-staging",
    "scope": "access_as_user"
  }
]
```

| Field | Value | Source |
|-------|-------|--------|
| `resource` | `hb-intel-api-staging` | Entra ID app registration display name per IT-Department-Setup-Guide.md (line 491) |
| `scope` | `access_as_user` | Delegated scope per IT-Department-Setup-Guide.md (line 520) |

The `resource` follows the pattern `hb-intel-api-{environment}`. The staging default is the primary deployment target.

---

## 2. Files Changed

### P9-G1-01 — Freeze implementation inputs

| File | Change |
|------|--------|
| `docs/architecture/reviews/project-setup-gap-1-permission-input-freeze.md` | **Created** — decision note freezing `resource` and `scope` values with full evidence chain |

### P9-G1-02 — Implement manifest declaration

| File | Change |
|------|--------|
| `apps/estimating/config/package-solution.json` | **Edited** — added `webApiPermissionRequests` array; version `1.0.0.0` → `001.000.001` |
| `docs/architecture/reviews/project-setup-gap-1-permission-input-freeze.md` | **Edited** — status updated from "Frozen" to "Implemented (P9-G1-02)" |

### P9-G1-03 — Build and verify package propagation

| File | Change |
|------|--------|
| `docs/architecture/reviews/project-setup-gap-1-build-verification.md` | **Created** — build/package verification evidence |
| `apps/estimating/config/package-solution.json` | **Edited** — version `001.000.001` → `001.000.002` |

### P9-G1-04 — Reconcile deployment docs and apiAudience narrative

| File | Change |
|------|--------|
| `docs/architecture/reviews/project-setup-spfx-permission-declaration-gap-validation.md` | **Edited** — verdict changed from "Confirmed gap" to "Resolved"; §5 gap table updated; §7 remediation targets marked done; §8 unresolved questions resolved |
| `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` | **Edited** — prerequisite #6 updated in three locations with manifest declaration context and approval flow |
| `docs/reference/developer/project-setup-connected-service-posture.md` | **Edited** — SPFx API permission approval row expanded with `webApiPermissionRequests` details |
| `apps/estimating/config/package-solution.json` | **Edited** — version `001.000.002` → `001.000.003` |

### P9-G1-05 — Final closure record

| File | Change |
|------|--------|
| `docs/architecture/reviews/project-setup-gap-1-implementation-closure.md` | **Created** — this document |
| `apps/estimating/config/package-solution.json` | **Edited** — version `001.000.003` → `001.000.004` |

---

## 3. Verification Evidence Summary

### Package build (P9-G1-03)

- **Command:** `npx tsx tools/build-spfx-package.ts --domain estimating`
- **Result:** Build succeeded — all stages clean
- **Artifact:** `hb-intel-project-setup.sppkg` (336.0 KB)

### Declaration propagation (P9-G1-03)

| Stage | File | Declaration Present |
|-------|------|-------------------|
| Source config | `apps/estimating/config/package-solution.json` | Yes — JSON `webApiPermissionRequests` array |
| Shell copy | `tools/spfx-shell/config/package-solution.json` | Yes — identical JSON (shallow spread by orchestrator) |
| Packaged artifact | `.sppkg` → `AppManifest.xml` | Yes — `<WebApiPermissionRequest ResourceId="hb-intel-api-staging" Scope="access_as_user">` |

No stripping, mutation, or regression observed.

### App-level verification (all prompts)

- `@hbc/features-estimating` check-types: clean (0 errors)
- `@hbc/features-estimating` build: clean
- `@hbc/features-estimating` lint: clean (0 errors, 2 pre-existing warnings)
- Workspace-level failures in `@hbc/spfx-leadership` (build) and `@hbc/acknowledgment` (lint) are pre-existing and unrelated

---

## 4. Documentation Reconciliation Summary

| Document | Contradiction Resolved |
|----------|----------------------|
| Gap validation report | Verdict changed from "Confirmed gap" to "Resolved"; all remediation targets marked done; all unresolved questions closed or deferred |
| Phase 8 remediation report | Prerequisite #6 no longer describes API approval as a disconnected prerequisite — now references `.sppkg` manifest declaration and the standard approval flow |
| Connected-service-posture | SPFx API permission row now includes `webApiPermissionRequests` details, scope, resource, and operator approval sequence |
| Permission input freeze | Status updated from "Frozen" to "Implemented" |

The `apiAudience` narrative is now consistent across all documents: the full injection chain (`API_AUDIENCE` env → DefinePlugin → shell → mount → token provider) is documented as complete (Phase 8), and the manifest declaration that enables the standard SPFx approval flow is documented as implemented (Phase 9).

---

## 5. Remaining External/Operator Prerequisites

Gap 1 is closed in repo truth. The following operator-executed action is required before production token acquisition will succeed:

| Prerequisite | Who | Where | When |
|-------------|-----|-------|------|
| Deploy `.sppkg` to SharePoint app catalog | IT operator / SharePoint admin | SharePoint app catalog | Deployment time |
| Approve pending API permission request | SharePoint tenant admin | SharePoint admin center → API access page | After `.sppkg` deployment |

Once the admin approves the permission, the "SharePoint Online Client Extensibility" service principal will have a delegated grant for `access_as_user` on the `hb-intel-api-{environment}` app registration. `aadTokenProviderFactory.getToken(audience)` will then succeed, and the frontend will activate production mode.

No code changes are required for this step. The app's graceful degradation (fall back to `ui-review` mode with diagnostic banner) remains in place until approval is granted.

---

## 6. Final Closure Status

**Gap 1 is closed.**

| Dimension | Status |
|-----------|--------|
| Manifest declaration | Implemented — `webApiPermissionRequests` present in authoritative config |
| Packaging path | Verified — declaration survives into `.sppkg` `AppManifest.xml` |
| Documentation | Reconciled — all affected docs updated to reflect implemented truth |
| Code readiness | Complete — no code blockers remain |
| Production readiness | Gated on operator action — admin must approve API permission after deployment |

---

## 7. Follow-on Items Outside Gap 1 Scope

| # | Item | Priority | Notes |
|---|------|----------|-------|
| 1 | ~~Build-time parameterization of `webApiPermissionRequests`~~ | ~~Low~~ | **Implemented (P10-03).** The build orchestrator now supports `SPFX_API_RESOURCE` env var to override `webApiPermissionRequests[0].resource` at build time. See `project-setup-gap-1-parameterization-implementation.md`. |
| 2 | IT setup guide cross-reference | Low | The IT-Department-Setup-Guide.md could reference the `webApiPermissionRequests` declaration as part of the deployment prerequisites. This is an ergonomic improvement, not a correctness gap. |

---

## 8. Version History

| Prompt | Version | Date | Change |
|--------|---------|------|--------|
| P9-G1-02 | `1.0.0.0` → `001.000.001` | 2026-04-01 | Added `webApiPermissionRequests` declaration |
| P9-G1-03 | `001.000.001` → `001.000.002` | 2026-04-01 | Build and package propagation verification |
| P9-G1-04 | `001.000.002` → `001.000.003` | 2026-04-01 | Documentation reconciliation |
| P9-G1-05 | `001.000.003` → `001.000.004` | 2026-04-01 | Final closure record |
