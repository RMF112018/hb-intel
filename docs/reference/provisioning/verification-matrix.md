# Provisioning Verification Matrix

**Purpose:** Consolidated pass/fail evidence matrix for all provisioning lifecycle paths at Wave 0 closeout.
**Date:** 2026-03-15
**Scope:** C1 (end-to-end lifecycle), C2 (explainability), C3 (supportability), C4 (dead wiring audit)

---

## 1. Happy Path (Request → Completion)

| Step | State Transition | Verified By | Evidence |
|------|-----------------|-------------|----------|
| Request creation | → Submitted | `apps/estimating/src/test/NewRequestPage.test.tsx` | Draft auto-save, wizard steps 1–5, submission, complexity gating |
| Controller review | Submitted → UnderReview | `apps/estimating/src/test/RequestDetailPage.test.tsx` | State badge, ownership display, complexity-gated fields |
| Approve / route | UnderReview → ReadyToProvision | `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx` | Approve action, clarify/hold/route-to-admin actions |
| Provisioning saga | ReadyToProvision → Provisioning → Completed | `backend/functions/src/provisioning/saga-orchestrator.test.ts`, `steps.test.ts` | 7-step saga execution, step3 template files, step4 data lists, compensation chain |
| Progress tracking | During Provisioning | `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx` | SignalR step-by-step checklist with real-time status updates |
| Completion handoff | Completed → Project Hub | `apps/estimating/src/test/RequestDetailPage.completion.test.tsx` | Completion card, Project Hub URL, stay-in-estimating dismissal, handoff assembly |
| Status visibility | All 8 states | `packages/provisioning/src/summary-field-registry.test.ts` | `PROJECT_SETUP_STATUS_LABELS` (8 labels), `STATE_BADGE_VARIANTS`, `REQUEST_STATE_KEBAB_MAP` |
| Ownership visibility | All 8 states | `packages/provisioning/src/bic-config.test.ts` | `deriveCurrentOwner()` tested for all 8 states + edge cases |

**Verdict:** PASS

---

## 2. Clarification Path

| Step | Verified By | Evidence |
|------|-------------|----------|
| Controller requests clarification | `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx` | Clarify action available from review surface |
| Requester sees clarification | `apps/estimating/src/test/RequestDetailPage.test.tsx` | Clarification banner displayed |
| Requester responds via wizard | `apps/estimating/src/test/NewRequestPage.test.tsx` | Clarification return flow, field-to-step mapping, data preservation |
| BIC ownership transfers correctly | `packages/provisioning/src/bic-config.test.ts` | NeedsClarification → Requester; UnderReview → Controller |
| Notification fires | `packages/provisioning/src/notification-registrations.test.ts` | `provisioning.clarification-requested` (immediate) and `provisioning.clarification-responded` (immediate) |

**Verdict:** PASS

---

## 3. Failure & Recovery Path

| Step | Verified By | Evidence |
|------|-------------|----------|
| First failure | `packages/provisioning/src/notification-registrations.test.ts` | `provisioning.first-failure` event (immediate tier, push+email+in-app) |
| Coordinator retry | `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx` | Retry eligibility 5-condition check, retry action, failure classification display |
| Escalated failure (2nd+ attempt) | `packages/provisioning/src/notification-registrations.test.ts` | `provisioning.second-failure-escalated` event (immediate, includes admin) |
| Saga compensation | `backend/functions/src/provisioning/compensation.test.ts` | Compensation chain rollback verification |
| Recovery notification | `packages/provisioning/src/notification-registrations.test.ts` | `provisioning.recovery-resolved` event (watch tier) |

**Verdict:** PASS

---

## 4. Admin Recovery Path

| Step | Verified By | Evidence |
|------|-------------|----------|
| Failure inbox (state-filtered tabs) | `apps/admin/src/test/ProvisioningOversightPage.test.tsx` | Active/Failures/Completed/All tab filtering (17 tests) |
| Detail modal with saga step log | `apps/admin/src/test/ProvisioningOversightPage.test.tsx` | Modal content, step log, complexity-gated diagnostics |
| Force retry | `apps/admin/src/test/ProvisioningOversightPage.test.tsx` | Admin-exclusive action, permission-gated (`admin:provisioning:retry`) |
| Archive | `apps/admin/src/test/ProvisioningOversightPage.test.tsx` | Admin-exclusive action (`admin:provisioning:archive`) |
| Acknowledge escalation | `apps/admin/src/test/ProvisioningOversightPage.test.tsx` | Admin-exclusive action |
| State override (expert-tier) | `apps/admin/src/test/ProvisioningOversightPage.test.tsx` | Expert-tier action (`admin:provisioning:force-state`) |
| Alert monitoring | `apps/admin/src/test/alertPollingService.test.ts` | Alert polling service (9 tests), skip-when-no-backend |
| Operational dashboards | `apps/admin/src/test/OperationalDashboardPage.test.tsx` | Alert summary, probe health, infrastructure status (10 tests) |
| Cross-app navigation | `apps/admin/src/test/ProvisioningOversightPage.test.tsx` | `?projectId=` parameter from Estimating/Accounting entry points |

