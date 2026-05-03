# Lessons Learned System of Record and Integration Model

## System of Record

PCC is the system of record for the Lessons Learned record and all governance-derived fields.

## Source-System Boundaries

| Object / Fact | Owner | PCC Behavior |
|---|---|---|
| Lesson record | PCC | Create, classify, review, publish, redact, audit |
| RFIs/Submittals/Punch/Observations/Daily Logs | Procore or source system | Link and summarize only |
| Job-cost/accounting truth | Sage | Reference only |
| Evidence documents/photos/files | SharePoint/HB Central or source repository | Link only |
| HBI suggestions | PCC | Advisory artifact with audit trail |
| Improvement actions from lessons | PCC Lessons Learned | Own until a shared PCC action model supersedes it |

## Integration Guardrails

- No external writeback.
- No direct SPFx-to-source-system calls.
- No binary evidence storage changes.
- No source record duplication.
- Every source-derived field requires source lineage.
- Sensitive source content is redacted before HBI or broad dashboard use.
