> **Doc Classification:** Canonical Normative Plan — Workstream B production readiness matrix; classifies all workspace members by maturity label as of Phase 0 execution (2026-03-16).

# P0-B1 Production Readiness Matrix

## Purpose

This matrix classifies every workspace member (packages, applications, and backend services) by production readiness. Its primary purpose is to prevent scaffold-backed flows, mock adapters, and incomplete packages from reaching production until explicit validation has been performed. It serves as the baseline control artifact for all future phase gate reviews and production promotion decisions.

---

## Maturity Label Rubric

| Label | Meaning | Production Use |
|-------|---------|----------------|
| `production-ready` | Functional, tested, real adapters, no known blockers | Allowed |
| `pilot-ready` | Functional, limited coverage or unvalidated real adapters, safe for internal pilot | Allowed with monitoring |
| `usable-but-incomplete` | Core functionality works; known gaps in coverage, adapters, or docs | Dev/staging only unless gated |
| `scaffold-only` | Structure exists, no real implementation; stubs only | Never in production flows |
| `blocked` | Depends on unready item | Not until blocker resolves |
| `excluded-from-production-path` | Intentionally dev/test/demo only | Never in production |

---

## Production Path Restrictions

Packages labeled `scaffold-only` or `excluded-from-production-path` **must not** appear in production adapter chains. Packages labeled `usable-but-incomplete` require explicit gap assessment before production promotion; any production use of a package below `pilot-ready` requires documented justification approved by the program architecture lead. See ADR-0095 (stub-detection enforcement) and ADR-0116 (UI governance) for governance mechanisms and phase-gate authority.

---

## Maturity Matrix by Category

### 5.1 Category A: Core Platform Packages (8)

| Package | Name | Version | Label | Notes |
|---------|------|---------|-------|-------|
| `packages/models` | @hbc/models | v0.1.0 | usable-but-incomplete | Foundation TypeScript contracts. Sparse relative to full domain model; Phase 1+ will expand. |
| `packages/data-access` | @hbc/data-access | v0.0.1 | usable-but-incomplete | Ports/adapters layer architecture complete. Real SharePoint/Graph adapters in progress; mock adapters in use. Critical Phase 1 blocker for production data integration. |
| `packages/query-hooks` | @hbc/query-hooks | v0.0.1 | usable-but-incomplete | TanStack Query React hooks wrapping data-access. Bridge complete; depends on data-access adapter maturity. |
| `packages/auth` | @hbc/auth | v0.2.0 | pilot-ready | Dual-mode MSAL/dev authentication validated; not final production hardening (token refresh, service principal, MFA enforcement deferred). Safe for Wave 0 pilot and internal testing. |
| `packages/shell` | @hbc/shell | v0.0.1 | usable-but-incomplete | Global navigation and layout. Structure complete; responsive hardening and accessibility verification pending. |
| `packages/app-shell` | @hbc/app-shell | v0.0.2 | usable-but-incomplete | Shell/auth/ui-kit aggregator. Read-only surface for SPFx constrained contexts; behavioral composition pending. |
| `packages/ui-kit` | @hbc/ui-kit | v2.1.0 | pilot-ready | Wave 1 production readiness scorecard passed (ADR-0116); component maturity matrix published; UI ownership and conformance governance active. Entry gate satisfied for Wave 0 pilot. |
| `packages/provisioning` | @hbc/provisioning | v0.2.0 | usable-but-incomplete | Headless SignalR saga layer architecturally mature (7-step compensation chain, G2.3 audit fix validated). Production SharePoint/Azure Functions validation pending; currently gates Wave 0 production readiness. |

### 5.2 Category B: Shared Infrastructure (2)

| Package | Name | Version | Label | Notes |
|---------|------|---------|-------|-------|
| `packages/spfx` | @hbc/spfx | v0.0.1 | usable-but-incomplete | SPFx webpart scaffolding and utilities. Pattern complete; real webpart builds verified in Wave 0. Full SPFx-specific error handling and deployment patterns pending. |
| `packages/eslint-plugin-hbc` | @hb-intel/eslint-plugin-hbc | v1.0.0 | production-ready | Standalone lint tooling. Complete, tested, in active monorepo use. No known issues. |

