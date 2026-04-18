# 01 — Repo-Truth Verification Matrix

This matrix verifies the 10 starting hypotheses against the live repo.

## Hypothesis 1
### Claim
`HbHomepage.tsx` is currently a thin pass-through to `HbHomepageShell`, not a substantive wrapper/orchestrator.

### Verdict
**Confirmed**

### Repo truth
`HbHomepage.tsx` only imports `HbHomepageShell` and returns `<HbHomepageShell {...props} />`.

### Implication
There is no runtime wrapper-owned pre-shell region today.

---

## Hypothesis 2
### Claim
`mount.tsx` currently maps the homepage hero, `PriorityActionsRail`, and `HbHomepage` as separate SPFx webparts.

### Verdict
**Confirmed**

### Repo truth
`WEBPART_RENDERERS` in `mount.tsx` separately registers:
- `HbSignatureHero`
- `PriorityActionsRail`
- `HbHomepage`

### Implication
The live production registry still treats these as independently dispatchable webparts.

---

## Hypothesis 3
### Claim
`entryStackOrchestration.ts` currently models the entry stack as a shared governance seam, not a unified runtime renderer.

### Verdict
**Confirmed**

### Repo truth
The file explicitly says it is intentionally **not** a runtime component and that SPFx hosts the surfaces as separate webparts.

### Implication
Attached package language about runtime integration needed to become real was correct.

---

## Hypothesis 4
### Claim
`HbHomepageShell` currently owns the post-hero shell only, not the full hero/actions/shell runtime stack.

### Verdict
**Mostly confirmed, with one wording caveat**

### Repo truth
`HbHomepageShell` renders shell bands and zone components only. It does not render the hero or the rail.  
However, contract/comment language already says the shell owns **shell-facing entry-stack integration** and begins immediately after the hero.

### Caveat
The repo’s contract language is slightly looser than the attached package phrasing. It is safer to say:

> The shell currently owns the **post-hero shell runtime** and the shell-facing policy relationship to the entry stack, but it does **not** render hero or priority actions.

### Implication
Wrapper integration will require contract/comment refinement, not just JSX changes.

---

## Hypothesis 5
### Claim
`PriorityActionsRail` is not currently a shell occupant in the homepage shell registry/preset model.

### Verdict
**Confirmed**

### Repo truth
The shell occupant registry and `OccupantId` union do not include the rail.

### Implication
A shell-occupant migration would be a real semantic expansion, not a small alignment step.

---

## Hypothesis 6
### Claim
`HbKudos` is already successfully embedded inside `hbHomepage` not by nested SPFx webpart hosting, but by rendering the underlying `HbKudos` React component through `HbKudosZone`.

### Verdict
**Confirmed**

### Repo truth
`HbKudosZone.tsx` renders `<HbKudos ... />` directly.

### Implication
The repo already has a proven embed-the-React-surface pattern.

---

## Hypothesis 7
### Claim
`HbKudos` receives shell-provided config/runtime context from `hbHomepage`, while still loading its own live data through its own hooks/shared data layer.

### Verdict
**Confirmed**

### Repo truth
`HbKudosZone` passes `moduleConfig.hbKudos`, identity, asset base URL, and graph token into `HbKudos`.  
The shell does not turn `HbKudos` into a fake shell-owned data model.

### Implication
This is the right precedent for the rail: wrapper-owned embed, product-owned data seam.

---

## Hypothesis 8
### Claim
Because of that existing embedded-component pattern, there may already be a proven architectural precedent for embedding `PriorityActionsRail` at the homepage runtime level without treating it as an independent shell occupant.

### Verdict
**Confirmed**

### Repo truth
The precedent is real. It is not perfect symmetry, because the rail is an entry-stack surface rather than a shell zone, but the important runtime pattern is proven.

### Implication
Wrapper embedding is architecturally native to the repo.

---

## Hypothesis 9
### Claim
The strongest current recommendation may be a wrapper-owned pre-shell region in `HbHomepage` rather than forcing `PriorityActionsRail` into `HbHomepageShell` as another shell band/occupant.

### Verdict
**Confirmed**

### Why
Repo truth points in that direction because:
- shell occupant model excludes the rail today
- the shell contract is explicitly orchestration-only for shell lanes
- the rail has its own admin/list/product seam
- the embed-the-React-surface pattern already exists
- the breakpoint spec preserves a distinct actions stage before the first shell lane

---

## Hypothesis 10
### Claim
That recommendation must still be re-proven against the live repo and against current SharePoint/SPFx best practices before being accepted.

### Verdict
**Confirmed and completed by this package**

### Best-practice implications
The external research reinforces that:
- SharePoint modern page layout is still section/canvas-driven
- full-width support is explicit and host-dependent
- responsive composition should adapt to the **container**, not just the viewport
- page-canvas cutover is a real implementation concern, not a documentation footnote

---

## Net result

The main recommendation survives re-audit:

> The correct target is a **wrapper-owned pre-shell rail region** inside `HbHomepage`, with the shell remaining a shell and the standalone rail webpart remaining independently mountable.

But the attached packages needed stronger treatment of:
- cutover
- contract reconciliation
- page-canvas proof
- comment/doc drift
- and closure rigor
