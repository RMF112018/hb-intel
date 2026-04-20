# Financial Cross-Lane Handoff and Launch Contract

| Field | Value |
|---|---|
| **Doc ID** | Financial-CLHLC |
| **Document Type** | Cross-Lane Handoff and Launch Contract |
| **Owner** | Architecture lead |
| **Created** | 2026-03-28 |
| **Status** | Active — governs cross-lane navigation, launch, and return behavior |
| **References** | [Financial-LODM](Financial-Lane-Ownership-Decision-Matrix.md); [Financial-RLR §3](Financial-Route-and-Lane-Reconciliation.md); [FIN-04](FIN-04_Route-and-Context-Contract.md); [P3-G2](../P3-G2-Cross-Lane-Navigation-and-Handoff-Map.md); [Control Index](Financial-Doctrine-Control-Index.md) |

---

## 1. Purpose

This contract defines every cross-lane movement pattern for the Financial module: when a user stays in-lane, when they launch cross-lane, what context survives the transition, what route state is preserved, and what acceptance evidence applies. It is the implementation reference for wiring SPFx-to-PWA launch and return behavior.

---

## 2. Cross-Lane Movement Patterns

### 2.1 SPFx → PWA Launch (Launch-to-PWA)

The primary cross-lane pattern. SPFx provides a contextual entry point that opens the canonical PWA Financial surface.

**Trigger:** User clicks an action in the SPFx Financial module-lane surface that requires deep workflow (editing, reconciliation, lifecycle transition, annotation, investigation).

**Target construction:** The SPFx surface must construct a canonical PWA deep-link URL using the project-scoped Financial route family:

```
https://{pwa-host}/project-hub/{projectId}/financial/{tool}
```

Where `{tool}` is one of the 9 canonical FIN-04 slugs: `budget`, `forecast`, `checklist`, `gcgr`, `cash-flow`, `buyout`, `review`, `publication`, `history`.

**Implementation note:** Use the `buildFinancialToolPath(projectId, tool)` utility from `apps/pwa/src/router/projectHubRouting.ts` (or its equivalent in SPFx) to construct canonical URLs. For Financial Home (no tool slug), use `buildProjectHubPath(projectId, 'financial')`.

**Context that must survive the launch:**

| Context | Source | How Preserved |
|---------|--------|--------------|
| Project identity | SPFx site-URL → `projectId` registry lookup | Embedded in PWA URL path |
| Financial tool | SPFx launch action | Embedded in PWA URL path as tool slug |
| Reporting period | SPFx display context (if available) | Query param `?period={YYYY-MM}` (optional) |
| Version ID | SPFx summary context (if available) | Query param `?versionId={id}` (optional) |
| Artifact ID | SPFx artifact link (if available) | Query param `?artifactId={id}` (optional) |

**Post-launch behavior:**
- PWA resolves the deep-link via `resolveFinancialToolEntry`
- Financial context store (`saveFinancialContext`) records the tool entry
- If optional query params are present, they seed the Financial context; if absent, PWA uses its own per-project context or defaults

### 2.2 In-Lane Continuation (SPFx)

SPFx Financial surfaces provide summary, status, and posture views without requiring cross-lane navigation.

**Stays in-lane when:**
- Viewing confirmed/published Financial summary (read-only)
- Viewing budget import status
- Viewing buyout completion % and exposure
- Viewing checklist posture badge (count/ready/blocked)
- Viewing cash flow position summary
- Viewing publication status and artifact download links
- Viewing recent activity / version timeline summary

**Never in-lane:**
- Editing any Financial working-state field
- Resolving reconciliation conditions
- Managing checklist items
- Advancing buyout status
- Creating/managing annotations
- Designating report candidates
- Confirming or deriving versions

### 2.3 In-Lane Continuation (PWA)

All Financial operations in PWA stay in-lane. PWA never launches to SPFx.

### 2.4 PWA → SPFx (Not Applicable)

There is no PWA-to-SPFx navigation pattern for Financial. PWA is the authoritative deep-workflow surface. A user in PWA who wants to return to the SharePoint project site navigates via the shell's project-site link, not via a Financial-initiated cross-lane handoff.

---

## 3. Per-Capability Handoff Rules

| Capability | SPFx In-Lane View | Launch-to-PWA Trigger | PWA Target Route | Context Passed |
|-----------|-------------------|----------------------|-----------------|----------------|
| Financial Home | Summary tiles / KPI band | "Open Financial" action | `/project-hub/{projectId}/financial` (section root, no tool slug) | projectId |
| Budget Import | Import status badge | "Start Import" / "Resume Import" action | `/financial/budget` | projectId |
| Forecast Summary | Read-only confirmed/published summary | "Edit Forecast" action | `/financial/forecast` | projectId, period (optional) |
| Forecast Checklist | Posture badge (X of 19 complete) | "Resolve Checklist" action | `/financial/checklist` | projectId |
| GC/GR Forecast | Read-only variance summary | "Edit GC/GR" action | `/financial/gcgr` | projectId |
| Cash Flow Forecast | Read-only cash position | "Edit Cash Flow" action | `/financial/cash-flow` | projectId |
| Buyout Log | Completion % and count | "Manage Buyout" action | `/financial/buyout` | projectId |
| Review / PER | Review status indicator | "Open Review" action | `/financial/review` | projectId, versionId (optional) |
| Publication / Export | Publication status + download links | "Manage Publication" action | `/financial/publication` | projectId |
| History / Audit | Recent activity summary | "Open History" action | `/financial/history` | projectId |

