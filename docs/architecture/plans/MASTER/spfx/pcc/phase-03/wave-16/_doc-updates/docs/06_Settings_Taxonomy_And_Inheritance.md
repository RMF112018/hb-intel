# 06 — Settings Taxonomy and Inheritance

## Scopes
`tenant-global`, `hbcentral-global`, `project-site`, `project-module`, `project-role`, `user-preference`, `feature-flag`, `integration-policy`, `security-sensitive`, `read-only-derived`.

## Inheritance
1. hard security policy;
2. tenant/global policy;
3. HBCentral default;
4. environment policy;
5. project approved override;
6. module approved override;
7. role/persona filter;
8. user preference if allowed;
9. source-derived state.

## Override rules
Overrides are explicit, effective-dated, auditable, approval-routed where required, ignored when expired, and blocked when invalid or policy-prohibited.
