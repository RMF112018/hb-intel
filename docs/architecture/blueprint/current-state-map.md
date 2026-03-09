# HB Intel — Current-State Architecture Map

**Version:** 1.0
**Status:** Canonical Current-State
**Last Updated:** 2026-03-09
**Purpose:** Single authoritative reference for the present implementation state of the HB Intel monorepo. When this document differs from historical plans or locked blueprints regarding _what exists today_, this document governs present truth.

---

## 1. Source-of-Truth Hierarchy

| Tier | Document | Classification | Update Policy | Governs |
|------|----------|---------------|---------------|---------|
| 1 | This file (`current-state-map.md`) | Canonical Current-State | Living — updated with each structural change | Present implementation truth |
| 2 | [Blueprint V4](./blueprint/HB-Intel-Blueprint-V4.md) | Canonical Normative Plan | Locked — comment-only updates | Target architecture intent |
| 3 | [Foundation Plan](./plans/hb-intel-foundation-plan.md) | Historical Foundational | Locked — comment-only updates | Original implementation instructions |
| 4 | [ADRs](./adr/) (73 records) | Permanent Decision Rationale | Append-only | Individual architectural decisions |
| 5 | Phase/Task Plans (`plans/ph7-*`, `plans/PH*.md`) | Time-bound Execution | Historical after completion | Phase-scoped implementation details |
| 6 | Package READMEs (`packages/*/README.md`) | Current Implementation Detail | Living | Package-specific API and usage |

**Conflict Resolution Rule:** When documents at different tiers disagree about what the repo _currently_ contains, Tier 1 governs. Each divergence must be annotated as one of:

- **(a) Controlled evolution** — the repo has intentionally grown beyond the original description.
- **(b) Not-yet-implemented normative plan** — the Blueprint/Plan describes a future target not yet built.
- **(c) Superseded approach** — an earlier design has been replaced by a better one.

---

## 2. Document Classification Matrix

| Document | Classification | Notes |
|----------|---------------|-------|
| `docs/architecture/current-state-map.md` | **Canonical Current-State** | This file; governs present truth |
| `docs/README.md` | **Canonical Current-State** | Living documentation index |
| `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` | **Canonical Normative Plan** | Locked target architecture |
| `docs/architecture/plans/hb-intel-foundation-plan.md` | **Historical Foundational** | Locked original implementation instructions |
| `docs/architecture/adr/ADR-0001` through `ADR-0073` | **Permanent Decision Rationale** | Append-only; 73 accepted records |
| `docs/architecture/adr/ADR-PH5C-01` | **Permanent Decision Rationale** | Phase 5C-specific decision |
| SF01–SF06 plans (completed shared-feature work) | **Historical Foundational** | Execution complete; retained for audit trail |
| PH7 domain plans (`ph7-business-development/`, `ph7-estimating/`, `ph7-project-hub/`) | **Canonical Normative Plan** | Active execution plans for Phase 7 |
| PH7 root-level plans (deleted from git index) | **Superseded / Archived Reference** | Replaced by reorganized subdirectory plans |
| `ph7-breakout-webparts/` plans | **Canonical Normative Plan** | Active execution plans for SPFx breakout |

---

## 3. Authoritative Package & Application Inventory

### Category A: Core Platform Packages (8)

| Package | Name | Primary Responsibility | Dependency Role | Maturity | Doc Entrypoint |
|---------|------|----------------------|-----------------|----------|----------------|
| `packages/models` | @hbc/models | Data types & TypeScript contracts | Foundation — no dependencies | v0.0.1 | `packages/models/README.md` |
| `packages/data-access` | @hbc/data-access | Ports/adapters data layer | Depends on models | v0.0.1 | `packages/data-access/README.md` |
| `packages/query-hooks` | @hbc/query-hooks | TanStack Query React hooks | Depends on data-access, models | v0.0.1 | `packages/query-hooks/README.md` |
| `packages/auth` | @hbc/auth | Dual-mode authentication (MSAL/dev) | Depends on models | v0.0.1 | `packages/auth/README.md` |
| `packages/shell` | @hbc/shell | Global navigation & layout | Depends on auth, models | v0.0.1 | `packages/shell/README.md` |
| `packages/app-shell` | @hbc/app-shell | Shell aggregator (read-only surface) | Depends on shell, auth, ui-kit | v0.0.1 | `packages/app-shell/README.md` |
| `packages/ui-kit` | @hbc/ui-kit | Design system & component library | Depends on auth, complexity, models | v2.1.0 | `packages/ui-kit/DESIGN_SYSTEM.md` |
| `packages/provisioning` | @hbc/provisioning | SignalR provisioning saga | Depends on auth, models | v0.1.0 | `packages/provisioning/README.md` |

