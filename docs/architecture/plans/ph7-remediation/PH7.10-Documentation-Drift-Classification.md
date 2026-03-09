# PH7.10 — Documentation Drift Classification

**Version:** 1.1 (amended after PH7.10R validation — 2026-03-09)
**Purpose:** Resolve documentation drift by classifying major architecture documents according to their role rather than attempting a wholesale rewrite.
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.
**Implementation Objective:** Publish a classification model for the repo's major docs so readers can distinguish current canonical truth, normative future plans, historical foundations, deferred scope, and superseded references at a glance.

---

## Prerequisites

- PH7.1 complete.
- Review the docs index, blueprint docs, foundation/master plans, active phase plans, shared-feature plans, release docs, and ADR index.

---

## Source Inputs

- `docs/README.md`
- `docs/architecture/blueprint/*`
- `docs/architecture/plans/*`
- `docs/architecture/release/*`
- `docs/reference/*`
- ADR catalog

---

## 7.10.1 — Define the Classification Model

- Use only the classes Canonical Current-State, Canonical Normative Plan, Historical Foundational, Deferred Scope, and Superseded / Archived Reference.
- Define what each class means, how readers should use it, whether it should be updated, and when it can be superseded.
- **[Amendment A — Deferred Scope boundary rules]** The **Deferred Scope** class requires explicit definition and boundary case rules because it is the one class not already named in `current-state-map.md §2`. The definition must include:
  - **Primary boundary test:** A document is Deferred Scope when it describes planned work for features or packages whose development has not yet started and has no active implementation milestone in the current phase cycle. The planned work must be explicitly acknowledged as out of scope for the current phase.
  - **Boundary cases requiring explicit ruling:**
    1. **SF04–SF06 phase plans** (`PH7-SF-04` through `PH7-SF-22`, ~19 docs): these are feature decision and planning documents for packages not yet built. Classification: Deferred Scope. They must not be updated to reflect current phase work without an explicit phase activation decision.
    2. **PH7-RM-\* plans** (10 files in root `plans/` directory, not in any active subdirectory): these are remediation plans queued but not yet scheduled. Classification: Deferred Scope pending scheduling confirmation. See Amendment G for explicit handling.
    3. **Phase plans for phases already completed** (PH1–PH5 sub-plans): these are Historical Foundational, not Deferred Scope. Completion is the distinguishing criterion.
  - A document transitions from Deferred Scope to Canonical Normative Plan when the feature/package enters active development in a named phase milestone. The transition must be recorded in `current-state-map.md §2` and `docs/README.md`.
- **[Amendment B — Permanent Decision Rationale class for ADRs]** The classification model must include a **sixth class — Permanent Decision Rationale** — for all ADR files in `docs/architecture/adr/`. This class was already implicitly present in `current-state-map.md §2`; this amendment formalizes it as a first-class member of the model so it appears in all classification tables, the `docs/README.md` navigation section, and classification banners. Definition: Permanent Decision Rationale documents record an architectural decision that was evaluated and locked at a point in time. They are append-only (new context or amendment sections may be added; original Context and Decision sections are never modified). They are never superseded — a reversed decision produces a new ADR that explicitly supersedes the prior one. The ADR catalog contains known conflicts (four duplicate-numbered pairs: ADR-0013, ADR-0053, ADR-0054, ADR-0055) and a 19-file discrepancy between the filesystem count (93 files) and the `docs/README.md` index (74 entries). These conflicts are documented in the classification matrix (Amendment E) and deferred to PH7.11 §7.11.2 for index remediation.
- **[Amendment H — Structural-classification docs and Diátaxis output docs exemption]** Two categories of documents are exempt from the mandatory classification header-field requirement:
  1. **Structural-classification docs themselves** — `current-state-map.md`, `docs/README.md`, and the classification matrix produced by this phase. Adding a classification header to a document that defines the classification system creates a circular dependency and must not be done. These documents are classified in the matrix but receive no inline classification banner.
  2. **Diátaxis output docs** (`docs/tutorials/`, `docs/how-to/`, `docs/reference/`, `docs/explanation/`, `docs/user-guide/`, `docs/administrator-guide/`, `docs/maintenance/`, `docs/troubleshooting/`, `docs/security/`, `docs/release-notes/`, `docs/faq.md`) — these 200+ files operate under the Diátaxis quadrant system (tutorials/how-to/reference/explanation) which is a parallel and compatible classification scheme. They are classified as a bloc in the matrix under the notation **Living Reference (Diátaxis)** rather than one of the five architecture-doc classes. Individual banners on Diátaxis output files are not required and would create noise. The matrix row for Diátaxis output docs must note the quadrant breakdown and total file count.

