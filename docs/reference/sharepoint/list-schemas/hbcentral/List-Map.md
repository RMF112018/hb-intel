# HBCentral List Map

## 1. Objective
- Relationship and key-mapping reference for HBCentral lists to reduce integration mistakes.
- Use this map before wiring cross-list joins, lookup behavior, and app data contracts.

## 2. Site-Wide Relationship Overview
- project: Projects, projectViewerGroups
- page/destination: HB Article Destination Pages, Homepage Project Spotlights
- template/configuration: HB Article Template Registry, Hero Banner Config
- command-band/configuration: Priority Actions Band Config, Priority Actions Band Items
- workflow/history: HB Article Workflow History
- error/audit: HB Article Publishing Errors, Kudos Audit Events
- people-culture: People Culture Announcements, People Culture Celebrations, People Culture Kudos
- other business: Bids, HB Article Media, HB Article Promotion Rules, HB Article Team Members, HB Articles, Tool Launcher Contents
- Implementation-relevant system lists: TaxonomyHiddenList, User Information List

## 3. Relationship Map by List
### Bids
- Likely role: list role inferred from schema and naming.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ComplianceAssetId, ID, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### HB Article Destination Pages
- Likely role: page binding/destination tracking.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ArticleId, BindingId, ComplianceAssetId, ID, PageId, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### HB Article Media
- Likely role: media child records.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ArticleId, ComplianceAssetId, ID, MediaId, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### HB Article Promotion Rules
- Likely role: list role inferred from schema and naming.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ComplianceAssetId, Destination, ID, ManualOverrideAllowed, RuleId, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### HB Article Publishing Errors
- Likely role: operational logging / audit.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ArticleId, BindingId, ComplianceAssetId, Destination, ErrorId, ID, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### HB Article Team Members
- Likely role: team/person child records.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ArticleId, ComplianceAssetId, ID, ParentMemberId, TeamMemberId, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### HB Article Template Registry
- Likely role: template/config registry.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ComplianceAssetId, Destination, ID, TemplateKey, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### HB Article Workflow History
- Likely role: workflow/history tracking.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ArticleId, ComplianceAssetId, HistoryId, ID, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### HB Articles
- Likely role: list role inferred from schema and naming.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ArticleId, ComplianceAssetId, Destination, ID, ManualSortOverride, PageId, ProjectId, TemplateKey, TemplateOverrideAllowed, WorkflowState, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### Hero Banner Config
- Likely role: homepage configuration data.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ComplianceAssetId, ID, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### Homepage Project Spotlights
- Likely role: project-related data/config.
- Outbound lookup dependencies: AppPrincipals, TaxonomyHiddenList, User Information List.
- Critical key-like fields: ComplianceAssetId, ID, ProjectId, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### Kudos Audit Events
- Likely role: operational logging / audit.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ComplianceAssetId, ID, KudosId, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### People Culture Announcements
- Likely role: people/culture feature data.
- Outbound lookup dependencies: AppPrincipals, TaxonomyHiddenList, User Information List.
- Critical key-like fields: AnnouncementId, ComplianceAssetId, ID, PriorityOverride, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### People Culture Celebrations
- Likely role: people/culture feature data.
- Outbound lookup dependencies: AppPrincipals, TaxonomyHiddenList, User Information List.
- Critical key-like fields: AnnouncementId, ComplianceAssetId, ExternalEmployeeId, ID, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### People Culture Kudos
- Likely role: people/culture feature data.
- Outbound lookup dependencies: AppPrincipals, TaxonomyHiddenList, User Information List.
- Critical key-like fields: ComplianceAssetId, ID, IndividualRecipients, KudosId, RevisionGuidance, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### Projects
- Likely role: project master registry (likely).
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ComplianceAssetId, ID, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### projectViewerGroups
- Likely role: project-related data/config.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ComplianceAssetId, DefaultViewerGroupIdsJson, ID, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### Tool Launcher Contents
- Likely role: homepage configuration data.
- Outbound lookup dependencies: AppPrincipals, User Information List.
- Critical key-like fields: ComplianceAssetId, ID, _ComplianceTagUserId.
- Likely downstream consumers: webparts/services that query this list by internal-name contracts (verify in app code for exact consumers).

### Priority Actions Band Config
- Role: command-band configuration row set (one active row per `BandKey`).
- Outbound lookup dependencies: AppPrincipals, User Information List (system/OOB metadata only).
- Critical key-like fields: BandKey, Enabled, IsActive.
- Downstream consumer seams:
  - provisioning and seed orchestration in `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`
  - intended public runtime consumer: PriorityActionsRail config resolver seam.
- Seed model ownership:
  - extraction/parity seed (`sharepoint-control:provisioning:priority-actions-band-seed-items`, `sharepoint-control:provisioning:priority-actions-band-provision-and-seed`) preserves homepage Quick Links parity.
  - curated base-catalog seed (`sharepoint-control:provisioning:priority-actions-band-seed-curated`, `sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated`) reconciles config profiles by `BandKey + Title`.
