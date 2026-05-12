# B03 — HB Intel My Dashboard My Work Shell, Navigation, Hero, and Dashboard UX Development

**Artifact status:** Batch 03 authoritative development-planning artifact  
**Prepared:** 2026-05-12  
**Target initiative:** HB Intel **My Dashboard** SPFx domain, **My Work shell**, and **Adobe Sign Action Queue** first module  
**Repo anchor:** `dca51c71e36c486e026b550d4b61dd0114888813`  
**Predecessors:**  
- `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md`
- `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md`

**Source outline:** `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md`  
**Batch scope:** Detailed development of plan Sections **9**, **10**, **11**, and the shell/dashboard-placement portions of **21** only. This is a closed-decision architecture and UX planning artifact, not runtime implementation and not a local-code-agent prompt package.

---

# Executive Verdict

## Final verdict

**Proceed with My Dashboard’s MVP as a PCC-inspired, SharePoint-hosted personal work shell that uses one primary home surface, one rendered/selectable Adobe Sign module, a shell-owned semantic active panel, and a responsive bento canvas with tightly governed card choreography.**

Batch 03 closes the My Work shell, navigation, hero, and dashboard UX architecture as follows:

1. **The My Work shell inherits PCC’s shell-construction logic, not PCC’s project-context semantics.**  
   The governing shell model is:
   - command surface,
   - grouped horizontal primary navigation,
   - hero band,
   - one shell-owned active `tabpanel`,
   - bento dashboard canvas below,
   - in-memory navigation state only,
   - responsive behavior resolved from container width.

2. **The MVP navigation model is deliberately narrow.**  
   It renders:
   - one primary surface: `my-work-home`,
   - one rendered/selectable module: `adobe-sign-action-queue`,
   - one tab-group launcher relationship where the module menu extends the tab bar rather than becoming a separate hero control.

3. **The shell uses module focus, not page routing.**  
   Selecting `adobe-sign-action-queue`:
   - keeps the active primary surface at `my-work-home`,
   - sets `activeModuleId = 'adobe-sign-action-queue'`,
   - swaps the bento body from home cards to Adobe-focused module cards,
   - leaves the shell header and hero visible,
   - does not add URL routing, page navigation, or modal takeover.

4. **The hero architecture is intentionally leaner than PCC’s project hero.**  
   My Work keeps the identity / summary / governance function of PCC’s hero band but **does not reproduce PCC’s project-facts row**. The My Work hero is a personal-work orientation surface, not a project metadata surface.

5. **The home dashboard choreography is now locked.**  
   - **Ready / partial-source home state:** `Work Summary` + `Adobe Sign Action Queue`.
   - **Non-ready source state:** `Work Summary` + `Adobe Sign Action Queue State` + `Source Readiness`.
   - Exact wide and standard-laptop span rules are defined in this artifact.
   - Analytics cards are **deferred** from MVP because a single-source Adobe queue does not yet justify additional dashboard analytics density.

6. **The focused Adobe module choreography is now locked.**  
   - **Ready / partial-source module state:** `Adobe Sign Queue Summary` + `Agreement Action List`.
   - **Non-ready source state:** `Adobe Sign Queue State` + `Connection / Source Guidance`.
   - Detailed filters remain module-owned, not shell-owned.

7. **My Dashboard must not create a competing personal-work platform primitive beside `@hbc/my-work-feed`.**  
   The SPFx My Work shell is a host-specific operating surface. Later read-model and backend batches must preserve the Batch 01 guardrail: reuse, bridge, or consciously constrain around the existing My Work Feed doctrine rather than silently defining a parallel enterprise work-platform model.

8. **The accessibility and responsive contract is implementation-grade.**  
   The shell must preserve:
   - tablist / tab / tabpanel semantics,
   - WAI-ARIA menu-button semantics for the module launcher,
   - clear keyboard paths,
   - visible focus,
   - reflow-safe behavior,
   - no horizontal overflow,
   - touch-credible controls,
   - shell-owned active-panel markers,
   - reduced-motion-compatible interaction styling.

---

# 1. Governing Predecessor Decisions Inherited from Batches 01 and 02

## 1.1 Batch 01 decisions carried forward

Batch 03 treats the following as binding:

| Decision area | Binding carry-forward |
|---|---|
| App boundary | My Dashboard is a **new standalone SPFx app/domain**, not a PCC extension. |
| Shell basis | PCC is the **primary shell-construction reference**. |
| Product semantics | My Dashboard is **user-contextual**; PCC is **project-contextual**. |
| HB Homepage role | HB Homepage is a **secondary communication-site/host-fit reference only**. |
| First module | `Adobe Sign Action Queue` remains the first production-shaped My Dashboard module. |
| Existing My Work platform | My Dashboard must not silently compete with `@hbc/my-work-feed`. |
| MVP posture | MVP is **shell + Adobe queue + supporting read-model/backend boundaries**, not a multi-source personal-work suite. |

## 1.2 Batch 02 decisions carried forward

Batch 03 also treats these Batch 02 decisions as binding:

| Decision area | Binding carry-forward |
|---|---|
| Host page | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard/SitePages/Home.aspx` |
| Hosting | Full-width communication-site section |
| Package | `hb-intel-my-dashboard.sppkg` |
| App root | `apps/my-dashboard/` |
| Runtime marker | `__hbIntel_myDashboard` |
| Protected backend posture | SPFx API token provider + protected bearer-token routes |
| Runtime configuration | Use the existing repo-consistent production/ui-review + backend/fixture model |
| Property pane | Do not expose backend URL, API audience, or Adobe auth settings in web-part properties |
| Read-model placement | Later batches must respect the app/client seams established in Batch 02 |

## 1.3 Batch 03 superseding refinements

Batch 03 closes several outline-level ambiguities:

| Prior outline suggestion | Batch 03 final direction |
|---|---|
| Shell state may include `previewMode` | **Do not** store preview/runtime mode in `useMyWorkShellState`; runtime mode belongs to Batch 02 config/client seams. |
| My Work shell may include a broad module launcher | MVP launcher is **tab-group attached**, not a separate hero/global launcher control. |
| Hero may include generic summary data | Hero content is now explicitly defined for home and focused-module states. |
| Home card order was recommended, not closed | Home card order, conditional rendering, and span choreography are now closed. |
| Analytics card suitability was open | Analytics cards are **deferred** from MVP. |

---

# 2. Repo-Truth Audit Method

## 2.1 Audit objective

This Batch 03 audit was designed to answer ten implementation-grade UX architecture questions:

1. What exact PCC shell anatomy should My Work inherit?
2. What exact portion of PCC navigation behavior should carry forward?
3. How should My Work handle a one-surface / one-module MVP without creating dead navigation?
4. What should the hero band own in a user-context shell?
5. What should the home dashboard render in ready, partial, and non-ready integration states?
6. What should happen when the Adobe Sign module is selected?
7. Which card/layout patterns from PCC are suitable for My Work?
8. Which HB Homepage composition lessons matter for host fit but not shell grammar?
9. What responsive and accessibility contracts should be locked before implementation?
10. What constraints must downstream batches inherit so implementation does not reopen Batch 03 decisions?

## 2.2 Authority hierarchy

The audit used this order of authority:

1. **Live repository source at commit `dca51c71e36c486e026b550d4b61dd0114888813`**
2. **Batch 01 and Batch 02 My Dashboard artifacts committed to repo**
3. **The attached My Dashboard comprehensive outline**
4. **Current repo doctrine and approved PCC remediation plans**
5. **Current external primary/authoritative sources for accessibility, SharePoint full-width hosting, responsive design, and dashboard research**

## 2.3 Core repo inspection lanes

### Lane A — PCC shell construction
Focused on:
- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/state/usePccShellState.ts`
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/shell/PccHorizontalTabs.tsx`
- `apps/project-control-center/src/shell/PccHorizontalTabs.module.css`
- `apps/project-control-center/src/shell/PccProjectHeroBand.tsx`
- `apps/project-control-center/src/shell/PccProjectHeroBand.module.css`
- `apps/project-control-center/src/shell/PccShell.module.css`

### Lane B — PCC layout, card, and selected-module behavior
Focused on:
- `apps/project-control-center/src/layout/PccBentoGrid.tsx`
- `apps/project-control-center/src/layout/footprints.ts`
- `apps/project-control-center/src/layout/useContainerBreakpoint.ts`
- `apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx`

### Lane C — PCC design doctrine and phase architecture
Focused on:
- `docs/reference/spfx-surfaces/project-control-center/PCC_Project_Control_Center_Basis_of_Design_Contract.md`
- `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b11/00_Complete_Implementation_Plan.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/00_PCC_Phase_08_Product_Experience_Enhancement_Implementation_Plan.md`

### Lane D — HB Homepage communication-site shell lessons
Focused on:
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`

