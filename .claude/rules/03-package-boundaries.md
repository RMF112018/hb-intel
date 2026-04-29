# 03 — Package Boundaries

## Purpose

Preserve maintainable package ownership, dependency direction, exports, and shared-code placement across the HB Intel monorepo.

---

## Primary Rule

Put code where it belongs based on ownership, reuse, runtime boundary, and dependency direction. Do not move code into shared packages just because two files need similar behavior once.

---

## Boundary Principles

Use these defaults:

- Feature-specific behavior belongs in the feature package.
- Cross-feature behavior belongs in shared/platform packages.
- Durable reusable visual UI belongs in `@hbc/ui-kit` or an explicitly approved successor.
- Domain models and vocabulary belong in model/domain packages.
- Runtime adapters belong near the runtime boundary.
- App-specific composition belongs in the app.
- SPFx-specific runtime glue belongs in SPFx app/webpart packages, not generic shared UI.
- Backend-only logic belongs in backend packages.
- Test fixtures should not become runtime dependencies.
- Public exports are contracts; changing them can affect consumers.

---

## Before Adding or Moving Code

Check:

1. Which package owns the concept?
2. Is the behavior local, cross-feature, cross-app, SPFx-specific, backend-specific, or UI-system-wide?
3. Who consumes it today?
4. Who should be allowed to consume it later?
5. Does the dependency direction remain legal?
6. Does the package expose an existing public export?
7. Does the change require adapters or backward-compatible shims?
8. Are tests/fixtures in the correct package?
9. Does documentation need to change?

Use `hb-boundary-auditor` when placement, exports, dependency direction, or cross-package coupling is nontrivial.

---

## Dependency Direction

Do not create direct cross-feature dependency webs.

Prefer:

- feature package -> platform/shared package;
- app -> feature package;
- app -> shared UI package;
- SPFx shell/webpart -> app/feature runtime adapter;
- backend route/service -> backend/domain package;
- shared package -> lower-level shared/package only.

Avoid:

- feature package -> unrelated feature package;
- shared UI package -> feature package;
- domain model package -> app package;
- SPFx runtime package -> PWA-only shell assumptions;
- backend package -> frontend package;
- packages relying on internal paths of another package when public exports exist.

---

## Public Export Rules

When touching exports:

- inspect current export surface;
- preserve compatibility where possible;
- avoid exporting temporary implementation details;
- update consumer imports deliberately;
- add tests or type checks when export contracts change;
- document public API changes if they affect shared package expectations.

Do not assume unused exports are safe to delete without search evidence.

---

## Shared UI Placement

Use `@hbc/ui-kit` for:

- durable primitives;
- token-aligned components;
- cross-surface visual foundations;
- reusable interaction patterns;
- accessible common controls;
- shared responsive primitives.

Do not use `@hbc/ui-kit` for:

- product-specific card compositions;
- one-off page layouts;
- mock-data-specific rendering;
- business workflow implementations;
- SPFx runtime mounting/glue;
- backend or data-access behavior.

When in doubt, use a local composition first and promote to shared UI only after reuse and ownership are clear.

---

## Model and Vocabulary Placement

Use model/domain packages for:

- shared enums;
- DTOs and typed contracts;
- vocabulary used across apps/features;
- fixture schemas;
- stable domain identifiers.

Do not place models inside UI packages merely because UI consumes them.

Do not duplicate type definitions across apps without checking for a shared model owner.

---

## Runtime Adapter Placement

Place runtime-specific adapters near the boundary:

- SharePoint/Graph adapters near SPFx or data-access boundary;
- backend command clients near feature adapter packages;
- PWA shell-specific adapters in app shell packages;
- tenant/deployment proof scripts in tooling or backend scripts, not UI packages.

Do not leak runtime-specific assumptions into generic packages.

---

## Package Boundary Review Triggers

Use `hb-boundary-auditor` when:

- adding a dependency;
- moving code across packages;
- creating or changing package exports;
- introducing shared UI;
- consolidating duplicated behavior;
- adding models/vocabulary;
- changing app shell behavior;
- wiring a feature into SPFx;
- touching backend/frontend/shared boundaries;
- changing workspace structure.

---

## Reporting Standard

When package boundaries are material, report:

- package(s) inspected;
- ownership decision;
- dependency direction impact;
- exports changed or preserved;
- consumers affected;
- validation run;
- residual risk or follow-up.
