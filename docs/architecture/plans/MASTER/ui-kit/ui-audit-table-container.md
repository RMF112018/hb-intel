# HB Intel UI Inspection – Mold Breaker Improvement Register

---

## Page Under Review

- **Page / feature name:** My Work — Table Container / Lane Component (`[data-lane]` sections + `HbcDataTable`) across all four grouping states: Group by Lane, Group by Priority, Group by Project, Group by Module
- **Primary user/task implied:** Executive/PM triaging active construction work items by urgency, reviewing blocked items, dispatching actions, and filtering by workflow context
- **Overall UI maturity assessment:** 5/10
- **Overall product-quality assessment:** 5/10
- **Mold-breaker potential assessment:** 7/10
- **Current classification:** Competitive (low end)
- **Primary verdict:** The lane container model is the right architectural choice for a construction workflow triage surface — grouping by urgency, project, or module is genuinely useful and differentiating. The underlying structure is sound: sticky lane headers, collapsible sections, contextual action buttons per row, and a multi-grouping menu. However, the execution has a cluster of defects that together undercut its quality: every Fluent UI design token used in this component is unresolved (all return empty strings), causing broken row hover states, broken lane header backgrounds, and broken border tokens. The "Blocked" status badge bypasses the governed `HbcStatusBadge` component entirely (no `role="status"`, no `aria-label`). All non-"lane" groupings produce lane headers with `4px solid transparent` left borders — no color accent — making them visually indistinguishable from each other. The table overflows its container by 20px horizontally in every grouping view, creating a persistent horizontal scrollbar. Lane title casing is incorrect in "Group by module" view ("Bd Scorecard" instead of "BD Scorecard"). These are not polish issues — they are shipped defects in the product's primary data surface.

---

## Executive Diagnosis

**3 Biggest Strengths**
- **Multi-grouping model is construction-workflow-correct:** Four grouping options (lane, priority, project, module) cover the primary mental models a PM/Executive uses to triage work. This is structurally superior to flat list tables common in competing platforms.
- **Contextual action buttons per lane type:** "Resolve Block" (danger/red), "Take Action" (blue), "Review Score", and "View" are semantically correct and visually differentiated by color and label — good workflow-to-button mapping.
- **Lane collapse/expand is well-implemented mechanically:** `aria-expanded`, `aria-controls`, `aria-labelledby` are all wired. Chevron rotation (0deg → -90deg) is smooth and semantically clear. Sticky lane headers work correctly on scroll.

**5 Most Important Weaknesses**
1. **All Fluent UI design tokens are unresolved** — `--colorNeutralBackground1Hover`, `--colorNeutralBackground2`, `--colorNeutralStroke2`, `--colorBrandForeground1` all compute to empty string, causing broken row hover, broken lane header backgrounds, and broken cell border tokens throughout.
2. **"Blocked" badge is not using `HbcStatusBadge`** — raw `<span>` with light amber fill on a dark background, no `role="status"`, no `aria-label`, wrong dark-theme color semantics.
3. **All non-"lane" groupings have no lane header color accent** — `border-left: 4px solid transparent` in Group by Priority, Project, and Module views makes all lanes visually identical — no urgency or semantic differentiation.
4. **Table overflows container by 20px horizontally** in every grouping view (scrollWidth 780 > clientWidth 760), producing a permanent horizontal scrollbar in all four grouping modes.
5. **Source column primary text row is always "—"** — the field labelled as "project name" above each source chip renders a dash for every row, suggesting a data mapping failure or an intentional but unexplained design choice that reads as broken.

**Single Biggest Reason Not Yet Mold Breaker:**
The token system is completely unwired in the table components. Without a functioning token layer, row hover states are silently broken (the hover rule exists in CSS — `.f1knas48:hover { background: var(--colorNeutralBackground1Hover) }` — but the token resolves to empty), every color-sensitive behavior fails gracefully to nothing, and Field Mode adaptation is impossible. This is not a visual polish gap — it is a systems engineering gap that makes the entire data surface appear inert and unresponsive to interaction.

---

## Top Priority Findings

