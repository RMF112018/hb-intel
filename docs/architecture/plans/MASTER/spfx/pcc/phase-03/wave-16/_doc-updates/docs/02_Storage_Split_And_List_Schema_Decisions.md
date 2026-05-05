# 02 — Storage Split and List-Schema Decisions

## Final decision
Use a split storage model.

| Tier | Storage | Purpose | Mutation posture |
|---|---|---|---|
| Global platform | HBCentral | Non-secret platform/PCC values and secret references | Backend/admin-gated |
| Global PCC policy | HBCentral/global PCC registry | Definitions, policy, validation, feature/module defaults | Backend/admin-gated |
| Project effective values | Project site | Effective settings and approved project overrides | Future command-gated |
| Project workflow | Project site | Change requests, validation results, audit events | Future command-gated / append-only |
| Compliance/security audit | Microsoft 365 / Purview / Entra | Tenant/security evidence | External reference only |
| Secrets | Key Vault/backend app settings | Secret values | Never SharePoint/SPFx/HBI |

## Keep / reuse
- `HB Platform Configuration Registry` for global non-secret config and secret-reference metadata.
- `PCC Feature Flags`, corrected and global by default.
- `PCC Module Flags`, corrected and global/default by default.
- `PCC Business Audit Events` as rollup/parallel audit posture.

## Add explicit Wave 16 schemas
Add under `docs/reference/sharepoint/list-schemas/pcc/lists/`:
1. `control-center-setting-definitions.md`
2. `control-center-setting-policy-rules.md`
3. `control-center-setting-values.md`
4. `control-center-setting-overrides.md`
5. `control-center-setting-change-requests.md`
6. `control-center-setting-validation-results.md`
7. `control-center-setting-audit-events.md`
8. `control-center-setting-dependency-map.md`
9. `control-center-setting-health-snapshots.md`

## Index requirements
At minimum, index `ProjectId`, `SettingKey`, `SettingDefinitionId`, `Scope`, `ScopeKey`, `EnvironmentKey`, `IsActive`, `EffectiveFromUtc`, `EffectiveThroughUtc`, `State/Status`, `SourceOwner`, and `LastUpdatedAtUtc` where present.

## Effective setting resolution
1. Hard global security policy.
2. Tenant/global policy.
3. HBCentral PCC default.
4. Environment-specific policy.
5. Project approved override.
6. Module approved override.
7. Role/persona display filter.
8. User preference where allowed.
9. Source-system-derived status.

Stricter and higher-authority scope wins.
