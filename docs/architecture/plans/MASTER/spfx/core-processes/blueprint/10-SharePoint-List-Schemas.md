# SharePoint List Schemas

## Schema conventions

The tables below use the following conventions:

- **Display Name** = what users/admins see
- **Internal Name** = recommended immutable SharePoint internal name
- **Type** = recommended SharePoint column type
- **Req.** = required field
- **Idx.** = index recommended
- **Notes** = purpose and behavior

Recommended column types are based on SharePoint list/library column capabilities and on a large-list-safe design posture. SharePoint supports the standard list column types discussed in Microsoft’s list column documentation, and content types can be used to enforce shared metadata structures. citeturn682466search6turn682466search3turn829367search4

---

## List: `HBCP_Settings`

Purpose:
Global settings and controlled dictionaries stored as list-backed JSON/config records.

| Display Name | Internal Name | Type | Req. | Idx. | Notes |
|---|---|---:|:---:|:---:|---|
| Title | Title | Single line of text | Y | Y | Human-readable record title |
| Setting Key | CPSettingKey | Single line of text | Y | Y | Immutable unique key |
| Setting Group | CPSettingGroup | Choice | Y | Y | App / Taxonomy / Search / Freshness / UI / Security |
| Setting Value JSON | CPSettingValueJson | Multiple lines of text (plain) | Y | N | JSON payload used by app |
| Version Label | CPVersionLabel | Single line of text | N | N | Optional semantic/config version |
| Is Active | CPIsActive | Yes/No | Y | Y | Enables soft-switching settings |
| Notes | CPNotes | Multiple lines of text (plain) | N | N | Admin-only notes |

Suggested starting records:
- RoleDefinitions
- LifecycleStageDefinitions
- SupportingDomainDefinitions
- SourceItemTypeDefinitions
- FreshnessThresholds
- SearchSynonymRules
- PreviewRoutingRules
- TrustMarkerRules

---

## List: `HBCP_Packages`

Purpose:
Core list for corridor packages, child packages, and first-class supporting packages.

Recommended content types:
- Corridor Package
- Child Package
- Supporting Package

