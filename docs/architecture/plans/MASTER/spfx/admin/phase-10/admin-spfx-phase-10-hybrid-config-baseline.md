# Phase 10 — Hybrid Source-of-Truth Baseline for Standards/Configuration Governance

**Phase:** 10 — Live Admin-Maintained Standards and Configuration Governance  
**Prompt:** 02  
**Date:** 2026-04-03  
**Status:** Frozen baseline — governs all subsequent Phase 10 implementation prompts  
**Inputs:** P10-01 repo-truth and gap audit, end-state plan (v01.000.009), verified repo files

---

## 1. Purpose

This document is the **canonical architecture baseline** for Phase 10. It freezes:

- what belongs in each source-of-truth layer,
- how layers interact to produce effective configuration,
- what is explicitly prohibited,
- and what governance behaviors are mandatory.

All subsequent Phase 10 prompts (03–11) must conform to this baseline. If a later prompt discovers a material contradiction, the baseline must be updated before proceeding — not silently overridden.

---

## 2. Why Phase 10 exists

The platform currently operates with:

- **Code-only defaults** — typed in `wave0-env-registry.ts` with bucket and tier classification, but not live-editable by an admin.
- **Environment-only operational settings** — injected via Azure App Settings, Key Vault references, and CI/CD pipelines, with no governed change trail.
- **Scattered reference docs** — `wave-0-config-registry.md` materially drifted from live code (13 drift points confirmed in P10-01 §5).
- **No audit trail** — no record of who changed what setting, when, or why.
- **No run-to-config traceability** — downstream runs cannot record which configuration version they consumed.

Phase 10 exists to move the platform into a **governed hybrid model** where:

- Repo-defined defaults remain authoritative for definitions and validation rules.
- A bounded set of non-secret, business-controlled standards can be maintained live by an authorized admin.
- Secrets and infrastructure-controlled values remain outside the live-admin surface.
- Every effective value is versioned, auditable, explainable, and traceable to the runs that used it.

This is required by the end-state plan (§6.8, §7, §8.2) and is a prerequisite for Phase 8 SharePoint control, Phase 11 safety hardening, and Phase 12 observability.

---

## 3. Current repo foundations

Verified in P10-01 and confirmed as healthy, extensible foundations:

| Foundation | Location | Phase 10 Role |
|-----------|----------|---------------|
| Typed config entry model (`IConfigEntry`, `ConfigBucket`, `ConfigTier`) | `backend/functions/src/config/wave0-env-registry.ts` | Extend with taxonomy fields; do not replace |
| Two-bucket governance model (infrastructure / business) | Same file | Preserve as governance classification baseline |
| Three-tier validation model (core / sharepoint / provisioning) | `backend/functions/src/utils/validate-config.ts` | Extend with live-override validation; do not replace |
| Startup validation wiring | `createServiceFactory()` → `validateCoreConfig()` | Phase 10 config services wire into the same factory |
| Table Storage persistence pattern | `ITableStorageService` / `RealTableStorageService` / `MockTableStorageService` | Follow for config version/audit store |
| Service factory with adapter-mode switching | `backend/functions/src/services/service-factory.ts` | Add config governance services to the existing DI container |
| Admin control plane host with route families | `backend/functions/src/hosts/admin-control-plane/` | Add config governance API routes |
| Admin app route registry with permission guards | `apps/admin/src/router/routes.ts` | Add standards/config lane route |
| Phase 6A app-binding config slice | Phase 6A deliverables | Generalize without breaking |
| Phase 9 hybrid-identity connector config | Phase 9 deliverables | Extend without breaking |

---

## 4. Canonical source-of-truth layers

Phase 10 defines four layers. Every configuration item belongs to exactly one authoritative layer.

### 4.1 Code defaults / registry

**What lives here:**
- Config item definitions (key, type, validation rule, domain, subdomain, description, risk tier)
- Default values for all items that have a sensible code-level default
- Schema and catalog metadata (live-editable flag, secret flag, infrastructure-controlled flag)
- Validation rules that constrain what values are acceptable

**Ownership:** Developer via code commit and code review.

**Mutability:** Changes require a code change, PR, and deployment. This is intentional — definitions and validation rules are too important to edit live.

**What does NOT live here:**
- Live override values
- Audit history
- Version metadata for live changes

### 4.2 Live admin-maintained overrides

