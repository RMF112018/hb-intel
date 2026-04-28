# Phase 0 Step 2 — Schema Family Taxonomy

## Purpose

This document declares the 14-family schema taxonomy Phase 1 — Machine-Readable Template Contract will produce. The taxonomy is a **Phase 0 Step 2 planning taxonomy**, not a new architecture decision; every family traces back to existing Contract, Blueprint, Roadmap, or Phase 0 Step 1 audit content. The taxonomy defines family ownership, dependencies, common fields, status fields, source-traceability fields, governance fields, validation metadata, naming conventions, and the future folder layout that Phase 1 will create. Phase 0 Step 2 does **not** create the directory or any schema file.

The 14-family count expands the Step 1 backlog's 9-family proposal (B-03) by separating four cross-cutting concerns into their own families (`template-manifest`, `enums`, `validation-rules`, `provisioning-validation`) and treating `permissions` as one family that combines SharePoint groups, permission templates, access manager rules, expiration defaults, and audit actions. Every added family corresponds to existing Contract content; no new architecture decision is introduced.

## Taxonomy Principles

1. **Trace to existing content.** Every family corresponds to a Contract section (or Blueprint / Roadmap section where strategic). No family is invented.
2. **One concern per family.** Cross-cutting concerns (enums, validation rules, manifest, provisioning validation) are pulled out so they are referenced once and reused.
3. **MVP-aware.** Every family supports `mvp_status` so deferred and future items remain visible rather than being omitted.
4. **No new decisions.** The taxonomy declares structure for existing decisions; it does not introduce new policy.
5. **Phase 1 review and acceptance gate.** This taxonomy is a planning artifact awaiting Phase 1 review; it is not authoritative until accepted.
6. **Tracing to Step 1.** Every family shows traceability back to Step 1 audit findings or backlog items.

## Schema Families

| Family | Purpose | Traces To |
|---|---|---|
| `template-manifest` | Template identity, version, family, owner, source-traceability, and global MVP status metadata. Outermost wrapper. | Contract §4 Template Identity (line 138); Step 1 backlog mention of `packages/project-site-template/template-contract.json` root. |
| `enums` | ProjectType, ProjectStage, ProjectStatus, Decision Closure status, severity, repair tier, object status, module visibility, integration status, and forbidden-value sets. | Contract §3.2, §4B.0, §4B.1, §22, §19, §19A; Step 1 audit findings F-01, F-02, F-03; Step 1 register C-01 through C-06, C-37. |
| `settings` | Control Center Settings, module settings, integration settings, tenant/runtime references. | Contract §10 Control Center Settings (line 534); Blueprint §31 Control Center Settings (line 1974); Step 1 register C-21, C-22. |
| `permissions` | SharePoint groups, permission templates, access manager rules, expiration defaults, audit actions. | Contract §11 Team & Access (line 616), §12 Permission Template Contract (line 759); Blueprint §35 Permission and Access Architecture; Step 1 register C-17, C-18, C-19, C-29. |
| `site` | Site identity, naming, URL rules, project metadata, phase association, archive behavior. | Contract §5 Project Site Naming (line 249), §6 Project Metadata Contract (line 317); Step 1 register C-01 through C-06. |
| `pages` | Site pages, shell pages, module pages, settings pages, route/page metadata. | Contract §13 Standard Pages (line 867); Blueprint §8 PCC Shell (line 297). |
| `libraries` | Document libraries, metadata, views, read-only/archive behavior. | Contract §14 Standard Document Library (line 893). |
| `lists` | SharePoint lists, fields, views, indexes, lookup dependencies, list-level governance. | Contract §15 Standard SharePoint List (line 980), §16 Common List Schema Pattern (line 1337); Step 1 audit finding F-13, F-14. |
| `modules` | PCC module registry, visibility, dependencies, rollup contribution, MVP/future treatment. | Contract §8 Required Work Centers / Modules (line 419); Blueprint §9 Module Map (line 350); Blueprint §30 HBI Assistant (deferred). |
| `workflows` | Startup, closeout, permits, inspections, responsibility matrix, action generation. | Contract §17 Seeded Workflow Templates (line 1363). |
| `integrations` | Integration records, launch links, mapping placeholders, Procore MVP mapping, non-Procore placeholders. | Contract §18 External Integration Contract (line 1449); Blueprint §36, §36A; Step 1 register C-07 through C-16. |
| `site-health` | Health records, checks, severity, drift, repair tiers, audit and validation posture. | Contract §19 Site Health (line 1627), §19A Repair Automation Tiers (line 1726); Blueprint §32 Site Health and Drift (line 2042). |
| `provisioning-validation` | Provisioning stages, post-provision validation, audit records, rollback/repair references. | Contract §20 Provisioning Validation Contract (line 1773), §20A Required Graph Application Permissions (line 1815). |
| `validation-rules` | Enum, conditional, referential, ownership, system-of-record, no-secret, no-direct-call, and stage/status rules. | Step 1 backlog item B-01; companion `Phase_0_Step_2_Validation_Rule_Table_Plan.md`. |

