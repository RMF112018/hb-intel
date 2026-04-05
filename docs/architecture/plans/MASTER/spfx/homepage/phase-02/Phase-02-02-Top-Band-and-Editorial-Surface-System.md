# Phase 02-02 — Top-Band and Editorial Surface System

## Objective

Turn the homepage’s most visible surfaces into a premium editorial system:
- top-band pair
- communications cards
- operational spotlight cards
- utility/action CTA emphasis

This prompt should transform the homepage from “contract-complete” to “visually authored.”

## Required pre-read

Before making changes, read:
- Phase 02-01 output
- all Phase 01 completion notes
- `Homepage-Product-Boundary.md`
- `Homepage-Per-Webpart-Contract-Reference.md`
- `Homepage-Shared-Seam-Taxonomy.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/blueprint/sharepoint-shell/Hedrick_Brothers_SharePoint_Homepage_Design_Brief.md`

Do not re-read files that are already in your current context window or memory unless they changed or you need exact wording for a targeted edit.

## Repo-truth findings this prompt must honor

- The top-band pair has intentional asymmetry: the Welcome Header is synchronous and system-generated; Hero Banner is author-driven and can present true empty states.
- Only Smart Search has `noResults`; only operational-awareness surfaces handle stale-state display.
- Zone-specific visual variation is allowed and expected under the homepage overlay doctrine.
- Phase 01 documented `ReferenceHomepageComposition` as a dev/integration utility, not the production homepage layout spec.

## Implementation target

Create a premium editorial surface system that gives the homepage visible hierarchy and zone identity while preserving independent webpart rendering.

## Work scope

### 1. Upgrade the top-band pair
The Personalized Welcome Header and HB Hero Banner must feel premium, branded, and first-class.

Targets:
- greeting hierarchy that feels intentional and signature-level
- stronger support-line/context-line styling
- alert presentation that feels integrated, not bolted on
- premium hero spacing, layering, CTA treatment, and metadata styling
- improved relationship between welcome and hero when shown together in the reference composition

Respect the documented asymmetry:
- Welcome Header should still always render safely
- Hero Banner should still preserve authoring-state empty behavior

### 2. Define editorial card families
Create a consistent editorial card system across:
- Company Pulse
- Leadership Message
- People & Culture
- Project / Portfolio Spotlight
- Safety & Field Excellence

You may use local homepage primitives and/or light homepage-specific wrappers, but preserve package boundaries.

Targets:
- clear featured vs secondary hierarchy
- disciplined metadata presentation
- consistent CTA emphasis
- cleaner badge/status placement
- improved scanning and whitespace management
- visibly different but harmonious communications vs operational card language

### 3. Upgrade utility surface treatment
Utility surfaces should feel denser and more intentional without becoming noisy.

Targets:
- compact but premium utility tiles
- better action affordance
- stronger grouping language
- consistent badge/indicator placement
- more deliberate hover/focus behavior

### 4. Reduce generic-card sameness
The homepage should not feel like “10 `HbcCard`s with minor differences.”
Use the primitive family and homepage tokens to create controlled differentiation by zone.

### 5. Use the reference composition as a visual integration harness
Improve `ReferenceHomepageComposition` enough that it acts as a meaningful design-system preview for the homepage lane.
Do not promote it into a production homepage layout surface in this prompt.

## Deliverables

Create or update, at minimum:
- upgraded top-band pair implementation
- upgraded editorial and utility surface implementations
- any new local homepage shared primitives needed for premium card families
- completion note for this prompt
- optional visual-language reference doc if needed to preserve decisions

Recommended docs:
- `docs/architecture/plans/MASTER/spfx/homepage/phase-02/Homepage-Visual-Language-Guide.md`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-02/Phase-02-02-Completion-Note.md`

## Acceptance criteria

- top-band surfaces feel premium and unmistakably authored
- featured vs secondary hierarchy is visually obvious
- utility surfaces feel dense, usable, and polished
- communications and operational cards no longer feel interchangeable
- reference composition reads as a coherent homepage design preview
- no Phase 01 contract behavior regresses

## Verification

Run and report:
- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts test`
- `pnpm --filter @hbc/spfx-hb-webparts build`

## Final response format

Return:
1. what changed in the visual system
2. exact files changed
3. docs created or updated
4. verification results
5. remaining risks deferred to Prompt 02-03
