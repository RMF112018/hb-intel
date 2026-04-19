# 07 — Research Basis and Implementation Implications

## Research posture used

The remediation package was sharpened using primary or official technical documentation across multiple sources, not only Microsoft guidance.

Research basis used:
- TanStack Query React docs
- React docs
- PnPjs docs
- Microsoft SharePoint list/indexing guidance

---

## Key findings from external technical guidance

### 1. TanStack Query `select` is for transforming returned data, but it does not change the cache shape
Implication:
- a merged-source resolver can still live upstream of the hook while the hook uses `select` only for stable transformation
- avoid putting unstable or overly stateful merge logic into `select`
- keep the `select` function stable if reference churn becomes a problem

Package impact:
- prompts keep resolver logic outside the root UI
- prompts treat hook normalization as a consumer of authoritative merged records, not the owner of merge truth

---

### 2. React `useMemo` is a performance optimization, not a correctness mechanism
Implication:
- source-aware filter/search/facet behavior should remain pure derived logic
- correctness must come from the merged contract and resolver, not memoization side effects

Package impact:
- filter/search work remains a pure helper-seam extension
- no prompt relies on memoization to “fix” source truth

---

### 3. PnPjs supports `.select()`, `.filter()`, `.top()`, and paging/iteration patterns for list items
Implication:
- the current data layer can be completed with the existing stack
- no new data-fetching runtime dependency is required
- future scaling work should favor deliberate paging/iteration patterns rather than ad hoc oversized single reads if inventory grows materially

Package impact:
- no new runtime dependency is recommended
- prompt language explicitly avoids casual dependency expansion

---

### 4. SharePoint filtering performance depends heavily on indexed columns and threshold-aware filtering
Implication:
- fallback-inclusive browse authority should preserve indexed filter posture where possible
- broad scans that ignore indexed fields can become fragile on large lists
- if year/scope broadening expands reads, filtering discipline still matters

Package impact:
- prompts explicitly preserve deterministic, bounded, explainable scope behavior
- prompt language treats browse-authority changes as architecture work, not merely UI selector work

---

## Dependency recommendations

### Production/runtime dependencies
Recommended: **none**

Reason:
- the current stack is already sufficient for:
  - source reads
  - merged contract modeling
  - resolver logic
  - filter/search derivation
  - tests

### Test/dev helpers
Optional only if repo-local patterns support it:
- simple fixture builders for merged records
- dedicated resolver test helpers

Reason:
- improves test clarity without changing runtime architecture

---

## Research-driven implementation recommendations

1. keep the resolver as a pure seam
2. keep filter/search as pure derived helpers
3. avoid adding a new state-management library
4. avoid adding a new data-fetching library
5. keep SharePoint reads deliberate and index-aware
6. keep user-facing provenance restrained and factual

---

## Final research conclusion

External guidance reinforces the repo-truth conclusion:

The correct path is **architectural completion of the existing lane**, not a library swap, not a UI rebuild, and not a dependency-heavy redesign.
