# HB Webparts Tenant-Shell and Homepage Experience
## Phased Implementation Blueprint

## 1. Objective

This blueprint converts the current `apps/hb-webparts` assessment into a concrete implementation plan for the `hb-intel` repo.

The target outcome is **not** an unsupported attempt to fully replace Microsoft’s modern SharePoint shell. The target is:

- **maximum supported tenant-shell influence**
- **premium homepage and page-canvas ownership**
- **professionally polished HB-branded webparts**
- **clear repo/package boundaries**
- **production-safe packaging, governance, and rollout**

This plan assumes the current `apps/hb-webparts` package remains the primary homepage and branded webpart surface, while a new shell-extension package is added for supported cross-page shell behaviors.

---

## 2. Strategic End State

### 2.1 End-state experience goals
The repo should ultimately support:

- a premium HB Central homepage
- full-width editorial hero experiences
- personalized greeting and welcome layer
- premium utility launchers and action rails
- curated company pulse, safety, leadership, people, and project spotlight surfaces
- supported cross-page shell extensions such as:
  - top utility ribbon
  - high-priority alert band
  - premium footer / support rail
- governance-aligned navigation and branding across SharePoint

### 2.2 Hard boundary
Do **not** treat “full tenant shell control” as a production objective if that means replacing or suppressing Microsoft’s modern shell through unsupported DOM/CSS takeover patterns.

Production objective:
- own the **page canvas**
- extend the **supported placeholder shell regions**
- align with **home site / global nav / hub branding**
- avoid fragile shell hacks as a baseline architecture

---

## 3. Current-State Summary

## 3.1 What the current repo already has
`apps/hb-webparts` already contains the right directional homepage product model:

- personalized welcome header
- hero banner
- priority actions rail

> **Phase 18-01 addendum:** For flagship homepage top-band composition, the personalized welcome header and hero banner are now unified into a single `HbSignatureHero` component. The standalone webparts remain available for non-flagship placement.
- tool launcher / work hub
- company pulse
- leadership message
- people and culture
- project / portfolio spotlight
- safety / field excellence
- smart search / wayfinding

It also already includes:
- shared homepage helpers
- normalization / authoring governance seams
- a reference homepage composition
- greeting logic based on time-of-day and user identity

## 3.2 What it is missing
The current app is **not yet** a true tenant-shell extension architecture.

Gaps include:

- no clearly separated shell-extension package
- no production-grade Application Customizer lane
- no finalized full-width hero rollout strategy
- no fully mature premium visual system across all homepage surfaces
- no formal governance implementation layer for content ownership, freshness, and configuration
- packaging complexity due to a custom shared-mount / single-bundle runtime pattern

## 3.3 Core repo truth
The current state should be treated as:
- a **homepage webpart scaffold**
- a **shared primitive foundation**
- a **proof-stage packaging/runtime model**

It should **not** yet be treated as:
- a finished homepage system
- a finished shell-control system
- a finished multi-package SharePoint experience framework

---

## 4. Architecture Decision

## 4.1 Required repo split
Implement the experience through **three distinct lanes**:

### Lane A — Homepage / page-canvas product
Package:
- `apps/hb-webparts`

Purpose:
- all homepage and branded page-canvas webparts
- full-width hero experience
- personalized greeting and welcome header
- operational and editorial homepage zones

### Lane B — Shell extension product
New package:
- `apps/hb-shell-extension`

Purpose:
- supported shell-adjacent rendering through SPFx extensions
- top placeholder ribbon
- alert / notification band
- bottom placeholder footer / support rail
- optional contextual page utilities

### Lane C — Navigation / governance / rollout layer
Repo docs + config + release process

Purpose:
- home site strategy
- hub branding strategy
- global navigation architecture
- page template definitions
- content ownership model
- stale-content governance
- rollout standards

## 4.2 Optional non-production lane
Only if leadership insists on testing deeper shell manipulation:

New package:
- `apps/hb-shell-lab`

Purpose:
- isolated, non-production experiments
- feature-flagged DOM/CSS shell override prototypes
- demo-only exploration

This package should never become the production baseline.

---

## 5. Recommended Repo Structure

