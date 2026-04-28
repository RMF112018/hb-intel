# Phase 0 Step 1 — Architecture Stabilization Audit

## Executive Summary

This audit confirms that the Project Control Center (PCC) governing architecture is stable enough to drive machine-readable schema extraction in Phase 1. All consistency rules required by Phase 0 Step 1 pass against the current Standard Project Site Template Contract (the implementation source of truth) and the HB Project Control Center Target Architecture Blueprint (the strategic north-star). The two governing documents are internally consistent on enums, Procore boundaries, Team & Access governance, Control Center Settings scope, Site Health and drift posture, system-of-record boundaries, and Decision Closure Register statuses. No deprecated enum values appear as active values; the anti-regression rules from prior remediation passes (D-12 in the Decision Closure Register) hold across Contract, Blueprint, README, and Roadmap.

The audit's substantive findings are concentrated in **schema-extraction representation readiness**, not in architectural defects. The Contract is intentionally human-readable and authored as an implementation source of truth; it is not yet structured as a machine-readable extractor input. The "Common List Schema Pattern" (Contract §16) is illustrative-by-design rather than exhaustive; column-level required/optional markers are not uniformly applied across all object families; and validation rules live in narrative prose rather than in a structured rule table. These are the work items Phase 1 must close in order to produce `packages/project-site-template/template-contract.json`, and they are recorded as P1 backlog items on the Schema Extraction Readiness Backlog. None of them are P0 blockers to opening Phase 1.

The recommended next step is to open Phase 1 — Machine-Readable Template Contract — using the readiness backlog as its starting work set, with an explicit gate that Phase 1 introduces no new architecture decisions. If extraction surfaces an undecided point, it returns to Phase 0 architecture review rather than being resolved inside the schema.

## Scope and Source Files

This audit covers the governing PCC architecture set:

- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md` — implementation source of truth; defines enums, Object Catalog, Procore boundaries, Team & Access, Permission Templates, Pages, Libraries, Lists, Common List Schema Pattern, Workflow Templates, External Integration, Site Health and Repair, Provisioning Validation, MVP Template, Decision Closure Register.
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md` — strategic north-star; mirrors Contract on enums, Procore rules, Team & Access, Control Center Settings, Site Health, Procore Integration Layer (§36A), Data Relationship Model, Implementation Roadmap, MVP Recommendation, and a parallel Decision Closure Register.
- `docs/architecture/blueprint/sp-project-control-center/README.md` — directory governance, source-of-truth hierarchy, current frozen decisions, deferred decisions, guardrails, validation notes.
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md` — 10-phase execution sequence; Phase 0 (Architecture Stabilization and Schema Extraction Planning, P0) and Phase 1 (Machine-Readable Template Contract, P0) explicitly defined.
- `docs/architecture/blueprint/sp-project-control-center/procore_hbintel_data_model_package/README.md` — specialized Procore canonical-model research; informs Phase 8 / Phase 9 only; not a Phase 0 / Phase 1 input.

The audit produces three artifacts in `phase-0/`: this stabilization audit, a Consistency Check Register, and a Schema Extraction Readiness Backlog.

## Architecture Baseline

The MVP architecture is frozen via the Decision Closure Register (Contract §22, lines 2017–2098; mirrored in Blueprint). The Register uses exactly four allowed statuses: `Frozen for MVP`, `Runtime Configuration`, `Deferred`, `Proof-Gated`. Frozen decisions cover the three identity enums (D-12 ProjectType, D-13 ProjectStage / ProjectStatus split), Procore boundaries (P-01 through P-17), Team & Access posture (D-04 external user deferral, hybrid group model, phase-based access managers), Control Center Settings shape, Permission Templates, Provisioning Validation, Site Health severity tiers, and Repair Automation tiers (T1–T4).

The Object Catalog (Contract §4A, line 166) provides the stable index every provisioned object must trace back to; it is the foundation row set on which Phase 1 will hang machine-readable schema family identifiers.

The Roadmap names Phase 0 (this audit) and Phase 1 (the machine-readable contract) as the two P0 items that must complete before backend provisioning, SPFx surfaces, integration work, or governance/adoption work begin.

## Key Findings

| Finding ID | Severity | Source | Issue | Implementation Impact | Recommended Resolution | Blocks Schema Extraction? |
|---|---|---|---|---|---|---|
| F-01 | Informational | Contract §4B.0 (line 203), §4B.1 (line 216), Blueprint Decision Closure Register | ProjectType (5 values) and ProjectStage (6 values) frozen and consistent across both governing files. | Confirms identity enums are stable inputs to Phase 1 schema. | Carry forward into Phase 1 as fixed enum bindings. | No |
| F-02 | Informational | Contract §3.2 (line 94), Decision Closure Register D-13 | ProjectStatus (4 values: Active, On Hold, Closed, Archived) defined as operational state, distinct from ProjectStage. | Confirms Status / Stage separation is enforceable in schema. | Encode Status and Stage as separate fields with separate validation rules. | No |
| F-03 | Informational | Contract D-12 closure (line 2069) | Deprecated values `preconstruction_only`, `warranty_closeout`, and `active_construction`-as-ProjectType explicitly removed. | Anti-regression rule is durable; future schemas must reject these values. | Encode as forbidden-value validation in Phase 1 schema; preserve narrative anti-regression block in docs. | No |
| F-04 | Informational | Contract §10.6 (line 590), §15.13.1, §18.1.5, §19; P-03 closure (line 2084); Blueprint §36A (line 2376) | `ProcoreCompanyId = 5280` is documented uniformly as configuration, not a secret, with three named forms (canonical `procore_company_id`, surface `ProcoreCompanyId`, business label "Procore Company ID = `5280`"). | Configuration field is safe to extract into schema and PCC settings UI. | Encode as required configuration field with default `5280` and Site Health flag for blank or non-`5280` values absent an approved exception. | No |
| F-05 | Informational | Contract §10.6 (line 594), §11 hybrid group model, P-04 closure (line 2085); Blueprint mirror | Procore mapping owner is Project Manager with Project Executive fallback; Project Accountant is explicitly excluded as mapping owner. | Permission Template and PCC Settings UI must enforce ownership constraint. | Encode as a Permission Template binding rule in Phase 1 schema and surface as a Site Health check. | No |
| F-06 | Informational | Contract §18 (line 1449), §1486 SPFx boundary; Blueprint §36 / §36A | SPFx surfaces must not call Procore APIs directly; all Procore traffic routes through `backend/functions/` with auth, secrets, rate limits, and audit owned by the backend. | Boundary is encoded as a system architecture rule, not a schema rule, but Phase 1 schemas must reference backend-owned identifiers (sync timestamps, mapping IDs) without leaking secret material. | Carry the no-direct-call rule forward into Phase 2 (Provisioning Foundation) acceptance criteria; Phase 1 schemas declare backend-owned fields read-only at the SPFx surface. | No |
| F-07 | Informational | Contract R4 no-secrets rule (around line 1503), P-01 / P-02 closures | No Procore client IDs, client secrets, refresh tokens, DMSA credentials, OAuth secrets, or environment credentials may be stored in SharePoint, SPFx, markdown docs, or client-side configuration. | Schema must not expose secret-bearing fields. | Phase 1 schemas explicitly omit secret-bearing fields; secrets remain in backend-managed key vaults only. | No |
| F-08 | Informational | Contract §18 financial labeling (around line 1482), P-11 closure | Sage Intacct is the accounting book of record; Procore-sourced financial data is labeled operational / project-management financial state. | Schema must label Procore-sourced financial fields as operational / PM, not as accounting truth. | Phase 1 schema includes a `source_system` label and operational-vs-accounting classification for financial-domain fields. | No |
| F-09 | Informational | Contract §11.7 (line 745), P-17 closure (~line 2098) | Procore directory comparison is read-only; it must not auto-grant SharePoint access. | Schema and Permission Template logic must not derive SharePoint group membership from Procore directory state. | Phase 1 schema treats directory comparison as a separate data set with no permission-mutation semantics. | No |
| F-10 | Informational | Contract P-10 closure (~line 2091); Blueprint §36A | SharePoint is not a full Procore mirror: mappings, summaries, exceptions, action queues, sync health, audits, and object links are allowed; raw payloads, high-volume detail histories, bulk attachments, and full binary mirrors are forbidden. | Schema must constrain Procore-domain list shapes; Phase 1 must define what "summary" vs "raw payload" means per object family. | Phase 1 schema family taxonomy declares allowed shapes per Procore object family. | Pass with Note (P1) |
| F-11 | Informational | Contract §11.5 (line 713), §11.6 (line 734), D-04 closure | External (guest) users deferred from MVP; Microsoft 365 Group / Teams membership posture frozen for MVP. | Permission Template schema MVP omits external-user templates while leaving the placeholder in the catalog. | Phase 1 schema marks external-user templates as `mvp_status: deferred`. | No |
| F-12 | Informational | Contract §19 (line 1627), §19A (line 1726) | Site Health, drift severity tiers (Info, Warning, Blocking, Repair Required, Security Risk), and Repair Automation tiers (T1 auto, T2 approval, T3 IT security, T4 manual only) are fully defined. | Site Health record family is ready to extract as its own schema family. | Phase 1 includes a Site Health Schema family in the taxonomy. | No |
| F-13 | Medium | Contract §16 (line 1337) | The "Common List Schema Pattern" is illustrative-by-design and was authored as a pattern example, not as an exhaustive per-object specification across §15 lists, §14 libraries, and §13 pages. | A direct extractor would inherit the pattern's example-level coverage and miss object-specific column overrides. | Phase 1 must consolidate per-object column lists (each list/library/page) into a uniform per-object schema definition derived from §13–§15 content, with §16 as the shared pattern reference. | Pass with Note (P1) |
| F-14 | Medium | Contract §15 (line 980), §14 (line 893), §13 (line 867), Object Catalog (line 166) | Column-level required/optional markers are present in narrative prose and tables but are not uniformly applied across all object families. | Schemas extracted directly would have inconsistent required/optional fidelity across object families. | Phase 1 sweeps the Object Catalog and §13–§15 to apply uniform required/optional markers before generating JSON Schema validators. | Pass with Note (P1) |
| F-15 | Medium | Contract §3.2 (Status-driven read-only), §4B.2 conditional seeding (line 226), §10.6 Procore Settings, §19 Site Health | Validation rules (enum constraints, referential rules, conditional visibility, Status-driven read-only behavior, Stage-gated module visibility) live in narrative prose rather than in a structured rule table extractable to JSON Schema validators. | Direct schema extraction would translate fields cleanly but lose conditional / cross-field rules. | Phase 1 builds a structured Validation Rule Table indexed by field, with rule type (enum binding, conditional visibility, read-only-by-status, referential), before generating schemas. | Pass with Note (P1) |
| F-16 | Medium | Contract Object Catalog (line 166) vs §13–§19 detail | The Object Catalog provides a stable index but does not yet bind each row to an explicit schema family identifier (List Schema, Library Schema, Page Schema, Module Schema, Permission Template Schema, Workflow Schema, Procore Mapping Schema, Site Health Schema, Settings Schema). | Without a family taxonomy, Phase 1 schema files have no canonical organizational shape. | Phase 1 declares the Schema Family taxonomy first, then maps every Object Catalog row to one family. | Pass with Note (P1) |
| F-17 | Low | Roadmap §6, §7 (Phase 0 line 184, Phase 1 line 224); README "Development Roadmap" section | README and Roadmap are aligned on Phase 0 / Phase 1 sequencing; no contradiction detected. | Confirms entry into Phase 1 follows a known sequence. | Maintain alignment when README evolves; treat Roadmap as the single sequencing authority. | No |
| F-18 | Low | README "Procore Model Package" section; Procore package README scope | The Procore data-model package is correctly scoped for Phase 8 / Phase 9 reference; it should not be drawn into Phase 0 / Phase 1 schema extraction. | Avoids accidental scope creep where Phase 1 starts modeling Procore canonical entities. | Phase 1 explicitly excludes Procore canonical-model entities; Procore Mapping Schema is limited to mapping/summary/audit shapes per F-10. | No |
| F-19 | Low | Contract §22 line 2017; Blueprint mirror | Decision Closure Register uses only the four allowed statuses; no drift detected. | Schema can encode `mvp_status` as a four-value enum bound to Register state. | Phase 1 schema family includes a `mvp_status` field constrained to the four values. | No |
| F-20 | Informational | Roadmap §8 MVP Release Definition | MVP scope set is enumerated and aligned with Contract §21 MVP Template Contract (line 1959). | Confirms MVP boundary is explicit, not implicit. | Phase 1 schemas mark deferred items by `mvp_status` rather than omitting them, preserving traceability. | No |

No findings at Critical or High severity.

## Consistency Assessment

The two governing documents are consistent. The Blueprint is a navigation-and-strategy layer over the Contract; the Contract carries the binding implementation detail. Enum definitions, Procore boundaries, Team & Access governance, Permission Template families, Site Health severity and Repair Automation tiers, and Decision Closure Register status sets are identical in both. The README and Roadmap reference the Contract and Blueprint as governing sources and do not introduce competing rules.

Anti-regression posture is enforced consistently: D-12 explicitly removes `preconstruction_only`, `warranty_closeout`, and `active_construction`-as-ProjectType from active enums; D-13 reaffirms ProjectStatus and ProjectStage as separate concerns and reaffirms Archived as a Status, not a Stage. No active enum list, table column, schema reference, or readiness item in the governing set uses any deprecated value as a valid value.

## Implementation Readiness Assessment

Implementation readiness for Phase 1 (machine-readable schema extraction) is **Pass with Notes**. The architecture is decisive — every named consistency rule passes — but the source documents are not yet shaped for direct extraction. Phase 1 must perform a representation pass that does not introduce new architecture decisions:

- Apply uniform required/optional markers across all object families (F-14).
- Consolidate per-object column lists from §13 / §14 / §15 into per-object schema definitions, with §16 as the shared pattern reference (F-13).
- Build a structured Validation Rule Table indexed by field for enum bindings, conditional visibility, Status-driven read-only behavior, and referential rules (F-15).
- Declare the Schema Family taxonomy and map every Object Catalog row to one family (F-16).

If any of these surfaces a previously undecided point, it returns to Phase 0 architecture review rather than being resolved inside the schema.

## MVP Boundary Assessment

The MVP boundary is explicit. Contract §21 MVP Template Contract (line 1959) and Roadmap §8 MVP Release Definition together name the MVP set: governed provisioning, frozen enums, Team & Access via PCC UI, Document Control read-only, workflow modules at MVP visibility, Procore MVP integration (mapping, deep links, sync health placeholder). Deferred items are named explicitly: external users, HBI Assistant, full Procore mirror, write-back, sync cadence variants, Cupix deepening, per-type seed expansion. The Decision Closure Register binds MVP scope through `Frozen for MVP` and `Runtime Configuration` statuses, with `Deferred` and `Proof-Gated` statuses explicitly distinguished.

The MVP boundary does not require additional stabilization work before Phase 1.

## Procore Boundary Assessment

The Procore boundary passes all consistency checks (F-04 through F-10). Configuration vs secret distinction is uniform; mapping ownership is gated to PM with PX fallback and Project Accountant exclusion; backend-only routing for Procore APIs is enforced; SharePoint storage shape is constrained to mappings, summaries, exceptions, action queues, sync health, audits, and object links; full binary mirrors are forbidden; financial-domain data is labeled operational / PM rather than accounting; directory comparison does not auto-grant SharePoint access; PCC is positioned as read-only with deep links, not as a Procore replacement; Sage Intacct remains the accounting book of record.

The Procore Integration Layer in Blueprint §36A (line 2376) is consistent with Contract Procore rules; the Procore data-model package (procore_hbintel_data_model_package) is correctly scoped for Phase 8 / Phase 9 and is excluded from Phase 0 / Phase 1 inputs.

## Team & Access Assessment

Team & Access governance passes all checks. Contract §11 (line 616) defines the Team & Access Center, the hybrid group model, phase-based access managers, the invite workflow, and the external-user posture (deferred). Permission templates are business-facing labels mapped to implementation details behind the scenes (Contract §12, line 759). Procore directory comparison is explicitly read-only with no auto-grant behavior. Native SharePoint permission and settings screens are not part of the normal-user workflow; mutations route through PCC UI and `backend/functions/` with audit logging.

## Control Center Settings Assessment

Control Center Settings (Contract §10, line 534; Blueprint §31, line 1974) defines settings structure, validation rules, configuration tiers, project-specific vs template-level scope, the SharePoint Site Access vs Microsoft 365 Group / Teams Membership distinction (§10.5), and Procore Settings (§10.6). The settings surface is shaped for direct schema extraction: it has named sections, validation rules, and tier classifications. No remediation needed before Phase 1; F-15 Validation Rule Table work covers consolidation.

## Provisioning Readiness Assessment

Provisioning is shaped for Phase 2 entry, not for Phase 1: the Provisioning Validation Contract (Contract §20, line 1773) and the Required Graph Application Permissions (§20A, line 1815) are defined and consistent with the Roadmap's Phase 2. Phase 1 schema extraction does not require additional provisioning stabilization; Phase 2 will consume the extracted schemas and these provisioning sections together.

## SharePoint Object Readiness Assessment

SharePoint object families (Lists, Libraries, Pages, Modules, Permission Templates, Workflow Definitions, Procore Mappings, Site Health, Settings) are defined across Contract §4A (Object Catalog), §13 (Pages), §14 (Libraries), §15 (Lists), §16 (Common List Schema Pattern), §17 (Workflow Templates), §10 (Settings), §11 / §12 (Team & Access / Permission Templates), §19 (Site Health). Readiness is **Pass with Notes** per F-13, F-14, F-16: the per-object detail is present but not yet uniformly tagged or family-bound.

## Backend / Functions Boundary Assessment

The backend / functions boundary is explicit and consistent (Contract §18, line 1449; SPFx boundary rules around line 1486). Backend owns Procore auth, secrets, rate limiting, and sync state; SPFx consumes lists, settings, and backend-exposed APIs. Phase 1 schema does not modify this boundary; it formalizes which fields the backend owns and which the SPFx surface may read.

## SPFx Boundary Assessment

SPFx surfaces consume the template via lists, libraries, pages, modules, and PCC Settings; they must not call Procore APIs directly (F-06) and must not store Procore secrets (F-07). The full-page PCC shell (Contract §7, line 389) and the module map (Blueprint §9, line 350) are consistent. Phase 1 schemas declare backend-owned fields read-only at the SPFx surface.

## Data Ownership and System-of-Record Assessment

System-of-record boundaries are explicit (F-08, F-10, F-18). Sage Intacct is the accounting book of record. Procore is the operational / project-management financial state and the operational integration source for mapped object families. SharePoint is the governance, document, and project-collaboration surface; it stores mappings, summaries, exceptions, action queues, sync health, audits, and object links, not raw Procore payloads or full binary mirrors. The Contract is the implementation governance source of truth; the Blueprint is the strategic source. No conflict between sources detected.

## Site Health / Drift / Repair Assessment

Site Health, drift detection, and repair automation are fully defined (Contract §19, line 1627; §19A, line 1726). Severity tiers (Info, Warning, Blocking, Repair Required, Security Risk) and Repair Automation tiers (T1 auto, T2 approval, T3 IT security, T4 manual only) are explicit. The Site Health Record family is ready to extract as its own schema family in Phase 1.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Phase 1 extractor inherits the example-level coverage of §16 Common List Schema Pattern and produces uneven schemas across object families. | F-13 / F-14 P1 backlog items: consolidate per-object column lists and apply uniform required/optional markers before generating JSON Schema. |
| Phase 1 surfaces a previously undecided architectural point (e.g., a missing referential rule) and resolves it inside the schema, smuggling architecture decisions into machine-readable form. | Phase 1 entry criterion: no new architecture decisions embedded in schema output; undecided points return to Phase 0 review. |
| Procore canonical-model package gets pulled into Phase 1 inputs and inflates Phase 1 scope. | F-18: Procore canonical-model package is explicitly excluded from Phase 1 inputs; Phase 1 Procore Mapping Schema is limited to mapping / summary / audit shapes per F-10. |
| Validation rules implemented partially (only enum bindings) and conditional / cross-field rules deferred informally. | F-15 P1 backlog item: structured Validation Rule Table covers enum, conditional visibility, Status-driven read-only, and referential rules together. |
| Schema family taxonomy gets defined ad hoc per file rather than declared up front. | F-16 P1 backlog item: declare Schema Family taxonomy before generating per-family files; map every Object Catalog row to one family. |

## Required Stabilization Before Schema Extraction

No stabilization edits are required to the governing source files before Phase 1 opens. The governing architecture is stable. The work required before Phase 1 schema files are produced is **representation work** carried as P1 backlog items (F-13, F-14, F-15, F-16) executed inside Phase 1 as its first step, not as a return to Phase 0.

## Recommended Next Step

Open Phase 1 — Machine-Readable Template Contract. Begin Phase 1 with the P1 representation pass (F-13, F-14, F-15, F-16) and only then generate per-family JSON Schema files. Hold the Phase 1 entry criteria recorded in the Schema Extraction Readiness Backlog: zero Fail rows in the Consistency Check Register, P1 items assigned to owner categories, Schema Family taxonomy confirmed, Contract and Blueprint frozen during extraction, and no new architecture decisions embedded in schema output.

This decision is conditional on the final Consistency Check Register (companion deliverable) carrying zero Fail rows. The Register, as authored, has zero Fail rows; the recommendation stands.
