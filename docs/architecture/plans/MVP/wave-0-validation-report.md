> **ERRATA (2026-03-16):** Finding C1 in this report ("Phase 7 gate ADR number corrected (ADR-0090, not ADR-0091)") was incorrect. ADR-0090 is `ADR-0090-signalr-per-project-groups.md` (the SignalR per-project-groups decision, accepted 2026-03-07). The Phase 7 Final Verification & Sign-Off ADR is **ADR-0091** (`ADR-0091-phase-7-final-verification.md`, accepted 2026-03-09). All references to "ADR-0090 (Phase 7 Final Verification & Sign-Off)" in Wave 0 plan files have been corrected to ADR-0091. See P0-A2 Divergence Log D-004.

# Wave 0 Build-Out Plan — Validation Report

> **Doc Classification:** Canonical Normative Plan — Implementation report for the validation and reconciliation of `HB-Intel-Wave-0-Buildout-Plan.md` against live codebase, governing documents, and the MVP Project Setup plan set (T01–T08). Captures methodology, evidence, claim verdicts, and changes made.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Complete
**Validates:** `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` (updated to v1.1)
**Evidence Sources:** Live codebase inspection (apps/, packages/, backend/), CLAUDE.md v1.6, current-state-map.md, MVP Project Setup Plan (T01–T08)

---

## Summary

The Wave 0 Build-Out Plan (v1.0) was validated against live codebase contents, governing repository documents, and the MVP Project Setup plan set (T01–T08). The validation confirmed that while the plan's overall architecture, sequencing rationale, risk analysis, and governance framework were sound, five categories of corrections were required.

Two code fixes were also applied directly to the repository as part of this validation:

1. **Admin router bug** — `/provisioning-failures` route was wired to the wrong component (`SystemSettingsPage` instead of `ProvisioningFailuresPage`). Fixed.
2. **Missing dependency declaration** — `apps/admin/package.json` was missing `@hbc/provisioning: workspace:*` despite `ProvisioningFailuresPage.tsx` importing from it. Fixed.

---

## Methodology

Validation was performed by:

