# HB Intel UI Inspection – Mold Breaker Improvement Register

---

## Page Under Review

- **Page / feature name:** App Header (`<header data-hbc-ui="header">`) — rendered on `/my-work` (My Work page)
- **Primary user/task implied:** Global navigation, global search, global action creation, notification monitoring, identity/context switching — cross-role utility surface serving Executive, PM, BD, Estimating personas
- **Overall UI maturity assessment:** 5/10
- **Overall product-quality assessment:** 5/10
- **Mold-breaker potential assessment:** 6/10
- **Current classification:** Competitive (low end)
- **Primary verdict:** The header is structurally sound and ARIA-compliant, with correctly governed `role="banner"`, a fixed position shell, and a functional three-zone flex layout. However, the rendered state suffers from a critical zone imbalance: the middle zone consumes ~78% of header width (995 of 1284px) while the left logo zone occupies only 32px, resulting in a deeply disproportionate layout that visually anchors nothing. The "HB" wordmark is a raw bold-weight text abbreviation with no logomark treatment — insufficient as a brand identity anchor for a premium construction-tech PWA. The toolbox icon (`#A0A0A0` stroke) is orphaned in the middle zone with no visual grouping rationale, creating confusion about its relationship to the search field. The notification bell lacks a live count badge, making it a silent affordance when the system already knows there is meaningful alert activity. CSS design tokens (`--hbc-color-brand`, `--hbc-header-height`, etc.) are entirely absent from the computed styles, indicating a critical UI Kit governance gap — the header is styled ad hoc rather than from the governed token system. These structural and governance deficiencies are the primary obstacles between this header's current state and mold-breaker quality.

---

## Executive Diagnosis

**3 Biggest Strengths**
- **Correct semantic shell structure:** `role="banner"`, `aria-label` on every interactive element, `aria-haspopup="menu"` on the user button, and `aria-expanded` state on toolbox — ARIA fundamentals are implemented correctly.
- **Functional three-zone flex layout:** Left (logo), center (search/tools), right (actions) — the skeleton is architecturally sound and scales correctly at this viewport width.
- **Connectivity bar presence:** A `data-hbc-ui="connectivity-bar"` exists and renders as a 2px green bar at the very top of the page — this is a genuine construction-tech-appropriate PWA signal; most competitors completely omit live sync state from the shell.

**5 Most Important Weaknesses**
1. **Complete absence of CSS design tokens** — no `--hbc-*` custom properties are resolved on any header element; all values are inline/compiled styles, severing the header from the governed UI Kit system.
2. **Zone proportion collapse** — the center zone is 78% of total header width yet contains only a 36px toolbox icon and a 320px search bar, creating vast wasted lateral space on both sides of the search field.
3. **"HB" text-only wordmark** — no logomark, no product name, no visual identity beyond two white bold characters at 16px; inadequate as a premium PWA identity anchor.
4. **Notification bell has no live badge** — the system has 8 unread items and 2 blocked items actively surfaced in the page content below, but the bell icon in the header carries zero count badge — a critical alerting failure.
5. **Toolbox icon is semantically orphaned** — placed in the center zone (alongside search), rendered with a muted `#A0A0A0` stroke (vs. white on all other right-zone icons), and provides no visual grouping cue; its purpose is unclear without activating it.

**Single Biggest Reason the Page Is NOT Yet Mold Breaker:**
The header is operating as a generic enterprise chrome strip rather than a construction-intelligence command surface. It surfaces no live operational state (no active project context, no sync/alert count, no role indicator beyond a single letter "E"), and its identity zone is so minimal it cannot anchor either the brand or the user's current working context. A field PM cannot glance at this header and know what project they are operating in, what demands action, or what system state they are in.

---

## Top Priority Findings

### UIF-001
- **Severity:** Critical
- **Category:** Design System
- **Element reference(s):**
  - Visible label/text: (none — token absence is invisible)
  - Component type: `<header data-hbc-ui="header">`
  - Approximate location: Full-width, fixed, top of viewport (top: 2px)
  - Distinguishing visual traits: Dark `rgb(30,30,30)` background, no visible border, 56px tall
  - DOM/CSS/ARIA hint: `window.getComputedStyle(header)` returns no `--hbc-*` custom property values; all spacing/color values are compiled atomic class results, not token references