**Verdict:** PASS

---

## 5. Explainability Verification (C2)

| Requirement | Source | Status |
|-------------|--------|--------|
| Every state has a human-readable label | `PROJECT_SETUP_STATUS_LABELS` — 8 labels covering all states | PASS |
| Every state has an expected-action string | `PROJECT_SETUP_ACTION_MAP` — 8 action strings per state | PASS |
| Every state has a BIC owner or explicit system designation | `deriveCurrentOwner()` — tested for all 8 states; null for system-owned states | PASS |
| Failure states explain what happened | `docs/reference/spfx-surfaces/responsive-failure-catalog.md` — 11 failure scenarios | PASS |
| Admin can diagnose without developer help | `docs/maintenance/provisioning-runbook.md` + `provisioning-observability-runbook.md` | PASS |
| Coaching prompts guide essential-tier users | `PROJECT_SETUP_COACHING_PROMPTS` — 4 prompts for key states | PASS |
| Urgency is visible and color-coded | `URGENCY_INDICATOR_MAP` — tier → label + color for each urgency level | PASS |
| Blocked states explain why they're blocked | BIC config `blockedReason` field — "Waiting for external setup" / "Requester retry exhausted" | PASS |

**Verdict:** PASS

---

## 6. Supportability Verification (C3)

| Requirement | Source | Status |
|-------------|--------|--------|
| Common failures diagnosable from UI | Admin detail modal with saga step log, error context | PASS |
| Admin surface covers recovery actions | 4 admin-exclusive actions: retry, archive, ack escalation, state override | PASS |
| Runbook covers manual procedures | `provisioning-runbook.md` — retry, escalation, Table Storage, Step 5 manual trigger | PASS |
| Observability queries exist | `provisioning-observability-runbook.md` — 5 KQL templates, 2 alert rule definitions | PASS |
| Permission model enforces boundaries | 6 granular `admin:provisioning:*` permissions (`@hbc/auth` G6-T02) | PASS |
| Failure mode catalog exists | `packages/provisioning/src/failure-modes.ts` — FM-01 through FM-10 | PASS |
| Integration rules documented | `packages/provisioning/src/integration-rules.ts` — IR-01 through IR-07 | PASS |

**Verdict:** PASS

---

## 7. Dead Wiring Audit (C4)

| Item | Status | Disposition |
|------|--------|-------------|
| SF17 persistence layer (`AdminAlertsApi`, `ApprovalAuthorityApi`, `InfrastructureProbeApi`) | In-memory only | Wave 1 scope — `current-state-map.md §7.2` |
| Teams webhook delivery | Fire-and-forget, no confirmation | Wave 1 scope — `current-state-map.md §7.2` |
| Email relay | Console-logged, no SMTP | Wave 1 scope — `current-state-map.md §7.3` |
| Deferred monitors (4): overdue, stale, permission anomaly, expiration | Not implemented | Wave 1 scope — `current-state-map.md §7.2` |
| Deferred probes (3): search, notification, module-record-health | Not implemented | Wave 1 scope — `current-state-map.md §7.2` |
| ErrorLogPage | `HbcEmptyState` placeholder | Deferred to SF17-T05 — `current-state-map.md §7.2` |
| `getDefaultDestinationPath()` | Throws `NotImplementedError` | Deferred to MigrationScheduler routing — PH7.12 evidence §1.1 |

**Verdict:** All incomplete items are explicitly documented with Wave 1 or later-phase disposition. No undocumented dead wiring remains.

---

## Test Suite Summary

| Suite | Files | Tests | Status |
|-------|-------|-------|--------|
| `@hbc/provisioning` package | 16 | ~160 | PASS |
| `backend/functions` provisioning | 31 | ~200 | PASS |
| `@hbc/spfx-estimating` app | 7 | ~40 | PASS |
| `@hbc/spfx-admin` app | 8 | 59 | PASS |
| `@hbc/spfx-accounting` app | 2 | ~15 | PASS |
| `@hbc/pwa` parity | 2 | ~10 | PASS |

---

## Overall Verdict

**The provisioning foundation is verified, support-ready, and ready for Wave 1 expansion.**

All four verification dimensions (lifecycle paths, explainability, supportability, dead wiring) pass. Incomplete items are intentionally scoped to Wave 1 and documented in `current-state-map.md §7`.
