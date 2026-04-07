# Prompt 02 — Command Band Search and Suggestion Behavior

## Objective

Implement the **command-band search and suggestion behavior** for Tool Launcher / Work Hub so the top command surface provides fast, accessible discovery without turning into faux global navigation.

## Context you must respect

- The command band and launcher skeleton should already exist from Phase 02.
- The search contract and prepared searchable launcher records should already exist from Prompt 01.
- The launcher must remain a hierarchy-driven homepage utility surface beneath the Signature Hero.
- Suggestion behavior must be accessible, host-aware, and visually consistent with the homepage doctrine.

## Repo-truth targets

Audit and update the current launcher command-band / overlay interaction paths under:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- related homepage-local launcher helpers and overlay files under `apps/hb-webparts/src/homepage/`

Use `@floating-ui/react` and other approved homepage-stack tools only where justified and already aligned with homepage doctrine.

## Required work

1. Bind command-band input behavior to the search-prepared launcher records.
2. Implement suggestion behavior for:
   - direct platform matches
   - alias / keyword matches
   - support/help-intent matches where appropriate
3. Define how results are surfaced without visually overpowering the flagship stage and shelves.
4. Implement keyboard-safe focus, arrow navigation, enter / escape handling, and dismiss behavior.
5. Ensure reduced-data and no-match states are clean, intentional, and informative.
6. Refine placeholder text, empty text, and microcopy so the command band feels premium and useful.

## Explicit exclusions

- Do not build a sitewide omnibox.
- Do not hijack browser-like keyboard semantics beyond what is necessary.
- Do not introduce unrelated launcher redesign.
- Do not create a heavy modal search product unless already warranted by prior overlay design.

## Validation requirements

- prove keyboard navigation and dismissal behavior are accessible and predictable
- prove no-match, low-match, and exact-match states render cleanly
- prove suggestion UI behaves well in reduced-width contexts already established in Phase 07
- document command-band interaction rules clearly

## Deliverables

- command-band search binding
- suggestion UI behavior and focus handling
- refined command-band copy and states
- doc updates for interaction rules and accessibility considerations

## Working rules

- repo truth first
- do not re-read files still in current context unless needed
- do not broaden scope
- preserve hierarchy and host-aware behavior
- keep the command band useful, compact, and premium
