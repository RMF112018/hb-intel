# Responsive Enhancement Strategy

## Strategy objective

Move Project Sites from a safe three-mode implementation to a more deliberate, doctrine-compliant, premium responsive surface **without discarding the existing measured-container foundation**.

## Governing posture

### Preserve
- measured container-width ownership
- viewport-height short-state awareness
- truthful launch-state messaging
- strong loading / empty / error states
- current scope/filter/sort interaction model unless a responsive redesign directly requires a tighter presentation

### Replace or redesign
- the coarse practical meaning of the three-mode system
- medium-mode control composition
- card-density assumptions
- sparse wide-state composition
- first-screen prioritization on constrained states
- lightly-specified proof and contract refresh work

## Doctrine interpretation for this app

### Primary governing doctrine
`UI-Doctrine-SPFx-Governing-Standard.md` is the main doctrinal authority for Project Sites.

### Homepage overlay
`UI-Doctrine-SPFx-Homepage-Overlay.md` was inspected because the prompt required it, but it is not the primary direct product doctrine for this domain app. The parts that still matter here are the shared host-fit, responsive, and composition expectations.

## Recommended closure logic

### 1. Refresh the contract before redesign gets too far
Do not let implementation run ahead of the responsive contract.  
The code already has a contract and evidence layer; refresh it early enough that later work stays coherent.

### 2. Fix medium/tablet behavior before polishing wide or compact details
The current weakest practical transition zone is medium/tablet.  
That state affects perceived quality more than incremental wide-state polish does.

### 3. Add information-density rules, not just spacing tweaks
Card quality will not materially improve if the redesign only changes wrapping and margin values. The card surface needs explicit density policy by layout mode.

### 4. Treat sparse desktop and ultrawide behavior as a composition problem
Do not solve sparse states only by changing minmax values. This needs actual composition intent.

### 5. Treat first-screen overhead as a prioritization problem
Do not merely shave padding.  
Re-sequence and compress secondary context so users reach project results faster.

### 6. Refresh the proof layer as a real closure step
The repo now has responsive proof artifacts. Build on them rather than ignoring them. Tests and docs should be updated alongside implementation, not as an afterthought.

## Recommended end state

### Layout contract
A richer Project Sites responsive contract that explicitly explains:
- which display classes matter
- what each mode means
- which parts of the UI change in each mode
- how short-height states differ from narrow-width states
- when dense desktop information should yield to compact scanning

### Control band
A true medium/tablet control band plus a compact/mobile-first entry pattern that emphasizes:
- search first
- essential scope/sort/filter actions next
- controlled disclosure of secondary context

### Card system
A card component with explicit density variants such as:
- wide/full
- medium/condensed
- compact/scan-first

The exact names may differ, but the density policy must be explicit.

### Wide and sparse behavior
A deliberate sparse wide-state composition that uses the canvas confidently without becoming fake-shell chrome or decorative filler.

### Proof layer
A refreshed breakpoint contract, stronger tests, and a stable hosted validation matrix.  
A screenshot-capable visual-regression path is recommended if practical.

## Decision notes for the implementation package

### Should the app definitely adopt CSS container queries?
Not necessarily as the primary truth seam.  
The current JS-derived container-state model is already established and tested. Container queries should be considered a **progressive enhancement or CSS simplification tool**, not a forced replacement.

### Should the app definitely add more named public modes?
Not automatically.  
What must exist is a more expressive contract. That could be:
- more named modes, or
- three public modes with clearer sub-rules and density variants

The implementation package should permit either path, but require a sharper result.

### Should this remediation add new runtime dependencies?
No new runtime dependency is strictly required for the core redesign.  
Optional test tooling may be justified if the repo does not already provide a strong screenshot-validation path.
