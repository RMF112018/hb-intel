## Audit Consolidation Note

This document consolidates two independent UI audit passes of the My Work Hub:

- **Audit 1** — Initial inspection conducted prior to Phase 2 wave implementation.
- **Audit 2** — Follow-up inspection conducted after Phase 2 Waves 1–5 were completed. Conclusion: the page remains unacceptable for production. Follow-up scores are the same or worse than Audit 1, with mold-breaker potential downgraded from 6/10 to 5/10 and classification revised from "Competitive (lower end)" to "Below Competitive."

Findings UIF-001 through UIF-012 are from Audit 1. Findings UIF-013 through UIF-018 are net-new findings introduced in Audit 2 that were not present or explicit in the original findings. Audit 2's supplementary sections (Mold Breaker Assessment, Competitive Benchmark, Quick Wins, Structural Improvements) are appended in full at the end.

---

## Page Under Review
- **Page / feature name:** My Work — Personal tab (`/my-work`)
- **Primary user/task implied by the visible UI:** Personal task/work-item triage for a named user ("Executive") across multiple construction projects; secondarily, viewing personal analytics and accessing quick navigation shortcuts.
- **Overall UI maturity assessment:** 4/10
- **Overall product-quality assessment:** 4/10
- **Mold-breaker potential assessment:** 5/10 *(revised down from 6/10 after Audit 2)*
- **Current classification:** Below Competitive *(revised from "Competitive (lower end)" after Audit 2)*
- **Primary verdict:** HB Intel's My Work page has real structural intent — a feed of personally-assigned work items, stat cards, and quick actions is the right model for a construction-technology daily-driver surface. However, the execution falls significantly short of its potential on nearly every dimension. The work item feed suffers from an unstyled, native-browser-button lane header system that actively degrades trust in the design system. Work item rows have zero computed padding, zero border separators, and transparent background — items bleed together as raw text stacks making fast scanning impossible. The insight KPI cards carry meaningful data but fail to surface that intelligence with appropriate urgency or visual weight. The page is a single-column layout with the Insights and Quick Access panels buried 900px below fold. The "do-now (2)" and "watch (4)" lanes are collapsed with no visual affordance to distinguish their state from the expanded lane. Module labels are raw developer slugs unreadable to end users. The PARTIAL sync warning, the bottom dev bar, and the Tanstack devtools button are all visible production noise. The page is not currently mold-breaker and is not yet competitive with current leading construction platforms.

---

## Executive Diagnosis

**3 Biggest Strengths**
1. **The lane/priority model (waiting-blocked → do-now → watch) is semantically correct for a construction PM context** and has real workflow value if executed well. These lane names reflect real construction workflow intelligence, not generic "to-do / in-progress / done."
2. **The design system foundation (Fluent UI + custom `data-hbc-ui` tokens) is present and partially coherent.** Components like `kpi-card`, `status-badge`, `card`, `command-bar`, and `typography` are in use with a recognizable semantic layer. The infrastructure to build a high-quality, consistent design system exists — it is simply not finished or enforced uniformly.
3. **The Insights section has the right information architecture** — personal analytics plus aging/blocked escalation candidates is exactly the right data pairing for a field-oriented executive view. The KPI card system uses accent color-coding to communicate urgency.

**5 Most Important Weaknesses**
1. **Work item rows have zero visual structure** — no row separators, no hover states, no padding, no card containment. Items bleed together as raw text stacks with no row boundary, making fast scanning impossible.
2. **Full-width layout waste** — the entire page is a single-column flex stack with the Insights and Quick Access panels stacking below the feed, placing them 900px below the fold and invisible during the primary workflow. The right portion of the viewport (300–500px) is empty at all scroll positions within the feed.
3. **Module labels are raw developer slugs** (`bd-scorecard`, `project-hub-pmp`, `estimating-pursuit`) — unreadable to real users and signal alpha/beta product status to any stakeholder.
4. **Zero temporal/urgency data on work items** — no due dates, no age, no days-blocked counters, no assignment attribution visible on each row. A user cannot triage by urgency without opening each item individually.
5. **The lane/group headers render as light-gray pills with black text inside a dark shell** — a jarring light-island contrast inversion. The browser-native button appearance on the headers is the most trust-breaking visual defect on the page.

**Single Biggest Reason the Page Is NOT Mold Breaker**

The work item feed — the most critical surface on the page and the primary functional surface — is structurally unfinished. The lane headers use unstyled native browser buttons. The item rows have no layout, padding, or separation. The item titles link in browser-default blue on a mixed-theme background. The collapsed lanes give no visual feedback. The right canvas is blank. Module slugs are exposed. No construction professional can make a triage decision from what is currently rendered.

---

## Top Priority Findings

---

### UIF-001
- **Severity:** Critical
- **Category:** Design System / Visual Hierarchy
- **Element reference(s):**
  - Visible label/text: "waiting-blocked (2)", "do-now (2)", "watch (4)"
  - Component type: Lane/group header (collapsible toggle button wrapping `.hbc-my-work-feed__group-header` div)
  - Approximate location on screen: Left column, top of work item feed, approximately y:215–460
  - Distinguishing visual traits: Gray OS-native rectangle with outset border, black text, no border-radius, no icon differentiation, chevron in separate box
  - DOM/CSS/ARIA hint: `.hbc-my-work-feed__group-header` div; parent is `.hbc-my-work-feed__group` (a plain `<div>`). The containing button is applying browser-native appearance. Computed: `bg: rgb(239,239,239)`, `border: 1.5px outset`, `borderRadius: 0px`, `fontSize: 13.33px`, `appearance: auto` (native).
