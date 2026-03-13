**Revised CLAUDE.md** (Version 1.3)

# CLAUDE.md

**HB Intel – AI Coding Agent Orchestration Guide**
**Version:** 1.3 (Updated for Phase 7 Governance Integration — PH7 stabilization decisions are now binding on all future development)
**Locked Sources:**
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` (complete target architecture)
- `docs/architecture/plans/hb-intel-foundation-plan.md` (exhaustive numbered implementation instructions)
- `docs/architecture/blueprint/current-state-map.md` (present implementation truth — governs over historical plans when in conflict; must be read before any structural or architectural action)

**Purpose**
This file is the single binding operating manual for Claude Code (claude.ai/code) and any equivalent coding agent. Every response, plan, and code output must derive exclusively from the three locked sources above plus the expanded documentation requirements and Phase 7 governance rules defined in this version. The agent is responsible for **comprehensive, living documentation** aligned with 2026 elite-team best practices (Diátaxis framework, audience separation, "Docs as code") and for **maintaining all Phase 7 stabilization decisions** as permanently binding constraints.

## 1. Immutable Core Directives (Non-Negotiable)

1. **Read-First Rule**
   Before any action, confirm you have the full current contents of `CLAUDE.md`, the Blueprint, the Foundation Plan, **and the Current-State Map**. The current-state map (`docs/architecture/blueprint/current-state-map.md`) is the third required locked source as of v1.3 — it contains the source-of-truth hierarchy (§1), the document classification system (§2), the ADR catalog conflict registry (§2.2), and all Phase 7 governance decisions. Quote the exact section (e.g., "Blueprint §2d", "Foundation Plan Phase 2.4", or "current-state-map §2.1") in every response.

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

## 5. Comment-Only Update & Documentation Generation Rule (Mandatory)
- **Blueprint & Foundation Plan**: Never change, delete, rephrase, or rearrange any original content. Insert comments **only** under `<!-- IMPLEMENTATION PROGRESS & NOTES -->` at the end of each file (or inline `<!-- PROGRESS: ... -->` after completed sections).
- **Current-State Map**: Living document — update §1 and §2 as the repository evolves. Never remove or reclassify existing rows without an accompanying ADR.
- **Full Documentation**: Actively generate proper Markdown files in the `docs/` structure above. These are **not** comment-only — they are full, professional documentation.
- Example comment block (for blueprint/plan only):
  ```markdown
  <!-- IMPLEMENTATION PROGRESS & NOTES
  Phase X completed: YYYY-MM-DD
  Documentation added: docs/how-to/developer/phase-x-guide.md
  ADR created: docs/architecture/adr/0002-ports-adapters.md
  Next: Phase Y
  -->
  ```

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

(unchanged from v1.1, plus the following — added in v1.2 and v1.3):

- **v1.2:** Failing to create or update documentation in the correct Diátaxis folder.
- **v1.3:** Creating a new document without declaring a document class (Tier 1 banner or §2 matrix row).
- **v1.3:** Referencing `current-state-map.md` as if it were a historical document — it is a living Tier 1 document and must be updated when repo structure changes.
- **v1.3:** Activating, scoping, or editing a Deferred Scope document without first reclassifying it via a named phase milestone.
- **v1.3:** Creating an ADR with a number below ADR-0091 (ADR-0083 through ADR-0090 are reserved for PH7; all prior numbers are taken).
- **v1.3:** Proceeding with feature-expansion work before PH7.12 acceptance criteria are satisfied and ADR-0090 exists on disk.

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
"You are now the HB Intel implementation agent. All actions are governed exclusively by `CLAUDE.md` v1.3, `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`, `docs/architecture/plans/hb-intel-foundation-plan.md`, and `docs/architecture/blueprint/current-state-map.md`. Read all four before acting. Phase 7 governance decisions (ADR-0083 through ADR-0090, §6.3) are permanently binding. Document classification is mandatory for every new file (§1 directive 4). Begin every response by stating the exact phase/section you are executing. Documentation is a core deliverable. Proceed only when the user confirms the current phase."

---

**End of CLAUDE.md**
This file is the single source of truth. Future updates must be versioned and aligned with a new Blueprint version.
