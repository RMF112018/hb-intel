# ADR-0095 — Stub Detection and Incomplete Implementation Enforcement Standard

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Triggered By:** DOCS-AUDIT phase (2026-03-10) — confirmed zero automated enforcement
against stub implementations codebase-wide

---

## Context

The DOCS-AUDIT phase (2026-03-10) found that the HB Intel codebase had no automated
detection of stub implementations or incomplete code. Six known stubs existed with no
lint warning, no CI gate, and no pre-commit hook. The `branches: 95` P1 coverage gate
(ADR-0085) provides partial mitigation for five packages, but has no effect on packages
outside P1 and does not prevent stub-pattern commits. This ADR establishes a permanent,
layered enforcement standard.

---

## Decisions

### D-01 — `no-warning-comments` at warn level

**Decision:** Add `no-warning-comments: warn` to `.eslintrc.base.js` targeting `TODO`,
`FIXME`, `HACK`, `XXX`.

**Rationale:** Warn (not error) preserves developer velocity and avoids immediately
failing CI on the existing debt. The warn level surfaces debt in lint output and PR
annotations without blocking merges, allowing incremental resolution.

**Consequences:** All TODO/FIXME comments become visible in lint output. Existing TODOs
accumulate as warnings until resolved. No CI hard stop.

### D-02 — `@typescript-eslint/ban-ts-comment` at error level with description requirement

**Decision:** All `@ts-ignore` and `@ts-expect-error` suppressions must include a
description of ≥10 characters explaining why the suppression is necessary. Bare
suppressions are a lint error.

**Rationale:** Bare type suppressions hide implementation gaps. Requiring a description
forces the developer to articulate the reason, making suppressions reviewable.

**Consequences:** Existing bare `@ts-ignore` instances must be updated with descriptions.

### D-03 — `no-stub-implementations` rule in `eslint-plugin-hbc` at error level

**Decision:** A new ESLint rule detects `throw new Error(msg)` where `msg` matches
`/not.?implement|stub|placeholder/i`. It fires at error level on all source files
(excluding test files and `tools/mocks/`).

**Rationale:** The `throw new Error('not implemented')` pattern is the canonical stub
idiom in TypeScript. Detecting it statically at lint time catches the pattern before CI.

**Consequences:** Any new stub throw without a `stub-approved` exemption fails lint.

### D-04 — `stub-approved: <reason>` escape-hatch convention

**Decision:** Intentional stubs may be exempted by placing `// stub-approved: <non-empty
reason>` on the line immediately preceding the stub code. A blank or missing reason does
not satisfy the escape hatch.

**Rationale:** Not all stubs are bugs. Some are explicitly deferred design decisions.
A convention-based escape hatch is self-documenting and searchable.

**Consequences:** `stub-approved` entries are indexable via `pnpm scan-stubs:all`.

### D-05 — CI grep scan as Layer 2 enforcement

**Decision:** A CI step in the `lint-and-typecheck` job runs a grep scan for stub throw
patterns across `packages/`, `apps/`, and `backend/`. A match fails the CI job.

**Rationale:** ESLint (Layer 1) may miss edge cases in `.js` files or generated code.
The grep scan (Layer 2) is a fast, explicit gate that catches what ESLint may miss.

**Consequences:** CI is harder to pass with an unexempted stub.

### D-06 — `tools/mocks/` is globally exempt

**Decision:** The `tools/mocks/` directory is excluded from all stub scans (both ESLint
override and CI grep). No `stub-approved` marker is required for files in this directory.

**Rationale:** SPFx SDK mocks are legitimate test infrastructure that implement stub-like
patterns by design.

**Consequences:** `tools/mocks/` is a defined exemption zone.

### D-07 — Server-side BIC aggregation stub is permanently deferred

**Decision:** The `BicModuleRegistry.ts` server-side aggregation stub is exempted with a
`stub-approved` marker referencing PH8 activation. It is not required to be implemented
before PH7.13 closes.

**Rationale:** Server-side BIC aggregation is a PH8 concern. Implementing it now would
pull in infrastructure explicitly deferred by the Foundation Plan.

**Consequences:** The stub persists with an explicit exemption; becomes a PH8 item.

### D-08 — All known stubs must be dispositioned before PH7.13 closes

**Decision:** PH7.13 does not close until every entry in the Known Stub Inventory has
been either implemented or marked with a valid `stub-approved` exemption, and the CI
grep scan returns zero unapproved results.

**Rationale:** Partial remediation leaves the gap open.

**Consequences:** The six known stubs (S-01 through S-06) must all be dispositioned.
