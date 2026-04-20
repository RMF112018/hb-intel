# Review-PER_Governance-Spec
**Financial Module — Definitive Runtime Doctrine (Draft v1)**

## 1. Purpose

The Review / PER tool is a governed internal review and approval operating surface inside the Financial module. It is not a passive signoff packet, not a simple comment page, and not a final-stage formality. Its purpose is to assemble the period package into an approval-ready state, surface what still blocks approval, convert reviewer input into governed review issues, identify material deltas from the prior period, and guide the Project Manager and Project Executive through the fastest safe path to internal approval or revision closure.

## 2. Runtime Doctrine Summary

The Review / PER tool is governed by the following runtime doctrines:

- **Guided review command-center doctrine**  
  Review / PER behaves as an intelligent review surface that actively highlights unresolved readiness blockers, material deltas from the prior period, major risk explanations, missing reviewer inputs, pending approvals, and the next best action needed to move the period package toward internal approval.

- **Approval-readiness command-center doctrine**  
  The tool behaves as a live operational hub. It continuously surfaces what still blocks approval, who still owes input, which issues remain unresolved, what materially changed from the prior period, and the best next action to move the package toward internal approval.

- **PM-prepared, PE-led approval doctrine**  
  The Project Manager prepares and advances the package to review readiness, while the Project Executive is the primary internal reviewing and approval authority.

- **Governed review-issue doctrine**  
  Reviewer feedback must be converted into governed review issues with explicit status, owner, required response, resolution state, and approval impact.

- **Guided material-delta doctrine**  
  The tool must actively identify material changes from the prior period, explain why they matter, group them by impact area, and route reviewers directly to the exact underlying section/tool that drove the change.

- **Graduated approval-readiness doctrine**  
  Approval posture must be expressed through explicit runtime states rather than vague ready/not-ready language.

- **Guided revision doctrine**  
  When a package is returned for revisions, the tool must actively show what was returned, what changed state, which review issues still block approval, who owns each required revision, and the fastest safe path back to Approval Ready.

- **Recommend-and-advance doctrine**  
  The tool continuously recommends the next best action, tells the PM exactly what still prevents advancement, tells the PE exactly what still requires decision or approval, highlights material deltas and unresolved review issues, and guides users into the fastest safe path toward approval or revision closure.

## 3. Tool Posture

Review / PER is:

- an **always-on operational review and approval tool**
- an **approval-readiness command center**
- a **period package control surface**
- a **governed review-issue and revision workflow**
- a **material-delta visibility and decision surface**
- a **PM-to-PE internal approval pathway**

Review / PER is **not**:

- a passive signoff sheet
- a comment-only discussion surface
- a final-stage formality with no operational guidance
- a loosely structured packet archive

## 4. Primary Actors and Authority Model

### Primary actors
- Project Manager (PM)
- Project Executive (PE)
- Contributors and reviewers as needed
- View-only stakeholders where permitted

### Core authority split
- **PM** owns preparation, consolidation, and advancement to review readiness
- **PE** owns primary internal review posture, decision authority, and approval posture

### Runtime expectation
The tool must keep these roles distinct at all times:
- PM = prepare, consolidate, respond, resubmit
- PE = review, disposition, approve, return for revision

The runtime must not blur package preparation and package approval into a shared or ambiguous role.

## 5. Canonical Approval-Readiness States

Review / PER must use a governed graduated approval-readiness state model. The state model should include at least:

- **Draft**
- **In PM Preparation**
- **Review Ready**
- **Under PE Review**
- **Revisions Required**
- **Approval Ready**
- **Approved**
- **Returned / Reopened**

### State visibility requirement
At all times, the runtime must make it obvious:
- who currently owns the package
- what still blocks advancement
- what the next valid state transition is
- whether the package is actively under review, waiting on revisions, or ready to advance

## 6. Session Orchestration Model

Review / PER must behave as a **live operational approval-readiness hub**. It must continuously surface:

- what still blocks approval
- who still owes input
- which review issues remain unresolved
- what materially changed from the prior period
- what major risks still require explanation or resolution
- what the best next action is to move the package toward internal approval

The tool must remain operationally useful both **before** and **during** approval, not only at final signoff.

## 7. Review-Issue Governance Model

Reviewer feedback must not remain loose commentary. It must become governed review issues.

### Each review issue must have:
- explicit status
- named owner
- required response
- resolution state
- approval impact

### Review issue runtime behavior
The tool must actively track:
- what still blocks approval
- what has been answered
- what remains unresolved
- which issues are merely informational vs approval-blocking
- which issues are tied to specific underlying Financial tools or sections

## 8. Material-Delta Review Model

Review / PER must actively identify **material changes from the prior period**.

### The runtime must:
- explain why each material change matters
- group changes by impact area
- route reviewers directly to the exact underlying section/tool that drove the change

### Impact areas may include, for example:
- profit changes
- potential profit changes
- schedule impacts
- budget/exposure impacts
- buyout posture changes
- cash/liquidity impacts
- risk/compliance changes

Delta visibility must be operational and approval-oriented, not merely comparative.

## 9. Review Feedback and Approval Interaction

The tool must support an active approval workflow rather than a passive note exchange.

### PM expectations
The PM must be able to see:
- package readiness state
- unresolved review issues
- what still blocks advancement
- which material deltas need explanation
- what revisions are required after return

### PE expectations
The PE must be able to see:
- what materially changed
- what is still unresolved
- what requires executive judgment
- what has been answered / resolved
- what still blocks approval vs what is informational

## 10. Returned / Reopened Package Behavior

When a package is returned for revisions, the tool must use the **Guided Revision Doctrine**.

### The runtime must actively show:
- what was returned
- what changed state
- which review issues still block approval
- who owns each required revision
- the fastest safe path back to **Approval Ready**

Returned packages must remain operationally guided. The PM must not be forced to reconstruct the revision path manually from scattered notes.

## 11. Recommend-and-Advance Interaction Model

Review / PER must use the **Recommend-and-Advance Doctrine**.

### The runtime must:
- continuously recommend the next best action
- tell the PM exactly what still prevents advancement
- tell the PE exactly what still requires decision or approval
- highlight material deltas and unresolved review issues
- guide users into the fastest safe path toward:
  - approval
  - revision closure
  - resubmission readiness

The tool should guide without over-automating judgment.

## 12. Mold-Breaker UX Requirements

Review / PER must embody the application’s mold-breaker philosophy. It should:

- act as an approval-readiness operating system, not a passive review packet
- continuously recommend the next best action
- make PM vs PE responsibilities unmistakable
- turn reviewer feedback into trackable governed work
- surface what changed from the prior period and why it matters
- shorten navigation distance into the exact underlying section/tool driving a change or issue
- make returned packages easy to recover and re-advance
- keep approval posture visible in real time
- preserve strong governance without becoming bureaucratic

## 13. Acceptance Criteria

Review / PER is not implementation-complete unless the developer delivers all of the following:

- guided review command-center behavior
- approval-readiness command-center behavior
- PM-prepared / PE-led approval model
- governed review-issue model with explicit status, owner, response, resolution state, and approval impact
- guided material-delta visibility tied to the prior period
- routing from deltas/issues to the exact underlying section or tool
- graduated approval-readiness state model
- guided returned/reopened revision behavior
- recommend-and-advance mold-breaker interaction behavior
- clear runtime visibility of:
  - current owner
  - blockers
  - pending reviewer inputs
  - unresolved review issues
  - required next action
  - valid next state transition

## 14. Developer Note

The developer should not implement Review / PER as a static approval packet with comments. This is a runtime governance doctrine for a live internal approval-readiness surface. The mold-breaker opportunity is in guided issue resolution, role clarity, material-delta interpretation, revision recovery, and active movement toward decision readiness.
