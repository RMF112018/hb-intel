# 01 — Package vs Repo-Truth Comparison

## Summary judgment

### What the attached packages got right
The attached packages correctly recognized that:

- the live repo already reads the fallback registry
- the current bridge is consumer-side, not purely backend-only
- the current architecture is still enrichment-based rather than fully merged-source
- fallback-only records are the core blocked behavior
- year authority remains too Projects-centric
- filter/search and tests remain underdeveloped for merged-source operation

### What they underexplained
They did not go far enough on:

- stable merged-record identity
- join-authority precedence using approved linkage data
- user-facing truthfulness in root-surface empty/error/context copy
- exact validation requirements for closure
- what seams must move together versus remain separate

### What they missed entirely or nearly entirely
- the need for a stable non-numeric merged record key suitable for React list keys and duplicate suppression
- the fact that `ProjectSitesRoot` contains user-visible language that will stay false even after core data work is done unless intentionally corrected
- the need to separate “repo docs/comments drift” from “user-facing UI truthfulness drift”
- the opportunity to avoid new runtime dependencies entirely and complete the lane with the current stack

---

## Comparison by topic

### 1. Repository diagnosis

#### Prior package
Correctly identified that the repository reads `Projects` first and decorates project rows with fallback data.

#### Repo truth
Still correct.

#### Enhancement
The replacement package sharpens this into two separate issues:
1. missing explicit resolver seam
2. missing synthetic record emission

That distinction matters because the resolver can be correct in principle while emission can still be wrong in practice.

---

### 2. Types / contract diagnosis

#### Prior package
Correctly said the normalized contract was too thin.

#### Repo truth
Still correct.

#### Enhancement
The new package adds a sharper requirement:
- the app needs a **stable merged record key / identity seam**
- not just more fields on the existing numeric-id contract

Without that, synthetic entries and merged entries can become fragile in rendering, duplicate suppression, and regression tests.

---

### 3. Join / match authority

#### Prior package
Noted that join identity was weaker than the registry can support.

#### Repo truth
Still correct, but understated.

#### Enhancement
The new package makes this a primary design concern:
- the registry already has reviewed/approved linkage fields
- the consumer currently ignores them
- therefore the consumer is weaker than the governed registry and can miss approved binds

This is stronger than a generic “lookup could be better” statement.

---

### 4. Scope and year authority

#### Prior package
Correctly identified that year authority is still Projects-only.

#### Repo truth
Still correct.

#### Enhancement
The new package ties this directly to root-surface gating:
- `useAvailableYears()` and `ProjectSitesRoot` do not merely *display* Projects-derived years
- they also determine whether the user ever reaches merged-source evaluation
- therefore this is both a data-layer defect and a user-surface gating defect

---

### 5. Hook and normalizer posture

#### Prior package
Correctly said the normalizer still assumes project-origin rows.

#### Repo truth
Still correct.

#### Enhancement
The new package clarifies that the hook and normalizer should not accidentally absorb resolver responsibilities.
The contract should be:

- repository / adapter reads sources
- resolver merges and emits authoritative record inputs
- normalizer/hook consume that merged contract cleanly
- root UI does not reconstruct source meaning ad hoc

---

### 6. Filter/search/UI reasoning

#### Prior package
Correctly identified that source-aware filtering was missing.

#### Repo truth
Still correct.

#### Enhancement
The new package separates:
- source-aware filtering/search/facets
from
- user-facing truthfulness in empty/error/context copy

These are related, but they should not be one vague “UI/copy” task.

---

### 7. Regression coverage

#### Prior package
Correctly said test coverage was incomplete.

#### Repo truth
Still correct.

#### Enhancement
The new package adds exact required proofs:
- fallback-only visible emission
- merged duplicate suppression
- approved-linkage precedence
- fallback-inclusive year availability
- empty-state truthfulness under fallback-only scope
- stable merged-key behavior

---

## Drift assessment

I did **not** find major repo drift that makes the attached packages obsolete.

The larger problem is different:
- the attached packages are **directionally aligned**
- but **not execution-detailed enough**

So the package replacement should be understood as:
- **depth correction**
- **closure-proof strengthening**
- **issue-boundary refinement**

not as a reversal of the prior architecture diagnosis.
