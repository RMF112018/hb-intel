# HB Intel UI Inspection – Mold Breaker Improvement Register

---

## Page Under Review

- **Page / feature name:** `HbcSidebar` — Left Navigation Rail, `/my-work` (My Work page), both collapsed (56px) and expanded (240px) states
- **Primary user/task implied:** Workspace-level navigation between My Work, BD, Estimating, and Project Hub; sidebar expand/collapse toggle; implicit role-awareness surface for construction operations professionals
- **Overall UI maturity assessment:** 4/10
- **Overall product-quality assessment:** 4/10
- **Mold-breaker potential assessment:** 6/10
- **Current classification:** Below Competitive (bordering Competitive)
- **Primary verdict:** The sidebar is structurally present but functionally deficient in ways that disqualify it from even "Competitive" status. The single most critical finding is that no active route state is communicated: every nav button is visually identical regardless of the current page — identical classes, transparent background, transparent border-left, identical font weight. A user cannot tell which section they are in by looking at the sidebar. Compound this with a complete absence of hover feedback (no background color change on hover, confirmed by stylesheet inspection), zero tooltips in collapsed mode, no `aria-current="page"` set on the active item (directly contradicting `HbcAppShell.md` spec), and an expanded state that overlays — rather than pushes — content without a backdrop, and the sidebar reads as a visual skeleton with placeholder wiring rather than a production-ready navigation component. These are not polish issues; they are primary navigation failures that must be resolved before any mold-breaker assessment is meaningful.

---

## Executive Diagnosis

**3 Biggest Strengths**
- **Correct ARIA role structure:** `role="navigation"` + `aria-label="Main navigation"` + `data-hbc-ui="sidebar"` are correctly applied; sidebar buttons use descriptive `aria-label` values for all items.
- **Width transition is correctly implemented:** The 0.25s cubic-bezier ease transition on `width` is smooth and uses the correct easing curve (`cubic-bezier(0.4, 0, 0.2, 1)` = Material/Fluent standard).
- **Icon color inheritance is correctly wired:** All nav button SVGs use `stroke="currentColor"`, which is the correct pattern — unlike the header's hardcoded `stroke="#FFFFFF"`. The icon token chain works here.

**5 Most Important Weaknesses**
1. **Zero active state visual feedback** — all four nav buttons have identical computed styles in both states; no background, no border-left color, no font-weight change, no fill — the current page is invisible in the nav.
2. **Zero hover feedback** — no `background-color` hover rule exists for the nav button class; the sidebar has no `::hover` fill, confirming a complete interaction feedback gap.
3. **No collapsed-mode tooltips** — all five buttons have `title=null`, `aria-describedby=null`, `data-tooltip=null` — collapsed icons are entirely unlabeled in every modality when the label text is hidden.
4. **Expanded sidebar overlays content with no backdrop** — `sidebarRight=240px`, `mainLeft=56px` confirms overlay behavior; no backdrop, no scrim, no push — clicking content behind an open sidebar closes nothing.
5. **Icon semantic mismatch: BD = briefcase** — the BD (Business Development) nav icon uses the same briefcase SVG path structure (`rect x:2 y:10` + `path d="M2 14h20"` + toolbox-top path) as the header "Open toolbox" button — a direct visual ambiguity between primary navigation and a header utility action.

**Single Biggest Reason Not Yet Mold Breaker:**
The sidebar communicates no information about where the user is. Active state is invisible, hover state is invisible, and the collapsed mode removes all label context without replacing it with any tooltip or affordance. This is a navigation component that does not navigate — it is a set of unlabeled icon buttons that happen to be positioned on the left. No amount of visual polish can compensate for the absence of the foundational active + hover state system.

---

## Top Priority Findings

### SIF-001
- **Severity:** Critical
- **Category:** State Design / Navigation / Accessibility
- **Element reference(s):**
  - Visible label/text: "My Work", "BD", "Estimating", "Project Hub" nav buttons
  - Component type: `<button aria-label="My Work">` [collapsed ref: first nav button] / [expanded: first nav button with label span]
  - Approximate location: Left rail, y=75–219, x=0–55 (collapsed) / x=0–239 (expanded)
  - Distinguishing visual traits: All four buttons are visually identical — `bg: rgba(0,0,0,0)`, `borderLeft: 2.66px solid rgba(0,0,0,0)`, `color: rgb(255,255,255)`, `fontWeight: 400` — confirmed by computed style comparison.
  - DOM/CSS/ARIA hint: `myWorkBtn.className === bdBtn.className` (confirmed identical class strings); `aria-current=null` on all buttons; `borderLeftColor: rgba(0,0,0,0)` — the 3px border is wired but color is transparent
