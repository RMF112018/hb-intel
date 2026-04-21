# Prompt-04 — Hosted Validation and Packaged Proof of Closure

## Objective

Prove that the Spotlight remediation is not just locally improved, but actually correct in the packaged SharePoint-hosted result.

## Why this prompt exists

The user’s latest screenshot is from the real deployed surface. This package is only complete if the hosted surface stops reading as a nested-card stack after packaging and deployment.

## Governing authority

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/`

## Files / seams to consider

- any touched Spotlight ui-kit files
- package/build paths relevant to the homepage deployment
- the resulting `.sppkg` output that contains the updated Spotlight surface

Do **not** re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required tasks

1. run the relevant lint / type / test / build steps for the touched Spotlight work
2. build the updated package used by the homepage deployment path
3. confirm the packaged output contains the touched Spotlight code
4. validate the hosted result in SharePoint
5. collect runtime proof that the Spotlight now reads as one integrated surface

## Required runtime validation

Validate at minimum:

- one desktop-width hosted view
- one constrained or smaller hosted view

Specifically confirm:

- no card-within-a-card feel
- featured section reads as integrated with the parent shell
- past spotlights section reads as subordinate, not like another mounted card
- disclosures still work
- no regression in details/history behavior
- no obvious accessibility regression

## Deliverable

Return a concise closure note with:

1. commands run
2. package/build artifact path
3. proof that the package includes the new Spotlight code
4. hosted screenshots or equivalent evidence
5. explicit go / no-go conclusion
