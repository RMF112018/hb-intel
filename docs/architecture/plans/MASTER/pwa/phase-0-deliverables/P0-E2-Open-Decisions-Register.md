# P0-E2 — Open Decisions and Idea-Curation Register

**Document ID:** P0-E2
**Workstream:** E — Phase 1 Entry Definition
**Milestone:** M0.5
**Deliverable:** Open Decisions and Idea-Curation Register
**Status:** Complete — All blockers resolved; non-blockers deferred with owners and Phase N targets
**Date:** 2026-03-16
**Governing Plan:** docs/architecture/plans/MASTER/01_Phase-0_Program-Control-and-Repo-Truth-Plan.md

---

## 1. Purpose

This register consolidates all unresolved questions, pending decisions, and deferred implementation ideas discovered during Phase 0 execution. It prevents these items from becoming hallway assumptions and ensures each decision has a named owner, explicit deadline, and clear status.

The register serves three audiences:
- **Program leadership:** Phase 0 exit gate and Phase 1 entry scope dependencies
- **Architecture leads:** Design decisions and data-plane commitments
- **Team leads:** Implementation constraints and CI/CD policy pending approval

---

## 2. How to Use This Register

### Decision Lifecycle

Each item progresses through states:

- **OPEN:** No decision made; pending discussion, analysis, or approval
- **IN-REVIEW:** Active discussion or analysis underway; preliminary options documented
- **PARTIALLY RESOLVED:** Some clarity achieved; dependent questions remain
- **RESOLVED:** Decision made and approved; closure items may remain (e.g., formal signoff)
- **CLOSED:** Decision executed; all follow-up actions complete

### Adding New Items

1. Use the next sequential ID in the relevant category (OD-nnn for decisions, IDEA-nnn for ideas)
2. Complete all required fields: Question, Current State, Options, Owner, Deadline, Status
3. Add a one-line entry to the Summary Table (§3)
4. Add the full detailed entry in the appropriate category section (§4)
5. Note whether the item is a Phase 0 exit gate blocker (§5)

### Closing Decisions

- Program architecture lead closes OD items affecting architecture or package scope
- Release/governance lead closes OD items affecting CI/CD or release policy
- Product owner closes OD items affecting Phase 1 feature scope
- Team lead or package owner closes OD items affecting a specific team

---

## 3. Summary Table

| ID | Title | Category | Priority | Owner | Deadline | Status |
|---|---|---|---|---|---|---|
| OD-001 | Maturity label adoption | Phase 0 Plan | HIGH | Arch Lead | Phase 0 Exit | RESOLVED |
| OD-002 | Production-ready vs pilot-ready qualification | Phase 0 Plan | HIGH | Arch Lead + Product | Phase 0 Exit | RESOLVED |
| OD-003 | Demo artifact isolation strategy | Phase 0 Plan | MEDIUM | DevSecOps | Phase 1 Start | RESOLVED |
| OD-004 | Exception-handling strictness threshold | Phase 0 Plan | MEDIUM | Arch Lead | Phase 0 Exit | DEFERRED (Phase 1) |
| OD-005 | Documentation sync completion criteria | Phase 0 Plan | HIGH | Arch Lead | Phase 0 Exit | RESOLVED |
| OD-006 | PH7-RM-* reclassification decision | Divergence Log | MEDIUM | Delivery Lead | Phase 1 Scope | RESOLVED |
| OD-007 | SF16 & SF22 T08–T09 Phase 1 scope | Divergence Log | HIGH | Product Owner | Phase 0 Exit | RESOLVED |
| OD-008 | Feature-Phase-Mapping-Recommendation.md archive | Divergence Log | LOW | Arch Lead | Phase 1 Housekeeping | RESOLVED |
| OD-009 | promote-ideas.yml implementation | CI/CD & Release | MEDIUM | Platform/Core Services | Phase 1 Planning | DEFERRED (Phase 1) |
| OD-010 | App-level coverage threshold policy | CI/CD & Release | MEDIUM | DevSecOps | Phase 1 CI Config | DEFERRED (Phase 1) |
| OD-011 | SPFx production deploy automation | CI/CD & Release | HIGH | DevSecOps + Platform | Phase 1 Release SOP | DEFERRED (Phase 1) |
| OD-012 | Staging soak period requirement | CI/CD & Release | MEDIUM | Release/Gov Lead | Phase 1 First Release | DEFERRED (Phase 1) |
| OD-013 | Phase 1 production adapter target domains | Architecture | HIGH | Product Owner + Arch | Phase 0 Exit | RESOLVED |
| OD-014 | Source-of-record mapping per domain | Architecture | HIGH | Product Owner + Arch | Phase 1 Start | RESOLVED |
| OD-015 | @hbc/data-access production readiness | Architecture | HIGH | Platform/Core Services | Phase 1 Start | RESOLVED |
| OD-016 | @hbc/versioned-record and @hbc/strategic-intelligence upgrade timeline | Architecture | HIGH | Arch Lead + Owners | Phase 1 Start | DEFERRED (Phase 7) |
| IDEA-001 | Automated maturity badge generation | Ideas | LOW | Platform Team | Phase 2 | CURATED |
| IDEA-002 | ADR dependency graph | Ideas | LOW | Arch Lead | Phase 2 | CURATED |
| IDEA-003 | Readiness matrix CI enforcement | Ideas | MEDIUM | DevSecOps | Phase 1 or 2 | CURATED |
| IDEA-004 | Phase 1 readiness dashboard | Ideas | LOW | Platform/Core Services | Phase 2 | CURATED |

