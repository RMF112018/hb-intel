# PH7.11 — ADRs, Reference Docs & Developer Rules

**Version:** 1.1 (amended after PH7.11R validation — 2026-03-09)
**Purpose:** Lock Phase 7 stabilization decisions into durable governance artifacts so the platform does not regress after remediation is complete.
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.
**Implementation Objective:** Publish the ADRs, reference docs, and developer-rule updates required to make Phase 7 decisions traceable, enforceable, and discoverable. Resolve the ADR catalog conflicts identified in PH7.10R and deferred to this phase.

---

## Prerequisites

- PH7.1 through PH7.10 materially complete or draft-complete.
- **[Amendment C prerequisite]** PH7.9 implementation status must be confirmed before §7.11.3: if `docs/reference/release-readiness-taxonomy.md` and `docs/architecture/release/release-signoff-template.md` do not exist on disk, their creation becomes a PH7.11 §7.11.3 deliverable (not merely an indexing task).
- Review the current ADR naming/indexing conventions and the root lint/developer-rule infrastructure.

---

## Source Inputs

- ADR catalog in `docs/architecture/adr/` (93 files on disk as of 2026-03-09)
- `docs/architecture/adr/README.md` (the ADR-local index — severely stale, only 8 entries)
- `docs/README.md` (docs root index — 74 ADR entries, missing ADR-0073 through ADR-0079 and ADR-0082)
- `docs/architecture/blueprint/current-state-map.md` §2.2 (ADR Catalog Conflict Registry)
- `.eslintrc.base.js` and `packages/eslint-plugin-hbc/src/`
- developer how-to guides in `docs/how-to/developer/`
- Phase 7 task outputs (PH7.8 test governance, PH7.9 release semantics, PH7.10 doc classification)

---

## 7.11.1 — Create the Required ADR Set

**[Amendment A — corrected minimum ADR set with definitive numbering]**

The following ADR set reflects what is genuinely new as of PH7.11. Items already covered by existing accepted ADRs are explicitly noted to prevent redundant or contradictory ADR creation.

### Already-covered decisions — no new ADR required

- **Tier-1 shared-feature primitive policy**: fully covered by ADR-0079 (shared-feature-packages), ADR-0080 (bic-next-move), ADR-0081 (complexity-dial), ADR-0082 (sharepoint-docs-pre-provisioning-storage). Do not create a fifth ADR on this topic.
- **Auth dual-mode foundation and ownership boundary**: covered by ADR-0053-auth-dual-mode-foundation, ADR-0056-central-auth-session-permission-state, and ADR-0057-role-mapping-and-authorization-governance. Before creating a new auth-store ADR, audit these three against Phase 7 shell/auth hardening decisions. If a Phase 7 decision is not covered, use the conditional slot below.
- **Shell decomposition boundary**: covered by ADR-0058-shell-composition-and-core-layout-architecture. Same conditional rule as auth store.

### Confirmed new ADRs — create in this phase

**ADR-0083 — Release-Readiness Taxonomy**
- Reserved in PH7.9 Amendment G. This number is confirmed.
- Scope: defines the three-level taxonomy (Code-Ready / Environment-Ready / Operations-Ready → Production-Ready), the N/A/Deferred fourth state, the grandfather clause for locked docs, and the staged sign-off model.
- File: `docs/architecture/adr/ADR-0083-release-readiness-taxonomy.md`
- Must reference PH7.9 plan and `docs/reference/release-readiness-taxonomy.md`.

**ADR-0084 — Current-State Source-of-Truth and Documentation Governance Model**
- Scope: locks the source-of-truth hierarchy (current-state-map §1, six tiers), the six-class documentation classification model (current-state-map §2), the Tier 1/2 banner system, the classification maintenance rule, and the doc-as-code update policy.
- File: `docs/architecture/adr/ADR-0084-current-state-governance-model.md`
- Must reference current-state-map.md §2, §2.1, PH7.10 plan.