- **Current observed state:** Zero visual distinction between the active route (My Work) and all inactive routes. The `border-left-width: 3px` rule (`fjw05fc`) is applied to all buttons identically; the border color is transparent — a structural active indicator exists but its color is never set.
- **Why this is a problem:** The sidebar's primary function is to communicate location. When every item looks the same, the sidebar fails its core purpose on every page load.
- **Why it matters in construction-tech:** A PM switching between BD pipeline and Project Hub multiple times per day loses 1–2 seconds of orientation time on every view switch. Under deadline pressure, that cognitive overhead is operationally harmful.
- **Why it prevents mold-breaker status:** A nav component with no active state is not a navigation component. Mold-breaker cannot be achieved without passing this baseline.
- **Recommended change:** Set `border-left-color: var(--hbc-color-brand, #F37021)` and `background-color: rgba(243, 112, 33, 0.08)` on the active nav button. Also set `font-weight: 600` on the label span of the active item. Wire active detection from the router: compare `window.location.pathname` to each nav item's `href` and apply an `aria-current="page"` attribute + an active CSS class (e.g., `data-active="true"`) that the stylesheet targets. Use the existing 3px border-left slot — it is already structurally present.
- **Acceptance criteria:** When on `/my-work`, the "My Work" button has a visible brand-orange left border (3px), a subtle orange tint background, `aria-current="page"`, and `font-weight: 600` on its label. All other buttons remain in default style. Navigating to `/bd` transfers active state to "BD" with no delay.
- **Notes for implementation:** The `borderLeft` slot already exists (3px width set via `fjw05fc`). Only the color needs to be toggled. The correct implementation is a `data-active="true"` attribute on the active button that triggers a CSS rule: `[data-active="true"] { border-left-color: var(--hbc-color-brand); background-color: rgba(243,112,33,0.08); }`. Do not add a new class per button — use the data attribute pattern.

---

### SIF-002
- **Severity:** Critical
- **Category:** Interaction / State Design / Accessibility
- **Element reference(s):**
  - Visible label/text: All four nav buttons (hover state)
  - Component type: `<button>` elements in `[data-hbc-ui="sidebar"]`
  - Approximate location: Entire nav rail, y=75–219
  - Distinguishing visual traits: No computed `background-color` change on `mouseenter` (tested: `beforeHoverBg === afterHoverBg === rgba(0,0,0,0)`); no `background-color` hover rule exists in stylesheet for the nav button class `___13untgz`.
  - DOM/CSS/ARIA hint: Stylesheet scan found zero `:hover` background rules for nav button class; `f1hlws8r:hover` (header button class) has `rgba(255,255,255,0.1)` — but this class does not apply to sidebar nav buttons.
- **Current observed state:** Hovering any sidebar nav button produces no visual feedback — no background highlight, no color shift, no elevation, no cursor feedback beyond the default pointer. The button is visually inert to pointer interaction.
- **Why this is a problem:** Hover feedback is the most basic interactive affordance for desktop nav components. Its complete absence makes the sidebar feel broken to experienced users and invisible to new ones.
- **Why it prevents mold-breaker status:** A construction-tech platform with zero hover feedback on its primary navigation is Below Competitive. This is not a polish gap; it is a shipped defect.
- **Recommended change:** Add `background-color: rgba(255, 255, 255, 0.06)` on `:hover` to the nav button base styles. Add `background-color: rgba(255, 255, 255, 0.10)` on `:active`. This applies universally to all nav buttons and provides the minimal interaction legibility required. In the token system: `background: var(--hbc-nav-item-hover-bg, rgba(255,255,255,0.06))`.
- **Acceptance criteria:** Hovering any nav button produces a perceptibly lighter background (≥ Δ4% luminance change). Active/pressed state is slightly darker than hover. Effect is present in both collapsed and expanded states.

---

### SIF-003
- **Severity:** Critical
- **Category:** Accessibility / Field Use / Mobile
- **Element reference(s):**
  - Visible label/text: (collapsed state — labels are hidden)
  - Component type: All four collapsed-mode nav buttons [aria-label="My Work", "BD", "Estimating", "Project Hub"]
  - Approximate location: Left rail, y=75–219, x=0–55, collapsed state
  - Distinguishing visual traits: 16px SVG icons only visible; label spans exist in DOM but contain empty text (`labelText: ""`); no `title`, no `aria-describedby`, no `data-tooltip` attribute on any button.
  - DOM/CSS/ARIA hint: `title=null`, `ariaDescribedby=null`, `dataTooltip=null` on all collapsed nav buttons (confirmed). Button is 55×36px with only a 16px icon.