---

## 4. Detailed Decision Entries

### 4.1 Phase 0 Plan Required Decisions

#### OD-001: Maturity label adoption

**Question:** What exact maturity labels will be used across the program?

**Current State:** RESOLVED by P0-B1

**Resolution:** Six maturity labels adopted and defined with rubric:
- production-ready
- pilot-ready
- usable-but-incomplete
- scaffold-only
- blocked
- excluded-from-production-path

Complete definitions and evaluation criteria documented in P0-B1.

**Action Needed:** Formal program-level approval of the P0-B1 rubric vocabulary (GOV-02 in P0-E1)

**Owner:** Program architecture lead

**Deadline:** Phase 0 exit gate

**Status:** RESOLVED; pending formal signoff

---

#### OD-002: Production-ready vs pilot-ready qualification

**Question:** What qualifies an app/package as "production-ready" versus "pilot-ready"?

**Resolution:** P0-B1 rubric formally adopted (GOV-02, 2026-03-16):
- **Production-ready:** Real adapters in place, full CI coverage (90%+ lines), security review complete, documented recovery procedures
- **Pilot-ready:** Real adapters planned or begun, CI coverage exists (core path), not yet cleared for multi-tenant operations

Distinction is part of the 6-label maturity vocabulary. All 57 workspace members classified. Rubric approved by Delivery/Program Lead and Architecture Lead.

**Owner:** Program architecture lead + Product owner

**Deadline:** Phase 0 exit gate

**Status:** ✅ RESOLVED (2026-03-16)

---

#### OD-003: Demo-oriented artifact isolation strategy

**Question:** Which demo-oriented artifacts remain in the repo and how are they clearly isolated from production-path artifacts?

**Resolution:**
- `apps/dev-harness` classified as `excluded-from-production-path` in P0-B1
- `@hbc/data-seeding` classified as `excluded-from-production-path` in P0-B1
- Production-path restrictions (G-04 §4.1) in P0-C1 permanently exclude both from production flows
- ESLint rule `@hb-intel/hbc/no-stub-implementations` (ADR-0095) enforces stub detection in CI
- P0-B1 classifies all 57 workspace members — package-internal demo content governed by G-04 stub detection

**Owner:** DevSecOps/Enterprise Enablement

**Deadline:** Phase 1 start

**Status:** ✅ RESOLVED (2026-03-16)

---

#### OD-004: Exception-handling strictness threshold

**Question:** How strict should exception handling be for teams that want to move faster than the platform baseline?