## 7.10.2 — Build the Documentation Classification Matrix

- Create a matrix covering the root docs index, blueprint docs, foundation/master plans, active current phase plans, shared-feature plans, release/sign-off docs, the current-state map, and any known superseded artifacts still useful for history.
- **[Amendment C — extend existing matrix; do not create a competing one]** `current-state-map.md §2` already contains an 8-row classification matrix covering major doc groups with class assignments and short purpose notes. The §7.10.2 deliverable is **not** a new standalone file — it is an extension and formalization of the existing `current-state-map.md §2` matrix. The implementation must:
  1. Add the two missing classes — **Deferred Scope** (Amendment A) and **Permanent Decision Rationale** (Amendment B) — as rows or as column additions to the existing table.
  2. Add rows for categories not currently covered: PH7-RM-\* plans (Amendment G), SF04–SF06 plans (Amendment A), Diátaxis output docs (Amendment H), and the ADR catalog with its conflict notation (Amendment E).
  3. Do not create a separate `docs/reference/doc-classification-matrix.md`. The matrix lives in `current-state-map.md §2` and is linked from `docs/README.md`.
  4. If the existing table structure cannot accommodate the additions without losing clarity, the table may be restructured in-place — but the existing row content must be preserved, not replaced.
- **[Amendment D — Living Reference notation for Diátaxis output docs]** The matrix must include a dedicated row for the Diátaxis output documentation corpus. The notation **Living Reference (Diátaxis)** is used as the class label for this row. The row must record: file count, quadrant breakdown summary, update policy ("updated continuously as features ship"), and the exemption from inline classification banners (Amendment H). This makes the Diátaxis layer visible in the classification system without incorrectly assigning the five architecture-doc classes to operational documentation.
- **[Amendment E — ADR catalog conflicts documented in matrix]** The ADR row in the classification matrix must include a conflict-notation column or footnote recording: (a) 93 files on disk vs. 74 entries in `docs/README.md` index (19-file discrepancy); (b) four duplicate-numbered pairs (ADR-0013, ADR-0053, ADR-0054, ADR-0055 each have two files); (c) four un-prefixed PH6 ADRs (ADR-0060 through ADR-0063 have non-standard filenames). The matrix must note that resolution is deferred to PH7.11 §7.11.2. No files are renamed, deleted, or re-indexed during PH7.10.

## 7.10.3 — Update `docs/README.md`

- Add a section explaining how the classified doc system works and where readers should look first for current truth and second for historical context.
- The section must reference `current-state-map.md §2` as the authoritative classification matrix and provide navigational guidance for all six classes (including Permanent Decision Rationale and the Living Reference notation for Diátaxis output docs).
- The section must not duplicate the matrix content — it links to `current-state-map.md §2` and explains the reading order and priority model.

## 7.10.4 — Add Classification Notes to High-Value Docs

- Add lightweight classification notes to the current-state map, blueprint, foundation plan, active master phase plan(s), and still-active shared-feature plans.
- **[Amendment F — minimum-viable classification approach]** The §7.10.4 scope is scoped to a minimum-viable set to avoid unnecessary churn across ~143 plan files. The implementation must use the following tiered approach:
  1. **Tier 1 — Inline classification banner** (required, ~15–20 files): Documents that are at risk of being misread as current authoritative specs when they are not. Must receive a one-line classification banner in the YAML front matter or below the H1 title. Target set: `current-state-map.md` (exempt per Amendment H), `Blueprint-V4.md`, `hb-intel-foundation-plan.md`, the active PH7 master plan, `PH6-Provisioning-Plan.md`, `PH7.12-Final-Verification-and-Sign-Off.md`, PH5 and PH4 master plans, and the PH7-RM-\* plans (Amendment G). ADRs are exempt (Amendment H).
  2. **Tier 2 — Matrix classification only** (sufficient for remaining files): All other plan files, shared-feature plans, release docs, and Diátaxis output docs are classified by their matrix row membership. No inline banner is added to individual files within a well-defined group (e.g., all PH7-SF-04 through PH7-SF-22 plans are classified as a group in the matrix row). The matrix row membership IS the classification for these files.
  3. **Tier 3 — Explicit non-classification** (structural docs): `current-state-map.md`, `docs/README.md`, and the docs serving as classification infrastructure are noted in the matrix as "infrastructure/exempt" per Amendment H. No banner is added.
  Banner format: `> **Doc Classification:** [Class Name] — [one-sentence purpose statement]`

