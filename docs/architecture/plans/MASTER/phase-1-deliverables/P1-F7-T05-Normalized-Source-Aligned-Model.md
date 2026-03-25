# P1-F7-T05: BambooHR Normalized Source-Aligned Model

## Normalized Source-Aligned Records

- Normalize BambooHR records into workforce-directory, employee-profile, and staffing-signal record families while preserving source identity and permission context.
- Keep webhook-driven change signals aligned to the source employee IDs and changed-field lists.

## Transition Rule

- Normalized BambooHR records remain source-auditable and feed the thin canonical workforce spine only where the shared model truly needs them.
