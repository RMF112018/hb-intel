# Foleon Manager Current-State Scorecard

## Scope

This scorecard records the pre-rebuild state of the HB Intel Foleon Manager using `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`.

Source truth reviewed:
- `apps/hb-intel-foleon/src/pages/manage/ManageOrchestrator.tsx`
- `apps/hb-intel-foleon/src/pages/manage/ManageShellHeader.tsx`
- `apps/hb-intel-foleon/src/pages/manage/HomepageFoleonContentTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/SelectedLaneWorkspace.tsx`
- `apps/hb-intel-foleon/src/pages/manage/FoleonConfigTab.tsx`
- `apps/hb-intel-foleon/src/pages/manage/manageShell.module.css`
- `apps/hb-intel-foleon/src/pages/manage/manageFields.module.css`
- `apps/hb-intel-foleon/src/pages/__tests__/ManagePage.test.tsx`
- `apps/hb-intel-foleon/config/package-solution.json`
- `apps/hb-intel-foleon/src/webparts/foleon/runtimeContract.ts`

## Hard-Stop Findings

- Generic enterprise card/panel outcome remains the dominant posture.
- The hosted-facing UI reads as a centered stacked-card manager rather than a full SharePoint-hosted admin workspace.
- Breakpoint state is computed but does not structurally govern the content layout.
- Limited mode falls back to empty content and blocked actions instead of a designed degraded product state.
- Hosted visual proof, runtime asset proof, and final screenshots do not yet exist for a rebuilt surface.

## Category Scorecard

| Category | Score | Specific observed failure | Source/runtime evidence | Required remediation |
|---|---:|---|---|---|
| Doctrine and host compliance | 1 | Avoids fake SharePoint chrome, but violates anti-safety-zone posture through repeated bordered panels and generic card grids. | `manageShell.module.css` defines panel/card primitives as the dominant visual system; `HomepageFoleonContentTab.tsx` stacks lane summary and workspace. | Replace the dominant structure with a full-width SharePoint-hosted admin canvas. |
| UI-kit / premium-stack compliance | 1 | Premium stack is installed and partially imported, but not materially shaping the surface. | `ManageOrchestrator.tsx` uses Tooltip provider; header uses lucide icons; motion, separator, scroll area, CVA, and clsx are not governing the main workspace. | Use the approved stack for real variants, transitions, tooltips, separators, and polished overflow. |
| Token and styling discipline | 2 | Local tokens exist, but repeated raw `hsl()` panels and card treatments preserve a generic visual outcome. | `manageShell.module.css` contains repeated light-panel, border, shadow, and auto-fit card rules. | Strengthen tokenized manager materials and replace ad hoc card styling with governed variants. |
| Purpose-fit sophistication and persona expression | 1 | The surface says "marketing operations" but behaves like a technical status form. | `ManageShellHeader.tsx` has correct title/subtitle; first content view remains metrics, lane cards, empty guidance, and forms. | Reframe as an operational content command center for marketing/admin users. |
| Surface composition and hierarchy | 1 | Primary areas stack vertically without a console-grade focal sequence. | `HomepageFoleonContentTab.tsx` uses `contentLaneStack`; `SelectedLaneWorkspace.tsx` places checklist, editor, and placement manager in one vertical stack. | Implement left lane nav, central selected-lane workspace, right readiness/action rail, and subordinate library. |
| Homepage integration quality | 1 | The hosted result reads like an app panel dropped into SharePoint rather than an authored page-canvas workspace. | `.shell` centers content and nested panels carry most visual weight. | Use available SharePoint content width and avoid app-in-card posture. |
| Breakpoint and shell-fit quality | 1 | Breakpoint contract is not driving real layout behavior. | `useManageBreakpoint.ts` returns `layoutGridClass`; `ManageOrchestrator.tsx` only emits data attributes; content layout ignores the class. | Implement explicit layout modes and container-aware fallback behavior. |
| Interaction completeness | 2 | Core actions exist, but lane navigation and readiness actions are not a complete admin workflow. | Header sync/open/diagnostics actions exist; lane cards are clickable but not a full lane navigation model. | Add keyboard-safe lane navigation, next actions, disabled explanations, and no dead controls. |
| State-model completeness | 2 | Loading/error/degraded branches exist, but limited mode does not feel like an intentional product state. | Token acquisition failure sets ready state with empty arrays in `ManageOrchestrator.tsx`; content tab shows a limited banner and empty lane/workspace surfaces. | Render a polished degraded preview of the lane workspace and clearly explain unavailable API operations. |
| Contract, data, and backend seam rigor | 3 | Existing seams are relatively strong and should be preserved. | `FoleonManagementApi`, runtime contract, registry bridge, readiness model, and redacted diagnostics are explicit. | Preserve routes, registry-first behavior, split readiness, and redacted proof while adding UI view models only where needed. |
| Identity, media, and attribution quality | 2 | Media/identity is not central to this surface, but status identity and operational cues are underdeveloped. | Header and cards use sparse iconography; status semantics are mostly text. | Add role-appropriate operational icons, freshness/provenance cues, and coherent status variants. |
| Accessibility and keyboard behavior | 2 | Tabs and focus states exist, but lane navigation and motion/reduced-motion proof are incomplete. | `ManagePage.test.tsx` covers tab keyboard behavior; lane navigation has no equivalent keyboard test. | Add semantic lane navigation, focus-visible parity, reduced-motion handling, and tests. |
| Host-runtime resilience | 1 | Package/runtime identity exists, but visual proof and post-package evidence are missing. | `package-solution.json` and `runtimeContract.ts` show version `1.0.29.0`; no rebuilt hosted screenshots or loaded asset proof yet. | Bump version, validate package, collect runtime proof object, JS/CSS assets, component ID, route props, and console review. |
| Validation and closure proof | 0 | No closure artifact exists for this rebuild. | Requested closure file is absent before implementation. | Produce closure report with final scorecard, validation results, hosted evidence, screenshots, limitations, and commit hash. |

## Total

Current score: 21 / 56.

Finding: failing. The current Manager should not be treated as accepted because package/runtime assets load or tests pass. The source and hosted visual posture still trigger hard-stop failures.