**ADR-0085 — Test Governance Normalization**
- Scope: locks the Vitest P1 workspace structure (root `vitest.workspace.ts` covering five P1 packages), per-package coverage thresholds (branches: 95), the CI `unit-tests-p1` job, the `@hbc/complexity` cyclic-dependency resolution (removal of phantom `@hbc/ui-kit` dependency), and the `resolve.alias` pattern for source-path test resolution.
- File: `docs/architecture/adr/ADR-0085-test-governance-normalization.md`
- Must reference PH7.8 plan and `docs/reference/package-testing-matrix.md`.

### Conditional new ADRs — create only if audit confirms a gap

**ADR-0086 (conditional) — Auth Store Phase 7 Refinement**
- Create only if audit of ADR-0053, ADR-0056, and ADR-0057 confirms that a Phase 7-specific auth store decision (e.g., from PH7.x shell/auth hardening) is not captured. If no gap exists, record "no new ADR required — see ADR-0053/0056/0057" in the PH7.11 progress notes.

**ADR-0087 (conditional) — Shell Decomposition Phase 7 Refinement**
- Create only if audit of ADR-0058 confirms a Phase 7-specific shell decomposition decision is not captured. Same no-ADR documentation rule if covered.

### Numbers reserved for conflict-resolution renaming (see §7.11.2)

- **ADR-0088**: `ADR-0013-hbc-theme-context.md` — this file reused number 0013 (occupied by ADR-0013-data-access-comprehensive-rebuild.md). It must be renumbered to ADR-0088.
- **ADR-0089**: `0014-fluent-tokens-over-hbc-constants.md` — an un-prefixed file containing the "Fluent tokens over HBC constants" decision (2026-03-07). Not captured in the §2.2 conflict registry; this is an additional un-prefixed file beyond the four listed in §2.2. It must receive proper prefix and the next sequential number.

**Definitive numbering state after PH7.11:**
ADR-0083 through ADR-0089 assigned as above. Next available after PH7.11 completion: ADR-0090 (or ADR-0088/0089 if conditional ADRs 0086/0087 are not created, shifting the renaming slots down accordingly). The progress notes must record the exact final next-available number.

---

## 7.11.2 — Update ADR Indexing and Discoverability

**[Amendment B — full reconciliation scope specified]**

The ADR index is in a multi-source conflict state. This section covers four distinct tasks, all of which must be completed before any new ADRs are linked.

### Task B-1 — Rebuild the ADR README

`docs/architecture/adr/README.md` currently lists only 8 entries against 93 files on disk. It must be rebuilt with all accepted ADRs organized by phase/domain group. Minimum required sections: Core Infrastructure (PH1–PH3), UI Kit & Design System (PH4), Auth & Shell (PH5/PH5C), Provisioning & Backend (PH6), Shared Feature Primitives (PH7 SF-01–SF-03), Phase 7 Stabilization (PH7.x). The "How to Add a New ADR" block must be updated to state the correct next-available number (ADR-0090 post-PH7.11, or the corrected number after conflict resolution). The stale bullet list claiming ADR-0053 = shimmer must be corrected per the canonical resolution below.

### Task B-2 — Fill the docs/README.md ADR index gap

The docs/README.md ADR index currently ends at ADR-0072 / ADR-PH5C-01 / ADR-0080 / ADR-0081. The following entries are missing and must be added in sequential order:
- ADR-0073 (phase-5c-final-verification-and-sign-off)
- ADR-0074 (shimmer-utility-convention — canonical number, after conflict resolution)
- ADR-0075 (dev-auth-bypass-storybook-boundary — canonical number)
- ADR-0076 (project-identifier-model)
- ADR-0077 (provisioning-package-boundary)
- ADR-0078 (security-managed-identity)
- ADR-0079 (shared-feature-packages)
- ADR-0082 (sharepoint-docs-pre-provisioning-storage)
- All new ADRs created in §7.11.1 (ADR-0083 through final number)

### Task B-3 — Resolve the four duplicate-numbered pairs

Each resolution requires a canonical ruling. The rulings are as follows:

**ADR-0013 (two files):**
- `ADR-0013-data-access-comprehensive-rebuild.md` — retains number 0013. Original Phase 2 decision. No change.
- `ADR-0013-hbc-theme-context.md` — must be renamed to `ADR-0088-hbc-theme-context.md`. Update all internal references to reflect new number. Add to index as ADR-0088.