### TIF-001
- **Severity:** Critical
- **Category:** Design System
- **Element reference(s):**
  - Visible label/text: All table rows, lane headers, cell borders
  - Component type: All `[data-lane]` sections + `tr[data-index]` + `th[scope="col"]` elements
  - Approximate location: Entire table area, y=265–900
  - Distinguishing visual traits: Lane headers render as `rgb(15,23,42)` — matching the page background — instead of a distinguishable header shade; row hover shows no background change
  - DOM/CSS/ARIA hint: `window.getComputedStyle(document.documentElement).getPropertyValue('--colorNeutralBackground2')` returns `""`. `.f1knas48:hover { background-color: var(--colorNeutralBackground1Hover) }` — token value empty. `var(--colorBrandForeground1)` on title cell border-left also unresolved.
- **Current observed state:** 10 Fluent UI design tokens used throughout the table components all resolve to empty strings. Lane header `background-color: var(--colorNeutralBackground2)` falls through to inherited page background `rgb(15,23,42)` — identical to content area. Row hover `var(--colorNeutralBackground1Hover)` is empty, so hover produces zero visual change.
- **Why this is a problem:** Row hover is a foundational table interaction cue — it orients the user's eye and confirms what they're about to click. Lane header background separation visually groups rows under their lane. Both fail silently due to unresolved tokens.
- **Why it matters in construction-tech:** A PM scanning 8 items for blocked/action items needs instant hover-to-row association. In a cluttered, time-pressured triage session, invisible hover state significantly increases click errors.
- **Why it prevents mold-breaker status:** A table component with broken hover and broken color hierarchy cannot be competitive, let alone mold-breaking.
- **Recommended change:** Define the Fluent UI color tokens in the root scope: `--colorNeutralBackground2: rgb(31,41,55)`, `--colorNeutralBackground1Hover: rgba(255,255,255,0.06)`, `--colorNeutralStroke2: rgb(61,61,61)`, `--colorBrandForeground1: rgb(59,159,255)`, `--colorNeutralForeground1: rgb(255,255,255)`, `--colorNeutralForeground2: rgb(200,200,200)`, `--colorNeutralForeground3: rgb(160,160,160)`, `--colorNeutralForeground4: rgb(120,120,120)`, `--colorNeutralBackground4: rgb(40,50,65)`. Apply at `:root` in the global stylesheet.
- **Acceptance criteria:** `getComputedStyle(document.documentElement).getPropertyValue('--colorNeutralBackground1Hover')` returns a non-empty value; hovering any `tr[data-index]` produces a perceptible background color change; lane header background is visibly distinct from content row background.
- **Notes for implementation:** This is the same token gap identified in the header (UIF-001) and sidebar (SIF-011). A single `:root { }` block in `globals.css` fixes all three components simultaneously. Priority: complete this before any other table fix.

---

### TIF-002
- **Severity:** Critical
- **Category:** Design System / Accessibility (UI Kit Spec Violation)
- **Element reference(s):**
  - Visible label/text: "Blocked" badge
  - Component type: `<span style="font-size:0.6875rem; background-color:rgb(255,240,212); color:rgb(153,102,0)">Blocked</span>`
  - Approximate location: STATUS column, rows 0 and 1 in Waiting/Blocked lane; y≈378, x≈354
  - Distinguishing visual traits: Light amber/cream background `rgb(255,240,212)` with dark amber text `rgb(153,102,0)` — a light-mode palette on a dark-background table
  - DOM/CSS/ARIA hint: `role=null`, `ariaLabel=null`, `isHbcStatusBadge=false` — direct confirmation the `HbcStatusBadge` component is not in use
- **Current observed state:** The "Blocked" status uses a raw `<span>` with inline styles. It has no `role="status"`, no `aria-label`, and does not use `HbcStatusBadge`. The color palette (`rgb(255,240,212)` / `rgb(153,102,0)`) is a light-mode amber — inappropriate for the dark-themed table surface. `HbcStatusBadge` spec for Field Mode specifies error-state increases saturation (should be closer to red/bright orange), but this badge doesn't use `HbcStatusBadge` at all.
- **Why this is a problem:** (1) WCAG 1.3.1 violation — no semantic status role. (2) Light-mode amber on dark background creates a jarring visual pop that reads as a warning/caution rather than "blocked" — incorrect semantic color mapping. (3) Direct spec violation of `HbcStatusBadge` governance.
- **Why it matters in construction-tech:** "Blocked" is the highest-urgency status in a construction workflow. It must be immediately, unambiguously recognizable as a blocking issue — not a caution or warning. Light amber historically signals "pending" in construction workflows, not "blocked."
- **Recommended change:** Replace the raw `<span>` with `<HbcStatusBadge variant="error" label="Blocked" size="small" />`. Per `HbcStatusBadge.md` spec, `variant="error"` renders with high-contrast red on dark backgrounds, includes `role="status"`, and includes `aria-label="error status: Blocked"`. This also automatically applies Field Mode high-contrast variants.
- **Acceptance criteria:** `statusBadge.getAttribute('role') === 'status'`; `statusBadge.getAttribute('aria-label') === 'error status: Blocked'`; background color is red/error-family (not amber); `data-hbc-ui="status-badge"` attribute present.
- **Notes for implementation:** Check all other status values across the My Work table (not just "Blocked") — map each to the correct `HbcStatusBadge` variant. "Blocked" → `error`, pending states → `warning`, active → `info`, complete → `success`, neutral → `neutral`.

