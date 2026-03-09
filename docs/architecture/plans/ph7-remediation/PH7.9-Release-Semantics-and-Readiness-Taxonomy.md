# PH7.9 — Release Semantics & Readiness Taxonomy

**Version:** 1.1 (amended after PH7.9R validation — 2026-03-09)
**Purpose:** Formalize release-readiness semantics so the platform distinguishes code completion from environment setup and operational readiness.
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.
**Implementation Objective:** Replace ambiguous readiness language with a three-level taxonomy — Code-Ready, Environment-Ready, Operations-Ready — and update release/checklist guidance so "production-ready" is only used when all three are true.

---

## Prerequisites

- PH7.1 complete.
- Review PH6 master plan, release checklists, sign-off docs, and major phase plans that currently use readiness language.

---

## Source Inputs

- `docs/architecture/plans/PH6-Provisioning-Plan.md`
- release docs under `docs/architecture/release/*`
- package/app sign-off docs
- CI/CD docs and runbooks
- current ADRs that imply readiness boundaries

---

## 7.9.1 — Define the Three Readiness Levels

- Publish canonical definitions for Code-Ready, Environment-Ready, Operations-Ready, and the rule that Production-Ready may be used only when all three are true.
- **[Amendment A]** The taxonomy must include an explicit fourth state — **N/A / Deferred** — for components where Environment-Ready and Operations-Ready are genuinely inapplicable at the current stage (e.g., a pure library package with no deployment surface, or a feature whose environment has not yet been provisioned). Fields that are N/A or Deferred must be recorded as such with a one-line rationale; they must not be left blank or fabricated. The reference doc (§7.9.5) must supply guidance on when each state applies.

## 7.9.2 — Define the Language Rules

- Document explicit language rules for plans, completion notes, commit summaries, and sign-off artifacts so "production-ready" is not used for code-only completion.
- Language rules apply to: plan Purpose statements, Implementation Objective lines, Completion Statements, progress notes, commit summaries, and release/sign-off artifacts.
- **[Amendment B — grandfather clause]** The language rules must explicitly state the following two carve-outs, which are not subject to retroactive enforcement:
  1. The section heading convention **"Production-Ready Code:"** used throughout Phase 4C and Phase 5C plan files (e.g., `PH5C.3`, `PH5C.4`, `PH5C.8`) is a formatting artifact labelling code blocks intended for copy-paste. It is not a readiness claim. These are Historical Foundational documents (per the PH7.10 classification) and must not be modified.
  2. Existing **ADR Context sections** that use "production-ready" (e.g., ADR-0063, ADR-0052, ADR-0020) are permanent, append-only records and are not subject to retroactive amendment under the new language rules.
  The reference doc (§7.9.5) must reproduce these carve-outs verbatim so future contributors performing documentation audits do not raise false violations against locked documents.

## 7.9.3 — Update Release/Checklist Artifacts

- Add fields for Code-Ready date, Environment-Ready date, Operations-Ready date, and optional Production-Ready date to major release/sign-off artifacts.
- **[Amendment C — explicit artifact scope]** "Major release/sign-off artifacts" is defined as the following enumerated list — no other release or plan documents are in scope for §7.9.3 modifications:
  1. **New: release sign-off template.** Create `docs/architecture/release/release-signoff-template.md` — a reusable Markdown template for future phase sign-offs incorporating the three per-level date fields and the staged sign-off model defined in §7.9.5 (Amendment F). This is the primary §7.9.3 deliverable.
  2. **`PH6.16-CICD-Documentation.md §6.16.12`** — the Phase 6 embedded release checklist. Add a readiness classification annotation block (not additional fields; the checklist structure is not modified). A standalone `PH6-final-release-checklist-and-signoff.md` may be created by PH7.12 using the new template; it is not a PH7.9 deliverable.
  3. **`docs/architecture/release/PH5-final-release-checklist-and-signoff.md`** — this document is **sealed** (final release decision recorded 2026-03-06) and must **not** receive new date fields. It will receive a single one-line annotation noting that it predates the taxonomy and can be retroactively interpreted as Operations-Ready as of its sign-off date. No other modification is permitted.

