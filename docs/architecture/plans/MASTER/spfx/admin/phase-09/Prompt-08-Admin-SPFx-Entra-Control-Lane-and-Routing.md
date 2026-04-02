# Prompt-08 — Admin SPFx Entra Control Lane and Routing

## Objective

Add the **Entra control lane** to the Admin SPFx application so operators have a real Phase 9 UI surface for broad identity administration.

## Important execution rules

- Do not re-read files still in active context unless needed.
- Respect the current admin app shell and routing pattern.
- Keep privileged execution out of SPFx.
- The UI must correspond to real backend capability implemented in Prompts 06–07.

## Primary repo targets

Inspect and update as appropriate:
- `apps/admin/src/router/routes.ts`
- `apps/admin/src/App.tsx`
- `apps/admin/src/pages/**`
- any local route/layout helpers in `apps/admin/src/router/**`
- `packages/features/admin/**` only where reusable admin-intelligence components or UI primitives are the right fit

## Required implementation outcomes

### A. Add Entra lane routing
Add route structure for the Entra lane. Use the repo’s existing routing conventions.

Expected route concepts may include:
- Entra overview
- Users
- Groups
- action result / history views if that fits the current admin shell

### B. Add page structure
Create phase-appropriate admin pages/components for:
- Entra overview
- user administration workflow entry
- group administration workflow entry
- results / feedback / history navigation as supported

### C. Preserve shell clarity
Do not flatten all identity work into one generic page if the UX becomes unclear.
Do not make the Entra lane feel like a bolted-on settings panel.

### D. Keep frontend/backend boundary clean
The UI should:
- collect operator intent and inputs,
- show previews/summaries/results,
- surface risk tier,
- invoke backend actions,
- display audit/history/status data.

The UI must not:
- perform privileged Graph operations directly,
- implement business workflow logic that belongs in backend handlers,
- or own durable audit persistence.

## Documentation requirement

If the admin IA/navigation changes materially, update or create:
- `apps/admin/README.md`
and/or
- admin phase docs describing the new route/page structure.

## Validation

Run the smallest meaningful frontend validation set, likely:
- targeted component/page tests if present,
- route build/type checks,
- app build or equivalent focused validation.

## Completion condition

Stop when the Entra lane is added to the Admin app with real route/page structure wired to the backend capability foundation.
Do not finish safety/audit/history UX in this prompt beyond what is needed for a usable lane.
