# Phase 0 Step 1 — Schema Extraction Readiness Backlog

## Purpose

This backlog converts the findings of the Phase 0 Step 1 audit into a prioritized, work-typed item list that prepares the architecture for Phase 1 — Machine-Readable Template Contract. Items are grouped by priority (P0, P1, P2, P3) and tagged with a work type (Documentation / Architecture; Schema / Contract Extraction; Backend Provisioning; SPFx Experience; Data / Integration; Governance / Security; Adoption / Operations). Each item carries a source / trigger from the audit, an owner category (specific named owners may follow), a dependency, a "blocks Phase 1" flag, and acceptance criteria.

This backlog **prepares Phase 1 explicitly**. It does not introduce new architecture decisions and is bounded by the rule that any undecided point surfaced during Phase 1 returns to Phase 0 architecture review rather than being resolved inside the schema.

Anti-regression tokens (`preconstruction_only`, `warranty_closeout`, `Archived`-as-stage, `active_construction`-as-ProjectType) appear in this backlog **only inside anti-regression rule statements** in acceptance criteria, never as valid enum values.

## Readiness Summary

The Consistency Check Register has zero `Fail` rows. The audit's Recommended Next Step is to open Phase 1 — Machine-Readable Template Contract. P0 blockers: **none**. P1 representation work executes inside Phase 1 as its first step.

## P0 Blockers

None. The Consistency Check Register has zero `Fail` rows. If a `Fail` row is later introduced (e.g., by a governing document edit), the readiness decision must downgrade and a P0 blocker is added here before Phase 1 may proceed.

## P1 Required Before Schema Extraction

These items must be closed inside Phase 1, before per-family JSON Schema files are generated, so the extracted schemas do not inherit narrative-format gaps.

