# PCC Shell Flagship Remediation Package

## Purpose

This package defines the remediation plan, design contract, wireframes, acceptance criteria, and implementation prompts required to bring the Project Control Center shared shell — specifically the hero, command affordance, and tab rail — toward flagship / premium UI-kit grade.

The package is scoped to the PCC shared shell and navigation layer. It does not authorize live tenant mutations, write-side workflow execution, backend route changes, Graph / PnP / SharePoint REST integration, Procore runtime work, package/manifest bumps, or dependency updates unless a later prompt explicitly expands scope with written approval.

## Product Decisions Locked by Owner

1. Hero primary title: `Project Control Center`.
2. Hero secondary title: active surface name.
3. Do not include project number in the hero because it is already visible in SharePoint chrome.
4. Mandatory hero facts:
   - location
   - estimated value
   - scheduled completion
   - project stage
5. Excluded hero facts:
   - client
   - project status
   - source confidence
   - last updated
6. External tab taxonomy:
   - Tab label: `External Platforms`
   - Page title: `External Platforms Launch Pad`
7. Icons are removed from the tab rail for this remediation pass.
8. Colors and tokens must use branded values available through the existing UI kit.
9. Command search must remain a disabled preview affordance until a later implementation phase.

## Expert Closure for Remaining Open Items

The remaining undefined design items are closed in this package as follows:

- Hero structure: a distinct command-surface hero with title, active surface, project facts, and a subordinate disabled command affordance.
- Hero visual hierarchy: first read is `Project Control Center`; second read is active surface; third read is the project fact strip.
- Hero separation: hero and tabs must be visually separated by surface containment, a navigation seam, and spacing/edge discipline.
- Tab rail active state: stronger selected text contrast, animated underline/indicator, no icon dependency, and improved hover/focus/pressed states.
- Motion: restrained 160–220ms transitions with reduced-motion safeguards.
- Responsive behavior: explicit 8-mode behavior, with fact wrapping/collapse rules and horizontally scroll-safe tab rail behavior on constrained widths.
- Accessibility: complete tablist/tab/tabpanel linkage, visible focus, keyboard path, disabled command affordance semantics, and evidence-backed closure.
- Evidence: before/after matrix, hosted edit/view captures, breakpoint captures, focus-state captures, hard-stop checklist, and scored doctrine reassessment.

## Package Contents

```text
pcc_shell_flagship_remediation_package/
├── README.md
├── 00_Objective_And_Doctrine_Baseline.md
├── 01_Hero_Target_Architecture.md
├── 02_Tab_Rail_Target_Architecture.md
├── 03_Content_And_Copy_Contract.md
├── 04_Motion_And_Interaction_Contract.md
├── 05_Breakpoint_And_Responsive_Behavior.md
├── 06_Accessibility_State_And_Evidence.md
├── 07_Implementation_Order_And_Risk_Register.md
├── wireframes/
│   ├── hero_desktop_wireframe.md
│   ├── hero_tablet_wireframe.md
│   ├── hero_phone_wireframe.md
│   └── tab_rail_wireframe.md
└── prompts/
    ├── Prompt_01_Scope_Lock_Repo_Truth_Audit.md
    ├── Prompt_02_Hero_Project_Context_And_Visual_Hierarchy.md
    ├── Prompt_03_Tab_Rail_No_Icons_Labels_And_Motion.md
    ├── Prompt_04_Disabled_Command_Affordance_And_A11y.md
    ├── Prompt_05_Responsive_Host_Fit_And_Breakpoint_Evidence.md
    ├── Prompt_06_Docs_Evidence_Index_And_Readme_Update.md
    └── Prompt_07_Final_Scoring_Closeout_And_Handoff.md
```

## Primary Implementation Goal

Transform the PCC shared shell from a flat, reference-heavy preview strip into a premium, host-safe SharePoint command surface that:

- clearly identifies the PCC experience;
- clearly identifies the active surface;
- shows only high-value project facts in the hero;
- separates the hero from the tab rail;
- uses a polished text-only tab rail with clear active/hover/focus states;
- does not mislead users into thinking command search is operational;
- remains container-aware across the existing 8-mode PCC breakpoint policy;
- improves doctrine scoring without claiming final 56/56 until evidence supports it.
