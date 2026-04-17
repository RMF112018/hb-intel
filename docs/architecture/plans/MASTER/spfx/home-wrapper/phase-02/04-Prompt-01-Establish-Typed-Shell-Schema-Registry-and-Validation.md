# Prompt 01 — Establish Typed Shell Schema, Registry, and Validation

## Objective

Replace the shell’s current ad hoc composition assumptions with a typed, validated shell data model that can safely drive:
- current public rendering
- future preset changes
- future controlled layout administration
- invalid-state normalization

This is foundational shell work. Do not treat it as optional plumbing.

## Why this shell issue exists / current-state problem

`hbHomepage` currently behaves like a hand-authored stack, not a governed shell.

Today:
- `HbHomepageShell.tsx` hard-codes zone order directly in JSX
- `hbHomepageContract.ts` exposes broad `Record<string, unknown>` config typing
- there is no typed concept of:
  - shell presets
  - bands
  - slots
  - active vs inactive occupants
  - slot comfort rules
  - protected shell decisions
  - invalid-layout fallback behavior

That means the shell has no durable contract for evolution. The current code can render today’s fixed stack, but it cannot safely absorb:
- preset changes
- persisted layout state
- controlled admin edits
- future shell expansion
without hidden drift.

## Repo-truth evidence and exact shell files / seams to inspect

Inspect at minimum:

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/*`
- `apps/hb-webparts/src/mount.tsx`

Governing docs to keep open:
- `docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/03-Architecture-and-Shell-Embedded-Contract.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Also confirm whether an existing runtime schema library should be reused. The repo already appears to use `zod` elsewhere; prefer existing dependency reality over inventing a new validation pattern.

Also keep `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md` open. This prompt now needs to encode that spec into a usable shell policy model rather than leaving it as prose.

## Why the current shell implementation is insufficient

The current shell contract is insufficient because it collapses three different concerns into one weak shape:

1. **renderer context**
   - identity
   - siteUrl
   - token providers
   - asset base URL

2. **module content config**
   - per-occupant config blobs such as `companyPulse`, `leadershipMessage`, etc.

3. **shell layout intent**
   - order
   - grouping
   - prominence
   - slot assignment
   - preset choice
   - responsive demotion rules

Those concerns need to be separated and typed explicitly.

Without that split, the shell cannot:
- validate input
- normalize malformed state
- serialize safe layout state
- distinguish protected shell decisions from configurable ones
- explain why an occupant is or is not allowed in a given slot

## Required shell implementation outcome

Create a shell schema layer that defines, at minimum:

### 1. Shell preset model
A typed shell preset representation for:
- preset id
- human-readable title / description if useful
- ordered bands
- slots within bands
- allowed active occupants per slot
- default occupant assignments for the current shell

### 2. Occupant registry model
A typed registry for known shell occupants that includes:
- occupant id
- current status (`active`, `inactive-candidate`, or similar)
- render key / zone wrapper mapping
- allowed slot roles
- comfort width / layout eligibility metadata
- compact / standard support flags
- pairing restrictions where needed

### 3. Protected decision model
A typed declaration of what must remain code-governed, such as:
- post-hero boundary
- protected band semantics
- prohibited pairings
- max dominant occupants in a band
- non-configurable prominence ceilings

### 4. Validation and normalization
Add a parser/validator that:
- accepts external shell layout input if present
- validates it
- normalizes it into a safe preset-driven internal state
- falls back to a repo-truth default when invalid

### 5. Clear contract separation
Refactor shell contracts so it is obvious which data belongs to:
- renderer context
- module config slices
- shell layout state

### 6. Entry-state breakpoint policy model
Add a typed shell entry-state policy model aligned to `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`.

At minimum, encode:
- named entry states based on practical usable shell targets
- which states force single-column first-lane behavior
- when first-lane pairing is allowed
- first-lane dominance guidance
- narrow / short-height constrained state handling
- any shell-owned adjacency assumptions that later top-actions work must align to

Do **not** build the hero or a full Top Actions system here. This is about turning the spec into a shell-usable contract.

## What done really looks like

You are done only when all of the following are true:

1. The shell has a real typed schema and registry instead of implicit JSX order.
2. Invalid shell state can be parsed, rejected, normalized, and rendered safely.
3. The contract clearly distinguishes layout intent from per-occupant content config.
4. The schema makes future control-panel persistence possible without shipping the control panel UI now.
5. The shell’s post-hero boundary remains explicit and protected.
6. The breakpoint spec is represented in typed shell policy rather than prose-only guidance.
7. The code becomes easier to review because shell decisions are data, not hidden render order.

## Constraints / prohibitions

- Do not move `hbSignatureHero` into `hbHomepage`.
- Do not redesign child surfaces as standalone products.
- Do not create configuration indirection that has no governance value.
- Do not leave shell normalization behavior implicit.
- Do not keep `Record<string, unknown>` as the shell’s primary layout contract.
- Do not turn this into an admin UI task.

## Proof of closure required

Provide all of the following in your final response:

1. exact files created or changed
2. the new schema / registry file map
3. before vs after contract summary
4. the invalid-state normalization path
5. one concrete example of:
   - valid preset input
   - invalid preset input
   - normalized output
6. the new entry-state policy model summary
7. explicit confirmation that the shell remains a post-hero operating layer


## Instruction not to re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes

Do not re-read files that are still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
