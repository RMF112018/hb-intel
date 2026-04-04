# 08A — Smart Search / Wayfinding Strategy and Contract

## Purpose

Lock Prompt-08 discovery behavior so downstream prompts consume one curated-first smart search and wayfinding contract.

## Strategy (Release 1)

- Discovery is curated-first with local search filtering over trusted authored resources.
- Quick paths and promoted destinations are first-class discovery surfaces, not secondary links.
- Advanced search intelligence is intentionally deferred; enhancement seams remain explicit in strategy metadata.
- Homepage lane remains lightweight standalone with no routed app-shell behavior.

## Contract Surface

- Webpart module: `apps/hb-webparts/src/webparts/smartSearchWayfinding/`
- Manifest baseline: `SmartSearchWayfindingWebPart.manifest.json`
- Config contract: `SmartSearchWayfindingConfig`
- Normalization seam: `normalizeSmartSearchWayfindingConfig`

## Ownership and Fallback

- Site owners/content stewards maintain categories, resources, quick paths, promoted destinations, and ordering.
- `hb-webparts` maintainers own normalization, query matching, and fallback semantics.
- Malformed/partial discovery configuration always degrades to explicit empty/no-result guidance.
