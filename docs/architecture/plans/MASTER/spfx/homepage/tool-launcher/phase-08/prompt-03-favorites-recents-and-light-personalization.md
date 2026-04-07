# Prompt 03 — Favorites, Recents, and Light Personalization

## Objective

Define and implement the **light personalization posture** for Tool Launcher / Work Hub, limited to favorites and recents only where they are supportable in the current homepage architecture.

## Context you must respect

- This phase is not permission to build a larger personalization platform.
- The launcher is a SharePoint-hosted homepage utility surface, not a standalone application shell.
- Favorites and recents are valuable only if they can be implemented cleanly, predictably, and without brittle persistence assumptions.

## Repo-truth targets

Audit the current launcher, utility rail, overlay/index layer, and any existing local state helpers under:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- related homepage helpers / models under `apps/hb-webparts/src/homepage/`

## Required work

1. Audit whether favorites and recents already have an intended home in the launcher composition.
2. Decide the correct posture for this repo and phase:
   - implement lightweight favorites / recents with local, supportable persistence, or
   - explicitly defer one or both with clear rationale if repo truth or host constraints do not support clean implementation yet
3. If implementing:
   - keep scope intentionally light
   - define stable keys and defensive storage behavior
   - support clean empty states
   - ensure utility rail and/or overlay integration remains secondary to launcher hierarchy
4. If deferring:
   - document the exact blockers and the correct next-phase or future-wave posture
5. Ensure no personalization behavior compromises authoring safety or degraded-state handling.

## Explicit exclusions

- Do not build profile-driven recommendations.
- Do not create cross-device sync or server-backed preference systems.
- Do not broaden into telemetry, ranking engines, or behavior analytics.
- Do not force personalization if the cleanest repo-truth answer is deferral.

## Validation requirements

- prove favorites / recents either work cleanly or are intentionally and explicitly deferred
- prove any persistence behavior fails gracefully
- prove personalization surfaces do not dominate the launcher experience
- document the final posture clearly

## Deliverables

- implemented lightweight favorites / recents behavior or explicit documented deferral
- any necessary local-state helpers
- empty/degraded states for personalization surfaces
- documentation updates capturing the final personalization posture

## Working rules

- repo truth first
- do not re-read files still in current context unless needed
- do not broaden scope
- favor supportable behavior over speculative feature expansion
- preserve launcher hierarchy and authoring safety throughout