- **Current observed state:** Zero CSS design tokens (`--hbc-color-brand`, `--hbc-header-height`, `--hbc-color-surface`, `--hbc-color-primary`, `--hbc-radius-md`) are defined or consumed anywhere in the header's computed style chain.
- **Why this is a problem:** The header is styled entirely through compiled atomic CSS classes (Griffel/Fela naming pattern: `f22iagw`, `f122n59`, etc.). Token changes at the design system level do not propagate to this component. Any theme, dark/light toggle, contrast mode, or field-mode color shift is disconnected.
- **Why it matters in construction-tech:** Field Mode, High Contrast, and SPFx theme inheritance all require token-based cascades. Without tokens, the header cannot participate in `useFieldMode()` theming as defined in `HbcAppShell.md`.
- **Why it prevents mold-breaker status:** A mold-breaker product has a single design truth. This header has zero connection to the governed token system — it is an isolated, un-governable island.
- **Recommended change:** Declare `--hbc-header-bg`, `--hbc-header-height: 56px`, `--hbc-header-border-bottom`, and `--hbc-header-z` as root tokens. Map all currently hardcoded values (`rgb(30,30,30)`, `z-index: 200`, `top: 2px`) to these tokens in `HbcAppShell` / `AppHeader` component stylesheet. The `top: 2px` offset accounts for the connectivity bar height — formalize this as `--hbc-connectivity-bar-height: 2px` and compute `top: var(--hbc-connectivity-bar-height)` dynamically.
- **Expected user benefit:** Enables Field Mode, High Contrast, and SPFx theme inheritance automatically across the whole shell.
- **Acceptance criteria:** `document.documentElement.style.getPropertyValue('--hbc-header-height')` returns `"56px"`; changing `--hbc-header-bg` in devtools immediately repaints the header without class changes.
- **Notes for implementation:** `HbcAppShell.md` defines `useFieldMode()` as the switching mechanism — the token system must be wired first before Field Mode CSS can work correctly.

---

### UIF-002
- **Severity:** Critical
- **Category:** State Design / Construction Workflow
- **Element reference(s):**
  - Visible label/text: Bell icon (no badge text)
  - Component type: `<button aria-label="Notifications">` [ref_15]
  - Approximate location: Header right zone, second from right, x≈1165, y≈28
  - Distinguishing visual traits: Simple bell SVG, `stroke="#FFFFFF"`, 20×20px, no badge overlay, 36×36px hit target
  - DOM/CSS/ARIA hint: `notifBtn.innerHTML` contains only the SVG; no child span/div for badge count
- **Current observed state:** The notification bell renders with no count badge. The page below simultaneously surfaces 8 unread items and 2 blocked items in the My Work table. The system clearly knows these counts.
- **Why this is a problem:** The header is the persistent chrome; it is the user's one guaranteed fixed reference point. A bell with no count communicates "nothing to attend to" — directly contradicting the operational state the user is in. This is a live data inconsistency.
- **Why it matters in construction-tech:** In construction workflows, blocked items and overdue actions have real cost consequences. A PM who glances at the bell and sees silence may delay attending to two blocked items that are already visible below. The header should confirm urgency, not suppress it.
- **Why it prevents mold-breaker status:** Mold-breaker context-aware state design requires the shell to actively communicate system state at all times. A silent bell in an active-alert session is the opposite of that.
- **Recommended change:** Render a count badge on the notifications button whenever `unread > 0 OR blocked > 0`. Use a single merged count (total urgent items) with a red/orange fill for blocked-dominant states and a neutral fill for unread-only states. Badge should be a small pill (16px diameter, 10px font) positioned top-right of the bell icon, using `HbcStatusBadge` `variant="error"` for blocked-dominant. Implement as a live count driven by the same data source already powering the My Work insight cards.
- **Expected user benefit:** Immediate persistent-shell awareness of action-required state — visible from any page, not just My Work.
- **Acceptance criteria:** When `blocked > 0`, a red badge with correct count appears on the bell. When `unread > 0` only, a neutral/orange badge appears. Badge count matches the sum surfaced in the My Work Insights panel. Badge disappears when count reaches 0.
- **Notes for implementation:** Badge positioning should use `position: absolute` within a `position: relative` wrapper on the button, not a DOM sibling; ensures correct layering without layout shift.

---