| Display Name | Internal Name | Type | Req. | Idx. | Notes |
|---|---|---:|:---:|:---:|---|
| Title | Title | Single line of text | Y | Y | Public/admin package title |
| Package Key | CPPackageKey | Single line of text | Y | Y | Immutable unique app key |
| Slug | CPSlug | Single line of text | Y | Y | URL-safe route segment |
| Package Type | CPPackageType | Choice | Y | Y | Corridor / Child / Supporting |
| Parent Package Key | CPParentPackageKey | Single line of text | N | Y | Text key to avoid heavy lookup dependency |
| Display Order | CPDisplayOrder | Number | N | Y | Sorting in shell and companion |
| Operating Corridor | CPOperatingCorridor | Choice | Y | Y | A / B / C / D / Safety / Legal / Accounting / QC |
| Primary Lifecycle Stage | CPPrimaryLifecycleStage | Choice | Y | Y | Main lifecycle home |
| Secondary Lifecycle JSON | CPSecondaryLifecycleJson | Multiple lines of text (plain) | N | N | Additional stage associations |
| Allowed Roles JSON | CPAllowedRolesJson | Multiple lines of text (plain) | Y | N | PM / Superintendent / PX etc. |
| Primary Role Emphasis | CPPrimaryRoleEmphasis | Choice | N | Y | Default role emphasis for browse/search |
| Supporting Domains JSON | CPSupportingDomainsJson | Multiple lines of text (plain) | N | N | Safety / Legal / Accounting / QC, etc. |
| Public State | CPPublicState | Choice | Y | Y | Draft / Review / Published / Superseded / Archived |
| Discoverability Mode | CPDiscoverabilityMode | Choice | Y | Y | NestedOnly / SearchPromoted / RolePromoted / Full |
| Publish Dependency Mode | CPPublishDependencyMode | Choice | Y | Y | Independent / ParentLocked |
| Is Promoted Standard | CPIsPromotedStandard | Yes/No | Y | Y | Promoted child package / key standard |
| Purpose | CPPurpose | Multiple lines of text (plain) | Y | N | Required public spine |
| Trigger / When to Use | CPTriggerWhenToUse | Multiple lines of text (plain) | Y | N | Required public spine |
| Roles Involved Summary | CPRolesInvolvedSummary | Multiple lines of text (plain) | Y | N | Required public spine |
| Key Handoffs Summary | CPKeyHandoffsSummary | Multiple lines of text (plain) | Y | N | Required public spine |
| Required Artifacts Summary | CPRequiredArtifactsSummary | Multiple lines of text (plain) | Y | N | Required public spine |
| Start Here Steps | CPStartHereSteps | Multiple lines of text (plain) | Y | N | Required public spine |
| Common Misses / Escalations | CPCommonMissesEscalations | Multiple lines of text (plain) | Y | N | Required public spine |
| PM Overlay | CPPMOverlay | Multiple lines of text (plain) | N | N | Optional module |
| Superintendent Overlay | CPSuperintendentOverlay | Multiple lines of text (plain) | N | N | Optional module |
| PX Overlay | CPPXOverlay | Multiple lines of text (plain) | N | N | Optional module |
| Adjacent References Summary | CPAdjacentReferencesSummary | Multiple lines of text (plain) | N | N | Optional module |
| Search Keywords JSON | CPSearchKeywordsJson | Multiple lines of text (plain) | N | N | Search synonyms/keywords |
| Search Boost | CPSearchBoost | Number | N | Y | Manual ranking support |
| Effective Date | CPEffectiveDate | Date and Time | N | Y | Public trust marker |
| Last Reviewed Date | CPLastReviewedDate | Date and Time | N | Y | Public trust marker |
| Next Review Date | CPNextReviewDate | Date and Time | N | Y | Governance planning |
| Freshness State | CPFreshnessState | Choice | Y | Y | Current / ReviewNeeded / Warning / Override |
| Freshness Override Active | CPFreshnessOverrideActive | Yes/No | Y | Y | Controlled override flag |
| Freshness Override Reason | CPFreshnessOverrideReason | Multiple lines of text (plain) | N | N | Companion-only note |
| Primary Advisory Owner | CPPrimaryAdvisoryOwner | Person or Group (single) | N | Y | Public display and governance |
| Primary Advisory Owner UPN | CPPrimaryAdvisoryOwnerUPN | Single line of text | N | Y | Stable text key for app logic |
| Secondary Stakeholders JSON | CPSecondaryStakeholdersJson | Multiple lines of text (plain) | N | N | Additional consulted parties |
| Source Count | CPSourceCount | Number | N | Y | Denormalized count for admin/reporting |
| Required Source Count | CPRequiredSourceCount | Number | N | Y | Denormalized count |
| Feedback Count | CPFeedbackCount | Number | N | Y | Denormalized count |
| Is Active | CPIsActive | Yes/No | Y | Y | Soft hide/retire control |
| Dormant Project Eligible | CPProjectContextEligible | Yes/No | Y | Y | Future seam only |
| Project Type Applicability JSON | CPProjectTypeApplicabilityJson | Multiple lines of text (plain) | N | N | Dormant seam |
| Project Phase Hints JSON | CPProjectPhaseHintsJson | Multiple lines of text (plain) | N | N | Dormant seam |
| Requires Project Binding | CPRequiresProjectBinding | Yes/No | Y | Y | False in MVP |
| Admin Notes | CPAdminNotes | Multiple lines of text (plain) | N | N | Companion-only note |

---

## List: `HBCP_SourceItems`

Purpose:
Governed references to source files in the HB Procedures Manual library (and future approved source locations).

Recommended content types:
- Canonical Source Item
- Derivative Source Item
- Reference-Only Source Item

