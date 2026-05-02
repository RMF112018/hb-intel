# Research Pattern Reference — Wave 12 Constraints Log

## Research Status

Live web search was not available in the package-generation environment. This file provides structured product-pattern input and public-source starting points that the local code agent or fresh reviewer must refresh with live web search before implementation if web access is available.

Do not treat this as a mandate to clone external tools. Use it to shape a flagship PCC-native Constraints Log.

## Themes to Preserve

### Lean / Last Planner / Make-Ready Planning

Implementation implications:

- Constraints must be tied to planned work, need-by dates, responsible parties, promised dates, and reliable commitment posture.
- Make-ready board should focus on unblockability: what is preventing planned work from being sound?
- Weekly Huddle mode should support rapid review of open, due-soon, overdue, and high-exposure constraints.
- Reasons for variance should feed root-cause and lessons-learned surfaces.

Public-source starting points to refresh:

- Lean Construction Institute — Last Planner System: https://leanconstruction.org/lean-topics/last-planner-system/
- Lean Construction Institute — Make Ready Planning: https://leanconstruction.org/lean-topics/make-ready-planning/
- Lean Construction Institute — Percent Plan Complete and reasons for variance: https://leanconstruction.org/lean-topics/percent-plan-complete/

### Construction Constraints Management

Implementation implications:

- Each constraint should have a type/category, description, source module, responsible party, current action owner / BIC, need-by date, promised date, due date, completion date, aging, status, references, and notes.
- Use due-within-window and overdue indicators.
- Separate known blockers from future risks and active issues.
- Distinguish constraint closure from validation of removal from planned-work path.

Public-source starting points to refresh:

- Project Production Institute / make-ready concepts: https://projectproduction.org/
- Construction Industry Institute resources on constraint analysis and work packaging: https://www.construction-institute.org/
- Oracle Primavera Cloud task constraints / project controls documentation: https://docs.oracle.com/en/cloud/saas/primavera-cloud/

### Risk Assessment Matrix

Implementation implications:

- Use a 5x5 likelihood x impact matrix.
- Preserve initial and residual risk scores.
- Use max-impact governing dimension.
- Use severity bands with escalation requirements.
- Overrides should raise severity only and require a documented rationale.

Public-source starting points to refresh:

- ISO 31000 risk-management overview: https://www.iso.org/iso-31000-risk-management.html
- PMI risk management practice resources: https://www.pmi.org/learning/library/risk-management-projects-6090
- NIST risk matrix / qualitative risk concepts: https://csrc.nist.gov/

### Construction Risk and Exposure Dimensions

Implementation implications:

- Include schedule, cost, safety, quality, contract/compliance, client/owner impact, logistics/access, and reputation/executive visibility.
- Delay exposure and change exposure are review flags only, not determinations.
- Executive summary should distinguish operational exposure from legal conclusions.

Public-source starting points to refresh:

- AACE International Recommended Practices index: https://web.aacei.org/resources/publications/recommended-practices
- AACE delay-analysis materials should be boundary context only; do not automate forensic conclusions.
- OSHA safety risk posture should inform severity overrides only, not regulatory conclusions: https://www.osha.gov/

### Comparable Product Patterns

Implementation implications:

- Ball-in-court/current action owner vocabulary is valuable.
- Assignment, due date, root cause, status, impact, and attachment/link references should be surfaced in detail panel and log table.
- Product should remain PCC-native and not clone or require external-system runtime dependencies.

Public-source starting points to refresh:

- Procore support — Ball In Court / responsible contractor / issues patterns: https://support.procore.com/
- Autodesk Construction Cloud / Build issues documentation: https://help.autodesk.com/view/BUILD/
- Oracle Primavera Cloud documentation: https://docs.oracle.com/en/cloud/saas/primavera-cloud/

### Advanced Work Packaging / WorkFace Planning Readiness

Implementation implications:

- Constraints should support work-package readiness posture.
- Link blockers to planned work windows, crews/trades, required prerequisites, and release criteria.
- Provide a readiness-oriented view that helps determine whether work can proceed.

Public-source starting points to refresh:

- CII Advanced Work Packaging resources: https://www.construction-institute.org/resources/knowledgebase/knowledge-areas/advanced-work-packaging
- CII WorkFace Planning resources: https://www.construction-institute.org/

### UX / Product Patterns

Implementation implications:

- Command Center: summarized exposure, aging, due-soon, overdue, executive items.
- Make-Ready Board: grouped by status, due window, responsible party, or work package.
- Risk Matrix: heat map with drill-down to items.
- Constraint Exposure Matrix: urgency x impact heat map.
- Log Table: dense, filterable, export-ready review surface.
- Detail Drawer: single item review, source lineage, owner/BIC, dates, scoring, references, notes, status transitions.
- Weekly Huddle: compressed action review mode for due-soon/overdue/high-exposure blockers.
- Root Cause & Lessons Learned: trends by category, owner, reason for variance, and closure quality.
- Executive Exposure Summary: concise readout without legal/claim conclusions.

Public-source starting points to refresh:

- Nielsen Norman Group dashboard and data-table usability resources: https://www.nngroup.com/topic/dashboards/
- Microsoft Fluent UI details list / command patterns: https://developer.microsoft.com/en-us/fluentui
- Atlassian incident/postmortem lessons-learned patterns: https://www.atlassian.com/incident-management/postmortem
