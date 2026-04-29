# Human Decision Register

Generated: 2026-04-28

## Objective

Capture all human decisions resolved during the Phase 3 planning interview so the planning deliverables can be treated as intentional product direction rather than agent inference.

## Decisions

| ID | Decision | Final Direction |
|---|---|---|
| D-001 | PCC MVP scope | Option C: Project Home + governed navigation hub + light operational workflows. |
| D-002 | Primary MVP users | Project Executive, Project Manager, Project Accountant, Superintendent, Estimating Coordinator, Lead Estimator, Estimator, Executive Oversight / Global Read-Only. IT / Control Center Admin is required MVP support/admin. |
| D-003 | Primary journey priority | 1. PM, 2. PX, 3. Superintendent, 4. Project Accountant, 5. Lead Estimator / Estimator / Estimating Coordinator, 6. Executive Oversight / Global Read-Only. |
| D-004 | Project Home layout | Hybrid: project identity/current status/site health at top, immediately followed by Priority Actions Rail. |
| D-005 | Priority Actions Rail categories | Access requests, readiness blockers, approval/checkpoint prompts, external-system mapping prompts. |
| D-006 | Light operational workflows | Request access change, resolve readiness blocker, submit approval/checkpoint response, resolve external-system mapping issue. |
| D-007 | Work Center Navigation | Keep eight primary work centers: Project Home, Team & Access, Documents / Document Control, Project Readiness, Approvals / Checkpoints, External Systems, Control Center Settings, Site Health. |
| D-008 | Functional module treatment | Target structured in-app workflows over time, not template launch only. Template launch/reference is an interim fallback only. |
| D-009 | MVP structured workflow modules | Job Startup Checklist, Permit Log, Responsibility Matrix, Constraints Log, Buyout Log. |
| D-010 | Later-phase workflow modules | Estimating Kickoff, Post-Bid Autopsy, Job Closeout Checklist. |
| D-011 | Responsibility Matrix scope | Merge Owner Contract Responsibility Matrix into the single Responsibility Matrix module. |
| D-012 | Document Control Center | Unified file-access hub for SharePoint Drive, OneDrive, and Procore files; not a document-control management surface. |
| D-013 | External Systems | SharePoint, OneDrive, Procore, Sage, Microsoft Teams, Compass, Document Crunch, Cupix. |
| D-014 | External Systems MVP behavior | Launch links only. No mapping health or context summaries required for MVP. |
| D-015 | Team & Access | Request + approval + automated execution later. MVP plans full lifecycle; automation remains gated. |
| D-016 | Site Health | Project-user visibility + repair request workflow; IT/Admin controls repair execution. |
| D-017 | Control Center Settings authority | IT/Admin + Project Executive + Project Manager; PM/PX edit approved business-facing settings; IT/Admin controls technical settings. |
| D-018 | Approvals / Checkpoints authority | IT/Admin + Project Executive + Project Manager, with authority by checkpoint type. |
| D-019 | Structured workflow detail | Item-level status tracking. |
| D-020 | Workflow auditability | Business audit trail for MVP; compliance-grade evidence for technical/provisioning/admin actions. |
| D-021 | Executive Oversight / Global Read-Only | Executive summary view with governed drill-in and Document Control Center access. |
| D-022 | Estimating / Preconstruction MVP | Hybrid: turnover visibility and access in MVP; structured Estimating Kickoff and Post-Bid Autopsy later. |
| D-023 | Deliverable scope | Required deliverables plus supporting registers. |


## Implementation Boundary

These decisions authorize planning deliverables only. They do not authorize:

- SPFx source implementation;
- backend route/service implementation;
- provisioning executor work;
- tenant mutation;
- Graph/PnP live calls;
- Procore runtime;
- production rollout;
- package/version/manifest changes.

