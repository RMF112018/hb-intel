# Prompt Change Log

## Summary

This enhanced package was derived from a narrowed audit of the attached Wave 02 package against the live `main` branch.

## Changes from the attached package

### Existing Prompt 01 — Finish author-label governance
Decision: **rewrite substantially**

Why:
- label governance is now materially implemented in the repo
- the remaining work is narrower and more exact than the attached prompt suggested
- closure now needs stronger direction around specific remaining leak points and proof, not a generic scrub

### Existing Prompt 02 — Deepen project binding and lookup robustness
Decision: **split and rewrite**

Why:
- project lookup truthfulness and selector accessibility are no longer cleanly the same issue
- shared control semantics now deserve their own dedicated closure unit
- project identity flow needs backend list-contract authority and stronger validation requirements than the attached prompt provided

### Existing Prompt 03 — Upgrade story editor to editorial-grade
Decision: **rewrite substantially**

Why:
- the editor is already real rich text with schema and paste sanitization
- remaining work is about editorial quality, polish, placeholder correctness, microflow ergonomics, and stronger tests

### Existing Prompt 04 — Reduce visible metadata burden
Decision: **rewrite and expand**

Why:
- live defaults now also affect hero metadata, not only metadata/team panels
- primary-path simplification requires a stronger progressive-disclosure posture and more precise boundaries

### Existing Prompt 05 — Accessibility, keyboard, and host-fit closure
Decision: **rewrite and narrow to final cross-surface closure**

Why:
- some of the most important accessibility issues now live in specific shared controls and should be closed earlier in the sequence
- the final pass should verify whole-surface cohesion after those local fixes land

### Existing Prompt 06 — Naming, host-context, and rebranding drift
Decision: **keep but expand**

Why:
- drift still exists, but the affected seams and preservation rules need to be sharper
- current source and packaged release manifest seams both need explicit coverage

## New prompt added

### Prompt-02-Close-shared-selector-semantics-and-control-accessibility.md
Reason added:
- the live repo still contains concrete control-level semantics gaps in shared selector primitives that were too important to leave buried inside generic accessibility language
