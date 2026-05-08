# PCC Project Control Center — Basis of Design Contract

**Document status:** Approved target-state contract for remediation  
**Document type:** Basis of design / implementation-governing contract  
**Primary application:** `apps/project-control-center`  
**Primary host:** SharePoint Online modern page / SPFx-hosted PCC  
**Contract posture:** No open decisions. This document closes the design, navigation, layout, and evidence posture for the next PCC remediation sprint.

---

## 1. Purpose

This contract governs the next remediation of the Project Control Center (`PCC`) so the implemented product aligns with the originally approved basis-of-design concept while respecting the current SharePoint-hosted delivery model.

The remediation must move the PCC away from a tabbed reporting dashboard and toward a **project command center**:

```text
SharePoint native chrome
  ↓
PCC conditional command header
  ↓
Surface navigation + module access
  ↓
Operational bento field
```

This contract is binding for implementation prompts, code-agent execution, UI review, Playwright evidence review, and future scorecard audits.

---

## 2. Governing Design Decision

The originally approved visual concept remains the governing product direction, with one adaptation:

> The PCC sidebar navigation shown in the original concept is intentionally removed because SharePoint already owns global/site navigation. PCC must not reintroduce a competing persistent sidebar.

All other major concept principles remain active:

- dark navy command-center header;
- HB orange brand accent;
- clear project identity;
- prominent command/search experience;
- surface/project status chips;
- module access;
- project health / posture visualization;
- dense white operational bento field below the header;
- cards that support action, triage, and module entry rather than static summary only.

---

## 3. Closed Decisions

The following decisions are final for this remediation. Do not reopen them during implementation unless the user explicitly authorizes a contract revision.

| ID | Decision | Final Direction |
|---|---|---|
| D-01 | PCC sidebar | Do **not** reintroduce a PCC sidebar. SharePoint owns global/site navigation. |
| D-02 | Top tabs | Keep top-level PCC tabs as broad operating surfaces, not every module. |
| D-03 | Module access | Add a PCC Modules launcher in the command header. |
| D-04 | Command search | Treat command search as a navigation/action entry point, not decorative search only. |
| D-05 | Surface header cards | Remove duplicative top-level surface header cards from the bento grid. |
| D-06 | Surface identity | Move surface identity and surface-specific command content into the shell command header. |
| D-07 | Active surface marker | Move `data-pcc-active-surface-panel` ownership to the shell `main[role="tabpanel"]`, not a bento card. |
| D-08 | Project Home hero card | Eliminate the `Project Intelligence` top card as a duplicative bento card; move its useful content to the command header. |
| D-09 | Bento purpose | Bento grid contains working operational content only, not generic title/description cards. |
| D-10 | Project Home first fold | First visible bento cards must be operational: Priority Actions, Site Health, Document Control, Project Readiness, Approvals, Missing Configurations, External Systems, Team Snapshot, Recent Activity. |
| D-11 | Grid hole fix | Fix bento gaps through intentional composition and span contracts, not by relying on `grid-auto-flow: dense` as the primary solution. |
| D-12 | Work centers vs surfaces | Preserve the distinction: surfaces are navigation shells; work centers/modules are the operating destinations exposed through the launcher and card gateways. |
| D-13 | Read-only posture | Preserve PCC read-only / preview / mock / no-writeback posture unless a future contract explicitly authorizes command-model behavior. |
| D-14 | False affordances | Disabled/deferred/unavailable actions must be visibly labeled with reason copy. |
| D-15 | Evidence | Remediation is incomplete until component tests and Playwright evidence prove the new layout, navigation, accessibility, and no-regression posture. |

---

## 4. Existing Repo-Truth Anchors

Implementation must account for the current repo structure and contracts.

### 4.1 Current surface registry

The current MVP surface registry includes:

```text
project-home
team-and-access
documents
project-readiness
approvals
external-systems
control-center-settings
site-health
```

These are **surfaces**, not work centers. Surfaces may reference `primaryWorkCenterIds`, but the surface itself must not be called a work center in code, tests, or docs.

### 4.2 Current shell structure

