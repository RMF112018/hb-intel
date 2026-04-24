# Prompt-03 — Add Curated SharePoint Materializations and Project Surfaces

## Objective
Surface the first curated Procore-derived summaries in SharePoint/SPFx and project-facing HB Intel surfaces without turning SharePoint into the custody plane.

## Governing authorities
- `sharepoint_storage_pattern_recommendation.md`
- `10-SharePoint-HB-Intel-Integration-Recommendations.md`
- repo surfaces:
  - `apps/project-sites/**`
  - `apps/pwa/**`
  - `packages/data-access/**`
  - `packages/query-hooks/**`

## Repo seams to inspect
- SPFx project-sites app
- PWA project-facing surfaces
- publication APIs
- any SharePoint list/library helper seams

## Current gap to close
Even after data exists, users will not benefit until current-state summaries are published into the right surfaces.

## Required implementation outcome
1. Materialize only narrow current-state summaries into SharePoint where they help collaboration.
2. Add project-facing UI consumption for:
   - project summary
   - cost/change summary
   - open-item/health summary
   - sync freshness indicators
3. Keep deep or high-volume detail API-backed rather than list-backed.

## Proof of closure
Return:
- exact SharePoint artifacts introduced
- exact UI surfaces updated
- evidence that large/high-volume data was kept out of SharePoint
- proof of repository/query-hook usage in consumers

## Guardrails
- Do not mirror raw or detailed Procore data into SharePoint.
- Do not bypass backend publication APIs.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
