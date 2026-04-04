# Phase 10 — Configuration Catalog Model

**Phase:** 10 — Live Admin-Maintained Standards and Configuration Governance  
**Prompt:** 03 (Catalog Model)  
**Date:** 2026-04-03  
**Status:** Frozen — governs backend type definitions, store schema, API contracts, and UI rendering  
**Inputs:** P10-02 hybrid config baseline, P10-03 taxonomy, wave-0 registry

---

## 1. Purpose

This document defines the canonical field model for every configuration item in the Phase 10 governed catalog. All backend services, API responses, audit records, and UI rendering derive from this model.

---

## 2. Core catalog entry type: `IConfigCatalogEntry`

Every configuration item in the system is described by a catalog entry with these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | `string` | Yes | Stable unique identifier for the config item. Matches the environment variable name for wave-0 items. Immutable after creation. |
| `domain` | `ConfigDomain` | Yes | Taxonomy domain ID (e.g., `'rollout'`, `'access-control'`). See taxonomy doc §3. |
| `subdomain` | `ConfigSubdomain` | Yes | Taxonomy subdomain ID (e.g., `'rollout.saga'`, `'access-control.admin-roles'`). See taxonomy doc §4. |
| `displayName` | `string` | Yes | Human-readable name for UI display. |
| `description` | `string` | Yes | Purpose description for UI tooltips and documentation. |
| `valueType` | `ConfigValueType` | Yes | Data type constraint. See §3. |
| `validationRule` | `IConfigValidationRule \| null` | No | Validation constraint applied on write. See §4. `null` means no additional validation beyond type. |
| `defaultValue` | `unknown` | Yes | Code-defined default value. Source of truth when no live override exists. |
| `defaultValueSource` | `string` | Yes | Human-readable description of where the default comes from (e.g., `'wave0-env-registry.ts'`, `'hardcoded in service-factory.ts'`). |
| `liveEditable` | `boolean` | Yes | Whether this item can be overridden through the live admin-maintained store. See P10-02 §4.2 and §6. |
| `secret` | `boolean` | Yes | Whether this item contains sensitive material. Secret items are never stored in the live config store and never returned by the resolution engine. |
| `infrastructureControlled` | `boolean` | Yes | Whether this item is managed by infrastructure (Terraform, App Settings, CI/CD). Infrastructure-controlled items cannot be live-edited. |
| `editorPermission` | `string \| null` | No | Permission key required to edit this item (e.g., `'admin:config:edit'`). `null` if not live-editable. |
| `riskTier` | `ConfigRiskTier` | Yes | Risk classification affecting UI warnings and audit requirements. See §5. |
| `environmentScope` | `ConfigEnvironmentScope` | Yes | Which environments this item applies to. See §6. |
| `versioningBehavior` | `ConfigVersioningBehavior` | Yes | How version history is managed for this item. See §7. |
| `publishSemantics` | `ConfigPublishSemantics` | Yes | What happens when a live override is published. See §8. |
| `auditPayload` | `ConfigAuditPayload` | Yes | What data is captured in audit records for changes to this item. See §9. |
| `snapshotRequired` | `boolean` | Yes | Whether downstream runs must capture this item's effective value in their config snapshot. |
| `configTier` | `ConfigTier \| null` | No | Startup validation tier from wave-0 model (`'core'`, `'sharepoint'`, `'provisioning'`). `null` for items not in the wave-0 tiered validation. |
| `conditionalOn` | `string \| null` | No | Conditional dependency expression (e.g., `'department=commercial'`). `null` if unconditional. |
| `deprecatedAt` | `string \| null` | No | ISO date when this item was deprecated. `null` if active. Deprecated items are read-only and hidden from default UI views. |
| `addedInPhase` | `string` | Yes | Phase identifier when this item was introduced (e.g., `'wave-0'`, `'phase-6a'`, `'phase-10'`). |

---

## 3. Value types: `ConfigValueType`

