# Controlling Objective — Wave 12 Constraints Log Implementation

Implement PCC Phase 3 Wave 12 as a flagship `Constraints Log` module with the user-facing subtitle `Make-Ready Constraint & Risk Exposure Center`.

The module must combine:

1. make-ready constraint management;
2. risk assessment matrix;
3. constraint exposure matrix;
4. risk-to-constraint lifecycle;
5. priority-action escalation posture;
6. root-cause / lessons-learned posture;
7. workbook-source traceability;
8. reference-only integration seams to related PCC modules.

This implementation is not a spreadsheet launcher, generic issue log, legal claims tool, forensic delay-analysis tool, enterprise risk-register replacement, change-order engine, scheduler editor, document-management engine, or external-system integration runtime.

## Non-Negotiable Implementation Gates

- Prompt 01 must be read-only.
- Prompt 02 must resolve the `constraints-log` source-model placement mismatch in a repo-consistent way before runtime work proceeds, if local repo truth confirms the mismatch remains.
- Backend work must remain GET-only.
- SPFx work must remain fixture-first unless backend opt-in is repo-standard and locally verified.
- No external-system runtime mutation is allowed.
- No legal/claim/delay determination behavior is allowed.
- Wave 12 evidence posture is link/reference only; no evidence-binary ownership.
- Wave 14 owns approval/checkpoint execution.