### Lane E — Existing My Work architecture
Focused on:
- `packages/my-work-feed/README.md`
- `docs/architecture/adr/ADR-0115-my-work-feed-architecture.md`
- `apps/pwa/src/pages/my-work/MyWorkPage.tsx`

### Lane F — Batch 01 and Batch 02 My Dashboard artifacts
Focused on:
- `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md`
- `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md`

---

# 3. Files and Documents Inspected

## 3.1 PCC shell runtime files

| Path | Audit purpose |
|---|---|
| `apps/project-control-center/src/shell/PccShell.tsx` | Top-level command surface, hero/tab order, active tabpanel owner |
| `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` | Routed surface rendering, direct-child bento invariant |
| `apps/project-control-center/src/state/usePccShellState.ts` | In-memory primary tab/module selection state |
| `apps/project-control-center/src/PccApp.tsx` | App orchestration between shell, hero VM, router, and shell state |
| `apps/project-control-center/src/shell/PccHorizontalTabs.tsx` | Registry-driven grouped tab/module launcher behavior |
| `apps/project-control-center/src/shell/PccHorizontalTabs.module.css` | Premium command-nav visual density, active indicators, launcher panel styling |
| `apps/project-control-center/src/shell/PccProjectHeroBand.tsx` | Hero identity, summary, governance microcopy, command-slot layout |
| `apps/project-control-center/src/shell/PccProjectHeroBand.module.css` | Hero grid areas, compact/phone reshaping, summary rows |
| `apps/project-control-center/src/shell/PccShell.module.css` | Unified command-surface gradient and host-fit/canvas transition |

## 3.2 PCC layout and dashboard files

| Path | Audit purpose |
|---|---|
| `apps/project-control-center/src/layout/PccBentoGrid.tsx` | Grid context and container-aware mode resolution |
| `apps/project-control-center/src/layout/footprints.ts` | Responsive modes, span defaults, min spans, span override mechanics |
| `apps/project-control-center/src/layout/useContainerBreakpoint.ts` | ResizeObserver-backed responsive mode selection |
| `apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx` | Module-status card, selected-module context, analytics placement, direct-child bento behavior |

## 3.3 PCC design/doctrine files

| Path | Audit purpose |
|---|---|
| `PCC_Project_Control_Center_Basis_of_Design_Contract.md` | Shell-vs-bento ownership, no duplicate header cards, panel ownership |
| `PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md` | Product strategy, layout hierarchy, state model, accessibility, host fit |
| `wave-b11/00_Complete_Implementation_Plan.md` | Span override and intentional card choreography lessons |
| `wave-b13/00_PCC_Phase_08_Product_Experience_Enhancement_Implementation_Plan.md` | Product-grade command-surface polish and card-role doctrine |

## 3.4 HB Homepage reference files

| Path | Audit purpose |
|---|---|
| `HbHomepageShell.tsx` | Communication-site composition, width accounting, conformance data attributes |
| `hbHomepageContract.ts` | Shell/child ownership boundary and anti-overreach rules |

## 3.5 Existing My Work architecture files

| Path | Audit purpose |
|---|---|
| `packages/my-work-feed/README.md` | Existing canonical personal-work aggregation doctrine |
| `ADR-0115-my-work-feed-architecture.md` | Accepted architectural authority for My Work Feed |
| `apps/pwa/src/pages/my-work/MyWorkPage.tsx` | Current Personal Work Hub experience and zone model |

## 3.6 My Dashboard predecessor batch files

| Path | Audit purpose |
|---|---|
| `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Binding foundation and scope decisions |
| `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md` | Binding host, packaging, auth, runtime, and file-placement decisions |

---

# 4. PCC Shell Truth Findings

## 4.1 PCC’s implemented shell anatomy is the correct My Work starting point

Current PCC runtime establishes this shell model:

```text
PccApp
└── PccShell
    ├── Command surface
    │   ├── PccHorizontalTabs
    │   └── PccProjectHeroBand
    └── main[role="tabpanel"]
        └── PccBentoGrid
            └── Routed surface cards
```

The important implementation truth is not merely that PCC has tabs and cards. It has a clear **ownership model**:

| Layer | Owns |
|---|---|
| Shell | Surface identity, nav state, tabpanel semantics, hero orientation, canvas envelope |
| Router | Which surface/card fragment is rendered for the active nav state |
| Bento grid | Responsive card layout context |
| Cards/modules | Operational content only |

### My Work implication
My Work should use the same shell layering:

```text
MyDashboardApp
└── MyWorkShell
    ├── MyWorkCommandSurface
    │   ├── MyWorkPrimaryNavigation
    │   └── MyWorkHeroBand
    └── main[role="tabpanel"]
        └── MyWorkBentoGrid
            └── MyWorkSurfaceRouter output
```

---

## 4.2 PCC’s active-panel ownership must be copied conceptually

PCC places the active surface marker and tabpanel semantics on the shell `<main>` element:

```text
main[role="tabpanel"]
data-pcc-active-surface-panel={activePrimaryTabId}
aria-labelledby={`pcc-tab-${activePrimaryTabId}`}
```

The router explicitly states that routed bento cards are **not** the semantic active-panel owner and must remain direct children of the grid.

### My Work implication
My Work must define:

```text
main[role="tabpanel"]
data-my-work-active-surface-panel="my-work-home"
aria-labelledby="my-work-tab-my-work-home"
```

When the Adobe module is selected, the active shell panel still belongs to `my-work-home`; the module is shell state inside that panel, not a new tabpanel.

---

## 4.3 PCC navigation behavior proves grouped tab/module access is viable

`PccHorizontalTabs.tsx` and its CSS establish a productized, accessible pattern:

- primary tabs remain broad operating surfaces,
- each tab owns an adjacent dropdown toggle,
- module menus use `aria-haspopup="menu"` and `aria-expanded`,
- keyboard navigation supports:
  - Left / Right between primary tabs,
  - Home / End tablist movement,
  - ArrowDown to open a module menu,
  - ArrowUp / ArrowDown inside module menus,
  - Home / End inside module menus,
  - Escape to close and return focus,
  - Enter / Space to activate.

### My Work implication
Because MVP has only one primary surface, My Work should **not** fabricate multiple tabs. It should:

- render one primary tab group: `My Work Home`,
- attach one module launcher toggle to that tab group,
- place `Adobe Sign Action Queue` in that menu,
- preserve the same menu-button and focus-management behavior.

This is more future-ready and more consistent with PCC than inventing a separate hero-level launcher or burying module access only inside a card.

---

## 4.4 PCC state management proves in-memory nav state is sufficient

`usePccShellState.ts` proves the existing navigation model can remain:

- React state only,
- no URL routing,
- no persisted preferences,
- runtime normalization of invalid IDs,
- module selection clears/reconciles parent tab context.

### My Work implication
My Work should use a narrower sibling state hook:

```ts
interface MyWorkShellState {
  readonly activePrimarySurfaceId: 'my-work-home';
  readonly activeModuleId?: 'adobe-sign-action-queue';
}