```text
apps/
  hb-webparts/
    config/
    src/
      homepage/
      webparts/
      shared/
      property-panes/
      data/
      entrypoints/
    docs/
      authoring/
      packaging/
      acceptance/

  hb-shell-extension/
    config/
    src/
      extensions/
        hbGlobalTopRibbon/
        hbPriorityAlertBand/
        hbFooterRail/
      shared/
      services/
      styles/
    docs/
      placeholders/
      activation/
      acceptance/

  hb-shell-lab/                 # optional, non-production only
    config/
    src/
      experiments/
    docs/

docs/
  architecture/
    plans/
      MASTER/
        spfx/
          homepage/
          shell-extension/
    standards/
      sharepoint-branding/
      homepage-authoring/
      navigation-governance/
```

---

## 6. Phased Implementation Plan

# Phase 0 — Blueprint Lock and Architectural Guardrails

## Objective
Freeze the target architecture and prevent the team from pursuing unsupported shell-replacement patterns as the primary implementation path.

## Scope
- approve package boundaries
- approve supported-vs-unsupported policy
- document end-state architecture
- define delivery sequence and ownership

## Repo actions
- create `docs/architecture/plans/MASTER/spfx/homepage/`
- create `docs/architecture/plans/MASTER/spfx/shell-extension/`
- create blueprint docs for:
  - package boundaries
  - supported shell influence
  - non-production shell-lab rules
- update root architecture docs to reference the split

## Deliverables
- architecture decision record for homepage vs shell-extension split
- implementation roadmap
- supported customization policy

## Acceptance criteria
- no repo ambiguity about where homepage logic belongs
- no repo ambiguity about where shell logic belongs
- explicit written prohibition on unsupported shell takeover as production baseline

---

# Phase 1 — Stabilize `apps/hb-webparts` as the Homepage Product

## Objective
Convert `apps/hb-webparts` from a scaffold/proof bundle into a clearly bounded homepage webpart product.

## Scope
- remove conceptual overlap with shell-control concerns
- formalize the homepage package as the page-canvas lane
- define webpart responsibilities and data contracts
- preserve or refactor shared runtime patterns only where justified

## Repo actions
- document each homepage webpart’s purpose, inputs, fallback behavior, and owner
- create `src/entrypoints/` if missing and separate webpart entry responsibility clearly
- audit the shared-mount pattern and decide whether to:
  - keep it with stronger contract tests, or
  - split into clearer per-surface packaging paths
- add acceptance docs for each webpart

## Required work items
- finalize naming for all homepage surfaces
- define config schemas for all authorable modules
- define loading / empty / stale / error states consistently
- ensure identity + greeting logic is reusable and production-safe
- add full authoring-state coverage

## Deliverables
- stabilized homepage package architecture
- homepage component inventory
- per-webpart contract documentation
- acceptance checklist

## Acceptance criteria
- every homepage webpart has:
  - a defined purpose
  - explicit config contract
  - authoring empty state
  - stale/freshness behavior
  - fallback behavior
- no shell-extension responsibilities remain inside homepage scope

---

# Phase 2 — Build Premium Design Foundations

## Objective
Elevate the current scaffold-level presentation into a polished premium HB design system for homepage surfaces.

## Scope
- upgrade layout quality
- standardize spacing, typography, and motion
- improve image treatment and hierarchy
- move away from basic inline styling toward a stronger visual framework

## Repo actions
- expand `@hbc/ui-kit` usage or extend homepage-specific primitives
- create homepage design tokens for:
  - spacing
  - typography
  - radius
  - elevation
  - overlays
  - content density
  - motion
- replace ad hoc inline styling with reusable compositional primitives
- define card families and zone-specific variants

## Design implementation targets
- premium editorial top band
- compact high-density utility surfaces
- elegant content cards
- polished CTA treatments
- consistent hover/focus states
- branded loading skeletons
- accessible contrast and keyboard states

## Deliverables
- homepage design token map
- homepage visual language guide
- upgraded webpart styling pass
- shared compositional primitives

## Acceptance criteria
- homepage no longer reads as scaffold/demo quality
- greeting and hero feel premium and first-class
- all surfaces share a coherent HB visual language
- there is no uncontrolled style drift across webparts

---

# Phase 3 — Implement the Full-Width Homepage Composition

## Objective
Assemble the homepage into a true authored experience instead of a loose set of widgets.

## Scope
- define exact homepage zone structure
- enable full-width hero capability where appropriate
- create production-grade layout composition
- align with the design brief and reference visual direction

