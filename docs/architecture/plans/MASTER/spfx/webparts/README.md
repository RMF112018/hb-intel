# HB Central Homepage Webparts — Local Code Agent Prompt Package

## Purpose

This package gives a local code agent a **sequenced implementation set** for building the **first release of the HB Central premium SharePoint homepage webpart system** inside the live `RMF112018/hb-intel` repo.

It is based on:

- the attached audit-session objective prompt
- the attached Hedrick Brothers SharePoint homepage design brief
- the resulting audit findings and design-brief enhancements already established for this workstream

This package is intentionally opinionated:

- **homepage system, not homepage monolith**
- **multiple coordinated custom webparts, not one giant homepage app**
- **default lane = lightweight standalone homepage webparts**
- **premium composition under SharePoint constraints**
- **strict performance, accessibility, authoring, and governance discipline**

## How to Use This Package

Run the prompts in order.

### Required order

1. `01_Component_Inventory_and_Lane_Assignment.md`
2. `02_Homepage_Doctrine_UI-Kit_Contract_and_Brand_Foundation.md`
3. `03_Shared_Homepage_Primitives_and_Standalone_SPFx_Scaffolding.md`
4. `04_Personalized_Welcome_Header_and_HB_Hero_Banner.md`
5. `05_Priority_Actions_Rail_and_Tool_Launcher_Work_Hub.md`
6. `06_Company_Pulse_Leadership_Message_and_People_Culture.md`
7. `07_Project_Portfolio_Spotlight_and_Safety_Field_Excellence.md`
8. `08_Smart_Search_Wayfinding_and_Discovery.md`
9. `09_Authoring_Configuration_Governance_and_Page_Composition.md`
10. `10_Verification_Packaging_Release_Readiness_and_Handoff.md`

## Included Files

- `00_Implementation_Summary.md`
- `01_Component_Inventory_and_Lane_Assignment.md`
- `01A_Component_Inventory_Matrix.md`
- `01B_Lane_Assignment_Decision_Record.md`
- `01C_Repo_Structure_and_Prompt_Sequence.md`
- `02_Homepage_Doctrine_UI-Kit_Contract_and_Brand_Foundation.md`
- `02A_Homepage_Doctrine.md`
- `02B_Homepage_UI-Kit_Usage_Guide.md`
- `02C_HB_Brand_Foundation_Reference.md`
- `03_Shared_Homepage_Primitives_and_Standalone_SPFx_Scaffolding.md`
- `03A_Shared_Primitives_Catalog.md`
- `03B_Scaffolding_Conventions_and_Helpers.md`
- `03C_Shared_Foundation_Test_and_Usage_Guide.md`
- `04_Personalized_Welcome_Header_and_HB_Hero_Banner.md`
- `04A_Welcome_Header_Contract_and_Behavior_Matrix.md`
- `04B_Hero_Banner_Authoring_and_Config_Contract.md`
- `04C_Top_Band_Test_Usage_and_Handoff.md`
- `05_Priority_Actions_Rail_and_Tool_Launcher_Work_Hub.md`
- `05A_Priority_Actions_Rail_Contract_and_State_Model.md`
- `05B_Tool_Launcher_Work_Hub_Config_and_Grouping_Contract.md`
- `05C_Utility_Zone_Test_Usage_and_Handoff.md`
- `06_Company_Pulse_Leadership_Message_and_People_Culture.md`
- `07_Project_Portfolio_Spotlight_and_Safety_Field_Excellence.md`
- `08_Smart_Search_Wayfinding_and_Discovery.md`
- `09_Authoring_Configuration_Governance_and_Page_Composition.md`
- `10_Verification_Packaging_Release_Readiness_and_Handoff.md`
- `11_Risk_Exposure.md`
- `12_Standards_and_Best_Practices.md`

## Prompt-01 Outputs (Locked)

Prompt 01 closure outputs are complete and should be consumed before Prompt 02 work starts:

- `01A_Component_Inventory_Matrix.md` — full ten-component inventory with lane, zone, data/content ownership, property-pane requirements, audience awareness, and expected shared primitives.
- `01B_Lane_Assignment_Decision_Record.md` — locked default lane policy, routed mini-app prohibition by default, exception process, and packaging ambiguity resolution.
- `01C_Repo_Structure_and_Prompt_Sequence.md` — recommended repo structure map for `hb-webparts` implementation plus dependency-safe execution sequence for Prompts 02–10.

## Downstream Consumption Guidance

- Treat Prompt-01 decisions as fixed inputs; do not reopen inventory, lane, or package naming debates unless an explicit exception record is approved.
- Preserve the locked package naming guard (`hb-webparts`) when scaffolding begins.
- Keep manifest patch-bump behavior deferred until the `hb-webparts` manifest target exists in-repo.
- Use Prompt 01 closure records to drive Prompt 02–10 handoff notes and validation criteria.

