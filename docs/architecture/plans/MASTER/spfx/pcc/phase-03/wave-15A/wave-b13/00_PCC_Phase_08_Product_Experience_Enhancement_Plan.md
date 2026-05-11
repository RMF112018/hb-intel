# PCC Phase 08 — Product Experience Enhancement Plan

Phase: 08 — PCC Product Experience Enhancement, Visual System Refinement, Accessibility, and Evidence Closeout
Wave: 15A wave-b13
Repo: `RMF112018/hb-intel`
Branch: `main`
Generated: 2026-05-11

Authority: this document is the governing plan for all Phase 08 prompts (00 → 17). Later prompts must not relitigate architecture, navigation, dependency, writeback, or affordance posture decided here. Where a later prompt narrows or strengthens a rule, that prompt becomes the local override for its scope only.

This plan supersedes the package's earlier `00_PCC_Phase_08_Product_Experience_Enhancement_Implementation_Plan.md` for the purposes of Phase 08 execution. The predecessor document is preserved in-place as historical context; the README has been updated to reflect this plan as the canonical entry point.

---

## 1. Objective

Phase 08 elevates Project Control Center from a structurally-complete dashboard into a useful, premium, end-user-facing project command center. The goal is product-experience enhancement — visual hierarchy, card usefulness, source confidence, action clarity, microinteraction quality, accessibility, and evidence — not a CSS-only polish pass.

A successful Phase 08 produces an SPFx-hosted PCC where, within five seconds, a user understands which project they are viewing, which surface they are on, what is healthy or at risk, what needs attention now, which source systems are involved, and which actions are available — and where every card carries an identifiable role, every status carries source provenance, and no control implies an affordance it cannot deliver.

Phase 08 is **not** a CSS-only pass, **not** a navigation rework, **not** a sidebar reintroduction, **not** a writeback initiative, and **not** a dependency upgrade.

---

## 2. Current Repo-Truth Baseline

Establish baseline state at the start of every Phase 08 prompt. Prompt 00 established the canonical execution baseline.

| Field                                    | Value                                      |
| ---------------------------------------- | ------------------------------------------ |
| Branch                                   | `main`                                     |
| Current Phase 08 execution baseline HEAD | `877493c31c3a8aa9e2316ca5d958b78b479be059` |
| Historical package baseline reference    | `7d8bae430ab999d4fb38abe8de6689b89d8f4d27` |
| Package / manifest version (all aligned) | `1.0.0.219`                                |
| Lockfile md5                             | `7c19ccfa8718a42f7f55ce178a626996`         |

The `877493c31` baseline is two commits forward of the historical package baseline `7d8bae430`. The forward commits add (a) Phase 06 v1.0.0.219 screenshot reliability rerun evidence, and (b) this wave-b13 plan package. Neither alters PCC runtime source, package/manifest versions, or lockfile. Treat `877493c31` as the current execution baseline; treat `7d8bae430` as historical context only.

Aligned `1.0.0.219` locations:

- `apps/project-control-center/config/package-solution.json` (solution version and feature version)
- `tools/spfx-shell/config/package-solution.json` (mirrored)
- `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json`

Phase 08 prompts must not change these versions unless an operator-approved version bump is in scope for the specific prompt.

---

## 3. Non-Negotiable Architecture Guardrails

These guardrails apply to every Phase 08 prompt unless a later prompt explicitly authorizes a narrow contract revision. Any guardrail breach must block execution.

### 3.1 Navigation and Shell

- Preserve the current eight primary-tab runtime model in exactly this order and ID set: `project-home`, `core-tools`, `documents`, `estimating-preconstruction`, `startup-closeout`, `project-controls`, `cost-time`, `systems-administration`.
- Do not reintroduce a permanent PCC sidebar.
- Do not replace SharePoint host navigation.
- Do not introduce a full-page takeover.
- Preserve the conditional command header behavior: it is a command surface, not a banner, and must not duplicate hero/project identity into a redundant top-level bento card.

### 3.2 Active Surface Marker

- `data-pcc-active-surface-panel` remains shell-owned on `main[role="tabpanel"]`. It must not be moved back onto a card.
- Surface routing remains driven by `PccSurfaceRouter`, not by per-card marker re-anchoring.