interface MyWorkShellActions {
  selectPrimarySurface(id: 'my-work-home'): void;
  selectModule(id: 'adobe-sign-action-queue'): void;
  clearActiveModule(): void;
}
```

**Do not store runtime mode or preview mode in shell navigation state.**  
Batch 02 already governs runtime mode through app config and read-model client seams.

---

## 4.5 PCC hero architecture should be adapted, not cloned

`PccProjectHeroBand` currently includes:

- primary title,
- secondary title,
- surface description,
- project facts row,
- highlights,
- governance microcopy,
- command-search slot.

The Phase 08 refinements make the hero part of a **unified command surface**, not a detached slab.

### My Work implication
My Work should preserve the concept of:

- identity,
- context-setting description,
- summary highlights,
- governance microcopy.

But it must **not** clone PCC’s project-fact row or command-search slot unless those concepts are justified by My Dashboard. For MVP:

- **No project facts row**
- **No command search control**
- **No fake search placeholder**
- **No hero-level module launcher separate from the tab bar**

---

## 4.6 PCC’s layout system validates intentional choreography over generic auto-packing

Current PCC layout truth includes:

- eight responsive modes:
  - phone,
  - tabletPortrait,
  - tabletLandscape,
  - smallLaptop,
  - standardLaptop,
  - largeLaptop,
  - desktop,
  - ultrawide;
- container-width resolution, not viewport-only assumptions;
- column counts from 1 through 12;
- footprint-based spans;
- minimum protected spans;
- explicit per-mode span overrides that may intentionally beat defaults.

Phase 06 doctrine explicitly rejects solving composition holes through generic dense auto-flow alone.

### My Work implication
My Work should adopt the same **philosophy**:

- container-aware responsive modes,
- explicit card order,
- explicit span choreography for wide modes,
- simple stacked order on constrained layouts,
- no reliance on accidental CSS packing to preserve product hierarchy.

Because My Work is a new app domain, implementation should not import PCC app-local layout types directly. It should either:
1. create My Work-local responsive layout contracts that mirror PCC’s proven values, or
2. adopt a shared generic utility only if one is deliberately extracted later.

---

## 4.7 PCC’s selected-module context card is instructive, but not copied literally

`PccPrimaryDashboardSurface.tsx` uses:
- a module-status card,
- analytics cards,
- a selected-module context card.

This is appropriate for broad PCC surfaces with many modules.

### My Work implication
My Work MVP has:
- one primary surface,
- one rendered module,
- one Adobe queue use case.

Therefore, a generic `Selected Module` card would be redundant. The focused Adobe module state should instead render **Adobe-specific operational cards** directly:
- summary,
- list,
- state/guidance where needed.

---

## 4.8 PCC doctrine against duplicate top-level header cards applies directly

The PCC basis-of-design contract and Phase 08 implementation plan repeatedly insist:

- shell/hero owns surface identity,
- bento cards must be operational,
- first cards must not restate the surface title or generic description,
- cards should have action, status, source, or operational value.

### My Work implication
The home bento field must not begin with:
- “Welcome to My Dashboard,”
- “About My Work,”
- “Adobe Sign Overview” duplicating hero copy,
- generic explainer cards.

The shell hero performs orientation. The bento canvas performs work.

---

# 5. HB Homepage Secondary-Reference Findings

## 5.1 HB Homepage is valuable for host-fit discipline

`HbHomepageShell.tsx` demonstrates a mature communication-site shell that:

- measures and exposes width accounting,
- surfaces shell conformance and closure-proof data attributes,
- governs first-lane behavior,
- controls stacking/pairing decisions,
- tracks content-state diagnostics.

### My Work implication
My Work should preserve the idea that a shell can expose **evidence-grade runtime markers** for:
- mode,
- active panel,
- card composition,
- selected module,
- no-overflow acceptance.

This will materially help hosted Playwright validation in later batches.

---

## 5.2 HB Homepage proves the shell must not overreach into child modules

`hbHomepageContract.ts` explicitly states:

- shell owns placement, stacking, layout governance, and fallback behavior,
- child modules own their internal UI and data logic,
- the shell must not solve fit problems by redesigning child modules.

### My Work implication
The My Work shell may:
- choose where the Adobe card/module appears,
- choose which shell state is active,
- apply layout spans and regions,
- expose shell-level status slots.

The shell must **not**:
- own Adobe row filtering,
- own queue pagination,
- own source URL validation,
- own authorization messages,
- own Adobe-specific empty/error logic beyond deciding where state cards sit.

---

## 5.3 HB Homepage should not define My Work navigation grammar

HB Homepage does not provide the right model for:
- tab/module relationships,
- active-module state,
- focused module rendering,
- card gateway behavior.

### My Work implication
HB Homepage remains a **host/layout reference**, not the architectural basis for My Work interaction grammar.

---

# 6. UX and Accessibility Research Findings

## 6.1 Research source legend

| ID | Source | Use in Batch 03 |
|---|---|---|
| **W1** | Microsoft Learn — *Use web parts with the full-width column* | SharePoint full-width host-fit requirements |
| **W2** | Fluent 2 — *Layout* | Grid, spacing, hierarchy, responsive techniques |
| **W3** | Fluent 2 — *React Card usage* | Card role consistency and action placement |
| **W4** | W3C WAI-ARIA APG — *Tabs Pattern* | Tablist / tab / tabpanel semantics |
| **W5** | W3C WAI-ARIA APG — *Menu Button Pattern* | Module launcher semantics |
| **W6** | W3C WAI — *What’s New in WCAG 2.2* | Focus not obscured, target size |
| **W7** | W3C WAI — *Understanding SC 1.4.10 Reflow* | Reflow and no two-dimensional scrolling |
| **W8** | W3C WAI — *Understanding SC 2.4.13 Focus Appearance* | Focus visibility quality |
| **W9** | Rossi et al. (2025) — *From glitter to gold: recommendations for effective dashboards from design through sustainment* | Human-centered dashboard usefulness |
| **W10** | Chen et al. (2025) — *The effects of cues on task interruption recovery in a concurrent multitasking environment* | Next-action cues and interruption recovery |
| **W11** | Laxar et al. (2023) — *The influence of explainable vs non-explainable clinical decision support systems on rapid triage decisions* | Explanation/trust caution |
| **W12** | Microsoft Learn — *Designing Viva Connections custom cards for your dashboard* | Cards should surface relevant, dynamic data and avoid duplicate context |

## 6.2 Finding A — Effective dashboards must be useful, not merely information-rich

The 2025 Implementation Science dashboard review argues that dashboard impact depends on whether the intended users actually find them relevant and actionable, not merely well-populated. It identifies low-value information and weak next-step clarity as common causes of poor adoption. [W9]

### My Work design consequence
The My Work home surface should prioritize:
- “what requires my attention,”
- “what is available or unavailable,”
- “what should I open next.”

It should not prioritize:
- broad metrics with no immediate user consequence,
- decorative analytics,
- multiple speculative future modules.

---

## 6.3 Finding B — Next-action cues help users resume work after interruptions

Chen et al. found that assistant cues indicating the next action after interruptions improved performance in a multitasking environment, while retrieval cues primarily reduced workload and increased alertness. [W10]

### My Work design consequence
The Adobe queue card and focused module should make the next step obvious:
- count requiring action,
- action type,
- source-defined urgency when available,
- `Open in Adobe Sign` when a validated source URL exists.

This supports the product decision to prefer **triage + handoff** over passive queue reporting.

---

## 6.4 Finding C — Explanation can improve trust, but it should not be overstated

Laxar et al. found that explanation did not significantly increase weight-on-advice in rapid triage decisions, but self-reported trust was higher for the explaining system. [W11]

### My Work design consequence
My Work should:
- explain source posture,
- show why a state is unavailable or degraded,
- disclose that Adobe remains the action system of record.

But it should **not**:
- overclaim that explanation automatically makes decisions better,
- present advisory surfaces as authoritative action engines,
- imply source completion inside HB Intel.

---

## 6.5 Finding D — Layout hierarchy should use responsive reflow, not forced compression

Fluent 2 layout guidance emphasizes:
- spacing and proximity as hierarchy devices,
- grid coherence,
- responsive repositioning,
- resizing,
- reflow,
- show/hide,
- re-architecting layouts when needed. [W2]

### My Work design consequence
My Work should:
- use wide-mode two- and three-card choreographies where meaningful,
- reflow to stacked order on phone and tablet portrait,
- hide no essential meaning solely for aesthetics,
- avoid compressing action lists until controls become fragile.

---

## 6.6 Finding E — Cards need consistent roles and deliberate interaction contracts

Fluent 2 card guidance states that cards should hold information and actions related to a single concept/object and be used consistently for particular use cases. [W3] Microsoft’s Viva Connections card guidance similarly warns against duplicating experiences and encourages cards that surface dynamic, relevant information. [W12]

### My Work design consequence
MVP card roles are now explicit:
- Work Summary Card
- Adobe Sign Action Queue Card
- Source Readiness Card
- Adobe Sign Queue Summary Card
- Agreement Action List Card
- Adobe Sign Queue State Card
- Connection / Source Guidance Card

No catch-all “overview” card is permitted.

---

## 6.7 Finding F — Tabs and module menus have clear accessibility patterns

W3C APG defines:
- tablist / tab / tabpanel semantics,
- keyboard movement expectations,
- menu button semantics,
- `aria-haspopup`, `aria-expanded`, and menu focus patterns. [W4] [W5]

### My Work design consequence
The one-tab MVP must still use real semantics because:
- it preserves the final architecture,
- it supports future primary surfaces without refactoring semantics,
- it keeps the module launcher behavior consistent with PCC’s established pattern.

---

## 6.8 Finding G — WCAG 2.2 reinforces focus visibility, target size, and reflow

WCAG 2.2 adds focus-not-obscured and target-size expectations; WCAG reflow guidance requires content to remain usable without two-dimensional scrolling under constrained zoom/view widths. [W6] [W7] [W8]

### My Work design consequence
Implementation must validate:
- visible focus on tab, toggle, menu items, card CTAs, and filters,
- no sticky/overlay behavior obscuring focused elements,
- touch-credible CTA and toggle dimensions,
- no horizontal overflow in ordinary use,
- stacked card layouts at constrained widths.

---

# 7. Fully Developed Section 9 — Shell Architecture: My Work

## 9.1 Shell objective

The My Work shell is the **SharePoint-hosted personal operating layer** inside My Dashboard. Its purpose is to:

- orient the authenticated user,
- expose a narrow, future-extensible navigation model,
- display a concise operational home dashboard,
- support focused module rendering without leaving the shell,
- maintain strong source-authority and no-false-affordance posture.

## 9.2 Exact MVP shell anatomy

```text
MyDashboardApp
└── MyWorkShell
    ├── MyWorkCommandSurface
    │   ├── MyWorkPrimaryNavigation
    │   │   └── My Work Home tab group
    │   │       ├── Primary tab: My Work Home
    │   │       └── Attached module launcher toggle
    │   │           └── Menu item: Adobe Sign Action Queue
    │   └── MyWorkHeroBand
    │       ├── Identity block
    │       ├── Summary highlights
    │       └── Governance microcopy
    └── MyWorkCanvas
        └── main[role="tabpanel"]
            └── MyWorkBentoGrid
                └── MyWorkSurfaceRouter output
