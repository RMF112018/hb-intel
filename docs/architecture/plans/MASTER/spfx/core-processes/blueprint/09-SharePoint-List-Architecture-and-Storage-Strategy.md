# SharePoint List Architecture and Storage Strategy

## Objective

Define a SharePoint-list-first backend architecture that can support the MVP public shell and companion while all app-managed data remains in SharePoint list storage.

This architecture is designed to support:

- centrally governed corridor and child packages
- package-first discovery
- typed source references
- role/lifecycle mapping
- trust and freshness controls
- structured feedback intake
- role-targeting overrides
- future dormant project-context evolution

## Design principles

### 1. Use SharePoint lists for structured app data, not the procedures-manual library

The current procedures-manual library remains the **source-document layer**.
The application should not try to turn that legacy library into the transactional app backend.

Instead, app-managed backend data should live in dedicated SharePoint lists that hold:

- package records
- source-reference records
- package/source relationships
- package/package relationships
- feedback records
- governance events
- role-targeting overrides
- app settings / controlled dictionaries

### 2. Use content types and reusable columns for consistency

Content types and reusable columns are the right SharePoint-native way to keep structure consistent across lists and libraries. Microsoft documents content types as the mechanism for applying a common set of metadata and behavior across lists and libraries. citeturn829367search4turn829367search6turn682466search9

### 3. Avoid a lookup-heavy relational model

SharePoint Online lists can scale past 5,000 items, but list design must account for the list view threshold and rely on indexed/filterable fields. Microsoft’s guidance is to manage large lists carefully and to filter/sort on appropriate indexed columns. citeturn829367search1turn682466search3turn682466search6

Because of that, the backend should avoid an over-normalized design with excessive lookup joins.
Use this rule:

- use **single-value choice/text/number/date/yes-no** fields for primary filters and indexes
- use **single-value person** only where the user experience truly benefits from it
- use **plain-text JSON fields** for many-to-many associations and UI configuration payloads
- use dedicated relationship lists only where the relationship itself needs ordering, status, or metadata

### 4. Separate current-state data from history/audit data

Public and companion experiences need fast current-state reads.
History should not bloat the current-state lists.

Use:

- current-state lists for packages, sources, links, settings, overrides, and feedback
- a separate governance-event list for status transitions and override history

### 5. Package-first, source-second

Search and navigation should resolve packages first and source documents second.
The backend therefore needs explicit package objects and explicit source-reference objects, not just raw document links.

## Recommended list inventory

### List 1 — `HBCP_Settings`

Purpose:

- global application settings
- controlled dictionaries
- JSON-configured UI and governance rules

Examples of records:

- role definitions
- lifecycle stages
- supporting domains
- source item type taxonomy
- freshness thresholds
- trust marker rules
- preview/open rules

### List 2 — `HBCP_Packages`

Purpose:

- store parent corridor packages
- store child packages
- store first-class supporting packages

This is the core business object list for the application.

Recommended content types:

- Corridor Package
- Child Package
- Supporting Package

### List 3 — `HBCP_SourceItems`

Purpose:

- store governed references to SharePoint source files
- record source type, canonical/derivative status, trust metadata, and preview/open behavior

Recommended content types:

- Canonical Source Item
- Derivative Source Item
- Reference-Only Source Item

### List 4 — `HBCP_PackageSourceLinks`

Purpose:

- join packages to source items
- preserve display order
- preserve link type
- preserve required/not-required behavior
- preserve role- or stage-specific visibility where needed

Use this list because the relationship itself has meaningful metadata.

### List 5 — `HBCP_PackageRelations`

Purpose:

- join packages to other packages
- support parent-child relationships
- support adjacent-reference relationships
- support supporting-domain dependencies
- support promoted operating-path relationships

### List 6 — `HBCP_Feedback`

Purpose:

- store structured package feedback from users
- support master queue and routed queue views

Recommended content types:

- Package Feedback
- Child Package Feedback

### List 7 — `HBCP_GovernanceLog`

Purpose:

- store publish/supersede/archive events
- store freshness overrides
- store key governance state changes
- preserve auditability without bloating current-state lists

### List 8 — `HBCP_AudienceOverrides`

Purpose:

- store centrally governed role-targeting overrides
- support hybrid role targeting:
  - group-based defaults
  - manual switching
  - admin override rules

## Recommended storage strategy by concern

### Package definition
Store in `HBCP_Packages`

### Source document metadata
Store in `HBCP_SourceItems`

### Package-to-source ordering and role/stage link metadata
Store in `HBCP_PackageSourceLinks`

### Package hierarchy and cross-package relationships
Store in `HBCP_PackageRelations`

### Feedback intake and triage
Store in `HBCP_Feedback`

### Publish/freshness/governance event history
Store in `HBCP_GovernanceLog`

### Role override logic and future targeting exceptions
Store in `HBCP_AudienceOverrides`

### Controlled vocabularies and app-wide behavior rules
Store in `HBCP_Settings`

## Why a settings list instead of many small lookup lists

Because all backend data must remain in SharePoint list storage for now, a settings list gives the app a list-stored source of truth without forcing a large number of small lookup lists.

This is especially useful for dictionaries that are:

- low volume
- centrally controlled
- primarily read by the app
- unlikely to need independent list UIs

Good candidates for JSON-backed settings records:

- role definitions
- lifecycle stage definitions
- supporting-domain definitions
- source item type definitions
- search synonym rules
- freshness thresholds
- preview routing rules

## Recommended content-type approach

SharePoint content types should be used at least for:

- `HBCP_Packages`
- `HBCP_SourceItems`
- `HBCP_Feedback`

This supports structural consistency and future evolution while staying inside SharePoint-native patterns. citeturn829367search4turn829367search6turn682466search9

## Large-list and indexing posture

SharePoint Online still enforces a list view threshold of 5,000 items for operations that create excessive server load, so the backend must be designed with indexed-filter-first access patterns. citeturn829367search1turn682466search3

Practical implications:

- every large operational list must have indexed filter columns before scale
- public and companion default views must filter on indexed fields
- avoid relying on multi-value fields for primary filters
- keep lookup use disciplined
- prefer text keys plus app-side joins where SharePoint joins would become expensive

## Recommended key strategy

Every core business object should have an immutable text key in addition to SharePoint item ID.

Examples:

- package key
- source key
- link key
- relation key
- feedback key
- governance event key
- override key

Reason:

- item IDs are convenient inside one list
- immutable keys are safer for app-side joins, export/import, migration, and future evolution

## Dormant future project seam

The MVP should not expose project-specific behavior, but the package model should include dormant fields that make future evolution easier.

Recommended dormant concepts:

- `ProjectContextEligible`
- `ProjectTypeApplicabilityJson`
- `ProjectPhaseContextHintsJson`
- `RequiresProjectBinding` (false in MVP)

These should live on package records but remain inactive in the MVP UI and governance model.