### 3.3 Bento Direct-Child Invariant

- `PccDashboardCard` instances must remain direct DOM children of `PccBentoGrid`.
- Do not introduce wrapper elements between the grid and its cards unless the wrapper is itself an intentionally-tested grid child (carrying a `[data-pcc-bento-grid-child]` marker or equivalent) and does not break the responsive layout.
- Span override behavior via `footprints.ts` / `useBentoRowSpan` remains the canonical mechanism for layout intent.

### 3.4 Dependencies and Analytics

- Do not add new runtime dependencies.
- Do not add `echarts-for-react`. Direct `echarts ^5.6.0` usage via `PccEchartsCanvas.tsx` remains the approved analytics approach.
- Do not add icon libraries. Use inline SVG or local indicators.

### 3.5 Integration Posture

- Do not introduce live SharePoint, Graph, Procore, Sage, Adobe Sign, Document Crunch, Azure, tenant, or app-catalog mutations or writeback.
- Preserve read-only / preview / launch-only / no-writeback posture across all surfaces.
- Preserve Sage book-of-record / no-writeback cue posture on Cost & Time. No UI text may imply Sage mutation, sync, posting, update, or writeback.

### 3.6 Affordances and Copy

- No fake affordances. A non-working search, action, or control must not appear interactive without a clear preview, disabled, or deferred state and a user-facing reason.
- Do not hide disabled-state reason copy.
- No end-user-facing developer copy. Avoid `mock`, `placeholder`, `TODO`, `fixture`, `demo`, prompt numbers, wave names, or implementation sequencing in UI strings, except where a governed preview/sample label already exists and is intentionally user-facing.
- No `live` language for `available` source status; status copy must bound the claim to the PCC read-model envelope.

### 3.7 Test and Style Discipline

- Do not weaken tests to pass. Update tests only when the expected product contract has intentionally changed and the reason is documented in the prompt closeout.
- Use stable `[data-*]` markers and semantic roles as behavior contracts. CSS module class names are not behavior contracts.
- No broad/global CSS resets as a runtime shortcut. Use scoped PCC primitives, tokens, component contracts, or targeted layout fixes.
- No raw one-off color values. Use existing PCC tokens, theme variables, or intentionally-documented token additions.

### 3.8 Redundant Top-Level Cards

- Redundant top-level bento cards that merely repeat the hero or command header content are prohibited.
- Operational status, source-status, or selected-module-context cards remain allowed when they provide surface-specific value beyond restating the hero/header.

### 3.9 Sensitive Operations

- No tenant mutation, app catalog upload, `.sppkg` generation, CI/CD workflow change, dependency install/update, or `git push` without explicit operator authorization in the active prompt.
- No live endpoint probes via `curl` or hosted smoke tests without explicit operator authorization.

---

## 4. Target Product Experience

After Phase 08, PCC must feel like a construction project command center, a daily operating layer for project teams, and a trusted source-context layer across SharePoint, Procore, Sage, OneDrive, and PCC itself. It must communicate posture quickly and surface action without losing the SharePoint-hosted identity.

### 4.1 Five-Second Comprehension Targets

Within five seconds, an end user must be able to identify:

1. The project being viewed (identity in the hero).
2. The surface they are on (active tab and surface chip).
3. The overall posture of the project on that surface (healthy / at risk / blocked / degraded).
4. The top one or two items that need attention now.
5. Which source systems are involved on that surface.
6. Which actions or modules are available, and which are disabled or deferred and why.
7. Which items are preview, read-only, launch-only, or deferred.

### 4.2 Persona Optimization Order

Optimize for these personas in priority order:

1. Project Manager — daily command, actions, readiness, documents, controls.
2. Project Executive — risk, health, escalation, cost/time, source confidence.
3. Superintendent — field-relevant actions, constraints, documents, readiness, permits.
4. Project Accountant — cost/time, Sage posture, buyout, approvals, records.
5. Estimating / Preconstruction users — handoff continuity, assumptions, preconstruction record.
6. IT / Admin — systems administration, configuration, source health, module readiness.

This ordering means action, risk, and source clarity outrank decoration.

### 4.3 Measurable Acceptance