- Curated conflict rule:
  - if unknown `homepage-primary` rows remain both `Enabled=true` and `IsActive=true`, curated seeding fails loudly instead of mutating unknown rows.

### Priority Actions Band Items
- Role: command-band action item rows keyed by `BandKey + ActionKey`.
- Outbound lookup dependencies: AppPrincipals, User Information List (system/OOB metadata only).
- Critical key-like fields: BandKey, ActionKey, ItemStatus, SortOrder.
- Downstream consumer seams:
  - seed writer and idempotent upsert logic in `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`
  - intended public runtime consumer: PriorityActionsRail item normalization/filtering seam.
- Seed model ownership:
  - extraction/parity seed reconciles homepage Quick Links-derived rows and may archive rows missing from extracted source.
  - curated base-catalog seed reconciles by `BandKey + ActionKey` using explicit managed keys from `tools/pnp-runner-local/seeds/hbcentral/priority-actions-research-seed.json`.
- Curated destructive-safety rule:
  - curated archive applies only to managed keys absent from payload; unknown/manual rows outside managed keys are not archived or mutated.

## 4. Field Matching Matrix
| Field Internal Name | Lists Using Field | Notes |
|---|---|---|
| BandKey | Priority Actions Band Config, Priority Actions Band Items | Command-band join key (active config to item rows) |
| ActionKey | Priority Actions Band Items | Stable item key for rerun-safe seed upserts and runtime identity |
| ItemStatus | Priority Actions Band Items | Public render gate (`Enabled`/`Disabled`/`Archived`) |
| SortOrder | HB Article Media, HB Article Team Members, Priority Actions Band Items | Shared deterministic ordering pattern |
| OpenInNewTab | People Culture Announcements, Tool Launcher Contents, Priority Actions Band Items | Shared launch-behavior control pattern |
| Attachments | Bids, HB Article Destination Pages, HB Article Media, HB Article Promotion Rules, HB Article Publishing Errors, HB Article Team Members, HB Article Template Registry, HB Article Workflow History, HB Articles, Hero Banner Config, Homepage Project Spotlights, Kudos Audit Events, People Culture Announcements, People Culture Celebrations, People Culture Kudos, Projects, TaxonomyHiddenList, Tool Launcher Contents, User Information List, projectViewerGroups | Shared schema pattern |
| ContentType | Bids, HB Article Destination Pages, HB Article Media, HB Article Promotion Rules, HB Article Publishing Errors, HB Article Team Members, HB Article Template Registry, HB Article Workflow History, HB Articles, Hero Banner Config, Homepage Project Spotlights, Kudos Audit Events, People Culture Announcements, People Culture Celebrations, People Culture Kudos, Projects, TaxonomyHiddenList, Tool Launcher Contents, User Information List, projectViewerGroups | Shared schema pattern |
| Title | Bids, HB Article Destination Pages, HB Article Media, HB Article Promotion Rules, HB Article Publishing Errors, HB Article Team Members, HB Article Template Registry, HB Article Workflow History, HB Articles, Hero Banner Config, Homepage Project Spotlights, Kudos Audit Events, People Culture Announcements, People Culture Celebrations, People Culture Kudos, Projects, TaxonomyHiddenList, Tool Launcher Contents, projectViewerGroups | Shared schema pattern |
| ArticleId | HB Article Destination Pages, HB Article Media, HB Article Publishing Errors, HB Article Team Members, HB Article Workflow History, HB Articles | Possible join/filter dimension |
| Destination | HB Article Promotion Rules, HB Article Publishing Errors, HB Article Template Registry, HB Articles | Possible join/filter dimension |
| Headline | Hero Banner Config, Homepage Project Spotlights, People Culture Announcements, People Culture Kudos | Shared schema pattern |
| IsActive | HB Article Promotion Rules, HB Article Template Registry, Tool Launcher Contents, projectViewerGroups | Shared schema pattern |
| IsFeatured | HB Articles, Homepage Project Spotlights, People Culture Celebrations, People Culture Kudos | Shared schema pattern |
| AudienceTags | HB Articles, People Culture Announcements, People Culture Celebrations | Shared schema pattern |
| field_1 | Bids, Projects, Tool Launcher Contents | Shared schema pattern |
| field_11 | Bids, Projects, Tool Launcher Contents | Shared schema pattern |
| field_12 | Bids, Projects, Tool Launcher Contents | Shared schema pattern |
| field_13 | Bids, Projects, Tool Launcher Contents | Shared schema pattern |
| field_14 | Bids, Projects, Tool Launcher Contents | Shared schema pattern |
| field_2 | Bids, Projects, Tool Launcher Contents | Shared schema pattern |
| field_20 | Bids, Projects, Tool Launcher Contents | Shared schema pattern |
| field_21 | Bids, Projects, Tool Launcher Contents | Shared schema pattern |
| field_22 | Bids, Projects, Tool Launcher Contents | Shared schema pattern |
| field_3 | Bids, Projects, Tool Launcher Contents | Shared schema pattern |
| HomepageEnabled | Homepage Project Spotlights, People Culture Announcements, People Culture Kudos | Shared schema pattern |
| ImageAltText | People Culture Announcements, People Culture Celebrations, People Culture Kudos | Shared schema pattern |
| IsPinned | HB Articles, People Culture Announcements, People Culture Kudos | Shared schema pattern |
| Notes | HB Article Promotion Rules, HB Article Template Registry, projectViewerGroups | Shared schema pattern |
| PrimaryImage | People Culture Announcements, People Culture Celebrations, People Culture Kudos | Shared schema pattern |
| AnnouncementId | People Culture Announcements, People Culture Celebrations | Possible join/filter dimension |
| BindingId | HB Article Destination Pages, HB Article Publishing Errors | Possible join/filter dimension |
| CtaLabel | Homepage Project Spotlights, People Culture Announcements | Shared schema pattern |
| CtaUrl | Homepage Project Spotlights, People Culture Announcements | Shared schema pattern |
| field_10 | Projects, Tool Launcher Contents | Shared schema pattern |
| field_15 | Bids, Projects | Shared schema pattern |
| field_16 | Projects, Tool Launcher Contents | Shared schema pattern |
| field_23 | Bids, Projects | Shared schema pattern |
| field_24 | Bids, Projects | Shared schema pattern |
| field_26 | Bids, Tool Launcher Contents | Shared schema pattern |
| field_27 | Bids, Tool Launcher Contents | Shared schema pattern |
| field_28 | Bids, Tool Launcher Contents | Shared schema pattern |
| field_30 | Bids, Tool Launcher Contents | Shared schema pattern |
| field_31 | Bids, Tool Launcher Contents | Shared schema pattern |
| field_4 | Projects, Tool Launcher Contents | Shared schema pattern |
| field_5 | Projects, Tool Launcher Contents | Shared schema pattern |
| field_6 | Projects, Tool Launcher Contents | Shared schema pattern |
| field_7 | Projects, Tool Launcher Contents | Shared schema pattern |
| field_8 | Projects, Tool Launcher Contents | Shared schema pattern |
| KudosId | Kudos Audit Events, People Culture Kudos | Possible join/filter dimension |
| OpenInNewTab | People Culture Announcements, Tool Launcher Contents | Shared schema pattern |
| PageId | HB Article Destination Pages, HB Articles | Possible join/filter dimension |
| PageName | HB Article Destination Pages, HB Articles | Shared schema pattern |
| PageShellVersion | HB Article Destination Pages, HB Articles | Shared schema pattern |
| PageTemplateKey | HB Article Destination Pages, HB Articles | Shared schema pattern |
| PageUrl | HB Article Destination Pages, HB Articles | Shared schema pattern |
| PersonDisplayName | People Culture Announcements, People Culture Celebrations | Shared schema pattern |
| ProjectId | HB Articles, Homepage Project Spotlights | Possible join/filter dimension |
| PublishedDateUtc | HB Article Destination Pages, HB Articles | Shared schema pattern |
| RenderVersion | HB Article Destination Pages, HB Articles | Shared schema pattern |
| ShowSecondaryImage | HB Article Template Registry, HB Articles | Shared schema pattern |
| ShowTeamViewer | HB Article Template Registry, HB Articles | Shared schema pattern |
| SortOrder | HB Article Media, HB Article Team Members | Shared schema pattern |
| Summary | Homepage Project Spotlights, People Culture Announcements | Shared schema pattern |
| TargetSiteUrl | HB Article Destination Pages, HB Articles | Shared schema pattern |
| TemplateKey | HB Article Template Registry, HB Articles | Possible join/filter dimension |

## 5. Critical Mapping Notes
- Several list families use key-like text fields rather than enforced SharePoint lookups; treat joins as contractual conventions and validate at runtime.
- Internal/display name drift exists (for example generic `field_*` internal names in some lists); always use internal names from per-list reports.
- System/OOB metadata fields appear across most lists; ignore by default unless audit/compliance/authoring semantics require them.
- Where multiple lists share similarly named keys, document authoritative source before implementing cross-list writes.

## 6. Development Guidance
- Always consult this map + target per-list report before adding new list relationships.
- Do not assume key equivalence by display label; match by internal name and value semantics.
- When uncertain about joins/filters, re-extract tenant schema and verify consumers before shipping changes.

## 7. Prompt-02 Live Validation Snapshot (2026-04-18)
- Run id: `f671390c-bc35-46b0-9937-da9b77b1ac94`
- Action: `sharepoint-control:provisioning:priority-actions-band-provision-and-seed-curated`
- Results:
  - 3 expected config profiles for `homepage-primary` present, with exactly one active+enabled row.
  - 10 expected curated action keys present.
  - duplicate action keys: none.
  - invalid group key/title pairing: none.
  - archive drift outside curated managed key set: none.
