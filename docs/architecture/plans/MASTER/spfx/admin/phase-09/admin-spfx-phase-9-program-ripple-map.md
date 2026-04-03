# Phase 9 — Program Ripple Map and Phase Dependency Reconciliation

## 1. Purpose

Map the upstream and downstream ripple caused by Phase 9's redirect from "broad Entra administration" to "Hybrid Identity Administration" so follow-on ripple prompts (13–17) can make targeted corrections without guessing.

Phase 9 changed:
- the identity authority model (AD DS + Entra, not Entra-only),
- the execution boundary model (AD DS adapter + Graph service, not Graph-only),
- the connection management model (UI-managed connectors with backend credential custody),
- the operator safety model (risk tiers, confirmation checkpoints, sync-status),
- and the no-code IT handoff gate (all setup through UI, not code edits).

These changes ripple into upstream phases (whose docs may still prepare for Entra-only), downstream phases (whose docs may still assume Entra-only governance/safety/observability), and code surfaces (whose naming may still imply Entra-only scope).

## 2. Authority set actually used

| Source | Path | Purpose |
|--------|------|---------|
| End-state plan | `admin-spfx-it-control-center-end-state-plan.md` | Phase definitions, redirect status |
| Target architecture | `admin-spfx-target-architecture.md` | Layer model, identity boundary |
| Phase 9 summary | `phase-09/Admin-SPFx-IT-Control-Center-Phase-9-Summary-Plan.md` | Redirect thesis |
| Phase 9 README | `phase-09/README.md` | Implementation status |
| Phase 5 summary | `phase-05/Admin-SPFx-IT-Control-Center-Phase-5-Summary-Plan.md` | Lane naming |
| Phase 6 summary | `phase-06/Admin-SPFx-IT-Control-Center-Phase-6-Summary-Plan.md` | Identity references |
| Phase 7 summary | `phase-07/Admin-SPFx-IT-Control-Center-Phase-7-Summary-Plan.md` | Provisioning + identity |
| Phase 10 summary | `phase-10/Admin-SPFx-IT-Control-Center-Phase-10-Summary-Plan.md` | Standards governance |
| Phase 11 summary | `phase-11/Admin-SPFx-IT-Control-Center-Phase-11-Summary-Plan.md` | Safety maturity |
| Phase 12 summary | `phase-13/Admin-SPFx-IT-Control-Center-Phase-12-Summary-Plan.md` | Observability |
| Admin folder README | `README.md` | Phase artifact index |
| Lane registry | `apps/admin/src/router/lane-registry.ts` | Lane ID, label, status |
| AdminEnums | `packages/models/src/admin-control-plane/AdminEnums.ts` | Domain enum |

## 3. Confirmed current program assumptions Phase 9 depended on

These assumptions were confirmed as true and Phase 9 built on them correctly:

| Assumption | Status | Evidence |
|-----------|--------|----------|
| SPFx is operator console, not privileged executor | Confirmed | Phase 1 locked decision LD-03; all identity execution in backend |
| Backend is the privileged control plane | Confirmed | Service factory, workflow handlers, audit persistence in `backend/functions` |
| Graph service exists and handles cloud-side identity | Confirmed | `graph-service.ts` expanded with user/group lifecycle |
| Provisioning saga pattern is reusable | Confirmed | Audit bridge pattern, workflow handler pattern reused |
| Admin audit store and evidence model exist | Confirmed | `DurableAdminAuditStore`, `IAdminAuditRecord` used by identity routes |
| Service factory provides singleton container | Confirmed | `createAdminControlPlaneServiceFactory()` extended with `adDirectory`, `connectionRegistry` |

## 4. Confirmed contradictions introduced by the old Entra-only framing

