# Financial Module — History / Audit Runtime Governance Spec

## Status
Completed doctrine pass in this chat. This document is implementation-oriented and is intended to govern runtime behavior for the HB Intel Financial module History / Audit tool.

## Governing posture
This tool is an **investigation workspace with controlled follow-through**. It is not a passive ledger and it is not a super-admin correction surface. It exists to let authorized users investigate cross-tool financial history, capture formal findings, track linked remediation, and launch into the originating tool for the actual corrective action.

This spec does **not** override previously locked doctrine for Budget Import, Forecast Summary, Forecast Checklist, GC-GR Forecast, Cash Flow Forecast, Buyout Log, Review / PER, or Publication / Export. It defines the runtime contract for History / Audit and its interaction with those tools.

## 1. Tool purpose and runtime posture
History / Audit is the financial module's case-based investigation surface for:
- tracing what happened
- explaining why it happened
- identifying who owns the next move
- linking affected source artifacts
- tracking whether remediation actually occurred
- preserving auditable closure

The tool must behave like an operational command center:
- posture is immediately visible
- the current owner is explicit
- waiting, escalated, remediating, and closed conditions are visually distinct
- the fastest safe next action is obvious
- the user can deep-link to the source tool without losing project / period / version context

## 2. Primary actors and authority model
### Actors
- Project Manager
- Project Executive
- finance leadership / controller
- approved admin / operations roles
- read-capable financial participants with investigation visibility only

### Authority rule
Only **designated operational authorities** may create formal investigation cases:
- PM
- PX
- finance leadership / controller
- approved admin / operations roles

Other users may be granted read access to history and cases, but they do not open formal investigations unless explicitly authorized by role policy.

## 3. Primary investigation unit
The primary unit is a **cross-tool case record**.

A case may aggregate:
- imports
- version changes
- checklist outcomes
- approvals
- overrides
- review package activity
- publication / export events
- lineage-related artifacts across the same project and reporting period

A case is not limited to a single event. It must support multi-artifact diagnosis while preserving a required primary reference.

## 4. Canonical case states and transitions
### Status model
- Open
- Assigned
- Investigating
- Awaiting Response
- Remediation In Progress
- Ready for Close
- Closed

### Allowed transition intent
- `Open -> Assigned` when the system assigns or an authority confirms ownership
- `Assigned -> Investigating` when the owner starts formal investigation work
- `Investigating -> Awaiting Response` when an external response, evidence, or upstream action is required
- `Awaiting Response -> Investigating` when requested information arrives
- `Investigating -> Remediation In Progress` when a formal finding produces a linked remediation item
- `Remediation In Progress -> Investigating` when remediation evidence is insufficient or creates new questions
- `Investigating -> Ready for Close` when findings are documented and the case is materially resolved
- `Remediation In Progress -> Ready for Close` when remediation is complete and evidence is attached
- `Ready for Close -> Closed` after evidence-based authority confirmation
- `Ready for Close -> Investigating` or `Ready for Close -> Remediation In Progress` when a materially relevant late event arrives
- `Closed -> Investigating` or `Closed -> Remediation In Progress` through automatic reopen logic when a new materially related source event occurs

### Runtime honesty rules
The UI must never imply that a case is closed or safe when:
- a linked remediation is incomplete
- a response SLA has expired
- a materially related late event has arrived
- linked source posture has become stale or invalidated

## 5. Entry, resume, and route behavior
### Entry paths
A case may be opened from either:
- project + reporting period context, or
- a specific source artifact / event

### Required primary reference
Every case must store:
- `projectId`
- `reportingPeriod`
- one required `primaryReference`
- zero or more confirmed `relatedArtifacts`

### Resume behavior
The tool must support durable re-entry with:
- current project
- current period
- case id
- last active tab / panel
- selected artifact
- filters / sort state
- last open finding or remediation item

If a deep link targets a case that is no longer visible to the current role, the route must fail honestly with a permission explanation and safe return path.

## 6. Action model and next-step guidance
The tool is read-first but actionable.

