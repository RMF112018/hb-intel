# Package Relationship Map — Implementation Report

> **Doc Classification:** Canonical Normative Plan — implementation report for the creation of the package relationship map. Captures methodology, findings, and changes made.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Complete

---

## Executive Summary

The HB Intel monorepo has grown to 35 packages across `packages/`, 14 application shells, and 1 backend service. As the platform approaches Wave 0 delivery planning and subsequent feature waves, the absence of a comprehensive cross-package relationship map creates risk: developers and agents making dependency decisions lack authoritative guidance on layer ownership, dependency direction rules, maturity status, and known boundary risks.

This task created a new canonical reference document, `docs/architecture/blueprint/package-relationship-map.md`, that provides a complete architectural view of every package — what it owns, what it depends on, who depends on it, how mature it is, and what developers must not do with it. The document was authored from live codebase inspection (reading actual `package.json` files and barrel exports), not from documentation claims alone.

`CLAUDE.md` was also updated to instruct future agents to consult the package relationship map before making dependency, architecture, or implementation decisions involving packages.

---

## Package Count Reviewed

| Category | Count |
|----------|-------|
| Layer 1 — Domain Types | 2 |
| Layer 2 — Core Infrastructure | 4 |
| Layer 3 — Platform Core | 2 |
| Layer 4 — Design System & UI Foundation | 3 |
| Layer 5 — Shell & Experience Infrastructure | 4 |
| Layer 6 — Platform Primitives | 7 |
| Layer 7 — Workflow Primitives | 3 |
| Layer 8 — Intelligence Scaffolds | 4 |
| Layer 9 — Domain Data Infrastructure | 1 |
| Layer 10 — Feature Packages | 11 |
| **Total packages** | **41** |
| Apps (including 11 SPFx webparts) | 14 |
| Backend | 1 |
| **Total workspace members analyzed** | **56** |

Every package in `packages/` was inspected via its `package.json` and barrel export files. App-level `package.json` files were reviewed to verify consumer relationships. Backend `package.json` was reviewed for backend-package dependency patterns.

---

## Files Created or Updated

| File | Action | Notes |
|------|--------|-------|
| `docs/architecture/blueprint/package-relationship-map.md` | Created | New canonical reference document — 11 sections, full package catalog |
| `docs/architecture/blueprint/package-relationship-map-report.md` | Created | This implementation report |
| `CLAUDE.md` | Updated (v1.6) | Added package relationship map as required reference source for package/dependency work |

---

## Key Relationship Findings

### 1. Clean Dependency DAG (Mostly)

The monorepo has a well-structured layered architecture. The majority of dependency relationships flow correctly downward: feature packages depend on primitives, primitives depend on core infrastructure, core infrastructure depends on domain types. The ESLint boundary rules (enforced by `@hb-intel/eslint-plugin-hbc`) are a meaningful guardrail.

### 2. Circular Dependency: `@hbc/score-benchmark` ↔ `@hbc/post-bid-autopsy`

Both intelligence scaffold packages list each other as prod dependencies. This is a circular dependency that prevents production use of either package. Any Wave 1 feature work depending on scoring or post-bid analysis (estimating, business development) must resolve this cycle before proceeding. Resolution options include: extracting shared types to a new package, merging the two packages, or inverting one dependency direction. An ADR is required.

### 3. `@hbc/ui-kit` Depends on `@hbc/auth`

Layer 4 (design system) has a hard production dependency on Layer 3 (auth). This means auth must always be initialized before any design system component renders. The required provider initialization order (auth → complexity → ui-kit consumers) must be documented in every app entrypoint. This is a known architectural coupling and should be explicitly documented.

### 4. All Intelligence-Layer Packages Are Scaffolds

The four intelligence packages (`@hbc/health-indicator`, `@hbc/score-benchmark`, `@hbc/strategic-intelligence`, `@hbc/post-bid-autopsy`) are scaffolded — type definitions and structural frameworks only. Two Wave 1-priority feature packages (`@hbc/features-estimating`, `@hbc/features-business-development`) depend on these scaffolds. This is the primary risk for Wave 1 feature development.

