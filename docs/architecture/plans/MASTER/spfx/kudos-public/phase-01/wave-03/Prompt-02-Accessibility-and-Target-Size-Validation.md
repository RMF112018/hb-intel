# Prompt-02-Accessibility-and-Target-Size-Validation

## Objective
Validate and harden hbKudos accessibility after the redesign, with explicit attention to compact-mode interaction quality.

## Standards / Best Practices
- WCAG 2.2 target size minimum
- focus-visible consistency
- keyboard reachability
- reduced-motion respect
- semantic shell correctness

## Inspect exactly
- `PublicKudosSurface.tsx`
- `ArchiveList.tsx`
- `KudosArticleReader.tsx`
- relevant CSS modules and shell primitives

## Required implementation outcome
- confirm critical controls meet or exceed minimum touch-target expectations
- confirm focus order remains sensible after redesign
- confirm no important meaning depends on hover
- tighten any residual compact-mode accessibility issues

## Proof of closure
Provide:
- target-size notes for primary controls
- keyboard/focus verification notes
- any code changes required to close gaps
