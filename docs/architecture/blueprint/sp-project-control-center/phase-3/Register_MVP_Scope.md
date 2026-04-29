# MVP Scope Register

Generated: 2026-04-28

## MVP Definition

The PCC MVP is **Project Home + governed navigation hub + light operational workflows**.

It is not merely a landing page. It should support a useful project operating experience for core project roles while staying inside the Phase 3 planning-only boundary until Phase 2 gates close.

## MVP-Included Scope

| Area                         | MVP Scope                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project Home                 | Hybrid Command Center with project identity, status, Site Health, readiness posture, and Priority Actions Rail.                                                                                                                                                                                                                                                                           |
| Priority Actions Rail        | Access requests, readiness blockers, approval/checkpoint prompts, external-system mapping prompts.                                                                                                                                                                                                                                                                                        |
| Work Center Navigation       | Project Home, Team & Access, Documents / Document Control, Project Readiness, Approvals / Checkpoints, External Systems, Control Center Settings, Site Health.                                                                                                                                                                                                                            |
| Light workflows              | Access request, readiness blocker resolution, approval/checkpoint response, external-system mapping issue resolution.                                                                                                                                                                                                                                                                     |
| Structured workflow target   | Job Startup Checklist, Permit Log, Responsibility Matrix, Constraints Log, Buyout Log.                                                                                                                                                                                                                                                                                                    |
| Document Control Center      | Two-lane architecture: Microsoft Files Lane (SharePoint Drive / SharePoint document libraries + OneDrive) is a future Microsoft Graph-backed file-management surface; External Document Systems Lane (Procore Files, Document Crunch, Adobe Sign, future systems) is access/deep-link/visibility. Not a standalone submittal/transmittal/revision-routing/review-routing workflow engine. |
| External Systems             | Launch links only for SharePoint, OneDrive, Procore, Sage, Teams, Compass, Document Crunch, Cupix.                                                                                                                                                                                                                                                                                        |
| Team & Access                | Request + approval + automated execution later.                                                                                                                                                                                                                                                                                                                                           |
| Site Health                  | Project-user visibility + repair request workflow. IT/Admin controls repair execution.                                                                                                                                                                                                                                                                                                    |
| Settings                     | PM/PX edit approved business-facing settings; IT/Admin controls technical/provisioning settings.                                                                                                                                                                                                                                                                                          |
| Executive Oversight          | Executive summary with governed drill-in and Document Control Center access.                                                                                                                                                                                                                                                                                                              |
| Estimating / Preconstruction | Turnover visibility and access in MVP; structured estimating workflows later.                                                                                                                                                                                                                                                                                                             |

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

## Explicitly Blocked for Phase 3 Planning Stage

| Blocked Item           | Reason                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| SPFx implementation    | Phase 3 planning-only until implementation gate.                                                       |
| Backend implementation | Requires Phase 2 proof/mutation boundaries.                                                            |
| Provisioning executor  | Blocked until Phase 2 authorizes executor behavior.                                                    |
| Tenant mutation        | Requires approved manifest, dry-run proof, mutation gate, non-production boundary, validation posture. |
| Procore runtime        | Explicitly deferred; launch-only MVP.                                                                  |
| Direct SPFx-to-Procore | Forbidden.                                                                                             |
| Procore full mirror    | Forbidden.                                                                                             |
| Procore write-back     | Forbidden.                                                                                             |
| Production rollout     | Production-blocked.                                                                                    |

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

| MVP Scope Item                | Wave |
| ----------------------------- | ---: |
| Project Home / Command Center |    4 |
| Priority Actions Rail         |    5 |
| Team & Access                 |    6 |
| Document Control Center       |    7 |
| Project Readiness Framework   |    8 |
| Job Startup Checklist         |    9 |
| Permit Log                    |   10 |
| Responsibility Matrix         |   11 |
| Constraints Log               |   12 |
| Buyout Log                    |   13 |
| Approvals / Checkpoints       |   14 |
| External Systems              |   15 |
| Control Center Settings       |   16 |
| Site Health                   |   17 |
| Executive Oversight           |   18 |
| Admin Review Surfaces         |   19 |