- **Current observed state:** The lane/group header buttons render as plain OS-native browser buttons — gray rectangle with outset border, no design token treatment, no custom border-radius, mismatched font size (13.3px vs. the 14px body text standard). In Audit 2, the background `rgb(239,239,239)` on a dark navy page creates a jarring light-island contrast inversion. Labels use slug syntax (`waiting-blocked`, `do-now`) requiring cognitive translation.
- **Why this is a problem:** This is the most trust-breaking visual on the page. The rest of the shell uses a dark Fluent UI design system. These headers look like the page broke and fell back to HTML defaults. They visually cannot belong to the same product as the KPI cards.
- **Why it matters specifically in a construction-tech context:** Lane headers must feel like structural wayfinding — not browser artifacts. A superintendent should be able to scan "waiting-blocked / do-now / watch" in a fraction of a second.
- **Why it prevents or weakens mold-breaker status:** No mold-breaker product has unstyled native browser buttons as primary section headers. This is a credibility disqualifier.
- **Recommended change:** Replace with full-width lane header rows: dark transparent background, colored left bar (red-orange for waiting-blocked, orange for do-now, gray for watch), human-readable label ("Waiting / Blocked", "Action Required", "Watching"), count badge in a styled pill. Apply `appearance: none` to the underlying button element. Set `border-radius: 6px`, `padding: 8px 12px`, `display: flex`, `align-items: center`, `gap: 8px`. Use design system `font-size: 13px`, `font-weight: 600`, `color: var(--colorNeutralForeground1)`. Make headers sticky within the scroll container.
- **Expected user benefit:** Immediate visual cohesion; scan-speed improvement for lane identification; elimination of the "broken page" impression.
- **Acceptance criteria:** Lane headers render with dark-theme styling consistent with the rest of the dark UI shell; no outset border visible; border-radius ≥ 4px; font matches body text token; no native browser button appearance on any viewport; human-readable labels applied.
- **Notes for implementation:** The `<button>` wrapping the group header needs `all: unset` or `appearance: none` + explicit reset first. The chevron icon rotation should use CSS `transform: rotate(0deg)` / `rotate(-90deg)` on collapse toggle driven by a class.

---

### UIF-002
- **Severity:** Critical
- **Category:** Layout / Visual Hierarchy
- **Element reference(s):**
  - Visible label/text: Empty white/dark space to the right of the work item feed; Insights section appearing only after scrolling ~900px
  - Component type: Main content canvas / page layout flex column
  - Approximate location on screen: Right ~40% of the main content area; Insights + Quick Access below fold
  - Distinguishing visual traits: Solid white/off-white void with no content in Audit 1; in Audit 2, dark canvas but Insights/Quick Access only visible after scrolling past all work items
  - DOM/CSS/ARIA hint: `<main>` has `width: 1457px`, `margin-left: 56px`. Work item feed is approximately 921px wide. Insights appears after full work feed scroll.
- **Current observed state:** The page uses a single-column left-aligned work item list that does not fill the canvas. The Insights panel (escalation candidates, blocked count, aging) — the most time-sensitive information for an executive — is placed 900px below fold, invisible at point of need. The right portion of the viewport is empty throughout the work feed scroll.
- **Why this is a problem:** Executives need to see their portfolio risk posture simultaneously with their action list. Forcing a scroll break destroys the dual-pane mental model. Leaving 300–500px of the screen blank is a wasted opportunity.
- **Why it matters specifically in a construction-tech context:** Construction PMs and executives work in information-dense environments. They need breadth of context on one screen — not a skinny feed on a half-canvas with analytics buried below.
- **Why it prevents or weakens mold-breaker status:** Every leading construction product has persistent contextual panels. A full-bleed single-column layout with buried analytics is category-regressive.
- **Recommended change:** Implement a two-column layout: work feed on left (~65% width), persistent Insights + Quick Access panel on right (~35% width), sticky-scrolling. This fits within the available content width. Target breakpoint: collapse to single column below 768px.
- **Expected user benefit:** Insights visible at all times; eliminated need to scroll to access quick analytics; dramatically increased information density.
- **Acceptance criteria:** At 1024px+ viewport, Insights panel visible in right column without scrolling. Feed and panel scroll independently or panel is sticky. No viewport state at desktop widths shows more than 15% of the canvas blank when the work feed is active.
- **Notes for implementation:** The `.hbc-my-work-feed` should be constrained to ~65% width using CSS grid `grid-template-columns: 1fr auto` or equivalent. The right panel should be a lazy-loaded component.

---

### UIF-003
- **Severity:** Critical
- **Category:** Design System / Visual Hierarchy
- **Element reference(s):**
  - Visible label/text: "Airport Terminal Expansion — No-Bid Decision", "Harbor View Medical Center — Health Pulse"
  - Component type: Work item title link (`.hbc-my-work-list-item__title` > `<a>`)
  - Approximate location on screen: Inside work item lanes, all rows
  - Distinguishing visual traits: Browser-default hyperlink blue (`rgb(0, 0, 238)`) with underline; on a dark navy background this is low contrast and visually incongruous
  - DOM/CSS/ARIA hint: `<a class="hbc-my-work-list-item__title" href="...">`. Computed `color: rgb(0, 0, 238)`, `text-decoration: underline`, `font-weight: 400`.
- **Current observed state:** Work item title links render in raw browser-default hyperlink blue with underline. The `data-hbc-ui="typography"` token system is present but not overriding the default browser link color. On the dark shell, this reads as visually broken.
- **Why this is a problem:** This is a design system failure. The resulting style contradicts the premium dark-UI direction visible in the header and KPI cards. Default browser link color inside a custom dark theme is the most common marker of an unfinished UI.
- **Why it prevents or weakens mold-breaker status:** No serious design system allows browser-default link styles to survive on primary content elements.
- **Recommended change:** Override `.hbc-my-work-list-item__title a` with `color: rgb(180, 210, 240)` (soft blue, readable on dark), `font-weight: 500`, `text-decoration: none`. On hover, apply `text-decoration: underline` with a brand color tint. Remove inherited underline from the anchor default state.
- **Expected user benefit:** Visual coherence; improved readability on dark backgrounds; professional trust signal.
- **Acceptance criteria:** No work item title uses `rgb(0, 0, 238)` or default browser blue. All title links use the design system's link color token. No underline in rest state; underline appears only on hover.
- **Notes for implementation:** May need specificity fix on `.hbc-my-work-list-item__title a, .hbc-my-work-list-item__title a p` to override the `<p data-hbc-ui="typography">` color setting.

