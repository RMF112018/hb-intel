# Prompt 03 — Extraction Workflows and Download Artifact Generation

Use the local repo at HEAD as the final authority.

## Objective

Implement the first-wave extraction workflows and ensure each produces a disciplined, downloadable artifact set.

## Required first-wave workflows

### 1. Site starting-point template extraction

Purpose:
Capture the reusable starting-point structure of a target site for cloning a new-site baseline.

Expected scope where feasible:

- reusable site template/provisioning artifact,
- lists/libraries structure,
- empty folder/subfolder structures for template libraries,
- modern pages,
- page/webpart placement metadata,
- starter-file manifest where practical,
- and a concise markdown summary.

### 2. List schema extraction

Purpose:
Export complete live list schema for a selected or specified list.

Expected outputs:

- raw schema JSON,
- normalized schema JSON,
- concise markdown report.

### 3. Page/layout extraction

Purpose:
Export page inventory and modern page/layout/webpart placement metadata.

Expected outputs:

- page inventory JSON,
- per-page layout/control metadata JSON where appropriate,
- concise markdown summary.

### 4. Site inventory export

Purpose:
Create a practical inventory of the target site's reusable structure.

Expected outputs:

- lists/libraries/pages/basic settings summary JSON,
- concise markdown summary.

## Output rules

For every supported action:

- generate deterministic file names,
- emit a job manifest,
- provide machine-readable artifacts,
- provide a human-readable markdown summary,
- and return those files to the webpart as downloadable artifacts.

## Download UX expectations

The SPFx webpart should show:

- run completion status,
- generated file list,
- file sizes if available,
- download actions,
- and a concise summary of what the action captured.

## Implementation rules

- Keep action implementations modular.
- Reuse shared output helpers.
- Do not mix unrelated action logic into one giant script.
- Ensure large or multi-file outputs still surface cleanly in the UI.
- Prefer zip bundling when an action produces multiple related files.

## Deliverables

Implement:

1. the first-wave extraction actions,
2. output file generation,
3. manifest creation,
4. download surfacing in the client,
5. and concise action summaries.

## Final response requirements

Report:

- which actions are live,
- what files each generates,
- where output manifests are created,
- how downloads are surfaced in the webpart,
- and any action-specific constraints.

## Repo truth implementation note

Prompt-03 implementation at current HEAD uses:

- backend workflow module per action in `backend/functions/src/services/admin-control-plane/pnp-extraction-workflows.ts`
- orchestration + deterministic artifact generation in `backend/functions/src/services/admin-control-plane/pnp-orchestrator.ts`
- enriched evidence/download metadata in `backend/functions/src/functions/adminApi/index.ts`
- bundle-first artifact rendering in `apps/hb-webparts/src/webparts/pnp/`
