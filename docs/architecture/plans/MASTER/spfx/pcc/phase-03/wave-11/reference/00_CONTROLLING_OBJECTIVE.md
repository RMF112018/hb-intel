# 00 — Controlling Objective

Implement PCC Phase 3 Wave 11 as:

```text
Wave 11 — Responsibility Matrix
Subtitle: RACI + Owner-Contract Responsibility Control Center
```

The module converts workbook-derived responsibility sources into a governed, template-driven, project-instance-based responsibility control system.

## Non-Negotiable Module Identity

- Unified module, not multiple spreadsheet launchers.
- Project Readiness work center module.
- Internal RACI / RAM responsibility model.
- Owner-contract responsibility-reference posture.
- PM / Field operational responsibility defaults.
- Owner-contract active default obligations remain `0` until populated source obligations exist.
- Human review is required for ambiguous source semantics.
- Contract-party `C = Contractor` must never be conflated with RACI `C = Consulted`.

## Non-Negotiable Counts

- `109` = workbook-derived task-row context.
  - `82` PM task-row candidates.
  - `27` Field rows with assignment marks.
- `98` = strict marked assignment rows.
  - `71` PM marked assignment rows.
  - `27` Field marked assignment rows.
- Owner-contract active default obligations = `0`.

## Non-Negotiable Guardrails

The module must not:

- provide legal advice;
- interpret contracts automatically;
- create legal obligations;
- replace executed contracts;
- store evidence binaries;
- authorize external-system sync/writeback/mutation;
- execute approvals/checkpoints owned by Wave 14;
- mutate Team & Access state;
- call Graph/PnP/SharePoint REST/Procore/Sage/AHJ runtimes.
