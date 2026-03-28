# Project Hub Canonical PWA Routing Prompt Set

This prompt set is intended for a local code agent working inside the HB Intel monorepo.

## Run Order

1. `01_Ph3_Project_Hub_Routing_Repo_Truth_Validation_Prompt.md`
2. `02_Ph3_Project_Hub_Canonical_PWA_Routing_Implementation_Prompt.md`
3. `03_Ph3_Project_Hub_Routing_E2E_Test_and_Validation_Prompt.md`

## Purpose

This sequence is designed to:
- validate the repo-truth audit findings before implementation work begins
- resolve canonical PWA Project Hub routing in strict alignment with the Phase 3 plan family
- create comprehensive end-to-end coverage and execution evidence for the new routing model

## Expected Outcome

After all three prompts are completed, the repo should have:
- validated or corrected audit findings with explicit repo evidence
- a canonical Project Hub routing model in the PWA
- preserved portfolio-root behavior
- durable project-context continuity across launches and refreshes
- comprehensive automated tests and execution evidence for the routing contract

## Important Working Rule For The Agent

Do not re-read files that are already within your active working context or memory window. Re-read only when needed to verify changed content, recover lost context, or inspect a newly relevant dependency.
