# Wave 14 Domain Model and State Machine

## Domain Entities

Core entity families:

- `ApprovalRequest`
- `ApprovalPolicy`
- `ApprovalRoute`
- `ApprovalStep`
- `ApprovalParticipant`
- `ApprovalDecision`
- `CheckpointDefinition`
- `CheckpointInstance`
- `CheckpointEvidenceLink`
- `CheckpointSourceReference`
- `CheckpointAuditEvent`

## Policy Versioning Contract

- Every request captures immutable `approvalPolicyId` + `approvalPolicyVersion` at creation.
- Active requests do not auto-upgrade to newer policies.
- Policy change requiring new logic must use supersession to a replacement request.

## State Transition Table

| From                         | To                             | Action                   | Actor Class                                | Required Controls                               |
| ---------------------------- | ------------------------------ | ------------------------ | ------------------------------------------ | ----------------------------------------------- |
| `draft`                      | `requested`                    | `request`                | source owner / PCC Admin                   | source refs + policy + route                    |
| `requested`                  | `pending-review`               | `queue`                  | system/backend / PCC Admin                 | step assignment                                 |
| `pending-review`             | `in-review`                    | `start-review`           | assigned reviewer/approver                 | actor identity                                  |
| `pending-review`/`in-review` | `revision-requested`           | `request-revision`       | approver/reviewer if policy allows         | reason + comment                                |
| `pending-review`/`in-review` | `approved`                     | `approve`                | authorized approver                        | required evidence if policy requires            |
| `pending-review`/`in-review` | `rejected-returned`            | `reject-return`          | authorized approver                        | reason + comment                                |
| `pending-review`/`in-review` | `deferred`                     | `defer`                  | authorized approver / PE / PCC Admin       | reason + defer date + follow-up owner           |
| `pending-review`/`in-review` | `waived`                       | `waive-with-reason`      | elevated authority                         | reason + evidence + risk acknowledgement        |
| `pending-review`/`in-review` | `overridden`                   | `override-with-reason`   | executive authority                        | reason + evidence + consequence acknowledgement |
| `pending-review`/`in-review` | `escalated`                    | `escalate`               | approver/source owner/PCC Admin/SLA policy | escalation reason + target                      |
| `escalated`                  | `approved`/`rejected-returned` | escalation decision      | escalation authority                       | mode/policy constraints                         |
| `requested`/`pending-review` | `cancelled`                    | `cancel`                 | requestor/source owner/PCC Admin           | cancellation reason                             |
| `requested`/`pending-review` | `superseded`                   | `supersede`              | source owner/PCC Admin/policy engine       | replacement source ref                          |
| `pending-review`             | `expired`                      | `expire`                 | SLA policy/PCC Admin                       | expiration reason                               |
| `approved`                   | `execution-pending`            | `mark-execution-pending` | policy engine/PCC Admin                    | executor role + execution target                |
| `execution-pending`          | `manually-closed`              | `manual-close`           | PCC Admin/IT/Integration Admin             | close reason + evidence                         |
| terminal                     | `archived`                     | `archive`                | PCC Admin/retention policy                 | archive reason                                  |

## Decision Actions and Reason Codes

Decision actions:

`approve`, `reject-return`, `request-revision`, `acknowledge`, `defer`, `waive-with-reason`, `override-with-reason`, `escalate`, `cancel`, `supersede`, `manual-close`

Reason-code catalog families:

- reject-return;
- request-revision;
- defer;
- waive-with-reason;
- override-with-reason;
- escalate;
- cancel;
- supersede;
- manual-close.

Each non-approve terminal action requires a valid reason code from its action family.

## Stale and Supersession Rules

- Source record version changed: block decision until revalidation or supersession.
- Evidence updated after request: require evidence revalidation.
- Source item inaccessible/deleted: escalate and block terminal decision.
- Duplicate conflicting checkpoint: block duplicate, link to canonical open request.

## Evidence Requirements

- Waive/override/manual-close always require evidence references.
- Approve requires evidence where policy marks evidence as mandatory.
- Readiness/freeze gates require completeness + freshness evidence checks.

## Command Validation Layers (Contract Only)

Command intent must validate, at minimum:

1. authenticated actor;
2. role/action authorization;
3. legal source-state transition;
4. route-mode completion rule;
5. required fields;
6. reason-code validity;
7. evidence requirements;
8. stale/supersession handling;
9. no HBI actor;
10. no external writeback;
11. no tenant mutation.

## Implementation Lock

Prompt 03 defines architecture contracts only. It does not create/modify TypeScript runtime models, backend routes, command handlers, or SPFx runtime components.
