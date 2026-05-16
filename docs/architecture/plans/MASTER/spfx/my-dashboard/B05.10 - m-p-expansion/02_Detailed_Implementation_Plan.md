# Detailed Implementation Plan

## Objective

Implement the **My Projects Multi-Platform Launch Expansion** as a closed, end-to-end feature package spanning:

1. SharePoint source-list schema,
2. provisioning/readiness scripts,
3. shared read-model contracts,
4. backend source loading and reconciliation,
5. frontend launch-menu UX,
6. fixtures, tests, documentation, and validation.

---

# Phase 1 — Reconfirm current repo truth

Before editing, the agent must inspect current local source for the seams listed below and reconcile any drift relative to this package:

- source schema descriptor
- provisioner
- verifier/readiness helper
- Projects contract/mapper
- My Project Links model
- provider
- tile/menu/browser UI
- fixtures and tests

No edits should be made in Phase 1. The agent should output a brief execution plan identifying any repo drift that changes the file impact matrix.

---

# Phase 2 — Source-list schema descriptor expansion

## 2.1 Update descriptor

File:

```text
backend/functions/src/services/my-projects/my-projects-source-list-schema.ts
```

Add field definitions:

### Shared external launch fields

```ts
export const MY_PROJECTS_SOURCE_LIST_EXTERNAL_LINK_FIELDS = [
  {
    internalName: 'buildingConnectedUrl',
    displayName: 'Autodesk BuildingConnected Link',
    type: 'Text',
    required: false,
    indexed: false,
  },
  {
    internalName: 'documentCrunchUrl',
    displayName: 'Document Crunch Link',
    type: 'Text',
    required: false,
    indexed: false,
  },
] as const;
```

### Registry stage field

```ts
export const MY_PROJECTS_SOURCE_LIST_REGISTRY_STAGE_FIELDS = [
  {
    internalName: 'projectStage',
    displayName: 'Project Stage',
    type: 'Text',
    required: false,
    indexed: false,
  },
] as const;
```

## 2.2 Target composition

### Projects target

Must become:

- 14 role fields
- 2 external link fields

### Registry target

Must become:

- 14 role fields
- `procoreProject`
- 2 external link fields
- Registry `projectStage`

## 2.3 Preserve exact existing semantics

- Do not allow list creation.
- Do not alter role-field definitions.
- Do not change existing `procoreProject` field posture.

---

# Phase 3 — Provisioner and readiness expansion

## 3.1 Provisioner

File:

```text
scripts/provision-my-projects-source-list-schema.ts
```

Expected behavior after descriptor changes:

- Dry-run should plan:
  - Projects: missing external link fields when absent
  - Registry: missing external links and projectStage when absent
- Apply should create only missing fields.
- Wrong-type fields still fail closed.

Likely minimal code changes:
- no logic changes if descriptor-driven path is clean
- update tests and any report expectations

## 3.2 Readiness helper

File:

```text
backend/functions/src/services/projects-role-schema-readiness.ts
```

Despite the legacy file name, this helper should verify the broader **My Projects operational source-list schema**.

Update required field lists.

### Projects required fields

- existing 14 canonical role-array fields
- `buildingConnectedUrl`
- `documentCrunchUrl`

### Registry required fields

- existing 14 canonical role-array fields
- `procoreProject`
- `buildingConnectedUrl`
- `documentCrunchUrl`
- `projectStage`

## 3.3 Expected type mapping

Current helper maps:

- role-array fields => `Note`
- `procoreProject` => `Text`

Extend type resolution:

- `buildingConnectedUrl` => `Text`
- `documentCrunchUrl` => `Text`
- `projectStage` => `Text`

## 3.4 Verifier script

File:

```text
scripts/verify-my-project-role-fields.ts
```

The current CLI can remain named as-is for compatibility, but comments/docs/output should no longer imply it validates role fields only.

Update:

- top-of-file description
- any operator-facing language that narrows its purpose too much
- docs that interpret its report

Do not break:
- JSON output shape unless absolutely necessary
- exit-code semantics
- read-only posture

---

