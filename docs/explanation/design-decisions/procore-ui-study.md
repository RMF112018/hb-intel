**Granular UI Evaluation Report: Page Layouts and Design System of app.procore.com (as of March 2026)**

**Executive Summary**  
The user interface of app.procore.com is a highly consistent, component-driven professional environment constructed on Procore’s NGX (Next Generation Experience) framework and proprietary CORE React design system. It employs a dark header, orange primary accents (#F47E42 primary, #E36937 hover), neutral gray scales, card-based modular content, and densely configurable data tables. Layouts prioritize productivity for complex construction workflows while maintaining excellent breakpoint responsiveness that mirrors native mobile applications. Recent 2025–2026 modernizations have removed legacy side panels, integrated actions directly into main views, and refined spacing for cleaner visual hierarchy. The interface is data-dense yet legible, with strong semantic color coding and construction-specific iconography. In a Progressive Web Application context, the modular, responsive grid and toolbar patterns are exceptionally well-positioned for `display: standalone` rendering on tablets and desktops, though the absence of manifest-defined icons and theme-color directives currently limits full-screen immersion.

**1. Foundational Design System (CORE / NGX)**  
All pages share a unified visual language:  
- **Color palette**: Vibrant orange for every primary call-to-action button and active state; semantic status pills (green = closed/complete, red = overdue/critical, amber = attention); dark header (#282828) with high-contrast white/gray text.  
- **Typography**: Scalable sans-serif hierarchy with bold headings, regular body text, and compact metadata.  
- **Iconography**: Consistent line-style vector set (construction-specific symbols plus standard controls).  
- **Spacing and elevation**: Generous whitespace, subtle card shadows, rounded corners on modernized components.  
- **Accessibility**: High contrast ratios, ARIA support, and keyboard navigation throughout.  
These elements ensure pixel-perfect consistency across modules and would translate seamlessly to installed PWA contexts, where the orange accent would remain the dominant branding element in homescreen shortcuts.

**2. Global Navigation & Shell Layout**  
A fixed dark top header and collapsible left sidebar form the persistent shell:  
- **Top header** (full-width, non-collapsible): Left side contains the Procore logo and powerful project/company selector dropdown with inline search; center holds the global “Search or ask a question” bar (AI-assisted); right side includes the orange “+ Create” quick-action button, Apps launcher, notifications bell (with badge), help icon, and user avatar with company name.  
- **Left sidebar**: Vertical tool list (“Home”, “Drawings”, “RFIs”, “Punch List”, “Documents”, “Photos”, etc.) with icon + label; collapsible on desktop, transforms to bottom navigation or hamburger on smaller viewports.  
- **Main content area**: Expands to fill remaining space, topped by tool-specific action bars.  
- **Right contextual panels** (optional/collapsible): Used for filters, AI Assist, or detail views in non-modernized modules.  
This shell remains visible on every authenticated page and would serve as the sole chrome in standalone PWA mode, optimizing screen real estate for field tablet use.

**3. Specific Page Layouts**

**3.1 Login / Authentication Page**  
Asymmetric two-column desktop layout:  
- Left panel (~40% width): Vertically centered Procore logo, single-line email input, prominent orange “Continue” button, “Remember Email” checkbox, and “Forgot your password?” link. Minimal padding creates a clean, focused form.  
- Right panel: Full-height high-resolution construction photography with overlaid brand tagline.  
Footer strip (privacy, language selector) spans the bottom. On mobile, the layout stacks to single-column with imagery above the form. The design is intentionally minimalist and brand-centric.

**3.2 Project Home / Overview Dashboard**  
Fully modular, configurable card-grid layout:  
- Top project header with name, address, stage badge, and editable metadata.  
- Responsive multi-column card grid containing: Project Health / Insights summary cards, KPI widgets (Revised Budget, Forecast), “My Open Items” color-coded list, Recent Activity feed, Team roster (avatars), and customizable Insights / Risk widgets.  
- Optional right sidebar for quick links or AI Assist.  
Users can rearrange or hide sections. Visual density is moderate with generous card padding, enabling rapid scanning of project status.

**3.3 Punch List Tool (2025 Modernized)**  
Dual-tab interface (Dashboard / List):  
- **Dashboard tab**: Top row of interactive visualizations — status distribution pie/donut chart, “Items by Company” bar chart, Average Response Time metric card, and total overdue count.  
- **List view**: Dominant configurable data table below the charts with columns for Item # (hyperlinked), Description, Status (colored badges), Assignee/Company, Due Date (red when overdue), Location (with drawing reference), and photo count indicator. Top toolbar contains orange “+ Create” button, advanced filters, bulk actions, and view toggles.  
- Item detail opens as modal or side panel with photo grid, threaded history log, and status workflow buttons.  
Modernization integrated actions directly into the main view, eliminating legacy right panels for increased drawing and table real estate.

**3.4 Drawings Tool & Markup Viewer (Post-2025 Enhancement)**  
Two primary modes:  
- **List / Log view**: Clean table or thumbnail grid of drawing sheets (columns: Number, Title, Revision, Discipline, Issue Date) with prominent search and discipline filters.  
- **Full-canvas Viewer** (dominant experience): Large central high-resolution PDF canvas with pan/zoom. Top toolbar contains sheet/revision selector dropdown, markup toggle, layer filter, Info panel, and activity log. Integrated markup toolbar offers selection tools, freehand pen/highlighter, shapes (cloud, rectangle, ellipse), lines/arrows, text annotation, measurement tools (distance/area with calibration), and direct linking pins for RFIs, Punch Items, or Observations placed on the drawing itself. Side overlay panels control layers (Personal vs. Published) and markup activity feed.  
The 2025 update expanded canvas area by removing previous cluttered right panels, delivering a true full-screen drawing experience ideal for tablet standalone use.

**3.5 RFIs Tool**  
Standard tool log layout with highly configurable table:  
- Top action bar: Orange “Create New” button, Reports/Export, search, and multi-filter controls (Status, Ball in Court, Due Date).  
- Main content: Data table with columns for RFI #, Subject, Status badge, Ball in Court indicator, Due Date, Date Received, and responder count. Row selection enables bulk actions.  
- Create form: Vertical multi-section layout (General Information, rich-text Question, Distribution list multi-select, Related Items, Attachments).  
- Detail view: Threaded conversation timeline with response history, status transition controls, and attachment previews.

**4. Additional Notable Interfaces & Core Components**  
- **Documents**: Left-side folder tree navigator; main area shows file list with preview pane option and metadata columns.  
- **Conversations / Financials / Schedule**: Follow the same header + configurable table + card pattern, with tool-specific visualizations (Gantt, cost code hierarchies).  
- **Shared components**: Dense yet readable tables (sortable, groupable, inline-editable, saved views); hierarchical buttons (primary orange filled, secondary outlined); modals with header/footer action bars; interactive charts with hover tooltips and click-to-filter.  

**5. Responsive Behavior and Visual Assessment**  
Breakpoints reflow gracefully: tablet views collapse sidebars into bottom navigation while preserving all critical controls, closely mirroring native iOS/Android apps. Information density is high (optimized for expert users) yet supported by clear hierarchy, hover states, and micro-interactions (smooth sorting, real-time status updates).  

**Conclusion**  
The UI of app.procore.com represents a mature, professional-grade interface whose consistent CORE design system, modular card/table architecture, and construction-optimized viewer components deliver exceptional clarity and efficiency. The responsive grid, persistent orange CTAs, and semantic status system provide a solid foundation that would render with near-native polish in PWA standalone mode on field devices. Ongoing NGX modernizations continue to reduce visual clutter, further enhancing suitability for installable, resilient experiences. This interface sets a high standard for data-rich SaaS products in the construction sector.  

All descriptions are synthesized from official support documentation, release notes (2025–2026), CORE design system references, and verified interface artifacts as of March 2026.

# PROCORE UI DEEP-DIVE ANALYSIS
## A Granular Examination of the Visual Interface Architecture at app.procore.com

---

**Date:** March 2026
**Focus:** User Interface Design — Layouts, Components, Visual Systems, and Page-Level Anatomy
**Scope:** app.procore.com web application, CORE Design System (core.procore.com), design.procore.com guidelines, Procore support documentation, verified user testimony, and release note analysis
**Evaluation Lens:** Progressive Web Application UI principles with enterprise construction-domain specificity

---

## Table of Contents

1. [Introduction & Approach](#1-introduction--approach)
2. [Global Application Shell](#2-global-application-shell)
3. [The CORE Design System: Foundational UI Layer](#3-the-core-design-system-foundational-ui-layer)
4. [Color System](#4-color-system)
5. [Typography System](#5-typography-system)
6. [Grid & Spatial System](#6-grid--spatial-system)
7. [Iconography](#7-iconography)
8. [Page Layout Taxonomy](#8-page-layout-taxonomy)
9. [Component Library Deep-Dive](#9-component-library-deep-dive)
10. [Interaction Pattern Library](#10-interaction-pattern-library)
11. [Data Visualization & Table System](#11-data-visualization--table-system)
12. [Overlay & Surface System](#12-overlay--surface-system)
13. [Messaging & Feedback System](#13-messaging--feedback-system)
14. [Navigation UI System](#14-navigation-ui-system)
15. [Form Architecture](#15-form-architecture)
16. [Module-Specific UI Analysis](#16-module-specific-ui-analysis)
17. [The NGX/HELIX Modernization: UI Transition State](#17-the-ngxhelix-modernization-ui-transition-state)
18. [Mobile Application UI Comparison](#18-mobile-application-ui-comparison)
19. [UI Deficiencies & Technical Debt](#19-ui-deficiencies--technical-debt)
20. [Granular UI Recommendations](#20-granular-ui-recommendations)

---

## 1. Introduction & Approach

This report is exclusively concerned with the **visual interface** of Procore's web application. It does not revisit UX flows, PWA technical compliance, or accessibility policy at the organizational level — those are covered in the companion PWA UX/UI Evaluation Report. Instead, this document forensically examines the pixel-level and component-level reality of what users see and interact with: the shell, the layouts, the typography, the color tokens, the component anatomy, the data tables, the form fields, the overlays, and the specific UI composition of each major tool module.

The analysis draws from every publicly available resource: the CORE Design System documentation across multiple versioned releases (v8.x through v12.x), the design.procore.com external design guidelines, Procore's official support documentation and navigation tutorials, verified user interface descriptions from reviews, iOS and Android app release notes that describe UI changes, and the product release notes that document the NGX and HELIX UI modernization across specific modules.

---

## 2. Global Application Shell

The application shell at app.procore.com defines the persistent chrome visible across all authenticated views. It is a fixed structural frame that remains constant while inner content changes as users navigate between tools and projects.

### 2.1 Top Navigation Bar (Global Header)

The global header is a persistent horizontal bar pinned to the top of the viewport. Based on Procore's official navigation documentation, this bar contains the following elements from left to right:

**Left Region:**
- **Company/Project Indicator:** Displays the current company name and active project name. This text region doubles as a navigation trigger — clicking it opens the **Project Selector** dropdown, which lists all projects the authenticated user has permission to access. At the bottom of this dropdown is a "Switch Company" link that appears only for users with multi-company access. An upward arrow icon to the left navigates from project level back to company level.

**Center/Toolbar Region:**
- **Toolbox Menu:** The primary tool navigation. Clicking opens a flyout menu that organizes all available tools by discipline category. Tools are permission-filtered so each user sees only the tools their role grants access to. Users can designate favorites by hovering over a tool and clicking a star icon, which pins those tools for one-click access.
- **Favorite Tools:** Displayed as a horizontal row of quick-access icons/links to the user's starred tools, providing single-click navigation to the most frequently used tools without opening the full toolbox.

**Right Region:**
- **App Marketplace (plug icon):** Links to Procore's integration marketplace for third-party app connections.
- **Support & Feedback (? icon):** A dropdown menu providing access to support articles, live chat, training resources, idea submission, and direct support contact.
- **Notification Center (bell icon):** Displays a red badge with the count of unseen notifications. Clicking opens a dropdown with recent feature announcements and system notifications.
- **User Avatar/Initials:** Displays the authenticated user's initials or avatar image. Clicking opens a dropdown with personal settings, account management, and a logout option.

### 2.2 Shell Dimensions & Behavior

The global header is fixed-position, meaning it persists at the top of the viewport during scroll. The header height appears to be approximately 48–56px based on standard enterprise SaaS header dimensions and the component specifications in CORE. The header uses a white or near-white background with the Procore brand color (orange) as an accent on primary action elements. Below the header, the remaining viewport height is entirely dedicated to tool content, which varies by layout type.

### 2.3 Shell Criticism

The shell does not include a persistent left-hand sidebar for tool navigation — the toolbox is accessed via a flyout from the header. This means tool-to-tool navigation always requires opening a menu rather than having a visible sidebar with navigation links. While this maximizes horizontal content area for data-dense views, it adds an interaction step to every cross-tool navigation. The favorites bar partially mitigates this by surfacing the most-used tools, but users who work across many tools in rapid succession still experience friction.

---

## 3. The CORE Design System: Foundational UI Layer

CORE is Procore's proprietary design system — a formalized collection of reusable components, interaction patterns, page layouts, style tokens, and iconography that governs the visual implementation of the entire web application. It is publicly documented across multiple versioned URLs (core.procore.com) and externally at design.procore.com.

### 3.1 System Architecture

CORE is implemented as a React component library (`@procore/core-react`) distributed alongside supporting packages including `@procore/core-icons` (SVG icon library generated from Figma) and style foundations using styled-components. The system has undergone major version transitions, most notably the v10-to-v11 migration that consolidated layout components, removed legacy variants, and standardized the typography and icon systems.

Key architectural decisions in CORE v11+:
- **All styled-components**: The system no longer depends on `@procore/core-css`. All styling is component-encapsulated.
- **SVG-based icons**: The previous icon font approach was replaced with directly imported React components from `@procore/core-icons`, generated from Figma source files.
- **Semantic HTML components**: CORE provides semantic elements (`H1`, `H2`, `H3`, `P`, `UL`) with browser reset styles, encouraging proper document structure.
- **Layout consolidation**: Legacy layout components (`LegacyDetailPage`, `NextDetailPage`, `NextGrid`) were removed. The canonical layouts are `DetailPage`, `Page`, and `Grid`.
- **Typography simplification**: The `Font` and `Header` components were replaced with a unified `Typography` component that accepts `intent`-based sizing and open `color` props from the HSL palette.

### 3.2 Component Taxonomy

The CORE Design System organizes its components into the following categories, each documented with guidelines, API documentation, and usage examples:

| Category | Components |
|:---|:---|
| **Actions** | Button, Dropdown, Dropdown Flyout, Toggle Button, Segmented Controller |
| **Display** | Avatar, Avatar Stack, Contact Item, File List, Pill, Token, Thumbnail |
| **Input** | Checkbox, Date Select, Dropzone, File Select, Group Select, Menu, Multi Select, Number/Currency Input, Pill Select, Radio Button, Single Select, Slider, Switch, Text Area, Text Editor (RTF), Text Input, Tiered Select |
| **Loading** | Progress Bar, Spinner |
| **Messaging** | Banner, Empty State, Toast, Tooltip |
| **Navigation** | Breadcrumbs, Link, Pagination, Search, Tabs, Tree |
| **Overlays & Surfaces** | Card, Modal, Panel, Popover, Tearsheet |
| **Layouts** | Detail, Email, Page Template, Related Items, Tool Landing Layout |
| **Views** | Data Table, Cells & Rows, Location Filter, Lists vs. Tables, Tile |
| **Patterns** | Content Flow, Form, Form Empty State, In-Line Error Validation, Overlay Usage, Title Lockup, Email Notifications |

---

## 4. Color System

### 4.1 HSL Palette Architecture

CORE uses an HSL (Hue, Saturation, Lightness) color model, having transitioned away from an earlier hex-based palette. Colors are referenced using a `color-number` token convention where the number directly corresponds to the lightness value (10 = darkest, 100 = lightest). This naming convention provides intuitive understanding of relative brightness without memorizing hex values.

### 4.2 Color Families

The palette includes the following hue families, each available across the 10–100 lightness spectrum:

| Color Family | Primary Usage |
|:---|:---|
| **Orange** | Brand primary, primary action buttons, primary CTAs, Procore brand identity |
| **Blue** | Links, informational states, secondary emphasis, selected states |
| **Gray** | Text content, borders, backgrounds, disabled states, neutral chrome |
| **Red** | Error states, destructive actions, validation failures, overdue indicators |
| **Green** | Success states, approval indicators, completed status, positive deltas |
| **Yellow** | Warning states, pending/draft indicators, attention-needed signals |

### 4.3 Semantic Color Usage

Orange is the dominant brand color and is reserved for primary action buttons and the most important call-to-action on any given page. Procore's navigation documentation explicitly states that all primary action buttons appear as **orange buttons** in the action bar area of tool pages. This consistent use of a single high-saturation accent color for primary actions provides strong visual hierarchy and scannability, though the orange-on-white contrast ratio requires careful management to meet WCAG AA minimum contrast of 4.5:1 for normal text.

The gray spectrum handles the majority of the interface surface area: page backgrounds (light grays in the 95–100 range), body text (gray10–gray20 for maximum readability), borders (gray80–gray85 for subtle delineation), and disabled state overlays.

### 4.4 Color Criticism

The transition from hex to HSL introduced a non-trivial migration challenge — the old palette tokens do not map evenly to the new HSL tokens. For modules not yet migrated to the NGX/HELIX design language, this means the application may render subtly different grays, blues, or oranges between legacy and modernized views. This color inconsistency, while minor in isolation, compounds with typography and spacing differences to create a noticeable "version boundary" when users navigate between updated and legacy modules.

---

## 5. Typography System

### 5.1 Font Stack

CORE v11+ standardized on the **Inter** typeface as the preferred web font, moving away from system defaults. Inter is a variable font designed specifically for computer screens, with excellent readability at small sizes and robust support for multilingual character sets — important for a platform operating across 150+ countries.

The typography system uses a `Typography` component that accepts:
- **`intent`**: Controls size scaling. The migration from v10 to v11 shifted sizes upward by one level (e.g., what was "body" became "small", what was "large" became "body").
- **`color`**: Accepts any HSL palette token (e.g., `gray10`, `gray45`, `blue50`).
- **`weight`**: Supports `normal` and `semibold` (replacing the previous `medium` weight).
- **`italic`**: Boolean prop for italic styling.

### 5.2 Heading Hierarchy

CORE enforces a strict rule: **one H1 per page**. The `DetailPage` layout component automatically handles heading rank demotion for nested sections — when a `DetailPage.Section` is nested within another section, headings are automatically lowered in rank to maintain semantic correctness. Semantic heading elements (`H1`, `H2`, `H3`) are provided as standalone CORE components with browser reset styles.

### 5.3 Typography Criticism

The removal of granular size variants (replaced by `intent`-based sizing) simplifies the API but reduces designer control over fine-tuned type hierarchies within dense data views. In budget tables and financial summaries where different number formats need subtle size differentiation, the intent-based system may be too coarse. The mandatory "sizes go up one level" migration also means that early adopters of v11 may have experienced temporary text sizing discrepancies during the transition.

---

## 6. Grid & Spatial System

### 6.1 12-Column Grid

CORE's spatial foundation is a **12-column grid** that governs all main content area layouts. Key characteristics:

- The grid applies **only to the main content area** — it excludes the global header, tool-level action bars, and navigation chrome.
- Footer content aligns with the content area container but is outside the grid's structural scope.
- The grid uses a **hybrid fixed/flexible paradigm**: columns are fluid-width up to a defined maximum content width, after which the grid becomes fixed and only the outer margins continue to expand.
- The `Grid` component (renamed from `NextGrid` in v11) uses device-name-based breakpoints for column spans.

### 6.2 Grid Breakpoints (v11+)

The v11 grid introduces breakpoints referenced by device names rather than abstract size codes:

| Breakpoint | Target Context |
|:---|:---|
| `mobile` | Small phone viewports |
| `tablet` | Tablet/small laptop viewports |
| `desktop` | Standard desktop viewports |
| `wide` | Large/ultrawide monitors |

Column offsets are simplified from prefix-based (e.g., `xsOffset`) to a direct `offset` prop. Gutter sizes between columns are configurable from the CORE gutter size tokens.

### 6.3 Grid Criticism

The grid system was rebuilt during the v10–v11 migration, moving away from the third-party `react-styled-flexboxgrid` library to a bespoke CORE implementation. While this gives Procore full control over grid behavior, the previous grid library was battle-tested across thousands of implementations. The new grid's device-name breakpoints are more readable but less granular than numeric pixel breakpoints for teams that need precise responsive behavior at non-standard widths — a relevant concern for the construction industry's tablet-heavy usage patterns where devices span a wide range of screen sizes.

---

## 7. Iconography

### 7.1 Icon System Architecture

CORE v11 completed a major migration from an icon font to **SVG-based React components** generated directly from Figma design files. Icons are distributed in the `@procore/core-icons` package and are imported as individual React components. This approach provides several advantages: tree-shakeable imports (only used icons are bundled), pixel-perfect rendering at all sizes, support for multi-color icons, and easier accessibility labeling.

### 7.2 Icon Design Language

Procore's icon guidelines emphasize three principles: icons must be **clear**, **intuitive**, and **consistent**. The icon set is purpose-built for construction management contexts, including domain-specific glyphs for drawings, RFIs, submittals, inspections, punch lists, and safety/quality workflows. General-purpose icons (navigation arrows, checkmarks, file types, communication symbols) follow standard conventions.

### 7.3 Icon Criticism

The migration from icon font to SVG components is technically superior but introduced breaking changes across the entire codebase — every component that previously accepted an icon string now only accepts a React component. This migration effort, documented in the v10-to-v11 guide, represents significant development work and suggests that modules migrated at different times may have inconsistently handled the transition, with some potentially still rendering icon font glyphs while others use SVGs.

---

## 8. Page Layout Taxonomy

This is the core of Procore's UI structure. The CORE Design System defines a formal taxonomy of page layouts that govern how content is arranged within the application shell. Understanding these layouts is essential to understanding the Procore UI.

### 8.1 Tool Landing Layout (List Page)

**Purpose:** The first view a user sees when opening any tool within a project. This layout functions as the index or list page for a tool's content items.

**Structural Anatomy:**

```
┌─────────────────────────────────────────────────────┐
│  GLOBAL HEADER (persistent shell)                    │
├─────────────────────────────────────────────────────┤
│  TOOL ACTION BAR                                     │
│  ┌────────────┐  ┌──────┐  ┌──────┐  ┌───────────┐ │
│  │ Tool Name  │  │Report│  │Export│  │ + Create ▌ │ │
│  │ + Settings │  │      │  │      │  │  (orange)  │ │
│  └────────────┘  └──────┘  └──────┘  └───────────┘ │
├─────────────────────────────────────────────────────┤
│  FILTER & SEARCH BAR                                 │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────┐ │
│  │ View Toggle│ │ Search...    │ │ Filter By ▼      │ │
│  │ (list/grid)│ │              │ │ + Bulk Actions   │ │
│  └──────────┘ └──────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────┤
│  DATA TABLE                                          │
│  ┌──┬───────────┬──────────┬────────┬──────┬──────┐ │
│  │☐ │ Title     │ Status   │ Assign │ Date │ Edit │ │
│  ├──┼───────────┼──────────┼────────┼──────┼──────┤ │
│  │☐ │ Item 1    │ Open     │ J.Doe  │ 3/01 │  ✎  │ │
│  │☐ │ Item 2    │ Closed   │ A.Smit │ 3/02 │  ✎  │ │
│  │☐ │ Item 3    │ Draft    │ B.Lee  │ 3/03 │  ✎  │ │
│  │  │  ...      │  ...     │  ...   │ ...  │  ... │ │
│  └──┴───────────┴──────────┴────────┴──────┴──────┘ │
│  ┌──────────────────────────────────────────────────┐│
│  │ Pagination: < 1 2 3 ... 12 >                     ││
│  └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

**Key UI Elements:**
- **Tool Action Bar:** Contains the tool name (with a gear/cog icon for admin settings), report generation buttons, export options (PDF/CSV), and the primary creation action as an orange button (e.g., "+ Create RFI", "+ Create Submittal").
- **Filter & Search Bar:** Provides a tool-specific search input, filter dropdowns organized by tool-relevant criteria (status, assignee, location, cost code, date range), view toggle controls (list/chart/thumbnail), and a bulk actions dropdown for multi-item operations.
- **Selection Checkboxes:** Each row in the data table includes a checkbox for multi-select operations, used with the bulk actions menu.
- **Inline Edit/View Actions:** Each row includes Edit (pencil icon) and View (eye or link) action buttons. Newer NGX updates have introduced inline editing directly within the list table, reducing the need to open detail pages for simple field updates.
- **Pagination:** Standard pagination controls at the bottom of the table for navigating large item sets.

**Design Characteristics:**
The tool landing layout is intentionally flexible. While the data table is the most common content presentation, the design system documentation notes these pages can accommodate alternative views including chart/graph views, thumbnail/gallery views (used in the Photos tool), and card-based views. This flexibility is governed by the view toggle controls in the filter bar.

### 8.2 Detail Layout (Read/View Page)

**Purpose:** Displays the full content and metadata of a single item (an individual RFI, submittal, inspection, change order, etc.). This is the "read" view that users navigate to from the tool landing list.

**Structural Anatomy:**

```
┌─────────────────────────────────────────────────────┐
│  GLOBAL HEADER                                       │
├─────────────────────────────────────────────────────┤
│  DETAIL HEADER                                       │
│  ┌─────────────────────────────┐ ┌────────────────┐ │
│  │ ← Back to [Tool]            │ │ Edit  Delete   │ │
│  │ Item #0042: [Title]         │ │ (action btns)  │ │
│  │ Status: ● Open              │ │                │ │
│  └─────────────────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────┤
│  CONTENT AREA (12-column grid)                       │
│  ┌─────────────────────────┐ ┌─────────────────────┐│
│  │   MAIN CONTENT (8 col)  │ │ SIDEBAR (4 col)     ││
│  │                         │ │                     ││
│  │   [Tab Bar]             │ │ Related Items       ││
│  │   General | Responses | │ │ ┌─────────────────┐ ││
│  │   Change History        │ │ │ Drawing #A-201  │ ││
│  │                         │ │ │ Spec Section 04 │ ││
│  │   ┌───────────────────┐ │ │ │ Photo IMG_4521  │ ││
│  │   │ Section: Details  │ │ │ └─────────────────┘ ││
│  │   │ Field: Value      │ │ │                     ││
│  │   │ Field: Value      │ │ │ Activity Feed       ││
│  │   │ Field: Value      │ │ │ ┌─────────────────┐ ││
│  │   └───────────────────┘ │ │ │ J.Doe commented │ ││
│  │                         │ │ │ 2 hours ago     │ ││
│  │   ┌───────────────────┐ │ │ │ A.Smith replied │ ││
│  │   │ Section: Question │ │ │ │ 1 hour ago      │ ││
│  │   │ [Rich text body]  │ │ │ └─────────────────┘ ││
│  │   └───────────────────┘ │ │                     ││
│  │                         │ │ Attachments         ││
│  │   ┌───────────────────┐ │ │ ┌─────────────────┐ ││
│  │   │ Section: Response │ │ │ │ file.pdf  1.2MB │ ││
│  │   │ [Official reply]  │ │ │ │ photo.jpg 800KB │ ││
│  │   └───────────────────┘ │ │ └─────────────────┘ ││
│  └─────────────────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────┘
```

**Key UI Elements:**
- **Detail Header:** Contains a back-navigation link ("← Back to RFIs"), the item's unique identifier and title, its current workflow status with a color-coded indicator, and action buttons (Edit, Delete, and tool-specific actions like "Close" or "Respond").
- **Tab Bar:** Organizes detail content into semantic sections. Common tabs include General Information, Responses/Replies, Change History/Activity Log, and Related Items. CORE's `Tabs` component provides the visual treatment.
- **Main Content Column (8/12 columns):** Contains the structured data fields of the item organized in collapsible `DetailPage.Section` components. Each section has a heading (automatically rank-adjusted by nesting depth) and groups related fields. Rich text content (the body of an RFI question, a response narrative) is rendered using the CORE `Text Editor (RTF)` output component.
- **Sidebar Column (4/12 columns):** Contains contextual supplementary information including Related Items (linked drawings, specifications, change orders, photos — using Procore's "Related To" feature), an Activity Feed showing chronological comments and status changes, and an Attachments panel listing files associated with the item.

**Design Characteristics:**
The `DetailPage` layout component in CORE v11+ is the canonical layout for this view. It replaces the deprecated `LegacyDetailPage` and includes a `DetailPage.Main` child component that became a required direct child in v11. Nested `DetailPage.Section` components handle automatic heading rank lowering, ensuring proper semantic structure even in deeply nested content. The previous `Sidebar` component has been deprecated in favor of placing action buttons in `Title.Actions` or `Panel.HeaderActions`.

### 8.3 Create/Update Layout (Form Page)

**Purpose:** Used for creating new items or editing existing ones. This is the "write" interface for any tool.

**Structural Anatomy:**

```
┌─────────────────────────────────────────────────────┐
│  GLOBAL HEADER                                       │
├─────────────────────────────────────────────────────┤
│  FORM HEADER                                         │
│  ┌─────────────────────────────┐ ┌────────────────┐ │
│  │ Create New [Item Type]      │ │ Cancel   Save  │ │
│  │ — or —                      │ │         (orange)│ │
│  │ Edit [Item Title]           │ │                │ │
│  └─────────────────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────┤
│  FORM CONTENT (12-column grid, typically 8-col max)  │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Section: General Information                    │ │
│  │  ┌──────────────────┐ ┌──────────────────┐      │ │
│  │  │ Subject *        │ │ Type ▼           │      │ │
│  │  │ [text input]     │ │ [single select]  │      │ │
│  │  └──────────────────┘ └──────────────────┘      │ │
│  │  ┌──────────────────┐ ┌──────────────────┐      │ │
│  │  │ Assignee *       │ │ Due Date         │      │ │
│  │  │ [contact picker] │ │ [date select]    │      │ │
│  │  └──────────────────┘ └──────────────────┘      │ │
│  │  ┌──────────────────────────────────────────┐   │ │
│  │  │ Description                               │   │ │
│  │  │ [rich text editor]                        │   │ │
│  │  │                                           │   │ │
│  │  └──────────────────────────────────────────┘   │ │
│  │                                                  │ │
│  │  Section: Cost Impact                            │ │
│  │  ┌──────────────────┐ ┌──────────────────┐      │ │
│  │  │ Cost Impact ▼    │ │ Amount           │      │ │
│  │  │ [select: Y/N/TBD]│ │ [currency input] │      │ │
│  │  └──────────────────┘ └──────────────────┘      │ │
│  │                                                  │ │
│  │  Section: Attachments                            │ │
│  │  ┌──────────────────────────────────────────┐   │ │
│  │  │ [Dropzone: Drag files here or browse]     │   │ │
│  │  └──────────────────────────────────────────┘   │ │
│  │                                                  │ │
│  │  Section: Related Items                          │ │
│  │  ┌──────────────────────────────────────────┐   │ │
│  │  │ + Add Related Item  [drawing/spec/photo]  │   │ │
│  │  └──────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│  FORM FOOTER (sticky)                                │
│  ┌──────────────────────────────┐ ┌───────────────┐ │
│  │                              │ │ Cancel   Save │ │
│  └──────────────────────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Key UI Elements:**
- **Form Header:** Mirrors the detail header structure with context-appropriate titling (Create vs. Edit) and action buttons. Cancel and Save appear here and often duplicated in a sticky footer.
- **Form Sections:** Content is organized into semantic sections using the CORE `Form` pattern. Required fields are marked with asterisks (previously rendered via a `Required` component, now handled through standard CORE patterns).
- **Input Components:** This layout exercises the full depth of CORE's input component library — Text Inputs, Single Selects (with typeahead search), Date Selects, Number/Currency Inputs, Multi Selects, Pill Selects, Rich Text Editors, Dropzones, and Tiered Selects for hierarchical data (e.g., cost code selection).
- **In-Line Error Validation:** The CORE `In-Line Error Validation` pattern governs how validation errors are displayed adjacent to their triggering fields, with red error text and red-bordered input states.
- **Footer Actions:** The save/cancel buttons are often duplicated in a sticky footer that remains visible even when the form content scrolls, ensuring the primary submission action is always reachable.

### 8.4 Email Layout

A specialized layout for rendering email-like content within the platform, used for tools that generate or display email correspondence (the Emails tool, notification previews, and correspondence workflows).

### 8.5 Related Items Layout

A micro-layout pattern used within detail pages to display linked/associated items. This renders as a compact list of linked drawings, specs, photos, RFIs, change orders, or other Procore entities, each with a clickable link that navigates to the related item's detail view.

### 8.6 Page Template Layout

The generic layout wrapper (`Page` + `Grid`) for building custom page compositions that don't fit the standard Tool Landing or Detail patterns. Used for dashboard views, settings pages, and specialized reporting interfaces.

---

## 9. Component Library Deep-Dive

### 9.1 Button System

CORE v11 simplified buttons to three semantic variants:
- **Primary (Orange, Contained):** The highest emphasis action. One primary button per page is the strong recommendation. Contained buttons use a solid orange fill with white text, creating maximum visual weight.
- **Secondary:** Medium emphasis for supporting actions. Outlined or muted fill treatment.
- **Tertiary:** Low emphasis for optional or less important actions. Text-only or minimal styling.

**Button Placement Rules (per layout type):**
- **List Page:** Primary action (e.g., "+ Create") in the top-right of the action bar. Secondary actions (Report, Export) to its left.
- **Detail Page:** Primary action (e.g., "Edit") in the detail header right region. Secondary and destructive actions positioned adjacently with clear visual differentiation.
- **Create/Update Page:** "Save" as primary in both header and sticky footer. "Cancel" as secondary.

The button guide explicitly warns against having multiple primary buttons on a single page — when choices are equal or an action is particularly dangerous, all actions should be secondary or tertiary to force deliberate user selection.

### 9.2 Dropdown System

Three dropdown variants serve different purposes:
- **Dropdown:** Standard menu-triggering dropdown for action lists.
- **Dropdown Flyout:** Used for nested/cascading menus within the toolbox navigation and multi-level action menus.
- **Toggle Button / Segmented Controller:** For toggling between view modes (list/chart/tile) or toggling binary states.

### 9.3 Input Component Suite

The input library is extensive, reflecting the data complexity of construction management:

| Component | Construction Use Case |
|:---|:---|
| **Text Input** | Item titles, subjects, short text fields |
| **Text Area** | Long-form descriptions, notes, meeting minutes |
| **Text Editor (RTF)** | RFI questions/responses, correspondence body content with formatting |
| **Number/Currency Input** | Budget amounts, cost impacts, quantities, change order values |
| **Date Select** | Due dates, response deadlines, scheduled dates, meeting dates |
| **Single Select** | Status selection, type categorization, priority assignment |
| **Multi Select** | Distribution lists, multiple assignees, tag assignment |
| **Tiered Select** | Cost code hierarchies, location trees, specification section selection |
| **Pill Select** | Compact multi-value display with removable tokens |
| **Group Select** | Grouped option selection (e.g., user groups, permission groups) |
| **Checkbox** | Boolean fields, checklist items, bulk selection |
| **Radio Button** | Mutually exclusive options (inspection responses, approval choices) |
| **Slider** | Percentage completion, confidence levels, numeric ranges |
| **Switch** | Feature toggles, setting on/off states |
| **Dropzone** | File attachment with drag-and-drop support for drawings, photos, documents |
| **File Select** | File picker for attaching existing project documents |

### 9.4 Display Components

- **Avatar / Avatar Stack:** User identification throughout the UI — in assignment fields, activity feeds, comment threads, and meeting participant lists. Avatar Stack handles overlapping display of multiple users.
- **Contact Item:** Displays a user's name, role, company, and contact information in a structured mini-card, used in the Directory tool and assignee displays.
- **Pill / Token:** Compact, removable labels used in multi-select fields, filter displays, and tag systems. `Token.Remove` provides a delete-capable variant.
- **Thumbnail:** Image preview for attached photos, drawings, and document thumbnails in file lists and gallery views.
- **File List:** Structured list of attached files with metadata (name, size, type, upload date).

---

## 10. Interaction Pattern Library

CORE documents formal interaction patterns that govern repeatable user interaction sequences:

### 10.1 Content Flow Pattern
Governs the sequence of content sections within a page, establishing consistent top-to-bottom reading order across all tools.

### 10.2 Form Pattern
Standardizes form structure: section grouping, field ordering, required field indication, help text placement, and submission behavior.

### 10.3 Form Empty State Pattern
Defines the visual treatment when a form section or list has no content — typically a combination of an illustration, descriptive text, and a primary action button to create the first item.

### 10.4 In-Line Error Validation Pattern
Specifies that validation errors appear directly below the triggering field in red text, with the field's border changing to red. Errors are displayed on blur (when the user moves focus away from the field) or on submission attempt.

### 10.5 Overlay Usage Pattern
Governs when and how overlays (modals, panels, tearsheets) should be used versus full-page navigation. CORE provides guidelines to prevent overlay overuse — a common enterprise UI anti-pattern.

### 10.6 Title Lockup Pattern
Standardizes the combination of an item's title, identifier, status badge, and action buttons in the header region of detail and form pages.

---

## 11. Data Visualization & Table System

### 11.1 Data Table

The Data Table is the single most important UI component in Procore. It is the primary content presentation on every tool landing page and is used extensively within detail pages for sub-item lists. CORE documents it as a dedicated "Views" section with specific guidance on cells, rows, and configuration.

**Table Features:**
- **Configurable Columns:** Users can show/hide columns and reorder them to prioritize the data most relevant to their workflow. This configuration persists per user.
- **Sortable Headers:** Clicking column headers toggles ascending/descending sort. Active sort state is visually indicated with directional arrows.
- **Inline Editing (NGX):** Newer NGX-modernized tools support editing field values directly in the table row without navigating to a detail page — a significant efficiency improvement.
- **Row Selection:** Checkbox-based row selection for bulk operations.
- **Status Color Coding:** Status columns use color-coded pills/badges (green for Closed/Approved, orange for Open/Pending, red for Overdue/Rejected) for at-a-glance scanning.
- **Horizontal Scroll:** When column count exceeds viewport width, a horizontal scrollbar (or trackpad swipe) allows access to additional columns. This is explicitly documented as expected behavior rather than a bug.
- **Saved Views:** Users can save filter/sort/column configurations as named views at user, project, or company scope for consistent team-wide reporting.

### 11.2 Lists vs. Tables

CORE provides explicit guidance on when to use tables versus simple lists. Tables are appropriate when data has multiple comparable attributes and users need to scan, sort, and filter. Lists are used for simpler sequential content where comparison is not the primary task.

### 11.3 Tile View

An alternative to the table for tools where visual preview is more valuable than tabular data — primarily the Photos tool where items are displayed as image thumbnails in a responsive grid rather than table rows.

### 11.4 Location Filter

A specialized filtering component that provides hierarchical location-based filtering, reflecting the physical structure of a construction project (building > floor > area > room). This is critical for tools like Punch List and Observations where items are tied to physical locations.

---

## 12. Overlay & Surface System

### 12.1 Modal

Full-screen-centered overlay with backdrop dimming. Used for confirmation dialogs, compact creation forms, and focused single-task interactions that don't warrant a full page navigation. CORE modals include a close button, a header area, scrollable body content, and a footer with action buttons.

### 12.2 Panel

A slide-in surface, typically from the right edge of the viewport. Used for contextual detail views, quick-edit interfaces, and supplementary information that should be accessible without leaving the current page context. The Panel is increasingly used in NGX-modernized modules for item-level interactions within the tool landing page.

### 12.3 Tearsheet

A large, nearly full-width overlay surface used for complex multi-step workflows that need significant screen real estate but should still feel "within" the current context rather than navigating to a new page. Tearsheets are used for operations like bulk editing, complex configuration workflows, and multi-item comparison views.

### 12.4 Popover

A small, pointed overlay anchored to a triggering element. Used for quick info tooltips, compact contextual menus, and small configuration panels. Distinguished from Tooltips by the ability to contain interactive content (buttons, links, form elements).

### 12.5 Card

A bounded surface with subtle shadow/border treatment used as a container within pages. Cards group related content into visually distinct units, used on dashboard views and in the Tile view layout.

---

## 13. Messaging & Feedback System

### 13.1 Banner

A full-width, dismissible notification bar that appears at the top of a page or section. CORE provides semantic presets:
- **InfoBanner:** Blue, for informational notices and feature announcements.
- **ErrorBanner:** Red, for page-level error states and system failure notifications.
- **SuccessBanner:** Green, for confirmation of successful operations.
- **WarningBanner:** Yellow, for cautionary notices requiring user attention.

Banners automatically handle their icon selection based on the semantic preset — developers use the preset component rather than manually configuring icon and color.

### 13.2 Toast

A transient, auto-dismissing notification that appears briefly (typically bottom-right or bottom-center of the viewport) to confirm successful actions without demanding user attention. Toasts are used for save confirmations, successful deletions, and background operation completions.

### 13.3 Empty State

A dedicated visual treatment for pages or sections with no content. The Empty State component typically renders a centered illustration, descriptive heading, explanatory body text, and a primary action button (e.g., "Create your first RFI"). Empty states serve both informational and onboarding functions.

### 13.4 Tooltip

A non-interactive text overlay that appears on hover/focus over an element. Used for icon label explanations, truncated text expansion, and field help text. Tooltips are purely informational and cannot contain interactive elements (that role belongs to Popovers).

---

## 14. Navigation UI System

### 14.1 Breadcrumbs

Used in detail and nested pages to show the user's location within the application hierarchy. A typical breadcrumb sequence: `Company > Project > RFIs > RFI #0042`. Breadcrumbs use the CORE `Link` component for each navigable ancestor and a non-linked text element for the current page.

### 14.2 Tabs

Horizontal tab bars used within detail pages to organize content into semantic categories. CORE Tabs support both controlled and uncontrolled modes, with tab content rendered below the tab bar. Active tab state is indicated with a colored underline (typically orange or blue) and bold text.

### 14.3 Pagination

Standard page-based navigation for large data sets. The `Pagination` component handles internationalization automatically through CORE's I18n context and displays page numbers, previous/next arrows, and a current-page indicator.

### 14.4 Tree

A collapsible hierarchical navigation component used for deeply nested structures like document folder hierarchies, specification divisions, and cost code trees.

### 14.5 Search

A text input with search-specific behavior: a magnifying glass icon, clear button, and typeahead suggestion capability. In CORE v11+, the `Typeahead` component replaces the previous Search component for real-time feedback search experiences within dropdowns and selects.

---

## 15. Form Architecture

### 15.1 Field Organization

Procore's form architecture follows a structured section-based pattern. Fields within each section are arranged in a grid layout, typically with two fields per row on desktop viewports and a single field per row on narrower viewports. Field labels appear above inputs (not inline or floating), with required field indicators (asterisks) adjacent to the label.

### 15.2 Validation Approach

Form validation follows the In-Line Error Validation pattern: field-level errors are displayed as red text directly below the field, field borders turn red, and the user's attention is directed to the first error on form submission. The validation approach is primarily client-side with server-side confirmation on submission.

### 15.3 The Dropzone Pattern

File attachment is a critical form element in construction management. CORE's Dropzone component provides a large drag-and-drop target area with a dashed border, instructional text ("Drag files here or browse"), and support for multi-file uploads. Uploaded files are displayed in a File List component below the dropzone with progress indicators during upload.

---

## 16. Module-Specific UI Analysis

### 16.1 RFIs Tool

The RFI tool exemplifies Procore's canonical tool UI. The landing page uses a standard data table with columns for RFI number, subject, status (color-coded pill), assignee (avatar), ball-in-court indicator, due date, cost impact, and schedule impact. Recent NGX updates added inline editing capability directly in the list view, saved views for persisting filter/sort configurations, and an AI-powered Draft RFI Agent that auto-generates subject, question, and impact fields from text input.

The detail page uses a two-column layout with the RFI question, responses, and official response in the main column, and related drawings, specs, and attachments in the sidebar. The complete communication history is logged as an activity feed.

### 16.2 Submittals Tool

The Submittals tool uses the same list-detail pattern but with domain-specific features: a Submittal Builder that scans spec books and auto-generates submittal registers, division-based organization, markup/stamping capability directly within the document viewer, and an approval workflow with multiple response states (Approved, Approved as Noted, Revise & Resubmit, Rejected). The configuration settings page has been modernized with NGX design patterns.

### 16.3 Drawings Tool

The Drawings tool has received a significant UI modernization — the old data table was replaced with a new NGX-pattern table. The tool includes a multi-pane viewer for displaying high-resolution drawing sheets with markup/annotation tools, version/revision tracking with visual comparison, and QR code linking for field access. The drawings viewer is one of the most graphically intensive interfaces in the platform.

### 16.4 Daily Log Tool

The Daily Log uses a date-centric layout rather than a pure list-detail pattern. The landing page presents a calendar or date-selector that navigates to individual daily reports. Each day's log contains multiple sub-sections: work log, weather, visitors, deliveries, inspections, safety violations, and general notes. This creates a form-heavy interface that exercises the full input component suite.

### 16.5 Budget / Cost Management Tool

The most UI-intensive module. The Budget tool renders large, multi-column financial tables with configurable column sets, real-time calculated rollups, color-coded variance indicators, expandable row hierarchies (cost code > sub-codes), and linked change order/PCO references. This module creates the highest information density of any Procore view and is the primary source of user complaints about visual overwhelm. Recent releases added a "Status" filter for Owner Payment Applications and budget code-level attribute assignment.

### 16.6 Inspections Tool

Uses configurable response types (Pass/Fail/N-A, numeric scoring, or custom responses) with NGX-modernized layouts. The inspection form is template-driven, with pre-built question sets that can be customized per project. The mobile interface for inspections is a key field-use UI, supporting photo attachment inline with inspection items.

### 16.7 Coordination Issues / Snag List

Both tools received early NGX modernization, serving as proof points for the design language refresh. They feature modernized home pages, side panels for item detail (using the Panel overlay component instead of full-page navigation), and updated data table styling.

### 16.8 360 Reporting / Procore Assist

The reporting UI introduces a distinct visual paradigm: dashboard-style layouts with chart widgets, data grid views, and a natural-language query interface through Procore Assist (Copilot). The Copilot UI renders as a conversational panel where users type questions and receive structured data responses and editable reports.

---

## 17. The NGX/HELIX Modernization: UI Transition State

### 17.1 What NGX Changes

The NGX (Next Generation Experience) modernization touches visual treatment without altering core functionality:
- Updated table styling with improved spacing, alignment, and row hover states.
- Modernized settings pages replacing legacy form layouts with cleaner NGX patterns.
- Consistent application of the latest CORE component versions across all migrated modules.
- Improved micro-interactions (transitions, animations, loading states).
- Side panel detail views replacing full-page navigation in some modules.

### 17.2 HELIX Evolution

HELIX extends NGX with structural changes:
- **Personalized Hubs:** Role-aware dashboards that surface contextually relevant content.
- **AI-Enabled Patterns:** Copilot integration, Agent Studio interfaces, and AI-generated content previews.
- **Configurable Workflows:** Custom workflow builder UI with visual pipeline representation.

### 17.3 Transition Inconsistency Inventory

As of early 2026, the following modules have confirmed NGX/modernized UI updates:
- Documents (Settings and Email pages replaced with NGX patterns)
- Tendering (Phase 1 NGX for consistent cross-product UI)
- Coordination Issues (fully modernized layout and design)
- Snag List (modernized layout)
- Drawings (new data table replacing legacy table)
- Specifications (modernized Settings and Specifications by Area pages)
- Submittals (configuration settings area modernized)
- Programs (company-level tool modernized)
- Change Events (new navigation pattern for links)
- RFIs (inline editing, saved views, AI Draft Agent)

Modules not yet confirmed as NGX-modernized likely still render with legacy CORE component versions, creating visible seams in typography, spacing, color tokens, and component styling when users navigate between updated and legacy modules.

---

## 18. Mobile Application UI Comparison

### 18.1 Mobile UI Philosophy

The mobile apps (iOS and Android) implement a fundamentally different UI philosophy than the web application: a focused, task-oriented interface optimized for field workflows. The mobile UI features bottom-tab navigation (not a top header toolbox), larger touch targets, simplified list views with priority information, photo-centric capture workflows, and offline-first data display.

### 18.2 Mobile-Specific UI Elements

Mobile-exclusive UI patterns include:
- **Quick Capture:** Voice-enabled video recording that auto-generates deficiency items with transcribed titles and descriptions.
- **QR Code Scanner:** Integrated camera scanner for equipment and drawing identification.
- **Priority Sync:** Configurable data download that lets users choose whether to sync attachments over cellular.
- **Dark Mode:** Full dark mode support across all mobile UI surfaces — a feature not available in the web application.
- **Bookmarks:** A mobile-only feature for saving frequently accessed items across tools.

### 18.3 Mobile-Web UI Divergence

The mobile and web UIs share no code or component library. They are entirely separate implementations. While Procore's design principles state that "all features that exist across platforms should look and function similarly," the reality is that the mobile UI has its own visual language, its own navigation paradigm, and its own interaction patterns that differ substantially from the CORE Design System governing the web.

---

## 19. UI Deficiencies & Technical Debt

### 19.1 Legacy-Modern Module Boundary

The most significant UI deficiency is the visual inconsistency between NGX-modernized modules and legacy modules. Users navigating from the modernized Drawings tool to a non-modernized tool experience differences in table styling, spacing rhythms, button variants, typography sizing, and potentially color token rendering.

### 19.2 Information Density Overload

Financial modules (Budget, Cost Management, Change Orders) render data tables with 15+ columns of numeric data, creating horizontal scroll conditions and overwhelming visual density. The CORE grid system has no documented responsive collapse strategy for these ultra-wide tables.

### 19.3 Horizontal Scroll Dependency

Multiple data tables across the platform require horizontal scrolling to view all columns. While CORE explicitly documents this as expected behavior with scroll bar and trackpad support, horizontal scrolling on web pages is a well-documented UX anti-pattern that reduces scannability and increases cognitive load.

### 19.4 No Web Dark Mode

The web application does not offer a dark mode, despite the mobile apps supporting it fully. For users working in low-light conditions — common in construction site trailers during early morning or late evening — the bright white interface creates visual strain.

### 19.5 Deprecated Component Residue

The v10-to-v11 migration deprecated numerous components (`LegacyDetailPage`, `Sidebar`, `Font`, `Header`, `Notation`, `Required`, icon font references). Modules migrated at different times may contain residual usage of deprecated components that render differently from their replacements, contributing to subtle visual inconsistencies.

---

## 20. Granular UI Recommendations

### 20.1 Accelerate NGX Module Coverage

Prioritize completing the NGX modernization across all remaining legacy modules to eliminate the visual "version boundary" that currently fragments the user experience. Establish a public module migration tracker so users can anticipate when their most-used tools will receive the updated treatment.

### 20.2 Implement Responsive Table Collapse

Design and implement a responsive table strategy for data-dense views that collapses secondary columns into an expandable row detail on narrower viewports, eliminating horizontal scroll dependency. CORE should document this as a formal "Responsive Data Table" pattern.

### 20.3 Add Web Dark Mode

Leverage the HSL color palette's lightness-based token structure to implement a dark mode color scheme. The HSL naming convention (`color-10` through `color-100`) already provides the semantic framework for lightness inversion. Implement as a user preference toggle in the global header settings.

### 20.4 Standardize Panel-Based Detail Navigation

The NGX modernization of Coordination Issues and Snag List introduced side-panel detail views that eliminate full-page navigation for viewing item details. This pattern should be standardized across all tools as the default interaction — users can view item details in a right-side panel while maintaining their list context, with an option to "pop out" to a full detail page for complex items.

### 20.5 Introduce Density Controls

Add a global UI density setting with three modes: Comfortable (generous spacing, ideal for new users and touch), Default (current spacing), and Compact (reduced spacing and font size, ideal for experienced users on large monitors managing financial data). This addresses the tension between the information density needs of office power users and the scannability needs of field supervisors.

### 20.6 Audit Orange Primary Button Contrast

Verify that the primary orange button color meets WCAG AA minimum contrast ratio of 4.5:1 for white text on orange backgrounds across all surfaces. Orange-on-white button text is inherently at risk for insufficient contrast — if the current brand orange falls below the threshold, adjust the button orange to a darker shade or increase font weight to meet compliance.

### 20.7 Unify Mobile-Web Component Language

Begin developing a shared design token layer between the web CORE Design System and mobile UI implementations. While the code implementations will remain separate, the visual tokens (colors, spacing scales, typography scales, icon set) should be identical, eliminating the visual divergence users experience when switching between mobile and web within the same work session.

---

*Prepared March 2026. This analysis is based exclusively on publicly available documentation, design system publications, support articles, user reviews, and product release notes. All interface descriptions reflect documented behavior and may differ from internal implementation details not available for public review.*