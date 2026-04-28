# Phase 0 Step 2 — Validation Rule Table Plan

## Purpose

This document defines the structure and initial inventory of the Validation Rule Table that Phase 1 — Machine-Readable Template Contract will produce. The Validation Rule Table converts the narrative validation rules in the Standard Project Site Template Contract into a structured, indexable rule set with explicit Enforcement Layer assignment, MVP treatment, and "blocks generation if missing" semantics. It is the canonical input for Phase 1 schema generation work item B-01.

The plan distinguishes which rules are **schema-enforceable** (encoded in JSON Schema validators), **provisioning-enforced** (enforced by provisioning logic in `backend/functions/`), **backend-enforced** (enforced in backend services such as Procore-routing or audit-logging), **SPFx behavior** (enforced by SPFx component logic and tests), **Site Health** (detected and reported by drift checks), **governance / documentation** (enforced by review and policy), or **cross-layer** (multiple layers participate). The table never implies that JSON Schema alone enforces cross-layer behavior — for example, "no direct SPFx-to-Procore calls" is a SPFx behavior rule plus a backend-routing rule, not a schema constraint.

## Why This Is Required Before JSON Schema Generation

Per the Step 1 audit findings F-13, F-14, F-15, F-16 and Step 1 backlog item B-01, validation rules currently live in narrative prose across Contract §3.2, §4B.0, §4B.1, §4B.2, §10.6, §11, §18, §19, §20. A direct extractor would translate fields cleanly but would lose conditional and cross-field rules. Phase 1 must consolidate every narrative rule into the structured table below before generating any per-family JSON Schema. The table also prevents new architecture decisions from being smuggled into schema output: every rule cites a Contract / Blueprint / Decision Closure Register anchor, and rules without an anchor must return to Phase 0 review before they are added.

## Rule Categories

The table uses the following 13 categories. The category determines which sections of this plan list the rule and informs Enforcement Layer selection.

```
Enum Binding
Conditional Visibility
Stage / Status Behavior
Runtime Configuration
Permission / Ownership
Procore Boundary
System of Record
No Secret
No Native SharePoint Admin
Referential Integrity
Site Health / Drift / Repair
Provisioning Validation
MVP / Deferred Scope
```

## Required Rule Table Structure

Phase 1 produces a single rule table with this structure. Each row is one rule.

| Rule ID | Rule Category | Source Section | Applies To | Rule Statement | Schema Family | Enforcement Layer | MVP Treatment | Blocks Generation If Missing? | Notes |
|---|---|---|---|---|---|---|---|---|---|

Column semantics:

- **Rule ID** — `VR-NN` series (Validation Rule). Stable, append-only.
- **Rule Category** — one of the 13 categories above.
- **Source Section** — Contract, Blueprint, or Decision Closure Register anchor.
- **Applies To** — schema field or family-level scope (e.g., `site.projectType`, `(all schemas)`, `permissions.procoreMappingOwner`).
- **Rule Statement** — the rule itself, plain language.
- **Schema Family** — one or more schema families per the 14-family taxonomy (e.g., `enums`, `site`).
- **Enforcement Layer** — one or more from the eight allowed values (see below).
- **MVP Treatment** — `Frozen for MVP`, `Runtime Configuration`, `Deferred`, or `Proof-Gated`.
- **Blocks Generation If Missing?** — `Yes` if Phase 1 must not generate schema for the affected family without this rule; `No` if the rule is documentary.
- **Notes** — optional clarifications.

## Enforcement Layer Values

| Value | Meaning |
|---|---|
| `Schema` | Encoded directly in JSON Schema validators (e.g., enum members, required fields, `forbidden_values`). |
| `Provisioning` | Enforced by provisioning logic in `backend/functions/` during site creation, list/library setup, and group seeding. |
| `Backend` | Enforced by backend services (e.g., Procore-routing, audit-logging, sync-state management). |
| `SPFx` | Enforced by SPFx component logic and tests (e.g., access manager UI gating, no direct API calls to forbidden surfaces). |
| `Site Health` | Detected and reported by Site Health drift checks (Contract §19) at runtime. |
| `Governance` | Enforced by review and policy (e.g., ADR requirement, Decision Closure Register sign-off). |
| `Documentation` | Enforced by documentation cross-references (e.g., source-traceability fields, Decision Closure Register references). |
| `Cross-Layer` | Multiple layers participate; the rule's effective enforcement is the union of layers. The Notes column lists the participating layers. |

