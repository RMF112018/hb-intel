# Expanded Findings Register

## Finding 01 — The flagship homepage is still architecturally split

### Severity
Critical

### Current condition
The live repo still treats the hero and homepage app as separate flagship page-level surfaces. The hero is dispatched independently, while `HbHomepage` starts after the hero and owns only the launcher/actions region plus shell.

### Why this is a real problem
This prevents the flagship entry stack from being governed as one product surface. It weakens:
- single-source composition authority,
- shared first-screen budgeting,
- coordinated responsive behavior,
- and hosted cutover clarity.

### Root cause
The split is intentionally encoded across `mount.tsx`, `HbHomepageEntryStack.tsx`, `entryStackOrchestration.ts`, and `hbHomepageContract.ts`.

### Required correction
Move the flagship hero into `HbHomepageEntryStack` as a wrapper-owned region and update all repo-truth seams accordingly.

---

## Finding 02 — The hero lacks a wrapper-owned integration seam

### Severity
Critical

### Current condition
The wrapper already has a typed rail integration seam. It does not have a typed hero integration seam.

### Why this is a real problem
Without a bounded hero integration seam, flagship hero inputs will be passed around informally or leak into shell semantics. That would weaken ownership boundaries immediately.

### Root cause
The wrapper contract was authored around the post-hero model and never had to own hero inputs.

### Required correction
Add a typed wrapper-owned hero config/input seam in `hbHomepageWrapperConfig.ts` and reflect it in wrapper contracts/comments.

---

## Finding 03 — The hero is not consuming the same entry-state truth as the launcher and shell

### Severity
Critical

### Current condition
The wrapper already measures the entry-stack envelope and resolves entry state. The launcher band consumes that shared state. The hero does not.

### Why this is a real problem
The flagship entry experience can still behave like separate responsive systems:
- hero responding one way,
- launcher responding another,
- shell responding from a stronger shared truth.

That is structurally weaker than the repo already makes possible.

### Root cause
Hero responsiveness is still mostly internal to hero CSS and viewport bands rather than being downstream of wrapper-owned entry-state truth.

### Required correction
Create a shared entry-state seam that the hero consumes directly, using the existing measurement/policy apparatus rather than inventing parallel classification.

---

## Finding 04 — The hero remains too desktop-biased and crowded too late

### Severity
High

### Current condition
The homepage hero maintains:
- a strong left/right split,
- large padding,
- large type scale,
- and a logo/text relationship that de-escalates too late on constrained widths or short heights.

### Why this is a real problem
The hero can dominate the first screen, crowd its own content, or read as oversized relative to the launcher band and first shell lane.

### Root cause
The hero’s responsive posture is driven mainly by viewport breakpoints and fixed internal ratios rather than container-aware entry-state modes.

### Required correction
Rebuild hero layout modes around entry-state/container truth, including earlier de-escalation, short-height posture, and deliberate crowding control.

---

## Finding 05 — Hosted cutover can create duplicate hero rendering

### Severity
Critical

### Current condition
Today the flagship page can legitimately contain a standalone hero webpart above `HbHomepage`. If the hero is embedded into `HbHomepage` without page-authoring cleanup or transition-safe suppression, the page can render two heroes.

### Why this is a real problem
This is a deployment and authoring failure mode, not just a cosmetic issue. It can invalidate the whole cutover.

### Root cause
The current flagship model and the future unified model overlap during transition unless explicitly managed.

### Required correction
Close the rollout path:
- document removal of the old standalone hero from the flagship page,
- and add runtime/diagnostic protections if needed so duplicate hero is detectable or prevented during cutover.

---

## Finding 06 — Repo-truth seams will drift unless updated in lockstep

### Severity
High

### Current condition
Several files presently describe the old flagship truth:
- `mount.tsx`
- `entryStackOrchestration.ts`
- `hbHomepageContract.ts`
- `ReferenceHomepageComposition.tsx`

### Why this is a real problem
The repo depends heavily on comment-and-contract truth for future implementation work. If runtime changes but those seams do not, the codebase will mislead later work.

### Root cause
The split composition is documented in multiple places rather than only in runtime JSX.

### Required correction
Update the runtime truth, governance truth, and reference composition truth in the same wave.

---

## Finding 07 — Closure proof is not strong enough yet

### Severity
High

### Current condition
There are already tests for entry-state policy and shell measurement, but there is not yet a closure-grade proof package for:
- unified hero presence,
- no duplicate hero,
- entry-stack region ordering,
- no horizontal overflow,
- and constrained-screen behavior across the required matrix.

### Why this is a real problem
This work can look “better” on one monitor and still fail where it matters.

### Root cause
Existing proof is policy-heavy and not yet fully composed around the future unified hero path.

### Required correction
Add runtime markers, responsive proof, and hosted validation guidance tied directly to the new composition.

---

## Finding 08 — The reference composition is too close to the old flagship story

### Severity
Medium

### Current condition
`ReferenceHomepageComposition.tsx` still shows a hero-above-homepage reading more than a unified wrapper-owned flagship entry stack.

### Why this is a real problem
This file is used as a design/reference seam. Leaving it stale after runtime cutover invites future drift.

### Root cause
The reference composition is still aligned to the current split truth.

### Required correction
Update it to match the new flagship story or explicitly reframe it as a non-production harness/reference path.

---

## Finding 09 — Existing repo seams reduce the need for new dependencies

### Severity
Medium

### Current condition
The repo already has:
- containerized entry-stack wrapper CSS,
- shared measurement helpers,
- policy mirrors,
- and runtime diagnostics patterns.

### Why this matters
The implementation should use those seams before introducing new libraries or abstractions.

### Required correction
Favor extension of current seams over new dependencies unless a very small helper materially improves clarity or testability.
