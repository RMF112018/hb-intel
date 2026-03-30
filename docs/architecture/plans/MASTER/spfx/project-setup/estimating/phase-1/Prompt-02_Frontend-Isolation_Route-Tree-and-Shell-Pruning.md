# Prompt 02 — Frontend Isolation: Route Tree and Shell Pruning

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 1 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Implement the **frontend isolation work** required to make this a **strictly isolated Project Setup package**.

This prompt is focused on the frontend user-visible and bundle-visible surface only.

## Critical instructions

- Use the Phase 1 scope matrix created in Prompt 01 as the governing source.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** preserve out-of-scope shell or route behavior “for later” if it still ships in the package.
- Keep `ui-review` mode intact, but only for Project Setup review.
- Do **not** drift into list mapping, auth redesign, or broad infrastructure work in this prompt.

## Required working approach

1. Remove all non-Project-Setup routes from the reachable route tree.
2. Remove all non-Project-Setup shell affordances, including:
   - tool pickers
   - nav items
   - route redirects
   - banners or helper panels that imply broader app scope
3. Remove or disable UI components that trigger out-of-scope API calls.
4. Ensure the simplified shell communicates only Project Setup context.
5. Verify the package still boots cleanly in `ui-review`.

## Specific outcomes required

By the end of this prompt:
- the visible route tree should be Project Setup only
- the visible shell should be Project Setup only
- unsupported background fetches for removed features should no longer occur
- the bundle should not carry obvious live execution paths into removed scope

## Required implementation outputs

Make the code changes necessary to:
- isolate the Project Setup route tree
- prune shell composition
- remove or neutralize route-level imports and references for out-of-scope features
- remove frontend execution paths that call clearly unsupported capabilities

Update or create a markdown file summarizing:
- routes removed
- shell affordances removed
- frontend calls removed or neutralized
- any temporary compatibility shims retained, with explanation

## Acceptance criteria

- Only Project Setup user journeys remain reachable.
- The shell no longer implies a broader application surface.
- No retained frontend call remains for a feature that the isolated package no longer exposes.
- `ui-review` still boots and supports Project Setup review.

## Required summary back to me

When done, report:
- files changed
- routes removed
- shell affordances removed
- calls removed or neutralized
- any remaining frontend scope residue that must be handled in Prompt 03
