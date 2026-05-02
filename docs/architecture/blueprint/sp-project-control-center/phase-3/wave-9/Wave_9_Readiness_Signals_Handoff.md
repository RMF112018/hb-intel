# Wave 9 — Lifecycle Readiness Signals (Handoff)

## Purpose

This document captures the display-only readiness signal posture introduced
in Wave 9 / Prompt 07. The signals prepare a future, separately-authorized
prompt to integrate Priority Actions and Approvals/Checkpoints into the
Project Lifecycle Readiness Center. Wave 9 ships **no execution path**:
nothing in the readiness signals surface enqueues, approves, returns,
waives, mutates, persists, or notifies.

## Implementation commits

- `1c13adde2` — backend lifecycle-readiness read model and GET route
- `afdc45137` — SPFx lifecycle-readiness client seam
- `cee86c619` — lifecycle-readiness command surface (8 regions)
- `0a61d53dd` — lifecycle-readiness item detail, evidence, risk, ownership,
  and degraded-state rendering
- _Prompt 07 commit_ — readiness signals (this document)

## Signal taxonomy

The PCC Project Lifecycle Readiness Center exposes seven canonical signal
kinds. Each signal is record-backed: the adapter reads existing fields on
the lifecycle read model and emits a kind only when the underlying record
satisfies the rule. No invented status; no editorial inference.

| Kind                       | Meaning                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| `blocked`                  | Item is currently blocked or its blocker is open / escalated.                                          |
| `overdue`                  | Item has a due date earlier than the envelope's `generatedAtUtc` and is still in an active status.     |
| `missing-evidence`         | Required evidence is not yet approved (or a conditional policy has been activated by a record signal). |
| `failed-safety`            | Safety-family item is in `failed` status.                                                              |
| `gate-blocking`            | Item gates one or more lifecycle gates and is at-risk or blocked.                                      |
| `awaiting-approval`        | Item references an approval checkpoint and has not reached a terminal-decided status.                  |
| `external-reference-issue` | Item is awaiting an external system setup, or has external references and is currently blocked.        |

## Derivation rules

Signals are computed in `lifecycleReadinessAdapter.ts` (`deriveSignals`) using
the published `@hbc/models/pcc` vocabulary literals. The clock for the
`overdue` signal is `envelope.generatedAtUtc` so the function is pure and
deterministic in tests.

```
blocked                ← project.posture === 'blocked'
                          OR project.blockerState ∈ {'open', 'escalated'}

overdue                ← project.dueDateUtc < envelope.generatedAtUtc
                          AND project.status ∈ ACTIVE_STATUSES

missing-evidence       ← project.status ∉ EVIDENCE_INACTIVE_STATUSES
                          AND ((template.evidencePolicy ∈ {
                                  'required-before-complete',
                                  'required-before-approval'
                                })
                               OR (template.evidencePolicy === 'conditional'
                                   AND project.evidenceLink is set))
                          AND evidence not approved

failed-safety          ← template.family === 'safety' AND project.status === 'failed'

gate-blocking          ← template.defaultGateImpact.length > 0
                          AND project.status ∈ ACTIVE_STATUSES
                          AND project.posture ∈ {'blocked', 'at-risk'}

awaiting-approval      ← project.approvalCheckpointReference is set
                          AND project.status ∉ APPROVAL_INACTIVE_STATUSES

external-reference-issue
                       ← project.exceptionCode === 'awaiting-external-system-setup'
                          OR (template.externalReferences.length > 0
                              AND (project.posture === 'blocked'
                                   OR project.blockerState === 'open'))
```

The vocabulary literals match
`packages/models/src/pcc/LifecycleReadiness.ts`. In particular,
`evidencePolicy` uses `'required-before-complete'` / `'required-before-approval'` /
`'conditional'` / `'optional'` / `'none'` / `'external-reference-only'`. There
is no plain `'required'` literal.

## Surface posture

The SPFx Project Readiness surface renders a 9th lifecycle region card,
`lifecycle-readiness-signals`, as a direct Fragment child of the bento
grid. The card carries the Wave 9 group marker
`data-pcc-readiness-section="lifecycle-readiness-center"` and renders:

- the seven signal-bucket markers (`data-pcc-lifecycle-signal-kind="…"`)
  with item counts;
- approval-posture entries with `data-pcc-lifecycle-approval-checkpoint`
  text labels (no hyperlinks);
- priority-action promotion entries with
  `data-pcc-lifecycle-priority-action-promotion-id` text labels (no
  hyperlinks);
- per-item signal chips inside the existing detail panel
  (`data-pcc-lifecycle-item-signal-kind="…"`).

All controls are inert. The card has no `<a href>`, no enabled buttons,
no `onClick` handlers, no runtime API clients.

## No-runtime / no-mutation invariant

Wave 9 / Prompt 07 introduces no executable path. The adapter contains no
mutation identifiers (no `executeApproval`, `submitApproval`,
`enqueueApproval`, `mutateApproval`, `runWorkflow`, `approveItem`,
`waiveItem`, `returnItem`). The dormancy guard test
(`pcc-api-dormancy.test.ts`) continues to enforce these forbidden tokens,
plus the broader forbidden runtime imports
(`@pnp/sp`, `@pnp/graph`, `@microsoft/sp-pnp-js`, `@microsoft/sp-http`,
`@hbc/auth/spfx`, `msgraph`, `graph.microsoft.com`, `procore`).

The lifecycle-readiness command surface remains:

- fixture-default by default (no live fetch when no `readModelClient`);
- read-only when a backend client is wired (envelope `readOnly: true`);
- record-backed (no invented compliance scores or estimated dates);
- bento direct-child preserving (no `<section>` wrapper around lifecycle
  cards).

## Display-only future integration handoff

The signals card is the contract surface a future prompt will use when
wiring Priority Actions and Approvals/Checkpoints integration. The
following are explicitly deferred:

- queue mutation;
- approval execution (`approve` / `return` / `waive`);
- workflow execution;
- notifications;
- live document/upload operations;
- Procore / Sage / Outlook / Document Crunch / Adobe Sign runtime;
- Safety platform runtime;
- Power Automate flows;
- production persistence writes;
- SharePoint list/library mutation;
- tenant or permission/group mutation;
- SPFx packaging or app-catalog deployment;
- secrets / app settings.

## Operator-pending hosted proof

Hosted/tenant proof of the live `pcc/projects/{projectId}/lifecycle-readiness`
GET route, including the new signals payload as observed via SPFx mount, is
operator-pending. The Wave 9 implementation gate
(`Wave_9_Implementation_Gate.md`) and the Wave 9 closeout prompt will
capture that proof when it is available.

## References

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Target_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Item_Library_Crosswalk.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Wave_9_Implementation_Gate.md`
- `apps/project-control-center/src/surfaces/projectReadiness/lifecycleReadinessAdapter.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/lifecycleReadinessViewModel.ts`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `packages/models/src/pcc/LifecycleReadiness.ts`
- `packages/models/src/pcc/fixtures/lifecycleReadiness.ts`
