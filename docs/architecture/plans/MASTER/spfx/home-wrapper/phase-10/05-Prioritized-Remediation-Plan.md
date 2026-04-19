# Prioritized Remediation Plan

## Priority 1 — Runtime composition cutover

### Goal
Make `HbHomepage` the flagship owner of hero + launcher + shell ordering.

### Why first
Nothing else is trustworthy until runtime composition authority is correct.

### Required seams
- `HbHomepageEntryStack.tsx`
- `HbHomepage.tsx`
- any supporting wrapper config/prop paths
- eventual follow-on updates to mount/orchestration/reference seams

---

## Priority 2 — Wrapper-owned hero integration seam

### Goal
Create a typed wrapper-owned hero seam equivalent in discipline to the existing wrapper-owned launcher seam.

### Why second
The cutover cannot remain ad hoc. Hero inputs must live in a stable wrapper-owned contract before deeper responsive work begins.

### Required seams
- `hbHomepageWrapperConfig.ts`
- `hbHomepageContract.ts`
- hero homepage integration props
- homepage webpart property flow if needed

---

## Priority 3 — Shared entry-state truth

### Goal
Make hero, launcher, and shell consume the same entry-stack truth.

### Why third
Without this, the hero remains a parallel responsive system and the flagship entry stack is only partially unified.

### Required seams
- `useShellContainer.ts`
- shared snapshot/state helper
- hero props or context seam
- launcher band alignment
- entry-stack policy mirrors if required

---

## Priority 4 — Responsive hero rebuild

### Goal
Rebuild the hero’s constrained-width and short-height behavior around explicit modes and budgets.

### Why fourth
This is the user-visible quality improvement, but it should sit on top of correct composition and state truth rather than precede them.

### Required seams
- `HbSignatureHeroHomepage.tsx`
- `signature-hero.module.css`
- any hero mode/state helper added during Priority 3

---

## Priority 5 — Hosted duplicate-hero prevention

### Goal
Make the cutover operationally safe.

### Why fifth
A technically “correct” runtime can still fail if the authored page keeps the old standalone hero.

### Required seams
- runtime markers / suppression logic if needed
- hosted validation docs
- flagship page authoring instructions
- any package/runbook verification seam that proves single-hero composition

---

## Priority 6 — Repo-truth seam updates

### Goal
Bring runtime truth, architecture comments, and reference composition into alignment.

### Why sixth
This must happen in the same implementation wave, but it is safer after the runtime shape is known.

### Required seams
- `mount.tsx`
- `entryStackOrchestration.ts`
- `hbHomepageContract.ts`
- `ReferenceHomepageComposition.tsx`
- targeted docs/comments

---

## Priority 7 — Regression proof and diagnostics

### Goal
Make the new unified entry stack inspectable and testable.

### Why seventh
Proof should be built against the real resulting runtime rather than imagined early.

### Required seams
- tests near existing shell policy tests
- runtime data attributes
- closure evidence matrix
- any focused harness updates

---

## Priority 8 — Hosted operational documentation

### Goal
Give the team a deterministic path to deploy and verify the new flagship composition.

### Why eighth
Operational closure is part of implementation, not postscript.

### Required seams
- homepage package/runbook docs
- hosted validation checklist
- screenshot / DOM evidence instructions
