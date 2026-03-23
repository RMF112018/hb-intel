# HB Intel — Package Relationship Map

> **Doc Classification:** Canonical Normative Plan — authoritative reference for package purposes, dependency relationships, and architectural boundaries across the monorepo. Updated with each new package or significant dependency change.
>
> **Not present-state truth.** For current implementation status, see `docs/architecture/blueprint/current-state-map.md`. For binding architectural decisions, see the ADR catalog in `docs/architecture/adr/`. This document explains *how* packages relate to each other and *why* — it does not supersede the Tier 1 source-of-truth hierarchy.

**Version:** 1.0
**Date:** 2026-03-14
**Basis:** Live codebase inspection of all `packages/*` package.json files, barrel exports, and cross-package import patterns.
**Analysis Scope:** 35 packages across `packages/`, 14 apps (including 11 SPFx webparts), 1 backend. Total workspace members analyzed: 50.

---

## Purpose of This Document

This document answers the questions that arise when an agent or developer is about to create, modify, or add a dependency on a package:

- What does this package own and what does it explicitly *not* own?
- Which layer does it belong to and which direction should dependencies flow?
- What are the risks of depending on it?
- What would be an incorrect use of it?
- Which packages are stable platform foundations versus unstable scaffolds?

**What this document is not:**
- It is not a record of what has been implemented (that is `current-state-map.md`).
- It is not a substitute for ADRs (binding decisions stay in `docs/architecture/adr/`).
- It is not a changelog (changes belong in the document history section).
- It does not override `current-state-map.md` or any ADR on matters of present-state truth or architectural decisions.

---

## How to Read This Map

**For present-state truth:** Consult `current-state-map.md §1` and §2.

**For this document:** Use it when you are about to make a dependency decision, add a new package, move code across package boundaries, or review whether an existing dependency is healthy. The map defines the intended architecture and calls out known risks.

**Maturity levels used in this document:**
- **Mature** — comprehensive implementation, tests exist and pass with coverage, exports are stable, usable as-is.
- **Partial** — meaningful implementation is present but incomplete; exports may change; use with awareness of gaps.
- **Scaffold** — structure and types exist, little or no runtime implementation; do not depend on scaffold packages for production behavior.

**Evidence quality:**
- Claims marked *[verified]* are confirmed by reading actual source files.
- Claims marked *[inferred]* are based on package.json dependency declarations without reading all source files.
- Claims marked *[uncertain]* require further investigation before depending on the behavior.

---

## Package Layer Model

The monorepo uses a strict dependency layering model. Dependencies must flow downward — higher layers may depend on lower layers, but lower layers must never depend on higher layers. Lateral dependencies (same-layer imports) are permitted only where explicitly designed.

```
Layer 11 — Apps & Backend
  (pwa, dev-harness, hb-site-control, spfx-*, backend/functions)

Layer 10 — Feature Packages
  (@hbc/features-*)
  Compose platform primitives into domain-specific workflows and views

Layer 9 — Domain Data Infrastructure
  (@hbc/data-seeding)
  Domain-agnostic import/seeding utilities

Layer 8 — Intelligence Scaffolds & Shared-Feature Primitives
  (@hbc/health-indicator, @hbc/score-benchmark, @hbc/strategic-intelligence, @hbc/post-bid-autopsy, @hbc/my-work-feed, @hbc/export-runtime, @hbc/record-form, @hbc/saved-views)
  Scoring, analysis, learning signal, cross-module aggregation, and shared-feature runtime primitives

Layer 7 — Workflow Primitives
  (@hbc/step-wizard, @hbc/field-annotations, @hbc/workflow-handoff)
  Structured multi-step workflow orchestration building on Layer 6 primitives

Layer 6 — Platform Primitives
  (@hbc/bic-next-move, @hbc/acknowledgment, @hbc/versioned-record, @hbc/project-canvas,
   @hbc/related-items, @hbc/ai-assist, @hbc/provisioning, @hbc/notification-intelligence [peer only])
  Reusable domain-agnostic workflow/collaboration/analytics capabilities

Layer 5 — Shell, SharePoint & Experience Infrastructure
  (@hbc/shell, @hbc/app-shell, @hbc/sharepoint-docs, @hbc/spfx)
  App-level navigation context, SharePoint integration, SPFx host layer

Layer 4 — Design System & UI Foundation
  (@hbc/ui-kit, @hbc/smart-empty-state [peer only], @hbc/notification-intelligence [peer only])
  All reusable visual components, themes, layout primitives, icons

Layer 3 — Platform Core (Auth & Query)
  (@hbc/auth, @hbc/query-hooks)
  Authentication orchestration, data-fetching hooks, repository DI

Layer 2 — Core Infrastructure
  (@hbc/data-access, @hbc/session-state, @hbc/complexity, @hbc/eslint-plugin-hbc)
  Repository ports/adapters, offline state, density context, boundary linting rules

Layer 1 — Domain Types
  (@hbc/models, @hbc/health-indicator [types only])
  Zero-dependency TypeScript type definitions for all domains
```

**Permitted dependency directions:**
- Layer N may depend on any Layer < N.
- No package may depend on a Layer > its own.
- Lateral same-layer dependencies are allowed only when explicitly designed (e.g., `@hbc/workflow-handoff` depends on `@hbc/acknowledgment` and `@hbc/field-annotations`, all Layer 6–7).

**Known violations or tensions:**
1. `@hbc/ui-kit` (Layer 4) depends on `@hbc/auth` (Layer 3) — auth-aware UI components. This creates a tight coupling that means auth must be initialized before the design system renders. [verified]
2. `@hbc/score-benchmark` and `@hbc/post-bid-autopsy` had a circular dependency (each listed the other as a prod dependency). **Resolved 2026-03-14 — ADR-0114.** The unused `@hbc/score-benchmark` entry was removed from `post-bid-autopsy/package.json`; the remaining type-only import from score-benchmark → post-bid-autopsy is a legitimate, directionally correct dependency and is retained. [verified — resolved]
3. `@hbc/complexity` (Layer 2) depends on `@tanstack/react-query` (external) — unusual for a density context provider. May be for complexity-aware query behavior. [verified — intent uncertain]

---

## Relationship Rules

The following rules govern dependency decisions. Rules backed by ADRs are binding. Others are architectural conventions observed from the codebase.

**Rule R1 — UI Ownership (ADR backed, CLAUDE.md §1 Directive 6):**
All reusable visual UI components must be owned by `@hbc/ui-kit`. No package outside `@hbc/ui-kit` may introduce new standalone presentational components or visual primitives. Feature and shared packages may only compose `@hbc/ui-kit` components, provide headless logic, adapters, hooks, and state orchestration, or define thin feature-local composition shells with no reusable visual primitive behavior.

**Rule R2 — UI Kit Entry Points (CLAUDE.md §6.1):**
SPFx contexts must import from `@hbc/ui-kit/app-shell`, not full `@hbc/ui-kit`. Token-only imports must use `@hbc/ui-kit/theme`. Icon-only imports must use `@hbc/ui-kit/icons`. Full `@hbc/ui-kit` is for PWA, dev-harness, and non-constrained bundles only.

**Rule R3 — No Direct FluentUI Imports (ESLint boundary rules, ADR-0045, PH7.5/7.6):**
No package outside `@hbc/ui-kit` may directly import from `@fluentui/*`. All Fluent UI component access must go through `@hbc/ui-kit` re-exports. Enforced by `@hb-intel/eslint-plugin-hbc`.

**Rule R4 — Models are Read-Only for Non-Foundation Packages:**
`@hbc/models` exports types only. No package may import a mutable store or function from models. Models represent the type contract for the domain.

**Rule R5 — Repository Access Only via Adapters:**
Feature packages and apps must not create their own SharePoint REST or Graph API calls directly. All data access must go through `@hbc/data-access` adapters or `@hbc/query-hooks` hooks. The only permitted exception is `@hbc/sharepoint-docs` (which owns SharePoint document operations) and `@hbc/spfx` (which owns the SPFx adapter layer).

**Rule R6 — Headless Packages Stay Headless:**
Several packages (`@hbc/provisioning`, `@hbc/notification-intelligence`) are explicitly headless (no React components). Their consumers must provide their own presentation. These packages must not import React components or UI-kit components.

**Rule R7 — Scaffold Packages Are Not Production Dependencies:**
The four intelligence scaffold packages (`@hbc/health-indicator`, `@hbc/score-benchmark`, `@hbc/strategic-intelligence`, `@hbc/post-bid-autopsy`) have minimal or no runtime implementations. Feature packages that depend on them accept a dependency on scaffolded code. Any developer adding a new dependency on a scaffold package must explicitly note the risk and have a plan to stabilize it before pilot.

**Rule R8 — Feature Packages Are Domain-Specific, Not Shared:**
`@hbc/features-*` packages own domain-specific views and workflows. They must not export components or logic that other feature packages depend on. Cross-feature dependencies are prohibited. If behavior is needed cross-feature, it belongs in a platform primitive (Layer 6–7) or `@hbc/ui-kit` (Layer 4).

