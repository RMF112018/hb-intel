# 00 — Wave B Repo-Truth Audit Findings

## Objective

Document current repository truth for Wave B — Shell, Host Fit, and Navigation — and define the remediation facts the local code agent must use before making runtime changes.


## Repo-Truth Basis Used for Package Preparation

This package was prepared from GitHub repo truth on `main` for `RMF112018/hb-intel` at the visible search/fetch result commit family `a79d62155...`, plus the attached controlling prompt. It does not claim local command execution, browser visual validation, or tenant-hosted validation.

Primary evidence inspected:

- `apps/project-control-center/README.md`
- `apps/project-control-center/package.json`
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/state/usePccShellState.ts`
- `apps/project-control-center/src/preview/projectPlaceholder.ts`
- `apps/project-control-center/src/shell/PccShell.tsx`
- `apps/project-control-center/src/shell/PccShell.module.css`
- `apps/project-control-center/src/shell/PccNavigationRail.tsx`
- `apps/project-control-center/src/shell/PccNavigationRail.module.css`
- `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx`
- `apps/project-control-center/src/shell/PccProjectIntelligenceHeader.module.css`
- `apps/project-control-center/src/shell/PccCommandSearch.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/layout/PccBentoGrid.tsx`
- `apps/project-control-center/src/layout/PccBentoGrid.module.css`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/README.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-a/docs/00_WAVE_A_REPO_TRUTH_AUDIT_FINDINGS.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-a/prompts/Prompt_02_Shared_Shell_Host_Fit_And_Navigation.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
- `docs/reference/ui-kit/standards/SPFx-Breakpoint-and-Container-Fit-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Host-Runtime-Validation-Standard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

Local agent must refresh this list using local filesystem truth before modifying source.


## Wave 15A / Wave A Inputs Found

