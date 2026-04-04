# 04 — App-to-Resource Dependency Map

## App-by-resource dependency matrix

Legend:
- **D** = direct runtime dependency
- **I** = indirect or documented coupling
- **—** = not materially used in current subset mapping

| Resource / dependency | Estimating | Accounting | Admin | Project Sites |
|---|---:|---:|---:|---:|
| `@hbc/auth` | D | D | D | D |
| `@hbc/ui-kit` | D | D | D | D |
| `@hbc/complexity` | D | D | D | — |
| `@hbc/shell` | D | D | D | — |
| `@hbc/query-hooks` | D | D | D | — |
| `@hbc/models` | D | D | D | — |
| `@hbc/provisioning` | D | D | D | — |
| `@hbc/session-state` | D | — | — | — |
| `@hbc/step-wizard` | D | — | — | — |
| `@hbc/workflow-handoff` | D | — | — | — |
| `@hbc/bic-next-move` | D | D | I | — |
| Project Setup Functions host | D | D | D | — |
| Admin Control Plane host | — | — | D | — |
| SignalR provisioning progress | D | I | — | — |
| SharePoint `Projects` list | I | I | I | D |
| Provisioned project sites | I | I | I | D |
| Core project-site libraries/lists | I | I | I | — |
| Entra ID project groups | I | I | I | — |
| SPFx web API permission request | D | D | — / unresolved | — |
| PnPjs SharePoint access | — | — | — | D |

## App-specific dependency notes

### Estimating
- Uses guided step-wizard flow, session-state draft persistence, Project Setup backend abstraction, and SignalR-backed provisioning visibility.
- Owns the request submission surface and clarification-return experience.

### Accounting
- Uses provisioning API client and provisioning-domain state labels/config to present controller queue and structured review detail.
- Reviewer-only surface; backend provider explicitly says no ui-review mock client.

### Admin
- Mixed dependency picture:
  - provisioning oversight page uses provisioning-domain API client and `IProvisioningStatus`
  - repo also contains a distinct Admin Control Plane model/host path for runs, config, audit, evidence, and checkpoints

### Project Sites
- Pure SharePoint-list query surface in current-state mapping.
- Uses PnPjs with SPFx context and normalized imported field mappings rather than the Functions host.

## Coupling assessment by pair

| App pair | Coupling level | Why |
|---|---|---|
| Estimating ↔ Accounting | High | Same workflow, same request model, same provisioning backend family |
| Estimating ↔ Admin | Medium-high | Same provisioning domain, plus admin recovery/oversight of estimating-originated runs |
| Accounting ↔ Admin | High | Admin acts on failures/escalations created from accounting-reviewed requests |
| Project Sites ↔ Estimating | Medium | Shared project identity/site-link/year data, but different access pattern |
| Project Sites ↔ Accounting | Low-medium | Shared project identity/site-link context, but no direct runtime coupling seen |
| Project Sites ↔ Admin | Low-medium | Shared site/project identity context, but no direct runtime coupling seen |

## Key dependency conclusion

The strongest shared-resource dependency line is **Estimating → Accounting → Admin via Project Setup / Provisioning**, not a four-way uniform dependency graph.
