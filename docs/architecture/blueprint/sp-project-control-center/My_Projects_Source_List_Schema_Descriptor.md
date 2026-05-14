# My Projects Source-List Schema Descriptor

## Purpose

Defines a narrowly scoped, source-list-only schema delta descriptor for My Projects role assignment fields on existing HBCentral lists.

## Module

`backend/functions/src/services/my-projects/my-projects-source-list-schema.ts`

## Descriptor Contract

- Site is fixed to `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
- Targets only existing source lists:
  - `Projects`
  - `Legacy Project Fallback Registry`
- Each target sets `allowCreateList: false`.
- Role-array fields are derived from `MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS` (canonical model), not duplicated literals.
- Role-array fields map to `MultiLineText` (`TypeAsString: Note`) with `required:false`, `indexed:false`.
- Registry adds `procoreProject` as `Text` (`TypeAsString: Text`) with `required:false`, `indexed:false`.
- Unrelated fields such as `FolderWebUrl` are intentionally excluded.

## Safety Boundary

- This descriptor is independent from broad legacy fallback list descriptors.
- It is designed for future dedicated source-list provisioning workflows so unrelated schema surfaces are not touched.
