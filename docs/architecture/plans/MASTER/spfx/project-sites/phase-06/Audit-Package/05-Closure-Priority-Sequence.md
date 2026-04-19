# 05 — Closure Priority Sequence

## Ordering principle

The work should close from **identity and data authority outward**, not from UI inward.

If the resolver, identity, and browse-authority seams are weak, UI and tests will become unstable or misleading.

---

## Required-now sequence

### Step 1 — Establish merged record identity and contract
Why first:
- every downstream seam depends on a durable record shape
- synthetic entries and duplicate suppression need stable identity before UI or test work

Primary outcome:
- explicit merged record key / source classification / launch-target contract

---

### Step 2 — Add a consumer-side fallback registry adapter
Why second:
- the resolver should merge explicit source contracts, not ad hoc `select(...)` subsets
- this also clarifies what registry fields are actually required on the consumer side

Primary outcome:
- explicit fallback consumer descriptor and mapping utilities

---

### Step 3 — Implement the resolver and synthetic legacy-only emission
Why third:
- this closes the central runtime defect
- it creates the authoritative merged record set the rest of the lane consumes

Primary outcome:
- one merged record set containing project-only, merged, and legacy-only rows

---

### Step 4 — Rework browse authority and year gating
Why fourth:
- once merged records exist, the UI must be allowed to reach them
- current year authority still blocks fallback-only inventory before render

Primary outcome:
- fallback-inclusive year availability and scope resolution

---

### Step 5 — Refactor hook and normalization consumption
Why fifth:
- the hook should now consume the authoritative merged contract
- normalization should no longer function as a hidden resolver

Primary outcome:
- clean merged-record query flow

---

### Step 6 — Add source-aware filter/search/facet behavior
Why sixth:
- only meaningful once merged records and source identity exist
- should remain restrained and operational

Primary outcome:
- intentional reasoning across modern / merged / legacy-backed inventory

---

### Step 7 — Correct user-facing truthfulness
Why seventh:
- by this point the core behavior is real enough to make the copy changes durable
- this is still required-now, not optional polish

Primary outcome:
- empty, error, and context copy that matches the merged-source surface truthfully

---

### Step 8 — Add regression coverage
Why eighth:
- tests should prove the behavior exactly as implemented
- some tests will necessarily depend on the final resolver and browse-authority shape

Primary outcome:
- resolver/repository/hook/UI regression suite

---

### Step 9 — Refresh comments/docs
Why ninth:
- this should follow code truth so comments describe reality

Primary outcome:
- maintainers read the lane correctly

---

## Optional-after-core sequence

### Step 10 — Provenance/support diagnostics hardening
Only if:
- repo truth after closure still shows a support gap
- the card/root surface can absorb the signal without clutter

---

## Non-sequence warnings

Do not:
- start with UI polish
- collapse resolver work into the hook
- patch synthetic legacy-only behavior without first solving stable identity
- treat user-facing truthfulness as a documentation-only issue
