# Current Homepage Shell Implementation Map

## 1. Framing

The homepage composition is currently split across three main public surfaces mounted independently through `apps/hb-webparts/src/mount.tsx`:

- `HbSignatureHero`
- `PriorityActionsRail`
- `HbHomepage`

That means the homepage is already moving toward a multi-object entry stack, but the codebase still treats those as separate webparts rather than as one governed entry-state system.

## 2. Top-level mount seams

### Runtime mount map
`mount.tsx` is the main homepage runtime dispatcher. It wires:

- hero
- priority actions rail
- hbHomepage shell
- the individual participating homepage occupants

This matters because the repo currently supports **both**:
- independent webparts
- and the composed shell path

### Design implication
The shell is not yet the only homepage orchestration seam.
That is why entry-stack behavior is only partially governed in one place.

## 3. Manifest seams

### `hbHomepage`
- Manifest explicitly declares `supportsFullBleed: true`
- Treated as the composed homepage orchestrator surface

### `hbSignatureHero`
- Separate webpart
- Manifest also declares `supportsFullBleed: true`
- Flagship top-band surface

### Design implication
The shell and the hero are both structurally prepared for premium full-width placement, but they are not yet united under one persisted layout system.

## 4. Shell contract layer

The `hbHomepage` webpart already has a meaningful contract stack:

### Core files
- `hbHomepageContract.ts`
- `shell/shellTypes.ts`
- `shell/shellSchema.ts`
- `shell/defaultPreset.ts`
- `shell/presetLibrary.ts`
- `shell/occupantRegistry.ts`
- `shell/breakpointPolicy.ts`
- `shell/slotComfortResolver.ts`
- `shell/shellValidation.ts`
- `shell/protectedDecisions.ts`

### What this layer already does
- defines valid occupants
- defines slot roles and band semantics
- parses/validates layout input
- supports preset selection
- supports band and slot overrides
- distinguishes protected vs configurable decisions
- resolves entry-state policy from container dimensions
- decides whether paired bands are allowed

### What this means
The repo already contains the beginnings of a **governed layout engine**, not just a render component.

## 5. Shell render layer

### `HbHomepageShell.tsx`
This is the post-hero orchestrator.

It currently:
- extracts module config slices
- parses layout input
- computes container state
- resolves band layouts
- renders semantic bands and slots
- enforces shell diagnostics and fallback surfaces

### `HbHomepageShell.module.css`
This is the shell’s physical layout layer.

It currently provides:
- container queries
- shell spacing
- stacked vs paired band modes
- a `3fr / 2fr` paired template at large widths
- slot span classes
- reduced-motion support

### Important limit
The shell caps itself at `max-width: 1440px`, which constrains the full expression of the defined wide-state policy.

## 6. Band and preset model

### Default preset
The default preset is a five-band single-column stack:

1. communications newsroom → Company Pulse
2. communications editorial → Leadership Message
3. operational spotlight → Project Portfolio Spotlight
4. people culture → People & Culture Public
5. recognition → HB Kudos

### Editorial-focus preset
The preset library also includes a more assertive preset that pairs:

- Company Pulse (`major`)
- Leadership Message (`minor`)

in the first band.

### Design implication
The shell is no longer locked to one sequencing model.
But the shipped default still favors caution over flagship hierarchy.

## 7. Occupant capability seams

### Occupant registry
The registry now defines per-occupant metadata including:

- active vs inactive-candidate
- allowed slot roles
- prominence ceiling
- first-lane eligibility
- width comfort values
- pairing restrictions

### Important current state
- Company Pulse and Leadership Message are first-lane eligible
- Project Portfolio Spotlight is **not** first-lane eligible
- People & Culture Public and HB Kudos are explicitly restricted from sharing a band
- Safety Field Excellence exists in the registry but is still inactive-candidate

### Design implication
The shell has the right metadata seam, but some of the current policy choices still reflect older composition assumptions.

## 8. Breakpoint and container seams

### `useShellContainer`
The shell measures its own content box with `ResizeObserver`.

### `breakpointPolicy.ts`
The shell maps width/height to these entry states:

- ultrawide desktop
- standard laptop
- tablet landscape
- tablet portrait large
- tablet portrait
- phone portrait
- phone landscape

### `slotComfortResolver.ts`
The shell decides whether a band can pair based on:
- entry-state rules
- occupant pairability
- per-occupant width thresholds

### Design implication
This is a good architectural foundation for container-aware layout governance.
But the comfort model is still only partially exploited.

## 9. Zone ownership seams

The shell maps occupants to zone wrappers:

- `CompanyPulseZone`
- `LeadershipMessageZone`
- `ProjectPortfolioSpotlightZone`
- `PeopleCulturePublicZone`
- `HbKudosZone`

The zone wrappers are responsible for:
- mounting the child runtime
- supplying the correct config slice
- isolating failures

The shell owns:
- where a zone appears
- what band it belongs to
- whether it is stacked or paired

## 10. Module fit snapshot

### Mature shared-surface consumers
- Company Pulse
- Leadership Message
- Project Portfolio Spotlight
- HB Kudos
- Safety Field Excellence

These are largely thin orchestrators over `@hbc/ui-kit/homepage` surface families.

### Outlier
- People & Culture Public

This still owns its own surface composition locally and uses a large inline-style presentation layer.

## 11. Future-growth seams already present

The codebase already contains real growth seams for a future control-panel direction:

- preset selection
- band overrides
- slot overrides
- protected-vs-configurable boundaries
- inactive candidate occupants
- explicit shell diagnostics

## 12. Future-growth seams still missing

The codebase does **not** yet provide:
- persisted shell layout storage
- a maintainer-facing layout authoring UI
- a shell-wide preview/validation workflow
- occupancy scoring or freshness-aware slot promotion
- a true entry-stack contract spanning hero + actions + first lane
