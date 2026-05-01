# Phase 3 Module Implementation Plan

Generated: 2026-04-28

## Objective

Define the Phase 3 implementation plan for the Project Control Center (PCC) after the decision documents are locked. Each module/work center receives its own implementation wave so development can proceed in controlled, testable increments.

This plan is implementation-oriented, but still preserves the Phase 3 gate posture:

- no provisioning executor unless Phase 2 explicitly authorizes it;
- no broad tenant mutation without approved manifest, dry-run proof, mutation gate, non-production boundary, and validation posture;
- no direct SPFx provisioning;
- no direct SPFx-to-Procore path;
- no Procore runtime, secrets, full mirror, or write-back;
- no production rollout during Phase 3 implementation unless separately approved through production gates.

## Phase 3 Implementation Thesis

Phase 3 code work should build the **PCC application layer**:

1. PCC shell.
2. Backend-normalized read models.
3. Role-aware work centers.
4. Priority action aggregation.
5. Light operational workflow framework.
6. Structured Project Readiness workflow modules.
7. HB Document Control Center three-lane architecture.
8. External Systems launch hub.
9. Site Health visibility and repair request intake.
10. Admin/control-plane review surfaces.

Phase 3 should **not** build the provisioning engine. Provisioning remains a Phase 2/backend-controlled/gated concern.

## Required Sequencing Principle

Do not start with the individual workflow modules.

Start with:

1. implementation gate review;
2. shared models;
3. shell frame;
4. backend read-model foundation.

Then implement each module as its own wave. This prevents every module from inventing its own role model, status model, audit model, approval logic, and backend shape.

---

# Wave Summary

| Wave | Module / Workstream                                                 | Purpose                                                                                                                                                        | Dependency                  |
| ---: | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
|    0 | Implementation Gate & Repo Truth Recheck                            | Confirm Phase 3 can move from planning to code and lock allowed paths.                                                                                         | Phase 2 Step 4/5/6 evidence |
|    1 | PCC Shared Foundations                                              | Establish shared types, read-model contracts, fixtures, feature flags, role model, status model.                                                               | Wave 0                      |
|    2 | PCC SPFx Shell Frame                                                | Create shell/routing/layout foundation without deep module logic.                                                                                              | Wave 1                      |
|    3 | PCC Backend Read-Model Foundation                                   | Create backend read-model scaffolds used by shell/modules.                                                                                                     | Wave 1                      |
|    4 | Project Home / Command Center                                       | Build hybrid landing page and role-aware project summary.                                                                                                      | Waves 2–3                   |
|   4A | Controlled Non-Production Tenant SPPKG Visual Validation Gate       | First eligible hosted validation point after Wave 4 in controlled non-production tenant scope.                                                                 | Wave 4                      |
|    5 | Priority Actions Rail                                               | Build MVP action categories and source aggregation.                                                                                                            | Waves 3–4                   |
|   5A | Optional Controlled Tenant Revalidation After Priority Actions Rail | Optional hosted revalidation after Wave 5; not the first hosted validation point.                                                                              | Wave 5                      |
|    6 | Team & Access                                                       | Build request + approval workflow; no automated permission execution.                                                                                          | Waves 2–3                   |
|    7 | HB Document Control Center                                          | Build three-lane model: Project Record + My Project Files + External Systems, with source binding, review routing, audit, and project-only OneDrive guardrail. | Waves 2–3                   |
|    8 | Project Readiness Module Framework                                  | Build shared framework for structured readiness modules.                                                                                                       | Waves 2–3                   |
|    9 | Job Startup Checklist                                               | Build item-level startup workflow module.                                                                                                                      | Wave 8                      |
|   10 | Permit Log                                                          | Build item-level permit workflow module.                                                                                                                       | Wave 8                      |
|   11 | Responsibility Matrix                                               | Build item-level responsibility workflow, including owner-contract mapping.                                                                                    | Prior readiness waves       |
|   12 | Constraints Log                                                     | Build item-level constraints workflow module.                                                                                                                  | Wave 8                      |
|   13 | Buyout Log                                                          | Build item-level buyout/project-controls workflow module.                                                                                                      | Wave 8                      |
|   14 | Approvals / Checkpoints                                             | Build approval/checkpoint queue and authority logic.                                                                                                           | Waves 3, 5, 6, 8–13         |
|   15 | External Systems                                                    | Build launch hub for SharePoint, OneDrive, Procore, Sage, Teams, Compass, Document Crunch, Cupix.                                                              | Waves 2–3                   |
|   16 | Control Center Settings                                             | Build business/technical settings separation and role-gated UI.                                                                                                | Waves 2–3                   |
|   17 | Site Health                                                         | Build health visibility and repair request workflow; no repair execution.                                                                                      | Waves 2–3                   |
|   18 | Executive Oversight / Global Read-Only                              | Build executive summary and governed drill-in.                                                                                                                 | Waves 4–17                  |
|   19 | Admin / Control Plane Review Surfaces                               | Build admin queues and review surfaces for requests, approvals, repair intake.                                                                                 | Waves 6, 14, 17             |
|   20 | Hardening, Doctrine Validation, and Non-Production Readiness        | Close UX, accessibility, tests, guards, documentation, and rollout readiness.                                                                                  | All prior waves             |