| Input | Status | Notes |
| --- | --- | --- |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/README.md` | Found | Defines Wave 15A as a dedicated UI doctrine remediation wave targeting evidence-backed 56/56. |
| `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/` | Found by repo search | Canonical blueprint path exists, including prompt closeouts. |
| `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-a/` | Found | Wave A package exists as the immediate planning baseline. |
| `wave-a/docs/00_WAVE_A_REPO_TRUTH_AUDIT_FINDINGS.md` | Found | Contains broad repo-truth baseline and known issues. |
| `wave-a/prompts/Prompt_02_Shared_Shell_Host_Fit_And_Navigation.md` | Found | Prior Wave A prompt covers same general domain but is too thin for this Wave B execution package. |
| Screenshot evidence | Not confirmed | No Wave B screenshot evidence was inspected. Local agent must create it. |
| Tenant-hosted evidence | Not confirmed | Host-fit evidence is required before Wave B closeout. |

## Confirmed Current Source Facts

1. `PccApp.tsx` wires `PccShell` with placeholder project context and renders `PccSurfaceRouter` as shell children.
2. `usePccShellState.ts` owns `activeSurfaceId`, `previewMode: true`, and `selectedProjectId`; it has no URL routing, persistence, or tenant-derived project context.
3. `projectPlaceholder.ts` supplies generic placeholder text and status pills, not a true persistent project identity.
4. `PccShell.tsx` is the shared frame and stamps `data-pcc-shell="wave-2"`.
5. `PccShell.module.css` uses `min-height: 100vh` and a simple flex layout with no explicit SharePoint host/edit-mode fit contract.
6. `PccNavigationRail.tsx` renders the eight MVP surfaces from `PCC_MVP_SURFACE_IDS` as a flat list; it has keyboard arrow focus logic and per-surface workflow signal data attributes.
7. `PccNavigationRail.module.css` fixes the expanded rail width at `196px`, uses a visible brand block, and hides the nav list entirely for `hamburger` mode.
8. `PccProjectIntelligenceHeader.tsx` renders subtitle, project name, active surface context, command search, pills, and date scope.
9. `PccProjectIntelligenceHeader.module.css` renders a dark header with `min-height: 72px`, a two-pixel accent border, three-column desktop layout, and a separate meta row on tablet modes.
10. `PccCommandSearch.tsx` is read-only/display-only; desktop uses a prominent input while smaller modes use a disabled icon button.
11. `PccSurfaceRouter.tsx` routes all eight current surfaces and now threads read-model clients to multiple surfaces.
12. `PccBentoGrid` is container-aware for grid columns, but shell/host height and scroll ownership are not proven from source alone.

## Confirmed Findings

### Finding B-01: Shell remains Wave 2 preview frame rather than Wave 15A product shell

**Status:** Confirmed  
**Severity:** High

**Evidence**
- `apps/project-control-center/src/shell/PccShell.tsx` uses `data-pcc-shell="wave-2"`.
- `apps/project-control-center/README.md` identifies the app as a Wave 2 preview frame, with later waves added on top.

**UX Failure Mode**
The shared shell still communicates a scaffold lineage. Later surfaces inherit a preview-oriented frame rather than a product-grade command-center shell.

**Why It Matters**
Wave B is the foundation for every surface. If the shell remains visually or semantically preview-oriented, later surface work cannot close doctrine readiness.

**Affected Components / Surfaces**
- `PccShell`
- `PccApp`
- all routed surfaces

**Required Remediation**
Rename/advance shell markers, update shell purpose language, and establish a product-grade shell contract that is still transparent about preview/live-data status without putting diagnostic language in the primary hierarchy.

**Acceptance Evidence**
- Updated shell source and tests.
- Before/after desktop and constrained screenshots.
- Closeout explaining marker migration and any retained compatibility markers.

### Finding B-02: Project context is generic and not persistent enough

**Status:** Confirmed  
**Severity:** High

**Evidence**
- `PccApp.tsx` feeds the shell from `PCC_PROJECT_PLACEHOLDER`.
- `projectPlaceholder.ts` hardcodes `Project Control Center`, `Project overview`, `Last 12 Months`, `Reference`, and `PCC`.

**UX Failure Mode**
The shell does not anchor the operator to a specific project number/name/status/phase/source-confidence context.

**Why It Matters**
PCC is project-centric. Without durable project identity, the command-center model lacks operational credibility across surfaces.

**Affected Components / Surfaces**
- `PccApp`
- `PccProjectIntelligenceHeader`
- potential new `PccProjectContextBand`
- all surfaces

**Required Remediation**
Introduce or strengthen a shared project-context band with project number, project name, lifecycle/status/phase, source confidence, active surface, and preview/live-data posture.

**Acceptance Evidence**
- Unit tests confirming context renders consistently across all surfaces.
- Screenshots showing persistence on every surface.

### Finding B-03: Navigation is flat and module-based, not operationally grouped

**Status:** Confirmed  
**Severity:** High

**Evidence**
- `PccNavigationRail.tsx` maps `PCC_MVP_SURFACE_IDS` directly into a single `ul`.
- It has workflow labels but no group headings such as Command, Controls, Governance, Connected Systems.

**UX Failure Mode**
The rail behaves as a module list rather than an operational wayfinding model.

**Why It Matters**
The user needs to understand whether they are viewing command overview, controls, governance, or connected systems. Flat nav weakens hierarchy and slows scan path.

**Affected Components / Surfaces**
- `PccNavigationRail`
- nav tests
- all surfaces

**Required Remediation**
Convert navigation to grouped IA:

```text
Command: Project Home, Project Readiness
Controls: Documents, Team & Access, Approvals
Governance: Site Health, Control Center Settings
Connected Systems: External Systems
```

Adjust only if local repo truth establishes a stronger grouping.

**Acceptance Evidence**
- Tests for group labels/order/active item.
- Screenshots for expanded, icon-only, top-strip, and hamburger/narrow modes.

### Finding B-04: Active/focus states exist but need product-grade accessibility proof

**Status:** Confirmed source / unproven runtime  
**Severity:** Medium

**Evidence**
- `PccNavigationRail.tsx` implements arrow, Home, and End focus movement and uses `aria-current` for active item.
- `PccNavigationRail.module.css` defines hover and active styles but no explicit `:focus-visible` rule was observed.

**UX Failure Mode**
Keyboard mechanics exist, but visual focus confidence and non-color-only status cues are not proven.

**Why It Matters**
Accessibility and keyboard failures are hard-stop failures under the doctrine model.

**Affected Components / Surfaces**
- `PccNavigationRail`
- `PccCommandSearch`
- shell tests

**Required Remediation**
Add explicit focus-visible styling, non-color-only state indicators, group-aware keyboard traversal checks, and tests.

**Acceptance Evidence**
- Testing Library tests for arrow/Home/End/Enter/Space behavior.
- Screenshot or recorded evidence of focus-visible states.

### Finding B-05: Search/command input is prominent but non-functional

**Status:** Confirmed  
**Severity:** Medium

**Evidence**
- `PccCommandSearch.tsx` documents itself as display-only and renders a read-only search input on desktop.
- `PccProjectIntelligenceHeader.tsx` places it in the central header command area.

**UX Failure Mode**
The interface suggests an operational search/command capability that does not exist.

**Why It Matters**
Misleading primary controls are hard-stop risks when they appear to be core interaction paths.

**Affected Components / Surfaces**
- `PccCommandSearch`
- `PccProjectIntelligenceHeader`

**Required Remediation**
Either reduce prominence and label as preview/inert, or define a scoped command/search affordance with clear disabled reason and next step.

**Acceptance Evidence**
- Tests for accessible disabled/read-only semantics.
- Screenshots showing command zone no longer overpromises functionality.

### Finding B-06: Host fit relies on viewport-style shell assumptions

**Status:** Confirmed source risk / tenant behavior unproven  
**Severity:** High

**Evidence**
- `PccShell.module.css` uses `min-height: 100vh`.
- No inspected source establishes published/edit-mode SharePoint chrome constraints or tenant container measurement.

**UX Failure Mode**
The app can over-assume available height inside SharePoint, increasing risk of double scroll, clipped content, or excessive vertical waste.

**Why It Matters**
Host/runtime resilience and host-fit are doctrine hard gates.

**Affected Components / Surfaces**
- `PccShell.module.css`
- `PccBentoGrid`
- all surfaces

**Required Remediation**
Define host-safe shell min-height/height behavior using app-container constraints, avoid fragile fixed viewport assumptions, and validate in local and tenant-hosted modes.

**Acceptance Evidence**
- Local screenshots at desktop, constrained SharePoint-like width, tablet, mobile.
- Tenant published and edit-mode screenshots or logged tenant evidence gap.

### Finding B-07: Header still competes for vertical and visual hierarchy

**Status:** Confirmed source risk / visual magnitude unproven  
**Severity:** Medium

**Evidence**
- `PccProjectIntelligenceHeader.module.css` uses dark header, `min-height: 72px`, central command area, meta pills, date scope, and a 2px accent border.

**UX Failure Mode**
The header may dominate above-the-fold content in a SharePoint-hosted frame.

**Why It Matters**
Wave B must increase usable operational canvas and subordinate shell chrome.

**Affected Components / Surfaces**
- `PccProjectIntelligenceHeader`
- `PccShell`

**Required Remediation**
Make the header compact, move project context into a narrow persistent band, subordinate diagnostics, and keep active surface context visible without large hero behavior.

**Acceptance Evidence**
- Before/after screenshots proving increased content canvas and improved scan path.

### Finding B-08: Narrow/hamburger mode hides navigation without confirmed alternative access

**Status:** Confirmed source risk  
**Severity:** High

**Evidence**
- `PccNavigationRail.module.css` sets `.rail[data-pcc-rail-variant='hamburger'] .surfaceList { display: none; }`.
- No inspected source shows a replacement menu drawer or disclosure control for phone mode.

**UX Failure Mode**
At phone/container-narrow widths, users may lose access to surface navigation.

**Why It Matters**
Breakpoint behavior that technically renders but removes primary navigation without compensation is a hard-stop risk.

**Affected Components / Surfaces**
- `PccNavigationRail`
- responsive tests

**Required Remediation**
Implement or document a host-appropriate narrow navigation disclosure, or force a credible top-strip/scrolling compact nav instead of hiding the list.

**Acceptance Evidence**
- Responsive tests and screenshots proving all surfaces remain reachable.

### Finding B-09: Diagnostic/preview posture is not centralized into a subdued product-grade status model

**Status:** Confirmed from source posture and Wave A baseline  
**Severity:** Medium

**Evidence**
- `usePccShellState.ts` hardcodes `previewMode: true`.
- `PccPreviewState` is widely used by surfaces per README and Wave A findings.
- Wave A known issues cite developer-facing preview/read-only/no-live-data language.

**UX Failure Mode**
Preview/build/no-live-data details risk appearing as primary content rather than operational confidence context.

**Why It Matters**
Executives and operators need trust cues, not scaffold diagnostics.

**Affected Components / Surfaces**
- shell/header/project context
- `PccPreviewState`
- all surfaces using preview states

**Required Remediation**
Create a subdued shell-level product status pattern: e.g., “Preview data”, “Fixture-backed”, or “Source confidence: simulated,” with detailed diagnostics available in a secondary location.

**Acceptance Evidence**
- Screenshots showing diagnostics subordinated.
- Tests for product status markers.

### Finding B-10: Cross-surface shell validation is not proven by current package evidence

**Status:** Confirmed evidence gap  
**Severity:** High

**Evidence**
- No Wave B screenshot or tenant-hosted evidence was inspected.
- Source route coverage exists conceptually through `PccSurfaceRouter`, but visual fit across all routed surfaces remains unproven.

**UX Failure Mode**
One surface may pass while another breaks shell fit, nav state, or scroll ownership.

**Why It Matters**
Wave B is a shared-system wave. It must validate every routed surface without redesigning each surface.

**Affected Components / Surfaces**
- all eight surfaces

**Required Remediation**
Add route/smoke tests and screenshot matrix across Project Home, Team & Access, Documents, Project Readiness, Approvals, External Systems, Control Center Settings, and Site Health.

**Acceptance Evidence**
- All-surface smoke tests.
- Screenshot index for all surfaces.
