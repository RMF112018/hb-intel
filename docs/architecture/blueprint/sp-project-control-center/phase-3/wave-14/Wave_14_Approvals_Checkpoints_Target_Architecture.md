# Wave 14 Approvals / Checkpoints Target Architecture

## Authority

Phase 14 is the PCC-native approval/checkpoint control layer. It governs checkpoint queue semantics, route steps, decision states, decision history, and audit-event posture for approval/checkpoint workflows within PCC.

## Ownership Boundaries

- Source modules retain ownership of their underlying workflow records.
- Procore remains system of record for Procore-native records.
- Sage remains accounting book-of-record authority.
- SharePoint/Document Control remain file/document storage owners where applicable.
- HBI may cite and summarize only; HBI has no approval/decision authority.

## Guardrails

- Power Automate is reference-only for MVP posture.
- No external writeback is authorized.
- No tenant/list/group/security mutation is authorized.
- No runtime approval execution is introduced by this document.
