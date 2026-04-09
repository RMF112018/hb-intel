# Prompt 02 — Backend Orchestration and PnP Execution Seam

Use the local repo at HEAD as the final authority.

## Objective

Implement the secured execution seam that the SPFx webpart will call to run PnP-based extraction operations and return downloadable artifacts.

## Non-negotiable rule

PnP PowerShell / privileged SharePoint extraction must not run in the browser.

The agent must implement or wire a secure backend/service seam that can:

- accept a validated job request,
- run the requested extraction,
- write output artifacts,
- return status and download metadata,
- and capture useful execution logs.

## Required backend capabilities

1. **Job request contract**
   - target site URL
   - action id
   - optional action parameters
   - operator context where appropriate

2. **Job execution**
   - run the corresponding extractor/orchestrator
   - isolate each action implementation cleanly
   - support at least first-wave extraction actions

3. **Output management**
   - write one or more output files per job
   - create a manifest describing generated files
   - return download-safe metadata to the SPFx client

4. **Error handling**
   - capture auth, permission, connectivity, and extraction failures cleanly
   - do not leak secrets in logs or client payloads

5. **Security/authorization**
   - only authorized operators can invoke the service
   - no secrets in client-side code
   - do not embed privileged credentials in source files

## Preferred implementation direction

Reuse existing backend/service infrastructure if a legitimate fit exists in the repo.

If there is no fit, create a minimal, clean backend surface consistent with repo architecture for admin/operations tasks.

## PnP execution expectations

The backend should be able to orchestrate operations such as:

- `Get-PnPSiteTemplate` / equivalent provisioning extraction flow where appropriate,
- list metadata / fields / views / content types extraction,
- page/layout extraction,
- and related PnP/SharePoint inspection operations.

The implementation does not need to expose every PnP function directly. It should expose a curated action catalog with controlled outputs.

## Deliverables

Implement:

1. backend request/response contracts,
2. action dispatch/orchestration,
3. output artifact writer/manifest logic,
4. authorization handling,
5. and backend logging.

## Final response requirements

Report:

- chosen backend location and pattern,
- how the SPFx client calls it,
- how output files are stored/exposed for download,
- how auth is handled,
- and any prerequisites for live execution.
