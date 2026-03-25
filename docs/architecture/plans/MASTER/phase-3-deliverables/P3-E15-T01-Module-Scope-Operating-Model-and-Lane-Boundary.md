# P3-E15-T01 — Module Scope, Operating Model, and Lane Boundary

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E15-T01 |
| **Parent** | [P3-E15 Project Hub QC Module](P3-E15-QC-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T01 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Module Purpose

Project Hub QC is the **internal Project Hub operating surface for planning, reviewing, governing, and projecting project quality posture before work becomes a downstream punch, startup, warranty, or field-first execution concern**. It exists to give project teams and quality leadership one authoritative place to define quality expectations, instantiate work-package plans, run preconstruction and design-package reviews, convert findings into traceable obligations, govern deviations and approvals, confirm evidence sufficiency, and surface readiness and health signals to management.

QC is not a summary-only tile, but it is also not a field-first execution tool. Its Phase 3 purpose is to own the **control layer** for quality rather than the deepest field capture layer.

### 1.1 User Outcomes

The module must let internal users answer all of the following without reconstructing state from email, shared folders, or spreadsheets:

- What governed quality standards and project extensions apply to this project and work package?
- What quality plans are mandatory, which high-risk additions were selected, and who is responsible for each obligation?
- What findings, issues, corrective actions, deviations, approval dependencies, and evidence references are currently open?
- Which hold points, mockups, tests, and preinstallation meetings are ready, conditionally ready, blocked, or escalated?
- Which submittal packages are complete and current enough to support quality guidance, and which require manual review or exception?
- What root-cause patterns, aging signals, organization-performance issues, and quality-health trends require management attention?

### 1.2 Anti-Goals

| Incorrect scope | Correct boundary |
|---|---|
| A mobile-first field execution app | Project Hub QC owns the internal control layer; future Site Controls owns deeper field/mobile execution |
| A punch list or warranty system | QC stops at pre-punch and turnover-quality readiness; downstream punch and warranty modules own their operations |
| A submittal workflow engine | QC only provides completeness/currentness advisory; it does not replace submittal routing or approval workflow |
| A document repository | QC stores metadata, lineage, and references; file storage remains in governed document systems |
| An owner or subcontractor portal | Phase 3 QC is internal-only |
| A full startup or closeout replacement | QC hands structured quality readiness and evidence context into those modules; it does not absorb their lifecycle ownership |

---

## 2. Lifecycle Boundary

### 2.1 Lifecycle Start

QC becomes active when a project begins preconstruction quality planning or any governed quality record is first instantiated. In practical terms, the module starts at the earliest of:

- creation of the first `WorkPackageQualityPlan`,
- creation of the first `PreconstructionReviewPackage`,
- creation of the first governed submittal-advisory `SubmittalItemRecord`,
- or opening of the first QC issue tied to a project quality obligation.

### 2.2 Lifecycle End

QC remains authoritative through:

- work-package quality planning,
- design and preconstruction quality reviews,
- issue/corrective-action closure,
- soft-gated execution readiness,
- pre-punch readiness,
- and turnover-quality readiness.

QC hands off rather than continues ownership at the following boundaries:

- formal punch and post-punch execution,
- startup commissioning execution,
- formal closeout artifact assembly,
- and warranty case operations.

### 2.3 Authoritative Boundary Statement

QC is authoritative for **quality obligations and readiness signals up to pre-punch and turnover-quality readiness**. It is not authoritative for:

- punch-list execution,
- closeout turnover artifact production,
- startup certification,
- warranty resolution,
- or field-first mobile execution.

QC may publish downstream context into those modules, but it may not write their source-of-truth records.

---

## 3. Internal-Only Phase 3 Access Model

QC is an **internal-only** surface in Phase 3. No owner-facing, subcontractor-facing, or public collaboration path is permitted in this module family.

| Audience | Phase 3 posture | Notes |
|---|---|---|
| PM / PE / PA / Project Engineer | Full internal authoring and review access within role bounds | Own quality planning, package administration, external approval tracking, and project adoption decisions |
| Superintendent / field leadership | Internal execution-readiness and follow-up access | Own ready-for-review routing, field readiness inputs, and issue follow-up within Project Hub boundary |
| Quality Control Manager | Internal high-risk review and governed candidate authoring access | May author candidate governed content; does not publish governed core |
| Authorized HB verifier | Internal verification and closure access | Must be centrally eligible and project/work-package designated |
| Read-only internal leadership | Read visibility to management projections as permitted by role | No external distribution path created by QC |
| Owner / tenant / subcontractor / consultant external user | Hidden | No portal, no external workspace, no grant-scoped external authoring in Phase 3 |

**Internal-only rule:** Any need for external collaboration is a future seam and must not be implemented inside the Phase 3 QC surface.

---

## 4. Project Hub vs Site Controls Boundary

QC operates on a deliberate split between **Project Hub control depth** and **future Site Controls execution depth**. This boundary is mandatory.

| Capability | Project Hub QC owns in Phase 3 | Future Site Controls owns later |
|---|---|---|
| Governed standards, taxonomy, and quality-plan requirements | Yes | No |
| Work-package quality-plan authoring and review | Yes | No |
| Preconstruction / design-package review packages and findings | Yes | No |
| QC issue / corrective-action governance and closure verification | Yes | No for authoritative governance; Site Controls may supply field execution updates later |
| Deviation / waiver governance | Yes | No |
| Evidence-reference governance and approval dependencies | Yes | No for authoritative record; Site Controls may capture field-origin evidence later |
| Hold point / mockup / test / preinstallation meeting readiness projection | Yes | Site Controls later owns deeper on-site execution and mobile capture |
| Submittal completeness/currentness advisory | Yes | No |
| Mobile-first field capture, on-site walkthroughs, degraded-connectivity workflows | No | Yes |
| Deep field task execution, touch-optimized routing, real-time site observations | No | Yes |
| Rich field/photo collection workflows beyond reference capture | No | Yes |

### 4.1 Capability Statement

Phase 3 QC must feel like a **credible internal control surface** in Project Hub. That means it must support structured plans, findings, issues, deviations, approvals, evidence references, advisory signals, and management projections. It must not attempt to simulate a field-first site application inside office-oriented lanes.

### 4.2 Deeper Execution Deferral

The following are explicitly deferred to [07_Phase-6_Field-First-HB-Site-Control-Plan.md](../07_Phase-6_Field-First-HB-Site-Control-Plan.md):

- mobile-first QC execution engine,
- field-native hold-point walkthroughs,
- touch-optimized offline or deferred-sync capture,
- deeper field evidence and inspection workflows,
- on-site execution routing beyond ready-for-review and follow-up status exchange.

---

## 5. Operational Ownership Split

QC uses a record-family-aware operational ownership model. Ownership is split by the type of work being done, not by one universal QC persona.

| Responsibility area | Primary operational owner | Notes |
|---|---|---|
| Review-package administration, package references, spec linkage, version-adoption decisions, external approval tracking, project coordination, report hygiene | PM / PE / PA / Project Engineer | This is the non-field-driven administration side of QC |
| Execution-side readiness inputs, hold points, tests, mockups, preinstallation meetings, issue follow-up, ready-for-review routing | Superintendent / field leadership | These users inform readiness and completion without turning QC into a field-first engine |
| High-risk content review, governed candidate content authoring, discipline challenge, quality methodology guidance | Quality Control Manager | Candidate-author role only for governed content; publishing remains MOE/Admin |
| Completion verification and closure | Authorized HB verifier | Must be centrally eligible and project/work-package designated |

### 5.1 Verifier Model

The verifier path is deliberately separate from the responsible-party path:

1. A responsible organization, and optionally a named individual, owns completion of the obligation.
2. The designated verifier reviews completion evidence and status.
3. The verifier, not the responsible party, marks the obligation as verified/closed.
4. Verifier eligibility is centrally governed; designation occurs at project or work-package depth.

---

## 6. Relationship to Adjacent Modules

QC must be explicit about what it owns, what it consumes, and what it hands off.

| Adjacent module | Relationship | QC boundary |
|---|---|---|
| **Project Startup** | QC provides quality-baseline and readiness context that may influence startup readiness; Startup owns mobilization certification and commissioning | QC does not write Startup records or replace startup certification |
| **Project Closeout** | QC provides turnover-quality readiness posture, unresolved quality lineage, and supporting references | Closeout owns turnover package assembly, archive readiness, and closeout-led artifact publication |
| **Project Warranty** | QC can hand off unresolved or documented quality context that becomes downstream warranty relevance | Warranty owns coverage registry, case lifecycle, and post-turnover remediation operations |
| **Schedule** | QC reads baseline and near-term schedule context to assess readiness windows and quality-critical sequencing | Schedule owns CPM, milestone authority, and forecast publication |
| **Reports** | QC publishes governed snapshots and derived signals when later T-files define those contracts | Reports owns report artifacts, release classes, and distribution controls |
| **My Work / Project Work Queue** | QC publishes obligations, due actions, escalations, and verification requests | Work Queue routes and aggregates; it does not own QC state |
| **Related Items** | QC publishes lineage links across plans, findings, issues, deviations, approvals, snapshots, and downstream seams | Related Items owns relationship registry and presentation logic |
| **Future Site Controls** | QC supplies the control-layer record model and downstream execution seam | Site Controls later owns deeper field/mobile execution |

---

## 7. Lane Capability and Phase 3 Deferrals

QC is baseline-visible in both PWA and SPFx per Phase 3 lane doctrine, but its deeper field/mobile execution depth is deferred. That means:

- both Project Hub lanes may surface QC context, status, and controlled internal interactions consistent with the family,
- neither lane should be used as justification to build field-first or owner/subcontractor collaboration depth inside Phase 3 QC,
- the PWA may eventually host richer internal control-surface workflows than SPFx without turning QC into Site Controls.

### 7.1 Explicit Deferral List

The following are out of scope for Phase 3 QC and must be treated as deferred or prohibited:

- punch list ownership,
- owner portal,
- subcontractor portal,
- direct external collaboration workspace,
- file storage or file-system replacement behavior,
- mobile-first execution engine,
- full submittal workflow or routing,
- broad offline/deferred-sync field execution,
- owner-facing release or distribution behavior.

### 7.2 Historical Input Boundary

The earlier PH7.7 plan described a checklist-centric QC concept with third-party inspections and later collaborative workflow aspirations. That remains historical context only. Phase 3 QC does not inherit PH7.7's narrow "checklist page + completion page" shape as its governing boundary.

---

## 8. Governing Boundary Summary

Project Hub QC in Phase 3 is the **internal quality-control operating surface for planning, review, oversight, readiness, and management projection**. It owns control depth, not field-first execution depth. It remains baseline-visible in Project Hub, publishes quality obligations and signals into shared project spines, and explicitly defers deeper field/mobile execution to future Site Controls.

---

*[← Master Index](P3-E15-QC-Module-Field-Specification.md) | [T02 →](P3-E15-T02-Governance-Ownership-and-Versioning.md)*
