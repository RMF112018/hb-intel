# Plan Summary

## Objective

Close the Publisher backend / workflow defects identified in the audit one issue at a time, in the exact order required to restore correctness without introducing unrelated drift.

## Sequence

1. Resolve stale template lifecycle behavior.
2. Scope out or complete the milestone path.
3. Rework promotion-rule defaults and override policy behavior.
4. Close or intentionally remove the stranded scheduled branch.
5. Isolate unsupported destinations from the current Project Spotlight-only surface.

## Rules for Every Prompt

- Work in the live local repo only.
- Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Conduct an exhaustive scrub of the affected seam before editing.
- Make no unrelated changes.
- Prove closure with concrete file-level evidence, validation notes, and any necessary closure docs.
