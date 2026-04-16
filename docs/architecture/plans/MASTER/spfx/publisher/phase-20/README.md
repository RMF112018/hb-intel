# HB Publisher Site-Availability Remediation Prompt Package

## Purpose
This package is for a local code agent. Its scope is **only** the post-upload SharePoint site-availability problem for `hb-publisher`.

The package is designed to close the issue identified in the audit:

- deployment-model mismatch (`skipFeatureDeployment` semantics versus validation workflow)
- contradictory repo doctrine about whether Publisher is:
  - an admin-managed governed host-page surface, or
  - a normal site-installed / picker-visible web part
- incorrect / incomplete toolbox-visibility authoring and proof coverage
- repo-to-artifact drift that prevents confidence that the shipped `.sppkg` matches `main`

## Required posture
- No unrelated cleanup.
- No UI/UX broadening.
- No business-logic work outside deployment/discovery seams.
- No deferrals.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Package contents
- `Plan-Summary.md`
- `Prompt-01-Lock-Deployment-Model-and-Reconcile-Doctrine.md`
- `Prompt-02-Restore-Manifest-and-Package-Semantic-Alignment.md`
- `Prompt-03-Implement-Closure-Grade-Validation-and-Rebuild-Proof.md`

## Expected result
At completion, the repo should unambiguously support **one** deployment model, the emitted `.sppkg` should match that model, package-truth checks should fail on semantic drift, and SharePoint validation should be run against the correct workflow for the chosen model.