## Family Ownership

| Family | Owner | Rationale |
|---|---|---|
| `template-manifest` | HB Intel Architecture | Template identity / version / change control owner per Contract §4. |
| `enums` | HB Intel Architecture | Identity enum and Decision Closure Register status authority. |
| `settings` | PCC Admin (operationally); HB Intel Engineering (schema authoring) | Settings shape authored by Engineering; runtime values managed by PCC Admin per Contract §10. |
| `permissions` | PCC Admin (operationally); HB Intel Engineering (schema authoring) | Same split as Settings; Contract §11 / §12 govern. |
| `site` | PCC Admin | Per-site identity managed by PCC Admin per Contract §5 / §6. |
| `pages` | HB Intel Engineering | Page set governed by Contract §13 and Blueprint §8 PCC Shell. |
| `libraries` | HB Intel Engineering | Standard Document Library Contract per §14. |
| `lists` | HB Intel Engineering | Standard SharePoint List Contract per §15. |
| `modules` | HB Intel Engineering (registry); PCC Admin (per-project visibility) | §8 governs registry; per-project visibility configured at runtime. |
| `workflows` | HB Intel Engineering | Seeded Workflow Templates per §17. |
| `integrations` | IT / Integration Admin (operationally); HB Intel Engineering (schema authoring) | Per Contract §18 and Permission Template Contract §12.4 ownership rows. |
| `site-health` | PCC Admin (operationally); HB Intel Engineering (schema authoring) | §19 / §19A. |
| `provisioning-validation` | Backend (Provisioning Authority) | Provisioning Authority is `backend/functions/src/services/sharepoint-provisioning-service.ts` per Contract §4. |
| `validation-rules` | HB Intel Architecture | Architecture authority for rule classification and Enforcement Layer assignment. |

## Family Dependencies

The dependency graph (acyclic):

```
template-manifest
  └── references all families

provisioning-validation
  └── references all families

site-health
  └── references all primitive and behavior families through object references

integrations
  └── settings, enums, permissions

workflows
  └── lists, permissions, modules

modules
  └── pages, lists, libraries, permissions

pages
  └── site, permissions

libraries
  └── site, permissions, enums

lists
  └── site, permissions, enums

site
  └── enums, settings, permissions

settings
  └── enums

permissions
  └── enums

validation-rules
  └── enums

enums
  └── (none)
```

`enums` is the foundation and has no dependencies. `template-manifest` and `provisioning-validation` are the apex consumers, referencing every other family. `site-health` is a near-apex consumer that references every primitive and behavior family through object references rather than direct schema composition.

## Required Common Fields

Every schema entry in any family carries:

| Field | Type | Description |
|---|---|---|
| `id` | string | Stable identifier (e.g., `site`, `pages.project-home`, `lists.permits`). Used for cross-family references. |
| `kind` | string | Family identifier (`template-manifest`, `enums`, `settings`, etc.). |
| `mvp_status` | enum | One of `Frozen for MVP`, `Runtime Configuration`, `Deferred`, `Proof-Gated`. Bound to the Decision Closure Register four-value enum. |
| `sourceContractSection` | string | Contract section anchor (e.g., `§13`, `§15.13.1`). Required for traceability. |
| `sourceCatalogId` | integer or null | Object Catalog row ID (1–18) where applicable; null for entries that aren't Catalog rows (e.g., `enums`, `validation-rules`, `template-manifest`). |

## Required Status Fields

Per-family status fields, distinct from `mvp_status`:

| Family | Status Field | Purpose |
|---|---|---|
| `template-manifest` | `templateStatus` | Active / Draft / Retired template state. |
| `settings` | `settingStatus` | Frozen / Runtime / Deferred per setting. |
| `permissions` | `permissionStatus` | Active / Disabled (e.g., external-user templates `Disabled` at MVP). |
| `site` | `siteStatus` | ProjectStatus enum (Active / On Hold / Closed / Archived). |
| `pages` | `pageStatus` | Published / Draft / Hidden. |
| `libraries` | `libraryStatus` | Active / Read-only / Archived. |
| `lists` | `listStatus` | Active / Read-only / Archived. |
| `modules` | `moduleStatus` | Visible / Hidden (computed from ProjectStage and module visibility rule). |
| `workflows` | `workflowStatus` | Active / Disabled. |
| `integrations` | `integrationStatus` | Active / Placeholder / Disabled. |
| `site-health` | `healthRecordStatus` | Open / Acknowledged / Resolved. |
| `provisioning-validation` | `validationStatus` | Pending / Passed / Failed / Repaired. |

`enums` and `validation-rules` do not carry a per-family status field; `mvp_status` covers their lifecycle.

## Required Source Traceability Fields

Every schema entry carries:

| Field | Purpose |
|---|---|
| `sourceContractSection` | Contract section anchor (e.g., `§13`, `§15.13.1`, `§19A`). |
| `sourceCatalogId` | Object Catalog row ID (1–18) when applicable; null otherwise. |
| `sourceBlueprintSection` | Blueprint section anchor (e.g., `§9`, `§30`, `§36A`) when the entry derives strategic context from the Blueprint. |
| `sourceDecisionRef` | Decision Closure Register reference (e.g., `D-12`, `P-03`, `P-10`) when the entry derives from a frozen decision. |

Source-traceability is mandatory: Phase 1 schemas with missing `sourceContractSection` fail validation.

## Required Governance Fields

| Field | Purpose |
|---|---|
| `mvp_status` | (also a common field) — Decision Closure Register four-value enum. |
| `decisionRef` | Decision Closure Register row reference (e.g., `D-12`, `P-04`). |
| `ownerCategory` | Owner category for the field or entry: `Architecture`, `Engineering`, `PCC Admin`, `IT/Integration Admin`, `Backend`, `Governance`. |
| `auditRequired` | Boolean — whether changes to this entry require audit logging. |

## Required Validation Metadata

Every schema entry references the validation rules that apply to it:

| Field | Purpose |
|---|---|
| `validationRuleRefs` | Array of Rule IDs from `validation-rules` (e.g., `["VR-01", "VR-04"]`). |
| `enforcementLayers` | Array of Enforcement Layers that apply to this entry: `Schema`, `Provisioning`, `Backend`, `SPFx`, `Site Health`, `Governance`, `Documentation`, `Cross-Layer`. |
| `blocksGenerationIfMissing` | Boolean — whether this rule must be present for the schema to be generated. |

The companion `Phase_0_Step_2_Validation_Rule_Table_Plan.md` defines the full Enforcement Layer vocabulary and "blocks generation if missing" semantics.

## Field Naming Conventions

- **JSON keys**: camelCase (`projectType`, `mvpStatus`, `sourceContractSection`).
- **Enum values**: as defined in the Contract — lowercase snake_case for canonical layer (`commercial`, `active_construction`, `procore_company_id`); SharePoint surface in PascalCase (`ProjectType`, `ProcoreCompanyId`); business labels as plain text.
- **Schema file names**: kebab-case (`project-type.schema.json`, `template-manifest.schema.json`).
- **Schema family identifiers**: kebab-case singular (`template-manifest`, `site-health`, `provisioning-validation`).
- **Stable IDs across families**: dot-separated kebab-case (`pages.project-home`, `lists.permits`, `modules.document-control-center`).
- **Anti-regression tokens** (`preconstruction_only`, `warranty_closeout`, `Archived`-as-stage, `active_construction`-as-ProjectType): appear only inside `forbidden_values` arrays in `enums` schemas, never as valid enum members.

## Future Folder Layout Proposal

This is **documentation only**. Phase 0 Step 2 does not create the directory or any file under it. Phase 1 will create the layout below; the layout is the proposal carried forward from `Phase_0_Step_2_Schema_Extraction_Plan.md`.

```
packages/project-site-template/
├── template-contract.json                      # root machine-readable contract
├── families/
│   ├── settings.schema.json
│   ├── permissions.schema.json
│   ├── site.schema.json
│   ├── pages.schema.json
│   ├── libraries.schema.json
│   ├── lists.schema.json
│   ├── modules.schema.json
│   ├── workflows.schema.json
│   ├── integrations.schema.json
│   ├── site-health.schema.json
│   └── provisioning-validation.schema.json
├── enums/
│   ├── project-type.schema.json
│   ├── project-stage.schema.json
│   ├── project-status.schema.json
│   ├── mvp-status.schema.json
│   ├── severity.schema.json
│   ├── repair-tier.schema.json
│   └── integration-status.schema.json
├── validation-rules/
│   └── validation-rules.json
└── manifest/
    └── template-manifest.schema.json
```

## Open Questions

The taxonomy declaration exercise identified no open architectural questions. If Phase 1 surfaces an object that does not fit any of the 14 families, the question returns to Phase 0 review and is added here before Phase 1 continues.

## Phase 1 Handoff

Phase 1 — Machine-Readable Template Contract reviews this taxonomy and the three companion Step 2 deliverables. After acceptance and confirmation that the Phase 1 entry gate holds, Phase 1 may begin creating `packages/project-site-template/`. No Prompt 02 architecture-gap escalation was required during Step 2.
