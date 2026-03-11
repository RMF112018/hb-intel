# SF11 — `@hbc/smart-empty-state`: Context-Aware Empty State & Onboarding Guidance

**Plan Version:** 1.0
**Date:** 2026-03-10
**Source Spec:** `docs/explanation/feature-decisions/PH7-SF-11-Shared-Feature-Smart-Empty-State.md`
**Priority Tier:** 2 — Application Layer (production-readiness primitive for module learnability)
**Estimated Effort:** 1.75–2.25 sprint-weeks
**ADR Required:** `docs/architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md`

> **Doc Classification:** Canonical Normative Plan — SF11 implementation master plan for `@hbc/smart-empty-state`; governs SF11-T01 through SF11-T09.

---

## Purpose

`@hbc/smart-empty-state` converts empty module screens from dead-ends into guided, context-aware onboarding moments. The package standardizes how modules classify an empty condition, render role-appropriate guidance, and present the right next action.

Without this primitive, each module implements ad-hoc empty-state UX with inconsistent behavior, inconsistent first-use guidance, and poor first-impression learnability.

---

## Locked Interview Decisions

| # | Decision | Locked Choice |
|---|---|---|
| D-01 | Classification precedence | `loading-failed > permission-empty > filter-empty > first-use > truly-empty`; highest-priority matching classification wins |
| D-02 | Resolver contract | Module provides `ISmartEmptyStateConfig.resolve(context)` and owns text/CTA content; package owns rendering and classification helpers |
| D-03 | CTA model | Max two primary/secondary actions plus optional filter-clear action; action supports `href` or `onClick`; package does not orchestrate async workflows |
| D-04 | First-visit persistence | Adapter interface `IEmptyStateVisitStore` with browser fallback implementation (`localStorage` + in-memory safety fallback); no hard dependency on `@hbc/session-state` in Phase 1 |
| D-05 | Complexity behavior | Essential: coaching tip visible; Standard: coaching tip rendered as collapsible hint; Expert: coaching tip hidden |
| D-06 | Render variants | `full-page` and `inline` variants share same classification semantics and CTA behavior |
| D-07 | SPFx compatibility | Use `@hbc/ui-kit/app-shell` compatible components only; no external hosted assets required |
| D-08 | Notification boundary | Package does not import `@hbc/notification-intelligence`; hosts may emit alerts for repeated load failures |
| D-09 | Module adoption baseline | BD, Estimating, Project Hub, and Admin define production `ISmartEmptyStateConfig` reference implementations |
| D-10 | Testing sub-path | `@hbc/smart-empty-state/testing` exports: `createMockEmptyStateContext`, `createMockEmptyStateConfig`, `mockEmptyStateClassifications` |

---

## Package Directory Structure

```text
packages/smart-empty-state/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── ISmartEmptyState.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── emptyStateDefaults.ts
│   │   └── index.ts
│   ├── classification/
│   │   ├── classifyEmptyState.ts
│   │   ├── emptyStateVisitStore.ts
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useFirstVisit.ts
│   │   ├── useEmptyState.ts
│   │   └── index.ts
│   └── components/
│       ├── HbcSmartEmptyState.tsx
│       ├── HbcEmptyStateIllustration.tsx
│       └── index.ts
├── testing/
│   ├── index.ts
│   ├── createMockEmptyStateContext.ts
│   ├── createMockEmptyStateConfig.ts
│   └── mockEmptyStateClassifications.ts
└── src/__tests__/
    ├── setup.ts
    ├── classifyEmptyState.test.ts
    ├── emptyStateVisitStore.test.ts
    ├── useFirstVisit.test.ts
    ├── useEmptyState.test.ts
    ├── HbcSmartEmptyState.test.tsx
    └── HbcEmptyStateIllustration.test.tsx
```

---

## Classification Model (D-01)

| Classification | Trigger |
|---|---|
| `loading-failed` | `isLoadError === true` |
| `permission-empty` | `isLoadError === false && hasPermission === false` |
| `filter-empty` | `isLoadError === false && hasPermission === true && hasActiveFilters === true` |
| `first-use` | all above false and `isFirstVisit === true` |
| `truly-empty` | all above false and `isFirstVisit === false` |

---

## Complexity Rendering (D-05)

| Element | Essential | Standard | Expert |
|---|---|---|---|
| Main heading / description | Shown | Shown | Shown |
| Primary/Secondary CTA | Shown | Shown | Shown |
| Coaching tip | Inline text | Collapsible hint (default collapsed) | Hidden |

---

