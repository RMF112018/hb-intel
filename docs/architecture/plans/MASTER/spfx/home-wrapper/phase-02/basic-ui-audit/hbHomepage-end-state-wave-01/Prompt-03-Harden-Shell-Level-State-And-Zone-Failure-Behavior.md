# Prompt 03 — Harden Shell-Level State and Zone Failure Behavior

## Objective

Eliminate the silent-failure posture in `hbHomepage` and make shell-level degradation benchmark-grade, author-safe, and diagnosable.

## Governing authority

Binding:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Benchmark context:
- `docs/architecture/plans/MASTER/spfx/benchmark/03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/06-Closure-Checklist.md`

## Exact seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/ZoneErrorBoundary.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- any shared homepage empty/error/loading primitives you decide to use or add

## Current future-state gap to close

`ZoneErrorBoundary` currently logs and returns `null`. That is not acceptable for a flagship homepage shell.

It causes:
- invisible content loss
- weak authoring safety
- weak runtime diagnosability
- failure to meet graceful error-state expectations

## Required implementation outcome

1. Replace `null` fallback with a visible, compact, premium, section-safe fallback surface.
2. Make the fallback suitable for real homepage use:
   - readable
   - non-panicked
   - does not destroy page rhythm
   - can identify which zone failed at an appropriate level
3. Ensure shell-level composition remains stable even when one zone fails.
4. Add any minimal metadata hooks needed for testing or runtime diagnosis.
5. Review loading and empty posture at the shell layer and add a shell-level strategy only where it materially improves the composed experience.

## Proof of closure

Show:
- exact fallback behavior before vs after
- the new visible fallback surface
- how shell rhythm survives a failed zone
- any test or runtime hooks added

## Constraints

- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not dump raw stack traces into viewer-facing UI.
- Do not introduce noisy dev-only chrome into normal runtime.