The current shell structure is:

```text
PccShell
  PccProjectHeroBand
  PccHorizontalTabs
  main[role="tabpanel"]
    PccBentoGrid
      active surface cards
```

This structure is correct and should be retained. The remediation changes the content responsibilities inside the shell, not the overall host structure.

### 4.3 Current bento structure

The current bento grid is already a full-width responsive CSS grid. The primary problem is not grid width; it is card composition:

- generic fixed card footprints create stranded gaps;
- top-level duplicate cards consume first-row space;
- surfaces rely on auto-placement instead of intentional first-fold choreography.

---

## 5. Product Model

## 5.1 Three layers

The PCC product must be organized into three layers:

```text
Layer 1 — SharePoint native host
  Tenant/site chrome, page controls, site navigation, browser-level context.

Layer 2 — PCC command shell
  Project identity, active surface identity, command search, module launcher,
  status chips, facts, source/read-only cues, and surface-specific summary.

Layer 3 — PCC operational bento field
  Working cards, queues, source panels, exceptions, module gateways, and records.
```

## 5.2 What each layer owns

| Layer | Owns | Must Not Own |
|---|---|---|
| SharePoint host | Global app launcher, site navigation, page chrome, SharePoint search/page controls | PCC module hierarchy |
| PCC command shell | Project context, active surface context, command search, modules launcher, status/summary chips | Long operational lists |
| PCC bento field | Working module content, queues, exceptions, actions, records, source panels | Duplicate surface title cards |

---

## 6. SharePoint Host-Fit Contract

The PCC is hosted inside SharePoint. The design must therefore avoid any pattern that competes with SharePoint native navigation.

### 6.1 Required

- PCC must fit inside the SharePoint page canvas.
- PCC must respect SharePoint native chrome.
- PCC must not create its own permanent left sidebar.
- PCC must not require hiding SharePoint global navigation to function.
- PCC must remain usable in the current tenant-hosted page context.
- PCC must tolerate SharePoint edit-mode and published-mode host constraints.

### 6.2 Prohibited

- Persistent PCC sidebar.
- Full-page takeover assumptions.
- Browser-height assumptions that ignore SharePoint chrome.
- Navigation patterns that duplicate SharePoint site navigation.
- PCC controls that visually impersonate SharePoint page controls.

### 6.3 Required host-fit evidence

Playwright evidence must confirm:

- no horizontal overflow;
- no clipped first-fold command content;
- no duplicate persistent sidebar;
- command header remains within acceptable height;
- bento content renders below SharePoint chrome without layout collapse;
- edit-mode host controls do not break the PCC canvas.

---

## 7. Navigation Contract

## 7.1 Navigation hierarchy

PCC navigation must use four access paths:

| Access Path | Role |
|---|---|
| Project Home | Daily project command dashboard and primary triage surface |
| Top tabs | Broad PCC operating surfaces |
| Modules launcher | Complete grouped module/work-center directory |
| Command search | Fast access to modules, records, commands, and source-context actions |

## 7.2 Top tabs

Top tabs are retained but must remain broad operating domains. They must not attempt to list every module.

The current eight tab surfaces remain valid for this remediation:

```text
Project Home
Team & Access
Documents
Project Readiness
Approvals
External Platforms
Control Center Settings
Site Health
```

### Tab contract

Each tab must:

- activate one broad surface;
- update the command header;
- expose the relevant modules through header content and launcher state;
- render operational bento cards below;
- preserve keyboard tab semantics;
- preserve `aria-labelledby` / `role="tabpanel"` behavior.

## 7.3 Modules launcher

A persistent **Modules** control must be added to the PCC command header.

The Modules launcher is the primary solution for the “where do I access modules?” problem.

### Launcher behavior

The launcher must:

- open from the command header;
- list grouped PCC modules/work centers;
- clearly show available, preview, deferred, source-unavailable, and configuration-required states;
- allow the user to select a module;
- update `activeSurfaceId` and `activeModuleId` state when a module is selected;
- focus or surface the selected module area when practical;
- avoid false affordances for modules that are not live.

### Launcher grouping