---

# Wave 0 — Implementation Gate & Repo Truth Recheck

## Objective

Confirm that Phase 3 code work is authorized and define exact implementation paths before touching source files.

## Required Work

- Re-audit Phase 2 Step 4/5/6 status.
- Confirm stable dry-run/proof artifact semantics.
- Confirm no-mutation / mutation-gate posture.
- Confirm SPFx shell implementation path remains `apps/project-control-center/` (already scaffolded).
- Confirm backend route/package placement.
- Confirm validation commands.
- Confirm which implementation waves are authorized immediately and which remain blocked.

## Deliverables

- `Phase_3_Implementation_Gate_Review.md`
- updated Open Decision Register
- authorized implementation scope
- blocked-scope register

## Exit Criteria

- Clear Ready / Not Ready decision.
- Exact allowed file paths identified.
- No code started unless gate authorizes it.

---

# Wave 1 — PCC Shared Foundations

## Objective

Create the shared implementation foundation used by all PCC modules.

## Code Work

- PCC shared TypeScript model contracts.
- Role/persona definitions.
- Work center registry constants.
- Workflow status enums.
- Workflow item types.
- Business audit event types.
- Approval checkpoint types.
- External system identifiers.
- Site Health summary types.
- Mock/fixture data for local development.
- Feature flags / module enablement flags.
- No-mutation guard utilities where applicable.

## Key Models

- `ProjectProfile`
- `PccUserRole`
- `PccWorkCenter`
- `PriorityAction`
- `WorkflowModule`
- `WorkflowItem`
- `BusinessAuditEvent`
- `ApprovalCheckpoint`
- `ExternalSystemLink`
- `SiteHealthSummary`

## Exit Criteria

- Shared models compile.
- No backend/SPFx behavior depends on unstable provisioning exports.
- Fixtures support shell and module development.

---

# Wave 2 — PCC SPFx Shell Frame

## Objective

Build the future PCC shell frame without full module implementation.

## Code Work

- App entry point.
- Page shell.
- Role-aware layout wrapper.
- Work center navigation frame.
- Project header placeholder.
- Responsive container behavior.
- Loading, empty, access-denied, partial-configuration, archived, stale, and backend-unavailable states.
- Feature-flagged module slots.
- Local fixture mode.

## UI Requirements

- Hybrid Command Center structure.
- Desktop/tablet/mobile responsive behavior.
- No right-edge overflow.
- No fake SharePoint chrome duplication.
- `@hbc/ui-kit` usage where repo-standard.
- Flagship-grade visual direction.

## Exit Criteria

- Shell renders with fixture data.
- Work centers route or tab correctly.
- State model is present before live APIs.

---

# Wave 3 — PCC Backend Read-Model Foundation

## Objective