---

### TIF-003
- **Severity:** Critical
- **Category:** State Design / Visual Hierarchy
- **Element reference(s):**
  - Visible label/text: "Now", "Soon", "Watching" lane headers (Group by Priority); "No Project" (Group by Project); "Bd Scorecard", "Project Hub Pmp", "Estimating Pursuit", "Bd Department Sections" (Group by Module)
  - Component type: `<div style="border-left: 4px solid transparent">` — lane header left border in all non-"lane" groupings
  - Approximate location: Each lane header, y varies by grouping
  - DOM/CSS/ARIA hint: `headerBorderLeft: "4px solid transparent"` confirmed for all lanes in Priority, Project, and Module groupings. Only "lane" grouping has actual colors (`rgb(255,77,77)` for Waiting/Blocked, amber for Action Required, gray for Watching).
- **Current observed state:** In "Group by lane," lanes have meaningful left-border color coding (red for Waiting/Blocked, amber for Action Required, gray for Watching). In ALL other groupings (priority, project, module), every lane header shows `border-left: 4px solid transparent` — the 4px slot is present but invisible. All lanes look identical regardless of urgency.
- **Why this is a problem:** The 4px left border is the only color cue on the lane header. In "Group by priority," "Now" (4 blocked/action items) and "Watching" (1 item) should look meaningfully different. They don't — both are visually identical `transparent` borders on the same background.
- **Why it matters in construction-tech:** Urgency-coded visual hierarchy is essential for rapid triage. A PM scanning "Group by priority" with 8 items needs instant visual confirmation of which lane demands attention. Identical-looking lane headers eliminate this signal.
- **Recommended change:** Define a color-coding map for each grouping type and apply it to `border-left-color`: For **priority grouping**: "Now" → `rgb(255,77,77)` (red), "Soon" → `rgb(243,112,33)` (orange), "Watching" → `rgb(139,149,165)` (gray). For **module grouping**: use a module-specific color from the source chip dot color already present in rows (BD Scorecard → `rgb(51,122,171)`, etc.). For **project grouping**: use a per-project color or fall back to neutral blue. The 4px border slot already exists — only the color value needs to be set dynamically based on the lane key.
- **Acceptance criteria:** In "Group by priority" view, "Now" lane has a red left border; "Soon" has an orange left border; "Watching" has a gray left border. In "Group by module" view, each module lane has a visually distinct left border color.

---

### TIF-004
- **Severity:** High
- **Category:** Layout
- **Element reference(s):**
  - Visible label/text: Horizontal scrollbar visible at bottom of each lane in all grouping views
  - Component type: `[style*="overflow: auto"]` scroll wrappers inside `[data-hbc-ui="data-table"]`
  - Approximate location: Bottom edge of each lane section
  - DOM/CSS/ARIA hint: `scrollWidth: 780`, `clientWidth: 760` in all four grouping views. Difference = 20px. Table column sum: 280+120+160+100+120 = 780px. Wrapper = 800px but scrollable area = 760px (800 - scrollbar width ~20px?).