**ADR-0053 (two files):**
- `ADR-0053-auth-dual-mode-foundation.md` — retains number 0053. Original Phase 5.1 decision; indexed in docs/README.md under 0053.
- `ADR-0053-shimmer-utility-convention.md` — stale copy. The canonical numbering is `ADR-0074-shimmer-utility-convention.md` (already exists). The stale 0053 shimmer copy must be archived (move to a `docs/architecture/adr/archived/` folder or equivalent). Update ADR README to reflect 0053 = auth-dual-mode-foundation (matching docs/README.md), not shimmer.

**ADR-0054 (two files):**
- `ADR-0054-shell-navigation-foundation.md` — retains number 0054. Original Phase 5.1 decision; indexed in docs/README.md under 0054.
- `ADR-0054-dev-auth-bypass-storybook-boundary.md` — stale copy. Canonical is `ADR-0075-dev-auth-bypass-storybook-boundary.md` (already exists). Archive the 0054 stale copy. Update ADR README to reflect 0054 = shell-navigation-foundation.

**ADR-0055 (two files with a third related file):**
- `ADR-0055-dual-mode-authentication-architecture.md` — retains number 0055. Original Phase 5.2 decision; indexed in docs/README.md under 0055.
- `ADR-0055-deprecated-token-removal-policy.md` — the canonical version of this decision must be determined by cross-referencing with `ADR-PH4C-02-deprecated-token-policy.md`. If ADR-PH4C-02 and ADR-0055-deprecated-token are the same decision, one must be designated canonical (recommend keeping the phase-prefixed form `ADR-PH4C-02-deprecated-token-policy.md` as it already has its own unique slot) and the 0055 deprecated-token copy archived. If they are different decisions, the 0055 deprecated-token copy needs a new number. Record the ruling in progress notes.

### Task B-4 — Handle all five un-prefixed files

The current-state-map §2.2 listed four un-prefixed files. A fifth exists. All five must be resolved:

| File | Canonical Disposition |
|------|-----------------------|
| `0014-fluent-tokens-over-hbc-constants.md` | **Not in §2.2 registry** — additional un-prefixed file. Rename to `ADR-0089-fluent-tokens-over-hbc-constants.md`. Update §2.2 registry to record this fifth item. |
| `0060-project-identifier-model.md` | Stale copy — canonical is `ADR-0076-project-identifier-model.md`. Archive the un-prefixed copy. |
| `0061-provisioning-package-boundary.md` | Stale copy — canonical is `ADR-0077-provisioning-package-boundary.md`. Archive. |
| `0062-bearer-token-managed-identity.md` | Stale copy — canonical is `ADR-0078-security-managed-identity.md`. Archive. |
| `0063-signalr-per-project-groups.md` | No canonical ADR-NNNN equivalent found on disk. Create `ADR-XXXX-signalr-per-project-groups.md` at the next available number after PH7.11 primary ADRs, OR confirm this decision is superseded by a later ADR (e.g., ADR-0063-access-control-backend-and-data-model). Record ruling in progress notes. |

After Task B-3 and B-4, update `current-state-map.md §2.2` to reflect the resolved state: strike completed items and add a "Resolved: YYYY-MM-DD" notation.

---

## 7.11.3 — Publish Reference Docs Produced by Phase 7

**[Amendment C — prerequisite dependency + expanded reference doc list]**

**Prerequisite check (run before this section):** Verify that `docs/reference/release-readiness-taxonomy.md` and `docs/architecture/release/release-signoff-template.md` exist on disk. If they do not exist (PH7.9 not yet implemented), create them as PH7.11 deliverables following the PH7.9 plan v1.1 §7.9.3 artifact scope. Do not proceed past this check without one of these two outcomes: (a) docs confirmed to exist, or (b) docs created here.

**Reference docs to verify are indexed and linked from docs/README.md:**

