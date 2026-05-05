# Package Manifest — PCC Phase 3 Wave 15A / Wave B Shell, Host Fit, and Navigation Remediation

## Package Root

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-B-shell-host-navigation-remediation/
```

## Purpose

This package converts the Wave B audit objective into a developer-ready local code-agent execution package. It is limited to the Project Control Center shared shell, SharePoint host fit, navigation / information architecture, project-context band, command/search scope, scroll ownership, accessibility/focus behavior, and cross-surface shell validation.

Wave B is foundational. It must not claim final 56/56 doctrine readiness by itself.

## Required Files

| Path | Purpose |
| --- | --- |
| `README.md` | Entry point, execution order, and closeout posture. |
| `docs/00_WAVE_B_REPO_TRUTH_AUDIT_FINDINGS.md` | Audit findings grounded in current repo truth. |
| `docs/01_SHELL_HOST_NAV_DOCTRINE_MATRIX.md` | Wave B-specific doctrine and scorecard criteria. |
| `docs/02_CURRENT_SHELL_HOST_NAV_INVENTORY.md` | Current shared-frame inventory and source ownership. |
| `docs/03_TARGET_SHELL_HOST_NAV_ARCHITECTURE.md` | Target Wave B architecture. |
| `docs/04_IMPLEMENTATION_REQUIREMENTS.md` | Specific implementation requirements and constraints. |
| `docs/05_TEST_AND_VALIDATION_PLAN.md` | Tests, static checks, and local validation gates. |
| `docs/06_SCREENSHOT_AND_TENANT_EVIDENCE_PLAN.md` | Browser and tenant screenshot evidence plan. |
| `docs/07_RISK_DECISION_AND_DEFERMENT_LOG.md` | Known risks, decisions, and allowed deferrals. |
| `prompts/Prompt_01_Shell_Host_Nav_Scope_Lock_And_File_Map.md` | First local-agent prompt; scope/file-map only. |
| `prompts/Prompt_02_Shell_Frame_And_Project_Context_Band.md` | Shell frame and project-context implementation prompt. |
| `prompts/Prompt_03_Navigation_Information_Architecture_And_State_Cues.md` | Operational nav grouping/state-cue implementation prompt. |
| `prompts/Prompt_04_Host_Fit_Content_Wrapper_And_Scroll_Behavior.md` | Host-fit, overflow, scroll, and container prompt. |
| `prompts/Prompt_05_Accessibility_Focus_And_Keyboard_Navigation.md` | Accessibility and keyboard prompt. |
| `prompts/Prompt_06_Surface_Route_Validation_And_Cross_Surface_Smoke_Tests.md` | Cross-surface routing and regression prompt. |
| `prompts/Prompt_07_Wave_B_Closeout_Evidence_And_Handoff.md` | Closeout and Wave C handoff prompt. |
| `artifacts/shell-nav-scorecard-template.md` | Scorecard template for Wave B. |
| `artifacts/tenant-screenshot-index-template.md` | Tenant screenshot index template. |
| `artifacts/wave-B-agent-closeout-template.md` | Agent closeout template. |

## Execution Order

Run prompts in numeric order. Prompt 01 is non-runtime and must produce the exact source file map, screenshot plan, and stop-condition check before implementation begins.

## Non-Scope

- No backend/API changes.
- No surface-level redesign except validation seams required by shell/nav/host fit.
- No Graph/PnP/SharePoint REST runtime expansion.
- No final 56/56 closeout claim.
- No package/manifest scope unless repo truth shows shell host fit is blocked by packaging identity or hosted container behavior.

## Closeout Standard

Wave B may close only when source changes, tests, screenshots, keyboard/focus evidence, all-surface routing evidence, and tenant-hosted or explicitly logged tenant-gap evidence are documented.