# Phase 4 — Projects list contract and mapper alignment

## 4.1 Add Projects fields to persistence contract

File:

```text
backend/functions/src/services/projects-list-contract.ts
```

Add optional or defaultable fields to `IProjectsListItem`:

```ts
buildingConnectedUrl?: string;
documentCrunchUrl?: string;
```

Add field-map entries:

```ts
buildingConnectedUrl: { spInternalName: 'buildingConnectedUrl', spType: 'Text', serialization: 'direct' },
documentCrunchUrl: { spInternalName: 'documentCrunchUrl', spType: 'Text', serialization: 'direct' },
```

Add to `OPTIONAL_EXTENSION_FIELDS`.

## 4.2 Mapper posture

File:

```text
backend/functions/src/services/projects-list-mapper.ts
```

Update read/write conversion only if the Projects domain model actually exposes these properties today. If no domain type exists for them yet and the only consumer is the My Projects provider, do **not** invent a larger `IProjectSetupRequest` scope without confirming repo need.

Required minimum:

- `resolveSpField('buildingConnectedUrl')` works.
- `resolveSpField('documentCrunchUrl')` works.

The provider should be able to select those fields through the centralized mapper rather than hardcoded internal names.

---

# Phase 5 — Shared read-model contract expansion

## 5.1 Warning codes

File:

```text
packages/models/src/myWork/MyProjectLinksReadModel.ts
```

Add warning codes:

```text
building-connected-launch-unavailable
building-connected-url-invalid
document-crunch-launch-unavailable
document-crunch-url-invalid
```

## 5.2 Item shape

Add:

```ts
buildingConnectedAction
documentCrunchAction
```

with the locked action shapes from `01_Locked_Product_And_Schema_Decisions.md`.

## 5.3 Summary shape

Preserve current summary fields. Add:

```text
buildingConnectedReadyCount
documentCrunchReadyCount
noBuildingConnectedLaunchCount
noDocumentCrunchLaunchCount
multiPlatformReadyCount
```

---

# Phase 6 — Backend provider expansion

File:

```text
backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts
```

## 6.1 Extend source row interfaces

### Projects row

Add:

```ts
buildingConnectedUrl?: string;
documentCrunchUrl?: string;
```

### Registry row

Add:

```ts
projectStage?: string;
buildingConnectedUrl?: string;
documentCrunchUrl?: string;
```

## 6.2 Extend select field lists

### Projects source select

Use mapper-backed fields:

```ts
resolveSpField('buildingConnectedUrl')
resolveSpField('documentCrunchUrl')
```

### Registry source select

Use literal Registry internal names:

```text
projectStage
buildingConnectedUrl
documentCrunchUrl
```

## 6.3 URL normalization and action builders

Implement action builders for BuildingConnected and Document Crunch.

Recommended helper structure:

```ts
function buildBuildingConnectedAction(rawUrl: string | undefined): {
  action: MyProjectLinkItem['buildingConnectedAction'];
  warnings: MyProjectLinkWarning[];
}

function buildDocumentCrunchAction(rawUrl: string | undefined): {
  action: MyProjectLinkItem['documentCrunchAction'];
  warnings: MyProjectLinkWarning[];
}
```

Validation rules:

- trim string
- empty => unavailable warning
- non-empty but not valid `http://` or `https://` => invalid + unavailable warnings
- valid URL => available action

## 6.4 Reconciliation rules

### Projects-only

Use Projects stage / Projects new links.

### Merged

- stage:
  - Projects stage
  - fallback to Registry stage only when Projects stage absent
- BuildingConnected:
  - Projects value only
- Document Crunch:
  - Projects value only

### Legacy-only

Use Registry stage / Registry new links.

## 6.5 Warning merging

Include new warning arrays in `mergeWarnings(...)` calls.

## 6.6 Summary counts

Update `buildSummary(...)` to compute the new ready/missing counts and `multiPlatformReadyCount`.

## 6.7 Availability ranking

Current provider-side sort ranking considers SharePoint and Procore readiness only. Do not silently redesign sort ranking unless implementation materially requires it. The frontend currently applies its own alphabetical display sort, so backend ranking has limited user-visible impact.