### 5. `@hbc/features-business-development` Has the Widest Dependency Surface

The BD feature package lists 19 prod dependencies — the widest in the repo. It depends on all four scaffold intelligence packages, all major workflow primitives, and all platform capabilities. This creates high fragility. Any change to any of its 19 dependencies may require BD feature updates.

### 6. Production Data Adapters Do Not Exist

`@hbc/data-access` has comprehensive mock adapters but stub-only implementations for SharePoint, proxy, and API adapters. All feature packages and apps currently work against mock data. No path to real data access exists without completing at least one production data adapter.

### 7. `@hbc/provisioning` Is Headless and Ready — UX Surfaces Are Not

The provisioning headless package (state machine, SignalR hook, API client, Zustand store) is mature and ready to be consumed. Wave 0's critical gap is the consumer UX surfaces: no setup request form, no status tracker, no admin failures inbox exists in any app. The backend provisioning saga is also architecturally ready but needs production hardening (Retry-After handling, Steps 3–4 compensation, OBO validation).

### 8. Standard Feature Composition Pattern Is Consistent

All feature packages follow the same base pattern: standard-5 dependencies (models, query-hooks, ui-kit, auth, shell) plus selected primitives. This is a healthy, consistent pattern that new feature packages should continue to follow.

### 9. `@hbc/app-shell` Is Minimal — Purpose Unclear

The `@hbc/app-shell` package is a thin re-export composition of shell + auth + ui-kit. Its value proposition over individual imports is unclear. It should be documented or consolidated before being extended.

### 10. `@hbc/complexity` Has an Unexplained `@tanstack/react-query` Dependency

The density context provider depends on react-query, which is unusual for a pure context primitive. The intent is unclear. This should be investigated and documented before extending the package.

---

## Risks / Ambiguities

| Risk | Severity | Resolution |
|------|----------|------------|
| Circular dependency: score-benchmark ↔ post-bid-autopsy | Critical | ADR required to resolve before Wave 1 intelligence feature work |
| Intelligence layer all scaffold | High | Implementation plans required for Wave 1 estimating/BD features |
| Production data adapters absent | High | SharePoint or proxy adapter must be completed before any production feature data |
| BD feature over-wide dependency surface (19 deps) | Medium | Review whether all deps are actively used; consider splitting if not reducible |
| ui-kit → auth tight coupling | Medium | Document provider order in all apps; monitor for future ui-kit refactoring opportunity |
| complexity → react-query unexplained dep | Low | Investigate and document or remove |
| app-shell undefined purpose | Low | Document or consolidate before extending |
| Scaffold feature packages risk accidental activation | Medium | Enforce: no implementation outside formally activated phases |

---

## CLAUDE.md Update Summary

`CLAUDE.md` was updated from version 1.5 to version 1.6 with the following changes:

**What was added:**
A new required reference source was added to the Immutable Core Directives section (§1): `docs/architecture/blueprint/package-relationship-map.md`. The directive specifies:

1. The package relationship map is a required supporting reference for any work involving packages, dependencies, or cross-package architecture decisions.
2. It must be consulted before: adding a new package dependency, creating a new package, moving code across package boundaries, or reviewing whether an existing dependency is healthy.
3. It does not override `current-state-map.md` (Tier 1 present-state authority) or any ADR.
4. It is positioned alongside the current-state-map and unified blueprint as a supporting architectural reference, not as a governance authority.

**Why this matters:**
Without an explicit instruction to consult the package map, future agents may add dependencies that violate layer rules, depend on scaffolded packages without acknowledging the risk, create parallel presentational components instead of contributing to `@hbc/ui-kit`, or miss circular dependency risks. The map instruction makes the architectural intent actionable.

**Document History entry added:**
A version 1.6 row was added to `CLAUDE.md §9 Document History` documenting the addition.

---

## Document Classification

Both new files have been classified as **Canonical Normative Plan** per CLAUDE.md §4 and the six-class document classification system in `current-state-map.md §2.1`. Both files include the required Tier 1 banner at the top.

These documents must be added to `current-state-map.md §2` (document classification matrix) as part of the next current-state-map update.
