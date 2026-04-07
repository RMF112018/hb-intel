# Prompt 03 — Logo Asset Binding and Degraded States

## Objective

Bind the flagship stage to the **tool-launcher asset manifest** and implement **degraded asset states** so featured platforms retain premium brand recognition when assets are complete and still degrade professionally when they are not.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- use the existing tool-launcher asset manifest as the preferred governance source for logos and fallback posture
- do not invent generic brand substitutes where a governed fallback already exists
- do not let degraded states collapse into noisy pseudo-brand clutter

## Existing implementation context

Review at minimum:

- the tool-launcher asset manifest file attached in this workstream
- the Phase 01 normalized launcher model / adapter files
- the Phase 03 flagship card / featured-stage files created in earlier prompts
- any local launcher helpers handling assets, URLs, or display state

## What you must implement

Implement an asset-resolution path for flagship cards that can:

- prefer launcher record asset references when valid and normalized
- resolve or enrich asset treatment through the existing manifest where appropriate
- support light/dark variant selection if the local launcher surface needs it
- use the governed fallback posture when an official asset is unavailable
- preserve descriptor / CTA / hierarchy regardless of asset quality

## Degraded-state requirements

You must define and implement what happens when:

- the record has no logo asset
- the manifest entry exists but only partial variants exist
- the platform is not yet represented in the manifest
- the launch URL exists but descriptor or category text is partial
- notice/status metadata is absent

The result must still read as a premium flagship launcher card, not a broken tile.

## Required output

Produce a markdown file named:

- `phase-03-asset-binding-and-fallback-notes.md`

The file must include:

### 1. Asset resolution strategy
How launcher record data and the manifest work together.

### 2. Degraded states
Explicit fallback rules for incomplete asset scenarios.

### 3. Guardrails
What the implementation intentionally avoids.

### 4. Deferred items
What deeper asset-authoring work is postponed.

## Coding expectation

Implement the flagship-stage asset binding and degraded states in the repo, keeping launcher-specific business logic local unless a broader shared pattern is clearly justified.
