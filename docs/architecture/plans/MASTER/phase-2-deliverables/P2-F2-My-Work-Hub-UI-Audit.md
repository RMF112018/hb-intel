142 stepsHB Intel UI Inspection – Mold Breaker Improvement Register

Page Under Review

Page / feature name: My Work — Personal view (/my-work?filter=escalation), with cross-surface audit of BD, Estimating, Project Hub, New Project Setup Request, My Project Requests
Primary user/task implied: Executive / PM reviewing their personal work queue, acting on blocked items, and monitoring construction portfolio health
Overall UI maturity assessment: 5/10
Overall product-quality assessment: 4/10
Mold-breaker potential assessment: 6/10
Current classification: Competitive (lower bound)
Primary verdict: HB Intel has a well-structured dark-mode app shell with a clear, construction-relevant work-queue concept. The My Work surface has intelligent segmentation (Waiting/Blocked, Action Required, Watching) and the analytics sidebar has genuine product vision. However, the product is currently held back by pervasive surface-level polish deficits, multiple unimplemented features that are advertised (Cmd+K search, notifications, row-click navigation), broken/stub routes that degrade trust, and a near-total absence of the governed UI Kit components (HbcStatusBadge, HbcConnectivityBar with ShellStatusSnapshot, HbcCommandPalette) in the actual rendered product. Across BD, Estimating, and Project Hub, the data surfaces are undifferentiated plain tables with no status badges, no row actions, no search/filter, and non-construction-friendly date formats. The product is not yet capable of mold-breaker status because it lacks context-aware state design, the command palette and item-detail drawer described in its own UI Kit remain unshipped, and the cross-surface design system compliance is inconsistent enough to undermine trust in the brand.


Executive Diagnosis
3 Biggest Strengths

Strong work-queue architecture on My Work. The three-lane grouping (Waiting/Blocked, Action Required, Watching) with priority CTAs (Resolve Block, Take Action, View) is an operationally intelligent pattern that construction-tech incumbents lack.
Analytics sidebar concept. The contextual "My Analytics" panel with stat tiles, escalation candidates, aging, and source breakdown as a right-rail companion to the feed is a genuinely superior layout idea for executive and PM users.
Dark-first app shell foundations. PWA manifest present, service worker registered, responsive viewport configured, skip-link implemented, Fluent token-based styling — the infrastructure skeleton is correct.

5 Most Important Weaknesses