Marketing language must always tie to a measurable criterion in Section 12 (Evidence and Acceptance Plan). Words like "premium" or "command center" are acceptable in the plan because they are operationalized into screenshot, scorecard, accessibility, and contract-test gates downstream.

---

## 5. Visual System Direction

Phase 08 introduces a deliberate visual system aligned to the SPFx Governing Standard, Homepage Overlay doctrine, and existing PCC tokens. No one-off colors, no global resets, no consumer-app aesthetics.

### 5.1 Color

- Command header: deep navy command surface; structural seam separating it from the operational canvas.
- Primary accent: HB orange, used for active state, primary CTA emphasis, and selected-state indicators.
- Operational canvas: light cool gray; never compete with cards for visual weight.
- Cards: white or near-white with subtle neutral border.
- Status colors: success, warning, danger, info, neutral — drawn from existing tokens; never the sole carrier of severity.
- No raw rgba shadows introduced in the diff; reuse `--pcc-elevation-card` and related tokens.

### 5.2 Typography

- Hero project title: strongest weight in the surface; identity carrier.
- Surface title: secondary, visible, but not competing with the project title.
- Card title: concise, action-oriented; consistent type ramp across card types.
- Body: compact and readable; no orphaned single-word lines where avoidable.
- Metadata/source cues: smaller, controlled; never larger than card body text.
- All-caps reserved for small eyebrow chips and state tags.

### 5.3 Spacing, Rhythm, and Density

- Bento gutters consistent across surfaces; do not vary per surface.
- Card internal padding consistent per card type; vary across card types to express hierarchy.
- Dense but readable: avoid generous consumer-app whitespace, but never sacrifice scan-readability.

### 5.4 Elevation

- Header depth comes from color, structural seam, and internal composition — not from heavy shadow.
- Cards: subtle shadow plus border.
- Hover: slight lift and border accent; never a translation jump.
- Menus and overlays: stronger elevation, with focus-trap and reduced-motion-safe entrance.

### 5.5 Motion

- 120–180 ms transitions.
- No spring/bounce/easing-out-back curves.
- All transitions must respect `prefers-reduced-motion`.
- Analytics animation permitted only when reduced-motion-safe; otherwise static initial render.
- Local animation disables must be one-way off (do not overlay `animation: !disabled` over an upstream `animation: false`).

### 5.6 Token Discipline

- Use `@hbc/ui-kit` tokens, PCC-local CSS custom properties, or theme variables. Avoid raw color hex literals in new declarations.
- Token additions must be documented (token name, intent, location, fallback) within the prompt that introduces them.

---

## 6. Shell, Hero, and Navigation Direction

The shell is PCC's command-center identity. It must feel intentional, premium, and integrated with the SharePoint host.

### 6.1 Shell / Host Fit (Prompt 03)

- Preserve the SharePoint-hosted chrome; PCC sits inside the page, not over it.
- Preserve no-sidebar posture.
- Preserve the conditional command-header gating used by the current shell.
- Eliminate horizontal clipping at standard SharePoint breakpoints.
- Respect SPFx authoring/edit-mode posture; preview and fallback states must remain stable.

### 6.2 Hero Band (Prompt 04)

- The hero band is the primary identity surface: project name, project posture chip, surface chip, and (where relevant) a today's-focus strip summarizing the highest-attention items.
- Do not duplicate hero content into a top-level bento card.
- Hero must remain accessible: project title is the canonical `<h1>`; surface title is `<h2>` or a labeled tab; status chips carry text plus icon.

### 6.3 Command Search Preview (Prompt 05)

- The command search remains in **preview / no-authority** posture: no live search submission, no fake suggestions.
- Visually refine into a command-oriented capsule. Display affirmative preview copy (e.g., "Command search — preview"), never developer copy.
- If the user activates it, surface a labeled preview panel; never imply real query execution.
- Disabled or unavailable substates must carry visible reason copy.

### 6.4 Tab Bar (Prompt 06)

- The eight primary tabs remain top tabs.
- Selected tab uses rail-hover background, accent text, weight 700, 3px accent border, and an indicator — never transparent background alone, never accent text + underline alone.
- Tab bar must remain keyboard-navigable with arrow keys and Home/End; selection by Enter/Space; focus visible.

