# PCC Phase 08 — Product Experience Enhancement, Visual System Refinement, Accessibility, and Evidence Closeout

Generated: 2026-05-11  
Repo: `RMF112018/hb-intel`  
Remote baseline observed: `7d8bae430ab999d4fb38abe8de6689b89d8f4d27`  
Package posture: planning and prompt package only; no runtime code is modified by this package.

---

## 1. Objective

Phase 08 will transform PCC from a clean but restrained SharePoint-hosted dashboard into a more compelling, premium, end-user-facing **project command center**. The work is not limited to polish. It will enhance hierarchy, visual appeal, interaction quality, card usefulness, source trust, analytics storytelling, and surface-level product clarity while preserving the current repo architecture, no-writeback posture, SPFx host-fit constraints, and evidence requirements.

The governing Basis of Design positions PCC as:

```text
SharePoint native chrome
  ↓
PCC conditional command header
  ↓
Surface navigation + module access
  ↓
Operational bento field
```

Phase 08 must implement toward that experience without reintroducing prohibited patterns.

---

## 2. Closed Decisions

No decisions are left open.

| Area | Final Decision |
|---|---|
| Phase name | Phase 08 — PCC Product Experience Enhancement, Visual System Refinement, Accessibility, and Evidence Closeout |
| Intent | Improve end-user appeal, usefulness, clarity, interaction quality, and product maturity. This is not CSS-only polish. |
| Architecture | Preserve the current SPFx PCC architecture. No new routing, backend mutation, live integrations, or writeback. |
| Navigation | Preserve the current eight primary tabs: Project Home, Core Tools, Document Control, Estimating & Preconstruction, Project Startup & Closeout, Project Controls, Cost & Time, Systems Administration. |
| SharePoint fit | PCC remains SharePoint-hosted. No permanent PCC sidebar, no full-page takeover, no global-navigation replacement. |
| Visual target | Premium construction-command-center UI: strong dark command surface, HB orange accent, light operational canvas, dense but readable cards, clear action/source/status hierarchy. |
| Header | Enhance the command header/hero into the primary command surface. Do not reduce it to a banner. |
| Tabs | Retain top tabs as broad operating surfaces. Refine visual hierarchy and interaction quality. |
| Module access | Preserve current dropdown module access, but enhance it into a polished module launcher experience without false affordances. |
| Command search | Keep preview/no-authority posture unless already implemented, but visually refine it into a command-oriented capsule. No fake active input. |
| Bento | Bento cards must remain direct children of `PccBentoGrid`. |
| Cards | Cards must feel like operating tools, not static report tiles. Each card needs purpose, state, source, and next action where applicable. |
| Analytics | Keep direct ECharts implementation. No `echarts-for-react`. Analytics must explain the insight, not just render a chart. |
| Dependencies | No new dependency unless separately authorized. |
| Icons | Use lightweight inline SVG/local indicators only. Do not add icon libraries. |
| Animation | Allow subtle transitions only when reduced-motion-safe. |
| Data | Use current deterministic/mock/read-model posture. Do not invent live integration. |
| HBI | Advisory only. No decisions, approvals, writeback, autonomous action, or authority claim. |
| Evidence | Include component tests, Playwright evidence where available, screenshots/contact sheet, before/after review notes, and scorecard mapping. |
| Completion | Not complete until visual evidence proves improvement and no host-fit, accessibility, no-writeback, direct-child, or false-affordance regressions remain. |

---

## 3. Current Baseline Findings

The current implementation is structurally strong but visually underpowered.

### Strengths to preserve

- Clean SharePoint-hosted layout.
- Dark top band already gives a command-center starting point.
- Current tabs and surface model are working.
- Duplicate top bento cards have largely been removed.
- Project Home has a more operational first fold than prior phases.
- Analytics and span overrides are already present.
- No obvious return of prior permanent sidebar pattern.
- Cost & Time Sage/no-writeback posture is actively protected.

### Weaknesses to enhance

