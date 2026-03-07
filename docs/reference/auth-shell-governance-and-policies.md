# Auth/Shell Governance and Policy Reference

- **Status:** Canonical operational reference
- **Date:** 2026-03-06

## Role Mapping and Permission Model

Role mapping is centralized and provider-agnostic. Permission evaluation is centralized
and deterministic, using default-deny for unregistered protected features.

Evaluation inputs:

1. base role grants
2. default feature grants
3. explicit overrides (grant/deny + expiration)
4. emergency grants (if active)

## Override Governance and Admin Process

Phase 5 admin governance supports:

- request submission
- approval/rejection
- expiration defaults
- renewal request and re-approval
- role-change review flagging
- emergency review queue

Admin scope is intentionally minimal but production-usable.

## Emergency Access Policy

Emergency path requires:

- authorized requester role
- mandatory detailed reason
- short expiration
- explicit boundary checks so emergency path does not replace normal workflow
- mandatory post-action review flagging

## Audit and Retention Policy

Structured audit trail captures key auth/access/admin events with metadata for
traceability and troubleshooting.

Retention defaults:

- active history window: 180 days
- archived strategy: retained for future review
- event-tier retention specialization: deferred beyond Phase 5

## Shell-Status Hierarchy Policy

Shell status is centrally derived with fixed priority to prevent conflicting messages.
Actions are limited to approved high-value paths by status kind.

## Degraded Mode Policy

Controlled degraded mode is allowed only when eligibility gates pass:

- impaired lifecycle state
- recently validated session
- trusted/fresh section state available

Sensitive actions remain blocked in degraded mode until safe recovery.

## SPFx Boundary Policy

SPFx is a host container + identity context seam only.
HB Intel shell remains composition authority.

Approved host seams are limited to:

- container metadata
- identity reference handoff
- host signal callbacks (`theme`, `resize`, `location`)

## Protected Feature Registration Policy

Protected features must register through shared shell contract metadata before access
or visibility checks. Unregistered features remain denied by policy.

## Traceability

- Plans: PH5.4, PH5.6, PH5.7, PH5.9, PH5.11, PH5.12, PH5.13, PH5.14
- ADRs: ADR-0057, ADR-0059, ADR-0060, ADR-0062, ADR-0064, ADR-0065, ADR-0066, ADR-0067