A rule's Enforcement Layer is **never** "Schema" alone for cross-layer behaviors. For example, "SPFx must not call Procore directly" is `Cross-Layer` with participating layers `SPFx + Backend + Documentation`; JSON Schema cannot enforce a runtime call boundary.

## Initial Rule Inventory

The table below is the Step 2 starting set. Phase 1 expands it during B-01 work; rules are append-only.

| Rule ID | Rule Category | Source Section | Applies To | Rule Statement | Schema Family | Enforcement Layer | MVP Treatment | Blocks Generation If Missing? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| VR-01 | Enum Binding | Contract §4B.1; D-12 | `site.projectType` | Allowed values: `commercial`, `multifamily`, `municipal`, `luxury_residential`, `environmental`. | `enums`, `site` | Schema | Frozen for MVP | Yes | Five-value enum binding for ProjectType. |
| VR-02 | Enum Binding | Contract §4B.0 | `site.projectStage` | Allowed values: `lead`, `estimating`, `preconstruction`, `active_construction`, `closeout`, `warranty`. | `enums`, `site` | Schema | Frozen for MVP | Yes | Six-value enum binding for ProjectStage. |
| VR-03 | Enum Binding | Contract §3.2 | `site.projectStatus` | Allowed values: `Active`, `On Hold`, `Closed`, `Archived`. | `enums`, `site` | Schema | Frozen for MVP | Yes | Four-value enum binding for ProjectStatus. |
| VR-04 | Enum Binding | Contract §4B.0; §3.2; D-13 | `site.projectStatus` / `site.projectStage` | Anti-regression: `Archived` is `projectStatus`, not `projectStage`. `Archived` must not appear as a valid `projectStage` value. | `enums` | Schema | Frozen for MVP | Yes | Forbidden-value rule on the projectStage enum. |
| VR-05 | Enum Binding | Contract §4B.1; §4B.0; D-12 | `site.projectType` / `site.projectStage` | Anti-regression: `active_construction` is a `projectStage` value only, not a `projectType` value. `active_construction` must not appear as a valid `projectType` value. | `enums` | Schema | Frozen for MVP | Yes | Forbidden-value rule on the projectType enum. |
| VR-06 | Enum Binding | Contract D-12 closure | `site.projectType` | Anti-regression: forbidden values `preconstruction_only`, `warranty_closeout` must not appear as valid `projectType` values. | `enums` | Schema | Frozen for MVP | Yes | Forbidden-value rule on the projectType enum. |
| VR-07 | Conditional Visibility | Contract §4B.2; §8 | `modules[*].visibility` | Module visibility is keyed on `projectStage`. | `modules`, `enums` | SPFx + Schema | Frozen for MVP | Yes | Schema declares the visibility rule structure; SPFx enforces the runtime visibility decision. Cross-Layer style: `Schema + SPFx`. |
| VR-08 | Conditional Visibility | Contract §4B.2 | `lists[*].seedRule`, `libraries[*].seedRule` | Vertical seeding (e.g., per-ProjectType seed sets) is keyed on `projectType`. | `lists`, `libraries`, `enums` | Provisioning | Frozen for MVP | Yes | Provisioning logic applies seed rules at site creation. Schema declares seed-rule structure; the seeding action is provisioning behavior. |
| VR-09 | Stage / Status Behavior | Contract §3.2; §5.6 | `site.archiveBehavior` | On `projectStatus → Archived`: site is renamed (§5.6), libraries are flipped read-only, metadata is frozen. | `site`, `libraries` | Backend + Provisioning | Frozen for MVP | Yes | Cross-Layer; participating layers in Notes: rename and read-only flips are backend operations triggered by status transition. |
| VR-10 | Runtime Configuration | Contract §10.6; §18.1.5; P-03 | `settings.procoreCompanyId` | Default `5280`. Configuration, not secret. Three forms: canonical `procore_company_id`, surface `ProcoreCompanyId`, business "Procore Company ID = `5280`". Site Health flags blank or non-`5280` values unless an approved multi-company exception exists. | `settings`, `integrations`, `site-health` | Schema + Site Health | Runtime Configuration | Yes | Schema declares default and three forms; Site Health enforces the value check at runtime. |
| VR-11 | Permission / Ownership | Contract §10.6 (line 594); P-04 | `permissions.procoreMappingOwner` | Procore mapping owner is Project Manager; fallback owner is Project Executive when no PM is assigned. Project Accountant is not the mapping owner. | `permissions`, `integrations` | Schema + Backend | Frozen for MVP | Yes | Schema encodes the allowed ownership set; backend enforces the assignment rule. |
| VR-12 | Procore Boundary | Contract §18 (line 1486); R-rules | `integrations.procore.*` | SPFx must not call the Procore API directly. All Procore traffic routes through `backend/functions/` with auth, secrets, rate limits, and audit owned by the backend. | `integrations` | Cross-Layer | Frozen for MVP | Yes | Cross-Layer; participating layers: `SPFx + Backend + Documentation`. JSON Schema alone cannot enforce a runtime call boundary; the rule is enforced by SPFx code review, backend routing, and a documented governance rule. |
| VR-13 | No Secret | Contract R4 (around line 1503); P-01; P-02 | (all schemas, all SharePoint surfaces, all SPFx surfaces, all markdown docs, all repo source, all client config) | No Procore client IDs, client secrets, refresh tokens, DMSA credentials, OAuth secrets, or environment credentials may appear in any schema, SharePoint list, SPFx surface, markdown doc, repo source, or client configuration. | (all families) | Cross-Layer | Frozen for MVP | Yes | Cross-Layer; participating layers: `Schema + SPFx + Backend + Governance + Documentation`. Schema enforces by omitting fields; reviews enforce policy; backend stores secrets in key vault. |
| VR-14 | System of Record | Contract §18 (around line 1482); P-11 | `integrations.financial.*` | Sage Intacct is the accounting book of record. Procore-sourced financial data is operational / project-management financial state and must be labeled as Procore-sourced. | `integrations` | Schema + Documentation | Frozen for MVP | Yes | Schema declares `source_system` and operational-vs-accounting classification; documentation enforces labeling discipline. |
| VR-15 | Procore Boundary | Contract §11.7 (line 745); P-17 | `integrations.procoreDirectory` | Procore directory comparison is read-only. Comparison must not auto-grant SharePoint access. | `integrations`, `permissions` | Backend + SPFx | Frozen for MVP | Yes | Cross-Layer; participating layers: `Backend + SPFx`. Schema declares the comparison shape but does not authorize permissions. |
| VR-16 | Procore Boundary | Contract P-10 closure | `integrations.procore.*` | SharePoint is not a full Procore mirror. Allowed shapes: mapping, summary, exception, action queue, sync health, audit, object link. Forbidden shapes: raw payload, high-volume detail history, bulk attachment, full binary mirror. | `integrations` | Schema + Backend | Frozen for MVP | Yes | Schema enforces allowed-shape lists and rejects forbidden shapes; backend enforces sync logic. |
| VR-17 | No Native SharePoint Admin | Contract §9 (line 485); §11 (line 616) | `permissions.*`, `settings.*` | Normal users do not use native SharePoint permission / settings / edit screens for normal workflows. All access mutations route through `backend/functions/` and are audit-logged. | `permissions`, `settings` | SPFx + Backend + Governance | Frozen for MVP | Yes | Cross-Layer. SPFx UI directs users away from native screens; backend enforces audit logging; governance reviews enforce the no-bypass policy. |
| VR-18 | MVP / Deferred Scope | Contract §11.5 (line 713); D-04 | `permissions.externalUserTemplates` | External (guest) users are deferred from MVP. External-user permission templates exist as `mvp_status: deferred` placeholders only. | `permissions` | Schema | Deferred | Yes | Schema marks external-user templates `mvp_status: deferred`. |
| VR-19 | MVP / Deferred Scope | Blueprint §30 (line 1927); Roadmap §8 | `modules.hbiAssistant` | HBI Assistant is deferred from MVP. Module entry exists as `mvp_status: deferred` placeholder only. | `modules` | Schema | Deferred | Yes | Schema marks the HBI Assistant module `mvp_status: deferred`. |
| VR-20 | MVP / Deferred Scope | Roadmap §8 must-not-include set | `integrations.procore.writeback` | Procore write-back is deferred from MVP. | `integrations` | Schema + Governance | Deferred | Yes | Schema omits write-back fields; governance enforces no-write-back policy until ADR. |
| VR-21 | Site Health / Drift / Repair | Contract §19 (line 1627) | `site-health[*].severity` | Severity values: `Info`, `Warning`, `Blocking`, `Repair Required`, `Security Risk`. | `site-health`, `enums` | Schema | Frozen for MVP | Yes | Five-value severity enum binding. |
| VR-22 | Site Health / Drift / Repair | Contract §19A (line 1726) | `site-health[*].repairTier` | Repair Automation tiers: T1 auto, T2 approval, T3 IT security, T4 manual only. | `site-health`, `enums` | Schema | Frozen for MVP | Yes | Four-value repair-tier enum binding. |
| VR-23 | Provisioning Validation | Contract §20 (line 1773) | `provisioning-validation.*` | Provisioning Validation Contract: stages, post-provision validation, audit records, rollback / repair references. | `provisioning-validation` | Provisioning + Backend | Frozen for MVP | Yes | Cross-Layer; participating layers: `Provisioning + Backend`. Schema declares the validation contract structure; backend executes. |
| VR-24 | MVP / Deferred Scope | Contract §22 (line 2017) | (all `mvp_status` fields) | Decision Closure Register statuses: `Frozen for MVP`, `Runtime Configuration`, `Deferred`, `Proof-Gated` only. | `enums` | Schema | Frozen for MVP | Yes | Four-value `mvp_status` enum binding. |
| VR-25 | Referential Integrity | Contract §15 | `lists[*].lookups` | Lookup fields reference existing list rows by stable identifier. | `lists` | Schema | Frozen for MVP | Yes | Schema enforces referential integrity by stable IDs. |
| VR-26 | Referential Integrity | Contract §13 | `pages[*].moduleRef` | Pages reference modules by stable module identifier. | `pages`, `modules` | Schema | Frozen for MVP | Yes | Schema enforces referential integrity. |
| VR-27 | Permission / Ownership | Contract §11.3 | `permissions.accessManager.*` | Phase-based access managers per ProjectStage. | `permissions` | Schema + SPFx + Backend | Frozen for MVP | Yes | Cross-Layer. Schema declares the access manager binding by stage; SPFx and backend enforce. |
| VR-28 | No Secret | Contract §11.6 (line 734) | `settings.m365GroupConnection` | Microsoft 365 Group / Teams connection posture frozen for MVP; no secrets in client surfaces. | `settings` | Schema + Backend | Frozen for MVP | Yes | Schema marks posture frozen; backend manages connection. |
| VR-29 | Stage / Status Behavior | Contract §3.2 | `lists[*].readOnlyOnStatus`, `libraries[*].readOnlyOnStatus` | Status-driven read-only behavior for `Closed` and `Archived` projects. | `lists`, `libraries` | SPFx + Backend | Frozen for MVP | Yes | Cross-Layer. Schema declares the rule; SPFx and backend enforce read-only. |
| VR-30 | Conditional Visibility | Contract §11.3 | `permissions.accessManager.activeConstructionPhase` | Construction-phase access managers apply when `projectStage = active_construction`. | `permissions` | SPFx + Backend | Frozen for MVP | Yes | Cross-Layer. Schema declares the conditional binding; SPFx and backend enforce activation. |

