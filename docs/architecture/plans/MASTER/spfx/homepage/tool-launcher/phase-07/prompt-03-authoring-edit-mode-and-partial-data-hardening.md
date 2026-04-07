# Prompt 03 — Authoring, Edit Mode, and Partial-Data Hardening

## Objective

Implement the **authoring, edit-mode, and partial-data hardening** for Tool Launcher / Work Hub so the launcher behaves predictably and professionally in SharePoint authoring contexts and degraded data conditions.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- preserve the normalized launcher seam and responsive contract
- preserve hierarchy from the flagship stage through the shelves and overlay
- solve real authoring and degraded-data problems rather than hiding them

## Existing implementation context

Review at minimum:

- the launcher component entry and any launcher region components
- normalization / adapter and selector files from Phase 01
- loading, empty, and error-state helpers already used in homepage webparts
- any authoring governance helpers used elsewhere in homepage code
- the responsive / breakpoint work from Prompts 01 and 02
- the reference composition and any relevant documentation files

## What you must implement

Harden the launcher for:

1. SharePoint edit mode
2. minimally configured states
3. partially populated list records
4. missing optional metadata
5. invalid featured / shelf / notice combinations
6. no-results or empty inventory states after filtering
7. stale or incomplete overlay / support-action states

## Required behavior

The launcher should:

- remain understandable in edit mode
- show clear professional fallback states
- suppress broken or invalid secondary elements rather than rendering dead affordances
- avoid layout collapse when logos, descriptors, or support metadata are missing
- document when certain degraded states remain intentionally unresolved

## Required output

Produce a markdown file named:

- `phase-07-authoring-and-degraded-state-hardening.md`

The file must include:

### 1. Authoring / edit-mode findings
What changed to improve author-safe behavior.

### 2. Partial-data handling rules
How invalid or incomplete launcher data is handled by region.

### 3. Empty / loading / degraded-state behavior
What users and authors see across launcher regions.

### 4. Remaining risks
Anything still deferred or dependent on future list cleanup.

## Coding expectation

As part of this prompt, implement the authoring and degraded-state hardening in the repo so the launcher remains stable and legible when the content source is incomplete, inconsistent, or viewed in SharePoint authoring contexts.
