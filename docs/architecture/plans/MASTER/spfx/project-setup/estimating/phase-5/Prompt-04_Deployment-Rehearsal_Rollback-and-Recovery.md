# Prompt 04 — Deployment Rehearsal, Rollback, and Recovery

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 5 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Implement the **deployment runbook, rollback guidance, and recovery procedures** required for a safe Project Setup production release.

This prompt is focused on making deployment execution repeatable and reversible.

## Critical instructions

- Use the Phase 5 baseline created in Prompt 01 as the governing source.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** assume deployment knowledge that is not written down.
- Do **not** produce rollback guidance that depends on memory, guesswork, or hidden operator steps.

## Required working approach

1. Review existing deployment notes, package deployment flow, backend release flow, connected-service prerequisites, and any current rollback notes.
2. Define the intended release sequence step by step.
3. Define post-deploy validation and smoke checks for each major step.
4. Define rollback and recovery procedures for likely failure classes.
5. Update or create markdown that becomes the authoritative runbook for Project Setup release execution.

## Specific outcomes required

By the end of this prompt:
- the deployment sequence is explicit and testable
- rollback procedures exist for likely failure cases
- recovery guidance exists for degraded states
- support/IT teams can execute or reverse the release without tribal knowledge

## Required implementation outputs

Create or update markdown covering at minimum:
- deployment prerequisites
- step-by-step release sequence
- post-deploy validation sequence
- rollback triggers and rollback steps
- degraded-mode / recovery guidance
- required operator decisions and escalation points

Where appropriate, add scripts/checklists/templates that reduce manual error during release.

## Acceptance criteria

- A release can be executed using the documented runbook.
- A failed release can be rolled back using the documented runbook.
- The deployment process is explicit enough for non-author developers to follow.

## Required summary back to me

When done, report:
- files changed
- deployment sequence documented
- rollback and recovery procedures added
- manual steps still required
- any remaining release-execution risks that must be accepted or closed