---

### UIF-004
- **Severity:** Critical
- **Category:** Theme / Design System
- **Element reference(s):**
  - Visible label/text: Body background, main content area
  - Component type: Page body and main element backgrounds
  - Approximate location on screen: Everywhere — full canvas
  - Distinguishing visual traits: Body `background-color: rgb(250,250,250)` (near-white). Main element: transparent (inherits body). The header is `rgb(30,30,30)`. KPI cards and sidebar are `rgb(17,24,39)`. Work item feed renders on the near-white body.
  - DOM/CSS/ARIA hint: `document.body` computed `backgroundColor: rgb(250, 250, 250)`. `<main>` computed `backgroundColor: rgba(0,0,0,0)`.
- **Current observed state:** The page is in a split-theme state. The shell chrome (header, sidebar, KPI cards) is dark; the work item feed content area is effectively on a near-white background. The design is neither dark mode nor light mode — it is a collision of both.
- **Why this is a problem:** Visual incoherence at the most fundamental level. Users cannot orient to a consistent theme. The lane headers look wrong in gray on white. The title links look wrong in blue on white in a dark-UI product. Construction tech is increasingly targeting night-mode / reduced-glare interfaces for field use.
- **Why it prevents or weakens mold-breaker status:** A mold-breaker interface must have a coherent visual environment. This page has two competing environments.
- **Recommended change:** Set `<main>` (or the workspace page shell) to `background-color: var(--colorNeutralBackground1)` consistent with the dark design system token. This should unify the dark KPI cards, work item feed, and shell into a single coherent dark surface.
- **Expected user benefit:** Immediate visual coherence; elimination of the "two products on one page" impression; reduced cognitive friction.
- **Acceptance criteria:** At all scroll positions, the main content area background matches the dark design system baseline. Lane headers, work items, and KPI cards share a coherent dark background.
- **Notes for implementation:** Setting `body` background to `rgb(17,24,39)` or similar dark token is the simplest path. Verify that no components rely on a light background for contrast of their own light text.

---

### UIF-005
- **Severity:** High
- **Category:** State Design / Construction Workflow
- **Element reference(s):**
  - Visible label/text: "do-now (2)" with chevron-down, "watch (4)" with chevron-down
  - Component type: Collapsed lane group buttons
  - Approximate location on screen: Below the "waiting-blocked" group header in the work feed
  - Distinguishing visual traits: Same native-button appearance as the expanded lane. No visual difference between expanded and collapsed state beyond a chevron that is too small to be reliably perceived at speed.
  - DOM/CSS/ARIA hint: `.hbc-my-work-feed__group-body` for collapsed groups: `display: none`, `height: 0`, `childCount: 0`. The button has no `aria-expanded` visible in the DOM tree output.
- **Current observed state:** "do-now (2)" and "watch (4)" are collapsed but display identically to "waiting-blocked (2)" which is expanded. The collapsed state gives no visual affordance that 6 additional items exist and are hidden.
- **Why this is a problem:** A user arriving at this page sees what appears to be 2 items total and 3 section headers. They may not realize 6 more items are collapsed. In a daily triage scenario, missing that 6 items are hidden is a workflow failure.
- **Why it prevents or weakens mold-breaker status:** State design — making the current state of the UI instantly obvious — is a core mold-breaker requirement.
- **Recommended change:** (a) Add `aria-expanded="false/true"` to the group header button. (b) Visually distinguish collapsed state: reduced opacity or saturation on the header, a dimmed background, or a distinct "collapsed" treatment. (c) Show the item count as a visible badge/chip, not only in the text label. (d) The chevron should rotate 90° to clearly indicate open/closed direction with a CSS transition.
- **Expected user benefit:** Users immediately know how many items are hidden in each lane; no missed items during triage; correct urgency understanding.
- **Acceptance criteria:** Collapsed groups are visually distinguishable from expanded groups at a glance (not only by chevron direction); `aria-expanded` is correct; item count is readable without reading the label string; chevron rotates on toggle.
- **Notes for implementation:** Chevron rotation is a CSS transform on the icon element inside the button, toggled by adding a class (`is-collapsed`) on the parent group div.

---

### UIF-006
- **Severity:** High
- **Category:** Layout / Construction Workflow
- **Element reference(s):**
  - Visible label/text: Work item list — no assignee, no due date, no priority indicator, no age visible on rows
  - Component type: `.hbc-my-work-list-item` rows
  - Approximate location on screen: All work item rows in all lanes
  - Distinguishing visual traits: Each row shows: title link, BLOCKED badge, module slug, Open button. No date, no priority, no age, no item type icon, no row separation, no padding.
  - DOM/CSS/ARIA hint: `.hbc-my-work-list-item { background: transparent; padding: 0; border-bottom: none; }`. `.hbc-my-work-list-item__content` has `display: block` with no sub-structure for metadata.
