# Prompt 05 — Define Occupant Capability Contracts and Shell-Fit Adjustments

## Objective

Teach the shell what its current occupants can and cannot safely do, and make only the bounded child-surface adjustments that are directly required for shell fit.

This prompt must stay inside the shell-only boundary.

## Why this shell issue exists / current-state problem

The shell currently knows almost nothing about its occupants beyond “render this zone.”

It does not know:
- which occupants are strong anchors
- which occupants are supporting/contextual
- which occupants can pair safely
- which occupants require wide treatment
- which occupants can render compactly
- which occupants should not sit adjacent below certain comfort widths

Because that metadata does not exist, shell composition is forced to be either:
- hand-authored and fragile, or
- overly generic and flattening

## Repo-truth evidence and exact shell files / seams to inspect

Inspect at minimum:

- `apps/hb-webparts/src/webparts/hbHomepage/zones/*`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublicSurface.tsx`
- current shell schema / registry / capability files from earlier prompts
- any future occupant seams you need to account for, such as `apps/hb-webparts/src/webparts/safetyFieldExcellence/**`, but only for admission metadata
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`

Use the occupant-shell compatibility matrix in this package as the scope boundary.

## Why the current shell implementation is insufficient

The shell cannot safely orchestrate layout without capability contracts because it cannot answer:
- may this occupant live in this slot?
- what is its minimum comfort width?
- does it support compact treatment?
- what pairings are unsafe?
- is this an active occupant or only a future candidate?

The shell also has one current fit outlier:
- `PeopleCulturePublicSurface.tsx` keeps a strong self-contained presentation island, including extensive inline styles and an internal `maxWidth: 1040`

That matters here only because it constrains shell slot flexibility.

## Required shell implementation outcome

### 1. Create capability records for current occupants
At minimum, define capability metadata for:
- `CompanyPulse`
- `LeadershipMessage`
- `ProjectPortfolioSpotlight`
- `PeopleCulturePublic`
- `HbKudos`

Metadata should cover things like:
- slot eligibility
- role / prominence ceiling
- comfort width
- compact support
- pairing restrictions
- summary/collapse support if any
- active vs inactive status
- first-lane eligibility
- narrowest stable paired mode
- forced stacked fallback states where required by the breakpoint spec

### 2. Add candidate metadata for future shell occupants where justified
If `SafetyFieldExcellence` is the most obvious known future candidate, add **inactive candidate metadata** and preset guidance only.

Do not turn this prompt into a deep Safety product audit.

### 3. Make bounded shell-fit adjustments where required
If a current occupant blocks shell-fit behavior, make the minimum direct adjustment required to support governed shell placement.

Example of acceptable bounded work:
- adding an explicit compact or shell-fit variant
- removing or relaxing an internal hard width ceiling that blocks slot use
- introducing a shell wrapper hook or class path that makes compact treatment possible

Example of unacceptable scope drift:
- redesigning the child as a standalone premium product because it would be “nice”

### 4. Keep the People & Culture work tightly bounded
For `PeopleCulturePublic`, solve only the shell-fit problems needed to let the shell reason about it cleanly.

Do not reopen a broad “make People & Culture perfect” program here.

## What done really looks like

You are done only when all of the following are true:

1. Every current active shell occupant has an explicit capability record.
2. The shell can use those records to reject or demote bad placements.
3. `PeopleCulturePublic` no longer blocks shell-fit decisions due to a known hard shell-compatibility constraint.
4. Future candidate occupants can be represented as known-but-inactive without being rendered.
5. First-lane eligibility and narrowest stable entry behavior are explicit.
6. Child-surface changes remain bounded to shell compatibility.

## Constraints / prohibitions

- Do not turn this into a broad child-webpart redesign package.
- Do not collapse `PeopleCulturePublic` into `HbKudos`.
- Do not append `SafetyFieldExcellence` to the live shell just because metadata now exists.
- Do not make every occupant equally eligible for every slot.
- Do not ignore explicit comfort-width or pairing restrictions once you define them.

## Proof of closure required

Provide all of the following:

1. exact files changed
2. final capability record summary for each current occupant
3. any bounded shell-fit adjustments made to current occupants
4. first-lane eligibility / narrowest stable mode summary for each current occupant
5. explicit statement of why each child-surface change was shell-required
6. candidate-occupant metadata summary if added
7. explanation of how the shell now reasons about placements it previously could only hard-code


## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
