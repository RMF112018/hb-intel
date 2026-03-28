# Financial Doctrine Control Index

| Field | Value |
|---|---|
| **Doc ID** | Financial-DCI |
| **Document Type** | Canonical Developer Entry Point |
| **Owner** | Architecture lead |
| **Created** | 2026-03-28 |
| **Update Authority** | Architecture lead; updated when files are added, moved, or deprecated |

---

## 1. Purpose

This is the **single canonical entry point** for the Financial module doctrine package. It replaces the need to navigate 77 files across 12 subdirectories by providing:

- a developer read-first sequence,
- an authoritative file map by subject area,
- a capability-to-file crosswalk,
- explicit overlap resolution,
- a prompt set roadmap for doctrine-completion and implementation work.

**Use this file first** when entering the Financial doctrine package. Do not start with an arbitrary file.

---

## 2. Read-First Sequence

For a developer new to the Financial module, read in this order:

| # | File | Why |
|---|------|-----|
| 1 | [FIN-PR1 — Production-Readiness Maturity Model](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md) | Establishes what "complete" means at each stage; prevents overclaiming |
| 2 | [FIN-01 — Operating Posture](FIN-01_Operating-Posture-and-Surface-Classification.md) | Locks the module as an always-on operating surface, not a dashboard or workbook clone |
| 3 | [PH3-FIN-SOTL — Source-of-Truth Lock](PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md) | Defines what data Financial owns vs. imports vs. derives |
| 4 | [FRC-00 — Financial Replacement Crosswalk](FRC-00-Financial-Replacement-Crosswalk.md) | Maps current workbook workflows to runtime equivalents |
| 5 | [FRM-00 — Financial Runtime Entity Model](FRM-00-Financial-Runtime-Entity-Model.md) | Formal runtime record model translating workbook concepts into code-level entities |
| 6 | [Financial-RGC — Runtime Governance Control](Financial-Runtime-Governance-Control.md) | Persistence families, repository seams, domain ownership, mutation boundaries, implementation sequence |
| 7 | [Financial-LMG — Lifecycle and Mutation Governance](Financial-Lifecycle-and-Mutation-Governance.md) | Lifecycle states, transition rules, confirmation gate, access control, staleness, service enforcement |
| 8 | [Financial-SOTEC — Source-of-Truth and Entity Control](Financial-Source-of-Truth-and-Entity-Control.md) | Entity ownership tiers, per-domain authority, write boundaries |
| 9 | [Financial-ABMC — Action Boundary and Mutation Control](Financial-Action-Boundary-and-Mutation-Control.md) | Role×state permissions, mutation categories, cross-tool rules, blocking conditions |
| 10 | This index — §5 Capability Crosswalk | Then drill into the specific capability you're working on |

---

## 3. Repo-Truth Precedence

When documents disagree, resolve using this order (per CLAUDE.md authority hierarchy):

1. **`current-state-map.md`** and live code — present-state truth
2. **FIN-PR1** — canonical maturity classifications
3. **PH3-FIN-SOTL** — source-of-truth authority
4. **FIN-01 through FIN-04** — locked operating posture, action posture, lane ownership, route contract
5. **P3-E2 / P3-E4** — module specification and field-level contracts
6. **Series master files** (FRC-00, FRM-00) — workstream-level doctrine
7. **Series detail files** (FRC-01–05, FRM-01–05, BIP-01–05, FVC-01–05) — workstream detail
8. **Governance specs** (underscore-prefixed) — runtime governance for individual tools
9. **UI specs** (`ui/` directory) — visual and interaction specifications
10. **Prompt sets** (subdirectories) — execution guidance for doctrine-completion and implementation

---

## 4. Authoritative File Map

### 4.1 Foundation and Authority (Locked)