- **Current observed state:** Work item rows have zero computed padding, zero border separators, and transparent background. Each item renders as a raw block of text elements stacked vertically with no visual separation from adjacent items. No due date, no priority level, no days-blocked, no item type, no assignee are shown. The module identifier is a raw database slug (`bd-scorecard`, `project-hub-pmp`) instead of a human-readable label.
- **Why this is a problem:** Users cannot distinguish where one work item ends and another begins at a glance. The visible data is insufficient for triage without clicking "Open" — a user cannot determine urgency, age, or action priority from the list view.
- **Why it matters specifically in a construction-tech context:** "Healthcare Market Entry Strategy — Approval Needed" could be 2 days old or 14 days old — entirely different urgency profiles. Without metadata in the list, every triage decision requires a full page navigation.
- **Why it prevents or weakens mold-breaker status:** Superior construction platforms surface enough metadata in list rows to make a triage decision without clicking. This forces a click-to-learn-anything interaction model.
- **Recommended change:** (a) Add `padding: 12px 16px` to `.hbc-my-work-list-item`, add a `border-bottom: 1px solid rgba(255,255,255,0.07)` row separator, add a subtle hover background `rgba(255,255,255,0.04)` with cursor pointer. Give each item a minimum height of 56px. (b) Add secondary metadata row: `[module human label] · [due date or days overdue] · [assigned N days ago]`. For blocked items, add "Blocked Xd" chip. Use 12px muted text (`#6B7280`). (c) Map module slugs to human-readable labels (`bd-scorecard` → "BD · Scorecard", `project-hub-pmp` → "Project Hub · Health"). (d) Add a left border accent (4px) color-coded by lane.
- **Expected user benefit:** Users can scan 8 items in 3 seconds instead of 15; triage-ready list view without a single click.
- **Acceptance criteria:** Each `.hbc-my-work-list-item` visually bounded; hover state visible; lane-color left border applied; at minimum one temporal signal per item; no raw slugs visible anywhere in the feed; total row height ≤ 64px in compact mode.
- **Notes for implementation:** Module slug mapping should live in a shared constants file. Left border color should use a CSS variable driven by a `data-lane` attribute on the group container.

---

### UIF-007
- **Severity:** High
- **Category:** State Design
- **Element reference(s):**
  - Visible label/text: "Last synced 18–34 min ago" · "PARTIAL" badge · "2 source(s) unavailable"
  - Component type: Connectivity/sync status bar (`data-hbc-ui="connectivity-bar"`)
  - Approximate location on screen: Below the "Personal / Delegated by Me / My Team" tabs, spanning full width
  - Distinguishing visual traits: Small text on dark background. "PARTIAL" rendered as an amber Fluent badge. "Last synced N min ago" and "2 source(s) unavailable" in small gray text. No retry button, no tooltip, no details affordance.
- **Current observed state:** A sync warning is present showing that data is stale (18–34 min since last sync observed across two audits) and 2 sources are unavailable. Displayed as small text + a small badge with no recovery action. Users can see something is wrong but cannot identify what or fix it.
- **Why this is a problem:** Stale data in a bid, health pulse, or blocked item context can result in wrong decisions. 34 minutes stale on a "Blocked" item means the block may have already been cleared — or worsened. There is no "Retry sync" or "View affected sources" affordance. The badge color (`rgb(218,59,1)` in Audit 1 observation) was also noted to share a color with the "BLOCKED" badge and the "Open" button — three semantically different states using the same color.
- **Why it matters specifically in a construction-tech context:** Mold-breaker products make data freshness a first-class citizen with actionable state. The current warning is unactionable.
- **Recommended change:** Convert sync bar to a dismissible alert row with amber left-border, icon, "Data partially stale (N min) — 2 sources unavailable", inline "Retry" button, and "Details ›" link showing named unavailable sources. On sync success, transition to a brief green "Synced" flash then disappear. Define a strict 4-color semantic palette: `info`, `warning` (amber), `error/blocked` (red-orange), `brand-action` (teal/blue). Ensure no two semantically different states share the same hex color or design token.
- **Expected user benefit:** Users can act on sync failures; can identify which sources are affected; no misread status signals from color collision.
- **Acceptance criteria:** "Retry" button visible; clicking it triggers a re-sync attempt. Tooltip or panel on "Details" shows named unavailable sources. No two semantically different states share the same color token. Status auto-clears when resolved.
- **Notes for implementation:** The `fui-Badge` for PARTIAL warning should use an amber token distinct from the error-orange used for BLOCKED.

---

### UIF-008
- **Severity:** High
- **Category:** Mold Breaker / Construction Workflow
- **Element reference(s):**
  - Visible label/text: Insights section — "Personal Analytics," "Aging & Blocked"
  - Component type: KPI cards (`data-hbc-ui="kpi-card"`) — 7 visible cards
  - Approximate location on screen: Below work item feed (buried below fold in single-column layout)
  - Distinguishing visual traits: Dark cards (`bg: rgb(17,24,39)`) with 3px colored top border. Labels in ALL CAPS. Large number values. One card ("TOTAL ITEMS") uses a light background + dark text inconsistent with the others.
  - DOM/CSS/ARIA hint: `data-hbc-ui="kpi-card"` with `borderTop: 3px solid [color]`. TOTAL ITEMS card has `background: rgb(232,241,248)`, dark text — inconsistent.