- **Current observed state:** All table lanes show a horizontal scrollbar. The table (780px wide) slightly overflows the scroll container's visible client width (760px) by 20px. This manifests as a subtle horizontal scrollbar at the bottom of every lane section in every grouping mode.
- **Why this is a problem:** A horizontal scrollbar in a primary data table is a layout failure signal. It tells users that content is cut off. In this case, the 20px overflow likely hides part of the actions column, potentially obscuring "Resolve Block" or "Take Action" buttons.
- **Recommended change:** Option A: Reduce the table's minimum column width sum to match the available container width. If the wrapper is 800px and a system scrollbar takes ~15–17px, set the table column sum to 760px (reduce the Work Item column from 280px to 260px, or the empty actions header from 120px to 100px). Option B: Set the wrapper to `overflow-x: hidden` if horizontal scroll is not a supported user behavior — this hides the scrollbar without layout shift. Option C: Use `table-layout: fixed; width: 100%` to make the table auto-fit its container width.
- **Acceptance criteria:** No horizontal scrollbar appears in any lane section in any grouping mode at 1280px viewport width. Actions column buttons remain fully visible.

---

### TIF-005
- **Severity:** High
- **Category:** Table / State Design
- **Element reference(s):**
  - Visible label/text: The "—" text in the SOURCE column primary row (above each source chip)
  - Component type: `<div style="font-size: 0.75rem; color: var(--colorNeutralForeground1)">—</div>` inside each source cell
  - Approximate location: SOURCE column, every row, all grouping views
  - DOM/CSS/ARIA hint: `sourcePrimaryText: "—"` confirmed for all 8 rows across all grouping modes
- **Current observed state:** The SOURCE column has a two-row layout: a primary text row (project/entity name) and a chip below it (module label). The primary text row renders "—" (em dash) for every single row in all grouping views. The chip below correctly shows "BD Scorecard," "Project Hub," "Est. Pursuit," etc.
- **Why this is a problem:** The em dash reads as missing or broken data. If the primary text is intended to show a project name or parent entity, it is either not being mapped from the data source, or the field is genuinely empty for all current test records. Either way, the visible result is a column with two pieces of information per cell where one is always a placeholder — wasting 8px of vertical row space and creating visual noise.
- **Why it matters in construction-tech:** A work item's parent project is among the first 3 pieces of context a PM needs. If this field is intentionally empty (no project assigned), the cell should render only the chip with no blank row above it. If it's a data mapping bug, it must be fixed.
- **Recommended change:** (1) Conditionally render the primary text div only when a non-dash value is present. If value is null/empty/dash, render only the module chip in the cell, vertically centered. (2) If the primary text is meant to be a project name field, wire it to the correct data property. (3) If "—" is intentional for "No Project," replace the dash with nothing — the chip alone is sufficient and reads more clearly.
- **Acceptance criteria:** No row in the SOURCE column shows "—" as primary text above a chip. Either the primary text shows a real value or it is omitted entirely, leaving only the chip.

---

### TIF-006
- **Severity:** High
- **Category:** Table / Visual Hierarchy
- **Element reference(s):**
  - Visible label/text: Table container height per lane (fixed `height` style)
  - Component type: `[style*="overflow: auto"]` wrapper inside each `[data-hbc-ui="data-table"]`
  - Approximate location: Each lane's data table region
  - DOM/CSS/ARIA hint: "Waiting/Blocked" lane: `height: 140px` (container) but `tableHeight: 280px` (actual table with 2 rows × 60px + thead ~34px = 154px needed; container is 140px — 14px short). "Now" lane in priority view: `height: 236px`, table actual height = 280px (4 rows needed ~274px). The container clips content, requiring vertical scroll within the lane.
- **Current observed state:** Each lane's table wrapper has a fixed pixel height that is not always sufficient to show all rows without inner vertical scrolling. In "Group by priority," the "Now" lane has 4 rows but the container height of 236px only shows ~3.5 rows — the 4th row is partially visible and requires scrolling inside the lane container.
- **Why this is a problem:** Each lane has its own independent internal scroll — the user must scroll within a lane while the page also scrolls. This creates a compound scroll trap where small mouse movements inside a lane scroll the lane, not the page. For a primary triage surface, this is a significant usability defect.
- **Why it matters in construction-tech:** A PM on a tablet reviewing "Now" items needs to see all 4 action items at once. A partially visible 4th row, or a scroll trap inside the lane, adds friction to the most urgent workflow state.
- **Recommended change:** Make lane height dynamic: calculate `height = Math.min(rowCount * rowHeight + theadHeight, maxLaneHeight)` where `maxLaneHeight` is a configurable cap (e.g., 400px). For short tables (≤ 5 rows), eliminate inner scroll entirely by letting the table height equal its natural content height. Inner scroll is appropriate only when a lane has many rows (>6). Remove the fixed `height` calculation and replace with `max-height: 400px; overflow-y: auto`.
- **Acceptance criteria:** A lane with 2 rows shows all 2 rows without any scrollbar or clipping. A lane with 4 rows shows all 4 rows without inner scroll (assuming ≤ 5-row threshold). A lane with 8+ rows caps at `max-height: 400px` with a single internal scrollbar.