### UIF-003
- **Severity:** Critical
- **Category:** Layout / Visual Hierarchy
- **Element reference(s):**
  - Visible label/text: (left zone width)
  - Component type: Left zone `<div>` (zone 0) [first child of `data-hbc-ui="header"`]
  - Approximate location: Header far left, x=16, width=32px
  - Distinguishing visual traits: Contains only `<a aria-label="Project Home">` with `<span>HB</span>`; 32px wide, 16px padding-left
  - DOM/CSS/ARIA hint: Zone proportions measured: zone 0 = 32px, zone 1 = 995px, zone 2 = 225px out of 1284px total
- **Current observed state:** The left identity zone is 32px wide — smaller than a single icon button. It contains only "HB" at 16px bold white. The middle zone is 995px wide (78% of total width) despite containing only a 36px icon + a 320px search bar.
- **Why this is a problem:** Zone proportions are architecturally broken. The center zone "flex: 1 1 auto" grows to fill all available space correctly — but because the left zone is only 32px, the sidebar (56px) occupies more horizontal real estate than the app's primary brand identity. The search bar (320px, 24.5% of viewport) ends up 85px left of true viewport center — visually off-balance.
- **Why it matters in construction-tech:** Construction tech PMs work across multiple projects. The left identity zone is the natural location for a project context indicator. At 32px, it cannot support even a truncated project name, let alone a project selector, without a redesign.
- **Why it prevents mold-breaker status:** Premium construction-tech shells (Procore, Autodesk Construction Cloud) use the left zone to carry both brand and project context. At 32px, this header cannot evolve to carry project-level context without breaking its current zone model.
- **Recommended change:** Expand left zone to a minimum of 180px (`flex: 0 0 180px`). Use this space for: wordmark/logomark (left-anchored), followed optionally by a project selector or breadcrumb chip. This naturally re-centers the middle zone, correcting the 85px search offset. Update zone 2 (right) to `flex: 0 0 auto` and allow it to breathe at its natural content width.
- **Expected user benefit:** Brand identity is legible; search bar approaches visual center of viewport; left zone gains room to accommodate future project context.
- **Acceptance criteria:** Left zone computed width ≥ 180px; search bar horizontal center falls within ±20px of viewport center; wordmark is visible and legible at 1024px viewport width.
- **Notes for implementation:** The sidebar (56px, fixed, `left: 0`) overlaps the header's far-left region. Account for the sidebar width when setting left zone padding: `padding-left: calc(56px + 12px)` or nest the left zone's content after the sidebar offset.

---

### UIF-004
- **Severity:** High
- **Category:** Visual Hierarchy / Design System
- **Element reference(s):**
  - Visible label/text: "HB"
  - Component type: `<span>` inside `<a aria-label="Project Home">` [ref_4]
  - Approximate location: Header far left, x≈16, y≈28
  - Distinguishing visual traits: White, bold (700), 16px, no logo mark, no product wordmark ("Intel" or "HB Intel")
  - DOM/CSS/ARIA hint: `logoSpan.textContent === "HB"`, `fontSize: 16px`, `fontWeight: 700`, `backgroundColor: rgba(0,0,0,0)`
- **Current observed state:** The entire brand identity is a two-character bold text abbreviation "HB" at 16px. No product name, no logomark/SVG icon, no visual container (pill, badge, rounded rect) to distinguish it from body text.
- **Why this is a problem:** "HB" at 16px bold white on `rgb(30,30,30)` is indistinguishable in visual weight from column headers or section labels within the page. It does not function as a brand anchor. In PWA standalone mode, there is no browser chrome to establish application identity — the header wordmark IS the product identity.
- **Why it prevents mold-breaker status:** Every category-leading construction platform has a distinctive wordmark or logomark in the header. "HB" as plain text reads as a placeholder.
- **Recommended change:** Replace the `<span>HB</span>` text node with a composed lockup: an SVG logomark (even a simple geometric "HB" letterform with brand orange `#F37021` accent) + the wordmark "HB Intel" or just "HB" in a proprietary style at 14–16px. Minimum: apply a brand-orange bottom-border or background accent to the "HB" pill to visually distinguish it from content text. Wrap in a styled container: `background: var(--hbc-color-brand-faint)`, `border-radius: 4px`, `padding: 4px 8px`.
- **Expected user benefit:** Immediate visual differentiation of brand identity; correct PWA standalone-mode identity.
- **Acceptance criteria:** Logo element is visually distinct from any text element in the page body; recognizable in a 100px×56px screenshot without context; uses brand color.
- **Notes for implementation:** SVG logomark should be an inline SVG for crisp rendering at any DPI. If an actual logo asset exists in `/public` or `/assets`, reference it; otherwise generate a geometric letterform SVG. The `aria-label="Project Home"` on the parent link is correct — retain it.

