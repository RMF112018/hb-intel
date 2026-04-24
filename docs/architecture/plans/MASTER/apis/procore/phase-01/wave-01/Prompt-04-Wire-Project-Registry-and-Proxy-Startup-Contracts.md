# Prompt-04 — Wire Project Registry and Proxy Startup Contracts

## Objective
Close the project-identity and startup wiring gaps that would otherwise block Procore-backed consumer adoption.

## Governing authorities
- `packages/data-access/src/factory.ts`
- `apps/pwa/src/main.tsx`
- `apps/pwa/src/sources/sourceAssembly.ts`
- `docs/how-to/developer/native-integration-backbone-implementation-guide.md`
- `docs/architecture/plans/MASTER/pwa/phase-1-deliverables/P1-CLOSEOUT-Native-Integration-Backbone-Repo-Truth-Audit.md`

## Repo seams to inspect
- `packages/data-access/src/factory.ts`
- `packages/data-access/src/services/IProjectRegistryService.ts`
- current mock project-registry implementation
- `apps/pwa/src/main.tsx`
- `apps/pwa/src/sources/sourceAssembly.ts`
- any shell/project-context seams that depend on project registry

## Current gap to close
The project registry is still mock-only, `setProxyContext()` is not wired at startup, and source assembly still depends on mock query functions.

## Required implementation outcome
1. Implement a durable project registry / project crosswalk path for Procore project identity.
2. Wire `setProxyContext()` in the correct startup seam.
3. Replace the relevant mock source assembly dependencies with repository-backed publication consumers where the required backend APIs exist.
4. Keep project identity resolution stable for existing consumers while adding Procore crosswalk capability.

## Proof of closure
Return:
- exact files changed
- the durable registry implementation path used
- the startup wiring added
- the source-assembly mocks removed or narrowed
- any remaining temporary shims that still need later removal

## Guardrails
- Do not hardcode project mappings.
- Do not bypass repository/query-hook boundaries.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
