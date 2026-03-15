# Shared-Package No-Go Rules

**Purpose:** Mandatory ownership rules and prohibition on app-local substitutes for shared platform capabilities.
**Date:** 2026-03-15
**Governing doctrine:** Roadmap §15.2 — "Use shared capabilities by default where they fit. Most shared features were built with the larger platform in mind and should not be treated as optional."

---

## 1. Mandatory Standards Ownership

Each concern area below has a designated shared package. Wave 1 features MUST use the designated package when their work touches the concern area.

| Concern Area | Owning Package | Version | Tests | Rule |
|-------------|---------------|---------|-------|------|
| **Auth / RBAC** | `@hbc/auth` | 0.2.0 | 26 files | All authentication, authorization, permission evaluation, and guard logic through `@hbc/auth`. |
| **Offline persistence** | `@hbc/session-state` | 0.0.1 | 10 files | All draft management, operation queueing, and IndexedDB persistence through `@hbc/session-state`. |
| **Ownership / BIC** | `@hbc/bic-next-move` | 0.1.0 | 9 files | All action-ownership tracking, urgency tiers, and module registration through `@hbc/bic-next-move`. Tier-1 mandatory. |
| **Notifications** | `@hbc/notification-intelligence` | 0.0.2 | 11 files | All notification event registration, delivery, and priority tiering through `@hbc/notification-intelligence`. |
| **Workflow handoff** | `@hbc/workflow-handoff` | 0.1.0 | 8 files | All cross-module work transfers through `@hbc/workflow-handoff`. |
| **Record relationships** | `@hbc/related-items` | 0.0.1 | 9 files | All cross-module record relationship panels through `@hbc/related-items`. |
| **Dashboard canvas** | `@hbc/project-canvas` | 0.0.1 | 14 files | Role-based configurable dashboards through `@hbc/project-canvas`. |
| **Version history** | `@hbc/versioned-record` | 0.0.1 | 9 files | All version history, diff, and badge rendering through `@hbc/versioned-record`. |
| **UI components** | `@hbc/ui-kit` | 2.1.0 | 3 files | All reusable visual UI through `@hbc/ui-kit`. |
| **Personal work aggregation** | `@hbc/my-work-feed` | 0.0.1 | 37 files | All personal work aggregation through `@hbc/my-work-feed`. |
| **Complexity gating** | `@hbc/complexity` | 0.1.0 | 9 files | All tier-based display gating through `@hbc/complexity`. Tier-1 mandatory. |
| **Empty states** | `@hbc/smart-empty-state` | 0.0.1 | 8 files | Context-aware empty states and guided onboarding through `@hbc/smart-empty-state`. |

---

## 2. Hard No-Go Rules

### Rule 1: No app-local auth
All auth flows through `@hbc/auth`. No app-local auth stores, permission checks, guard implementations, or session management. **Exception: none permitted.**

### Rule 2: No app-local BIC reimplementation
Any feature with action-owning workflows MUST register via the `@hbc/bic-next-move` module pattern (see `packages/provisioning/src/bic-registration.ts` for the canonical pattern). **Exception: none permitted.** This is a Tier-1 mandatory primitive per the Platform Primitives Registry.

### Rule 3: No app-local notification systems
All notification event registration, delivery, and tiering through `@hbc/notification-intelligence`. **Exception: none permitted.**

### Rule 4: No app-local "My Work" surfaces
Personal work aggregation is exclusively `@hbc/my-work-feed` (ADR-0115 D-01). No app-local "My Requests", "My Reviews", "My Active Items", or similar per-surface aggregation. **Exception: none permitted.**

### Rule 5: No app-local offline persistence
All draft management, auto-save, and operation queueing through `@hbc/session-state`. No direct app-local IndexedDB or localStorage usage for persistence. **Exception: none permitted.**

### Rule 6: No app-local visual UI primitives
Reusable visual components belong in `@hbc/ui-kit`. Feature packages may contain thin feature-local composition shells that compose `@hbc/ui-kit` primitives, but must not create duplicate design-system-grade components. **Exception: composition shells only.**

### Rule 7: Do not use `@hbc/health-indicator` in critical-path logic
`@hbc/health-indicator` is classified **Must Be Hardened** (zero tests, 6 source files). It must not be used in critical-path scoring or decision logic until a test suite is added. **Exception: non-critical display-only usage is permitted with explicit documentation.**

---

## 3. Exception Process

If a team believes an app-local substitute is necessary despite these rules:

1. **Document** the technical reason the shared package cannot serve the need
2. **File** the exception in the Exception Log (§4 below)
3. **Obtain** Architecture Owner sign-off before proceeding
4. **Include** a plan and timeline for migrating back to the shared package
5. **Review** the exception at the next Wave milestone gate

Exceptions are intended to be rare and temporary. A pattern of exceptions against the same package indicates the package needs investment, not that the rules should be relaxed.

---

## 4. Exception Log

| Date | Package | Feature | Reason | Approver | Migration Plan | Status |
|------|---------|---------|--------|----------|---------------|--------|
| *(No exceptions granted at Wave 1 start)* | | | | | | |

---

## 5. Enforcement

### Code review
Reviewers must verify that new features use the designated shared package for each concern area. App-local reimplementation of a shared concern is a review blocker.

### ESLint
The `@hb-intel/eslint-plugin-hbc` package may be extended with import-path rules to detect prohibited app-local patterns (e.g., direct IndexedDB imports when `@hbc/session-state` is available).

### Feature planning
Wave 1 feature plans must declare which Tier-1 primitives apply to the feature scope and confirm they will be used.

---

## Related Documents

- [Wave 1 Dependency Matrix](./wave-1-dependency-matrix.md)
- [Platform Primitives Registry](../platform-primitives.md)
- [Work Hub Publication Model](../work-hub/publication-model.md)