| ID | Priority | Work Type | Item | Source / Trigger | Owner | Dependency | Blocks Phase 1? | Acceptance Criteria |
|---|---|---|---|---|---|---|---|---|
| B-01 | P1 | Documentation / Architecture | Consolidate enum and validation rules currently expressed in narrative prose into a structured Validation Rule Table indexed by field, covering enum bindings, conditional visibility, Status-driven read-only behavior, Stage-gated module visibility, and referential rules. | Audit F-15; Contract §3.2, §4B.0, §4B.1, §4B.2, §10.6, §19. | Doc/Arch | Contract and Blueprint frozen. | No (executes inside Phase 1 as its first step) | A single Validation Rule Table exists with one row per field-level rule; rule-type taxonomy includes enum_binding, conditional_visibility, status_read_only, stage_gated_visibility, referential; every row cites a Contract section anchor; no rule introduces a new architecture decision. |
| B-02 | P1 | Documentation / Architecture | Apply uniform required / optional markers across the Object Catalog (Contract §4A) and §13 / §14 / §15 per-object detail. | Audit F-14; Contract §4A line 166, §13 line 867, §14 line 893, §15 line 980. | Doc/Arch | B-01 (so referential rules are known when marking required). | No | Every column in §13 / §14 / §15 has an explicit required / optional marker; every Object Catalog row cross-references the marker source; deferred items keep `mvp_status: deferred` rather than being omitted. |
| B-03 | P1 | Schema / Contract Extraction | Declare the Schema Family taxonomy and map every Object Catalog row to one family. | Audit F-16; Contract §4A line 166. | Schema/Contract | None. | No (must be declared before per-family extraction begins) | Schema Family taxonomy is declared with these families: List Schema, Library Schema, Page Schema, Module Schema, Permission Template Schema, Workflow Schema, Procore Mapping Schema, Site Health Schema, Settings Schema; every Object Catalog row maps to exactly one family; no row maps to none and no row maps to multiple. |
| B-04 | P1 | Schema / Contract Extraction | Consolidate per-object column lists from Contract §13 / §14 / §15 into per-object schema definitions, with §16 Common List Schema Pattern as the shared pattern reference. | Audit F-13; Contract §13 line 867, §14 line 893, §15 line 980, §16 line 1337. | Schema/Contract | B-02. | No | Every list, library, and page in the Object Catalog has a per-object column definition that inherits from the §16 Common List Schema Pattern and overrides only where Contract §13 / §14 / §15 specify; pattern reference is a single shared definition, not duplicated per object. |
| B-05 | P1 | Schema / Contract Extraction | Define the enum-binding contract per field for the three identity enums (ProjectType, ProjectStage, ProjectStatus) and for `mvp_status`. | Audit F-01, F-02, F-03, F-19; Contract §3.2, §4B.0, §4B.1, §22. | Schema/Contract | B-01. | No | ProjectType binding is the five-value set; ProjectStage binding is the six-value set; ProjectStatus binding is the four-value set; `mvp_status` binding is the four-status Decision Closure Register set; deprecated values (`preconstruction_only`, `warranty_closeout`, `Archived`-as-stage, `active_construction`-as-ProjectType) appear only as forbidden-value validation, never as valid members. |
| B-06 | P1 | Schema / Contract Extraction | Define Procore Mapping Schema shape constraints: allowed shapes (mapping, summary, exception, action queue, sync health, audit, object link); forbidden shapes (raw payload, high-volume detail history, bulk attachment, full binary mirror). | Audit F-10; Contract P-10 closure (~line 2091); Blueprint §36A. | Schema/Contract | B-03. | No | Procore Mapping Schema family declares allowed-shape and forbidden-shape sets; every Procore-related Object Catalog row maps to an allowed shape; no row maps to a forbidden shape. |
| B-07 | P1 | Schema / Contract Extraction | Define Permission Template Schema bindings: business label, internal mapping, MVP status. Mark external-user templates as `mvp_status: deferred`. | Audit F-11; Contract §11.5 line 713, §12 line 759, D-04 closure. | Schema/Contract | B-03, B-05. | No | Every permission template has a business label, a mapped internal definition, and an `mvp_status`; external-user templates exist as `mvp_status: deferred` placeholders, not as active templates. |
| B-08 | P1 | Schema / Contract Extraction | Define Site Health Schema shape: severity tier enum (Info, Warning, Blocking, Repair Required, Security Risk) and Repair Automation tier enum (T1 auto, T2 approval, T3 IT security, T4 manual only). | Audit F-12; Contract §19 line 1627, §19A line 1726; Blueprint §32. | Schema/Contract | B-03. | No | Site Health Schema declares severity and repair-tier enum bindings; every checked condition in Contract §19 maps to one severity and (where applicable) one repair tier. |
| B-09 | P1 | Documentation / Architecture | Confirm the `ProcoreCompanyId` triple-form contract (canonical `procore_company_id`, surface `ProcoreCompanyId`, business label "Procore Company ID = `5280`") is encoded as a Validation Rule Table entry. | Audit F-04; Contract §18.1.5 line 1507; P-03 closure line 2084; Blueprint §36A lines 2420–2426. | Doc/Arch | B-01. | No | Validation Rule Table includes a single entry binding the three forms; Site Health flag for blank or non-`5280` value (absent approved exception) is encoded as an enum_binding plus a conditional rule. |
| B-10 | P1 | Governance / Security | Confirm no secret-bearing fields are present in any per-family schema; confirm `source_system` and operational-vs-accounting classification is present on financial-domain fields. | Audit F-07, F-08; Contract R4 around line 1503; Contract §18 financial labeling around line 1482; P-11 closure. | Governance/Security | B-04. | No | A schema review pass confirms no field is named or shaped to carry a secret; financial-domain fields carry `source_system` (Procore vs Sage) and a classification (operational vs accounting). |

## P2 Can Proceed During Schema Extraction

These items run in parallel with Phase 1 generation work; they do not gate per-family schema files but must be in place before Phase 2 (Provisioning Foundation) consumes the schemas.