Create backend read-model scaffolds for PCC without provisioning execution.

## Code Work

- PCC route namespace.
- Project Profile read endpoint.
- Work Center Registry read endpoint.
- Priority Actions read endpoint.
- Workflow Summary read endpoint.
- External Links read endpoint.
- Site Health read endpoint placeholder.
- Role-aware response shaping.
- Safe fixture/mock/local data support if live data is unavailable.

## Strict Boundaries

- No tenant mutation.
- No Graph/PnP mutation.
- No provisioning executor.
- No Procore runtime.
- No automated repair.

## Exit Criteria

- SPFx shell can consume backend-normalized PCC read models.
- Backend tests prove no mutation path exists.

---

# Wave 4 — Project Home / Command Center

## Objective

Build the primary PCC landing page.

## Code Work

- Project identity header.
- Status/stage/type display.
- Site Health badge.
- Role-aware summary zones.
- Current readiness posture.
- Work center shortcuts.
- PM/PX/Superintendent/Accountant/Estimating/Executive view emphasis.
- Empty and partial-configuration states.

## Exit Criteria

- Project Home works for all primary personas.
- Hybrid layout is implemented.
- Priority Actions Rail slot is ready for Wave 5.

---

# Wave 4A — Controlled Non-Production Tenant SPPKG Visual Validation Gate

## Objective

Run the first eligible hosted PCC validation after Wave 4 by rendering the PCC package in a controlled non-production SharePoint tenant scope for visual host verification.

## Allowed Scope

- Build the PCC `.sppkg`.
- Perform approved non-production app-catalog or site-collection app-catalog upload/install actions.
- Add/render PCC on a controlled SharePoint validation page.
- Validate SharePoint host behavior: canvas sizing, theme behavior, responsive layout, asset loading, and Project Home / Command Center visual quality.

## Guardrails

- No broad tenant mutation is authorized. Tenant activity is limited to approved non-production catalog/install actions and controlled validation-page actions required for visual validation.
- No production rollout.
- No production app-catalog deployment.
- No tenant-wide deployment unless explicitly approved.
- No unrelated site/page changes.
- No permission/group mutation.
- No provisioning execution.
- No live backend default cutover.
- No Azure Functions deployment or Azure service setup.
- No live Graph/PnP operational work beyond package/app validation commands.
- No Procore runtime.
- No Document Crunch runtime.
- No Adobe Sign runtime.
- No Site Health scan/repair execution.
- No access execution.
- No approval execution.
- No workflow write-through.

## Exit Criteria

- PCC package renders in controlled non-production tenant-hosted SharePoint validation scope.
- Project Home visual quality and host integration checks pass or are captured as defects.
- Guardrail exclusions remain intact and explicitly confirmed in closeout.

---

# Wave 5 — Priority Actions Rail

## Objective

Build the MVP Priority Actions Rail with the approved four action categories.

## MVP Categories

- Access requests.
- Readiness blockers.
- Approval/checkpoint prompts.
- External-system mapping prompts.

## Code Work

- Priority action aggregation read model.
- Action card component.
- Category filters.
- Due/urgent indicators.
- Role-aware visibility.
- Drill-in routing to owning module.
- Empty state: “No priority actions.”

## Excluded From MVP Rail

- Document-control prompts.
- Site Health escalations.

## Exit Criteria

- Rail displays actionable, role-aware items.
- Actions route to correct module/work center.
- No action executes unsafe backend behavior.

---

# Wave 5A — Optional Controlled Tenant Revalidation After Priority Actions Rail

## Objective

Optionally revalidate the hosted PCC experience after Wave 5 adds Priority Actions Rail.

## Positioning

- Optional gate.
- Not the first hosted validation point (Wave 4A remains first).
- Can be skipped if Wave 4A evidence is sufficient and hosted revalidation is deferred.

## Guardrails

- Same controlled non-production tenant limits as Wave 4A.
- No broad tenant mutation beyond approved non-production catalog/install and controlled validation-page actions required for visual validation.
- No production rollout or production app-catalog deployment.
- No tenant-wide deployment unless explicitly approved.

