# Prompt-04 — Capture the Reusable Rollout Pattern and Stop

## Objective

After the `HbHeroBannerWebPart` proof case is validated, capture the exact reusable engineering pattern needed to migrate the remaining `hb-webparts` away from the shim model, without implementing that full rollout yet.

## Required operating rules

- Do not re-read files that are already in your active context or memory. Only open additional files when required to verify a dependency, inspect a touched surface, or resolve uncertainty.
- Do not broaden into full multi-webpart rollout implementation in this prompt.
- Keep this as a handoff-quality engineering pattern and backlog definition.

## Required deliverables

Produce a markdown handoff note that covers:

1. the final proof-case architecture
2. the exact shim-era mechanisms eliminated
3. the exact pattern required to migrate each remaining webpart
4. whether the preferred scale-out model is:
   - one real compiled shell surface per webpart, or
   - another first-class approach supported natively by SPFx
5. the file and build-system changes that would be repeated for each remaining webpart
6. the order in which the remaining webparts should be migrated
7. which issues should remain deferred because they are not part of the loader-contract rollout

## Required migration-order recommendation

Unless repo truth exposes a stronger order, recommend a rollout sequence based on lowest complexity first, not homepage-importance first.

The note must explicitly identify:

- low-risk next webparts
- medium-risk webparts
- webparts that should stay deferred until after the direct-loader pattern is proven stable

## Acceptance criteria

This prompt is complete only when the remaining rollout can be executed later **without rediscovering the proof-case architecture from scratch**.
