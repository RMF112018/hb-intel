# 05 — Implementation Quality

## Purpose

Define the baseline quality standard for code and configuration changes in HB Intel.

---

## Primary Rule

Make the smallest correct change that satisfies the approved scope, preserves architecture, and can be verified.

---

## Implementation Defaults

Before editing:

1. inspect the touched area;
2. read only relevant authority docs;
3. identify package ownership and runtime boundary;
4. choose the smallest safe implementation path;
5. preserve compatibility unless breakage is explicitly authorized;
6. plan first when the work is risky, cross-cutting, phase/wave-driven, or sensitive.

During editing:

- avoid unrelated cleanup;
- avoid broad rewrites without need;
- avoid staging unrelated files;
- avoid changing formatting across untouched files;
- preserve existing public contracts unless the prompt authorizes changes;
- prefer type-safe, testable code;
- preserve accessible UI behavior;
- preserve fallback/empty/error states;
- keep fixtures clearly separated from runtime behavior.

After editing:

- run the smallest meaningful validation;
- report what was verified and what was not;
- state residual risk.

---

## Code Quality Requirements

Implementation should be:

- typed;
- readable;
- maintainable;
- locally cohesive;
- dependency-aware;
- tested where meaningful;
- consistent with package style;
- explicit about errors and edge cases;
- respectful of runtime constraints;
- minimal in scope.

Avoid:

- `any` unless justified and localized;
- broad catch blocks that hide errors;
- fragile stringly typed contracts when models exist;
- duplicated domain logic;
- copied UI primitives;
- unbounded side effects;
- implicit tenant or environment assumptions;
- direct runtime calls that bypass approved boundaries.

---

## UI Quality Requirements

For UI work:

- preserve responsive behavior;
- preserve keyboard/focus behavior;
- avoid color-only meaning;
- provide meaningful empty, error, loading, and preview states;
- use current design tokens and primitives where appropriate;
- do not over-centralize product-specific compositions;
- do not preserve legacy layout patterns solely because they compile;
- inspect basis-of-design assets when named by the task;
- validate SPFx host behavior when the change touches webpart runtime or layout.

Use `hb-ui-doctrine-conformance` when UI doctrine or shared UI ownership is material.

Use `hb-spfx-runtime-parity` when source/build/manifest/runtime/hosted parity is material.

---

## Backend and Data Quality Requirements

For backend or data work:

- keep route/service/repository boundaries clear;
- validate inputs;
- classify auth and data-plane failures explicitly;
- avoid leaking tokens or app settings;
- preserve request IDs and diagnostic proof seams where present;
- do not call live services unless explicitly authorized;
- keep dry-run/proof modes deterministic;
- redact sensitive output.

Use `hb-sensitive-operation-gate` for live or sensitive operations.

---

## Testing Expectations

When behavior changes, prefer a targeted automated check.

Use this order:

1. changed-file or local package tests;
2. package-local typecheck/lint/build;
3. affected consumer tests when public contracts changed;
4. root workspace checks when cross-package or release-critical;
5. Playwright/end-to-end when UI/runtime behavior requires it;
6. hosted/tenant validation only when explicitly authorized.

Use `hb-verification-router` for validation selection.

---

## Change Control

Do not change these without explicit authorization:

- package versions;
- SPFx manifests;
- app catalog packages;
- CI/CD workflows;
- dependency versions;
- lockfiles through install/update commands;
- tenant resources;
- permission models;
- live Procore/Graph/PnP behavior.

If such a change appears necessary, stop and ask for approval through the plan gate.

---

## Reporting Standard

For implementation work, report:

- objective;
- files inspected;
- files modified;
- implementation summary;
- validation commands run;
- validation results;
- checks not run;
- guardrails preserved;
- residual risk;
- commit summary and description when applicable.
