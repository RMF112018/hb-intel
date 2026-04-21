# Plan Summary — Wave 01

## Objective

Execute a focused closure wave on the current Project Portfolio Spotlight so it moves materially closer to strict doctrine compliance without losing the strong architecture already present.

## Required posture

- Treat the current live `main` branch as source of truth.
- Preserve the thin SPFx wrapper + ui-kit surface split.
- Preserve the explicit `wide` / `medium` / `compact` / `minimal` layout model.
- Preserve explicit disclosure for spotlight details and past spotlights.
- Do **not** regress the current Spotlight into a generic card or always-open content surface.

## Governing authority

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/spfx-surfaces/benchmark/`
4. Attached Project Portfolio Spotlight audit package for the current gap register

## Mandatory agent rule

Do not re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Closure standard

Wave 01 is complete only when:

- compact/minimal states are more selective by default
- Unicode pseudo-icons are gone
- Spotlight runtime errors render a distinct professional state
- initial mode behavior no longer causes obvious wide-first posture drift
- CTA hierarchy is cleaner and mode-aware
- proof is supplied with exact files changed, tests run, and before/after behavior notes