The module launcher must use the following groups.

#### Project Setup & Readiness

- Startup Center
- Project Readiness Center
- Permit & AHJ Center
- Inspection Readiness
- Responsibility Matrix

#### Project Controls

- Action Center
- Approvals & Checkpoints
- Project Controls
- Contract & Compliance
- Risk / Issues / Decisions

#### Documents & Coordination

- Document Control Center
- Drawing & Model Center
- Meeting & Communication Center

#### Procurement / Closeout

- Procurement & Buyout
- Subcontractor Performance
- Closeout & Warranty
- Lessons Learned

#### Systems / Administration

- External Platforms
- Site Health
- Control Center Settings
- HBI Assistant

### Launcher state vocabulary

Use these state labels:

```text
Available
Preview
Configuration required
Source unavailable
Deferred
Read-only
Launch-only
```

### Launcher false-affordance rule

A module that cannot be opened must not render as an active clickable link. It must render as disabled or non-interactive with visible reason copy.

---

## 8. Command Search Contract

The command search must be treated as a command/navigation interface.

### Required command examples

The search/command entry point must support or preview commands such as:

```text
Open Document Control
Open Permit Log
Open Responsibility Matrix
Show Pending Approvals
Show Missing Configurations
Open Team Access
Open Site Health
Find Expiring COIs
Show Procore Mapping Status
```

### Initial implementation posture

The command search may remain preview/mock-based, but it must state its authority and limitations clearly.

### HBI / command authority language

Where HBI or command-search advisory language appears, it must use an explicit no-authority cue:

```text
HBI advisory · no decisions or writeback
```

or a functionally equivalent phrase that clearly states:

- no autonomous decisions;
- no writeback;
- no approval authority;
- user remains responsible for action.

---

## 9. Conditional Command Header Contract

## 9.1 Header responsibility

The command header must replace the duplicate surface header cards and become the single location for:

- project identity;
- active surface identity;
- active surface description;
- command search;
- Modules launcher;
- project facts;
- surface-specific KPI chips;
- source/read-only/degraded cues;
- Project Home trend or compact surface visual.

## 9.2 Header structure

The header must use this structure:

```text
PCC Command Header
  Identity Row
    Project name / number
    Active surface name
    Surface description

  Command Row
    Command search
    Modules launcher
    Optional surface primary action / source cue

  Status Summary Row
    Surface-specific chips
    Read-only / preview / degraded indicators

  Visual Summary Region
    Project Home: health trend
    Other surfaces: compact KPI strip or source/status summary
```

## 9.3 Header visual treatment

The header must visually align with the approved basis-of-design concept:

- deep navy command surface;
- HB orange accent;
- high-contrast white/light text;
- compact chips;
- clear command/search affordance;
- card field below on light canvas;
- professional construction-tech command-center posture.

## 9.4 Header responsive behavior

At smaller breakpoints:

- command search may collapse to compact/icon mode;
- status chips may wrap;
- trend visualization may collapse into summary chips;
- Modules launcher must remain accessible;
- header must not create horizontal overflow.

---

## 10. Active Surface Panel Ownership

## 10.1 New ownership

The active surface panel marker must be moved to the shell tabpanel:

```tsx
<main
  id={ACTIVE_PANEL_ID}
  role="tabpanel"
  aria-labelledby={`pcc-tab-${activeSurfaceId}`}
  data-pcc-active-surface-panel={activeSurfaceId}
>
```

## 10.2 Required tests

Tests must assert:

- exactly one active surface panel marker exists;
- the marker is on the shell `main[role="tabpanel"]`;
- each active tab correctly labels the tabpanel;
- no card is required to carry surface panel ownership;
- bento direct-child invariants remain intact.

## 10.3 Deprecated pattern

Do not rely on the first bento card to carry `data-pcc-active-surface-panel`.

The `dataActiveSurfacePanel` prop may be retained temporarily for backward compatibility, but new tests and implementation must not depend on it for surface panel ownership.

---

## 11. Duplicate Header Card Removal Contract

## 11.1 Rule

No surface may render a top-level bento card whose primary purpose is only to restate:

