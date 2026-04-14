# Plan Summary — HB Homepage Orchestrator

## Objective

Create a new `hb-homepage` SPFx component inside `apps/hb-webparts` that becomes the single composed homepage surface for selected public homepage modules while keeping `hbSignatureHero` as an independent flagship top-band webpart.

## Locked target outcome

The final homepage composition should be:

1. `hbSignatureHero` rendered as its own independent full-width flagship hero
2. `hb-homepage` rendered as the single composed homepage operating layer beneath or adjacent to the hero, depending on the final page composition
3. `hb-homepage` responsible for rendering and orchestrating:
   - `HbKudos`
   - `LeadershipMessage`
   - `ProjectPortfolioSpotlight`
   - `PeopleCulturePublic`
   - `CompanyPulse`

## Repo-truth basis

This plan is based on the live `apps/hb-webparts` implementation pattern in which:

- `src/mount.tsx` currently dispatches many homepage-facing webparts by GUID
- `src/homepage/ReferenceHomepageComposition.tsx` already demonstrates a composed homepage pattern, but not as the production host
- several target homepage modules are already thin consumers over shared `@hbc/ui-kit/homepage` surface families
- `tools/build-spfx-package.ts` already handles complex hb-webparts packaging, manifest cloning, shim generation, and preservation of `supportsFullBleed` where declared
- `HbKudos` is materially more workflow-heavy than the other candidate absorbed modules, so it should be integrated after the shell and simpler modules are in place

## Core architectural recommendation

### Create a new orchestrator

Create a first-class homepage host webpart named `hb-homepage` under `apps/hb-webparts/src/webparts/`.

This new host should:

- own page-canvas layout for the absorbed modules
- define the zone order and composition rhythm
- consume the embedded homepage modules as feature blocks, not as independent page composition units
- establish shared host context where useful
- standardize outer spacing, density, loading, and empty/error behavior
- keep module internals modular and reusable

### Keep the signature hero separate

`hbSignatureHero` remains independent and continues to own the flagship hero role. The new homepage host must not duplicate or compete with that top-band authority.

### Prefer communication-site full-width posture

The composed homepage should target a supported SharePoint hosting posture rather than shell hacks or DOM stitching.

## Scope by module

### Lowest integration effort
- `CompanyPulse`
- `LeadershipMessage`
- `ProjectPortfolioSpotlight`

These already behave close to embedded feature consumers and should require mostly shell contract adaptation.

### Moderate integration effort
- `PeopleCulturePublic`

This should be absorbed after shell contract definition because it still carries split/legacy config bridging that may need tightening for orchestrator use.

### Highest integration effort
- `HbKudos`

This is the most sophisticated absorbed module and should be integrated after the shell is proven. It needs an explicit embedded-mode posture so it remains premium without leaking standalone layout assumptions.

## Sequencing logic

### Phase 1 — authority, architecture, and host creation
- lock governing files and repo-truth seams
- define the `hb-homepage` architecture and contracts
- create the new SPFx host component and manifest
- wire a shell composition path

### Phase 2 — absorb simpler public modules
- embed Company Pulse
- embed Leadership Message
- embed Project Portfolio Spotlight

### Phase 3 — absorb People & Culture
- embed `PeopleCulturePublic`
- tighten config and presentation boundaries as needed

### Phase 4 — absorb Kudos
- embed `HbKudos`
- add any embedded-host contract needed for layout and spacing safety

### Phase 5 — mount, packaging, and hosted validation
- wire `mount.tsx`
- update packaging seams in `tools/build-spfx-package.ts`
- validate manifest/package/runtime behavior
- perform hosted vetting and closure

## Deliverable expectations for each prompt

Every prompt in this package must produce:

- a clear summary of repo-truth findings relevant to the assigned scope
- exact files changed
- exact architectural effect of those changes
- explicit statement of what remains open for the next prompt
- no hidden carryover scope

## Non-negotiable guardrails

- Do not collapse this into CSS-only layout wrapping
- Do not preserve weak standalone page-placement assumptions
- Do not let absorbed modules continue to own outer page layout
- Do not let the shell duplicate SharePoint chrome
- Do not let the shell compete with the flagship hero
- Do not skip packaging-proof work
- Do not close the sequence without hosted validation