### 6.5 Module Launcher (Prompt 06)

- Module access remains via the existing dropdown pattern.
- Refine into a polished module launcher: clear module label, summary line, state cue (available / preview / deferred / unauthorized), and primary action or disabled reason.
- Mouse click opens the menu but keeps focus on the toggle; only keyboard ArrowDown moves focus into the first menu item. Do not auto-focus on mouse open.
- Modules without an available implementation render a disabled affordance with reason copy; they never render an active anchor.

---

## 7. Card Taxonomy and Composition Rules

Every bento card must be one of the taxonomy types below. Cards that do not fit a type must be reclassified or removed.

| Card Type                     | Purpose                                   | Required Elements                                                                              | First-Fold Eligible            |
| ----------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------ |
| Priority Action               | Surface what needs attention now          | Count or aging, severity tone, primary action or disabled reason, source cue                   | Yes                            |
| Operational Queue             | Working list or grouped operational state | Count, breakdown, open/review action, empty/degraded state                                     | Yes (PM/Super surfaces)        |
| Source Status                 | Source availability and trust             | Source label, availability state, read-only/no-writeback cue, launch action or disabled reason | Yes (admin, document surfaces) |
| Analytics Insight             | Interpret a trend or exposure             | Insight-led title, chart, interpretation, source/sample/preview label, accessible text summary | Conditional                    |
| Module Gateway                | Open or describe a module                 | State label, summary, authority cue, gateway action or disabled reason                         | Yes (core-tools, controls)     |
| Selected Module Context       | Confirm selected module and next context  | Selected module label, parent surface, state, authority cue, next action or reason unavailable | Yes                            |
| Recent Activity               | Continuity and audit trail                | Events, actor/source/time, source confidence, empty state                                      | No                             |
| Reference / Read-only Context | Stable factual context                    | Title, factual content, source cue, read-only treatment                                        | No                             |

### 7.1 First-Fold Prominence Rule

A card earns first-fold prominence when it (a) requires action or carries a today-relevant signal, or (b) anchors the surface's primary user question. Static reference, recent-activity, and reference-context cards do not earn first-fold prominence.

### 7.2 Hierarchy Treatment

- Priority Action and Operational Queue cards use stronger visual weight (denser content, accent edge or chip when severity warrants).
- Source Status and Selected Module Context cards use restrained but legible weight.
- Reference cards intentionally recede.
- Card weight is expressed via internal composition, not by inventing new colors.

### 7.3 Redundant-Card Prohibition

Top-level bento cards that merely repeat the hero or command-header content are prohibited. A status, source, or selected-module-context card is allowed only where it provides surface-specific operational value beyond restating identity.

### 7.4 Card-Level Posture

- Every card with an action carries a primary action or a disabled-reason chip; never both, never neither.
- Every card that depends on a source displays a source cue.
- Every card with a possible empty state declares its empty state explicitly (never a blank card).

---

## 8. Surface-by-Surface Intent

Each of the eight primary tabs receives a defined intent. Later prompts must align surface enhancements to these directives.

### 8.1 Project Home

- **Intended user outcome:** Understand what needs attention on this project today.
- **First fold:** Today's Focus strip in the hero context; one or two Priority Action cards; a posture/risk indicator.
- **Card hierarchy:** Priority Action → Operational Queue → Source Status → Analytics Insight → Selected Module Context → Recent Activity.
- **Source confidence / disabled state:** Each Priority Action card carries source cue and disabled-reason copy when degraded.
- **Future enhancement boundary:** Phase 08 strengthens hierarchy and microinteractions; it does not introduce new domain queries, write actions, or live integrations.

### 8.2 Core Tools

- **Intended user outcome:** Find and launch cross-cutting tools quickly.
- **First fold:** Module Gateway cards arranged by usage frequency and authority; HBI advisory treatment is visible but explicitly advisory-only.
- **Card hierarchy:** Module Gateway → Source Status → Reference.
- **Source confidence / disabled state:** Each gateway shows availability/preview/deferred/unauthorized state and reason; HBI affordances never imply decisions, approvals, writeback, or autonomous action.
- **Future enhancement boundary:** Phase 08 refines visual quality and state clarity; does not add new modules or authoritative tools.

