# Prompt 07 — Wave 2 Team & Access, Settings, Approvals, and Readiness Frames

## Operating Instructions

You are executing this prompt in the live `RMF112018/hb-intel` repository. Treat the current repo as the source of truth. Do not assume files from memory are current. However, do not repeatedly re-read files that are still within your current context unless the file may have changed or the prompt specifically requires a freshness check.

Work to closure. Do not defer required analysis, do not ask broad clarification questions, and do not implement outside the allowed scope. If repo truth conflicts with this prompt, stop before code changes and document the conflict clearly.

## Objective

Implement preview frames for Team & Access, Control Center Settings, Approvals, and Project Readiness surfaces. These surfaces must show credible UI/UX shape without executing any workflow or mutation.

## Team & Access

Team & Access Center is the PCC's governed project team and access-management surface. It combines project-team visibility, access-request intake, permission-template selection, role/assignment management, approval tracking, current assignment visibility, and later backend-validated permission execution.

Wave 2 must preview this lifecycle without executing group, permission, Entra, SharePoint, Teams, backend, Graph, or PnP mutations.

Access Manager roles:

- Estimating Coordinator
- Lead Estimator
- Project Executive
- Project Manager
- Manager of Operational Excellence
- IT / Admin

Map IT / Admin to both `it-admin` and `pcc-admin` unless repo truth proves a narrower distinction is required.

Access Manager preview capabilities:

- add/search user;
- select project role;
- select permission template;
- review access summary;
- submit access request / assignment change preview;
- approve/reject/comment preview where appropriate;
- view execution status as "manual / IT handled / backend-gated later";
- view audit preview.

All other roles:

- if the user already has project-site permission, show Team Viewer / project team org chart plus current role and permission assignment for that project site;
- if the user does not yet have project-site permission, show Permission Request feature only;
- executive/global read-only users may view team/org chart and access context but cannot add/search/assign unless separately assigned an Access Manager role;
- external/guest/viewer users receive read-only team visibility if permitted, or request-access flow if not yet granted.

Required Wave 2 preview lanes:

1. Team Viewer Lane
   - project team org chart / team map preview;
   - internal/external/guest counts;
   - project role and company grouping;
   - current user's role and permission assignment;
   - read-only for non-access-manager roles.
2. Permission Request Lane
   - request access;
   - request role/permission change;
   - requested permission template;
   - business justification placeholder;
   - request status preview.
3. Access Manager Lane
   - add/search user preview;
   - assignment form preview;
   - permission-template selector preview;
   - approval/comment/status preview;
   - execution status clearly marked as not executed in Wave 2.

## Control Center Settings

Implement:

- settings overview cards;
- project/site/persona/integration scope labels;
- missing-configuration preview items;
- no settings persistence or tenant mutation.

## Approvals

Implement:

- approval/checkpoint counts;
- pending my approval preview;
- pending others preview;
- submitted/recently approved preview;
- no approval execution.

## Project Readiness

Implement:

- readiness score/summary;
- People & Access readiness;
- Documents & Information readiness;
- Processes & Workflows readiness;
- Systems & Integrations readiness;
- no backend rollup.

## Validation

Add tests confirming each surface renders, uses preview data only, and has no live execution path.

Team & Access acceptance criteria:

- tests must confirm Access Manager roles see add/search/assignment preview affordances;
- tests must confirm non-Access-Manager roles only see Team Viewer or Permission Request state based on fixture access status;
- tests must confirm users without project-site access see request-access entry only;
- tests must confirm users with project-site access see current role and permission assignment;
- tests must confirm no Graph/PnP/backend/permission/group mutation imports or execution paths exist.

Hard guardrails:

- do not mutate SharePoint groups;
- do not mutate Entra groups;
- do not mutate Teams membership;
- do not call Graph/PnP;
- do not call backend APIs;
- do not implement real people-picker lookup;
- do not persist access requests;
- do not execute approvals;
- do not treat PCC persona/capability metadata as authoritative authorization in Wave 2;
- render all actions as preview-only / disabled / fixture-driven.

Run package validation commands.

## Closeout

Create `Wave_2_Prompt_07_Closeout.md` with preview-frame coverage and guardrail confirmations.

Closeout must state that Wave 2 previews the full Team & Access lifecycle but does not execute access management.