## 7.9.4 — Update Active Phase Plans Where Needed

- Add targeted cross-reference/terminology notes to active high-value plans without rewriting them wholesale.
- **[Amendment D — explicit plan list]** "Active high-value plans" is the following enumerated list. Only these four documents receive §7.9.4 terminology cross-reference notes. PH4.x, PH5.x, and PH5C.x plans are Historical Foundational (Amendment B carve-out) and must not be touched:
  1. **`docs/architecture/plans/PH6-Provisioning-Plan.md`** — add a terminology note near the Implementation Objective ("production-ready SharePoint site provisioning system") clarifying that this refers to the Code-Ready objective for Phase 6 implementation, and that full Production-Ready status requires Environment-Ready and Operations-Ready gates which are tracked separately per the taxonomy.
  2. **`docs/architecture/plans/ph7-project-hub/PH7-ProjectHub-15-Backend-API.md`** — add a terminology note near "A complete, production-ready backend layer" clarifying Code-Ready scope.
  3. **`docs/architecture/plans/ph7-estimating/PH7-Estimating-12-Documentation.md`** — add terminology notes at the two "production-ready for developer handoff" occurrences (lines ~1059, ~1089), clarifying Code-Ready scope.
  4. **`docs/architecture/plans/ph7-remediation/PH7.12-Final-Verification-and-Sign-Off.md`** — §7.12.5 already uses the taxonomy ("Record whether Phase 7 is Code-Ready, Environment-Ready, and Operations-Ready") as a forward reference. Add a cross-link to `docs/reference/release-readiness-taxonomy.md` once the reference doc is published by this phase.
- **[Amendment G — coordination note]** The §7.9.4 cross-reference annotations in the four named plans must be applied **before** PH7.10 runs its classification pass. PH7.10 will add classification headers/banners to many of these same documents; if PH7.9 notes are placed first, PH7.10 should treat them as already present and not duplicate or conflict with them. This coordination must be verified at the start of PH7.10 execution.

## 7.9.5 — Publish the Readiness Reference Doc

- Create `docs/reference/release-readiness-taxonomy.md` with definitions, language rules, examples, anti-patterns, and template snippets.
- **[Amendment E — required reference doc sections]** The reference doc must contain the following sections as mandatory content (not optional):
  1. **Taxonomy definitions** — canonical one-paragraph definitions of Code-Ready, Environment-Ready, Operations-Ready, Production-Ready (composite), and N/A/Deferred (Amendment A), each with a one-sentence verification test ("this level is met when…").
  2. **Language rules** — the full rule set from §7.9.2, including the grandfather clause (Amendment B) reproduced verbatim.
  3. **Anti-pattern: "production-ready" as implementation objective** — using the live PH6 example (`"Deliver a production-ready SharePoint site provisioning system"`) as the primary illustration. Show the before (original), explain why it conflates Code-Ready with Production-Ready, then show the correct replacement phrasing.
  4. **Grandfathered-language registry** — explicit list of historical patterns that are not violations: (a) "Production-Ready Code:" section headings in PH4C/PH5C plans; (b) ADR Context sections using "production-ready." Contributors auditing old docs must consult this registry before filing issues.
  5. **Release sign-off template** — a full Markdown template for a future phase release sign-off document. Must include: per-level date fields (Code-Ready date, Environment-Ready date, Operations-Ready date, Production-Ready date), the staged sign-off model ruling (Amendment F), N/A/Deferred field handling, and three named sign-off roles (Architecture Owner, Product Owner, Operations/Support Owner).
  6. **Adopter guidance** — a short section for the "N/A / Deferred" use case: when to use it, what rationale is required, and how to transition a field from Deferred to one of the three positive states.
