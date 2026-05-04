# State, Routing, and Command Validation Contract

## Canonical States

`draft`, `requested`, `pending-review`, `in-review`, `revision-requested`, `approved`, `rejected-returned`, `deferred`, `waived`, `overridden`, `escalated`, `cancelled`, `superseded`, `expired`, `execution-pending`, `manually-closed`, `archived`

## Terminal States

- `approved`
- `rejected-returned`
- `deferred`
- `waived`
- `overridden`
- `cancelled`
- `superseded`
- `expired`
- `manually-closed`
- `archived`

`execution-pending` is not terminal. It means the decision is approved but a separate authorized operational actor must perform a blocked execution step such as access provisioning, site-health repair triage, or mapping correction implementation.

## Transition Rules

| Source State        | Target State         | Actor Roles                                                    | Required Fields                                        | Audit Event                    | Terminal | Priority Action Impact                | Source Module Impact   | Blocks Downstream     |
| ------------------- | -------------------- | -------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------ | -------- | ------------------------------------- | ---------------------- | --------------------- |
| `draft`             | `requested`          | source module owner, PCC Admin                                 | source reference, policy, route                        | `approval.requested`           | No       | create/update                         | notify owner module    | policy-defined        |
| `requested`         | `pending-review`     | system/backend, PCC Admin                                      | current step, assigned role                            | `approval.queued`              | No       | create                                | queue source prompt    | Yes if gate           |
| `pending-review`    | `in-review`          | assigned reviewer/approver                                     | actor identity                                         | `approval.review-started`      | No       | update                                | mark in review         | Yes                   |
| `pending-review`    | `revision-requested` | approver, reviewer if policy allows                            | comment, reason                                        | `approval.revision-requested`  | No       | update/resolve assigned action        | return to source       | Yes                   |
| `in-review`         | `revision-requested` | approver, reviewer if policy allows                            | comment, reason                                        | `approval.revision-requested`  | No       | update/resolve assigned action        | return to source       | Yes                   |
| `pending-review`    | `approved`           | authorized approver                                            | decision, optional comment, evidence if required       | `approval.approved`            | Yes      | resolve                               | emit approved          | No                    |
| `in-review`         | `approved`           | authorized approver                                            | decision, optional comment, evidence if required       | `approval.approved`            | Yes      | resolve                               | emit approved          | No                    |
| `pending-review`    | `rejected-returned`  | authorized approver                                            | reason, comment                                        | `approval.rejected-returned`   | Yes      | resolve/create source revision action | emit rejected-returned | Yes                   |
| `in-review`         | `rejected-returned`  | authorized approver                                            | reason, comment                                        | `approval.rejected-returned`   | Yes      | resolve/create source revision action | emit rejected-returned | Yes                   |
| `pending-review`    | `deferred`           | authorized approver, Project Executive, PCC Admin              | reason, defer-until date, owner                        | `approval.deferred`            | Yes      | resolve/create deferred follow-up     | emit deferred          | policy-defined        |
| `in-review`         | `deferred`           | authorized approver, Project Executive, PCC Admin              | reason, defer-until date, owner                        | `approval.deferred`            | Yes      | resolve/create deferred follow-up     | emit deferred          | policy-defined        |
| `pending-review`    | `waived`             | Project Executive, Executive Oversight, PCC Admin if technical | waiver reason, evidence, risk acknowledgement          | `approval.waived`              | Yes      | resolve/create risk follow-up         | emit waived            | No unless policy says |
| `in-review`         | `waived`             | Project Executive, Executive Oversight, PCC Admin if technical | waiver reason, evidence, risk acknowledgement          | `approval.waived`              | Yes      | resolve/create risk follow-up         | emit waived            | No unless policy says |
| `pending-review`    | `overridden`         | Executive Oversight, Project Executive where policy allows     | override reason, evidence, consequence acknowledgement | `approval.overridden`          | Yes      | resolve/create executive follow-up    | emit overridden        | No unless policy says |
| `in-review`         | `overridden`         | Executive Oversight, Project Executive where policy allows     | override reason, evidence, consequence acknowledgement | `approval.overridden`          | Yes      | resolve/create executive follow-up    | emit overridden        | No unless policy says |
| `pending-review`    | `escalated`          | assigned approver, source owner, PCC Admin, SLA policy         | escalation reason, escalation target                   | `approval.escalated`           | No       | create escalation action              | notify source owner    | Yes                   |
| `in-review`         | `escalated`          | assigned approver, source owner, PCC Admin, SLA policy         | escalation reason, escalation target                   | `approval.escalated`           | No       | create escalation action              | notify source owner    | Yes                   |
| `escalated`         | `approved`           | escalation approver                                            | decision, evidence if required                         | `approval.escalation-approved` | Yes      | resolve escalation                    | emit approved          | No                    |
| `escalated`         | `rejected-returned`  | escalation approver                                            | reason, comment                                        | `approval.escalation-rejected` | Yes      | resolve/create revision action        | emit rejected-returned | Yes                   |
| `requested`         | `cancelled`          | requestor, source owner, PCC Admin                             | cancellation reason                                    | `approval.cancelled`           | Yes      | resolve                               | emit cancelled         | No                    |
| `pending-review`    | `cancelled`          | requestor if not reviewed, source owner, PCC Admin             | cancellation reason                                    | `approval.cancelled`           | Yes      | resolve                               | emit cancelled         | No                    |
| `requested`         | `superseded`         | source owner, PCC Admin, policy engine                         | replacement source reference                           | `approval.superseded`          | Yes      | resolve/create replacement            | emit superseded        | Yes until replacement |
| `pending-review`    | `superseded`         | source owner, PCC Admin, policy engine                         | replacement source reference                           | `approval.superseded`          | Yes      | resolve/create replacement            | emit superseded        | Yes until replacement |
| `pending-review`    | `expired`            | SLA policy, PCC Admin                                          | expiration reason                                      | `approval.expired`             | Yes      | resolve/create escalation if required | emit expired           | Yes                   |
| `approved`          | `execution-pending`  | policy engine, PCC Admin                                       | execution target, executor role                        | `approval.execution-pending`   | No       | create execution pending action       | notify executor        | Yes until executed    |
| `execution-pending` | `manually-closed`    | PCC Admin, IT / Tenant Admin, Integration Admin                | close reason, evidence                                 | `approval.manually-closed`     | Yes      | resolve                               | emit manually-closed   | No                    |
| any terminal        | `archived`           | PCC Admin, retention policy                                    | archive reason                                         | `approval.archived`            | Yes      | none                                  | archive-visible        | No                    |