| File | Doc ID | Subject | Status |
|------|--------|---------|--------|
| [FIN-01](FIN-01_Operating-Posture-and-Surface-Classification.md) | FIN-01 | Operating posture — prevents viewer-first or dashboard-only implementation | Locked |
| [FIN-02](FIN-02_Action-Posture-and-User-Owned-Work-Matrix.md) | FIN-02 | Action model — actionable vs. view-only vs. blocked vs. escalating | Locked |
| [FIN-03](FIN-03_Lane-Ownership-Matrix.md) | FIN-03 | Lane ownership — PWA full-depth vs. SPFx limited entry | Locked |
| [FIN-04](FIN-04_Route-and-Context-Contract.md) | FIN-04 | Route family and project-context durability | Locked |
| [PH3-FIN-SOTL](PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md) | PH3-FIN-SOTL | Source-of-truth authority, custody, governance | Locked |
| [Financial-RLR](Financial-Route-and-Lane-Reconciliation.md) | Financial-RLR | Route and lane contradiction resolution — governs where FIN-03/04 conflict with P3-G1/G2 | Active |
| [PH3-FIN-SOTL-A1](PH3-FIN-SOTL-A1-Default-Registries-and-Role-Boundaries.md) | PH3-FIN-SOTL-A1 | Default registries, role boundaries, override rules | Locked |
| [Financial-RGC](Financial-Runtime-Governance-Control.md) | Financial-RGC | Runtime persistence families, repository seams, domain ownership, mutation boundaries | Active |
| [Financial-LMG](Financial-Lifecycle-and-Mutation-Governance.md) | Financial-LMG | Lifecycle states, transition rules, mutation guards, staleness/invalidation, service enforcement | Active |
| [Financial-LODM](Financial-Lane-Ownership-Decision-Matrix.md) | Financial-LODM | Per-capability lane ownership — PWA depth, SPFx depth, launch behavior, acceptance evidence | Active |
| [Financial-CLHLC](Financial-Cross-Lane-Handoff-and-Launch-Contract.md) | Financial-CLHLC | Cross-lane launch rules, context durability, return/resume, acceptance posture by lane behavior | Active |
| [Financial-SOTEC](Financial-Source-of-Truth-and-Entity-Control.md) | Financial-SOTEC | Source-of-truth ownership, entity classification, action boundaries, stale-state rules | Active |
| [Financial-ABMC](Financial-Action-Boundary-and-Mutation-Control.md) | Financial-ABMC | Role×state permissions, mutation categories, cross-tool action rules, invalidation chains, blocking conditions | Active |

### 4.2 Maturity and Readiness

| File | Doc ID | Subject | Status |
|------|--------|---------|--------|
| [FIN-PR1](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md) | FIN-PR1 | 9-stage maturity model; per-tool classifications; anti-overclaiming | Canonical |

### 4.3 Replacement Crosswalk Series (FRC)

Maps current workbook workflows to runtime equivalents.

| File | Doc ID | Subject |
|------|--------|---------|
| [FRC-00](FRC-00-Financial-Replacement-Crosswalk.md) | FRC-00 | **Master index** — 9-file source inventory, backend ties, surfacing model |
| [FRC-01](FRC-01-Source-Inventory.md) | FRC-01 | Source inventory of current operating files |
| [FRC-02](FRC-02-Detailed-Crosswalk.md) | FRC-02 | 14-column crosswalk mapping artifacts to runtime |
| [FRC-03](FRC-03-Implementation-Implications.md) | FRC-03 | Implementation implications, gap analysis, stage summary |
| [FRC-04](FRC-04-Runtime-Record-Family.md) | FRC-04 | Runtime record family, mutability/ownership matrix |
| [FRC-05](FRC-05-Field-Level-Mapping.md) | FRC-05 | Field-level and workflow-level mapping |

### 4.4 Runtime Entity Model Series (FRM)

Formal runtime record model with aggregate boundaries and seams.

| File | Doc ID | Subject |
|------|--------|---------|
| [FRM-00](FRM-00-Financial-Runtime-Entity-Model.md) | FRM-00 | **Master index** — translates workbook concepts into formal record model |
| [FRM-01](FRM-01-Entity-Catalog.md) | FRM-01 | Entity catalog with ownership tiers |
| [FRM-02](FRM-02-Aggregate-and-Relationship-Model.md) | FRM-02 | Aggregate boundaries, parent-child, identity layers |
| [FRM-03](FRM-03-State-Mutability-and-Lifecycle.md) | FRM-03 | Lifecycle and mutability behavior |
| [FRM-04](FRM-04-Repository-and-Provider-Seam-Model.md) | FRM-04 | Repository/provider seam model |
| [FRM-05](FRM-05-Repo-Truth-Gaps-and-Implementation-Readiness.md) | FRM-05 | Gap analysis and implementation readiness |

