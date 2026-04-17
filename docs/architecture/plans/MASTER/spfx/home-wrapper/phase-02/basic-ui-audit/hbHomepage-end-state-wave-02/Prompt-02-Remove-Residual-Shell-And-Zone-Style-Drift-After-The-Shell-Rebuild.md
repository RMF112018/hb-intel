# Prompt 02 — Remove Residual Shell and Zone Style Drift After the Shell Rebuild

## Objective

After Wave 01 and the shared People & Culture promotion work, tighten any remaining shell/zone drift that still keeps `hbHomepage` from reading as one coherent flagship homepage family.

## Governing authority

Binding:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Benchmark context:
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

## Exact seams to inspect

- updated shell files under `apps/hb-webparts/src/webparts/hbHomepage/`
- updated People & Culture Public files
- any adjusted shared homepage surface families
- homepage CSS modules or helper constants touched by the shell rebuild

## Current future-state gap to close

Even after the structural fixes, the homepage can still miss flagship quality if:
- spacing rhythm is inconsistent
- width logic is unresolved between lanes
- section transitions feel accidental
- local exceptions remain without governance value

## Required implementation outcome

1. Review the composed homepage as a whole, not just per-zone.
2. Remove any remaining spacing, width, or transition drift that weakens the shell’s authorship.
3. Normalize only what improves family symmetry.
4. Preserve persona-fit differences. This is not a homogenization pass.

## Proof of closure

Show:
- what residual drift you found
- what you changed
- why those changes improve family symmetry without flattening zone personas

## Constraints

- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not “normalize” by making all zones visually interchangeable.
- Do not reopen completed architecture work unless the residual drift genuinely requires it.
