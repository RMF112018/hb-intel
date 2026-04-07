# Prompt 01 — Tool Launcher Internal-Name Remediation

## Objective
Implement a **narrow remediation** for the Tool Launcher SharePoint list adapter/query so it uses the **actual live internal names** from the updated `Tool Launcher Contents` SharePoint export, while preserving the existing semantic domain model used by the rest of the Tool Launcher code.

## Primary Goal
Fix the Tool Launcher list request failure by updating the SharePoint field mapping used by the Tool Launcher list source.

This is **not** a UI task.
This is **not** a list redesign task.
This is **not** a broader homepage audit.

## Repo Truth Inputs
Use repo truth from the live repo. The primary files expected to matter are:
- `apps/hb-webparts/src/homepage/data/toolLauncherListSource.ts`
- `apps/hb-webparts/src/homepage/data/toolLauncherNormalization.ts`
- `apps/hb-webparts/src/homepage/webparts/toolLauncherContracts.ts`

Do not re-read files already in your current context unless needed to resolve uncertainty.

## Problem Statement
The current Tool Launcher list source is querying semantic field names such as:
- `PlatformKey`
- `LaunchURL`
- `OfficialLogoAssetReference`
- `WorkflowShelf`
- `Category`
- `FeaturedSortOrder`
- `SortOrder`
- `AudienceVisibility`
- `NoticeStatus`
- `StatusBadgeTone`
- `LastReviewedOn`

The live SharePoint list does **not** use those names for most fields. The updated SharePoint export confirms that many of those columns still have generic internal names such as `field_1`, `field_2`, etc. That mismatch is causing the live REST query to fail.

## Required Implementation
Update the Tool Launcher SharePoint adapter/query seam so the code continues to expose the same **semantic** field names to the rest of the app, but the **REST query** uses the real live internal names from the updated export.

### Required mapping
Use this mapping exactly unless repo truth proves a more precise equivalent is required.

#### No change
- `Title` -> `Title`
- `IsActive` -> `IsActive`
- `Featured` -> `Featured`
- `OpenInNewTab` -> `OpenInNewTab`
- `FavoriteEligible` -> `FavoriteEligible`
- `RequiresReview` -> `RequiresReview`
- `HelpLink` -> `HelpLink`
- `SupportOwnerReference` -> `SupportOwnerReference`
- `AccessRequestDestination` -> `AccessRequestDestination`

#### Replace semantic query names with live internal names
- `PlatformKey` -> `field_1`
- `LaunchURL` -> `field_2`
- `OfficialLogoAssetReference` -> `field_3`
- `DarkLogoAssetReference` -> `field_4`
- `PreferredLogoType` -> `field_5`
- `ShortDescriptor` -> `field_6`
- `WorkflowShelf` -> `field_7`
- `Category` -> `field_8`
- `FeaturedSortOrder` -> `field_10`
- `SortOrder` -> `field_11`
- `AudienceVisibility` -> `field_12`
- `AudienceRulesJSON` -> `field_13`
- `AliasesKeywords` -> `field_14`
- `SupportOwner` -> `field_16`
- `NoticeStatus` -> `field_19`
- `NoticeBadgeText` -> `field_20`
- `NoticeDetails` -> `field_21`
- `NoticeExpiresOn` -> `field_22`
- `StatusBadgeTone` -> `field_26`
- `VendorProductFamily` -> `field_27`
- `TenantEnvironmentLabel` -> `field_28`
- `LastReviewedOn` -> `field_30`
- `Notes` -> `field_31`

## Implementation Guidance
Use the narrowest correct implementation.

### Preferred approach
- Keep the existing semantic TypeScript/domain contract intact.
- Introduce or update a dedicated live SharePoint internal-name map in `toolLauncherListSource.ts`.
- Build the `$select` list from the live internal names.
- Preserve the semantic normalized output expected by the rest of the Tool Launcher stack.

### Important
The raw REST response object keys will now be live internal names for many fields. You must ensure the normalization seam still receives the expected semantic raw shape.

That means you should do one of the following:

#### Preferred option
Map the REST item payload into the semantic `RawToolLauncherListItem` shape before calling `normalizeToolLauncherItems(...)`.

Example pattern:
- fetch using live internal names
- transform each returned SharePoint item
- output semantic keys like `PlatformKey`, `LaunchURL`, `OfficialLogoAssetReference`, etc.
- then pass the transformed array into the existing normalization layer

#### Avoid
Do **not** push `field_1`, `field_2`, etc. down into the broader Tool Launcher domain model or presentation code unless repo truth absolutely forces it.

## Additional Requirements
- Keep the `IsActive eq 1` server-side filter if it remains valid against the current list schema.
- Preserve existing null handling and normalization behavior.
- Keep the implementation type-safe.
- Do not leave temporary console logging in shipped code.
- Do not change manifest IDs or webpart IDs.
- Do not modify UI composition or visual components.

## Acceptance Criteria
The implementation is complete only if all of the following are true:

1. The Tool Launcher list source no longer queries the outdated semantic field names directly in `$select`.
2. The live internal names from the updated export are used for the REST request.
3. The code still feeds the existing semantic `RawToolLauncherListItem` shape into normalization.
4. No unrelated homepage/webpart behavior is changed.
5. The resulting code is clean, narrow, and production-appropriate.

## Required Deliverables
Provide:
- a concise completion summary
- the exact files changed
- a brief explanation of how the SharePoint response is translated back into the semantic Tool Launcher raw contract
- any risks or follow-up items that remain
