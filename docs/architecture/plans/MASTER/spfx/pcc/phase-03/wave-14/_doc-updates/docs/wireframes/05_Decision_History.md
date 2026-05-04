# Wireframe — Decision History

## Objective

Provide a complete chronological record of approvals, comments, evidence, escalations, reminders, supersessions, and closure.

## Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Decision History: ApprovalRequest APR-000123                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Summary: Current State | Source | Policy Version | Supersession Chain        │
├──────────────────────────────────────────────────────────────────────────────┤
│ Timeline                                                                     │
│ [Audit] requested by PM at 2026-05-04 09:12                                  │
│ [Audit] evidence added: Estimate Snapshot v7                                 │
│ [Audit] review started by Lead Estimator                                     │
│ [Audit] comment added, visibility internal                                   │
│ [Audit] revision requested with reason: missing-field                        │
│ [Audit] source snapshot superseded by EST-0042 v8                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Required Data

- audit events;
- decisions;
- comments;
- evidence changes;
- reminders;
- escalations;
- supersession chain;
- redaction flags.

## Interaction Rules

- Events are append-only.
- Sensitive events are redacted by role.
- Export is disabled unless future prompt authorizes export.
- Superseded records link to replacement request.

## Acceptance Criteria

- Authorized user can reconstruct decision chronology.
- Unauthorized user cannot see restricted fields.
- HBI involvement is explicit when present.