**Rule R9 — Backend Package Isolation:**
`backend/functions` may depend on `@hbc/models`, `@hbc/acknowledgment`, and `@hbc/notification-intelligence`. It must not depend on React, `@hbc/ui-kit`, `@hbc/shell`, or any frontend-specific package. This boundary is currently honored [inferred].

---

## Package Catalog

### Layer 1 — Domain Types

---

#### `@hbc/models` · v0.0.1 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/models/` |
| **Layer** | 1 — Domain Types |
| **Depends on** | Nothing (devDep: `@types/react` only) |
| **Used by** | Virtually every package and app in the monorepo |
| **Maturity** | Mature |

**Purpose:** The single source of TypeScript domain types for all HB Intel business domains. Contains zero runtime logic — types and interfaces only. Covers 12+ domain folders: `shared`, `leads`, `estimating`, `schedule`, `buyout`, `compliance`, `contracts`, `risk`, `scorecard`, `pmp`, `project`, `auth`, `provisioning`, `ui`.

**Key exports:** Domain type interfaces and enums for all business entities. Scoped subpath exports for tree-shaking (e.g., `@hbc/models/estimating`, `@hbc/models/project`).

**Correct usage:** Import types from `@hbc/models` when defining function signatures, hook return types, adapter interfaces, or component props. Always use the most specific subpath import for tree-shaking.

**Anti-patterns / must not:**
- Must not contain runtime logic, classes with methods, or stores.
- Must not depend on any other `@hbc/*` package.
- Must not be used to implement business rules (rules belong in adapters, hooks, or feature packages).

**Notes:** This is the most depended-upon package in the repo. Any breaking type change here cascades to all consumers. Handle with extreme care; type changes require review of all consumers.

---

#### `@hbc/health-indicator` · v0.0.1 · [Scaffold — types only]

| Field | Value |
|-------|-------|
| **Path** | `packages/health-indicator/` |
| **Layer** | 1 — Domain Types (types only) |
| **Depends on** | Nothing |
| **Used by** | `@hbc/features-estimating`, `@hbc/features-business-development` |
| **Maturity** | Scaffold |

**Purpose:** Type definitions and config schema for the health-indicator scoring runtime. No runtime implementation exists — defines the contract for bid-readiness scoring models.

**Key exports:** Score model types, config schema, telemetry integration interface.

**Correct usage:** Import types to define score models in feature packages. Expect to implement runtime logic in the consuming feature or in a future full implementation of this package.

**Anti-patterns / must not:**
- Must not be treated as having a runtime implementation. There is none.
- Must not be used in Wave 0 critical path without acknowledging the scaffold dependency.

**Notes / risks:** `@hbc/features-estimating` and `@hbc/features-business-development` both depend on this scaffold. Any Wave 1 estimating or BD feature development must address the missing runtime implementation.

---

### Layer 2 — Core Infrastructure

---

#### `@hbc/data-access` · v0.0.1 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/data-access/` |
| **Layer** | 2 — Core Infrastructure |
| **Depends on** | `@hbc/models` |
| **Used by** | `@hbc/query-hooks`, `@hbc/sharepoint-docs`, `backend/functions` [inferred] |
| **Maturity** | Mature |

**Purpose:** Ports/adapters layer for all data operations. Defines 11 repository port interfaces (one per business domain). Provides mock adapters for all 11 domains, plus stub entries for `sharepoint`, `proxy`, and `api` adapter modes. The factory functions (`createXRepository`) resolve the correct adapter based on environment configuration.

**Key exports:** Repository port interfaces (`IEstimatingRepository`, `IProjectRepository`, etc.), mock adapters, factory functions, `AdapterMode` enum.

**Subpaths:** `./ports` (interface-only imports), `./adapters/*` (adapter-specific imports).

**Correct usage:** Feature packages and apps should never call SharePoint REST or Graph API directly. They should call `@hbc/query-hooks` hooks, which use the `data-access` factory internally.

**Anti-patterns / must not:**
- Must not contain business logic. It is a pure I/O boundary.
- Must not be imported directly by feature packages that should go through `@hbc/query-hooks`.
- Adapter stubs (`sharepoint`, `proxy`, `api`) are not production-ready — must not be used in production without implementing the actual adapter.

**Notes / risks:** Only the `mock` adapter is fully implemented. All other adapters are stubs. Production data access requires completing the SharePoint or proxy adapter before any app can work against real data.

---

#### `@hbc/session-state` · v0.0.1 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/session-state/` |
| **Layer** | 2 — Core Infrastructure |
| **Depends on** | `idb ^8.0.3` (external only) |
| **Used by** | `@hbc/query-hooks`, `@hbc/sharepoint-docs`, `@hbc/workflow-handoff`, `@hbc/acknowledgment`, `@hbc/related-items` |
| **Maturity** | Mature |

**Purpose:** Offline-safe session persistence using IndexedDB. Provides the foundation for all offline-capable workflows in the platform. Includes session store, persistence adapters for IndexedDB, and utilities for syncing deferred actions when connectivity is restored.

**Key exports:** Session store, `useDraft`, `useConnectivity`, persistence adapters, sync engine, offline queue utilities.

**Correct usage:** Use when a workflow needs to survive browser refresh, work offline, or queue writes for later submission. Used by `@hbc/workflow-handoff` for deferred handoff state, by `@hbc/sharepoint-docs` for offline document queues, and by `@hbc/acknowledgment` for pending sign-offs.

