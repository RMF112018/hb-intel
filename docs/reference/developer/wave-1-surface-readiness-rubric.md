# Wave 1 Surface Readiness Rubric

**Purpose:** Define what "usable enough" means for each Wave 1 stream across SPFx, PWA, and cross-surface shared flows.
**Date:** 2026-03-15
**Governing references:** Roadmap §6 (gate definitions), §9 (Wave 1 expectations), Unified Blueprint §7.2 (implementation trust)

---

## 1. Readiness Dimensions

Every Wave 1 stream must satisfy these dimensions before it can be considered ready for the target surface.

| Dimension | SPFx Requirement | PWA Requirement | Cross-Surface Requirement |
|-----------|-----------------|-----------------|---------------------------|
| **Workflow coherence** | Target workflow works end-to-end in SharePoint context | Same workflow works in PWA context | Shared state consistency between surfaces |
| **Auth / RBAC** | SPFx adapter via `@hbc/auth/spfx` | MSAL adapter via `@hbc/auth` | Same permission model, same guard contracts |
| **Route protection** | Root-route guard + workspace-level `beforeLoad` | `ProtectedContentGuard` + `beforeLoad` guards | Same `requireAuth()` / `requirePermission()` functions |
| **Ownership visibility** | BIC module registered, urgency badges shown | Same via Work Hub feed + workspace surfaces | Same `PROJECT_SETUP_BIC_CONFIG` pattern, same action strings |
| **Failure handling** | Error boundaries + responsive failure catalog | Same + offline queue for transient failures | Shared failure modes (FM-01–FM-10) |
| **Offline / degraded** | N/A (SharePoint-hosted, always online) | `HbcConnectivityBar` + `HbcSyncStatusBadge` + operation queue | `@hbc/session-state` provides infrastructure |
| **Freshness** | Live data via SharePoint context | Last-synced indicator + `isStale` flag | Per Unified Blueprint §7.2 — no silent staleness |
| **Admin recovery** | Admin SPFx app (`/provisioning-failures`, `/dashboards`) | Admin workspace in PWA | Shared admin surfaces and permission gates |
| **Explainability** | State labels, action strings, coaching prompts | Same + ranking reason in Work Hub | Per Unified Blueprint §7.2 — system must explain itself |

---

## 2. Per-Stream Readiness Rubrics

### 2.1 Personal Work Hub

| Criterion | SPFx | PWA |
|-----------|------|-----|
| Surface exists | N/A — PWA-only surface | `/my-work` route with `HbcMyWorkFeed` |
| Feed loads | N/A | BIC items from all registered modules appear |
| Offline works | N/A | `HbcMyWorkOfflineBanner` shows; cached items remain visible |
| Role-aware | N/A | Executive sees team mode; default sees personal mode |
| Badge count | N/A | `HbcMyWorkBadge` in shell header shows unread/actionable count |
| Drill-in works | N/A | "Open" action navigates to source workspace |
| Freshness shown | N/A | Last-synced timestamp; stale indicator when data age > threshold |

### 2.2 Project Hub

| Criterion | SPFx | PWA |
|-----------|------|-----|
| Project detail | Health pulse indicator visible | Same |
| BIC integration | Health pulse BIC adapter registered | Items appear in Work Hub feed |
| Navigation | Direct SharePoint access | Work Hub drill-in → Project Hub workspace |
| Complexity gating | Essential/standard/expert field visibility | Same |

### 2.3 Estimating

| Criterion | SPFx | PWA |
|-----------|------|-----|
| Guided setup wizard | 5-step wizard with draft persistence | Same + offline draft auto-save |
| Request detail | State badge, ownership, clarification banner | Same |
| Coordinator retry | Failure classification, 5-condition eligibility | Same |
| Completion handoff | Completion card, Project Hub URL | Same |
| BIC integration | Bid readiness BIC adapter registered | Items appear in Work Hub feed |
| Draft persistence | `@hbc/session-state` draft management | Same + IndexedDB persistence across refresh |

### 2.4 Business Development

| Criterion | SPFx | PWA |
|-----------|------|-----|
| Score benchmark | Score dashboard with recommendations | Same |
| Strategic intelligence | Heritage panel with trust/workflow contracts | Same |
| BIC integration | Score + strategic BIC adapters registered | Items appear in Work Hub feed |
| Related items | Cross-module record relationships | Same |

---

## 3. Exit Criteria Matrix

| Stream | SPFx Ready When | PWA Ready When |
|--------|----------------|----------------|
| **Personal Work Hub** | N/A (PWA-only) | Feed loads with BIC items from all Wave 1 modules; offline banner works; role-aware landing configured; badge count accurate |
| **Project Hub** | Project detail with health pulse visible; complexity gating active | Same + Work Hub drill-in navigates correctly |
| **Estimating** | Guided setup wizard end-to-end; request detail with coordinator retry; completion handoff | Same + offline draft persistence; Work Hub drill-in |
| **Business Development** | Score benchmark dashboard; strategic intelligence panel | Same + Work Hub drill-in |

---

## 4. Cross-Surface Consistency Rules

1. **Same BIC config.** Both surfaces use the same `PROJECT_SETUP_BIC_CONFIG` (and analogous feature configs). No surface-specific BIC overrides.
2. **Same permission model.** Both surfaces evaluate permissions through `@hbc/auth` guards. No surface-local permission checks.
3. **Same failure modes.** Both surfaces handle FM-01 through FM-10 identically. Failure behavior is defined in `@hbc/provisioning/src/failure-modes.ts`, not per-surface.
4. **Same display strings.** State labels, action strings, urgency indicators, and coaching prompts come from shared registries. No surface-local display string overrides.

---

## Related Documents

- [SPFx Baseline](./spfx-baseline.md) — dependency baseline and constraints
- [PWA Shell Baseline](./pwa-shell-baseline.md) — landing behavior, route protection, shell capabilities
- [Degraded-State UX Standard](./degraded-state-ux-standard.md) — offline/degraded rules
- [Freshness Behavior](./freshness-behavior.md) — last-synced, stale indicators, update handling
- [Wave 1 Dependency Matrix](./wave-1-dependency-matrix.md) — shared-package readiness
