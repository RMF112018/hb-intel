# 01C — Repo Structure Map and Prompt 02–10 Sequence

## Purpose

Provide a dependency-safe structure and execution sequence so Prompts 02–10 can implement without reopening Prompt-01 scope decisions.

## Recommended Repository Structure (for `hb-webparts` implementation)

```text
apps/hb-webparts/
  config/
    package-solution.json
  src/
    webparts/
      personalizedWelcomeHeader/
      hbHeroBanner/
      priorityActionsRail/
      toolLauncherWorkHub/
      companyPulse/
      leadershipMessage/
      peopleAndCulture/
      projectPortfolioSpotlight/
      safetyFieldExcellence/
      smartSearchWayfinding/
    homepage/
      shared/
        primitives/
        contracts/
        tokens/
      config/
        normalization/
        defaults/
      data/
        adapters/
        content-models/
  README.md
docs/reference/spfx-surfaces/
  hb-webparts-homepage-contract.md
  hb-webparts-authoring-and-ownership-guide.md
```

## Structural Separation Rules

- Shared homepage primitives live under `src/homepage/shared/**`; component-specific visuals stay local to each webpart folder.
- Configuration seams (normalization/defaults) live under `src/homepage/config/**`; no component should inline shared parsing logic.
- Data/content seams live under `src/homepage/data/**`; webparts consume adapters/contracts, not raw source-specific access scattered per component.
- Documentation for operator/site-owner behavior is maintained in `docs/reference/spfx-surfaces/**` plus package-local README.

## Dependency-Safe Prompt Sequence (02–10)

1. **Prompt 02**: Lock homepage doctrine, `ui-kit` contract, brand and shared visual rules.
2. **Prompt 03**: Build shared primitives/scaffolding/config seams used by all feature webparts.
3. **Prompt 04**: Implement top-band webparts (Welcome Header + Hero Banner) on stable primitives.
4. **Prompt 05**: Implement utility work-zone webparts (Priority Actions + Tool Launcher).
5. **Prompt 06**: Implement awareness-zone communications webparts (Company Pulse, Leadership, People/Culture).
6. **Prompt 07**: Implement operational-awareness webparts (Project/Portfolio Spotlight + Safety/Field Excellence).
7. **Prompt 08**: Implement discovery webpart (Smart Search / Wayfinding) using prior contracts.
8. **Prompt 09**: Normalize authoring/governance/content ownership and page composition guidance across all components.
9. **Prompt 10**: Execute full verification, packaging validation, release readiness, and handoff.

## Entry and Exit Expectations by Prompt Stage

- Prompts 02–03 must produce reusable contracts and primitives before any component pair implementation begins.
- Prompts 04–08 must not redefine lane, package naming, or shared doctrine decisions from Prompt 01.
- Prompt 09 must consolidate ownership/config consistency, not introduce major new component behavior.
- Prompt 10 is the release gate; unresolved accessibility/performance/packaging risks block handoff.

## Prompt-01 Closure Check

- Repo structure guidance is explicit and reusable.
- Prompt order has dependency rationale and gate logic.
- No step relies on implicit "decide during implementation" assumptions.