**Resolution so far:** G-07 (Exception-Handling Process) in P0-C1 provides the procedural framework:
- Written exception request, business justification, risk assessment, time-limited approval, mandatory resolution plan
- Authorized by: Program architecture lead + Release/governance lead

**Deferred to Phase 1:** Explicit denial criteria and strictness thresholds (e.g., "exceptions may not be granted to production-path adapters below usable-but-incomplete status") will be defined based on Phase 1 team velocity experience. The procedural framework is sufficient for Phase 0 exit; refinement is a Phase 1 governance calibration activity.

**Owner:** Program architecture lead

**Deadline:** Phase 1 mid-point governance review

**Status:** DEFERRED (Phase 1) — procedural framework in place; threshold refinement deferred

---

#### OD-005: Documentation synchronization completion criteria

**Question:** How much documentation synchronization is required to declare repo truth reconciled?

**Resolution:**
- P0-A1 established the 7-tier source hierarchy and reconciliation memo
- M0.1 satisfied: D-004 resolved (ADR errata corrected), D-005 resolved (Wave 0 plan approved)
- D-008 resolved (Feature-Phase-Mapping-Recommendation.md superseded banner applied 2026-03-14)
- All 10 divergence items in P0-A2 triaged and resolved or assigned to future phases
- Phase 0 deliverables package (P0-A1 through P0-E2) complete and accepted (GOV-03)
- Repo truth is sufficiently reconciled for Phase 1 entry

**Owner:** Program architecture lead

**Deadline:** Phase 0 exit gate

**Status:** ✅ RESOLVED (2026-03-16)

---

### 4.2 Divergence Log Decisions

#### OD-006: PH7-RM-* Deferred Scope plans reclassification

**Question:** Nine Review Mode plans (PH7-RM-1 through PH7-RM-9) are classified as "Deferred Scope." Must they be reclassified to active canonical plans before Phase 1, or formally archived?

**Files Affected:** `docs/architecture/plans/PH7-RM-1.md` through `PH7-RM-9.md`

**Options:**
- (a) Assign each to a named phase milestone and reclassify as Canonical Normative Plan
- (b) Archive formally under `docs/architecture/plans/_archive/`
- (c) Defer decision to Phase 1 scope-setting session

**Owner:** Delivery/program lead

**Deadline:** Phase 1 scope entry review

**Status:** ✅ RESOLVED (2026-03-16)

**Approved Decision:** Option (a) — Assign PH7-RM-1 through PH7-RM-9 to **Phase 3 — Project Hub and Project Context**. Explicitly excluded from Phase 1 and Phase 2. Plans remain classified as "Deferred Scope" until formal Phase 3 kickoff approval, at which point they will be reclassified to "Canonical Normative Plan." Decision approved by Product Owner, Delivery Lead, and Architecture Owner.

---

#### OD-007: SF16 Search and SF22 T08–T09 Phase 1 scope decision

**Question:** Does `@hbc/search` (SF16, ADR-0105 reserved, Azure Cognitive Search) and `@hbc/post-bid-autopsy` T08–T09 enter Phase 1 scope or remain deferred?

**Current State:**
- SF16 plans marked Canonical Normative Plan but not in active development
- SF22 T01–T07 complete; T08–T09 unbuilt

**Options:**
- (a) Include in Phase 1 with explicit milestones
- (b) Formally defer to Phase 2
- (c) Mark SF16 as deferred scope and SF22 T08–T09 as Phase 1 tail work

**Owner:** Product owner

**Deadline:** Phase 0 exit gate (affects Phase 1 scope definition)

**Status:** ✅ RESOLVED (2026-03-16)

**Approved Decision:** SF16 (`@hbc/search`) excluded from Phase 1 and assigned to **Phase 5 — Search, Connected Records, and Document Access**. SF22 T08–T09 (`@hbc/post-bid-autopsy`) excluded from Phase 1 and assigned to **Phase 7 — HBI Intelligence, Production Hardening, and Rollout**. Activation of SF22 T08–T09 remains gated on `@hbc/strategic-intelligence` reaching at least `usable-but-incomplete` status, or by redesign that removes that dependency. Decision approved by Product Owner with Architecture Owner concurrence.

