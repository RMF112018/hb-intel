# Phase 7 Governance Guide

A single onboarding reference for all Phase 7 governance decisions. If you joined after PH7, start here.

---

## 1. Source-of-Truth Hierarchy

The HB Intel monorepo uses a six-tier hierarchy to resolve conflicts between documents. When documents disagree about what the repo currently contains, the higher tier governs.

| Tier | Document | Governs |
|------|----------|---------|
| 1 | `current-state-map.md` | Present implementation truth |
| 2 | Blueprint V4 | Target architecture intent |
| 3 | Foundation Plan | Original implementation instructions |
| 4 | ADRs | Individual architectural decisions |
| 5 | Phase/Task Plans | Phase-scoped implementation details |
| 6 | Package READMEs | Package-specific API and usage |

Each divergence between tiers is annotated as one of: **(a)** controlled evolution, **(b)** not-yet-implemented normative plan, or **(c)** superseded approach.

**Key file:** [`docs/architecture/blueprint/current-state-map.md` §1](../../architecture/blueprint/current-state-map.md)
**ADR:** [ADR-0084](../../architecture/adr/ADR-0084-current-state-governance-model.md)

---

## 2. Documentation Classification

All architecture documents belong to one of six classes:

| Class | What it means |
|-------|--------------|
| **Canonical Current-State** | What the repo currently contains — governs present truth |
| **Canonical Normative Plan** | What must be built next in an active phase |
| **Historical Foundational** | Completed phase planning; locked for audit trail |
| **Deferred Scope** | Planned work not yet assigned to an active phase |
| **Superseded / Archived Reference** | Replaced by a newer document or approach |
| **Permanent Decision Rationale** | Locked architectural decisions — ADRs |

**How to read banners:** High-risk documents carry an inline `> **Doc Classification:** [Class Name]` banner below their H1 title. If no banner, check the §2 matrix in `current-state-map.md`.

**New document rule:** Every new architecture, plan, reference, or release document must declare one of these six classes at creation time.

**Key file:** [`current-state-map.md` §2, §2.1](../../architecture/blueprint/current-state-map.md)
**ADR:** [ADR-0084](../../architecture/adr/ADR-0084-current-state-governance-model.md)

---

## 3. Test Governance

Phase 7 normalized test governance for the five P1 (platform-critical) packages.

**P1 Packages:** `@hbc/auth`, `@hbc/shell`, `@hbc/sharepoint-docs`, `@hbc/bic-next-move`, `@hbc/complexity`

**Key rules:**

- Each P1 package has a local `vitest.config.ts` with coverage thresholds (lines: 95, functions: 95, branches: 90–95, statements: 95).
- All five are registered in root `vitest.workspace.ts`.
- CI runs a dedicated `unit-tests-p1` job (no Azurite dependency).
- Run locally: `pnpm test --filter @hbc/<package>`

**Key file:** [`docs/reference/package-testing-matrix.md`](../../reference/package-testing-matrix.md)
**ADR:** [ADR-0085](../../architecture/adr/ADR-0085-test-governance-normalization.md)

---

## 4. Release-Readiness Terminology

Phase 7 established a three-level readiness taxonomy to eliminate ambiguous use of "production-ready."

| Level | Meaning |
|-------|---------|
| **Code-Ready** | Source code, tests, docs complete; CI passes on `main` |
| **Environment-Ready** | Target infrastructure provisioned and configured |
| **Operations-Ready** | Monitoring, alerting, runbooks, support handoff complete |
| **Production-Ready** | Composite — all three levels satisfied |

**Rules:**
- Do not use "production-ready" to describe code-only completion. Use "Code-Ready."
- `N/A` and `Deferred` states are permitted with a one-line rationale.
- Existing "Production-Ready Code:" headings in PH4C/PH5C plan files are grandfathered.

**Key files:**
- [`docs/reference/release-readiness-taxonomy.md`](../../reference/release-readiness-taxonomy.md)
- [`docs/architecture/release/release-signoff-template.md`](../../architecture/release/release-signoff-template.md)

**ADR:** [ADR-0083](../../architecture/adr/ADR-0083-release-readiness-taxonomy.md)

---

## 5. Tier-1 Platform Primitives

Three shared-feature packages are designated **Tier-1 Platform Primitives** — mandatory when their concern area is present in a feature:

| Primitive | Concern Area | Package |
|-----------|-------------|---------|
| BIC Next Move | Ball-in-court / ownership tracking | `@hbc/bic-next-move` |
| Complexity Dial | UI density adaptation | `@hbc/complexity` |
| SharePoint Docs | Document lifecycle management | `@hbc/sharepoint-docs` |

**Mandatory-use rule:** If a feature's domain overlaps with one of these concern areas, the feature must consume the Tier-1 primitive. Reimplementing the same capability is prohibited.

**Decision tree:** See the [Platform Primitives Registry](../../reference/platform-primitives.md) for the full decision tree, adoption matrix, and non-duplication rule.

**ADRs:** [ADR-0079](../../architecture/adr/ADR-0079-shared-feature-packages.md), [ADR-0080](../../architecture/adr/ADR-0080-bic-next-move-platform-primitive.md), [ADR-0081](../../architecture/adr/ADR-0081-complexity-dial-platform-primitive.md), [ADR-0082](../../architecture/adr/ADR-0082-sharepoint-docs-pre-provisioning-storage.md)
