# Prompt 04 — Companion control hardening and host-safe behavior reliability

## Objective

Tighten the companion control experience and make the SharePoint-hosted protections less brittle while preserving the current intent and runtime behavior.

## Files in scope

Primary targets:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- any narrowly scoped local helper files needed to clarify host-safe or control-behavior logic

## Problems to correct

### 1. Companion controls still need stronger consistency
The workspace controls are functionally strong but need tighter visual/behavioral consistency and clearer grouping.

### 2. Host-safe behavior is still brittle
The current hosted-environment protections are useful, but their implementation should be easier to reason about and less ad hoc.

## Required implementation direction

### 1. Tighten companion control rhythm
Improve the consistency and clarity of:
- toolbar controls
- action groups
- inline control spacing
- queue/detail control relationships

### 2. Preserve host-safe intent
Do not remove the SharePoint-hosted assistant overlap protection or related host-awareness.
Instead, make the implementation cleaner and more reliable where possible.

### 3. Clarify host-safe logic
If the hosted safe-zone logic is currently too implicit or brittle, isolate and clarify it in a cleaner local seam.

## Constraints

- Do not redesign the entire workspace.
- Do not remove host-safe protections.
- Do not turn this into Wave 2 runtime-architecture work unless a very narrow supporting change is necessary.

## Guardrails

- Do not re-read files that are already in your current context or memory unless you need fresh verification or additional surrounding context.
- Do not weaken SharePoint-hosted resilience.
- Do not introduce brittle DOM hacks or host-fighting behavior.

## Deliverable

Implement the hardening and report:
- what companion control improvements were made
- how host-safe behavior was clarified or strengthened
- any host limitations that remain and why
