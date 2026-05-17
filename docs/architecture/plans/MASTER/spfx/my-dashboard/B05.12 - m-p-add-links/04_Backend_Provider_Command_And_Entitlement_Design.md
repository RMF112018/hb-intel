# Backend Provider, Command, and Entitlement Design

## 1. Backend repository seam

Create a dedicated custom-links repository/service under the My Work project-links area or the repo's existing backend services layout.

Recommended responsibilities:

- load active visible custom links for an actor's project set,
- create a new custom link,
- update an existing custom link,
- soft-delete an existing custom link,
- map SharePoint fields ↔ domain contract,
- fail closed on malformed persisted rows.

---

## 2. Suggested backend file seams

The exact local names may be adapted to repo conventions, but the package target is:

```text
backend/functions/src/hosts/my-work-read-model/read-models/project-links/
  my-project-custom-links-provider.ts
  my-project-custom-links-command-service.ts
  my-project-custom-links-repository.ts
  my-project-custom-links-validation.ts
  my-project-custom-links-routes.ts
```

If route registration is centralized elsewhere, keep route registration there and keep these files scoped to logic.

---

## 3. Use existing Graph list client

The existing `GraphListClient` supports:

- `listItems(...)`
- `addItem(...)`
- `updateItem(...)`

Use it for:

- read model custom-link list reads,
- create writes,
- update writes,
- soft delete writes.

Do not introduce a new PnPjs data path for this feature.

---

## 4. Query strategy

### Project-visible links
Read active project-visible links:

```text
IsActive eq true and Visibility eq 'project'
```

### Private links
Read active private links for the actor:

```text
IsActive eq true and Visibility eq 'private' and CreatedByUpn eq '<actorUpn>'
```

Join the returned rows in-memory to the already-resolved assigned-project item set by provenance IDs.

### Boundedness
Apply a reasonable top limit aligned with existing source-bounded patterns. If the result set reaches the limit, surface a sanitized custom-link source warning or partial status as appropriate.

---

## 5. Entitlement validation for create

The backend must validate that the actor is entitled to the target project **before** a create.

Recommended architecture:
- Extract or reuse an entitlement helper that uses the same actor-UPN normalization and project-assignment role parsing used by the My Projects read model.
- The helper receives:
  - actor identity,
  - project provenance from request,
  - project number/year fallback context,
  and returns:
  - `allowed`
  - `project-not-found`
  - `project-access-denied`
  - `source-unavailable`

No create command may persist solely because the client supplied a valid-looking Projects list item ID.

---

## 6. Owner validation for update/delete

For update/delete:
1. load custom link by list item ID,
2. require `IsActive === true`,
3. require `CreatedByUpn === actorUpn`,
4. then update or soft-delete.

Do not permit a different assigned project user to alter someone else's shared project link.

---

## 7. Create persistence fields

Create command persists:

| Field | Value |
|---|---|
| `Title` | normalized title |
| `ProjectNumber` | request projectNumber |
| `ProjectYear` | request projectYear, if present |
| `ProjectsListItemId` | request projectsListItemId, if present |
| `LegacyRegistryItemId` | request legacyRegistryItemId, if present |
| `LinkUrl` | normalized URL |
| `Visibility` | private/project |
| `CreatedByUpn` | actor normalized UPN |
| `CreatedByOid` | actor OID if available |
| `CreatedAtUtc` | now UTC |
| `UpdatedAtUtc` | now UTC |
| `IsActive` | true |

---

## 8. Update persistence fields

Update command changes only:

- `Title`
- `LinkUrl`
- `Visibility`
- `UpdatedAtUtc`

Do not alter:
- project identity fields,
- creator identity fields,
- created timestamp.

---

## 9. Delete persistence fields

Delete command writes:

- `IsActive = false`
- `DeletedAtUtc = now UTC`
- `DeletedByUpn = actor UPN`
- `DeletedByOid = actor OID if available`
- `UpdatedAtUtc = now UTC`

---

## 10. Error and telemetry posture

Create/update/delete routes should emit sanitized structured telemetry if route patterns already exist for My Work modules.

Never log:
- raw link URL,
- raw title,
- raw creator UPN,
- bearer tokens.

Safe telemetry examples:
- status enum,
- visibility enum,
- whether project identity included Projects ID / Registry ID,
- command type,
- validation failure field category.

---

## 11. Read-model integration pattern

After the existing provider finishes reconciling the actor's project items:

1. collect `projectsListItemId` values,
2. collect `legacyRegistryItemId` values,
3. load relevant custom-link rows for visibility scope,
4. bucket links by provenance ID,
5. attach `customLinks` to each item,
6. preserve existing project sort order.

---

## 12. Source unavailability posture

A custom-link list read failure must not erase the project list.

Recommended behavior:
- keep My Projects items,
- attach `customLinks: []`,
- surface a read-model warning or source diagnostic indicating the custom-link enrichment source is unavailable or partial.

Do not collapse the entire My Projects module to backend-unavailable solely because custom links failed.
