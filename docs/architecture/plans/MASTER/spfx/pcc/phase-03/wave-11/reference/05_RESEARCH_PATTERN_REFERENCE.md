# 05 — Research Pattern Reference

This reference summarizes current web research performed for this v2 package. Prompt 01 must re-open or re-search these sources locally where web access is available, then record the sources used in its implementation-readiness report.

| Topic | Source | URL | Implementation Use |
|---|---|---|---|
| RACI / RAM fundamentals | Project-Management.com — RACI Matrix: Responsibility Assignment Matrix Guide | https://project-management.com/understanding-responsibility-assignment-matrix-raci-matrix/ | Use as broad RACI vocabulary input only; prefer repo/Wave 11 docs for governing semantics. |
| AIA A201 role allocation | AIA Contract Documents — Summary: A201–2017 General Conditions | https://help.aiacontracts.com/hc/en-us/articles/1500010259162 | Use to reinforce owner/contractor/architect relationship separation; do not interpret project-specific contracts. |
| AIA submittal roles | AIA Contract Documents — Construction Contracting Basics: Submittals | https://learn.aiacontracts.com/articles/6538728-construction-contracting-basics-submittals/ | Use to distinguish prepare/furnish/coordinate/review/approve concepts; no legal advice. |
| ConsensusDocs contract allocation | ConsensusDocs 230 owner-constructor GMP agreement overview | https://www.consensusdocs.org/contract/230-owner-and-constructor-agreement-cost-of-work-plus-a-fee-with-gmp/ | Use to remind implementation that contract-party obligations are contract-source references, not app-created obligations. |
| CSI delivery roles / information flow | CSI Project Delivery Practice Guide | https://www.csiresources.org/learning/practice-guides/pdpg | Use to inform domain taxonomy and lifecycle information-flow posture. |
| Decision rights | Bain RAPID Decision Making Framework | https://www.bain.com/insights/rapid-tool-to-clarify-decision-accountability/ | Use to inform decision-driver/recommender/decider/performer fields where RACI is insufficient. |
| Decision rights | Atlassian DACI Team Playbook | https://www.atlassian.com/team-playbook/plays/daci | Use to reinforce one approver/decision maker, driver, contributors, informed fields. |
| Ball-in-court / current action owner | Procore — Who can be designated as an Assignee on an RFI? | https://support.procore.com/faq/who-can-be-designated-as-an-assignee-on-an-rfi | Use to model current-action-owner/permission/role-resolution concepts without Procore runtime integration. |
| Ball-in-court / current action owner | Procore — Shift the Ball In Court on an RFI | https://support.procore.com/products/online/user-guide/project-level/rfi/tutorials/shift-the-ball-in-court-on-an-rfi | Use to model handoff/current action transitions and overdue reminders without enabling runtime writes. |
| Workflow participants | Autodesk Build — Submittals Permissions | https://help.autodesk.com/cloudhelp/ENG/Build-Submittals/files/admin-submittals/Submittals_Permissions.html | Use to model responsible contractor, submittal manager, reviewer, role/company assignment concepts. |
| Workflow steps / pending action | Autodesk Build — Process Submittal Items | https://help.autodesk.com/cloudhelp/ENG/Build-Submittals/files/work-submittals/Process_Submittal.html | Use for workflow table, pending-action, responded/pending reviewers, close/distribute concepts; keep Wave 11 read-only. |
| Notifications | Autodesk Build — Submittals Notifications | https://help.autodesk.com/cloudhelp/ENU/Build-Submittals/files/admin-submittals/Submittals_Notifications.html | Use for notification trigger vocabulary; implementation must not send notifications unless existing safe framework permits preview only. |
| Git status / working tree validation | Git documentation — git status | https://git-scm.com/docs/git-status | Use `git status --short` and staged-file checks to prove scope. |
| Git whitespace/conflict-marker validation | Git documentation — git diff --check | https://git-scm.com/docs/git-diff | Use `git diff --check` before commit. |
| Prettier validation | Prettier CLI documentation | https://prettier.io/docs/next/cli/ | Use touched-file `prettier --check`; do not run broad formatting unless explicitly authorized. |
| Vitest validation | Vitest CLI documentation | https://main.vitest.dev/guide/cli | Use repo package scripts first; `vitest run` is single-run mode. |

## Research-to-Implementation Rules

- Research informs UX/product patterns only.
- Repo truth and Wave 11 docs control implementation.
- Do not clone outside tools.
- Do not introduce external runtime integrations from these sources.
- Do not treat AIA/ConsensusDocs/CSI references as legal interpretations.
- Use RACI/RAPID/DACI to support explicit fields for responsibility, accountability, decision rights, and action ownership.
- Use Procore/Autodesk patterns to support current-action-owner, pending-action, reviewer, watcher, notification-trigger, and activity-log vocabulary without Procore/Autodesk integration.