| Doc | Exists? | Status |
|-----|---------|--------|
| `docs/architecture/blueprint/current-state-map.md` | Yes | Linked from docs/README.md ✓ |
| `docs/reference/platform-primitives.md` | Yes | Linked from docs/README.md ✓ |
| `docs/reference/package-testing-matrix.md` | Yes | **NOT linked from docs/README.md** — add link |
| `docs/reference/ui-kit/complexity-sensitivity.md` | Yes | **NOT linked from docs/README.md** — add link |
| `docs/reference/release-readiness-taxonomy.md` | Pending PH7.9 | Add link once created |
| `docs/architecture/release/release-signoff-template.md` | Pending PH7.9 | Add link once created |
| `docs/reference/auth-shell-architecture-contracts.md` | Yes | **NOT linked from docs/README.md** — add link (as a group) |
| `docs/reference/auth-shell-governance-and-policies.md` | Yes | **NOT linked** — include in auth-shell group link |
| `docs/reference/auth-shell-store-contracts-and-state-diagrams.md` | Yes | **NOT linked** — include in auth-shell group link |
| `docs/reference/auth-shell-provider-adapter-and-runtime-modes.md` | Yes | **NOT linked** — include in auth-shell group link |
| `docs/reference/auth-shell-deferred-scope-roadmap.md` | Yes | **NOT linked** — include in auth-shell group link |
| `docs/reference/auth-shell-validation-and-release-package.md` | Yes | **NOT linked** — include in auth-shell group link |

The auth-shell docs (6 files) should be linked as a group under a "Auth & Shell Reference" subsection in docs/README.md.

---

## 7.11.4 — Update Developer Rules / Guidance

**[Amendment D — concrete guide specification]**

Four concrete items, distinguishing updates from new creation:

**Update 1 — `docs/how-to/developer/integrate-auth-with-your-feature.md`**
Add a section: "Tier-1 Platform Primitives: Mandatory Use." Reference ADR-0079 through ADR-0082 and `docs/reference/platform-primitives.md`. Note that if a feature's concern area overlaps with BIC next-move, Complexity Dial, or SharePoint Docs, the respective primitive is mandatory (not optional). Link the decision tree in `platform-primitives.md`.

**Update 2 — `docs/how-to/developer/local-dev-setup.md`**
Add a "Test Governance" section covering: (a) `vitest.workspace.ts` root workspace entries for P1 packages, (b) per-package Vitest config conventions, (c) coverage threshold requirements (statements/branches: 95), (d) how to run `pnpm test --filter @hbc/<package>` locally, (e) reference to `docs/reference/package-testing-matrix.md` for the full matrix.

**Update 3 — `docs/how-to/developer/bic-module-adoption.md`**
Add a cross-reference to the Tier-1 mandatory-use policy. Ensure the guide notes that BIC next-move is now Tier-1 (not optional) per ADR-0080 and the Platform Primitives Registry.

**Create — `docs/how-to/developer/phase-7-governance-guide.md`**
New guide consolidating the five Phase 7 governance decisions into a single onboarding reference. Sections:
1. Source-of-Truth Hierarchy (current-state-map §1, six tiers, conflict resolution rule)
2. Documentation Classification (six-class model, how to read banners, where the matrix lives)
3. Test Governance (Vitest workspace, P1 coverage thresholds, CI job, `package-testing-matrix.md`)
4. Release-Readiness Terminology (three levels, N/A/Deferred state, no "Production-Ready Code:" in new docs, link to taxonomy and sign-off template)
5. Tier-1 Platform Primitives (mandatory-use rule, decision tree, link to primitives registry)
This is the single document a developer joining after PH7 needs to understand all Phase 7 governance decisions.

---

## 7.11.5 — Assess Rule/Lint Opportunities

**[Amendment E — evaluation record added for traceability]**

Evaluate whether any Phase 7 decisions should be mechanically enforced. Only add rules where the target is stable and low-noise. The following candidates were evaluated during PH7.11R:

