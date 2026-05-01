# Research Pattern Reference

The local implementation must use research as product-pattern input, not as a mandate to clone outside tools.

## Construction Permitting Patterns

Typical permitting workflows include:

- application preparation/submission;
- plan review;
- review comments;
- revisions;
- fee payment;
- permit issuance;
- expiration monitoring;
- permit closeout;
- CO/CC/TCO dependencies.

Implementation implication:

- The Wave 10 model needs `revision`, `applicationValue`, `permitFee`, expiration state, evidence state, and closeout exposure.
- AHJ systems remain source of regulatory authority.
- PCC is internal workflow/accountability/readiness posture only.

## Inspection Tracking Patterns

Typical inspection workflows include:

- inspection requested / scheduled / completed;
- pass/fail/partial/N/A result status;
- deficiencies or corrective action;
- attachments/photos/reports;
- reinspection requirement;
- reinspection lineage and fees;
- closeout evidence.

Implementation implication:

- Failed inspections must create parent/child reinspection lineage.
- `reInspectionFee` is required.
- Inspection readiness, failed inspection, and reinspection required states must generate read-only signals.

## Permit / Inspection Software Patterns

Common product patterns from Procore, OpenGov, Autodesk Build, SafetyCulture, and similar tools include:

- configurable workflow states;
- inspection schedules;
- result/status transitions;
- linked attachments/evidence;
- user assignment;
- overdue indicators;
- payment/fee exposure;
- mobile inspection field data;
- dashboard exception queues.

Implementation implication:

- HB Intel should implement exception-first command-center lanes.
- External systems remain launcher/reference only.
- Do not clone vendor-specific behavior or introduce unauthorized runtime integrations.

## Tooling Validation Patterns

Use:

- `git status --short` for concise working-tree status;
- `git diff --cached --name-only` for staged-file proof;
- `git diff --check` for whitespace/conflict marker detection;
- `pnpm exec prettier --check <exact touched files>` for formatting verification without broad writes;
- package-specific typecheck/test/build commands.