---

### TIF-007
- **Severity:** High
- **Category:** Visual Hierarchy / Design System
- **Element reference(s):**
  - Visible label/text: "Bd Scorecard", "Project Hub Pmp", "Estimating Pursuit", "Bd Department Sections" lane titles in "Group by module" view
  - Component type: `<h3>` inside each lane header
  - Approximate location: Lane headers in "Group by module" grouping
  - DOM/CSS/ARIA hint: `laneTitles: ["Bd Scorecard", "Project Hub Pmp", "Estimating Pursuit", "Bd Department Sections"]` — confirmed by direct text inspection
- **Current observed state:** Lane titles in "Group by module" are generated by converting the module key using standard title-case, which does not handle acronyms: "BD" → "Bd", "PMP" → "Pmp". The expected labels are "BD Scorecard," "Project Hub PMP," "Estimating Pursuit," and "BD Department Sections."
- **Why this is a problem:** "Bd Scorecard" reads as a typo or broken data to any domain user. BD (Business Development) is a recognized acronym in construction; "Bd" is not. Same for "Pmp" (Project Management Plan or Project Manager Principal).
- **Recommended change:** In the lane title generation function, apply an acronym-aware formatter: maintain a lookup map of known uppercase tokens (`BD`, `PMP`, `RFP`, `BIM`, etc.) and apply them during title generation. Implementation: `const ACRONYMS = ['BD', 'PMP', 'RFP', 'BIM', 'GMP']; function formatLaneTitle(key) { return key.split(/[-_\s]/).map(word => ACRONYMS.includes(word.toUpperCase()) ? word.toUpperCase() : capitalize(word)).join(' '); }`.
- **Acceptance criteria:** "Group by module" lanes display "BD Scorecard," "Project Hub PMP," "Estimating Pursuit," "BD Department Sections." No known construction acronym appears in mixed case.

---

### TIF-008
- **Severity:** High
- **Category:** Construction Workflow / State Design
- **Element reference(s):**
  - Visible label/text: "Group by project" → "No Project 8"
  - Component type: `[data-lane="No Project"]` with `badge: "8"`
  - Approximate location: Full content area when "Group by project" selected
  - DOM/CSS/ARIA hint: All 8 work items fall into a single "No Project" lane. Zero items have a project assignment.
- **Current observed state:** Selecting "Group by project" produces a single lane "No Project" containing all 8 items. This renders the grouping option useless for the current data set, and more importantly, reveals that none of the 8 work items have a project association — a significant data quality signal.
- **Why this is a problem:** (1) A "Group by project" option that always shows "No Project" for every item is not a useful workflow tool. (2) It exposes a data quality issue with no user guidance about what "No Project" means or how to assign projects. (3) There is no empty-state-like guidance, no "assign project" affordance, and no explanation.
- **Why it matters in construction-tech:** Project attribution is foundational in construction workflows. Work items without project context cannot be escalated, delegated, or tracked correctly. The My Work surface should surface this gap to the user.
- **Recommended change:** (1) When "Group by project" produces a single "No Project" lane: show a contextual inline notice within the lane header: "No project assignments found. Add projects to work items to use this grouping." with a link to documentation or item editing. (2) Implement an `emptyStateConfig` per `HbcDataTable.md` spec when a grouping produces a single null-key lane. (3) The "Group by project" option should be disabled/greyed in the menu when no items have project data — with a tooltip: "No project data available."
- **Acceptance criteria:** When "Group by project" is selected and all items are in "No Project," a contextual notice or disabled-state indicator is visible to the user. The empty grouping is not silently shown as a usable state.

---

### TIF-009
- **Severity:** High
- **Category:** Interaction / State Design
- **Element reference(s):**
  - Visible label/text: "Group by lane" / "Group by priority" / "Group by project" / "Group by module" menu items
  - Component type: `[role="menuitem"]` elements inside the `[role="menu"]` dropdown
  - Approximate location: Dropdown menu at x≈834, y≈321–455
  - DOM/CSS/ARIA hint: `activeItem: null` — no `aria-checked="true"` or `aria-selected="true"` on any menu item; current grouping is "Group by priority" but no item is visually or programmatically selected.
