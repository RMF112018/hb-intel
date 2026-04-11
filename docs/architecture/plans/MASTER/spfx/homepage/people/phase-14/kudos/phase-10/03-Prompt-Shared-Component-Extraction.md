# Prompt 03 — Shared Component Extraction

You have already completed the architecture/ownership audit.

Now execute the extraction.

## Primary Goal

Collapse HB Kudos onto a **single shared people-picker implementation** in the correct shared UI lane.

This is a structural correction.

Do not create a third picker.

## Read First

Do not reread files already in current context unless they changed, the context is stale, or scope expanded.

Work from the files already audited, especially:

- `packages/ui-kit/src/HbcPeoplePicker/index.tsx`
- `packages/ui-kit/src/HbcPeoplePicker/types.ts`
- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `packages/ui-kit/src/homepage.ts`

## Required Changes

### 1. Promote the shared picker as the real implementation

Use `packages/ui-kit/src/HbcPeoplePicker/` as the durable owner of:

- search input behavior
- debounce/live-search behavior
- results dropdown behavior
- keyboard navigation
- selection/chip behavior
- result row rendering
- avatar slot / initials fallback rendering seam

### 2. Remove duplicated picker behavior from the Kudos composer

`HbcKudosComposerPeopleBucket` must not remain a standalone duplicate picker implementation.

Refactor so that one of the following is true:

- `HbcKudosComposer` directly consumes `HbcPeoplePicker`, or
- `HbcKudosComposer` uses only a thin wrapper around `HbcPeoplePicker` for bucket labeling and draft-shape adaptation

What is **not** acceptable:

- keeping the local query/debounce/results/chips renderer in `HbcKudosComposer`
- copying shared picker logic from one file to another

### 3. Preserve current consumer ergonomics where sensible

If the current Kudos draft shape still expects `individualEmails: string[]`, preserve that shape through a narrow adapter/wrapper layer rather than forcing a broad rewrite unless a broader rewrite is clearly justified.

### 4. Strengthen the shared picker API

Upgrade the shared component API so it can support:

- richer person result data
- photo/avatar rendering
- single- or multi-select behavior
- consumer-owned search adapter injection
- optional consumer customization hooks only if they do not weaken standard behavior

### 5. Exports

Expose the shared picker through the correct governed surface for homepage usage.

Do not force homepage consumers to import through the wrong boundary.

## Required Guardrails

- no hardcoded fake avatar data
- no local duplicate picker retained “temporarily” unless explicitly called out as a short-lived shim and there is no better path
- no import-boundary violations
- no breaking of unrelated consumers without compatibility handling

## Documentation and Verification

Add or update the minimum necessary docs/stories/tests to reflect the new shared ownership.

At minimum, update:

- shared picker docs/story if required by current repo doctrine
- exports if required
- any local comments that incorrectly imply the shared picker has not landed yet

## Deliverable

Complete the extraction and leave the repo with a single shared people-picker implementation under the correct owner.