1. Reading and cross-referencing all eight MVP Project Setup task plans (T01–T08) against the Wave 0 umbrella plan's claims.
2. Directly inspecting the following codebase surfaces:
   - `apps/estimating/src/pages/` (NewRequestPage, RequestDetailPage)
   - `apps/estimating/src/components/ProvisioningChecklist.tsx`
   - `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`
   - `apps/accounting/src/router/routes.ts`
   - `apps/project-hub/src/pages/`
   - `apps/admin/src/router/routes.ts`
   - `apps/admin/src/pages/ProvisioningFailuresPage.tsx`
   - `apps/admin/package.json`
   - `backend/functions/src/services/msal-obo-service.ts`
   - `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
3. Cross-referencing governing documents: CLAUDE.md v1.5→v1.6, current-state-map.md, HB-Intel-Dev-Roadmap.md.

---

## Claim Set A — Phase 7 Governance Gate

### Claim A1
**Plan claim:** "ADR-0091 must be created, all P1 gate tests must pass" (executive conclusion §1, G0.3, Top Risks W0-R8, Code-Ready gate).

**Finding:** Incorrect ADR number. CLAUDE.md §6.3.1 and the CLAUDE.md footer both state: "ADR-0090 must be created before any feature-expansion phase begins." ADR-0090 is the Phase 7 Final Verification & Sign-Off ADR. The plan header itself lists "Next ADR Available: ADR-0114", confirming ADR-0091 was already created (as something else) and the Phase 7 sign-off ADR is ADR-0090.

**Verdict:** Incorrect — all "ADR-0091 (Phase 7 sign-off)" references corrected to ADR-0090.

**Changes applied:** Executive conclusion, G0.3, Top Risks W0-R8, Code-Ready gate, body reference in implementation groups.

---

### Claim A2
**Plan claim:** All CLAUDE.md references cite "CLAUDE.md v1.5" in the Governing Constraints section.

**Finding:** CLAUDE.md was updated to v1.6 during the same session (Package Relationship Map addition, §1 Directive 7, §7 pitfalls). All governing constraint citations should reference v1.6.

**Verdict:** Stale version reference — all five "CLAUDE.md v1.5" occurrences in Governing Constraints corrected to "CLAUDE.md v1.6".

---

## Claim Set B — Backend Auth Model

### Claim B1
**Plan claim:** Multiple sections state "PnPjs OBO", "MSAL OBO token acquisition", "MSAL OBO authentication is the correct approach", "MSAL OBO flow production configuration not confirmed", "MSAL OBO service principal", "OBO token acquisition expiry handling."

**Finding:** Direct inspection of `backend/functions/src/services/msal-obo-service.ts` confirms the class `ManagedIdentityOboService` uses `DefaultAzureCredential` from `@azure/identity` — not MSAL On-Behalf-Of. The `getSharePointToken` method calls `this.credential.getToken(resource)` using the system-assigned Managed Identity. The class name contains "Obo" as legacy nomenclature only; the actual implementation is Managed Identity.

**Evidence:**
```typescript
export class ManagedIdentityOboService implements IMsalOboService {
  private readonly credential = new DefaultAzureCredential();
  async getSharePointToken(siteUrl: string): Promise<string> {
    const tenantHost = new URL(siteUrl).hostname;
    const resource = `https://${tenantHost}/.default`;
    const tokenResponse = await this.credential.getToken(resource);
    return tokenResponse.token;
  }
}
```

**Verdict:** Incorrect — "MSAL OBO" replaced with "Managed Identity (DefaultAzureCredential)" throughout. Implications: (1) no client ID/secret is needed; (2) the Azure Function app must have a system-assigned identity; (3) that identity must be granted `Sites.Selected` and `Group.ReadWrite.All` permissions in the target tenant; (4) token refresh is handled by the Azure Identity SDK automatically.

**Changes applied:** Executive conclusion §2, External Research PnPjs section, Partial/Scaffolded SharePoint service section, Backend/Integration Gaps, W0-M10, G2.2, W0-A Required Work, W0-A Risk Controls, Environment-Ready Gate.

---

## Claim Set C — Missing UI Surfaces

### Claim C1
**Plan claim (W0-M1):** "No component, route, or page exists for this workflow [project setup request form] in any SPFx app or the PWA."

**Finding:** `apps/estimating/src/pages/NewRequestPage.tsx` exists and implements a project setup request form with project metadata fields. It submits via the provisioning store. However: (1) it is **missing** the `department` field required by the provisioning contract; (2) it does not use `@hbc/step-wizard`; (3) it does not exist in the admin or PWA contexts.

**Verdict:** False — the claim of complete absence is incorrect. Reclassified from "Missing" to "Partial": exists in `apps/estimating`, incomplete (missing `department` field, not using `@hbc/step-wizard`), absent from admin and PWA.

**Changes applied:** W0-M1 description rewritten; Wave 0 Gaps product list updated.

---

### Claim C2
**Plan claim (W0-M2):** "No consumer component exists" for provisioning status tracking / progress view.

**Finding:** Three implementations exist at varying stages of completeness:
- `apps/estimating/src/pages/RequestDetailPage.tsx` — per-request detail view
- `apps/estimating/src/components/ProvisioningChecklist.tsx` — step-by-step status checklist
- `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx` — minimal scaffold in the PWA

None are connected to `useProvisioningSignalR` for real-time updates. None are in the Project Hub SPFx context.

**Verdict:** False — the claim of complete absence is incorrect. Reclassified from "Missing" to "Partial": step checklist and request detail view exist in `apps/estimating`; minimal scaffold in PWA; real-time SignalR connection not yet wired.

**Changes applied:** W0-M2 description rewritten; Wave 0 Gaps product list updated.

---

### Claim C3
**Plan claim (W0-M4):** "A UI surface listing all failed provisioning runs with retry and escalate actions. The backend endpoints (`listFailedRuns`, `retryProvisioning`, `escalateProvisioning`) exist, but no UI consumes them."

**Finding:** `apps/admin/src/pages/ProvisioningFailuresPage.tsx` is fully implemented — 173 lines of production-quality code including `HbcDataTable`, per-row retry/escalate buttons with in-flight action state, error handling, `useCallback` loading pattern, and typed column definitions using `ColumnDef<IProvisioningStatus>`. The page consumes `createProvisioningApiClient` from `@hbc/provisioning` and renders within `WorkspacePageShell`.

The page was **unreachable** because `apps/admin/src/router/routes.ts` line 45 was wired to `SystemSettingsPage({ initialSection: 'role-change-review' })` instead of `ProvisioningFailuresPage`. Additionally, `@hbc/provisioning` was not listed in `apps/admin/package.json` dependencies despite being imported.

**Verdict:** False — the page is fully implemented, not absent. The gap was a router misconfiguration and a missing dependency declaration, not an absence of implementation.

**Code fixes applied (2026-03-14):**
- `apps/admin/src/router/routes.ts` line 45: changed `import('../pages/SystemSettingsPage.js').then(...)` to `import('../pages/ProvisioningFailuresPage.js').then((m) => ({ default: m.ProvisioningFailuresPage }))`
- `apps/admin/package.json`: added `"@hbc/provisioning": "workspace:*"` to dependencies

**Plan changes applied:** W0-M4 reclassified from "Missing" to "Implemented (Router Bug Fixed 2026-03-14)"; Wave 0 Gaps product list updated; W0-E Required Work updated; Admin Webpart App Shell section in Current-State Assessment updated.

---

### Claim C4
**Plan claim:** "No provisioning-specific admin UI (failures inbox, retry, escalate, controller gate) is implemented" (Partial/Scaffolded section, Admin Webpart App Shell).

**Finding:** The failures inbox is implemented (see C3 above). The controller gate review UI is correctly identified as absent.

**Verdict:** Partially false — corrected to note failures inbox is implemented (router bug fixed); controller gate UI remains absent.

---

## Claim Set D — Governance Document References

### Claim D1
**Plan claim:** The plan makes no reference to the MVP Project Setup plan set (T01–T08) and suggests in Follow-On Planning item 3 that a detailed branch plan must be created.

**Finding:** `docs/architecture/plans/MVP/project-setup/` contains a complete plan set: `MVP-Project-Setup-Plan.md` (umbrella) and eight task plans T01–T08 covering scaffold/docs, contracts, controller gate UI, estimating surfaces, provisioning orchestrator, SharePoint permissions, admin recovery/notifications, and project-hub completion. These are exactly the detailed branch plans the Wave 0 umbrella calls for.

**Verdict:** Gap — the Wave 0 umbrella plan was unaware of or did not reference these existing detailed plans. Corrected by adding a "Read with" pointer in the document header and rewriting Follow-On Planning item 3 to point to T01–T08 as the authoritative detailed branch plans for the Project Setup stream.

**Changes applied:** Header "Read with" block updated; Follow-On Planning item 3 rewritten.

---

## Files Modified

| File | Change | Nature |
|------|--------|--------|
| `apps/admin/src/router/routes.ts` | Fixed `/provisioning-failures` route component from `SystemSettingsPage` to `ProvisioningFailuresPage` | Bug fix |
| `apps/admin/package.json` | Added `"@hbc/provisioning": "workspace:*"` to dependencies | Bug fix |
| `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` | Updated from v1.0 to v1.1 with all validated corrections | Plan correction |
| `docs/architecture/plans/MVP/wave-0-validation-report.md` | Created (this document) | New document |

---

## Claims Validated as Correct (No Changes Required)

The following aspects of the Wave 0 plan were verified against codebase and governing documents and found accurate:

- Backend provisioning saga architecture (7-step, idempotency, compensation Steps 1/2/7, exponential retry, SignalR push, AppInsights telemetry) — confirmed in `saga-orchestrator.ts`
- `@hbc/provisioning` headless package completeness (state machine, Zustand store, SignalR hook, API client, visibility logic, notification templates) — confirmed
- `withRetry` utility does NOT parse `Retry-After` headers — confirmed; the gap exists and must be fixed (G2.1)
- Steps 3–4 compensation behavior is incomplete — confirmed; saga only compensates Steps 1, 2, 7
- Backend `withRetry` base delay configuration (maxAttempts:3, baseDelayMs:2000) — confirmed
- All SPFx app shells scaffolded with provider hierarchy — confirmed (all 11 apps)
- `@hbc/step-wizard` exists and is unconnected to provisioning workflows — confirmed
- Platform primitives (`@hbc/bic-next-move`, `@hbc/notification-intelligence`, `@hbc/session-state`, `@hbc/workflow-handoff`) are implemented but not yet wired to provisioning — confirmed
- `apps/accounting` has no provisioning/controller routes — confirmed (only 3 routes: index, budgets, invoices)
- `apps/project-hub/src/pages/` has no completion/getting-started surface — confirmed
- Circular dependency `@hbc/score-benchmark` ↔ `@hbc/post-bid-autopsy` — confirmed (noted in Wave 0 context as Wave 1 blocker)
- Dual-stream SPFx/PWA delivery requirement — confirmed per roadmap §3.2
- ADR-0083 three-level release-readiness taxonomy governs Wave 0 gates — confirmed

---

## Current-State Map Update Required

The following new document must be added to `current-state-map.md §2` (document classification matrix):

| Document | Class | Location |
|----------|-------|----------|
| `docs/architecture/plans/MVP/wave-0-validation-report.md` | Canonical Normative Plan | This file |

`HB-Intel-Wave-0-Buildout-Plan.md` already exists in the matrix from v1.0 creation; the v1.1 update does not require a new matrix row, but the "v1.1 (Proposed — Validated)" status change should be noted.

---

*End of Wave 0 Build-Out Plan Validation Report v1.0*