### 4.5 Budget Import Pipeline Series (BIP)

Governed budget import workflow from CSV to reconciled ledger.

| File | Doc ID | Subject |
|------|--------|---------|
| [BIP-01](BIP-01-Pipeline-Doctrine-and-Current-State-Audit.md) | BIP-01 | Doctrine and current-state audit |
| [BIP-02](BIP-02-Input-Normalization-Validation-and-Identity-Resolution.md) | BIP-02 | Input, normalization, validation, identity resolution |
| [BIP-03](BIP-03-Pipeline-Stage-State-and-Artifact-Model.md) | BIP-03 | Stage, state, and artifact model |
| [BIP-04](BIP-04-Repository-Provider-and-Persistence-Seams.md) | BIP-04 | Repository, provider, persistence seams |
| [BIP-05](BIP-05-Gaps-Risks-and-Implementation-Readiness.md) | BIP-05 | Gaps, risks, implementation readiness |

### 4.6 Forecast Versioning and Checklist Series (FVC)

Governed forecast version lifecycle and checklist gating.

| File | Doc ID | Subject |
|------|--------|---------|
| [FVC-01](FVC-01-Versioning-Checklist-Doctrine-and-Current-State-Audit.md) | FVC-01 | Doctrine and current-state audit |
| [FVC-02](FVC-02-Version-Ledger-Lifecycle-and-State-Model.md) | FVC-02 | Version ledger, lifecycle, state model |
| [FVC-03](FVC-03-Checklist-Confirmation-Gate-and-Access-Model.md) | FVC-03 | Checklist, confirmation gate, access model |
| [FVC-04](FVC-04-Repository-Provider-and-Persistence-Seams.md) | FVC-04 | Repository, provider, persistence seams |
| [FVC-05](FVC-05-Gaps-Risks-and-Implementation-Readiness.md) | FVC-05 | Gaps, risks, implementation readiness |

### 4.7 Runtime Governance Specifications

Per-tool runtime governance defining operating behavior, ownership, and workflow rules.

| File | Governs |
|------|---------|
| [_Budget-Import_Governance-Spec](_Budget-Import_Governance-Spec.md) | Budget Import tool runtime behavior |
| [_Forecast-Summary_Governance-Spec](_Forecast-Summary_Governance-Spec.md) | Forecast Summary tool runtime behavior |
| [_GC-GR-Forecast_Governance-Spec](_GC-GR-Forecast_Governance-Spec.md) | GC/GR Forecast tool runtime behavior |
| [_Cash-Flow-Forecast_Governance-Spec](_Cash-Flow-Forecast_Governance-Spec.md) | Cash Flow Forecast tool runtime behavior |
| [_Forecast-Checklist_Governance-Spec](_Forecast-Checklist_Governance-Spec.md) | Forecast Checklist tool runtime behavior |
| [_Buyout-Log_Governance-Spec](_Buyout-Log_Governance-Spec.md) | Buyout Log tool runtime behavior |
| [_History_Audit_Runtime_Governance_Spec](_History_Audit_Runtime_Governance_Spec.md) | History/Audit investigation workspace |
| [_Financial_Module_Cross_Tool_Runtime_Governance_Spec](_Financial_Module_Cross_Tool_Runtime_Governance_Spec.md) | Cross-tool coordination — how the 9 Financial tools work together |

### 4.8 Module-Level Governance Contracts

| File | Governs |
|------|---------|
| [_Financial_Module_Lane_Ownership_Matrix](_Financial_Module_Lane_Ownership_Matrix.md) | Capability-level PWA vs. SPFx mapping (elaborates FIN-03) |
| [_Financial_Module_Route_and_Context_Contract](_Financial_Module_Route_and_Context_Contract.md) | Route family and context rules (elaborates FIN-04) |
| [_Financial_Module_Acceptance_and_Scenario_Coverage_Matrix](_Financial_Module_Acceptance_and_Scenario_Coverage_Matrix.md) | Scenario coverage matrix for implementation completeness |

### 4.9 Integration and Crosswalk Files

| File | Subject |
|------|---------|
| [FIN_Gap-to-File_Crosswalk](FIN_Gap-to-File_Crosswalk.md) | Absorb/reference map for FIN-01 through FIN-04 into existing files |

### 4.10 UI Specifications