### Supported actions
- create investigation case (authorized roles only)
- assign / reassign owner (authorized roles)
- add investigation notes
- add formal findings
- confirm or reject system-suggested related artifacts
- create linked remediation item
- launch to originating tool for corrective action
- mark awaiting response
- capture returned evidence
- move case to ready-for-close
- confirm closure (authorized reviewer)
- reopen through material late-event logic

### Next-step guidance
The UI must identify:
- current case owner
- current blocking condition
- due / overdue status
- whether the next move is in this tool or in a source tool
- whether the case is waiting on response, remediation, or authority confirmation

## 7. Concurrency and collaboration rules
Cases are collaborative, but not conflict-free.

### Rules
- multiple users may view a case concurrently
- freeform notes can be appended concurrently
- authority-controlled fields require optimistic concurrency protection
- state transitions require fresh read validation before commit
- formal findings and remediation links must record author, timestamp, and supersession lineage
- reassignment, closure confirmation, and reopen events must be serialized and auditable

The UI must warn when:
- another user changed case status after local load
- the viewed artifact set changed
- a linked remediation item changed state elsewhere
- a source artifact is stale relative to the case snapshot

## 8. Default ownership and assignment
New cases use a **rule-based default owner, editable by authority**.

### Default assignment inputs
- tool of origin
- issue category
- project role posture
- artifact type
- reporting period context

### Assignment constraints
- authorities may override the default owner
- reassignment requires reason capture
- the original owner remains visible in history
- reassignment must not erase prior accountability

## 9. Timeout, escalation, and waiting logic
When the owner does not respond within the required time window:
- the case remains assigned to the original owner
- the case enters escalated posture
- the next authority level is notified
- the overdue condition is prominently visible in the case header and queue views

Automatic reassignment is **not** the default timeout behavior.

The case must show:
- SLA target
- elapsed time
- overdue duration
- escalation recipient
- last acknowledgement / response timestamp

## 10. Related-artifact model
Related artifacts are added through **system suggestions with user confirmation**.

### Suggestion inputs
- project
- reporting period
- version lineage
- source event adjacency
- user / actor overlap
- dependency links
- approval / publication sequencing

### Guardrails
- the system may suggest, but not silently expand scope
- an authorized user confirms inclusion
- rejected suggestions remain discoverable as rejected suggestions, not hidden
- the UI distinguishes primary reference from related artifacts

## 11. Commenting, findings, and evidence capture
The tool supports:
- freeform timestamped investigation notes
- mentions / role-directed comments
- structured formal findings

### Formal finding minimum fields
- title
- category
- severity
- impacted artifacts
- narrative summary
- recommended remediation
- author
- timestamp
- status (draft / issued / superseded if adopted by implementation)

Freeform notes are collaboration aids. Formal findings are durable audit records.

## 12. Remediation model
When a formal finding identifies a real issue, the tool creates a **linked remediation record with source-tool execution**.

### Remediation record minimum fields
- remediation id
- linked finding id
- source tool owner
- action owner
- due date
- current status
- evidence of completion
- verification status

### Boundary rule
The actual corrective action occurs in the originating tool, not in History / Audit.

History / Audit tracks:
- that remediation was opened
- who owns it
- whether it is complete
- whether verification evidence was attached
- whether closure remains blocked

## 13. Blocking, warning, and exception handling
### Hard blocks
- no primary reference
- no project / period context
- unauthorized case creation
- closure attempted without findings / explicit no-remediation rationale / reviewer confirmation
- status transition against stale concurrency token

### Warnings
- related artifact suggestions not reviewed
- linked remediation overdue
- source artifact updated after case load
- role mismatch for requested action
- linked source posture downgraded since case moved to ready-for-close

### Exceptions
The system should support explicit "no remediation required" rationale, but it must be recorded as part of closure evidence.

## 14. Approval, escalation, and closeout logic
### Case closure requirement
A case may move from `Ready for Close` to `Closed` only with:
- documented findings
- linked remediation status or explicit no-remediation rationale
- closure confirmation by an authorized reviewer

### Authorized reviewer
Role policy should determine who counts as an authorized reviewer. At minimum this should map to a project or finance authority and must not default to any viewer.

