# MVP Scope Register

Generated: 2026-04-28

## MVP Definition

The PCC MVP is **Project Home + governed navigation hub + light operational workflows**.

It is not merely a landing page. It should support a useful project operating experience for core project roles and proceed through gated Phase 3 implementation waves with Wave 2 preview-only/runtime-boundary guardrails intact.

## MVP-Included Scope

| Area                         | MVP Scope                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project Home                 | Hybrid Command Center with project identity, status, Site Health, readiness posture, and Priority Actions Rail.                                                                                                                                                                                                                                                                           |
| Priority Actions Rail        | Access requests, readiness blockers, approval/checkpoint prompts, external-system mapping prompts.                                                                                                                                                                                                                                                                                        |
| Work Center Navigation       | Project Home, Team & Access, Documents / Document Control, Project Readiness, Approvals / Checkpoints, External Systems, Control Center Settings, Site Health.                                                                                                                                                                                                                            |
| Light workflows              | Access request, readiness blocker resolution, approval/checkpoint response, external-system mapping issue resolution.                                                                                                                                                                                                                                                                     |
| Structured workflow target   | Project Lifecycle Readiness Center, Permit & Inspection Control Center (internal `permits` and `required-inspections` families), Responsibility Matrix, Constraints Log, Buyout Log.                                                                                                                                                                                                      |
| Document Control Center      | Two-lane architecture: Microsoft Files Lane (SharePoint Drive / SharePoint document libraries + OneDrive) is a future Microsoft Graph-backed file-management surface; External Document Systems Lane (Procore Files, Document Crunch, Adobe Sign, future systems) is access/deep-link/visibility. Not a standalone submittal/transmittal/revision-routing/review-routing workflow engine. |
| External Systems             | Launch links only for SharePoint, OneDrive, Procore, Sage, Teams, Compass, Document Crunch, Cupix.                                                                                                                                                                                                                                                                                        |
| Team & Access                | Request + approval + automated execution later.                                                                                                                                                                                                                                                                                                                                           |
| Site Health                  | Project-user visibility + repair request workflow. IT/Admin controls repair execution.                                                                                                                                                                                                                                                                                                    |
| Settings                     | PM/PX edit approved business-facing settings; IT/Admin controls technical/provisioning settings.                                                                                                                                                                                                                                                                                          |
| Executive Oversight          | Executive summary with governed drill-in and Document Control Center access.                                                                                                                                                                                                                                                                                                              |
| Estimating / Preconstruction | Turnover visibility and access in MVP; structured estimating workflows later.                                                                                                                                                                                                                                                                                                             |

Wave 9 source grounding: Project Lifecycle Readiness Center is seeded by startup, safety, and closeout checklist-definition files in `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/`.
Safety checklist-family inclusion is readiness/workflow posture only; no Safety runtime integration, live inspection execution, incident-management runtime, OSHA engine claims, or safety-system mutation.
Wave 9 may define evidence requirements and evidence-link fields, but evidence storage ownership remains HB Document Control Center / SharePoint project record; Wave 9 does not upload/sync/store binaries or manage document libraries directly.
Wave 9 surfaces lifecycle-readiness posture and does not assume implementation ownership of Waves 10–14 modules.

Wave 11 Responsibility Matrix MVP planning posture:

- Official module name remains `Responsibility Matrix` (subtitle: `RACI + Owner-Contract Responsibility Control Center`).
- One unified Project Readiness module (not two spreadsheet launchers).
- Workbook-source counting posture for planning context: `109` workbook-derived task-row context (82 PM task-text rows plus 27 Field rows with assignment marks); strict marked assignment rows total `98`.
- Owner-contract workbook remains template/schema-only in current repo sources with no populated default obligation-description rows.
- Wave 11 planning includes assignment lifecycle/handoffs, current action owner posture, workflow steps, decision-rights overlay, contract-party + internal RACI separation, evidence references, exceptions, and Matrix Health Score posture.
- Wave 14 remains approval/checkpoint execution owner; Wave 11 does not claim approval runtime execution.
- HB Document Control Center remains evidence-binary owner; Team & Access remains project roster/access-state owner.
- Documentation posture only: no legal advice, no automatic creation of legal obligations, and no external-system writeback/runtime mutation claim.

Wave 12 Constraints Log MVP planning posture:

