# Actions Rail + HB Homepage Enhanced Audit and Remediation Package

## Purpose
This package fully replaces the previously attached:

- `actions-rail-homepage-audit-package.zip`
- `actions-rail-homepage-implementation-prompt-package.zip`

It is a repo-truth, screenshot-aware, doctrine-governed replacement package for the `PriorityActionsRail` + `HbHomepage` flagship integration surface.

## What this package changes relative to the prior packages
The prior packages were directionally useful, but they were still too willing to treat the hosted screenshot as a pure design-remediation problem.

This package materially upgrades the remediation posture in four ways:

1. **Hosted-runtime parity becomes P0**
   - The live repo on `main` already contains a significantly more advanced flagship command-band path than the screenshot suggests.
   - That means closure cannot begin with blind redesign work.
   - It must begin by proving whether the hosted tenant is actually running current `main`, current assets, current CSS, and current flagship context.

2. **Root cause is split correctly**
   - The old prompts over-focused surface redesign.
   - The actual code seam analysis shows at least three distinct problem classes:
     - hosted runtime parity / stale package risk
     - naïve slice-then-group primary selection logic
     - literal section rendering that wastes space when groups are sparse

3. **Prompt quality is more forceful and more executable**
   - Each prompt explains the present failure, the future-state requirement, the exact seams to inspect, and the proof required for closure.
   - The prompts are intentionally written for decisive local code-agent execution, not for soft advisory review.

4. **Closure proof is elevated**
   - The old package hardened tests late.
   - This package treats hosted proof, packaged proof, and screenshot parity proof as first-order closure requirements.

## Governing authority for this package
Treat these as governing for the remediation described here:

- `UI-Doctrine-SPFx-Governing-Standard.md`
- `UI-Doctrine-SPFx-Homepage-Overlay.md`
- benchmark package files attached in `benchmark.zip`
- repo truth on `main`
- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`

If older package wording conflicts with the repo or doctrine, the repo and doctrine govern.

## Package order
Read in this order:

1. `00-Enhanced-Audit-Summary.md`
2. `01-Package-vs-Repo-Truth-Gap-Register.md`
3. `02-Architecture-and-Ownership-Map.md`
4. `03-UI-UX-and-Hosted-Surface-Assessment.md`
5. `04-Doctrine-and-Benchmark-Compliance-Assessment.md`
6. `05-Root-Cause-and-Code-Seam-Analysis.md`
7. `06-Prioritized-Findings-Register.md`
8. `07-Recommended-Implementation-Sequence.md`
9. `08-External-Research-and-Pattern-Notes.md`
10. `09-Hosted-Runtime-Proof-Checklist.md`
11. `Plan-Summary.md`
12. `Prompt-01-*` through `Prompt-08-*`

## Bottom line
The architecture is largely worth preserving.

The current closure failure is not primarily “wrong app architecture.”
It is:

- unproven hosted parity,
- weak flagship curation logic,
- weak sparse-group rendering,
- insufficiently decisive overflow and layout divergence,
- and insufficient closure proof.

That is what this package addresses.
