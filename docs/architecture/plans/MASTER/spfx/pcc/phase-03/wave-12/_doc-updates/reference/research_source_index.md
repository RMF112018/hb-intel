# Subject-Matter Research Summary — Wave 12 Constraints Log

Generated: 2026-05-02

## Research Basis

This package updates Wave 12 into a flagship **Constraints Log — Make-Ready Constraint & Risk Exposure Center**. The product direction is based on current research and public product-pattern review from Lean Construction Institute, Oracle Primavera Cloud, PMI/NIST/ISO risk-management references, Procore Coordination Issues, Autodesk Build Issues, AACE 29R-03, and CII/AWP.

## Key Findings

### Lean / Last Planner System

LCI defines the Last Planner System around the five planning conversations: **should, can, will, did, learn**. Make-ready planning gets upcoming work into a condition where it can be done; constraint management removes roadblocks before they disrupt workflow. LCI's Constraint Log standard work defines a constraint as an item or requirement that prevents an activity from starting, advancing, or completing as planned and places constraint review within the 6-week make-ready/lookahead review cycle.

Architecture implication:

- Wave 12 must be a make-ready control system, not a static spreadsheet replacement.
- The module must support a six-week default lookahead window.
- The module must capture champion/owner, committed removal date, actual removal date, weekly review posture, and reasons for variance.

### Primavera Cloud Constraint Patterns

Oracle Primavera Cloud treats constraints as items that must be addressed before task work can begin and tracks type, status, responsible party, promised date, needed date, delivered date, and task association. It also flags constraints that are overdue or needed within the next seven days.

Architecture implication:

- Wave 12 should separate **need-by date**, **promised resolution date**, and **actual resolution date**.
- Constraints should link to task/activity IDs and lookahead windows.
- The UI should include "due in 7 days" and overdue indicators.

### Risk Assessment

PMI qualitative-risk guidance supports probability/likelihood × impact matrices, risk-response planning, owner assignment, and re-assessment. NIST SP 800-30 frames risk assessment as identifying, estimating, prioritizing, and monitoring risks so decision-makers can select appropriate responses. ISO 31000 supports risk management that is integrated, structured, customized, inclusive, dynamic, based on best available information, human-aware, and continuously improved.

Architecture implication:

- Wave 12 should include a governed 5×5 risk matrix.
- Risk scoring must include initial score, residual score, owner, response strategy, response plan, response due date, trigger condition, and review cadence.
- Risk should remain distinct from constraints: risks are uncertain future events/conditions; constraints are known blockers.

### Procore / Autodesk Product Patterns

Procore Coordination Issues provides a dashboard pattern organized by status, location progress, and ball-in-court by assignee company with click-to-filter interactions. Autodesk Build Issues provides root-cause categories, rich issue filters, due dates, locations, assignees, references, comments, and reports.

Architecture implication:

- Wave 12 should include Command Center summary cards and chart-click/filter interactions.
- Ball-in-court by company and person must be a first-class view.
- Root-cause taxonomy and lessons-learned feedback should be explicit.
- Filtering/saved views are product requirements, not nice-to-have.

### AWP / Work Packaging

CII's AWP references support construction-driven planning and work packages as a way to improve field productivity, predictability, safety, and quality.

Architecture implication:

- Constraints and risks should link to work packages, locations, trades, and planned activities.
- The target architecture should support CWP/IWP-like work-package references where future integrations exist.

### Delay / Claim Guardrail

AACE 29R-03 provides CPM forensic schedule analysis principles but is not a license for this module to make legal, entitlement, compensability, or delay-damages determinations.

Architecture implication:

- Wave 12 can flag delay exposure and link supporting references.
- Wave 12 must not perform legal/claim/delay determinations or automated notices.

## Source Index