| Value | TypeScript Equivalent | Description | Example |
|-------|----------------------|-------------|---------|
| `'string'` | `string` | Free-form string | `'https://hbconstruction.sharepoint.com'` |
| `'enum'` | `string` (union) | One of a defined set of string values | `'proxy' \| 'mock'` |
| `'integer'` | `number` | Whole number | `90000` |
| `'boolean'` | `boolean` | True/false | `true` |
| `'upn'` | `string` | Single user principal name | `'admin@hbconstruction.com'` |
| `'upn-list'` | `string` | Comma-separated UPN list | `'a@hbc.com,b@hbc.com'` |
| `'url'` | `string` | Valid URL | `'https://...'` |
| `'guid'` | `string` | UUID/GUID format | `'550e8400-e29b...'` |
| `'connection-string'` | `string` | Connection string (always secret) | — |

---

## 4. Validation rules: `IConfigValidationRule`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `'regex' \| 'enum' \| 'range' \| 'custom'` | Yes | Validation strategy |
| `pattern` | `string \| null` | No | Regex pattern (for `type: 'regex'`) |
| `allowedValues` | `string[] \| null` | No | Allowed values (for `type: 'enum'`) |
| `min` | `number \| null` | No | Minimum (for `type: 'range'`, integer items) |
| `max` | `number \| null` | No | Maximum (for `type: 'range'`, integer items) |
| `customValidator` | `string \| null` | No | Named custom validator function (for `type: 'custom'`; resolved at runtime by the validation service) |
| `errorMessage` | `string` | Yes | Human-readable message shown when validation fails |

---

## 5. Risk tiers: `ConfigRiskTier`

| Value | Description | UI Behavior | Audit Requirement |
|-------|-------------|-------------|-------------------|
| `'low'` | Change has minimal operational impact | Standard edit flow | Standard audit record |
| `'medium'` | Change affects operational behavior or role assignments | Warning banner before publish | Standard audit record + reason required |
| `'high'` | Change affects authentication, authorization, or provisioning gates | Confirmation dialog + warning | Full audit record + reason required + highlighted in audit view |
| `'critical'` | Change could break runtime or security posture | Not live-editable in Phase 10 (reserved for Phase 11 safety gates) | N/A in Phase 10 |

### Risk tier assignments for first-wave items

| Config Entry | Risk Tier | Rationale |
|-------------|-----------|-----------|
| `OPEX_MANAGER_UPN` | medium | Affects group membership assignment in provisioning |
| `CONTROLLER_UPNS` | medium | Affects role-based state transitions |
| `ADMIN_UPNS` | high | Affects who can access the admin surface |
| `STRUCTURAL_OWNER_UPNS` | medium | Affects site ownership assignments |
| `DEPT_BACKGROUND_ACCESS_COMMERCIAL` | medium | Affects department-scoped access |
| `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` | medium | Affects department-scoped access |
| `PROVISIONING_STEP5_TIMEOUT_MS` | low | Operational tuning with code default fallback |

---

## 6. Environment scope: `ConfigEnvironmentScope`

| Value | Description |
|-------|-------------|
| `'all'` | Applies to all environments (local, staging, production) |
| `'production-only'` | Only relevant in production (e.g., production UPN lists) |
| `'non-production-only'` | Only relevant in local/staging (e.g., `AzureWebJobsStorage` for local dev) |
| `'per-environment'` | Different value expected per environment (e.g., tenant URL, endpoints) |

---

## 7. Versioning behavior: `ConfigVersioningBehavior`

| Value | Description |
|-------|-------------|
| `'versioned'` | Every published change creates a new version. History is retained. |
| `'unversioned'` | Not tracked in the live config store (infrastructure-controlled or secret items). |
| `'inherited'` | Versioning is managed by a parent system (e.g., Phase 6A binding model, Phase 9 connector model). |

---

## 8. Publish semantics: `ConfigPublishSemantics`

| Value | Description |
|-------|-------------|
| `'immediate'` | Published override takes effect on the next resolution call. No staging/preview step. |
| `'staged'` | Override is saved as a draft and requires explicit publish action. (Reserved for Phase 11 safety-gated items.) |
| `'not-applicable'` | Item is not live-editable; no publish flow. |

