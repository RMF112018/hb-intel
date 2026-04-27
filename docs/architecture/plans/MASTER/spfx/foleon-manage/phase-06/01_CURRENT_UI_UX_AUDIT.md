# 01 — Current UI/UX Audit

## Executive Summary

The current Foleon Manager looks like an engineering diagnostics panel, not a marketing/admin application. The surface exposes raw readiness concepts as the main experience:

- registry validity;
- list binding validity;
- API resource status;
- token acquisition state;
- route authorization;
- read/write/sync paths;
- config source tables.

Those are valuable diagnostics, but they are not the primary job-to-be-done for either marketing users or admins.

## Main Design Failure

The application is organized around **system proof** instead of **user action**.

Marketing users need to know:

- what is live in Project Spotlight, Company Pulse, and Leadership Message;
- what is staged or missing;
- what is blocked and why;
- what action to take next.

Admins need to know:

- whether SharePoint/API consent is approved;
- whether registry configuration is valid;
- whether backend/list/read/write/sync paths are healthy;
- what exact action resolves a blocker;
- how to copy redacted diagnostic proof when escalation is needed.

The current UI places raw system state in front of both audiences.

## Why It Feels Unusable Despite Correct Readiness Logic

1. **Wrong first screen:** Config/diagnostics dominate the screen before content lane management.
2. **Wrong language:** Raw keys like `TOKEN ACQUISITIONBlocked` are implementation facts, not task language.
3. **Wrong visual hierarchy:** Every readiness cell has equal weight, so the user cannot tell what matters most.
4. **Wrong density:** Long proof tables and technical status grids create the visual impression of failure.
5. **Wrong degraded-state posture:** API consent missing looks like the app is broken instead of a controlled, limited-access mode.
6. **Wrong default workflow:** The content-management job is visually subordinate to diagnostics.
7. **Insufficient role separation:** Marketing and admin concerns are mixed on the same level.

## Direct Answers to Required Audit Questions

### Which content is useful to marketing users?

- Lane name: Project Spotlight, Company Pulse, Leadership Message.
- Current lane state: Live, Preview, Blocked, Empty, Needs setup.
- Active content title.
- Display window.
- Placement status.
- Publish readiness.
- Primary next action.
- Preview/live URL availability.
- Plain-language disabled-action reason.

### Which content is useful only to admins?

- Registry connection state.
- SharePoint list binding state.
- Backend/API connection.
- API permission / tenant approval status.
- Token provider/acquisition status.
- Route authorization.
- Read/write/sync path readiness.
- Package/manifest/version proof.
- Redacted config-source and runtime proof.

### Which content should move into collapsed diagnostics?

- `Config Source by Value`.
- Registry proof arrays.
- Raw config source fingerprints.
- SharePoint list binding proof.
- Backend/API/auth readiness detail rows.
- Runtime binding proof.
- Package/manifest proof JSON.
- Token-provider diagnostics.
- Any raw exception/error text after redaction.

### Which technical labels need plain-language replacements?

| Current label | Replacement |
|---|---|
| `REGISTRYValid` | Registry connection — Ready |
| `LIST BINDINGSValid` | SharePoint lists — Ready |
| `BACKEND URLValid` | Backend connection — Configured |
| `API RESOURCEValid` | API permission — Configured |
| `TOKEN PROVIDERValid` | Token setup — Ready |
| `TOKEN ACQUISITIONBlocked` | API approval — Needs approval |
| `BACKEND SAFE CONFIGBlocked` | Backend configuration — Blocked |
| `ROUTE AUTHORIZATIONBlocked` | User authorization — Blocked |
| `READ PATHBlocked` | Read access — Blocked |
| `WRITE PATHBlocked` | Publishing access — Blocked |
| `SYNC PATHBlocked` | Sync access — Blocked |

### Which current cards/tables should be removed, grouped, collapsed, renamed, or redesigned?

