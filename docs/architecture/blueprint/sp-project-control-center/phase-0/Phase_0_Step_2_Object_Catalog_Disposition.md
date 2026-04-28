# Phase 0 Step 2 — Object Catalog Disposition

## Purpose

This document dispositions every row in Contract §4A Template Object Catalog for the future Phase 1 — Machine-Readable Template Contract effort. Each row receives one of seven disposition values, a proposed schema family from the Phase 0 Step 2 planning taxonomy, an MVP treatment, dependencies on other catalog rows or schema families, and flags for whether the row requires per-object field consolidation (Step 1 backlog item B-04) or validation-rule extraction (B-01).

The disposition table covers all 18 Object Catalog rows from Contract §4A (lines 166–192) verified during Step 2 planning. No rows are invented. The Object Catalog is the canonical index; Phase 1 schema entries trace back to these rows.

## Source of Truth

- **Primary**: `Standard_Project_Site_Template_Contract.md` §4A Template Object Catalog (lines 166–192). The catalog header reads: "This catalog enumerates every provisioned object kind so future schema extraction (`packages/project-site-template/template-contract.json`) has a stable index. Every object in a provisioned site must trace back to a row in this catalog."
- **Secondary**: Owning Contract sections per row (§5, §6, §8, §10, §12, §13, §14, §15, §15.13, §17, §18, §18.1, §19).
- **Strategic alignment**: Blueprint §8 PCC Shell, §9 Module Map, §31 Control Center Settings, §32 Site Health and Drift, §35 Permission and Access Architecture, §36 External Integration, §36A Procore Integration Layer.
- **Procore canonical-model package**: out of scope for Phase 1; informs Phase 8 / Phase 9 only.

## Disposition Rules

A row receives a disposition based on this decision flow:

1. If the row is **MVP and fully specified in the Contract**, disposition = `Extract in Phase 1`.
2. If the row is **MVP placeholder per Contract §4A** (e.g., seeded `Enabled=false` or "MVP placeholder; populated when sync enabled"), disposition = `Extract as Placeholder in Phase 1`.
3. If the row is **Future per Contract §4A and not required for MVP**, disposition = `Defer from Phase 1`.
4. If the row is **fully runtime-configured per Contract §10** with no schema-time content, disposition = `Runtime Configuration Reference`.
5. If the row is **gated by an explicit proof gate** in the Decision Closure Register, disposition = `Proof-Gated Reference`.
6. If the row is **explicitly out of Phase 1 scope** (e.g., Procore canonical-model entities), disposition = `Out of Scope`.
7. If a disposition cannot be made without a new architecture decision, disposition = `Needs Architecture Review` and the row returns to Phase 0 review.

Procore-related rows additionally honor the **no-full-Procore-mirror** constraint from Contract P-10 closure: allowed shapes are mapping, summary, exception, action queue, sync health, audit, object link; forbidden shapes are raw payload, high-volume detail history, bulk attachment, full binary mirror. Catalog rows 17 and 18 are placeholder / future-reference treatments only and never become full Phase 1 Procore canonical models.

## Object Catalog Disposition Table