All first-wave live-editable items use `'immediate'` publish semantics in Phase 10. Phase 11 may introduce `'staged'` for high-risk items.

---

## 9. Audit payload: `ConfigAuditPayload`

| Value | Description |
|-------|-------------|
| `'full'` | Audit record includes previous value, new value, actor, timestamp, reason, version IDs, and diff. |
| `'metadata-only'` | Audit record includes actor, timestamp, and event type, but not the values (for items where value logging is undesirable). |
| `'none'` | No audit record (infrastructure-controlled and secret items not tracked in the live config store). |

All first-wave live-editable items use `'full'` audit payload.

---

## 10. Mutual exclusion constraints

The following field combinations are enforced by the catalog:

| Rule | Constraint |
|------|-----------|
| Secret items cannot be live-editable | If `secret: true` then `liveEditable` must be `false` |
| Infrastructure-controlled items cannot be live-editable | If `infrastructureControlled: true` then `liveEditable` must be `false` |
| An item cannot be both secret and infrastructure-controlled | Exactly one of `secret`, `infrastructureControlled`, or neither may be `true` — but `secret` and `infrastructureControlled` are not mutually exclusive in practice (a secret connection string is both); the meaningful constraint is that neither allows `liveEditable: true` |
| Live-editable items must have an editor permission | If `liveEditable: true` then `editorPermission` must not be `null` |
| Live-editable items must be versioned | If `liveEditable: true` then `versioningBehavior` must be `'versioned'` |
| Live-editable items must have a publish semantic | If `liveEditable: true` then `publishSemantics` must not be `'not-applicable'` |
| Live-editable items must have full audit | If `liveEditable: true` then `auditPayload` must be `'full'` |

---

## 11. Example catalog entries

### 11.1 Live-editable item: `ADMIN_UPNS`

```typescript
{
  key: 'ADMIN_UPNS',
  domain: 'access-control',
  subdomain: 'access-control.admin-roles',
  displayName: 'Platform Admin UPNs',
  description: 'Comma-separated UPNs of platform administrators with full admin console access.',
  valueType: 'upn-list',
  validationRule: {
    type: 'regex',
    pattern: '^[\\w.+-]+@[\\w.-]+\\.[a-zA-Z]{2,}(,[\\w.+-]+@[\\w.-]+\\.[a-zA-Z]{2,})*$',
    errorMessage: 'Must be a comma-separated list of valid email addresses'
  },
  defaultValue: '',
  defaultValueSource: 'wave0-env-registry.ts (no default — deployment-configured)',
  liveEditable: true,
  secret: false,
  infrastructureControlled: false,
  editorPermission: 'admin:config:edit',
  riskTier: 'high',
  environmentScope: 'per-environment',
  versioningBehavior: 'versioned',
  publishSemantics: 'immediate',
  auditPayload: 'full',
  snapshotRequired: true,
  configTier: null,
  conditionalOn: null,
  deprecatedAt: null,
  addedInPhase: 'wave-0'
}
```

### 11.2 Infrastructure-controlled item: `AZURE_TENANT_ID`

```typescript
{
  key: 'AZURE_TENANT_ID',
  domain: 'identity',
  subdomain: 'identity.tenant',
  displayName: 'Azure Tenant ID',
  description: 'Entra ID tenant identifier for the HB Intel deployment.',
  valueType: 'guid',
  validationRule: {
    type: 'regex',
    pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
    errorMessage: 'Must be a valid GUID'
  },
  defaultValue: null,
  defaultValueSource: 'Azure deployment — no code default',
  liveEditable: false,
  secret: false,
  infrastructureControlled: true,
  editorPermission: null,
  riskTier: 'critical',
  environmentScope: 'per-environment',
  versioningBehavior: 'unversioned',
  publishSemantics: 'not-applicable',
  auditPayload: 'none',
  snapshotRequired: true,
  configTier: 'core',
  conditionalOn: null,
  deprecatedAt: null,
  addedInPhase: 'wave-0'
}
```

### 11.3 Secret item: `AzureSignalRConnectionString`

