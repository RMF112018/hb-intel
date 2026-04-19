# Audit-04 — Enhanced Issues Register

## Severity key

- **Critical** — must be corrected to claim strong launcher closure
- **Major** — materially harms launcher outcome and should be resolved in this package
- **Moderate** — should be corrected now unless blocked by a stronger structural decision

---

## Issue 01 — Homepage runtime authority is still easy to misread

**Severity:** Major  
**Type:** Governance / seam clarity  
**Status:** Unresolved

### Problem

The homepage runtime has shifted away from the old flagship rail path, but repo comments, compatibility language, and neighboring seams still make it too easy to reason about the wrong render authority.

### Why it matters

A code agent or future maintainer can still target the wrong layer and spend effort in the standalone rail path while the hosted homepage remains governed elsewhere.

### Needed future state

The homepage runtime path must be unmistakably documented and the old path must be clearly framed as adjacent, not authoritative for the hosted homepage.

---

## Issue 02 — Authoring contract drift remains after the launcher transition

**Severity:** Critical  
**Type:** Contract / governance  
**Status:** Unresolved

### Problem

The homepage path now uses binding launcher counts and a simplified presentation regime, while the config contract still exposes authored layout and max-visible knobs that imply stronger control than the homepage path actually honors.

### Why it matters

This creates:

- false configurability
- governance ambiguity
- future implementation confusion
- increased risk of drift between admin expectations and runtime behavior

### Needed future state

The homepage launcher contract must either:

- genuinely honor the retained knobs, or
- retire / quarantine them clearly for the homepage path,

with no ambiguity left in comments, types, or tests.

---

## Issue 03 — Homepage launcher model is too lossy

**Severity:** Critical  
**Type:** Adapter / data contract  
**Status:** Unresolved

### Problem

The adapter collapses the normalized model into a five-field chip contract.

### Why it matters

That blocks stronger outcomes for:

- service identity
- grouped overflow
- better new-tab semantics
- richer accessibility labeling
- future launcher variants

### Needed future state

The homepage launcher model must carry the minimum semantics needed for a premium launcher family, without forcing the UI to reverse-engineer meaning from overly small inputs.

---

## Issue 04 — Icon semantics are still wrong

**Severity:** Critical  
**Type:** Semantics / visual identity  
**Status:** Unresolved

### Problem

The homepage launcher still derives icons from badge severity rather than authoritative service/tool identity.

### Why it matters

This creates repetitive, generic iconography and breaks the expected relationship between tool identity and the launch target.

### Needed future state

Icon mapping must be driven primarily by `iconKey` or another explicit service-identity strategy, with a governed fallback hierarchy.

---

## Issue 05 — Primary launcher chips still use the wrong width behavior

**Severity:** Critical  
**Type:** Surface primitive / layout  
**Status:** Unresolved

### Problem

Primary chips stretch equally to fill the row.

### Why it matters

This lowers information density and makes low-count states look inflated and underpowered.

### Needed future state

The launcher needs a variable-width or otherwise density-disciplined primary primitive that stays compact and premium across sparse and dense states.

---

## Issue 06 — Overflow is still a dump list, not a secondary launcher

**Severity:** Major  
**Type:** Information architecture / interaction  
**Status:** Unresolved

### Problem

The overflow surface is functional but flat.

### Why it matters

It weakens scan speed, grouping, and service discoverability.

### Needed future state

Overflow should behave like a governed secondary launcher with grouping or other stronger information architecture where the data supports it.

---

## Issue 07 — Visible-count governance is internally inconsistent

**Severity:** Critical  
**Type:** Governance / breakpoint logic  
**Status:** Newly surfaced

### Problem

Different launcher layers still encode different count assumptions for phone behavior.

### Why it matters

This makes closure fragile and invites regression or misunderstanding.

### Needed future state

One authoritative count regime should govern the homepage launcher path, and all neighboring layers/tests/comments should align to it.

---

## Issue 08 — Link semantics are under-preserved

**Severity:** Major  
**Type:** Contract / interaction behavior  
**Status:** Newly surfaced

### Problem

The normalized data carries both externality and new-tab intent, but the homepage chip path reduces this too aggressively.

### Why it matters

The runtime can no longer honor link intent with enough precision.

### Needed future state

The launcher model must preserve the link-behavior semantics needed to render correct target behavior and assistive hints.

---

## Issue 09 — Label clarity and truncation rescue are under-specified

**Severity:** Major  
**Type:** Accessibility / scanability  
**Status:** Newly surfaced

### Problem

The current surface leans on single-line ellipsis without enough explicit rescue behavior.

### Why it matters

Longer but still valid tool names may become harder to scan, harder to distinguish, and less accessible.

### Needed future state

The launcher should preserve density while adding credible rescue behavior for truncated labels and keyboard/touch discoverability.

---

## Issue 10 — Hosted proof and regression coverage are still too weak

**Severity:** Major  
**Type:** Validation / closure proof  
**Status:** Unresolved

### Problem

The current proof standard is still too easy to satisfy with a partial redesign.

### Why it matters

Without stronger tests and cutover checks, the launcher can regress semantically while still looking “different enough.”

### Needed future state

Closure must include:

- stronger tests
- runtime markers
- packaged hosted proof steps
- explicit checks for icon semantics, count behavior, overflow behavior, and shell-fit integrity
