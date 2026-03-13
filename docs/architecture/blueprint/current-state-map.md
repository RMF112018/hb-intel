# HB Intel — Current-State Architecture Map

**Version:** 1.0
**Status:** Canonical Current-State
**Last Updated:** 2026-03-13
**Purpose:** Single authoritative reference for the present implementation state of the HB Intel monorepo. When this document differs from historical plans or locked blueprints regarding _what exists today_, this document governs present truth.

---

## 1. Source-of-Truth Hierarchy

| Tier | Document | Classification | Update Policy | Governs |
|------|----------|---------------|---------------|---------|
| 1 | This file (`current-state-map.md`) | Canonical Current-State | Living — updated with each structural change | Present implementation truth |
| 2 | [Blueprint V4](./blueprint/HB-Intel-Blueprint-V4.md) | Canonical Normative Plan | Locked — comment-only updates | Target architecture intent |
| 3 | [Foundation Plan](./plans/hb-intel-foundation-plan.md) | Historical Foundational | Locked — comment-only updates | Original implementation instructions |
| 4 | [ADRs](./adr/) (111 active; 6 archived — see §2.2 for resolution record) | Permanent Decision Rationale | Append-only | Individual architectural decisions |
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
| `docs/architecture/adr/` (all files) | **Permanent Decision Rationale** | Exempt from inline banner; 111 active records indexed; 6 archived in `adr/archived/`; conflicts resolved PH7.11 |
| SF01–SF03 plans (completed shared-feature work: bic-next-move, complexity, sharepoint-docs) | **Historical Foundational** | Tier 2 — matrix classification only |
| SF04 shared-feature plans (10 files: `SF04-Acknowledgment.md` through `SF04-T09-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; completed 2026-03-09 |
| `docs/architecture/adr/ADR-0092-acknowledgment-platform-primitive.md` | **Permanent Decision Rationale** | SF04 acknowledgment platform primitive; 10 locked decisions |
| SF05 shared-feature plans (10 files: `SF05-Step-Wizard.md` through `SF05-T09-Deployment.md`) | **Historical Foundational** | Tier 2 — matrix classification only; completed 2026-03-09 |
| SF06 shared-feature plans (10 files: `SF06-Versioned-Record.md` through `SF06-T09-Deployment.md`) | **Canonical Normative Plan** | Tier 2 — matrix classification only; `packages/versioned-record` scaffold created (v0.0.1); ADR-0094; pending PH7.12 sign-off (ADR-0090) before full implementation |
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
| SF16 shared-feature plans (10 files: `SF16-Search.md` through `SF16-T09-Testing-and-Deployment.md`) | **Canonical Normative Plan** | Tier 2 — matrix classification only; `@hbc/search` planning family authored 2026-03-11; ADR-0105 reserved; pending PH7.12 sign-off (ADR-0090) before implementation |
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
| SF22 shared-feature plans (10 files: `SF22-Post-Bid-Learning-Loop.md` through `SF22-T09-Testing-and-Deployment.md`) | **Canonical Normative Plan** | Tier 2 — matrix classification only; `@hbc/post-bid-autopsy` planning family authored 2026-03-12; T01-T05 now cover primitive scaffold/contracts/lifecycle/hooks plus BD/Estimating adapter wizard and summary-card UI surfaces while preserving published learning-signal compatibility |
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
| PH7-RM-* plans (`plans/PH7-RM-*.md`, 9 files) | **Deferred Scope** | Tier 1 banner applied to all 9 files; status must be confirmed before PH7.12 sign-off |
| PH7 root-level plans (deleted from git index) | **Superseded / Archived Reference** | Tier 2 — matrix classification only |
| `ph7-breakout-webparts/` plans | **Canonical Normative Plan** | Tier 2 — matrix classification only |
| `docs/architecture/release/*` (release checklists, sign-off docs) | **Historical Foundational** | Tier 2 — matrix classification only; sealed docs |
| Diátaxis output docs (`docs/tutorials/`, `docs/how-to/`, `docs/reference/`, `docs/explanation/`, `docs/user-guide/`, `docs/administrator-guide/`, `docs/maintenance/`, `docs/troubleshooting/`, `docs/security/`, `docs/release-notes/`, `docs/faq.md`) | **Living Reference (Diátaxis)** | 200+ files; quadrant breakdown: tutorials, how-to, reference, explanation, user-guide, administrator-guide, maintenance, troubleshooting, security, release-notes, faq; updated continuously as features ship; exempt from inline banner |

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

**Transition rule — Deferred Scope:** When a Deferred Scope document's feature or package enters active development in a named phase milestone, reclassify it to Canonical Normative Plan, add it to the active phase's plan index, and update this matrix. The PH7-RM-* plans must be reviewed and reclassified as needed before PH7.12 sign-off.

**ADR rule:** New ADRs are always Permanent Decision Rationale. ADR-0091 through ADR-0097 were assigned after PH7.11. ADR-0098 is reserved for SF09 (data-seeding), ADR-0099 is reserved for SF10 (notification-intelligence), ADR-0100 is reserved for SF11 (smart-empty-state), ADR-0101 is authored for SF12 (session-state), ADR-0102 is authored for SF13 (project-canvas), ADR-0103 is authored for SF14 (related-items), ADR-0104 is authored for SF15 (ai-assist), ADR-0105 is reserved for SF16 (search), ADR-0106 is authored for SF17 (admin-intelligence), ADR-0107 is authored for SF18 (estimating bid-readiness), ADR-0108 is authored for SF19 (bd score benchmark), ADR-0109 is authored for SF20 (bd heritage adapter boundary), ADR-0110 is authored for SF21 (project health pulse), ADR-0111 is authored as companion primitive governance for SF18, ADR-0112 is authored as companion primitive governance for SF19, and ADR-0113 is authored as companion primitive governance for SF20. Next unreserved number: **ADR-0114**.

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

**Post-PH7.11 state (updated 2026-03-12):** 111 ADR files on disk (active), 6 archived in `adr/archived/`. ADR-0091 through ADR-0097 assigned since PH7.11 (phase-7-final-verification, acknowledgment, step-wizard, versioned-record, stub-detection, field-annotations, workflow-handoff). ADR-0098 reserved for SF09 (data-seeding); ADR-0099 reserved for SF10 (notification-intelligence); ADR-0100 reserved for SF11 (smart-empty-state); ADR-0101 authored for SF12 (session-state); ADR-0102 authored for SF13 (project-canvas); ADR-0103 authored for SF14 (related-items); ADR-0104 authored for SF15 (ai-assist); ADR-0105 reserved for SF16 (search); ADR-0106 authored for SF17 (admin-intelligence); ADR-0107 authored for SF18 (estimating bid-readiness); ADR-0108 authored for SF19 (bd score benchmark); ADR-0109 authored for SF20 (bd heritage adapter boundary); ADR-0110 authored for SF21 (project health pulse); ADR-0111 authored as companion primitive governance for SF18; ADR-0112 authored as companion primitive governance for SF19; ADR-0113 authored as companion primitive governance for SF20. Next unreserved number: **ADR-0114**. ADR index in `docs/README.md` and `docs/architecture/adr/README.md` are synchronized.

---

## 3. Authoritative Package & Application Inventory

### Category A: Core Platform Packages (8)

| Package | Name | Primary Responsibility | Dependency Role | Maturity | Doc Entrypoint |
|---------|------|----------------------|-----------------|----------|----------------|
| `packages/models` | @hbc/models | Data types & TypeScript contracts | Foundation — no dependencies | v0.0.1 | `packages/models/README.md` |
| `packages/data-access` | @hbc/data-access | Ports/adapters data layer | Depends on models | v0.0.1 | `packages/data-access/README.md` |
| `packages/query-hooks` | @hbc/query-hooks | TanStack Query React hooks | Depends on data-access, models | v0.0.1 | `packages/query-hooks/README.md` |
| `packages/auth` | @hbc/auth | Dual-mode authentication (MSAL/dev) | Depends on models | v0.0.1 | `packages/auth/README.md` |
| `packages/shell` | @hbc/shell | Global navigation & layout | Depends on auth, models | v0.0.1 | `packages/shell/README.md` |
| `packages/app-shell` | @hbc/app-shell | Shell aggregator (read-only surface) | Depends on shell, auth, ui-kit | v0.0.1 | `packages/app-shell/README.md` |
| `packages/ui-kit` | @hbc/ui-kit | Design system & component library | Depends on auth, complexity, models | v2.1.0 | `packages/ui-kit/DESIGN_SYSTEM.md` |
| `packages/provisioning` | @hbc/provisioning | SignalR provisioning saga | Depends on auth, models | v0.1.0 | `packages/provisioning/README.md` |

### Category B: Shared Infrastructure (2)

| Package | Name | Primary Responsibility | Dependency Role | Maturity | Doc Entrypoint |
|---------|------|----------------------|-----------------|----------|----------------|
| `packages/spfx` | @hbc/spfx | SPFx webpart scaffolding & utilities | Depends on auth, sharepoint-docs, ui-kit | v0.0.1 | `packages/spfx/README.md` |
| `packages/eslint-plugin-hbc` | @hb-intel/eslint-plugin-hbc | Component consumption lint rules | None (standalone tool) | v1.0.0 | `packages/eslint-plugin-hbc/README.md` |

### Category C: Shared-Feature Primitives (13)

These packages are **Tier-1 Platform Primitives** — mandatory-use when their concern area is present in a feature. See [Platform Primitives Registry](../../reference/platform-primitives.md) for policy, decision tree, adoption matrix, and non-duplication rule. <!-- PH7.4: elevated from optional to Tier-1 per §7.4.1 -->

The original three (SF01–SF03) emerged organically; SF04–SF15 are planned primitives being built in sequence. SF04, SF05, SF07, SF08, SF10, SF11, SF12, SF13, SF14, SF15 are fully implemented. SF06, SF09 are scaffold stage.

| Package | Name | Primary Responsibility | Dependency Role | Maturity | Doc Entrypoint |
|---------|------|----------------------|-----------------|----------|----------------|
| `packages/bic-next-move` | @hbc/bic-next-move | Ball-in-court & ownership primitives | Depends on ui-kit | v0.1.0 | `packages/bic-next-move/README.md` |
| `packages/complexity` | @hbc/complexity | 3-tier density context (Complexity Dial) | Depends on ui-kit | v0.1.0 | `packages/complexity/README.md` |
| `packages/sharepoint-docs` | @hbc/sharepoint-docs | Document lifecycle management | Depends on auth, models, data-access, ui-kit | v0.1.0 | `packages/sharepoint-docs/README.md` |
| `packages/acknowledgment` | @hbc/acknowledgment | Reusable acknowledgment / sign-off primitive | Depends on ui-kit, complexity | v0.1.0 | `packages/acknowledgment/README.md` |
| `packages/step-wizard` | @hbc/step-wizard | Multi-step guided workflow primitive | Depends on ui-kit, complexity | v0.1.0 | `packages/step-wizard/README.md` |
| `packages/versioned-record` | @hbc/versioned-record | Immutable versioned record management | Depends on models, data-access, ui-kit | v0.0.1 | `packages/versioned-record/README.md` |
| `packages/field-annotations` | @hbc/field-annotations | Inline field-level annotation and comment threads | Depends on auth, models, ui-kit | v0.1.0 | `packages/field-annotations/README.md` |
| `packages/workflow-handoff` | @hbc/workflow-handoff | Cross-module workflow handoff and routing | Depends on models, ui-kit, bic-next-move | v0.1.0 | `packages/workflow-handoff/README.md` |
| `packages/data-seeding` | @hbc/data-seeding | Development / demo data seeding primitives | Depends on models, data-access | v0.0.1 | `packages/data-seeding/README.md` |
| `packages/session-state` | @hbc/session-state | Offline-safe session persistence & sync | Depends on idb (runtime); peer: react | v0.0.1 | `packages/session-state/README.md` |
| `packages/project-canvas` | @hbc/project-canvas | Role-based configurable project dashboard canvas | Depends on ui-kit, complexity, @dnd-kit/core; peer: react | v0.0.1 | `packages/project-canvas/README.md` |
| `packages/post-bid-autopsy` | @hbc/post-bid-autopsy | Tier-1 post-bid autopsy primitive for evidence, confidence, taxonomy, governance, publication, telemetry, lifecycle/storage orchestration, hook-state surfaces, and published learning-signal contracts consumed by BD and Estimating adapters | Depends on `versioned-record`, `bic-next-move`, `score-benchmark`, `strategic-intelligence`, `@tanstack/react-query`; peer: react | v0.0.1 | `packages/post-bid-autopsy/README.md` |
| `packages/strategic-intelligence` | @hbc/strategic-intelligence | Heritage snapshot and living strategic intelligence primitive contracts with trust/workflow/governance ownership seams | None (contract-first primitive scaffold) | v0.0.1 | `packages/strategic-intelligence/README.md` |

### Category D: Feature Packages (11)

All feature packages are at v0.0.0 (scaffold stage), export source directly (`main: "./src/index.ts"`), and share the same core dependency set: `@hbc/{models, query-hooks, ui-kit, auth, shell}`.

| Package | Name | Domain |
|---------|------|--------|
| `packages/features/accounting` | @hbc/features-accounting | Accounting |
| `packages/features/estimating` | @hbc/features-estimating | Estimating |
| `packages/features/project-hub` | @hbc/features-project-hub | Project Hub |
| `packages/features/leadership` | @hbc/features-leadership | Leadership |
| `packages/features/business-development` | @hbc/features-business-development | Business Development |
| `packages/features/admin` | @hbc/features-admin | Admin |
| `packages/features/safety` | @hbc/features-safety | Safety |
| `packages/features/quality-control-warranty` | @hbc/features-quality-control-warranty | Quality Control & Warranty |
| `packages/features/risk-management` | @hbc/features-risk-management | Risk Management |
| `packages/features/operational-excellence` | @hbc/features-operational-excellence | Operational Excellence |
| `packages/features/human-resources` | @hbc/features-human-resources | Human Resources |

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
- **@hbc/versioned-record** (SF06) — Immutable versioned record management; v0.0.1 scaffold.
- **@hbc/field-annotations** (SF07) — Inline field-level annotation and comment threads; v0.1.0 complete.
- **@hbc/workflow-handoff** (SF08) — Cross-module workflow handoff and routing; v0.1.0 complete.
- **@hbc/data-seeding** (SF09) — Development / demo data seeding primitives; v0.0.1 scaffold.

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

---

## 5. How to Read This Repo

**Where is current truth?**
This file + package READMEs + the codebase itself. For any question about what exists _right now_, start here.

**Where are locked decisions?**
[Blueprint V4](./blueprint/HB-Intel-Blueprint-V4.md) (target architecture), [Foundation Plan](./plans/hb-intel-foundation-plan.md) (original implementation instructions), and the [ADR catalog](./adr/) (91 active decisions). These are append-only or comment-only.

**How do I distinguish current implementation from future plans?**
Use the Classification Matrix in Section 2. Documents labeled **Canonical Current-State** describe what exists. Documents labeled **Canonical Normative Plan** describe what should be built next. **Historical Foundational** documents describe what was planned originally and may have evolved.

**Which shared-feature packages are mandatory?**
As of PH7.4, all Category C packages are **Tier-1 Platform Primitives** — mandatory when their concern area is present in a feature. The original three (`@hbc/bic-next-move`, `@hbc/complexity`, `@hbc/sharepoint-docs`) plus six SF04–SF09 primitives (`@hbc/acknowledgment`, `@hbc/step-wizard`, `@hbc/versioned-record`, `@hbc/field-annotations`, `@hbc/workflow-handoff`, `@hbc/data-seeding`). See the [Platform Primitives Registry](../../reference/platform-primitives.md) for the decision tree and adoption matrix. Core platform packages (Category A) remain the mandatory foundation for all features. <!-- PH7.4: updated from "none mandatory" to Tier-1 policy; SF04–SF09 primitives added 2026-03-10 -->

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
| Shared-feature primitives | 13 |
| Feature packages | 11 |
| SPFx applications | 11 |
| Standalone applications | 3 |
| Backend services | 1 |
| Build tooling packages | 1 |
| **Total workspace members** | **50** |
| Architecture Decision Records | 111 active + 6 archived | <!-- Updated 2026-03-12: ADR-0106 authored for SF17 admin-intelligence; ADR-0107 authored for SF18 estimating adapter-over-primitive; ADR-0108 authored for SF19 BD score benchmark adapter boundary; ADR-0109 authored for SF20 BD heritage adapter-over-primitive boundary; ADR-0110 authored for SF21 project health pulse multi-dimension indicator; ADR-0111 authored for health-indicator companion primitive governance; ADR-0112 authored for score-benchmark companion primitive governance; ADR-0113 authored for strategic-intelligence companion primitive governance; ADR-0091–0097 added since PH7.11; ADR-0098 reserved SF09; ADR-0099 reserved SF10; ADR-0100 reserved SF11; ADR-0101 authored SF12; ADR-0102 authored SF13; ADR-0103 authored SF14; ADR-0104 authored SF15; ADR-0105 reserved SF16 -->
| TSConfig path aliases | 64 |
| Vite dev server ports | 14 (3000, 4000–4012) |
