# Phase 10 — Repo Truth and Configuration Gap Audit

**Phase:** 10 — Live Admin-Maintained Standards and Configuration Governance  
**Prompt:** 01  
**Date:** 2026-04-03  
**Status:** Complete

---

## 1. Purpose

This audit establishes the verified repo baseline before Phase 10 implementation begins. It prevents blind implementation against stale assumptions by systematically comparing live code, documentation, and the admin end-state plan requirements.

The audit answers three questions:
1. What configuration foundations already exist and can be extended?
2. Where do code and documentation materially contradict each other?
3. What Phase 10 capabilities are genuinely missing and must be built?

---

## 2. Authority set actually used

| # | File | Verified |
|---|------|----------|
| 1 | `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md` | Yes |
| 2 | `docs/architecture/blueprint/current-state-map.md` | Yes |
| 3 | `backend/functions/src/config/wave0-env-registry.ts` | Yes |
| 4 | `backend/functions/src/utils/validate-config.ts` | Yes |
| 5 | `docs/reference/configuration/wave-0-config-registry.md` | Yes |
| 6 | `docs/reference/configuration/sites-selected-validation.md` | Yes |
| 7 | `docs/architecture/plans/MVP/G1/W0-G1-Contracts-and-Configuration-Plan.md` | Yes |
| 8 | `backend/functions/src/services/service-factory.ts` | Yes |
| 9 | `backend/functions/src/services/table-storage-service.ts` | Yes |
| 10 | `apps/admin/src/App.tsx` | Yes |
| 11 | `apps/admin/src/router/routes.ts` | Yes |
| 12 | `apps/admin/src/pages/SystemSettingsPage.tsx` | Yes |
| 13 | `packages/features/admin/README.md` | Yes |
| 14 | `docs/architecture/plans/MASTER/spfx/admin/phase-10/Admin-SPFx-IT-Control-Center-Phase-10-Summary-Plan.md` | Yes |
| 15 | `docs/architecture/plans/MASTER/spfx/admin/phase-10/README.md` | Yes |

---

## 3. Confirmed repo facts

### 3.1 Typed wave-0 environment registry exists

**File:** `backend/functions/src/config/wave0-env-registry.ts`

The registry exports:
- `ConfigBucket` type: `'infrastructure' | 'business'`
- `ConfigTier` type: `'core' | 'sharepoint' | 'provisioning'`
- `IConfigEntry` interface with `name`, `bucket`, `description`, `requiredInProd`, `conditionalOn?`, `configTier?`
- `WAVE0_REQUIRED_CONFIG`: 20 entries with governance bucket and tier classification
- `WAVE0_OPTIONAL_CONFIG`: 9 entries

The registry implements a two-bucket governance model (infrastructure vs. business) and a three-tier validation model (core/sharepoint/provisioning).

### 3.2 Startup/config validation logic exists and is wired

**File:** `backend/functions/src/utils/validate-config.ts`

Exports:
- `shouldValidateConfig()` — skips in mock/test mode
- `validateCoreConfig()` — validates core-tier entries at startup
- `validateSharePointConfig()` — validates SharePoint-tier entries (warning-only at startup)
- `validateProvisioningPrerequisites()` — validates 7 saga-time prerequisites including Sites.Selected gating
- `validateProjectSetupStartupConfig()` — domain-specific for Project Setup host
- `validateAdminControlPlaneStartupConfig()` — domain-specific for Admin CP host
- `validateRequiredConfig()` — legacy general validator

**Wiring:** `createServiceFactory()` calls `validateCoreConfig()` as a blocking startup gate and `validateSharePointConfig()` as a non-blocking warning.

### 3.3 Config reference docs are environment-registry-oriented

**File:** `docs/reference/configuration/wave-0-config-registry.md` (v1.0, 2026-03-14)

Documents 24 config keys in a two-bucket model (Bucket A: infrastructure-controlled, Bucket B: business-controlled) with environment separation guidance and validation references. The doc is environment-registry-oriented but contains material drift from current code (see §5).

### 3.4 Material doc/code drift exists

See §5 for the complete drift comparison. At least 13 material mismatches exist between the code registry and the reference doc.

### 3.5 No admin-maintained live override/version/audit system exists

There is no live configuration store, no versioning model, no audit trail for configuration changes, and no resolution engine with provenance. All current configuration is either code-defined or environment-variable-defined with no governed live-edit capability.

### 3.6 Admin app lacks a dedicated standards/configuration operator lane

The admin app has a `/config` route pointing to `SystemSettingsPage.tsx`, but this page provides:
- Access control administration (from `@hbc/auth`)
- Approval authority rules management (from `@hbc/features-admin`)