| Location | Contradiction | Severity |
|----------|--------------|----------|
| Phase 5 summary, lane list | Lists "Entra Control" as lane name; code now uses "Identity" label | Low |
| Phase 10 summary, line 128 | References "Entra control actions" in risk statement | Low |
| Phase 11 summary, line 139 | References "Entra control lanes" in contingency note | Low |
| Phase 12 summary, lines 11, 34 | References "Entra-control actions" in observability scope | Medium |
| AdminEnums.ts, line 31 | JSDoc comment says "Entra ID user/group administration" but domain now covers hybrid | Medium |

## 5. Upstream phases affected

### Phase 1 — Boundary hardening (COMPLETE)
**Impact**: None. Phase 1 locked decisions and boundary matrix are architecture-level. They do not assume Entra-only identity. The separation of SPFx (console) from backend (executor) holds for hybrid identity.

### Phase 2 — Control-plane contracts (COMPLETE)
**Impact**: Minimal. The `AdminDomain.EntraControl` enum value and its JSDoc comment need updating. The enum value itself (`'entra-control'`) is acceptable as a stable identifier — only the human-readable comment is stale.

**Required correction**: Update JSDoc on `AdminEnums.ts:31` from "Entra ID user/group administration" to "Hybrid identity administration (AD DS/on-prem and Entra ID/Graph)".

### Phase 3 — Backend foundation (COMPLETE)
**Impact**: None. The service factory, adapter registry, and API surface were designed to be domain-agnostic. Phase 9 extended them cleanly with `adDirectory` and `connectionRegistry`.

### Phase 4 — Durable persistence (COMPLETE)
**Impact**: None. The audit store and evidence model are domain-agnostic. Phase 9 identity routes persist audit records using the same `IAdminAuditRecord` type and `DurableAdminAuditStore`.

### Phase 5 — Operator console shell (COMPLETE)
**Impact**: Low. The Phase 5 summary plan lists "Entra Control" in the lane navigation list. The implemented code (`lane-registry.ts`) correctly uses label "Identity" with ID `entra`. The historical doc is slightly stale but the code is correct.

**Optional correction**: Update Phase 5 summary lane list to say "Identity" or "Hybrid Identity" instead of "Entra Control".

### Phase 6/6A — Install wizard, app-binding (COMPLETE)
**Impact**: None. Phase 6 explicitly defers "broad Entra admin workflow completion" as a non-goal (line 122). No Entra-only assumptions in its implementation.

### Phase 7 — Provisioning hardening (COMPLETE)
**Impact**: None. Phase 7 references "Entra readiness" in the context of provisioning integration, which is appropriate — provisioning-era readiness checks naturally involve Entra/cloud-side validation regardless of hybrid identity.

### Phase 8 — SharePoint control (COMPLETE)
**Impact**: None. Phase 8 is entirely SharePoint-scoped and does not reference identity.

## 6. Downstream phases affected

### Phase 10 — Standards and configuration governance
**Impact**: Low. One risk statement references "Entra control actions" (line 128). The actual governance framework design is domain-agnostic and will work for hybrid identity actions.

**Required correction**: Update line 128 to reference "Identity control actions" or "Hybrid Identity control actions".

### Phase 11 — High-risk action safety maturity
**Impact**: Low. One contingency note references "Entra control lanes" (line 139). Phase 11's safety framework is designed to be domain-pluggable. The Phase 9 risk tier and confirmation checkpoint model already provides the foundation Phase 11 will mature.

**Optional correction**: Update line 139 to reference "Hybrid Identity control lanes".

### Phase 12 — Observability completion
**Impact**: Medium. Two references to "Entra-control actions" in the observability scope (lines 11, 34). Phase 12 must observe hybrid identity operations, not just Entra-only operations. The observability telemetry, dashboards, and alerting design should account for:
- AD DS adapter operations and their failure modes,
- connection health monitoring for both connectors,
- sync-status tracking and propagation delays,
- authority-aware operation categorization.

**Required correction**: Update lines 11 and 34 to reference "Hybrid Identity-control actions".

### Phase 13 — (Not found as separate summary)
**Impact**: N/A. Phase 12 summary is filed under `phase-13/` folder. No separate Phase 13 summary found.

