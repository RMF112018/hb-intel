# Current Repo-Truth Baseline

This baseline captures the repo seams that the implementation package is built around. The local agent must verify them against its own working tree before editing, because repository state may advance after this package is generated.

---

## 1. Source-list schema descriptor

Current file:

```text
backend/functions/src/services/my-projects/my-projects-source-list-schema.ts
```

Current behavior:

- `Projects` target contains:
  - the 14 canonical My Projects role-array fields only
- `Legacy Project Fallback Registry` target contains:
  - the same 14 role-array fields
  - `procoreProject`

Current gap:

- No BuildingConnected field
- No Document Crunch field
- No Registry `projectStage` field

Target expansion:

- `Projects`
  - `buildingConnectedUrl`
  - `documentCrunchUrl`
- `Legacy Project Fallback Registry`
  - `buildingConnectedUrl`
  - `documentCrunchUrl`
  - `projectStage`

---

## 2. Existing Projects stage field

Current Projects reference snapshot documents:

```text
Display Name: ProjectStage
Internal Name: field_6
TypeAsString: Text
```

Current Projects list contract / mapper already exposes domain-level `projectStage` through:

```text
resolveSpField('projectStage') => field_6
```

Target decision:

- Do not create a new Projects `projectStage` column.
- Continue reading Projects stage from `field_6`.
- Add a separate Registry `projectStage` Text field.

---

## 3. Read-model contract

Current file:

```text
packages/models/src/myWork/MyProjectLinksReadModel.ts
```

Current `MyProjectLinkItem` includes:

- `projectStage?: string`
- `sharePointAction`
- `procoreAction`

Current summary includes:

- `assignedProjectCount`
- `dualLaunchReadyCount`
- `sharePointReadyCount`
- `procoreReadyCount`
- no launch counts for BuildingConnected or Document Crunch

Current warning codes include SharePoint/Procore availability and source-readiness warnings, but no BuildingConnected or Document Crunch warnings.

Target expansion:

- Add:
  - `buildingConnectedAction`
  - `documentCrunchAction`
- Preserve:
  - `sharePointAction`
  - `procoreAction`
  - `dualLaunchReadyCount`
- Add:
  - `buildingConnectedReadyCount`
  - `documentCrunchReadyCount`
  - `noBuildingConnectedLaunchCount`
  - `noDocumentCrunchLaunchCount`
  - `multiPlatformReadyCount`

---

## 4. Backend provider

Current file:

```text
backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts
```

Current source row shapes:

- Projects row includes:
  - `projectStage?`
  - `siteUrl?`
  - `procoreProject?`
- Registry row includes:
  - `folderWebUrl?`
  - `procoreProject?`
  - no `projectStage`
  - no BuildingConnected URL
  - no Document Crunch URL

Current provider behavior:

- Projects rows surface `projectStage`.
- Legacy-only rows do not surface `projectStage`.
- Merged rows surface Projects `projectStage` only.
- Launch actions exist only for SharePoint and Procore.
- Provider builds summary counts only for SharePoint/Procore.

Target expansion:

- Projects source reader:
  - read `buildingConnectedUrl`
  - read `documentCrunchUrl`
- Registry source reader:
  - read `projectStage`
  - read `buildingConnectedUrl`
  - read `documentCrunchUrl`
- Provider output:
  - Projects-only item:
    - Projects stage
    - Projects BuildingConnected link
    - Projects Document Crunch link
  - Merged item:
    - stage = Projects stage, falling back to Registry stage only if Projects stage absent
    - external platform links = Projects values only
  - Legacy-only item:
    - Registry stage
    - Registry BuildingConnected link
    - Registry Document Crunch link

---

## 5. Frontend card and launch menu

Current files include:

```text
apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx
apps/my-dashboard/src/modules/myProjects/ProjectPortfolioTile.tsx
apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.tsx
apps/my-dashboard/src/modules/myProjects/ProjectPortfolioBrowser.tsx
```

Current UI posture:

- My Projects is a tile/grid portfolio experience.
- Each tile opens a launch menu.
- Launch menu currently contains:
  - SharePoint
  - Procore
- Masthead support copy currently refers to:
  - “Open assigned projects in SharePoint or Procore.”
- Card currently renders unavailable assistive hints only for:
  - SharePoint
  - Procore

Target expansion:

- Launch menu order:
  1. SharePoint
  2. Procore
  3. BuildingConnected
  4. Document Crunch
- Masthead copy:
  - update to multi-platform copy
- Assistive hint:
  - replace multiple destination-specific hints with one scalable consolidated hint summarizing missing launch destinations

---

## 6. Provisioner and verifier

Current files:

```text
scripts/provision-my-projects-source-list-schema.ts
scripts/verify-my-project-role-fields.ts
backend/functions/src/services/projects-role-schema-readiness.ts
```

Current provisioner:

- Uses REST-based field metadata and creation.
- Reads the source-list descriptor.
- Plans creates/no-ops/blockers.
- Fails closed on wrong-type drift.

Current verifier:

- Has role-focused naming.
- Verifies:
  - Projects role-array fields
  - Registry role-array fields + `procoreProject`

Current readiness helper:

- Hard-codes required fields rather than deriving directly from the descriptor.
- Currently does not know about BuildingConnected, Document Crunch, or Registry stage.

Target expansion:

- Provisioner should naturally pick up new descriptor fields.
- Readiness verifier/helper must be expanded to include the new operational My Projects source-list fields.
- Naming may remain for compatibility, but output/docs must make clear it now verifies the full My Projects operational source schema, not just role arrays.

---

## 7. Fixtures and tests

Current fixtures and tests cover:

- SharePoint + Procore action availability
- projectStage in fixture rows
- launch menu behavior with two destinations
- provider diagnostics
- provider summary counts
- card/browser rendering

Target expansion:

- Model fixtures must include:
  - available/unavailable BuildingConnected cases
  - available/unavailable Document Crunch cases
  - Registry `projectStage` scenarios
- Provider tests must cover:
  - merged stage precedence
  - legacy-only stage
  - new action builders
  - summary counts
  - warning codes
- Frontend tests must cover:
  - four launch options
  - unavailable options rendering
  - menu keyboard/focus posture remains correct
  - updated copy and consolidated hint

---

## 8. Non-goals for this package

This package does not implement:

- The separate backfill-script hang remediation.
- A data-migration utility for populating BuildingConnected or Document Crunch links.
- A sync integration to automatically discover platform links.
- Any outbound writes to Autodesk or Document Crunch.

This package only establishes:

- source schema,
- read-model contracts,
- backend read behavior,
- UI behavior,
- validation/documentation.