| Catalog ID | Contract Object Kind | Contract Section | Proposed Schema Family | MVP Treatment | Extraction Disposition | Dependencies | Required Field Consolidation? | Required Validation Rules? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Site | §5, §6 | `site` | MVP | Extract in Phase 1 | `enums`, `settings`, `permissions` | Yes | Yes | Includes site URL pattern (§5.1), display name (§5.2), project number (§5.3), short-name sanitization (§5.4), phase association (§5.5), archived naming (§5.6), title updates (§5.7), and §6 Project Metadata Contract fields. |
| 2 | Site Pages | §13 | `pages` | MVP for ~9; Future for ~6 | Extract in Phase 1 | `site`, `permissions` | Yes | Yes | Each page row carries `mvp_status: frozen_for_mvp` or `mvp_status: future`. Page-region binding traces to §7 PCC Shell regions. Future pages remain in schema as deferred placeholders, not omitted. |
| 3 | Document Libraries | §14 | `libraries` | MVP for 8; Future for 4 | Extract in Phase 1 | `site`, `permissions`, `enums` | Yes | Yes | Library prefix convention (`01_…` … `99_Archive`) preserved. Read-only-on-archive rule encoded as a status-driven validation rule (Validation Rule Table VR-09). |
| 4 | SharePoint Lists | §15 | `lists` | MVP for ~13; Future for the rest | Extract in Phase 1 | `site`, `permissions`, `enums` | Yes | Yes | Per-list extraction inherits from §16 Common List Schema Pattern as a shared reference and overrides only where §15 specifies. Future lists remain as deferred placeholders. |
| 5 | List/Library Fields | §15, §16 | `lists` / `libraries` (children) | Mixed | Extract in Phase 1 | rows 3, 4 | **Yes (highest priority)** | Yes | Step 1 P1 backlog item B-04 explicitly targets this row: per-object column consolidation across §13 / §14 / §15 with §16 as the shared pattern reference. Required / optional markers applied uniformly per B-02. |
| 6 | Views | §13–§15 | `lists` / `libraries` (children) | MVP for default views | Extract in Phase 1 | rows 2, 3, 4 | Yes | No | MVP scope is default views only; named views per list/library are Future. |
| 7 | SharePoint Groups | §12.2 | `permissions` | MVP | Extract in Phase 1 | `enums` | No | Yes | Core 12 groups per §12.2; group-to-template binding encoded as referential rule (VR-25 / VR-26 family). |
| 8 | Permission Templates | §12.4 | `permissions` | MVP for 10; Future/deferred for 3 | Extract in Phase 1 | row 7, `enums` | Yes | Yes | External-user templates (3 of 13) extracted as `mvp_status: deferred` placeholders per Contract §11.5 and D-04 closure. Mapping owner constraints encoded as ownership rules (VR-11). |
| 9 | Configuration Records | §10, §15 | `settings` | MVP | Extract in Phase 1 | `enums` | Yes | Yes | Project Site Configuration, Module Configuration, Permission Template Configuration, Integration Configuration. Settings tier rules encoded as validation rules. |
| 10 | Module Records | §8 | `modules` | MVP for 8; Future for 12 | Extract in Phase 1 | `pages`, `lists`, `libraries`, `permissions` | Yes | Yes | 20 modules per §8.1; visibility keyed on ProjectStage (VR-07). HBI Assistant module (Blueprint §30) extracted as `mvp_status: deferred`. |
| 11 | Integration Records | §18 | `integrations` | MVP for Procore + Sage Intacct; rest Future | Extract in Phase 1 | `settings`, `enums`, `permissions` | Yes | Yes | 8 integration records (Procore, Sage Intacct, Compass, Document Crunch, Adobe Sign, Cupix, Teams, Outlook). MVP-active records: Procore + Sage. Future records extracted as deferred placeholders. Procore write-back forbidden in MVP. |
| 12 | Health Records | §19 | `site-health` | MVP | Extract in Phase 1 | (all families) | Yes | Yes | Severity tiers (VR-21) and Repair Automation tiers (VR-22) bind to `enums`. Drift events extracted as part of Site Health family. |
| 13 | Workflow Template Records | §17 | `workflows` | MVP for 5; Future for 3 | Extract in Phase 1 | `lists`, `permissions`, `modules` | Yes | Yes | MVP workflows: Startup, Closeout, Permits, Inspections, Responsibility Matrix. Future: Owner-Contract Matrix, Subcontractor Scorecard, Lessons Learned (extracted as `mvp_status: future`). |
| 14 | Procore Project Mapping | §15.13, §18.1 | `integrations` | MVP | Extract in Phase 1 | `settings` (`ProcoreCompanyId`), `permissions` (mapping owner) | Yes | Yes | One mapping per site. Three-form `ProcoreCompanyId` contract (canonical, surface, business) bound (VR-10). PM/PX ownership rule (VR-11). |
| 15 | Procore Subject Area Registry | §15.13, §18.1 | `integrations` | MVP (rows seeded `Enabled=false`); enablement Future per Recommended Practical scope | Extract as Placeholder in Phase 1 | row 14, `enums` | Yes | Yes | 6 subject areas seeded with `Enabled=false`. Activation is Future / Recommended Practical scope. Schema declares the placeholder shape; activation gates remain in backend logic, not schema. |
| 16 | Procore Sync Health | §15.13, §19, §18.1 | `site-health` | MVP placeholder; populated when sync enabled | Extract as Placeholder in Phase 1 | row 14, row 15, `enums` | Yes | Yes | One default sync-health record plus N per enabled subject area. MVP scope is placeholder shape; population requires backend sync activation. |
| 17 | Procore Object Link Records | §15.13, §18.1 | `integrations` | Future (Recommended Practical) | Defer from Phase 1 (placeholder shape only) | row 14 | No | No | **Placeholder / future-reference treatment only.** Phase 1 declares the shape (object link with stable Procore object reference + canonical entity reference) so Phase 9 Recommended Practical work can populate. **Does not become a full Procore canonical model in Phase 1.** Honors no-full-Procore-mirror rule (Contract P-10). |
| 18 | Procore Curated Summary Records | §15.13, §18.1 | `integrations` | Future (Recommended Practical) — placeholder in MVP | Defer from Phase 1 (placeholder shape only) | row 14, row 15, row 17 | No | No | **Placeholder / future-reference treatment only.** Phase 1 declares the shape (curated summary per enabled subject area: RFI summary, observation summary, etc.) so Phase 9 work can populate. **Does not become a full Procore canonical model in Phase 1.** Honors no-full-Procore-mirror rule (Contract P-10). |

