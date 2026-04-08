# Phase 00 — Repo Truth Freeze and Product Decision

## Objective

Establish one authoritative product direction for the homepage People & Culture surface before any additional implementation. Freeze repo truth, identify what survives, identify what is deprecated, and prevent further effort from being spent on an ambiguous product model.

---

## Operating Instructions

You are working in the live repo for `RMF112018/hb-intel`.

Use repo truth from `main` as authoritative.

Do not re-read files that are already in your active context or memory unless you need to verify drift or resolve uncertainty.

Do not perform timid cosmetic cleanup in place of the structural objective of this phase.

Do not broaden the scope beyond this phase except for small adjacent changes that are directly required to keep the implementation coherent and compiling.

---

## In Scope


- repo-truth review of `PeopleCulture.tsx`, `PeopleCultureMerged.tsx`, `index.ts`, manifest/property defaults, and related homepage wiring
- determination of which implementation is the authoritative homepage path going forward
- decision on whether the older/simple editorial implementation should be deprecated, archived, or retained only as a reference
- decision on homepage placement assumptions: narrow rail, wide section, or dual-mode support
- inventory of blocking gaps that must shape later phases


---

## Out of Scope


- deep visual restyling
- net-new shared primitive implementation
- final CTA routing work
- packaging/deployment work beyond identifying relevant build seams


---

## Required Inputs

At minimum, use and reconcile the following where relevant:

- `apps/hb-webparts/src/webparts/peopleCulture/`
- `packages/ui-kit/`
- `apps/hb-webparts/src/homepage/`
- current People & Culture homepage placement and routing seams
- the SPFx UI doctrine governing standard
- the current People & Culture remediation package summary

---

## Required Tasks


1. Audit the current People & Culture implementation and capture the actual runtime model in plain terms.
2. Determine whether the current product is rail-first, wide-first, or unresolved.
3. Decide whether `PeopleCulture.tsx` remains a live implementation path or should be formally deprecated in favor of the merged/rebuilt path.
4. Decide whether the rebuilt surface must support both rail mode and wide mode.
5. Produce a concise architecture decision record for these questions.
6. Produce a blocking-issues list that will govern later phases.
7. Update any local documentation or internal notes needed so the remaining phases are not forced to rediscover the decision.


---

## Required Deliverables


- one markdown decision record summarizing the authoritative implementation path
- one markdown repo-truth note identifying the surviving component(s), deprecated component(s), and placement assumptions
- one concise blocking-issues list for later phases


---

## Validation Requirements


- the chosen implementation path is unambiguous
- any deprecated path is clearly identified
- the phase outputs are specific enough that later phases do not need to reopen the product-direction decision


---

## Completion Standard


Mark this phase complete only when there is one clear answer to:
- what the homepage People & Culture product is
- which code path survives
- what placement mode(s) it must support
- what upstream constraints must be solved in later phases