## Prompt-02 Outputs (Locked)

Prompt 02 closure outputs are complete and are required inputs for Prompt 03+:

- `02A_Homepage_Doctrine.md` — locked homepage operating doctrine and SharePoint coexistence rules.
- `02B_Homepage_UI-Kit_Usage_Guide.md` — homepage-safe `ui-kit` import and wrapper policy.
- `02C_HB_Brand_Foundation_Reference.md` — codified brand implementation constraints.
- `@hbc/ui-kit/homepage` — constrained entrypoint for homepage-safe primitives and contract constants.

Prompt-02 keeps SPFx manifest patch-bump deferred until `hb-webparts` exists as an actual manifest target in repo.

## Prompt-03 Outputs (Locked)

Prompt 03 closure outputs are complete and are required inputs for Prompt 04+:

- `apps/hb-webparts` (`@hbc/spfx-hb-webparts`) — standalone SPFx homepage scaffold with locked manifest baseline `001.000.001`.
- `03A_Shared_Primitives_Catalog.md` — shared homepage primitive inventory, ownership, and intended consumption.
- `03B_Scaffolding_Conventions_and_Helpers.md` — canonical webpart/adapters/property-pane/test/docs placement conventions and helper/model contracts.
- `03C_Shared_Foundation_Test_and_Usage_Guide.md` — Prompt 03 verification expectations and downstream implementation usage guidance.

Prompt-01/02 manifest deferment is now superseded by the created `hb-webparts` manifest target and initialized patch baseline.

## Prompt-04 Outputs (Locked)

Prompt 04 closure outputs are complete and are required inputs for Prompt 05+:

- `apps/hb-webparts/src/webparts/personalizedWelcomeHeader/*` — signature greeting webpart contract + manifest baseline.
- `apps/hb-webparts/src/webparts/hbHeroBanner/*` — authored hero banner webpart contract + manifest baseline.
- `04A_Welcome_Header_Contract_and_Behavior_Matrix.md` — greeting behavior and alert matrix.
- `04B_Hero_Banner_Authoring_and_Config_Contract.md` — hero authoring/normalization contract.
- `04C_Top_Band_Test_Usage_and_Handoff.md` — Prompt-04 verification and downstream usage guidance.

Prompt-04 applies the first post-scaffold manifest patch bump to `001.000.002` in `hb-webparts` solution + feature versions.

## Prompt-05 Outputs (Locked)

Prompt 05 closure outputs are complete and are required inputs for Prompt 06+:

- `apps/hb-webparts/src/webparts/priorityActionsRail/*` — utility priority-actions webpart contract + manifest baseline.
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/*` — grouped launcher/work-hub webpart contract + manifest baseline.
- `05A_Priority_Actions_Rail_Contract_and_State_Model.md` — priority actions state and fallback behavior contract.
- `05B_Tool_Launcher_Work_Hub_Config_and_Grouping_Contract.md` — grouped launcher config/normalization contract.
- `05C_Utility_Zone_Test_Usage_and_Handoff.md` — Prompt-05 verification and downstream usage guidance.

Prompt-05 applies manifest patch bump to `001.000.003` in `hb-webparts` solution + feature versions.

## Operating Assumptions for the Code Agent

Every prompt assumes the code agent will:

- use **repo truth first**
- inspect current implementation before editing
- update existing authoritative docs instead of creating redundant drift where practical
- keep homepage work **strictly scoped** to this webpart system
- avoid placeholder implementation
- avoid hardcoded sample data in shipped homepage surfaces unless the prompt explicitly allows a demo stub
- avoid re-reading files that are already in the agent’s current context window or memory
- prefer narrow imports and reusable shared primitives
- preserve SharePoint-native page composition and authoring workflows

## First-Release Scope

This package targets the first locked homepage webpart set:

1. Personalized Welcome Header
2. HB Hero Banner
3. Priority Actions Rail
4. Tool Launcher / Work Hub
5. Company Pulse
6. Leadership Message
7. People and Culture
8. Project / Portfolio Spotlight
9. Safety and Field Excellence
10. Smart Search / Wayfinding

## Release Philosophy

The first release should be:

- premium
- branded
- operationally useful
- configurable by site owners
- performant enough for real homepage use
- maintainable without repeated developer intervention for normal content changes

The first release should **not**:

- rebuild an entire shell inside the homepage
- turn the homepage into a routed app
- require a giant personalization engine
- optimize for novelty over reliability

## Recommended Agent Output Pattern Per Prompt

For each prompt, the code agent should produce:

- code changes
- doc updates
- verification results
- a concise handoff note listing changed files, open issues, and next prompt readiness
