# Phase 0 Step 2 — Schema Extraction Plan

## Executive Summary

This plan converts the Phase 0 Step 1 audit findings into a concrete schema-extraction plan for the future Phase 1 — Machine-Readable Template Contract effort. It declares the 14-family schema taxonomy Phase 1 will produce (treated here as a **Phase 0 Step 2 planning taxonomy**, not a new architecture decision — every family traces back to existing Contract, Blueprint, Roadmap, or Step 1 audit content), the 12-step extraction sequence, the representation work that must complete before any JSON Schema is generated, the field-marking plan, the validation-rule extraction plan, the disposition method for every Object Catalog row, the proposed file and folder layout for the future `packages/project-site-template/`, the explicit out-of-scope items, and the Phase 1 entry gate and exit criteria.

This is a planning-only deliverable. No schemas are created, no `packages/project-site-template/` is created or stubbed, no SPFx or backend code is touched. The plan honors the six Step 1 hard constraints and carries forward the six Step 1 P1 representation items verbatim. No new architecture decisions are introduced. No blocking documentation contradictions were discovered during Step 2 planning, so no Prompt 02 architecture-gap escalation was required.

After review and acceptance of this plan plus the three companion deliverables (Object Catalog Disposition, Schema Family Taxonomy, Validation Rule Table Plan), **Phase 1 — Machine-Readable Template Contract** should not proceed to schema generation until these four files are reviewed and accepted; once accepted, Phase 1 may begin creating `packages/project-site-template/`.

## Source Inputs

Repo-truth inputs already in current context:

- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md` — implementation source of truth; primary authority for disposition.
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md` — strategic alignment and terminology only.
- `docs/architecture/blueprint/sp-project-control-center/README.md` — directory governance, source-of-truth hierarchy, current frozen and deferred decisions.
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md` — 10-phase sequencing.
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md` — 20 findings; zero Critical, zero High, four Medium, four Low, twelve Informational.
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md` — 39 rows; zero Fail, four Pass with Note, thirty-five Pass.
- `docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md` — backlog items B-01 through B-20; P0 blockers: none.
- `docs/architecture/blueprint/sp-project-control-center/procore_hbintel_data_model_package/README.md` — specialized Procore canonical-model research; informs Phase 8 / Phase 9 only and is **out of scope** for Phase 1.

## Phase 0 Step 1 Carry-Forward

The following Step 1 conclusions are carried forward as **hard constraints** for Step 2 and Phase 1:

1. Schema extraction may proceed to Phase 1.
2. The Step 1 Consistency Check Register has zero Fail rows.
3. There are no P0 blockers.
4. Step 1 identified representation work, not architecture defects.
5. Phase 1 must not introduce new architecture decisions.
6. If extraction exposes a true undecided architecture point, return it to Phase 0 review instead of resolving it inside schema output.

The following Step 1 P1 representation work items are carried forward verbatim:

- Consolidate per-object columns from pages, lists, libraries, modules, workflows, settings, permissions, integrations, and health records (Step 1 backlog item B-04).
- Apply uniform required / optional markers across object families (B-02).
- Define the Schema Family taxonomy before creating schema files (B-03).
- Map every Object Catalog row to one schema family (B-03).
- Build a structured Validation Rule Table plan covering enum bindings, conditional visibility, read-only-by-status behavior, referential rules, ownership rules, no-secret rules, and no-direct-Procore rules (B-01).
- Preserve Procore Phase 8 / Phase 9 canonical-model work as out of scope for Phase 1 except where mapping, launch-link, summary, audit, object-link, and sync-health placeholders are already governed by the Contract (B-06).

## Extraction Objectives

Phase 1 must produce a machine-readable contract that:

- Encodes every MVP Object Catalog row as a schema entry traceable to Contract §4A and an owning Contract section.
- Encodes every Frozen-for-MVP, Runtime-Configuration, Deferred, and Proof-Gated decision from the Decision Closure Register (Contract §22) as either an enum binding, a `mvp_status` field, or a placeholder.
- Encodes the Procore boundary rules as schema constraints where schema-enforceable (allowed-shape lists, no secret-bearing fields, configuration-not-secret labels) and as named documentation references where not schema-enforceable (no direct SPFx-to-Procore calls).
- Encodes the Site Health severity tiers and Repair Automation tiers as enum bindings consumed by the `site-health` family.
- Encodes the Provisioning Validation Contract (Contract §20) as a `provisioning-validation` family schema.
- Provides a `template-manifest` schema for template identity, version, family, owner, source-traceability, and global MVP status metadata.

## Non-Objectives

Phase 1 must not:

- Introduce any architecture decision absent from the Contract, Blueprint, or Decision Closure Register.
- Build the Procore canonical model (Phase 8 / Phase 9 scope; the canonical-model package remains research material).
- Create write-back schemas, HBI Assistant schemas, or external-user templates as active templates.
- Resolve undecided architecture points inside the schema; undecided points return to Phase 0 review.
- Replace the Contract as the source of truth; the Contract remains authoritative.

## Extraction Principles

The following 11 principles govern Phase 1 schema generation:

1. **Contract-first extraction.** Every schema field traces to a Contract section anchor. The Blueprint is consulted for strategic alignment and terminology only.
2. **No new architecture decisions inside schema output.** Phase 1 extracts existing decisions; if a decision is missing, it returns to Phase 0 review.
3. **Trace to Catalog row.** Every schema object traces to a Contract section and an Object Catalog row where applicable.
4. **MVP / Future / Deferred / Runtime Configuration / Proof-Gated statuses remain explicit.** Each is encoded via the `mvp_status` field bound to the Decision Closure Register four-value enum.
5. **Procore mapping / summary / audit placeholders may be represented; full Procore canonical model is out of Phase 1 scope.** Allowed shapes follow Contract P-10 closure: mapping, summary, exception, action queue, sync health, audit, object link. Forbidden shapes: raw payload, high-volume detail history, bulk attachment, full binary mirror.
6. **External users remain deferred from MVP.** Permission templates for external users exist as `mvp_status: deferred` placeholders only.
7. **HBI Assistant remains deferred from MVP.** Module entry exists as `mvp_status: deferred` placeholder only.
8. **Direct SPFx-to-Procore calls remain prohibited.** This is a SPFx behavior rule and a backend-routing rule; it is documented in the schema's governance metadata, not enforced by JSON Schema validators alone (see Validation Rule Table Plan, "Enforcement Layer").
9. **Procore secrets are never schema fields.** No Procore client IDs, client secrets, refresh tokens, DMSA credentials, OAuth secrets, or environment credentials may appear in any schema, SharePoint list, SPFx surface, markdown doc, or client configuration.
10. **Sage Intacct remains accounting book of record.** Procore-sourced financial fields carry `source_system` and operational-vs-accounting classification; they do not represent accounting truth.
11. **SharePoint is not a full Procore mirror.** Procore Mapping Schema enforces the allowed-shape list and rejects forbidden shapes.

## Required Schema Families

Phase 1 produces the 14 families declared in the companion `Phase_0_Step_2_Schema_Family_Taxonomy.md`. Each family is a Phase 0 Step 2 planning grouping that traces to existing Contract / Blueprint / Roadmap / Step 1 content; no family introduces new architecture content. Families:

`template-manifest`, `enums`, `settings`, `permissions`, `site`, `pages`, `libraries`, `lists`, `modules`, `workflows`, `integrations`, `site-health`, `provisioning-validation`, `validation-rules`.

See the Schema Family Taxonomy file for ownership, dependencies, common fields, status fields, source-traceability fields, governance fields, validation metadata, and naming conventions.

## Extraction Sequence

Phase 1 must extract in the following 12-step order. The order minimizes rework by extracting foundations first (so consumers reference defined identifiers), primitives next (so behavior families compose them), behavior third (so integration and ops families reference them), integration and ops fourth (so the manifest can reference everything), and the manifest last.

| Step | Family | Why this position |
|---|---|---|
| 1 | `settings` | Foundation. Defines Control Center Settings, identity enums via Settings references, and runtime configuration values (e.g., `ProcoreCompanyId`). Every other family references one or more settings. |
| 2 | `permissions` | Foundation. Defines SharePoint groups, permission templates, access manager rules, and ownership rules. Every primitive family references permissions. |
| 3 | `enums` | Foundation. Carries ProjectType, ProjectStage, ProjectStatus, Decision Closure status, severity, repair tier, object status, module visibility, integration status, and forbidden-value sets. Extracted after `settings` and `permissions` so identity enums consumed by both are placed once and referenced. |
| 4 | `lists` | Primitive. Consumes `enums` (for Stage / Status / Type bindings), `permissions` (for list-level access), and `settings` (for runtime config). |
| 5 | `libraries` | Primitive. Same dependencies as `lists`; extracted after lists so library-level lookups can reference list identifiers. |
| 6 | `pages` | Primitive. References lists, libraries, and modules; extracted after primitives so page-region binding has stable references. |
| 7 | `modules` | Behavior. Composes pages, lists, libraries, and permissions; module visibility is keyed on ProjectStage (Validation Rule Table VR-07). |
| 8 | `workflows` | Behavior. References lists (action records), permissions (workflow ownership), and modules (workflow surface). |
| 9 | `integrations` | Integration. References settings (`ProcoreCompanyId`), enums (integration status), permissions (mapping owner). Includes Procore mapping, sync health placeholder, subject area registry, plus Sage Intacct and other integration records as defined in Contract §18. |
| 10 | `site-health` | Operations. References every other family through object references; severity and repair-tier bindings come from `enums`. |
| 11 | `provisioning-validation` | Cross-family. Sweeps every other family with provisioning stages, post-provision validation, audit records, and rollback / repair references per Contract §20. Extracted late so it can reference all primitives and behaviors. |
| 12 | `template-manifest` | Outermost wrapper. Records template identity, version, family, owner, effective date, and global MVP status metadata per Contract §4. Extracted last because it references everything. |

The `site` schema is produced as part of Step 6 (`pages`) and the `template-manifest` (Step 12), since `site` identity, naming, and project metadata are referenced by pages and recorded in the manifest. The Schema Family Taxonomy treats `site` as its own family; the extraction sequence merges its production into Steps 6 and 12 because every `site` field is naturally produced as a side effect of the page and manifest families.

This order minimizes rework by ensuring no family is generated against an unresolved reference: enums are bound before consumers, permissions are defined before lists / libraries / pages reference them, primitives are defined before behavior composes them, and the manifest is produced last because it references everything.

## Representation Work Required Before JSON Schema Generation

Phase 1 must complete the following representation work **before** generating any JSON Schema files. This is the Step 1 P1 backlog (B-01 through B-10) executed inside Phase 1 as its first step.

1. **Validation Rule Table** (B-01) — populate the rule table per the companion `Phase_0_Step_2_Validation_Rule_Table_Plan.md` with every narrative rule from Contract §3.2, §4B.0, §4B.1, §4B.2, §10.6, §11, §18, §19, §20.
2. **Uniform required / optional markers** (B-02) — sweep Contract §13, §14, §15, §10, §12, §17, §19 to apply uniform markers across all object families.
3. **Schema Family taxonomy declared** (B-03) — done in this Step 2 prompt; Phase 1 reviews and accepts.
4. **Object Catalog row mapping** (B-03) — done in companion `Phase_0_Step_2_Object_Catalog_Disposition.md`; Phase 1 reviews and accepts.
5. **Per-object column consolidation** (B-04) — sweep Contract §13 / §14 / §15 to produce per-object column lists with §16 Common List Schema Pattern as the shared pattern reference.
6. **Enum binding contract per field** (B-05) — define how the three identity enums and `mvp_status` bind across the schema.
7. **Procore Mapping Schema shape constraints** (B-06) — declare allowed and forbidden shapes per Contract P-10 closure.
8. **Permission Template Schema bindings** (B-07) — bind business label, internal mapping, and `mvp_status` for each template.
9. **Site Health Schema shape** (B-08) — bind severity and repair-tier enums.
10. **`ProcoreCompanyId` triple-form contract** (B-09) — encode canonical, surface, and business forms.
11. **No-secret-field review** (B-10) — confirm no field is named or shaped to carry a secret.

## Required / Optional Field Marking Plan

Sweep performed in the order below. Each sweep tags fields with `required: true` or `required: false` and a Contract section anchor. Deferred items keep `mvp_status: deferred` rather than being omitted.

1. Contract §10 Settings — Project Site Configuration, Module Configuration, Permission Template Configuration, Integration Configuration.
2. Contract §12 Permission Templates — 13 templates; required fields per Permission Template Contract.
3. Contract §13 Standard Pages — ~15 pages.
4. Contract §14 Standard Document Library — 12 libraries.
5. Contract §15 Standard SharePoint List — ~70 lists.
6. Contract §17 Seeded Workflow Templates — 8 source workflows.
7. Contract §19 Site Health — health record fields; severity and repair-tier bindings.
8. Contract §20 Provisioning Validation — provisioning stages, post-provision validation, audit, rollback.

## Validation Rule Extraction Plan

Phase 1 extracts narrative rules from these Contract sections into the structured Validation Rule Table:

- **§3.2** — ProjectStatus values, Status-driven read-only behavior.
- **§4B.0** — ProjectStage allowed values; anti-regression for `Archived` as Stage.
- **§4B.1** — ProjectType allowed values; anti-regression for `active_construction` as Type, `preconstruction_only`, `warranty_closeout`.
- **§4B.2** — conditional seeding by Type; conditional visibility by Stage.
- **§10.6** — `ProcoreCompanyId` triple-form; default `5280`; configuration not secret.
- **§11** — phase-based access managers; hybrid group model; external-user posture (deferred).
- **§11.5** — external users deferred from MVP.
- **§11.6** — M365 Group / Teams membership posture frozen.
- **§11.7** — Procore directory comparison read-only; no SharePoint access auto-grant.
- **§18** — Procore boundary rules; SPFx must not call Procore directly; Sage Intacct accounting book of record; Procore data labeled operational / PM.
- **§19** — Site Health severity tiers.
- **§19A** — Repair Automation tiers T1 through T4.
- **§20** — Provisioning Validation Contract.

Each rule extracted carries: Rule ID, Category, Source Section, Applies To, Rule Statement, Schema Family, Enforcement Layer, MVP Treatment, Blocks Generation If Missing flag, Notes.

## Object Disposition Method

Every Object Catalog row from Contract §4A receives one of seven dispositions. Disposition values:

- **Extract in Phase 1** — full schema entry produced in Phase 1.
- **Extract as Placeholder in Phase 1** — placeholder schema entry produced; populated when feature is enabled per Contract MVP treatment.
- **Defer from Phase 1** — out of Phase 1 scope; not produced in Phase 1.
- **Runtime Configuration Reference** — produced as a reference only; configured at runtime per Contract §10 tier rules.
- **Proof-Gated Reference** — produced as a reference; activation requires proof gate per Decision Closure Register Proof-Gated rows.
- **Out of Scope** — explicitly out of Phase 1 scope (e.g., Procore canonical-model entities).
- **Needs Architecture Review** — disposition cannot be decided without a new architecture decision; returns to Phase 0 review.

The companion `Phase_0_Step_2_Object_Catalog_Disposition.md` contains the disposition table covering every Catalog row.

## File and Folder Plan for Future Phase 1

This is **documentation only**. Phase 0 Step 2 does not create the directory or any file under it. The proposed layout describes the future shape Phase 1 will produce, traceable to Contract §22 deferred targets (the `packages/project-site-template/template-contract.json` reference at lines 2140–2143).

```
packages/project-site-template/
├── template-contract.json                      # root machine-readable contract (template-manifest family)
├── families/
│   ├── settings.schema.json                    # settings family
│   ├── permissions.schema.json                 # permissions family
│   ├── site.schema.json                        # site family
│   ├── pages.schema.json                       # pages family
│   ├── libraries.schema.json                   # libraries family
│   ├── lists.schema.json                       # lists family
│   ├── modules.schema.json                     # modules family
│   ├── workflows.schema.json                   # workflows family
│   ├── integrations.schema.json                # integrations family (Procore, Sage Intacct, others)
│   ├── site-health.schema.json                 # site-health family
│   └── provisioning-validation.schema.json     # provisioning-validation family
├── enums/
│   ├── project-type.schema.json                # ProjectType enum (5 values + forbidden values)
│   ├── project-stage.schema.json               # ProjectStage enum (6 values + Archived-not-Stage rule)
│   ├── project-status.schema.json              # ProjectStatus enum (4 values)
│   ├── mvp-status.schema.json                  # Decision Closure Register status enum (4 values)
│   ├── severity.schema.json                    # Site Health severity (5 values)
│   ├── repair-tier.schema.json                 # Repair Automation tier (T1–T4)
│   └── integration-status.schema.json
├── validation-rules/
│   └── validation-rules.json                   # structured rule table (validation-rules family)
└── manifest/
    └── template-manifest.schema.json           # template-manifest family (root wrapper)
```

Phase 0 Step 2 does not create this directory or any file under it.

## Out-of-Scope Items

The following items are explicitly **out of scope for Phase 1** schema extraction:

| Item | Out of Scope Reason | Future Phase |
|---|---|---|
| Procore canonical-model entities (`procore_hbintel_data_model_package`) | Contract P-10 closure; SharePoint not a full Procore mirror; canonical model is research material. | Phase 8 / Phase 9 (Procore MVP, Procore Recommended Practical Model) |
| HBI Assistant module schemas | Blueprint §30; deferred from MVP. | Post-MVP |
| Procore write-back schema | Roadmap §8 must-not-include set. | Phase 9+ pending ADR |
| External user permission templates as active | Contract §11.5; D-04 closure; deferred from MVP. | Pending ADR |
| Per-ProjectType seed expansion beyond initial seed sets | Contract §4B.2; Roadmap deferred set. | Post Phase 2 |
| Cupix deepening | README "Key Deferred Decisions". | Phase 5+ |
| `packages/project-site-template/` creation or stub | Phase 1 work; Phase 0 is planning only. | Phase 1 |
| Schema files (any `.schema.json`) | Phase 1 work; Phase 0 is planning only. | Phase 1 |
| New architecture decisions | Step 1 carry-forward constraint #5. | Returns to Phase 0 review |

## Phase 1 Entry Gate

Phase 1 — Machine-Readable Template Contract should not proceed to schema generation until **all** of the following hold:

1. **Zero Fail rows** in the Phase 0 Step 1 Consistency Check Register. Status: as authored, the register has zero Fail rows.
2. **P1 backlog items assigned to owner categories** (Step 1 backlog items B-01 through B-10). Status: each P1 item carries an owner category in the Step 1 backlog; named owners may follow.
3. **Schema family taxonomy reviewed and accepted.** Status: declared in companion `Phase_0_Step_2_Schema_Family_Taxonomy.md`; awaits review.
4. **Contract and Blueprint frozen during extraction.** No edits to either governing file during Phase 1; any required architecture change re-opens Phase 0 Step 1 rather than being absorbed into the schema.
5. **No new architecture decisions embedded in schema output.** Phase 1 extracts existing decisions only; undecided points return to Phase 0 review.

When all five hold, Phase 1 may begin with B-01 (Validation Rule Table) and B-03 (Schema Family taxonomy review) executed first, followed by B-02, B-04, and B-05 through B-10, then per-family JSON Schema generation in the 12-step order above.

## Phase 1 Exit Criteria

Phase 1 completes when **all** of the following hold:

1. `packages/project-site-template/template-contract.json` exists and validates against itself (self-referential meta-validation).
2. Every Object Catalog row from Contract §4A maps to a corresponding schema entry (or is explicitly tagged out-of-Phase-1 with a documented reason).
3. Every Validation Rule Table row has a declared Enforcement Layer.
4. Every schema field carries source-traceability metadata (`sourceContractSection`, `sourceCatalogId` where applicable).
5. A CI hook validates `template-contract.json` on every PR that touches it.
6. No secret-bearing fields are present in any schema.
7. Procore Mapping Schema declares allowed and forbidden shapes per Contract P-10 closure.
8. Deprecated values (`preconstruction_only`, `warranty_closeout`, `Archived`-as-stage, `active_construction`-as-ProjectType) appear only as forbidden-value validation, never as valid enum members.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Phase 1 extractor inherits the example-level coverage of §16 Common List Schema Pattern and produces uneven schemas across object families. | Step 1 P1 items B-04 (per-object consolidation) and B-02 (uniform markers) executed inside Phase 1 before generation. |
| Phase 1 surfaces a previously undecided architectural point and resolves it inside the schema, smuggling architecture decisions into machine-readable form. | Phase 1 entry gate criterion #5: no new architecture decisions in schema output; undecided points return to Phase 0 review. |
| Procore canonical-model package gets pulled into Phase 1 inputs and inflates Phase 1 scope. | Out-of-Scope list above; Procore Mapping Schema constrained to Contract P-10 allowed shapes only. |
| Validation rules implemented partially (only enum bindings) and conditional / cross-field rules deferred informally. | Validation Rule Table Plan groups rules by category and Enforcement Layer; "Blocks Generation If Missing" flag forces resolution. |
| Schema family taxonomy gets defined ad hoc per file rather than declared up front. | Step 2 declares the 14-family taxonomy in `Phase_0_Step_2_Schema_Family_Taxonomy.md` for Phase 1 review and acceptance. |
| Cross-layer behavior (no direct SPFx-to-Procore calls) implied as schema-enforceable when it is not. | Validation Rule Table Plan distinguishes Enforcement Layer (Schema, Provisioning, Backend, SPFx, Site Health, Governance, Documentation, Cross-Layer); cross-layer rules are documented in governance metadata and tested in SPFx / backend tests, not enforced by JSON Schema validators alone. |

## Recommended Next Step

After review and acceptance of this plan plus the three companion deliverables, **Phase 1 — Machine-Readable Template Contract** should not proceed to schema generation until these four files are reviewed and accepted. Once accepted and the Phase 1 entry gate holds, Phase 1 may begin creating `packages/project-site-template/`. No Prompt 02 architecture-gap escalation was required during Step 2 planning.
