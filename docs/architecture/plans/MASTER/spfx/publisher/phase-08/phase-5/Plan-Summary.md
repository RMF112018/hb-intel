# Plan Summary — Workstream E: Media and Gallery Redesign

## Objective

Replace raw media row editing with a more visual, guided media workflow that improves author confidence and accessibility.

## Package Contents

This package contains:
- `Plan-Summary.md`
- `README.md`
- one markdown prompt for each implementation step required to fully close the workstream

## Recommended execution order

- `Prompt-01-Define-the-future-state-media-authoring-model.md` — design the target media and gallery authoring model, including role selection, thumbnail treatment, caption/alt-text guidance, and ordering behavior
- `Prompt-02-Implement-visual-media-cards-and-guided-add-media-flow.md` — replace the current blank media row insertion flow with a guided add-media experience and visual media cards
- `Prompt-03-Improve-alt-text-caption-and-role-assistance.md` — add stronger accessibility guidance and author assistance for alt text, captions, media roles, and gallery grouping
- `Prompt-04-Refine-media-ordering-preview-and-gallery-readiness.md` — improve media ordering behavior, preview surfacing, and readiness messaging so authors understand exactly how the gallery will render
- `Prompt-05-Close-workstream-E-with-accessibility-and-hosted-vetting.md` — scrub the media workflow comprehensively, close drift and validation issues, and prove the final experience in hosted SharePoint

## Closure standard

The workstream is only closed when:
- the product and UX intent of the workstream is fully implemented in repo truth
- the touched surfaces are scrubbed for drift and contradictory legacy behavior
- the result aligns with the governing SPFx doctrine
- the result is validated in a manner appropriate to the touched code and hosted SharePoint context