| File | Subject |
|------|---------|
| [ui/00_Financial_Module_UI_Spec_Index](ui/00_Financial_Module_UI_Spec_Index.md) | UI spec package index and governing reference hub |
| [ui/01_Financial_Control_Center_UI_Spec](ui/01_Financial_Control_Center_UI_Spec.md) | Control Center orchestrator surface |
| [ui/02_Forecast_Summary_UI_Spec](ui/02_Forecast_Summary_UI_Spec.md) | Forecast Summary surface |
| [ui/03_Budget_UI_Spec](ui/03_Budget_UI_Spec.md) | Budget surface |
| [ui/04_GCGR_UI_Spec](ui/04_GCGR_UI_Spec.md) | GC/GR surface |
| [ui/05_Cash_Flow_UI_Spec](ui/05_Cash_Flow_UI_Spec.md) | Cash Flow surface |
| [ui/06_Buyout_UI_Spec](ui/06_Buyout_UI_Spec.md) | Buyout surface |
| [ui/07_Checklist_and_Review_UI_Spec](ui/07_Checklist_and_Review_UI_Spec.md) | Checklist and Review surface |
| [ui/08_Period_History_and_Versions_UI_Spec](ui/08_Period_History_and_Versions_UI_Spec.md) | Period History and Versions surface |

### 4.11 Reconciliation and Validation

| File | Subject |
|------|---------|
| [_reconciliation/financial-repo-truth-reconciliation-summary](_reconciliation/financial-repo-truth-reconciliation-summary.md) | Prompt 01 — drift corrections with evidence |
| [_reconciliation/financial-maturity-model-normalization-summary](_reconciliation/financial-maturity-model-normalization-summary.md) | Prompt 02 — maturity model creation and H1 normalization |
| [_reconciliation/financial-repo-truth-reconciliation-closure](_reconciliation/financial-repo-truth-reconciliation-closure.md) | Prompt 03 — validation closure and baseline confirmation |

---

## 5. Capability-to-File Crosswalk

For each Financial capability, the canonical doctrine, supporting detail, runtime governance, UI spec, and implementation prompt set.

### Budget Import

| Layer | File |
|-------|------|
| Doctrine | BIP-01 through BIP-05 |
| Runtime governance | [_Budget-Import_Governance-Spec](_Budget-Import_Governance-Spec.md) |
| Entity model | FRM-01 (budget line entities), FRM-02 (aggregate boundaries) |
| Source-of-truth | PH3-FIN-SOTL §4 (budget baseline: Procore-imported, not originated) |
| Replacement crosswalk | FRC-02 (detailed mapping), FRC-05 (field-level) |
| UI spec | [ui/03_Budget_UI_Spec](ui/03_Budget_UI_Spec.md) |
| Implementation contracts | P3-E4-T02 (budget line identity), P3-E4-T07 (business rules) |
| Maturity | FIN-PR1 §3.2 — Stage 3 (Implementation Scaffold) |

### Forecast Summary

| Layer | File |
|-------|------|
| Doctrine | No dedicated series; [_Forecast-Summary_Governance-Spec](_Forecast-Summary_Governance-Spec.md) is the primary doctrine home. FVC-01–FVC-05 govern the versioning/checklist lifecycle that the summary surface depends on. P3-E4-T04 (pending) will be the field-level specification. |
| Runtime governance | [_Forecast-Summary_Governance-Spec](_Forecast-Summary_Governance-Spec.md) |
| Entity model | FRM-01 (forecast summary entities), FRM-03 (version lifecycle) |
| Source-of-truth | PH3-FIN-SOTL §4 (native Financial working state) |
| Replacement crosswalk | FRC-02, FRC-05 |
| UI spec | [ui/02_Forecast_Summary_UI_Spec](ui/02_Forecast_Summary_UI_Spec.md) |
| Implementation contracts | P3-E4-T04 (pending — IFinancialForecastSummary) |
| Maturity | FIN-PR1 §3.2 — Stage 2 (Architecturally Defined — blocked on T04) |

### GC/GR Model

