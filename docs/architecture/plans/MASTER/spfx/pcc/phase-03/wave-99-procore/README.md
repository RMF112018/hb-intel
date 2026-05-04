# PCC Procore Data Layer — Wave 13A-13F Remediation Implementation Package

Generated: 2026-05-04

## Purpose

This package instructs a local code agent to implement the Procore data-layer remediation sequence formerly described as 12A-12F and now re-baselined as **13A-13F** because PCC implementation is actively progressing through Wave 13 `Buyout Log`.

## Implementation Posture

This is an implementation package, but it remains **mock-only / fixture-first / no live Procore runtime**.

It may add or update shared models, deterministic fixtures, backend mock-provider boundaries, GET-only read-model route seams, SPFx fixture/read-model presentation, tests, docs, and JSON reference artifacts. It must not add live Procore calls.

## Relationship to Wave 13 Buyout Log

The package must not duplicate or rewrite the Buyout Log implementation. It must audit current repo truth and then remediate Wave 13 so Buyout Log uses the common Procore data-layer contracts for commitments/change events/submittals/vendors/source-lineage, while preserving no write-back and no accounting-posting boundaries.

## Package Contents

- `docs/` — implementation scope, acceptance criteria, and allowed-file guidance.
- `artifacts/` — machine-readable contracts for code-agent execution.
- `prompts/` — staged prompts 13A through 13F.
- `reference/` — source context and validation expectations.
