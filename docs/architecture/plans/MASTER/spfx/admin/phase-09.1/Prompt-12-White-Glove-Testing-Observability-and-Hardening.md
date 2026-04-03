# Prompt-12 — White-Glove Testing, Observability, and Hardening

## Objective

Harden the white-glove feature with automated tests, observability, connector failure handling, run reconciliation, and supportable diagnostics.

## Important execution rules

- Do **not** re-read files that are already in your current context or memory unless necessary.
- Treat current repo truth as authoritative before making changes.
- Preserve the **Admin SPFx operator console / privileged backend** boundary.
- Do **not** push privileged execution into SPFx.
- Do **not** flatten Windows, macOS, iPhone, and iPad into one generic device workflow.
- Do **not** force Microsoft, Apple, and NinjaOne into one generic adapter.
- Use platform-native ownership honestly.
- Update existing authoritative docs instead of creating duplicate guidance unless this prompt explicitly requires a new authoritative doc.
- Keep acceptance criteria visible and verifiable.

## Inputs

Use the following as primary inputs:

- Prompt-01 through Prompt-11 outputs
- existing admin-intelligence probe patterns
- existing SignalR and polling patterns
- current backend/service-factory test patterns
- existing review and audit report formats under `docs/architecture/reviews/`

## Required repo / code / docs targets

Update these targets where appropriate:

- backend tests
- admin app tests
- feature package tests
- observability and diagnostic docs
- `docs/architecture/reviews/`
- `packages/features/admin/README.md`
- any runbook or maintenance docs that should be updated

## Work to perform

1. Add automated tests for:
   - connector validation success / failure
   - package launch validation
   - parent / child run creation
   - Microsoft lane
   - Apple lane
   - NinjaOne lane
   - checkpoint transitions
   - retry / repair / resume flows
2. Add or extend observability events for:
   - connector validation
   - package launch
   - child-device creation
   - downstream adapter call outcomes
   - evidence creation
   - recovery actions
3. Add run reconciliation and stale-run detection where appropriate.
4. Ensure degraded-mode and supportable error states are visible.
5. Produce a review / hardening report in the repo documenting what was validated and what remains deferred.

## Acceptance criteria

- Automated coverage exists for major domain paths and failure modes.
- Observability and supportable diagnostics are implemented.
- Stale-run or reconciliation behavior is defined where needed.
- A repo-level hardening review document exists.

## Documentation updates required

- Update runbooks, maintenance docs, and review reports.
- Record any still-deferred items explicitly in an authoritative review doc.

## Completion condition

Stop after automated validation, diagnostics, and a hardening review report are complete.
