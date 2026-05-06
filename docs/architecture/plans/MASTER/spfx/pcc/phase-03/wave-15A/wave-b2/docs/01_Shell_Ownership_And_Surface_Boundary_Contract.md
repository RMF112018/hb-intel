---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 01 — Shell Ownership and Surface Boundary Contract

## Purpose

Define what the PCC host shell owns versus what downstream surfaces own. This prevents context duplication, visual drift, and repeated source/reference scaffolding.

## Shell-Owned Responsibilities

The shell owns:

| Shell Responsibility | Required Behavior |
|---|---|
| PCC product frame | Primary title remains `Project Control Center` |
| Active surface identity | Secondary title reflects the active surface name |
| Mandatory project facts | location, estimated value, scheduled completion, project stage |
| Primary navigation | horizontal text-only tabs |
| Command preview | disabled/non-interactive preview affordance |
| Active panel relationship | `tabpanel` wiring and active panel ownership |
| Shell state | loading, missing profile, degraded source, reference preview, unavailable surface |
| Host fit | SharePoint-safe flow, no fake chrome, no fixed viewport ownership |
| Canvas boundary | controlled transition from shell to active surface workbench |

## Surface-Owned Responsibilities

Surfaces own:

| Surface Responsibility | Required Behavior |
|---|---|
| Surface work content | Cards, tables, lists, workflows, exceptions |
| Local filters | Surface-specific only |
| Local actions | Surface-specific only; no shell-level command duplication |
| Local empty/error states | Must not render blank above fold |
| Surface-specific status | Only if materially distinct from shell context |
| Evidence/work item details | Belong in surface cards or drawers, not shell header |

## Duplication Rules

### Do Not Repeat in Happy-Path First Views

Surfaces should not repeat:

- project name;
- full project identity;
- active surface title if already in shell;
- generic source confidence;
- last updated;
- reference/live posture;
- broad surface description.

### Allowed Local Context

A surface may show compact local context when it adds work value, such as:

- “3 approvals overdue”;
- “7 readiness blockers”;
- “2 unmapped platforms”;
- “site health degraded”;
- “permission-limited view.”

## `PccSurfaceContextHeader` Direction

The existing `PccSurfaceContextHeader` should be deprecated as a normal first-view pattern.

### Target Options

| Scenario | Treatment |
|---|---|
| Happy path | Remove repeated context header |
| Unavailable surface | Use intentional state card |
| Degraded data | Use compact local status strip |
| Evidence/audit view | Use collapsible details panel |
| Developer/reference mode | Use hidden or secondary metadata, not first-read content |

## Acceptance Criteria

- The shell establishes context once.
- Downstream surfaces do not look like nested mini-shells.
- First-view surface content starts with operational value.
- Source/reference posture is not repeated as dominant content.
- At least one test asserts no duplicate surface context header on happy-path surfaces where removed.
