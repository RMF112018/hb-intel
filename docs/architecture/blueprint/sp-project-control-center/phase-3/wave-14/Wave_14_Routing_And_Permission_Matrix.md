# Wave 14 Routing and Permission Matrix

## Approval Modes

| Mode                   | Completion Rule                                         | Notes                                                 |
| ---------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| `single-approver`      | one authorized approver terminal decision resolves step | delegation only if policy allows                      |
| `sequential`           | steps resolve in order                                  | supersession invalidates uncompleted downstream steps |
| `parallel-all`         | all required approvers decide                           | fail-fast or collect-all by policy                    |
| `parallel-any`         | first authorized terminal decision resolves             | remaining actors become not-needed                    |
| `advisory-review`      | reviewers provide recommendations only                  | cannot approve/waive/override/cancel                  |
| `acknowledgement-only` | recipient confirms awareness                            | acknowledgement is not approval authority             |
| `escalation-review`    | escalation owner reviews with history preserved         | original route pause/visibility by policy             |
| `admin-verification`   | technical/governance verification step                  | may yield `execution-pending`, not external execution |

## Role and Decision Matrix (Condensed)

| Role Class              | Review          | Approve                         | Reject/Return                        | Defer          | Waive            | Override       | Escalate             | Admin Verify   | Manual Close              |
| ----------------------- | --------------- | ------------------------------- | ------------------------------------ | -------------- | ---------------- | -------------- | -------------------- | -------------- | ------------------------- |
| Reviewer-only roles     | Yes             | No                              | Policy-limited revision request only | No             | No               | No             | Yes (policy-limited) | No             | No                        |
| Standard approver roles | Yes             | Yes                             | Yes                                  | Policy-limited | No               | No             | Yes                  | No             | No                        |
| Elevated approver roles | Yes             | Yes                             | Yes                                  | Yes            | Yes              | Policy-limited | Yes                  | No             | No                        |
| PCC Admin               | Yes             | technical/governance lanes      | Yes                                  | Yes            | technical waiver | No             | Yes                  | Yes            | Yes                       |
| IT / Tenant Admin       | technical lanes | No business approval by default | No business reject by default        | No             | No               | No             | Yes                  | Yes            | execution-pending closure |
| Executive Oversight     | Yes             | Yes                             | Yes                                  | Yes            | Yes              | Yes            | Yes                  | Policy-limited | Policy-limited            |
| HBI                     | No              | No                              | No                                   | No             | No               | No             | No                   | No             | No                        |

## Reviewer vs Approver vs Admin-Verification

- Reviewer: advisory/recommendation posture; cannot execute terminal business approval unless explicitly policy-assigned as approver.
- Approver: policy-authorized decision actor for queue terminal or non-terminal decision actions.
- Admin verifier: confirms technical/governance controls; does not imply business approval authority.

## Current Action Owner Resolution

`currentActionOwnerRole` / `currentActionOwnerPrincipalKey` resolve by:

1. current open route step;
2. mode completion semantics;
3. escalation overrides;
4. stale/supersession holds.

## Stale and Supersession Routing Behavior

- Stale source: route enters blocked-decision posture until revalidation/supersession.
- Superseded request: old route terminalizes to `superseded`; replacement request initializes at `requested`.
- Escalation does not erase prior route history; lineage remains intact.

## Command Validation Guardrail

Routing decisions must fail closed when any authorization, mode, required-field, stale-source, or evidence rule is unmet.

## Non-Authorization

This matrix defines governance contracts only. It does not authorize backend runtime command execution or external writeback.
