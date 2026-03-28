# Budget Import Governance Spec
**Financial Module — Definitive Runtime Doctrine (Draft v1)**

## 1. Purpose

The Budget Import tool is a governed operational workflow inside the Financial module. It is not a generic upload utility, not a passive review page, and not a spreadsheet-style staging screen. Its purpose is to ingest budget source data, orchestrate reconciliation against the project’s governed financial structure, preserve downstream continuity where possible, and guide the user to a safe, auditable commit into working Financial state.

## 2. Runtime Doctrine Summary

The Budget Import tool is governed by the following runtime doctrines:

- **Guided-operational doctrine**  
  Strong governance remains mandatory, but the tool must actively guide, prioritize, predict, and shorten navigation distance.

- **Live command-center doctrine**  
  The tool behaves as a live operational session hub, not a linear wizard. Workflow stages exist, but the runtime continuously reprioritizes blockers, ownership, escalation state, collaboration activity, and next best action.

- **Adaptive triage doctrine**  
  Exceptions are continuously re-ranked based on severity, downstream impact, ownership, elapsed time, and commit readiness.

- **Strong ownership doctrine**  
  Every active decision area must have a clearly visible current owner. Collaboration is allowed, but accountability cannot be ambiguous.

- **Graduated readiness doctrine**  
  Commit posture is expressed through explicit runtime states rather than a simple ready/not-ready binary.

- **Guided recovery doctrine**  
  Re-entry must restore continuity, show what changed, identify what still blocks progress, and recommend the best next step.

- **Operational transparency doctrine**  
  Auditability is a live runtime feature. Users should be able to see relevant decision history, ownership changes, escalation reasons, reconciliation logic, preserved continuity behavior, and commit rationale in context.

- **Recommend-and-guide interaction doctrine**  
  The tool continuously recommends the next best action, highlights the fastest safe path to readiness, and reduces decision friction without taking control away from the user.

## 3. Tool Posture

Budget Import is:

- an **always-on operational Financial tool**
- a **governed mutation path** into working Financial state
- a **project-scoped command center** for import/reconciliation work
- a **spine-publishing contributor** to audit/history and downstream Financial continuity

Budget Import is **not**:

- a file-drop utility
- a passive import log
- a silent data transformer
- a viewer-first admin screen

## 4. Primary Actors and Authority Model

### Primary actors
- Financial editors
- Project Manager (primary commit approver)
- Higher-authority users with fallback authority after PM response expiry
- View-only users with limited post-commit transparency

### Approval authority
- The **Project Manager** is the primary final approval authority for Apply Import.
- Higher-authority users may gain fallback approval authority **after the PM response window expires**.
- Once the PM window expires, the session becomes visible to **all Financial editors**, and **all Financial editors are allowed to commit it**.
- Higher-authority users also retain fallback visibility/authority if they otherwise have access.

### PM response window
- Default PM exclusive approval window: **1 business day**

### Fallback authority behavior
- When the PM response window expires:
  - the session becomes **Escalation Ready**
  - eligible higher-authority users are automatically notified
  - the session is visibly marked as escalation-ready
  - all Financial editors may see it and may commit it

### Escalated commit requirements
If an editor commits after PM non-response:
- a **reason-for-escalated-commit** note is required
- the PM is automatically notified
- the audit record must capture:
  - who committed
  - when they committed
  - why fallback authority was used

## 5. Canonical Runtime States

The tool must express graduated readiness through explicit runtime states such as:

- **Draft Session Created**
- **Parsing / Intake Review**
- **Reconciliation In Progress**
- **Blocked**
- **Conditionally Ready**
- **Ready for PM Approval**
- **Escalation Ready**
- **Ready for Fallback Commit**
- **Committed**
- **Post-Commit Review**

Each runtime state must expose:
- current owner
- next required action
- current authority holder
- what is preventing advancement
- whether the state is actionable here, blocked, waiting, escalated, or view-only

## 6. Entry and Landing Behavior

### Default landing behavior
- If an in-progress import session exists for the project, the user lands in that active session.
- If no in-progress session exists, the user lands on a clean start screen.

### Starting a new import while one is active
- New import is **blocked** if an active session already exists.
- The user must resume, cancel, or complete the existing session first.

## 7. Working State and Commit Boundary

### Staging doctrine
- Uploading a source file creates a **staged import session only**.
- No working Financial state is affected until review/reconciliation is completed and the user explicitly commits the import.

### Reconciliation rule for unmatched items
- Any imported line that cannot be confidently matched must be explicitly resolved before commit.

### Structural change with downstream activity
If the imported file would modify budget structures with downstream Financial activity:
- the system should allow the structural change **while automatically preserving downstream history and links where possible**
- continuity must be maintained across forecast, GC/GR, cash flow, buyout, and related financial records where feasible
- preserved continuity behavior must be visible in review/audit surfaces

## 8. Session Orchestration Model

The tool must behave as a **live operational session hub** with:

- workflow stage visibility
- blocker visibility
- collaboration visibility
- escalation visibility
- next-best-action guidance
- continuously reprioritized unresolved work

The session overview is the command center for the work.

## 9. Session Overview and Re-entry

### Re-entry behavior
When a user returns to an in-progress session:
- land on the **Session Overview** first
- clearly surface:
  - current progress
  - blocking issues
  - next required action
- prominently identify the **highest-priority unresolved issue** as the primary next path

### Progress model
Progress must be expressed as a hybrid of:
- **workflow stage progress**
- **issue-resolution progress**

These must remain visually distinct.

## 10. Exception Handling and Triage

