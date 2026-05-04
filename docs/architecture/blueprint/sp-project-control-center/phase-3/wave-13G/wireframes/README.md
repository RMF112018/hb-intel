# Estimating Workbench — Wireframe Markdown Package

**Generated:** 2026-05-04  
**Feature:** PCC Estimating Workbench  
**Audience:** Product owner, estimators, preconstruction leadership, PCC implementation developers, UX reviewers, and local code agents.

## Purpose

This package converts the Estimating Workbench target architecture into screen-group wireframe documentation. It is intended to drive implementation review before code work begins. The goal is to preserve the familiar workbook/bid-leveling workflow while forcing clean, validated, downstream-ready PCC data.

## Locked Decisions

| Decision | Locked Direction |
|---|---|
| MVP posture | Estimating Workbench is included in MVP scope. |
| First implementation | SharePoint/SPFx inside PCC. |
| PCC placement | Mount under `Project Readiness > Estimating Workbench`; no new top-level PCC navigation surface in MVP. |
| Cost-code hierarchy | MVP uses internal HB Cost Codes first; Sage mapping follows in a future phase. |
| Day-one templates | Commercial and Multifamily. |
| Workbook import | Template migration only; no active project workbook import in MVP. |
| Data posture | Workbook-like UX over canonical PCC estimating data records. |
| HBI posture | Grounded review/summarization only; no pricing authority, no award authority. |

## Package Contents

| Path | Purpose |
|---|---|
| `screens/01_global_shell_and_navigation.md` | Shared PCC shell, placement, navigation, tab model, and global layout rules. |
| `screens/02_entry_home_and_template_selector.md` | Estimate Home, Template Selector, My Estimates, readiness summary, and template start flow. |
| `screens/03_estimate_builder_and_cost_summary.md` | Workbook-like grid, section navigator, cost summary, GC/GR, allowances, alternates, and scratchpad behavior. |
| `screens/04_bid_leveling_and_scope_normalization.md` | Bid leveling matrix, vendor comparison, scope normalization, adjustments, clarifications, and recommendation support. |
| `screens/05_handoff_preview_freeze_and_exports.md` | Handoff readiness, downstream mapping, approval/freeze, snapshots, Excel/PDF/JSON exports. |
| `screens/06_template_admin_and_migration.md` | Commercial/Multifamily template administration and workbook-template migration review. |
| `screens/07_validation_review_and_issue_drawers.md` | Validation model, issue drawer, mapping review, override/return flows, and blocking conditions. |
| `screens/08_shared_states_responsive_and_accessibility.md` | Loading, empty, error, unauthorized, frozen, archived, responsive, keyboard, and accessibility rules. |
| `screens/09_prototype_acceptance_scorecard.md` | UX prototype acceptance criteria, review plan, and quality gates. |
| `reference/wireframe_screen_inventory.json` | Machine-readable screen inventory. |
| `reference/wireframe_component_inventory.json` | Machine-readable component inventory. |
| `reference/wireframe_review_checklist.json` | Review checklist for product/UX/developer acceptance. |
| `images/` | Generated visual wireframes used as review references. |

## Visual References Included

- `images/estimate_home_dashboard_wireframe_mockup.png`
- `images/estimate_builder_ui_wireframe_mockup.png`
- `images/grayscale_bid_leveling_dashboard_mockup.png`
- `images/wireframe_of_project_handoff_preview_dashboard.png`

## How to Use This Package

1. Review `01_global_shell_and_navigation.md` first to confirm PCC placement and route posture.
2. Review each screen group with Estimating Coordinator, Lead Estimator, active Estimator, PX, PM, and Project Accountant stakeholders.
3. Mark any screen-level deviations before implementation starts.
4. Convert the approved wireframes into implementation prompts and component tasks.
5. Do not let the code agent invent missing screens, routes, role actions, or validation states beyond this package without adding a documented amendment.

## Non-Negotiable UX Direction

- This cannot feel like a rigid SharePoint list form.
- It must feel like a governed evolution of the estimating workbook.
- Scratchpads and custom sections are allowed, but only promoted/canonical records flow downstream.
- Bid leveling is decision support only, not award authority.
- Handoff freeze is a governance checkpoint, not just an export button.