| Current element | Recommendation |
|---|---|
| Large technical `Foleon Connector` header | Rename/present as `Foleon Manager`; move technical connector identity to diagnostics. |
| Raw readiness summary grid | Replace with concise status chips in header and grouped admin health cards in Config. |
| `Config Source by Value` primary table | Move under collapsed diagnostics; expose only plain-language configuration groups by default. |
| Registry Source Status | Group under Config → Registry; collapse proof details. |
| SharePoint List Bindings | Group under Config → SharePoint lists; show redacted ready/missing/blocker state. |
| Backend / API / Auth Readiness | Group under Config → Backend/API; rank blockers and show next actions. |
| Sync failures in header | Replace with global status banner only when action is needed. |
| Editor/placement panels always visible | Move into selected-lane workspace or drawer/panel triggered by action. |

### Should Homepage Foleon Content or Config be the default tab?

`Homepage Foleon Content` should be the default tab. The app’s primary purpose is to manage homepage Foleon lanes. Config is an admin workflow and should not be visually dominant unless a deep link or user selection opens it.

### What should the page header communicate in five seconds?

- This is **Foleon Manager**.
- It manages homepage Foleon content and placements.
- The operating mode is live, limited, or blocked.
- The three homepage lanes have a high-level status.
- The user has one or two obvious next actions.

### What should a marketing user do first when landing on the page?

Review the lane cards and select the lane requiring action, usually:

- Review lane;
- Edit content;
- Open preview;
- Validate;
- Publish when ready.

### What should an admin do first when landing on the Config tab?

Review the System Health Summary, then the ranked Required Admin Actions list. If API approval is missing, the first admin task is SharePoint Admin Center API approval for `HB SharePoint Creator / access_as_user`.

### How should API consent missing be displayed without making the app look broken?

Use a warning-level global status banner:

> API approval required. SharePoint needs approval to let this app call the HB Intel backend. Content can be reviewed, but publishing and sync are unavailable until `HB SharePoint Creator / access_as_user` is approved in SharePoint Admin Center.

Provide:
- one clear next action;
- secondary `View diagnostics`;
- no raw token error stack in primary UI;
- disabled write/sync actions with blocker reason.

### How should live/preview/blocked/empty lane states be displayed?

Use lane cards with status chips:

| State | Meaning | Visual treatment |
|---|---|---|
| Live | Active public-ready content and placement are aligned. | Positive chip, active content title, display window, `Review lane`. |
| Preview | Staged or sample content exists but not live. | Neutral/info chip, `Open preview`, `Complete setup`. |
| Blocked | Validation, placement, readiness, or permission prevents publishing. | Warning chip, blocker summary, `View blockers`. |
| Empty | No active or staged content exists. | Neutral empty card, `Add content`. |
| Needs setup | Required configuration/list/backend values missing. | Warning chip, admin next action. |

### How should disabled write actions explain their blocked reason?

Disabled controls must show visible helper text near the action and, where technically feasible, a tooltip or `aria-describedby` explanation:

> Publishing is unavailable because API approval is still required.

Do not hide disabled actions without explanation.

### What does “good” look like at desktop width and within SharePoint page constraints?

- Header is compact and informative.
- Status chips fit on one line or wrap cleanly.
- Lane cards are visible above the fold.
- Selected-lane workspace is the main content area.
- Config tab groups admin tasks into readable sections.
- Diagnostics are collapsed by default.
- No horizontal overflow.
- Tables are minimized, responsive, and secondary.
- Cards align to a coherent grid and avoid heavy boxed-in chrome.

### Minimum surgical remediation

- Rename header to `Foleon Manager`.
- Make `Homepage Foleon Content` the default tab.
- Replace raw header/status grid with high-level chips.
- Move config-source and proof tables into collapsed diagnostics.
- Add lane cards for the three homepage lanes.
- Add global consent-required banner with next action.
- Replace raw labels with plain-language labels.
- Add disabled-action explanations.
- Preserve all current services, readiness models, and workflows.

### Ideal remediation

- Extract lane and config view models.
- Build reusable `StatusChip`, `HealthCard`, `ActionBanner`, `LaneCard`, `SelectedLaneWorkspace`, `AdminActionList`, and `DiagnosticsDisclosure` components.
- Use a drawer/panel for editor and placement actions.
- Add robust tests for role-focused workflows and degraded states.
- Add screenshot proof across desktop, tablet, and narrow SharePoint page constraints.
