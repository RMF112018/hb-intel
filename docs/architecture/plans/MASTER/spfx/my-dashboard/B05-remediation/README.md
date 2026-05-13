# My Dashboard Readiness Remediation Prompt Package

## Purpose

This package instructs a local code agent to remediate the current **HB Intel My Dashboard** implementation so that an authenticated SharePoint user is no longer trapped in a static, presentation-only, non-ready surface when the production backend/runtime prerequisites are available.

The remediation package is based on the current repo-truth audit that found:

1. The frontend surface router always renders the default `non-ready` surface variants.
2. `MyWorkShell` receives `spfxContext` / `getApiToken` but does not use them.
3. The protected My Work backend client and factory exist, but no production React render path consumes them.
4. Home and Adobe Sign cards are static presentation cards rather than live read-model consumers.
5. The uploaded production `.sppkg` artifact observed during audit appeared to lack usable `functionAppUrl` and `apiAudience` runtime injection, preventing SPFx API token-provider creation.
6. The uploaded `.sppkg` artifact observed during audit appeared to be out of parity with the then-current live repo source, which must be reconciled before deeper implementation work proceeds.

## Package Objective

Move My Dashboard from:

> authenticated user + static non-ready scaffold

to:

> authenticated user + runtime-configured backend client + data-driven readiness state + live My Work/Adobe Sign surfaces where the backend envelope permits it.

## Critical Closed Decisions

These decisions are **not open** for re-litigation during execution:

- My Dashboard remains a **read-model-first**, backend-mediated, SPFx-hosted product.
- Protected My Work routes remain:
  - `GET /api/my-work/me/home`
  - `GET /api/my-work/me/adobe-sign/action-queue`
  - `GET /api/my-work/me/project-links`
- Adobe OAuth backend routes remain:
  - `POST /api/my-work/me/adobe-sign/oauth/start`
  - `GET /api/my-work/adobe-sign/oauth/callback`
- The `readOnly: true` DTO envelope flag is **not** an authentication failure; it is a read-model contract invariant.
- React surfaces must be driven by backend envelope state, not hardcoded presentation defaults.
- Production `.sppkg` packaging for My Dashboard must not silently omit required backend runtime values.
- Do not weaken OAuth security, backend actor resolution, token validation, or fail-closed backend fallback behavior to make the UI appear ready.

## Execution Order

Execute the prompts in exact order:

1. `Prompt_00_Repo_Truth_And_Deployed_Artifact_Parity_Gate.md`
2. `Prompt_01_Harden_My_Dashboard_Production_Runtime_Config_And_SPPKG_Packaging.md`
3. `Prompt_02_Wire_The_My_Work_Read_Model_Client_Into_The_App_Runtime.md`
4. `Prompt_03_Drive_Home_And_Adobe_Module_Readiness_From_Live_Envelope_State.md`
5. `Prompt_04_Convert_Home_And_Adobe_Cards_From_Static_To_Data_Driven_Rendering.md`
6. `Prompt_05_Reconcile_Adobe_OAuth_User_Initiation_With_The_Live_Frontend_Runtime.md`
7. `Prompt_06_Validation_Evidence_Regression_Tests_And_Production_Closeout.md`

Do not skip Prompt 00. The audit observed a probable parity problem between a deployed/uploaded package and repo source. Implementation work must proceed from a known repository/artifact truth state.

## Expected End State

After the full package is complete:

- A production-configured My Dashboard package can create its SPFx delegated token provider when `API_AUDIENCE` is injected.
- A production-configured My Dashboard package can target the Function App backend when `FUNCTION_APP_URL` is injected.
- The app constructs a live `IMyWorkReadModelClient` in backend mode and a typed fallback client in unavailable scenarios.
- Home and focused Adobe Sign surfaces render `ready` / `non-ready` based on live read-model envelopes.
- Static placeholder card content is replaced by actual envelope/read-model props wherever live data exists.
- Adobe Sign authorization initiation is either fully reconciled and connected to the current backend route contract or explicitly closed as intentionally absent with no stale orphaned code/artifact posture.
- Tests prove both happy-path and degradation behavior.
- Packaging truth evidence proves the rebuilt `.sppkg` includes the intended runtime config markers and source bundle.

## Do Not Do

- Do not re-architect the Adobe backend OAuth flow.
- Do not change the established backend route paths.
- Do not remove typed backend-unavailable / authorization-required / configuration-required states.
- Do not hardcode secrets into SPFx runtime config.
- Do not add browser-side Adobe tokens.
- Do not suppress non-ready UI states to “make it look live.”
- Do not treat `readOnly: true` as a defect.

## Validation Command Family

The local agent should use the current repo’s actual package scripts, but this package expects validations in this family:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build

pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test

npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

When packaging for production proof, provide appropriate non-secret build-time values for `FUNCTION_APP_URL`, `API_AUDIENCE`, and `BACKEND_MODE=production` through the established local/CI packaging path. Do not invent values.

## Agent Efficiency Directive

Every prompt repeats the following instruction and it must be obeyed:

> **Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
