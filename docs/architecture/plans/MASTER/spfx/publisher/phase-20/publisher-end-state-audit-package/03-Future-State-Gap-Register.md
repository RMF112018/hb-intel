# Future-State Gap Register

## Gap 01 — Governed asset acquisition is architected but likely not live-wired
**Severity:** High  
**Category:** product workflow / runtime integration / media governance  
**Scale:** Targeted refinement with cross-layer impact

### Current state
Image and media surfaces are explicitly designed to prefer asset-library browsing when `searchAssets` is available, with raw URL entry demoted behind an advanced path.

### Why this is still a gap
The SPFx mount boundary does not currently pass a `searchAssets` function into `ArticlePublisher`. That strongly suggests the intended governed browse-first flow is not actually active in the live runtime.

### Why it matters
If authors still have to rely on pasted URLs in normal production use:
- media trust drops
- author effort rises
- alt-text and asset-governance quality becomes less consistent
- the product feels less premium and less system-assisted than intended

### Required correction direction
Wire a real tenant-safe asset-library lookup seam through the mount boundary and make that the actual production front-door for hero, secondary, and gallery media acquisition.

---

## Gap 02 — Project identity is polished at the UI layer but still brittle underneath
**Severity:** High  
**Category:** authoritative data seam  
**Scale:** Targeted refinement with architectural hardening

### Current state
The ProjectPicker experience is good and low-friction.

### Why this is still a gap
The underlying lookup still depends on:
- a title-bound SharePoint list
- generic CSV-import field names
- a minimal field mapping contract

### Why it matters
The UI implies authoritative, control-plane-grade project identity. The underlying seam does not yet fully deserve that level of trust.

### Required correction direction
Preserve the current picker UX, but harden the backing contract with stable schema assumptions, stronger lookup semantics, and cleaner authoritative ownership.

---

## Gap 03 — Defaults help, but they do not yet materially change time-to-first-draft
**Severity:** High  
**Category:** author friction / workflow optimization  
**Scale:** Targeted refinement

### Current state
Defaults exist for team heading and hero category label.

### Why this is still a gap
That is not enough to satisfy the stated product goal of materially reducing burden and increasing publishing frequency.

### Why it matters
Authors still do too much first-pass setup manually. The product explains well, but it does not yet help enough.

### Required correction direction
Expand intelligent defaults and first-draft assistance into a more meaningful system:
- project-derived editorial seeds where justified
- smarter first-pass field hydration
- stronger empty-state actions
- more aggressive removal of repetitive author work

---

## Gap 04 — Story authoring is credible, but not obviously final-state flagship quality
**Severity:** Medium  
**Category:** editorial workflow  
**Scale:** Refinement, potentially structural if publishing needs expand

### Current state
The editor is real, schema-governed, accessible, and much stronger than before.

### Why this is still a gap
The current surface is a good governed baseline, not obviously the final editorial answer for a world-class publishing product.

### Why it matters
If author expectations or publishing-template capabilities exceed the current editor envelope, the story surface may begin to feel constrained rather than empowering.

### Required correction direction
Advance only where justified by real editorial output and template needs. Do not bloat the surface gratuitously.

---

## Gap 05 — Premium feel still depends partly on careful narration
**Severity:** Medium  
**Category:** product experience  
**Scale:** Refinement

### Current state
The product now uses strong helper copy, trust cues, and readiness guidance.

### Why this is still a gap
Some friction is still being managed by explanation rather than being fully removed by stronger system behavior.

### Why it matters
A truly low-friction product should not need to narrate as much of its correctness and workflow intent.

### Required correction direction
Preserve the trust model, but convert more “explained” behavior into actual automation, defaulting, and governed assistance.

---

## Gap 06 — Project binding is low-friction for search, but not yet fully authoritative end-to-end
**Severity:** Medium  
**Category:** project identity / downstream consistency  
**Scale:** Refinement

### Current state
Project selection fills `ProjectId`, `ProjectName`, and related values well enough for current authoring.

### Why this is still a gap
There is still a mismatch between the editorial confidence of the surface and the deeper structural confidence of the underlying project contract.

### Why it matters
Project identity is foundational. If it is not truly authoritative, downstream defaults, promotion rules, and future expansion become more fragile.

### Required correction direction
Treat project identity as control-plane-grade data, not merely a convenient search result.

---

## Not a gap by itself

### Current runtime scope is Project Spotlight only
This is intentional present-state truth and is not treated here as a defect or remediation target by itself.