- **Current observed state:** The grouping dropdown shows all four options but provides no indication of which grouping is currently active. After selecting "Group by priority," the menu still shows all four items identically — no checkmark, no bold, no color, no `aria-checked`. The user cannot confirm their selection from the menu state.
- **Why this is a problem:** Without an active-state indicator, users cannot confirm their current grouping after selecting it, especially if they re-open the menu. This is a basic selection state failure.
- **Recommended change:** Add `aria-checked="true"` to the currently active grouping menu item (convert from `menuitem` to `menuitemradio` role for correct ARIA semantics). Add a checkmark icon or visual indicator (bold text + left checkmark) on the active item. Persist the selection in component state and reflect it in the menu on re-open.
- **Acceptance criteria:** After selecting "Group by priority," re-opening the menu shows a checkmark or visual indicator on "Group by priority." `aria-checked="true"` is set on the active item. `aria-checked="false"` on all others.

---

### TIF-010
- **Severity:** High
- **Category:** Table / IA
- **Element reference(s):**
  - Visible label/text: Column headers "Work Item", "Status", "Source", "Due", (actions — no label)
  - Component type: `<th scope="col" aria-sort="none">` elements
  - Approximate location: Table header row, y≈328/383 (varies by lane)
  - DOM/CSS/ARIA hint: "Work Item": `cursor: pointer`; "Status": `cursor: default`; "Source": `cursor: default`; "Due": `cursor: pointer`; Actions: `cursor: default`. All have `aria-sort="none"` but only 2 of 4 labeled columns have pointer cursor.
