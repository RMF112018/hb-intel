# 05 — Surface Remediation Playbooks

## 1. Purpose

This document defines surface-specific remediation targets under the PCC 100-point UI/UX Mold Breaker scorecard.

Each surface should be remediated only after shared shell, navigation, layout, card, and state contracts are stable.

## 2. Surface Completion Standard

A surface is complete only when it has:

- Source review.
- Full-page screenshot evidence.
- Above-the-fold screenshot evidence.
- Full-scroll screenshot evidence.
- Relevant state screenshots.
- Breakpoint evidence.
- Accessibility evidence.
- Interaction/affordance evidence.
- Source-of-record/data-confidence evidence where applicable.
- Mold Breaker differentiation notes.
- Scorecard pillar impact statement.
- Hard-stop review.

## 3. Project Home

### Target Role

Flagship command-center entry surface.

### Required Content Hierarchy

1. Project identity and command context.
2. Priority actions.
3. Project intelligence / status / risk posture.
4. Work center navigation.
5. Site health / readiness / approvals / documents signals.
6. Recent activity and reference context.

### Required Remediation

- Avoid passive dashboard-index behavior.
- Prioritize action and risk.
- Clarify “what matters now.”
- Avoid equal-weight card wall.
- Make HBI/command search useful, not decorative.
- Support field/tablet scanability.

### Acceptance Criteria

Supports P1, P2, P3, P4, P5, P6, P7, P8, and P9.

## 4. Project Readiness

### Target Role

Readiness command/workbench surface.

### Required Content Hierarchy

1. Readiness status.
2. Blockers and unresolved exposure.
3. Next actions.
4. Lifecycle readiness areas.
5. Permit/inspection.
6. Responsibility matrix.
7. Constraints.
8. Buyout.
9. Procore/source confidence.
10. Supporting reference context.

### Required Remediation

- Decompose overloaded bento behavior.
- Separate overview from workbench detail.
- Use progressive disclosure.
- Surface blockers and owner/action first.
- Subordinate reference/registry content.
- Clarify source confidence and read-only limitations.

### Acceptance Criteria

Supports P1, P2, P4, P5, P6, P7, P8, and P9.

## 5. Documents

### Target Role

Project record / working-file / external-document control surface.

### Required Content Hierarchy

1. Project Record as formal source-of-record lane.
2. My Project Files as working-file lane.
3. External Systems as connected reference lane.
4. Permissions/reviews.
5. Empty/source-unavailable states.

### Required Remediation

- Clarify formal record vs. working copy.
- Clarify external system boundaries.
- Avoid sparse preview appearance.
- Make review/permission responsibilities clear.
- Use state copy for source unavailable/empty lanes.

### Acceptance Criteria

Supports P1, P5, P6, P7, P8, and P9.

## 6. External Platforms

### Target Role

Read-only / metadata-aware launch and system mapping surface.

### Required Content Hierarchy

1. Surface posture: launch/read-only/metadata-only.
2. Active project links.
3. Mapping status and source health.
4. Review queue.
5. Registry.
6. Audit/history.
7. HBI lineage.

### Required Remediation

- Do not imply unavailable launch behavior.
- Do not expose inert add/edit drawers as live actions.
- Explain disabled actions.
- Clarify Procore/SharePoint/Sage/HBI boundaries.
- Reduce registry/mapping density through hierarchy.
- Make read-only posture visible before action affordances.

### Acceptance Criteria

Supports P2, P5, P6, P7, P8, and P9.

## 7. Approvals

### Target Role

Read-only approval/checkpoint visibility surface until executable workflow is authorized.

### Required Content Hierarchy

1. Queue status.
2. My approvals / relevant responsibilities.
3. Escalations.
4. Admin verification.
5. Registry/policy.
6. Decision history/deferred seams.
7. HBI boundary.

### Required Remediation

- Avoid making preview queues look like broken live workflows.
- Explain disabled approve/reject/detail actions.
- Clarify what PCC shows vs. what PCC can execute.
- Surface next step and owner for each blocked/deferred action.
- Keep policy/registry content subordinate to operational queue clarity.

### Acceptance Criteria

Supports P2, P5, P6, P8, and P9.

## 8. Team & Access

### Target Role

Team visibility and permission/access clarity surface.

### Required Content Hierarchy

1. Team roster / responsibility context.
2. Permission request path.
3. Access manager lane.
4. Restricted/unauthorized state.
5. Role/persona explanations.

### Required Remediation

- Clarify who can view, request, approve, or manage.
- Avoid punitive unauthorized states.
- Explain restricted controls.
- Ensure role/persona copy is construction-operations clear.
- Validate keyboard and focus behavior.

### Acceptance Criteria

Supports P5, P6, P8, and P9.

## 9. Site Health

### Target Role

Risk, drift, repair, and configuration health surface.

### Required Content Hierarchy

1. Health summary and severity.
2. Checks requiring attention.
3. Drift.
4. Repair requests.
5. Procore sync/repair posture.
6. Source confidence/degraded states.

### Required Remediation

- Convert passive diagnostics into risk/control hierarchy.
- Clarify severity, owner, and next step.
- Explain repair limitations if no repair runner exists.
- Avoid overwhelming diagnostic detail.
- Validate degraded/read-only posture.

### Acceptance Criteria

Supports P1, P5, P6, P7, P8, and P9.

## 10. Control Center Settings

### Target Role

Governance, scope, inheritance, and missing-configuration surface.

### Required Content Hierarchy

1. Scope overview.
2. Site/project/persona/integration settings.
3. Missing configuration.
4. Locked/inherited/overridden states.
5. Admin ownership.

### Required Remediation

- Clarify what is configurable now vs. locked/read-only.
- Clarify ownership of missing setup.
- Avoid sparse preview feeling.
- Distinguish inherited vs. overridden settings.
- Keep governance language clear and non-technical.

### Acceptance Criteria

Supports P5, P6, P8, and P9.

## 11. Surface Remediation Closeout Template

```markdown
## Surface

## Scorecard Pillars Addressed

## Files Changed

## Doctrine Issues Resolved

## Mold Breaker Issues Resolved

## UX Outcome

## Screenshots

## State Evidence

## Breakpoint Evidence

## Accessibility Evidence

## Tests

## Hard Stops Closed

## Scorecard Impact

## Residual Issues
```


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

