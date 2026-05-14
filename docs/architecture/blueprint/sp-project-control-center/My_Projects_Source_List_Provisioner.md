# My Projects Source-List Provisioner

## Purpose

Adds a dedicated operator-run schema provisioner for My Projects source-list fields on existing HBCentral lists.

## Script

`scripts/provision-my-projects-source-list-schema.ts`

## Safety Posture

- Dry-run is default.
- Mutation requires explicit `--apply`.
- No list creation.
- No delete/recreate conversion.
- Wrong-type fields are blocking.
- HBCentral site lock is enforced.

## Scope

Targets only the Prompt 02 source-list descriptor fields:

- `Projects`: 14 canonical role-array fields (`MultiLineText`).
- `Legacy Project Fallback Registry`: same 14 role-array fields plus `procoreProject` (`Text`).

## Output and Operator Guidance

The script emits structured report data (JSON when `--json` is used) including:

- planned creates;
- applied creates;
- blockers;
- missing-list failures;
- identity-lane warning separating Function App UAMI runtime identity from HB SharePoint Creator operator/deployment identity.

`success=true` and exit code `0` are returned only when no blocking drift exists and required lists are present.