---

#### OD-008: Feature-Phase-Mapping-Recommendation.md archive decision

**Question:** Should `docs/architecture/plans/HB-Intel-Feature-Phase-Mapping-Recommendation.md` be archived or deleted?

**Current State:** Superseded by the full MASTER plan set; not classified in current-state-map.md; may cause confusion if treated as active

**Options:**
- (a) Add classification banner marking as superseded
- (b) Move to `docs/architecture/plans/_archive/`
- (c) Delete after extracting any still-relevant content

**Owner:** Program architecture lead

**Deadline:** Phase 1 documentation housekeeping (low priority; does not block Phase 1)

**Resolution:** Option (a) applied — "Superseded / Archived Reference" classification banner added to `HB-Intel-Feature-Phase-Mapping-Recommendation.md` (2026-03-14). Document remains in place as historical reference. No further action required.

**Status:** ✅ RESOLVED (2026-03-14)

---

### 4.3 CI/CD and Release Control Decisions

#### OD-009: promote-ideas.yml implementation decision

**Question:** Should `scripts/promote-ideas.mjs` be implemented to enable automatic idea promotion from ideation to active plans, or should this workflow remain manual?

**Current State:**
- `.github/workflows/promote-ideas.yml` exists but is disabled (`if: false`)
- `scripts/promote-ideas.mjs` does not exist

**Options:**
- (a) Implement scripts/promote-ideas.mjs and enable workflow in Phase 1
- (b) Define manual promotion process in dev runbook and remove the disabled workflow
- (c) Defer to later phase

**Owner:** Platform/Core Services team

**Deadline:** Phase 1 planning (not a blocker)

**Status:** DEFERRED (Phase 1) — Workflow remains disabled. Manual promotion process is acceptable for Phase 1. Implementation decision deferred to Phase 1 tooling sprint.

---

#### OD-010: App-level coverage threshold policy

**Question:** Should app-level tests (spfx-admin, spfx-estimating, spfx-accounting, pwa) have percentage coverage thresholds, or should zero-failure (all tests pass) remain the only requirement?

**Current State:**
- Platform packages enforce 90–95% thresholds
- Apps have zero-failure only

**Options:**
- (a) Add 80% line/function/statement threshold for apps
- (b) Leave zero-failure as the app-level standard
- (c) Differentiate by app maturity

**Owner:** DevSecOps/Enterprise Enablement

**Deadline:** Phase 1 CI configuration (not a Phase 0 exit blocker)

**Status:** DEFERRED (Phase 1) — Zero-failure model is adequate for Phase 0 exit. Coverage threshold policy to be defined during Phase 1 CI calibration.

---

#### OD-011: SPFx production deploy automation

**Question:** Should SPFx production deployment be automated on v* tags (matching PWA and Functions behavior), or remain manual-dispatch only?

**Current State:**
- SPFx staging auto-deploys after successful build
- Production requires manual dispatch of spfx-deploy.yml

**Options:**
- (a) Add SPFx production deploy to release.yml on v* tag
- (b) Keep manual as a deliberate safety gate for SharePoint App Catalog
- (c) Automate with additional approval step

**Owner:** DevSecOps/Enterprise Enablement + Platform lead

**Deadline:** Phase 1 release SOP definition

**Status:** DEFERRED (Phase 1) — Manual dispatch is adequate as a deliberate safety gate for Phase 0/1. Automation decision deferred to Phase 1 release SOP definition.

---

#### OD-012: Staging soak period requirement

**Question:** Should a mandatory 48-hour staging soak be required before production releases, or should it remain advisory?

**Current State:** P0-D1 recommends 48-hour soak but does not enforce it

**Options:**
- (a) Enforce via time-gate in release.yml (block v* tag for 48h after staging deploy)
- (b) Codify as a checklist item in release-verification-checklist.md with manual sign-off
- (c) Leave as advisory best practice

**Owner:** Release/governance lead

**Deadline:** Phase 1 first release (pre-v1.0.0)

**Status:** DEFERRED (Phase 1) — Advisory 48-hour soak documented in P0-D1. Enforcement mechanism deferred to Phase 1 first release preparation.