### 8.3 Documents (Document Control)

- **Intended user outcome:** Verify that documents and source locations are healthy and trustworthy.
- **First fold:** Source-health framing; distinct lanes for SharePoint / OneDrive / Procore document sources; source badges.
- **Card hierarchy:** Source Status → Operational Queue (e.g., review queues) → Selected Module Context → Recent Activity → Reference.
- **Source confidence / disabled state:** My Project Files guardrail preserved; each lane displays source state, read-only cue, and launch action or disabled reason.
- **Future enhancement boundary:** Phase 08 does not introduce upload, write, or sync; the read-only/preview/launch-only contract holds.

### 8.4 Estimating & Preconstruction

- **Intended user outcome:** Understand what preconstruction context carries forward into the active project.
- **First fold:** Handoff continuity card(s); deferred-module cards that read as planned, not broken.
- **Card hierarchy:** Selected Module Context → Reference → Operational Queue (where active) → Source Status.
- **Source confidence / disabled state:** Deferred modules display deferred posture with product-safe copy and source cue.
- **Future enhancement boundary:** This surface is largely deferred; Phase 08 stabilizes the deferred posture visually and does not promote any deferred module to active.

### 8.5 Project Startup & Closeout

- **Intended user outcome:** Know whether startup, responsibility, closeout, and warranty obligations are under control.
- **First fold:** Startup and responsibility prominence; lifecycle chips; planned closeout/warranty clarity.
- **Card hierarchy:** Priority Action → Operational Queue → Selected Module Context → Reference.
- **Source confidence / disabled state:** Closeout/warranty preview states explicitly labeled; no implied live workflow execution.
- **Future enhancement boundary:** Phase 08 strengthens lifecycle visual story; does not introduce live closeout automation.

### 8.6 Project Controls

- **Intended user outcome:** Identify which controls, constraints, permits, or risks require attention.
- **First fold:** Severity-led Priority Action cards; constraint/permit posture; less generic module-list feel.
- **Card hierarchy:** Priority Action → Operational Queue → Module Gateway → Selected Module Context → Reference.
- **Source confidence / disabled state:** Severity language anchored to `priorityToneForAction` helper outputs; never invent a `critical` tone or filter `tone === 'critical'`. High severities remain `Blocking`, `Security Risk`, `Repair Required`.
- **Future enhancement boundary:** No new domain logic; severity clarity and visual differentiation only.

### 8.7 Cost & Time

- **Intended user outcome:** See where cost, schedule, procurement, and exposure risks are emerging.
- **First fold:** Module status card first; Sage book-of-record cue retained in its current shell-level posture; exposure analytics strengthened as Analytics Insight.
- **Card hierarchy:** Module Gateway (Module status) → Analytics Insight → Operational Queue → Source Status (Sage cue) → Selected Module Context.
- **Source confidence / disabled state:** Sage cue must continue to express book-of-record / no-writeback posture; do not weaken or absorb into the selected-module card. No affirmative mutation/sync/posting/update/writeback language.
- **Future enhancement boundary:** No Sage integration changes; analytics storytelling only.

### 8.8 Systems Administration

- **Intended user outcome:** Understand configuration and source issues that affect PCC trust.
- **First fold:** Trust/control surface; degraded/configuration visuals; Procore mapping in read-only posture.
- **Card hierarchy:** Source Status → Configuration Exception → Module Gateway → Reference.
- **Source confidence / disabled state:** Read-only cue on Procore mapping; configuration cards show degraded posture with reason copy.
- **Future enhancement boundary:** Phase 08 refines visual treatment of configuration state; no live config mutation.

---

## 9. Analytics and Data Visualization Direction

### 9.1 Library and Adoption

- Direct `echarts ^5.6.0` only.
- `echarts-for-react` remains prohibited.
- Analytics rendering routes through `PccEchartsCanvas` and `pccAnalyticsEcharts`/`pccAnalyticsOptions`/`pccAnalyticsTheme`/`pccAnalyticsTypes`.

### 9.2 Insight Posture

Analytics cards must explain the insight, not just render a chart:

