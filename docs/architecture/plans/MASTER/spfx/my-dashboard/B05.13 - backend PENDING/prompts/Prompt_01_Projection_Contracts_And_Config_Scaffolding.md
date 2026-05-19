# Prompt 01 | Projection Contracts and Configuration Scaffolding

## Working Context

You are working in the `RMF112018/hb-intel` repository on the **My Dashboard | My Projects Incremental Projection** implementation package dated **2026-05-17**.

Read and obey the package's locked decisions. Do **not** reopen architecture choices that are closed in:
- `00_Closed_Decision_Register.md`
- `01_Target_Architecture.md`
- `02_Azure_Infrastructure_Specification.md`
- the prompt-specific package files referenced below.

Do not re-read files that are still clearly present in your current context or memory; only re-open a file when verification of exact current contents is required.

## Required First Response

Return:
1. a concise execution plan,
2. the exact repo seams you will inspect or edit,
3. the validation lanes you expect to run,
4. any true blocking contradiction with repo truth.

Do **not** make edits until Bobby approves the plan, unless Bobby explicitly instructs you to proceed immediately.

---
## Objective

Implement the foundational contracts, constants, feature flags, configuration validation, dependency additions, and shared types for the My Projects projection subsystem.

## Required Package Inputs

Review:
- `00_Closed_Decision_Register.md`
- `01_Target_Architecture.md`
- `02_Azure_Infrastructure_Specification.md`
- `04_Backend_Service_Design.md`
- `05_Subscription_Delta_Queue_State_Design.md`
- `resources/Environment_Settings_Matrix.md`
- `resources/Service_Bus_Message_Contract.json`
- `resources/Azure_Table_State_Entities.json`

## Locked Implementation Requirements

1. Add `@azure/service-bus` dependency to `backend/functions/package.json` and lockfile as appropriate.
2. Create a dedicated My Projects projection backend service/config area without polluting unrelated features.
3. Implement strict environment/config parsing for all package-defined settings.
4. Implement feature flags:
   - `HBC_MY_PROJECTS_PROJECTION_ENABLED`
   - `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE=legacy|projection`
   - repair timer enablement and schedules.
5. Implement source-kind closed enum:
   - `projects`
   - `legacy-registry`
6. Implement message/type contracts for:
   - sync wake-up message,
   - admin rebuild request shape,
   - projection run type/status primitives.
7. Preserve current read route behavior; this prompt must not cut over the route.

## Expected Validations

- Typecheck backend.
- Unit tests for config parsing and enum validation.
- Package install/lockfile integrity if dependency changes.

## Do Not Do Yet

- No SharePoint list provisioning implementation in this prompt.
- No Graph live calls.
- No webhook route implementation yet.
- No read-path cutover.
