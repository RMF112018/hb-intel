# UI Kit Competitive Benchmark Matrix

> **Doc Classification:** Living Reference (Diátaxis) — WS1-T02 competitive benchmark across 12 UI pattern categories comparing HB Intel's target standard against construction-tech category leaders; governs T03 visual language, T04 hierarchy doctrine, T05 density/field doctrine, T06 data surface direction, T07 component quality bar.

**Produced by:** WS1-T02 (Competitive Benchmark Matrix and Mold-Breaker Principles)
**Date:** 2026-03-16
**Governing plan:** `docs/architecture/plans/UI-Kit/WS1-T02-Competitive-Benchmark-Mold-Breaker.md`

---

## How to Read This Matrix

Each of the 12 UI pattern categories below is presented as a vertical table with five rows:

| Row | What it captures |
|-----|-----------------|
| **Category leader pattern** | What Procore, ACC, InEight, CMiC, and peers typically implement |
| **Category leader strength** | What users praise in reviews and market studies |
| **Category leader weakness** | What users criticize — specific findings from market studies |
| **HB Intel target** | What the kit must achieve or exceed to be competitive |
| **HB Intel mold-break** | Where HB Intel must specifically differ and why |

Evidence references use the format `(source-file, §section)` and trace to the market studies listed in the Source Evidence section.

---

## Benchmark Matrix

### 1. Shell Layout

| Dimension | Detail |
|-----------|--------|
| **Category leader pattern** | All platforms implement a three-region shell: fixed top header (48–64px), collapsible left sidebar (220–280px expanded, 48–56px icon rail), and primary content area. Top header contains logo/project selector, global search, notifications, and user avatar. Sidebar collapse uses 200–300ms CSS transitions. *(con-tech-ui-study, §3; procore-ui-study, §2)* |
| **Category leader strength** | Persistent orientation anchor — header remains visible during scroll, ensuring users always know which project they are in. Collapsible sidebar is valued on tablets in landscape, maximizing content viewport while maintaining navigational access. The three-region structure mirrors native mobile app patterns, creating cognitive familiarity. *(con-tech-ui-study, §3)* |
| **Category leader weakness** | CMiC's hierarchical menu structure (ERP heritage) requires deeper navigation; reviewers describe it as "not easy to navigate" with "not much organization." Bluebeam Cloud deviates from the sidebar pattern, using workspace-level navigation that creates inconsistency with category norms. *(con-tech-ux-study, §2; con-tech-ui-study, §3)* |
| **HB Intel target** | Three-region shell with dedicated project-picker button prominently in header, smooth sidebar collapse preserving full functionality, and breadcrumb context persistence during filter/search operations. |
| **HB Intel mold-break** | Context-adaptive shell that opens to current work (role-based project canvas) rather than module menus. Sidebar prioritizes user's top-5 tools by learned usage, not alphabetical module list. Shell chrome adapts density per device — icon rail on tablet, expanded on desktop — without requiring user configuration. *(See MB-01, MB-03)* |

### 2. Headers and Command Bars