## Integration Points

| Package | Integration Detail |
|---|---|
| `@hbc/complexity` | Determines coaching-tip behavior (D-05) |
| `@hbc/ui-kit` / `@hbc/ui-kit/app-shell` | Primitive visuals, icon wrappers, layout shells |
| `@hbc/data-seeding` | First-use secondary CTA may deep-link to import/setup routes |
| PH9b Progressive Coaching | First-use coaching tip acts as entry point into broader guidance model |

---

## SPFx Constraints

| Concern | Constraint |
|---|---|
| Visual primitives | Must use app-shell-safe components |
| Storage | Browser storage fallback with no blocking dependency on unavailable APIs |
| Assets | Local icon/illustration keys only (no remote image requirement) |

---

## Effort Estimates

| Task File | Scope | Estimate |
|---|---|---|
| T01 Package Scaffold | Package structure, configs, exports | 0.2 sw |
| T02 TypeScript Contracts | Interfaces, unions, constants | 0.25 sw |
| T03 Classification & Persistence | Precedence helper + visit-store adapter | 0.3 sw |
| T04 Hooks | `useFirstVisit`, `useEmptyState` | 0.2 sw |
| T05 HbcSmartEmptyState | Main renderer + CTA logic | 0.35 sw |
| T06 Illustration & Layout | Visual wrapper + full/inline variants | 0.2 sw |
| T07 Reference Implementations | BD/Estimating/Project Hub/Admin configs | 0.15 sw |
| T08 Testing Strategy | Testing sub-path + unit/storybook/E2E coverage | 0.2 sw |
| T09 Testing & Deployment | Mechanical gates + ADR/docs/state-map updates | 0.2 sw |
| **Total** | | **2.05 sprint-weeks** |

---

## Definition of Done

- [ ] All SF11 contracts exported from `@hbc/smart-empty-state`
- [ ] Classification precedence implemented exactly per D-01
- [ ] `useFirstVisit` supports adapter injection and browser fallback storage
- [ ] `HbcSmartEmptyState` renders all 5 classifications in both variants
- [ ] Standard complexity renders coaching tip as collapsible hint
- [ ] Essential complexity renders coaching tip inline; Expert hides it
- [ ] `@hbc/smart-empty-state/testing` exports all D-10 fixtures
- [ ] BD, Estimating, Project Hub, Admin reference configs documented in T07
- [ ] Unit + component + story + E2E strategy documented in T08
- [ ] T09 includes full documentation and deployment requirements modeled on SF09-T09
- [ ] `current-state-map.md` classification matrix updated with SF11 entry

---

## Task File Index

| File | Contents |
|---|---|
| `SF11-T01-Package-Scaffold.md` | Scaffold, package exports, coverage gates |
| `SF11-T02-TypeScript-Contracts.md` | All contracts, constants, default labels |
| `SF11-T03-Classification-and-Persistence.md` | Classification precedence + visit store adapter |
| `SF11-T04-Hooks.md` | `useFirstVisit`, `useEmptyState` |
| `SF11-T05-HbcSmartEmptyState.md` | Core renderer + CTA handling + complexity behavior |
| `SF11-T06-HbcEmptyStateIllustration-and-Layout.md` | Illustration wrapper + full/inline layout |
| `SF11-T07-Reference-Implementations.md` | Module configs (BD, Estimating, Project Hub, Admin) |
| `SF11-T08-Testing-Strategy.md` | Testing sub-path + tests + Storybook + Playwright |
| `SF11-T09-Testing-and-Deployment.md` | Checklist, ADR-0100 template, docs outputs, verification gates |

<!-- IMPLEMENTATION PROGRESS & NOTES
SF11 master plan authored: 2026-03-10
Status: Canonical Normative Plan (planning complete; implementation pending)
ADR required: ADR-0100
T09 must follow SF09-T09 documentation/deployment rigor including current-state-map updates.

SF11-T01 completed: 2026-03-10
- Package scaffold created with 27 files
- All gates pass: build (0 errors), check-types (0 errors), test:coverage (100% all metrics)
- Full monorepo build verified (35/35 tasks)
- Next: T02 TypeScript Contracts

SF11-T02 completed: 2026-03-11
- Canonical T02 contracts implemented: 5 classifications, 2 variants, 6 interfaces, 3 constants
- All downstream stubs and testing fixtures updated to compile against new contracts
- All gates pass: check-types (0 errors), build (0 errors), test:coverage (100% all metrics), full monorepo build (35/35)
- Next: T03 Classification & Persistence
-->