**Anti-patterns / must not:**
- Must not be used to cache server data (that is `@hbc/query-hooks`'s job via TanStack Query).
- Must not hold mutable business entities as canonical truth — it is a draft/queue layer.
- Must not be imported by `@hbc/models` or `@hbc/data-access`.

---

#### `@hbc/complexity` · v0.1.0 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/complexity/` |
| **Layer** | 2 — Core Infrastructure |
| **Depends on** | `@tanstack/react-query ^5.0.0` (external — intent uncertain) |
| **Used by** | `@hbc/ui-kit`, `@hbc/bic-next-move`, `@hbc/step-wizard`, `@hbc/field-annotations`, `@hbc/workflow-handoff`, `@hbc/acknowledgment`, `@hbc/smart-empty-state`, `@hbc/versioned-record`, `@hbc/ai-assist`, all feature packages, all apps |
| **Maturity** | Mature |

**Purpose:** Three-tier UI density control (`low` / `normal` / `high`). Provides a React context (`ComplexityProvider`) that propagates the current density setting via CSS cascade. All components in the design system and platform primitives respect this context to adjust their visual density.

**Key exports:** `ComplexityProvider`, `useComplexity`, `useComplexityConfig`, testing utilities (`./testing` subpath).

**Subpaths:** Root, `./testing`.

**Correct usage:** Wrap app roots with `ComplexityProvider`. Components read complexity via `useComplexity`. Do not manually hardcode density values — always read from context.

**Anti-patterns / must not:**
- Must not contain any UI components or business logic.
- Must not be used to gate features (use `@hbc/auth` feature gates instead).

**Notes / risks:** The dependency on `@tanstack/react-query` is unusual for a density context provider. The intent is [uncertain] — may be for complexity-aware query behavior. This should be reviewed before this package is extended.

---

#### `@hb-intel/eslint-plugin-hbc` · v1.0.0 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/eslint-plugin-hbc/` |
| **Layer** | 2 — Core Infrastructure (tooling) |
| **Depends on** | Nothing (ESLint as peer) |
| **Used by** | All packages and apps via ESLint config |
| **Maturity** | Mature |

**Purpose:** Custom ESLint plugin enforcing package boundary rules across the monorepo. Implements the architectural constraint that no package outside `@hbc/ui-kit` may directly import from `@fluentui/*`. Created per ADR-0045, hardened in PH7.5/PH7.6.

**Key exports:** ESLint rules, configuration presets.

**Correct usage:** Already active — all packages inherit the boundary rules via workspace ESLint config. Do not disable rules without an ADR.

**Anti-patterns / must not:**
- Rules must not be disabled or bypassed without a superseding ADR.
- Must not be used to enforce transient style preferences — only architectural boundaries belong here.

---

### Layer 3 — Platform Core

---

#### `@hbc/auth` · v0.0.1 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/auth/` |
| **Layer** | 3 — Platform Core |
| **Depends on** | `@hbc/models`, `@pnp/sp ^4.0.0`, `zustand ^5.0.0`; optional: `@azure/msal-browser ^4.0.0`, `@azure/msal-react ^3.0.0` |
| **Used by** | `@hbc/ui-kit`, `@hbc/shell`, `@hbc/provisioning`, `@hbc/sharepoint-docs`, `@hbc/related-items`, `@hbc/ai-assist`, `@hbc/spfx`, all feature packages, all apps |
| **Maturity** | Mature |

**Purpose:** Dual-mode authentication and authorization orchestration. Supports two auth modes: (1) MSAL.js for PWA/browser context (Azure AD / Entra ID), (2) SPFx built-in context for SharePoint Framework webparts. Also provides role/feature/permission guards, an admin access control panel, backend model for JWT validation, and a startup timing bridge.

**Key exports:** Zustand auth stores (`useAuthStore`, `usePermissionStore`), React guards (`RoleGate`, `FeatureGate`, `PermissionGate`), adapters (`MsalAdapter`, `SpfxAdapter`, `MockAdapter`), admin access control panel, backend JWT model, audit logging.

**Entry points:** Root (full), `./dev` (dev utilities), `./spfx` (SPFx-specific adapter).

**Correct usage:** PWA apps initialize with `MsalAdapter`. SPFx apps initialize with `SpfxAdapter`. Tests use `MockAdapter`. Feature packages consume `RoleGate`/`FeatureGate` and `usePermissionStore` — they must not re-implement auth logic.

**Anti-patterns / must not:**
- Must not be bypassed or mocked in production contexts.
- Must not implement business rules — auth is about identity and role, not domain logic.
- Feature packages must use the guards provided, not implement their own `if (user.role === 'admin')` checks.

**Notes / risks:** `@hbc/auth` is a dependency of `@hbc/ui-kit` (Layer 4 depends on Layer 3). This means the design system has auth awareness built in. Consequence: auth context must be initialized before any design system component renders correctly. Providers must be ordered: auth first, then complexity, then ui-kit consumers. [verified — ADR-0053/0056/0057 govern this].

---

#### `@hbc/query-hooks` · v0.0.1 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/query-hooks/` |
| **Layer** | 3 — Platform Core |
| **Depends on** | `@hbc/data-access`, `@hbc/models`, `@hbc/session-state`, `@tanstack/react-query ^5.75.0`, `zustand ^5.0.0` |
| **Used by** | All feature packages, all apps; backend does not use this package |
| **Maturity** | Mature |

**Purpose:** TanStack Query hooks layer. Provides 60+ domain hooks (approximately 6 per domain) that wrap repository adapters from `@hbc/data-access` with query key management, cache invalidation, optimistic mutation helpers, and filter/UI state Zustand stores. Also provides dependency injection (DI) for repository resolution, allowing test environments to swap adapters without changing hook code.

**Key exports:** Query key factory, 60+ typed hooks (`useEstimatingProjects`, `useProjectById`, `useCreateProject`, etc.), UI/filter/form-draft Zustand stores, DI repository resolver, optimistic mutation helpers.

**Correct usage:** All data access in feature packages and apps must go through `@hbc/query-hooks`. Do not use `@hbc/data-access` adapters directly in feature code.

**Anti-patterns / must not:**
- Must not be imported by `backend/functions` — it is a React/frontend package.
- Must not contain domain business logic — it is purely a data-fetching orchestration layer.
- Must not be used to implement mutations that bypass the repository pattern.

---

### Layer 4 — Design System & UI Foundation

---

#### `@hbc/ui-kit` · v2.1.0 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/ui-kit/` |
| **Layer** | 4 — Design System & UI Foundation |
| **Depends on** | `@hbc/auth`, `@hbc/complexity`, `@hbc/models`, `@fluentui/react-components ^9.56.0`, `@griffel/react`, `@tanstack/react-table`, `@tanstack/react-virtual`, `echarts`, `react-hook-form`, `zod` |
| **Used by** | All platform primitives, all feature packages, all apps (SPFx via `./app-shell`) |
| **Maturity** | Mature |

**Purpose:** The HB Intel Design System V2.1. Single source of all reusable visual components, theme tokens, layout primitives, data tables, charts, icons, and interaction patterns. All UI in the platform must be composed from this package.

**Key exports:** 60+ components spanning app shell (`HbcAppShell`, `HbcThemeProvider`, `HbcHeader`, etc.), page layouts (`ToolLandingLayout`, `DetailLayout`, `DashboardLayout`, etc.), forms (`HbcForm`, field components), data tables with saved views, charts (bar, donut, line), interaction patterns (command palette, confirm dialogs, toasts, bottom nav), module-specific patterns (score bar, approval stepper, drawing viewer, audit trail panel, status timeline), hooks (`useFocusTrap`, `useIsMobile`, `usePrefersReducedMotion`, `useOptimisticMutation`).

**Entry points:**
- `@hbc/ui-kit` — full library (PWA, dev-harness, non-constrained contexts)
- `@hbc/ui-kit/app-shell` — shell-only exports for SPFx (constrained bundle budget)
- `@hbc/ui-kit/theme` — token/theme-only (styling without component payload)
- `@hbc/ui-kit/icons` — icon-only

**Correct usage:** Always use the narrowest entry point that meets requirements. SPFx webparts must use `./app-shell` — never full `@hbc/ui-kit`. All visual components for any package must originate from or be contributed to `@hbc/ui-kit`.

**Anti-patterns / must not:**
- No package outside `@hbc/ui-kit` may add a new reusable presentational component.
- Must not import from `@fluentui/*` directly in any package — use ui-kit re-exports.
- Must not contain domain-specific business logic. Components must be domain-agnostic.

**Notes / risks:** At v2.1.0, this is the most mature and highest-impact package in the repo. Any breaking change here (new required prop, renamed component, removed export) cascades to all consumers. The `@hbc/auth` dependency means auth context must always be initialized first.

---

#### `@hbc/smart-empty-state` · v0.0.1 · [Mature — peer deps only]

| Field | Value |
|-------|-------|
| **Path** | `packages/smart-empty-state/` |
| **Layer** | 4 — Design System adjacent (peer deps only) |
| **Depends on** | No prod deps; peer: `@hbc/complexity`, `@hbc/ui-kit`, react |
| **Used by** | `@hbc/related-items`, `@hbc/features-estimating`, `@hbc/features-project-hub`, `@hbc/features-business-development`, `@hbc/features-admin` |
| **Maturity** | Mature |

**Purpose:** Context-aware empty state classification and first-visit coaching. Provides adaptive empty states that respond to why a list is empty (no data vs. filtered vs. no access vs. first time) and guide users with appropriate calls to action.

**Key exports:** Empty state classifier, guidance framework, React components.

**Correct usage:** Use in any list or table view to replace a blank screen. Pass context about why the state is empty so the component can provide targeted guidance.

**Anti-patterns / must not:**
- Must not contain domain-specific content — it is a generic empty state framework.
- Must not import from feature packages.

---

#### `@hbc/notification-intelligence` · v0.0.1 · [Mature — peer deps only]

| Field | Value |
|-------|-------|
| **Path** | `packages/notification-intelligence/` |
| **Layer** | 4/6 (cross-cutting — peer deps) |
| **Depends on** | No prod deps; peer: `@hbc/complexity`, `@hbc/ui-kit`, `@tanstack/react-query ^5.0.0`, react |
| **Used by** | `@hbc/features-project-hub`, `@hbc/features-business-development`, `backend/functions` (via server adapter) |
| **Maturity** | Mature |

**Purpose:** Priority-tiered smart notification system. Classifies notifications by priority (critical/high/normal/low), routes them to the correct UI surface (toast, banner, notification center), and provides a shared registry for all modules to emit and subscribe to notifications.

**Key exports:** Notification classifier, priority engine, toast/banner integration, notification registry, hooks.

**Correct usage:** Feature packages emit notifications via the registry. The shell/app-level notification bell consumes the registry. Provisioning state transitions (per `STATE_NOTIFICATION_TARGETS` in `@hbc/provisioning`) route through this system.

**Anti-patterns / must not:**
- Must not be used to implement polling or data-refresh logic.
- Must not be imported by `backend/functions` beyond its server adapter export.

---

### Layer 5 — Shell & Experience Infrastructure

---

#### `@hbc/shell` · v0.0.1 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/shell/` |
| **Layer** | 5 — Shell & Experience Infrastructure |
| **Depends on** | `@hbc/models`, `@hbc/auth`, `@griffel/react ^1.5.0`, `@tanstack/react-table ^8.21.0`, `zustand ^5.0.0` |
| **Used by** | `@hbc/app-shell`, all feature packages, all apps |
| **Maturity** | Mature |

**Purpose:** Global navigation shell and workspace context. Provides the persistent header, sidebar, project picker, app launcher, and contextual navigation that wraps all application content. Also owns the project-context store (which project is currently selected) and module configuration definitions (which modules are enabled per project type).

**Key exports:** Shell types (`WorkspaceId`, `ShellEnvironment`, `ShellMode`), Zustand stores (`ProjectStore`, `NavStore`, `ShellCoreStore`), layout components (`ShellLayout`, `ShellCore`, `HeaderBar`, `AppLauncher`, `ProjectPicker`, `ContextualSidebar`), module configuration objects (scorecard, RFI, punch list, drawings, budget, daily log, etc.), startup timing bridge, redirect memory, sign-out cleanup.

**Correct usage:** Wrap all app content in `ShellLayout`. Use `ProjectStore` to read the currently active project context. Use module configuration to determine which features are available.

**Anti-patterns / must not:**
- Must not contain domain-specific feature logic.
- Must not import from feature packages (no upward dependencies).
- Must not be used to gate features beyond module configuration — use `@hbc/auth` feature gates for permission-level gating.

**Notes / risks:** `@hbc/shell` depends on `@hbc/auth` (via its package.json), meaning the shell requires auth to be initialized. The ADR-0058 shell decomposition boundary governs what goes into shell vs. what goes into features.

---

#### `@hbc/app-shell` · v0.0.1 · [Partial]

| Field | Value |
|-------|-------|
| **Path** | `packages/app-shell/` |
| **Layer** | 5 — Shell & Experience Infrastructure |
| **Depends on** | `@hbc/shell`, `@hbc/auth`, `@hbc/ui-kit` |
| **Used by** | Apps that need a thin composition layer over shell + auth + ui-kit |
| **Maturity** | Partial |

**Purpose:** Lightweight composition package that bundles shell + auth + ui-kit into a single importable unit. Reduces boilerplate in apps that need all three together.

**Key exports:** Root barrel composition of shell, auth, and ui-kit exports.

**Correct usage:** Use as a convenience re-export layer. Do not add logic to this package — it should remain a pure composition.

**Anti-patterns / must not:**
- Must not add new logic, components, or stores.
- Must not be used as an alternative to importing from the individual packages when only one is needed.

**Notes / risks:** This package is partially implemented with minimal source. Its value proposition (reducing import boilerplate) may or may not justify its existence long-term. Consider consolidating or documenting its purpose more clearly before expanding it.

---

#### `@hbc/sharepoint-docs` · v0.1.0 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/sharepoint-docs/` |
| **Layer** | 5 — Shell & Experience Infrastructure |
| **Depends on** | `@hbc/auth`, `@hbc/models`, `@hbc/data-access`, `@hbc/session-state`, `@hbc/ui-kit`, `@microsoft/microsoft-graph-client ^3.0.7`, `@tanstack/react-query ^5.0.0` |
| **Used by** | `@hbc/spfx`, apps (SharePoint document workflows) |
| **Maturity** | Mature |

**Purpose:** SharePoint document lifecycle management. Owns the full document workflow: pre-provisioning staging (upload before site exists), upload manager, migration scheduler, offline queue. This package is the sole permitted owner of direct Graph API document calls.

**Key exports:** Document staging, upload manager, migration scheduler, offline queue, React components for document lists and upload UI.

**Correct usage:** Use exclusively for document lifecycle operations against SharePoint. Do not implement Graph API document calls in any other package.

**Anti-patterns / must not:**
- Must not implement non-document SharePoint operations (site creation, list management, permissions belong to `backend/functions` provisioning saga).
- Must not be imported by feature packages for non-document operations.

**Notes / risks:** Hard dependency on `@microsoft/microsoft-graph-client`. If Graph API auth scopes change, this package must be updated. Production readiness depends on correctly configuring MSAL scopes for Files.ReadWrite and Sites.ReadWrite.All.

---

#### `@hbc/spfx` · v0.0.1 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/spfx/` |
| **Layer** | 5 — Shell & Experience Infrastructure |
| **Depends on** | `@hbc/auth`, `@hbc/sharepoint-docs`, `@hbc/ui-kit`, `@tanstack/react-query` |
| **Used by** | All 11 SPFx webpart apps |
| **Maturity** | Mature |

**Purpose:** SPFx webpart base layer. Provides the `SpfxAdapter` wrapper, property pane integration helpers, and webpart host wrapper components that all 11 SPFx webpart apps build upon.

**Key exports:** SPFx adapter, property pane integration, webpart wrapper component.

**Correct usage:** All SPFx webpart apps must use this package's wrapper rather than reimplementing SPFx boilerplate. The `SpfxAdapter` from `@hbc/auth/spfx` is initialized here for SPFx context.

**Anti-patterns / must not:**
- Must not contain feature-specific SPFx logic.
- Must not import from feature packages.

---

### Layer 6 — Platform Primitives

---

#### `@hbc/bic-next-move` · v0.1.0 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/bic-next-move/` |
| **Layer** | 6 — Platform Primitives |
| **Depends on** | `@hbc/complexity`, `@hbc/ui-kit`, `@tanstack/react-query ^5.0.0` |
| **Used by** | `@hbc/step-wizard`, `@hbc/field-annotations`, `@hbc/workflow-handoff`, `@hbc/score-benchmark`, `@hbc/post-bid-autopsy`, `@hbc/features-*` |
| **Maturity** | Mature |

**Purpose:** Universal Ball-In-Court (BIC) and Next Move Ownership primitive. Tracks who currently owns a unit of work, what action they must take, and what the urgency level is. Platform-wide accountability primitive — every workflow that needs an owner must use this package rather than implementing its own ownership tracking.

**Key exports:** BIC state management, next-move orchestration, ownership transfer, urgency classification, React components for ownership indicators, hooks.

**Correct usage:** Use whenever a record, request, or workflow step needs a clearly visible current owner and next action. Particularly important for: provisioning request ownership, controller gate ownership, approval workflows.

**Anti-patterns / must not:**
- Must not store persistent data directly — it is a UI state primitive. Persistence must happen at the query-hooks or backend layer.
- Must not be imported by `@hbc/ui-kit` (upward dependency violation).

---

#### `@hbc/acknowledgment` · v0.1.0 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/acknowledgment/` |
| **Layer** | 6 — Platform Primitives |
| **Depends on** | `@hbc/complexity`, `@hbc/session-state`, `@hbc/ui-kit`, `@tanstack/react-query ^5.0.0` |
| **Used by** | `@hbc/workflow-handoff`, `backend/functions` |
| **Maturity** | Mature |

**Purpose:** Universal sign-off and acknowledgment primitive for both client and server. Manages the lifecycle of a sign-off action: pending, signed, rejected, expired. Includes audit log integration. Used at the moment of formal approval in any workflow.

**Key exports:** Sign-off state management, audit log integration, React components, server adapters (`./server`), testing utilities (`./testing`).

**Entry points:** Root, `./server`, `./testing`.

**Correct usage:** Use when a workflow requires a formal, audited sign-off action (approval, acknowledgment of change, controller gate advancement). The server adapter is used by `backend/functions` to write acknowledgment records.

**Anti-patterns / must not:**
- Must not be used for informal UI feedback (confirmation dialogs use `@hbc/ui-kit`).
- The server adapter must only be used in `backend/functions`, not in frontend packages.

---

#### `@hbc/versioned-record` · v0.0.1 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/versioned-record/` |
| **Layer** | 6 — Platform Primitives |
| **Depends on** | `@hbc/complexity`, `@hbc/ui-kit` |
| **Used by** | `@hbc/related-items`, `@hbc/ai-assist`, `@hbc/score-benchmark`, `@hbc/strategic-intelligence`, `@hbc/post-bid-autopsy`, `@hbc/workflow-handoff` (devDep/test), `@hbc/features-project-hub`, `@hbc/features-business-development` |
| **Maturity** | Mature |

**Purpose:** Record version tracking, diff computation, and history UI. Provides the foundation for all audit trail and change history views in the platform. Computes diffs between record versions and renders them.

**Key exports:** Version store, diff computation engine, history hooks, history timeline React component.

**Correct usage:** Use when a record needs a visible history of changes (what changed, when, by whom). Feature packages surface this in detail views and audit panels.

**Anti-patterns / must not:**
- Must not be used as the primary data store — versions are a projection of changes, not the source of truth.
- Must not be imported by Layer 2–4 packages (upward dependency violation).

---

#### `@hbc/project-canvas` · v0.0.1 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/project-canvas/` |
| **Layer** | 6 — Platform Primitives |
| **Depends on** | `@dnd-kit/core ^6.3.1` (external only — no `@hbc/*` prod deps) |
| **Used by** | `@hbc/features-project-hub`, `@hbc/features-business-development` |
| **Maturity** | Mature |

**Purpose:** Role-based configurable project dashboard canvas with drag-and-drop widget management. Provides the layout engine and widget framework for project dashboards. Deliberately has no dependency on other `@hbc/*` packages — its model is generic and data binding happens at the feature layer.

**Key exports:** Canvas layout engine, widget registry, drag-drop support, canvas hooks, React components.

**Correct usage:** Feature packages register their widgets into the canvas. The canvas handles layout, persistence of widget configuration, and drag-drop. Data for widgets comes from feature packages via slots/render props, not from the canvas itself.

**Anti-patterns / must not:**
- Must not implement domain-specific widgets. Widgets belong in feature packages.
- Must not add direct `@hbc/*` dependencies — its generic design is intentional.

**Notes / risks:** The absence of `@hbc/*` prod dependencies makes this package highly reusable, but also means widget-level features (auth gates, complexity, query hooks) must be provided by feature packages wrapping the canvas.

---

#### `@hbc/related-items` · v0.0.1 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/related-items/` |
| **Layer** | 6 — Platform Primitives |
| **Depends on** | `@hbc/auth`, `@hbc/complexity`, `@hbc/session-state`, `@hbc/smart-empty-state`, `@hbc/versioned-record` |
| **Used by** | Feature packages that need a unified work graph panel |
| **Maturity** | Mature |

**Purpose:** Cross-module record relationship panel. Provides the "Unified Work Graph" — a panel that shows all records related to the current item (RFIs linked to submittals, change orders linked to contracts, etc.), enabling navigation between related records without losing context.

**Key exports:** Relationship graph, cross-module linking API, React panel component.

**Correct usage:** Embed in detail views to surface related records. The consuming feature registers relationship types; the panel handles traversal and display.

**Anti-patterns / must not:**
- Must not be used to model relationships that belong in `@hbc/models` type definitions.
- Must not implement domain-specific relationship logic — it is a generic panel.

---

#### `@hbc/ai-assist` · v0.0.1 · [Partial — scaffold for AI integration]

| Field | Value |
|-------|-------|
| **Path** | `packages/ai-assist/` |
| **Layer** | 6 — Platform Primitives |
| **Depends on** | `@hbc/auth`, `@hbc/complexity`, `@hbc/versioned-record` |
| **Used by** | `@hbc/features-business-development` |
| **Maturity** | Partial |

**Purpose:** Contextual AI action layer for Azure AI Foundry integration. Provides context extraction from current record state, AI action panel, and prompt engineering utilities. Intended as the single gateway for all AI-assisted operations in the platform.

**Key exports:** AI context extraction, action panel, prompt engineering utilities.

**Correct usage:** Feature packages surface the AI assist panel in record detail views. The package handles prompt construction and Azure AI Foundry API calls. Features should not make direct Azure AI calls.

**Anti-patterns / must not:**
- Must not be used for non-Azure AI integrations without ADR.
- Must not return raw AI responses to users without filtering/formatting — the package should own response handling.

**Notes / risks:** Partial implementation. Azure AI Foundry connection is a placeholder. Production use requires completing the API integration and configuring Azure credentials.

---

#### `@hbc/provisioning` · v0.1.0 · [Mature — headless]

| Field | Value |
|-------|-------|
| **Path** | `packages/provisioning/` |
| **Layer** | 6 — Platform Primitives |
| **Depends on** | `@hbc/auth`, `@hbc/models`, `@microsoft/signalr ^8.0.7`, `immer ^10.1.1` |
| **Used by** | SPFx apps (project-hub, admin), PWA, hb-site-control |
| **Maturity** | Mature |

**Purpose:** Headless frontend orchestration layer for the SharePoint site provisioning saga. No React components — provides the type-safe API client, Zustand store, SignalR hook (`useProvisioningSignalR`), provisioning state machine (8 states + valid transitions), RBAC visibility rules, and notification routing templates. Consumer apps provide their own UX on top of these headless primitives.

**Key exports:** `ProjectSetupRequestState` type + `STATE_TRANSITIONS`, `STATE_NOTIFICATION_TARGETS`, `IProvisioningApiClient`, `IProvisioningStore` (Zustand + immer), `useProvisioningSignalR`, visibility logic, notification templates.

**Correct usage:** Import the store, API client, and SignalR hook into any app that needs to surface provisioning workflows. Build presentation components in the consuming app (SPFx `apps/project-hub`, `apps/admin`, or PWA) against these headless APIs. Do not fork or duplicate this logic in apps.

**Anti-patterns / must not:**
- Must not import from `@hbc/ui-kit` or any React component package — it is deliberately headless.
- Must not be imported by `@hbc/models`, `@hbc/data-access`, or any Layer 1–3 package.
- The SignalR group subscription model is locked by ADR-0090 — do not change topology without a superseding ADR.

**Notes / risks:** This package's headless design is intentional (D-PH6-09). The consuming app must provide the full UX. Wave 0 delivery requires building those UX surfaces in `apps/project-hub`, `apps/admin`, and `apps/pwa` on top of this package.

---

### Layer 7 — Workflow Primitives

---

#### `@hbc/step-wizard` · v0.1.0 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/step-wizard/` |
| **Layer** | 7 — Workflow Primitives |
| **Depends on** | `@hbc/bic-next-move`, `@hbc/complexity`, `@hbc/ui-kit` |
| **Used by** | `@hbc/features-estimating`, `@hbc/features-business-development`; Wave 0: should be consumed by `apps/project-hub` and `apps/pwa` for setup request form |
| **Maturity** | Mature |

**Purpose:** Multi-step guided workflow primitive. Provides a step state machine, step orchestration, form binding, and React components for rendering multi-step workflows. Used for complex intake forms, approval sequences, and guided user journeys.

**Key exports:** Wizard state machine, step orchestration, form binding utilities, React components (wizard container, step indicator, step navigation).

**Correct usage:** Use for any multi-step workflow with explicit step state (not just a tabbed form). The state machine tracks step completion, validation, and navigation. BIC ownership is integrated via `@hbc/bic-next-move` so each step can surface its owner.

**Anti-patterns / must not:**
- Must not be used for simple tabbed forms (use `@hbc/ui-kit` form components directly).
- Must not duplicate the step state machine in consuming apps. Consume the primitive, do not reimplement.

---

#### `@hbc/field-annotations` · v0.1.0 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/field-annotations/` |
| **Layer** | 7 — Workflow Primitives |
| **Depends on** | `@hbc/bic-next-move`, `@hbc/ui-kit`, `@hbc/complexity`, `@tanstack/react-query ^5.0.0` |
| **Used by** | `@hbc/workflow-handoff`, feature packages where field-level clarification is needed |
| **Maturity** | Mature |

**Purpose:** Field-level annotation and clarification request primitive. Allows users to attach annotations, questions, or clarification requests to individual form fields. Creates a structured thread at the field level, with BIC ownership for who must respond.

**Key exports:** Annotation state, clarification request workflow, annotation panel React component.

**Correct usage:** Decorate individual form fields with the annotation component. The submitter or reviewer can attach questions; the responsible party resolves them via the BIC system.

**Anti-patterns / must not:**
- Must not be used for full-record comments (use `@hbc/related-items` or a feature-level comment thread).
- Must not be used as a general chat system.

---

#### `@hbc/workflow-handoff` · v0.1.0 · [Mature]

| Field | Value |
|-------|-------|
| **Path** | `packages/workflow-handoff/` |
| **Layer** | 7 — Workflow Primitives |
| **Depends on** | `@hbc/bic-next-move`, `@hbc/session-state`, `@hbc/ui-kit`, `@hbc/complexity`, `@hbc/acknowledgment`, `@hbc/field-annotations`, `@tanstack/react-query ^5.0.0`; devDep: `@hbc/versioned-record` |
| **Used by** | Apps and features requiring structured cross-module workflow transitions |
| **Maturity** | Mature |

**Purpose:** Structured cross-module workflow handoff primitive. Orchestrates the formal transfer of work ownership from one domain to another (e.g., estimating → project execution after bid win). Integrates acknowledgment (formal sign-off), BIC ownership transfer, field annotations (inline clarifications), and session state (survive refresh during handoff).

**Key exports:** Handoff state machine, acknowledgment integration, session persistence, BIC transfer, React hooks and components for handoff UI.

**Correct usage:** Use at the boundary between major workflow phases where a formal, audited ownership transfer is required. This is the correct primitive for the estimating-to-project-execution handoff.

**Anti-patterns / must not:**
- Must not be used for informal record ownership changes within a single domain.
- Must not implement domain-specific handoff rules — those belong in feature packages.

---

### Layer 8 — Intelligence Scaffolds

> **Warning:** All four packages in this layer are scaffolded. They have type definitions and structural framework but minimal or no runtime implementation. Feature packages that depend on them must acknowledge this dependency risk and have a plan to complete the implementation before any production use.

---

#### `@hbc/score-benchmark` · v0.0.1 · [Scaffold]

| Field | Value |
|-------|-------|
| **Path** | `packages/score-benchmark/` |
| **Layer** | 8 — Intelligence Scaffolds |
| **Depends on** | `@hbc/bic-next-move`, `@hbc/versioned-record`, `@hbc/post-bid-autopsy` |
| **Used by** | `@hbc/features-business-development` |
| **Maturity** | Scaffold |

**Purpose:** Confidence/similarity/recommendation scoring primitive. Defines the framework for comparing estimates against historical data, benchmarking against similar projects, and producing scoring recommendations with explainability.

**Key exports:** Score model types, benchmark orchestration framework, explainability interfaces.

**✅ Circular dependency resolved (ADR-0114, 2026-03-14):** The false cycle with `@hbc/post-bid-autopsy` has been eliminated. `@hbc/score-benchmark` retains a legitimate type-only import of `PostBidLearningSignal` from post-bid-autopsy; this is directionally correct and not a cycle.

**Correct usage:** Define scoring models and benchmarks against this framework. Scaffold implementation must be completed before production use (Risk 3 remains open).

**Anti-patterns / must not:**
- Must not be used in Wave 0 or Wave 1 critical paths until scaffold implementation is complete.

---

#### `@hbc/strategic-intelligence` · v0.0.1 · [Scaffold]

| Field | Value |
|-------|-------|
| **Path** | `packages/strategic-intelligence/` |
| **Layer** | 8 — Intelligence Scaffolds |
| **Depends on** | `@hbc/versioned-record` |
| **Used by** | `@hbc/post-bid-autopsy`, `@hbc/features-business-development` |
| **Maturity** | Scaffold |

**Purpose:** Heritage snapshot, living intelligence, trust/commitments/conflict resolution, and suggestions primitive. Provides the framework for building a company's institutional intelligence from historical project data.

**Key exports:** Intelligence model types, snapshot builder interface, suggestion engine framework.

**Correct usage:** Define intelligence model schemas against this framework. No runtime implementation exists yet.

**Anti-patterns / must not:**
- Must not be used in any production path until implementation is complete.

---

#### `@hbc/post-bid-autopsy` · v0.0.1 · [Scaffold]

| Field | Value |
|-------|-------|
| **Path** | `packages/post-bid-autopsy/` |
| **Layer** | 8 — Intelligence Scaffolds |
| **Depends on** | `@hbc/bic-next-move`, `@hbc/strategic-intelligence`, `@hbc/versioned-record`, `@tanstack/react-query ^5.75.0` |
| **Used by** | `@hbc/features-estimating`, `@hbc/features-business-development` |
| **Maturity** | Scaffold |

**Purpose:** Post-bid analysis primitive. Aggregates evidence from bid outcomes, assigns confidence scores, classifies learning signals by taxonomy, governs publication of findings, and updates the institutional intelligence store.

**Key exports:** Autopsy model, evidence aggregation framework, learning signal publication interface (including `PostBidLearningSignal` consumed by `@hbc/score-benchmark`).

**✅ Circular dependency resolved (ADR-0114, 2026-03-14):** The unused `@hbc/score-benchmark` production dependency has been removed from `package.json`. `@hbc/score-benchmark` retains a type-only import of `PostBidLearningSignal` from this package; that direction is correct and not a cycle.

---

#### `@hbc/my-work-feed` · v0.0.1 · [Complete]

| Field | Value |
|-------|-------|
| **Path** | `packages/my-work-feed/` |
| **Layer** | 8 — Shared-Feature Primitives |
| **Depends on** | `@hbc/bic-next-move`, `@hbc/complexity`, `@hbc/notification-intelligence`, `@hbc/session-state`, `@hbc/ui-kit`, `@hbc/workflow-handoff`; peer: `react`, `react-dom`, `@tanstack/react-query` |
| **Used by** | Apps consuming personal work aggregation (PWA shell, project canvas tiles) |
| **Maturity** | Complete |

**Purpose:** Cross-module personal work aggregation feed. Source modules register adapters via a central registry; the package normalizes, dedupes, supersedes, ranks, and renders work items across composite UI surfaces (badge, tile, panel, full feed, team feed).

**Key exports:** `IMyWorkItem` domain model, `MyWorkRegistry`, 5 built-in adapters (BIC, handoff, acknowledgment, notification, draft-resume), 7 hooks, 12 components, normalization pipeline (dedupe, supersession, ranking), telemetry, testing factories via `@hbc/my-work-feed/testing`.

**Correct usage:** Register a source adapter, wrap with `MyWorkProvider`, consume via hooks and components. All visual components compose `@hbc/ui-kit` primitives.

**Anti-patterns / must not:**
- Must not own domain data — source modules retain authority over their work items.
- Must not allow adapters to import from each other — the registry is the only coordination point.
- Must not duplicate design-system-grade primitives that belong in `@hbc/ui-kit`.
- Must not implement its own IndexedDB layer — offline persistence is owned by `@hbc/session-state`.

**ADR:** [ADR-0115 — My Work Feed Architecture](../../docs/architecture/adr/ADR-0115-my-work-feed-architecture.md)

---

#### `@hbc/export-runtime` · v0.1.0 · [Complete]

| Field | Value |
|-------|-------|
| **Path** | `packages/export-runtime/` |
| **Layer** | 8 — Shared-Feature Primitives |
| **Depends on** | `@hbc/models`, `@hbc/ui-kit` (workspace) |
| **Used by** | `@hbc/features-business-development`, `@hbc/features-estimating`, and all Phase 3 module adapters |
| **Maturity** | Scaffold |

**Purpose:** Shared export runtime primitive — export lifecycle orchestration, render pipeline contracts, receipt state management, artifact provenance stamping, offline replay, and module adapter seams. All Phase 3 modules create lightweight adapters over this primitive rather than bespoke CSV/XLSX/PDF pipelines.

**Key exports:** `ExportFormat`, `ExportIntent`, `ExportRenderMode`, `ExportStatus`, `ExportArtifactConfidence`, `ExportComplexityTier`, `IExportSourceTruthStamp`, `IExportReceiptState`, `IExportReviewStepState`, `IExportNextRecommendedAction`, `IExportFailureState`, `IExportRetryState`, `IExportArtifactMetadata`, `IExportRequest`, `IExportTruthState`, `ITableExportPayload`/`IReportExportPayload` (discriminated `ExportPayload` union), `IExportBicStepConfig`, `IExportVersionRef`, `IExportTelemetryState`, `IExportSuppressedFormatState`, `IExportContextDeltaState`, 5 reason-code unions, 8 constants. Testing subpath at `@hbc/export-runtime/testing`.

**Correct usage:** Module adapters consume primitive public exports. Module-specific payload composition remains adapter-owned (projection-only). Runtime and orchestration ownership stays in the primitive. Reusable visual primitives belong in `@hbc/ui-kit`.

**Anti-patterns / must not:**
- Must not contain reusable visual primitives — those belong in `@hbc/ui-kit`.
- Must not allow module adapters to import internal paths — public barrel only.
- Module adapters must not re-invent export lifecycle interpretation locally.

**Governing plan:** [SF24-Export-Runtime.md](../../docs/architecture/plans/shared-features/SF24-Export-Runtime.md)

---

#### `@hbc/record-form` · v0.1.0 · [Complete]

| Field | Value |
|-------|-------|
| **Path** | `packages/record-form/` |
| **Layer** | 8 — Shared-Feature Primitives |
| **Depends on** | `@hbc/models` (workspace) |
| **Used by** | `@hbc/features-business-development`, `@hbc/features-estimating`, and all Phase 3 module adapters |
| **Maturity** | Scaffold |

**Purpose:** Shared record authoring runtime primitive — create/edit/duplicate/template lifecycle, draft recovery, review/submission handoff, offline replay, and module adapter seams. All Phase 3 modules create lightweight adapters that supply module-specific schemas while the primitive owns lifecycle and trust state.

**Key exports:** `RecordFormStatus`, `RecordFormIntent`, `RecordFormComplexityTier`, `RecordFormConfidence`, `IRecordFormState`, `IRecordFormTrustState`, `IRecordFormDraft`, `IRecordFormReviewStepState`, `IRecordFormNextRecommendedAction`, `IRecordFormRecoveryState`, `IRecordFormFailureState`, `IRecordFormRetryState`, `IRecordFormTelemetryState`, 4 reason-code unions, 3 constants. Testing subpath at `@hbc/record-form/testing`.

**Correct usage:** Module adapters consume primitive public exports. Module-specific schemas and validation rules remain adapter-owned (projection-only). Runtime and orchestration ownership stays in the primitive. Reusable visual primitives belong in `@hbc/ui-kit`.

**Anti-patterns / must not:**
- Must not contain reusable visual primitives — those belong in `@hbc/ui-kit`.
- Must not allow module adapters to import internal paths — public barrel only.
- Module adapters must not re-invent lifecycle interpretation locally.

**Governing plan:** [SF23-Record-Form.md](../../docs/architecture/plans/shared-features/SF23-Record-Form.md)

---

#### `@hbc/saved-views` · v0.0.5 · [Scaffold]

| Field | Value |
|-------|-------|
| **Path** | `packages/saved-views/` |
| **Layer** | 8 — Shared-Feature Primitives |
| **Depends on** | `@hbc/models` (workspace) |
| **Used by** | All Phase 3 modules via `ISavedViewStateMapper<TState>`, `@hbc/export-runtime` (savedViewContext), `@hbc/bulk-actions` (scope handoff) |
| **Maturity** | Scaffold |

**Purpose:** Shared workspace-state persistence runtime — view lifecycle, scope model (personal/team/role/system), schema compatibility/reconciliation, and `ISavedViewStateMapper<TState>` module adapter seam. Establishes `ISavedViewContext` handoff consumed by export-runtime and bulk-actions.

**Key exports:** `SavedViewScope`, `ISavedViewDefinition`, `ISavedViewStateMapper<TState>`, `IFilterClause`, `ISortDefinition`, `IGroupDefinition`, `IViewPresentationState`, `ISchemaCompatibilityResult`, `IViewReconciliationResult`, `ISavedViewContext`, 2 constants. Testing subpath at `@hbc/saved-views/testing`.

**Governing plan:** [SF26-Saved-Views.md](../../docs/architecture/plans/shared-features/SF26-Saved-Views.md)

---

### Layer 9 — Domain Data Infrastructure

---

#### `@hbc/data-seeding` · v0.0.1 · [Partial]

| Field | Value |
|-------|-------|
| **Path** | `packages/data-seeding/` |
| **Layer** | 9 — Domain Data Infrastructure |
| **Depends on** | `xlsx ^0.18.5` (external); peer: `@hbc/complexity`, `@hbc/ui-kit`, `@tanstack/react-query`, react |
| **Used by** | Apps that need data import capabilities |
| **Maturity** | Partial |

**Purpose:** Structured data import and initial state population. Handles Excel/CSV file parsing, batch import orchestration, and seed data generators. Used for migrating legacy data into the platform.

**Key exports:** CSV/Excel parser, batch import utilities, seed generator framework.

**Correct usage:** Use for one-time or periodic data migration scenarios. Not a real-time data synchronization tool.

**Anti-patterns / must not:**
- Must not be used for real-time data sync or production data pipelines.
- Must not hardcode domain-specific column mappings — use the generic seed generator framework.

**Notes / risks:** Domain-specific seeders (for estimating, accounting, etc.) do not yet exist. The framework is ready to be extended.

---

### Layer 10 — Feature Packages

> All feature packages follow a shared composition pattern: they depend on the standard platform set (`@hbc/models`, `@hbc/query-hooks`, `@hbc/ui-kit`, `@hbc/auth`, `@hbc/shell`) and add domain-specific platform primitives as needed. They own domain-specific views, workflows, and domain-level Zustand stores.

> **Rule:** Feature packages must not depend on other feature packages. Cross-feature behavior belongs in Layer 6–7 platform primitives.

---

#### `@hbc/features-accounting` · v0.0.0 · [Scaffold]

| Field | Value |
|-------|-------|
| **Path** | `packages/features/accounting/` |
| **Layer** | 10 — Feature Packages |
| **Depends on** | Standard 5: models, query-hooks, ui-kit, auth, shell |
| **Used by** | `apps/accounting` (SPFx webpart) |
| **Maturity** | Scaffold |

**Purpose:** Domain feature package for the Accounting module. MVP rollout priority: **#1** (per CLAUDE.md). Owns accounting-specific views, workflows, and domain logic.

**Notes:** Scaffold only — no dist folder, no tests. First in MVP priority order, meaning this will be the first feature package to reach full implementation.

---

#### `@hbc/features-estimating` · v0.0.1 · [Partial]

| Field | Value |
|-------|-------|
| **Path** | `packages/features/estimating/` |
| **Layer** | 10 — Feature Packages |
| **Depends on** | Standard 5 + `@hbc/smart-empty-state`, `@hbc/health-indicator`, `@hbc/post-bid-autopsy`, `@hbc/step-wizard`, `@tanstack/react-query ^5.75.0` |
| **Used by** | `apps/estimating` (SPFx webpart) |
| **Maturity** | Partial |

**Purpose:** Domain feature package for the Estimating module. MVP rollout priority: **#2**. Implements bid-readiness scoring as an adapter over `@hbc/health-indicator`. Includes pursuit readiness module and Storybook-driven component development.

**Notes / risks:** Depends on `@hbc/health-indicator` (scaffold) and `@hbc/post-bid-autopsy` (scaffold with circular dependency risk). These scaffold dependencies are the primary risk for Wave 1 estimating work.

---

#### `@hbc/features-project-hub` · v0.0.1 · [Partial]

| Field | Value |
|-------|-------|
| **Path** | `packages/features/project-hub/` |
| **Layer** | 10 — Feature Packages |
| **Depends on** | Standard 5 + `@hbc/bic-next-move`, `@hbc/notification-intelligence`, `@hbc/project-canvas`, `@hbc/query-hooks`, `@hbc/versioned-record`, `@hbc/complexity`, `@hbc/smart-empty-state`, `@tanstack/react-query ^5.75.0` |
| **Used by** | `apps/project-hub` (SPFx webpart) |
| **Maturity** | Partial |

**Purpose:** Domain feature package for the Project Hub module. MVP rollout priority: **#3**. Contains the Project Health Pulse (SF21) scaffold. Central project-context landing page for all project activity.

**Notes:** This feature package is the consumer of the provisioning UX built in Wave 0. Once provisioning is complete, Project Hub owns the post-setup project workspace entry point.

---

#### `@hbc/features-business-development` · v0.0.1 · [Partial]

| Field | Value |
|-------|-------|
| **Path** | `packages/features/business-development/` |
| **Layer** | 10 — Feature Packages |
| **Depends on** | Standard 5 + 14 additional packages (bic-next-move, smart-empty-state, score-benchmark, project-canvas, complexity, versioned-record, related-items, notification-intelligence, acknowledgment, health-indicator, ai-assist, post-bid-autopsy, step-wizard, strategic-intelligence) |
| **Used by** | `apps/business-development` (SPFx webpart) |
| **Maturity** | Partial |

**Purpose:** Domain feature package for the Business Development module. MVP rollout priority: **#5**. Adapter surfaces over `@hbc/score-benchmark` and `@hbc/strategic-intelligence`. Includes BD pipeline, score benchmarking UI, and strategic intelligence integration.

**⚠️ Risk — very wide dependency surface:** This feature package has 19 package dependencies, including all four scaffold Intelligence packages. Any change to any dependency cascades here. This is the highest-risk feature package in the repo due to its breadth. [verified]

---

#### `@hbc/features-leadership` · v0.0.0 · [Scaffold]
#### `@hbc/features-human-resources` · v0.0.0 · [Scaffold]
#### `@hbc/features-operational-excellence` · v0.0.0 · [Scaffold]
#### `@hbc/features-quality-control-warranty` · v0.0.0 · [Scaffold]
#### `@hbc/features-risk-management` · v0.0.0 · [Scaffold]
#### `@hbc/features-safety` · v0.0.0 · [Scaffold]

All six of these feature packages follow the same scaffold pattern:
- Standard 5 dependencies only (models, query-hooks, ui-kit, auth, shell)
- No dist folder
- No tests (passWithNoTests)
- No implementation beyond src barrel

These are placeholder packages for future waves. Do not take dependencies on them or build features into them until they are formally activated per a Canonical Normative Plan.

---

#### `@hbc/features-admin` · v0.0.1 · [Partial]

| Field | Value |
|-------|-------|
| **Path** | `packages/features/admin/` |
| **Layer** | 10 — Feature Packages |
| **Depends on** | Standard 5 + `@hbc/smart-empty-state`, `@tanstack/react-query ^5.75.0` |
| **Used by** | `apps/admin` (SPFx webpart) |
| **Maturity** | Partial |

**Purpose:** Admin Intelligence feature package. Implements monitoring dashboards, approval queues, and admin intelligence views. Wave 0 requires this package to be extended with provisioning failures inbox, controller gate review UI, and operational telemetry surfaces.

---

### Cross-Package App and Backend Summary

---

#### `apps/pwa` · [Mature — shell structure]

Depends on the full platform foundation: models, data-access, query-hooks, auth, shell, ui-kit, complexity, plus provisioning, MSAL, TanStack Router. The primary PWA entry point for all HB Intel capabilities outside SharePoint.

---

#### `apps/dev-harness` · [Mature]

Loads all packages and SPFx webpart instances in a single Vite-based browser environment. Used for component development, integration testing, and live-reload development. Should never be deployed.

---

#### `apps/hb-site-control` · [Partial]

Mobile-first connected field app with PWA capabilities. Uses models, data-access, query-hooks, auth, shell, ui-kit, MSAL, TanStack Router, TanStack Table.

---

#### `apps/spfx-*` (11 webpart apps) · [Partial]

All 11 SPFx webpart apps follow the same stack: complexity, models, data-access, query-hooks, auth, shell, ui-kit, FluentUI, TanStack Query, TanStack Router. Shells are in place; domain feature implementation is in progress.

---

#### `backend/functions` · [Partial]

Azure Functions backend. Depends on `@hbc/models`, `@hbc/acknowledgment`, `@hbc/notification-intelligence` (for notification delivery), `@pnp/sp`, `@pnp/graph`, `@azure/data-tables`, `@azure/identity`, `jose`. Does not depend on React, UI kit, or shell — correctly isolated. Provisioning saga is architecturally complete but SharePoint integration needs production hardening.

---

## Cross-Package Relationship Summary

### Most Critical Relationships

**1. `@hbc/models` → Everything**
Models is the root type contract. Any breaking change here is a broad regression risk. The most depended-upon package in the repo.

**2. `@hbc/complexity` → All UI Packages**
Complexity is a provider that wraps the entire app. If it malfunctions, all components lose their density context. Its unusual `@tanstack/react-query` dependency should be understood before extending it.

**3. `@hbc/auth` → All Protected Surfaces**
Auth context must be initialized before any auth-aware component renders. Since `@hbc/ui-kit` depends on `@hbc/auth`, the entire design system requires auth. Provider order matters: auth → complexity → consumers.

**4. `@hbc/ui-kit` → All Visual Output**
The only permitted source of visual components. All platform primitives, feature packages, and apps must compose from ui-kit and must never introduce parallel presentational components.

**5. `@hbc/provisioning` → Wave 0 Consumer Apps**
The headless provisioning package is ready; Wave 0's gap is the consumer UX surfaces in `apps/project-hub`, `apps/admin`, and `apps/pwa`. The relationship between `@hbc/provisioning` and `backend/functions` is the production-critical integration seam.

**6. `@hbc/bic-next-move` → Workflow Primitives**
All three Layer 7 workflow primitives (`@hbc/step-wizard`, `@hbc/field-annotations`, `@hbc/workflow-handoff`) depend on `@hbc/bic-next-move`. Ownership visibility is a foundational concern woven into every structured workflow.

**7. Intelligence Scaffold Circular Dependency — ✅ Resolved (ADR-0114, 2026-03-14)**
The `@hbc/score-benchmark` ↔ `@hbc/post-bid-autopsy` circular dependency has been eliminated. Source-code inspection confirmed the cycle was false: `@hbc/post-bid-autopsy` declared `@hbc/score-benchmark` as a prod dependency but never imported from it. The unused declaration was removed. The remaining `score-benchmark → post-bid-autopsy` type-only import of `PostBidLearningSignal` is a correct, directionally valid edge and is retained.

### Standard Feature Package Composition Pattern

All feature packages follow this composition:
```
Feature Package
├── @hbc/models (types)
├── @hbc/query-hooks (data fetching + Zustand stores)
├── @hbc/ui-kit (components)
├── @hbc/auth (guards, permission stores)
├── @hbc/shell (navigation context, module config)
└── [selected platform primitives as needed]
```
This pattern is the correct template for any new feature package.

---

## Dependency / Boundary Risks

### Risk 1 — Circular Dependency: `@hbc/score-benchmark` ↔ `@hbc/post-bid-autopsy` — ✅ RESOLVED
**Resolved:** 2026-03-14 — ADR-0114
**Original severity:** Critical (blocked production use of either package)
**Root cause:** `@hbc/post-bid-autopsy/package.json` declared `@hbc/score-benchmark` as a prod dependency but never imported from it. The cycle was a false cycle caused by an unused declaration.
**Resolution applied:** Removed `"@hbc/score-benchmark": "workspace:*"` from `packages/post-bid-autopsy/package.json` dependencies. The `score-benchmark → post-bid-autopsy` type-only import of `PostBidLearningSignal` is retained (directionally correct, erased at compile time).
**Remaining constraint:** Risk 3 (scaffold maturity) continues to govern Wave 1 production readiness for both packages independently.

### Risk 2 — `@hbc/ui-kit` → `@hbc/auth` Tight Coupling
**Severity:** Medium (architectural smell, practical workaround exists)
**Evidence:** `@hbc/ui-kit/package.json` lists `@hbc/auth` as a prod dependency. [verified]
**Impact:** Auth context must always be initialized before any design system component renders. Incorrect provider order causes silent failures. Also means any auth-related change potentially requires ui-kit update.
**Monitoring:** Document the required provider order clearly in every app entrypoint. Consider whether the auth dependency could be moved to a peer dep in a future ui-kit version.

### Risk 3 — Intelligence Layer All Scaffold
**Severity:** Medium (limits Wave 1 feature work)
**Evidence:** `@hbc/health-indicator`, `@hbc/score-benchmark`, `@hbc/strategic-intelligence`, `@hbc/post-bid-autopsy` all have scaffold maturity. [verified]
**Impact:** `@hbc/features-estimating` and `@hbc/features-business-development` both depend on scaffolded intelligence packages. Any Wave 1 feature work that relies on actual scoring, benchmarking, or intelligence must complete these packages first.
**Resolution:** Create implementation plans for the intelligence packages before activating Wave 1 estimating/BD features.

### Risk 4 — `@hbc/features-business-development` Over-Wide Dependency
**Severity:** Medium
**Evidence:** 19 prod dependencies including all scaffold intelligence packages. [verified]
**Impact:** Highly fragile to changes across the platform. Any platform primitive change may require BD feature updates.
**Resolution:** Review whether all 19 dependencies are actively used. Consider splitting BD into sub-packages if the dependency surface cannot be reduced.

### Risk 5 — Production Data Adapters Not Implemented
**Severity:** High for production (low for development)
**Evidence:** `@hbc/data-access` has mock adapters only. SharePoint, proxy, and API adapters are stubs. [verified]
**Impact:** All feature packages work against mock data today. No real data access exists until adapters are implemented.
**Resolution:** Wave 1 production feature development requires completing at least the SharePoint or proxy data adapters.

### Risk 6 — Scaffold Feature Packages Accidentally Activated
**Severity:** Medium
**Evidence:** 6 scaffold feature packages (accounting, leadership, HR, ops-excellence, QC-warranty, risk, safety) have no implementation but have valid package.json files.
**Impact:** Accidentally depending on or building into these packages outside a formally activated phase violates the Zero-Deviation Rule.
**Resolution:** Do not add dependencies on or implementations to scaffold feature packages without a formal phase activation in a Canonical Normative Plan.

### Risk 7 — `@hbc/complexity` → `@tanstack/react-query` Dependency
**Severity:** Low (currently working, intent uncertain)
**Evidence:** `@hbc/complexity/package.json` lists `@tanstack/react-query` as a prod dep. [verified — intent uncertain]
**Impact:** Complexity inherits react-query as a dependency, which may be unnecessary for a density context provider.
**Resolution:** Investigate and document why complexity needs react-query. If it's not needed, remove it. If it is needed, document the reason in the package README.

---

## Recommended Development Guidance

Use this map when:

**Before adding a new dependency:** Check the layer of both the importer and the imported package. Ensure the dependency flows downward. Check if the target package is a scaffold before depending on it.

**Before creating a new component:** Check `@hbc/ui-kit` first. If the component exists, use it. If it's domain-agnostic and reusable, contribute it to `@hbc/ui-kit`. Only create a local component if it is genuinely domain-specific and not reusable.

**Before creating a new package:** Identify the correct layer. Check that no existing package already covers the needed concern. Create an ADR for any new shared platform primitive.

**Before building a multi-step workflow:** Use `@hbc/step-wizard`. Before building a form with field-level clarifications: use `@hbc/field-annotations`. Before building an ownership/accountability indicator: use `@hbc/bic-next-move`. Do not reimplement these primitives.

**Before depending on an intelligence scaffold package:** Acknowledge the scaffold status. Plan for completing the implementation before production use. Do not use `@hbc/score-benchmark` or `@hbc/post-bid-autopsy` until the circular dependency is resolved.

**Before working on a feature package:** Verify that the feature package is formally activated in a Canonical Normative Plan. Scaffold packages (leadership, HR, ops-excellence, etc.) must not be implemented outside a formal phase activation.

**When reviewing a pull request that adds cross-package dependencies:** Verify: (1) layer direction is correct, (2) the dependency is not circular, (3) UI components come from ui-kit, (4) the consuming package is not a lower-layer package importing from a higher-layer package.

---

## Maintenance Guidance

This document must be updated when:

- A new package is added to `packages/`
- An existing package's major exports change
- A package's dependencies change significantly (new prod dep, or dep removal)
- A package's maturity status changes (scaffold → partial, partial → mature)
- A circular dependency is resolved
- A package is deprecated or removed
- A new architectural rule or ADR affects package boundaries

**Update process:**
1. Edit this file directly (it is a living Canonical Normative Plan).
2. Bump the document version number.
3. Add a row to the document history table.
4. Update `current-state-map.md §2` if this is a new document (first update is complete when this file is first added to the matrix).

**This document should NOT be updated to reflect implementation progress within a package** — that belongs in `current-state-map.md`. This document describes *relationships and rules*, not *what has been built*.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-14 | Initial creation — comprehensive package relationship map covering all 35 packages across `packages/`, 14 app shells, and 1 backend. Verified by live codebase inspection. |