- Title: insight-led ("Buyout exposure trending up"), not topic-led ("Buyout chart").
- Interpretation: a short, plain-language interpretation of what the chart shows.
- Source/sample/preview label: every analytics card discloses source mode and sample posture; no implied live source beyond approved read-model posture.
- Accessible text summary: a textual summary accessible to screen readers.
- Non-color-only meaning: every chart series carries a non-color signal (label, shape, pattern, position).

### 9.3 Reduced Motion

Analytics animation may run only when reduced-motion is not requested. When reduced-motion is requested, animations must be one-way off and the static initial frame must be visually complete.

### 9.4 Source Discipline

Analytics must not imply live Procore/Sage/Graph/SharePoint feeds. Source labels remain bounded to the PCC read-model envelope (`Source: PCC read-model available`, etc.), never `live`.

---

## 10. Accessibility, Keyboard, and Reduced-Motion Requirements

### 10.1 Keyboard

- Tab bar: arrow-key navigation, Home/End, Enter/Space activation.
- Module launcher: ArrowDown moves focus into first menu item from keyboard; mouse opens without stealing focus.
- Card primary actions: reachable in DOM order; focus ring visible.
- Disabled affordances: not focusable as interactive controls; reason copy reachable.

### 10.2 Semantics

- `main[role="tabpanel"]` retains `data-pcc-active-surface-panel`.
- Tabs use `role="tab"` / `aria-selected` / `aria-controls`.
- Status chips: text label plus icon; no color-only meaning.
- Disabled controls expose `aria-disabled` and a programmatic reason (e.g., `aria-describedby` resolved by `getElementById`).

### 10.3 Focus Management

- Portal-mounted overlays (drawers, modals, menus) use `useLayoutEffect` for synchronous focus management in jsdom-compatible tests.
- Tests for portal-mounted components include explicit `afterEach(cleanup)` from `@testing-library/react` (PCC SPFx workspace runs vitest with `globals:false`).

### 10.4 Reduced Motion

- Respect `prefers-reduced-motion: reduce`.
- Motion overlays must be one-way off; never re-enable upstream-explicit-off.

### 10.5 Heading Hierarchy

- One `<h1>` per surface (project title).
- Surface title is `<h2>`.
- Card titles are `<h3>` unless the surface composition dictates otherwise; never skip levels.

---

## 11. No-Writeback, Preview, and False-Affordance Rules

### 11.1 Launch-Only and Preview-Only

- "Launch" affordances open external systems (SharePoint, Procore, etc.) read-only or in their native UI; PCC does not author the destination action.
- "Preview" affordances render PCC-side context only and explicitly disclose preview posture.
- Launch links must be active only when URL policy plus approval state allow; otherwise inert disabled affordance with reason copy.
- Shell-only / staging-only prompts render inert disabled launch affordances even for rows where URL policy plus approval state would otherwise allow an active anchor.

### 11.2 Disabled-State Reason Copy

- Every disabled control exposes a visible reason chip and a programmatic description (`aria-describedby` resolved via `getElementById`).
- Reason copy is product-safe: it never mentions prompts, waves, "coming soon", or developer/implementation sequencing.

### 11.3 Imperative Action Discipline

- Imperative actions with disabled inputs return structured `{ opened: true/false, reason }` results — never silent no-ops.
- Tests for disabled paths assert the expected reason enum.

### 11.4 Source Status Discipline

- `PccReadModelSourceStatus === 'available'` user-visible label bounds the claim to the PCC read-model envelope (`Source: PCC read-model available`).
- Never use the word `live` for `available`.
- `live`/`fixture` are not valid statuses; model fixture-vs-read-model as a separate `sourceMode` input.

---

## 12. Evidence and Acceptance Plan

Phase 08 closes only when evidence proves the product-experience improvement.

### 12.1 Screenshot Coverage

- Every primary tab captured.
- First-fold and full-page screenshots where applicable.
- Module launcher: closed and open states.
- Selected-module state.
- Command/search preview: idle and preview states.
- Disabled/deferred state evidence on at least one Module Gateway and one Source Status card.
- Cost & Time Sage cue captured with the cue intact (book-of-record / no-writeback posture).
- Systems Administration source/config posture captured.