- **Current observed state:** In collapsed mode, the only visible affordance is a 16px SVG icon. There are no tooltips, no title attributes, no `aria-describedby` to a tooltip, and no hover-activated tooltip component. Users who don't know what the BD briefcase icon means get no on-screen help.
- **Why this is a problem:** Collapsed sidebar icons without tooltips require all users to memorize icon semantics. The BD icon (briefcase) also appears on the header toolbox button — ambiguous even for experienced users.
- **Why it matters in construction-tech:** New hires, PMs from other systems, and field workers accessing from an unfamiliar device all depend on tooltips to orient. Removing labels without providing tooltip fallback is a discoverability failure.
- **Recommended change:** Add a CSS tooltip via `:hover::after` pseudo-element OR implement a React tooltip component (e.g., Fluent UI `Tooltip`, or a lightweight `[data-tooltip]` CSS tooltip pattern). Minimum: `title="My Work"` attribute on each button for native browser tooltip. Preferred: a positioned tooltip with 300ms delay, appearing to the right of the icon in collapsed mode, using `role="tooltip"` and `aria-describedby` wiring.
- **Acceptance criteria:** Hovering any collapsed-mode nav icon for ≥ 300ms shows a tooltip with the item's label text ("My Work", "BD", "Estimating", "Project Hub"). Tooltip disappears on mouse-leave. Tooltip is accessible to screen readers via `aria-describedby`.

---

### SIF-004
- **Severity:** Critical
- **Category:** Accessibility / Navigation (UI Kit Spec Violation)
- **Element reference(s):**
  - Visible label/text: "My Work" nav button (active page)
  - Component type: `<button aria-label="My Work">` — all nav buttons
  - Approximate location: Left rail, y=75, x=0–55/239
  - DOM/CSS/ARIA hint: `aria-current=null` on ALL nav buttons including "My Work" on the `/my-work` route. `HbcAppShell.md` explicitly states: "Active nav item has `aria-current='page'`."
