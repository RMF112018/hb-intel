# PH7.13-T09 — Deployment: Documentation, ADR, and Governance Closure

**Phase Reference:** PH7.13 (Stub Detection and Incomplete Implementation Enforcement)
**Spec Source:** `docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md`
**Decisions Applied:** D-01 through D-08 (all locked in ADR-0095)
**Estimated Effort:** 0.1 sprint-weeks
**Depends On:** T01, T02, T03, T04, T05 (all prior tasks complete; mechanical gates passing)

> **Doc Classification:** Canonical Normative Plan — PH7.13-T09 task; sub-plan of `PH7.13-Stub-Detection-Enforcement.md`.

---

## Objective

Complete all documentation, governance, and closure deliverables for PH7.13. This task writes the ADR, updates `packages/eslint-plugin-hbc/README.md` to document the new rule, adds the ADR-0095 row to the ADR index in `docs/README.md`, updates `current-state-map.md §2`, and records the Blueprint Progress Comment. No code changes — documentation only.

---

## 3-Line Plan

1. Write `docs/architecture/adr/0095-stub-detection-enforcement-standard.md` with all eight locked decisions.
2. Update `packages/eslint-plugin-hbc/README.md` to document `no-stub-implementations` and the `stub-approved` convention.
3. Add ADR-0095 row to `docs/README.md` ADR index and update `current-state-map.md §2`; add the Blueprint Progress Comment.

---

## Documentation Checklist

Wave 4 — Documentation and governance closure (all items required before PH7.13 is considered complete):

- [x] **ADR-0095** — `docs/architecture/adr/0095-stub-detection-enforcement-standard.md` written and accepted
- [x] **Adoption guide** — `docs/how-to/developer/stub-detection-guide.md` written for developer onboarding
- [x] **API/rule reference** — `no-stub-implementations` rule documented in `packages/eslint-plugin-hbc/README.md`
- [x] **Package README** — `packages/eslint-plugin-hbc/README.md` updated with stub enforcement section
- [x] **ADR Index** — `docs/README.md` updated with ADR-0095 row
- [x] **Current-state-map** — `current-state-map.md §2` updated with PH7.13 task file rows

---

## ADR-0095: Stub Detection and Incomplete Implementation Enforcement Standard

**File:** `docs/architecture/adr/0095-stub-detection-enforcement-standard.md`

```markdown
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
```

---

## Package README: `packages/eslint-plugin-hbc/README.md`

The existing `packages/eslint-plugin-hbc/README.md` must be updated to include a section documenting the `no-stub-implementations` rule and the `stub-approved` convention. Append the following content (or insert into the existing rules section):

```markdown
## `no-stub-implementations`

**Added:** PH7.13 (2026-03-10)
**Severity:** `error` on source files; not applied to test files or `tools/mocks/`
**ADR:** ADR-0095

Detects `throw new Error(msg)` statements where the error message matches a stub or
not-implemented pattern, indicating that a function body has not been implemented.

### Detected Patterns

```js
throw new Error('not implemented');         // ❌ error
throw new Error('Not yet implemented');      // ❌ error
throw new Error('stub — replace this');      // ❌ error
throw new Error('placeholder');              // ❌ error
throw new Error(`TODO: implement ${name}`);  // ❌ error
```

### Escape Hatch: `stub-approved`

Intentional stubs that are durably deferred may be exempted by adding a
`// stub-approved: <non-empty reason>` comment on the line immediately preceding
the stub throw:

```typescript
// stub-approved: pending SF04 @hbc/acknowledgment T07 activation — tracked backlog #42
throw new Error('not implemented');  // ✅ no error — exempted by stub-approved comment
```

The reason must be non-empty. A blank `// stub-approved:` comment does not satisfy the
escape hatch and will still produce an error.

### Exclusions

The rule is not applied to:
- `**/*.test.ts`, `**/*.test.tsx`, `**/*.spec.ts`, `**/*.spec.tsx` — test files
- `**/*.stories.tsx` — Storybook story files
- `tools/mocks/**` — SPFx SDK mocks (globally exempt per ADR-0095 D-06)
- `**/testing/**` — testing sub-path utilities

### Developer Tool

Use `pnpm scan-stubs` to scan the codebase locally for unapproved stubs.
Use `pnpm scan-stubs:all` to also list all `stub-approved` entries for inventory review.

See: `docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md`
```

---

## ADR Index Update

Add the following row to the ADR index table in `docs/README.md`. Insert in numeric order after ADR-0094:

```markdown
| [ADR-0095](architecture/adr/0095-stub-detection-enforcement-standard.md) | Stub Detection and Incomplete Implementation Enforcement Standard | Accepted | 2026-03-10 |
```

---

## Developer How-To Guide

**File:** `docs/how-to/developer/stub-detection-guide.md`

Create this file to provide developer onboarding for the stub enforcement system:

```markdown
# How to Work with Stub Detection Enforcement

**Applicable to:** All developers contributing to HB Intel
**Relevant ADR:** ADR-0095
**Phase:** PH7.13

## Overview