It does **not** provide environment configuration governance, standards management, config versioning, or any Phase 10 capabilities. Approval rules are not persisted in Wave 0 (SF17-T05 deferred to Wave 1).

### 3.7 Existing persistence and backend foundations support extension

- `RealTableStorageService` implements Azure Table Storage persistence with partition/row key design, serialization/deserialization, OData queries, and mock adapter — this pattern can be extended for a config version/audit store.
- `createServiceFactory()` provides centralized DI with adapter-mode switching (mock vs. real) and lazy initialization — new config services can follow this pattern.
- The admin control plane host already has route families and service wiring that Phase 10 APIs can extend.

---

## 4. Confirmed existing config foundations

### 4.1 Code registry / schema layer

| Foundation | Location | Status |
|-----------|----------|--------|
| Typed config entry model | `wave0-env-registry.ts` → `IConfigEntry` | Healthy — governs bucket, tier, requiredInProd, conditionalOn |
| Two-bucket governance model | `ConfigBucket`: infrastructure / business | Healthy — clear ownership split |
| Three-tier validation model | `ConfigTier`: core / sharepoint / provisioning | Healthy — enables fail-fast startup without blocking non-core ops |
| Required config registry | `WAVE0_REQUIRED_CONFIG` (20 entries) | Healthy — needs doc reconciliation |
| Optional config registry | `WAVE0_OPTIONAL_CONFIG` (9 entries) | Healthy — needs doc reconciliation |

### 4.2 Validation layer

| Foundation | Location | Status |
|-----------|----------|--------|
| Core startup validation | `validateCoreConfig()` wired in `createServiceFactory()` | Healthy — blocking gate |
| SharePoint validation | `validateSharePointConfig()` wired as warning | Healthy — non-blocking |
| Provisioning prerequisites | `validateProvisioningPrerequisites()` in saga orchestrator | Healthy — includes Sites.Selected conditional gate |
| Domain-specific validators | `validateProjectSetupStartupConfig()`, `validateAdminControlPlaneStartupConfig()` | Healthy — decoupled per host |
| Mock/test bypass | `shouldValidateConfig()` | Healthy |

### 4.3 Persistence layer

| Foundation | Location | Status |
|-----------|----------|--------|
| Table Storage abstraction | `ITableStorageService` interface | Healthy — can be extended or paralleled for config store |
| Real implementation | `RealTableStorageService` with Azure Table/Cosmos Table API | Healthy — idempotent upsert, OData queries, serialization boundary |
| Mock implementation | `MockTableStorageService` with in-memory Map | Healthy — adapter pattern for tests |
| Existing table | `ProvisioningStatus` table | Healthy — demonstrates the pattern; config store would use separate table(s) |

### 4.4 Service factory and DI

| Foundation | Location | Status |
|-----------|----------|--------|
| Centralized factory | `createServiceFactory()` | Healthy — singleton pattern, adapter-mode switching |
| Config validation integration | Startup gates in factory | Healthy — core blocking, SharePoint warning |
| Degraded-mode awareness | CONTROLLER_UPNS / ADMIN_UPNS warnings | Healthy — non-blocking degradation |
| Lazy initialization | Getter-based lazy init for domain services | Healthy — can be used for config services |

### 4.5 Admin app routing

| Foundation | Location | Status |
|-----------|----------|--------|
| Route registry | `apps/admin/src/router/routes.ts` | Healthy — 17 routes with permission guards |
| `/config` route | Points to `SystemSettingsPage.tsx` | Exists but scoped to approval authority only |
| Permission guards | `adminBeforeLoad` with permission store | Healthy — can be extended for config governance permissions |
| Lazy loading | Route-based code splitting | Healthy |

### 4.6 Documentation

| Foundation | Location | Status |
|-----------|----------|--------|
| Wave-0 config registry doc | `docs/reference/configuration/wave-0-config-registry.md` | Exists but materially drifted from code |
| Sites.Selected validation doc | `docs/reference/configuration/sites-selected-validation.md` | Healthy — complete governance spec |
| W0-G1 contracts/config plan | `docs/architecture/plans/MVP/G1/W0-G1-Contracts-and-Configuration-Plan.md` | Healthy — T04/T05 decisions locked |

---

## 5. Confirmed drift / contradictions

### 5.1 Required drift check: wave0-env-registry.ts vs wave-0-config-registry.md

