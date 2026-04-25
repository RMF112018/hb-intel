---
generated_utc: 2026-04-25T08:22:25Z
scope: HB Intel Foleon SPFx list provisioning audit
package_under_review: hb-intel-foleon 1.0.11.0
uploaded_sppkg_sha256: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
web_research_status: Not performed; web search was unavailable in this ChatGPT session. Local agent must verify current Microsoft Learn guidance before implementation.
---


# 01 — Foleon List Provisioning Audit Report

## Executive Conclusion

The most likely root cause is **schema-level provisioning failure**, with the highest-probability defect being **over-indexing of the `HB_FoleonContentRegistry` list schema**.

The current package does include the expected Feature Framework assets and the four schema files. The uploaded `.sppkg` also contains the feature relationship entries and all schema XML files. That proves package inclusion only. It does **not** prove that SharePoint Online can successfully create usable modern lists from the schemas.

The current `schema-content-registry.xml` declares **27 custom indexed fields**. That exceeds the long-standing SharePoint list-index design threshold commonly treated as 20 indexed columns per list. When Feature Framework provisioning attempts to create many indexes during app install, SharePoint can create the list shell and then fail during field/index/view creation. That matches the tenant symptom: lists appear in Site Contents, but opening the list fails or the list is unusable.

Secondary contributing risks:

1. **Feature Framework is being used for complex, interdependent business-list provisioning.** It has weak observability, poor rollback behavior, and poor repair behavior after partial failure.
2. **`HB_FoleonHomepagePlacements` contains a required cross-list lookup** to `HB_FoleonContentRegistry`. The ordering is correct in `elements.xml`, but same-feature cross-list lookup provisioning remains a high-risk seam that must be proven on a clean site.
3. **The uniqueness configuration uses `AllowDuplicateValues="FALSE"` rather than an explicitly verified SharePoint Online unique-value field contract.** This may not enforce uniqueness reliably and should be validated or replaced with the current supported attribute/provisioning approach.
4. **Current tests and package proof are not deep enough.** They validate asset presence and string alignment, but do not validate SharePoint provisioning limits, byte-for-byte repo/package parity for each schema, REST-visible fields/views after installation, or clean-site usability.

## Audit Basis

### Inputs inspected

- `apps/hb-intel-foleon/config/package-solution.json`
- `apps/hb-intel-foleon/sharepoint/assets/elements.xml`
- `apps/hb-intel-foleon/sharepoint/assets/schema-content-registry.xml`
- `apps/hb-intel-foleon/sharepoint/assets/schema-homepage-placements.xml`
- `apps/hb-intel-foleon/sharepoint/assets/schema-interaction-events.xml`
- `apps/hb-intel-foleon/sharepoint/assets/schema-sync-runs.xml`
- `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`
- `apps/hb-intel-foleon/src/schema/__tests__/featureAssets.test.ts`
- `apps/hb-intel-foleon/scripts/prove-foleon-package.ts`
- uploaded `hb-intel-foleon(3).sppkg`
- uploaded target list-definition markdown files for:
  - `HB_FoleonContentRegistry`
  - `HB_FoleonHomepagePlacements`
  - `HB_FoleonInteractionEvents`
  - `HB_FoleonSyncRuns`

### What was proven

- `package-solution.json` declares one feature at version `1.0.11.0`.
- `skipFeatureDeployment` is `false`, meaning the app is site-installed and the Feature Framework should activate at the target site.
- The feature declares `elements.xml` as an element manifest.
- The feature declares all four schema XML files as element files.
- `elements.xml` declares four `ListInstance` records in this order:
  1. `HB_FoleonContentRegistry`
  2. `HB_FoleonHomepagePlacements`
  3. `HB_FoleonInteractionEvents`
  4. `HB_FoleonSyncRuns`
- `HB_FoleonHomepagePlacements` lookup ordering is intentionally after `HB_FoleonContentRegistry`.
- The uploaded `.sppkg` contains:
  - `feature_ae66c036-8036-4f10-bb63-0d75107e7ce9.xml`
  - `_rels/feature_ae66c036-8036-4f10-bb63-0d75107e7ce9.xml.rels`
  - `ae66c036-8036-4f10-bb63-0d75107e7ce9/elements.xml`
  - `schema-content-registry.xml`
  - `schema-homepage-placements.xml`
  - `schema-interaction-events.xml`
  - `schema-sync-runs.xml`
