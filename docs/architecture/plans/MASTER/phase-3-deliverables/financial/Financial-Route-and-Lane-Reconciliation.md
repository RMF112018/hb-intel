# Financial Route and Lane Reconciliation

| Field | Value |
|---|---|
| **Doc ID** | Financial-RLR |
| **Document Type** | Reconciliation Decision Record |
| **Owner** | Architecture lead |
| **Created** | 2026-03-28 |
| **Status** | Active — governs implementation until affected locked docs are formally revised |
| **Supersedes** | Conflicts between FIN-03, FIN-04, `_Financial_Module_Lane_Ownership_Matrix.md`, `_Financial_Module_Route_and_Context_Contract.md`, P3-G1 §4.1, and P3-G2 §8.1 where explicitly resolved below |
| **References** | [FIN-03](FIN-03_Lane-Ownership-Matrix.md); [FIN-04](FIN-04_Route-and-Context-Contract.md); [P3-G1](../P3-G1-Lane-Capability-Matrix.md); [P3-G2](../P3-G2-Cross-Lane-Navigation-and-Handoff-Map.md); [FIN-PR1](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md); [Control Index](Financial-Doctrine-Control-Index.md) |

---

## 1. Purpose

This document resolves 12 identified contradictions between the Financial module's route doctrine, lane doctrine, and cross-lane governance. It provides binding implementation decisions where locked doctrine files disagree with each other or with Project Hub governance.

**Precedence:** Where this document explicitly resolves a contradiction, its decision governs implementation until the affected locked documents are formally revised.

---

## 2. Route Doctrine Resolutions

### R1. Route Parameterization Syntax

**Contradiction:** FIN-04 uses `$projectId` (shell-style); elaborated contract uses `:projectId` (Express/React Router); actual code uses `:projectId`.

**Decision:** All implementations must use `:projectId` (React Router convention). FIN-04's `$projectId` notation is a documentation convention, not a literal route syntax. Implementations read `:projectId` as the canonical parameterization style.

---

### R2. Canonical Route Family and Parent Path

**Contradiction:** FIN-04 specifies `/project-hub/$projectId/financial/...`; elaborated contract specifies `/projects/:projectId/financial/...`.

**Decision:** The canonical parent path is `/project-hub/:projectId/financial`. This matches both FIN-04's intent and the actual registered route in `projectHubRouting.ts`. The elaborated contract's `/projects/:projectId` path is superseded.

---

### R3. Sub-Tool Route Names

**Contradiction:** Three different naming conventions exist across FIN-04, elaborated contract, and FRC-00 §4.7.

**Decision:** The canonical sub-tool route slugs are:

| Tool | Route Slug | Rationale |
|------|-----------|-----------|
| Financial Home | `/financial` | Matches current implementation |
| Budget Import | `/financial/budget` | FIN-04 (locked); shorter and consistent |
| Forecast Summary | `/financial/forecast` | FIN-04 (locked) |
| Forecast Checklist | `/financial/checklist` | FIN-04 (locked) |
| GC/GR Model | `/financial/gcgr` | FIN-04 (locked) |
| Cash Flow | `/financial/cash-flow` | FIN-04 (locked) |
| Buyout | `/financial/buyout` | FIN-04 (locked) |
| Review | `/financial/review` | FIN-04 (locked) |
| Publication | `/financial/publication` | FIN-04 (locked) |
| History | `/financial/history` | FIN-04 (locked) |

The elaborated contract's hyphenated variants (`budget-import`, `forecast-summary`, `gc-gr`) are superseded by FIN-04's locked slugs.

---

### R4. Sub-Tool Routes Are Target-State

**Contradiction:** FIN-04 presents sub-tool routes as locked canonical doctrine; FRC-00 §4.7 flags them as target-state; actual code has no sub-routes (state-based `surfaceMode` navigation).

**Decision:** Sub-tool routes are **locked target-state doctrine**. They are the required implementation target, but they do not currently exist. Current state:
- Only `/project-hub/:projectId/financial` is implemented
- Sub-tool navigation uses `useState`-based `surfaceMode`
- Deep links to `/financial/budget` etc. do not work
- Per FIN-PR1 §3.3: sub-tool URL routing is at Stage 1 (Doctrine-Defined)

**Implementation requirement:** Sub-tool routes must be implemented to advance Financial from Stage 3 to Stage 4 (Partially Operational). FIN-04's route family is the target, not a description of current state.

---

### R5. Deep-Link Durability and Refresh Behavior

**Contradiction:** FIN-04 mandates deep-link durability and refresh preservation; code has neither.

**Decision:** FIN-04's deep-link rules are **correct target-state requirements**. Current implementation does not satisfy them. This is not a documentation error — it is an implementation gap. Advancing to FIN-PR1 Stage 4 requires:
- URL-routed sub-tools (not state-based)
- Deep-link restoration of project + section + tool
- Refresh returns user to same project, section, and tool

---

### R6. Project-Switch Section Preservation

**Contradiction:** FIN-04 requires sub-section preservation on project switch; code can only preserve top-level section.

**Decision:** FIN-04's rule is the **correct target-state requirement**. Current `resolveProjectHubSwitchTarget` correctly preserves the `financial` section but cannot preserve sub-tool state because sub-tools are not URL-routed. When sub-tool routes are implemented, the project-switch function must preserve the sub-tool slug (e.g., `/project-hub/B/financial/cash-flow`).

---

## 3. Lane Doctrine Resolutions

### L1. Lane Ownership Governing Authority

**Contradiction:** FIN-03 (locked) says PWA owns deep editing for GC/GR, Cash Flow, Budget reconciliation, and Checklist resolution. P3-G1 §4.1 says SPFx has "Required" depth for these same capabilities.

