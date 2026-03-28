# Financial Lane Ownership Decision Matrix

| Field | Value |
|---|---|
| **Doc ID** | Financial-LODM |
| **Document Type** | Lane Ownership Decision Matrix |
| **Owner** | Architecture lead |
| **Created** | 2026-03-28 |
| **Status** | Active — governs per-capability lane implementation |
| **Governing Authority** | [FIN-03](FIN-03_Lane-Ownership-Matrix.md) (locked lane doctrine) |
| **Resolved By** | [Financial-RLR §3](Financial-Route-and-Lane-Reconciliation.md) (L1–L3 contradiction resolution) |
| **References** | [P3-G1 §4.1](../P3-G1-Lane-Capability-Matrix.md); [FIN-PR1](FIN-PR1-Financial-Production-Readiness-Maturity-Model.md); [Control Index](Financial-Doctrine-Control-Index.md) |

---

## 1. Purpose

This matrix locks the canonical lane ownership posture for every Financial module capability. It is the single file an implementer reads to determine where each Financial workflow lives, what depth each lane provides, and what evidence proves lane-specific completion.

**Governing rule (FIN-03 §1.3):** If a Financial interaction requires multi-step guided workflow, complex reconciliation, draft resilience, version lifecycle transition, dense editing, heavy cross-surface coordination, or review/publication custody, that interaction belongs to **PWA**, even if SPFx provides the contextual launch point.

**SPFx "Required" interpretation (Financial-RLR §3 L2):** Wherever P3-G1 §4.1 marks SPFx as "Required", this means required at governed SPFx depth — view, summary, posture visibility, or Launch-to-PWA — not PWA-equivalent editing depth.

---

## 2. Capability Decision Matrix

### Legend

| Classification | Meaning |
|---------------|---------|
| **PWA-native** | Deep workflow lives exclusively in PWA; SPFx launches into PWA for this workflow |
| **SPFx-summary** | SPFx provides read-only summary, posture visibility, or status; no mutations |
| **SPFx-broad** | SPFx supports shallow operations (status view, launch actions) but not deep editing |
| **Launch-to-PWA** | SPFx provides a contextual entry point that opens the canonical PWA surface |

### 2.1 Financial Module Home / Control Center

| Aspect | PWA | SPFx |
|--------|-----|------|
| **Classification** | **PWA-native** | **SPFx-summary** |
| Surface | Full control center with tool posture rail, action queue, period header, activity strip | Summary tiles or KPI band within project-site module lane |
| Editing | N/A (orchestrator, not editor) | N/A |
| Launch behavior | Direct entry at `/project-hub/:projectId/financial` | Module-lane entry; Launch-to-PWA for deep tool access |
| Actors | PM, PER, Leadership | PM, PER, Leadership |
| Acceptance evidence | Control center renders with tool posture and navigation | Module-lane renders summary; Launch-to-PWA opens PWA financial home |

### 2.2 Budget Import

| Aspect | PWA | SPFx |
|--------|-----|------|
| **Classification** | **PWA-native** | **SPFx-broad** (status + Launch-to-PWA) |
| Surface | Full import workflow: CSV upload, validation, identity resolution, reconciliation condition resolution | Import status visibility; "Start Import" or "Resume Import" launch |
| Editing | Full — validation, reconciliation, identity resolution, batch execution | None — no import execution in SPFx |
| Launch behavior | Direct entry at `/project-hub/:projectId/financial/budget` | Launch-to-PWA for import workflow |
| Actors | PM | PM (status view only in SPFx) |
| Acceptance evidence | End-to-end import completes with identity resolution and reconciliation in PWA | Status correctly displayed; Launch-to-PWA opens budget tool |

### 2.3 Forecast Summary

| Aspect | PWA | SPFx |
|--------|-----|------|
| **Classification** | **PWA-native** | **SPFx-summary** + Launch-to-PWA for edits |
| Surface | Full summary editing: PM-editable fields on Working version, derived field recomputation, version context | Read-only summary view of confirmed/published versions |
| Editing | Full — PM edits on Working version only | None — view only; Launch-to-PWA for edits |
| Launch behavior | Direct entry at `/project-hub/:projectId/financial/forecast` | Launch-to-PWA for editing |
| Actors | PM (edit), PER (annotate on Confirmed/Published), Leadership (view) | All roles (view only) |
| Acceptance evidence | PM can edit and save Working version fields; derived fields recompute | Summary displays correctly; Launch-to-PWA navigates to PWA forecast |