### 5.3 Category C: Shared-Feature Primitives (20)

| Package | Name | Version | Label | Notes |
|---------|------|---------|-------|-------|
| `packages/bic-next-move` | @hbc/bic-next-move | v0.1.0 | usable-but-incomplete | Ball-in-court and ownership tracking. Core contracts and hooks complete; real data integration via adapters pending. |
| `packages/complexity` | @hbc/complexity | v0.1.0 | usable-but-incomplete | Core 3-tier density context and UI components complete; feature packages that consume complexity dial must wire their own density-switching callbacks — this adapter wiring, not the primitive itself, is the incomplete piece. |
| `packages/sharepoint-docs` | @hbc/sharepoint-docs | v0.1.0 | usable-but-incomplete | Document lifecycle management. Microsoft Graph integration via data-access adapters; production validation pending. |
| `packages/acknowledgment` | @hbc/acknowledgment | v0.1.0 | usable-but-incomplete | Reusable acknowledgment/sign-off primitive. Contracts and components complete; workflow state machine pending completion. |
| `packages/step-wizard` | @hbc/step-wizard | v0.1.1 | usable-but-incomplete | Multi-step guided workflow primitive. Contracts, navigation, and state complete; adapter-specific step validation logic pending. |
| `packages/versioned-record` | @hbc/versioned-record | v0.0.1 | usable-but-incomplete | Immutable versioned record management with diff engine, history hooks, and UI components. Full API surface documented (VersionApi, useVersionHistory, HbcVersionHistory, HbcVersionBadge). SPFx-compatible components defined; PWA-only components (HbcVersionDiff) gated (D-08). Production adapters (post-bid-autopsy, score-benchmark, ai-assist integration) pending. |
| `packages/field-annotations` | @hbc/field-annotations | v0.1.0 | usable-but-incomplete | Inline field-level annotation and comment threads. Contracts and components complete; SharePoint persistence validation pending. |
| `packages/workflow-handoff` | @hbc/workflow-handoff | v0.1.0 | usable-but-incomplete | Cross-module workflow handoff and routing. Contracts and hand-off sequencing complete; multi-step coordination validation pending. |
| `packages/data-seeding` | @hbc/data-seeding | v0.0.1 | excluded-from-production-path | Development/demo data seeding primitives. Intentionally excluded from production flows; used in dev harness and test scaffolds only. |
| `packages/session-state` | @hbc/session-state | v0.0.1 | usable-but-incomplete | Offline-safe session persistence and sync via IndexedDB. Core hooks complete; offline queue replay and conflict resolution pending. |
| `packages/project-canvas` | @hbc/project-canvas | v0.0.1 | usable-but-incomplete | Tile registry, drag-drop, role defaults, and smart defaulting complete. Adaptive tile recommendation engine pending (Phase 1 scope). Governance tier (tile audit log, permission enforcement) is required before production promotion — not yet implemented. |
| `packages/post-bid-autopsy` | @hbc/post-bid-autopsy | v0.0.1 | scaffold-only | Tier-1 post-bid autopsy primitive for evidence, confidence, taxonomy, governance, publication, and learning-signal seams. Contracts scaffolded with deterministic factory helpers (SF22 T01-T07 complete per current-state-map). BD and Estimating adapter UI surfaces and full lifecycle/storage orchestration pending (SF22 T08-T09). Deferred from Phase 1 per D-010 resolution (2026-03-16). SF22 T08–T09 assigned to Phase 7 per OD-007 (2026-03-16). |
| `packages/strategic-intelligence` | @hbc/strategic-intelligence | v0.0.1 | scaffold-only | Heritage snapshot and living strategic intelligence primitive. Explicitly "contract-first primitive scaffold" per current-state-map. Trust, workflow, and governance contracts defined; runtime adapters and BD integration pending. Scaffold-only in Phase 1 per D-010 resolution (2026-03-16). SF22 T08–T09 (Phase 7) gated on this package reaching `usable-but-incomplete`; upgrade timeline tracked via OD-013/OD-016. |
| `packages/my-work-feed` | @hbc/my-work-feed | v0.0.1 | usable-but-incomplete | Cross-module personal work aggregation feed. SF29 T01-T09 complete per Wave 0 closeout; core hooks and composition complete. Real data integration from BIC, workflow-handoff, and cross-feature sources pending. |
| `packages/ai-assist` | @hbc/ai-assist | v0.0.1 | scaffold-only | Contextual AI action layer with Azure AI Foundry integration. Full contracts defined (IAiActionDefinition, AiModelRegistry, RelevanceScoringEngine, governance portal). Mandatory Pre-Implementation Research Directive indicates pre-phase work pending. Azure tenant integration, model endpoint resolution, and Smart Insert/Trust Meter implementation deferred. Deferred from Phase 1 per D-010 resolution (2026-03-16). Phase assignment pending OD-013. Never use in production until implementation research and Azure integration complete. |
| `packages/health-indicator` | @hbc/health-indicator | v0.0.1 | usable-but-incomplete | Health-indicator scoring, config, and telemetry runtime for readiness models. Contracts and scoring engine complete; real readiness model data sources pending integration. |
| `packages/notification-intelligence` | @hbc/notification-intelligence | v0.0.2 | usable-but-incomplete | Priority-tiered smart notification system. Core notification registry and dispatch complete; adaptive priority scoring and multi-channel delivery pending. |
| `packages/related-items` | @hbc/related-items | v0.0.1 | usable-but-incomplete | Cross-module record relationship panel. Contracts and panel UI complete; relationship discovery logic and cross-feature indexing pending. |
| `packages/score-benchmark` | @hbc/score-benchmark | v0.0.1 | usable-but-incomplete | Score benchmark primitive for confidence, similarity, and recommendation. Contracts complete; circular dependency with post-bid-autopsy resolved (ADR-0114). Depends on post-bid-autopsy for evidence access; post-bid-autopsy production adapter completion blocks this. Deferred from Phase 1 per D-010 resolution (2026-03-16). Depends on post-bid-autopsy (Phase 7); phase assignment pending OD-013. |
| `packages/smart-empty-state` | @hbc/smart-empty-state | v0.0.1 | usable-but-incomplete | Context-aware empty state classification and guided onboarding. Contracts and state taxonomy complete; onboarding routing logic pending. |

