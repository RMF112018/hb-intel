# Foleon Manager Gap Register

## Purpose

This register is the pre-code implementation authority for the Foleon Manager UX rebuild. Every critical and high gap must be remediated or explicitly carried as an exception in the closure report.

## Gaps

| Gap | Severity | Affected files | Doctrine/checklist reference | Planned remediation | Acceptance proof |
|---|---|---|---|---|---|
| Doctrine and host compliance | Critical | `ManageOrchestrator.tsx`, `ManageShellHeader.tsx`, `manageShell.module.css` | Checklist §1; scorecard hard stops; SPFx Standard §3-4 | Replace the centered stacked-card posture with a SharePoint-hosted admin canvas that owns only the page content region. | Hosted desktop screenshot shows full workspace with no fake shell chrome and no generic card-grid outcome. |
| UI-kit / premium-stack compliance | High | Manage page components and CSS modules | Checklist §2; SPFx Standard §5; Homepage Overlay §4 | Use `motion/react`, `lucide-react`, Radix Tooltip/Separator/ScrollArea, CVA, clsx, and `@hbc/ui-kit/homepage` in materially visible ways. | Source imports are tied to rendered behavior; visual surface uses governed variants and polished overflow. |
| Token and styling discipline | High | `foleonManageTokens.css`, `manageShell.module.css`, `manageFields.module.css` | Checklist §3; SPFx Standard §6.1 | Replace repeated light-card styling and inline spacing with tokenized manager materials, variants, and layout classes. | CSS review shows no new brittle raw styling for ordinary spacing/materials; lint/build pass. |
| Purpose-fit sophistication and persona expression | Critical | `ManageShellHeader.tsx`, `HomepageFoleonContentTab.tsx`, `SelectedLaneWorkspace.tsx` | Checklist §4-5; benchmark persona rule | Design the Manager as a marketing operations command center for homepage Foleon lanes, not a diagnostic card stack. | First view communicates lane ownership, live/staged state, readiness, and next action within 3-5 seconds. |
| Surface composition and hierarchy | Critical | `HomepageFoleonContentTab.tsx`, `SelectedLaneWorkspace.tsx`, `ManagePlacementPanel.tsx`, `ContentLibraryPanel.tsx`, CSS | Checklist §5 | Build left lane navigation, central selected-lane workspace, right readiness/action rail, and subordinate content library. | 100% desktop screenshot clearly shows the three-zone workspace and secondary library hierarchy. |
| Homepage integration / SharePoint-host fit | High | Orchestrator/header/CSS; package files | Checklist §6 and §13; SPFx Standard §9 | Use available content width without duplicate navigation or fake app shell. Keep header actions compact and host-safe. | Hosted proof confirms route `foleonRoute=manage`, package version, component ID, and intended visual width. |
| Breakpoint and shell-fit quality | Critical | `useManageBreakpoint.ts`, content tab, CSS, tests, breakpoint artifact | Checklist §7; SPFx Standard §6.5-6.10 | Wire breakpoint state to actual layout modes and document wide, desktop, tablet, phone, short-height, and narrowest stable behavior. | Tests assert layout markers; screenshots cover desktop, 75% wide, tablet/narrow, short-height, and narrowest stable states. |
| Interaction completeness | High | Header, lane nav, selected lane workspace, placement manager, Config tab | Checklist §8 | Ensure every action is honest: enabled actions work, disabled actions explain why, lane nav is keyboard-safe, and placement actions sit in context. | RTL tests cover keyboard lane navigation, disabled explanations, and no dead buttons. |
| State-model completeness | High | `ManageOrchestrator.tsx`, `HomepageFoleonContentTab.tsx`, `manageDegradedCopy.ts` | Checklist §9; Homepage Overlay §3.5 | Treat API consent/read-path failure as designed limited mode with lane structure, readiness explanations, and unavailable operations. | Limited-mode screenshot shows a polished preview, not a sea of zero counts or broken empty cards. |
| Contract, data, and backend seam rigor | Medium | `FoleonManagementApi.ts`, runtime contract, lane/config view models | Checklist §10; benchmark C-D | Preserve backend routes, registry-first architecture, split readiness, degraded consent behavior, and redacted diagnostics. Add typed UI shaping only where needed. | Existing service/runtime tests remain green; new UI tests assert no raw diagnostics in primary UI. |
| Accessibility and keyboard behavior | High | Tabs, lane nav, action controls, CSS | Checklist §12; Homepage Overlay §3.3 | Add semantic lane navigation, visible focus states, reduced-motion support, touch-safe targets, and sensible focus order. | Keyboard tests cover tabs and lane nav; visual review confirms focus states and no hover-only critical meaning. |
| Host-runtime resilience | Critical | `package-solution.json`, runtime contract, closure doc | Checklist §13; SPFx Standard §9.3 | Bump four-part version, validate package, collect runtime proof object, loaded JS/CSS assets, manifest/component ID, route props, and console review. | Closure report includes hosted runtime evidence and screenshot links/notes. |
| Validation and closure proof | Critical | Closure report under `docs/architecture/plans/MASTER/spfx/foleon-manage/uiux-rescue/` | Checklist §14; benchmark closure checklist | Create final closure report with doctrine reviewed, scorecards, gap status, changed files, validation command results, hosted proof, screenshots, limitations, and commit hash. | Final score is at least 40/56, no category below 2 without exception, and no hard-stop failures remain. |

## Non-Negotiable Implementation Gate

The first code pass must structurally replace the current centered stacked-card layout. A visual polish pass that keeps the lane cards, selected workspace, placement form, and library in a mostly vertical card stack does not satisfy this register.

## Limited Mode Requirement

Limited mode must remain visually intentional. API consent failure may disable read, write, and sync operations, but the Manager must still show the intended lane management structure, clear status explanations, and next steps for administrators.