| Display Name | Internal Name | Type | Req. | Idx. | Notes |
|---|---|---:|:---:|:---:|---|
| Title | Title | Single line of text | Y | Y | Source title |
| Source Key | CPSourceKey | Single line of text | Y | Y | Immutable unique app key |
| Source Item Type | CPSourceItemType | Choice | Y | Y | SOP / checklist / template / log / example / legal / training / reference |
| Source System | CPSourceSystem | Choice | Y | Y | SharePointLibrary / OtherApprovedSource |
| Source Site URL | CPSourceSiteUrl | Hyperlink or Picture | Y | N | Source site/library site |
| Source Library Name | CPSourceLibraryName | Single line of text | N | Y | Human-readable library |
| Source List GUID | CPSourceListGuid | Single line of text | N | Y | For reliable linking |
| Source Item ID | CPSourceItemId | Number | N | Y | SharePoint item ID |
| Source Unique ID | CPSourceUniqueId | Single line of text | N | Y | Preferred stable file/item ID |
| Source Server Relative URL | CPSourceServerRelativeUrl | Single line of text | Y | Y | Reliable native file path |
| Source Absolute URL | CPSourceAbsoluteUrl | Hyperlink or Picture | Y | N | Direct open target |
| File Name | CPFileName | Single line of text | Y | Y | Display/useful search facet |
| File Extension | CPFileExtension | Single line of text | Y | Y | PDF / DOCX / XLSX / etc. |
| Canonical Mode | CPCanonicalMode | Choice | Y | Y | Canonical / Derivative / ReferenceOnly |
| Canonical Source Key | CPCanonicalSourceKey | Single line of text | N | Y | Points to canonical source when derivative |
| Derivative Reason | CPDerivativeReason | Multiple lines of text (plain) | N | N | Why derivative exists |
| Primary Package Key | CPPrimaryPackageKey | Single line of text | N | Y | Main package association |
| Additional Package Keys JSON | CPAdditionalPackageKeysJson | Multiple lines of text (plain) | N | N | Extra package associations |
| Role Relevance JSON | CPRoleRelevanceJson | Multiple lines of text (plain) | N | N | PM / Superintendent / PX emphasis |
| Lifecycle Relevance JSON | CPLifecycleRelevanceJson | Multiple lines of text (plain) | N | N | Stage relevance |
| Supporting Domains JSON | CPSupportingDomainsJson | Multiple lines of text (plain) | N | N | Safety / Legal / etc. |
| Preview Mode | CPPreviewMode | Choice | Y | Y | InAppPreview / NativeOpen / Hybrid / DownloadOnly |
| Effective Date | CPEffectiveDate | Date and Time | N | Y | Trust marker |
| Last Reviewed Date | CPLastReviewedDate | Date and Time | N | Y | Trust marker |
| Next Review Date | CPNextReviewDate | Date and Time | N | Y | Governance planning |
| Freshness State | CPFreshnessState | Choice | Y | Y | Current / ReviewNeeded / Warning / Override |
| Freshness Override Active | CPFreshnessOverrideActive | Yes/No | Y | Y | Controlled override |
| Freshness Override Reason | CPFreshnessOverrideReason | Multiple lines of text (plain) | N | N | Companion note |
| Is Active | CPIsActive | Yes/No | Y | Y | Controls public availability |
| Search Keywords JSON | CPSearchKeywordsJson | Multiple lines of text (plain) | N | N | Search support |
| Admin Notes | CPAdminNotes | Multiple lines of text (plain) | N | N | Companion-only note |

---

## List: `HBCP_PackageSourceLinks`

Purpose:
Relationship list between packages and source items with ordering and display metadata.

