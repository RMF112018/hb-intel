# 03 — Content and Copy Contract

## Objective

Lock user-facing copy for the remediated PCC shell so developers do not improvise product language during implementation.

## Hero Copy

### Eyebrow

```text
PROJECT CONTROL CENTER
```

### Primary Title

```text
Project Control Center
```

### Secondary Title

Use the active surface display label.

Required active surface labels:

| Surface ID | Label |
|---|---|
| `project-home` | Project Home |
| `team-and-access` | Team |
| `documents` | Documents |
| `project-readiness` | Project Readiness |
| `approvals` | Approvals |
| `external-systems` | External Platforms |
| `control-center-settings` | Settings |
| `site-health` | Site Health |

### Surface Descriptions

Use short shell-safe descriptions. These are not full documentation blurbs.

| Surface | Shell-safe description |
|---|---|
| Project Home | Priority actions, project facts, and daily project signals. |
| Team | Project team, access posture, and permission requests. |
| Documents | SharePoint project record, working files, and external document references. |
| Project Readiness | Gate posture, blockers, evidence, and readiness signals. |
| Approvals | Approval queues, checkpoints, and review status. |
| External Platforms | Launch and mapping status for platforms hosted outside the SharePoint project site. |
| Settings | Project, site, persona, and integration configuration. |
| Site Health | Template drift, source health, and repair-readiness signals. |

## Project Fact Labels

Use these labels exactly:

```text
Location
Estimated Value
Scheduled Completion
Project Stage
```

## Excluded Hero Copy

Do not render the following in the hero:

```text
Client
Project Status
Source Confidence
Last Updated
Reference Client
Reference Location
Reference data
Live project data
Preview mode
Mock data
Fixture data
```

Notes:

- `Reference data` may remain elsewhere in the surface if required by existing read-model/source posture patterns, but it should not dominate the remediated hero.
- Do not introduce `Mock` or `Fixture` as user-facing shell text.

## Disabled Command Affordance Copy

Preferred label:

```text
Command Search — Preview
```

Helper copy:

```text
Project search and command actions are planned for a later phase.
```

Compact label:

```text
Search Preview
```

Do not use:

```text
Search this project
Search the project control center...
Ask HBI
Command Palette
```

unless those experiences are actually implemented in the shell.

## External Platform Surface Copy

### Tab Label

```text
External Platforms
```

### Surface/Page Title

```text
External Platforms Launch Pad
```

### Description

```text
Launch and mapping status for project platforms hosted outside the SharePoint project site.
```

### Supporting labels

Acceptable:

```text
Platform links
Project platform mappings
External platform status
Launch links open the source platform in a new tab.
```

Avoid:

```text
Systems
External Systems
Apps
```

Exception:

- Existing technical identifiers may remain `external-systems` until a later model migration. User-facing labels should follow this contract.

## Tone Rules

- Keep copy plainspoken and operational.
- Avoid long framework descriptions in the shell.
- Use surface pages for detailed descriptions, not the hero.
- Avoid debug/test posture language.
- Avoid overpromising live capabilities.
