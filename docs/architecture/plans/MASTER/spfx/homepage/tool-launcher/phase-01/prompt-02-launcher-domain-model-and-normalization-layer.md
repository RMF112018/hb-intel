# Prompt 02 — Launcher Domain Model and Normalization Layer

## Objective

Design and implement the typed Tool Launcher domain model and normalization layer that converts raw SharePoint list items from **`Tool Launcher Contents`** into a stable launcher presentation model.

## Required inputs

Use:

- the live field map produced in Prompt 01
- the current Tool Launcher repo seam
- the updated architecture direction
- the existing asset-manifest direction for platform logo treatment

## Working rules

- repo truth first
- do not re-read files still in your current context unless needed
- keep business-specific content mapping local to the homepage lane unless reuse is clearly justified
- do not force shared UI-kit primitives to absorb SharePoint list semantics
- do not implement unrelated visual redesign in this prompt

## Required design output

Create a typed model that distinguishes clearly between:

### 1. Raw SharePoint list item shape
The runtime payload shape from the list access method.

### 2. Normalized launcher record
The stable internal model used by the Tool Launcher feature.

### 3. Presentation-oriented derived structures
Any derived structures needed for:
- featured stage
- workflow shelves
- all-platforms index
- support / help / access metadata
- status / notice handling

## Required implementation outcome

Implement the normalization layer in the appropriate homepage-local location.

The implementation should:

- validate required values
- trim and normalize text
- normalize booleans and choice values
- normalize arrays / aliases / audience values
- normalize URLs and external-link behavior
- normalize optional logo references and fallback strategy hooks
- suppress inactive records
- preserve order fields cleanly
- degrade gracefully for partial records

## Required output

1. code changes for the typed model and normalization layer
2. a markdown file named:
   - `phase-01-normalization-layer-notes.md`

The notes file must include:

### 1. Files created or updated
### 2. Raw-to-normalized field mapping strategy
### 3. Validation and fallback rules
### 4. Why the chosen file locations are appropriate
### 5. What remains for binding in Prompt 03

## Additional instruction

Do not leave the launcher dependent on the old grouped-config shape as its hidden source of truth. The old shape may remain temporarily as a compatibility seam only if you document it explicitly and keep it transitional.