### Priority stack
Unresolved items must be grouped in this default priority order:
1. **Blocking**
2. **High Risk**
3. **Warning**
4. **Informational**

### Exception model
- Exceptions are not a static issue list.
- The tool continuously re-ranks issues based on:
  - severity
  - downstream impact
  - ownership
  - elapsed time
  - commit readiness

### Blocking issue resolution
For blocking issues, the tool must support:
- **inline resolution**
- **dedicated blocker workspace**

Default path:
- use a **smart default based on issue complexity**
- simple blockers may open inline
- complex blockers may open in the dedicated blocker workspace

## 11. Collaboration, Ownership, and Concurrency

### Concurrency model
- Multiple Financial editors may be inside the same in-progress session simultaneously.
- Collaboration is allowed at the **section/item** level.
- Simultaneous edits to the same decision point or record are not allowed.

### Active item behavior
When one user is editing a specific reconciliation item:
- other users see that item in **read-only shadow**
- the current owner is visible
- other users may **request control**

### Control request behavior
- The current editor must first be given the opportunity to explicitly release the item.
- If they do not respond, control may transfer automatically after a timeout.

### Control request timeout
- Default timeout: **5 minutes**

### Unsaved work during auto-transfer
If control transfers due to timeout:
- the original editor’s unsaved in-item work is preserved as a **recoverable draft prompt on next return**
- that unsaved work is **not** merged automatically into the live item
- the handoff, timeout, and recoverable draft state must be auditable

## 12. Navigation and Leave Behavior

If a user attempts to navigate away from an active session with unresolved or unsaved work:
- show a soft warning
- make clear that unresolved or unsaved work exists
- provide at least:
  - **Save and Leave**
  - **Leave Without Saving**
  - **Stay**

No silent auto-save of partially considered reconciliation decisions.

## 13. Commit Readiness and Commit-Time Controls

### Commit readiness model
The tool must expose graduated readiness states rather than a simple ready/not-ready binary.

### Non-blocking risk handling
High Risk and Warning issues that do not block commit:
- must require explicit acknowledgment at commit
- do not prevent commit by themselves

### Acknowledgment model
- default acknowledgment is **category-level**
- designated **high-sensitivity** issues require **item-level acknowledgment**

### Partial acknowledgment persistence
If the user starts commit and cancels:
- entered acknowledgments are preserved for the **current session only**

### Material change invalidation
If a material change occurs after acknowledgment:
- only the affected acknowledgments are invalidated
- unaffected acknowledgments remain valid
- the tool must show:
  - an **interruptive alert**
  - **inline status changes** at affected items/categories

The runtime must make clear which acknowledgments were invalidated and why.

## 14. Commit Execution and Post-Commit Routing

### Post-commit landing
After successful commit:
- open the updated **Budget** surface immediately
- display a summary banner that identifies:
  - what changed
  - what downstream continuity was preserved
  - whether follow-up review is recommended

### Session disposition after commit
- the committed session becomes **post-commit review mode**
- it is no longer editable
- it remains reopenable for governed review/audit inspection

## 15. Post-Commit Review and Transparency

### Review mode visibility
Use a hybrid visibility model:
- users with **edit/approval authority** get full reconciliation transparency
- **view-only users** get summary-level visibility

### Full-detail transparency should include, where relevant:
- line-level mapping decisions
- preserved downstream link behavior
- warnings encountered
- user overrides
- acknowledgment history
- escalation reason
- commit reasoning
- ownership changes
- control handoff events

## 16. Recovery and Re-entry Doctrine

Recovery must be actively guided. On re-entry, the tool should:
- restore continuity
- show what changed since the user last worked
- identify what still blocks progress
- recommend the next best action

Recovery is not just state restoration. It is a guided resumption experience.

## 17. Mold-Breaker UX Requirements

The Budget Import tool must embody the application’s mold-breaker philosophy. It should:

- act like an operating system for reconciliation work, not a controlled upload form
- continuously recommend the next best action
- reduce navigation distance to the correct resolution surface
- make ownership and authority unmistakable
- show readiness posture in real time
- surface blocking vs non-blocking vs escalated vs waiting states clearly
- preserve strong governance without feeling bureaucratic
- make auditability useful during the work, not only afterward

## 18. Acceptance Criteria

Budget Import is not implementation-complete unless the developer delivers all of the following:

- resume-if-active landing behavior
- blocked new import while a session is already active
- staging-only mutation boundary before explicit commit
- explicit unmatched-line resolution before commit
- preserved downstream continuity behavior for structural changes where possible
- PM-first commit authority with 1-business-day exclusive response window
- automatic escalation-ready transition and notification after PM timeout
- reason-required escalated commit with PM notification
- post-commit landing in updated Budget surface with governed summary banner
- post-commit review mode with role-aware transparency
- session overview first on re-entry with next-best-action guidance
- section-level concurrency with visible ownership
- request-control, timed takeover, and recoverable unsaved draft behavior
- tiered unresolved-issue stack
- hybrid stage + issue progress model
- explicit acknowledgment of non-blocking risks at commit
- selective invalidation of acknowledgments after material change
- interruptive + inline visibility when acknowledgments are invalidated
- inline and dedicated blocker resolution paths with smart default by complexity
- graduated readiness model
- guided recovery model
- operational transparency model
- recommend-and-guide mold-breaker interaction behavior

## 19. Developer Note

The developer should not treat this spec as a screen behavior list only. This is a runtime governance doctrine. The Budget Import tool is expected to behave like a live, project-scoped, guided operational command center with strong ownership, explicit readiness posture, scenario-aware recovery, and audit-grade transparency.
