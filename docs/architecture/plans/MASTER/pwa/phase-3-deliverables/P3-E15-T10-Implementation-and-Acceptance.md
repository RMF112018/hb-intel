# P3-E15-T10 — Implementation and Acceptance

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E15-T10 |
| **Parent** | [P3-E15 QC Module Field Specification](P3-E15-QC-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T10 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Pre-Implementation: Hard No-Go Conditions

Do not write QC application code until the hard blockers below are confirmed available. These are not workaround-able without violating architecture invariants or breaking the shared publication model.

| Shared dependency / contract | Blocker level | Verification required before Stage 3 |
|---|---|---|
| `@hbc/versioned-record` | **Hard blocker** | QC records, snapshots, revision history, and drift/update notices can be versioned and frozen correctly |
| `@hbc/record-form` | **Hard blocker** | Supports QC record families and controlled form composition for plan, issue, exception, advisory, and evidence records |
| `@hbc/saved-views` | **Hard blocker** | Supports QC worklists, scorecard drilldowns, advisory queues, and organization rollups |
| `@hbc/my-work-feed` | **Hard blocker** | Accepts QC as a source module and the normalized publication model already locked in T05 |
| `@hbc/related-items` | **Hard blocker** | Can register QC relationships and preserve handoff lineage across modules |
| `@hbc/project-canvas` | **Hard blocker** | Can surface QC baseline-visible readiness, health posture, and update notices in Project Hub |
| `@hbc/notification-intelligence` | **Hard blocker** for production readiness | Supports escalations, update notices, drift alerts, and management-visible signal routing |
| `@hbc/sharepoint-docs` | **Hard blocker** for advisory/document references | Supports governed link/reference handling without making QC a file subsystem |
| [P3-D2-Project-Health-Contract.md](P3-D2-Project-Health-Contract.md) | **Hard blocker** | QC quality health contribution model can publish without diverging from health-spine doctrine |
| [P3-D3-Project-Work-Queue-Contract.md](P3-D3-Project-Work-Queue-Contract.md) | **Hard blocker** | QC work publication remains normalized and shared-contract-compliant |
| [P3-D4-Related-Items-Registry-Presentation-Contract.md](P3-D4-Related-Items-Registry-Presentation-Contract.md) | **Hard blocker** | Handoff and drillback relationships can be registered without local shadow linkage |

**If any hard blocker is unavailable:** stop and raise the blocker. Do not create local substitutes.

---

## 2. Shared-First Requirement

QC must compose shared packages and shared contracts rather than inventing local replacements.

| Concern | Must use | Must not do |
|---|---|---|
| Audit history and immutable snapshoting | `@hbc/versioned-record` | local history tables |
| Forms and validation surfaces | `@hbc/record-form` | module-local form framework |
| Worklists and drilldown lists | `@hbc/saved-views` | feature-local filter state only |
| Normalized work publication | `@hbc/my-work-feed` | local work queue |
| Cross-record navigation and handoff lineage | `@hbc/related-items` | ad hoc local link registry |
| Project Hub tile/canvas surfaces | `@hbc/project-canvas` | custom detached dashboard surface |
| Alerts, update notices, drift nudges | `@hbc/notification-intelligence` | custom notification routing |
| Document references | `@hbc/sharepoint-docs` | QC-owned file/document subsystem |

---

## 3. Implementation Sequence

Stages are sequential and stage-gated. Stage N must pass its gate before Stage N+1 begins.

```text
Stage 1 — Governance and record contracts
    ↓
Stage 2 — Plans, reviews, and soft gates
    ↓
Stage 3 — Issues, corrective actions, deviations, evidence, and approvals
    ↓
Stage 4 — Submittal advisory and inventory/currentness
    ↓
Stage 5 — Health, scorecards, root cause, and responsible-org rollups
    ↓
Stage 6 — Schedule awareness and handoff seams
    ↓
Stage 7 — Cross-module publication, validation, and release readiness
```

### Stage 1 — Governance and Record Contracts

**Implements:** T01–T03 authority model, record families, identifiers, versioning, role matrix, governed-core versus project-extension contract.

**Gate check:**
- all record contracts from T03 compile and are placeable in the correct feature/shared package boundaries,
- governance owner, publisher, candidate-author, verifier, and project-role matrices are enforceable,
- `ProjectQcSnapshot` and `GovernedUpdateNotice` exist as immutable/versioned contracts,
- no feature-local substitutes exist for locked shared packages.

### Stage 2 — Plans, Reviews, and Soft Gates

**Implements:** T04 operating model.

**Gate check:**
- `WorkPackageQualityPlan` and `PreconstructionReviewPackage` support governed coverage, high-risk additions, and control-gate families,
- soft-gate statuses are deterministic and do not imply hard schedule or field-stop ownership,
- review findings preserve lineage and can spawn downstream issue refs,
- preliminary/package-dependent activation posture is enforced correctly.

### Stage 3 — Issues, Corrective Actions, Deviations, Evidence, and Approvals

**Implements:** T05 and T06 operating model.

**Gate check:**
- `QcIssue` and `CorrectiveAction` remain the authoritative QC ledger,
- My Work publication follows the normalized T05 contract exactly,
- deviations, evidence references, and external approval dependencies are first-class and auditable,
- verifier-close and centrally governed verifier eligibility are enforced,
- root-cause qualification hooks are active for qualifying cases.

### Stage 4 — Submittal Advisory and Inventory / Currentness

**Implements:** T07 operating model.

**Gate check:**
- `SubmittalItemRecord` requires spec anchoring and package reference,
- inventory rows remain non-authoritative until owner confirmation,
- currentness checks use manufacturer/official publisher sources only,
- `unable-to-verify` forces manual review,
- package-dependent activation occurs only after acceptable verdict or approved exception,
- QC stores metadata and references only, not files.

### Stage 5 — Health, Scorecards, Root Cause, and Responsible-Org Rollups

**Implements:** T08 operating model.

**Gate check:**
- `QualityHealthSnapshot` is derived and immutable,
- scorecards drill back to QC source records,
- `ResponsibleOrgPerformanceRollupInput` is frozen per snapshot,
- governed root-cause / recurrence logic and learning pipeline are active,
- enterprise rollups remain derived/published layers rather than project-editable records.

### Stage 6 — Schedule Awareness and Handoff Seams

**Implements:** T09 operating model.

**Gate check:**
- QC records can carry read-only schedule refs and readiness signal types,
- handoff payloads to Closeout, Startup, Warranty, and future Site Controls preserve lineage through `ProjectQcSnapshot`,
- baseline-visible readiness surfaces exist without expanding QC into schedule or field execution,
- no downstream ownership boundary is violated.

### Stage 7 — Cross-Module Publication, Validation, and Release Readiness

**Implements:** family-wide publication and release-readiness verification.

**Gate check:**
- Project Hub baseline-visible QC tile/projection behavior is wired through shared surfaces,
- Health, Work Queue, Related Items, notification, and snapshot publication paths all operate with correct authority boundaries,
- cross-module seams and drilldowns are verified,
- acceptance criteria in §6 all have evidence.

---

## 4. Dependencies, Prerequisites, and Blockers

### 4.1 Governing prerequisites

| Requirement | Why it blocks QC |
|---|---|
| MOE/Admin-governed standards, taxonomy floor, evidence minimums, SLA matrices, root-cause model, scorecard formulas, document-family rules | QC cannot safely operate on project extensions alone |
| Centrally governed verifier-eligibility policy | verifier-close is a core authority boundary |
| Approved project role mapping for PM / PE / Superintendent / QC Manager / verifier use | assignment, closure, and handoff responsibility depend on it |
| Controlled project-extension and promotion workflow | required before any governed-learning path can function correctly |

### 4.2 Adjacent module prerequisites

| Adjacent seam | Why it matters |
|---|---|
| Schedule baseline-awareness and publication seams | required for QC schedule awareness and readiness signaling |
| Startup / commissioning seam | required for startup-quality continuity |
| Closeout turnover-quality seam | required for turnover handoff and continuity |
| Warranty continuity seam | required for accepted basis and quality-history carry-forward |
| Site Controls future seam | required to keep QC from overreaching into field/mobile execution |

---

## 5. Implementation Guide

### 5.1 Where to start

An implementation team should start in this order:

1. Read T01–T03 together to internalize the operating boundary, authority model, and record vocabulary.
2. Confirm the shared package and spine blockers in §1 are resolved.
3. Implement the operational core in the order of the stages above.
4. Only after the deterministic workflow is stable should health, rollups, and downstream handoff projections be added.
5. Treat any expansion into field execution, punch, startup execution, warranty case handling, or file storage as out-of-scope escalation.

### 5.2 Product-terms recommended order

| Product slice | T-files |
|---|---|
| Governance and core records | T01–T03 |
| Planning / review / soft gates | T04 |
| Obligations and exception control | T05–T06 |
| Advisory and currentness | T07 |
| Management posture and learning | T08 |
| Cross-module readiness and handoffs | T09 |
| Release readiness / acceptance | T10 |

### 5.3 No-go conditions

Do not proceed when:

- governed standards, taxonomy, or scorecard logic are undefined,
- shared publication packages are unavailable,
- Schedule, Closeout, Startup, or Warranty seams are unresolved but a stage depends on them,
- the proposed implementation requires QC to store files or own downstream execution records,
- or a proposed UI/runtime path bypasses normalized work, health, or related-items contracts.

---

## 6. Minimum Acceptance Criteria by T-File Area

### 6.1 Governance and versioning (T01–T03)

- authority roles, publisher rules, and project-extension limits are enforceable,
- immutable/project snapshot contracts exist,
- record-family identities and lineage rules are implemented without alternate vocabulary.

### 6.2 Plans, reviews, and control gates (T04)

- mandatory versus additive coverage rules function,
- soft gates support all required statuses and preserve readiness implications,
- review findings preserve lineage and can spawn issues.

### 6.3 Issues, actions, and work publication (T05)

- all issue origination modes function,
- normalized work publication uses only the T05 outward contract,
- qualifying recurrence/root-cause cases cannot bypass required analysis.

### 6.4 Deviations, evidence, and approvals (T06)

- deviations/waivers, evidence references, and external approval dependencies are first-class, auditable, and linked,
- evidence minimums are enforced by use case/state,
- official-source conflicts route to explicit review paths.

### 6.5 Submittal advisory (T07)

- advisory remains outside submittal workflow/review scope,
- official-source-only currentness and `unable-to-verify` manual-review rules are enforced,
- downstream activation is two-stage and exception-aware.

### 6.6 Health, scorecards, root cause, and rollups (T08)

- quality health is a derived immutable projection,
- project and enterprise rollups remain correctly bounded,
- learning candidates cannot be published without MOE/Admin action.

### 6.7 Schedule awareness and handoffs (T09)

- QC can align obligations to schedule context without becoming schedule-authoritative,
- all downstream handoffs preserve identifiers, snapshots, and source refs,
- baseline-visible versus deferred depth is clearly enforced.

### 6.8 Full-family integration (T01–T10)

- Project Hub can show QC baseline-visible posture, work routing, health, and update notices,
- QC remains internal-only and non-field-first,
- no live cross-module ownership boundary is violated.

---

## 7. Testability and Validation Expectations

Per repository verification guidance, use the smallest meaningful validation set first. For this family, implementation validation should include:

### 7.1 Contract and rule verification

- type-level contract tests for QC record families and enums,
- business-rule tests for state transitions, verifier-close rules, advisory currentness rules, scorecard formulas, and handoff payload composition,
- snapshot immutability tests for `ProjectQcSnapshot`, `QualityHealthSnapshot`, and downstream handoff references.

### 7.2 Integration verification

- My Work publication integration tests,
- Related Items registration tests,
- Health publication and Project Hub read-model tests,
- Schedule read-only seam tests,
- Closeout / Startup / Warranty handoff continuity tests.

### 7.3 Documentation readiness verification

- filename/title/link consistency checks,
- terminology consistency across T01–T10,
- drift check against P3-E1, P3-E2, P3-D2, P3-E5, P3-E10, P3-E11, P3-E14, and Phase 6 seam docs.

---

## 8. Cross-Reference Checklist for External Reconciliation

The following files were reviewed in the final Phase 3 reconciliation pass for the P3-E15 family and were updated where warranted by repo truth:

1. `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`
2. `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E1-Phase-3-Module-Classification-Matrix.md`
3. `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md`
4. `docs/architecture/plans/MASTER/phase-3-deliverables/P3-D2-Project-Health-Contract.md`
5. `docs/architecture/plans/MASTER/phase-3-deliverables/P3-D3-Project-Work-Queue-Contract.md`
6. `docs/architecture/plans/MASTER/phase-3-deliverables/P3-D4-Related-Items-Registry-Presentation-Contract.md`
7. `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E5-Schedule-Module-Field-Specification.md` and adjacent P3-E5 schedule files
8. `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E9-*`
9. `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E10-*`
10. `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E11-*`
11. `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E14-*`
12. `docs/architecture/plans/MASTER/07_Phase-6_Field-First-HB-Site-Control-Plan.md`

This checklist now documents the completed reconciliation review for the Phase 3 planning library. Any further edits to these files should be treated as normal follow-on maintenance, not as outstanding P3-E15 integration debt.

---

## 9. Acceptance Framing

The QC module family is implementation-ready only when:

1. T01–T10 together define a complete, non-contradictory QC operating model,
2. the module can be implemented entirely through shared runtime contracts and governed adjacent seams,
3. no file, workflow, field-execution, punch, startup-execution, or warranty-execution overreach remains,
4. every derived projection drills back to authoritative QC source records,
5. and downstream modules receive continuity context without ownership confusion.