---

### UIF-005
- **Severity:** High
- **Category:** IA / Construction Workflow
- **Element reference(s):**
  - Visible label/text: Toolbox icon (briefcase SVG)
  - Component type: `<button aria-label="Open toolbox">` [ref_5], inside `<div class="___77lcry0_0000000 f10pi13n">` in the middle header zone
  - Approximate location: Middle zone, far left, x≈363, y≈28, 36×36px
  - Distinguishing visual traits: Briefcase/toolbox SVG, `stroke="#A0A0A0"` (muted gray vs. `#FFFFFF` on all right-zone icons), 36×36px, no label, no tooltip visible
  - DOM/CSS/ARIA hint: `aria-expanded="false"`, `aria-label="Open toolbox"` — it is a popover/drawer trigger
- **Current observed state:** The toolbox button sits in the center zone alongside the search bar. Its stroke is `#A0A0A0` — 60% lighter than the `#FFFFFF` icons in the right zone — visually de-emphasizing it. Its placement in the center zone (between the brand-left and action-right zones) creates ambiguity: is it a search modifier? A filter? A navigation shortcut?
- **Why this is a problem:** Zone placement dictates semantic expectation. A button in the center/search zone is interpreted as search-related. The toolbox is a separate utility (panel/drawer trigger) that belongs in a different zone. The muted gray stroke further reduces discoverability.
- **Why it matters in construction-tech:** Construction users rely on rapid tool access. Orphaned tools with unclear visual treatment are skipped or missed entirely, especially in field/glare conditions.
- **Recommended change:** Move the toolbox button to the right zone (before the M365 button), or to the left zone as a context-expander if it is a workspace/project switcher. Normalize stroke to `currentColor` (inheriting white from the dark shell) — matching all other icon buttons. Add a `title` or tooltip on hover to reinforce the label. If the toolbox is a command-palette-adjacent feature, consider merging it into the search affordance (a chevron or category dropdown inside the search pill).
- **Expected user benefit:** Toolbox is discoverable; icon color hierarchy becomes consistent; center zone reads as search-only.
- **Acceptance criteria:** Toolbox button is outside the center search zone; its SVG stroke matches or is within 10% luminance of other action icons in its zone; a tooltip appears on hover within 500ms.
- **Notes for implementation:** The wrapping `<div class="f10pi13n">` appears to be a positioning container — check if it enforces relative positioning for a badge or flyout. If so, move the whole wrapper div, not just the button.

---

### UIF-006
- **Severity:** High
- **Category:** Layout / PWA
- **Element reference(s):**
  - Visible label/text: (search bar)
  - Component type: `<button aria-label="Search (Command+K or Control+K)">` [ref_7]
  - Approximate location: Middle zone, x=407, width=320px, y≈15
  - Distinguishing visual traits: `rgba(255,255,255,0.1)` background, 320px wide, 35px tall, placeholder "Search...", `⌘K` kbd chip at right
  - DOM/CSS/ARIA hint: `searchWidthPercent: "24.5"`, `searchCenter: 567`, `viewportCenter: 652`, `offsetFromCenter: -85`
- **Current observed state:** The search bar is 320px wide (24.5% of viewport) and horizontally centered within the middle zone, but that zone starts at x=48 (right-edge of the 32px left zone). This places the search center at x=567, 85px left of true viewport center (x=652). On screens where the sidebar shifts the visual center further, this imbalance worsens.
- **Why this is a problem:** The search bar is the most-used global affordance. Its sub-optimal centering is a mild but persistent visual asymmetry. At narrower viewports (1024px), it will shift further left.
- **Recommended change:** Make the search bar grow to fill the middle zone more generously: `max-width: 560px`, `width: 100%` within the zone, removing the toolbox from the center zone (UIF-005). This centers a wider search bar more accurately and makes search feel like the premium primary command affordance it is. Increase height to 36px to match the toolbox and user button hit targets.
- **Acceptance criteria:** Search bar center falls within ±20px of viewport center at 1280px; search bar height = 36px; search bar `max-width` prevents it from becoming distractingly wide at 1920px+ viewports.
- **Notes for implementation:** Height mismatch (35px vs. 36px for other buttons) is a minor but measurable inconsistency to fix alongside this.

