# 08 — Implementation Prompt 04 — Property Pane and Runtime Integration

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
## Objective

Extend the runtime/property-pane path so article-mode inputs can reach the hero cleanly while keeping HBCentral homepage behavior locked.

## Required outcome

- The shell/property-pane/runtime path supports article-mode fields.
- HBCentral still ignores article-mode behavior and renders homepage mode.
- The input contract is explicit and scrubbed.

## Repo-truth starting points

Inspect and update only what the repo truth requires in:

- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/`
- any new/affected contract files

## Required implementation direction

1. Extend the hero property pane for article-mode content.
2. Group fields cleanly:
   - article content
   - article media
   - author
   - publish metadata
   - homepage background override
3. Pass the needed runtime inputs through the mount layer.
4. Ensure the mode resolver remains authoritative:
   - HBCentral → homepage mode
   - non-HBCentral with article data → article mode
5. Keep the runtime contract stable and readable.

## Hard constraints

- Do not create an editor override that can force article mode on HBCentral.
- Do not leave ambiguous ownership between property pane, mount config, and render contracts.
- Do not let empty article fields silently mutate homepage behavior.

## Required scrub

Scrub:
- stale property pane descriptions
- unused fields
- contradictory config naming
- temporary compatibility shims that are no longer justified

## Validation

Prove all of the following before closing:

- property pane fields map correctly to runtime config
- article mode receives the expected inputs
- homepage mode remains stable on HBCentral
- partial article configuration yields an author-safe state
- lint/type/build are clean

## Deliverable note

When finished, leave a closure note covering:
- field inventory
- runtime mapping changes
- mode-resolution proof
- any remaining visual-proof work for the next closure unit