| # | Setting | Code (wave0-env-registry.ts) | Doc (wave-0-config-registry.md) | Material Impact |
|---|---------|-----------------------------|---------------------------------|-----------------|
| D1 | `HBC_ADAPTER_MODE` enum values | `proxy \| mock` (legacy "real" aliased to "proxy") | `live \| mock` | **Terminology mismatch** — doc uses stale enum name "live" instead of current "proxy" |
| D2 | `AzureSignalRConnectionString` | requiredInProd: **false** | Required in Prod: **Yes** | **Production requirement mismatch** — code treats as optional; doc claims required |
| D3 | `EMAIL_DELIVERY_API_KEY` | requiredInProd: **false** (description: stub/unused) | Required in Prod: **Yes** | **Stale doc** — code explicitly marks as stub/unused |
| D4 | `EMAIL_FROM_ADDRESS` | requiredInProd: **false** (description: stub/unused) | Required in Prod: **Yes** | **Stale doc** — code explicitly marks as stub/unused |
| D5 | `NOTIFICATION_API_BASE_URL` | requiredInProd: **false** (has localhost fallback) | Required in Prod: **Yes** | **Doc overstates requirement** — code has fallback |
| D6 | `HB_INTEL_SPFX_APP_ID` | requiredInProd: **false** | Required in Prod: **Yes** | **Mismatch** — code does not require at startup |
| D7 | `SHAREPOINT_HUB_SITE_ID` | requiredInProd: **false** | Required in Prod: **Yes** | **Mismatch** — code does not require at startup |
| D8 | `SHAREPOINT_APP_CATALOG_URL` | requiredInProd: **false** | Required in Prod: **Yes** | **Mismatch** — code does not require at startup |
| D9 | `AZURE_CLIENT_SECRET` | **Not in registry** (uses Managed Identity / DefaultAzureCredential) | **Listed** as Key Vault entry | **Doc lists a secret the code doesn't consume directly** — MI-based auth eliminates direct secret consumption |
| D10 | Config tier system | `ConfigTier`: core / sharepoint / provisioning with tiered validation | **Not documented** | **Doc omits the tier model** entirely |
| D11 | Validation wiring status | `validateCoreConfig()` wired in `createServiceFactory()` as blocking startup gate | "exported but not wired into startup path; G2.6 will integrate it" | **Doc is stale** — validation IS wired; G2.6 integration is complete |
| D12 | `GRAPH_GROUP_PERMISSION_CONFIRMED` | In `WAVE0_REQUIRED_CONFIG` (requiredInProd: false, gating value) | **Not in doc** | **Missing from reference doc** |
| D13 | `SITES_SELECTED_GRANT_CONFIRMED` | In `WAVE0_OPTIONAL_CONFIG` (gating value for Path A) | **Not in main registry table** | **Missing from reference doc** — referenced in sites-selected-validation.md but not in the registry doc |

### 5.2 Drift severity assessment

**High impact (must reconcile before Phase 10 implementation):**
- D1 (adapter mode terminology) — affects any Phase 10 code that references adapter mode
- D10 (missing tier model) — Phase 10 config taxonomy must build on the existing tier model
- D11 (validation wiring status) — stale doc will mislead implementers

**Medium impact (should reconcile during Phase 10):**
- D2–D8 (requiredInProd mismatches) — affects the source-of-truth boundary definition
- D9 (AZURE_CLIENT_SECRET) — confirms secrets are already handled outside the env registry; supports the Phase 10 non-secret boundary
- D12–D13 (missing gating entries) — affects completeness of the configuration catalog

**Low impact (informational):**
- D3–D4 (stub/unused entries) — these settings may be removed or activated in future waves

---

## 6. Confirmed missing Phase 10 capabilities

| # | Capability | Current State | Required By |
|---|-----------|---------------|-------------|
| M1 | Standards/configuration taxonomy and catalog model | Does not exist | End-state plan §6.8; Phase 10 Summary Plan objective 1 |
| M2 | Live config registry/store for admin-maintainable values | Does not exist — all config is env-var or code-defined | End-state plan §6.8; Phase 10 Summary Plan objective 3 |
| M3 | Config versioning, history, and diffing | Does not exist | End-state plan §6.8; Phase 10 Summary Plan objective 4 |
| M4 | Config audit trail | Does not exist | End-state plan §7 (auditability mandatory for single-admin approval) |
| M5 | Config resolution engine with provenance | Does not exist — no service computes effective config from defaults + overrides + infrastructure | Phase 10 Summary Plan objective 5 |
| M6 | Run-to-config traceability / snapshot | Does not exist — downstream runs cannot record which config version they used | End-state plan §6.8; Phase 10 Summary Plan objective 7 |
| M7 | Admin API for config governance (read/write/publish/revert/history) | Does not exist | Phase 10 Summary Plan objective 6 |
| M8 | Dedicated standards/config operator lane in Admin app | Does not exist — `/config` route serves approval authority only | End-state plan §8.2; Phase 10 Summary Plan objective 6 |
| M9 | Validation preventing secrets from entering live-admin store | Does not exist (no live-admin store exists yet) | Phase 10 Summary Plan acceptance criteria |

---

## 7. Explicit non-gaps

These capabilities already exist and should be **extended**, not rebuilt from scratch:

