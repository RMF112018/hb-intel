# Phase 5 — Release-Hardening Baseline

> Created: 2026-03-30
> Prompt: P5-01 Repo Truth and Release-Hardening Baseline
> Governing: Phase-5_Release-Hardening_Action-Plan.md

## Purpose

Canonical release-hardening baseline for the Project Setup package. Inventories all existing release evidence, identifies what is still missing, classifies blockers by severity, and defines the exact retained launch surface.

---

## 1. Retained Launch Surface

### Frontend (`@hbc/spfx-project-setup` v0.2.22)

| Surface | Description | Status |
|---------|-------------|--------|
| Project Setup wizard | Multi-step request submission form | Implemented |
| Request list page | Scoped request listing (my requests / all) | Implemented |
| Request detail page | Status, provisioning checklist, SignalR updates | Implemented |
| Mode switcher | ui-review ↔ production toggle (when allowed) | Implemented |
| Production-mode gating | Readiness check before live API calls | Implemented (P3-02) |
| SPFx token acquisition | `createSpfxApiTokenProvider` for audience-scoped tokens | Implemented (P3-02) |

### Backend (`@hbc/functions` v0.0.81)

| Surface | Routes | Status |
|---------|--------|--------|
| Project Setup request lifecycle | 4 HTTP (POST/GET/GET/{id}/PATCH state) | Implemented |
| Provisioning saga + admin oversight | 10 HTTP + 1 timer | Implemented |
| SignalR negotiate | 1 HTTP | Implemented |
| Acknowledgments | 2 HTTP | Implemented |
| Health probe | 1 HTTP (unauthenticated) | Implemented |
| Timer: timerFullSpec | 1 timer (1 AM EST) | Implemented |
| Timer: cleanupIdempotency | 1 timer (3 AM EST) | Implemented |
| Co-deployed: 10 domain CRUD surfaces | ~64 HTTP (lazy-initialized) | Implemented, not Project Setup scope |
| Proxy stub | 2 HTTP (returns mock data) | Stub — not launch-critical |

---

## 2. Current Release Evidence Inventory

### Test Coverage

| Package | Test Files | Tests | Status |
|---------|-----------|-------|--------|
| `@hbc/functions` (backend) | 47 | 538 pass, 3 skip | Green |
| `@hbc/auth` | 33 | 230 pass | Green |
| `@hbc/provisioning` | 20 | 272 pass, 1 skip, 10 todo | Green |
| `@hbc/shell` | 26 | 214 pass | Green |
| **Total** | **126** | **1,254 pass** | **Green** |

### Build / Type / Lint

| Check | Package | Result |
|-------|---------|--------|
| `tsc --noEmit` | `@hbc/functions` | Clean |
| `tsc --noEmit` | `@hbc/spfx-project-setup` | Clean |
| `tsc --noEmit` | `@hbc/auth` | Clean |
| `eslint` | `@hbc/functions` | 0 errors (67 warnings) |
| `eslint` | `@hbc/spfx-project-setup` | 0 errors (61 warnings) |
| `vite build` | `@hbc/spfx-project-setup` | Pass (3627 modules, 338 kB gzip) |

### Specific Test Categories

| Category | Tests | Evidence Location |
|----------|-------|-------------------|
| Token validation (v1/v2, structured errors) | 18 | `validateToken.test.ts` |
| Auth middleware (withAuth, telemetry) | 12 | `auth.test.ts` |
| Auth contract (route scan) | 4 | `auth-contract.test.ts` |
| Auth release readiness | 5 | `auth-release-readiness.test.ts` |
| Boot behavior (startup validation) | 8+ | `boot-behavior.test.ts` |
| Config registry contract | 16 | `wave0-env-registry.test.ts` |
| Infrastructure readiness | 7 | `infra-readiness.test.ts` |
| Health endpoint diagnostics | 12 | `health.test.ts` |
| Provisioning saga orchestrator | 8 | `saga-orchestrator.test.ts` |
| Provisioning saga steps | 9 | `steps.test.ts` |
| Activation flow (§18.7 8.1) | 13 | `activation-flow.integration.test.ts` |
| SP field mapping | 3 | `sp-field-mapping.test.ts` |
| SPFx project context resolution | 6 | `spfxProjectContext.test.ts` |

### Documentation Deliverables

| Phase | Deliverable Count | Key Docs |
|-------|------------------|----------|
| Phase 2 | 10 | Field map baseline, data contract gaps, normalization rules |
| Phase 3 | 9 | Auth matrix, token contract, capability boundary, production mode contract |
| Phase 4 | 8 | Infra baseline, startup scope, identity/secrets, CORS/permissions, operator handoff |
| **Total** | **27** | |

