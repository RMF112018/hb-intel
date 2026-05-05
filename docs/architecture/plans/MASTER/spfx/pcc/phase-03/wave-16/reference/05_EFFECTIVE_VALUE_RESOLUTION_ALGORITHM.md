# 05 — Effective Value Resolution Algorithm

## Objective

Define a deterministic pure-function algorithm that converts policy/default/value/override/source-derived inputs into a role-aware effective setting row.

## Inputs

```ts
interface ResolveEffectiveSettingInput {
  definition: SettingDefinition;
  policyRules: readonly SettingPolicyRule[];
  projectValues: readonly SettingValue[];
  overrides: readonly SettingOverride[];
  validationResults: readonly SettingValidationResult[];
  dependencies: readonly SettingDependency[];
  viewerPersona: PccPersona;
  nowUtc: string;
}
```

## Precedence Order

1. Hard security policy.
2. Tenant/global policy.
3. HBCentral default.
4. Environment policy.
5. Project approved override.
6. Module approved override.
7. Role/persona filter.
8. User preference if policy allows.
9. Source-derived state.

## Algorithm

```text
1. Load the active definition by SettingKey.
2. Load active policy rules for SettingKey and EnvironmentKey.
3. Reject/flag policy rules that are inactive, superseded, malformed, or not effective yet.
4. Establish base value:
   a. hard security policy, if present;
   b. tenant/global policy, if present;
   c. HBCentral default, if present;
   d. environment policy, if present;
   e. source-derived state, if definition is source-owned and no editable override is valid.
5. Load candidate overrides:
   a. same ProjectId;
   b. same SettingKey;
   c. active;
   d. status Approved;
   e. EffectiveStartUtc <= now;
   f. EffectiveEndUtc absent or > now.
6. Exclude overrides that violate hard security policy or tenant/global policy.
7. If multiple valid overrides remain, select:
   a. highest explicit scope specificity: Module > Project > Environment;
   b. latest EffectiveStartUtc;
   c. latest ApprovedAtUtc;
   d. stable tie-breaker by OverrideId lexical order.
8. If selected override exists, compute effective value from override.
9. If selected override is expired, future-dated, blocked, or invalid, do not use it as the effective value; surface warning/status/dependency evidence.
10. Apply role/persona visibility:
    a. if viewer cannot view setting, set value to `NoAccess`;
    b. if redaction required, set redacted display value;
    c. never include raw secret values.
11. Attach validation status:
    a. latest active validation result by SettingKey and ProjectId;
    b. if missing required value, mark `MissingRequired`;
    c. if policy violation, mark `Blocked`;
    d. if source unavailable, mark `BackendUnavailable` or degraded equivalent.
12. Compute action availability and disabled reason.
13. Return `EffectiveSettingRow` plus source lineage and warnings.
```

## Required Tests

| Test ID | Input Condition | Expected Result |
| --- | --- | --- |
| W16-RES-001 | HBCentral default only | Effective source `HBCentralDefault`. |
| W16-RES-002 | Approved active override | Override controls value. |
| W16-RES-003 | Expired override | Override ignored; warning surfaced. |
| W16-RES-004 | Future-dated override | Override not active; future value shown only in detail. |
| W16-RES-005 | Blocked policy override | Override ignored; validation `Blocked`. |
| W16-RES-006 | Multiple overrides | Most specific/latest approved active override wins. |
| W16-RES-007 | Secret reference | Display reference only; raw value unavailable. |
| W16-RES-008 | Unauthorized viewer | Value redacted/no access; disabled reason emitted. |
| W16-RES-009 | Missing default | Missing required / degraded state emitted. |
| W16-RES-010 | Source-derived | Source owner retained; PCC does not claim ownership. |

## Helper Expectations

Document or implement helpers with names consistent with repo conventions. Suggested helper names:

- `resolveEffectiveSettingValue`
- `filterActiveSettingOverrides`
- `selectWinningSettingOverride`
- `deriveSettingValidationStatus`
- `deriveSettingActionAvailability`
- `redactSettingValueForPersona`
- `buildSettingDisabledReason`
- `buildSettingSourceLineage`