- The uploaded `.sppkg` SHA-256 is:

```text
3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
```

### What was not proven

- A clean SharePoint site can install the package and open all four lists.
- Existing corrupted tenant lists can be repaired in place.
- SharePoint Online accepts every current field/index/view definition.
- SharePoint Online resolves the cross-list lookup during the same feature activation.
- Current Microsoft Learn guidance was verified in-session. Web search was unavailable, so the local agent must verify the current Microsoft guidance before implementation.

## Findings

### FLP-001 — Critical — Content Registry schema is over-indexed

**Affected file**

- `apps/hb-intel-foleon/sharepoint/assets/schema-content-registry.xml`

**Affected list**

- `HB_FoleonContentRegistry`

**Evidence**

Static package/XML inspection shows:

```text
schema-content-registry.xml
fields: 39
custom indexed fields: 27
unique-ish fields: FoleonDocId
```

Indexed fields currently declared:

```text
FoleonDocId
FoleonDocUid
FoleonIdentifier
FoleonProjectId
FoleonProjectName
ContentTypeKey
PublishStatus
IsVisible
IsFeatured
IsHomepageEligible
MarketingOwner
IssueDate
FirstPublishedOn
PublishedOn
FoleonModifiedOn
DisplayFrom
DisplayThrough
SortRank
RelatedProjectNumber
RelatedProjectName
Region
Sector
OpenMode
AllowEmbed
RequiresExternalOpen
LastSynced
SyncSource
```

The target definition’s required indexed set is smaller:

```text
FoleonDocId
FoleonProjectId
ContentTypeKey
PublishStatus
IsVisible
IsFeatured
IsHomepageEligible
PublishedOn
DisplayFrom
DisplayThrough
SortRank
AllowEmbed
RequiresExternalOpen
SyncSource
```

**Why this can corrupt/break SharePoint list loading**

Feature Framework list provisioning is not transactional in a way that gives a clean rollback to the user. If SharePoint creates the list shell but fails during field/index/view creation, the list can remain visible in Site Contents while metadata, views, or field state are invalid or incomplete. This maps directly to the reported tenant symptom.

**Recommended fix**

- Reduce `Indexed="TRUE"` in `schema-content-registry.xml` to the minimum query-critical set.
- Prefer an even smaller launch-safe set:
  - `FoleonDocId`
  - `PublishStatus`
  - `IsVisible`
  - `IsHomepageEligible`
  - `PublishedOn`
  - `DisplayFrom`
  - `DisplayThrough`
  - `SortRank`
  - `AllowEmbed`
  - `SyncSource`
- Do not index descriptive/admin fields at initial feature provisioning:
  - `FoleonDocUid`
  - `FoleonIdentifier`
  - `FoleonProjectName`
  - `MarketingOwner`
  - `IssueDate`
  - `FirstPublishedOn`
  - `FoleonModifiedOn`
  - `RelatedProjectNumber`
  - `RelatedProjectName`
  - `Region`
  - `Sector`
  - `OpenMode`
  - `RequiresExternalOpen`
  - `LastSynced`
- If those indexes are later proven necessary, create them through controlled PnP/Graph/backend provisioning with per-index logging, validation, and rollback.

**Validation required**

- Clean-site install succeeds.
- `HB_FoleonContentRegistry` opens in modern SharePoint UI.
- REST metadata/fields/views calls succeed.
- Indexed column count is confirmed through REST/PnP.
- The Foleon app can query all launch-critical paths without list threshold errors.

---

### FLP-002 — High — Same-feature cross-list lookup is a risky provisioning seam

**Affected file**

- `apps/hb-intel-foleon/sharepoint/assets/schema-homepage-placements.xml`
- `apps/hb-intel-foleon/sharepoint/assets/elements.xml`

**Affected list**

- `HB_FoleonHomepagePlacements`

**Evidence**

`ContentLookup` is defined as:

```xml
<Field
  Name="ContentLookup"
  DisplayName="Content Lookup"
  Type="Lookup"
  List="Lists/HB_FoleonContentRegistry"
  ShowField="Title"
  Required="TRUE"
  Indexed="TRUE" />
```

`elements.xml` creates `HB_FoleonContentRegistry` before `HB_FoleonHomepagePlacements`, which is correct. However, the lookup still depends on SharePoint resolving the target list URL during the same feature activation.

**Why this can corrupt/break SharePoint list loading**

If the target list is only partially created, or if the lookup target cannot be resolved during feature activation, SharePoint can leave `HB_FoleonHomepagePlacements` partially provisioned. The list may appear in Site Contents while its field collection or view definition is broken.

**Recommended fix**

Preferred production-safe path:

1. Keep `ContentIdCache` as the runtime-critical field.
2. Remove `ContentLookup` from Feature Framework initial provisioning.
3. Add `ContentLookup` later through controlled PnP/Graph/backend provisioning after `HB_FoleonContentRegistry` is validated.
4. Make `ContentLookup` optional, not required, unless the controlled provisioning path proves reliable.

Acceptable short-term path if Feature Framework remains:

1. Keep `ContentLookup` optional.
2. Keep the list order as-is.
3. Add clean-site repro coverage that proves lookup resolution.
4. Validate the field’s `LookupList`, `LookupField`, and `Indexed` status via REST/PnP.

---

### FLP-003 — High — Feature Framework is the wrong long-term mechanism for complex Foleon business-list provisioning

**Affected files**

- `apps/hb-intel-foleon/config/package-solution.json`
- `apps/hb-intel-foleon/sharepoint/assets/*`
- future backend/manager provisioning seams

**Affected lists**

- All four Foleon lists

**Evidence**

The current provisioning mechanism runs when the app is added to a site. The app package provisions complex, governed business lists with:

- many indexed fields,
- unique-field intent,
- a cross-list lookup,
- required fields,
- multiple custom views,
- admin/manager workflows,
- future backend sync writers.

**Why this can corrupt/break SharePoint list loading**

Feature Framework is low-observability and weak for idempotent tenant operations. It does not give the same operational control as a dedicated provisioning runbook or backend route:

- no clean dry-run per target tenant/site,
- limited failure detail surfaced to the installer,
- no reliable partial-failure rollback,
- poor re-run behavior after tenant residue exists,
- no structured report of field/index/view creation.

**Recommended fix**

- Use SPFx Feature Framework only for the webpart package.
- Move list provisioning to a controlled path consistent with the Safety Records workflow:
  - backend provisioning route, or
  - PnP PowerShell/CLI runbook, or
  - local admin provisioning script with evidence output.
- The manager app should validate list readiness and present actionable remediation, not silently rely on app-install-time list creation.

Short-term compromise:

- Ship a reduced, launch-safe Feature Framework schema only if auto-provisioning remains required for demo purposes.
- Gate production rollout on controlled provisioning.

---

### FLP-004 — Medium — Unique-value intent is not proven by current XML

**Affected files**

- `schema-content-registry.xml`
- `schema-interaction-events.xml`
- `schema-sync-runs.xml`

**Affected fields**

- `FoleonDocId`
- `EventId`
- `RunId`

**Evidence**

The XML uses:

```xml
AllowDuplicateValues="FALSE"
```

on unique-intent fields.

**Why this can break expectations**

The code/test layer treats this as uniqueness proof, but the tenant must prove whether SharePoint Online created true unique constraints. If not, duplicate records can enter the lists and break reader/manager/sync behavior.

**Recommended fix**

- Verify current Microsoft-supported XML/property model for unique constraints.
- If supported in field XML, use the correct unique constraint attribute.
- Otherwise create uniqueness through controlled post-provisioning using PnP/REST/Graph-supported field update semantics.
- Add tenant validation that proves `EnforceUniqueValues` or equivalent is active.

---

### FLP-005 — Medium — Current package proof validates inclusion but not SharePoint usability

**Affected file**

- `apps/hb-intel-foleon/scripts/prove-foleon-package.ts`

**Evidence**

