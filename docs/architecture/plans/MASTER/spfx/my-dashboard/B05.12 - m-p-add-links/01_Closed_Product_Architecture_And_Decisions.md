# Closed Product Architecture and Decisions

This document eliminates implementation ambiguity. Treat all decisions below as locked.

---

# 1. Feature name

Use:

> **My Projects Custom Links Registry**

---

# 2. Product objective

Enable assigned My Projects users to add project-specific resource links that can be:

- visible only to themselves, or
- visible to all users who can already see the project in My Projects.

---

# 3. Storage architecture

## Locked decision
Use a dedicated SharePoint child list:

```text
My Projects Custom Links
```

Do not store custom link arrays on:

- `Projects`
- `Legacy Project Fallback Registry`

---

# 4. Visibility contract

Use exactly two visibility values:

```text
private
project
```

### private
Visible only to the link creator.

### project
Visible to any user whose My Projects read model contains the same project item.

Do not interpret `project` visibility as company-wide access.

---

# 5. Project attachment contract

Every custom-link record must carry enough parent-project identity to survive source reconciliation changes.

Store:

| Field | Required? | Purpose |
|---|---:|---|
| `ProjectsListItemId` | conditional | Projects-backed or merged project identity |
| `LegacyRegistryItemId` | conditional | Legacy-only or merged project identity |
| `ProjectNumber` | yes | human-readable business key |
| `ProjectYear` | optional | fallback/disambiguation |

Rules:

- At least one of `ProjectsListItemId` or `LegacyRegistryItemId` is required.
- For merged rows, store both when both are present in provenance.
- The backend must never trust client project IDs without revalidating actor entitlement.

---

# 6. Creator and ownership

Store creator identity as:

| Field | Required? |
|---|---:|
| `CreatedByUpn` | yes |
| `CreatedByOid` | best effort when claim available |

Only the creator can:

- edit link title,
- edit URL,
- change visibility,
- soft-delete the link.

Admin override is deferred unless current repo already has a natural admin route pattern; do not invent one in this feature.

---

# 7. Soft delete

Delete behavior is soft delete only:

```text
IsActive = false
DeletedAtUtc = current UTC time
DeletedByUpn = actor UPN
DeletedByOid = actor OID when available
UpdatedAtUtc = current UTC time
```

Do not physically delete list rows.

---

# 8. Link validation rules

## URL
- Required.
- Must be absolute `https://`.
- Reject:
  - `http://`
  - `javascript:`
  - `data:`
  - `file:`
  - relative URLs
  - malformed strings
- Max length: `2048` characters after trimming.

## Title
- Required.
- Trim leading/trailing whitespace.
- Collapse repeated internal whitespace.
- Length: `1–80` characters.

---

# 9. Link limits

Cap active custom links at:

```text
20 active links per project
```

Project means the resolved project identity after joining by provenance IDs.

If the cap is exceeded, creation fails with a structured policy error.

---

# 10. Sorting rules

Within a project's `More Project Resources` menu:

1. project-visible links first
2. private links second
3. alphabetical by normalized title within each group

---

# 11. Read-model shape

Add an additive custom-link contract:

```ts
export type MyProjectCustomLinkVisibility = 'private' | 'project';

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

Do not surface raw creator UPN/OID in the frontend read model.

---

# 12. Backend command endpoints

Use these backend routes:

```text
POST   /api/my-work/me/project-links/custom-links
PATCH  /api/my-work/me/project-links/custom-links/{customLinkId}
DELETE /api/my-work/me/project-links/custom-links/{customLinkId}
```

Each route must be bearer-protected and actor-bound.

---

# 13. Create payload

```json
{
  "projectsListItemId": 123,
  "legacyRegistryItemId": 456,
  "projectNumber": "24-100-01",
  "projectYear": 2026,
  "title": "Permit Portal",
  "url": "https://example.com/permit-portal",
  "visibility": "private"
}
```

For Projects-only rows, `legacyRegistryItemId` may be omitted.
For legacy-only rows, `projectsListItemId` may be omitted.
For merged rows, both should be sent.

The backend revalidates entitlement and normalizes payload data before persistence.

---

# 14. Update payload

```json
{
  "title": "Updated Permit Portal",
  "url": "https://example.com/updated-portal",
  "visibility": "project"
}
```

The backend verifies:
- actor owns the link,
- link is active,
- updated values pass validation.

---

# 15. Delete semantics

`DELETE` does not require a body.
It performs a soft delete after owner validation.

---

# 16. UI target

Each project tile receives a collapsed button/menu:

```text
More Project Resources
```

When expanded, it shows:

- project-visible custom links,
- private custom links,
- badges:
  - `Shared`
  - `Only me`
- creator-owned manage actions where appropriate,
- footer action:
  - `Add project link`

When no links exist, the expanded panel shows:

```text
No additional project resources have been added yet.
```

and still displays:

```text
Add project link
```

---

# 17. Add-link modal helper text

Use exact helper copy:

```text
Use this to add trusted project resources such as additional SharePoint sites, permitting sites, private provider portals, and other project-specific destinations.
```

---

# 18. Visibility helper copy

Use:

### Only me
```text
Visible only in your My Projects panel.
```

### Everyone with this project
```text
Visible to anyone whose My Projects panel includes this project.
```

---

# 19. Command response posture

Create/update/delete commands should return closed-set success/failure results suitable for the frontend.

Recommended statuses:

- `created`
- `updated`
- `deleted`
- `invalid-input`
- `authorization-required`
- `principal-unresolved`
- `project-not-found`
- `project-access-denied`
- `not-found`
- `owner-required`
- `project-link-limit-reached`
- `source-unavailable`

Do not throw raw backend errors across the HTTP boundary.

---

# 20. Explicit non-goals

Do not implement:

- URL preview scraping,
- favicon discovery,
- link-use analytics,
- admin moderation UI,
- bulk import/export,
- custom sort order drag-and-drop,
- notifications,
- cross-project custom-link templates.
