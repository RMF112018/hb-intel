# Phase 4 — Infrastructure Gap Summary

> Created: 2026-03-30
> Prompt: P4-01 Repo Truth and Infrastructure Surface Baseline
> Companion to: `Phase-4_Infrastructure-Baseline-Matrix.md`

## Summary

The Project Setup backend has a functioning infrastructure foundation from Phases 1–3, but the deployment surface is significantly broader than what Project Setup actually requires. The service factory, function registrations, and startup validation are shared with all Phase 1 domain services, creating unnecessary deployment coupling and over-broad boot blockers.

---

## Gap 1: Over-Broad Function Registration Surface

**Severity:** Medium
**Affects:** Deployment footprint, cold-start time, attack surface

### Findings

The Azure Functions app registers **~94 functions** but only **~20 are required** for Project Setup. The remaining ~74 serve Phase 1 domain CRUD (leads, contracts, schedule, compliance, buyout, risk, scorecards, PMP, projects, estimating trackers) and optional notification endpoints.

All functions share a single host process and service factory singleton. A bug or misconfiguration in an unrelated domain service could affect Project Setup availability.

### Resolution Direction (Prompt 02)

- Consider whether domain CRUD routes should remain co-deployed or be split into a separate Function App
- At minimum, document the co-deployment model and its implications
- If splitting is out of scope, add isolation guards so unrelated service failures don't cascade

---

## Gap 2: Eagerly Initialized Service Factory

**Severity:** Medium
**Affects:** Startup time, unnecessary dependency coupling

### Findings

`createServiceFactory()` initializes **all 14 services** on first invocation regardless of which route triggered it. A health-probe request eagerly creates SharePoint, Graph, Table Storage, and 10 domain CRUD service instances.

In production mode (`proxy`), the service factory also runs `validateRequiredConfig()` which checks all 8 required settings — even if the incoming request only needs a subset (e.g., health probe needs none).

### Resolution Direction (Prompt 02)

- Scope validation to context: health probe should not require SharePoint or Graph config
- Consider lazy initialization for domain CRUD services not used by Project Setup routes
- Keep the singleton pattern for services that are genuinely shared

---

## Gap 3: Mocked Services in Production Paths

**Severity:** High
**Affects:** SignalR (real-time updates), Redis (unused)

### Findings

1. **SignalR Push Service** — `service-factory.ts` line 113: `signalR: new MockSignalRPushService()`. The SignalR push service is **always mocked** in the production path. Real-time provisioning progress events (`pushProvisioningProgress`) are logged but never delivered to clients. The SignalR *negotiate* endpoint works (bound via host.json), but server-initiated push is a no-op.

2. **Redis Cache** — `service-factory.ts` line 112: `redisCache: new MockRedisCacheService()`. Redis is always mocked. The proxy handler references `services.redisCache.get/set/delete` but these are no-ops. No Redis connection string is configured or required.

### Resolution Direction (Prompt 02–03)

- **SignalR:** Either implement a real `SignalRPushService` using the Azure SignalR REST API, or document that server-initiated push is deferred and clients rely on polling
- **Redis:** Remove from `IServiceContainer` and all consumers, or document as explicitly deferred

---

## Gap 4: Unscoped Boot Blockers

**Severity:** Medium
**Affects:** Deployment resilience

### Findings

If any single required env var is missing (e.g., `SHAREPOINT_PROJECTS_SITE_URL`), **all routes** fail — including health probe and routes that don't need SharePoint. The validation runs once at factory creation and throws an aggregated error, preventing the entire Function App from serving any request.

### Resolution Direction (Prompt 02)

- Split validation into core (auth, table storage) and feature-specific (SharePoint, Graph, SignalR)
- Allow health probe to respond even when feature-specific config is missing
- Consider tiered startup: core infra validates at startup, feature prerequisites validate at first use

---

## Gap 5: Missing CORS Configuration in Code

**Severity:** Medium
**Affects:** Browser-origin security

### Findings

No CORS configuration exists in `host.json` or application code. CORS is entirely platform-managed at the Azure App Service level. This means:
- Local development requires manual CORS setup or browser workarounds
- CORS posture is not version-controlled or reviewable in code
- Misconfiguration at the platform level is invisible to code review

### Resolution Direction (Prompt 04)

- Add CORS configuration to `host.json` for version-controlled origin allowlist
- Document the required origins (SharePoint tenant, localhost for dev)
- Ensure the configuration matches the actual SPFx deployment

---

## Gap 6: SignalR Connection String Not Startup-Gated

**Severity:** Low
**Affects:** Runtime failures during provisioning

### Findings

`AzureSignalRConnectionString` is in the optional config registry (not startup-validated). If it's missing, the SignalR negotiate endpoint will fail at runtime when a user tries to connect for provisioning updates. The failure is runtime-only, not caught at startup.

### Resolution Direction (Prompt 02)

- Either promote to required (if SignalR is deemed essential for Project Setup) or add graceful degradation that allows provisioning to proceed without real-time updates

---

## Gap 7: Email/Notification Delivery is Stub-Only

**Severity:** Low
**Affects:** Operator notifications on provisioning completion/failure

### Findings

The notification service is wired (`NotificationService` real class), but the email delivery layer (`emailDelivery.ts`) logs payloads without sending. `EMAIL_DELIVERY_API_KEY` and `EMAIL_FROM_ADDRESS` are not set. Provisioning completion/failure notifications exist in code but never reach operators.

### Resolution Direction (Prompt 05)

- Either implement SendGrid delivery or document as explicitly deferred
- If deferred, ensure provisioning failures are visible through other channels (SignalR, health diagnostics, App Insights alerts)

---

## Gap 8: No Infrastructure Monitoring Alerts

**Severity:** Medium
**Affects:** Operational awareness

### Findings

Telemetry events are emitted to App Insights (`ProvisioningStepFailed`, `ProvisioningTimerCompleted`, `auth.mi.error`, etc.), but no alert rules, dashboards, or runbooks exist in the repo. Operators have no automated notification when:
- Provisioning fails
- Timer job produces zero completions
- Managed Identity token acquisition fails repeatedly
- Table Storage becomes unreachable

### Resolution Direction (Prompt 05)

- Define alert rules for critical telemetry events
- Create an operational runbook for common failure scenarios
- Document expected telemetry baseline for healthy operation

---

## Unresolved Items for Later Prompts

| Gap | Governing Prompt | Priority |
|-----|-----------------|----------|
| Over-broad function surface | Prompt 02 | Medium |
| Eager service factory | Prompt 02 | Medium |
| Mocked SignalR push | Prompt 02–03 | High |
| Mocked Redis (remove) | Prompt 02 | Low |
| Unscoped boot blockers | Prompt 02 | Medium |
| CORS not in code | Prompt 04 | Medium |
| SignalR not startup-gated | Prompt 02 | Low |
| Stub email delivery | Prompt 05 | Low |
| No infrastructure alerts | Prompt 05 | Medium |
