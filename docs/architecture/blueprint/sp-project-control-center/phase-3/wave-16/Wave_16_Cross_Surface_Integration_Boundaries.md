# Wave 16 Cross Surface Integration Boundaries

## Integration Matrix

| Surface                 | Wave 16 relationship                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| Project Home            | Displays high-priority missing settings and unresolved policy blockers.                   |
| Priority Actions        | Surfaces settings-related required actions and stale override requests.                   |
| Approvals / Checkpoints | Owns routing/decision lifecycle for governed setting changes.                             |
| Site Health             | Consumes validation/health snapshots and raises repair requests as needed.                |
| Admin Review            | Reviews technical, policy, and validation queues for elevated settings actions.           |
| External Systems        | Provides configuration visibility and mapping correction context for launch integrations. |
| Team & Access           | Owns access/role authority inputs consumed by settings edit/request gating.               |
| HBI                     | Explains settings posture with citations and redaction rules; has no mutation authority.  |

## Boundary Rules

- Wave 16 consumes upstream authority contracts from source modules and policy lists.
- Wave 16 does not transfer ownership of those modules’ native records.
- Cross-surface actions must preserve lineage and permission boundaries.
