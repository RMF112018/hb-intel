---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 07 — Route, Active Surface, and Label Taxonomy Contract

## Purpose

Prevent label drift between model registry, tabs, hero secondary title, active panel markers, and surface content.

## Resolved Routing Decisions

| Item | Decision |
|---|---|
| Active state storage | Keep internal React state in this phase |
| URL/hash | Do not add URL/hash routing in this phase |
| Invalid active surface | Fall back to `project-home` |
| Tab change scroll | Reset active canvas to top |
| Focus on tab change | Keep focus on selected tab |
| Preview tab visibility | Keep all MVP tabs visible |

## Approved Surface Label Table

| Surface ID | Tab Label | Hero Secondary Title | Surface Page Title |
|---|---|---|---|
| `project-home` | Project Home | Project Home | Project Home |
| `team-and-access` | Team | Team | Team & Access |
| `documents` | Documents | Documents | Documents |
| `project-readiness` | Project Readiness | Project Readiness | Project Readiness |
| `approvals` | Approvals | Approvals | Approvals |
| `external-systems` | External Platforms | External Platforms | External Platforms Launch Pad |
| `control-center-settings` | Settings | Settings | Control Center Settings |
| `site-health` | Site Health | Site Health | Site Health |

## Description Rules

Shell descriptions must be short. Long registry descriptions must not be placed directly into the hero.

Recommended maximum:

- shell description: 90 characters;
- surface body description: no hard limit, but below title/card hierarchy;
- tooltip/help copy: may carry longer explanation.

## `external-systems` Rename Rules

Do not rename the TypeScript surface id in this phase unless a broader data/model migration is explicitly approved.

Do update user-facing labels:

- tab: `External Platforms`
- hero secondary title: `External Platforms`
- surface title: `External Platforms Launch Pad`
- body copy: `Platforms hosted outside the SharePoint project site.`

## Acceptance Criteria

- No user-facing `Systems` label in this phase.
- No `Apps` tab label after remediation.
- No tab icons.
- Active tab, hero secondary title, and active panel marker agree.
- All eight surfaces still route.
