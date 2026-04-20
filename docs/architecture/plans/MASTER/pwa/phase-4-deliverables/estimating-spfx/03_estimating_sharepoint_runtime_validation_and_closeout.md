# Prompt 03 — Validate the rebuilt package for SharePoint runtime deployment and close out the fix

## Objective

You are continuing from Prompts 01 and 02 in the HB Intel repo.

Validate that the rebuilt Estimating `.sppkg` is now fit for upload/deployment to SharePoint as a **web part only** package, and produce a concise closure report with exact evidence.

## Critical constraints

- Estimating is **web part only**.
- Do **not** implement `SharePointFullPage`.
- Do **not** re-read files that are still within your current context or memory unless needed to verify a contradiction, inspect exact code, or capture evidence.

## Required work

### 1. Validate the manifest/host model

Confirm the final Estimating manifest state is correct for a web-part-only deployment.

At minimum verify:

- `componentType` remains `WebPart`
- `supportedHosts` does not reintroduce `SharePointFullPage`
- no new host-model ambiguity was introduced during remediation

### 2. Validate the shell runtime handoff

Confirm the full runtime chain is now coherent:

1. SharePoint loads the shell web part bundle
2. shell resolves `internalModuleBaseUrls`
3. shell builds a valid URL for `estimating-app.js`
4. shell requests the script from the correct client-side asset location
5. shell expects the correct global export name

State whether that chain is now internally consistent.

### 3. Validate the rebuilt `.sppkg`

Inspect the rebuilt `.sppkg` and report:

- package name
- package size
- relevant contents under `ClientSideAssets/`
- any relationship/configuration evidence that supports runtime loading

### 4. Produce a deployment checklist

Create a concise operator-facing checklist for the next SharePoint deployment attempt.

It must include:

- remove/replace older app catalog version if applicable
- upload updated `.sppkg`
- republish/install as needed
- confirm the web part is available in the target site
- verify direct access to the expected `estimating-app.js` URL in the browser
- add the web part to a test page
- capture the exact browser-network evidence if any runtime error remains

### 5. Produce a closeout report

Create a concise markdown report in the repo or working output that documents:

- original issue
- confirmed root causes
- changes made
- rebuilt package result
- deployment readiness status
- any remaining caveats

## Required deliverables

1. Final validation summary
2. SharePoint deployment checklist
3. Closure report
4. Exact path to the rebuilt `.sppkg`
5. Exact path to the closure report markdown file

## Acceptance criteria

Do not close this prompt until all are true:

- the package is still clearly web-part-only
- the runtime URL-join defect is closed
- the secondary asset packaging path has been validated after rebuild
- the package is ready for a fresh upload/deployment attempt
- a concise closeout report exists with implementation evidence

## Output format

Return:

1. `Objective achieved`
2. `Deployment readiness`
3. `Files / artifacts produced`
4. `Validation evidence`
5. `Deployment checklist`
6. `Remaining caveats`