- the active tab name;
- the surface title;
- the surface description;
- generic preview explanation already handled by the header.

## 11.2 Cards to remove or refactor

The following classes of cards must be removed from first-fold bento placement or demoted into operational content:

```text
Project Intelligence top card
Documents header card
Team & Access header card
External Platforms header card / launch pad header card
Site Health overview card if it duplicates header-level health posture
Project Readiness top command card if duplicative
Approvals top command card if duplicative
Control Center Settings top overview card if duplicative
```

## 11.3 Content extraction rule

If a removed header card contains useful content, that content must be relocated:

- identity/title/description → command header;
- counts/status chips → command header summary row;
- useful operational list → bento card;
- source/degraded/read-only cue → command header or source card;
- module launch action → Modules launcher and card gateway.

## 11.4 Acceptance criteria

After removal:

- each surface starts with working content;
- no duplicate title/description card appears under the tabs;
- bento first fold contains operational cards;
- Project Home no longer begins with `Project Intelligence` as a bento card;
- the command header visibly changes by surface.

---

## 12. Bento Field Contract

## 12.1 Role

The bento field is the operational working surface.

It must contain:

- action queues;
- source panels;
- module gateways;
- record summaries;
- exception cards;
- recent activity;
- status diagnostics;
- workflow states.

It must not contain:

- duplicate surface title cards;
- generic introduction cards;
- cards that exist only to satisfy instrumentation;
- empty placeholder wrappers;
- persistent nav structures.

## 12.2 Direct-child invariant

Every bento card must remain a direct child of `PccBentoGrid`.

Do not introduce wrappers between `PccBentoGrid` and `PccDashboardCard` unless the wrapper itself is the intentionally tested grid child and does not break layout behavior.

## 12.3 Composition rule

The grid must be intentionally composed per surface. Do not rely solely on generic auto-placement.

For Project Home, the first fold must be composed to avoid stranded grid gaps.

## 12.4 Grid packing decision

Do not make `grid-auto-flow: dense` the primary fix.

Dense packing may be evaluated later, but this remediation must solve layout through explicit card order and span contracts.

---

## 13. Card Span / Footprint Contract

## 13.1 Problem

The current footprint system creates gaps when a card span leaves unused columns that the next card cannot fit.

Example:

```text
12-column grid:
  Hero card = 8 columns
  Remaining = 4 columns
  Next card = 6 columns
  Result = next card wraps, 4-column hole remains
```

## 13.2 Final direction

Use **surface-specific span overrides** before creating many global footprint tokens.

### Required implementation direction

Add a controlled span override capability to `PccDashboardCard` or an adjacent layout adapter.

Conceptual API:

```ts
spanOverrides?: Partial<Record<PccResponsiveMode, number>>;
```

or an equivalent typed, explicit surface-layout contract.

### Rules

- Overrides must be typed.
- Overrides must be limited to known responsive modes.
- Overrides must not bypass minimum safe inline-size protections without explicit handling.
- Overrides must be covered by tests.
- Overrides must be used for Project Home first-fold alignment before changing global footprint defaults.

## 13.3 Target Project Home spans

At 12-column modes:

```text
Row 1:
  Priority Actions: 5
  Site Health Summary: 3
  Document Control Center: 4

Row 2:
  Project Readiness: 4
  Approvals & Checkpoints: 4
  Missing Configurations: 4

Row 3:
  External Systems: 4
  Team Snapshot: 3
  Recent Activity: 5
```

At 10-column standard laptop:

```text
Row 1:
  Priority Actions: 4
  Site Health Summary: 3
  Document Control Center: 3

Row 2:
  Project Readiness: 4
  Approvals & Checkpoints: 3
  Missing Configurations: 3

Row 3:
  External Systems: 3
  Team Snapshot: 3
  Recent Activity: 4
```

At tablet and phone modes:

- stack in priority order;
- preserve readability;
- avoid horizontal overflow;
- allow cards to become full-width where necessary.

---

## 14. Project Home Contract

## 14.1 Role

Project Home is the daily command dashboard and highest-priority entry point.