## 7. Canonical correction list by phase

### Required corrections

| Phase | File | Line(s) | Current text | Corrected text | Priority |
|-------|------|---------|-------------|---------------|----------|
| 2 | `packages/models/src/admin-control-plane/AdminEnums.ts` | 31 | `/** Entra ID user/group administration */` | `/** Hybrid identity administration (AD DS/on-prem and Entra ID/Graph) */` | High |
| 10 | `phase-10/...Phase-10-Summary-Plan.md` | 128 | "Entra control actions" | "Hybrid Identity control actions" | Medium |
| 12 | `phase-13/...Phase-12-Summary-Plan.md` | 11 | "Entra-control actions" | "Hybrid Identity-control actions" | Medium |
| 12 | `phase-13/...Phase-12-Summary-Plan.md` | 34 | "Entra control" | "Hybrid Identity control" | Medium |

### Optional corrections

| Phase | File | Line(s) | Current text | Corrected text | Priority |
|-------|------|---------|-------------|---------------|----------|
| 5 | `phase-05/...Phase-5-Summary-Plan.md` | Lane list | "Entra Control" | "Identity" or "Hybrid Identity" | Low |
| 11 | `phase-11/...Phase-11-Summary-Plan.md` | 139 | "Entra control lanes" | "Hybrid Identity control lanes" | Low |

## 8. Repo/code surfaces that need naming or contract alignment

| Surface | Current state | Issue | Required action |
|---------|-------------|-------|----------------|
| `AdminDomain.EntraControl` enum value | `'entra-control'` | Stable identifier — acceptable | None (value is fine) |
| `AdminDomain.EntraControl` JSDoc | "Entra ID user/group administration" | Misleads about scope | Update comment |
| Lane registry ID | `'entra'` | Stable route identifier | None (kept for URL compatibility) |
| Lane registry label | `'Identity'` | Correct | None |
| Lane registry path | `'/entra'` | Stable URL path | None (kept for backward compatibility) |
| Route file name | `hybrid-identity-routes.ts` | Correct | None |
| Audit domain value | `'entra-control'` | Matches enum — consistent | None |
| Admin app page name | `EntraLanePage.tsx` | Historical file name | None (rename would break imports; label is correct) |

## 9. Explicit non-ripple items

The following items do **not** require correction as part of the Phase 9 ripple:

| Item | Reason |
|------|--------|
| Phase 1 locked decisions | Architecture-level; domain-agnostic |
| Phase 2 contract types (non-comment) | Type definitions are structurally correct |
| Phase 3 service factory pattern | Extended cleanly; no contradiction |
| Phase 4 audit/evidence model | Domain-agnostic; works for hybrid identity |
| Phase 6/6A install wizard | Explicitly defers identity scope |
| Phase 7 provisioning hardening | "Entra readiness" reference is contextually appropriate |
| Phase 8 SharePoint control | No identity references |
| `@hbc/features-admin` package | Correctly bounded away from identity execution |
| `@hbc/ui-kit` components | Used by identity lane; no ownership change |
| File names (`EntraLanePage.tsx`, etc.) | Renaming would break imports for minimal benefit |
| Enum values (`'entra-control'`, `'entra'`) | Stable identifiers; renaming would require migration |

## 10. Minimal unresolved items to carry forward

| Item | Target prompt | Notes |
|------|--------------|-------|
| AdminEnums.ts JSDoc comment update | Prompt 13 | 1-line code change; requires type-check verification |
| Phase 10 summary terminology | Prompt 15 | Doc-only; 1 line |
| Phase 11 summary terminology | Prompt 15 | Doc-only; 1 line (optional) |
| Phase 12 summary terminology | Prompt 15 | Doc-only; 2 lines |
| Phase 5 summary lane name | Prompt 13 | Doc-only; 1 line (optional) |
| End-state plan reconciliation | Prompt 16 | Already correct; verify during final reconciliation |
| Target architecture reconciliation | Prompt 16 | Already correct; verify during final reconciliation |
