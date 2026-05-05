# 06 — Screenshot and Tenant Evidence Plan

## Objective

Define the visual and tenant evidence required to close Wave B.

## Evidence Folder Recommendation

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-B/evidence/
```

If the repo already has a Wave 15A evidence convention, follow it and update this package during Prompt 01.

## Required Screenshot Matrix

| Evidence ID | Surface | Mode | Width / Host | Required? | Notes |
| --- | --- | --- | --- | --- | --- |
| WB-SS-001 | Project Home | Desktop wide | Local browser | Yes | Before/after shell hierarchy. |
| WB-SS-002 | Project Home | Constrained desktop | SharePoint-like local container | Yes | Host-fit approximation. |
| WB-SS-003 | Project Home | Tablet landscape | Local browser/container | Yes | Rail icon/top behavior. |
| WB-SS-004 | Project Home | Tablet portrait | Local browser/container | Yes | Top strip / wrapped header. |
| WB-SS-005 | Project Home | Phone/narrow | Local browser/container | Yes | Navigation remains reachable. |
| WB-SS-006 | Team & Access | Desktop/constrained | Local browser | Yes | Known Wave A risk surface. |
| WB-SS-007 | Documents | Desktop/constrained | Local browser | Yes | External/internal lane still fits shell. |
| WB-SS-008 | Project Readiness | Desktop/constrained | Local browser | Yes | Larger operational surface. |
| WB-SS-009 | Approvals | Desktop/constrained | Local browser | Yes | Preview-safe shell. |
| WB-SS-010 | External Systems | Desktop/constrained | Local browser | Yes | Connected Systems group active state. |
| WB-SS-011 | Control Center Settings | Desktop/constrained | Local browser | Yes | Governance group active state. |
| WB-SS-012 | Site Health | Desktop/constrained | Local browser | Yes | Governance/status cues. |
| WB-SS-013 | Project Home | SharePoint published | Tenant-hosted | Required if tenant access available | Must show host chrome. |
| WB-SS-014 | Project Home | SharePoint edit | Tenant-hosted | Required if tenant access available | Must show edit-mode constraints. |
| WB-SS-015 | Any surface with focus | Keyboard focus | Local or tenant | Yes | Focus-visible proof. |

## Screenshot Naming Convention

```text
WB-SS-001_project-home_desktop-wide_before.png
WB-SS-001_project-home_desktop-wide_after.png
WB-SS-013_project-home_tenant-published_after.png
```

## Required Screenshot Index Fields

- Evidence ID.
- File path.
- Surface.
- Mode/container.
- Before/after.
- Observed host-fit result.
- Observed nav result.
- Observed project-context result.
- Residual issue, if any.

## Tenant Evidence Gap Handling

If tenant-hosted screenshots cannot be captured, closeout must include:

- exact reason;
- who owns tenant capture;
- required future command/build artifact;
- whether Wave B can proceed to Wave C with local-only evidence;
- explicit statement that final 56/56 cannot close until tenant evidence is produced.
