# 05 — Priority Actions Rail and Tool Launcher / Work Hub

**Naming guard**

- Do **not** title or name the package as `homepage`, `home page`, `homepage-webparts`, `hb-central-homepage`, or any other homepage-labeled package.
- The package name must be exactly: `hb-webparts`.

## Objective

Implement the homepage utility/navigation layer with a premium priority-actions webpart and a better-than-generic tool launcher.

## Required Context

- Live repo: `RMF112018/hb-intel`
- This package’s `00_Implementation_Summary.md`
- This package’s `11_Risk_Exposure.md`
- This package’s `12_Standards_and_Best_Practices.md`
- Relevant current-state docs, ADRs, package READMEs, and live source files in the repo

## Operating Rules

- Use **repo truth first**. Inspect the live code and current authoritative docs before editing.
- Do **not** re-read files that are already in your current context or memory window.
- Do **not** broaden scope beyond the HB Central homepage webpart system.
- Do **not** create placeholder or stubbed production code.
- Prefer updating existing authoritative docs over creating redundant documents.
- Preserve SharePoint-native authoring and page composition.
- Default to lightweight homepage webparts unless this prompt explicitly authorizes an exception.
- Keep imports narrow and homepage-safe.
- Record any doc/code contradiction you find instead of silently choosing one source.
- At the end, provide a concise handoff note with changed files, verification, risks, and next-prompt readiness.

## Implementation Tasks

1. Implement the **Priority Actions Rail** webpart.
   It should surface:
   - user-relevant shortcuts
   - urgent or time-sensitive actions
   - approvals or “needs attention” style destinations where feasible
   - role-aware or audience-aware grouping when justified
   - concise labels and clean hierarchy
     It must feel faster and more intentional than Quick Links.

2. Implement the **Tool Launcher / Work Hub** webpart.
   It should provide:
   - grouped application/system launchers
   - elegant iconography and grouping
   - strong scannability
   - optional role-aware visibility rules
   - site-owner maintainable launcher configuration

3. Use the shared homepage primitives so these webparts feel coordinated with the hero/editorial webparts while still being denser and more operational.

4. Avoid turning either webpart into an app shell, global nav clone, or mega-menu.
   These are homepage acceleration surfaces, not primary navigation replacements.

5. Define the **configuration model** carefully:
   - pinned links
   - grouped launchers
   - audience/role visibility
   - ordering
   - icon treatment
   - optional status / badge treatment where useful

6. Build strong empty, loading, and malformed-config states.
   Site-owner errors should fail gracefully.

7. Add tests for:
   - grouping behavior
   - visibility / targeting logic
   - priority badge/state rendering
   - keyboard access and focus order

## Required Deliverables

- working Priority Actions Rail webpart
- working Tool Launcher / Work Hub webpart
- governed configuration model for both
- tests and docs for both
- any shared homepage primitive improvements needed for dense utility surfaces

## Verification

- run typecheck and relevant tests
- verify keyboard traversal and clear focus behavior
- confirm dense layout remains readable on typical desktop and tablet widths
- confirm configuration errors produce graceful fallbacks rather than broken layouts

## Definition of Done

- homepage utility/navigation zone is implemented with premium quality
- both webparts outperform generic quick-links behavior in structure and polish
- site-owner maintenance is practical

## Prompt-05 Closure Artifacts

- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRailWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHubWebPart.manifest.json`
- `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
- `apps/hb-webparts/src/homepage/shared/HomepageUtilityDenseGroup.tsx`
- `apps/hb-webparts/src/homepage/__tests__/utilityConfig.test.ts`
- `apps/hb-webparts/src/homepage/__tests__/utilityWebparts.test.tsx`
- `05A_Priority_Actions_Rail_Contract_and_State_Model.md`
- `05B_Tool_Launcher_Work_Hub_Config_and_Grouping_Contract.md`
- `05C_Utility_Zone_Test_Usage_and_Handoff.md`

## Resolved Decisions Register (Prompt 05)

| Decision ID | Decision                                                                                                     | Status |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ------ |
| D5-01       | Priority actions rail supports urgency badge treatment without replacing concise action labels               | Closed |
| D5-02       | Tool launcher/work-hub uses grouped launcher contract with optional audience filters                         | Closed |
| D5-03       | Grouping, ordering, and visibility logic are centralized in shared utility normalization seam                | Closed |
| D5-04       | Loading, malformed, and empty utility configurations always render graceful fallback states                  | Closed |
| D5-05       | Prompt-05 applies manifest patch bump from `001.000.002` to `001.000.003` for `hb-webparts` solution/feature | Closed |

## Prompt-05 Handoff

- Utility/work-zone webparts are now implementation-ready with shared configuration and normalization contracts.
- Prompt-06 should consume these utility surfaces without redefining action/launcher grouping, visibility, and fallback policies.
