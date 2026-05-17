# Current Repo-Truth Baseline

This baseline captures the current implementation seams that the custom-links feature must extend. The local agent must verify these against the working tree before editing.

---

## 1. Current My Projects read-model item shape

Current model file:

```text
packages/models/src/myWork/MyProjectLinksReadModel.ts
```

`MyProjectLinkItem` currently includes:

- `recordKey`
- `source`
- `projectName`
- `projectNumber`
- `projectStage?`
- `assignmentRoles`
- fixed launch actions:
  - `sharePointAction`
  - `procoreAction`
  - `buildingConnectedAction`
  - `documentCrunchAction`
- `provenance`:
  - `projectsListItemId?`
  - `legacyRegistryItemId?`
  - `legacyMatchedProjectListItemId?`
  - fallback match metadata
- `warnings`

The custom-links feature must extend this additively with:

```ts
customLinks: readonly MyProjectCustomLink[];
```

Do not replace or overload any existing fixed launch action field.

---

## 2. Current project reconciliation behavior

Current provider file:

```text
backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts
```

The provider already:

- reconciles `Projects` rows and `Legacy Project Fallback Registry` rows;
- produces:
  - `projects-only`
  - `merged`
  - `legacy-only`
- filters rows by actor/project-role assignment;
- emits source-item provenance IDs;
- supports BuildingConnected and Document Crunch system links.

This feature must join custom links **after** the assigned-project item set is determined. It must not change assignment matching semantics.

---

## 3. Current UI seams

Current My Projects UI includes:

```text
apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx
apps/my-dashboard/src/modules/myProjects/ProjectPortfolioTile.tsx
apps/my-dashboard/src/modules/myProjects/ProjectLaunchActions.tsx
```

Current UI posture:

- `MyProjectsHomeCard` loads and renders project items.
- `ProjectPortfolioTile` renders per-project tile/card details.
- `ProjectLaunchActions` renders fixed system-launch actions.
- Current system launch actions are already separated from tile identity/meta.

Custom links should be integrated as a separate tile-level disclosure/menu:

```text
More Project Resources
```

Do not inject them into the existing fixed system launch action row.

---

## 4. Current frontend client seam

Current API client seam:

```text
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
apps/my-dashboard/src/api/myWorkReadModelClientFactory.ts
```

The client currently supports read-model GETs and certain Adobe Sign POST actions.

Custom-links work must add command methods while preserving fixture/backend fallback behavior and not breaking existing read-model calls.

---

## 5. Current Graph list client capability

Current graph list client:

```text
backend/functions/src/services/legacy-fallback/graph-list-client.ts
```

Already supports:

- filtered list reads,
- `addItem(...)`,
- `updateItem(...)`.

This makes it suitable for:

- reading custom links,
- creating custom links,
- updating custom links,
- soft-deleting custom links via `IsActive = false`.

Hard delete is not required for v1.

---

## 6. Current provisioning patterns

Current list descriptor pattern exists in:

```text
backend/functions/src/services/legacy-fallback/list-descriptors.ts
```

Current field definition types support:

- Text
- Number
- DateTime
- Boolean
- Choice
- URL
- MultiLineText
- others

The custom-link list should follow the existing list-descriptor pattern and provision through a controlled script/runbook.

---

## 7. Scope relationship to recent My Projects expansion

The My Projects module has recently expanded its system launch actions to include:

- SharePoint
- Procore
- BuildingConnected
- Document Crunch

This custom-link feature is a **new user-authored resource layer**, not an extension of those fixed launch actions.

---

## 8. Repo-truth areas that the agent must confirm

Before implementation, verify:

1. Exact current path names and exports for My Projects models/provider/UI.
2. Whether there is already a generic backend command route pattern to reuse.
3. Whether list provisioning for new lists is currently handled by:
   - existing provisioning services,
   - a dedicated operator script,
   - or both.
4. Whether route registration is centralized in the My Work host or split by module.
5. Whether current fixture clients need additive command-method stubs.

---

## 9. Known architecture decision already locked

The feature uses:

```text
My Projects Custom Links
```

as a dedicated list.

It does **not** use JSON array columns embedded in Projects or Registry.
