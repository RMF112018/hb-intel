# Prompt 03 — Estimating SPFx Manifest, Runtime, and SharePoint Registration Fix

## Objective

You are my local Claude Code agent working inside the HB Intel repo.

Your objective is to make the Estimating SPFx surface **actually usable as a SharePoint web part** after deployment by repairing any remaining manifest, runtime, loader, asset-resolution, registration, and toolbox-visibility issues.

This prompt assumes the compliant packaging/build remediation has already been completed.

## Critical Instructions

- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction, recover exact evidence, or inspect a file you have not yet opened.
- The target remains **web part only**.
- Do not add `SharePointFullPage`.
- Do not settle for “package uploads successfully” as proof of success.
- Success means the Estimating component is discoverable and usable as a SharePoint web part on a site page.
- Be exact about the distinction between:
  - upload success
  - app catalog publication
  - site availability
  - toolbox visibility
  - add-to-page behavior
  - runtime rendering

## Required Work

### 1. Validate the deployed web-part identity path

Prove that the following are coherent and aligned:

- solution/package identity
- feature identity if relevant
- web part manifest identity
- alias / title / description / grouping
- supported host model
- deployment artifact metadata
- any loader or asset base URL expectations

Fix any mismatch that could prevent SharePoint from recognizing, surfacing, or loading the component.

### 2. Repair manifest/runtime continuity

Ensure the deploy-time path produces what SharePoint actually needs for runtime resolution.

Pressure-test and repair as necessary:

- deployment manifest generation
- loader metadata continuity
- runtime asset references
- module resolution
- script resource mapping
- internal base URL behavior
- asset location assumptions
- any use of raw source manifest content where generated deployment metadata is required

### 3. Repair SharePoint page-usage behavior

Make whatever changes are necessary so that the Estimating component is:

- visible in the expected web-part picker scope
- addable to a SharePoint page
- loadable without broken asset resolution
- renderable without host-model confusion
- stable within the SharePoint page lifecycle

### 4. Address confusing or invalid supported-host assumptions

Reconfirm and enforce:

- `SharePointWebPart` is required
- `SharePointFullPage` is not part of this remediation
- any additional supported host settings are appropriate and not misleading

### 5. Strengthen validation tooling

Upgrade repo validation so it checks more than:

- file presence
- GUID uniqueness
- port uniqueness

It must also help catch defects such as:

- invalid host intent
- inconsistent manifest/build expectations
- invalid or missing deployment-time metadata
- broken asset references
- incorrect toolbox registration assumptions

## Files to Inspect and Update

At minimum, inspect and update as needed:

- `apps/estimating/src/webparts/estimating/EstimatingWebPart.manifest.json`
- `apps/estimating/src/webparts/estimating/EstimatingWebPart.*`
- any generated-manifest or packaging output config
- `apps/estimating/config/package-solution.json`
- any build/package output mapping files
- any scripts or CI steps that validate manifest/runtime correctness
- any supporting docs describing runtime/registration behavior

## Deliverables

1. Implement the necessary runtime/manifest/registration fixes.
2. Create or update:
   - `docs/architecture/reviews/estimating-spfx-runtime-and-registration-remediation.md`
3. In that review, document:
   - what prevented add-to-page behavior or runtime rendering
   - what specific changes fixed it
   - how SharePoint now discovers and loads the web part
4. In your final response, provide:
   - exact files changed
   - exact validation steps run
   - whether the component is now expected to appear and render as a web part
   - any residual unknowns that still require live SharePoint verification

## Acceptance Criteria

Do not consider this prompt complete until:

- the Estimating solution is correctly shaped for SharePoint web-part usage
- manifest/runtime continuity is repaired
- toolbox/add-to-page behavior is accounted for
- validation tooling is stronger than simple existence checks
- the next prompt can focus on actual deployment validation and closeout