| Dimension | Detail |
|-----------|--------|
| **Category leader pattern** | Primary creation actions ("Create RFI," "New Issue") positioned as prominently colored buttons in upper-right toolbar using platform accent color (Procore orange #F47E42, Autodesk blue, InEight green). Headers are `position: fixed` or `position: sticky` with high z-index. Contextual toolbars transform when rows are selected, displaying bulk actions. *(con-tech-ui-study, §4, §8; procore-ui-study, §2)* |
| **Category leader strength** | Consistent header positioning is reassuring — search, notifications, and profile are always accessible. Procore's orange accent on "+ Create" creates immediate visual hierarchy. Contextual toolbar transformation reduces clutter while enabling efficient bulk operations without full-page navigation. *(con-tech-ui-study, §4)* |
| **Category leader weakness** | Procore's AI search integration creates a dense header that competes for attention. Autodesk Build receives criticism that some modules require "too many clicks" and the interface "just looks more complicated than it really is," suggesting command grouping is not obvious to users. *(con-tech-ux-study, §2; con-tech-ui-study, §4)* |
| **HB Intel target** | Sticky global header with explicit action grouping: creation actions left, filtering/view actions center, bulk/advanced actions right. Primary action button unmistakable through scale, color, and labeling consistency. |
| **HB Intel mold-break** | Page-level toolbar scrolls out of view to maximize content space on smaller viewports while global header remains fixed. Command density adapts to complexity tier — Essential mode shows only the primary create action; Expert mode reveals full toolbar. *(See MB-01, MB-05)* |

### 3. Cards and Dashboards

| Dimension | Detail |
|-----------|--------|
| **Category leader pattern** | Dashboard views use card-based layouts with consistent structure: title bar, summary metric or count, optional chart/sparkline, and subtle box shadows (1–4px blur, low opacity). InEight provides real-time role-based dashboards with drill-down; Autodesk introduced Insight Builder custom dashboards (May 2025). *(con-tech-ui-study, §9; con-tech-ux-study, §2)* |
| **Category leader strength** | Users praise at-a-glance project status via aggregated KPI cards. InEight's drill-down and customizable role-based dashboards are praised as "modern platform appropriate for today's technology." Card metaphor (from mobile design) reduces cognitive load by chunking information into digestible units. *(con-tech-ui-study, §9; con-tech-ux-study, §2)* |
| **Category leader weakness** | Older dashboard implementations lack customization, leading users to feel trapped in rigid layouts. Platforms vary significantly in balancing "comprehensive functionality" with "information overload." Oracle Primavera's portfolio dashboards aggregate so much data that pre-caching for offline becomes impractical. *(con-tech-ui-study, §9; con-tech-ux-study, §2)* |
| **HB Intel target** | Clear visual weight hierarchy using elevation to distinguish interactive cards from static background. Metric cards with primary number (large, bold), secondary context label, and optional micro-visualization without clutter. Drag-and-drop card reordering with persistent layout preferences. |
| **HB Intel mold-break** | Context-aware dashboards surface different KPIs based on user role and project phase. Dashboards adapt to complexity tier — Essential shows 3–4 priority cards, Expert shows full grid. Cards are PWA-cacheable for offline project status. *(See MB-01, MB-05, MB-06)* |

### 4. Tables and Data Surfaces

| Dimension | Detail |
|-----------|--------|
| **Category leader pattern** | Data tables are the most frequently encountered component across all platforms. All implement configurable columns (show/hide, reorder), multi-row selection via checkboxes triggering bulk action toolbars, and sticky headers. Procore NGX introduced inline editing within list views. Saved Views (persisting named filter/sort/column configurations) have become a significant competitive differentiator. *(con-tech-ui-study, §6, §12; procore-ui-study, §3.3, §3.5)* |
| **Category leader strength** | InEight reviewers praise "sorting, organizing, filtering, views — all the things that drive me nuts about HeavyBid." Platforms lacking robust Saved Views receive "consistent criticism for requiring users to re-apply filters on every visit." Inline editing reduces navigation overhead compared to list → detail → edit → save → return-to-list. *(con-tech-ui-study, §6; con-tech-ux-study, §5)* |
| **Category leader weakness** | CMiC represents the "high-density extreme" with financial tables presenting extensive cost code hierarchies that reviewers describe as "overwhelming." One reviewer noted the interface is "very sensitive" with forecasting issues. The fundamental tension is between office users needing high-density views and field users needing simplified, readable views on smaller screens in bright conditions. *(con-tech-ui-study, §6; con-tech-ux-study, §2)* |
| **HB Intel target** | Configurable columns with persistent Saved Views (user, project, and company scopes). Inline editing for frequently modified fields with clear visual edit-mode indication. Sticky headers with secondary sticky action toolbar. |
| **HB Intel mold-break** | Tables auto-switch density based on complexity tier — Essential shows 3–4 essential columns (ID, Status, Owner, Due); Expert shows full column set. Adaptive column hiding eliminates horizontal scrolling at 1024px. Card-based fallback on narrow viewports converts columns to vertical card layout. *(See MB-04, MB-05)* |

### 5. Status Systems

| Dimension | Detail |
|-----------|--------|
| **Category leader pattern** | All platforms use consistent color-coded status badges: Green (completed/approved), Yellow/Amber (pending/in-review), Red (overdue/rejected), Blue (informational/draft), Gray (inactive/archived). Badges are small rounded rectangles (4–8px radius) appearing in table rows, detail page headers, and dashboard cards. Procore's "Ball In Court" (BIC) indicator shows which user holds current responsibility. *(con-tech-ui-study, §7; con-tech-ux-study, §7)* |
| **Category leader strength** | Color semantics align with universal traffic-light conventions, enabling users moving between platforms to understand status "without retraining." Procore's BIC metaphor (from tennis) is "universally understood in construction culture." Pre-attentive color processing enables rapid scanning of large item lists. *(con-tech-ui-study, §7)* |
| **Category leader weakness** | No major documented weakness in core semantic status systems — convergence is high. The gap is in status change communication: less sophisticated implementations snap badge colors without animation, providing no visual confirmation of state change. BIC is available inconsistently across Procore modules. *(con-tech-ui-study, §7, §8)* |
| **HB Intel target** | Traffic-light color system with documented semantics in design tokens. Smooth badge color transitions (200–300ms) on status change. Responsibility tracking as a first-class UI element visible in list views and filterable in Saved Views. |
| **HB Intel mold-break** | Universal "next move" ownership indicator on every actionable item — visible in list views, detail headers, and cards — extending Procore's BIC concept to all modules from day one. Status colors engineered for field contrast (≥7:1 ratio for all status indicators). *(See MB-02, MB-07)* |

### 6. Filters and Saved Views

| Dimension | Detail |
|-----------|--------|
| **Category leader pattern** | Filters positioned between toolbar and data table as a horizontal bar of dropdowns, search inputs, and toggles. Common dimensions: Status, Assignee, Date Range, Type, Priority. Saved Views pattern allows persisting named configurations. Procore supports three scoping levels (user, project, company) and preserves configurations in exports. AI-powered search (Procore Assist, Autodesk Assistant) represents a shift toward intent-based retrieval. *(con-tech-ui-study, §12; procore-ui-study, §3.5)* |
| **Category leader strength** | Saved Views is "a competitive differentiator and user satisfaction driver." Procore's multi-level scoping enables individual customization and team standardization. AI-powered search represents a paradigm shift from traditional filter-based search to natural-language querying. *(con-tech-ui-study, §12; con-tech-ux-study, §5)* |
| **Category leader weakness** | Platforms lacking robust Saved Views "receive consistent criticism for requiring users to re-apply filters on every visit — a repetitive task that consumes time and introduces cognitive load." CMiC and older Trimble Vista are specifically called out. *(con-tech-ui-study, §12; con-tech-ux-study, §5)* |
| **HB Intel target** | Prominent Saved Views UI with quick-access buttons for switching. Compact active-filter pills with individual removal. Three scoping levels (user, project, company). |
| **HB Intel mold-break** | "Save this filter" button appears automatically when ad-hoc filters are applied, reducing friction to capturing reusable views. Role-based default views are suggested based on user role and project phase. Saved Views persist offline and sync automatically. *(See MB-01, MB-05)* |

### 7. Detail Pages and Side Panels

| Dimension | Detail |
|-----------|--------|
| **Category leader pattern** | All platforms implement a list → detail → edit hierarchy. Procore's modernization replaced modal views with side panels to preserve user position in the table. Detail pages use structured panel layout: header panel (title, status, metadata), tabbed content area (Details, Activity, Related Items, Attachments), and right-side metadata panel. *(con-tech-ui-study, §9; con-tech-ux-study, §3, §6)* |
| **Category leader strength** | Side-panel approach reduces disorientation from full-page navigation. Users maintain context while accessing details — critical for field and office users working with dozens of related items simultaneously. Sequential item review is efficient without returning to list. *(con-tech-ui-study, §9)* |
| **Category leader weakness** | Procore's Related Items system is a persistent frustration: related items do not auto-populate when contextual links are obvious (e.g., creating a Change Event from an RFI should automatically link them). Drawing markup links are unidirectional. Feedback dating to 2017–2018 indicates ongoing implementation gaps. *(procore-ux-study, §4.1; con-tech-ux-study, §5.2)* |
| **HB Intel target** | Side-panel detail views preserving list context. Structured panel layout with tabs. Bi-directional cross-module linking. |
| **HB Intel mold-break** | Context-aware side panels that auto-populate related items at creation time based on workflow state. Detect common cross-module relationships (RFI → Drawing, Submittal → Specification) and surface suggestions without manual linking. Eliminates the "forgot to link" pattern. *(See MB-01, MB-06)* |

### 8. Form Layouts

| Dimension | Detail |
|-----------|--------|
| **Category leader pattern** | Single-column or two-column layouts with consistent field ordering: identification fields first (title, number), descriptive fields, assignment fields, classification fields (status, type, priority), then attachments. Inline validation with red border highlighting and required field asterisks is universal. Procore's CORE Design System documents error surfacing on field blur or submission attempt. *(con-tech-ui-study, §10; con-tech-ux-study, §10)* |
| **Category leader strength** | Consistency in field ordering creates predictable mental models that transfer across tools. Inline validation provides immediate feedback without form resubmission, reducing frustration for complex multi-field forms. *(con-tech-ui-study, §10)* |
| **Category leader weakness** | CMiC error messages are "not always intuitive, which wastes our time troubleshooting." Platforms lack form state persistence — if a user spends 10 minutes composing an RFI and the network request fails, form data may be lost. *(con-tech-ux-study, §10)* |
| **HB Intel target** | Consistent field ordering with inline validation. Actionable, contextual error messages (e.g., "Cost impact requires a number greater than 0" rather than "Invalid input"). |
| **HB Intel mold-break** | Client-side form state persistence to IndexedDB that saves draft state on every field change. Forms survive network failure, browser crash, and session expiration. Progressive validation surfaces errors before submission. Field-optimized forms show 1–2 fields per screen in Essential mode. *(See MB-01, MB-07)* |

### 9. Drawing and Viewer Surfaces

| Dimension | Detail |
|-----------|--------|
| **Category leader pattern** | All platforms embed drawing viewers (PDFs, DWG, BIM, images) directly in the web application. Bluebeam is the category leader with VisualSearch, batch linking, overlay comparison, and collaborative Studio Sessions supporting 500 concurrent users. Procore supports drawing markup with linking to RFIs, punch items, and observations. Autodesk added markup stamps and pushpin annotations across 2D sheets. *(con-tech-ui-study, §11; procore-ux-study, §4.1)* |
| **Category leader strength** | Bluebeam's markup sophistication and 500-user real-time collaboration is unmatched. Spatial linking (markups linking to specific drawing locations) is intuitive for construction professionals. Users describe these tools as "non-negotiable" for field teams. *(con-tech-ui-study, §11)* |
| **Category leader weakness** | Procore's most-requested feature (since 2018): automatic syncing of drawings on mobile — current model requires manual sync per project. Users report drawings unavailable on-site despite being opened previously. Redesigned drawing navigation made column listings so narrow that plan titles appear identical. Web version requires connectivity for new markups; markups cannot be queued for offline sync. *(procore-ux-study, §16.2–16.4)* |
| **HB Intel target** | Embedded drawing viewer with markup, spatial linking to workflow items, and annotation collaboration. |
| **HB Intel mold-break** | Offline drawing caching with background sync for annotations. Pre-cache project drawings with configurable sync policy (Wi-Fi only, selected projects). Users add annotations completely offline; sync when connectivity returns. Eliminates the "online-only" blocker that forces field users to native apps. *(See MB-07)* |

### 10. Responsive Behavior

| Dimension | Detail |
|-----------|--------|
| **Category leader pattern** | All platforms are desktop-first with mobile adaptation. Tablet in landscape (1024–1366px) is the primary field device. Three viewport configurations: desktop (1440+), tablet landscape (1024–1366), tablet portrait/large phone (768–1024). Top navigation persists; sidebars collapse to icon rails at smaller viewports. *(con-tech-ui-study, §14; procore-ux-study, §16.1)* |
| **Category leader strength** | Procore, Autodesk Build, and InEight optimize specifically for tablet form factor. Collapsible sidebar scales gracefully across form factors. Fixed header maintains project and tool context. Breakpoint strategy is mature across category. *(con-tech-ui-study, §14)* |
| **Category leader weakness** | iPad experience "feels like a scaled-up phone app rather than a tablet-optimized interface" per App Store reviews. Users state it's "easier to just open Procore in Safari." CMiC's mobile browser experience is "specifically criticized by verified reviewers as being particularly deficient." *(procore-ux-study, §16.1; con-tech-ux-study, §6)* |
| **HB Intel target** | Tablet-first breakpoints with split-view panels at 1024px+. Hardware keyboard support for field users. Orientation change preservation (no context reset on rotation). |
| **HB Intel mold-break** | True master-detail split-view at 1024px+ (list 40%, detail 60%) using full landscape tablet real estate. On viewport reduction, details move to slide-out panel; list expands to full width. Drawing viewer usable at 1:1 scale on tablets with details accessible via overlay. *(See MB-04, MB-07)* |

### 11. Field Usability

| Dimension | Detail |
|-----------|--------|
| **Category leader pattern** | Mobile applications use larger touch targets, simplified list views, and bottom-tab navigation optimized for one-handed operation. Procore mobile prioritizes core field workflows: viewing drawings, capturing photos, creating punch items, responding to RFIs. Mobile UX is effective because it reduces complexity. *(con-tech-ui-study, §20; procore-ux-study, §16.1–16.3)* |
| **Category leader strength** | Touch target sizes, simplified interfaces, and one-handed navigation are well-understood. Procore's mobile is praised as "cleaner and more focused… cuts out the complexity and delivers only the information necessary." Field adoption hinges on mobile simplicity. *(procore-ux-study, §16.1)* |
| **Category leader weakness** | No platform explicitly documents high-contrast design for outdoor construction environments. Standard 48px touch targets are borderline for gloved hands. Field users consistently request "simpler interfaces, fewer clicks." The office-field UX divide is most pronounced for CMiC and Trimble Vista (back-office-first). *(con-tech-ux-study, §11; ux-mold-breaker, §3.3, §8.6)* |
| **HB Intel target** | Jobsite-optimized controls: touch targets ≥48×48px, semantic color coding visible in bright sunlight, high-contrast mode. Glove-friendly gesture alternatives with longer press duration tolerance. |
| **HB Intel mold-break** | Field density mode with ≥48×48px interactive elements, ≥8px spacing between targets, and ≥7:1 contrast ratios. Auto-detect field role and present field-only views by default (Drawings, Punch List, Photos, RFI Response). Quick-create buttons (observation, punch, photo) always visible. Camera capture via dedicated button, not file picker. *(See MB-05, MB-07)* |

### 12. PWA Readiness

| Dimension | Detail |
|-----------|--------|
| **Category leader pattern** | None of the seven platforms currently implements a complete PWA. All serve over HTTPS with responsive design, but none registers service workers, provides Web App Manifest for installability, implements offline capability through web standards, or uses Background Sync API. All provide native mobile apps (iOS/Android) with offline queuing. However, all have structural patterns highly compatible with PWA: application shell, client-side routing, JSON API data layer, responsive layouts. *(con-tech-ui-study, §19–20; con-tech-ux-study, §10)* |
| **Category leader strength** | Structural prerequisites are already in place. "Seven platforms serving the majority of the global construction market have independently converged on UI structural patterns that are architecturally identical to PWA application shells." *(con-tech-ui-study, §19)* |
| **Category leader weakness** | No Web App Manifest (no installability). No service worker (no offline support). No Background Sync API (form submissions fail offline — "the single highest-impact PWA opportunity"). No Push API (no native push notifications). All platforms rely on separate native app development — a "costly, fragmented approach that PWA standards can replace with a single codebase." Field users forced to native app because web lacks offline resilience. *(con-tech-ui-study, §19–20; con-tech-ux-study, §3.3, §5.5)* |
| **HB Intel target** | Complete PWA from day one: Web App Manifest with standalone display mode, service worker for shell and drawing caching, IndexedDB for offline form state, Background Sync API for queued submissions, Push API for workflow notifications. |
| **HB Intel mold-break** | "The platform that first delivers a complete PWA experience in construction technology will not merely improve its own product — it will reset user expectations across the entire category." HB Intel is PWA-native, not PWA-retrofitted. Offline-first drawing cache with selective sync. Form state persists through connectivity loss. BIC/responsibility-shift notifications via Push API. Single codebase serves all surfaces. *(See MB-07, MB-08)* |

---

## Five Highest-Leverage Differentiation Opportunities

These five categories represent the largest gap between category leader weakness and HB Intel's ability to deliver a materially better experience in Wave 0:

### 1. PWA Readiness

**Leverage:** Category-wide PWA maturity is effectively 0/10 — no competitor has implemented service workers, Background Sync, or offline capability in their web tier. HB Intel is PWA-native from inception. This is the single largest structural advantage available.

**Why it matters:** Field users are forced into separate native apps because web experiences fail offline. A unified PWA eliminates dual-app maintenance, reduces onboarding friction, and delivers offline-capable field workflows through a single codebase.

### 2. Shell Fatigue

**Leverage:** Every competitor opens to module menus, not to current work. Always-visible dense shells with alphabetical tool lists create navigation fatigue, especially for occasional users who spend 3–6 months reaching proficiency.

**Why it matters:** The role-based project canvas (opening to what matters now), combined with context-adaptive shell density, directly attacks the category's most common onboarding complaint. HB Intel already has `@hbc/shell` and `@hbc/app-shell` packages to build on.

### 3. Adaptive Density

**Leverage:** No competitor offers a complexity dial. Users get one density level regardless of role, device, or expertise. The result is power users who tolerate complexity and occasional users who are overwhelmed.

**Why it matters:** The Essential/Standard/Expert complexity tier directly resolves the category's most common complaint ("great once you learn it, but too much up front") without splitting the product into lite and pro versions. HB Intel already has `@hbc/complexity` (v0.1.0).

### 4. Field Usability

**Leverage:** Web-tier field experience is universally compromised across the category. No platform documents high-contrast design for outdoor environments, glove-aware touch affordances, or field-specific interaction patterns in their web applications.

**Why it matters:** Construction jobsites are characterized by intermittent connectivity, outdoor brightness, and physical conditions (gloves, dust, movement) that penalize complex interactions. A kit engineered for field conditions from the component level up creates a durable advantage.

### 5. Horizontal Scrolling in Tables

**Leverage:** Dense data tables on tablets are a universal pain point. Financial tables span 15+ columns with mandatory horizontal scrolling. No competitor implements responsive column hiding or card-based fallback.

**Why it matters:** Tables are the most frequently encountered component. Eliminating horizontal scrolling at tablet viewport widths through adaptive column hiding and card fallback would be immediately noticeable to every user, every session.

---

## Source Evidence

All findings in this matrix trace to the following market studies:

| Source File | Scope | Key Sections Used |
|------------|-------|-------------------|
| `docs/explanation/design-decisions/con-tech-ui-study.md` | Visual/UI analysis of 7 construction-tech platforms | §3 (shell), §4 (headers), §6 (tables), §7 (status), §8 (BIC), §9 (cards/elevation), §10 (forms), §11 (drawings), §12 (filters), §14 (responsive), §19–20 (PWA) |
| `docs/explanation/design-decisions/con-tech-ux-study.md` | Cross-platform UX analysis of 7 platforms | §2 (dashboards), §3 (scoping), §5 (saved views/onboarding), §6 (linking/responsive), §7 (status), §10 (PWA), §11 (field), §16 (modernization), §17 (field frustration) |
| `docs/explanation/design-decisions/procore-ui-study.md` | Procore UI patterns deep-dive | §1 (design system), §2 (navigation), §3.3–3.5 (tables/data) |
| `docs/explanation/design-decisions/procore-ux-study.md` | Procore UX analysis | §4.1 (related items), §16.1–16.4 (responsive/drawings/mobile) |
| `docs/explanation/design-decisions/ux-mold-breaker.md` | Product strategy and 16 signature solutions | §3.2–3.3 (user needs), §4 (complaints), §8.1–8.6 (signature solutions) |

---

*End of UI Kit Competitive Benchmark Matrix — WS1-T02 v1.0 (2026-03-16)*
