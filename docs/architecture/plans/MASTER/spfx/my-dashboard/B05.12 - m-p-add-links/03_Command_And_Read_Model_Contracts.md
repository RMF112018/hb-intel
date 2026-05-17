# Command and Read-Model Contracts

## 1. Shared model additions

Create a dedicated custom-links model module under `packages/models/src/myWork/`, or extend the existing project-links model with a grouped additive section if that is the cleaner current repo pattern.

Recommended exported types:

```ts
export const MY_PROJECT_CUSTOM_LINK_VISIBILITIES = ['private', 'project'] as const;
export type MyProjectCustomLinkVisibility =
  (typeof MY_PROJECT_CUSTOM_LINK_VISIBILITIES)[number];

export interface MyProjectCustomLink {
  readonly id: number;
  readonly title: string;
  readonly href: string;
  readonly visibility: MyProjectCustomLinkVisibility;
  readonly createdByCurrentUser: boolean;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
}
```

Add to `MyProjectLinkItem`:

```ts
readonly customLinks: readonly MyProjectCustomLink[];
```

---

## 2. Create command contract

### Request

```ts
export interface CreateMyProjectCustomLinkRequest {
  readonly projectsListItemId?: number;
  readonly legacyRegistryItemId?: number;
  readonly projectNumber: string;
  readonly projectYear?: number;
  readonly title: string;
  readonly url: string;
  readonly visibility: MyProjectCustomLinkVisibility;
}
```

### Result

```ts
export type CreateMyProjectCustomLinkResult =
  | { readonly status: 'created'; readonly link: MyProjectCustomLink }
  | { readonly status: 'invalid-input'; readonly field?: string; readonly reason?: string }
  | { readonly status: 'authorization-required' }
  | { readonly status: 'principal-unresolved' }
  | { readonly status: 'project-not-found' }
  | { readonly status: 'project-access-denied' }
  | { readonly status: 'project-link-limit-reached' }
  | { readonly status: 'source-unavailable' };
```

---

## 3. Update command contract

### Request

```ts
export interface UpdateMyProjectCustomLinkRequest {
  readonly title: string;
  readonly url: string;
  readonly visibility: MyProjectCustomLinkVisibility;
}
```

### Result

```ts
export type UpdateMyProjectCustomLinkResult =
  | { readonly status: 'updated'; readonly link: MyProjectCustomLink }
  | { readonly status: 'invalid-input'; readonly field?: string; readonly reason?: string }
  | { readonly status: 'authorization-required' }
  | { readonly status: 'principal-unresolved' }
  | { readonly status: 'not-found' }
  | { readonly status: 'owner-required' }
  | { readonly status: 'source-unavailable' };
```

---

## 4. Delete command contract

### Result

```ts
export type DeleteMyProjectCustomLinkResult =
  | { readonly status: 'deleted'; readonly customLinkId: number }
  | { readonly status: 'authorization-required' }
  | { readonly status: 'principal-unresolved' }
  | { readonly status: 'not-found' }
  | { readonly status: 'owner-required' }
  | { readonly status: 'source-unavailable' };
```

---

## 5. Backend HTTP routes

### Create
```text
POST /api/my-work/me/project-links/custom-links
```

### Update
```text
PATCH /api/my-work/me/project-links/custom-links/{customLinkId}
```

### Delete
```text
DELETE /api/my-work/me/project-links/custom-links/{customLinkId}
```

---

## 6. HTTP result wrapping

Follow the existing My Dashboard convention of returning:

```json
{
  "data": { "status": "created" }
}
```

HTTP semantics recommendation:

| Status | Use |
|---:|---|
| 200 | created / updated / deleted result |
| 400 | invalid-input |
| 401 | authorization-required |
| 403 | project-access-denied / owner-required |
| 404 | project-not-found / not-found |
| 409 | project-link-limit-reached |
| 503 | source-unavailable |

The frontend command client should normalize these into closed-set result objects, not raw thrown response errors.

---

## 7. Read-model join behavior

For each `MyProjectLinkItem`, attach:

```ts
customLinks: readonly MyProjectCustomLink[];
```

### Include link when:
- `IsActive === true`, and
- one of:
  - `Visibility === 'project'`
  - `Visibility === 'private' && CreatedByUpn === actorUpn`

### Match project when:
- custom link `ProjectsListItemId` matches item provenance `projectsListItemId`, or
- custom link `LegacyRegistryItemId` matches item provenance `legacyRegistryItemId`.

Do not match by project number alone except as a diagnostic fallback if the developer finds an unavoidable migration seam; it must not be the primary join.

---

## 8. Read-model sorting

Sort custom links per item:

1. `project` visibility before `private`
2. title ascending case-insensitively
3. item ID ascending as deterministic tie-breaker

---

## 9. Frontend permissions derived from read model

For each custom link:

- `canEdit = createdByCurrentUser`
- `canDelete = createdByCurrentUser`

Do not create frontend-only ownership guesses.
