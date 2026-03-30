# Prompt 01 — Repo Truth and Release-Hardening Baseline

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 5 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Establish the exact current **release-hardening posture** for the retained Project Setup package before final production-readiness work begins.

This prompt is focused on creating the canonical release-hardening baseline and identifying what evidence is still missing.

## Critical instructions

- Use repo truth as authoritative.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** broaden this into broad redesign work.
- Do **not** assume prior phases are complete just because package files exist; verify what the repo actually contains.

## Required working approach

1. Review the retained Project Setup scope after Phases 1–4.
2. Inventory existing tests, smoke checks, diagnostics, release notes, deployment docs, rollback notes, and handoff docs.
3. Inventory remaining blockers or missing release evidence.
4. Build a release-hardening matrix showing what evidence exists, what is missing, and what still blocks launch.
5. Create or update markdown that becomes the governing baseline for the rest of Phase 5.

## Specific outcomes required

By the end of this prompt:
- there is one authoritative baseline for release hardening
- the retained launch surface is explicit
- missing evidence is categorized by severity and release impact
- later prompts can execute against a known baseline instead of rediscovering gaps

## Required implementation outputs

Create or update markdown summarizing:
- retained launch surface
- current release evidence inventory
- missing release evidence inventory
- blocker severity and release impact
- which remaining items are true launch blockers vs cleanup-only

## Acceptance criteria

- One authoritative release-hardening baseline exists in the repo.
- The team can clearly identify what must still be completed before launch.
- The retained Project Setup launch surface is explicit and stable enough for final hardening work.

## Required summary back to me

When done, report:
- files changed
- retained launch surface summary
- missing evidence by category
- blockers that must be closed in later Phase 5 prompts
- any contradictions discovered between prior phase expectations and repo truth