| Candidate | Assessment | Ruling |
|-----------|------------|--------|
| Tier-1 primitive enforcement ("don't implement BIC/complexity patterns without the primitive") | Cannot determine intent from AST alone; high false-positive risk. Target is semantically complex. | **Not appropriate for lint at this stage.** |
| `no-production-ready` string in code comments | Applies to plan docs, not code. Not a lint target. | **Documentation governance only.** |
| No direct `@fluentui/react-components` imports in app code | Already enforced by `no-direct-fluent-import` rule in `@hb-intel/eslint-plugin-hbc`. | **Existing rule sufficient; no new rule needed.** |
| Fluent tokens over HBC constants in theme-responsive surfaces | Already addressed by `enforce-hbc-tokens` rule. ADR-0089 (fluent-tokens decision) documents the rationale. | **Existing rule sufficient.** |
| Readiness terminology in new docs ("Production-Ready Code:" heading prohibition) | Not a lint target (Markdown content governance). Developer guidance (§7.11.4) is the enforcement mechanism. | **Not a lint target.** |

**Conclusion:** No new lint rules are added in PH7.11. The existing 12 rules in `@hb-intel/eslint-plugin-hbc` adequately cover Phase 7 decisions. This evaluation record is permanent — future phases should reference it before re-evaluating the same candidates.

---

## Deliverables

- ADR-0083 (`release-readiness-taxonomy.md`)
- ADR-0084 (`current-state-governance-model.md`)
- ADR-0085 (`test-governance-normalization.md`)
- ADR-0086 (conditional — auth store Phase 7 refinement; or explicit "no new ADR" note)
- ADR-0087 (conditional — shell decomposition Phase 7 refinement; or explicit "no new ADR" note)
- `ADR-0088-hbc-theme-context.md` (rename from `ADR-0013-hbc-theme-context.md`)
- `ADR-0089-fluent-tokens-over-hbc-constants.md` (rename/prefix from `0014-fluent-tokens-over-hbc-constants.md`)
- Archived stale duplicate files: ADR-0053-shimmer, ADR-0054-dev-auth-bypass, ADR-0055-deprecated-token (stale copies), and un-prefixed 0060–0063
- Rebuilt `docs/architecture/adr/README.md` (full index)
- Updated `docs/README.md` ADR index (ADR-0073 through 0089; auth-shell reference group)
- Updated `current-state-map.md §2.2` (conflicts marked resolved)
- Linked reference docs in `docs/README.md` (package-testing-matrix, complexity-sensitivity, auth-shell group, readiness taxonomy, sign-off template)
- `docs/reference/release-readiness-taxonomy.md` (if PH7.9 not yet implemented)
- `docs/architecture/release/release-signoff-template.md` (if PH7.9 not yet implemented)
- Updated developer guides: `integrate-auth-with-your-feature.md`, `local-dev-setup.md`, `bic-module-adoption.md`
- New developer guide: `docs/how-to/developer/phase-7-governance-guide.md`
- No lint rule changes (evaluation record in §7.11.5)

---

## Acceptance Criteria Checklist

- [x] ADR-0083, ADR-0084, ADR-0085 created and accepted (Amendment A).
- [x] ADR-0086 and ADR-0087: either created (if gap confirmed) or "no new ADR" explicitly recorded in progress notes (Amendment A).
- [x] `ADR-0088-hbc-theme-context.md` exists; original `ADR-0013-hbc-theme-context.md` removed/archived (Amendment B-3, B Task B-4).
- [x] `ADR-0089-fluent-tokens-over-hbc-constants.md` exists; original un-prefixed file removed/archived (Amendment B-4).
- [x] Four duplicate-numbered pairs resolved per canonical rulings in §7.11.2 Task B-3; stale copies archived.
- [x] Un-prefixed files 0060–0063 archived (canonical ADR-0076–ADR-0078 confirmed); 0063 signalr ruling recorded in progress notes (Amendment B-4).
- [x] `docs/architecture/adr/README.md` rebuilt with all ADRs and correct next-available number (Amendment B-1).
- [x] `docs/README.md` ADR index gap filled (ADR-0073 through ADR-0090) (Amendment B-2).
- [x] `current-state-map.md §2.2` updated to mark resolved conflicts (Amendment B).
- [x] PH7.9 prerequisite check performed and recorded in progress notes; readiness taxonomy and sign-off template either confirmed to exist or created here (Amendment C).
- [x] `docs/README.md` Reference Documents section links: `package-testing-matrix.md`, `complexity-sensitivity.md`, auth-shell group (6 docs), readiness taxonomy, sign-off template (Amendment C).
- [x] `integrate-auth-with-your-feature.md` updated with Tier-1 primitive mandatory-use section (Amendment D).
- [x] `local-dev-setup.md` updated with test governance section (Amendment D).
- [x] `bic-module-adoption.md` updated with Tier-1 policy cross-reference (Amendment D).
- [x] `docs/how-to/developer/phase-7-governance-guide.md` created with all five governance sections (Amendment D).
- [x] Lint evaluation record present in §7.11.5; no new lint rules added (Amendment E).
- [x] Definitive next-available ADR number after PH7.11 recorded in progress notes (Amendment F).
- [x] Phase 7 governance is durable rather than relying on memory or chat history.

