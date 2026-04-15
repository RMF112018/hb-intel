# Wave 01 Validation Strategy

Every prompt in this package must be closed with **repo-truth evidence**, not subjective claims.

## Universal validation requirements

For each prompt:

1. Build a precise before/after description of the affected seam.
2. Confirm referenced files and symbols still exist as expected before editing.
3. Validate the affected behavior in the running Publisher surface.
4. Run targeted tests where they already exist or where the prompt explicitly requires them.
5. Add or update tests when the prompt changes a governed helper, invariant, or accessibility-critical interaction.
6. Produce the required closure note before moving on.

## Prompt-specific closure expectations

### Prompt 01
Validate:
- empty state
- selected draft state
- medium-width state
- narrow-width state
- blocking-readiness state
- warnings-present state

### Prompt 02
Validate:
- shell, rails, panels, notices, chips, inputs, and action groups share one coherent surface vocabulary
- stale / dead visual classes introduced by earlier iterations are removed or justified
- feature-local CSS does not reintroduce hardcoded duplicates unnecessarily

### Prompt 03
Validate:
- pseudo-icons are removed from the audited surfaces
- icon-only buttons have reliable accessible names
- toolbar interaction is keyboard-credible and visibly focus-safe
- avatar treatment is materially more trustworthy where photos exist and degrades cleanly where they do not

### Prompt 04
Validate:
- authors can tell what will happen on publish faster than before
- blockers, warnings, and publish action intent are easier to map to the authoring canvas and preview
- diagnostics remain available without dominating the editorial preview

### Prompt 05
Validate:
- add, edit, feature, reorder, and remove flows still work
- team/member and gallery surfaces better foreshadow the published result
- invariants still hold

### Prompt 06
Validate:
- no raw enum-like values leak in audited author-facing surfaces
- searchable selectors and suggestion UIs follow a credible accessibility pattern
- no regression to existing picker/search functionality

## Closure note standard

Every closure note must include:

- the exact seam changed
- what was preserved
- what was upgraded
- proof that the target states were exercised
- any bounded residual risk that is truly unavoidable

Do not use closure notes as a place to defer work that belongs in this wave.