### Category B: Shared Infrastructure (2)

| Package | Name | Primary Responsibility | Dependency Role | Maturity | Doc Entrypoint |
|---------|------|----------------------|-----------------|----------|----------------|
| `packages/spfx` | @hbc/spfx | SPFx webpart scaffolding & utilities | Depends on auth, sharepoint-docs, ui-kit | v0.0.1 | `packages/spfx/README.md` |
| `packages/eslint-plugin-hbc` | @hb-intel/eslint-plugin-hbc | Component consumption lint rules | None (standalone tool) | v1.0.0 | `packages/eslint-plugin-hbc/README.md` |

### Category C: Shared-Feature Primitives (3)

These packages are **Tier-1 Platform Primitives** — mandatory-use when their concern area is present in a feature. See [Platform Primitives Registry](../../reference/platform-primitives.md) for policy, decision tree, adoption matrix, and non-duplication rule. <!-- PH7.4: elevated from optional to Tier-1 per §7.4.1 -->

| Package | Name | Primary Responsibility | Dependency Role | Maturity | Doc Entrypoint |
|---------|------|----------------------|-----------------|----------|----------------|
| `packages/bic-next-move` | @hbc/bic-next-move | Ball-in-court & ownership primitives | Depends on ui-kit | v0.1.0 | `packages/bic-next-move/README.md` |
| `packages/complexity` | @hbc/complexity | 3-tier density context (Complexity Dial) | Depends on ui-kit | v0.1.0 | `packages/complexity/README.md` |
| `packages/sharepoint-docs` | @hbc/sharepoint-docs | Document lifecycle management | Depends on auth, models, data-access, ui-kit | v0.1.0 | `packages/sharepoint-docs/README.md` |

### Category D: Feature Packages (11)

All feature packages are at v0.0.0 (scaffold stage), export source directly (`main: "./src/index.ts"`), and share the same core dependency set: `@hbc/{models, query-hooks, ui-kit, auth, shell}`.

| Package | Name | Domain |
|---------|------|--------|
| `packages/features/accounting` | @hbc/features-accounting | Accounting |
| `packages/features/estimating` | @hbc/features-estimating | Estimating |
| `packages/features/project-hub` | @hbc/features-project-hub | Project Hub |
| `packages/features/leadership` | @hbc/features-leadership | Leadership |
| `packages/features/business-development` | @hbc/features-business-development | Business Development |
| `packages/features/admin` | @hbc/features-admin | Admin |
| `packages/features/safety` | @hbc/features-safety | Safety |
| `packages/features/quality-control-warranty` | @hbc/features-quality-control-warranty | Quality Control & Warranty |
| `packages/features/risk-management` | @hbc/features-risk-management | Risk Management |
| `packages/features/operational-excellence` | @hbc/features-operational-excellence | Operational Excellence |
| `packages/features/human-resources` | @hbc/features-human-resources | Human Resources |

### Category E: Applications (14)

#### SPFx WebParts (11)

All SPFx apps use Vite + React 18, build to `dist/`, and are port-mapped 4001–4011.