- **Current observed state:** KPI cards display totals (Total Items: 8, Action Now: 4, Blocked: 2, Unread: 8, Escalation Candidates: 2, Blocked: 2, Aging: 0) but have no sparkline, trend, or delta indicator. They are not clickable/filterable. "BLOCKED" appears twice across the two card groups. The UNREAD count of 8 has a gray/neutral top border despite 8 unread items not being a neutral state. The TOTAL ITEMS card uses a light background inconsistent with the other four dark-background cards.
- **Why this is a problem:** Cards display totals without context — no delta from yesterday, no trend sparkline, no drill-down affordance. Clicking "Action Now" (4 items) should filter the work feed to show those 4 items. The duplicate "BLOCKED" label requires mental disambiguation. The design inconsistency between card styles signals a design system that hasn't converged.
- **Why it prevents or weakens mold-breaker status:** The best construction platforms make every metric a gateway to the underlying items. Static count cards are an early-stage pattern.
- **Recommended change:** (a) Unify all metric cards to a single dark-background treatment. (b) Make each KPI card clickable, applying the corresponding filter to the work item feed. (c) Add a `Δ` delta indicator ("+2 from yesterday") below the count. (d) Add a small icon to each card label. (e) Give the UNREAD card an amber or teal top border. (f) Rename one "BLOCKED" card to differentiate — e.g. "AGING BLOCKED". (g) Increase number font size to 28–32px for instant readability.
- **Expected user benefit:** One-click drill-down from metric to items; trend awareness; correct urgency signaling; no duplicate-label confusion.
- **Acceptance criteria:** Clicking any KPI card filters the work feed. Each card has a unique, non-duplicated label. UNREAD uses a non-neutral accent. All cards use the same base card style. Delta text visible on at least Action Now and Blocked cards.
- **Notes for implementation:** Click handler should push a filter state to the URL (e.g. `?filter=action-now`). The delta values need a data source (daily snapshot comparison).

---

### UIF-009
- **Severity:** High
- **Category:** Field Use / Accessibility
- **Element reference(s):**
  - Visible label/text: "Open" button on each work item
  - Component type: Primary action button (`data-hbc-ui="button"`)
  - Approximate location on screen: Right side of each work item row
  - Distinguishing visual traits: Orange or blue filled button, white text, 12px font, 28px height, `padding: 0px 12px`
  - DOM/CSS/ARIA hint: Button height: 28px. Font-size: 12px. Font-weight: 600. Below the 44px touch target threshold.
- **Current observed state:** The "Open" button is 28px tall with 12px font. This is below acceptable touch target size for field use (minimum 44px per WCAG 2.1 / Apple HIG / Google Material). On mobile or tablet, this button would be extremely difficult to tap accurately.
- **Why this is a problem:** 28px is too small for reliable touch interaction. Construction field workers using tablets or phones in gloves, outdoors, or under time pressure will frequently miss this target.
- **Why it matters specifically in a construction-tech context:** PWA/field use is explicitly called out in the product direction. A primary action button failing the 44px touch target threshold is a field-usability failure.
- **Why it prevents or weakens mold-breaker status:** Field-ready usability is a mold-breaker requirement.
- **Recommended change:** Set minimum height to `44px` via `min-height: 44px` CSS token across all action buttons. Increase font-size to `13px` or `14px`. Consider expanding the button to full-width of the actions column on touch breakpoints.
- **Expected user benefit:** Reliable touch interaction on mobile and tablet in field conditions; improved accessibility.
- **Acceptance criteria:** All primary action buttons in work item rows have a minimum touch target of 44×44px on touch-capable viewports. Font-size ≥ 13px. WCAG 2.1 SC 2.5.5 compliant.
- **Notes for implementation:** Update the button size token for `size-sm` or the specific button variant. Verify compliance across all interactive elements.

---

### UIF-010
- **Severity:** High
- **Category:** PWA / Visual Hierarchy
- **Element reference(s):**
  - Visible label/text: "HB-AUTH-DEV ▲" bottom status bar + Tanstack Query devtools button
  - Component type: Fixed bottom dev-tool overlays
  - Approximate location on screen: Bottom edge of viewport — fixed, z-indexed above all content (`z-index: 99999`)
  - Distinguishing visual traits: "HB-AUTH-DEV ▲" in a fixed bottom bar; Tanstack devtools trigger button (island emoji icon) overlapping bottom-right corner.
- **Current observed state:** Two developer-only UI elements are persistently visible in the production-accessible rendered page: an "HB-AUTH-DEV" environment indicator bar anchored to the bottom, and a Tanstack Query devtools toggle button. Both consume viewport space, pollute the UI, and signal incomplete production readiness to any stakeholder or demo audience.
- **Why this is a problem:** In a standalone PWA window, a fixed `z-index: 99999` element blocking the bottom viewport disrupts the app-native feel entirely. Even in development, every UI review and demo is a trust signal.
- **Why it prevents or weakens mold-breaker status:** PWA-native quality requires a distraction-free app surface.
- **Recommended change:** Gate these elements behind `process.env.NODE_ENV === 'development'` or a `VITE_SHOW_DEV_TOOLS=true` flag. In non-development builds these elements must not render. For the auth indicator, use a subtle corner badge (16px, low-opacity) rather than a full bottom bar if needed in dev.
- **Expected user benefit:** Clean presentation in all non-local contexts; no demo/stakeholder confusion; correct PWA standalone view.
- **Acceptance criteria:** In any non-development build, no dev-specific UI elements are visible. The bottom of the viewport shows only application content.
- **Notes for implementation:** Wrap both the auth dev bar and Tanstack devtools trigger in `if (process.env.NODE_ENV === 'development')` or equivalent environment guard.

---

### UIF-011
- **Severity:** High
- **Category:** Typography / Visual Hierarchy
- **Element reference(s):**
  - Visible label/text: "No recent context" heading
  - Component type: Empty state heading (`<H2>`)
  - Approximate location on screen: Inside "Recent Context" card, Quick Access section
  - Distinguishing visual traits: Rendered as `H2` at 20px / weight 600 — the same scale as the page-level "My Work" H1 equivalent.
  - DOM/CSS/ARIA hint: `<h2>No recent context</h2>` with `fontSize: 20px`, `fontWeight: 600`. The page H1 "My Work" is also 20px/600. Both share the same Fluent typography class — incorrect.