---

## 4. Return and Resume Behavior

### 4.1 After Launch-to-PWA

When a user launches from SPFx to PWA:
- The user lands in a new browser tab or the existing PWA window (implementation-dependent on host behavior)
- PWA resolves the deep-link independently — it does not depend on SPFx session state
- The user's PWA Financial context is updated via `saveFinancialContext`
- There is **no automatic return-to-SPFx** after completing work in PWA

### 4.2 Re-Entry to SPFx After PWA Work

When a user returns to the SPFx project site after working in PWA:
- SPFx Financial summary surfaces must reflect current data (not cached pre-launch state)
- No working-state or draft context is transferred from PWA back to SPFx
- SPFx summary views should reload from the data source, not from stale in-memory state

### 4.3 Per-Project Return-Memory in PWA

When a user re-enters a project's Financial section in PWA (via any path):
- The Financial context store restores the last-visited tool per project via `getFinancialReturnTool`
- The section route loader redirects to the saved tool if valid
- Explicitly navigating to Financial home clears the return-memory tool (`saveFinancialContext({ lastTool: null })`)

---

## 5. Context Durability Rules

### 5.1 What Must Survive Cross-Lane Launch

| Context | Must Survive | Mechanism |
|---------|-------------|-----------|
| Project identity | **Yes** | Embedded in URL path (`/project-hub/:projectId/financial/:tool`) |
| Financial tool | **Yes** | Embedded in URL path |
| Reporting period | **Best-effort** | Query param (optional); PWA uses own context if absent |
| Version ID | **Best-effort** | Query param (optional); PWA resolves current working version if absent |
| Artifact ID | **Best-effort** | Query param (optional); PWA navigates to tool home if absent |

### 5.2 What Must NOT Survive Cross-Lane Launch

| Context | Must NOT Survive | Why |
|---------|-----------------|-----|
| SPFx session state | Correct — not transferred | PWA has its own context store |
| Draft edits from another project | Correct — not transferred | Per-project isolation via `financialContextState` |
| SPFx display preferences | Correct — not transferred | Lane-specific UI state |

### 5.3 Edit Authority Across Lane Transitions

Edit authority does **not change** during a cross-lane transition. The same role-based access control (LMG §4) applies regardless of entry lane. A PM launching from SPFx to PWA has the same write authority as a PM entering PWA directly. PER launching from SPFx to PWA review has the same annotation authority.

---

## 6. Acceptance Posture by Lane Behavior

Acceptance evidence must distinguish between these completion categories:

| Category | What It Proves | Example Evidence |
|----------|---------------|-----------------|
| **Lane ownership complete** | The capability works at its governed depth in the specified lane | PWA: PM can edit forecast summary; SPFx: read-only summary renders |
| **Cross-lane launch complete** | SPFx correctly constructs and opens the canonical PWA deep-link | Click "Edit Forecast" in SPFx → PWA opens at `/financial/forecast` with correct projectId |
| **Context durability complete** | Required context survives the transition and is usable in PWA | Project identity resolves; optional period/version seeds Financial context |
| **Return/resume complete** | Re-entry behavior works as governed | PWA return-memory restores last tool; SPFx reloads current data after PWA work |
| **Summary-only parity** | SPFx summary shows the same semantic information as PWA overview | SPFx KPI band matches PWA control center tool posture |

**Not required for acceptance:**
- SPFx deep-workflow parity with PWA (explicitly excluded by FIN-03 §1.3)
- Automatic return-to-SPFx from PWA
- Cross-lane draft synchronization

---

## 7. Implementation Maturity

| Behavior | Current Stage | Evidence |
|----------|--------------|----------|
| PWA canonical routes | Stage 3 | 9 sub-tool routes implemented, URL-routed |
| PWA per-project context | Stage 3 | `financialContextState` with return-memory |
| SPFx Financial summary | Stage 2 | Module-lane infrastructure stubs; no data-connected surfaces |
| SPFx → PWA Launch | Stage 1 | Doctrine-defined; no launch actions implemented |
| Context transfer (query params) | Stage 1 | Doctrine-defined; not yet implemented |
| SPFx post-launch reload | Stage 1 | Doctrine-defined; not yet implemented |

---

## 8. Remaining Cross-Lane Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | SPFx launch-to-PWA not yet implemented | Users cannot transition from SPFx to PWA for deep workflows | Implement after SPFx Financial summary surfaces exist |
| 2 | Query param context seeding not implemented | Period/version context from SPFx launch is lost | Implement as part of Financial data-layer wiring (Stage 4) |
| 3 | SPFx summary surfaces not yet data-connected | SPFx cannot display current Financial posture | Implement after PWA reaches Stage 5 |
| 4 | No acceptance tests for cross-lane behavior | Cannot verify launch or context transfer | Author tests when both lanes have data-connected surfaces |