**What lives here:**
- Current override values for the bounded set of items explicitly marked `liveEditable: true` in the code registry
- Version metadata (version ID, published timestamp, actor, reason)
- Draft/staged values awaiting publish (if the publish model uses drafts)

**Ownership:** Authorized admin via the Admin SPFx operator console, backed by the admin control plane API.

**Mutability:** Live-editable through governed flows only (edit → validate → publish → audit). Every change produces an audit record.

**Storage:** Durable persistence using the existing Azure Table / Cosmos Table API pattern behind an abstraction. Separate table(s) from provisioning status.

**What does NOT live here:**
- Config item definitions or validation rules (those stay in code)
- Secrets
- Infrastructure-controlled values
- Values for items not explicitly marked as live-editable

### 4.3 Infrastructure-controlled settings

**What lives here:**
- Environment variables managed by Terraform, Azure App Settings, CI/CD pipelines
- Connection strings, endpoint URLs, tenant identifiers
- Adapter mode (`HBC_ADAPTER_MODE`)
- Runtime platform settings (`FUNCTIONS_WORKER_RUNTIME`, `WEBSITE_NODE_DEFAULT_VERSION`)

**Ownership:** DevOps/Platform team via infrastructure-as-code and deployment pipelines.

**Mutability:** Changes require infrastructure change, deployment, or Azure portal configuration. Not live-editable by the admin surface.

**What does NOT live here:**
- Business-controlled values that should be admin-editable
- Secrets (those go to Key Vault)

### 4.4 Secrets / Key Vault-bound settings

**What lives here:**
- Credentials, API keys, connection strings containing secrets
- `AZURE_CLIENT_SECRET` (if used), `AzureSignalRConnectionString`, `EMAIL_DELIVERY_API_KEY`, `APPLICATIONINSIGHTS_CONNECTION_STRING`
- Any value whose exposure would constitute a security incident

**Ownership:** Security/Platform team via Azure Key Vault, with references injected into App Settings.

**Mutability:** Rotated via Key Vault lifecycle. Never exposed in the admin UI. Never stored in the live config store.

**Hard boundary:** The live admin-maintained store must never contain secrets. This is enforced by the code registry marking items as `secret: true`, and the API/store rejecting any attempt to write a secret-flagged item.

---

## 5. Allowed precedence order

When computing the effective value for a config item, the resolution engine applies this precedence (highest wins):

| Priority | Source | Applies When |
|----------|--------|-------------|
| 1 (highest) | **Infrastructure-controlled / environment variable** | Item is marked `infrastructureControlled: true` — environment value always wins; live override is not allowed |
| 2 | **Live admin-maintained override** (published) | Item is marked `liveEditable: true` AND a published override exists |
| 3 | **Code default** | No override exists, or item is not live-editable |
| — | **Secret / Key Vault** | Secrets are never resolved through this engine — they are consumed directly by infrastructure code via `process.env` or Key Vault SDK |

### Precedence rules

- An item can be **either** infrastructure-controlled **or** live-editable, never both. The code registry enforces this mutual exclusion.
- If a live override exists but is not yet published (draft state), the effective value remains the code default until publish.
- If a live override is reverted, the effective value falls back to the code default.
- The resolution engine must return the **source** (code-default / live-override / infrastructure) alongside the effective value so that provenance is never ambiguous.

---

## 6. Explicit non-editable categories

The following categories are **never** exposed for live editing through the admin surface:

| Category | Examples | Reason |
|----------|----------|--------|
| **Secrets** | `AZURE_CLIENT_SECRET`, `AzureSignalRConnectionString`, `EMAIL_DELIVERY_API_KEY`, `APPLICATIONINSIGHTS_CONNECTION_STRING` | Security — exposure is an incident |
| **Infrastructure connection settings** | `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_TABLE_ENDPOINT`, `SHAREPOINT_TENANT_URL` | Changing these live would break the runtime; they are deployment-coupled |
| **Runtime platform settings** | `FUNCTIONS_WORKER_RUNTIME`, `WEBSITE_NODE_DEFAULT_VERSION`, `AzureWebJobsStorage` | Platform-managed; no admin business need |
| **Adapter mode** | `HBC_ADAPTER_MODE` | Changing adapter mode live would corrupt service behavior; requires deployment |
| **Permission gating flags** | `GRAPH_GROUP_PERMISSION_CONFIRMED`, `SITES_SELECTED_GRANT_CONFIRMED` | IT/Security gates — must not be toggleable by a business admin |
| **Config item definitions and validation rules** | Schema, type constraints, validation logic | Definitions are code-level concerns requiring PR review |