It must align most directly with the approved basis-of-design image.

## 14.2 Header content

Project Home command header must include:

- project name;
- Project Control Center label;
- project number;
- location;
- estimated value;
- scheduled completion;
- project stage;
- phase/status chip;
- health chip;
- action count chip;
- command search;
- Modules launcher;
- project health trend or compact trend summary;
- HBI/command authority cue where command search appears.

## 14.3 Bento first fold

The Project Home bento field must begin with these cards in this order:

1. Priority Actions
2. Site Health Summary
3. Document Control Center
4. Project Readiness
5. Approvals & Checkpoints
6. Missing Configurations
7. External Systems
8. Team Snapshot
9. Recent Activity

## 14.4 Gateway actions

Every Project Home card must include a clear route/gateway to its module:

| Card | Gateway |
|---|---|
| Priority Actions | Open Action Center |
| Site Health Summary | Open Site Health |
| Document Control Center | Open Document Control |
| Project Readiness | Open Project Readiness |
| Approvals & Checkpoints | Open Approvals |
| Missing Configurations | Open Control Center Settings |
| External Systems | Open External Platforms |
| Team Snapshot | Open Team & Access |
| Recent Activity | Open Activity / Source Activity |

If the gateway is not live, show disabled state and reason.

## 14.5 Prohibited Project Home patterns

- No first-fold `Project Intelligence` bento card.
- No first-fold generic overview card.
- No card that only repeats the header.
- No card action that looks clickable but does nothing.

---

## 15. Surface-by-Surface Target Contract

## 15.1 Team & Access

### Header owns

- Team & Access Center identity;
- total team count;
- external partner count;
- guest count;
- pending access requests;
- access audit/status cue.

### Bento starts with

- Team Viewer;
- Permission Requests;
- Access Manager;
- Role Coverage;
- External Access Review;
- Access Audit History.

### Remove

- top-level Team & Access header card.

---

## 15.2 Documents

### Header owns

- Document Control Center identity;
- source status summary;
- SharePoint/OneDrive/Procore availability;
- read-only/launch-only cues;
- document health/status chips.

### Bento starts with

- SharePoint Drive;
- OneDrive;
- Procore Files;
- Document Crunch;
- Adobe Sign;
- Recent Documents;
- Expiring Documents;
- Approval Status.

### Remove

- top-level Documents header card.

---

## 15.3 Project Readiness

### Header owns

- Project Readiness Center identity;
- overall readiness score/posture;
- blocker count;
- source confidence cue;
- readiness category chips.

### Bento starts with

- Startup Center;
- Permit & AHJ Center;
- Inspection Readiness;
- Responsibility Matrix;
- Readiness Evidence;
- Open Blockers;
- Required Actions.

### Remove

- top-level readiness overview card if it only repeats identity/posture already in header.

---

## 15.4 Approvals

### Header owns

- Approvals & Checkpoints identity;
- pending my approval;
- pending others;
- escalated;
- recently approved;
- no-writeback/read-only cue where applicable.

### Bento starts with

- My Approvals;
- Pending Others;
- Escalated Items;
- Recently Approved;
- Approval Rules / Checkpoints;
- Deferred/Waived Items.

### Remove

- generic top-level approvals command card if duplicative.

---

## 15.5 External Platforms

### Header owns

- External Platforms identity;
- configured count;
- degraded count;
- not-configured count;
- launch-only cue;
- source permission cue.

### Bento starts with

- Procore;
- SharePoint;
- OneDrive;
- Sage Intacct;
- Autodesk BIM 360;
- Power BI;
- Document Crunch;
- Adobe Sign.

### Remove

- generic external systems header/launch pad card if duplicative.

---

## 15.6 Control Center Settings

### Header owns

- Control Center Settings identity;
- missing required configuration count;
- inherited settings count;
- project overrides count;
- governance/read-only cue.

### Bento starts with

- Project Settings;
- Integration Settings;
- Permission Settings;
- Workflow Settings;
- Metadata Settings;
- Missing Configurations;
- Configuration History.

### Remove

- generic settings overview card if duplicative.