| Layer | File |
|-------|------|
| Runtime governance | [_GC-GR-Forecast_Governance-Spec](_GC-GR-Forecast_Governance-Spec.md) |
| Entity model | FRM-01 (GC/GR entities), FRM-03 (version-scoped mutability) |
| Source-of-truth | PH3-FIN-SOTL §4 |
| UI spec | [ui/04_GCGR_UI_Spec](ui/04_GCGR_UI_Spec.md) |
| Implementation contracts | P3-E4-T04 (pending — IGCGRLine) |
| Maturity | FIN-PR1 §3.2 — Stage 2 (Architecturally Defined — blocked on T04) |

### Cash Flow

| Layer | File |
|-------|------|
| Runtime governance | [_Cash-Flow-Forecast_Governance-Spec](_Cash-Flow-Forecast_Governance-Spec.md) |
| Entity model | FRM-01 (cash flow entities) |
| Source-of-truth | PH3-FIN-SOTL §4 |
| UI spec | [ui/05_Cash_Flow_UI_Spec](ui/05_Cash_Flow_UI_Spec.md) |
| Implementation contracts | P3-E4-T05 |
| Maturity | FIN-PR1 §3.2 — Stage 3 (Implementation Scaffold) |

### Buyout

| Layer | File |
|-------|------|
| Runtime governance | [_Buyout-Log_Governance-Spec](_Buyout-Log_Governance-Spec.md) |
| Entity model | FRM-01 (buyout entities), FRM-03 (buyout lifecycle) |
| Source-of-truth | PH3-FIN-SOTL §4 |
| UI spec | [ui/06_Buyout_UI_Spec](ui/06_Buyout_UI_Spec.md) |
| Implementation contracts | P3-E4-T06 |
| Maturity | FIN-PR1 §3.2 — Stage 3 (Implementation Scaffold) |

### Forecast Versioning and Checklist

| Layer | File |
|-------|------|
| Doctrine | FVC-01 through FVC-05 |
| Runtime governance | [_Forecast-Checklist_Governance-Spec](_Forecast-Checklist_Governance-Spec.md) |
| Entity model | FRM-01, FRM-03 (version lifecycle) |
| UI spec | [ui/07_Checklist_and_Review_UI_Spec](ui/07_Checklist_and_Review_UI_Spec.md) |
| Implementation contracts | P3-E4-T03 |
| Maturity | FIN-PR1 §3.2 — Stage 3 (Implementation Scaffold) |

### Review, Publication, and History/Audit

| Layer | File |
|-------|------|
| Runtime governance | [_History_Audit_Runtime_Governance_Spec](_History_Audit_Runtime_Governance_Spec.md) |
| Cross-tool coordination | [_Financial_Module_Cross_Tool_Runtime_Governance_Spec](_Financial_Module_Cross_Tool_Runtime_Governance_Spec.md) |
| UI spec | [ui/08_Period_History_and_Versions_UI_Spec](ui/08_Period_History_and_Versions_UI_Spec.md) |
| Implementation contracts | P3-E4-T03 §3.6 (report-candidate), P3-E4-T08 (platform integration) |
| Maturity | FIN-PR1 §3.2 — Stage 2 (Report Publication), Stage 3 (PER Annotation) |

---

## 6. Overlap Resolution

Where two files govern the same subject, the following resolution applies:

| Subject | Overlapping Files | Resolution |
|---------|------------------|------------|
| **Lane ownership** | FIN-03 vs. `_Financial_Module_Lane_Ownership_Matrix.md` vs. P3-G1 §4.1 | **FIN-03 is authoritative** (locked). The lane ownership matrix and P3-G1 elaborate depth. SPFx "Required" means governed SPFx depth, not PWA-equivalent. See [Financial-RLR §3](Financial-Route-and-Lane-Reconciliation.md) for per-tool resolution. |
| **Route/context** | FIN-04 vs. `_Financial_Module_Route_and_Context_Contract.md` | **FIN-04 is authoritative** (locked) for route paths and slugs. The elaborated contract governs context preservation detail where FIN-04 is silent. See [Financial-RLR §2 and §4.1](Financial-Route-and-Lane-Reconciliation.md). |
| **Route naming** | FIN-04 (`/budget`, `/gcgr`) vs. elaborated contract (`/budget-import`, `/gc-gr`) vs. FRC-00 (`/budget`, `/gcgr`) | **FIN-04's locked slugs govern.** See [Financial-RLR §2 R3](Financial-Route-and-Lane-Reconciliation.md). |
| **Implementation stages** | FRC-03 (implementation stages) vs. FIN-PR1 (maturity model) | **FIN-PR1 is authoritative** for maturity classification (created 2026-03-28, post-reconciliation). FRC-03 stage summary is historical context; FIN-PR1 stage classifications are canonical. |
| **Gap/readiness analysis** | FRM-05, BIP-05, FVC-05 | Each governs its own workstream. **FRM-05** covers the Financial module holistically; **BIP-05** covers budget import; **FVC-05** covers versioning/checklist. No single file supersedes the others. |
| **FIN-01–04 integration** | FIN_Gap-to-File_Crosswalk.md vs. this index | The crosswalk remains the canonical absorb/reference guide for FIN-01–04 specifically. This index is the broader entry point. |