## Repo actions
- add or confirm `supportsFullBleed` where hero surfaces require it
- formalize a homepage composition contract
- create a production homepage composition entry
- define exact homepage bands:
  - top band
  - quick-use / work zone
  - awareness zone
  - operational intelligence zone
  - discovery zone

## Required homepage layout targets
- left/right or stacked welcome + hero composition
- premium top-band layering
- quick-actions rail or work hub under hero
- curated awareness and spotlight zones
- compact lower discovery/wayfinding zone

## Deliverables
- production homepage composition
- homepage zone specification
- communication-site layout instructions
- full-width hero implementation

## Acceptance criteria
- homepage reads as a deliberate product experience
- top band is visually dominant and composed
- users can identify where to go, what matters now, and what changed within seconds
- page no longer feels like “SharePoint with nicer cards”

---

# Phase 4 — Create `apps/hb-shell-extension`

## Objective
Add a dedicated supported shell-extension package using SPFx Extensions and Application Customizers.

## Scope
- top placeholder rendering
- bottom placeholder rendering
- persistent alert / utility treatment
- cross-page shell-adjacent behaviors

## Repo actions
- create `apps/hb-shell-extension`
- scaffold SPFx extension architecture
- add extension modules for:
  - `hbGlobalTopRibbon`
  - `hbPriorityAlertBand`
  - `hbFooterRail`
- add shared shell services for:
  - activation rules
  - placeholder detection
  - layout shift mitigation
  - configuration loading

## Implementation priorities
1. top utility ribbon
2. high-priority alert band
3. bottom footer / support rail

## Deliverables
- separate shell-extension package
- extension activation model
- tenant/site deployment guidance
- acceptance checklist for supported placeholder rendering

## Acceptance criteria
- shell-adjacent features no longer depend on page webparts
- top and bottom placeholders render predictably
- shell extensions degrade gracefully if placeholders are absent
- no unsupported shell DOM takeover is required for the production baseline

---

# Phase 5 — Navigation, Home Site, and Branding Governance

## Objective
Use SharePoint’s supported navigation and branding model to reinforce the premium experience across the tenant.

## Scope
- home site architecture
- global navigation
- hub branding
- site theming and page template rules

## Repo actions
- author `navigation-governance.md`
- author `home-site-strategy.md`
- author `hub-branding-rules.md`
- define global navigation information architecture
- define when homepage experience patterns may be reused on downstream sites

## Required governance outputs
- nav taxonomy
- menu ownership
- homepage-to-subsite hierarchy
- allowed page templates
- header/footer usage rules
- hero usage rules
- image and content standards

## Deliverables
- tenant navigation model
- branding governance package
- page template and layout rules
- content ownership map

## Acceptance criteria
- navigation is not left to ad hoc site owners
- homepage branding patterns scale consistently
- app bar / home site / hub choices are coordinated rather than improvised

---

# Phase 6 — Data, Authoring, and Content Governance

## Objective
Ensure the homepage operates as a governed internal product, not just a visually strong static page.

## Scope
- authoring model
- content freshness
- ownership
- approvals
- fallback behaviors
- admin and communications workflows

## Repo actions
- define source-of-truth for each homepage module
- define ownership for:
  - leadership messages
  - pulse content
  - spotlight projects
  - people/culture updates
  - safety notices
  - quick actions
- add stale-content detection and empty-state governance
- add administrative configuration docs and safe defaults

## Deliverables
- homepage content operating model
- freshness policy
- ownership matrix
- module-by-module publishing workflow

## Acceptance criteria
- every homepage zone has an owner
- stale content is visibly controlled
- empty states are intentional and professional
- homepage can be maintained without code edits for routine updates

---

# Phase 7 — Packaging, Performance, and Build Hardening

## Objective
Harden packaging, release, and runtime behavior for production.

## Scope
- review the current Vite-based packaging posture
- validate loader contracts
- reduce coupling risk
- formalize release checks

## Repo actions
- audit whether the single shared bundle / dispatch model should remain
- if retained:
  - add loader-contract tests
  - add manifest-to-entry validation
  - add bundle integrity checks
- if split:
  - move to cleaner per-surface outputs
- document packaging rationale
- add build and release validation docs

## Required evaluation questions
- is the current custom packaging model the right long-term production posture?
- does it introduce avoidable operational risk?
- should homepage proof-case logic remain in the production package?
- should shell-extension packaging use a separate, more conventional path?