### 5.4 Category D: Feature Packages (11)

| Package | Name | Version | Label | Notes |
|---------|------|---------|-------|-------|
| `packages/features/accounting` | @hbc/features-accounting | v0.0.0 | scaffold-only | Accounting domain feature layer. v0.0.0 indicates no production implementation. Structure scaffolded; Wave 0 G4 accounting review surfaces built (Wave 0 closeout confirmed). Phase 1 full-domain completion pending. |
| `packages/features/estimating` | @hbc/features-estimating | v0.0.1 | usable-but-incomplete | Estimating domain feature layer. Wave 0 G4 requester guided setup, coordinator visibility, controller queue/review, and completion/handoff surfaces built. Extended domain coverage (templates, change management, cost control) pending Phase 1. |
| `packages/features/project-hub` | @hbc/features-project-hub | v0.0.1 | usable-but-incomplete | Project Hub domain feature layer. Health-pulse surface (SF21) finalized per Wave 0 closeout. Full project context, cross-domain visibility, and triage surfaces pending Phase 1. |
| `packages/features/business-development` | @hbc/features-business-development | v0.0.1 | usable-but-incomplete | Business Development domain feature layer. Post-bid autopsy and heritage intelligence surfaces scaffolded. Full wizard, summary, and list/dashboard UI surfaces pending adapter completion (SF22 T08-T09). |
| `packages/features/admin` | @hbc/features-admin | v0.2.1 | usable-but-incomplete | Admin domain feature layer (most mature feature package). Wave 0 provisioning oversight, failure inbox, recovery, and alert configuration complete (G6, SF17 T01-T07 verified per Wave 0 closeout). Teams webhook, email relay, and monitor/probe persistence deferred to Phase 1. |
| `packages/features/leadership` | @hbc/features-leadership | v0.0.0 | scaffold-only | Leadership domain feature layer. v0.0.0 indicates no production implementation. Placeholder only; Phase 2 scope. |
| `packages/features/safety` | @hbc/features-safety | v0.0.0 | scaffold-only | Safety domain feature layer. v0.0.0 indicates no production implementation. Placeholder only; Phase 3+ scope. |
| `packages/features/quality-control-warranty` | @hbc/features-quality-control-warranty | v0.0.0 | scaffold-only | Quality Control & Warranty domain feature layer. v0.0.0 indicates no production implementation. Placeholder only; Phase 4 scope. |
| `packages/features/risk-management` | @hbc/features-risk-management | v0.0.0 | scaffold-only | Risk Management domain feature layer. v0.0.0 indicates no production implementation. Placeholder only; Phase 5+ scope. |
| `packages/features/operational-excellence` | @hbc/features-operational-excellence | v0.0.0 | scaffold-only | Operational Excellence domain feature layer. v0.0.0 indicates no production implementation. Placeholder only; Phase 5+ scope. |
| `packages/features/human-resources` | @hbc/features-human-resources | v0.0.0 | scaffold-only | Human Resources domain feature layer. v0.0.0 indicates no production implementation. Placeholder only; Phase 6+ scope. |

