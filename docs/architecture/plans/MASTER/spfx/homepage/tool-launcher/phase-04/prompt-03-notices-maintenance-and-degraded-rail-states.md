# Prompt 03 — Notices, Maintenance, and Degraded Rail States

## Objective

Implement **notice / maintenance treatment** and **degraded utility-rail states** so the launcher can surface meaningful support context when present and degrade professionally when support metadata is partial or absent.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- use the normalized launcher seam as the source for notice and support metadata
- do not let notices overwhelm the flagship stage or turn the rail into a noisy alerts column
- do not invent generic clutter where support metadata is incomplete

## Existing implementation context

Review at minimum:

- the Phase 01 normalized launcher model / adapter files
- the Phase 04 utility-rail files from Prompts 01–02
- the current launcher implementation and any local notice / status helpers
- the planning inputs for support fields and notice/status handling

## What you must implement

Implement notice and degraded-state behavior for the utility rail that can:

- render notice / maintenance / outage states when valid normalized metadata exists
- suppress notice treatment entirely when no valid notice data exists
- remain visually subordinate to the flagship stage
- gracefully handle partial support metadata, including cases where help or request-access data exists but notices do not, and vice versa
- preserve CTA clarity and surface integrity in incomplete-data scenarios

## Degraded-state requirements

You must define and implement what happens when:

- the support block has help or access links but no notice metadata
- notice status exists but supporting details are partial
- support-owner metadata is absent
- access-request or help metadata is absent
- the utility rail has only one useful support block instead of a fuller rail composition

The result must still read as a premium secondary rail, not a broken placeholder column.

## Required output

Produce a markdown file named:

- `phase-04-notice-and-degraded-state-notes.md`

The file must include:

### 1. Notice rendering strategy
How notice metadata is selected, prioritized, and presented.

### 2. Degraded states
Explicit fallback rules for incomplete support / notice scenarios.

### 3. Guardrails
What the implementation intentionally avoids.

### 4. Deferred items
What deeper support-governance or authoring work is postponed.

## Coding expectation

Implement the utility-rail notice treatment and degraded states in the repo, keeping launcher-specific business logic local unless a broader shared pattern is clearly justified.