```

## 9.3 Exact shell component boundary

### Shell-owned
The shell owns:
- command-surface envelope,
- primary navigation row,
- module launcher placement,
- hero band,
- active panel semantics,
- active surface/module nav state,
- responsive shell mode marker,
- bento grid region.

### Router-owned
The router owns:
- whether the active shell state renders:
  - `MyWorkHomeSurface`, or
  - `AdobeSignActionQueueModuleSurface`.

### Module-owned
The Adobe module owns:
- read-model rendering,
- list row structure,
- filters,
- empty/configuration/authorization/source-unavailable states,
- CTA visibility,
- source-open link behavior,
- future pagination details.

## 9.4 Shell view-state vocabulary

The shell must derive exactly two UX view states:

| View state | Condition | Bento output |
|---|---|---|
| `home` | `activeModuleId` is undefined | `MyWorkHomeSurface` |
| `focused-module` | `activeModuleId === 'adobe-sign-action-queue'` | `AdobeSignActionQueueModuleSurface` |

Recommended inspectable marker:

```text
data-my-work-view-state="home" | "focused-module"
```

## 9.5 Semantic ownership contract

### Required shell panel
```tsx
<main
  id="my-work-active-surface-panel"
  role="tabpanel"
  aria-labelledby="my-work-tab-my-work-home"
  data-my-work-active-surface-panel="my-work-home"