Recommended decision:
- preserve backend availability sort behavior unless tests prove it is consumed meaningfully elsewhere.

---

# Phase 7 — Fixtures and model tests

## 7.1 Fixtures

File:

```text
packages/models/src/myWork/fixtures/myProjectLinksReadModels.ts
```

Update fixture items to include:

- BuildingConnected available on at least one fully-ready project
- Document Crunch available on at least one fully-ready project
- mixed unavailable cases
- legacy-only row with external links
- merged row demonstrating project source precedence

Update fixture summaries with new counts.

## 7.2 Model contract tests

If there are model-level tests validating exact summary shape or warning codes, update them.

---

# Phase 8 — Frontend launch UX

## 8.1 Launch menu

File:

```text
apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu.tsx
```

Expand `MenuOptionView.key` from two keys to four keys:

```text
sharepoint
procore
building-connected
document-crunch
```

Build options in locked order.

Each new option must follow current anchor/disabled-button accessibility posture.

## 8.2 Updated invalid-state reason helpers

If invalid warning codes are introduced for the new platforms, add row-level helpers analogous to `rowHasProcoreInvalidWarning(...)`.

## 8.3 My Projects masthead copy

File:

```text
apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx
```

Update copy to:

```text
Open assigned projects across SharePoint, Procore, BuildingConnected, and Document Crunch.
```

## 8.4 Consolidated unavailable hint

Replace current SharePoint and Procore-specific hint rendering with a single function that derives the missing destinations across displayed/read items.

Example output:

```text
Some assigned projects do not currently have launch destinations for: SharePoint, BuildingConnected.
```

Only include destinations that are missing for one or more items.

## 8.5 Browser and tile reuse

`ProjectPortfolioBrowser` reuses `ProjectPortfolioTile`; no separate platform logic should be duplicated there.

---

# Phase 9 — Frontend and provider tests

## 9.1 Provider tests

File:

```text
backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.test.ts
```

Add coverage for:

- valid BuildingConnected URL action
- invalid BuildingConnected URL warning
- empty BuildingConnected unavailable posture
- valid Document Crunch URL action
- invalid Document Crunch URL warning
- empty Document Crunch unavailable posture
- summary counts
- multi-platform count
- merged stage Projects-first, Registry fallback only when Projects missing
- legacy-only Registry stage

## 9.2 Frontend card/menu tests

Files:

```text
apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx
apps/my-dashboard/src/modules/myProjects/ProjectLaunchMenu*.test.tsx
```

Update/add assertions for:

- four menu options in correct order
- available links render as anchors
- unavailable links render as disabled buttons
- new aria labels are meaningful
- masthead copy is updated
- consolidated assistive hint
- existing single-open-menu behavior remains
- Escape handling and keyboard behavior remain intact

## 9.3 Fixture tests

Update fixtures and any snapshot-style tests that assume two destinations.

---

# Phase 10 — Documentation updates

Update docs that describe:

- schema target additions
- readiness checks
- operator provisioning flow
- My Projects module behavior
- references to dual launch

At minimum audit:

```text
docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md
docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md
docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md
docs/how-to/administrator/provision-my-projects-source-list-schema.md
apps/my-dashboard/README.md
```

Do not rewrite unrelated docs.

---

# Phase 11 — Validation and live operator readiness

Final validation must include:

1. targeted unit/integration tests,
2. functions typecheck,
3. My Dashboard tests/typecheck where appropriate,
4. provisioner dry-run in a certificate-enabled operator shell,
5. verifier read-only run,
6. final closeout.

Do not run live `--apply` unless the operator explicitly authorizes it in-session.

The package runbook contains exact commands.

---

# Phase 12 — Commit and closeout

The agent should return:

- execution summary,
- exact files changed,
- tests run and results,
- any live verification not run due to operator-gated credential posture,
- recommended commit title and description.

Recommended commit theme:

```text
my-dashboard(my-projects): add multi-platform launch schema and read model
```
