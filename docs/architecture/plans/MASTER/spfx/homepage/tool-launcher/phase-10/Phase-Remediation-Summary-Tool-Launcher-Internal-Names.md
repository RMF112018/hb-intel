# Phase Remediation Summary — Tool Launcher Internal Names

## Objective
Narrow remediation of the Tool Launcher SharePoint list adapter/query seam so the live `Tool Launcher Contents` list is queried using the actual internal names from the updated SharePoint export, followed by a full clean rebuild of the `hb-webparts` package.

## Why this phase exists
The Tool Launcher package appeared stale in SharePoint, but the higher-confidence diagnosis is that the current bundle is loading and the live list query is failing due to field-name mismatch.

The updated SharePoint export shows that several fields were correctly re-typed, but many of the live internal names still do not match the semantic field names currently used in code.

## Required outcome
- query the list with the actual live internal names
- translate the REST payload back into the semantic raw Tool Launcher contract
- preserve the existing Tool Launcher normalization and presentation model
- rebuild `hb-webparts.sppkg` from a clean state
- replace the existing package artifact

## Live internal-name mapping to implement
- `Title` -> `Title`
- `PlatformKey` -> `field_1`
- `LaunchURL` -> `field_2`
- `OfficialLogoAssetReference` -> `field_3`
- `DarkLogoAssetReference` -> `field_4`
- `PreferredLogoType` -> `field_5`
- `ShortDescriptor` -> `field_6`
- `WorkflowShelf` -> `field_7`
- `Category` -> `field_8`
- `Featured` -> `Featured`
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
- `IsActive` -> `IsActive`
- `OpenInNewTab` -> `OpenInNewTab`
- `FavoriteEligible` -> `FavoriteEligible`
- `StatusBadgeTone` -> `field_26`
- `VendorProductFamily` -> `field_27`
- `TenantEnvironmentLabel` -> `field_28`
- `RequiresReview` -> `RequiresReview`
- `LastReviewedOn` -> `field_30`
- `Notes` -> `field_31`
- `HelpLink` -> `HelpLink`
- `SupportOwnerReference` -> `SupportOwnerReference`
- `AccessRequestDestination` -> `AccessRequestDestination`

## Standards
- keep the fix narrow
- keep semantic domain contracts intact
- keep normalization centralized
- use repo-truth packaging flow
- perform a clean build, not an incremental artifact reuse

## Completion proof expected from the agent
- files changed
- summary of the translation seam from live internal names back to semantic keys
- exact clean-build command
- final package path
- confirmation that the previous `hb-webparts.sppkg` artifact was replaced
