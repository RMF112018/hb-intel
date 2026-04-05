# Phase-04-03 — Footer Rail and Activation Governance

## Objective

Implement the **bottom placeholder / footer support rail** for Lane B, then harden the shell-extension lane with activation rules, safe failure posture, verification, and closure documentation.

This prompt closes Phase 04.

## Starting assumptions from Prompt 02

Prompt 02 has already delivered:

- top placeholder surface
- top ribbon / utility strip
- governed alert band
- updated Lane B docs and tests

This prompt should finish the shell-extension lane, not re-open previous work.

## Required implementation tasks

### 1. Implement bottom placeholder / footer rail

Create the bottom placeholder experience with an intentionally narrow scope.

The footer/support rail may include items such as:

- support/help affordances
- concise operational/help text
- lightweight footer utilities
- clearly bounded contextual items

It must remain shell-adjacent and host-cooperative.

### 2. Establish activation and visibility governance

Document and implement the activation posture for the shell-extension lane, including:

- where the extension is intended to run
- safe enable/disable behavior
- what happens when placeholders are absent
- what happens when config/content is absent
- how multiple surfaces coexist without layout conflicts
- any environment/feature gating required for the lane

### 3. Harden safe failure behavior

The shell-extension lane must fail safely:

- missing placeholder → no crash
- missing config → clean no-op or bounded fallback
- partial configuration → readable, controlled rendering
- unavailable host conditions → safe exit

No brittle dependency on undocumented SharePoint DOM structure is allowed.

### 4. Add phase-closing tests

Add or update tests to verify:

- footer rail renders in the bottom placeholder path
- activation/disable rules behave as expected
- missing-placeholder behavior is safe
- top and bottom surfaces can coexist
- no prohibited import paths or shell-takeover logic are introduced
- phase-level verification remains green

### 5. Close docs and release posture for Phase 04

Create/update the documents needed to make repo truth obvious:

- shell-extension README
- boundary and inventory documentation as needed
- a Phase 04 acceptance or closure document
- a completion note documenting what shipped, what remains deferred, and the verification results

## Required verification

At minimum, run and capture:

- `check-types`
- `lint`
- `build`
- `test`

Document the results in the completion note or acceptance artifact.

## Acceptance criteria

This prompt is complete only when:

- the bottom placeholder/footer rail exists
- activation and safe-failure behavior are implemented and documented
- top and bottom placeholder capabilities both exist in repo truth
- docs clearly present Lane B as a real product lane
- Phase 04 verification passes cleanly

## Intentional deferrals after Phase 04

Do not use this prompt to implement:

- Lane C navigation governance automation
- homepage property panes
- homepage async data integration
- unsupported tenant shell replacement
- cross-package promotion unless separately justified
