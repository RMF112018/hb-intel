# P3-E15-T02 — Governance, Ownership, and Versioning

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E15-T02 |
| **Parent** | [P3-E15 Project Hub QC Module](P3-E15-QC-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T02 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Governance Model

QC uses a **governed-core plus controlled project-extension** model. The enterprise defines the minimum acceptable quality operating system. Projects can extend within governed bounds, but they cannot create parallel uncontrolled standards, taxonomies, evidence rules, or scorecard logic.

### 1.1 Enterprise Governance Owner

MOE/Admin is the **enterprise governance owner and publisher** for:

- governed standards / best-practice library,
- governed taxonomy floor,
- mandatory quality-plan sets,
- document-family requirements,
- evidence minimums,
- mapping engine rules,
- SLA / aging matrices,
- root-cause / recurrence model,
- scorecard formulas,
- responsible-organization rollup logic,
- currentness rules and official-source policy,
- governed update notices and project snapshot policy.

### 1.2 Candidate Author Role

The Quality Control Manager may author or propose:

- candidate governed standards,
- candidate taxonomy additions,
- candidate mandatory-plan-set changes,
- candidate document-family requirements,
- candidate evidence minimums,
- candidate scorecard refinements,
- candidate mapping rules and root-cause refinements.

The Quality Control Manager is **not** the publisher of governed core. Candidate content remains proposed until MOE/Admin publishes it.

---

## 2. Governed Core vs Controlled Project Extension

| Concern | Governed core owner | Project extension allowed | Extension constraint |
|---|---|---|---|
| `GovernedQualityStandard` library | MOE/Admin | Yes | Project may add a `ProjectQualityExtension` only within the governed taxonomy and promotion workflow |
| Governed taxonomy floor | MOE/Admin | Yes | Project extensions must classify into governed parent categories |
| Mandatory quality-plan sets | MOE/Admin | Yes | Projects may add high-risk additions but may not remove governed mandatory minimums |
| Document-family requirements for submittal advisory | MOE/Admin | Yes | Project/spec overlays may add requirements but may not weaken governed minimum currentness rules |
| Mapping engine rules | MOE/Admin | Yes | Project overlays may add project-specific mappings but may not redefine the governed verdict vocabulary |
| Evidence minimum rules | MOE/Admin | Yes | Project may tighten requirements; may not loosen the enterprise minimum without approved deviation |
| SLA / aging matrices | MOE/Admin | Yes | Project adjustments must stay inside governed adjustment bounds and carry provenance |
| Root-cause / recurrence model | MOE/Admin | Limited | Projects may classify within the governed model; they may not invent an alternate root-cause schema |
| Scorecard formulas | MOE/Admin | Limited | Projects may choose enabled drilldowns and thresholds where permitted; core formulas remain governed |
| Responsible-organization performance rollup logic | MOE/Admin | No | Rollup semantics are enterprise-governed for comparability |
| Official-source currentness rules | MOE/Admin | No | Current-version checks use manufacturer or official publisher sources only |

### 2.1 Project Extension Rule

A `ProjectQualityExtension` is allowed only when:

1. the project need is real and bounded,
2. the extension attaches to a governed parent category,
3. the extension does not weaken governed minimums,
4. the extension carries provenance and approval metadata,
5. the extension is eligible for later promotion or retirement.

---

## 3. Promotion-to-Core Workflow

Promotion from project extension to governed core is a formal governance flow.

```text
Project creates controlled extension
  → Quality Control Manager or project quality lead submits candidate for review
  → Central governance owner validates scope, quality, reuse value, and taxonomy fit
  → Discipline reviewer validates technical and operational correctness
  → MOE/Admin publishes to governed core, or rejects with required revisions
```

### 3.1 Promotion Rules

- Promotion requires **both** a central governance owner and a discipline reviewer.
- Promotion may originate from a project extension or from a Quality Control Manager candidate submission.
- Published content receives a governed version and update notice.
- Rejected candidates remain project-scoped if still needed locally, but do not become enterprise defaults.

### 3.2 Promotion Decision Outcomes

| Outcome | Effect |
|---|---|
| `approved-promoted` | Candidate becomes governed core and receives governed publication metadata |
| `approved-project-only` | Candidate remains an allowed project extension but is not promoted |
| `rejected` | Candidate cannot be used as governed core; rejection reason is recorded |
| `returned-for-revision` | Candidate remains draft and may be resubmitted |

---

## 4. Role Matrix

| Action | PM / PE / PA / Project Engineer | Superintendent / field leadership | Quality Control Manager | Authorized HB verifier | MOE/Admin | Discipline reviewer |
|---|---|---|---|---|---|---|
| Author project plan / review package / issue / dependency records | Yes | Yes for execution-readiness inputs and issue follow-up | Yes | No | No | No |
| Author candidate governed content | No | No | Yes | No | Yes | No |
| Publish governed core | No | No | No | No | Yes | No |
| Review high-risk content | PE / PM review within project | Field review for execution-readiness context | Yes | No | Yes for governance review | Yes |
| Verify completion | No | No | May verify only if designated and eligible | Yes | No | No |
| Close verified obligation | No | No | No unless acting as designated verifier | Yes | No | No |
| Approve `DeviationOrWaiverRecord` | PE / designated authority per project policy | No | Recommend only | No | Governed policy owner for governed-core exceptions | Review when discipline signoff required |
| Designate verifier for project/work package | PE / PM within governed eligibility policy | No | Required concurrence for high-risk packages | No | Publishes the eligibility policy | No |
| Publish governed update notice | No | No | No | No | Yes | No |

### 4.1 Verifier Designation Rule

Verifier designation follows two steps:

1. MOE/Admin publishes the eligible verifier-role policy.
2. The project designates one or more actual verifiers per work package from that eligible pool.

For high-risk work packages, Quality Control Manager concurrence is required on the designation.

---

## 5. Project Snapshot and Versioning Model

QC requires a versioned project-snapshot model because quality posture changes over time and governance updates may affect plan obligations after work has already started.

### 5.1 `ProjectQcSnapshot`

`ProjectQcSnapshot` is the governed snapshot record for project quality posture. Each snapshot captures:

- active governed-core versions in force,
- active project extensions,
- active work-package plans,
- preconstruction review posture,
- open and overdue issue/corrective-action posture,
- deviation and approval-dependency posture,
- health / scorecard posture,
- submittal advisory posture summary,
- responsible-organization performance posture,
- schedule-aware readiness signals.

Snapshots are versioned, immutable once published, and used for management projection, update notices, and downstream handoffs.

### 5.2 Version Types

| Version type | Purpose |
|---|---|
| `working` | In-progress project QC posture; mutable |
| `project-baseline` | Approved baseline for the current project quality setup |
| `snapshot-published` | Immutable published project snapshot used for projection and handoffs |
| `superseded` | Older immutable snapshot retained for history and audit |

### 5.3 Governed Content Versioning

The following governed concerns must carry explicit version identifiers:

- standards library,
- taxonomy floor,
- mandatory plan sets,
- document-family requirements,
- mapping-engine logic,
- evidence minimum rules,
- SLA / aging matrices,
- root-cause schema,
- scorecard logic,
- responsible-org rollup logic,
- official-source currentness rules.

Project-instantiated records must retain the governed-version reference that was in effect when they were created or last rebased.

---

## 6. Update Notices and Adoption Workflow

When governed content changes, projects need a formal adoption path rather than silent drift.

### 6.1 `GovernedUpdateNotice`

Every material governed-core change that affects project behavior must publish a `GovernedUpdateNotice`. The notice must include:

- what changed,
- the impacted governed family,
- effective date,
- whether the change is mandatory or advisory,
- whether project adoption is required,
- what recheck or rebasing actions are required,
- what records are in scope.

### 6.2 Adoption States

| State | Meaning |
|---|---|
| `pending-review` | Project has received the notice but has not decided adoption posture |
| `accepted` | Project adopts the new governed version |
| `accepted-with-project-basis-retained` | Project retains its approved project basis temporarily and records rationale |
| `approved-exception` | Project requires temporary exception to adoption |
| `superseded` | Notice has been resolved by a later adopted notice |

### 6.3 Adoption Decision Owner

Project adoption decisions belong to the PM / PE / PA / Project Engineer side because they own review-package administration, version-adoption decisions, and project coordination hygiene. Quality Control Manager may advise on high-risk impacts, but project adoption is not an MOE-only action once core content has been published.

---

## 7. Approved Project Basis and Currentness Conflict Handling

The submittal-completeness advisory and related governed quality controls must support **approved project basis** when official-source updates appear after a project has already adopted a specific basis.

### 7.1 Governing Rule

- Official manufacturer or official publisher sources are the only allowed currentness sources.
- If a newer official source conflicts with the project's approved basis, QC must not silently replace the basis.
- Instead, QC records a conflict/recheck advisory and requires a project adoption or exception decision.

### 7.2 Conflict Outcomes

| Outcome | Effect |
|---|---|
| Adopt new basis | Project updates its basis, records version change, and re-evaluates affected items |
| Retain approved basis temporarily | Project records rationale and receives recheck/watch obligations |
| Approved exception | Project records formal exception with owner, rationale, and expiry |
| Manual review required | Advisory remains unresolved until reviewed |

---

## 8. Governance by Concern

| Concern | Publisher / governing owner | Project decision latitude |
|---|---|---|
| Taxonomy | MOE/Admin | Controlled extension only |
| Mandatory quality-plan set | MOE/Admin | Additive high-risk additions only |
| Evidence minimums | MOE/Admin | May tighten; cannot weaken without deviation |
| SLA / aging matrix | MOE/Admin | May adjust within governed bounds |
| Root-cause model | MOE/Admin | Classify only within governed model |
| Scorecard logic | MOE/Admin | Drilldown selection and limited local thresholds where allowed |
| Responsible-org rollup logic | MOE/Admin | No local override of formula semantics |
| Official-source currentness rules | MOE/Admin | No local override of source policy |

---

## 9. Shared-Package Governance Reuse Rule

QC must build on the shared packages already established in the repo rather than inventing local substitutes:

| Shared package | QC governance expectation |
|---|---|
| `@hbc/versioned-record` | Record mutation history, governed version lineage, and snapshot evolution |
| `@hbc/record-form` | Trusted record-authoring and review surfaces |
| `@hbc/saved-views` | Persistent workspace states for plans, issues, and advisory views |
| `@hbc/publish-workflow` | Governed publication, approval, supersession, and revocation semantics |
| `@hbc/my-work-feed` | Obligation routing and verification tasks |
| `@hbc/related-items` | Cross-record lineage presentation |
| `@hbc/project-canvas` | Baseline-visible Project Hub presentation and quality tiles |
| `@hbc/notification-intelligence` | Update notices, escalations, aging signals, and drift alerts |
| `@hbc/session-state` | Draft persistence and non-canonical working-state recovery where needed |
| `@hbc/sharepoint-docs` | Governed document reference and link handling only; QC must not create a parallel document subsystem |

**No-local-substitute rule:** QC may not introduce a local versioning system, local saved-view runtime, local notification engine, local work queue, or file storage subsystem for concerns already owned by these packages.

---

## 10. Governing Summary

MOE/Admin publishes governed QC core. Projects operate within that core, can extend it in controlled ways, and must handle governed changes through explicit update notices, adoption decisions, and versioned snapshots. Quality Control Manager is a candidate author and high-risk reviewer, not the publisher. Verifier eligibility is centrally governed, while project/work-package designation remains a project-level control inside the governed policy envelope.

---

*[← T01](P3-E15-T01-Module-Scope-Operating-Model-and-Lane-Boundary.md) | [T03 →](P3-E15-T03-Record-Families-Authority-and-Data-Model.md)*
