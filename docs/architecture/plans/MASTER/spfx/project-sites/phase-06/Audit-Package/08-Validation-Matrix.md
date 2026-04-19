# 08 — Validation Matrix

## Required proofs of closure

| Area | Required proof | Minimum seam |
|---|---|---|
| Fallback-only visibility | A fallback-only approved record renders as a card | resolver + root |
| Stable identity | Project-only, merged, and legacy-only records all have stable unique keys | types + root |
| Approved-linkage precedence | Resolver prefers stronger approved linkage over weaker heuristic keying | resolver test |
| Duplicate suppression | One logical project renders once in merged cases | resolver + root |
| Browse authority | A fallback-only year is available and selectable when supported by inventory | repository + hook + root |
| Launch precedence | Primary site wins when present; fallback wins only when primary is absent | resolver + launch contract |
| User truthfulness | Empty/error/context copy does not falsely describe the result as Projects-only | root |
| Source-aware reasoning | Users can intentionally inspect legacy-backed inventory without clutter | filter + root |
| Regression guard | Tests fail when fallback-only records disappear or when duplicate suppression regresses | tests |

---

## Required manual/visual checks

1. project-only record still renders and launches correctly
2. merged record still renders once and launches primary site
3. legacy-only synthetic record renders and launches fallback URL
4. fallback-only year appears in selector or equivalent scope authority
5. empty state for fallback-inclusive scope is truthful
6. filter/search still feels coherent and compact
7. card action label remains truthful:
   - `Open Site`
   - `Open Legacy Project Files`
   - blocked states remain non-speculative

---

## Required non-goals to confirm

Do **not** accept closure if the implementation:
- creates a separate fallback-only UI surface
- adds unrelated package/runtime churn
- turns the card into a support-console UI
- leaves merged identity implicit
- leaves fallback-only browse authority unreachable