## Exit Criteria

- Hosted Priority Actions Rail visual behavior is validated in controlled non-production tenant scope or the gate is explicitly deferred.
- Any hosted regressions are recorded before continuing downstream waves.

---

# Wave 6 — Team & Access

## Objective

Build Team & Access request and approval tracking without automated permission execution.

## Code Work

- Access request form.
- Request list.
- Request detail.
- Approve/reject/comment actions.
- Status model.
- Business audit trail.
- Role gates.
- Admin review queue integration point.
- “Execution pending / handled by IT” state.

## Not Included

- Automated SharePoint group updates.
- Automated Teams membership changes.
- Direct SPFx permission mutation.

## Exit Criteria

- Users can submit access requests.
- Authorized users can approve/reject/comment.
- IT/Admin can view execution queue.
- No automated permission execution exists.

---

# Wave 7 — HB Document Control Center

## Objective

Build the three-lane HB Document Control Center architecture.

## Lanes

- Project Record: formal SharePoint project record.
- My Project Files: project-scoped OneDrive working-file lane.
- External Systems: Procore, Document Crunch, Adobe Sign, and future approved systems as linked systems.

## Code Work

- Project Document Source Registry read model and project-scoped source binding.
- Project Record lane UI and formal-file metadata posture.
- My Project Files lane UI with hard guardrail: never expose full OneDrive root or other projects.
- External Systems lane cards (launch/deep-link/visibility + mapping/access issue states).
- Role/action permission model using R01–R23 role codes and PR/MP/SB/EX/WF action codes.
- Review types/routing model and workflow/audit posture.
- Search strategy, upload constraints, folder/path constraints, change tracking refresh model.
- Throttling/resilience states and admin repair/reconciliation posture.
- Fixture/mock read-model strategy for Wave 7 contract validation.

## Not Included

- External writeback/sync/mirror (`EX04`) in Wave 7.
- Procore, Document Crunch, or Adobe Sign system-of-record replacement.
- Broad OneDrive browsing across projects (architecture HARD-NO).
- Runtime implementation claims outside Wave 7 scoped documentation planning.

## Permission Legend and Universal Hard-No Rules

Permission symbols follow the architecture legend: `Y`, `A`, `O`, `R`, `C`, `S`, `D`, `N`, `HARD-NO`.

Universal hard-no rules:

- Never expose the full OneDrive `My Project Files` root from the project-site module.
- Never expose another project's OneDrive working folder.
- Never perform external writeback/sync/mirror in Wave 7.

## Complete Role Set (R01–R23)

R01 PCC Admin; R02 IT / Tenant Admin; R03 Executive Oversight; R04 Project Executive; R05 Project Manager; R06 Superintendent; R07 Project Accounting; R08 Project Team Member; R09 Project Viewer / Viewer; R10 Safety / QAQC; R11 Manager of Operational Excellence; R12 Estimating Coordinator; R13 Estimator; R14 Lead Estimator; R15 Chief Estimator; R16 Director of Preconstruction; R17 Legal Reviewer; R18 Compliance Reviewer; R19 Leadership Reviewer; R20 External Contributor; R21 External Design Team; R22 Owner / Client Viewer; R23 Subcontractor Limited.

## Action Codes

- Project Record: `PR01`–`PR12`
- My Project Files: `MP01`–`MP09`
- Source Binding / Repair: `SB01`–`SB08`
- External Systems: `EX01`–`EX04`
- Workflow/Admin: `WF01`–`WF08`

Use Project Coordinator terminology for document-control actor roles. Do not use Project Engineer for current-target Wave 7 permission/routing language.

## Exit Criteria

- Three lanes are defined and non-contradictory with Wave 7 scope.
- Project Document Source Registry binding model is documented.
- Role/action permission model (R01–R23 and PR/MP/SB/EX/WF) is documented with hard-no rules.
- Search/upload/path constraints, refresh tracking, throttling/resilience, and audit/reconciliation posture are documented.
- Wave 7 remains Document Control and Wave 11 remains Responsibility Matrix.

