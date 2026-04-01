# Phase 6 — Data Contract and SharePoint Schema Hardening

## Purpose

This package governs **Phase 6 — Data Contract and SharePoint Schema Hardening** for the Accounting-side Project Setup workflow and its connected backend persistence model.

The goal of this phase is to lock down the underlying request-record contract so the Accounting app and Project Setup backend can operate safely against the SharePoint `Projects` list and related provisioning records in production.

This phase assumes the prior phases have already frozen:
- lifecycle semantics
- backend transition authority
- Accounting UI workflow completion
- provisioning status/runtime behavior
- Admin exception-path handling

## What this phase covers

- the canonical SharePoint `Projects` list contract used by Project Setup
- repo-truth validation of current field mapping behavior
- internal-name vs display-name reconciliation
- required-field and optional-field policy
- persistence invariants for `requestId`, `projectId`, and `projectNumber`
- migration / compatibility handling for imported or legacy SharePoint columns
- documentation reconciliation and readiness signoff

## Ordered prompt sequence

1. `Prompt-01` — repo-truth data-contract and SharePoint schema audit
2. `Prompt-02` — canonical request-record contract freeze
3. `Prompt-03` — SharePoint mapper and persistence hardening
4. `Prompt-04` — migration / compatibility and schema validation hardening
5. `Prompt-05` — cross-surface contract verification
6. `Prompt-06` — final documentation reconciliation and readiness report

## Expected outputs

By the end of Phase 6, the repo should have:
- one authoritative documented Project Setup data contract
- one authoritative documented SharePoint field mapping contract
- hardened mapper/repository behavior for legacy/internal-name ambiguity
- verified persistence rules for key identifiers
- updated docs reflecting repo truth
- a closure report stating whether Phase 7 can proceed safely

## Notes for the local code agent

- Treat the live repo as authoritative implementation truth.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not invent schema or field mappings not evidenced by repo truth or attached source artifacts.
- Prefer reconciliation over wholesale redesign unless the repo truth clearly requires structural correction.