---

### 4.4 Architecture and Data-Plane Decisions

#### OD-013: Phase 1 production adapter target domains

**Question:** Which specific domains will receive production SharePoint adapters in Phase 1 (replacing stub adapters per ADR-0002)?

**Current State:** All domain feature packages use stub adapters. ADR-0002 (ports/adapters) requires production adapters for any production deployment. No specific domains yet committed.

**Options:** Must be explicitly decided as part of Phase 1 scope — no "all domains" default acceptable given resource constraints.

**Owner:** Product owner + Architecture lead

**Deadline:** Phase 0 exit gate (Phase 1 scope blocker)

**Resolution:** All Phase 1 target domains defined in P1-A2 Source-of-Record Register (2026-03-16). Covers 11 primary domains + 3 operational domains with source-of-record, adapter path, identity key strategy, write safety class, and phase availability. Approved by Product Owner and Architecture Lead.

**Status:** ✅ RESOLVED (2026-03-16)

---

#### OD-014: Source-of-record mapping per domain

**Question:** For each Phase 1 target domain, which SharePoint list or library is the authoritative source of record?

**Current State:** No domain has a confirmed source-of-record mapping documented. Adapters cannot be built without this clarity.

**Options:** Document-by-document discovery required; must be completed before adapter implementation begins.

**Owner:** Product owner (business authority) + Architecture lead (technical mapping)

**Deadline:** Phase 1 start (before any adapter implementation begins)

**Resolution:** P1-A2 Source-of-Record Register (2026-03-16) documents source-of-record mappings for all 11 primary domains and 3 operational domains. Each entry specifies SharePoint list/library, Azure Table Storage, or Microsoft Graph source with adapter path and identity key strategy.

**Status:** ✅ RESOLVED (2026-03-16)

---

#### OD-015: @hbc/data-access production contract confirmation

**Question:** Is `@hbc/data-access` (Category B, usable-but-incomplete) ready to serve as the data-plane foundation for Phase 1 adapter work?

**Current State:** Package is usable-but-incomplete. Phase 1 will depend on it for adapter pattern implementation.

**Options:**
- (a) Confirm current contract as stable enough for Phase 1 adapter work to begin
- (b) Require upgrade to pilot-ready before Phase 1 adapters are built on it
- (c) Document known gaps and proceed with explicit risk acknowledgment

**Owner:** Platform/Core Services team

**Deadline:** Phase 1 start

**Resolution:** Option (a) confirmed — `@hbc/data-access` production contract documented in README (2026-03-16). Version bumped to 0.1.0. Public API surface, breaking change policy, versioning strategy, and coverage requirements specified. Contract approved by Architecture Lead. Package confirmed as data-plane foundation for Phase 1 adapter work per ADR-0002.

**Status:** ✅ RESOLVED (2026-03-16)

---

#### OD-016: @hbc/versioned-record and @hbc/strategic-intelligence production path

**Question:** When will these scaffold-only packages be upgraded to usable-but-incomplete, unblocking @hbc/post-bid-autopsy, @hbc/score-benchmark, and @hbc/ai-assist?

**Current State:**
- Both at v0.0.1 scaffold-only
- Their dependents have production-facing Phase 1 plans
- Also flagged as BLOCKER-03 in P0-E1

**Note:** Dependents explicitly deferred from Phase 1 scope per D-010 Option B.

**Owner:** Architecture lead + package owners

**Deadline:** Phase 7 (per OD-007 — SF22 T08–T09 assigned to Phase 7)

**Resolution:** Dependents (`@hbc/post-bid-autopsy`, `@hbc/score-benchmark`, `@hbc/ai-assist`) deferred from Phase 1 per D-010 Option B (2026-03-16). `@hbc/versioned-record` upgraded to `usable-but-incomplete` during Phase 0 research. `@hbc/strategic-intelligence` remains `scaffold-only`; upgrade gated on Phase 7 activation of SF22 T08–T09 (OD-007). Upgrade timeline tracked as Phase 7 dependency.

