# Phase Implementation Plan Summary — Origami-Grade Homepage Reset

## Objective

Execute a forceful, product-grade redesign of HB Central’s SharePoint homepage and shell experience using the live repo as source of truth, with the explicit goal of reaching a premium purchased-product standard rather than a competent internal custom build.

## Current-State Position

The current rendered state shows these failures:

- surface sameness across nearly all webparts
- weak hierarchy
- generic card-heavy composition
- a hero that is large but not commanding
- a welcome surface that is conceptually correct but visually ordinary
- utility and launcher surfaces that read as scaffolding
- discovery that feels like a standard search box inside a card
- editorial modules that feel tidy but not authored
- operational modules that are informative but visually flat
- shell and homepage that do not yet read as one product

## Non-Negotiable Principles

- The current visual system is not to be protected.
- Weak card patterns may be removed, replaced, or fundamentally rebuilt.
- The redesign must push beyond “good internal app” into “premium intranet product.”
- Technical conservatism must not be allowed to suppress visual ambition.
- Changes must still respect SPFx runtime reality.

## Phase Order

### Phase 1 — Benchmark and Direction Lock
Establish the premium quality bar, concrete reference behaviors, anti-patterns, and design criteria.

### Phase 2 — Shared Surface System Rebuild
Rework `@hbc/ui-kit` and homepage primitives so the rest of the homepage is not trapped inside the current weak surface model.

### Phase 3 — Shell Re-Authoring
Make Lane B feel like a real shell layer that supports the homepage instead of a technical placeholder strip.

### Phase 4 — Signature Top Band
Redesign the welcome header and hero together as the homepage’s signature opening sequence.

### Phase 5 — Command and Utility Surfaces
Rebuild Priority Actions and adjacent utility surfaces into sharper, more premium command modules.

### Phase 6 — Discovery and Launcher
Turn search, quick paths, and launcher behavior into a premium discovery product.

### Phase 7 — Communications Surfaces
Rebuild Company Pulse, Leadership Message, and People and Culture into authored editorial modules.

### Phase 8 — Operational Surfaces
Rebuild Project / Portfolio Spotlight and Safety / Field Excellence into higher-credibility operational modules.

### Phase 9 — Full-Page Closure
Resolve composition, rhythm, spacing, responsiveness, focus, motion, documentation, and final visual QA.

## Deliverables Per Phase

Each phase must end with:

- implemented code changes
- any necessary shared primitive additions/refactors
- updated docs where relevant
- validation notes
- before/after screenshots or equivalent visual proof
- a short closure note stating what materially changed in perceived quality

## Hard Validation Gates

No phase is complete if:

- the new UI still looks like standard white cards with minor variation
- the top band still feels generic
- launcher/discovery still feels list-like
- editorial and operational surfaces still feel interchangeable
- shell and homepage still feel disconnected
- the work improves neatness without changing perception