---

### UIF-007
- **Severity:** High
- **Category:** Mobile / Field Use / PWA
- **Element reference(s):**
  - Visible label/text: Bell, M365 grid, Create, User avatar
  - Component type: Right zone buttons [ref_10, ref_13, ref_15, ref_17]
  - Approximate location: Header right zone, x=1043–1268, y≈14–42
  - Distinguishing visual traits: Touch targets: Create=93×33px, M365=40×40px, Bell=36×36px, User=32×32px
  - DOM/CSS/ARIA hint: `createBtn.getBoundingClientRect()` = 93×33px; `userBtn.getBoundingClientRect()` = 32×32px
- **Current observed state:** Hit targets are inconsistent: Create=93×33px, M365=40×40px, Bell=36×36px, User=32×32px. The Create button is 33px tall (below 44px WCAG/Apple HIG minimum for touch). The User button is 32×32px — critically small for touch use. Heights in the right zone are 33, 40, 36, 32 — four different values among four adjacent buttons.
- **Why this is a problem:** WCAG 2.5.5 (AAA) recommends ≥44×44px for pointer targets. The `HbcAppShell.md` spec explicitly states Field Mode must make elements field-ready. A 32px avatar button and a 33px Create button will fail on a tablet in the field, especially with gloves.
- **Why it prevents mold-breaker status:** Field/jobsite usability is a stated mold-breaker dimension. Failing basic touch target minimums in the fixed shell — the most-used surface — is a disqualifying deficiency.
- **Recommended change:** Normalize all right-zone icon buttons to 40×40px minimum hit target (visual size can stay smaller; use padding). Set Create button height to `min-height: 36px`, padding to `8px 16px`. User avatar button should be 36×36px visual with 40×40px hit target via transparent padding. Enforce this in `HbcAppShell` component defaults.
- **Acceptance criteria:** All interactive header buttons have a computed click/touch target ≥ 40×40px. No two adjacent buttons have height values more than 4px apart.
- **Notes for implementation:** The Create button's current padding is `8px 16px` — adding `min-height: 36px` and `align-items: center` will bring it to spec without changing visual appearance.

---

### UIF-008
- **Severity:** High
- **Category:** IA / Construction Workflow
- **Element reference(s):**
  - Visible label/text: "Microsoft 365 apps" button (4-squares grid icon)
  - Component type: `<button aria-label="Microsoft 365 apps">` [ref_13]
  - Approximate location: Right zone, x≈1115, y≈8, 40×40px
  - Distinguishing visual traits: 4×4 rounded-rect SVG grid, `stroke="#FFFFFF"`, 24×24px SVG, 40×40px button, no label
  - DOM/CSS/ARIA hint: `aria-label="Microsoft 365 apps"`, SVG is 24px (larger than other icons which are 20px or 16px)
- **Current observed state:** An M365 app launcher icon is present in the header right zone. It uses a 24px SVG (the only 24px icon — others are 20px or 16px). It has no visible label and its function (launching an M365 app switcher panel) is not explained.
- **Why this is a problem:** (1) SVG is 24px vs. 16–20px for all other icons — a size inconsistency that creates visual imbalance. (2) In a PWA context, an M365 launcher creates a context-switching ambiguity: does this open a panel within HB Intel, or navigate away to another M365 app? This is a UX trust issue. (3) SPFx embedded contexts already have an M365 waffle — this button becomes redundant and visually competitive noise when the page is embedded.
- **Why it prevents mold-breaker status:** Unresolved redundancy between shell chrome and host-frame chrome (SharePoint waffle) is a sign of insufficient SPFx governance.
- **Recommended change:** (1) Normalize SVG to 20px to match other icon buttons. (2) Add a tooltip clarifying its scope (e.g., "Open M365 Apps panel"). (3) In SPFx embed mode, conditionally hide via `data-hbc-app` detection (already supported per `HbcAppShell.md`). (4) Evaluate whether M365 launcher belongs in a header or in a sidebar utilities section — the header is already crowded.
- **Acceptance criteria:** All icon-only buttons in the right zone use the same SVG size (20px); M365 button hidden in SPFx context; tooltip present on hover.
- **Notes for implementation:** SPFx detection is already documented: `data-hbc-app="hb-site-control"` triggers Field Mode — extend this detection to also suppress the M365 button.

