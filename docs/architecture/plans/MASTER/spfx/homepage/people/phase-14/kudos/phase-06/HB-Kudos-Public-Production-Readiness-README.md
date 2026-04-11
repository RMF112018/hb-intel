# HB Kudos Public Surface — Production Readiness Prompt Package

## Purpose

This package is a **post-remediation closure package** for the public-facing HB Kudos webpart.

It is intended for use **after** the prior UI remediation sequence has already been executed and pushed, but where the resulting product still does **not** yet credibly clear production-readiness due to a small set of remaining but important gaps.

This package is narrower than the earlier broad UI remediation package. It is focused on **finishing**, **stabilizing**, and **proving** the public surface.

## Current condition summary

The latest review found real improvement, but the public HB Kudos webpart is still **not production ready** for four main reasons:

1. The featured recognition / hero spotlight is not rendering with credible product integrity.
2. The composer/footer is not sufficiently host-aware for persistent SharePoint-owned lower-right page controls.
3. The final-state public surface still needs stricter validation against homepage doctrine, UI-kit governance, and real SharePoint runtime conditions.
4. Packaging may be structurally fresh, but the updated public experience still needs a disciplined final closure pass.

## Package contents

### Governing docs
- `HB-Kudos-Public-Production-Readiness-Plan-Summary.md`
- `HB-Kudos-Public-Production-Readiness-Matrix.md`

### Prompt sequence
- `Prompt-01-HB-Kudos-Public-Featured-Surface-Restoration.md`
- `Prompt-02-HB-Kudos-Public-Composer-Host-Aware-Closure.md`
- `Prompt-03-HB-Kudos-Public-Shared-Surface-and-Contract-Alignment.md`
- `Prompt-04-HB-Kudos-Public-Manifest-Accessibility-and-Theme-Readiness.md`
- `Prompt-05-HB-Kudos-Public-Production-Sweep-and-Packaging.md`

## Execution order

Run the prompts in numeric order.

Do **not** skip directly to Prompt 05.  
Prompt 05 is the release-gate pass and depends on the preceding closure work.

## Operating expectations for the agent

The prompts are written to keep the **intent and target product explicit** while leaving the implementation path open enough for the agent to choose the right local/shared/UI-kit boundary decisions.

The agent should:

- use live repo truth
- avoid re-reading files that are already in active context or memory
- maintain strict compliance with `@hbc/ui-kit` and `docs/reference/ui-kit/`
- promote or relocate UI only when it is justified by durable reuse or governance
- remain skeptical and evidence-based
- avoid cosmetic closure language
- avoid treating “compiled successfully” as equivalent to “production ready”

## Expected outputs after the full sequence

At the end of the sequence, the agent should be able to demonstrate:

- a restored and credible featured recognition surface
- a host-aware composer/footer action zone that survives real SharePoint runtime conditions
- appropriate local/shared/UI-kit alignment
- materially improved accessibility and runtime resilience
- manifest / theme / packaging decisions that are explicit and defensible
- a fresh package and an honest final readiness call

## Recommended acceptance stance

Do not accept the work until the agent explicitly reports closure against the remediation matrix and supplies updated screenshots / evidence for:

- public homepage rendered state
- composer open state
- narrow-width / constrained-width runtime behavior
- package freshness / inclusion proof
