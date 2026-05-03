# PCC Audit Event Model

## Purpose

Define audit events required for sensitive PCC lifecycle, memory, cross-project, HBI, warranty, and permission behaviors.

## Required Audit Families

- Record viewed.
- Record redacted/masked/withheld.
- Lens switched.
- Cross-project search executed.
- HBI query submitted.
- HBI answer/refusal generated.
- Citation opened.
- Source link launched.
- Warranty responsibility recommendation viewed.
- Record classification changed.
- Permission escalation requested.
- Evidence link added/removed.

## Rules

- Audit logs are append-only in future runtime.
- Audit records inherit appropriate retention class.
- Sensitive query content should be hashed or redacted where appropriate.
- HBI answers/refusals must be auditable by answer ID and refusal reason.

## Reference JSON

Use `reference/audit_event_model.json` as machine-readable source.