---

### UIF-009
- **Severity:** High
- **Category:** Visual Hierarchy / Design System
- **Element reference(s):**
  - Visible label/text: "+ Create" button
  - Component type: `<button aria-label="Create new item">` [ref_10]
  - Approximate location: Right zone, far left, x≈1043, y≈11, 93×33px
  - Distinguishing visual traits: Orange fill `rgb(243,112,33)`, `border-radius: 4px`, "+" icon + "Create" label, 12px font, `padding: 8px 16px`
  - DOM/CSS/ARIA hint: `createBtn.getBoundingClientRect()` = 93×33px, `fontSize: 12px`
- **Current observed state:** The Create button is the only filled/primary CTA in the header. Orange fill `rgb(243,112,33)` is on-brand. However: font-size is 12px (same as the kbd shortcut chip), height is 33px (below 36px standard), and the "+" SVG is 16px — proportionally correct but the text feels small for a primary call-to-action at this screen density.
- **Why this is a problem:** At 12px, the "Create" label is below a comfortable reading size for a primary action that drives core workflow initiation. In field glare conditions, 12px orange-on-white is the minimum legible size — it has no margin for error.
- **Recommended change:** Increase font-size to 13px or 14px. Increase button height to `min-height: 36px`. Keep the orange fill — it is correct brand usage. Consider adding `font-weight: 600` if not already present to improve legibility at smaller sizes. Ensure `letter-spacing: 0.01em` for small-text button labels.
- **Acceptance criteria:** Create button label is rendered at ≥13px; button height ≥36px; passes WCAG AA contrast check (white on `#F37021` = 3.2:1 — passes AA for large text, at 13px bold this is borderline — verify with axe-core).
- **Notes for implementation:** Check if 12px is from a compiled Griffel class or an explicit style; if compiled, update the design token for `--hbc-font-size-button-sm`.

---

### UIF-010
- **Severity:** High
- **Category:** State Design / PWA
- **Element reference(s):**
  - Visible label/text: Green connectivity bar (2px, top: 0, full width)
  - Component type: `<div data-hbc-ui="connectivity-bar">` [two instances rendered]
  - Approximate location: Very top of viewport, y=0, full width (1284px), height=2px
  - Distinguishing visual traits: `rgb(0,200,150)` (teal-green), 2px height, fixed, `z-index: 10001`, no text, no icon
- **Current observed state:** Two `data-hbc-ui="connectivity-bar"` elements are rendered (probable duplicate mount — direct observation, this is notable). The bar is 2px tall, fully green (connected state). It has no text, no icon, and no tooltip. The header has `top: 2px` to account for it.
- **Why this is a problem:** (1) **Duplicate mount**: Two identical connectivity bar elements render on the same page — a likely component double-render or portal conflict. (2) **Silent success**: A 2px green bar communicates "connected" only to users who already know it exists. New users and field workers under glare will not register this indicator. (3) The `top: 2px` on the header is a hardcoded offset — not dynamically computed from `--hbc-connectivity-bar-height` token (see UIF-001). If the bar height changes, the header overlap breaks.
- **Recommended change:** (1) Fix the duplicate render — audit the mounting point for `HbcConnectivityBar` and ensure it renders exactly once (likely a portal + direct render conflict). (2) On state transitions (connected → disconnected → reconnecting), show a visible text state: expand bar height to 24–28px with a text label ("Reconnecting…" / "Offline") during non-connected states. Collapse back to 2px when stable-connected. (3) Formalize `--hbc-connectivity-bar-height` as a CSS token with JS binding so header `top` is computed dynamically.
- **Acceptance criteria:** Exactly one connectivity bar element in DOM; bar text appears during "disconnected" and "reconnecting" states; header `top` correctly adjusts when bar height changes.

---

### UIF-011
- **Severity:** Medium
- **Category:** IA / Construction Workflow
- **Element reference(s):**
  - Visible label/text: "E" (user menu button)
  - Component type: `<button aria-label="User menu for Executive">` [ref_17]
  - Approximate location: Header right zone, far right, x≈1213, y≈12, 32×32px
  - Distinguishing visual traits: Blue circle `rgb(26,99,153)`, white "E" initial, 32px diameter, `border-radius: 50%`, 12px font
  - DOM/CSS/ARIA hint: `aria-label="User menu for Executive"` — role is embedded in the aria-label, not surfaced visually