## Deliverables
- packaging decision record
- release validation checklist
- performance budget
- runtime integrity tests

## Acceptance criteria
- production build behavior is predictable
- package integrity is testable
- webpart and extension deployment paths are clearly documented
- performance, asset loading, and authoring-time rendering are stable

---

# Phase 8 — Accessibility, QA, and Production Readiness

## Objective
Complete the experience to enterprise quality.

## Scope
- accessibility
- responsiveness
- reduced motion
- keyboard operation
- authoring-mode QA
- performance and browser testing

## Repo actions
- add accessibility acceptance criteria for each surface
- verify contrast, focus, semantics, and motion handling
- test communication-site full-width behavior
- test placeholder extension behavior across supported modern page types
- document known limits and non-goals

## Deliverables
- accessibility report
- QA report
- production readiness checklist
- rollout playbook

## Acceptance criteria
- homepage passes accessibility and usability checks
- shell extensions behave safely across target pages
- known limitations are documented
- rollout can proceed without architecture ambiguity

---

## 7. Implementation Sequencing Recommendation

Recommended sequence:

1. Phase 0 — blueprint lock  
2. Phase 1 — homepage package stabilization  
3. Phase 2 — design foundation upgrade  
4. Phase 3 — homepage composition implementation  
5. Phase 4 — shell-extension package implementation  
6. Phase 5 — navigation and branding governance  
7. Phase 6 — authoring and content governance  
8. Phase 7 — packaging hardening  
9. Phase 8 — QA and readiness  

### Why this order
- the team first needs architecture clarity
- then the homepage package must be stabilized before polish
- the homepage should become visibly premium before shell work expands
- shell extensions should be added as a separate product lane after boundaries are locked
- packaging hardening should happen after the actual architecture is in place

---

## 8. Workstream Ownership Model

## 8.1 Engineering
Own:
- package split
- SPFx implementation
- build and runtime hardening
- extension architecture
- performance and QA automation

## 8.2 Design / UX
Own:
- homepage hierarchy
- visual system
- motion discipline
- component composition
- accessibility-informed presentation

## 8.3 Communications / Content Owners
Own:
- pulse content
- leadership content
- people/culture updates
- publishing standards
- editorial governance

## 8.4 Platform / IT
Own:
- deployment and tenant activation
- home site and hub setup
- navigation governance
- release controls
- environment configuration

---

## 9. Non-Negotiable Guardrails

- Do not use unsupported shell DOM hacks as the primary production architecture.
- Do not blur homepage package responsibilities with shell-extension responsibilities.
- Do not allow the homepage to become a dumping ground of unrelated widgets.
- Do not sacrifice maintainability for demo-only visual tricks.
- Do not permit content governance to remain undefined.
- Do not ship premium visuals without accessibility and performance validation.

---

## 10. Definition of Success

The repo implementation is successful when:

- `apps/hb-webparts` is a polished, production-grade homepage and branded webpart system
- `apps/hb-shell-extension` provides supported, stable shell-adjacent influence
- the homepage feels meaningfully more refined than default SharePoint
- the user experience aligns with the HB design brief
- the architecture is maintainable, governed, and production-safe
- HB no longer needs to buy a third-party intranet design layer to achieve a premium SharePoint experience

---

## 11. Immediate Next-Step Package

The next practical execution package should produce:

1. a repo architecture decision record  
2. a shell-extension package scaffold  
3. a homepage product boundary document for `apps/hb-webparts`  
4. a homepage visual-system implementation plan  
5. a packaging decision audit for the current Vite/shared-mount model  

Recommended immediate implementation sprint:
- Phase 0
- Phase 1
- Phase 2 planning
- shell-extension scaffold preparation

---

## 12. Suggested Follow-On Deliverables

After approval of this blueprint, generate:

- `Phase-00-Architecture-Lock.md`
- `Phase-01-Homepage-Product-Stabilization.md`
- `Phase-02-Homepage-Design-System-Upgrade.md`
- `Phase-03-Homepage-Composition-Implementation.md`
- `Phase-04-Shell-Extension-Package.md`
- `Phase-05-Navigation-and-Branding-Governance.md`
- `Phase-06-Authoring-and-Content-Governance.md`
- `Phase-07-Packaging-and-Performance-Hardening.md`
- `Phase-08-QA-and-Production-Readiness.md`

These can then be converted into code-agent prompt packages if needed.