- **Current observed state:** No `aria-current="page"` attribute is set on any navigation button, including "My Work" which is the current active route. This is a direct, documented spec violation.
- **Why this is a problem:** Screen reader users receive no indication of their current location within the navigation. WCAG 1.3.1 (Info and Relationships) is violated. The `HbcAppShell.md` governance document explicitly requires this attribute — making this a governance drift defect, not just an accessibility gap.
- **Recommended change:** In the sidebar component, compare each `navItem.href` to `window.location.pathname` (or use the router's `usePathname()` / `useMatch()` hook). Set `aria-current="page"` on the matching button. This should be the same logic that drives SIF-001's active class application — both should derive from a single `isActive` boolean.
- **Acceptance criteria:** `document.querySelector('[aria-label="My Work"]').getAttribute('aria-current')` returns `"page"` when on `/my-work`. Navigating to `/bd` moves `aria-current="page"` to the BD button. Screen reader announces "current page" when focused on the active item.

---

### SIF-005
- **Severity:** High
- **Category:** Layout / PWA / State Design
- **Element reference(s):**
  - Visible label/text: Expanded sidebar (240px) overlapping content
  - Component type: `<nav data-hbc-ui="sidebar" data-expanded="true">` + `[data-hbc-ui="workspace-page-shell"]`
  - Approximate location: Sidebar x=0–240, content starts at x=56 (does not reflow when expanded)
  - Distinguishing visual traits: `sidebarRight=240`, `wpsLeft=56` — 184px overlap. No backdrop/scrim visible. Content remains statically at 56px left margin.
  - DOM/CSS/ARIA hint: `sidebarZIndex: "100"`, content z-index=auto; no `backdrop` or `scrim` element in DOM; `mainTransition=null` — no transition on main content margin.
- **Current observed state:** When expanded, the 240px sidebar overlays the main content area which stays at `margin-left: 56px`. The sidebar covers 184px of content with no scrim, no backdrop, and no way to close by clicking outside.
- **Why this is a problem:** Overlay without backdrop creates a broken interaction model: the sidebar appears to float over content without any dismissal mechanism other than the collapse button. Clicking content behind the sidebar does nothing — the sidebar stays open. This is a trapped state.
- **Why it matters in construction-tech:** A PM reviewing a blocked items list then trying to navigate to BD will expand the sidebar and lose 184px of their work items view with no clear path to close except finding the collapse button.
- **Recommended change:** Two valid models: (A) **Push model** — transition `workspace-page-shell` `margin-left` from 56px to 240px when `data-expanded="true"`, with the same 0.25s cubic-bezier timing. (B) **Overlay model** — keep the overlay but add a full-screen `<div role="presentation" class="sidebar-backdrop">` behind the sidebar (`z-index: 99`) that closes sidebar on click, with `rgba(0,0,0,0.4)` fill. The push model is preferred for desktop; overlay+backdrop is correct for tablet (≤1024px). Implement `HbcAppShell.md`'s `useFieldMode()` breakpoint logic to switch between them.
- **Acceptance criteria:** At 1280px viewport, expanding sidebar pushes content right (push model) OR adds a visible backdrop (overlay model). Clicking outside the expanded sidebar in overlay model closes it. Content is not partially obscured without an intentional design choice visible in both models.

---

### SIF-006
- **Severity:** High
- **Category:** Visual Hierarchy / Design System
- **Element reference(s):**
  - Visible label/text: BD nav button icon (briefcase SVG)
  - Component type: `<button aria-label="BD">` SVG icon
  - Approximate location: Left rail, second nav item from top, y≈111–147
  - Distinguishing visual traits: SVG paths: `rect x:2 y:10 w:20 h:10`, `path d="M2 14h20"`, `path d="M7 10V7 a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"` — this is a briefcase/toolbox icon
  - DOM/CSS/ARIA hint: Header "Open toolbox" button also uses the briefcase SVG. Same icon in two different semantic contexts.
- **Current observed state:** The BD (Business Development) nav item uses the identical briefcase SVG icon as the header's "Open toolbox" button. In collapsed mode, both appear as the same briefcase silhouette at roughly the same visual size.
- **Why this is a problem:** A user who sees the briefcase in the header learns it means "toolbox utility." Then they see the same briefcase in the sidebar and interpret it as a toolbox trigger rather than Business Development navigation. This is a direct semantic collision.
- **Why it prevents mold-breaker status:** Icon clarity is a mold-breaker dimension. Duplicate icons with different meanings in the same shell chrome is a basic visual language failure.
- **Recommended change:** Replace the BD nav icon with a semantically appropriate icon for Business Development: a handshake, a chart-arrow, a star-flag, or a target icon. Ensure no icon appears twice in the persistent shell chrome with different meanings. Audit all four nav icons for uniqueness and semantic alignment with their section label.
- **Acceptance criteria:** No two distinct interactive elements in the sidebar and header share the same SVG icon path structure; BD icon visually suggests business/pipeline rather than toolbox; icon swap does not break any icon system imports.

---

### SIF-007
- **Severity:** High
- **Category:** Field Use / Mobile / Accessibility
- **Element reference(s):**
  - Visible label/text: All four collapsed nav buttons
  - Component type: `<button>` [My Work, BD, Estimating, Project Hub] in collapsed state
  - Approximate location: x=0–55, y=75–219
  - Distinguishing visual traits: Computed click area = 55×36px for all four nav buttons; only the expand button (55×45px) meets WCAG 2.5.5 minimum.
  - DOM/CSS/ARIA hint: `meetsWCAG: false` for all four nav items; `height: 36px` computed; WCAG 2.5.5 recommends ≥44×44px target size.
- **Current observed state:** All four primary nav buttons are 55×36px — 8px below the 44px WCAG minimum height. The expand button correctly uses 45px.
- **Why this is a problem:** The most important interactive elements in the sidebar — the four primary navigation items — are the only ones that fail touch target standards. This is an inversion of priority.
- **Why it matters in construction-tech:** Field workers using tablets, gloved users, and high-fatigue situations require compliant touch targets. Primary navigation failing this standard in a field-ready PWA is a disqualifying defect.
- **Recommended change:** Increase nav button `min-height` to 44px. The current `height: 36px` is from a compiled class (`fly5x3f`). Override with `min-height: 44px` in the sidebar nav item context. The icon will remain visually the same size; the transparent hit area grows by 8px on each button. Alternatively, add 4px `padding-top` + 4px `padding-bottom` to each nav button.
- **Acceptance criteria:** All four nav buttons report `getBoundingClientRect().height >= 44`; visual icon position does not shift more than 2px; change applies in both collapsed and expanded states.

---

### SIF-008
- **Severity:** High
- **Category:** Interaction / PWA / SPFx
- **Element reference(s):**
  - Visible label/text: "Expand sidebar" / "Collapse sidebar" button
  - Component type: `<button aria-label="Expand sidebar">` [bottom of sidebar, y≈942]
  - Approximate location: Very bottom of sidebar, pinned; y=942, height=45px, width=55px
  - Distinguishing visual traits: `border-top: 0.666px solid rgb(102,102,102)` — thin gray top separator; uses a shrink-arrows SVG (20×20px); `aria-expanded` attribute is NOT present on this button; no `aria-live` region announces state changes.
  - DOM/CSS/ARIA hint: `expandBtn.getAttribute('aria-expanded') === null`; `expandBtn.getAttribute('aria-live') === null`; sidebar itself has `data-expanded="false/true"` but the toggle button lacks `aria-expanded`.
- **Current observed state:** The expand/collapse button lacks `aria-expanded` — the button does not announce its own state to screen readers. Additionally, there is no `aria-live` region that announces "Sidebar expanded" / "Sidebar collapsed" on toggle.
- **Why this is a problem:** Screen reader users cannot determine the sidebar state from the toggle button itself. `HbcAppShell.md` specifies "Sidebar toggle button has clear aria-label" — aria-label is present ("Expand sidebar") but it is a static label that becomes semantically incorrect when the sidebar is already expanded (it should then say "Collapse sidebar", which it does — but `aria-expanded` is still missing).
- **Recommended change:** Add `aria-expanded={isExpanded ? 'true' : 'false'}` to the toggle button. Add `aria-controls="hbc-sidebar"` and `id="hbc-sidebar"` to the nav element. Optionally add an `aria-live="polite"` region that announces "Navigation expanded" / "Navigation collapsed" on state toggle for screen readers.
- **Acceptance criteria:** `expandBtn.getAttribute('aria-expanded')` equals `"true"` when sidebar is expanded and `"false"` when collapsed; screen reader announces state change on toggle.

---

### SIF-009
- **Severity:** High
- **Category:** Design System / Visual Hierarchy
- **Element reference(s):**
  - Visible label/text: "WORKSPACES" section label (expanded state only)
  - Component type: `<div>` text node inside sidebar container
  - Approximate location: Top of expanded sidebar, y≈58–75, visible only when expanded (x=0–239)
  - Distinguishing visual traits: `fontSize: 10px`, `fontWeight: 600`, `color: rgb(173,173,173)`, `textTransform: uppercase`, `letterSpacing: 0.5px`, `padding: 16px 16px 4px` — tight 4px gap between label and first nav item.
  - DOM/CSS/ARIA hint: Text content = "Workspaces"; element is hidden in collapsed state (sidebar width clips it); no `aria-label` on the nav group container; 0px gap between label bottom and first button top.
- **Current observed state:** The group label "WORKSPACES" appears at 10px uppercase with only 4px padding between it and the first nav item. In collapsed mode the label is completely invisible (not hidden — just clipped by the 56px sidebar width). No `aria-label` labels the group for screen readers when collapsed.
- **Why this is a problem:** (1) 0px gap between label and first item creates visual merging — the label reads as part of the first button, not as a group header. (2) 10px text is below minimum legibility threshold at 96dpi in low-light conditions. (3) Screen reader users in collapsed mode have no group context.
- **Recommended change:** Increase spacing between "WORKSPACES" label bottom and first nav item to 8px (`padding-bottom: 8px` on the label). Increase font-size to 11px — still compact but legible. Add `aria-label="Workspaces navigation group"` to the `<div>` container wrapping both the label and nav items, making it a semantic group even in collapsed state.
- **Acceptance criteria:** Visible gap ≥ 8px between "WORKSPACES" label and first nav button; font renders at ≥ 11px; group has `aria-label` for screen reader context.

---

### SIF-010
- **Severity:** High
- **Category:** Design System / Visual Hierarchy
- **Element reference(s):**
  - Visible label/text: Nav item labels in expanded state ("My Work", "BD", "Estimating", "Project Hub")
  - Component type: `<span>` text nodes within expanded nav buttons
  - Approximate location: x≈36–239 (label zone), y=75–219
  - Distinguishing visual traits: All four labels are `fontSize: 14px`, `fontWeight: 400`, `color: rgb(255,255,255)` — no weight difference between active ("My Work") and inactive items; all render at identical visual weight.
  - DOM/CSS/ARIA hint: `labelSpanFontWeight: "400"` for active item; font-weight hierarchy is flat.
- **Current observed state:** Label typography is flat — all items same weight, same color, same size. No typographic hierarchy distinguishes the active item, high-priority sections, or section groupings.
- **Why this is a problem:** In a 4-item nav, typographic hierarchy is the primary secondary signal after background/border for active state. Without it, the only visual difference between items would be their label text — which is invisible in collapsed mode entirely.
- **Recommended change:** Apply `font-weight: 500` (medium) to active nav item label span when `data-active="true"`. Apply `color: rgba(255,255,255,0.65)` to inactive items to create a foreground hierarchy (active = 100% opacity, inactive = 65%). This creates a consistent, accessible hierarchy that works with and without the left-border active indicator from SIF-001.
- **Acceptance criteria:** Active item label renders at `font-weight: 500` and `color: rgb(255,255,255)` (100% opacity); inactive items render at 65% opacity; hierarchy is perceptible in a screenshot without color context.

---

### SIF-011
- **Severity:** High
- **Category:** Design System
- **Element reference(s):**
  - Component type: Entire sidebar (`[data-hbc-ui="sidebar"]`)
  - DOM/CSS/ARIA hint: `window.getComputedStyle(document.documentElement).getPropertyValue('--hbc-color-brand')` returns `""` (empty); all Fluent UI token variables (`--colorNeutralBackground1Hover`, `--colorBrandBackground`, etc.) also return empty strings; sidebar styles are entirely compiled atomic class output.
- **Current observed state:** No CSS custom properties are defined or consumed in the sidebar. All styling is hardcoded through compiled atomic classes. This was confirmed identically for the header in the previous audit (UIF-001). The sidebar is in the same un-governable state.
- **Why this is a problem:** (UI Kit gap) Field Mode color palette switching (per `HbcAppShell.md`) requires CSS token cascades. Without tokens, Field Mode theme changes cannot propagate to sidebar. The sidebar will not respond to any `data-hbc-mode="field"` attribute changes.
- **Recommended change:** Define `--hbc-sidebar-bg`, `--hbc-nav-item-hover-bg`, `--hbc-nav-item-active-bg`, `--hbc-nav-item-active-border`, `--hbc-nav-item-color`, `--hbc-nav-item-active-color`. Map all current hardcoded values to these tokens in the sidebar component stylesheet. This enables both Field Mode switching and SPFx theme inheritance in a single token change.
- **Acceptance criteria:** Changing `--hbc-sidebar-bg` in devtools immediately repaints the sidebar background without class changes; `--hbc-nav-item-active-border` controls the active left border color.

---

### SIF-012
- **Severity:** Medium
- **Category:** Visual Hierarchy / Design System
- **Element reference(s):**
  - Visible label/text: Sidebar/content boundary (no separator)
  - Component type: Right edge of `[data-hbc-ui="sidebar"]` and left edge of `[data-hbc-ui="workspace-page-shell"]`
  - Approximate location: x=56, full vertical height
  - Distinguishing visual traits: `sidebarBg: rgb(17,24,39)` vs `bodyBg: rgb(15,23,42)` — ΔE ≈ 2–3 between sidebar and content area; no border, no shadow on sidebar right edge.
  - DOM/CSS/ARIA hint: Sidebar has no `border-right` computed; the content area starts immediately at x=56.
- **Current observed state:** The sidebar and content area share nearly identical dark backgrounds (sidebar: `#111827`, content body: `#0F172A`). The boundary between them relies on a ≈3 luminance-unit difference. In low-light field conditions or on OLED panels, this boundary may be imperceptible.
- **Why this is a problem:** Navigation rail / content boundary is a fundamental spatial orientation cue. When the boundary is invisible, the nav rail floats ambiguously against the content background.
- **Recommended change:** Add `border-right: 1px solid var(--hbc-sidebar-border-color, rgba(255,255,255,0.06))` to the sidebar right edge. This matches the header border-bottom correction (UIF-013) and creates a consistent edge vocabulary across the shell. A single token (`--hbc-shell-divider-color`) could govern both.
- **Acceptance criteria:** Sidebar right edge is visually distinguishable from content area at 40% display brightness on a calibrated monitor; no color fringing; 1px maximum thickness.

---

### SIF-013
- **Severity:** Medium
- **Category:** Accessibility / PWA
- **Element reference(s):**
  - Component type: Entire page
  - DOM/CSS/ARIA hint: `skipLink=null` — no skip link found anywhere in the DOM
- **Current observed state:** No skip-to-content link exists in the page. `HbcAppShell.md` explicitly lists "Skip link to main content available for keyboard users" as an accessibility requirement.
- **Why this is problem:** Keyboard-only users must tab through all 5 sidebar buttons + any header elements on every page load to reach content. This is a direct WCAG 2.4.1 (Bypass Blocks) violation and a documented spec violation.
- **Recommended change:** Add a visually hidden but focusable `<a href="#hbc-main-content">Skip to main content</a>` as the first child of `<body>`. Make it visible only on `:focus`: `position: fixed; top: 8px; left: 8px; z-index: 9999; background: var(--hbc-color-brand)`. Add `id="hbc-main-content"` to `<main>`.
- **Acceptance criteria:** Pressing Tab once on any page reveals a "Skip to main content" link; activating it moves focus to `<main>`; link is not visible when unfocused.

---

### SIF-014
- **Severity:** Medium
- **Category:** Construction Workflow / IA
- **Element reference(s):**
  - Visible label/text: "My Work", "BD", "Estimating", "Project Hub" — 4 items total
  - Component type: Sidebar nav item set
  - Approximate location: Left rail, full nav list
  - Distinguishing visual traits: No badges, no unread counts, no status indicators on any nav item
  - DOM/CSS/ARIA hint: `HbcAppShell.md` `SidebarNavItem` spec includes `badge: string — Optional badge (unread count)`; no badge is rendered on any nav item.
- **Current observed state:** The sidebar exposes no live state about what is happening in each workspace section. The My Work section has 8 unread items and 2 blocked items — none of this is surfaced on the My Work nav item. BD, Estimating, and Project Hub also carry no state context.
- **Why this is a problem:** The `SidebarNavItem` spec already defines a `badge` prop — this is a spec-documented feature that is unimplemented. The data to drive it already exists (the Insights panel on My Work already has counts). The sidebar is supposed to carry count badges but doesn't.
- **Why it matters in construction-tech:** A project executive navigating between BD, Estimating, and Project Hub should know at a glance which section has pending action — without having to navigate into each one. Sidebar badges are a fundamental construction-workflow navigation pattern.
- **Recommended change:** Implement badge rendering on sidebar nav items using the existing `badge` prop in `SidebarNavItem`. Wire "My Work" badge to the sum of blocked + action-required items. Render badge as a small orange circle (≤18px diameter, ≥9px font) positioned top-right of the nav icon in collapsed mode, and as a count chip inline with the label in expanded mode. Use `HbcStatusBadge` with `variant="error"` for blocked-dominant counts.
- **Acceptance criteria:** "My Work" nav item shows a badge count equal to blocked + action-required items; badge updates when underlying data changes; badge disappears when count reaches 0; badge is accessible via `aria-label` (e.g., "2 blocked items").

---

### SIF-015
- **Severity:** Medium
- **Category:** PWA / UI Kit Gap
- **Element reference(s):**
  - Component type: `HbcSidebar` (entire component)
  - DOM/CSS/ARIA hint: `HbcAppShell.md` defines `HbcBottomNav` for Field Mode ≤767px — but no `HbcSidebar` or `HbcBottomNav` component specification exists in the UI Kit docs directory.
- **Current observed state:** The UI Kit directory documents `HbcAppShell`, `HbcStatusBadge`, `HbcDataTable`, `HbcCommandPalette`, `HbcEmptyState`, `HbcErrorBoundary`, `HbcConnectivityBar` — but no dedicated `HbcSidebar.md` or `HbcBottomNav.md` specification exists.
- **Why this is a problem:** (UI Kit gap) Without a governed `HbcSidebar` spec, there is no authoritative document defining: active state styling, hover states, tooltip behavior, badge rendering, collapsed/expanded width, transition curves, overlay vs. push behavior, field-mode suppression, or SPFx constraints. SIF-001 through SIF-014 all root back to this governance gap.
- **Recommended change:** Create `docs/reference/ui-kit/HbcSidebar.md` documenting: width variants (collapsed: 56px, expanded: 240px), transition spec, active state token names, hover state spec, tooltip requirement, badge pattern, expand/collapse button ARIA, field-mode behavior (replaced by `HbcBottomNav`), and SPFx constraints (no change needed per `HbcAppShell.md`). Create companion `docs/reference/ui-kit/HbcBottomNav.md`.
- **Acceptance criteria:** `HbcSidebar.md` exists and is referenced in the UI Kit index; all active state, hover, badge, and tooltip requirements are documented and testable; the spec would have prevented SIF-001 through SIF-008 if applied at implementation time.

---

## Mold Breaker Assessment

### Adaptive Shell — 4/10
**Current evidence:** Width transition exists (0.25s, correct easing). Collapsed/expanded states are implemented. Field Mode switching is specced but not wired (no token system, no `data-hbc-mode` attribute).
**Gap:** No adaptive behavior changes (no field mode color shift, no touch target enlargement, no bottom nav substitute at mobile breakpoints). Overlay expansion without push or backdrop makes expanded state feel broken rather than adaptive.
**Required change:** Implement push model (desktop) and overlay+backdrop model (tablet). Wire Field Mode breakpoint to swap sidebar for `HbcBottomNav`. Add token system.

### Context-Aware State Design — 2/10
**Current evidence:** Sidebar communicates nothing about current state. No active route indicator, no hover feedback, no badge counts, no sync/offline state changes, no unread counts on nav items — though the underlying data exists.
**Gap:** Near-total absence of state communication in the sidebar.
**Required change:** SIF-001 (active state), SIF-002 (hover), SIF-014 (badges). These three changes alone would move this from 2 to 7.

### Superior Data Surface — N/A
Sidebar is a nav component, not a data surface. Not scored here.

### Field/Jobsite Usability — 3/10
**Current evidence:** 36px button heights fail WCAG touch targets. No tooltips in collapsed mode. No Field Mode adaptation. Overlay expansion would be hazardous on a tablet with no backdrop.
**Gap:** The sidebar as currently shipped would be hazardous on a construction jobsite tablet: primary nav items are too small, icons have no fallback labels, and the expansion model has no dismissal affordance.
**Required change:** SIF-007 (touch targets to 44px), SIF-003 (tooltips), SIF-005 (backdrop/push model).

### PWA-Native Quality — 4/10
**Current evidence:** Smooth width transition exists. `data-hbc-ui` data attributes are present (correct PWA-app-like attribution). No Field Mode, no offline state, no token system to support theme switching.
**Gap:** The sidebar cannot participate in PWA theme changes (dark/light mode, Field Mode, high contrast) because it has no CSS token layer.
**Required change:** Token system (SIF-011) + Field Mode wiring.

### SPFx/Embedded Quality — 5/10
**Current evidence:** The sidebar does not apply SPFx-specific constraints, which per `HbcAppShell.md` is correct — "No SPFx-specific constraints." However, without a token system, SharePoint theme inheritance cannot propagate to sidebar colors.
**Gap:** In SPFx with a light SharePoint theme, the sidebar's hardcoded `rgb(17,24,39)` background will clash with the SharePoint chrome. Token system would enable inheritance.
**Required change:** Token system enabling SPFx theme cascade.

### Iconography/Elevation/Micro-Interactions — 3/10
**Current evidence:** Icons use `stroke="currentColor"` (correct). Transition on width is smooth. But: BD icon duplicates header toolbox icon, all icons are 16px (small for primary navigation), no elevation change on hover, no micro-interaction on click/active, no icon active-state fill.
**Gap:** Category-leading construction nav uses 20–24px icons for primary navigation items, with icon fill changes on active state (not just border). Currently: 16px icons with no state change.
**Required change:** SIF-006 (icon semantic fix), SIF-002 (hover fill), SIF-001 (active fill). Scale icons to 18–20px for collapsed nav items. Add an icon fill change (from stroke-only to filled variant) on active state for the current nav item.

### Construction-Tech Advantage — 3/10
**Current evidence:** 4-item nav covers the major workspace modules (My Work, BD, Estimating, Project Hub). Module selection is correct for a construction-tech workflow. But the sidebar is entirely passive — it does not surface any intelligence about what is happening inside each module.
**Gap:** A category-leading construction nav rail surfaces live context: "BD: 3 pursuits due this week," "Project Hub: 2 issues flagged." The sidebar currently surfaces nothing.
**Required change:** SIF-014 (nav badges). Long-term: hover-expanded mini-summary panels per nav item ("My Work: 2 blocked, 4 action required") triggered on hover in collapsed mode — a non-obvious, high-value mold-breaker enhancement.

### Competitive Superiority — 3/10
**Current evidence:** The collapsed rail format matches Procore and Autodesk Construction Cloud. The expand/collapse toggle pattern is current-standard. The dark-on-dark sidebar aesthetic is competitive.
**Gap:** Procore's nav rail