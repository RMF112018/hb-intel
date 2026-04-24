# Prompt 03 — Backend Sync, Admin Panel, and Analytics Snapshots

## Objective

Determine and implement the minimum backend/admin/sync architecture required for a governed production Foleon launch.

## Governing Authorities

- Foleon OAuth client-credentials/API guidance
- Existing `@hbc/functions` backend architecture
- HB Intel SharePoint list governance patterns

## Files / Seams to Inspect

- `backend/functions` or `@hbc/functions` routes
- Foleon sync service to be added
- `HB_FoleonProjectsRegistry`
- `HB_FoleonAnalyticsSnapshots`
- `HB_FoleonSyncRuns`
- Admin Panel webpart or route
- permission/auth patterns

## Current Gap

Backend sync, projects registry, analytics snapshots, sync runs, and admin panel are deferred. That deferral may be acceptable only for a tightly constrained MVP, not for broad production rollout.

## Required Implementation Outcome

- Keep Foleon API client credentials server-side only.
- Implement or explicitly scope a backend sync route/job for Docs and Projects.
- Add sync run logging and stale-data detection.
- Add analytics snapshot ingestion if analytics are in release scope.
- Define admin permissions and admin UI requirements.
- Document which pieces block launch vs Wave 02.

## Proof of Closure

- Backend route tests.
- Secret handling proof: no Foleon secrets in SPFx bundle.
- Sync-run sample output.
- SharePoint schema proof for deferred lists.
- Admin permission test or documented launch constraint.

## Non-Negotiable Instructions for the Local Code Agent

- Use the live repo's `main` branch as the source of truth unless the prompt explicitly tells you to investigate an unmerged branch/commit.
- Do not protect weak patterns because the UI renders, the package builds, or prior summaries said the MVP landed.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes outside the stated Foleon scope.
- Provide proof of closure with exact commands, files changed, and artifacts generated.
- If repo truth contradicts this prompt, stop and report the contradiction clearly before changing code.
