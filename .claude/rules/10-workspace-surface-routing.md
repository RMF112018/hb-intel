# 10 — Workspace Surface Routing

## Primary Rule

Classify the active repo surface before broad search or implementation.

## Surface Classes

| Surface | Typical Paths | First Sources |
| --- | --- | --- |
| App / SPFx app | `apps/*` | nearest `package.json`, README, config, manifest, tests |
| Shared package | `packages/*` | package `package.json`, README, exports, tests |
| Feature package | `packages/features/*` | package `package.json`, README, primitive adoption docs |
| Backend Functions | `backend/functions` | package, route/host files, artifact script, backend docs |
| Tools/scripts | `tools/*`, `scripts/*` | script source, package scripts, validation docs |
| Docs | `docs/*` | docs README, current-state map, authoring standard |
| PCC | `apps/project-control-center`, PCC docs | PCC app README, wave docs, scope locks |

## Required Procedure

1. Identify surface class.
2. Read nearest package/app `package.json`.
3. Read nearest README.
4. Read governing reference docs for the surface.
5. Identify package-local validation scripts.
6. Identify affected consumers.
7. Only then implement or recommend changes.