---

# Wave 8 — Project Readiness Module Framework

## Objective

Build the shared framework for item-level structured workflow modules.

Technical/user-facing naming lock:

- Technical wave name: **Project Readiness Module Framework**.
- User-facing module name: **Project Readiness Center**.
- Wave 8 is the framework layer that downstream readiness modules plug into; it is not the Wave 9 checklist implementation.

## Code Work

- Module registry.
- Workflow module layout.
- Item list component.
- Item detail component.
- Status transitions.
- Owner/due-date/comment/reviewer fields.
- Attachment/reference hooks.
- Business audit trail.
- Module summary card.
- Shared validation patterns.
- Template/source reference mapping.

## Supported Statuses

- Not Started
- In Progress
- Blocked
- Needs Review
- Approved
- Rejected / Returned
- Complete
- Deferred
- Not Applicable

## Exit Criteria

- New workflow modules can plug into the framework.
- Item-level tracking works with fixture/backend data.
- Business audit trail records changes.
- Framework boundaries explicitly prevent duplicate ownership with Waves 6, 7, 9–15, and 17 module detail.
- Readiness posture is blocker-first and does not hide unresolved critical blockers behind blended completion percentages.

---

# Wave 9 — Job Startup Checklist

## Objective

Build the Job Startup Checklist as the first Project Readiness workflow module.

## Code Work

- Startup checklist module registration.
- Item seed/template mapping.
- Owner/status/due date handling.
- Review states.
- Completion summary.
- Blocker surfacing to Priority Actions Rail.
- Business audit history.

## Exit Criteria

- Checklist supports item-level tracking.
- Readiness blockers can flow to Priority Actions.
- PM/PX can review status.

---

# Wave 10 — Permit Log

## Objective

Build the Permit Log as an item-level workflow module.

## Code Work

- Permit item model.
- Permit status tracking.
- Authority/jurisdiction fields where applicable.
- Required date / expiration / inspection-related reference fields.
- Owner and responsible party.
- Attachment/reference links.
- Readiness blocker integration.

## Exit Criteria

- Permit Log supports item-level permit tracking.
- Blocked/overdue permits surface as readiness blockers.
- Superintendent and PM views are useful.

---

# Wave 11 — Responsibility Matrix

## Objective

Build the Responsibility Matrix module, including owner-contract responsibility mapping.

## Code Work

- Responsibility item model.
- Responsible party.
- Accountable party.
- Consulted/informed fields if appropriate.
- Owner-contract responsibility classification.
- Role/person assignment.
- Review/approval status.
- Matrix/list view toggle if valuable.
- Business audit trail.

## Exit Criteria

- Single Responsibility Matrix covers both normal and owner-contract responsibility mapping.
- PM/PX can review and maintain responsibility records.
- Assigned users see responsibility items in My Responsibilities.

---

# Wave 12 — Constraints Log

## Objective

Build the Constraints Log as an item-level workflow module.

## Code Work

- Constraint item model.
- Constraint category.
- Owner.
- Required-by date.
- Impact/risk field.
- Status.
- Comments/history.
- Escalation flag.
- Priority Actions integration for blockers.

## Exit Criteria

- Constraints can be tracked, assigned, and escalated.
- Blocked/high-priority constraints surface appropriately.

---

# Wave 13 — Buyout Log

## Objective

Build the Buyout Log as an item-level project-controls workflow module.

## Code Work

- Buyout package/item model.
- Scope/package name.
- Responsible party.
- Due date.
- Status.
- Approval/checkpoint hooks.
- Sage/Procore launch reference where applicable.
- Business audit trail.
- Project Accountant visibility.

## Exit Criteria

- Buyout status is visible to PM/PX/Project Accountant.
- Buyout items can trigger approvals/checkpoints where appropriate.

---

# Wave 14 — Approvals / Checkpoints

## Objective

Build the approval/checkpoint module that supports business-facing and technical review queues.

