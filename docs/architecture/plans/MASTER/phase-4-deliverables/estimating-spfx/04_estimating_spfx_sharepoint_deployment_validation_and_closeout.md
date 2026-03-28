# Prompt 04 — Estimating SPFx SharePoint Deployment Validation and Closeout

## Objective

You are my local Claude Code agent working inside the HB Intel repo.

Your objective is to validate the Estimating SPFx remediation **end to end** against real SharePoint deployment behavior and close out the work with implementation evidence, documentation updates, and a release-ready validation package.

This prompt is not complete until the repo contains evidence strong enough that another developer could understand exactly how to package, deploy, install, add, and validate the Estimating web part on a SharePoint site.

## Critical Instructions

- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction, recover exact evidence, or inspect a file you have not yet opened.
- Treat **web part addability and rendering on a SharePoint site** as the actual success condition.
- Do not claim success based only on local build output.
- Distinguish clearly between:
  - package generation
  - app catalog upload
  - app publication
  - site availability
  - web-part picker visibility
  - add-to-page success
  - runtime rendering success
- If a live SharePoint validation step cannot be completed locally, document exactly what was validated, what remains manual, and how to perform the manual validation.

## Required Work

### 1. Validate the complete deployment flow

Run and document the exact end-to-end path for:

- building the Estimating deployment artifact
- generating the compliant SPFx package
- uploading to the app catalog
- publishing / installing as required
- making the component available to the target site
- adding the Estimating web part to a SharePoint page
- verifying successful render/load behavior

### 2. Create a SharePoint validation checklist

Produce a checklist that can be used by another developer or admin to validate:

- package builds successfully
- package uploads successfully
- solution is published correctly
- target site can use the solution
- Estimating appears in the web-part picker
- Estimating can be added to a page
- Estimating renders without asset or runtime errors
- subsequent update/upgrade behavior is understood

### 3. Update repo docs and operational guidance

Update the docs so repo truth clearly reflects:

- Estimating is web-part-only
- the authoritative package-generation command/path
- the deployment flow
- the validation flow
- any manual SharePoint steps still required
- any known constraints, caveats, or environmental dependencies

### 4. Produce closeout evidence

Create a closeout artifact set with:

- commands executed
- files changed
- package artifact path(s)
- screenshots or log references if available
- validation results
- unresolved risks
- follow-up items if any

## Files to Create or Update

At minimum, create or update as needed:

- `docs/maintenance/estimating-spfx-deployment-runbook.md`
- `docs/architecture/reviews/estimating-spfx-deployment-validation-closeout.md`
- any relevant current-state / README / SPFx deployment docs that still describe outdated behavior
- any CI/CD docs or scripts requiring final alignment

## Required Final Response Structure

In your final response, provide:

### 1. Outcome
- Was the Estimating SPFx surface brought to a deployable **web-part-only** state?

### 2. Files changed
- Exact files changed

### 3. Commands
- Exact commands to build/package/deploy

### 4. SharePoint validation status
- What was validated automatically
- What was validated manually
- What still requires tenant/site execution if not completed

### 5. Remaining risks
- Clear and specific only

### 6. Recommended next step
- The single highest-value next step after this closeout

## Acceptance Criteria

Do not consider this prompt complete until:

- the repo contains a deployment runbook for the Estimating SPFx web part
- the repo contains a deployment validation closeout review
- the authoritative package-generation and deployment path is documented
- the validation path is explicit enough for another developer/admin to execute
- success or remaining gaps are stated plainly, with no false certainty
