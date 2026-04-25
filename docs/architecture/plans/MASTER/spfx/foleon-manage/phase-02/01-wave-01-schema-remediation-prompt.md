---
generated_utc: 2026-04-25T08:26:30Z
package: HB Intel Foleon SPFx list provisioning remediation
repo: RMF112018/hb-intel
target_package_version_observed: 1.0.11.0
uploaded_sppkg_sha256_observed: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
source_audit_basis: Foleon list provisioning audit package generated from current repo/package inspection
---


# 01 — Wave 01 Prompt: Source Schema Remediation

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Fix the source-level SharePoint list provisioning defects in the HB Intel Foleon SPFx package, with a narrow focus on schema correctness and provisioning safety.

The highest-priority audit finding is that `HB_FoleonContentRegistry` appears over-indexed for Feature Framework provisioning and may be causing SharePoint to create a list shell that later fails to load.

## Files to Inspect

```text
apps/hb-intel-foleon/sharepoint/assets/elements.xml
apps/hb-intel-foleon/sharepoint/assets/schema-content-registry.xml
apps/hb-intel-foleon/sharepoint/assets/schema-homepage-placements.xml
apps/hb-intel-foleon/sharepoint/assets/schema-interaction-events.xml
apps/hb-intel-foleon/sharepoint/assets/schema-sync-runs.xml
apps/hb-intel-foleon/src/schema/foleonListSchemas.ts
docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-content-registry.md
docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-homepage-placements.md
docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-interaction-events.md
docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-sync-runs.md
```

Do not re-read files that remain in context unless verifying a line, contradiction, or diff.

## Required Web Research

Before editing, verify current Microsoft guidance for:

- SharePoint Online indexed field limits and list threshold behavior.
- Field XML attributes for indexing.
- Field XML attributes or supported APIs for unique-value enforcement.
- Lookup field provisioning rules.
- `ListInstance` and `CustomSchema` in SPFx Feature Framework provisioning.
- Feature activation behavior after partial failures.

Document the references in the remediation note.

## Implementation Tasks

### Task 1 — Reduce `HB_FoleonContentRegistry` launch-time indexes

In:

```text
apps/hb-intel-foleon/sharepoint/assets/schema-content-registry.xml
```

Reduce `Indexed="TRUE"` to only fields that are required for immediate runtime filtering/sorting.

Default launch-safe indexed fields:

```text
FoleonDocId
PublishStatus
IsVisible
IsHomepageEligible
PublishedOn
DisplayFrom
DisplayThrough
SortRank
AllowEmbed
SyncSource
```

Fields that should not remain indexed at Feature Framework provisioning time unless hard evidence proves immediate need:

```text
FoleonDocUid
FoleonIdentifier
FoleonProjectName
MarketingOwner
IssueDate
FirstPublishedOn
FoleonModifiedOn
RelatedProjectNumber
RelatedProjectName
Region
Sector
OpenMode
RequiresExternalOpen
LastSynced
```

Fields that may remain indexed only if service code proves direct query use and index budget remains safe:

```text
FoleonProjectId
ContentTypeKey
IsFeatured
```

Prefer fewer launch-time indexes. Additional indexes can be created later through controlled provisioning.

### Task 2 — Align code-level schema metadata

Update:

```text
apps/hb-intel-foleon/src/schema/foleonListSchemas.ts
```

The schema metadata must not lie.

If a field is no longer indexed at Feature Framework provisioning time, update its metadata accordingly.

If the application needs to track both future recommended indexes and actual launch-time indexes, split the metadata model into explicit fields, such as:

```ts
indexedAtProvisioning: boolean;
recommendedIndex?: boolean;
```

Do not allow service-query validation to treat a recommended future index as an actual provisioned index.

### Task 3 — Update docs authority

Update all affected list-schema markdown docs under:

```text
docs/reference/sharepoint/list-schemas/hbcentral/lists/
```

Required doc changes:

- Separate "Launch Provisioned Indexed Columns" from "Recommended Future Indexed Columns".
- Note that Feature Framework launch provisioning intentionally avoids over-indexing.
- Note that post-provision indexes must be created through controlled provisioning and validated.

### Task 4 — De-risk `HB_FoleonHomepagePlacements.ContentLookup`

In:

```text
apps/hb-intel-foleon/sharepoint/assets/schema-homepage-placements.xml
```

Evaluate the safest path:

#### Preferred

- Remove `ContentLookup` from initial Feature Framework provisioning.
- Keep `ContentIdCache` as the runtime-critical relationship field.
- Add a documented post-provision step that adds `ContentLookup` after `HB_FoleonContentRegistry` is proven valid.

#### Acceptable short-term compromise

- Keep `ContentLookup`, but make it optional:

```xml
Required="FALSE"
```

- Confirm `List="Lists/HB_FoleonContentRegistry"` still exactly matches the target `ListInstance` URL.
- Add tests and runbook steps that validate the lookup after provisioning.

Do not leave `ContentLookup` as a required field during initial Feature Framework provisioning unless current Microsoft guidance and clean-site proof support it.

### Task 5 — Correct uniqueness posture

For unique-intent fields:

```text
HB_FoleonContentRegistry.FoleonDocId
HB_FoleonInteractionEvents.EventId
HB_FoleonSyncRuns.RunId
```

Do not assume `AllowDuplicateValues="FALSE"` is sufficient.

Verify current supported approach and implement one of these:

1. correct field XML attribute if supported,
2. controlled post-provision field update using PnP/REST/Graph,
3. backend/application-level uniqueness enforcement with tenant-proof notes.

Update tests/docs to reflect the chosen path.

### Task 6 — Avoid unrelated edits

Do not modify:

- Foleon routes,
- runtime auth,
- reader gate behavior,
- iframe policy,
- unrelated SPFx packages,
- Safety Records code,
- UI styling.

## Required Output

Produce a Wave 01 closure report with:

- files changed,
- schema fields whose indexed status changed,
- lookup decision and rationale,
- uniqueness decision and rationale,
- documentation references reviewed,
- validation commands run,
- remaining open risks.

## Validation Commands

Run at least:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
```

If tests fail because Wave 02 validation changes are not yet implemented, document the exact failure and continue only after updating tests in Wave 02.
