# HB Kudos 3-Layer Data Architecture Prompt Package

## Objective
Produce a repo-truth prompt package for a local code agent to extract a durable 3-layer SharePoint data architecture for `apps/hb-webparts`, using the live HB Kudos implementation on the `main` branch of `RMF112018/hb-intel` as the primary source of truth.

## Audit basis
This package was derived from the live implementation in:
- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/`
- `apps/hb-webparts/src/homepage/data/`
- `apps/hb-webparts/src/homepage/helpers/`
- `apps/hb-webparts/src/homepage/shared/`
- `apps/hb-webparts/src/homepage/webparts/`
- `apps/hb-webparts/src/mount.tsx`

## Core conclusion
The repo already contains the beginnings of the requested 3-layer model, but the boundaries are inconsistent:
1. platform-like SharePoint mechanics already exist,
2. the Kudos domain model is strongly typed and mature,
3. local webpart orchestration is mostly separated,
4. some low-level mechanics are still embedded in Kudos-specific writer modules,
5. some global host/caching concerns are still app-singletons rather than explicit infrastructure seams.

## Highest-confidence reusable seams
- GUID-based SharePoint list registry and endpoint construction
- canonical list-host resolution and host bootstrap
- request digest retrieval
- `ensureUser` / current-user resolution
- ETag-safe MERGE write conventions
- cache invalidation primitives
- typed item lookup and audit-event writes
- typed patch planning for workflow actions

## Seams that must remain local or domain-specific
- Kudos workflow, visibility, archive, prominence, and aging rules
- Kudos role/capability policy
- Companion queue derivation, filters, bulk approval, and dialog state machines
- Public webpart featured/recent/archive orchestration
- Graph photo hydration and recipient presentation behavior

## Package contents
- repo-truth audit report
- seam map
- decision lock
- target 3-layer architecture
- phased extraction sequence
- validation requirements
- implementation prompts by phase
- final closure prompt