### Diagnostics & Operational Readiness

| Diagnostic | Status | Location |
|-----------|--------|----------|
| Health endpoint with `operationalReadiness` | Implemented (P4-05) | `health/index.ts` |
| Tiered config status (`core`/`sharepoint`/`provisioning`) | Implemented (P4-02/05) | Health response |
| Provisioning prerequisite breakdown | Implemented (P4-05) | Health response |
| Telemetry event catalog (15 events) | Documented | `Phase-4_Operational-Readiness-and-Handoff.md` |
| Failure triage runbook | Documented | `Phase-4_Operational-Readiness-and-Handoff.md` |
| Release go/no-go gates | Documented | `Phase-4_Operational-Readiness-and-Handoff.md` |
| Pre-deployment checklist | Documented | `Phase-4_Operational-Readiness-and-Handoff.md` |

---

## 3. Missing Release Evidence Inventory

### Category A: Launch Blockers (Must Close Before Production)

| # | Missing Evidence | Severity | Impact | Governing Prompt |
|---|------------------|----------|--------|-----------------|
| A1 | No E2E test for request submission → provisioning → completion lifecycle | High | Cannot prove full lifecycle works against live backend | P5-02 |
| A2 | No smoke test script for post-deploy validation | High | Deployment validation depends on manual checking | P5-03 |
| A3 | No deployment runbook (step-by-step deployment sequence) | High | Deployment depends on tribal knowledge | P5-04 |
| A4 | No rollback procedure documented | High | Failed deployment has no documented recovery path | P5-04 |
| A5 | No production-readiness signoff artifact | High | Leadership cannot make informed go/no-go decision | P5-05 |

### Category B: Significant Gaps (Should Close Before Production)

| # | Missing Evidence | Severity | Impact | Governing Prompt |
|---|------------------|----------|--------|-----------------|
| B1 | No integration test for ui-review vs production mode switching | Medium | Mode behavior untested end-to-end | P5-02 |
| B2 | No test for SharePoint field-mapping contract against production schema | Medium | Data loss risk if schema drifts | P5-02 |
| B3 | No test for missing-config failure behavior (what user sees) | Medium | UX on config failure is undefined | P5-02 |
| B4 | No App Insights alert rules deployed | Medium | Failures go unnoticed until manual check | P5-03 |

### Category C: Cleanup / Nice-to-Have

| # | Missing Evidence | Severity | Impact |
|---|------------------|----------|--------|
| C1 | Proxy stub still registered (returns mock data) | Low | Dead code in production — cosmetic |
| C2 | Email delivery is stub-only | Low | Notifications log but don't send — documented |
| C3 | Dual RBAC not converged (UPN vs JWT roles) | Low | Both work but not unified — documented |
| C4 | `resolveSessionToken()` deprecated function still present | Low | Unused — cleanup only |
| C5 | 67 backend eslint warnings | Low | Pre-existing — no functional impact |

---

## 4. Contradictions Discovered

| Area | Expectation | Repo Truth | Resolution |
|------|-------------|------------|------------|
| SignalR push "mocked" | P4-01 Gap 3 stated SignalR push was mocked | `MockSignalRPushService` actually extends `RealSignalRPushService` — it IS real | Fixed in P4-03 with conditional `NoOpSignalRPushService` when connection string absent |
| Health endpoint core check | Health checked 7 settings | P3-03 added `API_AUDIENCE` as required → now 8 | Fixed in P4-02 to include `API_AUDIENCE` |
| `AZURE_CLIENT_SECRET` | Listed as optional in config | Never consumed by any service | Removed in P4-03 |

No unresolved contradictions remain.

---

## 5. Release Impact Summary

| Verdict | Count | Items |
|---------|-------|-------|
| Launch Blockers | 5 | A1–A5 (E2E lifecycle test, smoke script, deployment runbook, rollback, signoff) |
| Significant Gaps | 4 | B1–B4 (mode test, SP schema test, config failure UX, alerts) |
| Cleanup Only | 5 | C1–C5 (proxy stub, email stub, dual RBAC, deprecated fn, lint warnings) |
| **Current test coverage** | **1,254 tests across 126 files** | All green |
| **Docs coverage** | **27 deliverables across Phases 2–4** | Complete |

### Phase 5 Remaining Work

Prompts 02–06 must close the 5 launch blockers (A1–A5) and should close the 4 significant gaps (B1–B4). Category C items are acceptable for post-launch cleanup.
