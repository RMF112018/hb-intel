# 04 — Role-Based Workflows

## Primary Roles

| Role | Needs | Should not need |
|---|---|---|
| Marketing user | Manage lane content, preview/live status, publish readiness, display windows, placements. | Registry/list/API/token terminology. |
| Admin | Verify configuration, readiness, API approval, backend/list bindings, package governance. | Marketing editorial workflow detail unless troubleshooting. |
| IT/support escalation | Redacted diagnostic proof, package/manifest/version proof, runtime state. | Primary visual space in daily workflow. |

## Marketing Workflow

### Landing Flow

1. Land on `Homepage Foleon Content`.
2. Review three lane cards:
   - Project Spotlight
   - Company Pulse
   - Leadership Message
3. Select the lane needing attention.
4. Review selected-lane workspace:
   - current live/staged item;
   - display window;
   - placement status;
   - publish readiness;
   - blockers.
5. Use focused actions:
   - `Review lane`
   - `Edit content`
   - `Open preview`
   - `Validate`
   - `Publish`
   - `Update placement`

### Marketing User Should See

- Lane status.
- Content title.
- Homepage lane.
- Display from/through.
- Preview/live URL availability.
- Placement alignment.
- Publish readiness.
- Clear next action.

### Marketing User Should Not See by Default

- Raw GUIDs.
- API resource identifiers.
- Token acquisition messages.
- Backend URLs.
- Config source tables.
- Runtime proof JSON.
- Stack traces.

## Admin Workflow

### Config Flow

1. Open `Config`.
2. Review System Health Summary.
3. Review Required Admin Actions.
4. Expand Configuration Groups as needed.
5. Expand Diagnostics only when proof is required.
6. Copy redacted diagnostic proof for escalation.

### Admin Should See

- API approval status.
- Backend connection status.
- Registry connection status.
- SharePoint list binding status.
- Read/write/sync path readiness.
- Route authorization.
- Package/manifest/version status.
- Redacted proof.

### Admin Should Not See as Primary UI

- Raw values.
- Long ungrouped tables.
- Repeated proof arrays that are not tied to actions.

## Task-to-Component Mapping

| Task | Component |
|---|---|
| Identify lane status | Lane Summary cards |
| Review a lane | Selected Lane Workspace |
| Edit content | Editor drawer/panel |
| Update placement | Placement panel/drawer |
| Understand blockers | Publish Readiness Checklist |
| Confirm API approval | Config → System Health Summary |
| Resolve blockers | Config → Required Admin Actions |
| Escalate issue | Config → Diagnostics → Copy proof |

## Role-Aware Defaulting

- Default tab: `Homepage Foleon Content`.
- Default lane selection: first lane with `Blocked`, then `Needs setup`, then `Preview`, then `Live`, then Project Spotlight.
- Config should not open automatically unless URL/deep link or an unrecoverable app-wide blocker demands it.
