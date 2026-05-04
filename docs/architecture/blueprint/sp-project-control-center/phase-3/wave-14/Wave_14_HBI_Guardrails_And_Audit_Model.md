# Wave 14 HBI Guardrails and Audit Model

## Security and Redaction Posture

Phase 14 security posture uses inherited storage permissions plus backend read-model filtering and field-level redaction.

- No default item-level unique permission strategy for approvals/checkpoints.
- Role/persona visibility is enforced in read-model responses.
- Sensitive field visibility follows policy and audit traceability.

## Redaction Contract

Sensitive categories include financial exposure, legal/compliance notes, external-user rationale, executive overrides, source identifiers, and restricted HBI citation contexts.

Redaction rules are role-aware and must preserve enough context to explain disabled actions, stale-source holds, and escalation paths without exposing restricted details.

## Audit Model

### Business Audit Trail

Append-only event trail for project-operational traceability:

- state transitions;
- ownership changes;
- decisions/reasons/comments;
- evidence link changes;
- escalations/reminders/supersessions.

### Security and Compliance Audit Trail

Append-only security/governance trail:

- unauthorized decision attempts;
- HBI attempted decision actions;
- external writeback attempts;
- tenant/security mutation attempts;
- sensitive field access and redaction-policy enforcement events.

## Append-Only Event Requirements

Audit events must be append-only and include actor, role, source/target state, action, reason, source reference, correlation identifiers, redaction markers, and unauthorized/writeback flags.

## HBI Allowed Behavior

HBI may:

- summarize visible evidence-backed context;
- identify missing evidence;
- explain policy/routing requirements;
- cite source records;
- surface uncertainty and recommend human review scope.

## HBI Refused Behavior

HBI must refuse:

- approval/rejection/revision/defer/waive/override/cancel/supersede/manual-close decisions;
- pricing, award, legal, or accounting authority actions;
- access/mapping/repair execution;
- bypass of role, policy, evidence, stale-source, or supersession controls.

## External Writeback Guard

No writeback is authorized to Procore, Sage, SharePoint/Graph, Document Crunch, Adobe Sign, or any external system from Phase 14 checkpoint actions.

## Scope Guardrail

This document defines governance contracts only. It does not implement runtime approval execution, backend command routes, SPFx components, TypeScript models, SharePoint lists, package/dependency changes, lockfile mutation, tenant/security mutation, Procore/Sage/Power Automate writeback, deployment, or production rollout.
