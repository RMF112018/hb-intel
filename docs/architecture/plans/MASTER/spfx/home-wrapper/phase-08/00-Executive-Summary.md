# 00 — Executive Summary

## Objective
Audit the attached shell-focused packages against live repo truth and replace them with a stronger combined package that gives a local code agent a materially better chance of closing the `hbHomepage` host-fit problem cleanly.

## What the attached packages got right
- They kept scope centered on the `hbHomepage` wrapper and shell rather than drifting into a broad redesign.
- They correctly preserved the wrapper-vs-shell boundary defined in `hbHomepageContract.ts`.
- They correctly treated the current architecture as worth preserving rather than replacing wholesale.
- They correctly identified shell-fit closure, not child-surface redesign, as the in-scope problem.
- They correctly recognized that current automated proof is too weak for a credible host-fit closure claim.

## Where the attached packages are weak
- They describe likely root causes too confidently in a few places without enough repo-specific proof.
- They do not distinguish clearly enough between:
  - authoritative outer envelope ownership, and
  - intentional inner region-specific inset styling.
- They underplay the importance of the current measurement model, which derives shell behavior from the shell element’s own observed box rather than from a clearly declared outer host-fit authority.
- They are too light on inspectable diagnostics and proof requirements.
- They likely under-scope the closure sequence by trying to force everything into four prompts.

## Repo-truth judgment
The live repo shows a strong ownership model and mature shell orchestration seams, but it still carries a risky host-fit pattern:
- the wrapper entry stack and shell each declare a full-width, centered, max-width-limited outer envelope
- the shell then layers breakpoint-sensitive root padding on top of its own width envelope
- the runtime state model is driven by `useShellContainer`, which currently observes the shell element itself and uses that observed width to drive entry-state selection and pairing logic
- the wrapper-owned actions region is intentionally styled as a narrower top strip, but that visual intent is not yet backed by a sufficiently explicit shared outer fit contract

## Most important correction this package makes
This package does **not** treat “make the rail and shell gutters identical” as the answer.

The real correction is:
1. establish one authoritative outer page-canvas contract,
2. keep wrapper and shell ownership intact,
3. treat inner gutters/insets as deliberate region policy layered inside that shared outer contract,
4. rebase measurement on authoritative usable width,
5. add proof that would catch the screenshot-class defect if it returns.

## Recommended closure posture
Preserve:
- `hbHomepageContract.ts`
- `HbHomepageEntryStack.tsx` composition boundary
- `HbHomepageShell.tsx` orchestration model
- `breakpointPolicy.ts`
- `slotComfortResolver.ts`
- `firstLaneResolver.ts`
- `shellConformance.ts`

Correct:
- outer envelope authority
- shell usable-width measurement model
- actions-region containment contract
- inspectable diagnostics
- hosted regression proof
