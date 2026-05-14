# SharePoint Schema Provisioning Utilities

## Purpose

This seam centralizes shared SharePoint list-field schema provisioning behavior for:

- legacy fallback list provisioning script workflows;
- service-layer field provisioning paths; and
- future source-list schema provisioners.

The goal is reuse without duplicating field compatibility, planning, and apply logic.

## Module Location

`backend/functions/src/services/sharepoint-schema-provisioning/`

Primary exports:

- compatibility helpers:
  - `normalizeListTitle(...)`
  - `isSharePointFieldTypeCompatible(...)`
  - `getCompatibleSharePointFieldTypes(...)`
- pure planners:
  - `buildFieldPlan(...)`
  - `buildListFieldPlans(...)`
  - `validateProvisionedFields(...)`
- apply adapters:
  - `createSharePointField(...)`
  - `applyFieldSettingsUpdates(...)`
- report and plan DTO types used by scripts/services.

## Execution Split: Plan vs Apply

Pure planning functions do not call SharePoint APIs. They only compare descriptor fields against live snapshots and produce:

- `create` actions for missing fields;
- `update-settings` actions for compatible setting drift (`Required`, `Choices`, `Indexed`, `DefaultValue`);
- `blocker-wrong-type` entries for incompatible `TypeAsString` drift;
- `no-op` entries when aligned.

Apply adapters execute planned mutations against authenticated PnP list field collections.

## Safety Defaults

- Wrong-type drift remains non-automatic and emits unresolved blockers.
- No field delete/recreate is performed by these utilities.
- Utility-level posture is planning-first; callers must explicitly apply actions.
- List creation is caller-controlled (legacy fallback path currently preserves prior create-if-missing behavior).

## Legacy Fallback Integration

`scripts/provision-legacy-fallback-lists.ts` now consumes this shared seam for planning and apply actions while preserving:

- existing JSON report shape;
- existing unresolved-drift failure semantics;
- existing post-provision schema validation behavior;
- existing timeout and list-host safety checks.