- **Current observed state:** Only "Work Item" and "Due" columns have `cursor: pointer` (indicating clickable/sortable). "Status" and "Source" have `cursor: default` despite having `aria-sort="none"` set on them. The actions column (empty label) also has `cursor: default`. `HbcDataTable.md` specifies `enableSorting` enables interactive sort headers — but only 2 of 4 columns are sortable.
- **Why this is a problem:** The inconsistency creates false expectations: "Status" has `aria-sort="none"` (implying sortability) but `cursor: default` (implying it's not clickable). Users who try to sort by "Status" get no feedback. Sorting by status (Blocked → unblocked) is one of the most common construction triage actions.
- **Recommended change:** Either: (A) Enable sorting on "Status" and "Source" columns by adding sort handlers and `cursor: pointer` to their `<th>` elements, OR (B) Remove `aria-sort` from non-sortable columns entirely (`Status`, `Source`, `Actions`). Preferred: (A) — add status sort (Blocked first, then action-required, then watching) and source sort (alphabetical by module chip text).
- **Acceptance criteria:** All columns that have `aria-sort` also have `cursor: pointer`; all columns that are not sortable omit `aria-sort`; clicking a sortable header updates `aria-sort` to `"ascending"` or `"descending"` and reorders rows.

---

### TIF-011
- **Severity:** High
- **Category:** Visual Hierarchy / Field Use
- **Element reference(s):**
  - Visible label/text: "Resolve Block" button (danger variant), "Take Action" button (blue), "View" / "Review Score" (plain text)
  - Component type: `<button data-hbc-ui="button" data-hbc-variant="danger">`, `<button data-hbc-ui="button">`, plain text buttons
  - Approximate location: Actions column (rightmost), all rows
  - DOM/CSS/ARIA hint: All action buttons: `height: 28px`, `fontSize: 12px`. All three CTA types use the same font size and height. "View" and "Review Score" appear as plain text with no button styling visible in the table (probably ghost variant).
- **Current observed state:** All action buttons — regardless of urgency — use identical height (28px) and font size (12px). "Resolve Block" (danger, red fill) is visually louder than "View" (ghost) but all share the same compact size. At 28px height and 12px font, these buttons are below the 36px minimum for comfortable office use and far below the 44px WCAG touch target minimum.
- **Why it matters in construction-tech:** "Resolve Block" is the highest-urgency action in the table. Its button size should be proportional to its urgency weight. Field use on a tablet at 28px is a genuine usability failure for the most critical action.
- **Recommended change:** Increase all action button heights to `min-height: 36px` (office minimum). For `data-hbc-variant="danger"` buttons specifically, increase to `min-height: 36px` with a slightly bolder font (`font-weight: 600` already present, maintain). Match the `HbcDataTable.md` spec which uses density controls — the current "Compact" density should use 28px, but "Default" density should use 36px. Set density default to "Default" rather than "Compact."
- **Acceptance criteria:** At "Default" density, all action buttons have `min-height: 36px`; at "Compact," 28px is acceptable but not default; all button heights match their declared density setting.

---

### TIF-012
- **Severity:** High
- **Category:** Mold Breaker / Construction Workflow
- **Element reference(s):**
  - Visible label/text: Item Detail panel (appears on row click/row action)
  - Component type: Panel: `rgb(31,41,55)` background, `border-radius: 8px`, `border: 0.666px solid rgb(102,102,102)`, 371×393px
  - Approximate location: Appears overlapping the Insights sidebar at x≈897, y≈210
  - DOM/CSS/ARIA hint: Panel contains: "Item Detail" heading, work item title (H3 at 16px/600), "Close" button (28px height, 12px), status chip ("UNREAD"), lane/module metadata, task description text, "Open" button
- **Current observed state:** The Item Detail panel appears as a floating overlay on top of the Insights sidebar — it is not a proper side panel or drawer. It overlays existing content without a backdrop, has no `role="dialog"`, no `aria-modal`, and no focus trap. The "Close" button is 28px/12px (too small). The panel title "Item Detail" is generic — not the work item name.
- **Why this is a problem:** (1) No `role="dialog"` or `aria-modal` — screen readers cannot identify this as a modal context. (2) No focus trap — tabbing leaves the panel. (3) Overlapping the Insights panel creates a visual collision — two data surfaces compete for the same screen region. (4) "Item Detail" as a header is redundant — the work item title immediately below it already identifies the content.
- **Why it prevents mold-breaker status:** A premium construction-tech detail panel should slide in as a persistent side drawer (right-anchored), not float over existing content. The panel's visual weight, focus model, and information architecture should make it feel like a deliberate workspace expansion, not a tooltip overlay.
- **Recommended change:** (1) Implement as a right-anchored slide-in drawer (`position: fixed; right: 0; top: 58px; width: 360px`) rather than a floating overlay. (2) Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the work item title. (3) Implement focus trap on open. (4) Remove "Item Detail" generic header — use the work item title as the panel's `<h2>` heading. (5) Increase "Close" and "Open" buttons to 36px height.
- **Acceptance criteria:** Item Detail panel renders as a right-anchored drawer at ≥360px width; does not overlap the Insights panel; has `role="dialog"` and `aria-modal="true"`; focus moves to the panel on open and returns to the triggering row on close.

---

### TIF-013
- **Severity:** Medium
- **Category:** Interaction / State Design
- **Element reference(s):**
  - Visible label/text: Grouping dropdown — no visual current-state indicator on the "…" button
  - Component type: `<button aria-label="More actions">` [ref_234]
  - Approximate location: Command bar, far right, y≈289, x≈815
  - DOM/CSS/ARIA hint: Button uses `aria-haspopup` is not set; no `aria-expanded` attribute despite triggering a menu
- **Current observed state:** The "More actions" ellipsis button that controls grouping has no `aria-haspopup="menu"` and no `aria-expanded` attribute. When a non-default grouping is active ("Group by priority"), the button gives no visual indication that a custom grouping is in effect — the user cannot tell from the command bar that the view has been grouped.
- **Recommended change:** (1) Add `aria-haspopup="menu"` and `aria-expanded={isOpen ? 'true' : 'false'}` to the trigger button. (2) When a non-default grouping is active, visually indicate it on the trigger: show a filled dot, a small label, or change the button's background to a subtle active state (`rgba(255,255,255,0.1)`). (3) Change the button's `aria-label` to reflect active grouping: `aria-label="More actions — grouped by priority"` when a non-default grouping is selected.
- **Acceptance criteria:** `moreActionsBtn.getAttribute('aria-haspopup') === 'menu'`; active grouping is visually indicated on the command bar; button has updated `aria-label` reflecting current grouping.

---

### TIF-014
- **Severity:** Medium
- **Category:** Design System / Visual Hierarchy
- **Element reference(s):**
  - Visible label/text: Lane count badge ("2", "4", "1", etc.)
  - Component type: `<span style="font-size:0.6875rem; background-color:var(--colorNeutralBackground4); border-radius:10px">` inside each lane header
  - Approximate location: Lane header right of the lane title
  - DOM/CSS/ARIA hint: `--colorNeutralBackground4` is unresolved; badge has no `aria-label` to contextualize the count
- **Current observed state:** The lane count badge uses `var(--colorNeutralBackground4)` for background — which is unresolved (empty) and falls through to the header background, making the badge blend into the header. The badge also has no `aria-label` — screen readers announce the number without context ("2" rather than "2 items in Waiting / Blocked").
- **Recommended change:** (1) Set a direct fallback color: `background-color: var(--colorNeutralBackground4, rgba(255,255,255,0.12))`. (2) Add `aria-label="{count} items"` to the badge span. (3) Once TIF-001 is resolved, the token will render correctly — but the fallback ensures immediate fix.
- **Acceptance criteria:** Lane count badge is visually distinguishable from the lane header background at all times; `badge.getAttribute('aria-label')` returns a descriptive string like "2 items."

---

## Mold Breaker Assessment

### Adaptive Shell — 4/10
**Current evidence:** Lane sections collapse/expand correctly with ARIA and animation. The multi-grouping model is architecturally adaptive. However, no Field Mode adaptation exists (tokens unresolved, no high-contrast fallbacks for field glare conditions).
**Gap:** Field Mode row coloring, high-contrast badge variants, and touch-optimized row heights are all defined in spec but unwired.
**Required change:** TIF-001 (token system) unlocks all of this. Then apply `data-hbc-mode="field"` row height increases and `HbcStatusBadge` Field Mode colors.

### Context-Aware State Design — 4/10
**Current evidence:** Row-level urgency indicators exist (red left border for Blocked, brand blue for action-required). Lane header color coding exists in "lane" grouping. Row transition classes exist. Item Detail panel appears on row interaction.
**Gap:** Row hover is silently broken (TIF-001). Non-"lane" grouping lanes lose all color coding (TIF-003). Menu shows no active grouping state (TIF-009). Item Detail panel has no focus/dialog state management (TIF-012).
**Required change:** TIF-001 (tokens) + TIF-003 (non-lane color coding) + TIF-009 (active grouping state).

### Superior Data Surface — 5/10
**Current evidence:** Multi-grouping, collapsible lanes, contextual CTAs per row type, and source module chips all represent above-average data surface design. The lane model is genuinely better than flat construction-tech tables.
**Gap:** Fixed-height inner scroll per lane (TIF-006), horizontal overflow (TIF-004), empty source primary text (TIF-005), and missing row-level hover (TIF-001) all degrade the reading experience significantly.
**Required change:** TIF-001 + TIF-004 + TIF-005 + TIF-006 would elevate this to a 7/10 data surface.

### Field/Jobsite Usability — 3/10
**Current evidence:** Compact mode exists (28px rows). Row text is 12px (very small for field). Action buttons at 28px height fall below touch minimums. No high-contrast field mode for badge colors.
**Gap:** The default view is "Compact" — a field user's default should be standard density (36px rows, legible font). The "Blocked" badge in light amber is not readable under glare.
**Required change:** TIF-001 (tokens for Field Mode colors) + TIF-011 (button height) + set density default to "Default" not "Compact."

### PWA-Native Quality — 4/10
**Current evidence:** Token system gap means PWA offline/sync states cannot cascade into table component colors. Row transitions exist. Data is fetched (evidenced by the sync error banner).
**Gap:** No offline/stale state rendering in table rows (no visual distinction for stale data). No loading shimmer state observed (HbcDataTable spec has `isLoading` prop with shimmer — not observed in use).
**Required change:** TIF-001 (tokens) + implement `isLoading` shimmer during data fetches, and `stale` row variant for items from failed data sources (the banner shows a sync failure but rows show no stale indicator).

### SPFx/Embedded Quality — 6/10
**Current evidence:** Lane sections have `border-radius: 6px` and defined borders — they look like self-contained cards that would survive embedding. No SPFx-specific constraints in `HbcDataTable.md`.
**Gap:** The horizontal overflow (TIF-004) would be more severe in a constrained SPFx column. The 800px assumed width may not be available in all SharePoint webpart contexts.
**Required change:** TIF-004 (overflow) + ensure the table uses `width: