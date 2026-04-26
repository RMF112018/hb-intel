# 08 — Central Config Registry Analysis

## Updated Recommendation

Build the `HB Platform Configuration Registry` first and make it the prerequisite for Foleon Manager remediation.

The registry should be a SharePoint list in HBCentral that stores non-secret configuration values, validation state, ownership, and secret references. It should not store secrets directly.

## Why Registry First

The current Foleon Manager issue is a symptom of a broader configuration problem:

- Foleon standalone webpart properties use one key shape.
- Homepage embedded Foleon lane config uses another key shape.
- Backend Function App values are environment variables.
- SharePoint list GUIDs are tenant-assigned and currently page/config dependent.
- Package/manifest/version expectations appear in multiple places.
- Future Safety, Kudos, Homepage, and Function App settings are likely to repeat this pattern.

Provisioning the registry first gives the rest of the Foleon work a stable configuration source.

## Options Considered

### SharePoint List-Based Registry in HBCentral

Recommended as the primary non-secret index.

Pros:

- Fits HBCentral governance model.
- Usable by non-developer admins.
- Auditable through SharePoint versioning and list history.
- Easy to validate with PnP/Graph.
- Low operational burden for a small IT/admin team.

Cons:

- Not suitable for secrets.
- Requires strict validation to avoid config drift.
- Requires caching/read strategy for runtime performance.

### Azure App Configuration

Recommended as a later enhancement or backend companion, especially for backend-managed environment config.

Pros:

- Strong environment/config management model.
- Integrates with Key Vault references.
- Better for backend runtime config.

Cons:

- Less natural for marketing/admin users.
- Adds another Azure operational surface.

### Azure Key Vault

Required for actual secrets or secret references.

The SharePoint registry should store references such as `HB_FOLEON_CLIENT_SECRET`, not secret values.

### SPFx Property Pane Only

Not recommended as the target.

It is acceptable only for bootstrap, route selection, page-level overrides, or emergency fallback.

### Per-App Lists / Per-App Properties

Not recommended as the long-term authority.

This is the source of the current fragmentation.

## Recommended Architecture

```text
HBCentral SharePoint List
  HB Platform Configuration Registry
    - non-secret active values
    - secret references
    - validation status
    - owner/admin notes
    - environment/scope/application keys

Backend Function App
  - reads secrets from app settings / Key Vault / App Configuration
  - validates registry records
  - exposes safe-config status
  - never returns secret material

SPFx Apps
  - read registry-safe config through a shared reader pattern
  - use page properties only for explicit override/bootstrap
  - display blocked diagnostics when required config is missing
```

## Registry Consumer Precedence

```text
1. Explicit page/webpart property override
2. Active registry value matching ApplicationKey + EnvironmentKey + ScopeKey + ConfigKey
3. Build-time or package default
4. Safe blocked state with actionable diagnostics
```

## Caching Strategy

- SPFx consumers should cache resolved registry config in-memory per page load.
- Optional sessionStorage cache may be used only for non-secret values and must include a short TTL.
- Backend validators should always fetch fresh data for proof commands.
- Config tab should provide a manual refresh.

## Fallback Behavior

- Missing required value: blocked state.
- Invalid non-required value: warning state and fallback if available.
- Expired value: blocked if required, warning if optional.
- Duplicate active logical key: blocked for that config key.
- Secret reference missing: blocked only for backend operations requiring that secret.

## Migration Path

1. Provision registry.
2. Seed known safe Foleon values and placeholders.
3. Add registry reader and validation proof.
4. Bridge Foleon Manager values from registry.
5. Bridge homepage Foleon lane values from registry.
6. Keep existing webpart properties as temporary override compatibility.
7. Document deprecation of non-essential page-level Foleon config values.
8. Expand registry adoption to Safety, Kudos, Homepage, and Function App settings after Foleon is stable.