The code registry enforces non-editability by marking items with `liveEditable: false` (or omitting the flag). The API layer rejects edit requests for non-editable items. The UI never renders edit controls for them.

---

## 7. Resolution / provenance doctrine

### Resolution contract

The resolution engine is a backend service that, given a config item key (or a set of keys), returns:

```
{
  key: string
  effectiveValue: unknown
  source: 'code-default' | 'live-override' | 'infrastructure'
  version: string | null          // version ID of the live override, or null if code-default/infrastructure
  lastChangedBy: string | null    // actor UPN for live overrides
  lastChangedAt: string | null    // ISO timestamp for live overrides
  publishedAt: string | null      // publish timestamp for live overrides
  codeDefault: unknown            // always included for comparison
  validationStatus: 'valid' | 'invalid' | 'unchecked'
}
```

### Provenance requirements

- Every resolved value must carry its source attribution. No "unknown source" is acceptable.
- When a live override exists, the response includes both the override value and the code default for comparison.
- When an infrastructure-controlled value overrides everything, the source is `'infrastructure'` and no live editing is offered.
- The resolution engine does not access secrets. Secret-flagged items are excluded from resolution results.

### Bulk resolution

The engine must support resolving all items (or all items in a domain) in a single call to support the admin UI's catalog view. Bulk resolution returns the same per-item provenance structure.

---

## 8. Versioning and audit doctrine

### Version model

- Every published live override has a **version ID** (monotonically increasing integer or UUID — implementation decides in Prompt-05).
- A version represents a point-in-time snapshot of a single config item's live override value.
- Publishing a new value creates a new version. Reverting creates a new version whose value matches a prior version.
- Draft/staged edits (if used) are not versions until published.

### Audit record model

Every mutation to the live config store produces an audit record:

| Field | Description |
|-------|-------------|
| `eventId` | Unique event identifier |
| `eventType` | `created` / `updated` / `published` / `reverted` / `deleted` |
| `configKey` | The config item key |
| `domain` | Config domain (from taxonomy) |
| `previousValue` | Value before the change (null for create) |
| `newValue` | Value after the change |
| `previousVersion` | Version ID before the change |
| `newVersion` | Version ID after the change |
| `actor` | UPN of the admin who made the change |
| `actorOid` | AAD OID of the actor |
| `timestamp` | ISO timestamp |
| `reason` | Operator-provided reason/note (required for publish and revert) |

### Audit durability

- Audit records are append-only. They are never deleted or modified.
- Audit records are stored in a dedicated table (separate from live override values).
- Audit records must survive config item deletion or schema changes.

### History retrieval

- History for a config item is retrievable by key, ordered by timestamp descending.
- Diff between any two versions is computable from stored values.

---

## 9. Run-to-config traceability doctrine

### Snapshot requirement

When a downstream run executes (provisioning saga, SharePoint control action, hybrid-identity operation, device-package deployment), the run must capture:

| Field | Description |
|-------|-------------|
| `configSnapshotId` | Identifier linking to the effective config state at run start |
| `configVersionMap` | Map of config keys → version IDs for all live-override items resolved at run time |
| `resolvedAt` | Timestamp when resolution was performed |

### Snapshot storage

- Config snapshots are stored durably (same persistence pattern as audit records).
- A snapshot is immutable once created — it represents the config state at a point in time.
- Runs reference the snapshot ID in their own durable records (e.g., in the provisioning status entity).

### Traceability contract

Given a run ID, the system can answer:
- What was the effective config when this run executed?
- Which config items had live overrides vs. code defaults?
- Who last changed each overridden item before this run?
- Has the config changed since this run executed?

### Integration points

The snapshot mechanism must integrate with:
- Provisioning saga orchestrator (existing `IProvisioningStatus` entity can reference `configSnapshotId`)
- Future SharePoint control actions (Phase 8)
- Future hybrid-identity operations (Phase 9 extensions)
- Future device-package deployments (Phase 9B extensions)

Detailed integration design is deferred to Prompt-06.

---

## 10. Phase boundaries and non-goals

### In scope for Phase 10