---

## 15.7 Site Health

### Header owns

- Site Health identity;
- overall health;
- critical count;
- warning count;
- repair-required count;
- last check timestamp/cue.

### Bento starts with

- Critical Findings;
- Warning Findings;
- Source Drift;
- Repair Queue;
- Acknowledgements;
- Health History.

### Remove or demote

- top-level overview card if it duplicates header-level health posture.

---

## 16. Module Gateway Contract

## 16.1 Rule

Every operational card must either:

- open its corresponding module;
- focus the relevant module section;
- show a disabled reason;
- or explicitly state that it is read-only / preview-only.

## 16.2 Gateway labels

Use clear action labels:

```text
Open Action Center
Open Document Control
Open Project Readiness
Open Approvals
Open Team & Access
Open External Platforms
Open Settings
Open Site Health
```

## 16.3 Gateway state

Use these states:

```text
available
preview
disabled-source-unavailable
disabled-configuration-required
disabled-deferred
launch-only
read-only
```

## 16.4 Gateway test expectations

Tests must prove:

- enabled gateway actions change surface/module state;
- disabled actions do not navigate;
- disabled actions expose reason copy;
- no false affordance appears in workflow evidence.

---

## 17. State Model Contract

## 17.1 Required state shape

Extend the current shell state conceptually to include:

```ts
activeSurfaceId: PccMvpSurfaceId;
activeModuleId?: PccModuleId;
activeSectionId?: string;
activeRecordId?: string;
```

## 17.2 Initial implementation

Module state may be in-memory only for this remediation.

Do not introduce URL routing, query string routing, or SharePoint page routing unless implementation proves it can be done without host-fit regression.

## 17.3 Module selection behavior

When a module is selected:

1. set `activeSurfaceId` to the module’s parent surface;
2. set `activeModuleId`;
3. update command header summary;
4. focus or identify the module section where practical;
5. preserve read-only/no-writeback posture.

---

## 18. Visual Design Contract

## 18.1 Visual hierarchy

The visual hierarchy must be:

```text
1. Dark command header
2. Surface tabs / module entry
3. Light operational bento field
4. Dense cards with clear actions and status
```

## 18.2 Color use

Use existing HB/PCC theme tokens where available.

Required visual posture:

- deep navy command header;
- HB orange accent for selected state / active highlights;
- white or high-contrast command header text;
- light canvas below;
- white operational cards;
- subtle borders/shadows;
- status color supplemented with text/icons, never color alone.

## 18.3 Card visual posture

Cards should be:

- compact but readable;
- high density without appearing cramped;
- operationally labeled;
- visibly connected to a module;
- clear about source/read-only/preview state;
- consistent in header/action placement.

## 18.4 Approved concept alignment

The Project Home first fold must visually echo the approved image:

- strong command header;
- status chips;
- search/command;
- health trend;
- dense operational card field;
- multiple card sizes;
- priority actions and document control prominent;
- recent activity and team/system cards supporting.

---

## 19. Accessibility Contract

Implementation must preserve or improve accessibility.

## 19.1 Required

- top tabs remain keyboard navigable;
- tabpanel relationship remains valid;
- Modules launcher is keyboard accessible;
- command search is keyboard accessible;
- focus order is logical;
- disabled controls expose reason copy;
- status chips are not color-only;
- trend visualization includes text/table fallback;
- heading hierarchy remains logical after removing duplicate cards.

## 19.2 Prohibited

- clickable divs without keyboard behavior;
- unlabeled icon buttons;
- disabled actions without reason;
- color-only severity;
- hidden focus states;
- command/search controls without labels;
- modal/panel traps that cannot be dismissed.

---

## 20. Evidence Contract

## 20.1 Required validation commands

Future implementation closeout must include:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## 20.2 Required evidence lanes

The implementation must rerun or update evidence for:

```text
surface-screenshots
breakpoints
surface-smoke
workflow
content
accessibility
scorecard-report
```

## 20.3 Required screenshot proof

Evidence must include screenshots for:

