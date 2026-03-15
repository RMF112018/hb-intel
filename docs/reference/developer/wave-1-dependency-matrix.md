# Wave 1 Shared-Package Dependency Matrix

**Purpose:** Complete dependency map with readiness classifications for all shared packages consumed by Wave 1 apps and features.
**Date:** 2026-03-15
**Scope:** Personal Work Hub, Project Hub, Estimating, Business Development

---

## 1. Category A: Core Platform Readiness

| Package | Version | Tests | Readiness | Restrictions |
|---------|---------|-------|-----------|-------------|
| `@hbc/models` | 0.1.0 | None | **Ready with Restrictions** | Type-only package; no runtime logic to test. Changes to shared types require cross-package impact review before merge. |
| `@hbc/data-access` | 0.0.1 | None | **Ready with Restrictions** | Ports/adapters layer with factory functions. New adapter implementations must include tests. Existing factories are DI-safe. |
| `@hbc/query-hooks` | 0.0.1 | 1 file | **Ready** | TanStack Query hooks with DI-ready repos. |
| `@hbc/auth` | 0.2.0 | 26 files | **Ready** | Most tested core package. Dual-mode auth, guards, permission model, provisioning override permissions. Proven in Wave 0. |
| `@hbc/shell` | 0.0.1 | 18 files | **Ready** | Navigation, layout, workspace management, active-workspace tracking, nav config registry. |
| `@hbc/app-shell` | 0.0.2 | N/A | **Ready** | Shell aggregator surface (read-only). |
| `@hbc/ui-kit` | 2.1.0 | 3 files | **Ready** | Most mature package. 117 exports, Storybook, Fluent UI integration, design system tokens, form/chart components. |
| `@hbc/provisioning` | 0.2.0 | 16 files | **Ready** | Full saga, BIC config, 15 notification registrations, 10 failure modes, 7 integration rules. Proven in Wave 0 G1–G6. |

---

## 2. Category C: Shared-Feature Primitive Readiness

### Readiness Classification Key

| Classification | Meaning | Action Required |
|---------------|---------|-----------------|
| **Ready** | Tested, implemented, safe for critical-path use | None |
| **Ready with Restrictions** | Implemented but has a specific limitation | Follow the stated restriction |
| **Must Be Hardened** | Missing tests or critical gaps | Must be addressed before critical-path use |
| **Do Not Use in Critical Path** | Too immature for production dependency | Use only for prototyping or non-critical features |

### Primitive Readiness Table

| Package | Version | Tests | Src Files | Readiness | Notes |
|---------|---------|-------|-----------|-----------|-------|
| `@hbc/bic-next-move` | 0.1.0 | 9 | 22 | **Ready** | Ownership tracking, urgency tiers, module registration. Tier-1 mandatory. |
| `@hbc/complexity` | 0.1.0 | 9 | 21 | **Ready** | Three-tier density context (essential/standard/expert). Tier-1 mandatory. |
| `@hbc/sharepoint-docs` | 0.1.0 | 6 | 53 | **Ready with Restrictions** | Document lifecycle. Tier-1 mandatory. Restriction: offline queue path not yet proven in production. |
| `@hbc/acknowledgment` | 0.1.0 | 9 | 22 | **Ready** | Reusable sign-off primitive with session-state integration. |
| `@hbc/step-wizard` | 0.1.1 | 9 | 22 | **Ready** | Multi-step guided workflows. Proven in Wave 0 project setup wizard. |
| `@hbc/versioned-record` | 0.0.1 | 9 | 22 | **Ready** | Version history, diff rendering, version badges. |
| `@hbc/field-annotations` | 0.1.0 | 7 | 19 | **Ready** | Inline field-level annotation and comment threads. |
| `@hbc/workflow-handoff` | 0.1.0 | 8 | 20 | **Ready** | Cross-module workflow handoff and routing. Proven in Wave 0 completion flow. |
| `@hbc/data-seeding` | 0.0.1 | 11 | 32 | **Ready** | Dev/demo data seeding with CSV, XLSX, Procore parsers. |
| `@hbc/session-state` | 0.0.1 | 10 | 26 | **Ready** | Offline-safe persistence, operation queue, auto-save drafts. Proven in Wave 0 PWA. |
| `@hbc/project-canvas` | 0.0.1 | 14 | 29 | **Ready with Restrictions** | Role-based dashboard canvas with drag-drop. Restriction: `@dnd-kit/core` not yet proven in SPFx iframe context. Safe for PWA. |
| `@hbc/post-bid-autopsy` | 0.0.1 | 13 | 54 | **Ready** | Evidence, confidence, taxonomy, governance, publication, learning-signal contracts. |
| `@hbc/strategic-intelligence` | 0.0.1 | 11 | 39 | **Ready** | Heritage snapshot, living strategic intelligence with trust/workflow contracts. |
| `@hbc/my-work-feed` | 0.0.1 | 37 | 63 | **Ready** | Most tested Category C package. Full aggregation pipeline, 5 adapters, deterministic ranking. |
| `@hbc/ai-assist` | 0.0.1 | 14 | 40 | **Ready with Restrictions** | Azure AI Foundry integration. Restriction: requires backend Foundry endpoint; no-op without config. |
| `@hbc/health-indicator` | 0.0.1 | 0 | 6 | **Must Be Hardened** | ZERO tests. TypeScript-only scoring/config runtime. Must add tests before Wave 1 critical-path use. |
| `@hbc/notification-intelligence` | 0.0.2 | 11 | 32 | **Ready** | Priority-tiered smart notification system. Standalone primitive. |
| `@hbc/related-items` | 0.0.1 | 9 | 28 | **Ready** | Cross-module record relationship panel. |
| `@hbc/score-benchmark` | 0.0.1 | 12 | 35 | **Ready** | Confidence, similarity, recommendation, governance scoring. |
| `@hbc/smart-empty-state` | 0.0.1 | 8 | 15 | **Ready** | Context-aware empty state classification and guided onboarding. |

