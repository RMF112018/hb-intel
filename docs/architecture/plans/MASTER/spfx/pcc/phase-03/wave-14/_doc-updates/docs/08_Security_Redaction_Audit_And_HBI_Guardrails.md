# Security, Redaction, Audit, and HBI Guardrails

## Security Posture

Phase 14 must use role-filtered read models and redaction. Do not rely on item-level unique permissions as the default security strategy.

## Sensitive Field Categories

- financial exposure;
- legal/compliance notes;
- external-user justification;
- cost-code mapping exception rationale;
- executive override notes;
- owner/client-sensitive commentary;
- source-system identifiers;
- HBI summaries and citations where source content is restricted.

## Redaction Rules

| Viewer Type                      | Default Visibility                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| PCC Admin                        | broad visibility except legally restricted notes unless explicitly authorized            |
| IT / Tenant Admin                | technical/security/access details; financial details redacted unless needed              |
| Executive Oversight              | executive and high-risk detail, with source restrictions honored                         |
| Project Executive                | project-level decision context, high-risk exposure, restricted legal notes if authorized |
| Project Manager                  | operational context, source details, financial/legal redaction by policy                 |
| Superintendent                   | field/readiness/inspection context; financial/legal redacted                             |
| Project Accountant               | financial/cost-code/budget seed details; legal/security redacted as needed               |
| Estimating Roles                 | estimating workbench context per Wave 13G; project financial authority by role           |
| External / Owner / Subcontractor | only explicitly shared items; internal comments and authority notes redacted             |
| HBI Assistant                    | may only summarize visible, cited content; no decision rights                            |

## Audit Trail Types

### Business Audit Trail

Used for project traceability:

- state changes;
- owner changes;
- due date changes;
- decisions;
- comments;
- reasons;
- evidence links;
- escalations;
- reminders;
- supersessions.

### Security / Compliance Audit Trail

Used for governance investigation:

- unauthorized decision attempts;
- HBI attempted decision;
- external writeback attempts;
- tenant mutation attempts;
- sensitive field access;
- admin verification closures;
- policy changes;
- redaction changes.

## Audit Event Requirements

Every event must include:

- `eventId`
- `eventType`
- `approvalRequestId`
- `actorPrincipalKey`
- `actorRole`
- `occurredUtc`
- `sourceState`
- `targetState`
- `decisionAction`
- `reasonCode`
- `sourceModule`
- `sourceRecordId`
- `correlationId`
- `requestId`
- `redactionApplied`
- `unauthorizedAttempt`
- `externalWritebackAttempted`
- `hbiInvolved`
- `auditTrailType`

## HBI Grounding Contract

HBI may:

- summarize visible source context;
- identify missing evidence;
- explain policy requirements;
- cite source records;
- surface uncertainty;
- recommend what a human should review.

HBI may not:

- approve;
- reject;
- request revision as an actor;
- waive;
- override;
- defer;
- cancel;
- supersede;
- manual-close;
- execute access changes;
- execute mapping corrections;
- price;
- recommend award as authority;
- provide legal/accounting conclusions;
- mutate source records.

## HBI Refusal Behavior

HBI must refuse or redirect when asked to:

- make the approval decision;
- choose an award/pricing outcome;
- waive or override a policy;
- perform legal/compliance/accounting judgment;
- write to Procore/Sage/SharePoint/Graph;
- bypass evidence or role requirements.

## External Writeback Guardrail

All external writeback is blocked. Phase 14 may reference Procore, Sage, SharePoint, Document Crunch, Adobe Sign, or other systems for lineage only when authorized by existing read-model contracts. It cannot execute changes in those systems.
