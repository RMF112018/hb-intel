# HB Intel — Current-State Architecture Map

**Version:** 1.0
**Status:** Canonical Current-State
**Last Updated:** 2026-03-20
**Purpose:** Single authoritative reference for the present implementation state of the HB Intel monorepo. When this document differs from historical plans or locked blueprints regarding _what exists today_, this document governs present truth.

---

## 1. Source-of-Truth Hierarchy

| Tier | Document | Classification | Update Policy | Governs |
|------|----------|---------------|---------------|---------|
| 1 | This file (`current-state-map.md`) | Canonical Current-State | Living — updated with each structural change | Present implementation truth |
| 2 | [Blueprint V4](./blueprint/HB-Intel-Blueprint-V4.md) | Canonical Normative Plan | Locked — comment-only updates | Target architecture intent |
| 3 | [Foundation Plan](./plans/hb-intel-foundation-plan.md) | Historical Foundational | Locked — comment-only updates | Original implementation instructions |
| 4 | [ADRs](./adr/) (114 active; 6 archived — see §2.2 for resolution record) | Permanent Decision Rationale | Append-only | Individual architectural decisions |
| 5 | Phase/Task Plans (`plans/ph7-*`, `plans/PH*.md`) | Time-bound Execution | Historical after completion | Phase-scoped implementation details |
| 6 | Package READMEs (`packages/*/README.md`) | Current Implementation Detail | Living | Package-specific API and usage |

**Conflict Resolution Rule:** When documents at different tiers disagree about what the repo _currently_ contains, Tier 1 governs. Each divergence must be annotated as one of:

- **(a) Controlled evolution** — the repo has intentionally grown beyond the original description.
- **(b) Not-yet-implemented normative plan** — the Blueprint/Plan describes a future target not yet built.
- **(c) Superseded approach** — an earlier design has been replaced by a better one.

---

## 2. Document Classification Matrix

> **Classification Authority:** This matrix is the single source of truth for doc classification in the HB Intel monorepo. `docs/README.md` links here for navigational guidance. See §2.1 for the maintenance rule and §2.2 for ADR catalog conflict details. Six classes plus one Diátaxis notation are the only permitted vocabulary.