### 2.4 Forecast Checklist

| Aspect | PWA | SPFx |
|--------|-----|------|
| **Classification** | **PWA-native** | **SPFx-summary** (posture visibility) + Launch-to-PWA |
| Surface | Full checklist resolution: 19 items, completion tracking, confirmation gate | Posture visibility: unresolved count, blocked/ready status |
| Editing | Full — PM marks items complete; confirmation gate enforced | None — posture display only |
| Launch behavior | Direct entry at `/project-hub/:projectId/financial/checklist` | Launch-to-PWA to resolve checklist items |
| Actors | PM | PM (posture view only in SPFx) |
| Acceptance evidence | All 19 items manageable; confirmation gate blocks when incomplete | Posture badge shows correct count; Launch-to-PWA opens checklist |

### 2.5 GC/GR Forecast

| Aspect | PWA | SPFx |
|--------|-----|------|
| **Classification** | **PWA-native** | **SPFx-summary** + Launch-to-PWA |
| Surface | Full GC/GR editing: version-scoped line editing, variance analysis, summary rollup | Read-only variance summary |
| Editing | Full — PM edits on Working version only (FIN-03 §4.5: PWA-only unless narrow shallow case explicitly defined; none defined) | None — view only |
| Launch behavior | Direct entry at `/project-hub/:projectId/financial/gcgr` | Launch-to-PWA for editing |
| Actors | PM (edit), Leadership (view) | All roles (view only) |
| Acceptance evidence | Line editing works; variance recomputes correctly | Summary displays; Launch-to-PWA opens GC/GR tool |

### 2.6 Cash Flow Forecast

| Aspect | PWA | SPFx |
|--------|-----|------|
| **Classification** | **PWA-native** | **SPFx-summary** + Launch-to-PWA |
| Surface | Full cash flow editing: 13 actuals (read-only) + 18 forecast months, cumulative chart, A/R aging, deficit shading | Read-only summary (cumulative totals, cash position) |
| Editing | Full — PM edits forecast months on Working version only (FIN-03 §4.5: PWA-only) | None — view only |
| Launch behavior | Direct entry at `/project-hub/:projectId/financial/cash-flow` | Launch-to-PWA for editing |
| Actors | PM (edit), Leadership (view) | All roles (view only) |
| Acceptance evidence | Forecast month editing works; cumulative series recomputes | Summary displays; Launch-to-PWA opens cash flow tool |

### 2.7 Buyout Log

| Aspect | PWA | SPFx |
|--------|-----|------|
| **Classification** | **PWA-native** | **SPFx-broad** (status view + Launch-to-PWA) |
| Surface | Full buyout management: lifecycle tracking, ContractExecuted gate, dollar-weighted completion, savings disposition | Status view: buyout count, completion %, exposure summary |
| Editing | Full — PM manages buyout lines, advances status, creates dispositions | None — status view only |
| Launch behavior | Direct entry at `/project-hub/:projectId/financial/buyout` | Launch-to-PWA for buyout workflow |
| Actors | PM | PM (status view only in SPFx) |
| Savings disposition | **PWA-only** — multi-step three-destination workflow (FIN-03 §4.6, P3-G1 confirmed) | **Launch-to-PWA** — SPFx provides no disposition UI |
| Acceptance evidence | Full lifecycle with ContractExecuted gate; savings disposition completes | Status summary correct; Launch-to-PWA opens buyout tool |

### 2.8 Review / PER Annotation

| Aspect | PWA | SPFx |
|--------|-----|------|
| **Classification** | **PWA-native** | **Launch-to-PWA** |
| Surface | Full review workflow: annotation on Confirmed/Published versions, carry-forward, PM disposition, review custody transitions | Review status visibility; Launch-to-PWA for annotation |
| Editing | Full — PER annotates; PM dispositions carried-forward annotations | None — status only |
| Launch behavior | Direct entry at `/project-hub/:projectId/financial/review` | Launch-to-PWA for review actions |
| Actors | PER (annotate), PM (disposition) | PER, PM (status view only) |
| Acceptance evidence | Annotations persist; carry-forward works on derivation; custody transitions enforced | Review status displays; Launch-to-PWA opens review surface |