### 12.2 Viewports

Final visual closeout requires coverage at:

- Standard laptop (e.g., 1366 / 1440 width).
- Desktop (1920 width).
- Ultrawide (2560+ width).

### 12.3 Before / After Comparison

- Phase 08 closeout includes before/after notes referencing the v1.0.0.219 screenshot evidence captured in `docs/architecture/evidence/pcc-live/phase-06-v1.0.0.219-screenshot-reliability-rerun/` and Phase 05/06 baselines.

### 12.4 Scorecard Mapping

- Each enhancement prompt maps its delivered scope to the governing 56-point UI/UX doctrine (or current repo-local equivalent under `docs/reference/ui-kit/doctrine/`).
- Scorecard mapping is documented in the prompt closeout.

### 12.5 Playwright Evidence

- Playwright is required evidence, not the final expert visual scorecard.
- Use existing `playwright.pcc-live.config.ts`, `pnpm pcc:e2e:evidence:registry`, and `pnpm pcc:e2e:live` workflows. Do not introduce new Playwright projects.

### 12.6 Operator Visual Review Gate

- A final flagship completion claim requires (a) screenshot evidence across the surfaces and viewports above, and (b) operator visual review.
- Per-prompt validation (typecheck / lint / tests at package scope) is not hosted or operator-visual proof; closeouts must not imply otherwise.
- Hosted / tenant / browser evidence is OPERATOR-PENDING when not captured by the agent; commit titles and final-status copy must not overclaim.

### 12.7 Evidence Preservation

- Do not delete, move, overwrite, or prune historical evidence without explicit operator authorization.
- New evidence roots are timestamped under `docs/architecture/evidence/pcc-live/`.

---

## 13. Prompt Workstream Map

Each Phase 08 prompt maps to one or more plan sections.

| Prompt | Workstream                                 | Plan Sections          | Primary Change Type      |
| -----: | ------------------------------------------ | ---------------------- | ------------------------ |
|     00 | Preflight repo-truth gate                  | §2, §3                 | No-op (diagnostics)      |
|     01 | Product experience brief (this plan)       | All                    | Docs                     |
|     02 | Screenshot findings matrix                 | §4, §12                | Docs                     |
|     03 | Shell and host-fit enhancement             | §6.1, §3.1, §5         | Runtime + CSS + tests    |
|     04 | Command header / hero enhancement          | §6.2, §5, §4           | Runtime + CSS + tests    |
|     05 | Command search preview enhancement         | §6.3, §11              | Runtime + CSS + tests    |
|     06 | Tab and module launcher enhancement        | §6.4, §6.5, §10        | Runtime + CSS + tests    |
|     07 | Card taxonomy and visual system            | §7, §5                 | Runtime + CSS + tests    |
|     08 | Gateway action enhancement                 | §7, §11                | Runtime + CSS + tests    |
|     09 | Project Home experience enhancement        | §8.1                   | Runtime + CSS + tests    |
|     10 | Document Control experience enhancement    | §8.3                   | Runtime + CSS + tests    |
|     11 | Shared primary dashboard enhancement       | §7, §8 (cross-surface) | Runtime + CSS + tests    |
|     12 | Analytics insight enhancement              | §9, §8.7               | Runtime + CSS + tests    |
|     13 | Cross-surface card choreography            | §7, §8                 | Runtime + CSS + tests    |
|     14 | Microinteraction and state refinement      | §5.5, §10              | CSS + tests              |
|     15 | Content and microcopy refinement           | §3.6, §11              | Copy + tests             |
|     16 | Accessibility and regression tests         | §10, §3.7              | Tests + targeted runtime |
|     17 | Playwright evidence and scorecard closeout | §12                    | Evidence + docs + tests  |

---

## 14. Closed Decisions Register

All Phase 08 decisions are closed. No implementation-blocking decisions remain open.

