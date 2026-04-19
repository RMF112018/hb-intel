# 00 — Enhanced Audit Summary

## Objective
Audit the two prior packages against the live repo on `main`, the attached hosted screenshot, and the governing doctrine / benchmark materials, then replace them with a materially stronger remediation package.

## Executive conclusion
The live implementation is **not ready to close**, but the reason is more specific than the prior packages stated.

The strongest short statement of current condition is:

> **The architectural seams are mostly correct; the hosted outcome is not trustworthy enough to judge closure until runtime parity is proven, and the remaining real code gaps are concentrated in selection, grouping, overflow, and proof.**

## What the prior packages got right
The prior packages were correct to preserve the following:

### 1. Wrapper-owned homepage integration
`HbHomepageEntryStack` is the correct owner of the pre-shell actions region. The rail remains a React surface embedded by the wrapper rather than being reclassified as a shell occupant.

### 2. Explicit flagship context seam
Passing `surfaceContext="homepage-flagship"` into the embedded rail is correct and should remain explicit.

### 3. Shared rail surface family
The repo now has a real `HbcPriorityRail` shared family with:

- named context
- overflow strategies
- grouped section support
- featured action capability
- shared test seams

That is correct long-term direction.

### 4. Container-aware device resolution
The rail is already reacting to real rendered container dimensions rather than using only naïve viewport media-query assumptions. That is doctrinally correct.

## What the prior packages missed or underweighted
### 1. They missed the biggest repo-truth problem
The repo on `main` already contains a significantly more advanced homepage-flagship tile grammar than the screenshot shows.

That means the screenshot is **not** evidence that the current repo simply needs visual redesign from scratch.

It is evidence that one of the following must be proven first:

- the hosted tenant is stale
- the `.sppkg` is stale
- the deployed asset payload is stale
- the flagship context path is not the one actually rendering
- the export / packaging chain is not surfacing the current flagship surface
- the tenant is on partial drift relative to `main`

This is now **P0**.

### 2. They underweighted the actual primary logic defect
The current public selection path still does:

1. normalize items
2. filter
3. slice top `N`
4. group afterward

That creates literal singleton sections, duplicated headings, and blank field waste when the visible set is sparse across groups.

This is a code-logic problem, not just a CSS problem.

### 3. They were too screenshot-led and too little parity-led
The prior prompts mostly assume the screenshot equals the current live product grammar.

That is not safe given current repo truth.

### 4. They postponed proof too long
The old package put hard proof near the end.
This replacement package moves:

- hosted parity proof,
- packaged proof,
- and runtime evidence

to the front of the closure sequence.

## Final judgment on the old packages
### Strong
- ownership diagnosis
- wrapper/seam preservation
- general UX concern identification
- awareness that current hosted result is not acceptable

### Partial
- width-use critique
- overflow critique
- grouping critique
- breakpoint critique

### Weak or missing
- hosted parity as P0
- slice-then-group as a root cause
- sparse singleton section logic as a first-order structural issue
- proof rigor relative to current repo sophistication
- contract honesty around `stickyAfterHero`
- prompt forcefulness around “done” and closure proof

## Required replacement posture
The correct remediation sequence is now:

1. prove hosted parity
2. fix primary selection / grouping / compaction logic
3. strengthen overflow and layout divergence
4. tune flagship density and width authority
5. close with stronger tests and hosted proof
6. resolve leftover contract honesty gaps

That sequence is what the rest of this package enforces.