---

## Verification Evidence

- ADR files created; ADR index rebuilt and validated
- docs/README.md link validation (no dead links)
- duplicate files archived or removed; `ls docs/architecture/adr/ | sort` confirms no remaining un-prefixed or duplicate-numbered files
- `current-state-map.md §2.2` conflicts marked resolved
- lint/build/type-check confirming no regressions (if any config changed)

---

## Progress Notes Template

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.11 started: 2026-03-09
PH7.11 completed: 2026-03-09

ADRs created:
- ADR-0083: release-readiness-taxonomy.md — Accepted
- ADR-0084: current-state-governance-model.md — Accepted
- ADR-0085: test-governance-normalization.md — Accepted
- ADR-0086: not required — audit of ADR-0053/0056/0057 confirmed Phase 5 auth decisions comprehensively cover Phase 7 shell/auth hardening; no gap exists
- ADR-0087: not required — audit of ADR-0058 confirmed Phase 5 shell decomposition decision covers Phase 7 scope; no gap exists
- ADR-0088: hbc-theme-context.md (renumbered from ADR-0013-hbc-theme-context.md duplicate)
- ADR-0089: fluent-tokens-over-hbc-constants.md (prefixed from un-prefixed 0014)
- ADR-0090: signalr-per-project-groups.md (prefixed/renumbered from un-prefixed 0063; distinct decision from ADR-0063-access-control)

ADR catalog conflict resolution:
- Duplicate pairs resolved: ADR-0013 (hbc-theme-context → ADR-0088), ADR-0053 (shimmer archived → canonical ADR-0074), ADR-0054 (dev-auth-bypass archived → canonical ADR-0075), ADR-0055 (deprecated-token archived → canonical ADR-PH4C-02)
- Un-prefixed files handled: 0014 (→ ADR-0089), 0060 (archived, canonical ADR-0076), 0061 (archived, canonical ADR-0077), 0062 (archived, canonical ADR-0078), 0063 (→ ADR-0090, distinct SignalR decision not superseded by ADR-0063-access-control)
- ADR-0055-deprecated-token ruling: same decision as ADR-PH4C-02; 0055 copy archived, ADR-PH4C-02 retained as canonical
- Next-available ADR number after PH7.11: ADR-0091

PH7.9 prerequisite:
- release-readiness-taxonomy.md: existed (created PH7.9, 2026-03-09)
- release-signoff-template.md: existed (created PH7.9, 2026-03-09)

Indexes updated:
- docs/architecture/adr/README.md: rebuilt with all 90 active ADRs + 6 archived, organized by phase/domain
- docs/README.md: ADR index filled (ADR-0073 through ADR-0090), reference docs section expanded with package-testing-matrix, complexity-sensitivity, auth-shell group (6 docs), readiness taxonomy, sign-off template

Developer guides:
- integrate-auth-with-your-feature.md: updated with Tier-1 Platform Primitives mandatory-use section
- local-dev-setup.md: updated with Test Governance section
- bic-module-adoption.md: updated with Tier-1 mandatory-use policy cross-reference
- phase-7-governance-guide.md: created with 5 sections (source-of-truth hierarchy, doc classification, test governance, release-readiness terminology, Tier-1 platform primitives)

Verification:
- build: pending
- lint: N/A (no code changes)
- check-types: N/A (no code changes)
- link validation: manual review complete

Notes:
- unresolved items: none
- deferred items with rationale: none
-->
