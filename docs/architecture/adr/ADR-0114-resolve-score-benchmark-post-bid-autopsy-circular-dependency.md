# ADR-0114 — Resolve `@hbc/score-benchmark` ↔ `@hbc/post-bid-autopsy` Circular Dependency

**Status:** Accepted
**Date:** 2026-03-14
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Linked risks:** `package-relationship-map.md` § Dependency / Boundary Risks — Risk 1 (now resolved)

---

## Context

`docs/architecture/blueprint/package-relationship-map.md` (§ Dependency / Boundary Risks, Risk 1) documented a Critical-severity circular dependency between `@hbc/score-benchmark` and `@hbc/post-bid-autopsy`. Both packages declared each other as production dependencies in their respective `package.json` files, causing Turbo to emit a circular-dependency warning on every build and blocking production use of both packages and any Wave 1 intelligence or scoring features that depend on them (CLAUDE.md §7, §6.3).

Prior to this ADR, source-code inspection confirmed the following asymmetry:

- **`@hbc/score-benchmark` → `@hbc/post-bid-autopsy`** (real, type-only): Two files in score-benchmark import the `PostBidLearningSignal` discriminated-union type from `@hbc/post-bid-autopsy/src/signals/index.ts`. These are TypeScript `import type` statements erased at compile time; they create no runtime module cycle.
  - `packages/score-benchmark/src/model/recalibration/index.ts`
  - `packages/score-benchmark/src/api/ScoreBenchmarkLifecycleApi.ts`

- **`@hbc/post-bid-autopsy` → `@hbc/score-benchmark`** (declared, never used): `packages/post-bid-autopsy/package.json` listed `@hbc/score-benchmark` as a production dependency, but a full grep of `packages/post-bid-autopsy/src/` returned zero import statements referencing score-benchmark. The dependency declaration was an unused artifact.

The cycle was therefore a false cycle: the `post-bid-autopsy → score-benchmark` edge existed only in `package.json` with no corresponding code usage.

---

## Decision

### D-01 — Remove the unused `@hbc/score-benchmark` dependency from `@hbc/post-bid-autopsy`

Delete the `"@hbc/score-benchmark": "workspace:*"` entry from the `dependencies` block in `packages/post-bid-autopsy/package.json`. This is the sole mechanical change required to break the cycle.

**Rationale:** The dependency is unused in code. Removing it is a zero-risk cleanup with no API surface changes, no export changes, and no effect on any consumer of `@hbc/post-bid-autopsy`.

### D-02 — Retain the `@hbc/score-benchmark` → `@hbc/post-bid-autopsy` type dependency

`@hbc/score-benchmark`'s `import type { PostBidLearningSignal }` from `@hbc/post-bid-autopsy` is a legitimate, directionally correct dependency (score-benchmark consumes a signal type published by the post-bid-autopsy primitive). TypeScript type-only imports are erased at compile time and carry no runtime module resolution; they do not constitute a cycle. This edge is retained as-is.

**Rationale:** `PostBidLearningSignal` is defined by and owned by `@hbc/post-bid-autopsy` (the autopsy primitive publishes learning signals; the benchmark primitive consumes them for recalibration). Ownership is correct. No shared-types extraction or package merge is needed.

### D-03 — No new shared-types package required

Resolution options (a) extract shared types, (b) merge packages, and (c) invert one dependency (from `package-relationship-map.md` §1027) are all rejected as unnecessarily heavy for a false cycle. The minimal one-line fix in D-01 is sufficient.

### D-04 — Wave 1 intelligence features unblocked after this ADR

With Risk 1 resolved, the CLAUDE.md §7 prohibition on Wave 1 intelligence/scoring feature work is lifted for the circular-dependency reason specifically. The remaining Risk 3 (all four intelligence packages are scaffolds with no runtime implementations) continues to govern readiness for production feature work in those packages independently of this ADR.

### D-05 — Change-control discipline

Any future re-introduction of a dependency from `@hbc/post-bid-autopsy` toward `@hbc/score-benchmark` requires prior ADR review to confirm it does not re-establish a cycle and that the dependency direction is architecturally correct per the layer model in `package-relationship-map.md`.

---

## Consequences

**Positive:**
- Turbo circular-dependency warning is eliminated.
- Both packages are unblocked for production use (subject to scaffold completion per Risk 3).
- `@hbc/features-estimating` and `@hbc/features-business-development` consumers no longer inherit the critical boundary risk.
- Wave 1 intelligence feature work is unblocked for the circular-dependency blocker reason.

**Neutral:**
- `@hbc/post-bid-autopsy` public API surface is unchanged.
- `@hbc/score-benchmark` public API surface is unchanged.
- All 91 existing tests continue to pass with no code changes required.
- `packages/post-bid-autopsy/src/` already compiled and tested without any score-benchmark imports; the removal has no build effect.

**Ongoing constraint:**
- Risk 3 (scaffold maturity) remains open and governs Wave 1 production readiness separately.

---

## Compliance

This ADR is accepted and locked. It may only be superseded by an explicit follow-up ADR with migration guidance. The boundary risk entry in `package-relationship-map.md` §Dependency/Boundary Risks Risk 1 is updated to **Resolved — ADR-0114** upon acceptance.