**Status:** DEFERRED (Phase 7)

---

### 4.5 Idea Curation Items

#### IDEA-001: Automated maturity badge generation

**Idea:** Automatically generate readiness badges from P0-B1 data into package READMEs or a generated status page

**Value:** Keeps maturity status visible to developers without manual updates; reduces documentation drift

**Current Priority:** Low — useful but not blocking Phase 1 delivery

**Owner:** Platform team to evaluate

**Target Phase:** Phase 2 or tooling sprint

**Status:** CURATED

---

#### IDEA-002: ADR dependency graph

**Idea:** Generate a visual dependency graph of ADR relationships (which ADRs supersede, require, or extend others)

**Value:** Repository currently has 114 ADRs with complex cross-references. A graph would aid navigation and reveal orphaned or circular dependencies.

**Current Priority:** Low — documentation quality enhancement

**Owner:** Program architecture lead to evaluate

**Target Phase:** Phase 2 documentation sprint

**Status:** CURATED

---

#### IDEA-003: Readiness matrix CI enforcement

**Idea:** Automated CI gate that prevents deploying packages classified as scaffold-only or excluded-from-production-path from entering production-facing import chains

**Value:** Enforces P0-B1 maturity classifications at the code level rather than governance-only; prevents future violations

**Current Priority:** Medium — would strengthen production safety policy

**Owner:** DevSecOps/Enterprise Enablement to evaluate

**Target Phase:** Phase 1 or Phase 2 CI enhancement

**Status:** CURATED

---

#### IDEA-004: Phase 1 readiness dashboard

**Idea:** A live dashboard (potentially built in apps/dev-harness or as a GitHub Pages site) showing real-time status of Phase 1 entry gates

**Value:** Makes phase gate progress visible to all stakeholders without reading documents; improves transparency

**Current Priority:** Low — nice-to-have; could become a communication tool for sponsors

**Owner:** Platform/Core Services to evaluate

**Target Phase:** Phase 2

**Status:** CURATED

---

## 5. Phase 0 Exit Gate Requirements

All Phase 0 exit gate decisions have been resolved or formally deferred:

| ID | Title | Status | Resolution Date |
|---|---|---|---|
| OD-002 | Production-ready vs pilot-ready qualification | ✅ RESOLVED | 2026-03-16 |
| OD-004 | Exception-handling strictness threshold | DEFERRED (Phase 1) | 2026-03-16 |
| OD-005 | Documentation sync completion criteria | ✅ RESOLVED | 2026-03-16 |
| OD-007 | SF16 & SF22 T08–T09 Phase 1 scope decision | ✅ RESOLVED | 2026-03-16 |
| OD-013 | Phase 1 production adapter target domains | ✅ RESOLVED | 2026-03-16 |

OD-004 deferred to Phase 1 with procedural framework (G-07) in place. All other Phase 0 exit blockers fully resolved. Non-blocking items (OD-009 through OD-012) deferred to Phase 1 with named owners and target milestones. Curated ideas (IDEA-001 through IDEA-004) retained for Phase 2 evaluation.

---

## 6. Related Documents

- **Governing Plan:** docs/architecture/plans/MASTER/01_Phase-0_Program-Control-and-Repo-Truth-Plan.md
- **Maturity Definitions:** docs/architecture/plans/MASTER/phase-0-deliverables/P0-B1-Readiness-Matrix.md
- **Governance Policy:** docs/architecture/plans/MASTER/phase-0-deliverables/P0-C1-Production-Path-Governance.md
- **CI/CD & Release:** docs/architecture/plans/MASTER/phase-0-deliverables/P0-D1-CI-CD-and-Release-Strategy.md
- **Phase 1 Entry Criteria:** docs/architecture/plans/MASTER/phase-0-deliverables/P0-E1-Phase-1-Entry-Criteria.md
- **Current State Map:** docs/architecture/blueprint/current-state-map.md
- **Package Relationship Map:** docs/architecture/blueprint/package-relationship-map.md
- **ADR-0002 (Ports/Adapters):** docs/architecture/adr/ADR-0002-Ports-Adapters.md
