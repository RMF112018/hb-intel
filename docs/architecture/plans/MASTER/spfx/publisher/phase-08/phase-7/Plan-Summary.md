# Plan Summary — Workstream G: Queue and Draft-Management Improvements

## Objective

Turn the left rail into a useful editorial queue that helps authors find, understand, and resume work quickly.

## Package Contents

This package contains:
- `Plan-Summary.md`
- `README.md`
- one markdown prompt for each implementation step required to fully close the workstream

## Recommended execution order

- `Prompt-01-Redesign-the-drafts-queue-information-model-and-row-content.md` — define the future-state draft queue information model, including search, friendly metadata, draft completeness cues, and stronger row hierarchy
- `Prompt-02-Implement-search-filter-and-friendly-row-metadata.md` — add search and improved filtering to the queue and replace raw row metadata with author-friendly information
- `Prompt-03-Add-draft-completeness-and-needs-attention-signaling.md` — implement completeness and attention-state indicators so authors can quickly identify incomplete drafts and blocking issues from the queue
- `Prompt-04-Improve-selection-behavior-and-queue-to-editor-handoff.md` — improve the interaction between the queue and the main editor so selection, resume, and context-switching feel intentional and stable
- `Prompt-05-Close-workstream-G-with-zoom-and-hosted-viewport-vetting.md` — scrub the queue experience comprehensively, including responsive behavior, zoom fit, scanability, and hosted SharePoint ergonomics

## Closure standard

The workstream is only closed when:
- the product and UX intent of the workstream is fully implemented in repo truth
- the touched surfaces are scrubbed for drift and contradictory legacy behavior
- the result aligns with the governing SPFx doctrine
- the result is validated in a manner appropriate to the touched code and hosted SharePoint context
