# Prompt 01 — Establish the Authoritative Outer Envelope for the HB Homepage Wrapper + Shell

## Objective
Implement one explicit outer page-canvas fit contract for the flagship `hbHomepage` runtime so the wrapper entry stack and the shell stop competing as top-level envelope authorities.

## Why this work exists
The live repo currently makes both the entry stack root and the shell root behave like outer envelopes:
- both declare full-width, centered, max-width-limited container behavior
- the shell then adds its own breakpoint-sensitive root padding inside that same posture

That is not a clean host-fit model. It makes the rendered result harder to reason about in SharePoint-hosted conditions and increases the chance of right-edge drift, threshold mistakes, and future regressions.

The fix is **not** to flatten all styling into one identical gutter. The fix is to establish one outer contract and make all other layout choices subordinate to it.

## Governing authority
You must follow:
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`

## Files / seams to inspect first
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- any shared fit utility, token seam, CSS variable seam, or wrapper-level contract seam you introduce

## Current weakness in nuanced terms
The current code is close to correct in architecture but weak in host-fit governance.

The wrapper and shell boundaries are good.
The shell logic seams are good.
What is weak is the outer fit contract.

Right now the code is too willing to let both wrapper and shell look like they own the outer page canvas. That is exactly the kind of ambiguity that can make a shell appear container-aware while still being wrong at the host edge.

## Intended future state
After this prompt is complete:
- one seam clearly owns the outer page-canvas contract
- the wrapper and shell no longer duplicate that authority
- the result still supports a premium full-width homepage composition
- inner visual styling remains possible, but it is clearly downstream of the shared outer contract
- the rendered runtime is easier to reason about under hosted SharePoint conditions

## What must change
1. Define the single authoritative outer envelope contract.
2. Refactor the wrapper and shell seams to consume that contract rather than each acting like the outer authority.
3. Keep the wrapper-owned actions region and the shell region as separate owned surfaces.
4. Preserve the shell’s orchestration ownership; do not widen the shell boundary into wrapper territory.
5. Make the resulting contract visible in code, not implicit.

## Done means
Done does **not** mean “the CSS looks cleaner.”

Done means:
- the code agent can point to one authoritative outer envelope source
- the entry stack and shell no longer duplicate outer fit authority
- the refactor preserves wrapper-vs-shell ownership boundaries
- the shell remains a post-actions operating layer, not a page editor
- the hosted runtime no longer depends on ambiguous layered envelope behavior

## Prohibitions
- Do not redesign child surfaces.
- Do not absorb the embedded rail into shell occupant semantics.
- Do not fake closure with clipping or hidden overflow.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Your implementation report must show:
1. exactly which seam now owns the outer envelope
2. which seams stopped owning it
3. how wrapper and shell ownership stayed intact
4. why this is more host-fit-correct than the old model
5. before/after explanation of the envelope contract
