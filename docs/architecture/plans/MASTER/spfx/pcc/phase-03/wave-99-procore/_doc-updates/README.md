# PCC Procore Data Layer — Documentation Roadmap Update Package

Generated: 2026-05-04

## Purpose

This package updates the prior PCC Procore Integration Foundation documentation prompt package so local code agents have a machine-readable implementation roadmap for the Procore data layer while PCC is progressing through **Phase 3 / Wave 13 — Buyout Log**.

The package is documentation-only. It does not implement Procore runtime behavior.

## Core Position

- Procore data integration is a **cross-cutting data layer**, not a standalone PCC workflow module.
- Wave 13 Buyout Log must be allowed to continue, but it should consume common Procore mapping/object-link/curated-summary/source-lineage contracts rather than inventing Buyout-specific Procore semantics.
- The former 12A–12F remediation sequence is renamed and re-baselined as **13A–13F**.
- `Projects.procoreProject` remains a current-state / legacy mapping hint only. Canonical integration mapping belongs in a dedicated Procore Project Mapping contract.

## Package Contents

- `docs/` — documentation-update instructions and roadmap narrative.
- `artifacts/` — machine-readable roadmap, remediation matrix, validation gates, and agent execution rules.
- `prompts/` — local-code-agent prompts for updating repo documentation.
- `reference/` — source context and current roadmap summary.

## Strict Scope

Documentation, JSON artifacts, cross-reference updates, and closeout evidence only. No runtime Procore calls, no SDK dependency, no package/lockfile mutation, no live sync, no write-back, no file mirror.