## Approval Mode Semantics

### `single-approver`

- One authorized approver resolves the step.
- Delegation allowed only if policy allows same-or-higher authority.
- Rejection returns or terminates based on `rejectionPolicy`.

### `sequential`

- Steps open one at a time.
- Later steps cannot decide until prior required steps resolve.
- Any step may request revision.
- Supersession invalidates all uncompleted steps.

### `parallel-all`

- All required approvers must decide.
- If policy uses `fail-fast-rejection`, first rejection moves to `rejected-returned`.
- If policy uses `collect-all-responses`, all decisions are collected before route resolution.

### `parallel-any`

- First authorized terminal decision resolves the step.
- Other pending participants are marked `not-needed-after-resolution`.
- Used only for equivalent-authority pools.

### `advisory-review`

- Participants can comment, recommend, mark reviewed, or request information.
- Advisory reviewers cannot approve, waive, override, cancel, supersede, or manual-close.

### `acknowledgement-only`

- Participant confirms awareness.
- Does not imply approval authority.
- Cannot unblock a gate unless policy states acknowledgement is the only requirement.

### `escalation-review`

- Preserves original source and route history.
- Adds escalation owner and escalation reason.
- Original route may be paused or remain visible based on policy.

### `admin-verification`

- Used for technical/security/governance checks.
- May move a record to `execution-pending`.
- Does not imply business approval unless the policy explicitly makes admin verification the approval authority.

## Stale and Superseded Source Rules

| Condition                                      | Required Result                                           |
| ---------------------------------------------- | --------------------------------------------------------- |
| Source record version changed after request    | mark `stale-source`; require revalidation or supersession |
| Evidence link changed after request            | require evidence revalidation                             |
| Estimate snapshot changed after freeze request | supersede prior request and create replacement checkpoint |
| Approver removed from project                  | reroute or escalate based on policy                       |
| Underlying source item closed externally       | cancel or manual-close with source reference              |
| Source module archived record                  | manual-close or archive after source owner confirmation   |
| Conflicting approval already exists            | block duplicate and link to existing request              |
| Policy version changed                         | keep current request on original policy unless superseded |
| Source item deleted/inaccessible               | escalate to source owner/PCC Admin and block decision     |

## Command Validation Layers

Every future command must validate:

1. Authentication present.
2. Actor role resolved.
3. Source project access valid.
4. Source record visible to actor.
5. Requested action allowed for actor role.
6. Source state allows target transition.
7. Route mode permits step decision.
8. Required fields present.
9. Required reason code valid.
10. Required evidence present.
11. HBI is not actor.
12. External writeback not attempted.
13. Tenant mutation not attempted.
14. Package/lockfile mutation not involved.
15. Source item is not stale/superseded unless action handles that condition.
16. Priority Actions update can be derived safely.
17. Project Readiness impact is computed without transferring ownership.