>
```

### Non-negotiable rule
No dashboard card and no Adobe module component may carry:
```text
data-my-work-active-surface-panel
```

The shell panel is the sole semantic owner.

## 9.6 Exact data-attribute contract

| Attribute | Owner | Purpose |
|---|---|---|
| `data-my-work-shell` | shell root | Stable shell selector |
| `data-my-work-shell-mode` | shell root | Responsive mode |
| `data-my-work-view-state` | shell root | `home` vs. `focused-module` |
| `data-my-work-command-surface` | command surface | Shell top-region evidence |
| `data-my-work-primary-navigation` | nav row | Nav evidence |
| `data-my-work-tab-id` | primary tab | Active-tab evidence |
| `data-my-work-tab-active` | primary tab | Selected-state evidence |
| `data-my-work-module-launcher` | launcher toggle | Launcher evidence |
| `data-my-work-module-menu` | menu panel | Open menu evidence |
| `data-my-work-module-menu-item` | menu item | Module nav evidence |
| `data-my-work-module-active` | menu item | Active module evidence |
| `data-my-work-hero` | hero region | Hero evidence |
| `data-my-work-hero-primary-title` | hero | Copy verification |
| `data-my-work-hero-secondary-title` | hero | Copy verification |
| `data-my-work-hero-description` | hero | Copy verification |
| `data-my-work-hero-highlight` | hero highlight | Summary evidence |
| `data-my-work-hero-governance-copy` | hero microcopy | Source/no-writeback evidence |
| `data-my-work-canvas` | shell canvas | Layout evidence |
| `data-my-work-active-surface-panel` | panel main only | Semantic ownership |
| `data-my-work-bento-grid` | grid | Card composition evidence |
| `data-my-work-card` | card root | Per-card evidence |
| `data-my-work-card-role` | card root | Card taxonomy |
| `data-my-work-module` | focused module root | Focused module evidence |
| `data-my-work-adobe-sign-queue` | Adobe queue cards/module root | Adobe queue proof |

## 9.7 No command search in MVP

### Closed decision
My Work MVP must **not** render:
- a disabled command search,
- a fake search capsule,
- an unimplemented command-input preview.

### Rationale
The MVP has:
- one surface,
- one live module,
- no broad command catalog.

A fake or inert search control would add false affordance and dilute the shell’s first-release clarity.

## 9.8 Visual direction inherited from PCC

The My Work command surface should inherit PCC’s **composition intent**, not necessarily identical CSS:

- top navigation and hero read as one shell slab,
- shell top region feels premium and intentional,
- light operational canvas begins only after the command surface,
- cards below feel operational rather than editorial.

## 9.9 Analytics posture

### Closed decision
Do **not** add analytics cards to the My Work MVP home or Adobe module state.

### Rationale
A single-source Adobe action queue does not yet justify:
- chart density,
- interpretive trend panels,
- analytics cards that may appear more authoritative than the data posture supports.

Analytics may be reconsidered when:
- multiple personal work sources exist,
- queue aging metrics are source-backed,
- or action-priority read models materially benefit from visual summarization.

---

# 8. Fully Developed Section 10 — My Work Navigation Model

## 10.1 Navigation registry namespace

Create the future implementation target:

```text
packages/models/src/myWork/MyWorkNavigation.ts
```

This file should define the shell’s navigation metadata and state vocabulary. It must not implement UI or data fetching.

## 10.2 Exact MVP primary surface registry

```ts
export const MY_WORK_PRIMARY_SURFACE_IDS = ['my-work-home'] as const;
export type MyWorkPrimarySurfaceId =
  (typeof MY_WORK_PRIMARY_SURFACE_IDS)[number];
```

### Primary surface record
```ts
{
  id: 'my-work-home',
  label: 'My Work Home',
  dashboardTitle: 'My Work',
  dashboardDescription:
    'Your personal command surface for work requiring attention across connected HB systems.',
  modules: ['adobe-sign-action-queue']
}
```

## 10.3 Exact MVP module registry

```ts
export const MY_WORK_MODULE_IDS = ['adobe-sign-action-queue'] as const;
export type MyWorkModuleId =
  (typeof MY_WORK_MODULE_IDS)[number];