| Display Name | Internal Name | Type | Req. | Idx. | Notes |
|---|---|---:|:---:|:---:|---|
| Title | Title | Single line of text | Y | Y | Human-readable relationship title |
| Link Key | CPLinkKey | Single line of text | Y | Y | Immutable unique key |
| Package Key | CPPackageKey | Single line of text | Y | Y | Package relationship anchor |
| Source Key | CPSourceKey | Single line of text | Y | Y | Source relationship anchor |
| Link Type | CPLinkType | Choice | Y | Y | Primary / RequiredArtifact / Template / Checklist / Example / Supporting / Adjacent |
| Display Order | CPDisplayOrder | Number | N | Y | Sort order inside package |
| Is Required | CPIsRequired | Yes/No | Y | Y | Indicates required source |
| Role Visibility JSON | CPRoleVisibilityJson | Multiple lines of text (plain) | N | N | Optional role-specific visibility |
| Lifecycle Visibility JSON | CPLifecycleVisibilityJson | Multiple lines of text (plain) | N | N | Optional stage-specific visibility |
| Child-Only Flag | CPChildOnlyFlag | Yes/No | Y | Y | Only show in child package context |
| Is Active | CPIsActive | Yes/No | Y | Y | Soft disable |
| Notes | CPNotes | Multiple lines of text (plain) | N | N | Companion-only note |

---

## List: `HBCP_PackageRelations`

Purpose:
Relationship list between packages.

| Display Name | Internal Name | Type | Req. | Idx. | Notes |
|---|---|---:|:---:|:---:|---|
| Title | Title | Single line of text | Y | Y | Human-readable relation title |
| Relation Key | CPRelationKey | Single line of text | Y | Y | Immutable unique key |
| From Package Key | CPFromPackageKey | Single line of text | Y | Y | Origin package |
| To Package Key | CPToPackageKey | Single line of text | Y | Y | Target package |
| Relation Type | CPRelationType | Choice | Y | Y | ParentChild / Adjacent / SupportingDependency / RecommendedNext / RecommendedPrevious |
| Display Order | CPDisplayOrder | Number | N | Y | Order in sequence or grouping |
| Is Promoted Path Relation | CPIsPromotedPathRelation | Yes/No | Y | Y | Helps operating path view |
| Is Active | CPIsActive | Yes/No | Y | Y | Soft disable |
| Notes | CPNotes | Multiple lines of text (plain) | N | N | Companion note |

---

## List: `HBCP_Feedback`

Purpose:
Structured public feedback intake with central triage.

Recommended content types:
- Package Feedback
- Child Package Feedback

| Display Name | Internal Name | Type | Req. | Idx. | Notes |
|---|---|---:|:---:|:---:|---|
| Title | Title | Single line of text | Y | Y | Short feedback subject |
| Feedback Key | CPFeedbackKey | Single line of text | Y | Y | Immutable unique key |
| Package Key | CPPackageKey | Single line of text | Y | Y | Main package target |
| Child Package Key | CPChildPackageKey | Single line of text | N | Y | Optional child target |
| Submitted By | CPSubmittedBy | Person or Group (single) | Y | Y | Submitter |
| Submitted By UPN | CPSubmittedByUPN | Single line of text | Y | Y | Stable key |
| Role Context | CPRoleContext | Choice | Y | Y | PM / Superintendent / PX / Other |
| Lifecycle Stage Context | CPLifecycleStageContext | Choice | N | Y | Optional context |
| Issue Type | CPIssueType | Choice | Y | Y | Clarity / MissingContent / BrokenLink / Stale / WrongMapping / Search / Trust / Other |
| Urgency | CPUrgency | Choice | Y | Y | Low / Normal / High |
| Feedback Text | CPFeedbackText | Multiple lines of text (plain) | Y | N | Main message |
| Supporting Link | CPSupportingLink | Hyperlink or Picture | N | N | Optional evidence |
| Status | CPStatus | Choice | Y | Y | New / Triage / InReview / Planned / Closed / Dismissed |
| Assigned Admin | CPAssignedAdmin | Person or Group (single) | N | Y | Central owner |
| Admin Disposition | CPAdminDisposition | Multiple lines of text (plain) | N | N | Internal handling notes |
| Resolution Summary | CPResolutionSummary | Multiple lines of text (plain) | N | N | Closure note |
| Closed Date | CPClosedDate | Date and Time | N | Y | Closure reporting |
| Is Duplicate | CPIsDuplicate | Yes/No | Y | Y | De-dup support |
| Duplicate Of Key | CPDuplicateOfKey | Single line of text | N | Y | Related feedback key |