- Hybrid source-of-truth boundary (this document)
- Standards/config taxonomy and catalog model (Prompt-03)
- Live config registry/store with provider abstractions (Prompt-04)
- Versioning, audit, diff, and concurrency model (Prompt-05)
- Resolution engine and run-to-config traceability (Prompt-06)
- Admin API with authorization boundaries (Prompt-07)
- Admin SPFx standards/config operator lane (Prompt-08)
- Seeding/migration and wave-0 reconciliation (Prompt-09)
- Documentation, runbooks, and operational guidance (Prompt-10)
- Validation and exit reconciliation (Prompt-11)

### Explicit non-goals

| Non-goal | Deferred To | Reason |
|----------|-------------|--------|
| Full high-risk action safety framework (dry-run, approval gates, blast-radius controls) | Phase 11 | Phase 10 provides the config substrate; Phase 11 adds safety hardening on top |
| Broad observability and alerting for config changes | Phase 12 | Phase 10 produces audit records; Phase 12 wires them into dashboards and alerts |
| Tenant-wide SharePoint active governance beyond first-wave boundary | Phase 8 (first wave) | Phase 10 governs the standards; Phase 8 governs SharePoint enforcement |
| Forced migration of all environment settings into the live config store | Never (by design) | Infrastructure-controlled and secret settings intentionally remain outside |
| Full re-platform of configuration infrastructure (e.g., Azure App Configuration) | Future (behind abstraction) | Phase 10 uses existing persistence patterns; the abstraction layer allows future migration |
| Multi-tenant configuration isolation | Not currently scoped | HB Intel is single-tenant; multi-tenant would require a separate architecture decision |

### Phase 11 boundary

Phase 10 must not over-pull Phase 11 safety work. Specifically:

- Phase 10 delivers: edit, validate, publish, revert, audit, version, resolve, snapshot.
- Phase 11 adds: dry-run/preview mechanics, approval gates for high-risk changes, blast-radius estimation, rollback orchestration, and safety observability.

Phase 10 should design its publish/revert model to be **extensible** for Phase 11 safety gates, but must not implement those gates itself.

---

## 11. Cross-links to later implementation prompts

| Prompt | Responsibility | Depends On This Baseline For |
|--------|---------------|-------------------------------|
| Prompt-03 | Standards/config taxonomy and catalog model | Layer definitions (§4), non-editable categories (§6), precedence order (§5) |
| Prompt-04 | Live config registry/store and provider abstractions | Layer 4.2 (live overrides), storage pattern, secret exclusion boundary |
| Prompt-05 | Versioning, audit, diff, and concurrency model | Version model (§8), audit record model (§8), append-only durability |
| Prompt-06 | Resolution engine and run-to-config traceability | Resolution contract (§7), precedence order (§5), snapshot model (§9) |
| Prompt-07 | Admin API and authorization boundaries | All layers (§4), non-editable categories (§6), resolution contract (§7) |
| Prompt-08 | Admin SPFx standards/config lane | Resolution contract (§7) for display, layer definitions (§4) for edit/view distinction |
| Prompt-09 | Seeding, migration, and wave-0 reconciliation | Layer definitions (§4), drift findings from P10-01 §5, precedence order (§5) |
| Prompt-10 | Docs, runbooks, and operational guidance | All sections — documentation must reflect the frozen baseline |
| Prompt-11 | Validation and exit reconciliation | Acceptance criteria derived from all baseline doctrines |

---

## Locked baseline decisions (summary)

For reference, these decisions are now frozen unless a material repo-truth correction is discovered:

1. Config item definitions and validation rules remain **code-defined**.
2. Only a **bounded subset** of non-secret standards/config values are live-admin-editable.
3. Infrastructure-only and secret settings remain **outside** live admin editing.
4. Effective config must **always carry provenance**.
5. **Publish/revert/history** behavior is mandatory for live-admin-maintained settings.
6. Downstream admin runs must be able to **record the effective config/version** they consumed.
7. The admin app is the **operator surface**; backend remains the **privileged executor**.

---

## Explicit no-go statements

1. **No secrets in the live admin-maintained store.** The code registry marks items as `secret: true`; the API and store reject writes for secret-flagged items.
2. **No infrastructure-only env var editor disguised as "config governance."** Infrastructure-controlled settings are read-only in the admin surface and cannot be overridden through the live config store.
3. **No SPFx-side privileged persistence logic.** The SPFx admin app calls the backend API; it never writes directly to the config store.
4. **No ambiguous effective-value computation.** The resolution engine applies the explicit precedence order (§5) and always returns source attribution.
5. **No undocumented precedence between defaults and overrides.** The precedence order in §5 is the single authority. No implicit or convention-based overrides are allowed.
