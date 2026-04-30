# 02 — Architecture Invariants

## Primary Rule

Preserve HB Intel architecture boundaries unless the user explicitly authorizes a boundary change and the governing prompt supports it.

## Monorepo Shape

The workspace is organized around:

- `apps/*`
- `packages/*`
- `packages/features/*`
- `backend/*`
- `tools/*`

Route work by surface before editing.

## Platform Guardrails

Do not introduce:

- direct SPFx-to-Procore calls;
- Procore secrets, mirrors, or write-back behavior without explicit approval;
- tenant mutation without gatekeeper review;
- Graph/PnP live calls without explicit approval;
- app catalog deployment without explicit approval;
- package/manifest version changes without explicit approval;
- dependency installs/updates without explicit approval.

## Runtime Posture

Treat app runtime, package exports, backend routes, SPFx manifests, provisioning, and tenant integrations as architecture-sensitive.