### 2.9 Publication / Export

| Aspect | PWA | SPFx |
|--------|-----|------|
| **Classification** | **PWA-native** | **SPFx-summary** (status) + Launch-to-PWA |
| Surface | Full publication workflow: report-candidate designation, P3-F1 handoff, export runs | Publication status visibility; artifact download links |
| Editing | Full — PM designates candidate; system promotes to Published | None — status and download only |
| Launch behavior | Direct entry at `/project-hub/:projectId/financial/publication` | Launch-to-PWA for publication actions |
| Actors | PM | PM (status view in SPFx) |
| Acceptance evidence | Report-candidate designation works; publication handoff completes | Status correct; artifact links work; Launch-to-PWA opens publication |

### 2.10 History / Audit

| Aspect | PWA | SPFx |
|--------|-----|------|
| **Classification** | **PWA-native** | **SPFx-summary** + Launch-to-PWA |
| Surface | Full investigation workspace: version history, audit trail, remediation tracking | Summary: recent activity, version timeline |
| Editing | Investigation actions — not direct data editing | None |
| Launch behavior | Direct entry at `/project-hub/:projectId/financial/history` | Launch-to-PWA for investigation |
| Actors | PM, PER, Leadership | All roles (summary only) |
| Acceptance evidence | Version history navigable; audit events visible | Summary renders; Launch-to-PWA opens history |

---

## 3. Summary by Lane

### 3.1 PWA Lane — Canonical Operating Surface

PWA owns **all deep Financial workflows**. Every capability is PWA-native at full depth.

| Capability | PWA Depth |
|-----------|-----------|
| Financial Home | Full control center |
| Budget Import | Full import + reconciliation workflow |
| Forecast Summary | Full PM editing on Working version |
| Forecast Checklist | Full checklist resolution + confirmation gate |
| GC/GR Forecast | Full line editing + variance analysis |
| Cash Flow Forecast | Full forecast month editing + actuals view |
| Buyout Log | Full lifecycle + savings disposition |
| Review / PER | Full annotation + custody + carry-forward |
| Publication / Export | Full designation + handoff + export |
| History / Audit | Full investigation workspace |

### 3.2 SPFx Lane — Contextual Companion Surface

SPFx provides **governed-depth visibility and contextual launch**. No deep Financial editing occurs in SPFx.

| Capability | SPFx Depth | SPFx Role |
|-----------|-----------|-----------|
| Financial Home | Summary tiles / KPI band | **SPFx-summary** |
| Budget Import | Status view + launch action | **SPFx-broad** |
| Forecast Summary | Read-only confirmed/published view | **SPFx-summary** |
| Forecast Checklist | Posture badge (count/ready/blocked) | **SPFx-summary** |
| GC/GR Forecast | Read-only variance summary | **SPFx-summary** |
| Cash Flow Forecast | Read-only cash position summary | **SPFx-summary** |
| Buyout Log | Status count + completion % | **SPFx-broad** |
| Review / PER | Review status | **Launch-to-PWA** |
| Publication / Export | Publication status + download links | **SPFx-summary** |
| History / Audit | Recent activity summary | **SPFx-summary** |

---

## 4. Implementation Maturity

Per FIN-PR1:

| Lane | Current Stage | Evidence |
|------|--------------|----------|
| PWA | Stage 3 — Implementation Scaffold | 29 UI components rendering with mock data; 9 canonical tool routes implemented; per-project context with return-memory |
| SPFx | Stage 2 — Architecturally Defined | Module-lane infrastructure stubs; no data-connected Financial surfaces |

---

## 5. Remaining Lane Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | SPFx Financial summary surfaces not yet implemented | SPFx lane cannot display Financial posture or launch to PWA | Implement after PWA reaches Stage 5 |
| 2 | Launch-to-PWA deep-link format not standardized for SPFx | SPFx may construct incorrect PWA URLs | Use canonical `buildFinancialToolPath` or equivalent |
| 3 | SPFx density control for Financial KPI/summary tiles undefined | Financial summary may not match SPFx density model | Apply `useDensity()` pattern when implementing SPFx surfaces |
| 4 | No lane-specific acceptance tests exist | Lane completion claims cannot be verified | Author lane acceptance tests per P3-G3 when surfaces are implemented |
