# Prompt 01 — Repo Truth and Infrastructure Surface Baseline

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 4 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Establish the exact current **infrastructure and connected-services posture** for the retained Project Setup deployment.

This prompt is focused on building the baseline truth source that every later Phase 4 change must follow.

## Critical instructions

- Use the current Phase 1–3 outcomes as governing context for what remains in scope.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** broaden scope by inventorying unrelated modules beyond what is needed to understand Project Setup deployment dependencies.
- Do **not** begin redesigning validators, storage, or permissions in this prompt unless a tiny clarification change is required to produce accurate evidence.

## Required working approach

1. Inventory the active Project Setup backend/runtime entrypoints and retained connected services.
2. Inventory startup validation, service-factory initialization, environment-variable requirements, and feature flags that materially affect deployment.
3. Inventory every external dependency still implicated by Project Setup deployment, including Azure and Microsoft 365 services.
4. Classify each dependency as:
   - required for Project Setup production
   - optional but retained
   - unsupported / should be removed later
5. Produce an infrastructure baseline matrix.

## Specific outcomes required

By the end of this prompt:
- there should be one authoritative baseline for Phase 4
- the retained Project Setup infrastructure surface should be explicitly named
- hidden or over-broad dependencies should be surfaced
- later prompts should have a reliable list of what is truly in scope

## Required implementation outputs

Update or create markdown documenting:
- retained runtime dependencies
- startup validators and their scope
- environment/config dependencies
- connected Azure/Microsoft 365 services
- initial risks and unresolved infrastructure assumptions

## Acceptance criteria

- Every retained Project Setup infrastructure dependency is listed.
- The baseline distinguishes required, optional, and unsupported dependencies.
- Later prompts can use this baseline without re-discovering the same infrastructure surface.

## Required summary back to me

When done, report:
- files changed
- retained infrastructure dependencies
- over-broad startup/runtime dependencies discovered
- unsupported or suspicious dependencies that later prompts must resolve
