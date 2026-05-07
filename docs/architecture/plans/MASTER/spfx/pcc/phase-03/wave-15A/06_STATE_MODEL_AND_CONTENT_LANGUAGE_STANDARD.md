# 06 — State Model and Content Language Standard

## 1. Purpose

This document defines Wave 15A state and content language rules under the PCC 100-point scorecard.

The state model is central to:

- Workflow clarity.
- Source confidence.
- Read-only/preview honesty.
- False-affordance prevention.
- Phase 4 readiness.

## 2. Content Principle

Every state must tell the user:

1. What condition exists.
2. Why it matters.
3. Who or what owns it.
4. What happens next.
5. Whether the user can act now.

## 3. Forbidden Primary User-Facing Language

Avoid using these as primary user-facing state labels unless paired with operational explanation:

- Mock
- Stub
- Placeholder
- TODO
- Future
- Demo only
- Fixture
- Disabled
- Not wired
- Not implemented
- Coming soon
- System unavailable
- Unknown
- N/A

These terms may appear in developer diagnostics, but not as the primary user-facing explanation.

## 4. Approved User-Facing Replacements

| Internal Meaning | Preferred User-Facing Language |
|---|---|
| Mock / fixture | Preview data |
| Stub / placeholder | Preview capability |
| Not wired | Read-only in this phase |
| Disabled | Action unavailable |
| Future | Planned capability |
| Missing integration | Source connection required |
| Error | Unable to load |
| Degraded | Limited data available |
| Unauthorized | Access required |
| Missing config | Setup required |
| Stale | Data may be out of date |

## 5. Required State Taxonomy

### Live

Use when the feature is production-live for the current scope.

Must show:

- Current status.
- Data/source if relevant.
- Action path if applicable.

### Preview

Use when content demonstrates future or planned behavior.

Must show:

- Preview posture.
- What is being demonstrated.
- What is not live.
- Next phase or owner if known.

### Read-Only

Use when the surface displays information but does not mutate records.

Must show:

- Read-only label.
- Source of displayed data.
- Where edits occur, if applicable.
- Why PCC is not executing the action.

### Deferred

Use when capability is intentionally out of current scope.

Must show:

- Deferred capability.
- Reason or phase boundary.
- Owner or future wave if known.
- Safe next step.

### Unavailable

Use when data/capability cannot be reached.

Must show:

- What is unavailable.
- Whether this is temporary or setup-related.
- Recovery or next step.

### Setup Required

Use when configuration is incomplete.

Must show:

- Missing setup item.
- Owner.
- Impact.
- Next step.

### Degraded

Use when partial data/function is available.

Must show:

- What is limited.
- What remains reliable.
- What the user should not assume.
- Refresh/recovery behavior if applicable.

### Blocked

Use when progress is blocked by a known condition.

Must show:

- Blocking condition.
- Owner.
- Required action.
- Downstream impact.

### Error

Use for failure states.

Must show:

- What failed.
- Recovery path.
- Whether data is safe.
- Whether to retry or contact owner/support.

### Empty

Use when no records exist or filters yield no results.

Must show:

- Why the area is empty.
- Whether this is good, neutral, or requires setup.
- Next action if applicable.

### Unauthorized / No Access

Use when user permissions prevent access.

Must show:

- Access limitation.
- Request path.
- Owner/approver if known.
- Avoid punitive tone.

### Stale Data

Use when recency matters.

Must show:

- Last updated time if available.
- Source.
- Whether stale data can still be used.
- Refresh/reconnect path.

## 6. State Component Fields

A standard PCC state component should support:

- State label.
- Severity.
- Title.
- Explanation.
- Impact.
- Owner/system.
- Next step.
- Primary or secondary action, if safe.
- Source.
- Timestamp/freshness.
- ARIA status/alert behavior.

## 7. Disabled Control Standard

A disabled control must never appear unexplained.

Every disabled control should have one of:

- Inline helper copy.
- Tooltip/popover.
- Adjacent state card.
- Disabled reason text.
- Next-step link or owner reference.

Required disabled-control explanation:

```text
This action is unavailable because [reason]. [Owner/system] must [next step] before this can be completed in PCC.
```

## 8. Surface-Level State Rules

### Project Home

State language should prioritize project status, priority actions, and configuration gaps.

### Project Readiness

State language should prioritize blockers, owner, and next action.

### Documents

State language should distinguish Project Record, My Project Files, and External Systems.

### External Platforms

State language should distinguish metadata-only, launch unavailable, source health, mapping, and registry states.

### Approvals

State language should distinguish preview queue, read-only workflow, disabled decision controls, and HBI no-authority boundaries.

### Team & Access

State language should distinguish viewer, requester, manager, unauthorized, and restricted action states.

### Site Health

State language should distinguish health check, drift, degraded, repair request, and no-runner conditions.

### Settings

State language should distinguish inherited, locked, editable, missing config, and admin-owned states.

## 9. Diagnostics Placement

Diagnostics must not dominate the user surface.

Use diagnostics for:

- Admin visibility.
- Development confidence.
- Evidence and validation.
- Source confidence where operationally useful.

Do not expose raw system seams where user action is not improved.

## 10. Acceptance Criteria

State model remediation is complete when:

- Every major state has evidence.
- Preview/read-only/deferred states are unmistakable.
- Disabled controls explain reason and next step.
- Source-of-record boundaries are clear.
- HBI authority boundaries are clear.
- No false-affordance hard stop remains.
- No state-model hard stop remains.


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

