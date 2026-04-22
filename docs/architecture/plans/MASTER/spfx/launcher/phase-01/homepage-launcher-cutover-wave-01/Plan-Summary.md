# Plan Summary — Wave 01

## Objective
Close the biggest structural gaps preventing the dedicated launcher cutover from being fully authoritative and doctrine-clean.

## Work order
1. Retire or quarantine the legacy launcher family so the repo has one obvious flagship launcher authority.
2. Align version and description truth across package/runtime/manifest seams.
3. Refactor the dedicated package styling model so it is less raw-CSS-heavy and more governed.

## Rules
- Preserve the real dedicated package cutover.
- Do not re-open unrelated homepage shell work.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Proof of closure is required for each step.