### 5.5 Category E: Applications (14)

| App | Name | Version | Label | Notes |
|-----|------|---------|-------|-------|
| `apps/accounting` | @hbc/spfx-accounting | — | usable-but-incomplete | SPFx Accounting webpart. Wave 0 G4 accounting review surfaces built; full domain feature completion pending Phase 1. Depends on @hbc/features-accounting adapter completion. |
| `apps/estimating` | @hbc/spfx-estimating | — | usable-but-incomplete | SPFx Estimating webpart. Wave 0 G4 surfaces (requester setup, coordinator visibility, controller queue/review) built and verified. Full estimating domain surfaces pending Phase 1. Depends on @hbc/features-estimating. |
| `apps/project-hub` | @hbc/spfx-project-hub | — | usable-but-incomplete | SPFx Project Hub webpart. Health-pulse surface complete; cross-domain project context pending Phase 1. Depends on @hbc/features-project-hub. |
| `apps/business-development` | @hbc/spfx-business-development | — | usable-but-incomplete | SPFx Business Development webpart. Post-bid autopsy and heritage intelligence surfaces scaffolded. Full BD UI surfaces and adapter completion pending (SF22 T08-T09). Depends on @hbc/features-business-development. |
| `apps/admin` | @hbc/spfx-admin | — | usable-but-incomplete | SPFx Admin webpart. Wave 0 provisioning oversight, failure inbox, alert configuration verified per G6. Teams webhook, email relay, and monitor/probe persistence deferred to Phase 1. Depends on @hbc/features-admin. |
| `apps/leadership` | @hbc/spfx-leadership | — | scaffold-only | SPFx Leadership webpart. Minimal beyond webpart scaffold; Phase 2 scope. Depends on @hbc/features-leadership (v0.0.0). |
| `apps/safety` | @hbc/spfx-safety | — | scaffold-only | SPFx Safety webpart. Minimal beyond webpart scaffold; Phase 3+ scope. Depends on @hbc/features-safety (v0.0.0). |
| `apps/quality-control-warranty` | @hbc/spfx-quality-control-warranty | — | scaffold-only | SPFx Quality Control & Warranty webpart. Minimal beyond webpart scaffold; Phase 4 scope. Depends on @hbc/features-quality-control-warranty (v0.0.0). |
| `apps/risk-management` | @hbc/spfx-risk-management | — | scaffold-only | SPFx Risk Management webpart. Minimal beyond webpart scaffold; Phase 5+ scope. Depends on @hbc/features-risk-management (v0.0.0). |
| `apps/operational-excellence` | @hbc/spfx-operational-excellence | — | scaffold-only | SPFx Operational Excellence webpart. Minimal beyond webpart scaffold; Phase 5+ scope. Depends on @hbc/features-operational-excellence (v0.0.0). |
| `apps/human-resources` | @hbc/spfx-human-resources | — | scaffold-only | SPFx Human Resources webpart. Minimal beyond webpart scaffold; Phase 6+ scope. Depends on @hbc/features-human-resources (v0.0.0). |
| `apps/dev-harness` | @hbc/dev-harness | — | excluded-from-production-path | Development environment loading all 11 SPFx apps in mock mode. Intentionally excluded from production; used for unified development and test harness only. |
| `apps/pwa` | @hbc/pwa | — | usable-but-incomplete | Progressive Web App for field use. Wave 0 G5 surfaces (project setup, list/request detail, provisioning progress, offline queuing) built and verified. Offline/install hardening and full field-ready validation pending Phase 1. Depends on all Wave 0 platform and feature layers. |
| `apps/hb-site-control` | @hbc/hb-site-control | — | scaffold-only | React Native Web mobile site control app. Structure scaffolded; Phase 6 delivery scope. No production implementation. |