## Approval Authorities

| Checkpoint Type            | Authority                                    |
| -------------------------- | -------------------------------------------- |
| Technical/provisioning     | IT/Admin                                     |
| Access/security            | IT/Admin with business approval where needed |
| Project/business readiness | PM/PX                                        |
| Workflow item review       | Assigned reviewer                            |
| Executive escalation       | PX / Executive Oversight where assigned      |

## Code Work

- Checkpoint registry.
- Approval queue.
- Approval detail view.
- Approve/reject/comment.
- Authority validation.
- Audit trail.
- Integration with access requests and workflow modules.
- Priority Actions Rail integration.

## Exit Criteria

- Approval/checkpoint prompts route correctly.
- Role authority is enforced.
- Audit trail records decisions.

---

# Wave 15 — External Systems

## Objective

Build launch-link support for approved MVP systems.

## Systems

- SharePoint
- OneDrive
- Procore
- Sage
- Microsoft Teams
- Compass
- Document Crunch
- Cupix

## Code Work

- External system registry.
- Launch cards.
- Missing configuration state.
- Role-aware display.
- Project-specific link resolution.
- “Request mapping correction” action.

## Not Included

- Sync.
- Mapping health dashboard.
- Data mirror.
- Write-back.
- Direct Procore API calls.

## Exit Criteria

- Each system can be shown as configured/missing.
- Configured systems launch correctly.
- Missing systems create a mapping issue prompt.

---

# Wave 16 — Control Center Settings

## Objective

Build role-gated PCC settings.

## Settings Groups

| Group                            | Editable By                                 |
| -------------------------------- | ------------------------------------------- |
| Business-facing project settings | PM / PX / IT Admin                          |
| Work center/module visibility    | IT Admin, limited PM/PX if approved         |
| External launch links            | IT Admin; PM/PX request or edit if approved |
| Technical/provisioning settings  | IT Admin only                               |
| Permission/security settings     | IT Admin only                               |
| Site Health repair settings      | IT Admin only                               |

## Code Work

- Settings read model.
- Settings edit UI.
- Role-gated edit controls.
- Validation.
- Audit trail.
- Locked/disabled states for gated technical settings.

## Exit Criteria

- PM/PX can edit approved business settings.
- IT/Admin controls technical settings.
- No settings UI triggers tenant mutation directly.

---

# Wave 17 — Site Health

## Objective

Build project-user Site Health visibility and repair request intake.

## Code Work

- Health status card.
- Health detail view.
- Severity model.
- Drift/warning indicators.
- Stale/unknown/error states.
- Repair request form.
- Repair request status tracking.
- IT/Admin owner display.
- Admin queue integration.

## Not Included

- Automated repair.
- Tenant mutation.
- Graph/PnP mutation.
- Provisioning executor.

## Exit Criteria

- Project users see clear health status.
- Users can submit repair/escalation requests.
- IT/Admin can review requests.
- No repair execution exists unless later explicitly authorized.

---

# Wave 18 — Executive Oversight / Global Read-Only

## Objective

Build the executive summary experience with governed drill-in and Document Control Center access.

## Code Work

- Executive summary layout.
- Project status/risk/readiness summary.
- Key workflow status cards.
- Site Health summary.
- Document Control Center access.
- Governed read-only drill-in.
- Action suppression for read-only users.

## Exit Criteria

- Executive users can understand project posture quickly.
- Drill-in respects read-only permissions.
- No workflow execution authority is granted by default.

---

# Wave 19 — Admin / Control Plane Review Surfaces

## Objective

Build admin-facing visibility and review queues that support MVP workflows.

## Code Work

- Access request queue.
- Approval/checkpoint queue.
- Site Health repair request queue.
- External-system mapping issue queue.
- Technical settings review.
- Evidence/proof display if Phase 2 artifacts are stable.
- Admin status filters.

## Not Included

- Provisioning execution unless later gate authorizes.
- Automated repair unless later gate authorizes.
- Production rollout tooling.

## Exit Criteria