- Official module name remains `Constraints Log` (subtitle: `Make-Ready Constraint & Risk Exposure Center`).
- Wave 12 remains a Project Readiness governance module and aligns with Priority Actions escalation, Document Control evidence-reference posture, Scheduler/Look Ahead coordination posture, and External Systems launcher/reference-only posture.
- Governing docs place Wave 12 under Project Readiness; current source-model mapping (`constraints-log`) to `risk-issues-decision` remains a documentation alignment item only in this prompt.
- Boundary terms: risk (uncertain future), constraint (known blocker), issue (active problem), delay exposure (schedule-impact condition for review), and change exposure (scope/cost/contract impact condition for review).
- Embedded risk/exposure posture does not replace claims handling, formal delay analysis, enterprise change-management systems, or enterprise risk systems.

## Later-Phase Scope

| Area                                   | Later-Phase Scope                                                                                                                                                                                                                                                            |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estimating Kickoff                     | Structured in-app workflow.                                                                                                                                                                                                                                                  |
| Post-Bid Autopsy                       | Structured in-app workflow.                                                                                                                                                                                                                                                  |
| Job Closeout Checklist                 | Structured in-app workflow.                                                                                                                                                                                                                                                  |
| External system context summaries      | Mapping health, lightweight context summaries, last-checked status.                                                                                                                                                                                                          |
| Automated Team & Access execution      | Backend-controlled permission/group execution after security/provisioning gates.                                                                                                                                                                                             |
| Automated Site Health repair           | Backend-controlled repair after validation and mutation gates.                                                                                                                                                                                                               |
| Document management workflows          | Wave 2 includes no standalone submittal/transmittal/revision-routing/review-routing workflow execution and no approval execution. Microsoft Files Lane remains preview-only in Wave 2, then future Graph-backed capabilities may be added only through later approved gates. |
| Deep Procore/Sage/Compass integrations | Future-gated; launch-only in MVP.                                                                                                                                                                                                                                            |

## Explicitly Blocked Until Later Approved Gates

| Blocked Item           | Reason                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| SPFx implementation    | Allowed only through approved Phase 3 implementation waves; out-of-wave or ungated implementation is blocked. |
| Backend implementation | Live backend operations remain blocked unless later Phase 3/Phase 2 gates explicitly authorize them.          |
| Provisioning executor  | Blocked unless later gates explicitly authorize executor behavior.                                            |
| Tenant mutation        | Requires approved manifest, dry-run proof, mutation gate, non-production boundary, validation posture.        |
| Procore runtime        | Explicitly deferred; launch-only MVP.                                                                         |
| Direct SPFx-to-Procore | Forbidden.                                                                                                    |
| Procore full mirror    | Forbidden.                                                                                                    |
| Procore write-back     | Forbidden.                                                                                                    |
| Production rollout     | Production-blocked.                                                                                           |

## MVP Success Criteria

The MVP is successful when a primary user can:

1. Land on a project and understand project status, readiness, and urgent actions.
2. Navigate to the correct work center without knowing the underlying SharePoint or external-system structure.
3. Request access changes through a governed workflow.
4. See and act on readiness blockers.
5. Submit or review approval/checkpoint responses where authorized.
6. Launch the correct external systems for the project.
7. Access project files through a unified Document Control Center.
8. See Site Health and submit a repair/escalation request without being able to execute unsafe repair actions.
9. Use or review item-level workflow modules for key startup/readiness/project-control processes.
10. Preserve clear separation between business-facing actions and technical/provisioning administration.

---

# Implementation Wave Mapping

| MVP Scope Item                     | Wave |
| ---------------------------------- | ---: |
| Project Home / Command Center      |    4 |
| Priority Actions Rail              |    5 |
| Team & Access                      |    6 |
| Document Control Center            |    7 |
| Project Readiness Framework        |    8 |
| Project Lifecycle Readiness Center |    9 |
| Permit & Inspection Control Center |   10 |
| Responsibility Matrix              |   11 |
| Constraints Log                    |   12 |
| Buyout Log                         |   13 |
| Approvals / Checkpoints            |   14 |
| External Systems                   |   15 |
| Control Center Settings            |   16 |
| Site Health                        |   17 |
| Executive Oversight                |   18 |
| Admin Review Surfaces              |   19 |
