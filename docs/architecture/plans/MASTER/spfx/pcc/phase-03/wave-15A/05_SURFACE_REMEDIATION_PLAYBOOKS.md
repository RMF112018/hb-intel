# 05 — Surface Remediation Playbooks

## 1. Purpose

This file defines the required remediation direction for each major PCC surface. Surface work must begin only after shared shell, layout, card, and state primitives are corrected.

## 2. Surface Completion Standard

A surface is complete only when it satisfies all of the following:

- Uses shared project context.
- Uses the standardized surface header.
- Has a clear primary operational purpose.
- Has one dominant command/action/status region.
- Uses card tiers correctly.
- Handles live/preview/read-only/degraded/unavailable states.
- Avoids generic placeholder dominance.
- Works in SharePoint tenant screenshots.
- Has tests or documented validation.
- Is scored against relevant scorecard categories.

---

# 3. Project Home

## Target Role

Daily project command center.

## Required Content Hierarchy

1. Project command summary.
2. Priority Actions / required decisions.
3. Project health/readiness/site/document/access rollups.
4. Secondary operational detail.
5. Reference metadata.

## Required Remediation

- Elevate Priority Actions.
- Add “needs attention” summary.
- Strengthen severity hierarchy.
- Make project health posture obvious.
- Reduce prototype-like metric/card equality.

## Acceptance Criteria

- User knows the top project issues without scrolling.
- Project Home establishes the PCC product standard.

---

# 4. Team & Access

## Target Role

Access posture, project team membership, role coverage, pending requests, permission templates, and audit history.

## Required Content Hierarchy

1. Access posture summary.
2. Current project team and role coverage.
3. Pending access requests.
4. Permission template status.
5. Access exceptions and audit history.

## Required Remediation

- Fix narrow-column collapse.
- Replace preview-only skinny card with full-width operational layout.
- Add role/persona coverage.
- Add pending request and access risk sections.
- Explain disabled invite/action behavior.

## Acceptance Criteria

- Surface is usable at all required widths.
- User can answer:
  - Who has access?
  - Who needs access?
  - What role coverage is missing?
  - Are permission templates healthy?
  - What is disabled in preview?

---

# 5. Documents

## Target Role

Formal Project Record and working-file control center.

## Required Content Hierarchy

1. Document control posture.
2. Project Record lane.
3. My Project Files lane.
4. External document systems lane.
5. Binding health / recent activity / policy notes.

## Required Remediation

- Make Project Record the dominant source of truth.
- Clearly distinguish working files from formal project record.
- Replace confusing disabled buttons with preview-safe action explanations.
- Show source health and binding state.
- Add document risk callouts.

## Acceptance Criteria

- User understands formal record versus working files.
- Each source has status, purpose, and next action.

---

# 6. Project Readiness

## Target Role

Lifecycle readiness, blockers, evidence confidence, and gate posture.

## Required Content Hierarchy

1. Readiness posture.
2. Top blockers.
3. Lifecycle gate map.
4. Evidence/source confidence.
5. Gate detail and reference data.

## Required Remediation

- Make blocked/at-risk status visually dominant.
- Prioritize blockers.
- Convert lifecycle cards into guided map.
- Clarify evidence confidence.
- Add source dependency language.

## Acceptance Criteria

- User can tell whether the project can proceed and why.

---

# 7. Site Health

## Target Role

Project site health, drift, security, sync, and repair posture.

## Required Content Hierarchy

1. Site health top risk.
2. Required repair/acknowledgement action.
3. Checks list.
4. Drift indicators.
5. Scanner metadata and history.

## Required Remediation

- Elevate security risk.
- Highlight broken inheritance and sensitive-library issues.
- Add repair workflow state.
- Use semantic severity treatment.
- Explain consequence of high-risk findings.

## Acceptance Criteria

- Highest risk and next repair step are visible above the fold.

---

# 8. Control Center Settings

## Target Role

Governance configuration across project, site, persona, and integration scopes.

## Required Content Hierarchy

1. Configuration readiness.
2. Settings scope cards.
3. Missing configuration queue.
4. Locked/editable/preview-only distinction.
5. Policy and audit references.

## Required Remediation

- Add ownership/responsible role.
- Convert settings lanes into governance cards.
- Clarify locked versus editable.
- Present missing configuration as readiness work, not backlog clutter.

## Acceptance Criteria

- User understands what is configured, missing, locked, and preview-only.

---

# 9. Approvals

## Target Role

Approval checkpoint and decision queue.

## Required Content Hierarchy

1. Approval posture summary.
2. Pending/overdue/blocked/returned approval queue.
3. Checkpoint categories.
4. Decision history.
5. Preview limitation statement.

## Required Remediation

- Remove primary reliance on unavailable placeholder.
- Create preview-safe queue content.
- Add owner, aging, linked module, and consequence.
- Replace disabled approve/reject confusion with view-only preview actions.

## Acceptance Criteria

- Surface demonstrates approval workflow intent even when execution is disabled.

---

# 10. External Systems

## Target Role

Integration visibility, launch paths, mapping state, and system-of-record clarity.

## Required Content Hierarchy

1. Integration health summary.
2. MVP-required systems.
3. Optional/future systems.
4. Mapping diagnostics and ownership.

## Required Remediation

- Replace repeated unavailable cards with system-specific status cards.
- Show purpose, data direction, mapping state, availability, and next action.
- Group by operational purpose.
- Keep preview limitation secondary.

## Acceptance Criteria

- User understands why each system matters and what is currently connected, preview-only, or unavailable.

---

# 11. Surface Remediation Closeout Template

Each surface remediation closeout must include:

```markdown
## Surface
[Name]

## Files Changed
- [path]

## Doctrine Issues Resolved
- [issue]

## UX Outcome
[Plain-English operational outcome]

## Screenshots
- before:
- after:
- tenant published:
- tenant edit mode:

## Tests
- [command/result]

## Scorecard Impact
- category:
- previous:
- new:

## Residual Issues
- [none or itemized]
```