## 7.10.5 — Define the Ongoing Maintenance Rule

- Document the rule that every new architecture/plan/reference/release doc should state or be index-classified as one of the defined classes.
- **[Amendment G — PH7-RM-\* explicit classification]** The 10 plan files in the root `plans/` directory matching the `PH7-RM-*` prefix (e.g., `PH7-RM-Package-Ownership.md`, `PH7-RM-Dependency-Graph.md`, and others) are explicitly classified as **Deferred Scope** with the rationale: these are remediation scope items identified during PH7 but not yet assigned to a numbered execution phase. Their Deferred Scope status must be confirmed against the current project timeline before PH7.12 sign-off; if any have been scheduled, they must be reclassified to Canonical Normative Plan and linked from the active phase plan. The maintenance rule must include this reclassification trigger as an example of how Deferred Scope transitions work.
- The maintenance rule must also specify: new ADRs are always Permanent Decision Rationale; new Diátaxis output docs are always Living Reference (Diátaxis); the six-class model is the only permitted classification vocabulary (Living Reference is a Diátaxis-specific notation within the model, not a seventh class).

---

## Deliverables

- extended `current-state-map.md §2` matrix — adds Deferred Scope and Permanent Decision Rationale rows, Living Reference (Diátaxis) row, ADR conflict notation, PH7-RM-\* and SF04–SF06 rows (Amendments A, B, C, D, E, G)
- updated `docs/README.md` — new classification navigation section linking to `current-state-map.md §2` (§7.10.3)
- Tier 1 classification banners on ~15–20 high-risk files (Amendment F)
- ongoing maintenance rule documented in `current-state-map.md §2` or a linked reference section (§7.10.5)

---

## Acceptance Criteria Checklist

- [ ] Classification model defines all six classes: Canonical Current-State, Canonical Normative Plan, Historical Foundational, Deferred Scope, Superseded/Archived Reference, Permanent Decision Rationale (Amendment B).
- [ ] Deferred Scope class includes boundary case rules: SF04–SF06 plans, PH7-RM-\* plans, and completed phase plans (Amendment A).
- [ ] `current-state-map.md §2` matrix extended with new rows and conflict notations — no competing standalone matrix file created (Amendment C).
- [ ] Living Reference (Diátaxis) row present in matrix with file count, quadrant breakdown, and banner exemption note (Amendment D).
- [ ] ADR catalog conflicts documented in matrix with explicit deferral to PH7.11 §7.11.2 for resolution (Amendment E).
- [ ] `docs/README.md` has a classification navigation section linking to `current-state-map.md §2` (§7.10.3).
- [ ] Tier 1 inline classification banners applied to ~15–20 high-risk files; remaining files classified via matrix row membership (Amendment F).
- [ ] Structural-classification docs and Diátaxis output docs are explicitly exempt from mandatory banners (Amendment H).
- [ ] PH7-RM-\* plans classified as Deferred Scope with reclassification trigger documented (Amendment G).
- [ ] Ongoing maintenance rule specifies vocabulary constraint and transition triggers (§7.10.5, Amendment G).
- [ ] `docs/README.md` explains how to navigate the classified doc system.
- [ ] Major docs are classified.
- [ ] High-value docs visibly indicate their role (Tier 1 banners).
- [ ] Future maintenance rule is documented.

---

## Verification Evidence

- updated docs list
- manual spot-check of major doc classifications
- link validation where cross-links are added
- confirm `current-state-map.md §2` extended (not replaced)
- confirm no Diátaxis output files received inline banners

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.10 started: YYYY-MM-DD
PH7.10 completed: YYYY-MM-DD

