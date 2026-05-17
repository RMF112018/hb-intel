# My Projects Custom Links Registry — Comprehensive Implementation Package

## Purpose

This package defines a complete, closed implementation path for adding **user-created project links** to:

> **My Dashboard → My Projects**

The feature allows an assigned user to add project-specific links such as:

- additional SharePoint sites,
- permitting sites,
- private provider portals,
- owner/client portals,
- other trusted project-specific resources.

The feature is designed as a **dedicated child-list registry**, not as JSON-array fields embedded in `Projects` or `Legacy Project Fallback Registry`.

## Locked product outcome

Each My Projects card/tile gains a collapsed:

```text
More Project Resources
```

button/menu. When expanded, it presents custom user-added resources for that project and an:

```text
Add project link
```

action.

The add-link modal must include helper text communicating that this is the appropriate place to add links to resources such as additional SharePoint sites, permitting sites, private provider portals, and similar project-specific destinations.

## Closed architecture

### Storage
Create a dedicated SharePoint list:

```text
My Projects Custom Links
```

Each list item represents exactly one custom link attached to one project context.

### Visibility
Each custom link has one of two visibility modes:

- `private`
  - visible only to the creator
- `project`
  - visible to any user whose My Projects read model includes that project

### Permissions and write path
The frontend must not write to SharePoint directly. All create/update/delete operations go through authenticated backend command endpoints.

### Read path
The existing `MyProjectLinksReadModel` is extended with an additive custom-links collection on each item. The existing fixed system destinations remain unchanged:

- SharePoint
- Procore
- BuildingConnected
- Document Crunch

### UI placement
Custom links do **not** join the system launch action row. They appear under the collapsed:

```text
More Project Resources
```

menu/disclosure on each project card/tile.

## Current repo truths used by this package

The package is designed around current repo seams already in place:

- `MyProjectLinkItem` already carries fixed system actions and project provenance IDs.
- The My Projects provider already reconciles Projects and Registry rows, producing `projects-only`, `merged`, and `legacy-only` records.
- The UI currently renders portfolio tiles and a launch-action surface using:
  - `MyProjectsHomeCard`
  - `ProjectPortfolioTile`
  - `ProjectLaunchActions`
- The backend Graph list client already supports:
  - list reads with filters,
  - item creation,
  - item updates,
  making it suitable for custom-link reads/writes and soft deletes.

## Package structure

```text
README.md
00_Current_Repo_Truth_Baseline.md
01_Closed_Product_Architecture_And_Decisions.md
02_SharePoint_Custom_Links_List_Schema.md
03_Command_And_Read_Model_Contracts.md
04_Backend_Provider_Command_And_Entitlement_Design.md
05_UI_UX_Target_State.md
06_Detailed_Implementation_Plan.md
07_File_Impact_Matrix.md
08_Validation_Operator_Runbook.md
09_Acceptance_Criteria.md
PACKAGE_MANIFEST.md

prompts/
  Prompt_00_Repo_Truth_And_Drift_Lock.md
  Prompt_01_Custom_Links_List_Descriptor_Provisioning_And_Readiness.md
  Prompt_02_Shared_Models_And_Command_Contracts.md
  Prompt_03_Backend_Custom_Link_Repository_Entitlement_And_Command_Routes.md
  Prompt_04_Read_Model_Join_And_Custom_Links_Provider_Integration.md
  Prompt_05_Frontend_Client_Command_Wiring_And_Modal_Form_State.md
  Prompt_06_More_Project_Resources_Disclosure_And_Tile_UI_Integration.md
  Prompt_07_Fixtures_Tests_Docs_Validation_And_Commit_Closeout.md

supporting/
  Custom_Links_Field_Contract.md
  Route_Contract_Table.md
  UI_Copy_And_State_Matrix.md
  Test_Matrix.md
  Security_And_Validation_Rules.md
  Git_Commit_Guidance.md
  Agent_Context_Seed.md

resources/
  example_create_request.json
  example_update_request.json
  example_read_model_fragment.json
```

## Execution order

Run the prompt series in order. Each prompt is intended to be executed in a fresh or clean local-agent context, with explicit closeout expectations.

1. Prompt 00 — Repo-truth audit and drift lock
2. Prompt 01 — Custom-link list descriptor, provisioner, verifier, docs
3. Prompt 02 — Shared models and command contracts
4. Prompt 03 — Backend repository, entitlement, command routes
5. Prompt 04 — Read-model join into My Projects
6. Prompt 05 — Frontend client command wiring and modal form state
7. Prompt 06 — `More Project Resources` UI integration
8. Prompt 07 — Fixtures, tests, docs, validation, commit closeout

## Non-negotiables

- No direct frontend SharePoint list mutation.
- No JSON array fields added to the existing project source lists for this feature.
- No unguarded write endpoint that trusts arbitrary client-supplied project IDs.
- No shared link may be visible to users who are not already entitled to the project through My Projects.
- Creator-only edits/deletes.
- Soft delete only in v1.
- Custom links are separate from system launch actions.
- The collapsed menu label is exactly:
  - `More Project Resources`
- The add-link CTA is exactly:
  - `Add project link`

## Expected end state

At close:

- A new SharePoint list can be provisioned and verified.
- Users can create, update, and remove their own custom project links.
- Private links are visible only to their creator.
- Project-visible links appear for all current My Projects viewers of that project.
- Custom links are returned in the My Projects read model.
- The UI presents them under `More Project Resources`.
- The creation modal contains helper text explaining appropriate link use cases.