- **Current observed state:** The user menu shows only the initial "E" for Executive role. The role label is only machine-readable (aria-label). No visual role indicator, no tooltip showing "Executive – [Name]", and the avatar is a single initial with no hover treatment.
- **Why this is a problem:** HB Intel is a multi-role product (Executive, PM, BD, Estimating). The active role governs what data the user sees across the entire platform. Burying the role in an aria-label means role-awareness is invisible during normal use. In a shared/kiosk context (common on construction jobsites), there is no way to quickly confirm which persona is active.
- **Recommended change:** Add a `title` tooltip showing "Executive – [User Name]" on hover. Optionally, show the role label as a small text label next to the avatar on wider viewports (`> 1200px`): `"E Executive"` or a chip. The `aria-label` is correct — do not remove it; add visible reinforcement. Long term: support avatar images as documented in `HbcAppShell.md` (`user.avatar: string — Avatar URL or initials`).
- **Acceptance criteria:** Hovering the user button shows a tooltip with role and name within 300ms; tooltip text matches `aria-label` value; avatar component accepts and renders image URL when provided.

---

### UIF-012
- **Severity:** Medium
- **Category:** Visual Hierarchy / Design System
- **Element reference(s):**
  - Visible label/text: Icon buttons in right zone (M365, Bell, Toolbox)
  - Component type: Multiple `<button>` elements [ref_5, ref_13, ref_15]
  - Distinguishing visual traits: Toolbox stroke=`#A0A0A0`; Bell stroke=`#FFFFFF`; M365 stroke=`#FFFFFF`
- **Current observed state:** Toolbox icon uses `stroke="#A0A0A0"` (inline SVG attribute). Bell and M365 use `stroke="#FFFFFF"` (also inline). All are hardcoded inline SVG attributes, not CSS `color` or `currentColor`. This means CSS hover/active/focus states cannot change the icon color via `color` inheritance.
- **Why this is a problem:** Hardcoded SVG stroke attributes bypass the CSS cascade entirely. Hover, focus, active, and disabled states cannot be applied through standard CSS without JavaScript. The Toolbox's gray color is apparently intentional (de-emphasis?) but there is no visual system explanation for it — it reads as an error or lower-priority element.
- **Recommended change:** Replace all hardcoded `stroke="#FFFFFF"` and `stroke="#A0A0A0"` inline SVG attributes with `stroke="currentColor"`. Set `color` on the parent button via CSS: `color: var(--hbc-icon-default, #FFFFFF)` for active icons, `color: var(--hbc-icon-muted, #A0A0A0)` for de-emphasized. Apply `color: var(--hbc-icon-hover)` on `:hover` via CSS. This enables all interaction states and token-based theming.
- **Acceptance criteria:** All header icon SVGs use `stroke="currentColor"`; icon color changes on `:hover` via CSS alone; no inline `stroke` attributes remain on interactive icon buttons.

---

### UIF-013
- **Severity:** Medium
- **Category:** Design System / SPFx
- **Element reference(s):**
  - Visible label/text: (header bottom edge — no visible border)
  - Component type: `<header data-hbc-ui="header">` [ref_3]
  - DOM/CSS/ARIA hint: `headerBorderBottom: "0px none rgb(255, 255, 255)"` — no border; `headerBoxShadow: "none"`
- **Current observed state:** The header has no bottom border, no box-shadow, and no visual separator from the page content. Against the dark `rgb(30,30,30)` background over the darker `rgb(17,24,39)` sidebar and `rgb(13,19,33)` page body, the separation is implied by color difference alone (~ΔE 7 between header and page body). At lower brightness (field/tablet outdoor) this differential collapses.
- **Why this is problem:** No explicit separator means header/content boundary relies entirely on color contrast — fragile in ambient light shifts and OLED/LCD calibration variance. SPFx embedded views often inject their own chrome that can visually merge with a borderless header.
- **Recommended change:** Add a 1px bottom border: `border-bottom: 1px solid var(--hbc-header-border-color, rgba(255,255,255,0.08))`. Alternatively, use `box-shadow: 0 1px 0 rgba(255,255,255,0.06)` for a subtler effect that doesn't compete with content. This is a standard SPFx-safe separator pattern.
- **Acceptance criteria:** Header bottom edge is visually distinguishable from the breadcrumb row at 50% brightness on a calibrated display; no visible color fringing; separator respects the token system.