| ID | Priority | Work Type | Item | Source / Trigger | Owner | Dependency | Blocks Phase 1? | Acceptance Criteria |
|---|---|---|---|---|---|---|---|---|
| B-11 | P2 | Backend Provisioning | Select a JSON Schema validator (Draft 2020-12 or equivalent) and design a CI hook to validate `template-contract.json` on every change. | Audit F-13, F-14, F-15. | Backend Provisioning | B-04. | No | Validator selected and pinned; CI hook validates the JSON contract on every change; CI fails on schema-shape regressions. |
| B-12 | P2 | Backend Provisioning | Tooling stub for `packages/project-site-template/` to host the Phase 1 output. | Contract §22 deferred targets (lines 2140–2143). | Backend Provisioning | B-03. | No | Package directory is created with a minimal manifest that declares it as the Phase 1 output target; package is referenced by Phase 2 provisioning code. |
| B-13 | P2 | Backend Provisioning | Capture provisioning idempotency rules: if a list / library / page already exists at the expected shape, do not re-create; if the shape drifts, route via Site Health and Repair Automation. | Audit F-12; Contract §19 / §19A. | Backend Provisioning | B-03. | No | Idempotency rule set is documented per object family and bound to Site Health severity / Repair Automation tier mapping. |
| B-14 | P2 | Governance / Security | Encode drift-detection schema into the Site Health Schema family so drift events have a uniform shape across object families. | Audit F-12; Contract §19. | Governance/Security | B-08. | No | Site Health Schema family includes a drift-event shape with severity, object reference, expected vs observed snapshot, and detected-at timestamp. |
| B-15 | P2 | SPFx Experience | SPFx full-page PCC shell consumes module schemas through a single read-only adapter that does not bypass `mvp_status` filtering. | Audit F-06; Contract §7 line 389; Blueprint §8 line 297, §9 line 350. | SPFx Experience | B-03. | No | Adapter API is documented; every consumer goes through the adapter; `mvp_status: deferred` items are not surfaced to the SPFx UI. |

## P3 Future / Post-Extraction

These items are explicitly deferred and must not be drawn into Phase 1 scope.

| ID | Priority | Work Type | Item | Source / Trigger | Owner | Dependency | Blocks Phase 1? | Acceptance Criteria |
|---|---|---|---|---|---|---|---|---|
| B-16 | P3 | Adoption / Operations | HBI Assistant integration. | Blueprint §30 line 1927; Roadmap §8 must-not-include set. | Adoption/Operations | Phase 1 + Phase 2 + Phase 3 complete. | No | Out of scope for MVP; revisit after Phase 3. |
| B-17 | P3 | Data / Integration | Procore write-back schema family. | Roadmap §8 must-not-include set. | Data/Integration | Phase 8 complete; ADR for write-back. | No | Out of scope for MVP; revisit at Phase 9 / Phase 10. |
| B-18 | P3 | Governance / Security | External user permission template extraction. | Audit F-11; Contract §11.5 line 713; D-04 closure. | Governance/Security | ADR for external user posture. | No | Out of scope for MVP; placeholder template remains `mvp_status: deferred`. |
| B-19 | P3 | Adoption / Operations | Cupix deepening. | README "Key Deferred Decisions". | Adoption/Operations | Phase 5 / Phase 6 complete. | No | Out of scope for MVP. |
| B-20 | P3 | Data / Integration | Per-ProjectType seed expansion (beyond initial seed sets). | Contract §4B.2 conditional seeding line 226; Roadmap deferred set. | Data/Integration | Phase 1 + Phase 2 complete. | No | Out of scope for MVP; current seed sets remain authoritative. |

## Object Families Requiring Extraction

Sourced from Contract §4A Template Object Catalog (line 166) and §13 / §14 / §15 / §17 / §10 / §11 / §12 / §19 detail:

- Lists (per Contract §15)
- Document Libraries (per Contract §14)
- Standard Pages (per Contract §13)
- Modules / Work Centers (per Contract §8 line 419 and Blueprint §9 line 350)
- Permission Templates (per Contract §12 line 759)
- Workflow Definitions (per Contract §17 line 1363)
- Procore Mappings (per Contract §10.6 line 590, §18 line 1449, Blueprint §36A line 2376)
- Site Health Records (per Contract §19 line 1627)
- Control Center Settings (per Contract §10 line 534)

## Required Schema Families

Phase 1 must produce one schema family per row, with all per-object schemas inheriting from the family's shared shape:

1. **List Schema** — covers all SharePoint lists in the Object Catalog.
2. **Library Schema** — covers all document libraries.
3. **Page Schema** — covers all Standard Pages.
4. **Module Schema** — covers all Work Centers / Modules.
5. **Permission Template Schema** — covers all Permission Templates, including deferred placeholders.
6. **Workflow Schema** — covers all Seeded Workflow Templates.
7. **Procore Mapping Schema** — covers Procore mappings, summaries, exceptions, action queues, sync health, audits, object links; rejects raw payloads, high-volume detail histories, bulk attachments, full binary mirrors.
8. **Site Health Schema** — covers Site Health Records, drift events, repair-tier classifications.
9. **Settings Schema** — covers Control Center Settings, including Procore Settings (§10.6) and the SharePoint Site Access vs M365 Group / Teams distinction (§10.5).

## Recommended Extraction Order

Foundation → primitives → behavior → integration → operations:

1. **Settings Schema** — foundation; carries identity enums, `ProcoreCompanyId`, configuration tiers.
2. **Permission Template Schema** — primitives; carries access bindings consumed by every other family.
3. **List Schema** — primitives; consumes Permission Template bindings and identity enums.
4. **Library Schema** — primitives; consumes Permission Template bindings.
5. **Page Schema** — primitives; references Lists and Libraries.
6. **Module Schema** — behavior; references Pages, Lists, Libraries, and Permission Templates.
7. **Workflow Schema** — behavior; references Modules and Permission Templates.
8. **Procore Mapping Schema** — integration; references Settings (Procore Settings).
9. **Site Health Schema** — operations; references all other families through object references.

## Validation Rules Required for Phase 1

The Validation Rule Table (B-01) must cover at least these rule types, with each rule type implemented uniformly across affected fields:

- **enum_binding** — identity enums (ProjectType, ProjectStage, ProjectStatus), `mvp_status`, severity tiers, repair-automation tiers, Procore Mapping shape categories.
- **forbidden_value** — anti-regression bindings: `preconstruction_only`, `warranty_closeout`, `active_construction`-as-ProjectType, `Archived`-as-stage are rejected.
- **conditional_visibility** — Stage-gated module visibility per Contract §4B.2 conditional seeding (line 226) and §8 module visibility rules.
- **status_read_only** — Status-driven read-only behavior on transition to `Archived` per Contract §3.2 (line 94) and §5.6 (line 303).
- **referential** — cross-family references (e.g., a Module Schema row references a Page Schema row by stable identifier).
- **owner_constraint** — Procore mapping owner = PM with PX fallback; Project Accountant excluded; per Contract P-04 closure (line 2085).
- **secret_omission** — schema fields must not name or shape a secret per Contract R4 (around line 1503).
- **source_system_classification** — financial-domain fields carry `source_system` and operational-vs-accounting classification per Contract §18 (around line 1482) and P-11 closure.

## Open Questions

The audit identified no architectural open questions. Schema-extraction representation work is entirely within the bounded P1 set above. If Phase 1 surfaces an architectural ambiguity (e.g., a Validation Rule Table row that has no Contract anchor), the question returns to Phase 0 review and is added to this section before Phase 1 continues.

## Phase 1 Entry Criteria

Phase 1 — Machine-Readable Template Contract may open when **all** of the following hold:

1. **Zero `Fail` rows** in the Phase 0 Step 1 Consistency Check Register. As authored, the Register has zero `Fail` rows.
2. **P1 backlog items assigned to owner categories**. Each P1 item (B-01 through B-10) carries a named owner category in this backlog. Specific named owners may follow, but category assignment is the entry gate.
3. **Schema family taxonomy confirmed**. The nine families listed under "Required Schema Families" are reviewed and accepted as the canonical taxonomy before per-family schema files are generated.
4. **Contract and Blueprint frozen during extraction**. No edits to `Standard_Project_Site_Template_Contract.md` or `HB_Project_Control_Center_Target_Architecture_Blueprint.md` during Phase 1. Any required architecture change during Phase 1 re-opens Phase 0 Step 1 rather than being absorbed into the schema.
5. **No new architecture decisions embedded in schema output**. Phase 1 extracts existing decisions into machine-readable form only. If extraction surfaces an undecided point, it returns to Phase 0 architecture review and is added to "Open Questions" above; it is not resolved inside the schema.

When all five hold, Phase 1 may begin with B-01 (Validation Rule Table) and B-03 (Schema Family taxonomy) executed first, followed by B-02, B-04, and B-05 through B-10, then per-family JSON Schema generation.
