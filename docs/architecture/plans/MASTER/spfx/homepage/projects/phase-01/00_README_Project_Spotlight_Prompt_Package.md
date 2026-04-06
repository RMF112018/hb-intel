# Project Spotlight Webpart — Prompt Package

## Objective

This package provides a sequenced set of markdown prompts for a local code agent to implement a premium **Project Spotlight** webpart in the live `hb-intel` repo.

The prompts are intentionally phased so the work does **not** drift into generic dashboard-card behavior and instead stays aligned with the same premium homepage system as the **Signature Hero**.

## Package Contents

1. `01_Project_Spotlight_Repo_Truth_Baseline_and_Ownership_Map.md`
2. `02_Project_Spotlight_Featured_Spotlight_Anatomy_and_Desktop_Composition.md`
3. `03_Project_Spotlight_Supporting_Rail_and_Hierarchy_Enforcement.md`
4. `04_Project_Spotlight_Signature_Hero_Alignment_Pass.md`
5. `05_Project_Spotlight_Project_Team_Strip_and_Detail_Layer.md`
6. `06_Project_Spotlight_Responsive_Adaptation_and_Device_Behavior.md`
7. `07_Project_Spotlight_Ranking_Freshness_and_Authoring_Safety.md`
8. `08_Project_Spotlight_Hardening_Accessibility_and_Documentation.md`
9. `09_Project_Spotlight_Phase_Implementation_Summary.md`

## Execution Order

Run the prompts in numeric order.

Do **not** skip ahead unless the current prompt explicitly says the phase gate has been satisfied.

## Mandatory Working Rules

- Treat **repo truth** as authoritative.
- Read only the smallest authoritative file set needed for the task.
- **Do not re-read files that are already in your current context or memory unless they changed, your context is stale, or the task scope expanded.**
- Keep all changes aligned with:
  - `docs/architecture/blueprint/current-state-map.md`
  - `CLAUDE.md`
  - `apps/hb-webparts/**`
  - `packages/ui-kit/**`
  - `docs/reference/ui-kit/**`
  - `docs/reference/ui-kit/doctrine/**`
- Respect the homepage product boundary:
  - homepage-local shared building blocks should remain in `apps/hb-webparts/src/homepage/shared/**` unless they are truly reusable beyond the homepage product
  - homepage-safe reusable exports should prefer `@hbc/ui-kit/homepage`
  - Project Spotlight-specific orchestration should remain local to `src/webparts/projectPortfolioSpotlight/**`
- Do not let Project Spotlight drift into:
  - KPI widget behavior
  - report-card behavior
  - dense metadata behavior
  - equal-weight card grids
  - generic SharePoint thumbnail list behavior

## Required Design Posture

Project Spotlight must become:

- one dominant featured project
- one supporting rail of lighter secondary spotlights
- image-led storytelling
- premium editorial hierarchy
- restrained interaction
- strong compatibility with the Signature Hero without visual duplication

## Required Deliverable Discipline

For each prompt:

- perform the requested repo-truth audit
- implement only the scoped work
- validate only the changed scope unless broader verification is required
- document what changed
- explicitly state:
  - what was reused
  - what was built new
  - what was intentionally deferred
  - whether any primitive should remain local or be promoted later

## Recommended Validation Pattern

Use the smallest credible validation set first:

- changed-file or package-local lint
- changed-file or package-local typecheck
- focused tests for the touched scope
- broader validation only when the change crosses package or runtime boundaries

## Final Note

The goal is not merely to “make the webpart better.”

The goal is to build a **premium Project Spotlight flagship surface** that clearly belongs in the same homepage system as the Signature Hero and is strong enough to serve as a long-term homepage-standard pattern.