Total: 30 initial rules. Phase 1 expands as B-01 work proceeds. Rules are append-only.

## Enum Binding Rules

Rules: VR-01, VR-02, VR-03, VR-04, VR-05, VR-06, VR-21, VR-22, VR-24.

Enum bindings are the most directly schema-enforceable category. Each rule names a field, its allowed-value set, and any forbidden values. Anti-regression rules (VR-04, VR-05, VR-06) appear as `forbidden_values` arrays inside the relevant `enums` schema and never as valid enum members.

## Conditional Visibility Rules

Rules: VR-07, VR-08, VR-30.

Conditional visibility binds a UI or seeding decision to a value of `projectStage` or `projectType`. Schema declares the rule structure; SPFx and provisioning enforce the visible/seeded outcome.

## Stage / Status Rules

Rules: VR-09, VR-29.

Stage / Status rules govern transitions and read-only behavior. Schema declares the rule; backend and SPFx enforce the transition outcome (rename, read-only flip, metadata freeze).

## Runtime Configuration Rules

Rules: VR-10.

Runtime Configuration rules carry default values and validation logic; Site Health drift checks enforce the value at runtime.

## Permission and Ownership Rules

Rules: VR-11, VR-27, VR-30.

Ownership rules bind a permission template, access manager, or mapping role to a Permission Template Schema entry. Schema encodes the allowed ownership set; backend enforces the assignment rule; SPFx surfaces the constraint to the user.

