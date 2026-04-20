# Financial Module — Cross-Tool Runtime Governance Spec

## Purpose
This document defines how the HB Intel Financial module tools work together at runtime. It is a synthesis contract and does not override previously locked tool-specific doctrine. Where tool-specific doctrine has already been locked outside this chat, this document should be read as the module-wide coordination layer.

## In-scope tools
- Budget Import
- Forecast Summary
- Forecast Checklist
- GC-GR Forecast
- Cash Flow Forecast
- Buyout Log
- Review / PER
- Publication / Export
- History / Audit

## Governing principles
1. Operating posture before UI polish.
2. Every tool exposes owned actions, not just data.
3. PWA and SPFx responsibilities remain distinct.
4. Source-of-truth and write boundaries stay explicit.
5. Project-scoped routing and durable context come first.
6. Home/canvas surfaces are operational, not decorative.
7. Shared spines are wired before cosmetic refinement.
8. Runtime honesty is mandatory.
9. Permission posture is role-aware.
10. Cross-tool continuity and handoffs are explicit.
11. Acceptance evidence is required for completion.
12. Polish follows real behavior.

## 1. Module operating model
The Financial module is a governed operating system for project financial work, not a set of disconnected pages. Each tool owns a specific class of work, but tools must interoperate through consistent context, lineage, readiness signals, ownership signals, and auditable transitions.

### Shared context keys
Every financial workflow should be able to bind to:
- `projectId`
- `reportingPeriod`
- `tool`
- `versionId` or equivalent tool-run identifier where applicable
- `artifactId`
- `readinessPosture`
- `approvalPosture`
- `publicationPosture`
- `owner / next move`
- `source freshness`

## 2. Cross-tool readiness dependencies
The module should expose readiness truthfully. A downstream tool may be visible before prerequisites are complete, but it must be visually honest about blocked posture and next dependency.

### Minimum dependency chain
- **Budget Import** establishes budget-side structural and period-grounded readiness for downstream forecasting where budget-backed logic is required.
- **Forecast Summary**, **GC-GR Forecast**, and **Cash Flow Forecast** depend on period-safe source context and valid version posture.
- **Forecast Checklist** governs whether forecast packages are considered operationally ready for review or publication.
- **Buyout Log** contributes downstream commercial posture and may affect forecast / review / publication truth depending on locked tool doctrine.
- **Review / PER** governs formal review readiness, commentary, and approval sequencing.
- **Publication / Export** is downstream of readiness, review posture, and publication-safe data integrity.
- **History / Audit** spans all of the above and must be able to explain how the current posture was reached.

### Module-wide readiness rule
No tool may present a materially misleading "ready" state if:
- a required upstream dependency is incomplete
- source data is stale
- version lineage is unresolved
- review posture is downgraded
- publication prerequisites are invalidated
- linked remediation from an audit case materially affects the current artifact

## 3. Publication and review sequencing
Publication must not be treated as a simple export button. It is the release of a governed financial package or artifact state.

### Required sequencing posture
1. Source context selected and valid.
2. Tool-owned edits / calculations complete.
3. Checklist / readiness posture satisfied where applicable.
4. Review / PER cycle complete where required.
5. Publication / Export verifies publication-safe posture immediately before release.
6. History / Audit records the resulting event in durable timeline form.

### Revalidation rule
If a materially relevant source event occurs after review but before publication, publication posture must be revalidated. The module must not silently rely on stale approvals.

## 4. Shared state and handoff logic
Each tool must be able to hand off cleanly to the next operational step.

### Required handoff patterns
- tool -> source correction
- tool -> review
- review -> remediation
- remediation -> return to review
- ready state -> publication
- publication -> audit history
- audit finding -> source-tool remediation
- audit closure -> restored module confidence

### Handoff payload minimums
Each handoff should carry:
- project
- period
- originating tool
- source artifact reference
- current posture
- requested next move
- current owner or assignee
- return route

## 5. Runtime honesty requirements
Every tool must distinguish:
- actionable
- blocked
- waiting
- escalated
- remediating
- published / released
- historical / superseded
- view-only

The module must avoid ambiguous mixed states. If multiple postures apply, the dominant blocking or risk posture must be visually prioritized.

## 6. Shared spine publication and consumption
The Financial module should integrate with shared platform spines rather than reproducing logic independently.

### Must publish / consume at module level
- next move / owner intelligence
- notifications and escalation
- workflow handoff events
- related-items graph / lineage
- project-canvas operating tiles
- versioned record lineage
- acknowledgment / receipt where approvals or review confirmations apply

### Examples of spine signals
- artifact created / superseded
- readiness downgraded / restored
- review requested / completed / returned
- publication attempted / blocked / completed
- audit case opened / escalated / closed / reopened

## 7. Role-aware behavior
Different roles do not merely see different screens; they own different kinds of next moves.

### Typical role posture
- PM: operational preparation, issue resolution, response ownership
- PX: review, exception handling, approval, escalation visibility
- finance leadership / controller: governance, publication confidence, audit visibility
- admin / operations: system-level oversight and support
- read-only participants: visibility without write authority

Role policy should determine:
- who can edit
- who can approve
- who can publish
- who can investigate
- who can close investigations
- who can reopen or override

## 8. Source-of-truth / read-model / write-model boundaries
The module should remain strict about where work is performed.

### Boundary pattern
- The source tool owns the corrective edit.
- Review owns review-state transitions.
- Publication owns release-state transitions.
- History / Audit owns investigation narrative, findings, linked remediation tracking, and transparency.
- Canvas / hub surfaces expose posture and fast-launch commands, not hidden write paths that bypass domain rules.

## 9. Cross-tool continuity
The user should not need to reconstruct context when moving between tools.

### Required continuity
- same project
- same reporting period
- same version family where applicable
- same artifact lineage
- same reason-for-launch context
- durable return path

Example: an audit case opens a remediation in Forecast Summary, and the user can return to the same case, same finding, same artifact selection without losing context.

## 10. Stale data and invalidation behavior
The module must surface downgrade events immediately.

### Examples
- an upstream import refresh changes values after review
- a buyout-related change affects forecast posture
- checklist evidence becomes stale
- an approval is superseded by later edits
- an audit case finding reopens previously "clean" posture

In these cases:
- prior historical events remain visible
- current readiness / review / publication posture is downgraded honestly
- the next owner and next step become explicit

## 11. Notifications and escalations
Notification intensity should match urgency and ownership.

### At minimum
- assignment notifications
- return / review requested
- ready-for-approval
- blocked by dependency
- publication blocked by revalidation
- overdue response or remediation
- audit reopen
- final release confirmation

Digest or watch-only behavior should not replace immediate notifications for blocking ownership events.

## 12. Module-wide acceptance evidence
The Financial module is not implementation-complete until it proves:
- durable project / period routing
- correct handoff between all relevant tools
- role-aware permissions and authority gates
- honest stale / blocked / escalated posture
- version / lineage continuity
- publication revalidation behavior
- audit investigation linkage and reopen logic
- operational command-center behavior on hub/canvas entry points

## 13. Non-goals
The module should not:
- collapse all write paths into one generic page
- let SPFx deep surfaces replace PWA workflow depth
- rely on decorative dashboards as a substitute for action
- hide invalidation behind stale green states
- turn History / Audit into a bypass admin editor