### 5.6 Category F: Backend (1)

| Component | Name | Version | Label | Notes |
|-----------|------|---------|-------|-------|
| `backend/functions` | @hbc/functions | — | usable-but-incomplete | Azure Functions serverless backend. 7-step saga architecture mature with G2.3 audit fix validated per Wave 0 closeout. Production SharePoint and Azure Functions endpoint validation pending; currently gates production readiness. Provides auth, provisioning, data, and async triggers. |

### 5.7 Category G: Build Tooling (1)

| Component | Name | Version | Label | Notes |
|-----------|------|---------|-------|-------|
| `tools/` | @hbc/tools | — | production-ready | Monorepo build and governance scripts (tsx-based). Complete and in active use across all workspaces. No known issues. |

---

## Blockers and Critical Gaps

> **Note:** No workspace members are currently labeled `blocked` (reserved for items with an unresolved external dependency). The items below are labeled `usable-but-incomplete` or `scaffold-only` but function as practical blockers for Phase 1 production flows because downstream packages depend on their completion. Resolving these gaps is a Phase 1 entry prerequisite.

The following items whose scaffold/blocked status most directly affects Phase 1 planning:

| Item | Category | Current Status | Phase 1 Impact | Blocking Condition |
|------|----------|---|---|---|
| `@hbc/data-access` | Core Platform (A) | v0.0.1 usable-but-incomplete | Phase 1 depends on real SharePoint/Graph adapter completion and production validation | Adapter stubs remain; no real SharePoint integration |
| `@hbc/versioned-record` | Shared-Feature Primitive (C) | v0.0.1 usable-but-incomplete | Blocks `post-bid-autopsy`, `score-benchmark`, `ai-assist` real usage | Production adapters for post-bid evidence snapshots and score records pending; PWA-only diff viewer (D-08 constraint) limits SPFx surfaces |
| `@hbc/strategic-intelligence` | Shared-Feature Primitive (C) | v0.0.1 scaffold-only | Blocks `post-bid-autopsy` intelligence surface production use | Contracts defined; runtime adapters and BD heritage panel integration not implemented |
| `@hbc/post-bid-autopsy` | Shared-Feature Primitive (C) | v0.0.1 scaffold-only | Blocks BD and Estimating adapter completion; blocks score-benchmark real usage | SF22 T08–T09 assigned to Phase 7 (OD-007); BD adapter wizard/summary/list/dashboard UI surfaces and Estimating surfaces not implemented; lifecycle/storage orchestration incomplete |
| `@hbc/ai-assist` | Shared-Feature Primitive (C) | v0.0.1 scaffold-only | Blocks production AI-assisted workflows | Deferred from Phase 1 per D-010; activation timeline pending OD-013. Mandatory Pre-Implementation Research Directive not yet complete; Azure AI Foundry endpoint integration and Smart Insert/Trust Meter UI not implemented |
| `@hbc/provisioning` | Core Platform (A) | v0.2.0 usable-but-incomplete | Gates current production readiness assessment | Production SharePoint list schema and Azure Functions endpoint validation pending; currently prevents production signoff |
| 7× v0.0.0 Feature Packages | Feature (D) | scaffold-only | Blocks production use of 7 business domains (Accounting, Leadership, Safety, QC/Warranty, Risk, Ops Excellence, HR) | Intentional deferral to Phase 1+; placeholder structures only |
| 11× SPFx Apps (v0.0.0 features) | Applications (E) | scaffold-only | 7 SPFx apps depend on v0.0.0 feature packages | Feature package completion required; inherits blocked status |

