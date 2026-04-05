# Phase Implementation Plan Summary — HB Central Homepage UI Reset

## Objective

Execute a forceful, phase-based UI reset of the HB Central SharePoint homepage so the rendered experience no longer feels like a collection of generic cards inside SharePoint. The end state should read as a cohesive premium product with a deliberate shell, a signature top band, differentiated surface classes, stronger utility/discovery posture, and materially improved hierarchy.

## Strategic Diagnosis

The current implementation has decent structural discipline but the rendered UI is visually underpowered:

- too many surfaces collapse into the same white bordered card language
- the hero has scale but not authority
- the welcome experience has the right idea but weak execution
- utility and launcher surfaces read like scaffolding
- editorial and operational modules are semantically correct but visually timid
- discovery is strategically important and currently too plain
- the shell-extension layer does not yet elevate the page

The required response is a **hard reset of the visual system**, not an incremental polish pass.

## Phase Structure

### Phase 1 — Shared Surface System Reset
Rebuild the shared homepage surface model, strengthen typography, introduce clearer surface differentiation, harden CTA/icon/badge standards, and move premium-authoring primitives into `@hbc/ui-kit`.

### Phase 2 — Lane B Shell-Extension Premiumization
Turn the current placeholder scaffolding into a premium, restrained shell layer that complements rather than weakens the homepage.

### Phase 3 — Top-Band Hard Reset
Rebuild the welcome header and hero as a single authored opening sequence that creates a signature first impression.

### Phase 4 — Utility Command Surfaces Reset
Rebuild Priority Actions and related command surfaces so they feel operationally urgent and visually premium.

### Phase 5 — Discovery and Launcher Redesign
Rebuild Tool Launcher / Work Hub and Smart Search / Wayfinding as high-value premium utility/discovery systems.

### Phase 6 — Communications Surfaces Redesign
Rebuild Company Pulse, Leadership Message, and People & Culture with stronger editorial and human-centered visual hierarchy.

### Phase 7 — Operational Surfaces Redesign
Rebuild Project / Portfolio Spotlight and Safety & Field Excellence so they read as differentiated operational intelligence surfaces.

### Phase 8 — Composition, Integration, and Final Polish
Recompose the full page, eliminate rhythm and hierarchy failures, validate SharePoint-hosted behavior, and update docs.

## Hard Gates

- no single-surface redesign may remain visually interchangeable with the others
- no initials-as-icon placeholders may survive in premium launcher or utility experiences
- no hero may remain a large empty gradient box with a button
- no “just add border/shadow/radius” pseudo-fix is acceptable
- no shell placeholder may render as generic strips or technical scaffolding
- all improvements must remain within supported SharePoint and SPFx runtime boundaries

## Risk Exposure

- overly local homepage fixes without shared primitive upgrades will recreate inconsistency
- aggressive redesign without packaging validation can reintroduce SPFx loader regressions
- if the shell is redesigned last, the page may still feel disconnected at the top
- if discovery/launcher remain weak, the page may still feel like a brochure rather than a work surface

## Standards / Best Practices

- support only realistic SPFx placeholder behavior
- preserve visible focus and reduced-motion compliance
- keep the SharePoint host cooperative while still clearly authored
- promote reusable premium primitives into `@hbc/ui-kit` rather than burying them locally
- validate actual rendered output instead of trusting code intent
