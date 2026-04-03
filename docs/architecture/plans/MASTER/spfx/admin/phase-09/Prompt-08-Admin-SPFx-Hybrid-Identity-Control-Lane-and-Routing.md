# Prompt-08 — Admin SPFx Hybrid Identity Control Lane and Routing

## Objective

Add the **Hybrid Identity control lane** to the Admin SPFx application so operators have a real Phase 9 UI surface for authority-aware identity administration and for no-code setup and maintenance of the backend connections required to use the feature.


## Hard gate

Treat the following as mandatory for this prompt and all later prompts:

After the final `.sppkg` is delivered, IT must be able to install the app and complete required operational setup and ongoing maintenance **without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files**.

This prompt must therefore drive the repo toward:

- UI-managed setup, testing, rotation, and maintenance of required backend connections,
- secure backend custody/resolution of secrets and credentials,
- explicit operator-visible preflight checks for any external prerequisite the app cannot create itself,
- and documentation that distinguishes allowed admin-page approvals from prohibited code-edit setup.

Standard Microsoft admin approval pages are allowed where unavoidable. Code interaction is not.


## Important execution rules

- Do not re-read files still in active context unless needed.
- Respect the current admin app shell and routing pattern.
- Keep privileged execution out of SPFx.
- The UI must correspond to real backend capability implemented in Prompts 04, 06, and 07.
- Do not satisfy the requirement by exposing fake settings fields that do not actually drive backend connection resolution.

## Primary repo targets

Inspect and update as appropriate:

- `apps/admin/src/router/routes.ts`
- `apps/admin/src/App.tsx`
- `apps/admin/src/pages/**`
- any local route/layout helpers in `apps/admin/src/router/**`
- `packages/features/admin/**` only where reusable admin-intelligence components or UI primitives are the right fit
- any repo-consistent admin settings/config pages or components that could host governed connection setup

## Required implementation outcomes

### A. Add Hybrid Identity lane routing

Add route structure for the Hybrid Identity lane. Use the repo’s existing routing conventions.

Expected route concepts may include:

- Hybrid Identity overview
- Users
- Groups / Access
- Connections / Connectivity
- Results / history or sync-status views if that fits the current admin shell

### B. Add page structure

Create phase-appropriate admin pages/components for:

- Hybrid Identity overview
- user workflow entry
- group / access workflow entry
- connection-management / connector-setup pages
- results / feedback / history / sync navigation as supported

### C. Preserve shell clarity

Do not flatten all identity work into one generic page if the UX becomes unclear.
Do not make the Hybrid Identity lane feel like a bolted-on settings panel.

### D. Keep frontend/backend boundary clean

The UI should:

- collect operator intent and inputs,
- show action scope and source of authority,
- show previews / summaries / results,
- surface risk tier,
- invoke backend actions,
- display audit / history / status / sync data.

The UI must not:

- perform privileged Graph operations directly,
- perform AD DS execution directly,
- implement business workflow logic that belongs in backend handlers,
- or own durable audit persistence.

### E. Make authority visible

Where the workflow meaningfully depends on it, the UI must show whether the action is:

- AD DS authoritative,
- cloud-side / Entra authoritative,
- coordinated,
- or visibility-only.

Do not hide the model from operators.


### F. Deliver no-code connection management

This is a **hard gate**, not a nice-to-have.

The UI must provide an authorized IT operator with the ability to:

- view required connector classes and their status,
- enter or update the necessary connection details / endpoints / identifiers / keys / secrets / certificate references / credentials / toggles as appropriate,
- click a **Connect**, **Verify**, **Reconnect**, or equivalent action,
- see last-verified state and failure guidance,
- rotate or update connection material without code edits,
- and disconnect or disable a connector where phase-appropriate.

This must work through real backend APIs and secure backend handling.

Do **not** store secrets in the browser.
Do **not** require code edits, env-file edits, backend config-file edits, package/manifest edits, or deployment-template edits for normal IT setup and use after deployment.
Do **not** surface sensitive values back to the browser after initial entry if backend security would be weakened.

## Documentation requirement

If the admin IA/navigation changes materially, update or create:

- `apps/admin/README.md`

and/or admin phase docs describing the new route/page structure.

## Validation

Run the smallest meaningful frontend validation set, likely:

- targeted component/page tests if present,
- connection-settings form and status rendering tests where present,
- route build/type checks,
- app build or equivalent focused validation.

## Completion condition

Stop when the Hybrid Identity lane and connection-management UI are added to the Admin app with real route/page structure wired to the backend capability foundation.
Do not finish safety/audit/history UX in this prompt beyond what is needed for a usable lane.


## Completion hard gate

This prompt is not complete if the resulting UI only captures settings superficially while the real backend still depends on developer-managed code/config changes. The local code agent must ensure the connection-management surfaces actually drive backend resolution, verification, and ongoing maintenance.
