# HB Intel Foleon Manager — UI/UX Rescue Remediation Package

Date: 2026-04-26  
Surface: `HB Intel Foleon Manager`  
Target host: `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Foleon-Manager.aspx`  
Hub site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`  
Package type: audit, design, and implementation-planning package. No code is implemented by this package.

## Objective

Rescue the current Foleon Manager surface from a diagnostics-first technical interface and reposition it as a polished, role-aware, SharePoint-native Manager application.

The redesigned product must support two primary workflows:

1. **Marketing users manage homepage Foleon content lanes.**
2. **Admins manage configuration/readiness without exposing raw proof data as the primary interface.**

## Primary Finding

The backend/readiness work may be technically correct, but the current interface exposes the implementation model instead of the user workflow. The app currently asks marketing users to interpret registry, API, token, route, and path diagnostics before they can understand what to do. That makes the surface feel broken even when the architecture is functioning as designed.

## Recommended Strategy

Use a **controlled five-wave remediation**:

1. Rebuild the shell and top-level information hierarchy.
2. Redesign the Homepage Foleon Content tab around lane cards and a selected-lane workspace.
3. Redesign the Config tab as an admin console with grouped readiness, required actions, and collapsed diagnostics.
4. Polish degraded states, consent-required UX, blocked actions, and diagnostic proof handling.
5. Complete responsive/accessibility polish, tests, screenshots, package proof, and closure.

## Package Contents

| File | Purpose |
|---|---|
| `01_CURRENT_UI_UX_AUDIT.md` | Current-state audit and direct answers to required audit questions. |
| `02_SCREENSHOT_FINDINGS.md` | Screenshot-specific findings and remediation mapping. |
| `03_TARGET_INFORMATION_ARCHITECTURE.md` | Recommended app hierarchy and page structure. |
| `04_ROLE_BASED_WORKFLOWS.md` | Marketing/admin workflows and task mapping. |
| `05_VISUAL_SYSTEM_AND_COMPONENT_GUIDANCE.md` | Component, status, spacing, table, banner, and diagnostic design guidance. |
| `06_HOMEPAGE_CONTENT_TAB_REDESIGN.md` | Default tab redesign around lane status and lane management. |
| `07_CONFIG_TAB_REDESIGN.md` | Admin config tab redesign. |
| `08_DEGRADED_STATES_AND_CONSENT_REQUIRED_UX.md` | Consent, token, backend, read/write/sync blocked, empty, preview, and live-state design. |
| `09_COMPONENT_REFACTOR_PLAN.md` | Surgical component refactor plan and files likely to change. |
| `10_COPYWRITING_AND_LABELING_GUIDE.md` | Plain-language labels and action copy. |
| `11_ACCESSIBILITY_AND_RESPONSIVE_REQUIREMENTS.md` | A11y and SharePoint host-fit requirements. |
| `12_TESTING_AND_ACCEPTANCE_CRITERIA.md` | Marketing, admin, visual, technical, a11y, and regression acceptance criteria. |
| `13_RISK_REGISTER_AND_GUARDRAILS.md` | Risk register and protections. |
| `14_EXECUTION_WAVES.md` | Five implementation waves. |
| `15_PROMPT_01_UI_SHELL_AND_INFORMATION_ARCHITECTURE.md` | Local code-agent prompt for Wave 01. |
| `16_PROMPT_02_HOMEPAGE_CONTENT_TAB_REDESIGN.md` | Local code-agent prompt for Wave 02. |
| `17_PROMPT_03_CONFIG_TAB_REDESIGN.md` | Local code-agent prompt for Wave 03. |
| `18_PROMPT_04_DEGRADED_STATES_AND_DIAGNOSTICS.md` | Local code-agent prompt for Wave 04. |
| `19_PROMPT_05_FINAL_UI_POLISH_TESTS_AND_PROOF.md` | Local code-agent prompt for Wave 05. |

## Design Research Basis

Binding authority remains the internal HB UI doctrine and SPFx benchmark materials. Public references should only support areas where internal doctrine is silent.

Relevant external principles used in this package:

- Microsoft SharePoint web part design guidance: keep content authoring/editing in context and reserve property panes for configuration.
- Microsoft Fluent guidance: message bars should communicate page/surface state and warning/error messages should include a next action.
- Microsoft Fluent guidance: disabled buttons should explain why the action is unavailable.
- WAI-ARIA tabs guidance: tablist/tab/tabpanel roles, `aria-selected`, `aria-controls`, and keyboard behavior are required.
- Progressive disclosure principle: primary UI should show the decision/action; detailed diagnostic proof belongs behind accordions, drawers, or copy-proof controls.

## Execution Note

Each implementation prompt instructs the local code agent to verify current repo truth before modifying source. This planning package intentionally does not claim hosted validation or source-level closure.