```typescript
{
  key: 'AzureSignalRConnectionString',
  domain: 'infrastructure',
  subdomain: 'infrastructure.realtime',
  displayName: 'SignalR Connection String',
  description: 'Azure SignalR Service connection string for real-time push notifications.',
  valueType: 'connection-string',
  validationRule: null,
  defaultValue: null,
  defaultValueSource: 'Azure Key Vault reference',
  liveEditable: false,
  secret: true,
  infrastructureControlled: true,
  editorPermission: null,
  riskTier: 'critical',
  environmentScope: 'per-environment',
  versioningBehavior: 'unversioned',
  publishSemantics: 'not-applicable',
  auditPayload: 'none',
  snapshotRequired: false,
  configTier: null,
  conditionalOn: null,
  deprecatedAt: null,
  addedInPhase: 'wave-0'
}
```

---

## 12. Relationship to existing wave-0 types

The catalog model **extends** the existing `IConfigEntry` from `wave0-env-registry.ts`:

| Existing `IConfigEntry` Field | Catalog Equivalent |
|------------------------------|-------------------|
| `name` | `key` |
| `bucket` (`ConfigBucket`) | Derived from `liveEditable` + `infrastructureControlled` + `secret` classification |
| `description` | `description` |
| `requiredInProd` | Informational — not a catalog field; validation tier and environment scope replace this |
| `conditionalOn` | `conditionalOn` |
| `configTier` | `configTier` |

The existing `WAVE0_REQUIRED_CONFIG` and `WAVE0_OPTIONAL_CONFIG` arrays remain authoritative for startup validation. The new catalog wraps them with governance metadata. A `wave0-mapping.ts` module (recommended in taxonomy doc §8) will bridge existing entries to catalog entries without duplication.

---

## 13. Type definitions summary

For implementation in Prompt-04, the following TypeScript types must be created:

```typescript
type ConfigDomain = 'rollout' | 'sharepoint' | 'identity' | 'access-control'
  | 'notification' | 'infrastructure' | 'app-binding' | 'hybrid-identity'
  | 'device-package' | 'validation-policy' | 'admin-presentation' | 'tenant-governance';

type ConfigSubdomain = `${ConfigDomain}.${string}`;

type ConfigValueType = 'string' | 'enum' | 'integer' | 'boolean'
  | 'upn' | 'upn-list' | 'url' | 'guid' | 'connection-string';

type ConfigRiskTier = 'low' | 'medium' | 'high' | 'critical';

type ConfigEnvironmentScope = 'all' | 'production-only' | 'non-production-only' | 'per-environment';

type ConfigVersioningBehavior = 'versioned' | 'unversioned' | 'inherited';

type ConfigPublishSemantics = 'immediate' | 'staged' | 'not-applicable';

type ConfigAuditPayload = 'full' | 'metadata-only' | 'none';

interface IConfigValidationRule {
  type: 'regex' | 'enum' | 'range' | 'custom';
  pattern?: string;
  allowedValues?: string[];
  min?: number;
  max?: number;
  customValidator?: string;
  errorMessage: string;
}

interface IConfigCatalogEntry {
  key: string;
  domain: ConfigDomain;
  subdomain: ConfigSubdomain;
  displayName: string;
  description: string;
  valueType: ConfigValueType;
  validationRule: IConfigValidationRule | null;
  defaultValue: unknown;
  defaultValueSource: string;
  liveEditable: boolean;
  secret: boolean;
  infrastructureControlled: boolean;
  editorPermission: string | null;
  riskTier: ConfigRiskTier;
  environmentScope: ConfigEnvironmentScope;
  versioningBehavior: ConfigVersioningBehavior;
  publishSemantics: ConfigPublishSemantics;
  auditPayload: ConfigAuditPayload;
  snapshotRequired: boolean;
  configTier: 'core' | 'sharepoint' | 'provisioning' | null;
  conditionalOn: string | null;
  deprecatedAt: string | null;
  addedInPhase: string;
}
```

These types are provided as a reference for Prompt-04 implementation. Exact file placement follows the recommended structure in the taxonomy doc §8.