The proof script validates:

- package exists,
- expected product/solution/feature/component IDs exist,
- toolbox entries exist,
- expected schema filenames are present.

It does not validate:

- `elements.xml` to schema file references inside the packaged `.sppkg`,
- feature relationship targets for all schema files,
- byte-for-byte schema parity against repo truth,
- duplicate/stale schema files,
- package XML parse for each schema,
- indexed column limit,
- lookup target resolvability,
- SharePoint REST-visible field/view state after installation.

**Recommended fix**

Enhance `package:proof` to:

1. Unzip the `.sppkg`.
2. Parse `AppManifest.xml`.
3. Parse `feature_*.xml`.
4. Parse `_rels/feature_*.xml.rels`.
5. Parse packaged `elements.xml`.
6. Parse all schema XML files.
7. Confirm every `CustomSchema` points to an actual packaged schema file.
8. Confirm no schema file exists that is not referenced.
9. Confirm packaged XML bytes match repo source bytes.
10. Count indexed fields per schema and fail if over the configured threshold.
11. Validate lookup targets against list instance URLs.
12. Validate all views only reference known fields/built-ins.
13. Emit a JSON proof artifact.

---

### FLP-006 — Medium — Current static tests are regex/string tests, not schema-quality tests

**Affected file**

- `apps/hb-intel-foleon/src/schema/__tests__/featureAssets.test.ts`

**Evidence**

The tests confirm presence of expected strings and some view references, but they do not parse XML into a provisioning-quality model and do not fail on over-indexing.

**Recommended fix**

Add tests for:

- well-formed XML parse,
- unique field IDs across all lists,
- unique field names per list,
- indexed field count threshold,
- query-critical indexed fields present,
- non-critical fields not indexed at Feature Framework provisioning time,
- lookup target exists and is created earlier,
- `CustomSchema` paths resolve,
- view field references resolve,
- field type-specific required attributes,
- no unapproved field attributes without explicit allowlist.

---

### FLP-007 — Medium — Tenant residue from prior failed provisions must be treated as a separate failure mode

**Affected area**

- Tenant/site where the app was already installed

**Evidence**

Reported behavior: lists are created but fail to load. Feature Framework does not guarantee that reinstalling over a partial list will rebuild every field/view/index correctly.

**Why this matters**

Even after source XML is fixed, the existing tenant lists may remain corrupted. A clean package can still appear broken if installed against stale broken lists.

**Recommended fix**

- Test on a clean site first.
- Export/back up any existing Foleon list data before deleting anything.
- For test sites, delete corrupted lists, empty recycle bins if necessary, remove the site app, then reinstall.
- For production-like sites, document whether each list has data before deciding repair versus delete/reprovision.
- Capture list GUIDs and correlation IDs before cleanup.

## Root Cause Chain

Most likely chain:

1. App package `1.0.11.0` is added to a SharePoint site.
2. Site-installed Feature Framework activates the Foleon feature.
3. Feature Framework processes `elements.xml`.
4. SharePoint starts creating `HB_FoleonContentRegistry`.
5. The schema attempts to create 39 custom fields and 27 indexed custom fields.
6. SharePoint accepts enough of the list instance to show it in Site Contents.
7. SharePoint fails during field/index/view provisioning or leaves an internally inconsistent list state.
8. The user opens the list.
9. Modern list rendering or list metadata loading fails.
10. The Foleon app correctly reports that the integration is not fully configured because the expected list contracts are not usable.

This chain is probable, not tenant-proven. Tenant proof requires the validation runbook in `06-tenant-validation-runbook.md`.

## Direct Answers to Required Analysis Questions