- Project Home at standard laptop;
- Project Home at desktop;
- Project Home at ultrawide;
- every tab after duplicate header removal;
- Modules launcher open state;
- command search visible state;
- Project Home with health trend visible;
- responsive compact header state.

## 20.4 Required evidence assertions

Evidence must prove:

- no PCC sidebar;
- no duplicate surface header card;
- active surface marker is on shell tabpanel;
- command header changes per selected tab;
- bento field begins with working cards;
- Project Home first fold avoids stranded first-row gaps;
- module launcher exposes grouped modules;
- disabled/deferred modules are clearly labeled;
- no horizontal overflow;
- no false affordance regression;
- no accessibility regression.

---

## 21. Implementation Sequence Contract

Implementation must be sequenced as follows.

## Prompt 01 — Contract Landing and Current Delta Inventory

### Scope

- Land or reference this basis-of-design contract.
- Inventory duplicate header cards.
- Inventory card-to-module gateway gaps.
- Inventory Project Home bento composition gaps.
- No runtime code changes unless explicitly requested.

### Acceptance

- Contract is discoverable in the repo.
- All duplicate header cards are identified.
- All module access gaps are identified.

---

## Prompt 02 — Shell Header Consolidation Foundation

### Scope

- Move active-surface marker to shell tabpanel.
- Extend command header view model.
- Add header summary chip model.
- Keep existing tabs and grid.
- Update tests.

### Acceptance

- Header remains active-surface-aware.
- Tests prove active panel ownership moved to `main`.
- Bento cards no longer need to carry active surface panel markers.

---

## Prompt 03 — Conditional Command Header Content

### Scope

- Add surface-specific header content.
- Add Modules launcher entry point.
- Add source/read-only/degraded cues.
- Add Project Home command summary and health trend region.

### Acceptance

- Header content changes by active tab.
- Project Home visually begins to resemble approved command-center header.
- Modules launcher button is visible and accessible.

---

## Prompt 04 — Remove Duplicate Top-Level Header Cards

### Scope

- Remove/demote duplicative top cards from all surfaces.
- Relocate useful metrics into the command header.
- Preserve operational content.

### Acceptance

- No surface starts with a generic identity/header card.
- First bento card is operational on every surface.
- Tests confirm no duplicate header-card pattern.

---

## Prompt 05 — Module Launcher and Module State

### Scope

- Implement module registry/nav metadata.
- Add grouped module launcher.
- Add `activeModuleId` state.
- Wire module selections to parent surfaces.
- Add disabled/deferred/source-unavailable states.

### Acceptance

- Every target module has a visible access path.
- Disabled modules are not false affordances.
- Module selection changes surface/module state.

---

## Prompt 06 — Project Home Bento Composition Realignment

### Scope

- Remove `Project Intelligence` from Project Home bento.
- Apply Project Home card order.
- Add span override support or layout adapter.
- Align first-fold rows at standard laptop and desktop.
- Add gateway actions.

### Acceptance

- Project Home first fold is operational.
- No stranded first-row gaps.
- Card-to-module actions are visible and truthful.

---

## Prompt 07 — Cross-Surface Operational Realignment

### Scope

- Apply surface-specific operational starting cards.
- Ensure each tab is a working surface.
- Add gateway actions and state cues across surfaces.

### Acceptance

- Each tab clearly exposes module/work content.
- Cards are not merely reports of module output.
- Source/read-only/degraded states are clear.

---

## Prompt 08 — Visual Polish, Accessibility, and Evidence Closeout

### Scope

- Final visual polish against the approved concept.
- Accessibility pass.
- Playwright evidence rerun.
- Scorecard evidence update.
- Screenshot contact sheet / evidence manifest.

### Acceptance

- Evidence proves the remediation.
- No regression in host-fit, accessibility, false affordance, or responsive behavior.

---

## 22. Component and File Boundaries

## 22.1 Expected shell/header files

```text
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
```

## 22.2 Expected navigation/module files

```text
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/PccCapabilities.ts
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccModuleLauncher.tsx
apps/project-control-center/src/shell/PccModuleLauncher.module.css
```

## 22.3 Expected layout files

