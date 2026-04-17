# Prompt 04 — Implement Shell-Level Breakpoint Orchestration and Fallbacks

## Objective
Give the shell real responsive composition behavior instead of spacing-only breakpoint changes.

## Governing authority
- homepage overlay rules on hierarchy, anti-safety-zone posture, and authoring safety
- public benchmark principles for responsive layout, progressive disclosure, and container-aware thinking

## Exact repo seams to inspect
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- new shell schema / capability files
- any shell-local layout primitives introduced in Wave 01

## Current gap
The shell currently changes only:
- gap
- padding

It does not change hierarchy, grouping, ordering, or demotion behavior by breakpoint.

## Required implementation outcome
Implement shell-owned layout resolution for at least:
- wide
- medium
- narrow

Include:
- band-aware grouping changes
- safe demotion / stacking behavior
- invalid-placement fallback handling
- graceful degraded rendering when a zone fails or cannot fit the chosen slot behavior

Use container-aware strategy where justified, or establish a clear seam for it.

## Proof of closure required
Provide:
- the breakpoint strategy
- examples of layout changes across viewport tiers
- proof that hierarchy is preserved rather than flattened
- proof that failure / invalid config fallback remains polished

## Prohibited
- do not rely only on passive child responsiveness
- do not build an uncontrolled layout editor
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
