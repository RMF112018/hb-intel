# SharePoint Custom Links List Schema

## List title

```text
My Projects Custom Links
```

## List purpose

One row per user-authored project link displayed in My Dashboard → My Projects.

---

# Recommended list descriptor

Use the repo's existing `IListDefinition` / `IFieldDefinition` pattern.

```ts
export const MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE = 'My Projects Custom Links';

export const MY_PROJECTS_CUSTOM_LINKS_LIST_DESCRIPTOR: IListDefinition = {
  title: MY_PROJECTS_CUSTOM_LINKS_LIST_TITLE,
  description: 'User-authored custom resource links for My Dashboard My Projects.',
  template: 100,
  fields: [
    { internalName: 'ProjectNumber', displayName: 'Project Number', type: 'Text', indexed: true },
    { internalName: 'ProjectYear', displayName: 'Project Year', type: 'Number', indexed: true },
    { internalName: 'ProjectsListItemId', displayName: 'Projects List Item Id', type: 'Number', indexed: true },
    { internalName: 'LegacyRegistryItemId', displayName: 'Legacy Registry Item Id', type: 'Number', indexed: true },
    { internalName: 'LinkUrl', displayName: 'Link Url', type: 'Text' },
    {
      internalName: 'Visibility',
      displayName: 'Visibility',
      type: 'Choice',
      choices: ['private', 'project'],
      indexed: true,
    },
    { internalName: 'CreatedByUpn', displayName: 'Created By Upn', type: 'Text', indexed: true },
    { internalName: 'CreatedByOid', displayName: 'Created By Oid', type: 'Text' },
    { internalName: 'CreatedAtUtc', displayName: 'Created At Utc', type: 'DateTime' },
    { internalName: 'UpdatedAtUtc', displayName: 'Updated At Utc', type: 'DateTime' },
    { internalName: 'DeletedAtUtc', displayName: 'Deleted At Utc', type: 'DateTime' },
    { internalName: 'DeletedByUpn', displayName: 'Deleted By Upn', type: 'Text' },
    { internalName: 'DeletedByOid', displayName: 'Deleted By Oid', type: 'Text' },
    {
      internalName: 'IsActive',
      displayName: 'Is Active',
      type: 'Boolean',
      indexed: true,
      defaultValue: '1',
    },
  ],
};
```

## Built-in Title usage

Use SharePoint's built-in `Title` column as the persisted custom-link title.  
Do **not** create a separate `LinkTitle` column.

Write behavior:

```text
Title = normalized user-entered title
```

Read behavior:

```text
title = fields.Title
```

---

# Required schema verifier coverage

Create a readiness verifier for the custom links list or extend the My Projects schema verifier with a separate custom-links section.

Minimum report shape:

```json
{
  "ready": true,
  "customLinks": {
    "listName": "My Projects Custom Links",
    "ready": true,
    "entries": [
      { "internalName": "ProjectNumber", "state": "live-verified" }
    ]
  }
}
```

If the existing verifier is already too narrowly named, prefer a separate custom-links verifier to avoid overloading its existing meaning.

---

# Provisioning approach

Implement a deterministic operator script that can:

- dry-run,
- apply,
- JSON-report,
- fail closed on wrong-type drift.

Recommended script name:

```text
scripts/provision-my-projects-custom-links-list.ts
```

Recommended commands:

```bash
pnpm tsx scripts/provision-my-projects-custom-links-list.ts --json
pnpm tsx scripts/provision-my-projects-custom-links-list.ts --apply --json
```

If the current provisioning-service patterns support list creation safely, use them. Otherwise use the existing SharePoint provisioning service/list descriptor path already proven elsewhere.

---

# Blocking rules

Provisioning must refuse to apply if:

- a field exists with the wrong type,
- list metadata cannot be inspected,
- app-only auth is not available,
- any required field from the descriptor cannot be verified.

---

# Index guidance

Indexes should be present at minimum for:

- `ProjectNumber`
- `ProjectYear`
- `ProjectsListItemId`
- `LegacyRegistryItemId`
- `Visibility`
- `CreatedByUpn`
- `IsActive`

These fields support:
- project joins,
- private-link filtering,
- active-only reads.