- **Current observed state:** The empty-state heading "No recent context" is an `H2` with 20px/600 — equivalent visual weight to the page title "My Work" (`H1`, also 20px/600). Semantic and visual heading hierarchy is broken. Additionally, the Recent Context panel shows a passive, non-actionable empty state with no guidance, no illustration, and no fallback suggestions.
- **Why this is a problem:** An empty-state message carries less visual importance than a page title and section headers. Using the same typographic weight inflates the empty state beyond its actual importance. If there is genuinely no recent context, the panel should either show suggested items (e.g., unread/blocked from the feed) or be collapsed.
- **Recommended change:** (a) Empty state headings should use 16px/500 or the H3 section heading scale. Ensure the heading hierarchy follows: H1 (page title, 20px/700) > H3 (sub-section, 16px/600) > body (14px/400). (b) In the empty state, show "Suggested: Your 3 most urgent unread items" populated from the feed, or collapse the panel. Once populated, show last 5 visited items with project name, module, and timestamp.
- **Expected user benefit:** Correct visual hierarchy; Recent Context panel never wasted on a passive empty state.
- **Acceptance criteria:** No empty state heading renders at the same font-size and weight as the page title. Recent Context panel is never empty when items exist in the work feed. Type scale follows a documented hierarchy.
- **Notes for implementation:** The empty state should use a `subtitle2` or `body1Strong` Fluent variant, not `title3` or equivalent.

---

### UIF-012
- **Severity:** High
- **Category:** Navigation / IA
- **Element reference(s):**
  - Visible label/text: Section filter buttons: "Overdue," "Blocked," "Unread" + "Group by" row (lane/priority/project/module) + "Standard" density control
  - Component type: `fui-ToggleButton` filter buttons; dual command toolbar rows
  - Approximate location on screen: Command bar below tabs, left side
  - Distinguishing visual traits: Two separate toolbar rows consuming ~80px vertical space. Filter buttons (Overdue/Blocked/Unread) are text-only with no count badges and no visible active/inactive differentiation. "Group by" buttons in a second row look like a tab strip but are not. "Standard" has no clear dropdown or toggle affordance.
  - DOM/CSS/ARIA hint: All three filter buttons share the same class; none show `aria-pressed="true"` in rest state. Group by row is a full separate horizontal row of bold text buttons.
- **Current observed state:** Three filter quick-filters (Overdue, Blocked, Unread) are text-only buttons with no count badges and no visible active state differentiation. Two separate command rows consume excessive chrome overhead. The "Standard" density control is not clearly a dropdown. Filter buttons have no active/inactive visual differentiation. This command surface redundancy is a hallmark of legacy enterprise SaaS, not a premium construction platform.
- **Recommended change:** Collapse into a single command bar: Search input (left), filter chips (Overdue/Blocked/Unread with active-state fill and count badges), separator, "Group by ▾" dropdown (replaces 4 individual buttons), "View ▾" dropdown (replaces Standard). Target: single row, ≤48px height.
- **Expected user benefit:** Reduced chrome overhead; filter active state immediately visible; group/view controls discoverable without consuming a full row.
- **Acceptance criteria:** One command row visible. Filter chips show active fill when selected. Group by and View controls use dropdown pattern. Total command bar height ≤48px.

---

## Net-New Findings (Audit 2)

The following findings were identified in the follow-up audit conducted after Phase 2 Waves 1–5 and were not present as explicit findings in the original audit.

---

### UIF-013
- **Severity:** High
- **Category:** Navigation / App Shell
- **Element reference(s):**
  - Visible label/text: Left sidebar nav (56px wide, only 1 visible icon — "My Work")
  - Component type: `[role="navigation"]` NAV, 56px wide
  - Approximate location: Far left of page, full height
  - Distinguishing visual traits: `background: rgb(17,24,39)`, width 56px, only "My Work" icon and "Expand sidebar" button visible
  - DOM/CSS/ARIA hint: `width: 56px`, sidebarData shows only "My Work" aria-label and "Expand sidebar" button
- **Current observed state:** The sidebar is a thin 56px icon rail with only one visible navigation item ("My Work"). For a platform covering BD, Estimating, Project Hub, and PMP modules, a single-item sidebar provides no spatial orientation. Users have no visible way to navigate to other modules.
- **Why this is a problem:** Construction platforms require rapid context switching between BD pipeline, estimating, and project execution. A nav that shows only the current page fails its primary purpose.
- **Recommended change:** Either (a) add module-level icons to the collapsed rail with tooltips (BD, Estimating, Project Hub, Reports), or (b) expand to a 200px sidebar by default with labeled nav items. At minimum, the collapsed rail should show 3–5 module icons.
- **Acceptance criteria:** At least 4 navigation destinations visible in the sidebar without requiring the user to invoke the expand action.

---

### UIF-014
- **Severity:** High
- **Category:** Interaction / Construction Workflow
- **Element reference(s):**
  - Visible label/text: "Open" button (all 8 work items)
  - Component type: Primary CTA button on each work item row
  - Approximate location: Right side of each work item, below the module slug
  - Distinguishing visual traits: All 8 items share an identical "Open" label regardless of item state or module context. Title links render in default browser blue-underline style.
- **Current observed state:** The sole action per work item is a generic "Open" button with no context-sensitivity. For a blocked item, the meaningful action is "Resolve Block." For an approval item, it's "Review & Approve." For a health pulse it's "View Status." The same label for all contexts destroys triage clarity and forces the user to click to understand what action is expected.
- **Why this is a problem:** Construction professionals need to understand the required action before clicking. A context-aware CTA reduces decision time and click depth. "Open" is the least informative possible label.
- **Recommended change:** Replace generic "Open" with context-sensitive labels based on item state/module: "Resolve Block" (blocked items), "Approve" (approval-needed items), "Review Score" (scorecard items), "View Health" (health pulse items). Add a secondary ghost action ("Dismiss", "Delegate") inline. Derive the label from item metadata available at render time.
- **Acceptance criteria:** Each work item CTA label reflects its action type. No two semantically different item types share the same CTA label without justification.

---

