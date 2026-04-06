# Phase 01 Hard Reset — Implementation Summary

## Intent

This package directs a full reset of the homepage flagship hero.

The old hero direction is treated as rejected.
The rebuild must produce a new full-width identity surface that includes only:
- logo
- `Build with GRIT.`
- personalized welcome message

## Strategic Outcome

By the end of this phase:

- `HbSignatureHero` is the canonical homepage flagship hero
- legacy split top-band logic is downgraded or hidden
- the hero visual language is rebuilt from zero
- the rejected gradient direction is gone
- the hero uses the full SharePoint full-width section
- only the Signature Hero remains visible in the SharePoint toolbox for this rollout cycle

## Key Risks Addressed

- stale split hero/welcome architecture
- legacy manifest defaults that no longer match implementation
- timid or bottlenecked width usage inside full-width sections
- runtime mismatch between source code and deployed `.sppkg`
- residual gradient-led visual language
- author confusion from multiple visible top-band webparts

## Design Bar

The new hero must read as:
- premium
- quiet
- confident
- contemporary
- composed
- distinctly not a stock SharePoint banner

## Sequence

1. repo-truth teardown and canonical-path lock
2. brand-new hero rebuild
3. manifest/toolbox cleanup
4. SharePoint runtime proof and packaging validation