---

## Summary Counts

| Label | Count |
|-------|-------|
| production-ready | 2 |
| pilot-ready | 2 |
| usable-but-incomplete | 34 |
| scaffold-only | 17 |
| excluded-from-production-path | 2 |
| blocked | 0 |
| **Total** | **57** |

---

## Research Notes

**Count note:** The task brief mentioned 50 workspace members; `current-state-map.md` §6 lists 56; this matrix classifies 57. The matrix count (57) is the authoritative classification total for readiness purposes:
- Category A (Core Platform): 8
- Category B (Shared Infrastructure): 2
- Category C (Shared-Feature Primitives): 20
- Category D (Feature Packages): 11
- Category E (Applications): 14
- Category F (Backend): 1
- Category G (Build Tooling): 1
- **Total: 57**

**Key adjustments from pre-assessment:**
- `@hbc/versioned-record` v0.0.1: Pre-assessment listed as `scaffold-only`. Research revealed detailed README with full API surface (VersionApi, hooks, components), storage model (inline vs. file-library routing), SPFx constraints, and testing exports. Upgraded to `usable-but-incomplete` — core implementation exists, production adapters pending.
- `@hbc/project-canvas` v0.0.1: Pre-assessment listed as `scaffold-only`. Research revealed full tile registry, drag-drop architecture, role defaults, smart defaulting from health-pulse metrics, and mandatory governance tier. Upgraded to `usable-but-incomplete` — real implementation present, adaptive recommendation engine pending.
- `@hbc/ai-assist` v0.0.1: Pre-assessment listed as `scaffold-only`. Research confirmed full contract definitions (IAiActionDefinition, AiModelRegistry, RelevanceScoringEngine, governance portal) but explicit "Mandatory Pre-Implementation Research Directive" and no Azure tenant integration. Kept as `scaffold-only` — contracts defined, implementation deferred pending research.
- `@hbc/post-bid-autopsy` v0.0.1: Research confirmed "scaffolded with deterministic factory helpers" and SF22 T08-T09 phases pending. Kept as `scaffold-only` — contracts and factory helpers exist, full adapter UI and lifecycle/storage orchestration incomplete per current-state-map.

---

## Formal Approval

| Role | Name | Date | Status |
|---|---|---|---|
| Delivery/Program Lead | — | 2026-03-16 | Adopted |
| Architecture Lead | — | 2026-03-16 | Adopted |

6 maturity labels formally adopted into official program vocabulary. All 57 workspace members classified per GOV-02.

---

## Governing Sources

- `docs/architecture/blueprint/current-state-map.md` (Authoritative inventory, v1.0, 2026-03-16, sections 3 and 6)
- `docs/architecture/blueprint/package-relationship-map.md`
- `docs/architecture/adr/ADR-0095-stub-detection-enforcement.md`
- `docs/architecture/adr/ADR-0116-ui-governance.md`
- `docs/architecture/plans/MASTER/01_Phase-0_Program-Control-and-Repo-Truth-Plan.md` (Wave 0 closeout baseline, section 7.1–7.3)
