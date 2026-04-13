# 05 — Implementation Prompt 01 — Lock HBCentral Homepage Mode

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
## Objective

Establish a hard, explicit mode boundary that preserves the current HBCentral flagship homepage hero behavior unchanged.

## Required outcome

- HBCentral always renders the current homepage flagship hero path.
- The hero code no longer relies only on convention/doctrine for homepage locking.
- The affected footprint is scrubbed for stale or contradictory mode logic.

## Repo-truth starting points

Inspect, then work from the live `main` branch reality in:

- `apps/hb-webparts/src/webparts/hbSignatureHero/`
- `apps/hb-webparts/src/mount.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/hb-webparts/src/homepage/data/spContext.ts`
- any affected shared contracts/helpers

## Required implementation direction

1. Introduce a dedicated mode resolver.
2. Hard-lock homepage mode when the current site URL is:
   - `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
3. Keep the current homepage visual/output behavior unchanged.
4. If needed, extract the current component into a clearly named homepage adapter such as:
   - `HbSignatureHeroHomepage.tsx`
5. Make `HbSignatureHero.tsx` the orchestrator only if that improves clarity and containment.

## Hard constraints

- Do not introduce article rendering yet.
- Do not weaken or restyle the homepage branch.
- Do not change the current homepage content model.
- Do not create dead compatibility layers.

## Required scrub

Perform an exhaustive scrub of:
- stale homepage/article assumptions
- duplicate mode checks
- unclear prop ownership
- comments that no longer match runtime behavior

## Validation

Prove all of the following before closing:

- HBCentral resolves to homepage mode
- homepage render output is unchanged
- non-HBCentral paths do not accidentally force homepage-only assumptions
- the implementation is doctrine-compliant and lint-clean

## Deliverable note

When finished, leave a concise closure note in your output covering:
- files changed
- mode-resolution rule implemented
- proof that HBCentral behavior stayed unchanged
- any follow-on risks that remain for the next closure unit