```

### Module record
```ts
{
  id: 'adobe-sign-action-queue',
  label: 'Adobe Sign Action Queue',
  parentSurfaceId: 'my-work-home',
  state: 'read-only',
  stateLabel: 'Read-only',
  selectable: true,
  sourceSystem: 'Adobe Sign',
  summary:
    'Agreements in Adobe Sign that require your review, signature, approval, or other source-defined action.',
  authorityCue:
    'Queue visibility only. Agreement actions remain in Adobe Sign.'
}
```

## 10.4 State vocabulary

The navigation/read-model architecture must recognize the following vocabulary:

```ts
export const MY_WORK_MODULE_STATES = [
  'available',
  'preview',
  'read-only',
  'configuration-required',
  'authorization-required',
  'principal-unresolved',
  'source-unavailable',
  'deferred'
] as const;
```

### Closed semantic interpretation
| State | Usage |
|---|---|
| `read-only` | Static navigation posture for Adobe queue in shell registry |
| `configuration-required` | Read-model / content state when integration is not configured |
| `authorization-required` | Read-model / content state when the user must authorize or reauthorize |
| `principal-unresolved` | Read-model / content state when actor-to-Adobe mapping cannot be resolved |
| `source-unavailable` | Read-model / content state for source outage or unavailable response |
| `partial` | Envelope/source-status concept, not module registry state, used by read-model batches |
| `available` | Future module registry state where interaction posture is broader than read-only |
| `preview` | Future non-production or demonstration modules |
| `deferred` | Future planned but not rendered/selectable in MVP |

## 10.5 Why the Adobe menu item is `read-only`

The module is **selectable** but **read-only in HB Intel** because:
- My Dashboard may display queue data,
- the user may open Adobe Sign source links,
- the user does not sign, approve, cancel, or mutate Adobe agreements inside My Dashboard.

This distinction prevents the shell menu from implying action execution inside HB Intel.

## 10.6 Exact MVP navigation interactions

| User interaction | Shell state outcome | UI outcome |
|---|---|---|
| Click `My Work Home` tab | `activeModuleId = undefined` | Home dashboard cards render |
| Keyboard activate `My Work Home` tab | Same | Same |
| Open module launcher toggle | No route change | Menu opens |
| Select `Adobe Sign Action Queue` | `activeModuleId = 'adobe-sign-action-queue'` | Focused Adobe module cards render |
| Click `View queue` on home card | Same module selection as above | Focused Adobe module cards render |
| Press Escape in open module menu | Menu closes, focus returns to toggle/tab group | No state change |
| Invalid module id | Normalize to no module selection | Stay on home dashboard |

## 10.7 Exact module launcher placement

### Closed decision
The Adobe module launcher:
- is attached to the `My Work Home` tab group,
- does not appear as a separate hero CTA,
- does not float as a detached command-surface button,
- does not replace the home card gateway.

This preserves the grouped tab/module navigation model previously established in PCC.

## 10.8 Module menu content

MVP menu item row must display:
- label,
- state label: `Read-only`,
- summary,
- authority cue.

Recommended menu-row copy:

| Field | Text |
|---|---|
| Label | Adobe Sign Action Queue |
| State | Read-only |
| Summary | Agreements requiring your action in Adobe Sign |
| Authority cue | Queue visibility only. Agreement actions remain in Adobe Sign. |

## 10.9 No speculative future modules rendered in MVP

The architecture may reserve future taxonomy for:
- My Responsibilities,
- Pending Approvals,
- Deadlines,
- External Platform Work Queue Summary,
- broader multi-source work aggregation.

But the MVP menu and home UI must not render placeholders for them.

## 10.10 Future taxonomy boundary with `@hbc/my-work-feed`

Later batches must ensure the navigation registry:
- does not redefine canonical work-item aggregation,
- does not create counts or semantics that contradict My Work Feed,
- uses module/surface language suited to the SPFx host while respecting broader platform doctrine.

---

# 9. Fully Developed Section 11 — Hero and My Work Home Surface Specification

## 11.1 Hero purpose

The My Work hero is not a project metadata slab. Its purpose is to:
- orient the authenticated user,
- declare the current shell state,
- provide concise personal-work summary context,
- communicate source/read-only authority posture.

## 11.2 Exact home hero copy

### Home state: `activeModuleId` undefined

| Hero element | Final text |
|---|---|
| Primary title | `My Dashboard` |
| Secondary title | `My Work` |
| Description | `Your personal command surface for work requiring attention across connected HB systems.` |

## 11.3 Exact focused-module hero copy

### Focused state: `activeModuleId === 'adobe-sign-action-queue'`

| Hero element | Final text |
|---|---|
| Primary title | `My Dashboard` |
| Secondary title | `Adobe Sign Action Queue` |
| Description | `Agreements in Adobe Sign that require your review, signature, approval, or other source-defined action.` |

## 11.4 Hero summary architecture

### Home hero highlights
The home hero should show only shell-level personal-work summary information:

| Highlight | Source expectation |
|---|---|
| `Actionable items` | My Work home read model total |
| `Connected sources` | My Work home read model connected source count |
| `Source health` | Available / partial / degraded summary |
| `Last refreshed` | Generated timestamp |

### Focused Adobe hero highlights
The focused hero should avoid duplicating the detailed queue summary card. It may show:

| Highlight | Source expectation |
|---|---|
| `Queue state` | Available / partial / auth required / unavailable |
| `Pending items` | Total pending count only |
| `Last refreshed` | Generated timestamp |
| `Action system` | `Adobe Sign` |

### Explicit anti-duplication rule
Do **not** repeat in the hero:
- awaiting signature count,
- awaiting approval count,
- awaiting other-action count,
- filter counts,
- list paging counts.

Those belong to the Adobe summary/list cards.

## 11.5 Governance microcopy

### Home hero governance microcopy
Use:

```text
Read-only work visibility · Source actions remain in their governing systems.
```

### Focused Adobe hero governance microcopy
Use:

```text
Queue visibility only · Agreement actions remain in Adobe Sign.
```

If later copy refinement is needed, the meaning must remain unchanged.

## 11.6 No PCC-style project facts row

### Closed decision
The My Work hero must **not** include a PCC-like project facts row.

### Rationale
My Dashboard is user-contextual. A project-facts row would be:
- semantically false,
- visually derivative without purpose,
- an unnecessary shell-weight addition.

## 11.7 My Work home surface card taxonomy

The MVP home surface uses only the following card roles:

| Card | Role |
|---|---|
| Work Summary Card | Personal-work shell summary |
| Adobe Sign Action Queue Card | Primary queue module gateway |
| Source Readiness Card | Conditional explanation only when source state is not fully ready |

No other home cards render in MVP.

## 11.8 Home surface ready / partial-source choreography

### Rendering condition
Use this layout when home read model is:
- `available`, or
- `partial`.

### Card order
1. `Work Summary Card`
2. `Adobe Sign Action Queue Card`

### 12-column modes
| Card | Span |
|---|---:|
| Work Summary | 4 |
| Adobe Sign Action Queue | 8 |

### 10-column standard laptop
| Card | Span |
|---|---:|
| Work Summary | 3 |
| Adobe Sign Action Queue | 7 |

### Tablet / phone
- stack Work Summary first,
- Adobe queue second,
- preserve this narrative order.

## 11.9 Home surface non-ready choreography

### Rendering condition
Use this layout when source state is:
- `configuration-required`,
- `authorization-required`,
- `principal-unresolved`,
- `source-unavailable`,
- `backend-unavailable`.

### Card order
1. `Work Summary Card`
2. `Adobe Sign Action Queue State Card`
3. `Source Readiness Card`

### 12-column modes
| Card | Span |
|---|---:|
| Work Summary | 3 |
| Adobe Sign Action Queue State | 6 |
| Source Readiness | 3 |

### 10-column standard laptop
| Card | Span |
|---|---:|
| Work Summary | 3 |
| Adobe Sign Action Queue State | 4 |
| Source Readiness | 3 |

### Tablet / phone
- stack in the same order,
- Source Readiness remains visible because the non-ready condition is the key explanatory state.

## 11.10 Work Summary Card specification

### Purpose
Provide a concise high-level personal-work readout that is not Adobe-only.

### Required content
- Title: `Work summary`
- Total actionable item count
- Source state summary
- Latest refresh timestamp
- Short copy explaining that this dashboard surfaces work requiring attention

### Required state behavior
If the only MVP source is unavailable:
- counts may display as unknown/unavailable rather than `0`,
- the card must not imply “no work exists” when data could not be fetched.

## 11.11 Adobe Sign Action Queue Card specification

### Purpose
Act as the primary home gateway into the Adobe focused module.

### Required ready-state content
- Title: `Adobe Sign Action Queue`
- Total pending count
- Top 3–5 agreement preview rows or compact queue summary, depending on later Batch 05 UI specifics
- CTA: `View queue`
- Source-authority cue: `Agreement actions remain in Adobe Sign.`

### Required partial-state content
If queue data is partial:
- retain `View queue`,
- visibly explain partial source state,
- do not overstate completeness.

### Required non-ready state
When non-ready:
- render as `Adobe Sign Action Queue State Card`,
- use state-specific copy,
- keep the module selection CTA only when selecting the module leads to a useful state screen,
- do not imply queue contents are available if they are not.

## 11.12 Source Readiness Card specification

### Purpose
Explain why Adobe queue content is not fully ready.

### Render only when
- configuration is missing,
- authorization is missing/expired,
- principal resolution fails,
- source is unavailable,
- backend transport is unavailable.

### Required content
- State label,
- plainspoken explanation,
- governed next-step copy,
- no technical stack traces,
- no tokens, IDs, or implementation detail.

---

# 10. Adobe Sign Focused Module Shell-Placement Rules

## 10.1 Focused module activation

The focused module state begins when:

```ts
activeModuleId === 'adobe-sign-action-queue'
```

It may be triggered by:
- module menu selection,
- `View queue` on the home card.

## 10.2 Focused module ready / partial choreography

### Rendering condition
Use when Adobe queue read model is:
- `available`, or
- `partial`.

### Card order
1. `Adobe Sign Queue Summary Card`
2. `Agreement Action List Card`

### 12-column modes
| Card | Span |
|---|---:|
| Adobe Sign Queue Summary | 4 |
| Agreement Action List | 8 |

### 10-column standard laptop
| Card | Span |
|---|---:|
| Adobe Sign Queue Summary | 3 |
| Agreement Action List | 7 |

### Tablet / phone
- summary card first,
- list card second.

## 10.3 Focused module non-ready choreography

### Rendering condition
Use when Adobe queue read model is:
- `configuration-required`,
- `authorization-required`,
- `principal-unresolved`,
- `source-unavailable`,
- `backend-unavailable`.

### Card order
1. `Adobe Sign Queue State Card`
2. `Connection / Source Guidance Card`

### 12-column modes
| Card | Span |
|---|---:|
| Adobe Sign Queue State | 8 |
| Connection / Source Guidance | 4 |

### 10-column standard laptop
| Card | Span |
|---|---:|
| Adobe Sign Queue State | 6 |
| Connection / Source Guidance | 4 |

### Tablet / phone
- state card first,
- guidance card second.

## 10.4 Partial state rule

If source state is `partial`:
- continue to render summary + list,
- show a module-owned partial-state notice,
- do not replace the list with a full-screen warning,
- do not create a third standalone state card unless later Batch 05 proves it materially improves clarity.

## 10.5 Module-owned filters

The focused module list card owns filters:

```text
All | Signature | Approval | Other action
```

The filters:
- are not shell navigation,
- must not mutate the shell’s active module state,
- must remain inside the Agreement Action List Card,
- should preserve current list context without moving the user out of the module.

## 10.6 Source-open CTA rule

Row-level CTA:

```text
Open in Adobe Sign
```

Render only when backend provides a validated `sourceOpenUrl`.

### Prohibited
- no guessed Adobe URLs,
- no client-generated agreement URLs,
- no “Open in Adobe Sign” disabled buttons that imply a hidden route when none exists.

If a validated row-level URL does not exist:
- suppress row CTA,
- allow later Batch 05 to decide whether a general source launch link exists, provided it is truthful and separately governed.

## 10.7 Module back-path

When the user is focused on Adobe:
- selecting `My Work Home` returns to home cards,
- the hero remains visible,
- module focus is cleared,
- no browser back-route dependency is required.

## 10.8 No modal takeover

The focused Adobe module must render within the active shell panel. It must not:
- open as a modal,
- replace the full SharePoint page,
- navigate to a separate app page,
- use URL state for MVP.

---

# 11. Responsive Composition and Bento Choreography Contract

## 11.1 Responsive policy

My Work should mirror PCC’s proven eight-mode container-aware responsive policy:

```text
phone
tabletPortrait
tabletLandscape
smallLaptop
standardLaptop
largeLaptop
desktop
ultrawide
```

Implementation may define My Work-local types/constants, but the behavioral intent should remain aligned.

## 11.2 Container-aware measurement

### Closed decision
Resolve shell layout from the rendered container width, not raw browser viewport width.

### Rationale
My Dashboard lives inside SharePoint communication-site chrome, and actual usable content width can vary materially from raw viewport width.

## 11.3 Wide-mode choreography principles

At 10–12-column modes:
- prioritize two- or three-card narrative rows,
- keep the primary queue/list card dominant,
- avoid equal-weight card monotony,
- keep explanatory support cards narrower than primary operational cards.

## 11.4 Compact-mode choreography principles

At tablet portrait and phone:
- stack cards in semantic priority order,
- maintain CTA visibility,
- never rely on hover to reveal critical meaning,
- keep filters reachable,
- preserve clear scroll order:
  - shell nav,
  - hero,
  - operational cards.

## 11.5 No horizontal overflow

The shell, hero, launcher menu, and bento canvas must not introduce ordinary horizontal overflow.

Later evidence must test:
- shell root,
- command surface,
- hero,
- active panel,
- bento grid,
- Adobe list card.

## 11.6 Conditional card rendering avoids dead visual regions

Source Readiness renders only when source-state explanation is meaningful. This keeps the ready-state home dashboard compact and avoids filler UI.

## 11.7 Span overrides are permitted but controlled

My Work may use typed per-mode span overrides to implement the choreography tables in this artifact. Those overrides must be:
- card-specific,
- testable,
- clamped to available columns,
- inspectable through data attributes if the implementation pattern follows PCC.

---

# 12. Accessibility and Interaction Requirements

## 12.1 Tablist semantics

### Required
- `role="tablist"` on the primary navigation container
- `role="tab"` on the `My Work Home` tab
- `aria-selected`
- `aria-controls`
- `tabIndex` management
- `role="tabpanel"` on the shell main panel
- `aria-labelledby` from panel to active tab

## 12.2 Module launcher semantics

### Required
- native button toggle
- `aria-haspopup="menu"`
- `aria-expanded`
- `aria-controls`
- role `menu` on menu panel
- role `menuitem` on selectable module item

## 12.3 Keyboard behavior

### Required MVP behavior
| Element | Keyboard behavior |
|---|---|
| Primary tab | Enter / Space returns to home state |
| Tablist | Home / End valid even with one current tab; preserve pattern for future extension |
| Module launcher toggle | ArrowDown opens menu and moves focus into first item |
| Module menu | ArrowUp / ArrowDown cycles items |
| Module menu | Home / End jumps to first/last item |
| Module menu | Escape closes menu and returns focus |
| Module item | Enter / Space selects focused module |

## 12.4 Visible focus

Focus indicators must be visibly distinct on:
- primary tab,
- module launcher toggle,
- menu items,
- card CTAs,
- module filters,
- source-open links.

## 12.5 Focus not obscured

Do not allow command surface, menu panels, or any sticky element to entirely hide the currently focused element.

## 12.6 Target size and pointer comfort

Module toggle, card CTAs, filter buttons, and row CTAs must meet touch-credible sizing and spacing. Use WCAG 2.2 target-size guidance as a minimum accessibility reference.

## 12.7 Reflow

At constrained widths and zoom:
- no two-dimensional scrolling is required for ordinary shell/card reading,
- cards reflow or stack,
- module menu remains usable,
- list rows remain readable without destructive compression.

## 12.8 Reduced motion

Any tab indicator, menu transition, or CTA state animation must:
- remain subtle,
- respect `prefers-reduced-motion`,
- retain clarity without animation.

## 12.9 No color-only meaning

Available, read-only, warning, authorization-required, and unavailable states must be expressed through:
- text,
- labels,
- optional iconography if later included,
- not color alone.

---

# 13. Closed Decision Tables

## 13.1 Shell decisions

| ID | Decision | Final direction |
|---|---|---|
| S-01 | Shell basis | PCC shell-construction principles |
| S-02 | Host-context reference | HB Homepage secondary only |
| S-03 | Command surface | Navigation row + hero band |
| S-04 | Active panel owner | Shell `main[role="tabpanel"]` only |
| S-05 | Bento field | Operational content only |
| S-06 | Search | No command search in MVP |
| S-07 | View states | `home` and `focused-module` |
| S-08 | Analytics | Deferred from MVP |
| S-09 | Runtime mode state | Not stored in shell navigation state |

## 13.2 Navigation decisions

| ID | Decision | Final direction |
|---|---|---|
| N-01 | Primary surfaces rendered in MVP | One: `my-work-home` |
| N-02 | Modules rendered in MVP | One: `adobe-sign-action-queue` |
| N-03 | Module launcher placement | Attached to `My Work Home` tab group |
| N-04 | Page routing | None |
| N-05 | URL state | None |
| N-06 | Module selection result | Focused module rendered inside same shell panel |
| N-07 | Invalid IDs | Normalize safely back to home/no module |
| N-08 | Future modules | Reserved architecturally, not rendered in MVP |

## 13.3 Hero decisions

| ID | Decision | Final direction |
|---|---|---|
| H-01 | Home title | `My Dashboard` / `My Work` |
| H-02 | Focused module title | `My Dashboard` / `Adobe Sign Action Queue` |
| H-03 | Project facts row | Omitted |
| H-04 | Hero summary | High-level shell/work summary only |
| H-05 | Adobe detailed counts in hero | Prohibited; belong in module summary card |
| H-06 | Governance microcopy | Source/no-writeback posture shown in hero |

## 13.4 Home surface decisions

| ID | Decision | Final direction |
|---|---|---|
| D-01 | Ready home cards | Work Summary + Adobe Queue |
| D-02 | Non-ready home cards | Work Summary + Adobe Queue State + Source Readiness |
| D-03 | Ready 12-col row | 4 + 8 |
| D-04 | Ready 10-col row | 3 + 7 |
| D-05 | Non-ready 12-col row | 3 + 6 + 3 |
| D-06 | Non-ready 10-col row | 3 + 4 + 3 |
| D-07 | Source Readiness card | Conditional only when meaningful |
| D-08 | Generic welcome/header card | Prohibited |

## 13.5 Focused Adobe decisions

| ID | Decision | Final direction |
|---|---|---|
| A-01 | Ready module cards | Summary + Agreement Action List |
| A-02 | Non-ready module cards | Queue State + Connection Guidance |
| A-03 | Ready 12-col row | 4 + 8 |
| A-04 | Ready 10-col row | 3 + 7 |
| A-05 | Non-ready 12-col row | 8 + 4 |
| A-06 | Non-ready 10-col row | 6 + 4 |
| A-07 | Filters | Module-owned list filters |
| A-08 | Row CTA | `Open in Adobe Sign` only with validated backend URL |
| A-09 | Modal takeover | Prohibited |

---

# 14. Downstream Constraints for Batches 04–08

## 14.1 Batch 04 — My Work models and read-model architecture

Batch 04 must preserve:
- `my-work-home` as the only primary MVP surface,
- `adobe-sign-action-queue` as the only rendered/selectable module,
- hero summary fields needed by Batch 03,
- home and focused module read-model states needed by the card choreography,
- the guardrail against inventing a competing personal-work platform beside `@hbc/my-work-feed`.

Batch 04 must explicitly decide whether My Dashboard:
- bridges to existing My Work Feed doctrine through aligned types,
- consumes existing primitives where feasible,
- or uses a constrained narrow queue envelope with clear non-overlap rules.

## 14.2 Batch 05 — Adobe Sign UI module specification

Batch 05 must implement within the placement rules already closed here:
- home queue card,
- focused summary card,
- focused list card,
- queue state card,
- source guidance card,
- filters inside the list card,
- validated-source CTA rules.

Batch 05 must not:
- alter shell navigation grammar,
- introduce modal focus takeover,
- add hero-level Adobe controls,
- add analytics cards.

## 14.3 Batch 06 — Backend read-model host

Batch 06 must return enough normalized data to support:
- home hero summary,
- home work summary card,
- Adobe queue preview/card,
- focused queue summary,
- focused list rows,
- source readiness/state copy.

Backend shape must preserve:
- generated timestamps,
- source status,
- partial warnings,
- no guessed source URLs,
- safe actor-derived user context.

## 14.4 Batch 07 — Adobe OAuth / live integration backbone

Batch 07 must not reopen:
- shell state,
- navigation posture,
- focused-module placement,
- read-only/handoff UI authority.

OAuth and principal-resolution outcomes must map into the existing Batch 03 state choreography:
- authorization-required,
- principal-unresolved,
- source-unavailable,
- configuration-required.

## 14.5 Batch 08 — Hosted SharePoint deployment and evidence

Batch 08 must validate:
- canonical host page,
- full-width hosted render,
- command surface present,
- one active panel marker on shell main,
- home and focused-module transitions,
- module launcher keyboard interaction,
- hero text state changes,
- no horizontal overflow,
- responsive choreography at agreed widths,
- focus visibility,
- reflow and touch viability,
- source CTA truthfulness.

## 14.6 No downstream batch may casually reopen these decisions

A later batch may supersede a Batch 03 decision only if:
1. repo truth materially changes,
2. a new dependency or source-state requirement makes the current decision impossible,
3. the change is explicitly documented as a superseding planning decision.

Otherwise, Batch 03 is binding for My Work shell/navigation/hero/dashboard composition.

---

# 15. Proposed Component Map for Later Implementation

The exact component file placement remains downstream implementation work, but the architecture now implies:

```text
apps/my-dashboard/src/
├── MyDashboardApp.tsx
├── shell/
│   ├── MyWorkShell.tsx
│   ├── MyWorkCommandSurface.tsx
│   ├── MyWorkPrimaryNavigation.tsx
│   ├── MyWorkHeroBand.tsx
│   └── MyWorkSurfaceRouter.tsx
├── state/
│   └── useMyWorkShellState.ts
├── layout/
│   ├── MyWorkBentoGrid.tsx
│   └── myWorkFootprints.ts
├── surfaces/
│   └── home/
│       ├── MyWorkHomeSurface.tsx
│       ├── WorkSummaryCard.tsx
│       └── SourceReadinessCard.tsx
└── modules/
    └── adobeSign/
        ├── AdobeSignActionQueueHomeCard.tsx
        ├── AdobeSignActionQueueModuleSurface.tsx
        ├── AdobeSignQueueSummaryCard.tsx
        ├── AdobeSignAgreementActionListCard.tsx
        ├── AdobeSignQueueStateCard.tsx
        └── AdobeSignConnectionGuidanceCard.tsx
