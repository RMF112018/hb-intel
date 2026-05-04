# Wave 14 and Wave 13G Estimating Checkpoint Contract

## Authority Split

- Wave 13G owns estimating feature contracts and UX.
- Phase 14 owns approval/checkpoint queue semantics, route-step semantics, decision semantics, stale/supersession semantics, and audit semantics when estimating workflows are checkpointed.

## Estimating Checkpoint Matrix

| Checkpointed Estimating Seam | Wave 13G Owns                                         | Phase 14 Owns                                                | Required Checkpoint Evidence                                    | Primary Authority                                 | Stale/Supersession Rule                                                |
| ---------------------------- | ----------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| Estimate freeze              | estimate feature workflow and freeze intent model     | queue/routing/decision/audit semantics for freeze checkpoint | snapshot id/version, variance context, freeze rationale         | Chief Estimator / Director of Preconstruction     | supersede when newer snapshot replaces freeze candidate                |
| Baseline                     | baseline feature contract and baseline data semantics | checkpoint state transitions and decision history            | baseline snapshot reference, assumptions/inclusions/exclusions  | Estimating leadership + authorized approver chain | stale baseline inputs block decision until revalidation                |
| Handoff                      | handoff package construction semantics                | handoff checkpoint route + terminal decision trail           | handoff package, downstream target, risk notes                  | Project Executive / Director of Preconstruction   | supersede on handoff package version replacement                       |
| Validation override          | estimating validation-rule ownership                  | override checkpoint policy/decision semantics                | validation failure context, reason, mitigation evidence         | Chief Estimator / PCC Admin (technical cases)     | stale validation state requires re-evaluation before override decision |
| Buyout seed                  | estimating seed source semantics                      | buyout-seed checkpoint queue/decision semantics              | approved baseline, cost-code seed, scope mapping summary        | Project Executive / Project Accountant            | supersede when baseline/cost-code source changes                       |
| Template-admin approval      | template feature ownership and UX                     | admin checkpoint semantics for template approval workflow    | template change summary, affected project set, governance notes | PCC Admin / Director of Preconstruction           | stale template version requires supersession/re-approval               |
| Cost-code mapping exception  | mapping feature semantics in estimating context       | mapping-exception checkpoint queue/decision trail            | source code, target code, exception reason, impact notes        | Project Accountant / Estimating leadership        | stale mapping source invalidates pending decision                      |

## Checkpoint Routing Rule

All checkpointed seams listed above route through Phase 14 semantics for queue assignment, mode evaluation, action validation, decision history, and audit-event traceability.

## HBI Non-Authority Rule

HBI may cite and summarize estimating context. HBI cannot price, approve, waive, override, or recommend award as authority.

## Guardrails

- No transfer of estimating feature ownership from Wave 13G.
- No runtime writeback to external systems.
- No runtime command execution authorization in this document.
