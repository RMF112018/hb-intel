# HB Intel My Dashboard — B03 Implementation Prompt Package

## Package purpose

This package converts the authoritative B03 planning artifact into a focused Claude Code / Opus 4.7 implementation sequence for:

- My Work shell composition,
- one-surface / one-module navigation,
- module launcher accessibility,
- My Work hero band,
- bento-grid dashboard choreography,
- home-vs-focused-module routing,
- structural Adobe Sign Action Queue shell placement,
- validation, tests, package readiness, and closeout.

This package is intentionally **post-B02**. Do **not** execute it against a branch that has not already completed the B02 My Dashboard app/package/runtime foundation.

## Binding source artifact

- `B03_My_Work_Shell_Navigation_And_UX_Development.md`
- Predecessors:
  - B01 foundation/scope/repo-truth artifact
  - B02 hosting/packaging/auth/runtime artifact

## Execution posture

Run the prompts in order:

1. `prompts/B03-01_My_Work_Navigation_Registry_And_Shell_State.md`
2. `prompts/B03-02_Command_Surface_And_Accessible_Module_Launcher.md`
3. `prompts/B03-03_Hero_Band_And_Identity_Summary_Governance.md`
4. `prompts/B03-04_Bento_Grid_Responsive_Choreography_And_Surface_Router.md`
5. `prompts/B03-05_Home_Surface_And_Focused_Adobe_Module_Shell_Placement.md`
6. `prompts/B03-06_Validation_Evidence_And_Closeout.md`

## Implementation boundary

### B03 must implement

- `packages/models/src/myWork/*` navigation metadata and exports.
- `apps/my-dashboard/src/state/useMyWorkShellState.ts`.
- Shell composition:
  - command surface,
  - navigation row,
  - module launcher,
  - hero band,
  - shell-owned active `tabpanel`.
- Bento-grid layout primitives that mirror the PCC responsive strategy without importing PCC app-local code.
- Shell router that resolves:
  - `home`,
  - `focused-module`.
- Structural home and focused Adobe module surfaces/cards required to prove the B03 shell composition and choreography.
- Data-attribute selectors and accessibility semantics required by the B03 contract.
- Unit/integration tests for registry normalization, shell state, tab/menu keyboard behavior, hero state, active-panel ownership, and layout/card ordering.
- Package/build validation appropriate for a post-B02 app domain.

### B03 must not implement

- Backend My Work routes.
- Adobe Sign OAuth, principal resolution, or provider services.
- Final source-backed read-model contracts; Batch 04 owns those.
- Detailed Adobe queue rendering, filtering internals, row normalization, and CTA truth logic; Batch 05 owns those.
- Hosted Playwright live evidence; Batch 08 owns hosted SharePoint evidence.
- Command search.
- URL routing, persisted nav preferences, or browser back-route semantics.
- Analytics cards.

## Critical guardrails

- Do not copy PCC project semantics into My Dashboard.
- Do not add a PCC-style project-facts hero row.
- Do not create a separate hero/global module launcher; the launcher attaches to the `My Work Home` tab group.
- Do not create generic top-level bento header cards; shell/hero owns orientation.
- Do not create a competing personal-work platform primitive beside `@hbc/my-work-feed`.
- Do not introduce placeholder/developer-facing UI copy. Any deterministic preview fixture copy must read as production-grade end-user copy.
- Do not re-read files that are still in your current context or memory. Inspect only files whose contents may have changed or that you need to modify.

## Expected final closeout

Prompt 06 must produce a closeout that includes:

- final verdict: PASS / PASS WITH EXPLICIT DEFERRED ITEMS / FAIL,
- branch and HEAD,
- B02 prerequisite confirmation,
- files created/updated,
- validation commands run and exact outcomes,
- package build status,
- any intentionally deferred B04/B05/B08 work,
- confirmation that no B03 boundary was violated,
- concise git commit summary and description.

## Directory map

```text
HB_Intel_My_Dashboard_B03_Implementation_Prompt_Package/
├── README.md
├── 00_B03_Implementation_Package_Overview.md
├── 01_B03_Repo_Truth_Implementation_Plan.md
├── 02_B03_Target_Architecture_And_File_Map.md
├── 03_B03_Validation_And_Closeout_Requirements.md
├── 04_B03_Implementation_Gap_Register.md
├── 05_B03_Targeted_Web_Verification_Notes.md
└── prompts/
    ├── B03-01_My_Work_Navigation_Registry_And_Shell_State.md
    ├── B03-02_Command_Surface_And_Accessible_Module_Launcher.md
    ├── B03-03_Hero_Band_And_Identity_Summary_Governance.md
    ├── B03-04_Bento_Grid_Responsive_Choreography_And_Surface_Router.md
    ├── B03-05_Home_Surface_And_Focused_Adobe_Module_Shell_Placement.md
    └── B03-06_Validation_Evidence_And_Closeout.md
```