- IT/Admin can see and process requests.
- Admin surfaces do not create hidden mutation paths.
- Technical execution remains gated.

---

# Wave 20 — Hardening, Doctrine Validation, and Non-Production Readiness

## Objective

Close Phase 3 MVP implementation with formal validation, documentation, and readiness proof.

## Code / Quality Work

- Full typecheck.
- Unit tests.
- Component tests where available.
- Role/permission tests.
- No-mutation regression tests.
- Responsive QA.
- Accessibility QA.
- Reduced motion behavior.
- Empty/error/stale state QA.
- Hosted SharePoint validation plan.
- UI doctrine scorecard.
- README updates.
- Implementation closeout documentation.

## Exit Criteria

- No hard-stop UI doctrine failures.
- No horizontal overflow.
- No unsafe mutation paths.
- No direct SPFx-to-Procore.
- No Procore runtime or secrets.
- Documentation reflects actual behavior.
- Non-production rollout package can be prepared.
- Wave 20 remains the formal readiness gate and is distinct from early hosted visual validation gates (Wave 4A and optional Wave 5A).
- Production rollout remains separately approved.

---

# Recommended Milestone Grouping

## Milestone 1 — Foundation

- Wave 0 — Implementation Gate
- Wave 1 — Shared Foundations
- Wave 2 — SPFx Shell Frame
- Wave 3 — Backend Read-Model Foundation

## Milestone 2 — Core PCC Experience

- Wave 4 — Project Home
- Wave 4A — Controlled Non-Production Tenant SPPKG Visual Validation Gate (first hosted validation point)
- Wave 5 — Priority Actions Rail
- Wave 5A — Optional Controlled Tenant Revalidation After Priority Actions Rail
- Wave 15 — External Systems
- Wave 16 — Control Center Settings

## Milestone 3 — Access, Documents, and Health

- Wave 6 — Team & Access
- Wave 7 — HB Document Control Center
- Wave 17 — Site Health
- Wave 19 — Admin Review Surfaces

## Milestone 4 — Structured Project Readiness

- Wave 8 — Project Readiness Module Framework
- Wave 9 — Job Startup Checklist
- Wave 10 — Permit Log
- Wave 11 — Responsibility Matrix
- Wave 12 — Constraints Log
- Wave 13 — Buyout Log
- Wave 14 — Approvals / Checkpoints

## Milestone 5 — Executive Experience and Hardening

- Wave 18 — Executive Oversight / Global Read-Only
- Wave 20 — Hardening, Doctrine Validation, and Non-Production Readiness

---

# Validation Pattern Per Wave

Each wave should close with repo-correct equivalents of:

```bash
git status --short
pnpm check-types
pnpm test --filter <touched package/app/backend target>
pnpm build --filter <touched package/app target>
```

Each wave closeout must state:

- files changed;
- what was implemented;
- what was intentionally not implemented;
- validation results;
- no broad tenant mutation outside approved gate scope confirmation;
- no Procore runtime confirmation;
- no direct SPFx provisioning confirmation;
- remaining blockers;
- recommended next wave.

---

# Phase 3 Exit Criteria

Phase 3 implementation can be considered complete when:

1. all MVP work centers render through the PCC shell;
2. backend read models support shell consumption;
3. the approved MVP light workflows are functional;
4. all five MVP Project Readiness modules support item-level workflow tracking;
5. HB Document Control Center supports the three-lane posture (Project Record, My Project Files with project-only guardrail, and External Systems launch/deep-link/missing-config/access-issue states);
6. External Systems launch hub supports approved MVP systems;
7. Site Health supports visibility and repair-request intake;
8. admin review surfaces support MVP queues;
9. executive read-only experience works with governed drill-in;
10. no unsafe mutation paths exist;
11. no direct SPFx-to-Procore path exists;
12. validation, accessibility, responsive behavior, and doctrine scorecard are complete;
13. non-production readiness package can be prepared.
14. early hosted validation gates (Wave 4A and optional Wave 5A) are not treated as production rollout approval.
