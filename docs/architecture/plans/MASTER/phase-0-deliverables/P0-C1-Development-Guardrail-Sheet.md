> **Doc Classification:** Canonical Normative Plan — Workstream C development guardrail sheet; makes architectural rules explicit and enforceable for the HB Intel program as of Phase 0 execution (2026-03-16).

# P0-C1 Development Guardrail Sheet

## Purpose

This sheet consolidates the architectural rules that must be followed throughout the HB Intel program. It is the single reference for enforcement decisions when reviewing code, plans, or package changes. Violations require documented justification approved through the exception path defined in §9.

---

## Guardrail G-01 — UI Ownership

**Rule:** All reusable visual UI primitives, layout/composition primitives, and shared theme/token contracts belong in `@hbc/ui-kit`. Feature packages may compose `@hbc/ui-kit` components and may contain thin, feature-local composition shells only.

**Hard boundaries:**
- Creating reusable visual primitives outside `@hbc/ui-kit` without a documented governed exception (ADR-0116) is a violation.
- UI-bearing components exist outside `@hbc/ui-kit` only when tightly coupled to package-specific behavior or runtime state and governed by an ADR exception.
- Package location does not exempt a surface from HB Intel's standards for visual quality, hierarchy, theming, accessibility, field readiness, responsiveness, documentation, and verification.
- The benchmark surface for visual quality is the Personal Work Hub / PWA *(Personal Work Hub = the `apps/pwa` Progressive Web App; SPFx surfaces follow the same standards with `apps/pwa` as the reference implementation — see ADR-0116 for the full definition.)* (per ADR-0116).

**Enforcement:**
- Code review: Verify all new reusable UI belongs in `@hbc/ui-kit` or has ADR exception
- ESLint: Future extension to detect duplicated visual primitives outside `@hbc/ui-kit`
- Governing sources: ADR-0016 through ADR-0028 (UI system ADRs), ADR-0116 (UI doctrine)

---

## Guardrail G-02 — Package Dependency Direction

**Rule:** Dependency direction must flow in layers: `@hbc/models` → platform packages (Category A/B) → shared-feature primitives (Category C) → feature packages (Category D) → apps (Category E). Reverse dependencies are prohibited.

**Hard boundaries:**
- Feature packages must not import from other feature packages directly (no cross-feature coupling).
- Apps may depend on feature packages, shared primitives, and platform packages — never the reverse.
- `backend/functions` may only import from `@hbc/models` (types only) — no imports from feature packages, shared primitives, or apps.
- Shared-feature primitives (Category C) may depend on platform packages (Category A/B) but not on feature packages (Category D) or apps (Category E).
- Adding a dependency that violates direction requires an Architecture Decision Record (ADR) before code is merged.

**Enforcement:**
- Code review: Confirm all new imports follow direction before merge
- Dependency audit: Scope checks in verification workflow to detect violations early
- Governing sources: ADR-0001 (monorepo bootstrap), ADR-0002 (ports/adapters data access), `package-relationship-map.md`

---

## Guardrail G-03 — Feature Package Isolation

**Rule:** Feature packages must not become dependency hubs for other feature packages. Shared logic that spans feature areas belongs in a shared-feature primitive (Category C) or platform package (Category A), not duplicated across features.

**Hard boundaries:**
- Feature packages (`packages/features/*`) map 1:1 to a business domain and, where applicable, to an SPFx app under `apps/`.
- Feature packages export source directly (`main: "./src/index.ts"`) — they are not compiled libraries.
- Each feature package must not introduce new external runtime dependencies without confirming in `package-relationship-map.md` that the dependency is architecturally correct.
- Cross-feature logic must be placed in the designated shared-feature primitive (Category C), not copied across features.

**Enforcement:**
- Code review: Block PRs that add cross-feature imports between feature packages
- Architecture audit: Review each feature package quarterly to detect patterns of dependency-hub growth
- **Automated enforcement:** Dependency cycle detection in CI is a planned Phase 1 investment. Until then, code review and quarterly architecture audits are the primary controls. Developers should run local tooling (e.g., `pnpm ls --depth=1` or workspace dependency audit) before introducing new cross-package dependencies.
- Governing sources: `.claude/rules/03-package-boundaries.md`, `package-relationship-map.md`, ADR-0001

---

## Guardrail G-04 — Production Path Restrictions

**Most critical guardrail.** This section prevents mock-backed, scaffold-backed, or incomplete packages from reaching production.

### 4.1 Absolutely Prohibited in Production Flows

The following packages are **permanently excluded from all production data paths**. They must never appear in production request chains, data transformations, or decision logic:

| Package | Maturity Label | Reason | When Allowed |
|---------|---|---|---|
| `@hbc/data-seeding` | excluded-from-production-path | Development/demo data seeding only | Dev harness, local testing, demo environments only |
| `apps/dev-harness` | excluded-from-production-path | Unified development environment with mock mode | Local development, CI test sandboxes only |

**Enforcement:** Any production code path that imports these packages is a build violation and will fail CI.

### 4.2 Scaffold-Only: Allowed Only When Fully Implemented

The following packages are labeled `scaffold-only` in the Production Readiness Matrix. They **must not** appear in production flows **until upgraded to at least `usable-but-incomplete`** with documented gap assessment and production adapter completion confirmed:

| Package | Category | Current Status | Blocking Condition |
|---------|---|---|---|
| `@hbc/post-bid-autopsy` | C | v0.0.1 scaffold-only | Incomplete: SF22 T08-T09 UI surfaces and lifecycle/storage orchestration. Assigned to Phase 7 per OD-007. Deferred from Phase 1 per D-010. |
| `@hbc/strategic-intelligence` | C | v0.0.1 scaffold-only | Incomplete: Runtime adapters and BD heritage integration. SF22 T08–T09 (Phase 7) gated on this reaching `usable-but-incomplete`; upgrade timeline tracked via OD-016. Deferred from Phase 1 per D-010. |
| `@hbc/ai-assist` | C | v0.0.1 scaffold-only | Incomplete: Pre-Implementation Research Directive; Azure tenant integration and Smart Insert UI. Deferred from Phase 1 per D-010; phase assignment pending OD-013. |
| `@hbc/features-accounting` | D | v0.0.0 scaffold-only | Scope: No production implementation; Phase 1+ delivery scope |
| `@hbc/features-leadership` | D | v0.0.0 scaffold-only | Scope: No production implementation; Phase 2 delivery scope |
| `@hbc/features-safety` | D | v0.0.0 scaffold-only | Scope: No production implementation; Phase 3+ delivery scope |
| `@hbc/features-quality-control-warranty` | D | v0.0.0 scaffold-only | Scope: No production implementation; Phase 4 delivery scope |
| `@hbc/features-risk-management` | D | v0.0.0 scaffold-only | Scope: No production implementation; Phase 5+ delivery scope |
| `@hbc/features-operational-excellence` | D | v0.0.0 scaffold-only | Scope: No production implementation; Phase 5+ delivery scope |
| `@hbc/features-human-resources` | D | v0.0.0 scaffold-only | Scope: No production implementation; Phase 6+ delivery scope |
| `@hbc/spfx-leadership` | E | scaffold-only | Depends on: @hbc/features-leadership (v0.0.0) |
| `@hbc/spfx-safety` | E | scaffold-only | Depends on: @hbc/features-safety (v0.0.0) |
| `@hbc/spfx-quality-control-warranty` | E | scaffold-only | Depends on: @hbc/features-quality-control-warranty (v0.0.0) |
| `@hbc/spfx-risk-management` | E | scaffold-only | Depends on: @hbc/features-risk-management (v0.0.0) |
| `@hbc/spfx-operational-excellence` | E | scaffold-only | Depends on: @hbc/features-operational-excellence (v0.0.0) |
| `@hbc/spfx-human-resources` | E | scaffold-only | Depends on: @hbc/features-human-resources (v0.0.0) |
| `@hbc/hb-site-control` | E | scaffold-only | Scope: No production implementation; Phase 6 delivery scope |

**Rule:** Any `import` of a `scaffold-only` package in a production module or adapter is a build violation enforced by ESLint rule `@hb-intel/hbc/no-stub-implementations` (ADR-0095). CI will fail the `lint-and-typecheck` job.

### 4.3 usable-but-incomplete: Allowed Only with Gating

Packages labeled `usable-but-incomplete` may be used in production **only** when:
1. The package is explicitly listed in the active Phase 0 or Phase 1 deliverable scope, OR
2. An exception has been approved by the program architecture lead (see §9)

Examples of `usable-but-incomplete` packages currently allowed in Wave 0 production:
- `@hbc/data-access` (v0.0.1) — mock adapters in use; real SharePoint/Graph adapters being developed
- `@hbc/auth` (0.2.0) — See separate rule below
- `@hbc/shell`, `@hbc/app-shell`, `@hbc/ui-kit` (pilot-ready or usable-but-incomplete) — as listed in P0-B1
- Feature packages and apps in active Wave 0 closeout (Estimating, Project Hub, Business Development, Admin, PWA)