List attachments:
- enable attachments if you want lightweight file evidence without another custom list

---

## List: `HBCP_GovernanceLog`

Purpose:
Event history for governance actions and overrides.

| Display Name | Internal Name | Type | Req. | Idx. | Notes |
|---|---|---:|:---:|:---:|---|
| Title | Title | Single line of text | Y | Y | Event title |
| Event Key | CPEventKey | Single line of text | Y | Y | Immutable unique key |
| Object Type | CPObjectType | Choice | Y | Y | Package / SourceItem / Link / Feedback / Override |
| Object Key | CPObjectKey | Single line of text | Y | Y | Related record key |
| Related Package Key | CPRelatedPackageKey | Single line of text | N | Y | For package-scoped history views |
| Event Type | CPEventType | Choice | Y | Y | Created / Updated / SubmittedForReview / Published / Superseded / Archived / OverrideApplied / OverrideRemoved / FeedbackClosed |
| From State | CPFromState | Single line of text | N | Y | Old state |
| To State | CPToState | Single line of text | N | Y | New state |
| Performed By | CPPerformedBy | Person or Group (single) | Y | Y | Actor |
| Performed By UPN | CPPerformedByUPN | Single line of text | Y | Y | Stable key |
| Event Date | CPEventDate | Date and Time | Y | Y | Event timestamp |
| Reason | CPReason | Multiple lines of text (plain) | N | N | Human explanation |
| Payload JSON | CPPayloadJson | Multiple lines of text (plain) | N | N | Structured change payload if needed |

---

## List: `HBCP_AudienceOverrides`

Purpose:
Central role-targeting overrides for hybrid role selection behavior.

| Display Name | Internal Name | Type | Req. | Idx. | Notes |
|---|---|---:|:---:|:---:|---|
| Title | Title | Single line of text | Y | Y | Display label |
| Override Key | CPOverrideKey | Single line of text | Y | Y | Immutable unique key |
| Principal Type | CPPrincipalType | Choice | Y | Y | User / SecurityGroup / M365Group |
| Principal Identifier | CPPrincipalIdentifier | Single line of text | Y | Y | UPN or Entra Object ID |
| Principal Display Name | CPPrincipalDisplayName | Single line of text | N | Y | Friendly label |
| Default Role | CPDefaultRole | Choice | N | Y | PM / Superintendent / PX |
| Allowed Roles JSON | CPAllowedRolesJson | Multiple lines of text (plain) | N | N | Role set available to user/group |
| Force Default Role | CPForceDefaultRole | Yes/No | Y | Y | Locks the landing default |
| Is Active | CPIsActive | Yes/No | Y | Y | Enables/disables override |
| Effective Start Date | CPEffectiveStartDate | Date and Time | N | Y | Time boxing |
| Effective End Date | CPEffectiveEndDate | Date and Time | N | Y | Time boxing |
| Notes | CPNotes | Multiple lines of text (plain) | N | N | Companion note |

---

## Recommended site columns to create once and reuse

Suggested reusable site columns:

- CPPackageKey
- CPSourceKey
- CPLinkKey
- CPRelationKey
- CPFeedbackKey
- CPEventKey
- CPOverrideKey
- CPSettingKey
- CPPublicState
- CPFreshnessState
- CPEffectiveDate
- CPLastReviewedDate
- CPNextReviewDate
- CPIsActive

Reusing site columns and content types will improve consistency across the backend. citeturn829367search4turn829367search6turn682466search9