| App | Name | Port | Feature Package |
|-----|------|------|-----------------|
| `apps/accounting` | @hbc/spfx-accounting | 4001 | @hbc/features-accounting |
| `apps/estimating` | @hbc/spfx-estimating | 4002 | @hbc/features-estimating |
| `apps/project-hub` | @hbc/spfx-project-hub | 4003 | @hbc/features-project-hub |
| `apps/leadership` | @hbc/spfx-leadership | 4004 | @hbc/features-leadership |
| `apps/business-development` | @hbc/spfx-business-development | 4005 | @hbc/features-business-development |
| `apps/admin` | @hbc/spfx-admin | 4006 | @hbc/features-admin |
| `apps/safety` | @hbc/spfx-safety | 4007 | @hbc/features-safety |
| `apps/quality-control-warranty` | @hbc/spfx-quality-control-warranty | 4008 | @hbc/features-quality-control-warranty |
| `apps/risk-management` | @hbc/spfx-risk-management | 4009 | @hbc/features-risk-management |
| `apps/operational-excellence` | @hbc/spfx-operational-excellence | 4010 | @hbc/features-operational-excellence |
| `apps/human-resources` | @hbc/spfx-human-resources | 4011 | @hbc/features-human-resources |

#### Standalone Applications (3)

| App | Name | Port | Runtime | Role |
|-----|------|------|---------|------|
| `apps/dev-harness` | @hbc/dev-harness | 3000 | Vite + React | Development environment; loads all 11 SPFx apps |
| `apps/pwa` | @hbc/pwa | 4000 | Vite + React + PWA | Progressive Web App for field use |
| `apps/hb-site-control` | @hbc/hb-site-control | 4012 | Vite + React + React Native Web | Mobile-first site control app |

### Category F: Backend (1)

| Component | Name | Runtime | Role |
|-----------|------|---------|------|
| `backend/functions` | @hbc/functions | Azure Functions v4 | Serverless HTTP/async triggers for data, auth, provisioning |

Key dependencies: `@azure/functions`, `@azure/data-tables`, `@azure/identity`, `@pnp/sp`, `@pnp/graph`, `jose`, `@hbc/models`.

### Category G: Build Tooling (1)

| Component | Name | Role |
|-----------|------|------|
| `tools/` | @hbc/tools | Shared monorepo build/test scripts (tsx-based) |

---

## 4. Repository Evolution Since Blueprint V4

The monorepo has undergone three controlled evolutionary shifts since Blueprint V4 was written. All are consistent with the Blueprint's architectural intent.

### 4.1 Shared-Feature Primitives Emerged

Blueprint V4 described core platform packages and feature modules but did not anticipate a middle layer of optional cross-cutting primitives. Three packages now occupy this space:

- **@hbc/bic-next-move** — Ball-in-court and ownership tracking, used by features that need task-assignment visibility.
- **@hbc/complexity** — Three-tier density context (Complexity Dial), allowing features to adapt UI density.
- **@hbc/sharepoint-docs** — Document lifecycle management, wrapping Microsoft Graph document operations.

These are classified as **controlled evolution (a)**. They follow the same ports/adapters pattern as core packages and do not violate Blueprint V4's layering rules. As of PH7.4, these are designated **Tier-1 Platform Primitives** — mandatory-use when their concern area is present. See [Platform Primitives Registry](../../reference/platform-primitives.md). <!-- PH7.4: Tier-1 elevation -->

### 4.2 Feature Packages Materialized

Blueprint V4 described feature modules conceptually. The repo now implements them as `packages/features/*` with individual `package.json` files, TypeScript path aliases in `tsconfig.base.json`, and source-based exports (`main: "./src/index.ts"`). Each feature package maps 1:1 to an SPFx app under `apps/`.

This is **controlled evolution (a)** — the Blueprint's feature-per-module vision made concrete.

### 4.3 Workspace Scope Expanded

The original workspace included `packages/*` and `apps/*`. It now also includes:

- `backend/*` — Azure Functions serverless backend
- `tools/*` — Monorepo build and governance tooling
- `packages/features/*` — Feature package sub-workspace

This is **controlled evolution (a)** — necessary to support the full platform as implementation progressed through Phases 4–6.

---

## 5. How to Read This Repo

**Where is current truth?**
This file + package READMEs + the codebase itself. For any question about what exists _right now_, start here.