- Header feels more like a compact information banner than a premium command surface.
- Tabs are functional but visually thin and administrative.
- Cards feel flat, similarly weighted, and low-emotion.
- Source/status/preview language exists but is not visually elegant.
- Analytics cards need stronger insight storytelling.
- First fold lacks a strong “this is what matters today” narrative.
- Module dropdowns feel like utility menus rather than a product-grade module launcher.
- UI has limited microinteraction, depth, and visual rhythm.
- Some surfaces feel like module lists rather than tailored operating surfaces.
- Action cards, analytics cards, source cards, reference cards, and selected-module context cards are not differentiated enough.

---

## 4. Target Product Experience

PCC should feel like:

- A construction project command center.
- A daily operating layer for project teams.
- A trusted source-context layer across SharePoint, Procore, Sage, OneDrive, PCC, and other systems.
- A fast triage environment for priorities, risks, source gaps, and next actions.
- A premium internal product that feels modern, controlled, and purpose-built.

Within five seconds, a user should understand:

1. Which project they are viewing.
2. Which surface they are on.
3. Whether the project/surface is healthy, risky, incomplete, or degraded.
4. What needs attention now.
5. Which source systems are involved.
6. What actions or modules are available.
7. Which items are preview/read-only/launch-only/deferred.

---

## 5. Governing Personas

Optimize in this order:

1. Project Manager — daily command, actions, readiness, documents, controls.
2. Project Executive — risk, health, escalation, cost/time, source confidence.
3. Superintendent — field-relevant actions, constraints, documents, readiness, permits.
4. Project Accountant — cost/time, Sage posture, buyout, approvals, records.
5. Estimating / Preconstruction users — handoff continuity, assumptions, preconstruction record.
6. IT / Admin — systems administration, configuration, source health, module readiness.

This ordering means action/risk/source clarity outranks decoration.

---

## 6. Experience Principles

### 6.1 Command-first

The top of the PCC must feel like a controlled command layer: project identity, surface identity, today’s posture, source/no-writeback confidence, command/search/module access, and current focus metrics.

### 6.2 Action before information

Cards must prioritize action and triage: what needs review, what is blocked, what is missing, what source/system is responsible, and where the user can go next.

### 6.3 Every card has a role

Every card must be one of:

- Priority Action
- Operational Queue
- Source Status
- Analytics Insight
- Module Gateway
- Configuration Exception
- Selected Module Context
- Recent Activity
- Reference / Read-only Context

### 6.4 Visual density with hierarchy

Maintain compact density, but avoid flatness. Use size, contrast, placement, and card treatment to show relative importance.

### 6.5 Trust is visible

Source confidence, preview state, launch-only state, read-only state, no-writeback posture, and disabled reasons remain visible but refined.

### 6.6 No false affordances

If a control cannot perform an action, it must not look like it can. Disabled/deferred/source-unavailable items must explain why.

---

## 7. Allowed and Prohibited Changes

### Allowed

The developer may:

- Refine shell, hero, tab, card, analytics, and surface CSS.
- Add shared visual primitives inside PCC.
- Add card taxonomy props/classes if type-safe and tested.
- Add local inline SVG icons or token-driven indicators.
- Add hover/focus/selected/disabled visual states.
- Refine microcopy while preserving production-grade and no-writeback posture.
- Refine command search preview appearance.
- Refine module dropdown/launcher appearance and behavior.
- Add surface-specific header chips and KPI strips.
- Adjust card order and span overrides where tests are updated.
- Add screenshot/evidence documentation.
- Add/adjust tests for enhanced states.
- Add TODO comments for future conditional/lifecycle rendering only where explicitly scoped.

### Prohibited

The developer must not:

- Add a permanent PCC sidebar.
- Replace SharePoint navigation.
- Add live SharePoint/Graph/Procore/Sage writeback.
- Add external API calls.
- Add new dependencies.
- Add `echarts-for-react`.
- Use raw ad hoc colors where theme tokens or PCC variables exist.
- Add developer copy in UI.
- Add fake working search/input/action behavior.
- Add click handlers to divs without keyboard behavior.
- Break bento direct-child invariants.
- Move `data-pcc-active-surface-panel` back to a bento card.
- Remove no-writeback/source posture language.
- Hide disabled-state reason copy.
- Weaken existing Phase 05/06/07 tests.

---

## 8. Visual System Specification

### Color

- Command header: deep navy.
- Primary accent: HB orange.
- Operational canvas: light cool gray.
- Cards: white or near-white.
- Borders: subtle neutral.
- Text: strong content text, muted metadata.
- Status colors: success, warning, danger, info, neutral.
- Never use color alone for severity.

### Typography

- Hero project title: strongest.
- Surface title: secondary but visible.
- Card title: concise and action-oriented.
- Body: compact but readable.
- Metadata/source cues: controlled and smaller.
- Avoid overusing all-caps except small eyebrow/state chips.

### Elevation

- Header depth via color, internal structure, and seam.
- Cards use subtle shadow/border.
- Hover adds slight lift/border accent.
- Menus use stronger elevation.
- Avoid heavy consumer-app shadows.

### Motion

- 120–180ms transitions.
- No spring/bounce.
- Respect `prefers-reduced-motion`.
- Analytics animation may remain only when reduced-motion safe.

---

## 9. Card Taxonomy

### Priority Action Card

Shows what needs attention now. Requires count/urgency, due/aging/source cue, action, and severity marker.

### Operational Queue Card

Shows working list or grouped operational state. Requires count, breakdown, open/review action, and empty/degraded state.

### Source Status Card

Explains source availability/trust. Requires source, availability, read-only/no-writeback cue, launch/open action, and disabled reason if unavailable.

### Analytics Insight Card

Interprets a trend/exposure/posture. Requires insight-led title, chart, interpretation, source/sample/preview label, accessible text summary, and no chart-only meaning.

### Module Gateway Card

Opens or describes a module/work center. Requires state label, summary, authority cue, gateway or disabled reason.

### Selected Module Context Card

Confirms selected module and next context. Requires selected module label, parent surface, state, authority cue, and next available action or reason unavailable.

### Recent Activity Card

Shows continuity and audit/event trail. Requires events, actor/source/time, source confidence, and empty state.

---

## 10. Surface-by-Surface Intent

| Surface | Primary User Question | Required Enhancement |
|---|---|---|
| Project Home | What needs attention on this project today? | Today’s Focus strip, dominant Priority Actions, clear supporting cards, insight-led analytics. |
| Core Tools | What cross-cutting tools are available? | Better module availability, HBI advisory treatment, source/launch state clarity. |
| Document Control | Are documents/source locations healthy and trustworthy? | Source-health framing, distinct lanes, source badges, My Project Files guardrail. |
| Estimating & Preconstruction | What preconstruction context carries forward? | Handoff continuity and deferred modules that feel planned, not broken. |
| Project Startup & Closeout | Are startup/responsibility/closeout/warranty obligations under control? | Lifecycle chips, startup/responsibility prominence, planned closeout/warranty clarity. |
| Project Controls | What controls/constraints/permits/risks require attention? | Severity language, risk/constraint/permit posture, less generic module list feel. |
| Cost & Time | Where are cost/schedule/procurement/exposure risks emerging? | Preserve Sage posture, strengthen exposure analytics, no Sage mutation implications. |
| Systems Administration | What configuration/source issues affect PCC trust? | Trust/control surface, degraded/configuration visuals, Procore mapping read-only posture. |

---

## 11. Implementation Workstreams