```text
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccBentoGrid.module.css
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccDashboardCard.module.css
apps/project-control-center/src/layout/footprints.ts
```

## 22.4 Expected Project Home files

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.module.css
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectHome/projectCommandSummary.ts
```

## 22.5 Expected surface files

```text
apps/project-control-center/src/surfaces/teamAccess/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/approvals/
apps/project-control-center/src/surfaces/externalSystems/
apps/project-control-center/src/surfaces/controlCenterSettings/
apps/project-control-center/src/surfaces/siteHealth/
```

## 22.6 Expected tests

```text
apps/project-control-center/src/tests/PccShell.test.tsx
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.test.tsx
apps/project-control-center/src/tests/PccSurfaceRouter.test.tsx
apps/project-control-center/src/tests/PccModuleLauncher.test.tsx
apps/project-control-center/src/tests/PccSurfaceHeaderConsolidation.test.tsx
```

---

## 23. Risk Guardrails

| Risk | Guardrail |
|---|---|
| Breaking bento direct-child invariant | Do not add wrappers between `PccBentoGrid` and cards. |
| Breaking tab accessibility | Preserve `role="tabpanel"` and `aria-labelledby` relationships. |
| Overloading header | Use compact chip rows and responsive collapse. |
| False affordance regression | Disabled/deferred modules require visible reason copy. |
| SharePoint host-fit regression | No persistent PCC sidebar; no full-page assumptions. |
| Visual drift | Project Home screenshot must be compared to approved basis concept. |
| Scope creep | No command-model/live writeback changes in this remediation. |
| Over-broad footprint changes | Prefer targeted Project Home span overrides before global footprint changes. |
| Naming confusion | Surfaces remain surfaces; modules/work centers remain modules/work centers. |
| Evidence gap | Do not close remediation without Playwright evidence. |

---

## 24. Final Acceptance Checklist

The remediation satisfies this contract only when all items below are true.

### Shell and header

- [ ] Header is the single surface command area.
- [ ] Header conditionally renders active surface content.
- [ ] Header includes command search.
- [ ] Header includes Modules launcher.
- [ ] Header includes surface-specific summary chips.
- [ ] Header uses dark command-center visual treatment.
- [ ] Header remains responsive and accessible.

### Navigation

- [ ] Top tabs remain broad surfaces.
- [ ] Modules launcher exposes grouped modules.
- [ ] Command search supports module/action entry.
- [ ] Card gateways route or explain disabled state.
- [ ] No PCC sidebar exists.

### Bento

- [ ] Duplicate top-level header cards are removed.
- [ ] Project Home bento begins with operational cards.
- [ ] Each tab begins with working content.
- [ ] No stranded first-row layout gap on Project Home.
- [ ] Cards remain direct children of `PccBentoGrid`.

### Surface behavior

- [ ] Project Home aligns with approved command-center concept.
- [ ] Documents exposes document control modules.
- [ ] Team exposes access/team modules.
- [ ] Readiness exposes startup/permit/inspection/responsibility modules.
- [ ] Approvals exposes approval queues.
- [ ] External Platforms exposes system status/launch cards.
- [ ] Settings exposes configuration controls.
- [ ] Site Health exposes health findings and repair posture.

### Accessibility and evidence

- [ ] Keyboard navigation is intact.
- [ ] No color-only status semantics.
- [ ] Disabled actions include reason copy.
- [ ] No horizontal overflow.
- [ ] No false-affordance regression.
- [ ] Playwright evidence is generated and committed in the appropriate evidence directory.
- [ ] Scorecard/evidence docs are updated without claiming unsupported Phase 4 readiness.

---

## 25. No Open Decisions

This contract intentionally leaves no design decisions open for the remediation scope.

The local implementation agent must not ask whether to:

- reintroduce the sidebar;
- keep duplicate surface header cards;
- use the bento field for surface title cards;
- treat tabs as the complete module list;
- make the module launcher optional;
- rely on dense CSS packing as the primary layout fix;
- leave card gateways ambiguous;
- omit Playwright evidence.

All of those decisions are closed by this contract.
