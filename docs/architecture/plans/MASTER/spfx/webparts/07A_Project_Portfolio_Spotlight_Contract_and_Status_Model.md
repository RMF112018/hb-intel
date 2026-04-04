# 07A — Project / Portfolio Spotlight Contract and Status Model

## Purpose

Lock Prompt-07 project/portfolio spotlight behavior so downstream prompts consume one operational-awareness hierarchy and status contract.

## Contract Surface

- Webpart module: `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/`
- Manifest baseline: `ProjectPortfolioSpotlightWebPart.manifest.json`
- Config contract: `ProjectPortfolioSpotlightConfig`
- Normalization seam: `normalizeProjectPortfolioSpotlightConfig`

## Hierarchy and Status Model

- Spotlight content is curated into one featured item plus bounded secondary items.
- Featured item supports optional strategic emphasis, status signal, milestone list, and CTA.
- Secondary items remain concise while preserving status/freshness semantics.
- Optional audience filtering is applied before hierarchy shaping.

## Freshness, Fallback, and Ownership

- Freshness metadata supports curated/live signal origin, update timestamps, and expiry.
- Stale or expired signals are explicitly surfaced through stale-label semantics instead of silent omission.
- Missing or malformed project spotlight content renders explicit empty-state guidance.
- Site owners maintain authored project items; `hb-webparts` maintainers own normalization, stale detection, and rendering guardrails.