| Document / Group | Classification | Tier / Catalog Status |
|------------------|---------------|----------------------|
| `docs/architecture/blueprint/current-state-map.md` | **Canonical Current-State** | Infrastructure/exempt — no Tier 1 banner (circular dependency) |
| `docs/README.md` | **Canonical Current-State** | Infrastructure/exempt — no Tier 1 banner |
| `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` | **Canonical Normative Plan** | Tier 1 banner applied |
| `docs/architecture/plans/hb-intel-foundation-plan.md` | **Historical Foundational** | Tier 1 banner applied |
| `docs/architecture/adr/` (all files) | **Permanent Decision Rationale** | Exempt from inline banner; 114 active records indexed; 6 archived in `adr/archived/`; conflicts resolved PH7.11 |
| SF01–SF03 plans (completed shared-feature work: bic-next-move, complexity, sharepoint-docs) | **Historical Foundational** | Tier 2 — matrix classification only |
| SF04 shared-feature plans (10 files: `SF04-Acknowledgment.md` through `SF04-T09-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; completed 2026-03-09 |
| `docs/architecture/adr/ADR-0092-acknowledgment-platform-primitive.md` | **Permanent Decision Rationale** | SF04 acknowledgment platform primitive; 10 locked decisions |
| SF05 shared-feature plans (10 files: `SF05-Step-Wizard.md` through `SF05-T09-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; completed 2026-03-09 |
| SF06 shared-feature plans (10 files: `SF06-Versioned-Record.md` through `SF06-T09-Deployment.md`) | **Canonical Normative Plan** | Tier 2 — matrix classification only; `packages/versioned-record` scaffold created (v0.0.1); ADR-0094; PH7 gate satisfied (ADR-0091); expansion permitted |
| `docs/architecture/adr/ADR-0093-step-wizard-platform-primitive.md` | **Permanent Decision Rationale** | SF05 step-wizard platform primitive; 10 locked decisions |
| `docs/how-to/developer/step-wizard-adoption-guide.md` | **Living Reference (Diátaxis)** | How-to quadrant; developer audience; step-wizard module adoption |
| `docs/architecture/adr/ADR-0094-versioned-record-platform-primitive.md` | **Permanent Decision Rationale** | SF06 versioned-record platform primitive; 10 locked decisions |
| SF07 shared-feature plans (10 files: `SF07-Field-Annotations.md` through `SF07-T09-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-10; package `@hbc/field-annotations` implemented |
| `docs/architecture/adr/ADR-0096-field-annotations-platform-primitive.md` | **Permanent Decision Rationale** | SF07 field-annotations platform primitive; 10 locked decisions |
| `docs/how-to/developer/field-annotations-adoption.md` | **Living Reference (Diátaxis)** | How-to quadrant; developer audience; field-annotations module adoption |
| `docs/reference/field-annotations/api.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; field-annotations API reference |
| SF08 shared-feature plans (10 files: `SF08-Workflow-Handoff.md` through `SF08-T09-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-10; package `@hbc/workflow-handoff` implemented |
| `docs/architecture/adr/ADR-0097-workflow-handoff-platform-primitive.md` | **Permanent Decision Rationale** | SF08 workflow-handoff platform primitive; 10 locked decisions |
| `docs/how-to/developer/workflow-handoff-adoption-guide.md` | **Living Reference (Diátaxis)** | How-to quadrant; developer audience; workflow-handoff module adoption |
| `docs/reference/workflow-handoff/api.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; workflow-handoff API reference |
| SF09 shared-feature plans (10 files: `SF09-Data-Seeding.md` through `SF09-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-10; package `@hbc/data-seeding` implemented |
| `docs/architecture/adr/ADR-0098-data-seeding-import-primitive.md` | **Permanent Decision Rationale** | SF09 data-seeding platform primitive; 10 locked decisions (D-01–D-10) |
| `docs/how-to/developer/data-seeding-adoption-guide.md` | **Living Reference (Diátaxis)** | How-to quadrant; developer audience; data-seeding module adoption |
| `docs/reference/data-seeding/api.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; data-seeding API reference |
| SF10 shared-feature plans (10 files: `SF10-Notification-Intelligence.md` through `SF10-T09-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-10; package `@hbc/notification-intelligence` implemented |
| `docs/architecture/adr/0099-notification-intelligence-tiered-model.md` | **Permanent Decision Rationale** | SF10 notification intelligence tiered model; 10 locked decisions (D-01–D-10) |
| `docs/how-to/developer/notification-intelligence-adoption-guide.md` | **Living Reference (Diátaxis)** | How-to quadrant; developer audience; notification-intelligence module adoption |
| `docs/reference/notification-intelligence/api.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; notification-intelligence API reference |
| SF11 shared-feature plans (10 files: `SF11-Smart-Empty-State.md` through `SF11-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-11; package `@hbc/smart-empty-state` implemented |
| `docs/architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md` | **Permanent Decision Rationale** | SF11 smart-empty-state platform primitive; 10 locked decisions (D-01–D-10) |
| `docs/how-to/developer/smart-empty-state-adoption-guide.md` | **Living Reference (Diátaxis)** | How-to quadrant; developer audience; smart-empty-state module adoption |
| `docs/reference/smart-empty-state/api.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; smart-empty-state API reference |
| SF12 shared-feature plans (10 files: `SF12-Session-State.md` through `SF12-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-11; package `@hbc/session-state` implemented |
| `docs/architecture/adr/ADR-0101-session-state-offline-persistence.md` | **Permanent Decision Rationale** | SF12 session-state offline persistence primitive; 10 locked decisions (D-01–D-10) |
| `docs/how-to/developer/session-state-adoption-guide.md` | **Living Reference (Diátaxis)** | How-to quadrant; developer audience; session-state module adoption |
| `docs/reference/session-state/api.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; session-state API reference |
| SF13 shared-feature plans (10 files: `SF13-Project-Canvas.md` through `SF13-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-11; package `@hbc/project-canvas` implemented |
| `docs/architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md` | **Permanent Decision Rationale** | SF13 project-canvas role-based dashboard primitive; 10 locked decisions (D-01–D-10) |
| `docs/how-to/developer/project-canvas-adoption-guide.md` | **Living Reference (Diataxis)** | How-to quadrant; developer audience; project-canvas module adoption |
| `docs/reference/project-canvas/api.md` | **Living Reference (Diataxis)** | Reference quadrant; developer audience; project-canvas API reference |
| SF14 shared-feature plans (10 files: `SF14-Related-Items.md` through `SF14-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-11; package `@hbc/related-items` implemented |
| `docs/architecture/adr/0103-related-items-unified-work-graph.md` | **Permanent Decision Rationale** | SF14 related-items unified work graph primitive; 10 locked decisions (D-01–D-10) |
| `docs/how-to/developer/related-items-adoption-guide.md` | **Living Reference (Diátaxis)** | How-to quadrant; developer audience; related-items module adoption |
| `docs/reference/related-items/api.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; related-items API reference |
| SF15 shared-feature plans (10 files: `SF15-AI-Assist.md` through `SF15-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-11; package `@hbc/ai-assist` implemented |
| `docs/architecture/adr/ADR-0104-ai-assist-azure-foundry-integration.md` | **Permanent Decision Rationale** | SF15 ai-assist Azure Foundry integration primitive; 10 locked decisions (D-01–D-10) |
| `docs/how-to/developer/ai-assist-adoption-guide.md` | **Living Reference (Diataxis)** | How-to quadrant; developer audience; ai-assist module adoption |
| `docs/reference/ai-assist/api.md` | **Living Reference (Diataxis)** | Reference quadrant; developer audience; ai-assist API reference |
| SF16 shared-feature plans (10 files: `SF16-Search.md` through `SF16-T09-Testing-and-Deployment.md`) | **Canonical Normative Plan** | Tier 2 — matrix classification only; `@hbc/search` planning family authored 2026-03-11; ADR-0105 reserved; PH7 gate satisfied (ADR-0091); assigned to Phase 5 per OD-007 (2026-03-16) |
| `docs/architecture/adr/ADR-0105-search-azure-cognitive-search.md` | **Permanent Decision Rationale** | SF16 search Azure Cognitive Search primitive; 10 locked decisions (D-01–D-10); to be authored when SF16 enters active development |
| SF17 shared-feature plans (10 files: `SF17-Admin-Intelligence.md` through `SF17-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-12; package `@hbc/features-admin` admin-intelligence implemented |
| `docs/architecture/adr/ADR-0106-admin-intelligence-layer.md` | **Permanent Decision Rationale** | SF17 admin-intelligence layer primitive; 10 locked decisions (D-01–D-10); authored 2026-03-12 |
| `docs/how-to/developer/admin-intelligence-adoption-guide.md` | **Living Reference (Diátaxis)** | How-to quadrant; developer audience; admin-intelligence module adoption |
| `docs/reference/admin-intelligence/api.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; admin-intelligence API reference |
| SF18 shared-feature plans (10 files: `SF18-Estimating-Bid-Readiness.md` through `SF18-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-12; package `@hbc/features-estimating` implemented as adapter over `@hbc/health-indicator` |
| `docs/architecture/adr/ADR-0107-estimating-bid-readiness-signal.md` | **Permanent Decision Rationale** | SF18 estimating bid-readiness adapter-over-primitive lock; 10 locked decisions (D-01–D-10); authored 2026-03-12 |
| `docs/architecture/adr/ADR-0111-health-indicator-readiness-primitive-runtime.md` | **Permanent Decision Rationale** | Companion primitive ADR for `@hbc/health-indicator` runtime ownership and boundary rules; authored 2026-03-12 |
| `docs/how-to/developer/estimating-bid-readiness-adoption-guide.md` | **Living Reference (Diátaxis)** | How-to quadrant; developer audience; SF18 adapter adoption and validation guidance |
| `docs/reference/estimating/api.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; SF18 API/contract surface and testing exports |
| SF19 shared-feature plans (10 files: `SF19-BD-Score-Benchmark.md` through `SF19-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-12; `@hbc/features-business-development` implemented as adapter over `@hbc/score-benchmark` with T09 closure evidence recorded |
| `docs/architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md` | **Permanent Decision Rationale** | SF19 BD score benchmark adapter-over-primitive governance lock; authored 2026-03-12 |
| `docs/architecture/adr/ADR-0112-score-benchmark-primitive-runtime.md` | **Permanent Decision Rationale** | Companion primitive ADR for `@hbc/score-benchmark` runtime ownership and closure governance; authored 2026-03-12 |
| `docs/how-to/developer/bd-score-benchmark-adoption-guide.md` | **Living Reference (Diátaxis)** | How-to quadrant; developer audience; SF19 adapter adoption and validation guidance |
| `docs/reference/bd-score-benchmark/api.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; SF19 primitive + adapter API/reference surface |
| SF20 shared-feature plans (10 files: `SF20-BD-Heritage-Panel.md` through `SF20-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-12; `@hbc/features-business-development` finalized as adapter over `@hbc/strategic-intelligence` with closure evidence for trust/workflow/replay/integration/telemetry governance |
| `docs/architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md` | **Permanent Decision Rationale** | SF20 BD heritage and living strategic intelligence adapter-over-primitive governance lock; authored 2026-03-12 |
| `docs/architecture/adr/ADR-0113-strategic-intelligence-primitive-runtime.md` | **Permanent Decision Rationale** | Companion primitive ADR for `@hbc/strategic-intelligence` runtime ownership and closure governance; authored 2026-03-12 |
| SF21 shared-feature plans (10 files: `SF21-Project-Health-Pulse.md` through `SF21-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-12; `@hbc/features-project-hub` health-pulse surface finalized with closure evidence for confidence/compound/explainability/governance/triage/suppression/telemetry |
| `docs/architecture/adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md` | **Permanent Decision Rationale** | SF21 project health pulse multi-dimension indicator governance lock; authored 2026-03-12 |
| SF22 shared-feature plans (10 files: `SF22-Post-Bid-Learning-Loop.md` through `SF22-T09-Testing-and-Deployment.md`) | **Canonical Normative Plan** | Tier 2 — matrix classification only; `@hbc/post-bid-autopsy` planning family authored 2026-03-12; T01-T07 now cover primitive scaffold/contracts/lifecycle/hooks plus boundary-safe primitive reference integrations, BD adapter wizard/summary/list/dashboard UI surfaces, and Estimating wizard/summary/list UI surfaces while preserving published learning-signal compatibility |
| `docs/architecture/adr/ADR-0114-resolve-score-benchmark-post-bid-autopsy-circular-dependency.md` | **Permanent Decision Rationale** | Resolves critical circular dependency between `@hbc/score-benchmark` and `@hbc/post-bid-autopsy`; confirms false-cycle root cause (unused `package.json` declaration in post-bid-autopsy); removes unused dep; retains legitimate type-only edge score-benchmark → post-bid-autopsy; unblocks Wave 1 intelligence/scoring feature work; authored 2026-03-14 |
| SF29 shared-feature plans (10 files: `SF29-My-Work-Feed.md` through `SF29-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; T01–T09 complete 2026-03-15; package `@hbc/my-work-feed` implemented |
| SF24 shared-feature plans (10 files: `SF24-Export-Runtime.md` through `SF24-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Phase 3 Stage 5.2; T01–T09 complete 2026-03-23; package `@hbc/export-runtime` v0.1.0 feature-complete |
| `docs/architecture/adr/ADR-0119-export-runtime.md` | **Permanent Decision Rationale** | SF24 export runtime shared primitive architecture; 6 locked decisions (L-01–L-06) |
| `docs/how-to/developer/export-runtime-adoption-guide.md` | **Living Reference (Diataxis)** | How-to quadrant; developer audience; export-runtime module adoption |
| `docs/reference/export-runtime/api.md` | **Living Reference (Diataxis)** | Reference quadrant; developer audience; export-runtime API reference |
| SF23 shared-feature plans (10 files: `SF23-Record-Form.md` through `SF23-T09-Testing-and-Deployment.md`) | **Historical Foundational** | Phase 3 Stage 5.3; T01–T09 complete 2026-03-23; package `@hbc/record-form` v0.1.0 feature-complete |
| `docs/architecture/adr/ADR-0120-record-form.md` | **Permanent Decision Rationale** | SF23 record form shared primitive architecture; 6 locked decisions (L-01–L-06) |
| `docs/how-to/developer/record-form-adoption-guide.md` | **Living Reference (Diataxis)** | How-to quadrant; developer audience; record-form module adoption |
| `docs/reference/record-form/api.md` | **Living Reference (Diataxis)** | Reference quadrant; developer audience; record-form API reference |
| `docs/architecture/adr/ADR-0115-my-work-feed-architecture.md` | **Permanent Decision Rationale** | SF29 my-work-feed multi-source aggregation architecture; 10 locked decisions (D-01–D-10) |
| `docs/how-to/developer/my-work-feed-adoption-guide.md` | **Living Reference (Diátaxis)** | How-to quadrant; developer audience; my-work-feed module adoption |
| `docs/reference/my-work-feed/api.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; my-work-feed API reference |
| PH4 phase plans (`plans/PH4-*.md`) | **Historical Foundational** | Tier 1 banner applied to `PH4-Shell-Consolidation.md` (master plan) |
| PH5 phase plans (`plans/PH5-*.md`, `plans/PH5C-*.md`) | **Historical Foundational** | Tier 1 banner applied to `PH5-Auth-Shell-Plan.md` and `PH5C-Auth-Shell-Plan.md` |
| PH6 phase plans (`plans/PH6-*.md`, `plans/PH6F-*.md`) | **Historical Foundational** | Tier 1 banner applied to `PH6-Provisioning-Plan.md`; sub-plans Tier 2 |
| PH7 domain plans (`ph7-business-development/`, `ph7-estimating/`, `ph7-project-hub/`) | **Canonical Normative Plan** | Tier 2 — matrix classification only |
| PH7 remediation plans (`plans/ph7-remediation/PH7.1`–`PH7.12`) | **Canonical Normative Plan** | Tier 1 banner applied to `PH7.12-Final-Verification-and-Sign-Off.md`; sub-plans Tier 2 |
| `plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md` | **Canonical Normative Plan** | Tier 1 banner applied; master plan / task index for stub enforcement; ADR-0095; independent of PH7.12 sign-off gate |
| `plans/ph7-remediation/PH7.13-T01-ESLint-Base-Config.md` | **Canonical Normative Plan** | Tier 2 — matrix classification only; sub-plan of PH7.13; D-01 (no-warning-comments), D-02 (ban-ts-comment) |
| `plans/ph7-remediation/PH7.13-T02-No-Stub-Implementations-Rule.md` | **Canonical Normative Plan** | Tier 2 — matrix classification only; sub-plan of PH7.13; D-03 (error level), D-04 (stub-approved escape hatch) |
| `plans/ph7-remediation/PH7.13-T03-CI-Grep-Scan.md` | **Canonical Normative Plan** | Tier 2 — matrix classification only; sub-plan of PH7.13; D-05 (CI grep as Layer 2 enforcement) |
| `plans/ph7-remediation/PH7.13-T04-Stub-Inventory-Remediation.md` | **Canonical Normative Plan** | Tier 2 — matrix classification only; sub-plan of PH7.13; D-06 (tools/mocks exempt), D-07 (BIC aggregation deferred), D-08 (full closure) |
| `plans/ph7-remediation/PH7.13-T05-Scan-Stubs-Tool.md` | **Canonical Normative Plan** | Tier 2 — matrix classification only; sub-plan of PH7.13; tools/scan-stubs.ts + pnpm scan-stubs scripts |
| `plans/ph7-remediation/PH7.13-T09-Deployment.md` | **Canonical Normative Plan** | Tier 2 — matrix classification only; sub-plan of PH7.13; ADR-0095 write, eslint-plugin-hbc README update, ADR index update |
| `docs/architecture/adr/0095-stub-detection-enforcement-standard.md` | **Permanent Decision Rationale** | PH7.13 stub enforcement standard; 8 locked decisions (D-01–D-08); authored 2026-03-10 |
| PH7-RM-* plans (`plans/PH7-RM-*.md`, 9 files) | **Deferred Scope** | Tier 1 banner applied to all 9 files; PH7 signed off 2026-03-09; PH7-RM-* remain Deferred Scope per evidence package §5; must reclassify before activation |
| PH7 root-level plans (deleted from git index) | **Superseded / Archived Reference** | Tier 2 — matrix classification only |
| `ph7-breakout-webparts/` plans | **Canonical Normative Plan** | Tier 2 — matrix classification only |
| `docs/architecture/release/*` (release checklists, sign-off docs) | **Historical Foundational** | Tier 2 — matrix classification only; sealed docs |
| `plans/PH2-Shared-Packages-Plan.md` | **Historical Foundational** | Tier 2 — matrix classification only; Phase 2 shared packages plan; complete |
| `plans/PH3-Query-State-Mngmt-Plan.md` | **Historical Foundational** | Tier 2 — matrix classification only; Phase 3 query/state management plan; complete |
| `plans/PH7-Breakout-Webparts-Plan.md` | **Canonical Normative Plan** | Tier 1 banner applied 2026-03-14; master infrastructure summary for `ph7-breakout-webparts/` task files; PH7 gate satisfied (ADR-0091); pending Wave 1 activation |
| `plans/PH7-BD-Features.md` | **Canonical Normative Plan** | Tier 1 banner applied 2026-03-14; master summary and locked-decisions index for `ph7-business-development/` task files; PH7 gate satisfied (ADR-0091); pending Wave 1 activation |
| `plans/PH7-Estimating-Features.md` | **Canonical Normative Plan** | Tier 1 banner applied 2026-03-14; v2.0 master summary for `ph7-estimating/` task files; supersedes `PH7-Estimating-Feature-Plan.md` v1.0; PH7 gate satisfied (ADR-0091); pending Wave 1 activation |
| `plans/PH7-Estimating-Feature-Plan.md` | **Superseded / Archived Reference** | Tier 1 banner applied 2026-03-14; v1.0 monolithic plan superseded by `PH7-Estimating-Features.md` v2.0; retained as archive only |
| `plans/PH7-ProjectHub-Features-Plan.md` | **Canonical Normative Plan** | Tier 1 banner applied 2026-03-14; master summary and locked-decisions index for `ph7-project-hub/` task files; PH7 gate satisfied (ADR-0091); pending Wave 1 activation |
| `plans/PH7-Admin-Feature-Plan.md` | **Canonical Normative Plan** | Tier 1 banner applied 2026-03-14; complete feature plan for Admin module; PH7 gate satisfied (ADR-0091); pending Wave 1 activation |
| `plans/PH7-ReviewMode-Plan.md` | **Deferred Scope** | Tier 1 banner applied 2026-03-14; master summary for Review Mode feature; associated `PH7-RM-*` task files are Deferred Scope; must reclassify before activation |
| `plans/PH9b-UX-Enhancement-Plan.md` | **Deferred Scope** | Tier 1 banner applied 2026-03-14; post-Phase-7 UX polish plan (coaching, advanced instrumentation, draft persistence); core `@hbc/my-work-feed` (SF29, complete 2026-03-15) reclassified to Wave 1 scope; remaining PH9b items PH7 gate satisfied (ADR-0091); pending Wave 1 activation |
| `docs/architecture/ngx-tracker.md` | **Historical Foundational** | Tier 1 banner applied 2026-03-14; NGX modernization completion tracker; all 8 areas complete as of Phase 4.15 (2026-03-04) |
| `plans/HB-Intel-Feature-Phase-Mapping-Recommendation.md` | **Superseded / Archived Reference** | Tier 1 banner applied 2026-03-14; pre-Phase-6 feature mapping recommendation; Phase 6 complete; superseded by active PH7 plans and MVP plans; historical notes preserved in `HB-Intel-Blueprint-Crosswalk.md §9.1` |
| `plans/MVP/MVP-Plan-Review-2026-03-13.md` | **Canonical Current-State** | Tier 1 banner present; evidence-based architectural review of MVP Project Setup plan set; identifies corrections needed before implementation (2026-03-13) |
| `plans/MVP/MVP-Project-Setup-Plan.md` and `MVP-Project-Setup-T01` through `T09` (10 files) | **Canonical Normative Plan** | Tier 2 — matrix classification only; MVP Project Setup master plan + task files; pending refinement per MVP-Plan-Review; ADR-0091 required before implementation |
| `plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` | **Canonical Normative Plan** | Tier 2 — matrix classification only; Wave 0 umbrella delivery plan; v1.1 corrected 2026-03-14 (auth model, ADR number, CLAUDE.md version, missing-feature reclassifications, admin router bug documentation); validated against repo state |
| `plans/MVP/wave-0-validation-report.md` | **Canonical Current-State** | Tier 2 — matrix classification only; claim-by-claim validation report for Wave 0 umbrella plan; 8 claims validated 2026-03-14; records all corrections applied and evidence basis |
| `plans/MVP/G1/W0-G1-Contracts-and-Configuration-Plan.md` | **Canonical Normative Plan** | Tier 2 — matrix classification only; Group 1 master plan v1.1; defines locked decision sequencing, package boundary doctrine, 3-phase task dependency model, and G2 entry condition; created 2026-03-14; v1.1 corrected same day (correction record in §9) |
| `plans/MVP/G1/W0-G1-T01-Site-Template-Specification.md` (and T02 through T05, 5 task files) | **Canonical Normative Plan** | Tier 2 — matrix classification only; Group 1 task plans T01–T05 all at v1.1; corrected 2026-03-14: T01 department type locked to `commercial` and `luxury-residential`; department library model reconciled with T06 pruning approach; `DEPT_BACKGROUND_ACCESS_MIXED_USE` removed from T04; T03 clarification event confirmed as real state machine lifecycle event; T05 long-term steady-state target section added; ADR-0091 required before implementation |
| `docs/architecture/blueprint/HB-Intel-Blueprint-Crosswalk.md` | **Canonical Current-State** | Tier 1 banner applied; consolidation crosswalk and program navigation guide; now points to `HB-Intel-Unified-Blueprint.md` as master summary; created 2026-03-14 |
| `docs/architecture/blueprint/HB-Intel-Blueprint-Consolidation-Report.md` | **Historical Foundational** | Tier 2 — matrix classification only; consolidation process audit trail from 2026-03-14 pass |
| `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md` | **Canonical Normative Plan** | Inline banner applied (program narrative layer — does not govern present-state truth); incorporates all 20 interview-locked doctrine decisions; v1.1 refined 2026-03-14 with governance-safe status language, non-goals section (§17), structured telemetry (§16), support/observability doctrine (§9), external-collaboration guardrail (§14.2), and sharpened implementation-trust doctrine (§7.2) |
| `docs/architecture/blueprint/HB-Intel-Unified-Blueprint-Authoring-Report.md` | **Historical Foundational** | Tier 2 — matrix classification only; audit trail for unified blueprint v1.0 creation; created 2026-03-14 |
| `docs/architecture/blueprint/HB-Intel-Unified-Blueprint-Refinement-Report.md` | **Historical Foundational** | Tier 2 — matrix classification only; audit trail for unified blueprint v1.1 refinement pass; created 2026-03-14 |
| `docs/architecture/blueprint/HB-Intel-Dev-Roadmap.md` | **Canonical Normative Plan** | Inline banner applied; consolidated execution delivery roadmap; defines wave structure (Foundation/Wave 0–3/Convergence), dual-stream SPFx/PWA sequencing doctrine, readiness gates, and SPFx sunset strategy; created 2026-03-14 |
| `docs/reference/provisioning/site-template.md` | **Living Reference (Diátaxis)** | Reference quadrant; provisioning audience; Wave 0 site template specification; produced by W0-G1-T01; covers core libraries, template file manifest, add-on packs, department pruning model, template versioning scheme |
| `docs/reference/provisioning/entra-id-group-model.md` | **Living Reference (Diátaxis)** | Reference quadrant; provisioning audience; Entra ID three-group permission model; produced by W0-G1-T02; covers naming convention, initial membership, lifecycle events, Graph API scope, department background access |
| `docs/reference/provisioning/notification-event-matrix.md` | **Living Reference (Diátaxis)** | Reference quadrant; provisioning audience; 8-event notification contract, recipient resolution, pipeline integration pattern; produced by W0-G1-T03 |
| `docs/reference/configuration/wave-0-config-registry.md` | **Living Reference (Diátaxis)** | Reference quadrant; configuration audience; two-bucket governance model, full env var registry, environment separation matrix; produced by W0-G1-T04 |
| `docs/reference/configuration/sites-selected-validation.md` | **Living Reference (Diátaxis)** | Reference quadrant; configuration/security audience; Sites.Selected permission model, fallback path governance, staging validation test cases, IT/Security engagement template, G2 entry condition matrix; produced by W0-G1-T05 |
| `docs/reference/data-model/pid-contract.md` | **Living Reference (Diátaxis)** | Reference quadrant; data model audience; PID relational column specification, alignment with `projectNumber`, indexing requirement, default value mechanism; produced by W0-G2-T01 |
| `docs/reference/data-model/workflow-family-map.md` | **Living Reference (Diátaxis)** | Reference quadrant; data model audience; five-family ownership matrix, confirmed parent/child pairs (6 structures), cross-family reference pattern rules; produced by W0-G2-T01 |
| `docs/reference/data-model/workflow-list-schemas.md` | **Living Reference (Diátaxis)** | Reference quadrant; data model audience; consolidated G2 list schema reference (scaffold); mandatory fields, naming conventions, choice patterns, seeded-file classification; produced by W0-G2-T01; populated incrementally by T02–T06 |
| `backend/functions/src/config/startup-list-definitions.ts` | **Canonical Current-State** | Startup-family (T02) list definitions; 5 lists with T01-compliant pid/indexing/parent-child; produced by W0-G2-T02 |
| `backend/functions/src/config/closeout-list-definitions.ts` | **Canonical Current-State** | Closeout-family (T03) list definitions; 5 lists with T01-compliant pid/indexing/parent-child; produced by W0-G2-T03 |
| `backend/functions/src/config/safety-list-definitions.ts` | **Canonical Current-State** | Safety-family (T04) list definitions; 8 lists (1 parent, 2 children, 5 flat) with T01-compliant pid/indexing/parent-child; produced by W0-G2-T04 |
| `backend/functions/src/config/project-controls-list-definitions.ts` | **Canonical Current-State** | Project-controls-family (T05) list definitions; 3 flat lists with T01-compliant pid/indexing; produced by W0-G2-T05 |
| `backend/functions/src/config/financial-list-definitions.ts` | **Canonical Current-State** | Financial-family (T06) list definitions; 5 lists (1 parent, 1 child, 3 flat) with T01-compliant pid/indexing/parent-child; produced by W0-G2-T06 |
| `backend/functions/src/config/workflow-list-definitions.ts` | **Canonical Current-State** | Composed workflow-family list definitions (26 lists, 5 families); produced by W0-G2-T07 |
| `backend/functions/src/validation/` | **Canonical Current-State** | G2 provisioning validation helper module (list, department, template validators); produced by W0-G2-T08 |
| `docs/reference/provisioning/g2-validation-rules.md` | **Canonical Current-State** | Consolidated G2 validation rules reference (T09 source of truth); produced by W0-G2-T08 |
| `docs/reference/provisioning/seeded-file-manifest.md` | **Canonical Current-State** | Seeded file manifest reference with disk-presence tracking; produced by W0-G2-T08 |
| `docs/reference/provisioning/department-library-folders.md` | **Canonical Current-State** | Department library pruning and folder tree reference; produced by W0-G2-T08 |
| T09 test suite (`backend/functions/src/`) | **Canonical Current-State** | G2 provisioning verification test suite (schema-contract, step3, step4, retry, idempotency tests + integration scaffolds); 35 unit tests across 4 new files + env-gated integration `.todo()` registry in smoke.test.ts; produced by W0-G2-T09 |
| `plans/MVP/G2/W0-G2-Backend-Hardening-and-Workflow-Data-Foundations-Plan.md` (and T01 through T09, 9 task files) | **Canonical Normative Plan** | Tier 2 — matrix classification only; Group 2 master plan + task files T01–T09; backend hardening and SharePoint list schema tranche; ADR-0091 required before implementation |
| `plans/MVP/G3/W0-G3-Shared-Platform-Wiring-and-Workflow-Experience-Plan.md` (and T01 through T08, 8 task files) | **Canonical Normative Plan** | Tier 2 — matrix classification only; Group 3 master plan + task files T01–T08; shared-platform wiring and workflow experience tranche; produces 9 reference documents under `docs/reference/workflow-experience/`; ADR-0091 required before implementation |
| `plans/MVP/G4/W0-G4-SPFx-Surfaces-and-Workflow-Experience-Plan.md` | **Canonical Normative Plan** | Tier 2 — matrix classification only; Group 4 master umbrella plan; SPFx surfaces and workflow experience tranche; governs T01–T08; defines 10 locked interview decisions, 4-surface map (Estimating/Accounting/Admin/Project Hub), package boundary doctrine; requires G3 acceptance gate + ADR-0091 before implementation; created 2026-03-14 |
| `plans/MVP/G4/W0-G4-T01-Estimating-Requester-Guided-Setup-Surface.md` (and T02 through T08, 7 additional task files) | **Canonical Normative Plan** | Tier 2 — matrix classification only; Group 4 task plans T01–T08; SPFx surface implementation specifications for Estimating requester flow (T01), coordinator visibility/retry (T02), controller queue/review (T03), admin oversight/recovery (T04), completion/handoff (T05), complexity/visibility rules (T06), responsive/failure-modes (T07), testing/verification (T08); ADR-0091 required before implementation; created 2026-03-14 |
| `docs/reference/spfx-surfaces/estimating-requester-surface.md` | **Living Reference (Diátaxis)** | Reference quadrant; SPFx surface audience; requester guided setup surface spec and route map; produced by W0-G4-T01; pending implementation |
| `docs/reference/spfx-surfaces/coordinator-visibility-spec.md` | **Living Reference (Diátaxis)** | Reference quadrant; SPFx surface audience; coordinator visibility and retry boundary specification; coordinator queue columns/actions, failure classification display, retry eligibility 5-condition check, complexity gating assignments, BIC component tiers; produced by W0-G4-T02 |
| `docs/reference/spfx-surfaces/controller-review-surface.md` | **Living Reference (Diátaxis)** | Reference quadrant; SPFx surface audience; controller queue and structured review surface spec; queue columns, filter tabs, action affordances (approve/clarify/hold/route-to-admin), API method mapping, complexity gating, BIC rendering; produced by W0-G4-T03 |
| `apps/accounting/src/pages/ProjectReview*.tsx` | **Canonical Current-State** | Controller queue and structured review pages; `ProjectReviewQueuePage` (filtered queue table with tabs) and `ProjectReviewDetailPage` (structured review with approve/clarify/hold/route-to-admin actions); produced by W0-G4-T03 |
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | **Living Reference (Diátaxis)** | Reference quadrant; SPFx surface audience; admin oversight and recovery boundary spec; state filter tabs (Active/Failures/Completed/All), admin-exclusive actions (force retry/archive/ack escalation/state override), complexity tier assignments, entry points from Estimating and Accounting, API method mapping, role boundary definitions; produced by W0-G4-T04 |
| `apps/admin/src/pages/ProvisioningOversightPage.tsx` | **Canonical Current-State** | Admin provisioning oversight page; expanded from ProvisioningFailuresPage with state-filtered tabs, detail modal with saga step log, expert-tier diagnostics, force-retry/archive/ack-escalation/state-override actions, ?projectId= cross-app navigation; produced by W0-G4-T04 |
| `docs/reference/spfx-surfaces/completion-handoff-spec.md` | **Living Reference (Diátaxis)** | Reference quadrant; SPFx surface audience; completion confirmation and optional Project Hub handoff spec; URL validation rules, navigation behavior (new tab, no redirect), session-only dismissal, handoff assembly via usePrepareHandoff with SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG, complexity gating assignments, Project Hub welcome card deferred (IActiveProject.provisionedAt missing); produced by W0-G4-T05 |
| `apps/estimating/src/components/project-setup/CompletionConfirmationCard.tsx` | **Canonical Current-State** | Completion confirmation card; success badge, site summary, team access count, Open Project Hub button (new tab), Stay in Estimating dismissal, complexity-gated ProvisioningChecklist summary, HbcHandoffStatusBadge (hidden in Wave 0); produced by W0-G4-T05 |
| `docs/reference/spfx-surfaces/complexity-application-map.md` | **Living Reference (Diátaxis)** | Reference quadrant; SPFx surface audience; cross-surface complexity gate application map — field-to-tier mapping tables (essential/standard/expert) across all G4 surfaces, STATE_BADGE_VARIANTS canonical source in `@hbc/provisioning`, roleComplexityMap validation (12 AD groups confirmed), HbcComplexityDial placement (3 detail pages), cross-surface consistency rules, ClarificationBanner ungated rationale; produced by W0-G4-T06 |
| `docs/reference/spfx-surfaces/responsive-failure-catalog.md` | **Living Reference (Diátaxis)** | Reference quadrant; SPFx surface audience; responsive breakpoints, tablet-safe requirements, cross-app navigation URLs, 11-scenario failure mode catalog; produced by W0-G4-T07; implemented |
| `apps/*/src/utils/crossAppUrls.ts` | **Canonical Current-State** | Cross-app URL helpers (Estimating, Accounting); `getAdminAppUrl()` with env var validation and null fallback; produced by W0-G4-T07 |
| `docs/reference/workflow-experience/setup-wizard-contract.md` | **Canonical Normative Plan** | Step-wizard integration contract for project setup guided flow; step definitions, validation model, field-to-step mapping, draft key strategy, clarification-return behavior, boundary summary; produced by W0-G3-T01 |
| `packages/features/estimating/src/project-setup/` | **Canonical Current-State** | Project setup step-wizard integration module; wizard config, step definitions, field mapping, add-on definitions, types, draft key constants; produced by W0-G3-T01 |
| `docs/reference/workflow-experience/bic-action-contract.md` | **Canonical Normative Plan** | BIC ownership contract for project setup requests; canonical action string table, owner derivation rules, urgency mapping, module registration spec, blocked-state definitions; produced by W0-G3-T02 |
| `docs/reference/workflow-experience/setup-handoff-routes.md` | **Canonical Normative Plan** | Handoff contract for Estimating → Project Hub transition; pre-flight validation rules, seed data mapping, recipient resolution, Wave 0/Wave 1 boundary, BIC↔handoff responsibility split; produced by W0-G3-T02 |
| `packages/provisioning/src/bic-config.ts` | **Canonical Current-State** | BIC config, action map, urgency map, deriveCurrentOwner() for project setup requests; single source of truth for ownership across all surfaces; produced by W0-G3-T02 |
| `packages/provisioning/src/handoff-config.ts` | **Canonical Current-State** | Handoff config and readiness validation for setup-complete → Project Hub transition; IProjectHubSeedData type; Wave 0 no-op callbacks; produced by W0-G3-T02 |
| `packages/provisioning/src/bic-registration.ts` | **Canonical Current-State** | BIC module registration factory for provisioning module; fixed module key and label constants; produced by W0-G3-T02 |
| `docs/reference/workflow-experience/clarification-reentry-spec.md` | **Canonical Normative Plan** | Clarification re-entry contract for project setup wizard; field-to-step mapping, wizard initialization rules, data preservation contract, draft key strategy, resubmission flow, controller visibility, edge cases; produced by W0-G3-T03 |
| `packages/models/src/provisioning/IRequestClarification.ts` | **Canonical Current-State** | Clarification loop domain types: IRequestClarification, ClarificationStatus, IRequestClarificationInput, IClarificationResponseInput; API seam types for controller and requester; produced by W0-G3-T03 |
| `packages/features/estimating/src/project-setup/config/clarificationReturn.ts` | **Canonical Current-State** | Pure return-flow helpers for clarification-return mode: getOpenClarifications, buildClarificationReturnState, buildClarificationResponsePayload; no hooks/async; produced by W0-G3-T03 |
| `docs/reference/workflow-experience/setup-notification-registrations.md` | **Canonical Normative Plan** | Full 15-event notification registration spec; naming reconciliation, D8 classification rule, who-fires-each, recipient resolution; produced by W0-G3-T04 |
| `docs/reference/workflow-experience/my-work-alignment-contract.md` | **Canonical Normative Plan** | My Work alignment contract; IMyWorkItem shape (illustrative/provisional), 3 interim hooks, 4 prohibited stopgaps, source enumeration; produced by W0-G3-T04 |
| `packages/provisioning/src/notification-registrations.ts` (T04 update) | **Canonical Current-State** | Expanded from 8 to 15 event registrations; request-submitted reclassified immediate/non-overridable; completed channels updated; 7 new events; produced by W0-G3-T04 |
| `packages/provisioning/src/notification-templates.ts` (T04 update) | **Canonical Current-State** | Expanded from 8 to 15 template factories; 7 new templates for T04 events; produced by W0-G3-T04 |
| `docs/reference/workflow-experience/draft-key-registry.md` | **Canonical Normative Plan** | Draft key registry for project setup; 3 keys, TTL, auto-save, resume, failure modes; produced by W0-G3-T05 |
| `packages/session-state/src/hooks/useAutoSaveDraft.ts` (T05 addition) | **Canonical Current-State** | Generic debounced auto-save draft hook; 1.5s default debounce, flush-on-unmount; produced by W0-G3-T05 |
| `packages/features/estimating/src/project-setup/hooks/useProjectSetupDraft.ts` | **Canonical Current-State** | Feature-local draft hook; mode-aware key/TTL resolution, resume context; produced by W0-G3-T05 |
| `packages/features/estimating/src/project-setup/config/resumeDecision.ts` | **Canonical Current-State** | Pure resume decision helpers; prompt-user / auto-continue / fresh-start; produced by W0-G3-T05 |
| `docs/reference/workflow-experience/complexity-gate-spec.md` | **Canonical Normative Plan** | Summary field registry, expandable history levels, complexity gate spec tables, coaching prompts, anti-patterns; produced by W0-G3-T06 |
| `packages/provisioning/src/summary-field-registry.ts` (T06 addition) | **Canonical Current-State** | Summary field registry, status labels, department labels, urgency indicators; produced by W0-G3-T06 |
| `packages/provisioning/src/history-level-registry.ts` (T06 addition) | **Canonical Current-State** | History level model (Level 0/1/2), content descriptors, visibility helpers; produced by W0-G3-T06 |
| `packages/provisioning/src/coaching-prompt-registry.ts` (T06 addition) | **Canonical Current-State** | Coaching prompt registry for Essential tier; 4 prompts; produced by W0-G3-T06 |
| `packages/provisioning/src/complexity-gate-helpers.ts` (T06 addition) | **Canonical Current-State** | Pure complexity gate visibility helpers for summary fields and history content; produced by W0-G3-T06 |
| `docs/reference/workflow-experience/primitive-integration-checklist.md` | **Canonical Normative Plan** | Integration rules (7), failure modes (10), boundary drift prevention, G4/G5 validation checklist; produced by W0-G3-T07 |
| `packages/provisioning/src/integration-rules.ts` (T07 addition) | **Canonical Current-State** | Typed integration rule registry; 7 rules with package pairs, anti-patterns, correct patterns; produced by W0-G3-T07 |
| `packages/provisioning/src/failure-modes.ts` (T07 addition) | **Canonical Current-State** | Typed failure mode registry; FM-01 through FM-10 with scenarios and expected degradation; produced by W0-G3-T07 |
| `packages/provisioning/src/t08-cross-contract-verification.test.ts` (T08 addition) | **Canonical Current-State** | Cross-contract verification suite; 14 TC-* IDs covering ownership/action alignment, notification body verification, draft key distinctness, BIC registration shape, complexity gate compliance; produced by W0-G3-T08 |
| `packages/provisioning/src/t08-deferred-surface-tests.test.ts` (T08 addition) | **Canonical Current-State** | Deferred surface test scaffolds; 11 it.todo stubs for G4/G5 behavior tests + 1 env-gated integration scaffold (TC-CLAR-05); produced by W0-G3-T08 |
| `docs/reference/spfx-surfaces/estimating-requester-surface.md` | **Living Reference (Diátaxis)** | Reference quadrant; Estimating requester surface route map, component hierarchy, step wizard config, draft persistence, clarification-return flow, BIC ownership display, complexity gating rules; produced by W0-G4-T01 |
| `apps/estimating/src/components/project-setup/` | **Canonical Current-State** | Estimating requester guided setup surface components; step body renderers, resume banner, state display helpers, request detail compositions (core summary, state context, clarification banner); produced by W0-G4-T01; extended by W0-G4-T02 with FailureDetailCard and RetrySection |
| `apps/estimating/src/utils/failureClassification.ts` | **Canonical Current-State** | Failure classification display constants, canCoordinatorRetry() 5-condition check, getFailedStep() helper; NO inference from error strings (spec §8.2); produced by W0-G4-T02 |
| `apps/estimating/src/test/NewRequestPage.test.tsx` | **Canonical Current-State** | G4-T08 Estimating guided setup tests; draft auto-save, resume banner, clarification return, submission success/failure, complexity gating; produced by W0-G4-T08 |
| `apps/estimating/src/test/RequestDetailPage.test.tsx` | **Canonical Current-State** | G4-T08 Estimating request detail tests; state badge, ownership display, complexity-gated fields, clarification banner; produced by W0-G4-T08 |
| `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx` | **Canonical Current-State** | G4-T08 Coordinator retry tests; failure classification, retry eligibility, retry action, coordinator queue filtering; produced by W0-G4-T08 |
| `apps/estimating/src/test/RequestDetailPage.completion.test.tsx` | **Canonical Current-State** | G4-T08 Completion handoff tests; completion card, Project Hub URL, stay-in-estimating dismissal, handoff assembly; produced by W0-G4-T08 |
| `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx` | **Canonical Current-State** | G4-T08 Accounting review queue tests; filter tabs, queue columns, action routing, complexity gating; produced by W0-G4-T08 |
| `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx` | **Canonical Current-State** | G4-T08 Accounting review detail tests; structured review actions (approve/clarify/hold/route-to-admin), complexity-gated fields; produced by W0-G4-T08 |
| `apps/admin/src/test/ProvisioningOversightPage.test.tsx` | **Canonical Current-State** | G4-T08 Admin oversight tests; state filter tabs, detail modal, admin-exclusive actions, cross-app navigation; produced by W0-G4-T08 |
| `apps/estimating/src/test/complexity.test.tsx` | **Canonical Current-State** | G4-T08 Complexity gating tests for Estimating surfaces; tier-based field visibility; produced by W0-G4-T08 |
| `apps/accounting/src/test/complexity.test.tsx` | **Canonical Current-State** | G4-T08 Complexity gating tests for Accounting surfaces; tier-based field visibility; produced by W0-G4-T08 |
| `apps/admin/src/test/complexity.test.tsx` | **Canonical Current-State** | G4-T08 Complexity gating tests for Admin surfaces; tier-based field visibility; produced by W0-G4-T08 |
| `apps/project-hub/src/test/completion-welcome.test.tsx` | **Canonical Current-State** | G4-T08 Deferred stubs; 2 it.todo stubs for completion welcome card blocked on IActiveProject.provisionedAt; produced by W0-G4-T08 |
| `tools/check-no-role-branch.sh` | **Canonical Current-State** | G4-T08 Role-check gate script; CI-safe validation that no role-branch assumptions leak into test files; produced by W0-G4-T08 |
| `plans/MVP/G5/W0-G5-Hosted-PWA-Requester-Surfaces-Plan.md` (and T01 through T08, 8 task files + README) | **Canonical Normative Plan** | Tier 2 — matrix classification only; Group 5 master plan + task files T01–T08 + README; hosted PWA requester-surface tranche; parity contract with SPFx surfaces, lighter presentation rules, draft/resume, offline interruption, completion handoff, install-ready posture; ADR-0091 required before implementation; created 2026-03-15 |
| `apps/pwa/src/routes/project-setup/` | **Canonical Current-State** | PWA project setup route; `ProjectSetupPage.tsx` (5-step wizard matching SPFx), `ResumeBanner.tsx`, `steps/` (DepartmentStep, ProjectInfoStep, TeamStep, TemplateAddOnsStep, ReviewSubmitStep); offline-queuing via `@hbc/session-state` operation executor; produced by W0-G5-T01 through W0-G5-T04 |
| `apps/pwa/src/routes/projects/` | **Canonical Current-State** | PWA project list and request detail route; `ProjectsPage.tsx` (RBAC-filtered project list), `RequestDetailPage.tsx` (request state display, draft clear on navigation); produced by W0-G5-T02 |
| `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx` | **Canonical Current-State** | PWA provisioning progress view; step-by-step checklist display with SignalR-wired status updates; produced by W0-G5-T04 |
| `apps/pwa/src/test/parity/stateLabels.test.ts` and `wizardConfig.test.ts` | **Canonical Current-State** | PWA parity test suite; asserts shared-state label map and wizard step config are identical between SPFx and PWA surfaces; produced by W0-G5-T08 |
| `plans/MVP/G6/W0-G6-Admin-Support-and-Observability-Plan.md` (and T01 through T08, 8 task files + README) | **Canonical Normative Plan** | Tier 2 — matrix classification only; Group 6 master plan + task files T01–T08 + README; admin, support, and observability tranche; failures inbox, audience permissions, operational dashboards, alert routing, embedded guidance, observability/telemetry, integration/failure modes, testing/verification; created 2026-03-15 |
| `packages/features/admin/src/monitors/provisioningFailureMonitor.ts` and `stuckWorkflowMonitor.ts` | **Canonical Current-State** | Provisioning alert monitors; `provisioningFailureMonitor` raises high/critical severity alerts when `retryCount` approaches/reaches ceiling (ADMIN_RETRY_CEILING = 3); `stuckWorkflowMonitor` detects workflows inactive beyond threshold; injected data-provider pattern for testability; produced by W0-G6-T04 |
| `packages/features/admin/src/probes/azureFunctionsProbe.ts` and `sharePointProbe.ts` | **Canonical Current-State** | Infrastructure health probes; return structured `IInfrastructureProbeResult` with health status and summary; designed as testable stubs with runtime configuration injected at call time; produced by W0-G6-T06 |
| `packages/features/admin/src/api/AdminAlertsApi.ts` | **Canonical Current-State** | Admin alerts API; `acknowledge()`, `listActive()`, `listHistory(range?)` methods; in-memory Map store keyed by alertId; produced by W0-G6-T01 |
| `docs/maintenance/provisioning-runbook.md` | **Living Reference (Diátaxis)** | Maintenance quadrant; operations audience; provisioning failure diagnosis, retry procedures, state override guidance, escalation contacts; produced by W0-G6-T05 |
| `docs/maintenance/provisioning-observability-runbook.md` | **Living Reference (Diátaxis)** | Maintenance quadrant; operations/admin audience; 5 AppInsights KQL query templates (timeline, failed runs, step durations, success rate trend, step-5 deferral rate), 2 alert rule definitions (HBIntel-ProvisioningStuck, HBIntel-TimerFullSpecFailed) with KQL, severity, and action group specs; produced by W0-G6-T06 |
| `docs/reference/ui-kit/UI-Kit-Component-Maturity-Matrix.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T01 maturity baseline for `@hbc/ui-kit` v2.1.0 and all platform/shared-feature UI packages; governs T07 polish sequencing, T11 test prioritization, T12 consumer audit, T13 scorecard baseline |
| `docs/reference/ui-kit/UI-Kit-Wave1-Consumer-Map.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T01 app-to-component consumer mapping for all Wave 1 apps; governs T08 composition risk, T12 consumer cleanup scope, T13 scorecard baseline |
| `docs/reference/ui-kit/UI-Kit-Competitive-Benchmark-Matrix.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T02 competitive benchmark across 12 UI pattern categories; governs T03–T08 visual direction |
| `docs/reference/ui-kit/UI-Kit-Mold-Breaker-Principles.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T02 8 governing mold-breaker principles with market evidence, positive requirements, and anti-patterns; directional authority for T03–T08 visual implementation |
| `docs/reference/ui-kit/UI-Kit-Visual-Hierarchy-and-Depth-Standards.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T04 visual hierarchy system with 5-level depth stack, 12 content levels, 7 zone distinctions, 3 card weight classes, and 3-second read standard; governs T07 hierarchy expression, T08 composition evaluation, T13 anti-flatness scorecard |
| `docs/reference/ui-kit/UI-Kit-Field-Readability-Standards.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T05 density mode definitions, field-readability minimums, field interaction assumptions, and density application model; governs T07 density conformance, T08 field-readability evaluation, T09 accessibility cross-reference, T13 production-readiness scorecard |
| `docs/reference/ui-kit/UI-Kit-Adaptive-Data-Surface-Patterns.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T06 adaptive data surface family (4 types), 7 interaction pattern standards, responsive collapse rules, and surface selection decision guide; governs T07 data surface implementation, T08 composition evaluation, T13 data surface modernization scorecard |
| `docs/reference/ui-kit/UI-Kit-Composition-Review.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T08 structured composition review of 10 Wave 1 page patterns against 10 quality criteria; validates hierarchy, scanability, perceived quality, and field readiness; governs T13 composition quality scorecard |
| `docs/reference/ui-kit/UI-Kit-Wave1-Page-Patterns.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T08 approved page composition patterns with zone-to-component mapping, design guidance, and known pitfalls; governs Wave 1 team page composition, T10 Storybook composition stories, T13 composition quality |
| `docs/reference/ui-kit/UI-Kit-Accessibility-Findings.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T09 accessibility audit findings, ARIA compliance status, reduced-motion remediation, focus management patterns, implementation trust audit, and T11 automation requirements; governs T11 test coverage, T13 accessibility scorecard |
| `docs/reference/ui-kit/UI-Kit-Usage-and-Composition-Guide.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T10 developer guide covering install/import, density system, page composition, data surface selection, zone system, common mistakes, and contribution rules; primary reference for Wave 1 teams |
| `docs/reference/ui-kit/UI-Kit-Visual-Language-Guide.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer/designer audience; WS1-T10 design system reference covering color system, shape language, surface roles, typography scale, spacing scale, motion patterns, and elevation/depth system; governs design extension decisions |
| `docs/reference/ui-kit/UI-Kit-Verification-Coverage-Plan.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T11 verification overhaul establishing test commands, coverage map, CI integration, and test writing guidelines for @hbc/ui-kit; governs T13 verification coverage scorecard |
| `docs/reference/ui-kit/UI-Kit-Application-Standards-Conformance-Report.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T12 application-wide conformance audit with per-component results, ownership gap resolution, entry-point audit, and contribution governance confirmation; governs T13 standards conformance scorecard |
| `docs/reference/ui-kit/UI-Kit-Production-Readiness-Scorecard.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer/stakeholder audience; WS1-T13 production-readiness evaluation of 20 scorecard dimensions with go/no-go determination; Wave 1 entry gate |
| `docs/reference/ui-kit/UI-Kit-Release-Notes.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T13 release notes for @hbc/ui-kit v2.2.0 covering all T01-T12 changes, new exports, component changes, and Wave 1 compatibility confirmation |
| `docs/reference/ui-kit/UI-Kit-Residual-Debt-Register.md` | **Living Reference (Diátaxis)** | Reference quadrant; developer audience; WS1-T13 residual debt register with 10 non-blocking items, named owners, and resolution timelines; no Wave 1 blocking debt |
| Diátaxis output docs (`docs/tutorials/`, `docs/how-to/`, `docs/reference/`, `docs/explanation/`, `docs/user-guide/`, `docs/administrator-guide/`, `docs/maintenance/`, `docs/troubleshooting/`, `docs/security/`, `docs/release-notes/`, `docs/faq.md`) | **Living Reference (Diátaxis)** | 200+ files; quadrant breakdown: tutorials, how-to, reference, explanation, user-guide, administrator-guide, maintenance, troubleshooting, security, release-notes, faq; updated continuously as features ship; exempt from inline banner |
| `docs/architecture/adr/ADR-0116-ui-doctrine-and-visual-governance.md` | **Permanent Decision Rationale** | Governs UI ownership, governed UI-bearing exceptions, promotion/migration rule, Personal Work Hub / PWA as the benchmark surface, and release-gated visual excellence doctrine across all UI-bearing surfaces; authored 2026-03-16 |
| `docs/architecture/plans/MASTER/README.md` | **Canonical Current-State** | MASTER plan library navigation index; links all phase plans, deliverable subdirectories, and the master summary |
| `docs/architecture/plans/MASTER/00_HB-Intel_Master-Development-Summary-Plan.md` | **Canonical Normative Plan** | Tier 1 banner applied; program master summary and phase sequencing index; governs execution order across all MASTER phase plans |
| `docs/architecture/plans/MASTER/01_Phase-0_Program-Control-and-Repo-Truth-Plan.md` and `02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md` | **Historical Foundational** | Tier 1 banner applied to each; Phases 0 and 1 complete; deliverable artifacts in `phase-0-deliverables/` and `phase-1-deliverables/` |
| `docs/architecture/plans/MASTER/03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md` | **Canonical Normative Plan** | Tier 1 banner applied; Phase 2 Personal Work Hub and PWA shell execution plan; implementation complete 2026-03-20; governs all P2-* deliverable specs |
| `docs/architecture/plans/MASTER/04` through `08` (Phase 3–7 plans) | **Canonical Normative Plan** | Tier 1 banner applied to each; Phase 3 Project Hub through Phase 7 Intelligence plans; Draft for working use; pending activation |
| `docs/architecture/plans/MASTER/phase-2-deliverables/` (25 P2-\* specification files, README, phase-2-decision-register.md) | **Canonical Normative Plan** | Tier 2 — matrix classification only; Phase 2 governing deliverable specifications P2-A1 through P2-E5; P2-C1 and P2-C5 serve as living readiness registers; updated through 2026-03-20 |
| `docs/architecture/plans/MASTER/phase-0-deliverables/` and `phase-1-deliverables/` | **Historical Foundational** | Tier 2 — matrix classification only; completed phase deliverable artifacts |
| `packages/shell/src/landingResolver.ts` | **Canonical Current-State** | Phase 2 (P2-B1): `resolveLandingDecision()` — sole policy authority for landing path decisions; exports `LandingDecision`, `LandingDecisionInput`, `LandingMode`, `TeamMode`; implemented 2026-03-20 |
| `packages/shell/src/cohortGate.ts` | **Canonical Current-State** | Phase 2 (P2-B1): `isMyWorkCohortEnabled()` — single source of truth for `/my-work` pilot cohort gate; reads `my-work-hub` feature flag from `@hbc/auth`; implemented 2026-03-20 |
| `apps/pwa/src/sources/sourceAssembly.ts` | **Canonical Current-State** | Phase 2 (P2-C1): hub source registration bootstrap; called once from `main.tsx`; registers all 5 BIC modules, all notification events, and all 4 MyWork adapters; implemented 2026-03-20 |
| `apps/pwa/src/sources/domainQueryFns.ts` | **Canonical Current-State** | Phase 2 (P2-C1): domain queryFn seam; mock data implementations for Estimating, BD Score Benchmark, BD Strategic Intelligence, Health Pulse; replacement point for real domain API clients in Phase 4; implemented 2026-03-20 |
| `apps/pwa/src/pages/my-work/` (MyWorkPage, HubZoneLayout, HubPrimaryZone, HubSecondaryZone, HubTertiaryZone, HubPageLevelEmptyState, HubTeamModeSelector, HubFreshnessIndicator, HubConnectivityBanner, hubStateTypes, trustStateConstants, formatRelativeTime, useHubStatePersistence, useHubReturnMemory, useHubFeedRefresh, useHubTrustState, useHubPersonalization, cards/) | **Canonical Current-State** | Phase 2 (P2-D1 through P2-D5): three-zone Personal Work Hub implementation; adaptive layout, role-based card composition, freshness trust state, return memory, team mode and card arrangement persistence; implemented 2026-03-20 |

### 2.1 Classification Maintenance Rule

Every new architecture, plan, reference, or release document must declare one of the following six classes at creation time — either via an inline Tier 1 banner or by being added to the matrix above (Tier 2):

| Class | When to Use | Tier |
|-------|-------------|------|
| **Canonical Current-State** | Describes what the repo currently contains | Infrastructure docs only; Tier 1 for any new current-state reference doc |
| **Canonical Normative Plan** | Describes what must be built next in an active phase | Tier 1 for master/gate plans; Tier 2 for subtask plans |
| **Historical Foundational** | Completed phase or feature planning; locked for audit | Tier 1 for master plans; Tier 2 for sub-plans |
| **Deferred Scope** | Describes planned work not yet assigned to an active phase | Tier 1 banner required on the doc; matrix row for the group |
| **Superseded / Archived Reference** | Replaced by a newer document or approach | Tier 2 sufficient |
| **Permanent Decision Rationale** | ADRs — locked architectural decisions | No banner required; append-only policy is the classification signal |

**Living Reference (Diátaxis)** is a Diátaxis-specific notation within the model, not a seventh class. New Diátaxis output docs are classified by their quadrant placement; no inline banner required.

**Transition rule — Deferred Scope:** When a Deferred Scope document's feature or package enters active development in a named phase milestone, reclassify it to Canonical Normative Plan, add it to the active phase's plan index, and update this matrix. The PH7-RM-* plans were reviewed at PH7.12 sign-off (2026-03-09) and remain Deferred Scope per evidence package §5. They must be reclassified before activation.

**ADR rule:** New ADRs are always Permanent Decision Rationale. ADR-0091 through ADR-0097 were assigned after PH7.11. ADR-0098 is reserved for SF09 (data-seeding), ADR-0099 is reserved for SF10 (notification-intelligence), ADR-0100 is reserved for SF11 (smart-empty-state), ADR-0101 is authored for SF12 (session-state), ADR-0102 is authored for SF13 (project-canvas), ADR-0103 is authored for SF14 (related-items), ADR-0104 is authored for SF15 (ai-assist), ADR-0105 is reserved for SF16 (search), ADR-0106 is authored for SF17 (admin-intelligence), ADR-0107 is authored for SF18 (estimating bid-readiness), ADR-0108 is authored for SF19 (bd score benchmark), ADR-0109 is authored for SF20 (bd heritage adapter boundary), ADR-0110 is authored for SF21 (project health pulse), ADR-0111 is authored as companion primitive governance for SF18, ADR-0112 is authored as companion primitive governance for SF19, ADR-0113 is authored as companion primitive governance for SF20, ADR-0114 is authored to resolve the score-benchmark ↔ post-bid-autopsy circular dependency (2026-03-14), ADR-0115 is authored for SF29 (my-work-feed architecture), and ADR-0116 is authored for UI doctrine and visual governance (2026-03-16). Next unreserved number: **ADR-0117**.

**Banner format (Tier 1):**
```
> **Doc Classification:** [Class Name] — [one-sentence purpose statement]
```

### 2.2 ADR Catalog Conflict Registry

All conflicts identified during PH7.10R validation have been resolved in PH7.11 (2026-03-09).

| Conflict | Detail | Resolution |
|----------|--------|------------|
| Filesystem vs. index discrepancy | 93 ADR files on disk; 74 entries in `docs/README.md` index; 76 referenced in this file | Resolved: 2026-03-09 — `docs/README.md` index rebuilt with all ADRs (ADR-0001 through ADR-0090); `docs/architecture/adr/README.md` fully rebuilt with phase/domain groupings |
| Duplicate-numbered pairs (4) | ADR-0013, ADR-0053, ADR-0054, ADR-0055 — each number had two files on disk | Resolved: 2026-03-09 — ADR-0013-hbc-theme-context renamed to ADR-0088; stale copies of ADR-0053 (shimmer), ADR-0054 (dev-auth-bypass), ADR-0055 (deprecated-token) archived to `adr/archived/` with canonical numbers ADR-0074, ADR-0075, ADR-PH4C-02 respectively |
| Un-prefixed PH6 ADRs (5) | 0014, 0060–0063 had non-standard filenames | Resolved: 2026-03-09 — 0014 renamed to ADR-0089; 0060–0062 archived (canonicals: ADR-0076–0078); 0063-signalr renamed to ADR-0090 (distinct decision from ADR-0063-access-control) |
| Index gap (ADR-0073–ADR-0079) | These numbers were absent from `docs/README.md` index | Resolved: 2026-03-09 — all entries added to `docs/README.md` |
| ADR-0082 not indexed | ADR-0082 missing from `docs/README.md` | Resolved: 2026-03-09 — added to index |

**Post-PH7.11 state (updated 2026-03-16):** 114 ADR files on disk (active), 6 archived in `adr/archived/`. ADR-0091 through ADR-0097 assigned since PH7.11 (...existing text...). ADR-0114 authored 2026-03-14 to resolve score-benchmark ↔ post-bid-autopsy circular dependency. ADR-0115 authored 2026-03-15 for my-work-feed architecture. ADR-0116 authored 2026-03-16 for UI doctrine and visual governance. Next unreserved number: **ADR-0117**. ADR index in `docs/README.md` and `docs/architecture/adr/README.md` are synchronized.

---

## 3. Authoritative Package & Application Inventory

### Category A: Core Platform Packages (8)

| Package | Name | Primary Responsibility | Dependency Role | Maturity | Doc Entrypoint |
|---------|------|----------------------|-----------------|----------|----------------|
| `packages/models` | @hbc/models | Data types & TypeScript contracts | Foundation — no dependencies | v0.1.0 | `packages/models/README.md` |
| `packages/data-access` | @hbc/data-access | Ports/adapters data layer | Depends on models | v0.0.1 | `packages/data-access/README.md` |
| `packages/query-hooks` | @hbc/query-hooks | TanStack Query React hooks | Depends on data-access, models | v0.0.1 | `packages/query-hooks/README.md` |
| `packages/auth` | @hbc/auth | Dual-mode authentication (MSAL/dev) | Depends on models | v0.2.0 | `packages/auth/README.md` |
| `packages/shell` | @hbc/shell | Global navigation & layout | Depends on auth, models | v0.0.1 | `packages/shell/README.md` |
| `packages/app-shell` | @hbc/app-shell | Shell aggregator (read-only surface) | Depends on shell, auth, ui-kit | v0.0.2 | `packages/app-shell/README.md` |
| `packages/ui-kit` | @hbc/ui-kit | Design system, reusable visual primitives, layout/composition primitives, and shared theme/token contracts | Depends on auth, complexity, models | v2.1.0 | `packages/ui-kit/DESIGN_SYSTEM.md` |
| `packages/provisioning` | @hbc/provisioning | SignalR provisioning saga | Depends on auth, models | v0.2.0 | `packages/provisioning/README.md` |

### Category B: Shared Infrastructure (2)

| Package | Name | Primary Responsibility | Dependency Role | Maturity | Doc Entrypoint |
|---------|------|----------------------|-----------------|----------|----------------|
| `packages/spfx` | @hbc/spfx | SPFx webpart scaffolding & utilities | Depends on auth, sharepoint-docs, ui-kit | v0.0.1 | `packages/spfx/README.md` |
| `packages/eslint-plugin-hbc` | @hb-intel/eslint-plugin-hbc | Component consumption lint rules | None (standalone tool) | v1.0.0 | `packages/eslint-plugin-hbc/README.md` |

### Category C: Shared-Feature Primitives (20)

These packages are **Tier-1 Platform Primitives** — mandatory-use when their concern area is present in a feature. See [Platform Primitives Registry](../../reference/platform-primitives.md) for policy, decision tree, adoption matrix, and non-duplication rule. <!-- PH7.4: elevated from optional to Tier-1 per §7.4.1 -->

The original three (SF01–SF03) emerged organically; SF04–SF15 are planned primitives being built in sequence. SF04, SF05, SF06, SF07, SF08, SF09, SF10, SF11, SF12, SF13, SF14, SF15 are fully implemented. SF29 (`@hbc/my-work-feed`) is fully implemented.

| Package | Name | Primary Responsibility | Dependency Role | Maturity | Doc Entrypoint |
|---------|------|----------------------|-----------------|----------|----------------|
| `packages/bic-next-move` | @hbc/bic-next-move | Ball-in-court & ownership primitives | Depends on ui-kit | v0.1.0 | `packages/bic-next-move/README.md` |
| `packages/complexity` | @hbc/complexity | 3-tier density context (Complexity Dial) | Depends on ui-kit | v0.1.0 | `packages/complexity/README.md` |
| `packages/sharepoint-docs` | @hbc/sharepoint-docs | Document lifecycle management | Depends on auth, models, data-access, ui-kit | v0.1.0 | `packages/sharepoint-docs/README.md` |
| `packages/acknowledgment` | @hbc/acknowledgment | Reusable acknowledgment / sign-off primitive | Depends on ui-kit, complexity | v0.1.0 | `packages/acknowledgment/README.md` |
| `packages/step-wizard` | @hbc/step-wizard | Multi-step guided workflow primitive | Depends on ui-kit, complexity | v0.1.1 | `packages/step-wizard/README.md` |
| `packages/versioned-record` | @hbc/versioned-record | Immutable versioned record management | Depends on models, data-access, ui-kit | v0.0.1 | `packages/versioned-record/README.md` |
| `packages/field-annotations` | @hbc/field-annotations | Inline field-level annotation and comment threads | Depends on auth, models, ui-kit | v0.1.0 | `packages/field-annotations/README.md` |
| `packages/workflow-handoff` | @hbc/workflow-handoff | Cross-module workflow handoff and routing | Depends on models, ui-kit, bic-next-move | v0.1.0 | `packages/workflow-handoff/README.md` |
| `packages/data-seeding` | @hbc/data-seeding | Development / demo data seeding primitives | Depends on models, data-access | v0.0.1 | `packages/data-seeding/README.md` |
| `packages/session-state` | @hbc/session-state | Offline-safe session persistence & sync | Depends on idb (runtime); peer: react | v0.0.1 | `packages/session-state/README.md` |
| `packages/project-canvas` | @hbc/project-canvas | Role-based configurable project dashboard canvas | Depends on ui-kit, complexity, @dnd-kit/core; peer: react | v0.0.1 | `packages/project-canvas/README.md` |
| `packages/post-bid-autopsy` | @hbc/post-bid-autopsy | Tier-1 post-bid autopsy primitive for evidence, confidence, taxonomy, governance, publication, telemetry, lifecycle/storage orchestration, hook-state surfaces, and published learning-signal contracts consumed by BD and Estimating adapters | Depends on `versioned-record`, `bic-next-move`, `strategic-intelligence`, `@tanstack/react-query`; peer: react (circular dep with score-benchmark **resolved** — ADR-0114) | v0.0.1 | `packages/post-bid-autopsy/README.md` |
| `packages/strategic-intelligence` | @hbc/strategic-intelligence | Heritage snapshot and living strategic intelligence primitive contracts with trust/workflow/governance ownership seams | None (contract-first primitive scaffold) | v0.0.1 | `packages/strategic-intelligence/README.md` |
| `packages/my-work-feed` | @hbc/my-work-feed | Cross-module personal work aggregation feed | Depends on bic-next-move, complexity, notification-intelligence, session-state, ui-kit, workflow-handoff; peer: react, react-dom, @tanstack/react-query | v0.0.1 | `packages/my-work-feed/README.md` |
| `packages/export-runtime` | @hbc/export-runtime | Shared export runtime — lifecycle, render pipeline, receipt state, provenance, offline replay | Depends on models, ui-kit; peer: react, react-dom, @tanstack/react-query | v0.1.0 | `packages/export-runtime/README.md` |
| `packages/record-form` | @hbc/record-form | Shared record authoring runtime — create/edit/duplicate/template lifecycle, draft recovery, review handoff, offline replay | Depends on models, ui-kit; peer: react, react-dom, @tanstack/react-query | v0.1.0 | `packages/record-form/README.md` |
| `packages/saved-views` | @hbc/saved-views | Shared workspace-state persistence — view lifecycle, scope model, schema compatibility, reconciliation | Depends on models, ui-kit; peer: react, react-dom, @tanstack/react-query | v0.0.8 | `packages/saved-views/README.md` |
| `packages/ai-assist` | @hbc/ai-assist | Contextual AI action layer — Azure AI Foundry integration | Depends on auth, complexity, versioned-record | v0.0.1 | `packages/ai-assist/README.md` |
| `packages/health-indicator` | @hbc/health-indicator | Health-indicator scoring/config/telemetry runtime for readiness models | None (standalone primitive) | v0.0.1 | `packages/health-indicator/README.md` |
| `packages/notification-intelligence` | @hbc/notification-intelligence | Priority-tiered smart notification system | None (standalone primitive) | v0.0.2 | `packages/notification-intelligence/README.md` |
| `packages/related-items` | @hbc/related-items | Cross-module record relationship panel | Depends on auth, complexity, session-state, smart-empty-state, versioned-record | v0.0.1 | `packages/related-items/README.md` |
| `packages/score-benchmark` | @hbc/score-benchmark | Score benchmark primitive for confidence, similarity, and recommendation | Depends on bic-next-move, versioned-record, post-bid-autopsy | v0.0.1 | `packages/score-benchmark/README.md` |
| `packages/smart-empty-state` | @hbc/smart-empty-state | Context-aware empty state classification and guided onboarding | None (standalone primitive) | v0.0.1 | `packages/smart-empty-state/README.md` |

### Category D: Feature Packages (11)

Feature packages export source directly (`main: "./src/index.ts"`) and share the same core dependency set: `@hbc/{models, query-hooks, ui-kit, auth, shell}`.

| Package | Name | Domain | Version |
|---------|------|--------|---------|
| `packages/features/accounting` | @hbc/features-accounting | Accounting | v0.0.0 |
| `packages/features/estimating` | @hbc/features-estimating | Estimating | v0.0.1 |
| `packages/features/project-hub` | @hbc/features-project-hub | Project Hub | v0.0.1 |
| `packages/features/leadership` | @hbc/features-leadership | Leadership | v0.0.0 |
| `packages/features/business-development` | @hbc/features-business-development | Business Development | v0.0.1 |
| `packages/features/admin` | @hbc/features-admin | Admin | v0.2.1 |
| `packages/features/safety` | @hbc/features-safety | Safety | v0.0.0 |
| `packages/features/quality-control-warranty` | @hbc/features-quality-control-warranty | Quality Control & Warranty | v0.0.0 |
| `packages/features/risk-management` | @hbc/features-risk-management | Risk Management | v0.0.0 |
| `packages/features/operational-excellence` | @hbc/features-operational-excellence | Operational Excellence | v0.0.0 |
| `packages/features/human-resources` | @hbc/features-human-resources | Human Resources | v0.0.0 |

### Category E: Applications (14)

#### SPFx WebParts (11)

All SPFx apps use Vite + React 18, build to `dist/`, and are port-mapped 4001–4011.

| App | Name | Port | Feature Package |
|-----|------|------|-----------------|
| `apps/accounting` | @hbc/spfx-accounting | 4001 | @hbc/features-accounting |
| `apps/estimating` | @hbc/spfx-estimating | 4002 | @hbc/features-estimating |
| `apps/project-hub` | @hbc/spfx-project-hub | 4003 | @hbc/features-project-hub |
| `apps/leadership` | @hbc/spfx-leadership | 4004 | @hbc/features-leadership |
| `apps/business-development` | @hbc/spfx-business-development | 4005 | @hbc/features-business-development |
| `apps/admin` | @hbc/spfx-admin | 4006 | @hbc/features-admin |
| `apps/safety` | @hbc/spfx-safety | 4007 | @hbc/features-safety |
| `apps/quality-control-warranty` | @hbc/spfx-quality-control-warranty | 4008 | @hbc/features-quality-control-warranty |
| `apps/risk-management` | @hbc/spfx-risk-management | 4009 | @hbc/features-risk-management |
| `apps/operational-excellence` | @hbc/spfx-operational-excellence | 4010 | @hbc/features-operational-excellence |
| `apps/human-resources` | @hbc/spfx-human-resources | 4011 | @hbc/features-human-resources |

#### Standalone Applications (3)

| App | Name | Port | Runtime | Role |
|-----|------|------|---------|------|
| `apps/dev-harness` | @hbc/dev-harness | 3000 | Vite + React | Development environment; loads all 11 SPFx apps |
| `apps/pwa` | @hbc/pwa | 4000 | Vite + React + PWA | Progressive Web App for field use |
| `apps/hb-site-control` | @hbc/hb-site-control | 4012 | Vite + React + React Native Web | Mobile-first site control app |

### Category F: Backend (1)

| Component | Name | Runtime | Role |
|-----------|------|---------|------|
| `backend/functions` | @hbc/functions | Azure Functions v4 | Serverless HTTP/async triggers for data, auth, provisioning |

Key dependencies: `@azure/functions`, `@azure/data-tables`, `@azure/identity`, `@pnp/sp`, `@pnp/graph`, `jose`, `@hbc/models`.

### Category G: Build Tooling (1)

| Component | Name | Role |
|-----------|------|------|
| `tools/` | @hbc/tools | Shared monorepo build/test scripts (tsx-based) |

---

## 4. Repository Evolution Since Blueprint V4

The monorepo has undergone three controlled evolutionary shifts since Blueprint V4 was written. All are consistent with the Blueprint's architectural intent.

### 4.1 Shared-Feature Primitives Emerged

Blueprint V4 described core platform packages and feature modules but did not anticipate a middle layer of optional cross-cutting primitives. Three packages emerged organically (SF01–SF03):

- **@hbc/bic-next-move** — Ball-in-court and ownership tracking, used by features that need task-assignment visibility.
- **@hbc/complexity** — Three-tier density context (Complexity Dial), allowing features to adapt UI density.
- **@hbc/sharepoint-docs** — Document lifecycle management, wrapping Microsoft Graph document operations.

Six additional primitives have since been planned and built as part of the SF04–SF10 shared-feature series:

- **@hbc/acknowledgment** (SF04) — Reusable acknowledgment and sign-off primitive; v0.1.0 complete.
- **@hbc/step-wizard** (SF05) — Multi-step guided workflow primitive; v0.1.0 complete.
- **@hbc/versioned-record** (SF06) — Immutable versioned record management; v0.0.1 implemented.
- **@hbc/field-annotations** (SF07) — Inline field-level annotation and comment threads; v0.1.0 complete.
- **@hbc/workflow-handoff** (SF08) — Cross-module workflow handoff and routing; v0.1.0 complete.
- **@hbc/data-seeding** (SF09) — Development / demo data seeding primitives; v0.0.1 implemented.

All nine are classified as **controlled evolution (a)**. They follow the same ports/adapters pattern as core packages and do not violate Blueprint V4's layering rules. As of PH7.4, these are designated **Tier-1 Platform Primitives** — mandatory-use when their concern area is present. See [Platform Primitives Registry](../../reference/platform-primitives.md). <!-- PH7.4: Tier-1 elevation; SF04–SF09 added 2026-03-10 -->

### 4.2 Feature Packages Materialized

Blueprint V4 described feature modules conceptually. The repo now implements them as `packages/features/*` with individual `package.json` files, TypeScript path aliases in `tsconfig.base.json`, and source-based exports (`main: "./src/index.ts"`). Each feature package maps 1:1 to an SPFx app under `apps/`.

This is **controlled evolution (a)** — the Blueprint's feature-per-module vision made concrete.

### 4.3 Workspace Scope Expanded

The original workspace included `packages/*` and `apps/*`. It now also includes:

- `backend/*` — Azure Functions serverless backend
- `tools/*` — Monorepo build and governance tooling
- `packages/features/*` — Feature package sub-workspace

This is **controlled evolution (a)** — necessary to support the full platform as implementation progressed through Phases 4–6.

### 4.4 Phase 2 Shell Contracts and Personal Work Hub

Phase 2 (completed 2026-03-20) extended two existing packages and introduced a new application layer within the PWA without creating new packages.

**`@hbc/shell` public contract expansion:** The shell package was originally described as "Global navigation & layout." Phase 2 added two new public seams that are architectural in nature:

- `resolveLandingDecision()` — a pure function that is the sole policy authority for post-auth landing path decisions. It encodes the priority chain (redirect memory → role → cohort) and is the mandatory replacement for any parallel role/cohort branching in route files. Companion types: `LandingDecision`, `LandingDecisionInput`, `LandingMode`, `TeamMode`.
- `isMyWorkCohortEnabled()` — the single source of truth for pilot cohort membership. Reads `my-work-hub` feature flag from `@hbc/auth`; replaceable with a real cohort service without changing consumers.

These are **controlled evolution (a)** — a natural extension of `@hbc/shell`'s orchestration authority into landing policy and cohort governance.

**Personal Work Hub (PWA):** The `/my-work` route and `apps/pwa/src/pages/my-work/` directory implement the Phase 2 operating layer. Key structural additions:

- `apps/pwa/src/sources/sourceAssembly.ts` — bootstrap file called once from `main.tsx`; registers all hub sources (BIC modules, notification events, MyWork adapters) in a single governed location.
- `apps/pwa/src/sources/domainQueryFns.ts` — mock queryFn seam for the four non-Provisioning BIC sources; designed as an explicit Phase 4 replacement point for real domain API clients.
- `apps/pwa/src/pages/my-work/` — three-zone adaptive hub with role-based card composition (P2-D1), adaptive layout (P2-D2), freshness/trust state (P2-B3), return memory (P2-B2), and team mode + card arrangement persistence (P2-D5).

This is **controlled evolution (a)** — the PWA's transition from a project-hub-first landing to a personal-work-first operating layer, as specified in Phase 2 and permitted by Blueprint V4's multi-surface doctrine.

---

## 5. How to Read This Repo

**Where is current truth?**
This file + package READMEs + the codebase itself. For any question about what exists _right now_, start here.

**Where are locked decisions?**
[Blueprint V4](./blueprint/HB-Intel-Blueprint-V4.md) (target architecture), [Foundation Plan](./plans/hb-intel-foundation-plan.md) (original implementation instructions), and the [ADR catalog](./adr/) (114 active decisions). These are append-only or comment-only.

**How do I distinguish current implementation from future plans?**
Use the Classification Matrix in Section 2. Documents labeled **Canonical Current-State** describe what exists. Documents labeled **Canonical Normative Plan** describe what should be built next. **Historical Foundational** documents describe what was planned originally and may have evolved.

**Which shared-feature packages are mandatory?**
As of PH7.4, all Category C packages are **Tier-1 Platform Primitives** — mandatory when their concern area is present in a feature. See the [Platform Primitives Registry](../../reference/platform-primitives.md) for the decision tree and adoption matrix. Core platform packages (Category A) remain the mandatory foundation for all features. <!-- PH7.4: updated from "none mandatory" to Tier-1 policy; SF04–SF09 primitives added 2026-03-10; SF10–SF15 and SF29 added during Wave 0 -->

**Where do I add a new feature?**
1. Create `packages/features/<domain>/` with `package.json`, `tsconfig.json`, and `src/index.ts`.
2. Register path aliases in `tsconfig.base.json`.
3. Create the corresponding SPFx app in `apps/<domain>/` if it needs a SharePoint surface.
4. Add the feature to the dev-harness registration.

**What are the UI Kit entry points?**
- `@hbc/ui-kit` — full component library (PWA, dev-harness)
- `@hbc/ui-kit/app-shell` — shell-only exports (SPFx constrained contexts)
- `@hbc/ui-kit/theme` — token/theme-only imports
- `@hbc/ui-kit/icons` — icon-only imports

**What governs UI-bearing surfaces?**
ADR-0116 is the active UI doctrine. `@hbc/ui-kit` remains the owner of reusable visual primitives, layout/composition primitives, shared visual language, and theme/token contracts. UI-bearing components may exist outside `@hbc/ui-kit` only as governed exceptions when tightly coupled to package-specific behavior or runtime state. Package location does not exempt a surface from HB Intel’s standards for visual quality, hierarchy, theming, accessibility, field readiness, responsiveness, documentation, and verification. Current maturity and consumer-risk baselines are tracked in `docs/reference/ui-kit/UI-Kit-Component-Maturity-Matrix.md` and `docs/reference/ui-kit/UI-Kit-Wave1-Consumer-Map.md`.

---

## 6. Workspace Dependency Graph

```
                        @hbc/models
                       /     |      \
              data-access   auth    ui-kit ← complexity
                  |          |        |
             query-hooks   shell   bic-next-move
                  \         |
                   \    app-shell
                    \       |
                     \  provisioning    sharepoint-docs → spfx
                      \     |               |
                       ↓    ↓               ↓
              ┌─────────────────────────────────────┐
              │  Feature Packages (11)               │
              │  @hbc/features-{domain}              │
              │  deps: models, query-hooks, ui-kit,  │
              │        auth, shell                   │
              └───────────┬─────────────────────────┘
                          │
              ┌───────────┴─────────────────────────┐
              │                                     │
     SPFx Apps (11)                        Standalone Apps (3)
     apps/{domain}                    dev-harness | pwa | hb-site-control
     ports 4001–4011                  ports 3000, 4000, 4012
              │
              └──────────→ @hbc/functions (backend)
                           deps: models (types only)
```

**Key relationships:**
- `models` is the foundation with zero internal dependencies.
- `data-access` and `auth` depend only on `models`.
- `query-hooks` bridges `data-access` into React via TanStack Query.
- `shell` provides navigation/layout; `app-shell` aggregates shell + auth + ui-kit.
- Shared-feature primitives (`complexity`, `bic-next-move`, `sharepoint-docs`, and SF04–SF09 primitives) depend on core packages and are consumed as Tier-1 primitives by features when their concern area is present.
- Feature packages consume core + optional shared-feature primitives.
- SPFx apps are thin shells that host their corresponding feature package.
- `dev-harness` loads all 11 SPFx apps for unified development.
- `backend/functions` depends only on `@hbc/models` for shared types.

---

## Summary Metrics

| Metric | Count |
|--------|-------|
| Core platform packages | 8 |
| Shared infrastructure packages | 2 |
| Shared-feature primitives | 20 |
| Feature packages | 11 |
| SPFx applications | 11 |
| Standalone applications | 3 |
| Backend services | 1 |
| Build tooling packages | 1 |
| **Total workspace members** | **57** |
| Architecture Decision Records | 114 active + 6 archived | <!-- Updated 2026-03-15: ADR-0114 authored to resolve score-benchmark ↔ post-bid-autopsy circular dependency; ADR-0106 authored for SF17 admin-intelligence; ADR-0107 authored for SF18 estimating adapter-over-primitive; ADR-0108 authored for SF19 BD score benchmark adapter boundary; ADR-0109 authored for SF20 BD heritage adapter-over-primitive boundary; ADR-0110 authored for SF21 project health pulse multi-dimension indicator; ADR-0111 authored for health-indicator companion primitive governance; ADR-0112 authored for score-benchmark companion primitive governance; ADR-0113 authored for strategic-intelligence companion primitive governance; ADR-0091–0097 added since PH7.11; ADR-0098 reserved SF09; ADR-0099 reserved SF10; ADR-0100 reserved SF11; ADR-0101 authored SF12; ADR-0102 authored SF13; ADR-0103 authored SF14; ADR-0104 authored SF15; ADR-0105 reserved SF16 -->
| TSConfig path aliases | 64 |
| Vite dev server ports | 14 (3000, 4000–4012) |

---

## 7. Wave 0 Closeout Baseline

**Established:** 2026-03-15
**Scope:** Groups G1–G6 of the Wave 0 buildout plan.

This section records the verified completion state at Wave 0 closeout. It serves as the trusted baseline for Wave 1 planning.

### 7.1 Confirmed Complete (G1–G6)

- **G1 — Contracts and Configuration:** Project hub workspace, viewer groups, department routing, site template specification, Entra ID group model, notification event matrix, config registry, Sites.Selected validation.
- **G2 — Backend Hardening and Workflow Data Foundations:** Saga steps 1–7, compensation chain (incl. G2.3 audit fix), template files, data lists, 5-family list definitions (26 lists), validation module, seeded-file manifest, department library pruning, G2 verification test suite (35 unit tests).
- **G3 — Shared Platform Wiring and Workflow Experience:** Project setup wizard contract, BIC action/ownership contract, clarification re-entry spec, notification registrations (8→15 events), draft key registry and auto-save hooks, complexity gate spec and summary field registry, primitive integration rules and failure modes, cross-contract verification suite.
- **G4 — SPFx Surfaces and Workflow Experience:** Estimating requester guided setup, coordinator visibility/retry, controller queue/review (Accounting), admin oversight/recovery, completion/handoff, complexity application map, responsive/failure catalog, G4 verification test suite.
- **G5 — Hosted PWA Requester Surfaces:** PWA project setup (5-step wizard matching SPFx), project list/request detail, provisioning progress view, offline-queuing via session-state operation executor, PWA parity test suite, error states, Vitest + MSW + Playwright infrastructure.
- **G6 — Admin Support and Observability:** Admin failures inbox, provisioning override permissions (6 granular permissions), retry boundaries, operational dashboards, alert routing (AlertPollingService, monitors), embedded guidance (coaching callouts, runbook), observability probes (Azure Functions, SharePoint), integration audit, T08 verification.
- **SF29 — My Work Feed:** `@hbc/my-work-feed` personal work aggregation feed implemented (ADR-0115); Wave 1 operating-layer primitive powering the Personal Work Hub.

### 7.2 Active but Incomplete

- **SF17 persistence layer:** `AdminAlertsApi`, `ApprovalAuthorityApi`, `InfrastructureProbeApi` are in-memory only — no SharePoint list backing.
- **Teams webhook delivery:** Fire-and-forget pattern with no delivery confirmation.
- **Email relay:** Console-logged only — no live SMTP transport.
- **Deferred monitors (4):** Overdue workflow, stale request, permission anomaly, override expiration.
- **Deferred probes (3):** Search, notification, module-record-health.
- **ErrorLogPage:** Intentional deferral to SF17-T05 — renders `HbcEmptyState` placeholder.

### 7.3 Intentionally Deferred to Wave 1

- SharePoint list persistence for alerts, probes, and approval rules.
- Frontend Application Insights SDK (architecture constraint — backend-only observability in Wave 0).
- Historical trend charts (Wave 0 is current-state only).
- Bulk queue actions (bulk retry, bulk archive).
- Coordinator/requester admin views.
- Live SMTP email relay.