| Area                      | Final Decision                                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase intent              | Product-experience enhancement; not CSS-only polish.                                                                                          |
| Architecture              | Preserve current SPFx PCC architecture; no new routing, backend mutation, live integration, or writeback.                                     |
| Navigation                | Preserve the eight primary tabs in the current order.                                                                                         |
| Sidebar                   | Prohibited.                                                                                                                                   |
| Active surface marker     | Shell-owned on `main[role="tabpanel"]`.                                                                                                       |
| Bento invariant           | Cards remain direct children of `PccBentoGrid`.                                                                                               |
| Hero                      | Primary identity surface; not a banner.                                                                                                       |
| Tabs                      | Top tabs only; refined visual hierarchy.                                                                                                      |
| Module access             | Existing dropdown pattern; refined launcher.                                                                                                  |
| Command search            | Preview / no-authority posture; visually refined.                                                                                             |
| Cards                     | Each card has a taxonomy type, source cue (where applicable), and action or disabled reason.                                                  |
| Redundant top-level cards | Prohibited when they only repeat hero/header content.                                                                                         |
| Analytics                 | Direct `echarts ^5.6.0` only; insight-led; accessible summary; non-color-only meaning.                                                        |
| `echarts-for-react`       | Prohibited.                                                                                                                                   |
| Dependencies              | No additions.                                                                                                                                 |
| Icons                     | Inline SVG / local indicators only.                                                                                                           |
| Motion                    | 120–180 ms; reduced-motion-safe; one-way local disables.                                                                                      |
| Color tokens              | Existing PCC and theme tokens; no one-off colors.                                                                                             |
| Source language           | `available` bounded to read-model envelope; never `live`.                                                                                     |
| Sage posture              | Book-of-record / no-writeback; no mutation/sync/posting/update/writeback language.                                                            |
| HBI                       | Advisory only; no decisions, approvals, writeback, autonomous action, or authority claim.                                                     |
| Developer copy            | Prohibited in UI.                                                                                                                             |
| Tests                     | Stable `[data-*]` markers and semantic roles; no class-name behavior tests; no test weakening.                                                |
| Evidence                  | Screenshot + scorecard + operator visual review required for flagship completion.                                                             |
| Version posture           | `1.0.0.219` aligned across PCC package-solution and webpart manifest; no version change in Phase 08 unless explicitly authorized in a prompt. |

---

## 15. Validation and Closeout Requirements

### 15.1 Standard Prompt Validation

Each Phase 08 prompt that touches PCC source runs at minimum:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
```

Notes:

- The PCC SPFx pnpm filter is `@hbc/spfx-project-control-center`; the typecheck script is `check-types` (not `type-check`).
- Use `pnpm exec <bin>` rather than `npx <bin>` for workspace-managed binaries. If `pnpm exec` fails, stop and report — do not fall back to `npx`.
- Run `pnpm exec prettier --write` only against changed files when intentionally fixing formatting; never over a whole product tree. If formatting is applied, rerun the test/typecheck suite after prettier so the validated artifact matches the formatted artifact.

### 15.2 Evidence-Bearing Prompts

Prompts that produce evidence (02, 17, and any surface-level prompt where visual evidence is in scope) additionally run:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
pnpm pcc:e2e:live
```

Evidence prompts must declare which evidence roots were generated and which were intentionally skipped.

### 15.3 Docs-Only Prompts

Docs-only prompts (00, 01, 02) run:

```bash
git status --short
pnpm exec prettier --check <changed-doc-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

### 15.4 Closeout Format

Every Phase 08 prompt closes with the contents of `templates/Closeout_Template.md`, supplied either in chat or as a saved closeout file when the repo-local phase convention requires it. Minimum closeout fields:

- Verdict (PASS / PASS WITH NOTES / BLOCKED).
- Prompt number and title.
- Branch, starting HEAD, ending HEAD.
- Local drift classification.
- Files changed, with concise change summary.
- Validation commands run and results; commands intentionally skipped, with reason.
- Lockfile md5 before/after.
- Package / manifest version before/after.
- Evidence generated or blocked reason.
- Guardrails confirmed.
- Residual risk and follow-up.
- Commit summary and description **only** when the operator explicitly requested a commit and a commit was actually authored.

### 15.5 Reporting Discipline

- Do not present failed validation as success.
- Do not imply hosted / tenant / browser proof from per-prompt validation.
- Honor closeout tri-state for tenant remediation: prior issue "no longer observed", current target, known intact — never collapse into a single "fixed" claim.

---
