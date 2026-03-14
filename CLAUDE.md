**Revised CLAUDE.md** (Version 1.6)

# CLAUDE.md

**HB Intel – AI Coding Agent Orchestration Guide**
**Version:** 1.6 (Updated 2026-03-14 — Package Relationship Map added as required reference for all dependency and package-boundary decisions)
**Locked Sources:**
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` (complete target architecture)
- `docs/architecture/plans/hb-intel-foundation-plan.md` (exhaustive numbered implementation instructions)
- `docs/architecture/blueprint/current-state-map.md` (present implementation truth — governs over historical plans when in conflict; must be read before any structural or architectural action)

**Program Narrative & Planning Layer (read for context; does not govern present-state truth):**
- `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md` — Canonical Normative Plan; synthesizes all 20 interview-locked doctrine decisions, delivery history, platform architecture, and operating doctrine into a single program narrative. **Does NOT replace current-state-map.md as the present-state authority.** Read before any cross-cutting architectural, product, or documentation work.
- `docs/architecture/blueprint/HB-Intel-Dev-Roadmap.md` — Canonical Normative Plan; consolidated execution delivery roadmap; defines the wave structure (Foundation / Wave 0 → Wave 1 → Wave 2 → Wave 3 → Convergence), dual-stream SPFx/PWA sequencing doctrine, readiness gates, and long-range SPFx sunset strategy. **Does NOT replace detailed branch plans for task-level implementation.** Read when planning delivery sequence, sprint structure, or wave-level scope.

**Package Architecture Reference (required for dependency and package-boundary decisions):**
- `docs/architecture/blueprint/package-relationship-map.md` — Canonical Normative Plan; comprehensive map of every package in `packages/`, its architectural layer, owned concerns, public exports, dependency relationships, consumer list, maturity status, correct usage guidance, and anti-patterns. **Does NOT replace current-state-map.md or any ADR.** Must be consulted before: adding a new package dependency, creating a new package, moving code across package boundaries, or reviewing whether an existing dependency direction is architecturally correct. Identifies known boundary risks including a circular dependency in the intelligence layer (§ Dependency / Boundary Risks) that must be resolved before Wave 1 intelligence feature work begins.

**Purpose**
This file is the single binding operating manual for any coding agent acting on this repository. Every response, plan, and code output must derive exclusively from the four locked/program-narrative sources above plus the expanded documentation requirements and Phase 7 governance rules defined in this version. The agent is responsible for **comprehensive, living documentation** aligned with 2026 elite-team best practices (Diátaxis framework, audience separation, "Docs as code") and for **maintaining all Phase 7 stabilization decisions** as permanently binding constraints.

## 1. Immutable Core Directives (Non-Negotiable)

1. **Read-First Rule**
   Before any action, confirm you have the full current contents of `CLAUDE.md`, the Blueprint, the Foundation Plan, **and the Current-State Map**. The current-state map (`docs/architecture/blueprint/current-state-map.md`) is the Tier 1 present-truth authority — it contains the source-of-truth hierarchy (§1), the document classification system (§2), the ADR catalog conflict registry (§2.2), and all Phase 7 governance decisions. For cross-cutting architectural or product work, also read `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md` to orient against the program narrative and doctrine. Quote the exact section (e.g., "Blueprint §2d", "Foundation Plan Phase 2.4", "current-state-map §2.1", or "Unified Blueprint §7.2") in every response.

2. **Zero-Deviation Rule**
   Any deviation from the blueprint, foundation plan, current-state map, active ADRs, or the documentation structure below must be rejected immediately with a reference to the violated section. ADRs ADR-0083 through ADR-0090 (created in Phase 7) are binding locked decisions — they may not be reversed, modified, or worked around without a superseding ADR. See §6.3 for the full list.

3. **Token-Efficient Workflow (mandatory for every task)**
   a. State the exact phase/section being executed.
   b. Output a 3-line plan only.
   c. Generate or edit only the files required for that incremental step.
   d. End with exact verification commands.
   Never output more than one phase's worth of work unless explicitly requested.

4. **Document Classification Rule (mandatory for every new file)**
   Every new architecture, plan, reference, or release document must declare one of the six permitted document classes at creation time — either via an inline Tier 1 banner or by being added to the matrix in `current-state-map.md §2`. The six classes and their usage rules are defined in `current-state-map.md §2.1`. Creating an unclassified document is a violation of the Zero-Deviation Rule. Deferred Scope documents may not be updated or acted upon without a reclassification to Canonical Normative Plan and an active phase assignment.

5. **Guarded Commit Rule (mandatory for all repository commits)**

All coding agents **must use the repository’s Guarded Auto-Commit workflow** for every commit. Direct use of `git commit` by an agent is strictly prohibited.

The guarded commit workflow enforces deterministic, auditable commits that only occur when a task is fully complete and the repository is in a validated state.

### Required commit mechanism

Agents must commit using:

```bash
pnpm guarded:commit --config <task-config>
```

The guarded commit CLI (`scripts/guarded-auto-commit.ts`) enforces the following mandatory gates:

### Completion Gate

The task configuration must declare:

```json
taskStatus: "complete"
```

If the task is not marked complete, the commit is refused.

### Path Scope Gate

All changed files must match the `approvedPaths` allowlist defined in the task configuration.

The workflow validates changed files using:

```
git status --porcelain=1 -z
```

If any changed file falls outside the approved paths, the commit is refused.

### Quality Gates

The following validation commands must succeed before a commit is allowed:

1. tests
2. typecheck
3. build

These commands are defined in the task configuration and executed sequentially. Any failure blocks the commit.

### Commit Metadata Gate

The commit subject must include:

* the task identifier (`taskId`)
* a concise completion summary

Example:

```
chore(sf18): complete SF18-T04 — Hooks & State Model implemented
```

The repository’s existing commit style template is the default format.

### Safety and Auditability Requirements

The guarded commit workflow must always:

* create **local commits only** (never push automatically)
* output explicit `[PASS]`, `[FAIL]`, or `[SKIP]` logs for each gate
* refuse commits with a clear failure reason
* support `--dry-run` mode for validation without committing
* refuse execution when `--disable-guard` is used unless explicitly allowed by configuration

Example dry-run:

```bash
pnpm guarded:commit --config <task-config> --dry-run
```

6. **UI Ownership Rule**
   All reusable visual UI components must be owned by `@hbc/ui-kit`. No package outside `@hbc/ui-kit` may introduce new standalone presentational components, visual primitives, or duplicate component implementations. Feature and shared packages may only:
   - compose `@hbc/ui-kit` components,
   - provide headless/domain logic, adapters, hooks, and state orchestration,
   - define thin feature-local composition shells only when they contain no reusable visual primitive behavior.

   If a package requires new reusable UI, that UI must be created or extended in `@hbc/ui-kit` first and then imported into the consuming package. Any exception requires an ADR.

7. **Package Relationship Rule (mandatory for all dependency and package-boundary decisions)**
   Before adding a new dependency, creating a new package, moving code across package boundaries, or evaluating whether an existing dependency is appropriate, the agent **must** consult `docs/architecture/blueprint/package-relationship-map.md`. This map defines the 11-layer architecture, all current package relationships verified against live code, maturity assessments, and known boundary risks. The map must be read alongside `current-state-map.md` — the map explains *relationships and rules*, while current-state-map provides *present implementation truth*. Key constraints from the map that govern all package work:
   - Dependency direction must flow downward only (higher layers depend on lower layers; no upward dependencies).
   - Scaffold packages (`@hbc/health-indicator`, `@hbc/score-benchmark`, `@hbc/strategic-intelligence`, `@hbc/post-bid-autopsy`) must not be used in production paths without a plan to complete their implementation.
   - The circular dependency between `@hbc/score-benchmark` and `@hbc/post-bid-autopsy` must be resolved (via ADR) before any Wave 1 intelligence feature work proceeds.
   - Feature packages must not depend on other feature packages. Cross-feature behavior belongs in Layer 6–7 platform primitives.
   - `@hbc/ui-kit` requires `@hbc/auth` to be initialized first — provider order must be: auth → complexity → ui-kit consumers.

### Agent Compliance Requirements

Agents **must**:

* commit only through `pnpm guarded:commit`
* ensure `taskStatus="complete"`
* restrict file changes to approved paths
* pass tests, typecheck, and build before committing
* include the task identifier in the commit subject

Agents **must not**:

* run `git commit` directly
* bypass validation gates
* commit failing builds or tests
* commit files outside the task scope
* push commits automatically

Violating this rule constitutes a **Zero-Deviation Rule breach**.

## 2. Development Sequence (Strictly Enforced)
Follow `docs/architecture/plans/hb-intel-foundation-plan.md` **exactly** in order:
Phase 0 → Phase 1 (root config) → Phase 2 (shared packages) → Phase 3 (dev-harness) → Phase 4 (PWA) → Phase 5 (SPFx webparts) → Phase 6 (HB Site Control) → Phase 7 (backend) → Phase 8 (CI/CD) → Phase 9 (verification).

MVP rollout priority: Accounting → Estimating → Project Hub → Leadership → Business Development.

**Wave-level delivery sequence:** For stage-by-stage delivery structure (Foundation/Wave 0, MVP Wave 1–3, Future Production, Convergence), readiness gates (app pilot, MVP-complete, PWA MVP, SPFx retirement), and dual-stream SPFx/PWA doctrine, consult `docs/architecture/blueprint/HB-Intel-Dev-Roadmap.md`. This roadmap governs delivery sequencing decisions above the task-plan level.

**Phase 7 status:** Phase 7 P1 stabilization remediation is governed by `docs/architecture/plans/ph7-remediation/PH7.1` through `PH7.12`. PH7.12 is the final gate plan. No feature-expansion phase may begin until PH7.12 acceptance criteria are fully satisfied and the Phase 7 sign-off ADR (ADR-0090) is created.

## 3. Architecture Enforcement Rules
(unchanged from v1.1 – ports/adapters, Zustand, TanStack Router, dual-mode auth, provisioning saga, ui-kit with HB Intel Design System, etc.)

**Addendum v1.3 — Package Boundary Enforcement:** The ESLint boundary rules established in PH7.5/7.6 are active in `packages/eslint-plugin-hbc/`. These rules are non-optional and enforced by `pnpm turbo run lint`. Any proposed change that would require disabling or bypassing a boundary rule requires an ADR before the change may proceed.

## 4. Documentation Strategy (Mandatory – Diátaxis Framework)
The agent **must** produce and maintain comprehensive documentation as a core deliverable of every phase. All documentation follows the Diátaxis framework and the exact folder structure below:

```
docs/
├── README.md
├── tutorials/              # Learning-oriented (onboarding)
├── how-to/                 # Goal-oriented (user, administrator, developer)
├── reference/              # Technical facts (API, config, glossary)
├── explanation/            # Conceptual understanding
├── user-guide/             # End-user manual
├── administrator-guide/
├── maintenance/            # Runbooks (backup, patching, monitoring, DR)
├── troubleshooting/        # Known issues & common errors
├── architecture/
│   ├── adr/                # Architecture Decision Records (one .md per decision)
│   ├── diagrams/
│   ├── plans/              # Development plans
│   └── blueprint/          # Locked blueprints + current-state-map
├── release-notes/
├── security/
└── faq.md
```

**Core Principles the Agent Must Enforce**
- **Diátaxis**: Every new document goes into the correct quadrant (Tutorials / How-to / Reference / Explanation).
- **Audience Separation**: Clear entry points for Users, Administrators, Developers, and Operations.
- **"Docs as code"**: All files are Markdown, version-controlled, and updated with every change.
- **Minimal root clutter**: Only essential config files at repository root; everything else is under `docs/`, `packages/`, `apps/`, etc.
- **ADR Standard**: Every significant decision must have an ADR in `docs/architecture/adr/`. Next available ADR number: **ADR-0091** (ADR-0083 through ADR-0090 assigned in PH7.11 and PH7.12).
- **Automation-Ready**: Structure supports CI linting (Vale), link checking, and future Docusaurus/MkDocs publishing.

After **every phase or major task**, the agent must:
- Create or update the relevant documentation files in the correct `docs/` subfolders (e.g., developer how-to guide after Phase 2, new ADR for any locked decision).
- Maintain the living audit trail in the blueprint and foundation plan (see rule 5 below).
- Update `current-state-map.md §2` if any new document is created (add matrix row or apply Tier 1 banner per §2.1).

## 5. Document Update Rules (Mandatory)

Different documents in this repository have different update policies. Agents must follow the correct policy for each document class.

- **Blueprint V4 & Foundation Plan** (Historical Foundational / locked reference): Never change, delete, rephrase, or rearrange any original content. Insert comments **only** under `<!-- IMPLEMENTATION PROGRESS & NOTES -->` at the end of each file (or inline `<!-- PROGRESS: ... -->` after completed sections). Example comment block:
  ```markdown
  <!-- IMPLEMENTATION PROGRESS & NOTES
  Phase X completed: YYYY-MM-DD
  Documentation added: docs/how-to/developer/phase-x-guide.md
  ADR created: docs/architecture/adr/0002-ports-adapters.md
  Next: Phase Y
  -->
  ```
- **CLAUDE.md** (this file): Living document — update directly with versioned content changes. Do not accumulate a comment block. Bump the version header on each substantive update. Record changes in §9 (Document History) rather than in HTML comments.
- **Current-State Map**: Living document — update §1 and §2 as the repository evolves. Never remove or reclassify existing rows without an accompanying ADR.
- **Unified Blueprint** (`HB-Intel-Unified-Blueprint.md`): Living Canonical Normative Plan — update directly when doctrine, scope, or program narrative changes. Bump the document version and record changes in its footer metadata. Never add HTML comment blocks.
- **Full Documentation** (`docs/` subtree): Actively generate proper Markdown files in the Diátaxis structure. These are full, professional documents — not comment-only.

## 6. Build System & Commands
(unchanged from v1.1)

## 6.1 UI Kit Dual Entry-Point Guidance (Final)

When implementing UI in this repository, select imports by runtime target:

- `@hbc/ui-kit` — full component library for PWA, dev-harness, and non-constrained bundles.
- `@hbc/ui-kit/app-shell` — shell-only exports for constrained contexts (notably SPFx webparts).
- `@hbc/ui-kit/theme` — token/theme-only imports for styling without component payload.
- `@hbc/ui-kit/icons` — icon-only imports where components are unnecessary.

Rules:
- Do not import full `@hbc/ui-kit` into SPFx shell-only surfaces when `/app-shell` satisfies the use case.
- Prefer the narrowest entry point that meets requirements to preserve bundle budgets.
- Keep entry-point usage consistent with `docs/reference/ui-kit/entry-points.md` and `packages/ui-kit/DESIGN_SYSTEM.md`.

## 6.2 Vercel Preview-Only Policy

- `vercel.json` is reserved for preview and validation environments only.
- Production deployment contracts remain governed by the platform-specific CI/CD paths defined in the architecture plans.
- Do not introduce or modify Vercel production routing/build behavior without an explicit ADR and plan update.

## 6.3 Phase 7 Governance Rules (Binding — added v1.3)

Phase 7 P1 stabilization produced a set of locked decisions that govern all future development. These decisions are permanently binding and may only be changed by creating a superseding ADR with explicit rationale. The agent must treat any action that would reverse, weaken, or work around these decisions as a Zero-Deviation Rule violation.

### 6.3.1 — Binding ADRs (PH7 series)

The following ADRs are locked as of Phase 7. They must be confirmed as existing on disk before any PH7.12 work proceeds (see PH7.11 scope). Next available number after PH7: **ADR-0091**.

| ADR | Title | Locked Decision Summary |
|-----|-------|------------------------|
| ADR-0083 | Release-Readiness Taxonomy | Three-level taxonomy (Code-Ready / Environment-Ready / Operations-Ready → Production-Ready); N/A/Deferred fourth state; staged sign-off model |
| ADR-0084 | Current-State Source-of-Truth and Documentation Governance Model | Six-tier source-of-truth hierarchy; six-class doc classification system; Tier 1/2 banner system; doc-as-code update policy |
| ADR-0085 | Test Governance Normalization | Vitest P1 workspace (5 packages); `branches: 95` coverage; CI `unit-tests-p1` job; `@hbc/complexity` cyclic-dependency resolution |
| ADR-0086 | Auth Store Boundary Audit (conditional) | Auth dual-mode isolation decisions from PH7.2 — create only if PH7.2 audit found gaps not covered by ADR-0053/0056/0057 |
| ADR-0087 | Shell Decomposition Boundary Audit (conditional) | Shell surface narrowing decisions from PH7.3 — create only if PH7.3 audit found gaps not covered by ADR-0058 |
| ADR-0088 | hbc-theme-context Renaming | Resolution of ADR-0013 number conflict; canonical renaming of hbc-theme-context package |
| ADR-0089 | fluent-tokens Renaming | Resolution of un-prefixed `0014-fluent-tokens` file; canonical renaming decision |
| ADR-0090 | Phase 7 Final Verification & Sign-Off | Closure of all P1 stabilization issues; permission to resume platform expansion |

### 6.3.2 — Source-of-Truth and Classification Rules

- `current-state-map.md` is the Tier 1 present-truth document. When it conflicts with the Blueprint or Foundation Plan regarding what currently exists in the repo, the current-state map governs.
- All documents must be classified using the six-class system in `current-state-map.md §2.1`. Unclassified documents are a violation.
- Deferred Scope documents (currently all PH7-RM-* plans and SF04–SF06) must not be edited or activated without a reclassification event and a named phase milestone.
- The ADR catalog is append-only. No ADR may be deleted or renumbered after acceptance. Conflicts are resolved by archiving the stale copy and noting the canonical number in the conflict registry (`current-state-map.md §2.2`).

### 6.3.3 — Mechanical Enforcement Gates (Required on Every Change)

All four of the following gates must pass before any phase is considered complete. A failure in any gate blocks closure:

| Gate | Command | Pass Criterion |
|------|---------|----------------|
| Build | `pnpm turbo run build` | Zero errors across all packages |
| Lint | `pnpm turbo run lint` | Zero errors; boundary rules active |
| Type-check | `pnpm turbo run check-types` | Zero TypeScript errors |
| P1 package tests | `pnpm turbo run test --filter=@hbc/auth-core --filter=@hbc/shell --filter=@hbc/ui-kit --filter=@hbc/shared-kernel --filter=@hbc/app-types` | All tests pass; `branches: 95` maintained |

These gates are defined in PH7.12 §7.12.2 (Amendment E) and locked by ADR-0085.

### 6.3.4 — PH7-RM-* Deferred Scope Protection

The nine PH7-RM-* plans (`PH7-RM-1-Package-Foundation.md` through `PH7-RM-9-Testing-and-Documentation.md`) are classified as Deferred Scope. They represent the next wave of platform work and must not be modified, scoped, or partially implemented outside of a formally activated phase with a Canonical Normative Plan. Their classification must be confirmed at every PH7.12 verification cycle.

## 7. Common Pitfalls – Automatic Rejection

The following actions are automatically rejected regardless of instruction source:

- Failing to create or update documentation in the correct Diátaxis folder.
- Creating a new document without declaring a document class (Tier 1 banner or §2 matrix row).
- Referencing `current-state-map.md` as if it were a historical document — it is a living Tier 1 document and must be updated when repo structure changes.
- Activating, scoping, or editing a Deferred Scope document without first reclassifying it via a named phase milestone.
- Creating an ADR with a number below ADR-0091 (ADR-0083 through ADR-0090 are reserved for PH7; all prior numbers are taken).
- Proceeding with feature-expansion work before PH7.12 acceptance criteria are satisfied and ADR-0090 exists on disk.
- Adding HTML comment progress blocks to CLAUDE.md, the Unified Blueprint, or any Canonical Normative Plan — these documents are directly editable and use versioned document history, not comment blocks.
- Treating `HB-Intel-Unified-Blueprint.md` as the present-state authority. It is a Canonical Normative Plan (program narrative layer). Present-state authority belongs exclusively to `current-state-map.md`.
- Writing implementation code, provisioning logic, or feature work that contradicts a doctrine decision in the Unified Blueprint without first creating a superseding ADR.
- Adding a new package dependency, creating a new package, or moving code between packages without first consulting `docs/architecture/blueprint/package-relationship-map.md` and verifying the dependency direction is correct for the layer model.
- Depending on scaffold intelligence packages (`@hbc/score-benchmark`, `@hbc/post-bid-autopsy`, `@hbc/strategic-intelligence`, `@hbc/health-indicator`) in a production path without an explicit plan to complete the scaffold implementation.
- Proceeding with Wave 1 intelligence or scoring features while the circular dependency between `@hbc/score-benchmark` and `@hbc/post-bid-autopsy` remains unresolved.

## 8. Verification Protocol

After every change:

1. `pnpm turbo run build` — must pass (zero errors)
2. `pnpm turbo run lint` — must pass (boundary rules enforced)
3. `pnpm turbo run check-types` — must pass (zero type errors)
4. `pnpm turbo run test` (P1 filter) — must pass (five P1 packages, `branches: 95`)
5. Validate dev-harness
6. Confirm all new documentation files exist in the correct `docs/` location and follow Diátaxis structure.
7. Confirm any new document has a declared classification (Tier 1 banner or `current-state-map.md §2` matrix row).
8. Confirm `current-state-map.md §1` and §2 are up to date with any structural changes made in this session.

---

**Agent Session Anchor (copy-paste into every new session):**
"You are now the HB Intel implementation agent. All actions are governed exclusively by `CLAUDE.md` v1.6, `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`, `docs/architecture/plans/hb-intel-foundation-plan.md`, `docs/architecture/blueprint/current-state-map.md`, and — for program narrative and doctrine context — `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md`. Read all five before acting on any cross-cutting architectural or product task. For delivery sequencing and wave-level planning decisions, also read `docs/architecture/blueprint/HB-Intel-Dev-Roadmap.md`. For any work involving packages, dependencies, or package boundaries, also read `docs/architecture/blueprint/package-relationship-map.md` (§1 directive 7). Phase 7 governance decisions (ADR-0083 through ADR-0090, §6.3) are permanently binding. Document classification is mandatory for every new file (§1 directive 4). CLAUDE.md is a directly-editable living document — do not add comment blocks to it. Begin every response by stating the exact phase/section you are executing. Documentation is a core deliverable. Proceed only when the user confirms the current phase."

---

## 9. Document History

| Version | Date | Changes |
|---------|------|---------|
| v1.0 | (prior) | Initial CLAUDE.md for HB Intel project |
| v1.1 | (prior) | Added documentation strategy, Diátaxis framework requirement |
| v1.2 | (prior) | Added Diátaxis folder violation to common pitfalls |
| v1.3 | (prior) | Phase 7 Governance Integration — PH7 stabilization decisions binding; current-state-map added as third locked source; document classification rule; guarded commit rule; UI ownership rule; §6.1–6.3 |
| v1.4 | 2026-03-14 | **Unified Blueprint program narrative layer established.** `HB-Intel-Unified-Blueprint.md` (v1.1) added as program narrative reference. CLAUDE.md promoted to directly-editable living document — §5 updated to define per-document-class update policies and remove comment-block approach for CLAUDE.md and Canonical Normative Plans. Agent session anchor updated to reference v1.4 and unified blueprint. §7 pitfalls updated with three new entries. §9 Document History section added. Companion files updated: `current-state-map.md §2` (3 new matrix rows), `docs/README.md` ("Start here" navigation), `HB-Intel-Blueprint-Crosswalk.md §11`. Reports: `HB-Intel-Unified-Blueprint-Authoring-Report.md`, `HB-Intel-Unified-Blueprint-Refinement-Report.md`. |
| v1.5 | 2026-03-14 | **Delivery Roadmap added as planning layer.** `HB-Intel-Dev-Roadmap.md` registered in Program Narrative & Planning Layer block with description of wave structure, dual-stream doctrine, and readiness gates. §2 Development Sequence extended with wave-level delivery reference. Agent session anchor updated to v1.5. Companion files updated: `current-state-map.md §2` (roadmap matrix row), `docs/README.md` (roadmap navigation entry), `HB-Intel-Unified-Blueprint.md §20` (cross-reference). |
| v1.6 | 2026-03-14 | **Package Relationship Map added as required reference.** `docs/architecture/blueprint/package-relationship-map.md` created from live codebase inspection of all 35 packages — covers architectural layer model (11 layers), full package catalog with dependency relationships, maturity assessments, correct usage guidance, and anti-patterns. New §1 directive 7 (Package Relationship Rule) added, requiring map consultation before all dependency/boundary decisions. Key risks called out: circular dependency in intelligence layer (score-benchmark ↔ post-bid-autopsy), scaffold intelligence packages, ui-kit→auth tight coupling, and over-wide BD feature dependency surface. Four new pitfall entries added to §7. Agent session anchor updated to v1.6. Companion file: `docs/architecture/blueprint/package-relationship-map-report.md`. |

**Next required action:** PH7.12 Final Verification and Sign-Off — ADR-0090 must be created before any feature-expansion phase begins.

---

**End of CLAUDE.md**
This file is the single source of truth for agent behavior. Updates must increment the version and add a row to §9 Document History.