**Rule:** Do not introduce a new `usable-but-incomplete` package into a production flow without explicit gate approval.

### 4.4 Mock Auth and Dev Adapters

`@hbc/auth` operates in dual mode:
- **Dev mode (mock authentication):** Permitted in local development and CI test environments only.
- **Production mode (MSAL):** Required for staging and production deployments.

**Hard rule:** Mock auth adapters are **prohibited in staging or production deployments**. Failing to switch to production auth mode before staging promotion is a gating failure.

### 4.5 Enforcement Mechanisms

**Layer 1 — ESLint:** Rule `@hb-intel/hbc/no-stub-implementations` (error level) detects stub patterns including `throw new Error('not implemented')`, `throw new Error('placeholder')`, and template literal variants with case-insensitive matching at lint time in dev and CI. See `docs/reference/developer/stub-enforcement-ci.md` for the complete detection pattern specification.

**Layer 2 — CI grep scan:** After ESLint in the `lint-and-typecheck` job, a secondary grep scan catches edge cases (`.js` files, generated code outside ESLint scope).

**Layer 3 — Developer tool:** `pnpm scan-stubs` provides local CI-equivalent verification before push.

**Escape hatch:** Add `// stub-approved: <reason>` on the line preceding a stub throw when the deferral is intentional and approved. All approved stubs are tracked in the stub inventory.

**Governing sources:** ADR-0095 (stub-detection enforcement), P0-B1 (Production Readiness Matrix), `stub-enforcement-ci.md`

---

## Guardrail G-05 — Shared Primitive Mandatory Use

**Rule:** As of Phase 0, all Category C packages are **Tier-1 Platform Primitives** when their concern area is present in a feature. Features must use the designated primitive; creating local re-implementations is prohibited.

### Mandatory Use Table

| Concern Area | Owning Package | Rule | When Allowed |
|---|---|---|---|
| Auth / RBAC | `@hbc/auth` | All auth flows, permission checks, guard logic through `@hbc/auth` | Never |
| Offline persistence | `@hbc/session-state` | All draft management, operation queueing, IndexedDB through `@hbc/session-state` | Never |
| Action ownership / BIC | `@hbc/bic-next-move` | All action-ownership tracking and module registration through `@hbc/bic-next-move` | Never |
| Notifications | `@hbc/notification-intelligence` | All notification registration, delivery, and priority tiering | Never |
| Workflow handoff | `@hbc/workflow-handoff` | All cross-module work transfers | Never |
| Record relationships | `@hbc/related-items` | All cross-module record relationship panels | Never |
| Dashboard canvas | `@hbc/project-canvas` | Role-based configurable dashboards | Never |
| Version history | `@hbc/versioned-record` | All version history, diff, badge rendering | Never |
| Reusable UI | `@hbc/ui-kit` | All reusable visual UI (see G-01) | Composition shells only |
| Personal work aggregation | `@hbc/my-work-feed` | All personal work aggregation (ADR-0115) | Never |
| Complexity gating | `@hbc/complexity` | All tier-based display gating | Never |
| Empty states | `@hbc/smart-empty-state` | Context-aware empty states and guided onboarding | Never |

**Hard rule:** Any feature that re-implements a concern owned by a Tier-1 Primitive is a violation. Code review must block the PR.

**Governing sources:** `shared-package-no-go-rules.md`, Platform Primitives Registry, ADR-0115

---

## Guardrail G-06 — ADR Authority and Durable Decisions

**Rule:** Durable architectural reversals, new packages, new runtime surfaces, and new external dependencies require an Architecture Decision Record (ADR) before implementation proceeds. ADRs are append-only; no retroactive modification of decision rationale.

**Decisions requiring an ADR:**
- New external runtime dependency
- New workspace package
- Durable architectural reversal or override of locked invariant
- Divergence from existing ADRs
- New runtime surface that diverges between PWA and SPFx
- Exception to any guardrail in this sheet

**ADR filing process:**
1. Create file at `docs/architecture/adr/ADR-00XX.md` with next available number
2. Document decision, context, alternatives, and consequences
3. Include rationale for any guardrail exception
4. Obtain approval from program architecture lead
5. Reference the ADR in the PR and in code comments where the decision applies

**Current ADR reservation:** To determine the next available ADR number, consult `docs/architecture/adr/` catalog before filing. As of Phase 0 baseline (2026-03-16), ADR-0117 was the next unreserved number — but verify current state before use.

**Governing sources:** `docs/architecture/adr/` catalog, current-state-map.md §2.1

---

## Guardrail G-07 — Exception-Handling Process

Guardrail exceptions are rare and require formal approval. The process is:

### Step 1: Identify the Guardrail
Cite the specific rule (e.g., G-01, G-04, G-05).

### Step 2: Document Justification
Write justification in an ADR or as a comment in an ADR. Informal email or chat justification is not sufficient.

### Step 3: Obtain Approval
- **Standard exception approval:** Program architecture lead
- **G-04 (production path) exceptions:** Program architecture lead **and** delivery/program lead
- **G-02 (dependency direction) exceptions:** Program architecture lead

### Step 4: Set Resolution Target
Every exception must include a target milestone for resolution. If the exception cannot be time-bounded, it must be made permanent via a new ADR documenting why the exception cannot be avoided (see G-06 for the ADR filing process).

### Step 5: Record the Exception
Add the exception to the Open Decisions Register (P0-E2) with:
- Guardrail being excepted
- Date approved
- ADR reference or comment ID
- Approval signature
- Target resolution milestone

**Violation:** Teams that proceed without exception approval are in violation and subject to PR rejection at code review.

---

## Guardrail G-08 — Architecture Governance Checklist

**For pull request and plan reviewers.** Use this checklist to catch violations before merge:

- [ ] **G-02 (Dependency Direction)** — Does this change add or remove a package dependency? Verify direction is correct per `package-relationship-map.md`. Reverse dependencies or cross-feature coupling must have an ADR.
- [ ] **G-01 (UI Ownership)** — Does this change create a UI component? Verify it belongs in `@hbc/ui-kit` or has a documented governed exception (ADR). Feature packages may contain composition shells only.
- [ ] **G-03 (Feature Isolation)** — Does this change introduce cross-feature coupling or duplicate shared logic? Verify shared logic is placed in the correct Category C primitive or platform package.
- [ ] **G-02 (Dependency Hygiene)** — Does this change add a new external dependency? Verify `package-relationship-map.md` was consulted. If not already listed, an ADR is required before merge.
- [ ] **G-04 (Production Restrictions)** — Does this change reference a `scaffold-only` or `excluded-from-production-path` package in a production flow? **Block immediately** — G-04 violation.
- [ ] **G-05 (Mandatory Primitives)** — Does this change re-implement a concern already owned by a Tier-1 Platform Primitive? **Block immediately** — G-05 violation. Redirect to the owning primitive.
- [ ] **G-06 (ADR Authority)** — Does this change constitute a durable architectural reversal, add a new package, add a new external dependency, or diverge from an existing ADR? **ADR required before merge.**
- [ ] **G-07 (Exception Approval)** — Does this change require an exception to any guardrail? Exception approval must be obtained and recorded in P0-E2 before merge.

---

## Governing Sources

| Document | Purpose | Authority Level |
|---|---|---|
| `docs/architecture/blueprint/current-state-map.md` (v1.0, 2026-03-16) | Inventory of all workspace members and their maturity labels | Present-truth authority |
| `docs/architecture/blueprint/package-relationship-map.md` | Dependency direction, category assignment, ownership | Dependency authority |
| `docs/architecture/plans/MASTER/phase-0-deliverables/P0-B1-Production-Readiness-Matrix.md` | Maturity labels, production path restrictions, blockers | Phase 0 execution baseline |
| `.claude/rules/02-architecture-invariants.md` | Locked architectural guardrails | Operational doctrine |
| `.claude/rules/03-package-boundaries.md` | UI ownership, dependency hygiene, shared logic placement | Operational doctrine |
| `.claude/rules/05-implementation-quality.md` | Code quality priorities and testing expectations | Operational doctrine |
| `docs/reference/developer/agent-authority-map.md` | Agent and developer source routing for authority delegation | Operational doctrine |
| `docs/reference/developer/shared-package-no-go-rules.md` | Tier-1 Primitive mandatory use rules | Phase 0 execution |
| `docs/reference/developer/stub-enforcement-ci.md` | Stub detection, CI enforcement, escape hatch | Phase 0 execution |
| ADR-0001 | Monorepo bootstrap and package categories | Locked decision |
| ADR-0002 | Ports/adapters data access architecture | Locked decision |
| ADR-0095 | Stub detection and incomplete implementation enforcement | Locked decision |
| ADR-0116 | UI governance, ownership, visual conformance | Locked decision |
| ADR-0115 | My Work aggregation, exclusive ownership | Locked decision |
| `docs/reference/platform-primitives.md` | Tier-1 Primitive registry and mandatory use matrix | Platform guidance |
| `docs/architecture/adr/` (all ADRs) | Durable architectural decisions | Locked decisions |

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-03-16 | Workstream C | Initial creation from Phase 0 source authorities |