- **LCI-LPS** — Lean Construction Institute — Last Planner System: https://leanconstruction.org/lean-topics/last-planner-system/ — Defines LPS should/can/will/did/learn conversations, make-ready planning, constraint management, PPC, reasons for variance.
- **LCI-CONSTRAINT-LOG** — Lean Construction Institute — LPS Constraint Log PDF: https://leanconstruction.org/wp-content/uploads/2022/08/8_LPS_Constraint_Log.pdf — Defines constraint as item/requirement preventing an activity from starting, advancing, or completing; defines constraint log and 6-week make-ready review posture.
- **ORACLE-TASK-CONSTRAINTS** — Oracle Primavera Cloud — Assign a Constraint to a Task: https://primavera.oraclecloud.com/help/en/user/221630.htm — Supports linking constraints to tasks and tracking status, responsible owner, promised/needed/delivered dates, overdue and needed-within-7-days indicators.
- **ORACLE-DELIVER-CONSTRAINT** — Oracle Primavera Cloud — Deliver a Constraint: https://primavera.oraclecloud.com/help/en/user/236432.htm — Supports delivered-date and delivered-status concepts for constraint resolution.
- **ORACLE-CONSTRAINT-API** — Oracle Primavera Cloud REST API — Constraint fields: https://docs.oracle.com/en/industries/construction-engineering/primavera-cloud/rest-api/op-constraint-post.html — Documents constraint types including access, design issue, documents, equipment, labor/crews, materials, QA/QC.
- **PMI-RISK-ANALYSIS** — PMI — Risk Analysis and Management: https://www.pmi.org/learning/library/risk-analysis-project-management-7070 — Supports probability, impact, risk classification, customer/contract factors, and risk response plan concepts.
- **PMI-QUALITATIVE-RISK** — PMI — Qualitative Risk Assessment: https://www.pmi.org/learning/library/qualitative-risk-assessment-cheaper-faster-3188 — Supports probability-impact matrix, 5x5 arrays, risk bands, and impact-weighted severity.
- **PMI-RISK-RESPONSE** — PMI — Project Risk Management: https://www.pmi.org/learning/library/project-risk-management-success-tool-6078 — Supports risk response strategies, monitoring, re-evaluation, watch lists, and risk register updates.
- **NIST-800-30** — NIST SP 800-30 Rev. 1 — Guide for Conducting Risk Assessments: https://www.nist.gov/publications/guide-conducting-risk-assessments — Supports identifying, estimating, prioritizing, monitoring, and maintaining risk assessments.
- **ISO-31000** — ISO 31000:2018 Risk management guidelines: https://www.iso.org/standard/65694.html — Supports integrated, structured, customized, inclusive, dynamic, best-available-information, human/cultural, continual-improvement principles.
- **PROCORE-COORDINATION-DASHBOARD** — Procore — Coordination Issues Dashboard: https://support.procore.com/products/online/user-guide/project-level/coordination-issues/tutorials/view-the-coordination-issues-dashboard — Supports dashboard charts by status, progress by location, ball-in-court by assignee company, and chart-click filtering.
- **PROCORE-IN-PROGRESS** — Procore — In-Progress status for Coordination Issues: https://www.procore.com/whats-new/track-coordination-issues-with-in-progress-status — Supports status granularity, accountability, communication, and audit trail for issue resolution lifecycle.
- **AUTODESK-ROOT-CAUSES** — Autodesk Build — Issue Root Causes: https://help.autodesk.com/cloudhelp/ENU/Build-Issues/files/configure-issues/Issues_Root_Causes.html — Supports root-cause categories, default categories coordination/design/quality/safety, and customizable root causes.
- **AUTODESK-ISSUE-FILTERS** — Autodesk Build — Search, Sort, and Filter Issues: https://help.autodesk.com/view/BUILD/ENU/?guid=Issues_Search_Filter — Supports issue filtering by ID, category, type, status, location, assignee, watchers, dates, due date, root cause, creator, custom fields.
- **AUTODESK-ISSUE-REPORTS** — Autodesk Build — Issue Reports: https://help.autodesk.com/view/BUILD/ENU/?guid=Issue_Reports — Supports report fields, XLSX/PDF export posture, grouping, sorting, locations, root causes, comments, and references.
- **CII-AWP** — Construction Industry Institute — Advanced Work Packaging Overview: https://www.construction-institute.org/awp-overview — Supports linking constraints to work packages and construction-driven planning for predictable execution.
- **CII-AWP-DESIGN-WORKFACE** — CII — Advanced Work Packaging: Design through Workface Execution: https://www.construction-institute.org/advanced-work-packaging-design-through-workface-execution — Supports work packaging through design, procurement, construction, startup, and turnover for improved productivity and predictability.
- **AACE-29R03** — AACE 29R-03 Forensic Schedule Analysis overview: https://www.29r-03.com/About29R03 — Supports guardrail that Wave 12 may flag delay exposure but must not perform forensic schedule analysis or legal/claim determinations.