**Where are locked decisions?**
[Blueprint V4](./blueprint/HB-Intel-Blueprint-V4.md) (target architecture), [Foundation Plan](./plans/hb-intel-foundation-plan.md) (original implementation instructions), and the [ADR catalog](./adr/) (73 individual decisions). These are append-only or comment-only.

**How do I distinguish current implementation from future plans?**
Use the Classification Matrix in Section 2. Documents labeled **Canonical Current-State** describe what exists. Documents labeled **Canonical Normative Plan** describe what should be built next. **Historical Foundational** documents describe what was planned originally and may have evolved.

**Which shared-feature packages are mandatory?**
As of PH7.4, `@hbc/bic-next-move`, `@hbc/complexity`, and `@hbc/sharepoint-docs` are **Tier-1 Platform Primitives** — mandatory when their concern area is present in a feature. See the [Platform Primitives Registry](../../reference/platform-primitives.md) for the decision tree and adoption matrix. Core platform packages (Category A) remain the mandatory foundation for all features. <!-- PH7.4: updated from "none mandatory" to Tier-1 policy -->

**Where do I add a new feature?**
1. Create `packages/features/<domain>/` with `package.json`, `tsconfig.json`, and `src/index.ts`.
2. Register path aliases in `tsconfig.base.json`.
3. Create the corresponding SPFx app in `apps/<domain>/` if it needs a SharePoint surface.
4. Add the feature to the dev-harness registration.

**What are the UI Kit entry points?**
- `@hbc/ui-kit` — full component library (PWA, dev-harness)
- `@hbc/ui-kit/app-shell` — shell-only exports (SPFx constrained contexts)
- `@hbc/ui-kit/theme` — token/theme-only imports
- `@hbc/ui-kit/icons` — icon-only imports

---

## 6. Workspace Dependency Graph

```
                        @hbc/models
                       /     |      \
              data-access   auth    ui-kit ← complexity
                  |          |        |
             query-hooks   shell   bic-next-move
                  \         |
                   \    app-shell
                    \       |
                     \  provisioning    sharepoint-docs → spfx
                      \     |               |
                       ↓    ↓               ↓
              ┌─────────────────────────────────────┐
              │  Feature Packages (11)               │
              │  @hbc/features-{domain}              │
              │  deps: models, query-hooks, ui-kit,  │
              │        auth, shell                   │
              └───────────┬─────────────────────────┘
                          │
              ┌───────────┴─────────────────────────┐
              │                                     │
     SPFx Apps (11)                        Standalone Apps (3)
     apps/{domain}                    dev-harness | pwa | hb-site-control
     ports 4001–4011                  ports 3000, 4000, 4012
              │
              └──────────→ @hbc/functions (backend)
                           deps: models (types only)
```

**Key relationships:**
- `models` is the foundation with zero internal dependencies.
- `data-access` and `auth` depend only on `models`.
- `query-hooks` bridges `data-access` into React via TanStack Query.
- `shell` provides navigation/layout; `app-shell` aggregates shell + auth + ui-kit.
- Shared-feature primitives (`complexity`, `bic-next-move`, `sharepoint-docs`) depend on core packages and are consumed optionally by features.
- Feature packages consume core + optional shared-feature primitives.
- SPFx apps are thin shells that host their corresponding feature package.
- `dev-harness` loads all 11 SPFx apps for unified development.
- `backend/functions` depends only on `@hbc/models` for shared types.

---

## Summary Metrics

| Metric | Count |
|--------|-------|
| Core platform packages | 8 |
| Shared infrastructure packages | 2 |
| Shared-feature primitives | 3 |
| Feature packages | 11 |
| SPFx applications | 11 |
| Standalone applications | 3 |
| Backend services | 1 |
| Build tooling packages | 1 |
| **Total workspace members** | **40** |
| Architecture Decision Records | 75 + 1 (PH5C) | <!-- PH7.4: added ADR-0080, ADR-0081 -->
| TSConfig path aliases | 62 |
| Vite dev server ports | 14 (3000, 4000–4012) |