| # | Question | Audit Answer |
|---|---|---|
| 1 | Are the list schema XML files valid SharePoint list schema definitions? | They are well-formed XML and structurally recognizable as SharePoint list schemas. They are not proven SharePoint Online-provisionable because `HB_FoleonContentRegistry` is over-indexed and the lookup/unique constraints require tenant validation. |
| 2 | Are all field definitions valid for Feature Framework provisioning? | Not proven. Most primitive fields are structurally plausible. The over-indexed field set and unique-value attributes are high risk. |
| 3 | Are field internal names/static/display names consistent? | Internal and display names are broadly consistent between XML and code-level schemas. Title is implicit as a built-in field and not explicitly declared in custom XML. |
| 4 | Are fields referenced in views before definition? | No obvious defect. View field references resolve to declared fields or accepted built-ins such as `LinkTitle`. |
| 5 | Are views referencing missing/invalid fields? | No missing field refs found in static analysis. Tenant REST must still validate rendered view definitions. |
| 6 | Are lookup fields pointing to lists that may not exist yet? | The lookup points to `Lists/HB_FoleonContentRegistry`, and the target list is declared first. Still high-risk because same-feature lookup resolution is not tenant-proven. |
| 7 | Are lookup fields missing required attributes? | `List` and `ShowField` exist. `RelationshipDeleteBehavior` is not present; it should be added or intentionally omitted only after current Microsoft guidance is verified. |
| 8 | Are choice/multi-choice/user/date/boolean/note/URL fields defined in a way that can corrupt rendering? | No obvious individual type corruption found, but excessive indexes across field types are a likely provisioning corruptor. |
| 9 | Are any field IDs duplicated? | No duplicate custom field IDs found across the four schema files. |
| 10 | Are content type/folder/base/template/FeatureId/Url settings invalid? | No clear invalidity found. TemplateType/FeatureId use Custom List template. |
| 11 | Is `elements.xml` correctly referencing schema files? | Yes at source and package-inclusion level. Runtime path resolution still requires clean-site proof. |
| 12 | Is `package-solution.json` correctly declaring Feature Framework assets? | Yes at source level. |
| 13 | Is the custom packaging script preserving XML exactly? | Uploaded package includes the files, but current proof should be enhanced to compare packaged bytes to repo bytes. |
| 14 | Are schemas compatible with SharePoint Online modern list rendering? | Not proven. Over-indexing makes Content Registry not launch-safe. |
| 15 | Are lists corrupted because of schema defects, provisioning order, lookup dependencies, view definitions, unsupported XML, upgrade drift, or tenant residue? | Most likely schema defect/over-indexing plus possible tenant residue. Lookup dependency remains a secondary risk. |
| 16 | Are existing corrupted tenant lists repairable? | Unknown. Test lists should be deleted/reprovisioned. Production lists require export/backup and metadata capture before repair. |
| 17 | Continue Feature Framework provisioning or move to PnP/Graph/backend? | Move long-term provisioning to controlled PnP/Graph/backend. Feature Framework is acceptable only for minimal demo-safe schemas after clean-site proof. |
| 18 | Safest remediation path? | Reduce risky schema, add hard validation, clean-site repro, then decide whether production rollout uses controlled provisioning instead of app-install provisioning. |

## Recommended Fix Path

### Immediate source remediation

1. Reduce `Indexed="TRUE"` in `schema-content-registry.xml` to launch-critical fields.
2. Make `ContentLookup` optional or move it to controlled post-provisioning.
3. Verify and correct unique-value attributes.
4. Add XML/schema validation tests.
5. Enhance `package:proof`.

### Immediate tenant remediation

1. Stop testing on the already-corrupted site until evidence is captured.
2. Capture target site URL, list GUIDs, list REST metadata, fields, views, browser console errors, network errors, and correlation IDs.
3. Reproduce on a clean test site.
4. Delete/reprovision corrupted test lists only after evidence capture.
5. Do not delete production lists without export/backup.

### Strategic production path

1. Remove complex list provisioning from app-install path.
2. Create a Foleon provisioning command modeled after Safety Records.
3. Manager surface validates readiness and provides repair actions.
4. App package contains webpart only; tenant provisioning is an explicit controlled operation.

## Tenant Evidence Still Required

- Target site URL.
- App catalog package version.
- Site-installed app version.
- Broken list URLs.
- Broken list GUIDs.
- Browser console errors.
- Network response from opening each list.
- SharePoint correlation IDs.
- REST metadata for each list.
- REST field response for each list.
- REST view response for each list.
- Confirmation whether all four lists fail or only one/two.
- Clean-site repro result.
- PnP/manual schema repro result.
