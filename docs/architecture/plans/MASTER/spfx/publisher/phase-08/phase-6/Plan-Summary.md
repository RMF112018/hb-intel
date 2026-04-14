# Plan Summary — Workstream F: Preview and Publish-Readiness Split

## Objective

Separate technical readiness from visual preview so authors gain both product confidence and operational clarity.

## Package Contents

This package contains:
- `Plan-Summary.md`
- `README.md`
- one markdown prompt for each implementation step required to fully close the workstream

## Recommended execution order

- `Prompt-01-Redesign-preview-and-readiness-information-architecture.md` — define the future-state separation between Article Preview and Publish Readiness, including what belongs in each surface and how technical detail is presented
- `Prompt-02-Implement-a-visual-article-preview-surface.md` — build a true visual article preview experience so authors can inspect likely final output rather than only structural diagnostics
- `Prompt-03-Implement-a-dedicated-publish-readiness-panel.md` — create a dedicated readiness surface that groups validation errors, warnings, drift states, and action implications in plain language
- `Prompt-04-Rewrite-publish-republish-archive-withdraw-messaging-for-author-confidence.md` — upgrade lifecycle action messaging so the UI clearly explains what each action will do and why, without exposing unnecessary technical jargon
- `Prompt-05-Close-workstream-F-with-end-to-end-readiness-validation.md` — perform an exhaustive closure pass on preview/readiness behavior, including drift handling, action gating, and hosted workflow confidence

## Closure standard

The workstream is only closed when:
- the product and UX intent of the workstream is fully implemented in repo truth
- the touched surfaces are scrubbed for drift and contradictory legacy behavior
- the result aligns with the governing SPFx doctrine
- the result is validated in a manner appropriate to the touched code and hosted SharePoint context
