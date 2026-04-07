# Phase 08 Package — Search, Personalization, and Refinement

## Objective

Implement the **search, personalization, and refinement** package for Tool Launcher / Work Hub so the launcher becomes faster to use, more context-aware, and more polished without drifting into a second application shell or a speculative personalization platform.

This phase should build on:

- **Phase 01** normalized launcher seam
- **Phase 02** desktop launcher skeleton
- **Phase 03** flagship platform stage
- **Phase 04** utility rail and support actions
- **Phase 05** workflow shelves
- **Phase 06** all-platforms overlay / index layer
- **Phase 07** responsive and authoring hardening

## Why this phase exists

By the end of Phase 07, the launcher should already have:

1. a live SharePoint-backed normalized launcher seam
2. a desktop-first premium launcher composition
3. a flagship platform stage
4. a utility rail with support actions and notices
5. workflow shelves for secondary inventory
6. an all-platforms overlay / index layer
7. responsive and authoring-safe behavior

What should still be missing is the **lightweight intelligence and interaction refinement layer** that makes the launcher easier to search, quicker to navigate, and more helpful for repeat use.

This phase exists to ensure the launcher can:

- search platforms by name, alias, descriptor, category, workflow shelf, and support terms
- provide lightweight command suggestions without becoming a fake omnibox shell
- support modest personalization such as favorites and recents only when justified by repo truth and host constraints
- refine interaction behavior, visual feedback, and microcopy so the launcher feels premium in daily use
- preserve hierarchy while improving speed of access

The result should feel like a polished premium work gateway, not a directory with a filter box.

## Scope

This package should result in:

1. a locked search behavior contract for launcher discovery
2. a practical personalization posture for favorites and recents, limited to what is supportable in the current homepage architecture
3. refined command band interactions and suggestion behavior
4. micro-interaction, copy, and affordance polish across launcher regions
5. validation proof that search and personalization improve usability without flattening hierarchy or adding brittle runtime state
6. documentation updates and implementation notes for the refinement layer

## Explicit exclusions

This phase must **not**:

- redesign the launcher architecture or re-open earlier phase decisions
- create a standalone search application
- broaden into a full user-profile, recommendation, or analytics platform
- add speculative persistence layers without clear repo-truth grounding
- turn the command band into fake global navigation
- collapse the flagship stage and shelves into a generic search results screen
- bypass SharePoint host constraints in pursuit of "app-like" behavior

## Package contents

- `phase-08-package-summary.md`
- `prompt-01-search-contract-and-discovery-model.md`
- `prompt-02-command-band-search-and-suggestion-behavior.md`
- `prompt-03-favorites-recents-and-light-personalization.md`
- `prompt-04-refinement-proof-and-docs-hardening.md`
- `phase-08-validation-checklist.md`
- `phase-08-completion-notes-template.md`

## Prompt execution order

1. Prompt 01
2. Prompt 02
3. Prompt 03
4. Prompt 04

## Required working posture for all prompts

- repo truth first
- do not re-read files still in current context unless needed
- preserve the Phase 01 normalized launcher seam
- preserve the Phase 02 launcher anatomy and desktop shell
- preserve the Phase 03 flagship hierarchy, Phase 04 utility rail, Phase 05 workflow shelves, Phase 06 overlay / index layer, and Phase 07 hardening
- keep search and personalization local to homepage / launcher code unless shared extraction is clearly justified
- favor lightweight, supportable behavior over speculative feature systems
- keep the launcher premium and hierarchy-driven rather than turning it into a text-first directory
- preserve clean focus behavior, accessible suggestion treatment, and predictable host-aware rendering throughout