## Procore Boundary Rules

Rules: VR-12, VR-15, VR-16.

Procore boundary rules define the wall between PCC and Procore. None of these rules are schema-only:

- **VR-12** (no direct SPFx-to-Procore calls) is `Cross-Layer` with `SPFx + Backend + Documentation`. Schema does not enforce runtime call boundaries.
- **VR-15** (read-only directory comparison) is `Backend + SPFx`. Schema declares the comparison shape but does not authorize permissions.
- **VR-16** (allowed / forbidden shapes) is `Schema + Backend`. Schema enforces allowed-shape lists; backend enforces sync logic.

## System-of-Record Rules

Rules: VR-14.

Sage Intacct is the accounting book of record. Procore-sourced financial fields carry `source_system: "Procore"` and a classification of `operational / project-management financial state`. Schema enforces the labeling fields; documentation enforces the labeling discipline.

## No-Secret Rules

Rules: VR-13, VR-28.

VR-13 is `Cross-Layer` with all five participating layers (`Schema + SPFx + Backend + Governance + Documentation`). The rule appears in every family review: every schema entry must be inspected to confirm no secret-bearing field is named or shaped. The Phase 1 entry gate's "no new architecture decisions" rule combines with VR-13 to forbid any schema entry that introduces a new secret-bearing field.