### Not required by default
Dual approval from both project and central governance is not required for every case unless implementation policy adds it for specific categories.

## 15. Post-action review and transparency
Each case must expose:
- full case timeline
- who changed what and when
- why a status changed
- why an owner changed
- which artifacts were suggested, confirmed, or rejected
- which remediation items were opened and their current posture
- closure evidence
- reopen reason if applicable

The user should be able to explain the case to an executive or auditor without leaving the tool.

## 16. Recovery, draft, and re-entry behavior
Draft case creation is allowed only if the implementation supports it with explicit draft posture. Whether draft exists or not, the tool must preserve:
- unsaved notes warning
- last read location
- last focused finding / artifact
- safe return path to the originating tool

Re-entry must restore context predictably, not force the user to rebuild the investigation state.

## 17. Late events and automatic reopen
If a new source event occurs after a case is in `Ready for Close` or `Closed`, and that event materially affects the original investigation:
- the system automatically reopens the case or moves it back to `Investigating` / `Remediation In Progress`
- an audit notice is recorded
- the prior closure remains visible as historical fact, not erased
- relevant authorities are notified

This is required for runtime honesty. A materially changed underlying posture must not remain visually represented as resolved.

## 18. Cross-module impacts and spine publication
History / Audit should publish and consume spine-level signals rather than behaving like an isolated page.

### Must consume
- source artifact identity and lineage
- project / period / version context
- readiness posture
- publication posture
- approval posture
- handoff / owner identity
- notification / escalation events

### Must publish
- investigation case created
- owner assigned / escalated
- finding issued
- remediation linked
- closure requested
- closure confirmed
- case reopened

These publications should feed notification intelligence, work queues, related-items graphing, and project-canvas surfaces.

## 19. Lane ownership — PWA vs SPFx
### PWA owns
- deep investigative workflow
- case creation and management
- finding entry
- remediation tracking
- full timeline review
- route-durable project / period / case navigation
- command-center presentation

### SPFx owns
- launch surfaces from SharePoint-hosted project context
- lightweight visibility / summary web parts
- native contextual entry points from document / list environments
- link-outs into PWA deep workflow

### Boundary
SPFx should not attempt to host the full investigative command surface if that compromises interaction depth, route durability, or workflow coherence.

## 20. Audit, explainability, and notification rules
Every meaningful action must record:
- actor
- timestamp
- affected object
- prior state
- new state
- reason / note where required

Notification rules must support at least:
- case assignment
- overdue escalation
- request for response
- remediation due / overdue
- closure review requested
- case reopened

Explainability must favor plain operational language over internal implementation jargon.

## 21. Mold-breaker UX requirements
The tool must not read like a static audit log.

### Required UX traits
- prominent posture banner
- explicit next-move owner
- timeline + artifact graph + findings + remediation in a coherent workflow layout
- clear blocked / waiting / escalated / remediating / closed states
- fast launch to the exact source tool artifact
- preserved context on return
- visible stale / conflict / downgrade warnings
- executive-readable closure summary without hiding detailed evidence

## 22. Acceptance criteria and scenario coverage
The implementation is not complete unless it proves all of the following:

### Happy path
- create case from source artifact
- auto-assign default owner
- add confirmed related artifacts
- issue formal finding
- create linked remediation
- remediate in source tool
- attach evidence
- move to ready-for-close
- authorized reviewer closes case

### Blocked / warning paths
- unauthorized case creation rejected
- stale concurrency transition blocked
- overdue owner response escalates without reassignment
- missing closure evidence blocks closure
- suggested related artifacts require explicit confirmation
- linked remediation overdue downgrades closure readiness

### Late-change honesty
- materially related late event reopens case automatically
- reopen event is auditable and visible
- prior closure remains historically visible

### Route / continuity
- deep links preserve project / period / case context
- re-entry restores selected artifact and last working panel
- permission failure degrades honestly with safe return path

## 23. Developer note
This tool should be treated as a first-class operational workflow surface, not a reporting afterthought. The design center is truthfulness, explicit ownership, low navigation distance, and strong write-boundary discipline.
