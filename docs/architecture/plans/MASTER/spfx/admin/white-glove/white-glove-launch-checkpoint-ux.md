# White-Glove Package Launch and Checkpoint UX

## Purpose

Document the SPFx operator console pages for white-glove package launch workflow and checkpoint management.

## Pages

### Package Launch (`/white-glove/launch`)

Multi-step workflow with state-based navigation:

| Step | Content | Validation |
|------|---------|-----------|
| 1. Employee Lookup | UPN input, identity resolution | Employee found and account enabled |
| 2. Package Selection | 6 package family cards with device slot counts | Family selected |
| 3. Device Details | Per-slot serial number (required), asset tag, hostname (platform-specific) | All serial numbers provided |
| 4. Preflight Summary | Blocked/warning conditions, checkpoint expectations | No blocking errors |
| 5. Confirm Launch | Review all inputs, launch warning, launch button | Operator confirms |

**Platform-specific intake:**
- Windows desktop/laptop: serial number + asset tag + hostname
- macOS laptop: serial number + asset tag + hostname
- iPhone: serial number + asset tag
- iPad: serial number + asset tag

**Checkpoint expectations shown before launch:**
- Connector readiness validation
- Technician pre-provisioning (Windows devices with Autopilot)
- NinjaOne downstream standardization
- Recovery checkpoint on failure

**Launch action:** `POST /api/admin/white-glove/runs` with typed `ILaunchRequest`.

### Checkpoints (`/white-glove/checkpoints`)

Active checkpoint management:

- Fetches package runs with `status=AwaitingCheckpoint`
- Groups checkpoints by package run and device
- Shows checkpoint type, label, creation time
- Approve/reject actions per checkpoint → `POST /api/admin/white-glove/devices/{id}/checkpoint/{cpId}`
- Empty state with coaching tip when no active checkpoints

## Routing

| Lane ID | Path | Label | Order |
|---------|------|-------|-------|
| `white-glove-launch` | `/white-glove/launch` | WG Launch | 11 |
| `white-glove-checkpoints` | `/white-glove/checkpoints` | WG Checkpoints | 12 |

## Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useWhiteGloveLaunch` | `apps/admin/src/hooks/useWhiteGloveLaunch.ts` | Employee lookup, package run launch |
| `useWhiteGloveCheckpoints` | `apps/admin/src/hooks/useWhiteGloveCheckpoints.ts` | Active checkpoints, resolve actions |

## Package families preserved

All six families displayed with correct device slots from `WHITE_GLOVE_PACKAGE_CATALOG`:
1. VDC Personnel (iPhone, iPad, Alienware desktop)
2. Estimating Personnel (iPhone, Alienware laptop)
3. Office Personnel (HP or Dell laptop)
4. Operations Management (HP or Dell laptop, iPhone)
5. Operations Management alt (MacBook Pro, iPhone)
6. Operations Field Staff (iPhone, iPad, HP or Dell laptop)

## Cross-references

- [Connections/readiness UX](white-glove-connections-readiness-ux.md)
- [Domain model](../../../../../reference/white-glove/white-glove-domain-model.md)
- [Run spine](../../../../../reference/white-glove/white-glove-run-spine.md)