All 18 Catalog rows from Contract §4A are dispositioned. No additional rows discovered in Contract content beyond §4A; no Potential Catalog Gap table required.

## Cross-Family Dependencies

Dependencies between schema families, derived from the table above:

- `site` depends on `enums`, `settings`, `permissions`.
- `pages` depends on `site`, `permissions`, and references `modules`, `lists`, `libraries`.
- `libraries` depends on `site`, `permissions`, `enums`.
- `lists` depends on `site`, `permissions`, `enums`.
- `modules` depends on `pages`, `lists`, `libraries`, `permissions`.
- `workflows` depends on `lists`, `permissions`, `modules`.
- `integrations` depends on `settings`, `enums`, `permissions`.
- `site-health` references all primitive and behavior families through object references.
- `provisioning-validation` depends on every family (cross-family sweep).
- `template-manifest` references every family (root wrapper).
- `enums` and `validation-rules` are foundations referenced by all families.

The Phase 1 extraction sequence in `Phase_0_Step_2_Schema_Extraction_Plan.md` orders the 12 steps to honor these dependencies.

## MVP / Future / Deferred Treatment

- **MVP rows**: 1, 7, 9, 12, 14 (full MVP); rows 2, 3, 4, 8, 10, 11, 13 (mixed MVP / Future with `mvp_status` per item).
- **Future rows extracted as placeholders**: row 6 (named views), portions of rows 2, 3, 4, 8, 10, 11, 13 marked Future; row 15 (Subject Area Registry seeded `Enabled=false`), row 16 (Sync Health placeholder).
- **Future rows deferred from Phase 1**: row 17 (Procore Object Links), row 18 (Procore Curated Summaries) — placeholder shape only, no Procore canonical model.

Every Future or Deferred item carries `mvp_status` matching the Decision Closure Register vocabulary (`Frozen for MVP`, `Runtime Configuration`, `Deferred`, `Proof-Gated`).

## Runtime Configuration Treatment

Runtime Configuration values per Contract §10 tier rules and the Decision Closure Register:

- `ProcoreCompanyId` (default `5280`) — Runtime Configuration; configuration not secret. Schema field exists with default value; runtime value assigned by PCC Admin. (VR-10.)
- Procore directory comparison enablement — Runtime Configuration; backend toggles read-only comparison.
- Module Configuration values — Runtime Configuration per `settings` tier rules.
- Per-project integration toggles within MVP-allowed integrations — Runtime Configuration.

Runtime Configuration rows are extracted in Phase 1 as schema fields with default values; the runtime value is assigned by configuration UI (PCC Settings).

## Proof-Gated Treatment

Proof-Gated rows per Decision Closure Register:

- Procore sync cadence (proof gate: cadence and webhook-vs-polling decision).
- Large-attachment treatment (proof gate per Contract Procore boundary).
- Other Proof-Gated rows recorded in the Decision Closure Register.

Proof-Gated rows are extracted in Phase 1 as schema references with `mvp_status: proof_gated`. The proof gate itself remains a decision artifact, not a schema field.

## Objects Requiring Field-Level Consolidation

Per Step 1 P1 backlog items B-02 (uniform markers) and B-04 (per-object consolidation), the following Catalog rows require field-level consolidation work in Phase 1 before JSON Schema generation:

- Row 2 (Site Pages) — per-page field set with `mvp_status` per page.
- Row 3 (Document Libraries) — per-library field set; metadata, views, archive behavior.
- Row 4 (SharePoint Lists) — per-list field set; the largest consolidation effort (~70 lists).
- Row 5 (List/Library Fields) — **highest priority**; ~600+ fields across the catalog.
- Row 6 (Views) — default views per list/library at MVP.
- Row 8 (Permission Templates) — 13 templates; required fields per Permission Template Contract.
- Row 9 (Configuration Records) — Settings tier rules.
- Row 10 (Module Records) — 20 modules; visibility rule per module.
- Row 11 (Integration Records) — 8 records; mapping shape per record.
- Row 12 (Health Records) — health record fields, severity, repair tier.
- Row 13 (Workflow Template Records) — 8 workflows; trigger rules; action generators.
- Row 14 (Procore Project Mapping) — three-form `ProcoreCompanyId` contract.
- Row 15 (Procore Subject Area Registry) — placeholder shape with subject area metadata.
- Row 16 (Procore Sync Health) — placeholder shape; severity bindings.

Rows 17 and 18 are placeholder-only and do **not** require field-level consolidation in Phase 1.

## Objects Requiring Validation Rule Extraction

Per Step 1 P1 backlog item B-01, the following Catalog rows contribute rules to the Validation Rule Table:

- Row 1 (Site) — naming, archive behavior, Status-driven read-only.
- Row 4 (SharePoint Lists) — Status-driven read-only, lookup referential integrity.
- Row 8 (Permission Templates) — ownership constraints, external-user deferral.
- Row 9 (Configuration Records) — Settings validation, tier rules.
- Row 10 (Module Records) — visibility keyed on ProjectStage, rollup contribution.
- Row 11 (Integration Records) — Procore boundary rules, no-secret rule, Sage system-of-record.
- Row 12 (Health Records) — severity binding, repair-tier binding.
- Row 13 (Workflow Template Records) — trigger rules, action-generation referential.
- Row 14 (Procore Project Mapping) — three-form `ProcoreCompanyId`, ownership.
- Row 15 (Procore Subject Area Registry) — enablement gate.
- Row 16 (Procore Sync Health) — sync-state validation.

Rows 17 and 18 contribute placeholder-shape rules only (allowed-shape adherence per Contract P-10), not full validation logic.

## Objects Excluded From Phase 1

The following are excluded from Phase 1 schema extraction:

- **Procore canonical-model entities** in `procore_hbintel_data_model_package` (subject areas, canonical entities, transactional and event-level models, relational mapping concepts, endpoint-to-entity crosswalks, star schema). Reason: Phase 8 / Phase 9 scope; Contract P-10 forbids full Procore mirror; canonical model is research material.
- **HBI Assistant module schema** beyond a deferred placeholder (Blueprint §30; Roadmap §8 must-not-include).
- **Procore write-back schema** (Roadmap §8 must-not-include; pending ADR).
- **External user permission templates as active templates** (Contract §11.5; D-04 closure; deferred).
- **Per-ProjectType seed expansion** beyond initial seed sets (Contract §4B.2; Roadmap deferred set).
- **Cupix deepening** (README "Key Deferred Decisions").
- **Schema files** (any `.schema.json`) — Phase 1 work, not Phase 0.
- **`packages/project-site-template/` directory creation or stub** — Phase 1 work, not Phase 0.

## Open Questions

The audit and Step 2 disposition exercise identified no open architectural questions. If Phase 1 surfaces an architectural ambiguity (e.g., a referential rule with no Contract anchor, an object that does not fit any of the 14 families), the question returns to Phase 0 review and is added here before Phase 1 continues.

## Phase 1 Handoff

Phase 1 — Machine-Readable Template Contract should not proceed to schema generation until this disposition table and the three companion Step 2 deliverables are reviewed and accepted. Phase 1 begins with:

1. Acceptance of the 18-row disposition above.
2. Acceptance of the 14-family taxonomy (companion `Phase_0_Step_2_Schema_Family_Taxonomy.md`).
3. Acceptance of the Validation Rule Table structure and 30-row initial inventory (companion `Phase_0_Step_2_Validation_Rule_Table_Plan.md`).
4. Acceptance of the 12-step extraction sequence (companion `Phase_0_Step_2_Schema_Extraction_Plan.md`).

After acceptance and confirmation that the Phase 1 entry gate holds, Phase 1 may begin creating `packages/project-site-template/`. No Prompt 02 architecture-gap escalation was required during Step 2.