| Capability | Why It Is Not a Gap |
|-----------|---------------------|
| Typed config entry model (`IConfigEntry`, `ConfigBucket`, `ConfigTier`) | Healthy foundation — Phase 10 taxonomy can build on this |
| Two-bucket governance classification (infrastructure / business) | Locked decision from W0-G1-T04 — Phase 10 refines the boundary without replacing the model |
| Tiered startup validation (`validateCoreConfig`, `validateSharePointConfig`, etc.) | Working and wired — Phase 10 extends validation to include live-override validation |
| Table Storage persistence pattern (`RealTableStorageService` / `MockTableStorageService`) | Healthy abstraction — Phase 10 config store can follow this pattern |
| Service factory with adapter-mode switching | Healthy DI — Phase 10 services wire into the existing factory |
| Admin control plane host with route families | Exists with 13 endpoints — Phase 10 adds config governance routes |
| Admin app route registry with permission guards | 17 routes with lazy loading and `adminBeforeLoad` guards — Phase 10 adds standards/config lane |
| Sites.Selected validation governance spec | Complete at `docs/reference/configuration/sites-selected-validation.md` — no Phase 10 work needed |
| W0-G1 contract/config decisions (T04, T05) | Locked — Phase 10 builds on these decisions |
| Phase 6A app-binding configuration slice | Already delivers a narrow governed config slice; Phase 10 generalizes without replacing it |
| Phase 9 hybrid-identity connector configuration | Already delivers connector config governance; Phase 10 extends without breaking it |

---

## 8. Recommended implementation posture for Phase 10

### Use a repo-native hybrid model

Based on verified repo truth, the recommended posture is:

1. **Code registry / schema layer** — Extend the existing `IConfigEntry` model with Phase 10 taxonomy fields (domain, subdomain, value type, validation rule, live-editable flag, secret flag, risk tier, versioning behavior). The existing two-bucket and three-tier classifications remain authoritative and are extended, not replaced.

2. **Live override/version store** — Build on the existing Azure Table / Cosmos Table API persistence pattern behind an abstraction (following the `ITableStorageService` / `RealTableStorageService` / `MockTableStorageService` pattern). Store only admin-maintainable non-secret values, version metadata, and audit records. Do not store secrets.

3. **Resolution engine** — New service that computes effective config from code defaults → live overrides → environment/protected infrastructure settings. Returns provenance (source, version, actor, timestamp) for every resolved value.

4. **Audit/history store** — Durable record of create/update/publish/revert events with diff payloads, actor identity, timestamps, reason, and version identifiers. Links to downstream runs via config snapshot/version references.

5. **Admin API** — New route family in the admin control plane host for config catalog reads, effective value reads, draft/publish/revert operations, history/diff retrieval, and provenance queries. Authorization boundaries enforce view/edit/publish/revert permissions and protect infrastructure-only/secret categories from live editing.

6. **Admin SPFx lane** — New operator lane (route + page) in the admin app for standards/configuration governance. Composes `@hbc/ui-kit` components. Shows catalog navigation, effective values with provenance, edit/publish/revert flows, version history, and diff views.

### Why this posture

- Preserves all existing healthy config foundations without disruption.
- Follows the existing table storage and service factory patterns rather than introducing new infrastructure dependencies.
- Keeps the secret/infrastructure boundary clear by design.
- Leaves room for future Azure App Configuration integration behind the abstraction if later desired.
- Compatible with Phase 6A app-binding, Phase 9 hybrid-identity, and Phase 9B device-package configuration slices.

---

## 9. Open questions to defer beyond this prompt

| # | Question | Deferred To |
|---|----------|-------------|
| Q1 | Which specific config items should be in the first-wave admin-editable set vs. deferred? | Prompt-03 (Taxonomy/Catalog) |
| Q2 | What is the exact precedence order when code default, live override, and env var all exist for the same item? | Prompt-02 (Source-of-Truth Baseline) |
| Q3 | Should the live config store use a single table or multiple tables (one per domain)? | Prompt-04 (Registry/Store) |
| Q4 | What concurrency model should protect against stale-write conflicts? | Prompt-05 (Versioning/Audit) |
| Q5 | How should the resolution engine handle a live override that fails validation against a newer schema? | Prompt-06 (Resolution Engine) |
| Q6 | Should the standards/config lane reuse the existing `/config` route or get a new route? | Prompt-08 (Admin SPFx Lane) |
| Q7 | What is the migration/backfill strategy for existing Bucket B business-controlled values? | Prompt-09 (Seeding/Migration) |
| Q8 | Should D2–D8 (requiredInProd mismatches) be reconciled by updating the doc to match code, or by updating code to match doc? | Prompt-09 (Wave-0 Reconciliation) |