---

## 3. Wave 1 App Dependency Map

### Apps

| Package | PWA | Estimating | Project Hub | Business Dev |
|---------|-----|-----------|-------------|-------------|
| `@hbc/auth` | ✓ | ✓ | ✓ | ✓ |
| `@hbc/models` | ✓ | ✓ | ✓ | ✓ |
| `@hbc/data-access` | ✓ | ✓ | ✓ | ✓ |
| `@hbc/query-hooks` | ✓ | ✓ | ✓ | ✓ |
| `@hbc/shell` | ✓ | ✓ | ✓ | ✓ |
| `@hbc/ui-kit` | ✓ | ✓ | ✓ | ✓ |
| `@hbc/complexity` | ✓ | ✓ | ✓ | ✓ |
| `@hbc/provisioning` | ✓ | ✓ | — | — |
| `@hbc/session-state` | ✓ | ✓ | — | — |
| `@hbc/step-wizard` | ✓ | ✓ | — | — |
| `@hbc/bic-next-move` | — | ✓ | — | — |
| `@hbc/workflow-handoff` | — | ✓ | — | — |
| `@hbc/smart-empty-state` | ✓ | — | — | — |

### Feature Packages

| Package | features-estimating | features-project-hub | features-business-dev |
|---------|-------------------|---------------------|----------------------|
| `@hbc/health-indicator` | ✓ | — | — |
| `@hbc/post-bid-autopsy` | ✓ | — | ✓ |
| `@hbc/session-state` | ✓ | — | — |
| `@hbc/smart-empty-state` | ✓ | ✓ | — |
| `@hbc/step-wizard` | ✓ | — | ✓ |
| `@hbc/bic-next-move` | — | ✓ | ✓ |
| `@hbc/notification-intelligence` | — | ✓ | ✓ |
| `@hbc/project-canvas` | — | ✓ | — |
| `@hbc/versioned-record` | — | ✓ | ✓ |
| `@hbc/complexity` | — | — | ✓ |
| `@hbc/related-items` | — | — | ✓ |
| `@hbc/acknowledgment` | — | — | ✓ |
| `@hbc/ai-assist` | — | — | ✓ |
| `@hbc/score-benchmark` | — | — | ✓ |
| `@hbc/strategic-intelligence` | — | — | ✓ |

**Note:** `features-business-development` has the deepest dependency graph (13 Category C packages).

---

## 4. Wave 1 Hardening Actions

| Package | Action Required | Priority | Blocker? |
|---------|----------------|----------|----------|
| `@hbc/health-indicator` | Add unit tests for scoring/config runtime (6 src files, 0 tests) | **High** | Yes — blocks Estimating bid readiness critical path |
| `@hbc/models` | Consider snapshot or type-level tests for breaking-change detection | Low | No — type-only package, DI pattern limits runtime risk |
| `@hbc/data-access` | Add tests for adapter factory functions when new adapters are introduced | Medium | No — existing factories are DI-safe |
| BIC module registrations | Wire 4 existing BIC adapters (Estimating, BD×2, Project Hub) via registration factories | **High** | Yes — blocks Work Hub BIC feed items from Wave 1 features |

---

## Related Documents

- [Shared-Package No-Go Rules](./shared-package-no-go-rules.md)
- [Personal Work Hub Dependency Readiness](../work-hub/dependency-readiness.md)
- [Platform Primitives Registry](../platform-primitives.md)
- [Work Hub Publication Model](../work-hub/publication-model.md)