1. Preflight repo truth and evidence baseline.
2. Product experience enhancement brief.
3. Screenshot findings matrix.
4. Shell and host-fit enhancement.
5. Command header / hero enhancement.
6. Command search preview enhancement.
7. Tab and module launcher enhancement.
8. Card taxonomy and visual system.
9. Gateway action enhancement.
10. Project Home experience enhancement.
11. Document Control experience enhancement.
12. Shared primary dashboard enhancement.
13. Analytics insight enhancement.
14. Cross-surface choreography.
15. Microinteraction and state refinement.
16. Content and microcopy refinement.
17. Accessibility and regression tests.
18. Playwright evidence and scorecard closeout.

---

## 12. File Boundary Map

### Primary implementation files

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccCommandSearch.module.css
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/preview/projectShellViewModel.ts
```

### Layout/card files

```text
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccBentoGrid.module.css
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccDashboardCard.module.css
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/layout/useBentoRowSpan.ts
```

### Analytics files

```text
apps/project-control-center/src/analytics/PccAnalyticsCard.tsx
apps/project-control-center/src/analytics/PccAnalyticsCard.module.css
apps/project-control-center/src/analytics/PccEchartsCanvas.tsx
apps/project-control-center/src/analytics/PccEchartsCanvas.module.css
apps/project-control-center/src/analytics/pccAnalyticsA11y.ts
apps/project-control-center/src/analytics/pccAnalyticsEcharts.ts
apps/project-control-center/src/analytics/pccAnalyticsOptions.ts
apps/project-control-center/src/analytics/pccAnalyticsTheme.ts
apps/project-control-center/src/analytics/pccAnalyticsTypes.ts
```

### Surface files

```text
apps/project-control-center/src/surfaces/projectHome/*
apps/project-control-center/src/surfaces/documents/*
apps/project-control-center/src/surfaces/phase05Dashboard/*
```

### Model files

```text
packages/models/src/pcc/PccPrimaryNavigation.ts
packages/models/src/pcc/*
```

### Test/evidence files

```text
apps/project-control-center/src/tests/*
e2e/pcc-live/*
docs/architecture/evidence/pcc-live/*
docs/reference/spfx-surfaces/project-control-center/*
```

---

## 13. Required Validation Commands

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
git status --short
```

Expected:

- `pnpm-lock.yaml` unchanged.
- No new dependencies.
- No untracked generated artifacts except intentionally documented evidence.
- Tests pass.
- Evidence generated or blocked reason documented.

---

## 14. Acceptance Criteria

### Product experience

- PCC feels like a project command center, not a flat SharePoint dashboard.
- Header is visually/functionally the command layer.
- Tab/module system feels intentional and premium.
- Each surface has a clear purpose.
- First fold communicates what matters quickly.
- Cards visually differentiate actions, analytics, source status, reference, and selected module context.
- Analytics explain insight, not just data.
- Preview/deferred/read-only/launch-only states are useful and clear.
- Source/no-writeback cues are visible and controlled.
- No end-user-facing developer copy appears.

### Technical

- Current architecture preserved.
- No live integration/writeback introduced.
- No new dependency.
- No `echarts-for-react`.
- No PCC sidebar.
- No duplicate header cards.
- Active surface marker remains shell-owned.
- Bento direct-child invariant preserved.
- Span override behavior preserved.
- Tests updated and passing.
- Playwright evidence updated or blocked with clear reason.

### Accessibility

- Keyboard navigation works.
- Focus states visible.
- Disabled controls expose reason copy.
- Status is not color-only.
- Charts have accessible summaries.
- Reduced-motion behavior respected.
- Heading hierarchy remains logical.

### Evidence

- Screenshot contact sheet generated.
- Each surface captured.
- Command header captured.
- Module launcher/menu captured.
- Selected module captured.
- Responsive states captured.
- Scorecard/evidence notes updated.
- Remaining exceptions documented.

---

## 15. Final Rule

This phase is successful only if final screenshots show meaningful end-user improvement:

- stronger command-center identity,
- clearer project/surface posture,
- better visual hierarchy,
- more useful cards,
- richer but safe interactions,
- better analytics storytelling,
- and no regression to architecture, accessibility, source authority, host-fit, or no-writeback posture.