**Decision:** FIN-03's **locked rule §1.3** governs: if a Financial interaction requires multi-step guided workflow, complex reconciliation, draft resilience, version lifecycle transition, dense editing, heavy cross-surface coordination, or review/publication custody, that interaction belongs to **PWA**.

P3-G1 §4.1 "Required" for SPFx must be read as **"Required at governed SPFx depth"** — meaning SPFx must provide the capability at the depth appropriate for its lane (summary views, shallow edits, Launch-to-PWA for deep workflows), not at PWA-equivalent depth.

**Per-tool resolution:**

| Capability | PWA | SPFx | Resolution |
|-----------|-----|------|------------|
| Budget CSV import with identity resolution | **Full** — owns workflow | **Broad** — status view + Launch-to-PWA for import | FIN-03 governs; P3-G1 "Broad" is correct |
| Budget line reconciliation | **Full** — owns resolution | **Summary + Launch-to-PWA** | FIN-03 governs; P3-G1 "Required" means required visibility, not required resolution depth |
| Forecast Summary editing | **Full** — owns editing | **View + Launch-to-PWA for edits** | FIN-03 governs |
| Forecast Checklist completion | **Full** — owns resolution | **Posture visibility + Launch-to-PWA** | FIN-03 governs; P3-G1 "Required" means required visibility |
| GC/GR editing | **Full** — owns editing | **View + Launch-to-PWA** | FIN-03 §4.5 explicit: PWA-only unless narrow shallow case defined (none defined) |
| Cash Flow editing | **Full** — owns editing | **View + Launch-to-PWA** | FIN-03 §4.5 explicit: PWA-only unless narrow shallow case defined |
| Buyout management | **Full** — owns workflow | **Status view + Launch-to-PWA** | FIN-03 §4.6 governs |
| Buyout savings disposition | **Full** — multi-step modal is PWA-native | **Launch-to-PWA** | Consistent across all docs |
| PER annotation on confirmed versions | **Full** — owns annotation | **Launch-to-PWA** | Consistent across FIN-03, P3-G1 |
| Version management | **Full** — owns lifecycle | **View + Launch-to-PWA** | FIN-03 §4.3 governs |
| Report publication | **Full** — owns custody | **Status + Launch-to-PWA** | FIN-03 §4.7 governs |

---

### L2. SPFx "Required" Reinterpretation

**Decision:** Wherever P3-G1 §4.1 marks an SPFx Financial capability as "Required", this means:
- SPFx **must expose** the capability at its governed depth (view, summary, posture visibility, or Launch-to-PWA)
- SPFx does **not** need to provide PWA-equivalent editing, workflow resolution, or lifecycle management
- FIN-03's locked rule §1.3 determines whether the interaction requires PWA depth

This reinterpretation applies to: Budget reconciliation, Checklist completion, GC/GR editing, Cash Flow editing, Version management, and any future capability where FIN-03's multi-step/complex criteria apply.

---

### L3. SPFx Financial Module Lane Surfaces

**Contradiction:** FIN-04 defines only PWA route family; SPFx has module-lane surfaces via `apps/project-hub` Stage 10.2.

**Decision:** SPFx Financial module-lane surfaces exist and are governed by P3-G1 §1.2 and the current-state-map Stage 10.2/11.2 annotations. FIN-04's route family is **PWA-authoritative**. SPFx surfaces consume the same project context but route through SPFx's module-lane registry, not through FIN-04's PWA route paths. Cross-lane navigation from SPFx to PWA uses P3-G2 handoff patterns.

---

## 4. Elaborated Contract Reconciliation

### E1. `_Financial_Module_Route_and_Context_Contract.md`

This file elaborates FIN-04 with detailed period context, version/artifact preservation, deep-link durability, return behavior, and re-entry rules. Its content is **directionally correct target-state doctrine** that enriches FIN-04. However:

- Its route path (`/projects/:projectId/financial`) is superseded by FIN-04's `/project-hub/:projectId/financial` (see R2)
- Its sub-tool slugs (`budget-import`, `forecast-summary`, `gc-gr`) are superseded by FIN-04's slugs (see R3)
- Its period/version/artifact context preservation rules are **valid target-state requirements** that FIN-04 does not fully specify

**Status:** Supporting doctrine that elaborates FIN-04. FIN-04 governs route paths and slugs; the elaborated contract governs context preservation detail where FIN-04 is silent.

---

### E2. `_Financial_Module_Lane_Ownership_Matrix.md`

This file elaborates FIN-03 with capability-level detail. Several of its "Required" SPFx claims conflict with FIN-03's locked PWA-ownership rules.

**Status:** Supporting doctrine that must be read through the L1 reinterpretation above. Where it marks SPFx as "Required" for a capability that FIN-03 §1.3 locks to PWA, the SPFx depth is governed SPFx depth (view/summary/Launch-to-PWA), not PWA-equivalent depth.

---

## 5. Unresolved Items

These items cannot be resolved by doctrine alone and require future implementation or architecture decisions:

| # | Item | Why Unresolved | Required Action |
|---|------|---------------|-----------------|
| 1 | Sub-tool URL routing not implemented | Code change required, not doc change | Implement route params per FIN-04's locked slugs |
| 2 | Deep-link durability not implemented | Code change required | Implement per FIN-04 §4 and elaborated contract §5 |
| 3 | Project-switch sub-section preservation not functional | Depends on sub-tool URL routing | Implement after sub-tool routes exist |
| 4 | SPFx Financial surfaces use mock data | Code change required | Implement data layer per FIN-PR1 Stage 4 requirements |
| 5 | Two empty prompt directories (acceptance-staging-release, operational-workflow) | Prompts not yet authored | Author when workstreams activate |