```

This map is a planning guide, not a code freeze. It exists to show the implementation architecture implied by the closed Batch 03 decisions.

---

# 16. Acceptance Criteria for the Final Comprehensive Plan

A later final comprehensive plan should be considered aligned with Batch 03 only if it preserves all of the following:

1. PCC-inspired shell architecture without PCC project-context leakage.
2. One primary home surface and one rendered/selectable Adobe module at MVP.
3. Tab-group-attached module launcher, not a detached hero/global launcher.
4. No command search in MVP.
5. Shell-owned active tabpanel marker.
6. Hero home/focused-module copy logic as defined here.
7. Home ready/non-ready card choreography as defined here.
8. Focused Adobe ready/non-ready card choreography as defined here.
9. Analytics deferred from MVP.
10. No competing personal-work platform primitive beside `@hbc/my-work-feed`.
11. Responsive and accessibility requirements treated as implementation gates.
12. Downstream batches constrained by these decisions.

---

# 17. Reference Sources

## 17.1 Repo sources audited

- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/state/usePccShellState.ts`
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/shell/PccHorizontalTabs.tsx`
- `apps/project-control-center/src/shell/PccHorizontalTabs.module.css`
- `apps/project-control-center/src/shell/PccProjectHeroBand.tsx`
- `apps/project-control-center/src/shell/PccProjectHeroBand.module.css`
- `apps/project-control-center/src/shell/PccShell.module.css`
- `apps/project-control-center/src/layout/PccBentoGrid.tsx`
- `apps/project-control-center/src/layout/footprints.ts`
- `apps/project-control-center/src/layout/useContainerBreakpoint.ts`
- `apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx`
- `packages/models/src/pcc/PccPrimaryNavigation.ts`
- `packages/my-work-feed/README.md`
- `docs/architecture/adr/ADR-0115-my-work-feed-architecture.md`
- `apps/pwa/src/pages/my-work/MyWorkPage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `docs/reference/spfx-surfaces/project-control-center/PCC_Project_Control_Center_Basis_of_Design_Contract.md`
- `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b11/00_Complete_Implementation_Plan.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b13/00_PCC_Phase_08_Product_Experience_Enhancement_Implementation_Plan.md`
- `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md`
- `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md`