### UIF-015
- **Severity:** Medium
- **Category:** SPFx / Responsive Layout
- **Element reference(s):**
  - Visible label/text: Entire page layout
  - Component type: Page body, 56px sidebar + ~953px content = ~1009px minimum render width
  - Approximate location: Full page
  - Distinguishing visual traits: Content width is fixed at ~921px; no responsive breakpoints observed
  - DOM/CSS/ARIA hint: `main { margin-left: 56px }`, feed width ~921px fixed
- **Current observed state:** The layout has a fixed minimum width of ~1009px. In an SPFx web part context (typically 400–700px available width), the page content would overflow and require horizontal scrolling. Fixed-position elements (`z-index: 99999`) would bleed through SPFx host chrome.
- **Why this is a problem:** SPFx and embedded contexts are likely deployment targets. Fixed-width layout breaks in constrained host applications.
- **Recommended change:** Add fluid responsive layout: at ≤768px collapse sidebar, switch to percentage-based content widths, stack the command bar vertically, and hide Insights/Quick Access behind a toggle.
- **Acceptance criteria:** Page renders without horizontal scroll at 400px, 600px, 800px, and 1024px viewport widths.

---

### UIF-016
- **Severity:** Medium
- **Category:** Design System / Visual Identity
- **Element reference(s):**
  - Visible label/text: All 8 work items across 3 project contexts (Harbor View Medical Center, Airport Terminal Expansion, Downtown Transit Hub, Riverside Office Complex)
  - Component type: `.hbc-my-work-list-item` (8 total items)
  - Approximate location: Work feed, full list
  - Distinguishing visual traits: No project color, no project icon, no project badge — all items visually identical; only the title text differentiates them
- **Current observed state:** Items for four different projects are visually identical. No project color, no project icon, no assignee/owner signal. Project identity is the primary organizational axis for construction professionals but is completely absent from the list view.
- **Why this is a problem:** When a user has work items across 4 projects, no visual project anchoring forces re-reading titles on every scan. Construction professionals think in projects.
- **Recommended change:** Add a 4px left border or avatar chip per work item, color-coded by project. Alternatively, add a small colored project badge to each item's metadata row. Project colors should be consistent with any project color used elsewhere in the platform.
- **Acceptance criteria:** Each work item row has a visible project-identity signal that allows a user to cluster items by project without reading the title.

---

### UIF-017
- **Severity:** Medium
- **Category:** Accessibility / Field Use
- **Element reference(s):**
  - Visible label/text: All work item title links, Open buttons, group header collapse buttons
  - Component type: All interactive elements in `.hbc-my-work-feed`
  - Approximate location: Entire work feed
  - Distinguishing visual traits: Focus outline styles computed as `transparent solid 2px` — focus ring is invisible
  - DOM/CSS/ARIA hint: Focus rule preview: `transparent solid 2px`