Governed UI Kit components not rendered. HbcStatusBadge is in the UI Kit with role="status" and aria-label semantics — the actual "Blocked" badge in the table is a <span> with no role, no aria-label. HbcConnectivityBar's ShellStatusSnapshot path is unused; the amber alert banner fires role="alert" as aria-live="assertive" — a screaming state for a degraded-data warning. HbcCommandPalette is defined but Cmd+K produces nothing.
Cross-surface design system collapse. BD, Estimating, Project Hub are all plain unstyled tables with no status badges, no filters, no search, no row actions, no empty states, no breadcrumbs. They are unacceptably below the standard of the My Work surface and look like a different product.
Critical routes return bare "Not Found." /bd, /business-development/scorecard/*, and all deep-link URLs from work item rows in the My Work feed return only the text "Not Found" with no styled error state. Work item links are completely broken — a primary action in the product's core flow fails.
Active filter state has zero visual feedback. When the user clicks an Analytics stat card to filter, the URL changes but no card gains an active/selected visual state. The Compact toggle has aria-pressed="true" but visually shows no pressed state. The filter buttons in the toolbar have no aria-label (accessible name = "Overdue0" with no space).
"New" → Project Setup wizard is severely regressed. The multi-step form stepper renders as five tiny plain numbers (1–5) stacked vertically with no labels, no progress indicator, no step names. The primary CTA "Mark Complete & Next" uses a native <button> with no styled appearance. This is the primary creation flow for a construction project — it is broken in quality.

Single Biggest Reason the Page Is NOT Yet Mold Breaker
The item-detail drawer is unimplemented. Per the UI Kit (HbcDataTable spec: "Row click opens an inline detail panel…replacing Insights/Recent Activity"), clicking a work item row should open a contextual panel. Instead, rows are just <a> links that deep-link to routes that 404. The My Work surface cannot become a genuine command surface — the fastest path from "I see a risk" to "I act on it" — without a real item-detail interaction model. Everything else on the page is interesting but peripheral until this works.

Top Priority Findings
UIF-001

Severity: Critical
Category: Navigation / Construction Workflow
Element references:

Visible label/text: "Airport Terminal Expansion — No-Bid D…" (work item title)
Component type: <a> link, ref_83/ref_88/ref_104 etc.
Approximate location: All rows in all three lane groups
Distinguishing visual traits: Blue link text, left red accent border, truncated text
DOM hint: href="/business-development/scorecard/sc-002" — returns bare "Not Found"


Current observed state: Clicking any work item link navigates to a route that renders only "Not Found" plain text. The core "drill-down to item" action fails completely.
Why this is a problem: Every actionable work item in the queue is a dead link. The primary interaction of a work-queue surface — open the item — is broken.
Why it matters in construction-tech: A PM or exec who sees "Harbor View Medical Center — Health Pulse" flagged as Blocked needs one click to understand why. Dead links destroy trust in the system during high-urgency situations.
Why it prevents mold-breaker status: A mold-breaker work-queue requires instant item context. Zero-click-to-context is table stakes.
Recommended change: Implement item-detail drawer per HbcDataTable spec (onRowClick → inline panel), OR implement the linked routes. Either path must resolve to a real rendered surface. Start with the drawer as it keeps context without full navigation.
Expected user benefit: Users can act on items from within the queue without losing context.
Acceptance criteria: Clicking any work item link/row renders either (a) a detail panel within the current view or (b) a fully styled detail page. Zero "Not Found" renders for any link exposed in the UI.
Notes for implementation: HbcDataTable.onRowClick + right-panel role="region" per spec. The /bd, /business-development/scorecard/*, /estimating/* routes need proper page components.

---

**Resolution Status (2026-03-22):** ✅ RESOLVED — Reclassified from Critical to Medium per P2-F2-Audit-Validation-Report.md. The detail drawer was already implemented at the time of the audit. The audit script clicked an inner `<a>` anchor and triggered dead-route navigation, producing a false negative.

Fixes applied:
- Detail drawer (`HubDetailPanel.tsx`) fully implemented with `HbcStatusBadge`, metadata, `useMyWorkActions` action vocabulary, `slideInRight` animation, `elevationLevel3` surface
- Row selection highlighting via `activeRowId` prop on `HbcDataTable` (UIF-001a)
- Module-specific header label replaces generic "Item Detail" via `formatModuleLabel` (UIF-001b)
- Explicit `colorNeutralBackground1` surface background on drawer wrapper (UIF-001c)
- Context-sensitive CTA labels via `resolveCtaAction` — "Resolve Block", "Approve", "Take Action", etc. (UIF-001d, already addressed by UIF-014)
- Escape-to-close (`document.addEventListener('keydown')`) + focus capture/restore verified working (UIF-001e)
- Deep-link hrefs corrected in `domainQueryFns.ts` to match actual workspace routes — no more 404 on direct navigation (UIF-001 residual)

**Acceptance criteria met:** Clicking any work item row opens the detail panel. Deep-link hrefs resolve to valid workspace routes. Zero "Not Found" renders for any link exposed in the UI.


UIF-002

Severity: Critical
Category: Design System / State Design
Element references:

Visible label/text: "Blocked" status badges (amber), "Resolve Block" buttons (red)
Component type: <span> with no role — should be HbcStatusBadge
Approximate location: Status column, "Waiting / Blocked" lane, rows 1–2
DOM hint: <span class="" style="">Blocked</span> — no role, no aria-label, no variant token


Current observed state: "Blocked" is rendered as an unstyled <span> with amber background. The governed HbcStatusBadge component with role="status" and aria-label="warning status: Blocked" is not used. The STATUS column on "Action Required" rows shows just "—".
Why this is a problem: Screen readers cannot announce the badge as a status. Contrast is untested against the UI Kit's high-contrast field-mode requirement. Status values across Estimating ("Pending", "Under Review", "Awarded") are plain text — no badges at all.
Why it matters in construction-tech: Field personnel using assistive technology need status conveyed programmatically. Supervisors scanning status columns during site visits need instant pre-attentive color recognition — which requires the governed badge tokens, not ad-hoc spans.
Why it prevents mold-breaker status: Inconsistent status vocabulary and non-governed badge usage creates visual noise and trust degradation.
Recommended change: Replace all status text cells with HbcStatusBadge variant={"warning"|"error"|"info"|"neutral"|"success"} label={statusText}. Map: Blocked→warning, Overdue→error, Active→success, Planning→info, Pending→neutral, Under Review→info, Awarded→success.
Expected user benefit: Consistent, accessible, high-contrast status at a glance across all surfaces.
Acceptance criteria: Zero plain <span> status cells. All status cells use HbcStatusBadge. Badges render role="status" and aria-label per spec.
Notes: Estimating and Project Hub tables need this immediately — they have zero badge usage.


UIF-003

Severity: Critical
Category: State Design / PWA
Element references:

Visible label/text: "One or more data sources are unavailable." amber banner
Component type: role="alert" with aria-live="assertive" — should be HbcConnectivityBar
Approximate location: Top of content area, below tabs
DOM hint: aria-live="assertive" on a persistent degraded-data banner


Current observed state: Data source degradation fires role="alert" with aria-live="assertive" — the most aggressive announcement level. This causes screen readers to interrupt the user immediately on every page load with a warning about missing data. The HbcConnectivityBar ShellStatusSnapshot path (which uses aria-live="polite") is not used.
Why this is a problem: assertive live region is for emergency interrupts only (errors requiring immediate user intervention). A degraded data warning is a polite announcement. This creates accessibility fatigue.
Why it matters in construction-tech: Field personnel using screen readers would have their workflow constantly interrupted.
Why it prevents mold-breaker status: A shell-state design that screams at users is the opposite of low-fatigue chrome.
Recommended change: Replace amber alert banner with HbcConnectivityBar shellStatus={resolveShellStatusSnapshot({experienceState: 'degraded', ...})}. This uses the correct lifecycle-phase-aware messaging and aria-live="polite". Move the connectivity indicator to the top shell rail, not mid-page.
Expected user benefit: Shell state is communicated without interrupting flow or fatiguing assistive technology users.
Acceptance criteria: No aria-live="assertive" on a persistent degraded-data banner. Shell status appears as a non-intrusive top rail using HbcConnectivityBar.

---

**Resolution Status (2026-03-22):** ✅ RESOLVED — `HbcBanner` now supports an optional `polite` prop that overrides `aria-live` to `"polite"` and `role` to `"status"` for persistent non-urgent banners. Applied to `HubConnectivityBanner`, `HubFreshnessIndicator`, and `HbcMyWorkOfflineBanner`. Default behavior for `variant="warning"` unchanged — consumers opt in to polite semantics when their banner is persistent/non-urgent. The `HbcConnectivityBar` recommendation was not adopted because the hub-level banners provide richer context (degraded source names, retry buttons) than the shell-level connectivity indicator.

**Acceptance criteria met:** Persistent degraded-data banners use `aria-live="polite"`. No assertive interrupts for non-urgent status.


UIF-004

Severity: Critical
Category: Mold Breaker / Interaction
Element references:

Visible label/text: Search bar ("Search…" ⌘K hint visible in header)
Component type: <button> (ref_7), should invoke HbcCommandPalette
Approximate location: Center of header
DOM hint: button "Search (Command+K or Control+K)" — Cmd+K does nothing


Current observed state: The search button in the header and the Cmd+K keyboard shortcut both produce no response. HbcCommandPalette is defined in the UI Kit but not implemented.
Why this is a problem: The command palette is the single highest-leverage speed multiplier in the product. Without it, navigation requires multiple clicks through the sidebar menu.
Why it matters in construction-tech: PMs and execs need to jump between projects, run commands, and find items instantly under pressure. A non-functional search bar that advertises Cmd+K is worse than having no search.
Why it prevents mold-breaker status: Category-leading interfaces are command-driven. Showing the affordance without the capability is a broken promise.
Recommended change: Implement HbcCommandPalette with: (a) global navigation commands, (b) work item search across lanes, (c) recent/suggested items. Wire Cmd+K + click on header search button to open it.
Acceptance criteria: Cmd+K opens the palette. Typing returns filtered work items and navigation commands. Escape closes. Arrow keys navigate results.


UIF-005

Severity: High
Category: Construction Workflow / Navigation
Element references:

Visible label/text: "BD" sidebar nav button (ref_24/ref_25)
Component type: <button> in role="navigation"
Approximate location: Left sidebar, second icon
DOM hint: Navigates to /bd — returns "Not Found"


Current observed state: The "BD" sidebar nav icon navigates to /bd which renders bare "Not Found". The correct route is /business-development. Similarly the sidebar provides no tooltip labels for any icon in collapsed state.
Why this is a problem: Primary workspace navigation from the sidebar is broken for the BD workspace. Users cannot navigate to BD from the global nav.
Why it matters in construction-tech: BD pipeline is a primary executive workflow — broken entry point destroys task flow.
Recommended change: Fix the nav item href to /business-development (or add a redirect). Add title or tooltip to all collapsed-state sidebar icons per HbcAppShell SidebarNavItem.label.
Acceptance criteria: BD nav icon navigates to the BD workspace. All collapsed sidebar icons show labels on hover.


UIF-006

Severity: High
Category: State Design / Visual Hierarchy
Element references:

Visible label/text: "Action Now" / "Blocked" / "Waiting" analytics stat tiles
Component type: Filter buttons in "My Analytics" panel, ref_144/ref_147/ref_150
Approximate location: Right panel, top section
DOM hint: No visual distinction between active/inactive filter state despite URL changing


Current observed state: Clicking "Action Now" card changes the URL to ?filter=action-now and filters the left panel, but the card itself shows no visual active/pressed state. The user has no confirmation that their filter click was registered.
Why this is a problem: Active filter has zero visual feedback. Users will click multiple times thinking nothing happened.
Why it matters in construction-tech: Decision-makers scanning the analytics panel need instant confirmation that their "show me all blocked items" click worked.
Recommended change: Add aria-pressed="true" + a distinct visual state (border, glow, or background shift using Fluent token colorBrandBackground) to the active analytics card. Show a "Filtered by: Action Now" chip in the toolbar area when a filter is active.
Acceptance criteria: Active filter card is visually differentiated. A dismissable filter chip appears in the work queue toolbar showing the active filter. Clicking the chip or pressing × clears the filter.


UIF-007

Severity: High
Category: Design System / Form / Interaction
Element references:

Visible label/text: Step indicators "1 2 3 4 5" on New Project Setup Request
Component type: Stacked plain numbers with no styling
Approximate location: Left side of the New Project Setup Request form, below the draft resume banner
DOM hint: Rendered as 5 stacked plain text characters


Current observed state: The 5-step wizard renders its progress as five stacked plain digits (1–5) with no connected progress indicator, no step names, no completed/active/upcoming state. The CTA "Mark Complete & Next!" is a native-styled button with no visual hierarchy.
Why this is a problem: Users cannot understand where they are in a 5-step flow or what steps remain. The primary CTA is visually indistinguishable from a generic form submit.
Why it matters in construction-tech: Project setup is a high-stakes, multi-field workflow. Users need to know their progress and feel confident in each step.
Recommended change: Replace with a proper horizontal (or vertical) step indicator component with step names, numbered circles, connecting lines, and completed/active/pending states. Replace "Mark Complete & Next!" with a styled primary action button using the governed button hierarchy.
Acceptance criteria: Progress indicator shows current step name (e.g., "Step 1 of 5: Project Information"), highlights the active step, checks off completed steps. Primary CTA is branded-color filled button.


UIF-008

Severity: High
Category: Visual Hierarchy / State Design
Element references:

Visible label/text: "Compact" toggle button (ref_69)
Component type: Toggle button — aria-pressed="true" set but no visual change observed
Approximate location: Toolbar, right of filter chips
DOM hint: aria-pressed="true" but computed styles show identical appearance to non-pressed state


Current observed state: "Compact" has aria-pressed="true" indicating it is active, but (a) there is no visual difference between pressed and non-pressed states, and (b) the table density does not visibly change from the default. Per the UI Kit, compact tier should be 36px row height vs. 48px standard.
Why this is a problem: Toggle affordance with no visual feedback trains users to distrust UI controls.
Recommended change: Implement visually distinct active state for the Compact toggle (filled background or border change). Ensure density tier actually changes row heights to the compact specification (36px, 4px/8px padding). Add a matching "Standard" density state.
Acceptance criteria: Pressing Compact shows an active visual state. Table rows measurably reduce height. Pressing again restores standard density.


UIF-009

Severity: High
Category: Construction Workflow / Table
Element references:

Visible label/text: Work item title column — "Airport Terminal Expansion — No-Bid D…"
Component type: <a> links in WORK ITEM column
DOM hint: textOverflow: 'clip' — not ellipsis. Text is hard-clipped.


Current observed state: Long work item titles are clipped (overflow: hidden; text-overflow: clip) without an ellipsis, with no tooltip showing the full title. The visible title "Airport Terminal Expansion — No-Bid D…" ends abruptly.
Why this is a problem: Clipped text with no ellipsis or tooltip gives users no affordance to discover the full title. "No-Bid D" is meaningless without context.
Why it matters in construction-tech: Project names and item descriptors are the primary identity signal in a construction work queue. Losing the end of the title can destroy meaning.
Recommended change: Change text-overflow: clip to text-overflow: ellipsis on work item title cells. Add a title attribute or Fluent Tooltip showing full text on hover.
Acceptance criteria: Truncated titles show … at truncation point. Hovering shows full text in a tooltip.


UIF-010

Severity: High
Category: Design System / SPFx / State Design
Element references:

Visible label/text: "My Project Requests" error state (/projects route)
Component type: Inline pink error banner + bare "Try Again" text button
Approximate location: /projects page
DOM hint: Pink <div> banner, <button> with no visual styling


Current observed state: The Requests/Projects page shows a pink error banner ("Unable to load your requests. Check your connection and try again.") with a plain unstyled "Try Again" button that appears as a thin bordered ghost. This is not using HbcErrorBoundary or HbcEmptyState.
Why this is a problem: Error state is inconsistently styled from the alert banner on My Work. The "Try Again" button has no visual prominence. No icon, no contextual help.
Recommended change: Use HbcErrorBoundary wrapping the data surface. Render HbcEmptyState with icon={<ErrorIcon/>}, title="Unable to load requests", description="Check your connection and try again.", primaryAction={{label: "Retry", onClick: retry}}.
Acceptance criteria: Error state uses HbcEmptyState with branded retry CTA. Visually consistent with My Work degraded state.


UIF-011

Severity: High
Category: Data / Construction Workflow
Element references:

Visible label/text: "2025-04-15", "2025-01-15", "2026-12-15" in Estimating and Project Hub tables
Component type: Text cells in date columns
Approximate location: DUE DATE / END DATE columns across Estimating and Project Hub


Current observed state: All dates are ISO 8601 format (YYYY-MM-DD) which is technically unambiguous but cognitively foreign to construction professionals who read dates as "Apr 15, 2025" or "4/15/25".
Why this is a problem: Construction workflows operate on human date vocabulary. ISO dates require mental decoding under time pressure, fatigue, or on mobile.
Recommended change: Format all construction-facing dates as MMM D, YYYY (e.g., "Apr 15, 2025") or locale-aware short format. Use relative dates ("Due in 3 days", "Overdue by 2 days") for upcoming/past due items in the My Work feed.
Acceptance criteria: No YYYY-MM-DD format visible in any construction data table. Due dates ≤ 7 days show relative text. Due dates show absolute month/day/year otherwise.


UIF-012

Severity: High
Category: Design System / IA
Element references:

Visible label/text: "Bd Department Sections" source chip in SOURCE column
Component type: <span> source chip
Approximate location: ACTION REQUIRED row 2, SOURCE column
DOM hint: span.textContent === 'Bd Department Sections' — "Bd" should be "BD"


Current observed state: Source module is rendered as "Bd Department Sections" — incorrect capitalization of the acronym "BD". Per the HbcDataTable UI Kit spec, formatGroupLabel() is explicitly acronym-aware ("known domain acronyms (BD, RFI, PM...) stay uppercase").
Why this is a problem: The formatGroupLabel acronym-aware logic is not applied to the source cell renderer. "Bd" looks like a typo and undermines professional credibility.
Recommended change: Apply formatGroupLabel() to the source cell renderer. Ensure "BD Department Sections" is the rendered string. Audit all module name strings for acronym casing.
Acceptance criteria: "BD Department Sections" not "Bd Department Sections". All known acronyms in module/source names render uppercase.


UIF-013

Severity: High
Category: Construction Workflow / Table
Element references:

Visible label/text: Estimating table (Active Bids), Project Hub table
Component type: <table> — flat, no row actions, no search/filter, no sort affordance
Approximate location: Full content area of /estimating, /project-hub


Current observed state: Both Estimating and Project Hub render bare tables with no row-click navigation, no actions column, no search input, no filter chips, no column sort, no view toggle. 4 rows of data with nothing to do with them.
Why this is a problem: These surfaces have the same content volume as a stub but the same visual weight as a fully productized page. Construction data tables need at minimum: row click to detail, sort, and filter.
Why it matters in construction-tech: An estimating lead arriving at the Estimating page must be able to act on bids — review, update, communicate. A table with no actions is a read-only report, not a work surface.
Recommended change: Add onRowClick to all data tables per HbcDataTable spec. Add sort columns. Add a search input and status filter chip. Add an actions column with contextual CTAs per item state (e.g., "Review" for Pending bids, "View Award" for Awarded).
Acceptance criteria: Rows are clickable and navigate to a detail view. At least 2 columns are sortable. A search input exists. Status filters are present.


UIF-014

Severity: Medium
Category: Navigation / IA
Element references:

Visible label/text: Breadcrumb "Home / My Work"
Component type: navigation[aria-label="Breadcrumb"], ref_33
Approximate location: Sub-header area, left side


Current observed state: Breadcrumb shows "Home / My Work" correctly, but "Home" is a <button> with no href — it doesn't navigate. On BD/Estimating/Project Hub pages, there is no breadcrumb at all. On the New Project Setup form, the breadcrumb is absent.
Why this is a problem: Inconsistent breadcrumb presence means users can't reliably understand their location in the navigation hierarchy.
Recommended change: Make "Home" breadcrumb a real link (or navigate on click). Add breadcrumbs to BD, Estimating, Project Hub. Add multi-segment breadcrumb to the New Project Setup wizard.
Acceptance criteria: All interior pages show a breadcrumb. Home/root link is navigable. Breadcrumb accurately reflects hierarchy.


UIF-015

Severity: Medium
Category: Accessibility / Design System
Element references:

Visible label/text: "Overdue 0", "Blocked 2", "Unread 8" filter buttons (ref_60/ref_63/ref_66)
Component type: <button> in filter group
DOM hint: aria-pressed="false", no aria-label — accessible name is "Overdue0" (count appended without space or separator)


Current observed state: Filter buttons have no aria-label. Their accessible name is computed as "Overdue0" — the count runs directly into the label with no separator. Screen readers announce "Overdue zero" but there's no semantic separation of label and count.
Recommended change: Add aria-label={Show ${label} items: ${count}} to each filter button. Example: aria-label="Overdue: 0 items". Alternatively structure the badge count as <span aria-label="${count} items">${count}</span>.
Acceptance criteria: Each filter button has a properly formed aria-label that separates the filter name from the count. Screen reader announces "Blocked: 2 items" not "Blocked2".


UIF-016

Severity: Medium
Category: PWA / Field Use
Element references:

Visible label/text: Notifications bell button (ref_17)
Component type: <button> — produces no panel, no overlay, no interaction
Approximate location: Header, right of M365 apps button


Current observed state: The Notifications bell is a non-functional stub. There is no notification panel, no count badge, no empty state. Clicking produces no visible response.
Why it matters: Notifications are a critical PWA engagement vector — push-to-field updates on project status changes, upcoming due dates, and escalation triggers. A stub bell signals incomplete product.
Recommended change: At minimum, implement a notification panel dropdown with a governed empty state ("No notifications" using HbcEmptyState). The icon should show a count badge when unread notifications exist.
Acceptance criteria: Clicking the bell opens a panel (popover or flyout). If no notifications, HbcEmptyState is shown. The bell icon shows a count badge when notifications are present.


UIF-017

Severity: Medium
Category: Mold Breaker / Construction Workflow
Element references:

Visible label/text: "My Analytics" right panel — "Source Breakdown" bar chart
Component type: <img> — static SVG/image, not an interactive chart
Approximate location: Right panel, "Source Breakdown" section
DOM hint: img[alt="Source distribution: Project Hub 3..."]


Current observed state: The source breakdown chart is rendered as a static <img> with alt text describing the values. It is not interactive. Clicking segments does not filter. There is no hover tooltip.
Why this is a problem: A static image serving as a chart is a regression from the interactive filter model the analytics panel is building. It also means the chart cannot update dynamically.
Recommended change: Replace the static <img> chart with an inline SVG or lightweight charting component (e.g., Recharts/Nivo stacked bar) that: (a) shows tooltips on hover, (b) allows clicking segments to filter work items by source.
Acceptance criteria: Hovering a chart segment shows a tooltip with source name and count. Clicking a segment filters the work queue to that source. The chart updates when data changes.


UIF-018

Severity: Medium
Category: Design System / Grouping
Element references:

Visible label/text: "Group by lane / priority / project / module" dropdown (ref_70)
Component type: Dropdown menu from "More actions" ⋮ button
DOM hint: No role="radiogroup" — items are plain <div> not role="radio"


Current observed state: The grouping dropdown renders 4 plain options with no active-state indicators and no role="radiogroup". Per the HbcDataTable spec: "HbcCommandBar renders groupings as role='radiogroup' with ToggleButton checked={active}."
Why this is a problem: No way to know which grouping is currently active. No keyboard navigation within the menu as a group.
Recommended change: Implement grouping menu with role="radiogroup", role="radio" items, visual checked state (brand-colored background on active item), and keyboard arrow-key navigation.
Acceptance criteria: Active grouping is visually marked. Menu uses proper radio group semantics. Only one grouping is active at a time.


UIF-019

Severity: Medium
Category: Visual Hierarchy / Shell
Element references:

Visible label/text: "TanStack Query devtools" button — visible in bottom-right corner of production UI
Component type: <button> with beach emoji, ref_178
Approximate location: Bottom-right corner, persistent across all pages
DOM hint: button "Open Tanstack query devtools"


Current observed state: TanStack Query devtools trigger button is permanently visible in the rendered UI. This is a development tool leaking into the apparent production/demo surface.
Why this is a problem: Visible developer tooling destroys the premium PWA feel and signals an incomplete product to any stakeholder reviewing the demo.
Recommended change: Conditionally render TanStack devtools trigger only in NODE_ENV === 'development'. Gate with an environment check.
Acceptance criteria: Devtools button is invisible in any environment that could be shown to stakeholders. Visible only in local dev.


UIF-020

Severity: Medium
Category: Mold Breaker / Field Use
Element references:

Visible label/text: "My Work" entire page — no bottom navigation at mobile
Component type: Shell layout — HbcAppShell with no HbcBottomNav
DOM hint: bottomNav: null — no bottom nav element present at desktop, not implemented for field mode


Current observed state: The HbcAppShell spec defines an auto-switching field mode with HbcBottomNav at ≤767px viewports. No bottom navigation is implemented. At mobile widths, the icon-only sidebar would be the only nav, which is difficult to reach with a thumb.
Why this is a problem: Construction field users on phones need bottom-of-screen navigation, not a top-left sidebar. This is a known pattern the UI Kit specifies but the code has not implemented.
Recommended change: Implement HbcBottomNav per the useFieldMode hook spec. At ≤767px, replace sidebar with bottom nav showing My Work, BD, Estimating, Project Hub icons with labels.
Acceptance criteria: At ≤767px viewport, sidebar is hidden and a bottom navigation bar appears. Touch targets are ≥44px. All primary workspaces are reachable.


Mold Breaker Assessment
Adaptive Shell
Score: 5/10
The shell structure (fixed dark header + icon sidebar + main content + right panel) is architecturally correct. The orange accent on the HB Intel wordmark and the search bar placement are premium choices. However: no top connectivity rail, no field/office mode switching implemented, the sidebar has no labels in collapsed state (hover tooltips missing), the devtools button pollutes the shell, and the header has no top-accent border (spec calls for it in HbcConnectivityBar). Gap: Implement HbcConnectivityBar in the header top rail, add sidebar icon tooltips, implement field mode switching.
Context-Aware State Design
Score: 3/10
The product has the vocabulary for state (Blocked, Overdue, Escalation Candidates, Aging) but fails to communicate state changes visually. Active filter produces no visual feedback. Compact toggle has no pressed state. The amber banner uses the wrong urgency level. No loading shimmer is observed. No stale/offline/syncing state is differentiated from the single degraded banner. Gap: Implement full state matrix (loading shimmer via isLoading prop, empty states via HbcEmptyState, stale/sync differentiation in HbcConnectivityBar, active filter visual feedback).
Superior Data Surface
Score: 4/10
My Work's three-lane grouping is a genuine design system advantage. But: the lane groups each repeat an identical column header (three instances of WORK ITEM / STATUS / SOURCE / DUE), wasting vertical space. BD, Estimating, and Project Hub are structurally identical flat tables with no differentiation. The row height is standard 48px which is reasonable. No detail drawer. Gap: Implement item-detail drawer, collapse repeated column headers across lanes, differentiate BD/Estimating/Project Hub tables with surface-appropriate columns and actions.
Field/Jobsite Usability
Score: 3/10
ISO date formats, text-overflow: clip on titles, no bottom nav, no field mode theme, the analytics right panel is too dense for glare/fatigue conditions, and touch targets for the filter chips (overdue/blocked/unread) are approximately 32px tall — below the 44px minimum for coarse-pointer devices. Gap: Fix dates, fix truncation, implement field mode, increase filter chip touch targets.
PWA-Native Quality
Score: 5/10
Strong foundations: service worker registered, manifest present, theme-color: #1E1E1E, responsive viewport, skip link. But: no offline state handling visible, notifications stub, Cmd+K non-functional, devtools button visible. The app doesn't feel app-like because core interactions are dead. Gap: Implement offline state, notifications, and the command palette — these are the interactions that make a PWA feel like an app.
SPFx/Embedded Quality
Score: 6/10
Fluent token-based Gripper styling with dark-mode tokens is SPFx-compatible. No iframe-hostile fixed positioning observed. The right-panel analytics sidebar would become cramped in a narrow SPFx web part. The TanStack devtools button would be visible. Gap: Test at 800px width (typical SPFx). The My Analytics right panel needs a collapsible/hidden mode for narrow contexts.
Iconography, Elevation, Micro-Interactions
Score: 4/10
Icons in the collapsed sidebar are Fluent icons — appropriate and consistent. The "Resolve Block" / "Take Action" button color distinction (red vs. blue) is a good priority signal. However: no hover animation on row hover (no background transition), no elevation change on cards, no loading shimmer, no transition on section collapse/expand, no focus ring visible on keyboard navigation (needs visual inspection to confirm). Gap: Add row hover background transition (100ms ease), collapse/expand animation on lane sections, focus ring enforcement for keyboard users.
Construction-Tech Advantage
Score: 5/10
The lane-based work queue with priority CTAs (Resolve Block > Take Action > View) is construction-appropriate and better than generic SaaS. The Analytics panel with Escalation Candidates and Aging metrics is construction-intelligence-forward. But the BD and Estimating pages are generic enterprise SaaS tables. Gap: Make the Estimating table show bid deadline countdown, make BD show pipeline stage funnel visually, make Project Hub clickable with health status indicators per project.
Competitive Superiority
Score: 4/10
My Work surface has a differentiated concept. But the execution of the detail surfaces (BD, Estimating, Project Hub) is behind the baseline of Procore, Autodesk Build, or even Smartsheet. Those platforms offer sortable, filterable, actionable tables with status badges as table stakes. HB Intel currently offers less than those on every secondary surface. Gap: Bring BD, Estimating, and Project Hub tables up to at-parity baseline, then differentiate with the cross-source analytics advantage.
Non-Obvious Upgrade Potential
Score: 7/10
The single highest non-obvious upgrade: the "My Analytics" panel should become a project-intelligence sidebar that updates in real-time as the user navigates their work queue — showing "Risk surface area: 3 items across 2 projects" contextually as rows are hovered or selected. Combined with the item-detail drawer, this creates a "triage mode" that is entirely absent from current construction platforms. The cross-source Escalation Candidates metric is already in place as the seed.

Competitive Benchmark Readout
Verdict: Below current best-in-class on secondary surfaces; at-parity on My Work concept; potentially ahead on analytics model.
What it already does at or above incumbent level:

The three-lane priority queue (Blocked > Action Required > Watching) is more workflow-relevant than Procore's flat activity feed or Autodesk Build's notification-style work queue.
The cross-source analytics sidebar (source breakdown, escalation candidates, aging) is a concept that current platforms do not surface in a command-center view.
The dark-first, Fluent-token design system is more consistent and premium-feeling than most current construction SaaS.

Where it still resembles the weak patterns of current platforms:

BD/Estimating/Project Hub are exactly the kind of "data-dense but action-light" flat tables that Procore and ACC are criticized for.
Dead deep-links, stub notifications, and non-functional search are the "promise but no delivery" problem that plagues v1 construction-tech products.
ISO dates, text-clip truncation, and missing status badges are the exact low-quality data presentation markers that field users hate on Procore mobile.

What must change to become decisively superior:

Item-detail drawer must work — transforms the page from a list into a command surface.
Cmd+K command palette must work — transforms navigation from menu-driven to intent-driven.
BD/Estimating/Project Hub tables must reach feature-competitive baseline (status badges, row actions, sort, filter).


Quick Wins
IDChangeWhy it is quickExpected impactQW-01Fix "Blocked" badge: add role="status" and aria-label to the existing <span>One-line attribute addition, no component replacement needed immediatelyAccessibility compliance, screen-reader announcementQW-02Set text-overflow: ellipsis on work item title <a> elements; add title attributeCSS one-liner + attribute on existing markupTruncated titles become meaningful, no more hard clipQW-03Fix "Bd Department Sections" → "BD Department Sections" in source data/renderingString/format function fixProfessional credibility, brand consistencyQW-04Gate TanStack devtools button behind `NODE_ENV ===