Artifacts:
- extended `current-state-map.md §2` matrix (Amendments A, B, C, D, E, G)
- updated `docs/README.md` — classification navigation section
- Tier 1 classification banners on high-risk files (Amendment F)
- maintenance rule documented (§7.10.5, Amendment G)

Verification:
- build: PASS/FAIL
- lint: PASS/FAIL
- check-types: PASS/FAIL
- test / validation: PASS/FAIL

Notes:
- unresolved items:
- deferred items with rationale:
-->
```

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.10 started: 2026-03-09
PH7.10 completed: 2026-03-09

Artifacts produced:
- `docs/architecture/blueprint/current-state-map.md` §1 ADR count updated; §2 matrix extended with new rows (Deferred Scope, Permanent Decision Rationale formalized, Living Reference (Diátaxis), ADR conflict notation, PH7-RM-*, SF04-SF06, PH4–PH6 completed phase plans, PH7 remediation plans, release docs); §2.1 Classification Maintenance Rule added; §2.2 ADR Catalog Conflict Registry added — Amendments A, B, C, D, E, G
- `docs/README.md` — Document Classification System section added (6-class table, reading order, Tier 1 banner explanation) — §7.10.3
- Tier 1 classification banners applied to 16 files — Amendment F:
  - `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` (Canonical Normative Plan)
  - `docs/architecture/plans/hb-intel-foundation-plan.md` (Historical Foundational)
  - `docs/architecture/plans/PH6-Provisioning-Plan.md` (Historical Foundational)
  - `docs/architecture/plans/ph7-remediation/PH7.12-Final-Verification-and-Sign-Off.md` (Canonical Normative Plan)
  - `docs/architecture/plans/PH4-Shell-Consolidation.md` (Historical Foundational)
  - `docs/architecture/plans/PH5-Auth-Shell-Plan.md` (Historical Foundational)
  - `docs/architecture/plans/PH5C-Auth-Shell-Plan.md` (Historical Foundational)
  - `docs/architecture/plans/PH7-RM-1-Package-Foundation.md` (Deferred Scope)
  - `docs/architecture/plans/PH7-RM-2-Shell-and-Layout.md` (Deferred Scope)
  - `docs/architecture/plans/PH7-RM-3-NavigationSidebar.md` (Deferred Scope)
  - `docs/architecture/plans/PH7-RM-4-RecordCard-and-EditDrawer.md` (Deferred Scope)
  - `docs/architecture/plans/PH7-RM-5-ActionItems.md` (Deferred Scope)
  - `docs/architecture/plans/PH7-RM-6-SessionSummary.md` (Deferred Scope)
  - `docs/architecture/plans/PH7-RM-7-EstimatingIntegration.md` (Deferred Scope)
  - `docs/architecture/plans/PH7-RM-8-Backend-API.md` (Deferred Scope)
  - `docs/architecture/plans/PH7-RM-9-Testing-and-Documentation.md` (Deferred Scope)
- Maintenance rule documented in `current-state-map.md §2.1` with transition trigger for Deferred Scope reclassification — §7.10.5, Amendment G

Deferred to PH7.11:
- ADR catalog conflict resolution (§2.2): 4 duplicate-numbered pairs, 19-file index discrepancy, 4 un-prefixed PH6 ADRs, ADR-0082 missing from README index

Acceptance criteria status:
[x] Six classes defined (incl. Permanent Decision Rationale)
[x] Deferred Scope boundary case rules documented (SF04–SF06, PH7-RM-*, completed phases)
[x] current-state-map.md §2 extended — no competing matrix created
[x] Living Reference (Diátaxis) row with file count, quadrant breakdown, banner exemption
[x] ADR conflicts documented with PH7.11 deferral
[x] docs/README.md classification navigation section added
[x] Tier 1 banners on 16 high-risk files; remaining files classified by matrix row
[x] Structural-classification docs and Diátaxis output docs exempt from banners
[x] PH7-RM-* plans classified Deferred Scope with reclassification trigger
[x] Maintenance rule specifies vocabulary constraint and transition triggers
[x] docs/README.md explains how to navigate classified doc system
[x] Major docs are classified
[x] High-value docs visibly indicate their role
[x] Future maintenance rule is documented
-->