## No-Native-SharePoint-Admin Rules

Rules: VR-17.

Normal-user workflows do not require native SharePoint permission / settings / edit screens. SPFx enforces the UI direction; backend enforces audit logging; governance enforces no-bypass policy.

## Referential Integrity Rules

Rules: VR-25, VR-26.

Referential integrity is straightforwardly schema-enforceable: lookup fields and module references resolve to stable identifiers in the same template contract. Phase 1 schemas declare the references; the JSON Schema validator enforces resolution.

## Site Health / Drift / Repair Rules

Rules: VR-21, VR-22, plus drift detection rules expanded during B-01 work.

Severity (VR-21) and Repair Automation tier (VR-22) bindings are schema-enforceable. The drift detection logic itself runs at backend / Site Health runtime.

## Provisioning Validation Rules

Rules: VR-23.

Provisioning validation rules are governed by Contract §20. Schema declares the validation contract structure; backend / provisioning logic executes the validation.

## Phase 1 Extraction Instructions

For each rule above and any rule added during Phase 1 B-01 work:

1. Confirm a Contract / Blueprint / Decision Closure Register anchor. If no anchor exists, return the rule to Phase 0 review rather than adding it.
2. Assign one or more **Schema Families** consistent with the 14-family taxonomy in `Phase_0_Step_2_Schema_Family_Taxonomy.md`.
3. Assign one or more **Enforcement Layers** from the eight allowed values. Use `Cross-Layer` when more than one layer participates and list the participating layers in the Notes column.
4. Assign **MVP Treatment** matching the Decision Closure Register row that anchors the rule.
5. Set **Blocks Generation If Missing?** to `Yes` when Phase 1 must not produce a per-family schema without this rule. Most rules in the initial inventory are `Yes`; documentary rules that don't gate generation can be `No`.
6. Cross-reference the rule from each affected schema entry's `validationRuleRefs` array (Schema Family Taxonomy "Required Validation Metadata" section).
7. Confirm anti-regression tokens (`preconstruction_only`, `warranty_closeout`, `Archived`-as-stage, `active_construction`-as-ProjectType) appear only inside `forbidden_values` arrays and not as valid enum members.

## Open Questions

The Step 2 rule extraction exercise identified no open architectural questions. If Phase 1 surfaces a rule with no Contract anchor, the rule returns to Phase 0 review and is added here before Phase 1 continues. No Prompt 02 architecture-gap escalation was required during Step 2.
