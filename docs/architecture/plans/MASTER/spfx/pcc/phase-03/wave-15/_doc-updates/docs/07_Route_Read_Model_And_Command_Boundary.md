# 07 — Route, Read Model, and Command Boundary

## Route Decision

Keep shell route ID: `external-systems`.

User-facing label: **External Systems Launch Pad**.

## Backend Read-Model Routes

- `GET /api/pcc/projects/{projectId}/external-systems`
- `GET /api/pcc/projects/{projectId}/external-systems/launch-links`
- `GET /api/pcc/projects/{projectId}/external-systems/mappings`
- `GET /api/pcc/projects/{projectId}/external-systems/health`
- `GET /api/pcc/projects/{projectId}/external-systems/review-items`
- `GET /api/pcc/projects/{projectId}/external-systems/audit-events`

## MVP Command Posture

Documentation package does not authorize runtime command implementation. Future command endpoints, if authorized, must be backend-mediated and project-permission checked.

Prohibited command behavior: external-system writeback, tenant/security mutation, live API writes, source record mutation, Sage posting, Procore mutation, AHJ portal submission, camera platform mutation.
