
# Prompt 01 — Shared SharePoint Schema Provisioning Utilities

## Objective

Refactor the existing SharePoint field provisioning logic into shared utilities that can be reused by both the existing legacy fallback provisioner and the new My Projects source-list schema provisioner.

## Why this issue exists now

`scripts/provision-legacy-fallback-lists.ts` contains useful field creation, type compatibility, update, and JSON reporting logic, but it is script-local and scoped to the legacy fallback descriptor set.

## Why it matters

The My Projects provisioning path needs the same safety model without duplicating field logic or expanding the legacy fallback script beyond its purpose.

## Current repo-truth condition

Inspect:

- `scripts/provision-legacy-fallback-lists.ts`
- `backend/functions/src/services/legacy-fallback/provisioning-compatibility.ts`
- `backend/functions/src/services/sharepoint-provisioning-service.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/sharepoint-common.ts`
- `backend/functions/src/services/managed-identity-token-service.ts`

## Required future state

Create shared provisioning utilities that support:

- field definitions compatible with existing `IFieldDefinition` semantics;
- field type compatibility checks based on SharePoint `TypeAsString`;
- missing-field create planning;
- wrong-type unresolved blocker planning;
- compatible settings update planning;
- optional apply behavior;
- JSON report models;
- no list recreation by default.

## Exact files / seams / symbols to inspect

- `IFieldDefinition`
- `IListDefinition`
- `createField(...)` in `scripts/provision-legacy-fallback-lists.ts`
- `applyFieldSettings(...)` in `scripts/provision-legacy-fallback-lists.ts`
- `isSharePointFieldTypeCompatible(...)`
- `getCompatibleSharePointFieldTypes(...)`
- `SharePointProvisioningService.addListField(...)`

## Research-informed technical considerations

- Microsoft Graph columnDefinition APIs support list column creation/update, but the repo already has SharePoint/PnP-style field creation semantics.
- PnPjs supports `addText` and `addMultilineText` on list field collections.
- Wrong-type conversion must not be automatic.
- If PnPjs runtime issues are encountered, direct SharePoint REST may be used behind the same utility interface.

## Required implementation scope

- Create a shared utility folder such as:
  ```text
  backend/functions/src/services/sharepoint-schema-provisioning/
  ```
- Move or reimplement shared field compatibility logic there.
- Provide pure planning functions that can be unit-tested without SharePoint I/O.
- Provide an apply adapter that operates against an authenticated PnP/list field collection.
- Update `scripts/provision-legacy-fallback-lists.ts` to consume the shared utilities without changing its functional behavior.

## Explicit non-scope

- Do not add My Projects descriptors in this prompt.
- Do not mutate tenant lists.
- Do not change runtime My Projects read-model logic.
- Do not remediate `FolderWebUrl` drift here.

## Required tests

- Compatibility helper tests for Text, Number, DateTime, Boolean, Choice, User, URL, Lookup, MultiLineText/Note.
- Plan builder tests for missing fields, live-verified fields, wrong-type fields, and compatible setting changes.
- Regression test proving the legacy fallback descriptor planning is unchanged except for shared utility usage.

## Validation commands

```bash
pnpm test -- backend/functions/src/services/sharepoint-schema-provisioning
pnpm test -- scripts/provision-legacy-fallback-lists
pnpm typecheck
```

## Proof-of-closure artifacts

- Test output.
- Diff showing shared utilities and legacy script integration.
- No tenant command output required.

## Completion standard

This prompt is complete when shared schema provisioning utilities exist, are unit-tested, and the legacy fallback provisioner still compiles and preserves its prior behavior.

> **Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