HB Intel enforces a zero-unapproved-stubs policy on all source code in `packages/`,
`apps/`, and `backend/`. This is implemented via two complementary layers:

- **Layer 1 — ESLint:** The `@hb-intel/hbc/no-stub-implementations` rule detects
  `throw new Error('not implemented')` patterns at lint time (developer machine + CI).
- **Layer 2 — CI grep scan:** A grep step in the `lint-and-typecheck` CI job scans
  for the same patterns as a fail-fast gate.

## When You See This Error

If you receive an `@hb-intel/hbc/no-stub-implementations` lint error, you have two options:

**Option A — Implement the function.** Replace the stub throw with a real implementation.
This is the preferred resolution.

**Option B — Mark it as intentionally deferred.** If the stub is a tracked,
deliberate deferral (e.g., pending a future phase), add the `stub-approved` comment:

```typescript
// stub-approved: <non-empty reason explaining intent and tracking reference>
throw new Error('not implemented');
```

The reason must be meaningful — it will be visible in `pnpm scan-stubs:all` output and
will be reviewed at each phase gate.

## Developer Commands

```bash
pnpm scan-stubs         # Check for unapproved stubs — should exit 0 before pushing
pnpm scan-stubs:all     # View all stubs including stub-approved entries
pnpm turbo run lint     # Full lint gate including stub detection
```

## What Is Exempt

- Files in `tools/mocks/` — SPFx SDK mocks (globally exempt)
- Test files (`*.test.ts`, `*.spec.ts`)
- Storybook files (`*.stories.tsx`)
- Files in `**/testing/**`

## Further Reading

- `docs/architecture/adr/0095-stub-detection-enforcement-standard.md`
- `docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md`
```

---

## Blueprint Progress Comment

After all acceptance criteria are met, add this comment block to `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.13 completed: {DATE}
Stub Detection and Incomplete Implementation Enforcement — three-layer enforcement added.
Layer 1: ESLint rules (no-warning-comments, ban-ts-comment, no-stub-implementations)
Layer 2: CI grep scan in lint-and-typecheck job
Layer 3: All 6 known stubs remediated or exempted with stub-approved markers
ADR created: docs/architecture/adr/0095-stub-detection-enforcement-standard.md
Package README updated: packages/eslint-plugin-hbc/README.md (no-stub-implementations docs)
Developer guide added: docs/how-to/developer/stub-detection-guide.md
ADR index updated: docs/README.md (ADR-0095 row)
Tool added: tools/scan-stubs.ts (pnpm scan-stubs)
All four mechanical enforcement gates passed.
current-state-map.md §2 updated: PH7.13 task file rows added.
Next: PH7.12 final verification or PH8 CI/CD expansion per Foundation Plan sequencing.
-->
```

---

## Verification Commands

```bash
# ── Documentation Deliverables ────────────────────────────────────────────────

# 1. Confirm ADR file exists
test -f docs/architecture/adr/0095-stub-detection-enforcement-standard.md \
  && echo "ADR-0095 OK" || echo "ADR-0095 MISSING"

# 2. Confirm ADR-0095 row is in the ADR index
grep -c "ADR-0095" docs/README.md
# Expected: 1

# 3. Confirm eslint-plugin-hbc README is updated
grep -n "no-stub-implementations" packages/eslint-plugin-hbc/README.md
# Expected: section header and rule description visible

# 4. Confirm stub-approved convention is documented in the README
grep -n "stub-approved" packages/eslint-plugin-hbc/README.md
# Expected: escape hatch documentation visible

# 5. Confirm developer how-to guide exists
test -f docs/how-to/developer/stub-detection-guide.md \
  && echo "How-to guide OK" || echo "Guide MISSING"

# ── Mechanical Enforcement Gates (CLAUDE.md §6.3.3) ───────────────────────────

pnpm turbo run build
pnpm turbo run lint
pnpm turbo run check-types
pnpm turbo run test \
  --filter=@hbc/auth-core \
  --filter=@hbc/shell \
  --filter=@hbc/ui-kit \
  --filter=@hbc/shared-kernel \
  --filter=@hbc/app-types

# ── Stub Scan Final Verification ─────────────────────────────────────────────

pnpm scan-stubs
# Expected: ✅ No unapproved stubs found. (exit 0)

pnpm scan-stubs:all
# Expected: ⚠️ 3 approved stub(s) listed (S-01, S-02, S-06)
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.13-T09 completed: 2026-03-10
All six documentation checklist items satisfied:
  - ADR-0095 created: docs/architecture/adr/0095-stub-detection-enforcement-standard.md
  - Developer how-to guide: docs/how-to/developer/stub-detection-guide.md
  - ESLint plugin README updated: packages/eslint-plugin-hbc/README.md (no-stub-implementations section)
  - ADR index updated: docs/README.md (ADR-0095 row)
  - current-state-map.md updated: ADR count 91→92, Last Updated 2026-03-10
  - Blueprint progress comment appended to HB-Intel-Blueprint-V4.md
PH7.13 is now fully closed (T01–T05 code tasks + T09 documentation).
-->
