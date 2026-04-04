# 02A — HB Central Homepage Doctrine

## Purpose

Lock the implementation doctrine for the HB Central homepage system so Prompts 03–10 build against one consistent operating model.

## Doctrine Statements

### D2-01 — Homepage system, not homepage monolith

HB Central homepage delivery is a coordinated set of lightweight webparts, not a routed mini-application embedded inside a page tile.

### D2-02 — SharePoint-native coexistence

Custom homepage webparts must coexist with native SharePoint page composition, section zoning, and normal site-owner authoring workflows.

### D2-03 — Composition and hierarchy rules

- Top band must preserve signature hierarchy (Welcome + Hero).
- Utility and work-zone surfaces must optimize scan speed and action clarity.
- Awareness and operational sections must remain curated and non-sprawling.
- Discovery surfaces must remain guided, not generic link dumps.

### D2-04 — Above-the-fold discipline

Top-band and quick-use components are treated as repeated-use critical surfaces and must keep payload, layout, and interaction complexity intentionally small.

### D2-05 — Premium but operational posture

Homepage visuals should feel premium, established, and polished while remaining practical for everyday operational use; novelty-first treatments are out of scope.

### D2-06 — Maintainability as a release gate

Authoring, curation, and ordinary content rotation must be achievable without code changes during normal operation.

## SharePoint Runtime Guardrails

- Do not recreate shell-level routing/navigation inside homepage webparts.
- Do not introduce app-island patterns unless an exception is approved under Prompt-01 lane governance.
- Keep homepage import surfaces constrained to homepage-safe `ui-kit` entrypoints and relevant token/icon paths.

## Prompt-02 Closure Check

- Doctrine is explicit and dependency-safe for downstream prompts.
- SharePoint coexistence and maintainability constraints are now codified.
- No Prompt-02 doctrine area remains in a `decide later` state.