- **Current observed state:** Focus outline styles are set to transparent. Keyboard-navigable users see no visual focus indicator on any interactive element. This is a WCAG 2.4.7 Level AA failure.
- **Why this is a problem:** Tablet and keyboard navigation is common for field staff using external keyboards on tablets or laptops in field offices. Transparent focus outlines make keyboard navigation unusable.
- **Recommended change:** Set focus-visible styles to `outline: 2px solid rgb(243,112,33); outline-offset: 2px` (matching the product's orange accent) for all interactive elements in the work feed and navigation.
- **Acceptance criteria:** Tab key navigation shows a visible focus ring on all interactive elements. Passes axe or Lighthouse accessibility audit for focus visibility. WCAG 2.4.7 compliant.

---

## Mold Breaker Assessment

*(From Audit 2 — post-wave-5 state)*

### Adaptive Shell
**Score: 4/10**
- Current evidence: 56px icon-rail sidebar (one item), 56px header with project selector, Create, and notifications. Shell is minimal but underpowered — one nav item is not a functional shell.
- Gap: Nav rail needs 4–6 module icons. Header project selector should show project color/status. Shell should feel like a product, not a placeholder.
- Specific change: Populate the nav rail with module icons (BD, Estimating, Project Hub, Reports). Add project health indicator dot next to the project name in the header.

### Context-Aware State Design
**Score: 3/10**
- Current evidence: PARTIAL sync badge + "2 source(s) unavailable" text exists. BLOCKED badge is visible. But: no retry action, no per-item state clarity, no loading/empty/offline states visible for other conditions.
- Gap: Only 2 of ~8 meaningful states are represented (partial-sync, blocked). The others (overdue, aging, draft, stale, attention-needed) either lack visual representation or are filter-only concepts.
- Specific change: Add per-item state chip system using consistent semantic tokens. Add retry affordance to sync bar. Make the unread dot visually active (currently transparent/invisible at computed styles).

### Superior Data Surface
**Score: 3/10**
- Current evidence: Work feed is a flat list. Insights are buried 900px below fold. No table/card hybrid. No progressive disclosure.
- Gap: The page defaults to the weakest possible data presentation — an unstyled flat list. The right-side real estate is completely empty within each row.
- Specific change: Restructure to a hybrid row card (56–72px min-height, multi-column within each row: title/state left, module+date center, action right) + persistent right panel for Insights.

### Field/Jobsite Usability
**Score: 3/10**
- Current evidence: Touch targets exist (Open button) but are small (12px font, minimal padding). No quick-action gestures. Dev badge obstructs bottom viewport on mobile.
- Gap: Items are not touch-optimized (minimum 44px touch target per Apple HIG/WCAG). Module slugs unreadable. No glance-optimized layout.
- Specific change: Minimum 44px touch targets on all interactive elements. Remove dev badge from viewport.

### PWA-Native Quality
**Score: 3/10**
- Current evidence: Page has `role="status"` aria-live regions for status updates. Header is clean.
- Gap: Dev badges break standalone feel. No offline indicator, no skeleton loading states visible, no PWA manifest evidence in the rendered state.
- Specific change: Add skeleton loading states for work items, offline status indicator in the header, and remove all dev-mode overlays from non-dev builds.

### SPFx/Embedded Quality
**Score: 2/10**
- Current evidence: Layout is ~1009px minimum width, fixed positioning in content.
- Gap: Hard layout break below ~1009px. Fixed-position elements (dev badge, z-index 99999) would bleed through SPFx host chrome. No responsive breakpoints observed.
- Specific change: Fluid responsive layout. Replace all fixed-position dev overlays. Test at 400, 600, 800px widths.

### Iconography/Elevation/Micro-Interactions
**Score: 3/10**
- Current evidence: SVG icons present in header. Chevrons on group headers. Orange brand accent on Create button and active tab. No hover states on work items, no micro-animation on collapse/expand, no elevation/shadow system.
- Gap: No icon presence within work items. No loading spinners. No micro-transitions on collapse. Module labels use no icons.
- Specific change: Add 16px module category icons to each work item. Add collapse animation on group headers. Add hover elevation (subtle shadow or background shift) on metric cards.

### Construction-Tech Advantage
**Score: 3/10**
- Current evidence: The lane model (waiting-blocked → do-now → watch) is a genuine construction-workflow insight. The "Blocked" signal is appropriately amber. BD, Estimating, and PMP module separation is correct.
- Gap: No construction-specific context is surfaced: no bid due dates, no project phase, no dollar amounts, no risk category. The page looks identical to a generic task manager.
- Specific change: Add optional construction-context metadata row per item (bid due date, project phase, risk flag). Add "Days to Bid" or "Phase" chip for estimating/BD items.

### Competitive Superiority
**Score: 3/10**
- Current evidence: Lane-based prioritization and cross-module aggregation is ahead of legacy construction platforms that silo work by module.
- Gap: Execution is far behind. Procore, Autodesk Build, and even Linear (non-construction) have more polished list surfaces, better state management, and cleaner data density.
- Specific change: The conceptual model (cross-module work aggregation + blocked/do-now/watch lanes) is the moat. Investment must go into execution quality to match the concept quality.

### Non-Obvious Upgrade Potential
**Score: 6/10**
- Current evidence: The platform aggregates cross-module work intelligently. The insight cards surface escalation candidates and aging — genuinely useful.
- Gap: The insight cards are not interactive or explorable. The page doesn't show trend direction. Quick Actions are limited to 3 generic shortcuts.
- Specific change: Make insight cards interactive (click to filter). Add sparkline trend indicators to metric cards. Replace Quick Actions with contextually generated "Your next 3 recommended actions" based on the work feed state.

---

## Competitive Benchmark Readout

*(From Audit 2 — post-wave-5 state)*

The currently rendered page is **below current best-in-class construction UX** across all execution dimensions, though its conceptual model (cross-module work aggregation with lane-based prioritization) is ahead of incumbent siloed navigation.

**What it already does at or above incumbent level:** The cross-module work feed concept (BD + Estimating + PMP items in one personal view) is not standard in current construction platforms. Most competitors force users to navigate to each module separately. The blocked/do-now/watch lane model is a workflow-aware prioritization not commonly found in Procore or Autodesk Build's personal views.

**Where it still resembles the weak patterns of current platforms:** The same cognitive overload problem present in legacy platforms appears here in different form — not from too many data columns, but from too many undifferentiated text rows. Module labels as raw slugs, default browser hyperlink styling, no hover states, and invisible focus rings are all consistent with rushed MVP construction-tech builds.

**What must change to become decisively superior:** Three shifts: (1) Execute the work item row design at a professional level — hover, row separation, left-lane color, secondary metadata; (2) move to a two-column layout with persistent right-panel Insights; (3) make the CTA context-aware so each item's action is obvious without opening it.

---

## Quick Wins

*(From Audit 2 — high-impact, low-effort changes)*

| ID | Change | Why it is quick | Expected impact |
|---|---|---|---|
| QW-001 | Add `padding: 12px 16px`, `border-bottom: 1px solid rgba(255,255,255,0.07)`, and hover background to `.hbc-my-work-list-item` | Pure CSS, 3 rules, no component changes | Immediately scannable list, +50% triage speed |
| QW-002 | Override `.hbc-my-work-list-item__title` color from browser default `rgb(0,0,238)` to a design-system blue token `rgb(147,197,253)` | 1 CSS rule | Eliminates the most jarring visual inconsistency instantly |
| QW-003 | Create a module display-name map and apply it in the render layer (e.g., `bd-scorecard` → "BD · Scorecard") | Data transformation in one shared util function | Removes all slug labels from the UI in one change |
| QW-004 | Gate `HB-AUTH-DEV` badge and Tanstack devtools button behind environment flag | Environment check in 1–2 component files | Cleans up fixed overlay immediately |
| QW-005 | Convert group header `.hbc-my-work-feed__group-header` to dark-compatible styling (remove light background, add lane-color left bar, human labels) | CSS + string constant change | Fixes the light-on-dark contrast inversion in the most prominent structural elements |

---

## Structural Improvements

*(From Audit 2 — architectural layout changes required)*

### SI-001: Two-Column Page Layout
- **Structural improvement:** Implement a persistent right column (~300px) for Insights + Quick Access, leaving the main work feed at ~600px wide. Panel scrolls independently or is sticky.
- **Why the current state suggests this is needed:** Insights section is 900px below fold — invisible during the primary workflow. The right portion of the viewport is empty dark space throughout the work feed scroll.
- **Priority:** High — this is a layout change that unblocks multiple downstream improvements (persistent analytics, reduced scroll depth, Mold Breaker panel eligibility).
- **Relationship to findings:** Directly resolves UIF-002; enables the contextual right panel recommended in UIF-008.
