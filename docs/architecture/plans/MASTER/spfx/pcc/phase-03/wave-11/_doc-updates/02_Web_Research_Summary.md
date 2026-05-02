# Web Research Summary

Generated: 2026-05-02

## Research Purpose

Research RACI/RAM fundamentals, construction responsibility allocation, owner-contract responsibility mapping, decision-rights frameworks, and construction workflow assignment patterns to ensure Wave 11 becomes a flagship responsibility-control module rather than a spreadsheet clone.

## Sources Reviewed

| Source | Key finding | Wave 11 architecture implication |
|---|---|---|
| PMI — RACI Matrix / RAM | RAM/RACI clarifies roles, responsibilities, and authority; RACI is particularly important with internal and external resources; one accountable person per task avoids confusion. URL: https://www.pmi.org/learning/library/project-success-core-values-key-accountabilities-6262 | Use RACI as baseline, require one Accountable for active operational items, and validate missing/multiple accountability. |
| AIA Contract Documents — A201 Summary | A201 sets forth the rights, responsibilities, and relationships of Owner, Contractor, and Architect; the Architect performs construction-phase duties though not a party to the Owner/Contractor contract. URL: https://help.aiacontracts.com/hc/en-us/articles/4411605946515-Summary-A201-2007-General-Conditions-of-the-Contract-for-Construction | Separate contract-party responsibility from internal RACI; define Owner/Contractor/Architect/Consultant/Subcontractor obligation mapping. |
| AIA Contract Documents — Submittals | Contractors and subcontractors typically prepare/furnish submittals; architect review is limited to conformance with design concept, not finite coordination details. URL: https://learn.aiacontracts.com/articles/6538728-construction-contracting-basics-submittals/ | Do not collapse prepare/review/approve/coordinate/contract responsibility into one marker; model role-specific assignment semantics. |
| ConsensusDocs 230 | Owner/Constructor general conditions allocate responsibilities and cover scope, execution obligations, design delegation, submittals, permits/taxes, changes, payment, claims/notices, dispute resolution, defects, insurance, and more. URL: https://www.consensusdocs.org/contract/230-owner-and-constructor-agreement-cost-of-work-plus-a-fee-with-gmp/ | Owner-contract mapping must support obligation type, trigger, evidence, contract reference, commercial impact, and risk if missed. |
| CSI Project Delivery Practice Guide | Project delivery depends on moving owner intent and information through the design team to the jobsite; PDPG focuses on roles, responsibilities, lifecycle deliverables, and information flow. URL: https://www.csiresources.org/learning/practice-guides/pdpg | Organize responsibility items by lifecycle phase, responsibility domain, deliverable, and information-flow obligation. |
| Bain RAPID | RAPID clarifies decision accountabilities through Recommend, Agree, Perform, Input, Decide; one decider is preferred. URL: https://www.bain.com/insights/rapid-tool-to-clarify-decision-accountability/ | Add decision-rights overlay for decisions, approvals, exceptions, and commercial responsibility items. |
| Atlassian DACI | DACI separates Driver, Approver, Contributors, and Informed; the Approver is the one person who makes the decision. URL: https://www.atlassian.com/team-playbook/plays/daci | Add driver/approver/contributor/informed fields where RACI alone is insufficient. |
| Procore RFI Ball In Court | Procore shifts Ball In Court responsibility to RFI assignees when a Draft RFI opens; current Ball In Court users have current action responsibility. URL: https://support.procore.com/faq/who-can-be-designated-as-an-assignee-on-an-rfi | Add current-action-owner model; distinguish Accountable from current party expected to act. |
| Procore RFI Ball In Court Shift | Procore supports shifting Ball In Court to assignees or RFI Manager and sends overdue reminders to current Ball In Court users when enabled. URL: https://support.procore.com/products/online/user-guide/project-level/rfi/tutorials/shift-the-ball-in-court-on-an-rfi | Add current-action escalation and overdue notification posture. |
| Autodesk Build Submittals Permissions | Autodesk separates Responsible Contractor, Submittal Manager, Required Reviewers, Optional Reviewers, and Watchers; workflow steps move when required reviewers respond. URL: https://help.autodesk.com/cloudhelp/ENG/Build-Submittals/files/admin-submittals/Submittals_Permissions.html | Add workflow-step model, role/company/person assignment, watchers/informed groups, and required/optional reviewer semantics. |
| Autodesk Build Process Submittal Items | Autodesk workflow shows workflow bar, pending action, response tracking, references, planning dates, activity log, revisions, and close/distribute actions. URL: https://help.autodesk.com/cloudhelp/ENG/Build-Submittals/files/work-submittals/Process_Submittal.html | Add workflow table, pending action, evidence/reference links, activity log, snapshots, and formal closure posture. |


## Research Synthesis

### 1. RACI / RAM is necessary but insufficient

RACI/RAM is the right baseline because it clarifies responsibility, accountability, consultation, and information flow. It is especially useful where teams include both internal and external resources. However, the architecture must enforce one Accountable party for active operational items and must flag missing or multiple Accountables.

### 2. Construction responsibility mapping needs contract-party separation

Construction responsibility is not just an internal assignment problem. It includes Owner, Contractor, Architect, Engineer, Consultant, Subcontractor, Vendor, AHJ, insurer, and bonding responsibility contexts. Contract-party responsibility must be stored separately from RACI.

### 3. Submittal patterns show why one marker is not enough

Submittals demonstrate that a party may prepare, furnish, review, approve, coordinate, or be informed. These are different roles. The Responsibility Matrix must not collapse prepare/review/approve/coordinate/contractual-responsibility into a single spreadsheet mark.

### 4. Decision-rights overlay is required

RACI alone does not sufficiently define who decides, who recommends, who approves, who performs, and who provides input. For decision-heavy responsibility items, the module must add RAPID/DACI-inspired fields.

### 5. Ball-in-court/current action owner is required

Construction workflows use current-responsibility patterns. A current action owner may differ from the Accountable owner. Wave 11 must include current action owner, due date, escalation, and notification posture.

### 6. Workflow-step model is required for review/approval items

Autodesk and Procore patterns support multi-step review, pending-action visibility, role/company/person assignment, watchers, activity logs, and formal closure. Responsibility Matrix items classified as review, approval, decision, sign-off, or contractual obligation must support workflow steps.

## Architecture Implications

Wave 11 documentation must define:

- Template Library and version governance.
- Project Instance model.
- Import / mapping / review workflow.
- Two-axis model:
  - contract-party responsibility;
  - internal RACI responsibility.
- Decision-rights overlay.
- Contract clause / obligation reference model.
- Team & Access role resolution.
- Assignment lifecycle and handoff.
- Current action owner / ball-in-court.
- Workflow-step model.
- Notification and escalation policy.
- Criticality and exception model.
- Evidence / Document Control links.
- Matrix Health Score.
- Snapshot/export governance.
- Audit events.
- Testing / validation contract.
