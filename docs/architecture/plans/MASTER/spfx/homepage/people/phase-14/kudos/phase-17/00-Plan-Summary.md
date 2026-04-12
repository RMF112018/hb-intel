# 00 — Plan Summary

## Objective

Reduce **public-surface vertical mass and hosted overflow pressure** at desktop 100% zoom while preserving the premium hero/featured composition and keeping the webpart aligned with `@hbc/ui-kit` guidance.

## Current judgment

The current public Kudos webpart is not a teardown candidate. The concept is working.

The issue is more specific:
- the masthead zone is still too tall at 100% zoom,
- the featured card still holds too much vertical territory relative to the homepage viewport budget,
- recent recognition begins later than it should,
- archive/browse continuation is correct but not compact enough to offset the top-heavy opening composition,
- hosted bottom-right obstruction risk remains a real layout concern.

## Required outcome

At desktop 100% zoom, the opening viewport should credibly show:
- the hero CTA row,
- the full featured recognition card,
- and the beginning of recent recognition,

without the webpart feeling cramped, clipped, or host-conflicted.

## Strategic direction

Do not redesign the surface.
Do not flatten the emotional tone.
Do not apply arbitrary blanket shrinkage.

Instead:
1. trim the masthead,
2. shorten the featured-card footprint,
3. improve below-the-fold signal,
4. harden hosted safe zones,
5. verify all changes through the Playwright webparts lane.

## Workstreams

### Workstream A — Masthead and featured-zone compaction
Target:
- reduce top vertical footprint,
- preserve hierarchy,
- preserve premium composition.

### Workstream B — Subordinate-zone rebalance
Target:
- make recent/archive/feed continue the tightened visual rhythm,
- ensure lower zones are not left oversized after hero/featured compaction,
- maintain authored continuity across all affected public-surface areas.

### Workstream C — Hosted overflow hardening
Target:
- protect against SharePoint top chrome pressure,
- reserve bottom-right assistant-overlay safe zone,
- confirm 100% zoom behavior at supported widths.

### Workstream D — UI-kit and seam conformance
Target:
- implement changes in the correct ui-kit / homepage-variant seams,
- avoid accidental local override sprawl,
- ensure all affected elements are adjusted as one system.

### Workstream E — Harness closure
Target:
- prove 100% zoom, 90% zoom, reduced-width, and mobile-hosted behavior,
- add/update locators and assertions where needed,
- prohibit closure without visual + interaction proof.
