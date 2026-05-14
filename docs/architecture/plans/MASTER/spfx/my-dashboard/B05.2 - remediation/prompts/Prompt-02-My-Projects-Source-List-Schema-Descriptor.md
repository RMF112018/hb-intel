
# Prompt 02 — My Projects Source-List Schema Descriptor

## Objective

Add a narrowly scoped descriptor for the My Projects source-list schema delta covering only the required fields on existing `Projects` and `Legacy Project Fallback Registry` lists.

## Why this issue exists now

The repo documents the target fields in multiple places, but there is no dedicated descriptor for a safe source-list-only provisioning operation.

## Why it matters

A dedicated descriptor prevents broad legacy fallback provisioning runs from touching unrelated fields such as `FolderWebUrl` and prevents accidental source-list recreation.

## Current repo-truth condition

The canonical role list is in `packages/models/src/myWork/MyProjectAssignmentRoles.ts`. The `Projects` schema docs and Registry schema docs both list target additions. The Registry descriptor already includes the fields, but it is bundled with unrelated legacy fallback list fields.

## Required future state

Add a descriptor module, for example:

```text
backend/functions/src/services/my-projects/my-projects-source-list-schema.ts
```

It must define:

- exact source site: HBCentral;
- existing list targets only;
- `allowCreateList: false` per target;
- Projects fields: fourteen role-array fields only;
- Registry fields: fourteen role-array fields plus `procoreProject` Text;
- display names matching repo docs;
- type mapping: role arrays = `MultiLineText`; procoreProject = `Text`;
- required false; indexed false.

## Exact files / seams / symbols to inspect

- `packages/models/src/myWork/MyProjectAssignmentRoles.ts`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`
- `backend/functions/src/services/projects-role-schema-readiness.ts`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts`

## Research-informed technical considerations

- SharePoint `Note`/MultiLineText maps to PnPjs `addMultilineText` and live `TypeAsString === 'Note'`.
- `Text` maps to `addText` and live `TypeAsString === 'Text'`.
- Internal names must be exact; display names may be improved, but must not change internal names.

## Required implementation scope

- Add descriptor module.
- Export constants for source list titles and target fields.
- Ensure the field list derives role fields from `MY_PROJECT_ASSIGNMENT_INTERNAL_FIELDS`, not a duplicated literal list, where practical.
- Add tests proving descriptor output matches the canonical role-field model.

## Explicit non-scope

- Do not implement the provisioner script yet.
- Do not update backfill scripts.
- Do not change the My Projects provider.
- Do not address unrelated Registry descriptor fields.

## Required tests

- Descriptor includes exactly fourteen Projects role fields.
- Descriptor includes exactly fourteen Registry role fields plus `procoreProject`.
- All role fields are `MultiLineText`, not indexed, not required.
- `procoreProject` is `Text`, not indexed, not required.
- Descriptor does not include `FolderWebUrl`.

## Validation commands

```bash
pnpm test -- backend/functions/src/services/my-projects
pnpm typecheck
```

## Proof-of-closure artifacts

- Descriptor module.
- Unit tests.
- Test output.

## Completion standard

This prompt is complete when the My Projects schema delta can be consumed independently of the legacy fallback descriptor set.

> **Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