- **[Amendment F — staged vs. all-or-nothing sign-off ruling]** The reference doc and the release sign-off template must state the following explicitly: sign-off for each readiness level is recorded **when that level is achieved**, not all at once. A release doc may be open with Code-Ready captured while Environment-Ready is still pending. The Production-Ready field is filled only when all three levels have been captured. A final release decision (equivalent to the PH5 "APPROVED FOR PRODUCTION" statement) requires all three levels to be signed off and dated. The architecture owner is responsible for all three gates; the product owner for Code-Ready and Production-Ready; the operations/support owner for Operations-Ready only. Environment-Ready is a factual infrastructure checklist — no named sign-off is required, but the date must be recorded.
- **[Amendment G — ADR coordination note]** The reference doc is a **reference document** (Diátaxis quadrant). It is not an ADR. PH7.11 §7.11.1 will create the ADR for the release-readiness taxonomy decision — `ADR-0083` (next in sequence after ADR-0082). PH7.9 must add a placeholder note at the bottom of the reference doc: `> **Note:** The architectural decision to adopt this taxonomy is recorded in ADR-0083. See [ADR index](../architecture/adr/).` This ensures the reference doc links to its governance decision once PH7.11 executes.

---

## Deliverables

- `docs/reference/release-readiness-taxonomy.md` — full reference doc with all six mandatory sections (Amendment E)
- `docs/architecture/release/release-signoff-template.md` — reusable release sign-off template with per-level date fields (Amendment C)
- one-line annotation on `docs/architecture/release/PH5-final-release-checklist-and-signoff.md` only — no structural changes (Amendment C)
- readiness classification annotation block on `PH6.16-CICD-Documentation.md §6.16.12` (Amendment C)
- terminology cross-reference notes in four named active plans (Amendment D)

---

## Acceptance Criteria Checklist

- [ ] Code-Ready, Environment-Ready, Operations-Ready, and N/A/Deferred are defined (Amendment A).
- [ ] "Production-ready" has a constrained meaning and the language rules include the grandfather clause for locked historical documents (Amendment B).
- [ ] `docs/architecture/release/release-signoff-template.md` exists with per-level date fields and staged sign-off model (Amendment C).
- [ ] PH5 sealed release doc is annotated only — not structurally modified (Amendment C).
- [ ] PH6.16 §6.16.12 has a readiness classification annotation (Amendment C).
- [ ] Terminology notes added to the four named active plans: PH6 master plan, PH7-ProjectHub-15, PH7-Estimating-12, PH7.12 (Amendment D).
- [ ] Reference doc contains all six mandatory sections including grandfathered-language registry, anti-pattern example, and sign-off template (Amendment E).
- [ ] Staged vs. all-or-nothing sign-off model is ruled explicitly in the reference doc (Amendment F).
- [ ] Reference doc contains ADR-0083 placeholder note (Amendment G).
- [ ] PH7.9 annotations applied before PH7.10 runs its classification pass (Amendment G coordination).
- [ ] Future contributors have examples and template snippets.

---

## Verification Evidence

- updated docs list
- spot-check of at least two active plans/release docs using the taxonomy correctly
- verify PH5 sealed doc was not structurally modified
- build/lint/type-check if any structured config/docs tooling is touched

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.9 started: YYYY-MM-DD
PH7.9 completed: YYYY-MM-DD

Artifacts:
- `docs/reference/release-readiness-taxonomy.md`
- `docs/architecture/release/release-signoff-template.md`
- annotation on `docs/architecture/release/PH5-final-release-checklist-and-signoff.md`
- annotation on `PH6.16-CICD-Documentation.md §6.16.12`
- terminology notes in PH6-Provisioning-Plan.md, PH7-ProjectHub-15-Backend-API.md, PH7-Estimating-12-Documentation.md, PH7.12-Final-Verification-and-Sign-Off.md

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