---

## 7. Prompt Set Roadmap

Doctrine-completion and implementation prompt sets, organized by workstream. Each set contains sequentially numbered prompts that should be run in order.

### Completed

| Set | Directory | Status |
|-----|-----------|--------|
| Repo-truth reconciliation | [repo-truth-reconciliation/](repo-truth-reconciliation/) | **Complete** (Prompts 01–03 executed 2026-03-28) |
| Doctrine control index | [doctrine-completion-tasks/](doctrine-completion-tasks/) | **Complete** (Prompts 01–03 executed 2026-03-28) |

### Ready for Execution

| Set | Directory | Prompts | Subject |
|-----|-----------|---------|---------|
| Doctrine completion | [doctrine-completion-tasks/](doctrine-completion-tasks/) | 02–03 | Normalize route/lane; validate coherence |
| Source-of-truth / entity / action boundary | [sot-entity-action-boundary/](sot-entity-action-boundary/) | 01–03 | Lock SoR model, define action boundaries, validate |
| Route/context contract | [route-context-contract-tasks/](route-context-contract-tasks/) | 01–03 | Implement canonical route family, context, validate |
| Lane / cross-lane contracts | [lane-owner-cross-lane-contracts/](lane-owner-cross-lane-contracts/) | 01–03 | Lock lane ownership, normalize handoffs, validate |
| Runtime governance | [runtime-governance-tasks/](runtime-governance-tasks/) | 01–03 | Lock runtime seams, lifecycle mutation, validate |
| Shared spine integration | [shared-spine-integration/](shared-spine-integration/) | 01–03 | Lock spine contract, integration rules, validate |
| UI / shell / workspace | [ui-shell-workspace/](ui-shell-workspace/) | 01–03 | Shell foundation, tool workspaces, validate |

### Not Yet Populated

| Set | Directory | Status |
|-----|-----------|--------|
| Acceptance / staging / release | [acceptance-staging-release/](acceptance-staging-release/) | Empty — prompts not yet authored |
| Operational workflow | [operational-workflow/](operational-workflow/) | Empty — prompts not yet authored |

---

## 8. Implementation Safety Notes

1. **Use FIN-PR1** to classify any maturity claim. Do not use bare "Complete" without specifying the maturity stage.
2. **Module-level maturity is Stage 2** (constrained by Forecast Summary and GC/GR pending T04). Most tools are at Stage 3.
3. **No `IFinancialRepository` exists** in the repo. All view hooks use hardcoded mock data.
4. **Sub-tool navigation is state-based** (`surfaceMode` via `useState`), not URL-routed.
5. **SPFx Financial lane is infrastructure stubs** only — no data-connected surfaces.
6. The [reconciliation closure note](_reconciliation/financial-repo-truth-reconciliation-closure.md) confirms the repo-truth baseline is reliable for implementation work.

---

## 9. Remaining Doctrine Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Governance specs (underscore files) are not formally linked to BIP/FRM/FVC series parents | A developer may miss the governance spec when working on a tool's data model | This index cross-references them in §5; future prompts should add governing-reference headers |
| `acceptance-staging-release/` and `operational-workflow/` prompt directories are empty | No prompt guidance exists for acceptance staging or operational workflow definition | Author prompts when those workstreams activate |
| FIN_Gap-to-File_Crosswalk absorb actions have not been executed | FIN-01–04 governance is not yet reflected in BIP-01, FVC-02, FRC-05 etc. as specified | Execute doctrine-completion prompts 02–03 |
| T04 source contracts remain unwritten | Forecast Summary and GC/GR cannot advance past Stage 2 | T04 authoring is a blocking implementation task |