---

### UIF-014
- **Severity:** Medium
- **Category:** Accessibility / Keyboard
- **Element reference(s):**
  - Visible label/text: All header interactive elements
  - Component type: `<header>` [ref_3] and all child buttons
  - DOM/CSS/ARIA hint: Sidebar nav buttons have no `aria-current="page"` attribute set on any button; `navBtns[0..3].ariaCurrent === null`
- **Current observed state:** The sidebar navigation buttons (My Work, BD, Estimating, Project Hub) have no `aria-current="page"` state set on the active item. The user is on `/my-work`, but no nav button declares itself current.
- **Why this is a problem:** Screen reader users cannot determine which section is active. WCAG 1.3.1 (Info and Relationships) and `HbcAppShell.md` explicitly state "Active nav item has `aria-current='page'`." This is both an accessibility violation and a spec violation.
- **Recommended change:** Set `aria-current="page"` on the active sidebar nav button based on the current route. This is likely a props or routing hook issue in `HbcSidebar` — wire the active item detection to the router and conditionally apply `aria-current="page"`.
- **Acceptance criteria:** When on `/my-work`, the "My Work" sidebar button has `aria-current="page"`. When navigating to `/project-hub`, the "Project Hub" button gains `aria-current="page"` and "My Work" loses it.

---

### UIF-015
- **Severity:** Medium
- **Category:** Design System / UI Kit Gap
- **Element reference(s):**
  - Component type: `<header data-hbc-ui="header">` and `HbcAppShell.md`
  - DOM/CSS/ARIA hint: No `data-hbc-header-*` attribute exists; no documented header-specific component
- **Current observed state:** The UI Kit directory contains `HbcAppShell`, `HbcStatusBadge`, `HbcDataTable`, `HbcCommandPalette`, `HbcEmptyState`, `HbcErrorBoundary`, `HbcConnectivityBar` — but **no dedicated `HbcHeader` component** is documented. The header is defined inside `HbcAppShell` but not as a separately governable, separately importable component.
- **Why this is a problem:** Without a `HbcHeader` or `AppHeader` component boundary, the header cannot be independently tested, themed, or swapped. All header variants (office mode, field mode, SPFx mode, executive vs. field user) must be implemented ad hoc inside `HbcAppShell` rather than as composable header presets. This is the root cause of several issues above.
- **UI Kit gap:** Label this as **UI Kit gap — missing `HbcHeader` component specification**.
- **Recommended change:** Define `HbcHeader` as a governed component: `HbcHeader.md` covering props (logo, search, toolbox, notifications, actions, user), slot model, zone layout, token usage, Field Mode behavior, and SPFx visibility rules. This is the governing document that would enforce compliance for UIF-001 through UIF-014.
- **Acceptance criteria:** `docs/reference/ui-kit/HbcHeader.md` exists and documents all header zones, slots, tokens, modes, and constraints; existing header implementation is refactored to match.

---

## Mold Breaker Assessment

### Adaptive Shell — 5/10
**Current evidence:** Fixed 56px header, 56px sidebar, functional three-zone layout. Field Mode switching is defined in spec but token infrastructure to support it is absent. No visual mode adaptation is visible.
**Gap:** Header cannot currently adapt to Field Mode, High Contrast, or SPFx because CSS tokens are absent (UIF-001). No dynamic height or chrome-collapse behavior.
**Required change:** Implement token system first (UIF-001), then wire `useFieldMode()` to apply `data-hbc-mode="field"` to the shell; define field-mode header variant (e.g., no toolbox, larger touch targets, high-contrast icon fill).

### Context-Aware State Design — 4/10
**Current evidence:** Connectivity bar is present (correct). However: no notification count badge on bell, no active project context in header, no sync progress indicator, no user role visible to sighted users.
**Gap:** The header communicates almost no live operational state. A user navigating away from My Work loses all awareness of blocked/unread state.
**Required change:** UIF-002 (notification badge), UIF-011 (role/user context), and add a lightweight "last synced" or "sync in progress" micro-indicator near the connectivity bar or within the search zone on sync events.

### Superior Data Surface — N/A for header
The header itself is not a