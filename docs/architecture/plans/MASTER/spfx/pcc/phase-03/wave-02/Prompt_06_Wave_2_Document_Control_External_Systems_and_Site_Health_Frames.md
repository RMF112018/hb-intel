# Prompt 06 — Wave 2 Document Control, External Systems, and Site Health Frames

## Operating Instructions

You are executing this prompt in the live `RMF112018/hb-intel` repository. Treat the current repo as the source of truth. Do not assume files from memory are current. However, do not repeatedly re-read files that are still within your current context unless the file may have changed or the prompt specifically requires a freshness check.

Work to closure. Do not defer required analysis, do not ask broad clarification questions, and do not implement outside the allowed scope. If repo truth conflicts with this prompt, stop before code changes and document the conflict clearly.

## Objective

Implement preview frames for Documents, External Systems, and Site Health surfaces using Wave 1 read-model contracts. These are UI frames only, not live operational modules.

## Documents / Document Control

Implement Document Control as a unified access hub preview:

- SharePoint Drive;
- OneDrive;
- Procore Files;
- Document Crunch;
- Adobe Sign.

Do not implement document-control management workflows. Do not upload, approve, reject, sync, mirror, write back, or mutate documents.

## External Systems

Implement launch-link and missing-configuration preview states for external systems. Use `EXTERNAL_SYSTEM_CATALOG`, `ILaunchLink`, and related fixtures or app-local preview data derived from the shared model.

Do not call external APIs. Do not store secrets. Do not add Procore runtime.

## Site Health

Implement Site Health as a read-model summary frame:

- overall status;
- severity counts;
- drift indicators if fixture data exists;
- repair-request entry placeholder;
- missing-config cues.

Do not implement scanners, repair runners, Graph/PnP probes, or backend persistence.

## Validation

Add tests confirming:

- Document Control source cards render from model constants;
- external-system launch-link/missing states render without live calls;
- Site Health summary renders from fixture/read-model data;
- no API/client/secrets/sync/mirror/write-back paths exist.

Run package validation commands.

## Closeout

Create `Wave_2_Prompt_06_Closeout.md` with explicit guardrail confirmations.