## 17.2 External sources

**[W1]** Microsoft Learn. *Use web parts with the full-width column.*  
https://learn.microsoft.com/en-my/sharepoint/dev/spfx/web-parts/basics/use-web-parts-full-width-column

**[W2]** Fluent 2 Design System. *Layout.*  
https://fluent2.microsoft.design/layout

**[W3]** Fluent 2 Design System. *React Card usage.*  
https://fluent2.microsoft.design/components/web/react/core/card/usage

**[W4]** W3C WAI-ARIA Authoring Practices. *Tabs Pattern.*  
https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

**[W5]** W3C WAI-ARIA Authoring Practices. *Menu Button Pattern.*  
https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/

**[W6]** W3C WAI. *What’s New in WCAG 2.2.*  
https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/

**[W7]** W3C WAI. *Understanding Success Criterion 1.4.10: Reflow.*  
https://www.w3.org/WAI/WCAG21/Understanding/reflow

**[W8]** W3C WAI. *Understanding Success Criterion 2.4.13: Focus Appearance.*  
https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html

**[W9]** Rossi, F. S., Adams, M. C. B., Aarons, G., et al. (2025). *From glitter to gold: recommendations for effective dashboards from design through sustainment.* Implementation Science, 20, Article 16.  
https://link.springer.com/article/10.1186/s13012-025-01430-x

**[W10]** Chen, Y., Zhang, C., Fang, W., et al. (2025). *The effects of cues on task interruption recovery in a concurrent multitasking environment.* Scientific Reports, 15, Article 25992.  
https://www.nature.com/articles/s41598-025-09358-4

**[W11]** Laxar, D., Eitenberger, M., Maleczek, M., et al. (2023). *The influence of explainable vs non-explainable clinical decision support systems on rapid triage decisions: a mixed methods study.* BMC Medicine, 21, Article 359.  
https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-023-03068-2

**[W12]** Microsoft Learn. *Designing Viva Connections custom cards for your dashboard.*  
https://learn.microsoft.com/en-us/sharepoint/dev/spfx/viva/design/designing-card
