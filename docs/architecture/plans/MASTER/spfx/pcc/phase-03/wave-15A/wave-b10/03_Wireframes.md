# Phase 05 Wireframes — Grouped Tab Module Navigation

## 1. Desktop / Large Laptop Layout

```text
┌────────────────────────────────────────────────────────────────────────────────────┐
│ SharePoint Host Chrome                                                              │
├────────────────────────────────────────────────────────────────────────────────────┤
│ PCC Shell                                                                           │
│                                                                                    │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Project Hero / Command Header                                                   │ │
│ │ Project Control Center                                                          │ │
│ │ {Active Primary Tab Title}                                                       │ │
│ │ Project facts | Health/status chips | Governance cues                            │ │
│ │ Optional active module chip: Module: {Selected Module Label}                     │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                    │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Primary Tab Bar                                                                 │ │
│ │ [Project Home ▾] [Core Tools ▾] [Document Control ▾] [Estimating & Precon ▾]    │ │
│ │ [Startup & Closeout ▾] [Project Controls ▾] [Cost & Time ▾] [Systems Admin ▾]  │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                    │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ main[role="tabpanel"][data-pcc-active-surface-panel="{activeSurfaceId}"]        │ │
│ │                                                                                │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                                │ │
│ │ │ Dashboard   │ │ Dashboard   │ │ Dashboard   │                                │ │
│ │ │ Card        │ │ Card        │ │ Card        │                                │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘                                │ │
│ │                                                                                │ │
│ │ ┌───────────────────────┐ ┌───────────────────────┐                            │ │
│ │ │ Operational Card       │ │ Module Summary Card    │                            │ │
│ │ └───────────────────────┘ └───────────────────────┘                            │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Primary Tab Dropdown Open

Example: Project Controls

```text
[Project Controls ▾]
┌────────────────────────────────────────────────────┐
│ Project Controls modules                            │
├────────────────────────────────────────────────────┤
│ Project Controls                                    │
│ Future release                                      │
│ Planned for a future release. This module is not... │
├────────────────────────────────────────────────────┤
│ Permits & Inspections                               │
│ Preview                                             │
│ Preview only. Review source records before taking...│
├────────────────────────────────────────────────────┤
│ Contract & Compliance                               │
│ Future release                                      │
│ Planned for a future release. This module is not... │
├────────────────────────────────────────────────────┤
│ Risk / Issues / Decisions                           │
│ Future release                                      │
│ Planned for a future release. This module is not... │
├────────────────────────────────────────────────────┤
│ Constraints Log                                     │
│ Preview                                             │
│ Preview only. Review source records before taking...│
├────────────────────────────────────────────────────┤
│ Field Operations                                    │
│ Future release                                      │
│ Planned for a future release. This module is not... │
├────────────────────────────────────────────────────┤
│ Meeting & Communication                             │
│ Future release                                      │
│ Planned for a future release. This module is not... │
└────────────────────────────────────────────────────┘
```

### Visual Rules

- The dropdown should visually attach to the tab.
- It should not cover the SharePoint chrome.
- It may overlay the hero/bento content.
- It must use a higher local z-index than bento cards.
- It must remain within viewport bounds where practical.
- It must support internal scroll for long lists.
- Disabled/future modules must be visually subdued but readable.
- Do not use color alone to communicate state.

## 3. Active Module Context

When a module is selected:

```text
┌────────────────────────────────────────────────────────────────────┐
│ Project Controls                                                    │
│ Active module: Constraints Log                                      │
│ Preview only. Review source records before taking action.           │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ Constraints Due     │ │ Overdue Blockers   │ │ Source Confidence  │
│ 4 this week         │ │ 2 require action   │ │ Preview            │
└────────────────────┘ └────────────────────┘ └────────────────────┘
```

### Active Module Rules

- Show the selected module label, not the module ID.
- Show state label and cue.
- Do not create a blank module detail page.
- Do not scroll unexpectedly unless a matching module section exists.
- If focusing a section, use a visible heading and focus-safe target.

## 4. Document Control Tab

```text
[Document Control ▾]
┌──────────────────────────────────────────────┐
│ Document Control modules                      │
├──────────────────────────────────────────────┤
│ Primary Documents Tool                        │
│ Preview                                       │
├──────────────────────────────────────────────┤
│ Document Control Center                       │
│ Available                                     │
├──────────────────────────────────────────────┤
│ Drawing & Model Center                        │
│ Future release                                │
├──────────────────────────────────────────────┤
│ SharePoint Project Record                     │
│ Preview                                       │
├──────────────────────────────────────────────┤
│ My Project Files / OneDrive                   │
│ Preview                                       │
├──────────────────────────────────────────────┤
│ Procore Documents                             │
│ Launch-only                                   │
├──────────────────────────────────────────────┤
│ Document Crunch                               │
│ Launch-only                                   │
├──────────────────────────────────────────────┤
│ Adobe Sign                                    │
│ Launch-only                                   │
└──────────────────────────────────────────────┘
```

### Dashboard Concept

```text
Document Control
Project document, drawing, model, and source-file control surface.

┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│ Project Record        │ │ My Project Files      │ │ External Sources      │
│ Formal file source    │ │ OneDrive work area    │ │ Procore / Doc tools   │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘

┌──────────────────────┐ ┌──────────────────────┐
│ Drawing & Model       │ │ Document Health       │
│ Planned future module │ │ Source posture        │
└──────────────────────┘ └──────────────────────┘
```

## 5. Tablet Layout

```text
┌─────────────────────────────────────────────┐
│ Project Hero / Command Header               │
├─────────────────────────────────────────────┤
│ Primary Tabs: horizontal scroll allowed      │
│ [Project Home ▾][Core Tools ▾][Document...]  │
├─────────────────────────────────────────────┤
│ Dashboard cards stack into 1-2 columns       │
└─────────────────────────────────────────────┘
```

### Tablet Rules

- No horizontal page overflow.
- Tab bar may scroll horizontally.
- Dropdown width should fit viewport.
- Long menus scroll internally.

## 6. Phone / Narrow Layout

```text
┌───────────────────────────────┐
│ Project Hero                  │
├───────────────────────────────┤
│ [Project Sections ▾]          │
├───────────────────────────────┤
│ Selected: Project Controls    │
│ Module: Constraints Log       │
├───────────────────────────────┤
│ Dashboard cards stack full    │
└───────────────────────────────┘
```

### Narrow Rules

For Phase 05, the agent may preserve the current compact tab behavior if it remains usable. If current compact behavior cannot safely support eight tabs, use a production-grade compact control labeled:

```text
Project Sections
```

Do not use developer copy such as:

```text
Mobile nav placeholder
TODO compact nav
```

## 7. Disabled Module Item

```text
┌──────────────────────────────────────────┐
│ Schedule Monitor                          │
│ Future release                            │
│ Planned for a future release. This module │
│ is not active for the selected project.   │
└──────────────────────────────────────────┘
```

### Disabled Rules

- Must not look like an enabled link.
- Must not navigate.
- Must not change active module state.
- Must provide reason copy.
- Must remain readable.
- Must not be hidden from keyboard users unless an equivalent reason is visible nearby.

## 8. No Developer Copy Wireframe Audit

The rendered UI must not contain:

```text
TODO
TBD
placeholder
stub
mock
fixture
debug
dev-only
not implemented
lorem
developer
code agent
prompt
repo
test selector
internal only
```

Preferred production-grade alternatives:

| Avoid | Use |
|---|---|
| Not implemented | Planned for a future release. This module is not active for the selected project. |
| Placeholder | Preview only. Review source records before taking action. |
| Mock data | Preview information |
| TODO | Future release |
| Developer setting | Configuration |
| Internal route | Project section |
